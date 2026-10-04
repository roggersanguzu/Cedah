import { databaseConfigured, getDatabase } from "@/lib/mongodb";
export async function getPublishedContent() {
  if (!databaseConfigured())
    return {} as Record<string, Record<string, string>>;
  try {
    const database = await getDatabase();
    const rows = await database
      .collection("website_content")
      .find(
        { published: true },
        { projection: { _id: 0, section_key: 1, content: 1 } },
      )
      .toArray();
    return Object.fromEntries(
      rows.map((row) => [
        row.section_key,
        row.content as Record<string, string>,
      ]),
    );
  } catch {
    return {};
  }
}
const publicCollections = {
  news: "news_posts",
  projects: "projects",
  opportunities: "funding_opportunities",
  team: "team_partners",
  enterprises: "enterprises",
} as const;
export async function getPublicRecords(name: keyof typeof publicCollections) {
  if (!databaseConfigured()) return [] as Record<string, unknown>[];
  try {
    const database = await getDatabase();
    return await database
      .collection(publicCollections[name])
      .find({ status: "published" }, { projection: { _id: 0 } })
      .sort({ published_at: -1, updated_at: -1 })
      .limit(24)
      .toArray();
  } catch {
    return [];
  }
}
