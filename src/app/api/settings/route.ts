import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const DEFAULTS: Record<string, string> = {
  storeName: "Shubham Super Shopee",
  storeAddress: "Pune, Maharashtra",
  storePhone: "",
  gstNumber: "",
  taxRate: "0", // percentage, e.g. "18" for 18% GST
  taxEnabled: "false",
  currencySymbol: "₹",
  receiptFooter: "Thank you for shopping with us! Visit again.",
};

// GET — returns all settings (merged with defaults)
export async function GET() {
  const rows = await db.setting.findMany();
  const map: Record<string, string> = { ...DEFAULTS };
  rows.forEach((r) => (map[r.key] = r.value));
  return NextResponse.json(map);
}

// PUT — upsert a setting (key/value in body)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const entries = Array.isArray(body) ? body : [body];
    const results: any[] = [];
    for (const e of entries) {
      if (!e.key) continue;
      const value = String(e.value ?? "");
      const row = await db.setting.upsert({
        where: { key: String(e.key) },
        update: { value },
        create: { key: String(e.key), value },
      });
      results.push(row);
    }
    return NextResponse.json({ success: true, updated: results.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save settings" },
      { status: 400 }
    );
  }
}
