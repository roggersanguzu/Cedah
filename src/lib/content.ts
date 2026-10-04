import { databaseConfigured, getDatabase } from "@/lib/mongodb";
import { cache } from "react";
import { DEFAULT_SITE_SETTINGS, RESOURCE_CONFIG, type ResourceName } from "@/lib/platform";
export const getPublishedContent = cache(async () => {
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
});
export const getSiteSettings = cache(async () => {
  const content = await getPublishedContent();
  return { ...DEFAULT_SITE_SETTINGS, ...(content["organisation-settings"] || {}) };
});
export async function getPublicRecords(name: ResourceName, defaults: Record<string, unknown>[] = []) {
  if (!databaseConfigured()) return defaults;
  try {
    const database = await getDatabase();
    const records = await database
      .collection(RESOURCE_CONFIG[name].collection)
      .find(name === "impact-metrics" ? { published: true } : { status: "published" }, { projection: { _id: 0, updated_by: 0 } })
      .sort({ sort_order: 1, published_at: -1, updated_at: -1 })
      .limit(100)
      .toArray();
    // An existing (even empty) collection is managed content. Never restore
    // starter records after an administrator unpublishes or deletes them.
    if (!records.length && defaults.length) {
      const exists = await database.listCollections({ name: RESOURCE_CONFIG[name].collection }, { nameOnly: true }).hasNext();
      if (!exists) return defaults;
    }
    return records;
  } catch {
    // A temporary database failure must not resurrect unpublished starter data.
    return [];
  }
}
