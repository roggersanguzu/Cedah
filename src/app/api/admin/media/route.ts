import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { databaseConfigured, getDatabase } from "@/lib/mongodb";
import { RESOURCE_CONFIG } from "@/lib/platform";
import { cleanText, readJsonObject, sameOrigin } from "@/lib/request-validation";

async function config() {
  return { session: verifySession((await cookies()).get(SESSION_COOKIE)?.value), cloud: process.env.CLOUDINARY_CLOUD_NAME, key: process.env.CLOUDINARY_API_KEY, secret: process.env.CLOUDINARY_API_SECRET, folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "cedah" };
}
const validPublicId = (value: unknown): value is string => typeof value === "string" && /^[\w-][\w./-]{0,199}$/.test(value);

export async function GET() {
  const { session } = await config();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!databaseConfigured()) return NextResponse.json({ items: [], configured: false });
  try {
    const database = await getDatabase();
    const items = await database.collection("media_assets").find({}).sort({ created_at: -1 }).limit(500).toArray();
    return NextResponse.json({ items, configured: true });
  } catch { return NextResponse.json({ items: [], error: "Unable to load media." }, { status: 502 }); }
}

export async function POST(request: Request) {
  const { session, cloud, key, secret, folder } = await config();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const body = await readJsonObject(request, 16_000);
  if (!body) return NextResponse.json({ error: "Invalid media request." }, { status: 400 });
  if (!databaseConfigured()) return NextResponse.json({ error: "Configure MongoDB before uploading media." }, { status: 503 });
  if (!cloud || !key || !secret) return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 503 });
  if (body.asset !== undefined) {
    if (!body.asset || typeof body.asset !== "object" || Array.isArray(body.asset)) return NextResponse.json({ error: "Invalid media record." }, { status: 400 });
    const asset = body.asset as Record<string, unknown>;
    let url: URL;
    try { url = new URL(typeof asset.secure_url === "string" ? asset.secure_url : ""); } catch { return NextResponse.json({ error: "Invalid media URL." }, { status: 400 }); }
    const type = cleanText(asset.resource_type, 20);
    const format = cleanText(asset.format, 10) || (type === "raw" && String(asset.public_id).endsWith(".pdf") ? "pdf" : "");
    if (!validPublicId(asset.public_id) || url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" || !url.pathname.startsWith(`/${cloud}/`) || !["image", "video", "raw"].includes(type) || !["jpg", "jpeg", "png", "webp", "pdf", "mp4", "webm"].includes(format) || typeof asset.bytes !== "number" || !Number.isFinite(asset.bytes) || asset.bytes <= 0 || asset.bytes > 10 * 1024 * 1024) return NextResponse.json({ error: "Choose an approved image, PDF or video up to 10 MB from this Cloudinary account." }, { status: 400 });
    const record = { public_id: asset.public_id, secure_url: url.toString(), resource_type: type, format, width: typeof asset.width === "number" && Number.isFinite(asset.width) ? Math.max(0, asset.width) : 0, height: typeof asset.height === "number" && Number.isFinite(asset.height) ? Math.max(0, asset.height) : 0, bytes: asset.bytes, original_filename: cleanText(asset.original_filename, 240), uploaded_by: session.email, updated_at: new Date() };
    try {
      const database = await getDatabase();
      await database.collection("media_assets").updateOne({ public_id: record.public_id }, { $set: record, $setOnInsert: { created_at: new Date() } }, { upsert: true });
      return NextResponse.json({ ok: true, item: record });
    } catch { return NextResponse.json({ error: "The file uploaded, but its library record could not be saved." }, { status: 502 }); }
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
  return NextResponse.json({ timestamp, signature, cloudName: cloud, apiKey: key, folder });
}

export async function PATCH(request: Request) {
  const { session } = await config();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const body = await readJsonObject(request, 2048);
  if (!validPublicId(body?.public_id) || typeof body.original_filename !== "string" || !body.original_filename.trim() || body.original_filename.length > 240) return NextResponse.json({ error: "Provide the media ID and a name of up to 240 characters." }, { status: 400 });
  if (!databaseConfigured()) return NextResponse.json({ error: "MongoDB is not configured." }, { status: 503 });
  try {
    const database = await getDatabase();
    const result = await database.collection("media_assets").updateOne({ public_id: body.public_id }, { $set: { original_filename: body.original_filename.trim(), updated_at: new Date(), updated_by: session.email } });
    if (!result.matchedCount) return NextResponse.json({ error: "Media record not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to rename media." }, { status: 502 }); }
}

export async function DELETE(request: Request) {
  const { session, cloud, key, secret } = await config();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const body = await readJsonObject(request, 2048);
  if (!validPublicId(body?.public_id)) return NextResponse.json({ error: "A valid media ID is required." }, { status: 400 });
  if (!databaseConfigured() || !cloud || !key || !secret) return NextResponse.json({ error: "Configure MongoDB and Cloudinary to delete media." }, { status: 503 });
  try {
    const database = await getDatabase();
    const collection = database.collection("media_assets");
    const asset = await collection.findOne({ public_id: body.public_id });
    if (!asset) return NextResponse.json({ error: "Media record not found." }, { status: 404 });
    if (typeof asset.secure_url !== "string" || !asset.secure_url.startsWith(`https://res.cloudinary.com/${cloud}/`)) return NextResponse.json({ error: "This file belongs to a different media account. Restore its Cloudinary configuration before deleting it." }, { status: 409 });
    const references: (string | null)[] = await Promise.all(Object.values(RESOURCE_CONFIG).map(async (resource) => {
      const fields = resource.fields.filter((field) => field.endsWith("_url"));
      if (!fields.length) return null;
      return await database.collection(resource.collection).findOne({ $or: fields.map((field) => ({ [field]: asset.secure_url })) }) ? resource.label : null;
    }));
    const sections = await database.collection("website_content").find({}).toArray();
    if (sections.some((section) => section.content && Object.values(section.content).some((value) => typeof value === "string" && value.includes(asset.secure_url)))) references.push("Website content");
    const inUse = references.filter(Boolean);
    if (inUse.length) return NextResponse.json({ error: `This file is used in ${inUse.join(", ")}. Remove or replace its URL in those records before deleting it.`, references: inUse }, { status: 409 });
    if (!["image", "video", "raw"].includes(asset.resource_type)) return NextResponse.json({ error: "The stored media type is invalid." }, { status: 400 });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHash("sha1").update(`invalidate=true&public_id=${body.public_id}&timestamp=${timestamp}${secret}`).digest("hex");
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/${asset.resource_type}/destroy`, { method: "POST", body: new URLSearchParams({ public_id: body.public_id, invalidate: "true", timestamp: String(timestamp), api_key: key, signature }), signal: AbortSignal.timeout(12000) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !["ok", "not found"].includes(result.result)) return NextResponse.json({ error: "Cloudinary could not delete this file. Its library record has been retained; please try again." }, { status: 502 });
    await collection.deleteOne({ public_id: body.public_id });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to complete media deletion. Please refresh and try again." }, { status: 502 }); }
}
