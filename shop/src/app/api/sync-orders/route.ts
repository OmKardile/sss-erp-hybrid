import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST — push unsynced orders from the storefront to the ERP.
// This can be called:
//   1. Automatically after checkout (from the checkout API)
//   2. Manually from an admin button
// The ERP creates income entries from these orders.
export async function POST() {
  try {
    const erpSyncUrl = process.env.ERP_API_URL
      ? `${process.env.ERP_API_URL}/sync-orders`
      : null;
    const syncToken = process.env.ERP_SYNC_TOKEN;

    if (!erpSyncUrl || !syncToken) {
      return NextResponse.json(
        { error: "ERP_API_URL or ERP_SYNC_TOKEN not configured" },
        { status: 500 }
      );
    }

    // Fetch all orders from the shop DB, including product erpProductId lookup
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            product: { select: { erpProductId: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    if (orders.length === 0) {
      return NextResponse.json({ success: true, pushed: 0, message: "No orders to sync" });
    }

    // Map to ERP format — use the ShopProduct's erpProductId for stock linking
    const erpOrders = orders.map((o) => ({
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      total: o.total,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      itemCount: o.items.length,
      notes: o.notes,
      date: o.createdAt.toISOString(),
      items: o.items.map((item) => ({
        erpProductId: item.product?.erpProductId || null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    }));

    // Push to ERP
    const response = await fetch(erpSyncUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sync-token": syncToken,
      },
      body: JSON.stringify({ orders: erpOrders }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "ERP sync failed", details: result },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      pushed: erpOrders.length,
      created: result.created,
      errors: result.errors,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
