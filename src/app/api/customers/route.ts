import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const customers = await db.customer.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customer = await db.customer.create({
      data: {
        name: String(body.name ?? "").trim(),
        phone: body.phone ? String(body.phone).trim() : null,
        address: body.address ? String(body.address).trim() : null,
      },
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create customer" },
      { status: 400 }
    );
  }
}
