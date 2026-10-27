import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Deployment health check.
 * GET /api/health → { ok, env: {...}, db: {...} }
 *
 * Diagnoses the #1 production failure: a fresh deploy without the
 * SHOP_DATABASE_URL / SHOP_DIRECT_URL environment variables (every DB-backed
 * API returns 503/500). Never leaks secret values — only booleans.
 */
export async function GET() {
  const env = {
    SHOP_DATABASE_URL: !!process.env.SHOP_DATABASE_URL,
    SHOP_DIRECT_URL: !!process.env.SHOP_DIRECT_URL,
    ERP_API_URL: !!process.env.ERP_API_URL,
    ERP_SYNC_TOKEN: !!process.env.ERP_SYNC_TOKEN,
    NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME || null,
  };

  const dbState: {
    connected: boolean;
    products: number | null;
    error: string | null;
  } = { connected: false, products: null, error: null };

  try {
    dbState.products = await db.shopProduct.count();
    dbState.connected = true;
  } catch (err: any) {
    dbState.error =
      err?.name === "PrismaClientInitializationError"
        ? err.message
        : (err?.message ?? "unknown error");
  }

  const ok = env.SHOP_DATABASE_URL && dbState.connected;

  return NextResponse.json(
    {
      ok,
      service: "sss-storefront",
      time: new Date().toISOString(),
      env,
      db: dbState,
      ...(ok
        ? {}
        : {
            fix:
              "Set SHOP_DATABASE_URL and SHOP_DIRECT_URL in your hosting platform's environment variables (see .env.example), then redeploy. Schema already exists — no migration needed.",
          }),
    },
    { status: ok ? 200 : 503 },
  );
}
