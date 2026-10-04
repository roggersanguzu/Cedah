/** Shared public/admin data contracts. Keep this module safe to import in clients. */
export const RESOURCE_CONFIG = {
  enterprises: { collection: "enterprises", key: "slug", label: "Enterprises", fields: ["slug", "title", "summary", "phase", "status", "readiness", "content", "highlights", "image_url", "sort_order"] },
  news: { collection: "news_posts", key: "slug", label: "News", fields: ["slug", "title", "excerpt", "body", "category", "status", "image_url", "published_at", "sort_order"] },
  projects: { collection: "projects", key: "slug", label: "Projects", fields: ["slug", "title", "summary", "status", "stage", "category", "location", "start_date", "end_date", "image_url", "content", "sort_order"] },
  opportunities: { collection: "funding_opportunities", key: "slug", label: "Opportunities", fields: ["slug", "title", "summary", "status", "opportunity_type", "target_amount", "currency", "deadline", "document_url", "image_url", "sort_order"] },
  team: { collection: "team_partners", key: "slug", label: "Board & leadership", fields: ["slug", "title", "summary", "status", "kind", "role", "organisation", "website_url", "image_url", "sort_order"] },
  "impact-metrics": { collection: "impact_metrics", key: "metric_key", label: "Impact metrics", fields: ["metric_key", "label", "value", "unit", "published", "kind", "measured_at", "source", "summary", "sort_order"] },
  documents: { collection: "partner_documents", key: "slug", label: "Data room", fields: ["slug", "title", "summary", "status", "category", "file_url", "version", "published_at", "sort_order"] },
  "field-stories": { collection: "field_stories", key: "slug", label: "Field evidence", fields: ["slug", "title", "summary", "status", "media_type", "image_url", "video_url", "caption", "location", "captured_at", "credit", "rights_confirmed", "sort_order"] },
  "market-prices": { collection: "market_prices", key: "slug", label: "Market prices", fields: ["slug", "title", "summary", "status", "crop", "market", "price", "currency", "unit", "observed_at", "source", "sort_order"] },
  sites: { collection: "operating_sites", key: "slug", label: "Operating sites", fields: ["slug", "title", "summary", "status", "site_type", "stage", "location", "latitude", "longitude", "image_url", "sort_order"] },
  products: { collection: "products", key: "slug", label: "Products", fields: ["slug", "title", "summary", "status", "category", "price", "currency", "unit", "availability", "minimum_order", "image_url", "sort_order"] },
  roadmap: { collection: "roadmap", key: "slug", label: "Roadmap", fields: ["slug", "title", "summary", "status", "phase", "stage", "target_date", "sort_order"] },
  objectives: { collection: "objectives", key: "slug", label: "Objectives", fields: ["slug", "title", "summary", "status", "sort_order"] },
} as const;

export type ResourceName = keyof typeof RESOURCE_CONFIG;
export type PlatformRecord = Record<string, string | number | boolean>;
export const SUBMISSION_STATUSES = ["new", "in-progress", "responded", "closed", "unsubscribed"] as const;
export const REGISTRATION_KINDS = ["farmer", "training", "newsletter", "buyer"] as const;

export const DEFAULT_SITE_SETTINGS = {
  legalName: "Capital Economic Development Alliance Holdings Ltd.",
  publicEmail: "info@cedah.com",
  location: "Kampala, Uganda",
  timezone: "Africa/Kampala",
  phone: "+256769758805",
  whatsapp: "+256769758805",
};

export const DEFAULT_OBJECTIVES: PlatformRecord[] = [
  { slug: "reliable-market-access", title: "Reliable market access", summary: "Serve as a dependable, trusted market and value-adding contributor to the East African grain value chain, giving farmers consistent demand, fair pricing and a reason to keep supplying quality grain." },
  { slug: "youth-employment", title: "Youth employment & livelihoods", summary: "Create sustainable employment for youth, targeting up to 500 jobs within five years, while empowering profitable, modern agricultural practices among the growing youth population." },
  { slug: "food-security", title: "Food security", summary: "Promote food security across the region by championing increased, quality-driven agricultural production, from grain to livestock." },
  { slug: "skills-development", title: "Skills development", summary: "Build sustainable agribusiness and technical skills among the local population through structured vocational training and on-the-job learning." },
  { slug: "employment-pathways", title: "Employment pathways", summary: "Employ qualified graduates directly in CEDAH's operations and connect others to partner businesses and markets across the value chain." },
  { slug: "value-addition", title: "Value addition", summary: "Grow farmer and community incomes by developing higher-value grain and livestock products, including milled grain, animal feed, packaged beef and dairy." },
  { slug: "responsible-production", title: "Sustainable & responsible production", summary: "Embed climate-aware farming, animal welfare and traceability standards into every operating unit so growth protects the land and the herd." },
  { slug: "farmer-prosperity", title: "Farmer prosperity", summary: "Strengthen producer networks through aggregation, knowledge-sharing and market information, improving smallholder incomes and resilience to shocks." },
  { slug: "partnership-readiness", title: "Investment & partnership readiness", summary: "Build governance and reporting structures that make CEDAH a credible, transparent platform for grants, patient capital and strategic partnerships." },
  { slug: "regional-growth", title: "Regional growth", summary: "Lay the foundation for additional high-value crops and East African markets, in line with CEDAH's vision of becoming a leading regional industrial agribusiness group." },
].map((objective, index) => ({ ...objective, status: "published", sort_order: index + 1 }));

export const DEFAULT_IMPACT_TARGET: PlatformRecord = {
  metric_key: "five-year-youth-jobs-target", label: "Youth jobs", value: 500, unit: "jobs", kind: "target", published: true,
  summary: "Up to 500 sustainable jobs within five years. This is an ambition, not a reported result.", source: "CEDAH founding objectives", sort_order: 1,
};

export const DEFAULT_ENTERPRISES: PlatformRecord[] = [
  { slug: "crop-enterprise", title: "Crop enterprise", summary: "Grain production, aggregation and proper bulk storage, with a phased path into milling, animal feed and value addition for maize, beans, millet and sorghum.", content: "We aim to provide farmers with dependable demand, quality standards and access to domestic and regional markets, while researching opportunities in high-value crops.", highlights: "Grain production and farmer aggregation\nBulk storage and quality handling\nMilling, animal feed and value addition\nMarket research for high-value crops", phase: "Launch enterprise", status: "published", image_url: "/images/grain-enterprise.jpg", sort_order: 1 },
  { slug: "beef-enterprise", title: "Livestock enterprise", summary: "Responsible ranching and feedlot development for beef, with a phased ambition for dairy and goats, built around animal health, welfare and traceability.", content: "Operating plans connect quality feed, sustainable herd management, processing and reliable routes to market as funding and operational readiness develop.", highlights: "Responsible ranching and feedlot development\nHerd health, welfare and traceability\nQuality feed and dependable markets\nPhased beef, dairy and goat value addition", phase: "Launch enterprise", status: "published", image_url: "/images/cattle-ranch.jpg", sort_order: 2 },
];

export const DEFAULT_ROADMAP: PlatformRecord[] = [
  { slug: "establish-foundations", title: "Establish the foundations", summary: "Secure development partnerships and founder investment, establish governance and reporting, and complete feasibility and market research.", phase: "Phase 01", stage: "planned", status: "published", sort_order: 1 },
  { slug: "launch-production", title: "Build production and aggregation", summary: "Develop grain storage and reliable farmer supply networks alongside responsible livestock production systems, subject to funding and readiness.", phase: "Phase 02", stage: "planned", status: "published", sort_order: 2 },
  { slug: "process-and-skill", title: "Add value and develop skills", summary: "Introduce processing and vocational training in phases, connect graduates to employment and expand buyer relationships.", phase: "Phase 03", stage: "planned", status: "published", sort_order: 3 },
  { slug: "regional-expansion", title: "Grow into regional markets", summary: "Use verified results to guide growth into additional high-value crops and East African markets over the longer term.", phase: "Phase 04", stage: "planned", status: "published", sort_order: 4 },
];

export const DEFAULT_RESOURCE_RECORDS: Partial<Record<ResourceName, PlatformRecord[]>> = {
  objectives: DEFAULT_OBJECTIVES, "impact-metrics": [DEFAULT_IMPACT_TARGET], enterprises: DEFAULT_ENTERPRISES, roadmap: DEFAULT_ROADMAP,
};

export function isResourceName(value: string): value is ResourceName {
  return Object.hasOwn(RESOURCE_CONFIG, value);
}

export function isSafeUrl(value: string, allowContact = false) {
  if (!value || /[\u0000-\u0020\\]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  if (allowContact && /^#[a-zA-Z][\w-]*$/.test(value)) return true;
  if (allowContact && /^(mailto:[^\s@]+@[^\s@]+\.[^\s@]+|tel:\+?[\d-]+)$/.test(value)) return true;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
}

const numberFields = new Set(["value", "readiness", "target_amount", "price", "latitude", "longitude", "sort_order"]);
const booleanFields = new Set(["published", "rights_confirmed"]);
const dateFields = new Set(["published_at", "start_date", "end_date", "deadline", "measured_at", "captured_at", "observed_at", "target_date"]);
const longFields = new Set(["summary", "excerpt", "body", "content", "caption", "highlights"]);

export function validateRecord(resource: ResourceName, input: unknown): { record: PlatformRecord; error?: never } | { error: string; record?: never } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "A record must be an object." };
  const raw = input as Record<string, unknown>;
  const config = RESOURCE_CONFIG[resource];
  const identifier = raw[config.key];
  if (typeof identifier !== "string" || !/^[a-z0-9][a-z0-9-]{0,99}$/.test(identifier)) return { error: `Provide a valid ${config.key} using lowercase letters, numbers and hyphens.` };
  if (raw.original_key !== undefined && raw.original_key !== identifier) return { error: "The existing record identifier cannot be changed." };
  const record: PlatformRecord = {};
  for (const field of config.fields) {
    const value = raw[field];
    if (value === undefined) continue;
    if (booleanFields.has(field)) {
      if (typeof value !== "boolean") return { error: `${field} must be true or false.` };
      record[field] = value;
    } else if (numberFields.has(field)) {
      if (value === "" && field !== "value") { record[field] = ""; continue; }
      if ((typeof value !== "number" && typeof value !== "string") || value === "") return { error: `${field} must be a number.` };
      const number = Number(value);
      const min = field === "latitude" ? -90 : field === "longitude" ? -180 : 0;
      const max = field === "latitude" ? 90 : field === "longitude" ? 180 : field === "readiness" ? 100 : 1e12;
      if (!Number.isFinite(number) || number < min || number > max) return { error: `${field} must be between ${min} and ${max}.` };
      record[field] = number;
    } else {
      if (typeof value !== "string") return { error: `${field} must be text.` };
      const max = longFields.has(field) ? 20000 : field.endsWith("_url") ? 2048 : 500;
      if (value.length > max) return { error: `${field} exceeds ${max} characters.` };
      const text = value.trim();
      if (field.endsWith("_url") && text && !isSafeUrl(text)) return { error: `${field} must be a valid web or local file URL.` };
      if (dateFields.has(field) && text && (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(text) || !Number.isFinite(Date.parse(text)))) return { error: `${field} must be a valid date.` };
      record[field] = text;
    }
  }
  if (!(resource === "impact-metrics" ? record.label : record.title)) return { error: "A title or metric label is required." };
  if (resource !== "impact-metrics") {
    record.status ??= "draft";
    if (!["draft", "published", "planned", "archived"].includes(String(record.status))) return { error: "Invalid publication status." };
  }
  if (resource === "team") {
    record.kind ||= "leadership";
    if (!["board", "leadership", "partner"].includes(String(record.kind))) return { error: "Choose board, leadership or partner." };
  }
  if (resource === "impact-metrics") {
    record.kind ||= "actual";
    record.published ??= false;
    if (!["actual", "target"].includes(String(record.kind))) return { error: "Metric kind must be actual or target." };
    if (typeof record.value !== "number") return { error: "Provide a numeric metric value." };
    if (record.published && record.kind === "actual" && (!record.measured_at || !record.source)) return { error: "Published actual results need a measurement date and evidence source." };
  }
  if (record.status === "published") {
    const required = resource === "documents" ? ["file_url"] : resource === "market-prices" ? ["crop", "market", "price", "currency", "unit", "observed_at", "source"] : resource === "sites" ? ["location", "latitude", "longitude"] : [];
    for (const field of required) if (record[field] === "" || record[field] === undefined) return { error: `${field} is required before publishing.` };
    if (resource === "field-stories" && (!record.rights_confirmed || !record.credit || !record.captured_at || !(record.media_type === "video" ? record.video_url : record.image_url))) return { error: "Field evidence requires an approved photo/video URL, capture date, credit and rights confirmation." };
  }
  if (resource === "field-stories" && record.media_type && !["photo", "video"].includes(String(record.media_type))) return { error: "Media type must be photo or video." };
  return { record };
}
