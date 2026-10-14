import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface CsvRow {
  name?: string;
  brand?: string;
  category?: string;
  sku?: string;
  purchasePrice?: string;
  sellingPrice?: string;
  quantity?: string;
  unitType?: string;
  minStockAlert?: string;
  expiryDate?: string;
}

// Parses a CSV line handling quoted fields with commas.
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map((s) => s.trim());
}

function mapHeaders(headers: string[]): string[] {
  return headers.map((h) => {
    const lower = h.toLowerCase().trim();
    if (lower.includes("name") && !lower.includes("brand")) return "name";
    if (lower.includes("brand")) return "brand";
    if (lower.includes("categ")) return "category";
    if (lower.includes("sku") || lower.includes("code")) return "sku";
    if (lower.includes("purchase") || lower.includes("buy") || lower.includes("cost")) return "purchasePrice";
    if (lower.includes("sell") || lower.includes("price")) return "sellingPrice";
    if (lower.includes("qty") || lower.includes("quantity") || lower.includes("stock")) return "quantity";
    if (lower.includes("unit")) return "unitType";
    if (lower.includes("min") && lower.includes("stock")) return "minStockAlert";
    if (lower.includes("expir")) return "expiryDate";
    return lower;
  });
}

// POST — bulk import products from CSV text.
// Accepts raw CSV in body: { csv: "name,brand,...\nAashirvaad Atta,..." }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const csv: string = String(body.csv || "");
    if (!csv.trim()) {
      return NextResponse.json({ error: "No CSV data provided" }, { status: 400 });
    }

    const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must have a header row and at least one data row" }, { status: 400 });
    }

    const headers = mapHeaders(parseCsvLine(lines[0]));
    const required = ["name"];
    for (const r of required) {
      if (!headers.includes(r)) {
        return NextResponse.json({ error: `CSV must include a "${r}" column` }, { status: 400 });
      }
    }

    const created: any[] = [];
    const errors: { row: number; error: string }[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = parseCsvLine(lines[i]);
      const row: CsvRow = {};
      headers.forEach((h, idx) => {
        row[h as keyof CsvRow] = cells[idx];
      });

      if (!row.name || !row.name.trim()) {
        errors.push({ row: i + 1, error: "Missing product name" });
        continue;
      }

      try {
        const product = await db.product.create({
          data: {
            name: row.name.trim(),
            brand: row.brand?.trim() || null,
            category: row.category?.trim() || null,
            sku: row.sku?.trim() || null,
            purchasePrice: Number(row.purchasePrice) || 0,
            sellingPrice: Number(row.sellingPrice) || 0,
            quantity: Number(row.quantity) || 0,
            unitType: row.unitType?.trim() || "pcs",
            minStockAlert: Number(row.minStockAlert) || 5,
            expiryDate: row.expiryDate ? new Date(row.expiryDate) : null,
          },
        });
        created.push(product);
      } catch (err) {
        errors.push({ row: i + 1, error: err instanceof Error ? err.message : "Failed to create" });
      }
    }

    return NextResponse.json(
      { success: true, created: created.length, errors, total: lines.length - 1 },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Import failed" },
      { status: 400 }
    );
  }
}
