import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const expenses = await db.expense.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const expense = await db.expense.create({
      data: {
        category: String(body.category ?? "General").trim(),
        amount: Number(body.amount) || 0,
        date: body.date ? new Date(body.date) : new Date(),
        notes: body.notes ? String(body.notes).trim() : null,
      },
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create expense" },
      { status: 400 }
    );
  }
}
