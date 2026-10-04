import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { databaseConfigured, getDatabase } from "@/lib/mongodb";
const resources = {
  enterprises: {
    collection: "enterprises",
    key: "slug",
    fields: [
      "slug",
      "title",
      "summary",
      "phase",
      "status",
      "readiness",
      "content",
      "image_url",
    ],
  },
  news: {
    collection: "news_posts",
    key: "slug",
    fields: [
      "slug",
      "title",
      "excerpt",
      "body",
      "category",
      "status",
      "image_url",
      "published_at",
    ],
  },
  projects: {
    collection: "projects",
    key: "slug",
    fields: [
      "slug",
      "title",
      "summary",
      "status",
      "stage",
      "category",
      "location",
      "start_date",
      "end_date",
      "image_url",
      "content",
    ],
  },
  opportunities: {
    collection: "funding_opportunities",
    key: "slug",
    fields: [
      "slug",
      "title",
      "summary",
      "status",
      "opportunity_type",
      "target_amount",
      "currency",
      "deadline",
      "document_url",
      "image_url",
    ],
  },
  team: {
    collection: "team_partners",
    key: "slug",
    fields: [
      "slug",
      "title",
      "summary",
      "status",
      "role",
      "organisation",
      "website_url",
      "image_url",
    ],
  },
  "impact-metrics": {
    collection: "impact_metrics",
    key: "metric_key",
    fields: ["metric_key", "label", "value", "unit", "published"],
  },
} as const;
async function access(resource: string) {
  const session = verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  return { session, config: resources[resource as keyof typeof resources] };
}
export async function GET(
  _: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  const { session, config } = await access(resource);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!config)
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  if (!databaseConfigured())
    return NextResponse.json({ items: [], configured: false });
  try {
    const database = await getDatabase();
    const items = await database
      .collection(config.collection)
      .find({})
      .sort({ updated_at: -1 })
      .toArray();
    return NextResponse.json({ items, configured: true });
  } catch {
    return NextResponse.json({ items: [] }, { status: 502 });
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ resource: string }> },
) {
  const { resource } = await params;
  const { session, config } = await access(resource);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!config)
    return NextResponse.json({ error: "Unknown resource" }, { status: 404 });
  if (!databaseConfigured())
    return NextResponse.json(
      { error: "Add MONGODB_URI in .env.local to persist records." },
      { status: 503 },
    );
  const body = await request.json().catch(() => null);
  const records = Array.isArray(body?.records) ? body.records : [body?.record];
  if (!records[0])
    return NextResponse.json({ error: "Invalid record" }, { status: 400 });
  try {
    const database = await getDatabase();
    const collection = database.collection(config.collection);
    for (const record of records) {
      const safe = Object.fromEntries(
        Object.entries(record as Record<string, unknown>).filter(([field]) =>
          (config.fields as readonly string[]).includes(field),
        ),
      );
      const identifier = safe[config.key as keyof typeof safe];
      if (!identifier) continue;
      await collection.updateOne(
        { [config.key]: identifier },
        {
          $set: { ...safe, updated_at: new Date() },
          $setOnInsert: { created_at: new Date() },
        },
        { upsert: true },
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to save records" },
      { status: 502 },
    );
  }
}
