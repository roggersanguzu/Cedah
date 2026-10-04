import "server-only";

export async function readJsonObject(request: Request, maxBytes = 128_000): Promise<Record<string, unknown> | null> {
  if (Number(request.headers.get("content-length") || 0) > maxBytes) return null;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text, "utf8") > maxBytes) return null;
    const value: unknown = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
  } catch { return null; }
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export function cleanText(value: unknown, max = 1000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
