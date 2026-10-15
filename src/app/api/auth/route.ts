import { NextRequest, NextResponse } from "next/server";

// POST — verify passkey and set auth cookie
export async function POST(req: NextRequest) {
  try {
    const { passkey } = await req.json();
    const expectedPasskey = process.env.ERP_PASSKEY;

    if (!expectedPasskey) {
      return NextResponse.json({ error: "Auth not configured" }, { status: 500 });
    }

    if (passkey !== expectedPasskey) {
      return NextResponse.json({ error: "Invalid passkey" }, { status: 401 });
    }

    // Set httpOnly cookie with encoded passkey value
    const cookieValue = btoa(expectedPasskey);
    const res = NextResponse.json({ success: true });
    res.cookies.set("sss-erp-auth", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Auth failed" }, { status: 400 });
  }
}
