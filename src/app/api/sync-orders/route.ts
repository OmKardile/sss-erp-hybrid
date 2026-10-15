import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST — receive orders from the e-commerce storefront and create income entries in the ERP.
// Called by the shop's /api/sync-orders after a successful checkout.
// Protected by x-sync-token header.
export async function POST(req: NextRequest) {
  try {
    const syncToken = process.env.ERP_SYNC_TOKEN;
    const headerToken = req.headers.get("x-sync-token");

    if (!syncToken || !headerToken || headerToken !== syncToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const orders = Array.isArray(body?.orders) ? body.orders : [];

    if (orders.length === 0) {
      return NextResponse.json({ success: true, created: 0, message: "No orders to sync" });
    }

    let created = 0;
    const errors: { orderNumber: string; error: string }[] = [];

    for (const order of orders) {
      try {
        // Check if income entry already exists for this order (avoid duplicates)
        const existing = await db.income.findFirst({
          where: {
            source: { contains: order.orderNumber },
          },
        });

        if (existing) {
          continue; // Skip — already synced
        }

        // Create income entry from the order
        await db.income.create({
          data: {
            source: `Online Order ${order.orderNumber}`,
            category: "Sales",
            amount: order.total,
            date: new Date(order.date || new Date()),
            notes: `E-commerce sale · ${order.customerName} · ${order.paymentMethod} · ${order.itemCount} item(s)${order.notes ? ` · ${order.notes}` : ""}`,
          },
        });

        // If the order has items with erpProductId references, decrement stock
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            if (item.erpProductId) {
              const product = await db.product.findUnique({
                where: { id: item.erpProductId },
              });
              if (product && product.quantity >= item.quantity) {
                await db.product.update({
                  where: { id: item.erpProductId },
                  data: { quantity: { decrement: item.quantity } },
                });
              }
            }
          }
        }

        created += 1;
      } catch (err) {
        errors.push({
          orderNumber: order.orderNumber,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      created,
      errors,
      total: orders.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
