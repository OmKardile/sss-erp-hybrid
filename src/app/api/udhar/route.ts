import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const where = status && status !== "ALL" ? { status } : {};
  const udhar = await db.udhar.findMany({
    where,
    include: { payments: { orderBy: { date: "desc" } } },
    orderBy: { date: "desc" },
  });
  const enriched = udhar.map((u) => {
    const paidAmount = u.payments.reduce((s, p) => s + p.amount, 0);
    const remainingAmount = Math.max(0, u.amount - paidAmount);
    return { ...u, paidAmount, remainingAmount };
  });
  return NextResponse.json(enriched);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const udhar = await db.udhar.create({
      data: {
        customerName: String(body.customerName ?? "").trim(),
        phone: body.phone ? String(body.phone).trim() : null,
        description: String(body.description ?? "").trim(),
        amount: Number(body.amount) || 0,
        date: body.date ? new Date(body.date) : new Date(),
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        status: "PENDING",
        notes: body.notes ? String(body.notes).trim() : null,
      },
    });
    return NextResponse.json(udhar, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create udhar" },
      { status: 400 }
    );
  }
}
