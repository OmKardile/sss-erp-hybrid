import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureCartSessionId } from "@/lib/session";
import { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD } from "@/lib/config";
import type { CartItemView, CartTotals } from "@/lib/types";

export const dynamic = "force-dynamic";

function computeTotals(items: any[]): CartTotals {
  const mapped: CartItemView[] = items.map((ci) => ({
    id: ci.id,
    productId: ci.productId,
    quantity: ci.quantity,
    product: {
      id: ci.product.id,
      name: ci.product.name,
      slug: ci.product.slug,
      price: ci.product.price,
      compareAtPrice: ci.product.compareAtPrice ?? null,
      brand: ci.product.brand ?? null,
      category: ci.product.category ?? null,
      unitType: ci.product.unitType ?? "pcs",
      stock: ci.product.stock ?? 0,
      image: ci.product.image ?? null,
      isFeatured: !!ci.product.isFeatured,
    },
  }));

  const subtotal = mapped.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0,
  );
  const itemCount = mapped.reduce((s, i) => s + i.quantity, 0);
  const deliveryFee =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  return { items: mapped, subtotal, deliveryFee, total, itemCount };
}

export async function GET() {
  try {
    const { sessionId } = await ensureCartSessionId();
    const items = await db.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    const totals = computeTotals(items);
    return NextResponse.json(totals);
  } catch (err: any) {
    console.error("[cart GET]", err);
    return NextResponse.json(
      { error: "Failed to load cart", detail: err?.message },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await ensureCartSessionId();
    const body = await req.json();
    const productId = body?.productId;
    const quantity = Math.max(1, Number(body?.quantity || 1));

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 },
      );
    }

    const product = await db.shopProduct.findUnique({
      where: { id: productId },
    });
    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "Product not available" },
        { status: 404 },
      );
    }

    // upsert by sessionId + productId
    const existing = await db.cartItem.findUnique({
      where: {
        sessionId_productId: { sessionId, productId },
      },
    });

    let cartItem;
    if (existing) {
      const newQty = Math.min(99, existing.quantity + quantity);
      cartItem = await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      cartItem = await db.cartItem.create({
        data: { sessionId, productId, quantity },
      });
    }

    // recompute totals
    const items = await db.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
    });
    const totals = computeTotals(items);
    return NextResponse.json({ ok: true, item: cartItem, ...totals });
  } catch (err: any) {
    console.error("[cart POST]", err);
    return NextResponse.json(
      { error: "Failed to add to cart", detail: err?.message },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { sessionId } = await ensureCartSessionId();
    const body = await req.json();
    const itemId = body?.itemId;
    const quantity = Math.max(1, Number(body?.quantity || 1));

    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }

    // Make sure the item belongs to this session
    const existing = await db.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!existing || existing.sessionId !== sessionId) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 },
      );
    }

    await db.cartItem.update({
      where: { id: itemId },
      data: { quantity: Math.min(99, quantity) },
    });

    const items = await db.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
    });
    const totals = computeTotals(items);
    return NextResponse.json({ ok: true, ...totals });
  } catch (err: any) {
    console.error("[cart PATCH]", err);
    return NextResponse.json(
      { error: "Failed to update cart", detail: err?.message },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { sessionId } = await ensureCartSessionId();
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 });
    }

    const existing = await db.cartItem.findUnique({
      where: { id: itemId },
    });
    if (!existing || existing.sessionId !== sessionId) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 },
      );
    }

    await db.cartItem.delete({ where: { id: itemId } });

    const items = await db.cartItem.findMany({
      where: { sessionId },
      include: { product: true },
    });
    const totals = computeTotals(items);
    return NextResponse.json({ ok: true, ...totals });
  } catch (err: any) {
    console.error("[cart DELETE]", err);
    return NextResponse.json(
      { error: "Failed to remove item", detail: err?.message },
      { status: 500 },
    );
  }
}
