import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const amount = Number(body.amount) || 0;
    if (amount <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 });
    }
    const [payment, updatedUdhar] = await db.$transaction(async (tx) => {
      const payment = await tx.udharPayment.create({
        data: {
          udharId: id,
          amount,
          date: body.date ? new Date(body.date) : new Date(),
          notes: body.notes ? String(body.notes).trim() : null,
        },
      });
      const udhar = await tx.udhar.findUniqueOrThrow({ where: { id }, include: { payments: true } });
      const paid = udhar.payments.reduce((s, p) => s + p.amount, 0);
      const remaining = udhar.amount - paid;
      const status = remaining <= 0 ? "PAID" : paid > 0 ? "PARTIAL" : "PENDING";
      const updated = await tx.udhar.update({ where: { id }, data: { status } });
      return [payment, updated] as const;
    });
    return NextResponse.json({ payment, udhar: updatedUdhar }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record payment" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const paymentId = searchParams.get("paymentId");
  if (!paymentId) {
    return NextResponse.json({ error: "paymentId required" }, { status: 400 });
  }
  try {
    await db.$transaction(async (tx) => {
      await tx.udharPayment.delete({ where: { id: paymentId } });
      const udhar = await tx.udhar.findUniqueOrThrow({ where: { id }, include: { payments: true } });
      const paid = udhar.payments.reduce((s, p) => s + p.amount, 0);
      const status = paid <= 0 ? "PENDING" : udhar.amount - paid <= 0 ? "PAID" : "PARTIAL";
      await tx.udhar.update({ where: { id }, data: { status } });
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete payment" },
      { status: 400 }
    );
  }
}
