import { setServers } from "node:dns";
import { MongoClient, ServerApiVersion } from "mongodb";
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is missing from .env.local");
const dnsServers = process.env.MONGODB_DNS_SERVERS?.split(",")
  .map((server) => server.trim())
  .filter(Boolean);
if (dnsServers?.length) setServers(dnsServers);
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 12_000,
});
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB_NAME || "cedah");
  await Promise.all([
    db
      .collection("website_content")
      .createIndex({ section_key: 1 }, { unique: true }),
    db.collection("enterprises").createIndex({ slug: 1 }, { unique: true }),
    db.collection("news_posts").createIndex({ slug: 1 }, { unique: true }),
    db.collection("projects").createIndex({ slug: 1 }, { unique: true }),
    db
      .collection("funding_opportunities")
      .createIndex({ slug: 1 }, { unique: true }),
    db.collection("team_partners").createIndex({ slug: 1 }, { unique: true }),
    db
      .collection("impact_metrics")
      .createIndex({ metric_key: 1 }, { unique: true }),
    db
      .collection("media_assets")
      .createIndex({ public_id: 1 }, { unique: true }),
    db.collection("contact_submissions").createIndex({ created_at: -1 }),
    db
      .collection("contact_submissions")
      .createIndex({ status: 1, created_at: -1 }),
  ]);
  console.log(
    `CEDAH MongoDB indexes are ready in database: ${db.databaseName}`,
  );
} finally {
  await client.close();
}
