import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import { databaseConfigured, getDatabase } from "@/lib/mongodb";
export async function GET() {
  const session = verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!databaseConfigured())
    return NextResponse.json({ items: [], configured: false });
  try {
    const database = await getDatabase();
    const items = await database
      .collection("contact_submissions")
      .find({})
      .sort({ created_at: -1 })
      .limit(250)
      .toArray();
    return NextResponse.json({ items, configured: true });
  } catch {
    return NextResponse.json({ items: [] }, { status: 502 });
  }
}
