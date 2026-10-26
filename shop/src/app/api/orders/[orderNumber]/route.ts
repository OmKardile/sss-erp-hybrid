import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import type { OrderView } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapOrder(o: any): OrderView {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerEmail: o.customerEmail ?? null,
    customerAddress: o.customerAddress,
    city: o.city ?? null,
    pincode: o.pincode ?? null,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    total: o.total,
    couponCode: o.couponCode ?? null,
    discountTotal: o.discountTotal ?? 0,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    notes: o.notes ?? null,
    createdAt: formatDate(o.createdAt),
    items: (o.items ?? []).map((it: any) => ({
      id: it.id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      lineTotal: it.lineTotal,
    })),
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  try {
    const { orderNumber } = await params;
    const order = await db.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ order: mapOrder(order) });
  } catch (err: any) {
    console.error("[order GET]", err);
    return NextResponse.json(
      { error: "Failed to load order", detail: err?.message },
      { status: 500 },
    );
  }
}
