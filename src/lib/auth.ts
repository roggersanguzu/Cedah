import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "cedah_admin_session";
type Session = { email: string; name: string; exp: number };
function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not configured");
  return value;
}
function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}
function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
export function createSession(email: string, name: string) {
  const payload = encode(
    JSON.stringify({ email, name, exp: Date.now() + 8 * 60 * 60 * 1000 }),
  );
  return `${payload}.${sign(payload)}`;
}
export function verifySession(token?: string): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    return null;
  try {
    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    ) as Session;
    return data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}
export function validAdmin(email: string, password: string) {
  const expectedEmail = process.env.SUPER_ADMIN_EMAIL;
  const expectedPassword = process.env.SUPER_ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword || !process.env.AUTH_SECRET)
    return false;
  const emailOk = email.trim().toLowerCase() === expectedEmail.toLowerCase();
  const a = Buffer.from(password);
  const b = Buffer.from(expectedPassword);
  return emailOk && a.length === b.length && timingSafeEqual(a, b);
}
