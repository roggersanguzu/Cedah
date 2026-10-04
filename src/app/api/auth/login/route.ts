import { NextResponse } from "next/server";
import { createSession, SESSION_COOKIE, validAdmin } from "@/lib/auth";
import { clientAddress, rateLimit } from "@/lib/rate-limit";
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  )
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  const limit = await rateLimit(
    "admin-login",
    `${clientAddress(request)}:${body.email.trim().toLowerCase()}`,
    8,
    10 * 60,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many sign-in attempts. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }
  if (!validAdmin(body.email, body.password))
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 },
    );
  const response = NextResponse.json({
    ok: true,
    name: process.env.SUPER_ADMIN_NAME || "Tonny Onen",
  });
  response.cookies.set(
    SESSION_COOKIE,
    createSession(body.email, process.env.SUPER_ADMIN_NAME || "Tonny Onen"),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 8 * 60 * 60,
    },
  );
  return response;
}
