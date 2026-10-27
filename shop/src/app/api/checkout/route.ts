import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { ensureCartSessionId } from "@/lib/session";
import { generateOrderNumber } from "@/lib/utils";
import { validateCoupon, computeTotals } from "@/lib/coupons";
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

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await ensureCartSessionId();
    const body = await req.json();

    const customerName = (body?.customerName || "").trim();
    const customerPhone = (body?.customerPhone || "").trim();
    const customerAddress = (body?.customerAddress || "").trim();
    const city = (body?.city || "").trim() || null;
    const pincode = (body?.pincode || "").trim() || null;
    const customerEmail = (body?.customerEmail || "").trim() || null;
    const notes = (body?.notes || "").trim() || null;
    const paymentMethod = body?.paymentMethod === "UPI" ? "UPI" : "COD";

    if (!customerName || !customerPhone || !customerAddress) {
      return NextResponse.json(
        { error: "Name, phone and address are required" },
        { status: 400 },
      );
    }
    if (!/^\+?[0-9\s-]{8,15}$/.test(customerPhone)) {
      return NextResponse.json(
        { error: "Please enter a valid phone number" },
        { status: 400 },
      );
    }

    // load cart
    const cartItems = await db.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty" },
        { status: 400 },
      );
    }

    const subtotal = cartItems.reduce(
      (s, ci) => s + ci.product.price * ci.quantity,
      0,
    );

    // Coupon — validated server-side (authoritative). The client shows the
    // same numbers via the shared pure module, but we never trust them.
    const couponCode = (body?.couponCode || "").trim().toUpperCase() || null;
    const couponResult = couponCode
      ? validateCoupon(couponCode, subtotal)
      : null;
    if (couponCode && !couponResult?.ok) {
      return NextResponse.json(
        { error: couponResult?.reason || "Invalid coupon" },
        { status: 400 },
      );
    }
    const totals = computeTotals(
      subtotal,
      couponResult?.ok ? couponResult : null,
    );

    const orderNumber = generateOrderNumber();

    const order = await db.order.create({
      data: {
        orderNumber,
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        city,
        pincode,
        subtotal,
        deliveryFee: totals.deliveryFee,
        total: totals.total,
        couponCode: couponResult?.ok ? couponCode : null,
        discountTotal: totals.discount,
        paymentMethod,
        paymentStatus: paymentMethod === "UPI" ? "PENDING" : "PENDING",
        orderStatus: "NEW",
        notes,
        items: {
          create: cartItems.map((ci) => ({
            productId: ci.productId,
            name: ci.product.name,
            price: ci.product.price,
            quantity: ci.quantity,
            lineTotal: ci.product.price * ci.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // clear cart
    await db.cartItem.deleteMany({ where: { sessionId } });

    return NextResponse.json({ order: mapOrder(order) }, { status: 201 });
  } catch (err) {
    return dbErrorResponse("checkout POST", err);
  }
}
