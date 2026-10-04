// Read-only check against a running development or production server.
// Catch missing stylesheets and CSS chunks containing the wrong source.
import assert from "node:assert/strict";

const baseUrl = new URL(process.argv[2] || "http://localhost:3000");
const routes = [
  { path: "/", selectors: [".whatsapp-link", ".venture-grid", ".platform-section", ".cedah-loading-mark"] },
  { path: "/admin/login", selectors: [".whatsapp-link", ".ca-dashboard", ".cedah-loading-mark"] },
];

for (const { path, selectors } of routes) {
  const pageUrl = new URL(path, baseUrl);
  const page = await fetch(pageUrl, { signal: AbortSignal.timeout(60_000) });
  assert.ok(page.ok, `${path}: HTTP ${page.status}`);
  const html = await page.text();
  const links = [...html.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => /\brel="stylesheet"/.test(tag) && /\bhref="([^"]+)"/.exec(tag)?.[1])
    .filter(Boolean);
  assert.ok(links.length, `${path}: no stylesheets were linked`);
  const styles = await Promise.all([...new Set(links)].map(async (href) => {
    const url = new URL(href.replaceAll("&amp;", "&"), pageUrl);
    assert.equal(url.origin, baseUrl.origin, "Expected locally served stylesheets");
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    assert.ok(response.ok, `${url.pathname}: HTTP ${response.status}`);
    assert.match(response.headers.get("content-type") || "", /text\/css/, `${url.pathname}: not CSS`);
    return response.text();
  }));
  const combined = styles.join("\n");
  for (const selector of selectors) assert.ok(combined.includes(selector), `${path}: missing ${selector} styles`);
  console.log(`${path}: ${styles.length} stylesheet(s) loaded; required styles present`);
}
