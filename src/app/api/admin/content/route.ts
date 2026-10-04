import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { databaseConfigured, getDatabase } from "@/lib/mongodb";
import { isSafeUrl } from "@/lib/platform";
import { readJsonObject, sameOrigin, validEmail } from "@/lib/request-validation";

async function session() { return verifySession((await cookies()).get(SESSION_COOKIE)?.value); }
const validSection = (value: unknown): value is string => typeof value === "string" && /^[a-z][a-z0-9-]{0,79}$/.test(value);

export async function GET(request: Request) {
  if (!(await session())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const section = new URL(request.url).searchParams.get("section");
  if (!validSection(section)) return NextResponse.json({ error: "Invalid section." }, { status: 400 });
  if (!databaseConfigured()) return NextResponse.json({ content: null, configured: false });
  try {
    const database = await getDatabase();
    const row = await database.collection("website_content").findOne({ section_key: section });
    return NextResponse.json({ content: row?.content || null, published: row?.published || false, configured: true });
  } catch { return NextResponse.json({ content: null, error: "Unable to load content." }, { status: 502 }); }
}

export async function POST(request: Request) {
  const admin = await session();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const body = await readJsonObject(request);
  if (!validSection(body?.section) || !body?.content || typeof body.content !== "object" || Array.isArray(body.content)) return NextResponse.json({ error: "Invalid content section." }, { status: 400 });
  if (body.published !== undefined && typeof body.published !== "boolean") return NextResponse.json({ error: "Published must be true or false." }, { status: 400 });
  const entries = Object.entries(body.content);
  if (entries.length > 100) return NextResponse.json({ error: "Too many content fields." }, { status: 400 });
  const content: Record<string, string> = {};
  for (const [key, value] of entries) {
    if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,79}$/.test(key) || ["__proto__", "constructor", "prototype"].includes(key) || typeof value !== "string" || value.length > 20000) return NextResponse.json({ error: "Content fields must be bounded plain text." }, { status: 400 });
    if ((/url$/i.test(key) || /link$/i.test(key)) && value && !isSafeUrl(value, true)) return NextResponse.json({ error: `${key} must be a valid website or contact link.` }, { status: 400 });
    if (key === "publicEmail" && value && !validEmail(value)) return NextResponse.json({ error: "Provide a valid public email." }, { status: 400 });
    if (["phone", "whatsapp"].includes(key) && value && !/^\+?[0-9 ()-]{7,24}$/.test(value)) return NextResponse.json({ error: "Provide a valid phone number with country code." }, { status: 400 });
    content[key] = value.trim();
  }
  if (!databaseConfigured()) return NextResponse.json({ error: "Configure MongoDB to save content." }, { status: 503 });
  try {
    const database = await getDatabase();
    await database.collection("website_content").updateOne({ section_key: body.section }, {
      $set: { content, published: body.published !== false, updated_by: admin.email, updated_at: new Date() },
      $setOnInsert: { created_at: new Date() },
    }, { upsert: true });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Unable to save content." }, { status: 502 }); }
}
