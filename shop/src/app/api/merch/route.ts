import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";

/**
 * Merchandising endpoint for the auto-improver service.
 *
 * POST (requires the ERP sync token in `x-sync-token`):
 *   { featuredSlugs?: string[], dealSlug?: string }
 *
 * - featuredSlugs: the improver's curated festival picks. These products get
 *   isFeatured=true; every other product gets isFeatured=false. The improver
 *   owns merchandising twice daily (documented in decisions.md); an ERP sync
 *   that sets isFeatured may override between runs.
 * - dealSlug: validated for existence only — the deal itself is pinned via
 *   src/config/improvement-state.json (the improver writes that file
 *   directly), included here so the run report can echo it.
 *
 * GET (token): current merchandising snapshot.
 */

export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const expected = process.env.ERP_SYNC_TOKEN;
  if (!expected) return false;
  return req.headers.get("x-sync-token") === expected;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const products = await db.shopProduct.findMany({
      select: { slug: true, isFeatured: true, stock: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({
      featured: products.filter((p) => p.isFeatured).map((p) => p.slug),
      total: products.length,
    });
  } catch (err) {
    return dbErrorResponse("merch GET", err);
  }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const featuredSlugs: string[] = Array.isArray(body?.featuredSlugs)
      ? body.featuredSlugs.filter((s: unknown) => typeof s === "string")
      : [];

    if (featuredSlugs.length > 0) {
      // validate all slugs exist first — all-or-nothing update
      const found = await db.shopProduct.findMany({
        where: { slug: { in: featuredSlugs } },
        select: { slug: true },
      });
      const foundSet = new Set(found.map((p) => p.slug));
      const missing = featuredSlugs.filter((s) => !foundSet.has(s));
      if (missing.length > 0) {
        return NextResponse.json(
          { error: "Unknown product slugs", missing },
          { status: 400 },
        );
      }
      await db.shopProduct.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false },
      });
      await db.shopProduct.updateMany({
        where: { slug: { in: featuredSlugs } },
        data: { isFeatured: true },
      });
    }

    let deal: { slug: string; ok: boolean } | null = null;
    if (typeof body?.dealSlug === "string" && body.dealSlug) {
      const p = await db.shopProduct.findUnique({
        where: { slug: body.dealSlug },
        select: { slug: true },
      });
      deal = { slug: body.dealSlug, ok: !!p };
    }

    return NextResponse.json({
      ok: true,
      featuredApplied: featuredSlugs,
      deal,
    });
  } catch (err) {
    return dbErrorResponse("merch GET", err);
  }
}
