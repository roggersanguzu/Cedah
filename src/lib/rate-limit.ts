import "server-only";

import { createHash } from "node:crypto";

type LimitResult = { allowed: boolean; remaining: number; retryAfter: number };

export function clientAddress(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export async function rateLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowSeconds: number,
): Promise<LimitResult> {
  const endpoint = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!endpoint || !token) {
    return { allowed: true, remaining: limit, retryAfter: 0 };
  }

  const digest = createHash("sha256")
    .update(identifier)
    .digest("hex")
    .slice(0, 32);
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `cedah:limit:${scope}:${bucket}:${digest}`;

  try {
    const response = await fetch(`${endpoint}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, windowSeconds + 5],
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) throw new Error("rate limit service unavailable");
    const result = (await response.json()) as { result?: number }[];
    const count = Number(result[0]?.result || 0);
    const retryAfter = Math.max(
      1,
      windowSeconds - Math.floor((Date.now() / 1000) % windowSeconds),
    );
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfter,
    };
  } catch {
    // The core experience remains available if the optional limiter is offline.
    return { allowed: true, remaining: limit, retryAfter: 0 };
  }
}
