import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET — list all targets + current month's progress (actual sales)
export async function GET() {
  const targets = await db.target.findMany({ orderBy: { month: "desc" } });
  const now = new Date();
  const currentMonth = now.toISOString().substring(0, 7);

  // Compute actual sales for each target month
  const sales = await db.sale.findMany();
  const monthlyActual = new Map<string, number>();
  sales.forEach((s) => {
    const m = s.date.toISOString().substring(0, 7);
    monthlyActual.set(m, (monthlyActual.get(m) || 0) + s.total);
  });

  const enriched = targets.map((t) => {
    const actual = monthlyActual.get(t.month) || 0;
    const pct = t.amount > 0 ? Math.min(100, (actual / t.amount) * 100) : 0;
    const remaining = Math.max(0, t.amount - actual);
    const daysInMonth = new Date(Number(t.month.substring(0, 4)), Number(t.month.substring(5, 7)), 0).getDate();
    const dayOfMonth = now.getDate();
    const expectedPace = (dayOfMonth / daysInMonth) * 100;
    return { ...t, actual, pct, remaining, expectedPace };
  });

  const current = enriched.find((t) => t.month === currentMonth) || null;
  const currentActual = monthlyActual.get(currentMonth) || 0;

  return NextResponse.json({
    currentMonth,
    current,
    currentActual,
    targets: enriched,
  });
}

// POST — set/update target for a given month
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const month = String(body.month || "").trim();
    const amount = Number(body.amount) || 0;
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "month must be YYYY-MM" }, { status: 400 });
    }
    if (amount <= 0) {
      return NextResponse.json({ error: "amount must be positive" }, { status: 400 });
    }
    const target = await db.target.upsert({
      where: { month },
      update: { amount },
      create: { month, amount },
    });
    return NextResponse.json(target, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to set target" },
      { status: 400 }
    );
  }
}

// DELETE — remove a target
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  if (!month) return NextResponse.json({ error: "month required" }, { status: 400 });
  try {
    await db.target.delete({ where: { month } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete target" },
      { status: 400 }
    );
  }
}
