import { NextResponse } from "next/server";
import { databaseConfigured } from "@/lib/mongodb";
import { clientAddress, rateLimit } from "@/lib/rate-limit";
import { cleanText, readJsonObject, validEmail } from "@/lib/request-validation";
import { storeSubmission } from "@/lib/submissions";

export async function POST(request: Request) {
  const body = await readJsonObject(request, 16_000);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const data = { kind: "contact", name: cleanText(body.name, 120), email: cleanText(body.email, 180).toLowerCase(), phone: cleanText(body.phone, 60), interest: cleanText(body.interest, 120), message: cleanText(body.message, 4000) };
  if (cleanText(body.website) || !data.name || !validEmail(data.email) || !data.message) return NextResponse.json({ error: "Please provide your name, a valid email and your message." }, { status: 400 });
  const limit = await rateLimit("public-intake", clientAddress(request), 10, 10 * 60);
  if (!limit.allowed) return NextResponse.json({ error: "Too many messages. Please wait a few minutes and try again." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  if (!databaseConfigured()) return NextResponse.json({ error: "Enquiry storage is not configured. Please use the public email or WhatsApp contact." }, { status: 503 });
  try {
    const receipt = await storeSubmission(data);
    return NextResponse.json({ ok: true, ...receipt });
  } catch { return NextResponse.json({ error: "We could not store your enquiry. Please try again." }, { status: 502 }); }
}
