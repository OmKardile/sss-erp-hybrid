import { NextResponse } from "next/server";

// POST — clear auth cookie (logout)
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("sss-erp-auth");
  return res;
}
