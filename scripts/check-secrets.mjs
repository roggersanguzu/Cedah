import { execFileSync } from "node:child_process";
import { extname } from "node:path";
import { readFileSync } from "node:fs";

const secretNames = [
  "AUTH_SECRET",
  "SUPER_ADMIN_PASSWORD",
  "MONGODB_URI",
  "CLOUDINARY_API_SECRET",
  "RESEND_API_KEY",
  "SENTRY_DSN",
  "TURNSTILE_SECRET_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "AFRICASTALKING_API_KEY",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_VERIFY_TOKEN",
];
const secrets = secretNames
  .map((name) => [name, process.env[name]?.trim()])
  .filter(([, value]) => value && value.length >= 8);
const textExtensions = new Set([
  ".css",
  ".env",
  ".example",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
]);
const tracked = execFileSync("git", ["ls-files", "-z"])
  .toString()
  .split("\0")
  .filter(Boolean);
const files = tracked.filter(
  (file) =>
    textExtensions.has(extname(file)) ||
    ["Dockerfile", ".gitignore", ".dockerignore"].includes(file),
);
const findings = [];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const [name, value] of secrets) {
    if (content.includes(value)) findings.push(`${name} found in ${file}`);
  }
}

if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log(`Secret scan passed across ${files.length} tracked text files`);
