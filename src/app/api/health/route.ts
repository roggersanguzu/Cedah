import { NextResponse } from "next/server";
import { databaseConfigured, getDatabase } from "@/lib/mongodb";
export async function GET() {
  const checks: Record<string, string> = {
    application: "ok",
    mongodb: "not-configured",
    cloudinary: "not-configured",
  };

  const mongoCheck = async () => {
    if (!databaseConfigured()) return;
    try {
      const database = await getDatabase();
      await database.command({ ping: 1 });
      checks.mongodb = "ok";
    } catch {
      checks.mongodb = "error";
    }
  };

  const cloudinaryCheck = async () => {
    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    const key = process.env.CLOUDINARY_API_KEY;
    const secret = process.env.CLOUDINARY_API_SECRET;
    if (!cloud || !key || !secret) return;
    try {
      const credentials = Buffer.from(`${key}:${secret}`).toString("base64");
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/resources/image?max_results=1`,
        {
          headers: { Authorization: `Basic ${credentials}` },
          signal: AbortSignal.timeout(8_000),
          cache: "no-store",
        },
      );
      checks.cloudinary = response.ok ? "ok" : "error";
    } catch {
      checks.cloudinary = "error";
    }
  };

  await Promise.all([mongoCheck(), cloudinaryCheck()]);
  const healthy = checks.mongodb === "ok" && checks.cloudinary === "ok";
  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
}
