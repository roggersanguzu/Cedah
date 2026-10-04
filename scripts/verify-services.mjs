import { setServers } from "node:dns";
import { MongoClient, ServerApiVersion } from "mongodb";

const dnsServers = process.env.MONGODB_DNS_SERVERS?.split(",")
  .map((server) => server.trim())
  .filter(Boolean);
if (dnsServers?.length) setServers(dnsServers);

const required = [
  "MONGODB_URI",
  "MONGODB_DB_NAME",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(
    `Missing required environment variables: ${missing.join(", ")}`,
  );
  process.exit(1);
}

async function verifyMongoDB() {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 12_000,
  });
  let connected = false;

  try {
    await client.connect();
    connected = true;
    const database = client.db(process.env.MONGODB_DB_NAME);
    await database.command({ ping: 1 });

    const collection = database.collection("_cedah_service_check");
    const marker = crypto.randomUUID();
    await collection.insertOne({ marker, created_at: new Date() });
    const saved = await collection.findOne({ marker });
    const removed = await collection.deleteOne({ marker });

    if (!saved || removed.deletedCount !== 1) {
      throw new Error(
        "Temporary database record could not be verified and removed",
      );
    }

    if ((await collection.countDocuments({})) === 0) {
      await collection.drop().catch(() => undefined);
    }

    console.log("MongoDB: connected; ping, write, read and cleanup passed");
  } finally {
    if (connected) await client.close();
  }
}

async function verifyCloudinary() {
  const credentials = Buffer.from(
    `${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`,
  ).toString("base64");
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/resources/image?max_results=1`,
    {
      headers: { Authorization: `Basic ${credentials}` },
      signal: AbortSignal.timeout(12_000),
    },
  );

  if (!response.ok) {
    throw new Error(`Cloudinary Admin API returned HTTP ${response.status}`);
  }

  console.log("Cloudinary: authenticated Admin API request passed");
}

const checks = [
  ["MongoDB", verifyMongoDB],
  ["Cloudinary", verifyCloudinary],
];
let failed = false;

for (const [name, verify] of checks) {
  try {
    await verify();
  } catch (error) {
    failed = true;
    console.error(
      `${name}: failed - ${error instanceof Error ? error.message : "unknown error"}`,
    );
  }
}

if (failed) process.exit(1);
