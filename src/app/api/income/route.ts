import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const income = await db.income.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(income);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const income = await db.income.create({
      data: {
        source: String(body.source ?? "").trim(),
        category: String(body.category ?? "General").trim(),
        amount: Number(body.amount) || 0,
        date: body.date ? new Date(body.date) : new Date(),
        notes: body.notes ? String(body.notes).trim() : null,
      },
    });
    return NextResponse.json(income, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create income" },
      { status: 400 }
    );
  }
}
