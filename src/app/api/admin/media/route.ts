import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { databaseConfigured, getDatabase } from "@/lib/mongodb";
async function config() {
  const session = verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  return {
    session,
    cloud: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_API_SECRET,
    folder: process.env.CLOUDINARY_UPLOAD_FOLDER || "cedah",
  };
}
export async function GET() {
  const { session } = await config();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!databaseConfigured())
    return NextResponse.json({ items: [], configured: false });
  try {
    const database = await getDatabase();
    const items = await database
      .collection("media_assets")
      .find({})
      .sort({ created_at: -1 })
      .limit(100)
      .toArray();
    return NextResponse.json({ items, configured: true });
  } catch {
    return NextResponse.json({ items: [] }, { status: 502 });
  }
}
export async function POST(request: Request) {
  const { session, cloud, key, secret, folder } = await config();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (body?.asset) {
    if (!databaseConfigured())
      return NextResponse.json(
        { error: "MongoDB is not configured" },
        { status: 503 },
      );
    const asset = body.asset;
    const record = {
      public_id: String(asset.public_id || ""),
      secure_url: String(asset.secure_url || ""),
      resource_type: String(asset.resource_type || "image"),
      format: String(asset.format || ""),
      width: Number(asset.width || 0),
      height: Number(asset.height || 0),
      bytes: Number(asset.bytes || 0),
      original_filename: String(asset.original_filename || ""),
      uploaded_by: session.email,
      created_at: new Date(),
      updated_at: new Date(),
    };
    if (!record.public_id || !record.secure_url)
      return NextResponse.json(
        { error: "Invalid media record" },
        { status: 400 },
      );
    const database = await getDatabase();
    await database
      .collection("media_assets")
      .updateOne(
        { public_id: record.public_id },
        { $set: record },
        { upsert: true },
      );
    return NextResponse.json({ ok: true, item: record });
  }
  if (!cloud || !key || !secret)
    return NextResponse.json(
      { error: "Cloudinary is not configured" },
      { status: 503 },
    );
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${secret}`)
    .digest("hex");
  return NextResponse.json({
    timestamp,
    signature,
    cloudName: cloud,
    apiKey: key,
    folder,
  });
}
