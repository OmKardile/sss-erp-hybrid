import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Static exchange rates (relative to INR base). In production, fetch from a live forex API.
const RATES: Record<string, { symbol: string; name: string; rate: number }> = {
  INR: { symbol: "₹", name: "Indian Rupee", rate: 1 },
  USD: { symbol: "$", name: "US Dollar", rate: 0.012 },
  EUR: { symbol: "€", name: "Euro", rate: 0.011 },
  GBP: { symbol: "£", name: "British Pound", rate: 0.0095 },
  AED: { symbol: "AED", name: "UAE Dirham", rate: 0.044 },
  NPR: { symbol: "रू", name: "Nepali Rupee", rate: 1.6 },
};

// GET — list all supported currencies with rates, optionally convert an amount
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || "INR";
  const to = searchParams.get("to") || "INR";
  const amount = Number(searchParams.get("amount")) || 0;

  const result: any = { currencies: RATES, base: "INR" };

  if (amount > 0 && RATES[from] && RATES[to]) {
    // Convert: amount_in_INR = amount / from.rate (if from is not INR), then to target
    const inINR = from === "INR" ? amount : amount / RATES[from].rate;
    const converted = inINR * RATES[to].rate;
    result.conversion = {
      from,
      to,
      amount,
      converted: Math.round(converted * 100) / 100,
      rate: RATES[to].rate / RATES[from].rate,
    };
  }

  return NextResponse.json(result);
}
