import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.CEDAH_BUILD_DIR || ".next",
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
  compress: true,
  images: { formats: ["image/avif", "image/webp"] },
  reactCompiler: true,
};

export default nextConfig;
