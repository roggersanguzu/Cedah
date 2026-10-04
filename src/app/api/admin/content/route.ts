import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { databaseConfigured, getDatabase } from "@/lib/mongodb";
async function session() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}
export async function GET(request: Request) {
  if (!(await session()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!databaseConfigured())
    return NextResponse.json({ content: null, configured: false });
  const section = new URL(request.url).searchParams.get("section") || "";
  try {
    const database = await getDatabase();
    const row = await database
      .collection("website_content")
      .findOne({ section_key: section });
    return NextResponse.json({
      content: row?.content || null,
      published: row?.published || false,
      configured: true,
    });
  } catch {
    return NextResponse.json({ content: null }, { status: 502 });
  }
}
export async function POST(request: Request) {
  const admin = await session();
  if (!admin)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!databaseConfigured())
    return NextResponse.json(
      { error: "Add MONGODB_URI in .env.local to persist content." },
      { status: 503 },
    );
  const body = await request.json().catch(() => null);
  if (!body?.section || !body?.content)
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  try {
    const database = await getDatabase();
    await database
      .collection("website_content")
      .updateOne(
        { section_key: String(body.section).slice(0, 80) },
        {
          $set: {
            content: body.content,
            published: body.published !== false,
            updated_by: admin.email,
            updated_at: new Date(),
          },
          $setOnInsert: { created_at: new Date() },
        },
        { upsert: true },
      );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to save content" },
      { status: 502 },
    );
  }
}
