import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Returns products grouped by expiry urgency: expired, expiring soon (<=7d), upcoming (<=30d).
export async function GET() {
  const products = await db.product.findMany({
    where: { expiryDate: { not: null } },
    orderBy: { expiryDate: "asc" },
  });

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const enriched = products.map((p) => {
    const exp = new Date(p.expiryDate!);
    const diffMs = exp.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    let status: "expired" | "critical" | "soon" | "ok";
    if (daysLeft < 0) status = "expired";
    else if (daysLeft <= 7) status = "critical";
    else if (daysLeft <= 30) status = "soon";
    else status = "ok";
    return { ...p, daysLeft, status };
  });

  const expired = enriched.filter((p) => p.status === "expired");
  const critical = enriched.filter((p) => p.status === "critical");
  const soon = enriched.filter((p) => p.status === "soon");
  const ok = enriched.filter((p) => p.status === "ok");

  return NextResponse.json({
    items: enriched,
    summary: {
      total: products.length,
      expiredCount: expired.length,
      criticalCount: critical.length,
      soonCount: soon.length,
      okCount: ok.length,
    },
  });
}
