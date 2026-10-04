import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { databaseConfigured, getDatabase } from "@/lib/mongodb";
import { SUBMISSION_STATUSES } from "@/lib/platform";
import { readJsonObject, sameOrigin } from "@/lib/request-validation";

async function session() { return verifySession((await cookies()).get(SESSION_COOKIE)?.value); }

export async function GET(request: Request) {
  if (!(await session())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!databaseConfigured()) return NextResponse.json({ items: [], configured: false });
  try {
    const database = await getDatabase();
    const collection = database.collection("contact_submissions");
    const offset = Math.max(0, Math.min(100_000, Number(new URL(request.url).searchParams.get("offset")) || 0));
    const [rows, total] = await Promise.all([
      collection.find({}, { projection: { unsubscribe_token_hash: 0 } }).sort({ created_at: -1, _id: -1 }).skip(Math.floor(offset)).limit(500).toArray(),
      collection.countDocuments({}),
    ]);
    const items = rows.map((row) => ({ ...row, id: row._id.toString() }));
    return NextResponse.json({ items, total, configured: true });
  } catch { return NextResponse.json({ items: [], error: "Unable to load submissions." }, { status: 502 }); }
}

export async function PATCH(request: Request) {
  const admin = await session();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const body = await readJsonObject(request, 16_000);
  if (typeof body?.id !== "string" || !/^[a-f\d]{24}$/i.test(body.id) || (body.status !== undefined && (typeof body.status !== "string" || !(SUBMISSION_STATUSES as readonly string[]).includes(body.status))) || (body.notes !== undefined && (typeof body.notes !== "string" || body.notes.length > 10000)) || (body.status === undefined && body.notes === undefined)) return NextResponse.json({ error: "Provide a valid submission ID, status and/or notes." }, { status: 400 });
  if (!databaseConfigured()) return NextResponse.json({ error: "Configure MongoDB to manage submissions." }, { status: 503 });
  try {
    const database = await getDatabase();
    const collection = database.collection("contact_submissions");
    const item = await collection.findOne({ _id: new ObjectId(body.id) });
    if (!item) return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    if (body.status === "unsubscribed" && item.kind !== "newsletter") return NextResponse.json({ error: "Unsubscribed applies only to newsletter registrations." }, { status: 400 });
    if (item.status === "unsubscribed" && body.status && body.status !== "unsubscribed") return NextResponse.json({ error: "An unsubscribed person must provide fresh consent before resubscribing." }, { status: 400 });
    await collection.updateOne({ _id: item._id }, { $set: { ...(body.status !== undefined ? { status: body.status } : {}), ...(body.notes !== undefined ? { notes: body.notes.trim() } : {}), ...(body.status === "unsubscribed" ? { consent: false, unsubscribed_at: new Date() } : {}), updated_at: new Date(), updated_by: admin.email } });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to update submission." }, { status: 502 }); }
}
