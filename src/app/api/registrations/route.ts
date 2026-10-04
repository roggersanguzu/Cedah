import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { databaseConfigured, getDatabase } from "@/lib/mongodb";
import { REGISTRATION_KINDS } from "@/lib/platform";
import { cleanText, readJsonObject, validEmail } from "@/lib/request-validation";
import { clientAddress, rateLimit } from "@/lib/rate-limit";
import { storeSubmission } from "@/lib/submissions";

const labels: Record<string, string> = { farmer: "Farmer / producer registration", training: "Training & employment application", newsletter: "Newsletter subscription", buyer: "Product / buyer enquiry" };
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function POST(request: Request) {
  const body = await readJsonObject(request, 16_000);
  if (!body || typeof body.kind !== "string" || !(REGISTRATION_KINDS as readonly string[]).includes(body.kind)) return NextResponse.json({ error: "Choose a valid registration type." }, { status: 400 });
  if (cleanText(body.website)) return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  if (body.language !== undefined && (typeof body.language !== "string" || !["en", "lg", "sw"].includes(body.language))) return NextResponse.json({ error: "Choose a supported language." }, { status: 400 });
  const data = {
    kind: body.kind, language: typeof body.language === "string" ? body.language : "en", name: cleanText(body.name, 120), email: cleanText(body.email, 180).toLowerCase(), phone: cleanText(body.phone, 60),
    location: cleanText(body.location, 180), crop: cleanText(body.crop, 180), quantity: cleanText(body.quantity, 180), interests: cleanText(body.interests, 500),
    message: cleanText(body.message, 4000), interest: labels[body.kind], consent: body.consent === true, consent_at: new Date(),
  };
  if (!data.consent) return NextResponse.json({ error: "Please consent to CEDAH using your details for this request." }, { status: 400 });
  if (data.email && !validEmail(data.email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (data.phone && !/^\+?[\d ()-]{7,24}$/.test(data.phone)) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
  if (data.kind === "newsletter" ? !data.email : !data.name || (!data.email && !data.phone)) return NextResponse.json({ error: data.kind === "newsletter" ? "An email address is required." : "Provide your name and at least an email address or phone number." }, { status: 400 });
  if (data.kind === "farmer" && (!data.location || !data.crop)) return NextResponse.json({ error: "Provide your district/location and the crops you supply." }, { status: 400 });
  if (data.kind === "training" && !data.interests) return NextResponse.json({ error: "Tell us which training or employment pathway interests you." }, { status: 400 });
  if (data.kind === "buyer" && !data.interests && !data.message) return NextResponse.json({ error: "Tell us which products interest you." }, { status: 400 });
  const limit = await rateLimit("public-intake", clientAddress(request), 10, 10 * 60);
  if (!limit.allowed) return NextResponse.json({ error: "Too many requests. Please wait a few minutes." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  if (!databaseConfigured()) return NextResponse.json({ error: "Registration storage is unavailable. Please contact CEDAH by email or WhatsApp." }, { status: 503 });
  const token = data.kind === "newsletter" ? randomBytes(32).toString("hex") : "";
  try {
    const receipt = await storeSubmission({ ...data, ...(token ? { unsubscribe_token_hash: tokenHash(token) } : {}) });
    return NextResponse.json({ ok: true, ...receipt, ...(token ? { unsubscribe_url: `/unsubscribe?token=${token}` } : {}) });
  } catch { return NextResponse.json({ error: "We could not save your request. Please try again." }, { status: 502 }); }
}

export async function DELETE(request: Request) {
  const body = await readJsonObject(request, 2048);
  if (typeof body?.token !== "string" || !/^[a-f0-9]{64}$/.test(body.token)) return NextResponse.json({ error: "Invalid unsubscribe link." }, { status: 400 });
  if (!databaseConfigured()) return NextResponse.json({ error: "Subscription storage is unavailable. Please try again later." }, { status: 503 });
  try {
    const database = await getDatabase();
    const collection = database.collection("contact_submissions");
    const subscription = await collection.findOne({ kind: "newsletter", unsubscribe_token_hash: tokenHash(body.token) });
    if (!subscription) return NextResponse.json({ error: "This unsubscribe link was not found. Please contact CEDAH for help." }, { status: 404 });
    await collection.updateMany({ kind: "newsletter", email: subscription.email }, { $set: { status: "unsubscribed", consent: false, unsubscribed_at: new Date(), updated_at: new Date() } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to unsubscribe right now. Please try again." }, { status: 502 }); }
}
