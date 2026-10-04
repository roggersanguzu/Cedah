import "server-only";
import { setServers } from "node:dns";
import { Resolver } from "node:dns/promises";
import { Db, MongoClient, ServerApiVersion } from "mongodb";

declare global {
  var cedahMongoClient: Promise<MongoClient> | undefined;
  var cedahMongoDnsConfigured: boolean | undefined;
}

function configureDns() {
  if (global.cedahMongoDnsConfigured) return;
  const servers = process.env.MONGODB_DNS_SERVERS?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);
  if (servers?.length) {
    try {
      setServers(servers);
    } catch (error) {
      console.warn(
        "CEDAH could not refresh MongoDB DNS resolvers",
        error instanceof Error ? error.message : "unknown error",
      );
    }
  }
  global.cedahMongoDnsConfigured = true;
}

function configuredDnsServers() {
  return process.env.MONGODB_DNS_SERVERS?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);
}

async function resolveSrvUri(uri: string) {
  const servers = configuredDnsServers();
  if (!uri.startsWith("mongodb+srv://") || !servers?.length) return uri;

  const parsed = new URL(uri);
  const resolver = new Resolver();
  resolver.setServers(servers);
  const records = await resolver.resolveSrv(`_mongodb._tcp.${parsed.hostname}`);
  if (!records.length) throw new Error("MongoDB SRV record returned no hosts");

  const query = new URLSearchParams(parsed.search);
  try {
    const txtRecords = await resolver.resolveTxt(parsed.hostname);
    if (txtRecords.length === 1) {
      const txtQuery = new URLSearchParams(txtRecords[0].join(""));
      for (const [key, value] of txtQuery) {
        if (!query.has(key)) query.set(key, value);
      }
    }
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";
    if (!["ENODATA", "ENOTFOUND"].includes(code)) throw error;
  }

  if (!query.has("tls") && !query.has("ssl")) query.set("tls", "true");
  const username = parsed.username
    ? encodeURIComponent(decodeURIComponent(parsed.username))
    : "";
  const password = parsed.password
    ? `:${encodeURIComponent(decodeURIComponent(parsed.password))}`
    : "";
  const authentication = username ? `${username}${password}@` : "";
  const hosts = records
    .map((record) => `${record.name.replace(/\.$/, "")}:${record.port}`)
    .join(",");
  const parameters = query.toString();
  return `mongodb://${authentication}${hosts}${parsed.pathname}${parameters ? `?${parameters}` : ""}`;
}

async function connectClient(uri: string) {
  configureDns();
  const connectionUri = await resolveSrvUri(uri);
  const client = new MongoClient(connectionUri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 12_000,
  });
  await client.connect();
  return client;
}

export async function getDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!global.cedahMongoClient) {
    global.cedahMongoClient = connectClient(uri).catch((error: unknown) => {
      global.cedahMongoClient = undefined;
      const details =
        error && typeof error === "object"
          ? {
              name: "name" in error ? String(error.name) : "MongoDBError",
              code: "code" in error ? String(error.code) : "unknown",
              message:
                "message" in error
                  ? String(error.message).replace(
                      /mongodb(?:\+srv)?:\/\/[^@]+@/g,
                      "mongodb://[redacted]@",
                    )
                  : "Connection failed",
            }
          : {
              name: "MongoDBError",
              code: "unknown",
              message: "Connection failed",
            };
      console.error("CEDAH MongoDB connection failed", details);
      throw error;
    });
  }
  const client = await global.cedahMongoClient;
  return client.db(process.env.MONGODB_DB_NAME || "cedah");
}

export function databaseConfigured() {
  return Boolean(process.env.MONGODB_URI);
}
