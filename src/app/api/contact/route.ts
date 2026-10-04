import { NextResponse } from "next/server";
import { databaseConfigured, getDatabase } from "@/lib/mongodb";
import { clientAddress, rateLimit } from "@/lib/rate-limit";
const clean = (value: unknown, max = 1000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const data = {
    name: clean(body.name, 120),
    email: clean(body.email, 180),
    phone: clean(body.phone, 60),
    interest: clean(body.interest, 120),
    message: clean(body.message, 2000),
    status: "new",
    created_at: new Date(),
    updated_at: new Date(),
  };
  if (
    clean(body.website) ||
    !data.name ||
    !data.email.includes("@") ||
    !data.message
  )
    return NextResponse.json(
      { error: "Please complete all required fields" },
      { status: 400 },
    );
  const limit = await rateLimit(
    "contact",
    `${clientAddress(request)}:${data.email.toLowerCase()}`,
    5,
    10 * 60,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many messages. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }
  if (!databaseConfigured()) {
    return NextResponse.json(
      { error: "Enquiry storage is not configured" },
      { status: 503 },
    );
  }
  try {
    const database = await getDatabase();
    await database.collection("contact_submissions").insertOne(data);
  } catch {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 502 });
  }
  if (process.env.RESEND_API_KEY) {
    try {
      const notification = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "CEDAH Website <website@cedah.com>",
          to: [process.env.CONTACT_NOTIFICATION_EMAIL || "tonen@cedah.com"],
          subject: `New CEDAH enquiry: ${data.interest}`,
          text: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone}\nInterest: ${data.interest}\n\n${data.message}`,
        }),
      });
      if (!notification.ok) {
        console.error(
          `Contact notification returned HTTP ${notification.status}`,
        );
      }
    } catch {
      // The stored enquiry remains successful even if email delivery is delayed.
      console.error("Contact notification could not be delivered");
    }
  }
  return NextResponse.json({ ok: true });
}
