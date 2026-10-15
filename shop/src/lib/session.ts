import { cookies } from "next/headers";
import { getCartSessionId as makeId } from "@/lib/utils";

export const CART_COOKIE = "cart_session";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** Read or create a cart session id from the request cookies. */
export async function ensureCartSessionId(): Promise<{
  sessionId: string;
  isNew: boolean;
}> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_COOKIE)?.value;
  if (existing && existing.length > 5) {
    return { sessionId: existing, isNew: false };
  }
  const sessionId = makeId();
  cookieStore.set(CART_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: CART_COOKIE_MAX_AGE,
  });
  return { sessionId, isNew: true };
}

/** Read-only version — does not set a cookie. */
export async function getCartSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value ?? null;
}
