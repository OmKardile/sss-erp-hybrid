import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const supplier = await db.supplier.update({
      where: { id },
      data: {
        name: String(body.name ?? "").trim(),
        phone: body.phone ? String(body.phone).trim() : null,
        address: body.address ? String(body.address).trim() : null,
      },
    });
    return NextResponse.json(supplier);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update supplier" },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.supplier.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete supplier" },
      { status: 400 }
    );
  }
}
