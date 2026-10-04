import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { ObjectId } from "mongodb";

// All application imports are executed with local service mocks. This suite does
// not load .env files, connect to MongoDB, or send email/network requests.
const project = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const nativeRequire = createRequire(import.meta.url);
const same = (a, b) => String(a) === String(b);
const matches = (row, filter) => Object.entries(filter).every(([key, value]) => key === "$or" ? value.some((part) => matches(row, part)) : same(row[key], value));

function harness(options = {}) {
  const collections = new Map();
  const state = { authenticated: true, configured: true, failStorage: false, allowed: true, writes: 0, requests: 0, ...options };
  const rowsFor = (name) => collections.get(name) || [];
  const mutate = (name) => {
    if (state.failStorage) throw new Error("Storage offline");
    state.writes += 1;
    if (!collections.has(name)) collections.set(name, []);
    return collections.get(name);
  };
  const collection = (name) => ({
    find(filter, { projection = {} } = {}) {
      let rows = rowsFor(name).filter((row) => matches(row, filter));
      const cursor = {
        sort: () => cursor,
        skip: (count) => { rows = rows.slice(count); return cursor; },
        limit: (count) => { rows = rows.slice(0, count); return cursor; },
        toArray: async () => rows.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => projection[key] !== 0))),
      };
      return cursor;
    },
    countDocuments: async (filter) => rowsFor(name).filter((row) => matches(row, filter)).length,
    findOne: async (filter) => rowsFor(name).find((row) => matches(row, filter)) || null,
    insertOne: async (data) => { const rows = mutate(name); const _id = new ObjectId(); rows.push({ ...data, _id }); return { insertedId: _id }; },
    async updateOne(filter, update, { upsert = false } = {}) {
      const rows = mutate(name);
      let row = rows.find((item) => matches(item, filter));
      if (!row && upsert) { row = { ...filter, ...update.$setOnInsert, _id: new ObjectId() }; rows.push(row); }
      if (row) Object.assign(row, update.$set);
      return { matchedCount: row ? 1 : 0 };
    },
    async updateMany(filter, update) { mutate(name); for (const row of rowsFor(name).filter((item) => matches(item, filter))) Object.assign(row, update.$set); },
    async bulkWrite(operations) { for (const { updateOne } of operations) await collection(name).updateOne(updateOne.filter, updateOne.update, { upsert: updateOne.upsert }); },
    async deleteOne(filter) { const rows = mutate(name); const index = rows.findIndex((row) => matches(row, filter)); if (index < 0) return { deletedCount: 0 }; rows.splice(index, 1); return { deletedCount: 1 }; },
  });
  const database = { collection, listCollections: ({ name }) => ({ hasNext: async () => collections.has(name) }) };
  const mocks = {
    "server-only": {},
    "react": { cache: (fn) => fn },
    "next/headers": { cookies: async () => ({ get: () => ({ value: "local-test-session" }) }) },
    "next/server": { NextResponse: { json: (data, init) => new Response(JSON.stringify(data), { ...init, headers: { "Content-Type": "application/json", ...init?.headers } }) } },
    "@/lib/auth": { SESSION_COOKIE: "session", verifySession: () => state.authenticated ? { email: "admin@example.test" } : null },
    "@/lib/mongodb": { databaseConfigured: () => state.configured, getDatabase: async () => { if (state.failStorage) throw new Error("Storage offline"); return database; } },
    "@/lib/rate-limit": { clientAddress: () => "127.0.0.1", rateLimit: async () => ({ allowed: state.allowed, retryAfter: 60 }) },
  };
  const cache = new Map();
  function load(relative) {
    const filename = resolve(project, relative);
    if (cache.has(filename)) return cache.get(filename);
    const output = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    const compiledModule = { exports: {} };
    const customRequire = (name) => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.startsWith("@/")) return load(`src/${name.slice(2)}.ts`);
      if (name.startsWith("node:") || name === "mongodb") return nativeRequire(name);
      throw new Error(`Unmocked dependency: ${name}`);
    };
    const fetch = async (url) => { state.requests += 1; return String(url).includes("cloudinary") ? new Response(JSON.stringify({ result: state.mediaOk ? "ok" : "error" }), { status: state.mediaOk ? 200 : 503 }) : new Response("{}", { status: state.emailOk ? 200 : 503 }); };
    const process = { env: { ...(state.emailConfigured ? { RESEND_API_KEY: "test-only-not-a-credential" } : {}), ...(state.cloudConfigured ? { CLOUDINARY_CLOUD_NAME: "test-cloud", CLOUDINARY_API_KEY: "test-key", CLOUDINARY_API_SECRET: "test-secret" } : {}), ...(state.authSecret ? { AUTH_SECRET: state.authSecret } : {}) } };
    new Function("require", "module", "exports", "fetch", "process", output)(customRequire, compiledModule, compiledModule.exports, fetch, process);
    cache.set(filename, compiledModule.exports);
    return compiledModule.exports;
  }
  return { state, collections, load, rows: rowsFor };
}

const request = (body, method = "POST", path = "/api/test", origin = "https://cedah.test") => new Request(`https://cedah.test${path}`, { method, headers: { "Content-Type": "application/json", Origin: origin }, ...(method !== "GET" ? { body: JSON.stringify(body) } : {}) });
const context = (resource) => ({ params: Promise.resolve({ resource }) });

test("record validation rejects query objects, invalid URLs, numeric bounds and mutable keys", () => {
  const { validateRecord } = harness().load("src/lib/platform.ts");
  for (const record of [
    { slug: { $ne: "" }, title: "Injected" },
    { slug: "valid", title: { $gt: "" } },
    { slug: "valid", title: "Example", image_url: "javascript:alert(1)" },
    { slug: "valid", title: "Example", image_url: "//unsafe.test/image" },
    { slug: "valid", title: "Example", image_url: "/\\unsafe.test/image" },
    { slug: "valid", title: "Example", original_key: "old-key" },
    { slug: "valid", title: "Example", readiness: 101 },
  ]) assert.ok(validateRecord("enterprises", record).error);
  assert.equal(validateRecord("enterprises", { slug: "valid", title: "Example", image_url: "https://assets.example.test/photo.jpg" }).error, undefined);
});

test("published evidence requires source fields; targets stay distinct from verified actuals", () => {
  const { validateRecord, DEFAULT_IMPACT_TARGET } = harness().load("src/lib/platform.ts");
  assert.equal(validateRecord("impact-metrics", DEFAULT_IMPACT_TARGET).record.kind, "target");
  const actual = { metric_key: "jobs", label: "Jobs", value: 0, unit: "jobs", published: true, kind: "actual" };
  assert.ok(validateRecord("impact-metrics", actual).error);
  assert.equal(validateRecord("impact-metrics", { ...actual, measured_at: "2026-10-03", source: "Payroll register" }).error, undefined);
  assert.ok(validateRecord("impact-metrics", { ...actual, value: -1 }).error);
  assert.ok(validateRecord("documents", { slug: "budget", title: "Budget", status: "published" }).error);
  assert.equal(validateRecord("documents", { slug: "budget", title: "Budget", status: "published", file_url: "/documents/approved.pdf" }).error, undefined);
  assert.ok(validateRecord("field-stories", { slug: "visit", title: "Visit", status: "published", image_url: "/photo.jpg", captured_at: "2026-10-03", credit: "CEDAH" }).error);
  assert.ok(validateRecord("market-prices", { slug: "maize", title: "Maize", status: "published", price: 2000 }).error);
  assert.ok(validateRecord("sites", { slug: "site", title: "Site", latitude: 91 }).error);
});

test("all admin methods reject unauthenticated access without service writes", async () => {
  const h = harness({ authenticated: false });
  const resources = h.load("src/app/api/admin/data/[resource]/route.ts");
  const inbox = h.load("src/app/api/admin/submissions/route.ts");
  const content = h.load("src/app/api/admin/content/route.ts");
  const media = h.load("src/app/api/admin/media/route.ts");
  for (const method of ["GET", "POST", "DELETE"]) assert.equal((await resources[method](request({}, method), context("team"))).status, 401);
  for (const method of ["GET", "PATCH"]) assert.equal((await inbox[method](request({}, method))).status, 401);
  for (const method of ["GET", "POST"]) assert.equal((await content[method](request({}, method))).status, 401);
  for (const method of ["GET", "POST", "PATCH", "DELETE"]) assert.equal((await media[method](request({}, method))).status, 401);
  assert.equal(h.state.writes, 0);
});

test("resource mutations validate full batches and reject cross-origin/query injection", async () => {
  const h = harness();
  const route = h.load("src/app/api/admin/data/[resource]/route.ts");
  const valid = { slug: "board-chair", title: "Chair", kind: "board", status: "draft" };
  assert.equal((await route.POST(request({ record: valid }, "POST", "/api/test", "https://other.test"), context("team"))).status, 403);
  assert.equal((await route.POST(request({ records: [valid, { ...valid, slug: { $ne: "" } }] }), context("team"))).status, 400);
  assert.equal((await route.DELETE(request({ key: { $ne: "" } }, "DELETE"), context("team"))).status, 400);
  assert.equal(h.state.writes, 0);
  assert.equal((await route.POST(request({ record: valid }), context("team"))).status, 200);
  assert.equal(h.rows("team_partners")[0].kind, "board");
  assert.equal((await route.POST(request({ record: { ...valid, title: "Updated name", original_key: valid.slug } }), context("team"))).status, 200);
  assert.equal(h.rows("team_partners").length, 1);
  assert.equal(h.rows("team_partners")[0].title, "Updated name");
});

test("first default edit preserves all objectives and deletion never resurrects them", async () => {
  const h = harness();
  const route = h.load("src/app/api/admin/data/[resource]/route.ts");
  const { DEFAULT_OBJECTIVES } = h.load("src/lib/platform.ts");
  const content = h.load("src/lib/content.ts");
  assert.equal((await content.getPublicRecords("objectives", DEFAULT_OBJECTIVES)).length, 10);
  const initial = await (await route.GET(request(null, "GET"), context("objectives"))).json();
  assert.equal(initial.items.length, 10);
  assert.equal(h.state.writes, 0);
  assert.equal((await route.POST(request({ record: { ...DEFAULT_OBJECTIVES[0], title: "Updated objective" } }), context("objectives"))).status, 200);
  assert.equal(h.rows("objectives").length, 10);
  for (const item of DEFAULT_OBJECTIVES) assert.equal((await route.DELETE(request({ key: item.slug }, "DELETE"), context("objectives"))).status, 200);
  assert.deepEqual(await content.getPublicRecords("objectives", DEFAULT_OBJECTIVES), []);
  h.state.failStorage = true;
  assert.deepEqual(await content.getPublicRecords("objectives", DEFAULT_OBJECTIVES), []);
});

test("content validation blocks nested Mongo operators and unsafe CTA URLs", async () => {
  const h = harness();
  const route = h.load("src/app/api/admin/content/route.ts");
  for (const body of [
    { section: { $ne: "" }, content: { title: "Bad" } },
    { section: "hero-section", content: { title: { $ne: "" } } },
    { section: "hero-section", content: { buttonLink: "javascript:alert(1)" } },
  ]) assert.equal((await route.POST(request(body))).status, 400);
  assert.equal(h.state.writes, 0);
});

test("registration requires consent and relevant details before storing anything", async () => {
  const h = harness();
  const route = h.load("src/app/api/registrations/route.ts");
  const farmer = { kind: "farmer", name: "Farmer", phone: "+256700000001", location: "Gulu", crop: "Maize", consent: true };
  for (const body of [{ ...farmer, consent: false }, { ...farmer, crop: "" }, { ...farmer, phone: "bad" }, { ...farmer, kind: { $ne: "" } }, { ...farmer, language: "xx" }, { ...farmer, language: { $ne: "" } }]) assert.equal((await route.POST(request(body))).status, 400);
  assert.equal(h.state.writes, 0);
  const response = await route.POST(request(farmer));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, stored: true, notification: "not-configured" });
  assert.equal(h.rows("contact_submissions")[0].kind, "farmer");
  assert.equal(h.rows("contact_submissions")[0].language, "en");
  assert.equal((await route.POST(request({ ...farmer, language: "lg" }))).status, 200);
  assert.equal(h.rows("contact_submissions")[1].language, "lg");
  assert.equal(h.state.requests, 0);
});

test("saved requests remain successful when email fails; unavailable storage reports failure", async () => {
  const h = harness({ emailConfigured: true });
  const route = h.load("src/app/api/contact/route.ts");
  const body = { name: "Partner", email: "partner@example.test", message: "Partnership discussion" };
  const response = await route.POST(request(body));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).notification, "failed");
  assert.equal(h.rows("contact_submissions")[0].notification_status, "failed");
  assert.equal(h.state.requests, 1);
  h.state.failStorage = true;
  assert.equal((await route.POST(request(body))).status, 502);
  assert.equal(h.state.requests, 1);
  h.state.failStorage = false;
  h.state.allowed = false;
  assert.equal((await route.POST(request(body))).status, 429);
  assert.equal(h.rows("contact_submissions").length, 1);
});

test("newsletter token is hashed, unsubscribe covers duplicates, and admin cannot reactivate", async () => {
  const h = harness();
  const route = h.load("src/app/api/registrations/route.ts");
  const body = { kind: "newsletter", email: "reader@example.test", consent: true };
  const receipt = await (await route.POST(request(body))).json();
  await route.POST(request(body));
  const token = new URL(receipt.unsubscribe_url, "https://cedah.test").searchParams.get("token");
  assert.equal(token.length, 64);
  assert.notEqual(h.rows("contact_submissions")[0].unsubscribe_token_hash, token);
  const inbox = h.load("src/app/api/admin/submissions/route.ts");
  const list = await (await inbox.GET(request(null, "GET"))).json();
  assert.equal(list.items[0].unsubscribe_token_hash, undefined);
  assert.equal((await route.DELETE(request({ token }, "DELETE"))).status, 200);
  assert.ok(h.rows("contact_submissions").every((row) => row.status === "unsubscribed" && row.consent === false));
  assert.equal((await inbox.PATCH(request({ id: list.items[0].id, status: "new" }, "PATCH"))).status, 400);
  assert.equal((await inbox.PATCH(request({ id: list.items[0].id, notes: "Do not email" }, "PATCH"))).status, 200);
  assert.equal((await inbox.PATCH(request({ id: { $ne: "" }, status: "closed" }, "PATCH"))).status, 400);
});

test("media deletion guards references and keeps the record when the provider fails", async () => {
  const h = harness({ cloudConfigured: true });
  const route = h.load("src/app/api/admin/media/route.ts");
  const asset = { public_id: "cedah/field-visit", secure_url: "https://res.cloudinary.com/test-cloud/image/upload/v123/cedah/field-visit.jpg", resource_type: "image", format: "jpg", bytes: 2048, original_filename: "field-visit" };
  assert.equal((await route.POST(request({ asset: { ...asset, public_id: { $ne: "" } } }))).status, 400);
  assert.equal((await route.POST(request({ asset: { ...asset, secure_url: "javascript:alert(1)" } }))).status, 400);
  assert.equal((await route.POST(request({ asset: { ...asset, bytes: 11 * 1024 * 1024 } }))).status, 400);
  assert.equal(h.state.writes, 0);
  assert.equal((await route.POST(request({ asset }))).status, 200);
  h.collections.set("field_stories", [{ slug: "visit", image_url: asset.secure_url }]);
  assert.equal((await route.DELETE(request({ public_id: asset.public_id }, "DELETE"))).status, 409);
  assert.equal(h.state.requests, 0);
  h.collections.set("field_stories", []);
  assert.equal((await route.PATCH(request({ public_id: asset.public_id, original_filename: "Field visit in October" }, "PATCH"))).status, 200);
  assert.equal(h.rows("media_assets")[0].original_filename, "Field visit in October");
  assert.equal((await route.DELETE(request({ public_id: asset.public_id }, "DELETE"))).status, 502);
  assert.equal(h.rows("media_assets").length, 1);
  h.state.mediaOk = true;
  assert.equal((await route.DELETE(request({ public_id: asset.public_id }, "DELETE"))).status, 200);
  assert.equal(h.rows("media_assets").length, 0);
});

test("session verification fails closed for malformed and unconfigured cookies", () => {
  const auth = harness({ authSecret: "local-tests-only" }).load("src/lib/auth.ts");
  const token = auth.createSession("admin@example.test", "Admin");
  assert.equal(auth.verifySession(token).email, "admin@example.test");
  for (const invalid of ["malformed", `${token}.extra`, `${token.split(".")[0]}.${"é".repeat(43)}`, "x".repeat(5000), `${token.slice(0, -2)}xx`]) assert.equal(auth.verifySession(invalid), null);
  assert.equal(harness().load("src/lib/auth.ts").verifySession(token), null);
});

const publicationFixtures = {
  enterprises: { phase: "Launch enterprise", highlights: "Storage\nValue addition" },
  news: { excerpt: "Public introduction", body: "Full article", published_at: "2026-10-03" },
  projects: { stage: "in-progress", location: "Gulu" },
  opportunities: { opportunity_type: "Technical partnership", currency: "USD", target_amount: 5000 },
  team: { kind: "board", role: "Governor", organisation: "CEDAH" },
  "impact-metrics": { label: "Verified jobs", value: 12, unit: "jobs", kind: "actual", published: true, measured_at: "2026-10-03", source: "Employment register" },
  documents: { category: "Governance", version: "1" },
  "field-stories": { media_type: "photo", credit: "CEDAH field team", captured_at: "2026-10-03", rights_confirmed: true },
  "market-prices": { crop: "Maize", market: "Gulu", price: 1500, currency: "UGX", unit: "kg", observed_at: "2026-10-03", source: "Published market survey" },
  sites: { site_type: "aggregation", stage: "planned", location: "Gulu", latitude: 2.77, longitude: 32.3 },
  products: { category: "Grain", availability: "pre-order", price: 1500, currency: "UGX", unit: "kg" },
  roadmap: { phase: "Phase 1", stage: "planned", target_date: "2027-01-01" },
  objectives: { sort_order: 1 },
};

for (const [resource, fixture] of Object.entries(publicationFixtures)) {
  test(`${resource}: create, rename, replace media, unpublish, republish and delete update public records`, async () => {
    const h = harness();
    const { RESOURCE_CONFIG, DEFAULT_RESOURCE_RECORDS } = h.load("src/lib/platform.ts");
    const config = RESOURCE_CONFIG[resource];
    assert.deepEqual(Object.keys(publicationFixtures).sort(), Object.keys(RESOURCE_CONFIG).sort(), "Every managed resource needs a lifecycle fixture");
    // Start with an explicitly managed, empty collection; starter behavior is
    // exercised independently by the defaults test above.
    h.collections.set(config.collection, []);
    const route = h.load("src/app/api/admin/data/[resource]/route.ts");
    const { getPublicRecords } = h.load("src/lib/content.ts");
    const summaryField = config.fields.includes("summary") ? "summary" : "excerpt";
    const urlFields = config.fields.filter((field) => field.endsWith("_url"));
    const originalUrls = Object.fromEntries(urlFields.map((field) => [field, `https://assets.example.test/original-${field}.jpg`]));
    const record = { [config.key]: "audit-record", title: "Original title", summary: "Original public summary", status: "published", ...fixture, ...originalUrls };
    const publicRows = () => getPublicRecords(resource, DEFAULT_RESOURCE_RECORDS[resource] || []);

    let response = await route.POST(request({ record }), context(resource));
    assert.equal(response.status, 200, JSON.stringify(await response.json()));
    let visible = await publicRows();
    assert.equal(visible.length, 1);
    assert.equal(visible[0][config.key], record[config.key]);
    assert.equal(visible[0][resource === "impact-metrics" ? "label" : "title"], resource === "impact-metrics" ? fixture.label : record.title);
    for (const [field, url] of Object.entries(originalUrls)) assert.equal(visible[0][field], url);

    const replacementUrls = Object.fromEntries(urlFields.map((field) => [field, `https://assets.example.test/replacement-${field}.jpg`]));
    const updated = { ...record, ...replacementUrls, original_key: record[config.key], title: "Renamed title", [summaryField]: "Updated public summary", ...(resource === "impact-metrics" ? { label: "Updated verified jobs" } : {}) };
    response = await route.POST(request({ record: updated }), context(resource));
    assert.equal(response.status, 200, JSON.stringify(await response.json()));
    assert.equal(h.rows(config.collection).length, 1, "Renaming must update the existing record");
    visible = await publicRows();
    assert.equal(visible.length, 1);
    assert.equal(visible[0][resource === "impact-metrics" ? "label" : "title"], resource === "impact-metrics" ? updated.label : updated.title);
    assert.equal(visible[0][summaryField], updated[summaryField]);
    for (const [field, url] of Object.entries(replacementUrls)) assert.equal(visible[0][field], url, "Public media must use the replacement URL");

    const hidden = resource === "impact-metrics" ? { ...updated, published: false } : { ...updated, status: "draft" };
    response = await route.POST(request({ record: hidden }), context(resource));
    assert.equal(response.status, 200, JSON.stringify(await response.json()));
    assert.deepEqual(await publicRows(), [], "Unpublished records must disappear publicly");
    assert.equal(h.rows(config.collection).length, 1, "Unpublishing retains the editable record");

    response = await route.POST(request({ record: updated }), context(resource));
    assert.equal(response.status, 200, JSON.stringify(await response.json()));
    assert.equal((await publicRows()).length, 1);
    response = await route.DELETE(request({ key: record[config.key] }, "DELETE"), context(resource));
    assert.equal(response.status, 200, JSON.stringify(await response.json()));
    assert.equal(h.rows(config.collection).length, 0);
    assert.deepEqual(await publicRows(), [], "Deleting the final record must not revive defaults");
    assert.equal(h.state.requests, 0, "Lifecycle checks must not call external services");
  });
}
