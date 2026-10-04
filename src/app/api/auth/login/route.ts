import { NextResponse } from "next/server";
import { createSession, SESSION_COOKIE, validAdmin } from "@/lib/auth";
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    !validAdmin(body.email, body.password)
  )
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
