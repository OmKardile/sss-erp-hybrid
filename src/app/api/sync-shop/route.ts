import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST — sync all ERP products to the e-commerce storefront
export async function POST() {
  try {
    const shopSyncUrl = process.env.SHOP_SYNC_URL;
    const syncToken = process.env.ERP_SYNC_TOKEN;

    if (!shopSyncUrl || !syncToken) {
      return NextResponse.json(
        { error: "SHOP_SYNC_URL or ERP_SYNC_TOKEN not configured" },
        { status: 500 }
      );
    }

    // Fetch all products from ERP
    const products = await db.product.findMany({
      where: { quantity: { gt: 0 } }, // only sync in-stock products
      select: {
        id: true,
        name: true,
        brand: true,
        category: true,
        sellingPrice: true,
        purchasePrice: true,
        unitType: true,
        quantity: true,
      },
    });

    // Map to shop format
    const shopProducts = products.map((p) => ({
      erpProductId: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.sellingPrice,
      compareAtPrice: p.sellingPrice > p.purchasePrice ? Math.round(p.sellingPrice * 1.1 * 100) / 100 : null,
      unitType: p.unitType,
      stock: Math.floor(p.quantity),
      isFeatured: false,
      isActive: true,
    }));

    // Push to shop
    const response = await fetch(shopSyncUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sync-token": syncToken,
      },
      body: JSON.stringify({ products: shopProducts }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Shop sync failed", details: result },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      synced: shopProducts.length,
      result,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
