import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { databaseConfigured, getDatabase } from "@/lib/mongodb";
import { DEFAULT_RESOURCE_RECORDS, isResourceName, RESOURCE_CONFIG, validateRecord, type ResourceName } from "@/lib/platform";
import type { Db } from "mongodb";
import { readJsonObject, sameOrigin } from "@/lib/request-validation";

type Context = { params: Promise<{ resource: string }> };
async function access(resource: string) {
  const session = verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  return { session, config: isResourceName(resource) ? RESOURCE_CONFIG[resource] : null };
}

async function initialiseDefaults(database: Db, resource: ResourceName) {
  const records = DEFAULT_RESOURCE_RECORDS[resource];
  if (!records?.length) return;
  const config = RESOURCE_CONFIG[resource];
  if (await database.listCollections({ name: config.collection }, { nameOnly: true }).hasNext()) return;
  await database.collection(config.collection).bulkWrite(records.map((record) => ({ updateOne: {
    filter: { [config.key]: record[config.key] },
    update: { $setOnInsert: { ...record, created_at: new Date(), updated_at: new Date() } },
    upsert: true,
  } })));
}

export async function GET(request: Request, { params }: Context) {
  const { resource } = await params;
  const { session, config } = await access(resource);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!config) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  if (!databaseConfigured()) return NextResponse.json({ items: isResourceName(resource) ? DEFAULT_RESOURCE_RECORDS[resource] || [] : [], configured: false });
  try {
    const database = await getDatabase();
    const skip = Math.max(0, Math.min(100_000, Number(new URL(request.url).searchParams.get("offset")) || 0));
    const collection = database.collection(config.collection);
    const [items, total] = await Promise.all([
      collection.find({}).sort({ sort_order: 1, updated_at: -1, _id: 1 }).skip(Math.floor(skip)).limit(500).toArray(),
      collection.countDocuments({}),
    ]);
    if (!total && isResourceName(resource) && DEFAULT_RESOURCE_RECORDS[resource]?.length && !(await database.listCollections({ name: config.collection }, { nameOnly: true }).hasNext())) {
      const defaults = DEFAULT_RESOURCE_RECORDS[resource]!;
      return NextResponse.json({ items: defaults, total: defaults.length, configured: true, starter: true });
    }
    return NextResponse.json({ items, total, configured: true });
  } catch { return NextResponse.json({ items: [], error: "Unable to load records." }, { status: 502 }); }
}

export async function POST(request: Request, { params }: Context) {
  const { resource } = await params;
  const { session, config } = await access(resource);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!config || !isResourceName(resource)) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const body = await readJsonObject(request);
  const records = Array.isArray(body?.records) ? body.records : [body?.record];
  if (!records.length || records.length > 50) return NextResponse.json({ error: "Provide between 1 and 50 records." }, { status: 400 });
  const validated = records.map((record: unknown) => validateRecord(resource, record));
  const invalid = validated.find((result) => result.error);
  if (invalid) return NextResponse.json({ error: invalid.error }, { status: 400 });
  if (!databaseConfigured()) return NextResponse.json({ error: "Configure MongoDB to save records." }, { status: 503 });
  try {
    const database = await getDatabase();
    await initialiseDefaults(database, resource);
    const now = new Date();
    await database.collection(config.collection).bulkWrite(validated.map(({ record }) => ({
      updateOne: {
        filter: { [config.key]: record![config.key] },
        update: { $set: { ...record, updated_at: now, updated_by: session.email }, $setOnInsert: { created_at: now } },
        upsert: true,
      },
    })));
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to save records." }, { status: 502 }); }
}

export async function DELETE(request: Request, { params }: Context) {
  const { resource } = await params;
  const { session, config } = await access(resource);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!config || !isResourceName(resource)) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const body = await readJsonObject(request, 2048);
  if (typeof body?.key !== "string" || !/^[a-z0-9][a-z0-9-]{0,99}$/.test(body.key)) return NextResponse.json({ error: "A valid record key is required." }, { status: 400 });
  if (!databaseConfigured()) return NextResponse.json({ error: "Configure MongoDB to delete records." }, { status: 503 });
  try {
    const database = await getDatabase();
    await initialiseDefaults(database, resource);
    const result = await database.collection(config.collection).deleteOne({ [config.key]: body.key });
    if (!result.deletedCount) return NextResponse.json({ error: "Record not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to delete record." }, { status: 502 }); }
}
