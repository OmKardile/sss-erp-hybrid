import { NextResponse } from "next/server";

/**
 * Classify database/API failures so a misconfigured production deployment
 * returns an actionable 503 instead of an opaque 500 wall.
 *
 * Common production causes (fresh Vercel/Netlify/Render import without env vars):
 *  - PrismaClientInitializationError: "Environment variable not found: SHOP_DATABASE_URL"
 *  - PrismaClientInitializationError: couldn't reach the database host
 */
function classifyDbError(err: unknown): {
  status: number;
  code: string;
  message: string;
  hint?: string;
} {
  const e = err as { name?: string; message?: string; error_code?: string };
  const msg = e?.message || "";
  const name = e?.name || "";

  if (
    name === "PrismaClientInitializationError" ||
    /Environment variable not found/i.test(msg)
  ) {
    if (/SHOP_DATABASE_URL/i.test(msg)) {
      return {
        status: 503,
        code: "DB_ENV_MISSING",
        message:
          "Database is not configured: SHOP_DATABASE_URL is missing on this deployment.",
        hint: "Add SHOP_DATABASE_URL (and SHOP_DIRECT_URL) to your hosting platform's Environment Variables, then redeploy.",
      };
    }
    return {
      status: 503,
      code: "DB_UNREACHABLE",
      message: "Could not connect to the database.",
      hint: "Check SHOP_DATABASE_URL / SHOP_DIRECT_URL values, and that the database (Supabase) is reachable from this deployment.",
    };
  }

  if (/P2021|table .* does not exist/i.test(msg)) {
    return {
      status: 503,
      code: "DB_SCHEMA_MISSING",
      message: "Database is reachable but the shop tables are missing.",
      hint: "Run `bun run db:push` (or prisma db push) against the configured database, then hit /api/seed once.",
    };
  }

  return {
    status: 500,
    code: "INTERNAL",
    message: msg || "Unexpected server error",
  };
}

/** Uniform error response for API routes; logs server-side, returns safe JSON. */
export function dbErrorResponse(context: string, err: unknown) {
  const { status, code, message, hint } = classifyDbError(err);
  console.error(`[${context}]`, err);
  return NextResponse.json(
    { error: message, code, ...(hint ? { hint } : {}) },
    { status },
  );
}
