import { setServers } from "node:dns";
import { MongoClient, ServerApiVersion } from "mongodb";

const baseUrl = process.argv[2] || "http://localhost:3001";
const results = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function check(name, test) {
  try {
    await test();
    results.push([name, "passed"]);
  } catch (error) {
    results.push([
      name,
      `failed: ${error instanceof Error ? error.message : "unknown error"}`,
    ]);
  }
}

await check("Public homepage", async () => {
  const response = await fetch(baseUrl);
  const html = await response.text();
  assert(response.ok, `HTTP ${response.status}`);
  assert(
    html.includes("Capital Economic Development Alliance Holdings"),
    "company identity was not rendered",
  );
  assert(
    !html.includes(String.fromCodePoint(0x2014)),
    "an em dash remains in rendered copy",
  );
});

await check("Service health", async () => {
  const response = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
  const data = await response.json();
  assert(response.ok, `HTTP ${response.status}`);
  assert(data.checks?.mongodb === "ok", "MongoDB check is not healthy");
  assert(data.checks?.cloudinary === "ok", "Cloudinary check is not healthy");
});

await check("Protected admin redirect", async () => {
  const response = await fetch(`${baseUrl}/admin`, { redirect: "manual" });
  assert(
    [301, 302, 303, 307, 308].includes(response.status),
    `HTTP ${response.status}`,
  );
  assert(
    response.headers.get("location")?.includes("/admin/login"),
    "admin route did not redirect to login",
  );
});

let sessionCookie = "";
await check("Invalid login rejection", async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "invalid@cedah.invalid",
      password: "invalid",
    }),
  });
  assert(
    response.status === 401,
    `expected HTTP 401, received ${response.status}`,
  );
});

await check("Administrator login", async () => {
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.SUPER_ADMIN_EMAIL,
      password: process.env.SUPER_ADMIN_PASSWORD,
    }),
  });
  sessionCookie = response.headers.get("set-cookie")?.split(";")[0] || "";
  assert(response.ok, `HTTP ${response.status}`);
  assert(
    sessionCookie.startsWith("cedah_admin_session="),
    "session cookie was not issued",
  );
});

await check("Authenticated admin data", async () => {
  const response = await fetch(`${baseUrl}/api/admin/data/projects`, {
    headers: { Cookie: sessionCookie },
  });
  const data = await response.json();
  assert(response.ok, `HTTP ${response.status}`);
  assert(data.configured === true, "database is not configured");
  assert(
    Array.isArray(data.items) && data.items.length > 0,
    "seeded projects were not returned",
  );
});

await check("Contact submission storage", async () => {
  const marker = crypto.randomUUID();
  const email = `smoke-${marker}@cedah.invalid`;
  const response = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "CEDAH release check",
      email,
      interest: "Technical verification",
      message: `Temporary automated check ${marker}`,
      website: "",
    }),
  });
  assert(response.ok, `HTTP ${response.status}`);

  const adminResponse = await fetch(`${baseUrl}/api/admin/submissions`, {
    headers: { Cookie: sessionCookie },
    cache: "no-store",
  });
  const adminData = await adminResponse.json();
  assert(adminResponse.ok, `admin enquiries returned HTTP ${adminResponse.status}`);
  assert(
    adminData.items?.some((item) => item.email === email),
    "stored submission was not returned to the admin dashboard",
  );

  const dnsServers = process.env.MONGODB_DNS_SERVERS?.split(",")
    .map((server) => server.trim())
    .filter(Boolean);
  if (dnsServers?.length) setServers(dnsServers);
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 12_000,
  });
  try {
    await client.connect();
    const collection = client
      .db(process.env.MONGODB_DB_NAME || "cedah")
      .collection("contact_submissions");
    const saved = await collection.findOne({ email });
    assert(
      saved?.message?.includes(marker),
      "submission was not stored in MongoDB",
    );
    await collection.deleteOne({ email });
  } finally {
    await client.close();
  }
});

for (const [name, status] of results) console.log(`${name}: ${status}`);
if (results.some(([, status]) => status.startsWith("failed"))) process.exit(1);
