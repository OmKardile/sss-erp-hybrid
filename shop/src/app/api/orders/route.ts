import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
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
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    orderStatus: o.orderStatus,
    notes: o.notes ?? null,
    createdAt: o.createdAt,
    items: (o.items ?? []).map((it: any) => ({
      id: it.id,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      lineTotal: it.lineTotal,
    })),
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Number(searchParams.get("limit") || 50));
    const status = searchParams.get("status");

    const where: any = {};
    if (status) where.orderStatus = status;

    const orders = await db.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      orders: orders.map(mapOrder),
      count: orders.length,
    });
  } catch (err) {
    return dbErrorResponse("orders GET", err);
  }
}
