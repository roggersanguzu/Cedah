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

const seeds = {
  website_content: [
    {
      section_key: "hero-section",
      content: {
        eyebrow: "Uganda's integrated agribusiness",
        title: "From fertile ground to lasting value.",
        description:
          "We build connected crop and beef enterprises that create quality food, dependable markets, skilled jobs and shared prosperity.",
        buttonLabel: "Explore our enterprises",
        buttonLink: "#enterprises",
      },
      published: true,
    },
    {
      section_key: "about-cedah",
      content: {
        title: "Enterprise with a greater purpose.",
        description:
          "Capital Economic Development Alliance Holdings Ltd. is a Ugandan enterprise connecting agriculture, processing, skills and market access.",
      },
      published: true,
    },
  ],
  enterprises: [
    {
      slug: "crop-enterprise",
      title: "Crop enterprise",
      summary:
        "Maize-led crop production, aggregation and a disciplined path into processing and value addition.",
      phase: "Launch enterprise",
      status: "published",
      readiness: 68,
    },
    {
      slug: "beef-enterprise",
      title: "Beef enterprise",
      summary:
        "Responsible livestock systems built around animal health, traceability, quality and dependable markets.",
      phase: "Launch enterprise",
      status: "published",
      readiness: 52,
    },
  ],
  news_posts: [
    {
      slug: "crop-and-beef-launch-value-chains",
      title: "CEDAH begins with crop and beef value chains",
      excerpt:
        "The opening phase connects maize-led crop production and responsible livestock systems to future processing and market access.",
      category: "Enterprise",
      status: "published",
      published_at: new Date("2026-08-31T08:00:00.000Z"),
    },
    {
      slug: "producer-and-buyer-network",
      title: "Building a dependable producer and buyer network",
      excerpt:
        "Early engagement focuses on reliable supply, quality requirements, off-take relationships and measurable shared value.",
      category: "Partnerships",
      status: "published",
      published_at: new Date("2026-07-22T08:00:00.000Z"),
    },
  ],
  projects: [
    {
      slug: "crop-production-launch-planning",
      title: "Crop production launch planning",
      summary:
        "Farm planning, input strategy, production systems and responsible routes to market for maize and selected crops.",
      status: "published",
      stage: "In preparation",
      category: "Crop enterprise",
      start_date: "2026-09-01",
    },
    {
      slug: "beef-systems-and-supplier-mapping",
      title: "Beef systems and supplier mapping",
      summary:
        "Developing livestock health, traceability, production and market-readiness frameworks.",
      status: "published",
      stage: "In preparation",
      category: "Beef enterprise",
      start_date: "2026-09-01",
    },
    {
      slug: "founding-partner-engagement",
      title: "Founding partner engagement",
      summary:
        "Building relationships across patient capital, technical expertise, supply and off-take.",
      status: "published",
      stage: "Open",
      category: "Partnerships",
      start_date: "2026-08-01",
    },
  ],
  funding_opportunities: [
    {
      slug: "cedah-founding-partner-brief",
      title: "CEDAH founding partner brief",
      summary:
        "A phased partnership opportunity supporting productive assets, operating readiness and measurable local value creation.",
      status: "published",
      opportunity_type: "Investment and technical partnership",
      currency: "USD",
    },
  ],
  team_partners: [
    {
      slug: "executive-leadership",
      title: "Executive leadership",
      summary:
        "Strategic leadership for CEDAH's enterprise, governance and partnership development.",
      status: "draft",
      role: "Leadership",
      organisation: "CEDAH",
    },
  ],
};

const keys = {
  website_content: "section_key",
  enterprises: "slug",
  news_posts: "slug",
  projects: "slug",
  funding_opportunities: "slug",
  team_partners: "slug",
};

try {
  await client.connect();
  const database = client.db(process.env.MONGODB_DB_NAME || "cedah");
  let inserted = 0;

  for (const [collectionName, records] of Object.entries(seeds)) {
    const collection = database.collection(collectionName);
    const key = keys[collectionName];
    for (const record of records) {
      const result = await collection.updateOne(
        { [key]: record[key] },
        {
          $setOnInsert: { ...record, created_at: new Date() },
          $set: { updated_at: new Date() },
        },
        { upsert: true },
      );
      inserted += result.upsertedCount;
    }
  }

  console.log(`CEDAH starter content ready; ${inserted} new records inserted`);
} finally {
  await client.close();
}
