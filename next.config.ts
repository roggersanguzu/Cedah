import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
  compress: true,
  images: { formats: ["image/avif", "image/webp"] },
  reactCompiler: true,
};

export default nextConfig;
