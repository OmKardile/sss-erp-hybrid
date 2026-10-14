import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const suppliers = await db.supplier.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(suppliers);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supplier = await db.supplier.create({
      data: {
        name: String(body.name ?? "").trim(),
        phone: body.phone ? String(body.phone).trim() : null,
        address: body.address ? String(body.address).trim() : null,
      },
    });
    return NextResponse.json(supplier, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create supplier" },
      { status: 400 }
    );
  }
}
