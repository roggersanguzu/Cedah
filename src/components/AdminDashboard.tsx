"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import LoadingIndicator, { LoadingMark } from "@/components/LoadingIndicator";
import { DEFAULT_SITE_SETTINGS, SUBMISSION_STATUSES, isSafeUrl } from "@/lib/platform";

type RecordData = Record<string, unknown>;
type Notice = (message: string, error?: boolean) => void;
type Field = { key: string; label: string; type?: "textarea" | "number" | "date" | "url" | "email" | "select" | "checkbox"; options?: string[]; required?: boolean; min?: number; max?: number; hint?: string; upload?: "image" | "document" | "video" };
type Collection = { label: string; description: string; fields: Field[]; key?: string };
const titleField: Field = { key: "title", label: "Title", required: true };
const summaryField: Field = { key: "summary", label: "Summary", type: "textarea" };
const imageField: Field = { key: "image_url", label: "Image URL", type: "url", upload: "image" };
const orderField: Field = { key: "sort_order", label: "Display order", type: "number", min: 0, hint: "Lower numbers appear first." };
const bodyField: Field = { key: "content", label: "Full description", type: "textarea" };
const collections: Record<string, Collection> = {
  enterprises: { label: "Enterprises", description: "Maintain enterprise descriptions, operating details and development phases.", fields: [titleField, summaryField, { key: "phase", label: "Phase" }, { key: "readiness", label: "Readiness (%)", type: "number", min: 0, max: 100 }, { key: "highlights", label: "Highlights (one per line)", type: "textarea" }, bodyField, imageField, orderField] },
  news: { label: "News & updates", description: "Publish dated updates and full articles without a developer.", fields: [titleField, { key: "excerpt", label: "Short introduction", type: "textarea" }, { key: "body", label: "Full article", type: "textarea" }, { key: "category", label: "Category" }, { key: "published_at", label: "Publication date", type: "date" }, imageField, orderField] },
  projects: { label: "Projects & activities", description: "Keep partners informed about implementation, locations and schedules.", fields: [titleField, summaryField, { key: "stage", label: "Implementation stage" }, { key: "category", label: "Category" }, { key: "location", label: "Location" }, { key: "start_date", label: "Start date", type: "date" }, { key: "end_date", label: "End date", type: "date" }, bodyField, imageField, orderField] },
  opportunities: { label: "Funding opportunities", description: "Manage partnership calls, funding requirements and supporting documents.", fields: [titleField, summaryField, { key: "opportunity_type", label: "Opportunity type" }, { key: "target_amount", label: "Target amount", type: "number", min: 0 }, { key: "currency", label: "Currency (UGX, USD…)" }, { key: "deadline", label: "Deadline", type: "date" }, { key: "document_url", label: "Supporting document", type: "url", upload: "document" }, imageField, orderField] },
  documents: { label: "Partner data room", description: "Manage concept notes, budgets, risk registers, impact frameworks and governance documents approved for public access.", fields: [titleField, summaryField, { key: "category", label: "Document category" }, { key: "file_url", label: "Download URL", type: "url", upload: "document", required: true }, { key: "version", label: "Version" }, { key: "published_at", label: "Document date", type: "date" }, orderField] },
  team: { label: "Board, team & partners", description: "Control the Board of Governors, leadership biographies and partner profiles shown publicly.", fields: [{ ...titleField, label: "Full name or organisation" }, { key: "kind", label: "Profile group", type: "select", options: ["board", "leadership", "partner"], required: true }, { key: "role", label: "Role / board position", required: true }, { ...summaryField, label: "Biography" }, { key: "organisation", label: "Organisation" }, { ...imageField, label: "Portrait / logo URL" }, { key: "website_url", label: "Profile website", type: "url" }, orderField] },
  "impact-metrics": { label: "Impact metrics", key: "metric_key", description: "Keep verified results separate from targets. Actual results need a reporting date and evidence source before publication.", fields: [{ key: "label", label: "Metric name", required: true }, { key: "value", label: "Value", type: "number", min: 0, required: true }, { key: "unit", label: "Unit (jobs, tonnes, farmers, hectares)" }, { key: "kind", label: "Measurement type", type: "select", options: ["actual", "target"], required: true }, { key: "measured_at", label: "Reporting / target date", type: "date" }, { key: "source", label: "Evidence source or approved plan" }, summaryField, orderField] },
  "field-stories": { label: "Field evidence", description: "Share genuine CEDAH photographs and videos with dates, locations and credits.", fields: [titleField, summaryField, { key: "media_type", label: "Media type", type: "select", options: ["photo", "video"], required: true }, { ...imageField, label: "Field photograph / video poster URL" }, { key: "video_url", label: "Video URL", type: "url", upload: "video" }, { key: "caption", label: "Media caption", type: "textarea" }, { key: "location", label: "Location" }, { key: "captured_at", label: "Date captured", type: "date" }, { key: "credit", label: "Photographer / source credit" }, { key: "rights_confirmed", label: "I confirm this is authentic field media approved for publication, with permission from its owner and identifiable participants.", type: "checkbox" }, orderField] },
  "market-prices": { label: "Market prices", description: "Publish dated, sourced market observations. Refresh or unpublish outdated prices.", fields: [titleField, { key: "crop", label: "Crop / commodity", required: true }, { key: "market", label: "Market / location", required: true }, { key: "price", label: "Price", type: "number", min: 0, required: true }, { key: "currency", label: "Currency", required: true }, { key: "unit", label: "Unit (kg, tonne, bag)", required: true }, { key: "observed_at", label: "Observation date", type: "date", required: true }, { key: "source", label: "Price source", required: true }, summaryField, orderField] },
  sites: { label: "Operating sites", description: "Manage production, ranching and aggregation locations for the public map.", fields: [titleField, summaryField, { key: "site_type", label: "Site type", type: "select", options: ["production", "ranching", "aggregation", "processing", "office"] }, { key: "stage", label: "Operating stage", type: "select", options: ["planned", "active", "under-development"] }, { key: "location", label: "Address / district", required: true }, { key: "latitude", label: "Latitude", type: "number", min: -90, max: 90, required: true }, { key: "longitude", label: "Longitude", type: "number", min: -180, max: 180, required: true }, imageField, orderField] },
  products: { label: "Product catalogue", description: "List products and availability so buyers can send order enquiries to the shared inbox.", fields: [titleField, summaryField, { key: "category", label: "Category" }, { key: "availability", label: "Availability", type: "select", options: ["available", "pre-order", "planned", "unavailable"] }, { key: "price", label: "Indicative price (optional)", type: "number", min: 0 }, { key: "currency", label: "Currency" }, { key: "unit", label: "Unit / pack size" }, { key: "minimum_order", label: "Minimum order" }, imageField, orderField] },
  roadmap: { label: "Growth roadmap", description: "Maintain planned expansion and delivery milestones. Distinguish plans from completed work.", fields: [titleField, summaryField, { key: "phase", label: "Phase" }, { key: "stage", label: "Delivery status", type: "select", options: ["planned", "in-progress", "completed"] }, { key: "target_date", label: "Target date", type: "date" }, orderField] },
  objectives: { label: "Our objectives", description: "Edit and order CEDAH’s objectives, including market access, youth employment, food security and skills.", fields: [titleField, summaryField, orderField] },
};
const menu = [["overview", "Overview"], ["content", "Website content"], ...Object.entries(collections).map(([key, value]) => [key, value.label]), ["inbox", "Enquiries & applications"], ["media", "Media library"], ["settings", "Settings"]];
function str(value: unknown) { return value == null ? "" : String(value); }
function errorText(error: unknown) { return error instanceof Error ? error.message : "The request failed. Please try again."; }
function published(item: RecordData, resource: string) { return resource === "impact-metrics" ? item.published === true : item.status === "published"; }
function itemTitle(item: RecordData) { return str(item.title || item.label || item.name || item.email || "Untitled record"); }
function dateLabel(value: unknown) { const date = new Date(str(value)); return Number.isNaN(date.getTime()) ? "Date not recorded" : date.toLocaleString("en-UG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
function editableRecord(input: RecordData, config: Collection) {
  const record = { ...input };
  for (const field of config.fields) {
    if (field.key in record && record[field.key] == null) record[field.key] = field.type === "checkbox" ? false : "";
  }
  return record;
}
async function request(path: string, options?: RequestInit): Promise<RecordData> {
  const response = await fetch(path, { cache: "no-store", ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || (response.status === 401 ? "Your session has expired. Sign in again to continue." : "Unable to complete the request."));
  if (data.configured === false) throw new Error("The database is not connected. Records cannot be loaded or saved yet.");
  return data;
}
function jsonRequest(method: string, body: RecordData): RequestInit { return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }; }
async function uploadAsset(file: File): Promise<RecordData> {
  if (file.size > 10 * 1024 * 1024) throw new Error("Choose a file smaller than 10 MB.");
  if (!["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4", "video/webm"].includes(file.type)) throw new Error("Choose a JPG, PNG, WebP, PDF, MP4 or WebM file.");
  const signed = await request("/api/admin/media", jsonRequest("POST", {}));
  if (!signed.signature || !signed.cloudName) throw new Error("Media uploads are not configured.");
  const form = new FormData();
  form.append("file", file); form.append("api_key", str(signed.apiKey)); form.append("timestamp", str(signed.timestamp)); form.append("signature", str(signed.signature)); form.append("folder", str(signed.folder));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(str(signed.cloudName))}/auto/upload`, { method: "POST", body: form });
  const asset = await response.json();
  if (!response.ok || !asset.secure_url) throw new Error(asset.error?.message || "Media upload failed.");
  try { await request("/api/admin/media", jsonRequest("POST", { asset })); }
  catch { throw new Error("The file uploaded but could not be added to the media library. Refresh the library before trying again."); }
  return asset;
}

export default function AdminDashboard({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [notice, setNotice] = useState<{ message: string; error: boolean } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const notify = useCallback<Notice>((message, error = false) => setNotice({ message, error }), []);
  function navigate(next: string) { setTab(next); setNotice(null); }
  async function logout() { setLoggingOut(true); try { await request("/api/auth/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); } catch (error) { notify(errorText(error), true); setLoggingOut(false); } }
  return <main className="ca-dashboard">
    <aside className="ca-sidebar"><Link className="ca-brand" href="/">CEDAH<span>Administration</span></Link><nav aria-label="Administration">{menu.map(([key, label]) => <button key={key} type="button" className={tab === key ? "is-active" : ""} aria-current={tab === key ? "page" : undefined} onClick={() => navigate(key)}>{label}</button>)}</nav><div className="ca-admin-profile"><strong>{name}</strong><span>Super administrator</span><small>{email}</small></div></aside>
    <section className="ca-workspace"><header className="ca-topbar"><div><span className="ca-kicker">CEDAH control centre</span><h1>{menu.find(([key]) => key === tab)?.[1]}</h1></div><div className="ca-topbar-actions"><ThemeToggle compact /><Link href="/" target="_blank">View website ↗</Link><button type="button" onClick={() => void logout()} disabled={loggingOut}>{loggingOut ? <><LoadingMark small /> Signing out…</> : "Sign out"}</button></div></header>
      <label className="ca-mobile-nav">Administration section<select value={tab} onChange={(event) => navigate(event.target.value)}>{menu.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <div className="ca-main">{notice && <div className={`ca-notice ${notice.error ? "is-error" : ""}`} role={notice.error ? "alert" : "status"}><span>{notice.message}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)}>×</button></div>}
        {tab === "overview" && <Overview navigate={navigate} />}
        {collections[tab] && <CollectionManager key={tab} resource={tab} config={collections[tab]} notify={notify} />}
        {tab === "content" && <WebsiteEditor notify={notify} />}
        {tab === "settings" && <Settings name={name} email={email} notify={notify} />}
        {tab === "inbox" && <Inbox notify={notify} />}
        {tab === "media" && <MediaLibrary notify={notify} />}
      </div>
    </section>
  </main>;
}
function Loading() { return <LoadingIndicator label="Loading your records" compact />; }
function ErrorPanel({ error, retry }: { error: string; retry: () => void }) { return <div className="ca-error" role="alert"><p>{error}</p><button type="button" onClick={retry}>Try again</button></div>; }

function Overview({ navigate }: { navigate: (key: string) => void }) {
  const [state, setState] = useState<{ counts: Record<string, number>; error: string; loading: boolean }>({ counts: {}, error: "", loading: true });
  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const results = await Promise.all(["news", "team", "documents", "impact-metrics"].map(async (key) => { const data = await request(`/api/admin/data/${key}`); return [key, (data.items as RecordData[] || []).filter((item) => published(item, key)).length] as const; }));
      const inbox = await request("/api/admin/submissions");
      setState({ counts: { ...Object.fromEntries(results), inbox: (inbox.items as RecordData[] || []).filter((item) => (item.status || "new") === "new").length }, loading: false, error: "" });
    } catch (error) { setState({ counts: {}, loading: false, error: errorText(error) }); }
  }, []);
  useEffect(() => { const timer = setTimeout(() => void refresh(), 0); return () => clearTimeout(timer); }, [refresh]);
  return <><div className="ca-intro"><div><h2>Your platform, in one place</h2><p>Publish credible information, maintain the board and team, and follow up on applications and enquiries.</p></div><button type="button" onClick={() => void refresh()} disabled={state.loading}>Refresh overview</button></div>
    {state.loading ? <Loading /> : state.error ? <ErrorPanel error={state.error} retry={() => void refresh()} /> : <div className="ca-stats">{[["inbox", "New enquiries"], ["documents", "Published documents"], ["team", "Published profiles"], ["impact-metrics", "Published metrics"], ["news", "Published updates"]].map(([key, label]) => <button key={key} type="button" onClick={() => navigate(key)}><span>{label}</span><strong>{state.counts[key] ?? 0}</strong><small>Open records ↗</small></button>)}</div>}
    <div className="ca-overview-grid"><article className="ca-panel"><span className="ca-kicker">Partner readiness</span><h2>Build the evidence behind the story</h2><p>Add approved due-diligence documents, board biographies and genuine field media. Report dated, sourced results and label future commitments as targets.</p><div className="ca-actions"><button type="button" onClick={() => navigate("documents")}>Manage data room</button><button type="button" onClick={() => navigate("team")}>Manage board</button></div></article><article className="ca-panel"><span className="ca-kicker">Operations</span><h2>Keep the network connected</h2><p>Farmer registrations, training applications, partner conversations, newsletter signups and buyer requests arrive in the same inbox.</p><div className="ca-actions"><button type="button" onClick={() => navigate("inbox")}>Open shared inbox</button><button type="button" onClick={() => navigate("market-prices")}>Update market prices</button></div></article></div>
    <p className="ca-help">Overview counts cover the first 500 records in each collection and the 500 most recent enquiries. Open a collection to see its full total and load older records. Draft records remain private; published records are available on the public website.</p>
  </>;
}

function CollectionManager({ resource, config, notify }: { resource: string; config: Collection; notify: Notice }) {
  const [items, setItems] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState<RecordData | null>(null);
  const [busy, setBusy] = useState("");
  const [total, setTotal] = useState(0);
  const recordKey = config.key || "slug";
  const refresh = useCallback(async () => { setLoading(true); setError(""); try { const data = await request(`/api/admin/data/${resource}`); setItems(data.items as RecordData[] || []); setTotal(Number(data.total || (data.items as RecordData[] || []).length)); } catch (error) { setError(errorText(error)); } finally { setLoading(false); } }, [resource]);
  useEffect(() => { const timer = setTimeout(() => void refresh(), 0); return () => clearTimeout(timer); }, [refresh]);
  async function save(record: RecordData) {
    const key = str(record[recordKey]); const next = editableRecord(record, config);
    if (key) next.original_key = key;
    else next[recordKey] = `${str(record.title || record.label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 65) || "record"}-${crypto.randomUUID().slice(0, 8)}`;
    await request(`/api/admin/data/${resource}`, jsonRequest("POST", { record: next }));
    setEditing(null); notify(`“${itemTitle(record)}” ${published(record, resource) ? "published" : "saved as draft"}. Updated ${dateLabel(new Date().toISOString())}.`); await refresh();
  }
  async function toggle(item: RecordData) {
    const key = str(item[recordKey]); setBusy(key); const isPublished = published(item, resource);
    try { const record = { ...editableRecord(item, config), original_key: key, ...(resource === "impact-metrics" ? { published: !isPublished } : { status: isPublished ? "draft" : "published" }) }; await request(`/api/admin/data/${resource}`, jsonRequest("POST", { record })); notify(isPublished ? "Record moved to draft." : "Record published."); await refresh(); }
    catch (error) { notify(errorText(error), true); } finally { setBusy(""); }
  }
  async function remove(item: RecordData) {
    if (!window.confirm(`Delete “${itemTitle(item)}”? This removes it from the website and cannot be undone.`)) return;
    const key = str(item[recordKey]); setBusy(key);
    try { await request(`/api/admin/data/${resource}`, jsonRequest("DELETE", { key })); notify("Record deleted."); await refresh(); }
    catch (error) { notify(errorText(error), true); } finally { setBusy(""); }
  }
  async function loadMore() { setLoading(true); try { const data = await request(`/api/admin/data/${resource}?offset=${items.length}`); setItems((current) => [...current, ...(data.items as RecordData[] || [])]); } catch (error) { notify(errorText(error), true); } finally { setLoading(false); } }
  const shown = items.filter((item) => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()) && (filter === "all" || (filter === "published") === published(item, resource)));
  if (editing) return <RecordEditor resource={resource} config={config} initial={editing} save={save} close={() => setEditing(null)} />;
  return <><div className="ca-intro"><p>{config.description}</p><button type="button" className="ca-primary" onClick={() => setEditing(resource === "impact-metrics" ? { kind: "actual", published: false } : { status: "draft" })}>+ Add record</button></div>
    <div className="ca-toolbar"><label>Search<input type="search" placeholder="Find a record…" value={search} onChange={(event) => setSearch(event.target.value)} /></label><label>Visibility<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All records</option><option value="published">Published</option><option value="draft">Draft / unpublished</option></select></label><button type="button" disabled={loading} onClick={() => void refresh()}>Refresh</button></div>
    {loading ? <Loading /> : error ? <ErrorPanel error={error} retry={() => void refresh()} /> : shown.length ? <div className="ca-record-list">{shown.map((item) => <article className="ca-record" key={str(item[recordKey])}><div className="ca-record-content"><div className="ca-record-meta"><span className={`ca-badge ${published(item, resource) ? "is-published" : ""}`}>{published(item, resource) ? "Published" : "Draft"}</span>{Boolean(item.kind || item.category || item.phase) && <span>{str(item.kind || item.category || item.phase)}</span>}{item.sort_order != null && <span>Order {str(item.sort_order)}</span>}</div><h3>{itemTitle(item)}</h3><p>{str(item.summary || item.excerpt || item.role || (item.value != null ? `${item.value} ${item.unit || ""}` : ""))}</p><small>Updated {dateLabel(item.updated_at || item.created_at)}</small></div><div className="ca-record-actions"><button type="button" onClick={() => setEditing(item)} disabled={!!busy}>Edit</button><button type="button" onClick={() => void toggle(item)} disabled={!!busy}>{busy === str(item[recordKey]) ? "Working…" : published(item, resource) ? "Unpublish" : "Publish"}</button><button type="button" className="ca-danger" onClick={() => void remove(item)} disabled={!!busy}>Delete</button></div></article>)}</div> : <div className="ca-empty"><h2>{items.length ? "No matching records" : "No records yet"}</h2><p>{items.length ? "Try another search or visibility filter." : "Add a record, review the content and publish when it is ready."}</p></div>}
    {!loading && !error && <p className="ca-help">{shown.length} matching records among {items.length} loaded of {total} total. Search and filters apply to loaded records.</p>}{items.length < total && <button type="button" disabled={loading} onClick={() => void loadMore()}>Load more records</button>}
  </>;
}

function EditorField({ field, value, change, disabled }: { field: Field; value: unknown; change: (value: unknown) => void; disabled?: boolean }) {
  const [uploading, setUploading] = useState(false); const [error, setError] = useState("");
  async function upload(file?: File) { if (!file) return; setUploading(true); setError(""); try { const asset = await uploadAsset(file); change(asset.secure_url); } catch (error) { setError(errorText(error)); } finally { setUploading(false); } }
  const id = `ca-field-${field.key}`;
  if (field.type === "checkbox") return <label className="ca-checkbox ca-field-wide"><input type="checkbox" checked={value === true} onChange={(event) => change(event.target.checked)} disabled={disabled} />{field.label}</label>;
  return <div data-uploading={uploading} className={`ca-field ${field.type === "textarea" || field.upload ? "ca-field-wide" : ""}`}><label htmlFor={id}>{field.label}{field.required ? " *" : ""}</label>
    {field.type === "textarea" ? <textarea id={id} value={str(value)} onChange={(event) => change(event.target.value)} required={field.required} disabled={disabled} rows={5} maxLength={20000} /> : field.type === "select" ? <select id={id} value={str(value)} onChange={(event) => change(event.target.value)} required={field.required} disabled={disabled}><option value="">Select…</option>{str(value) && !field.options?.includes(str(value)) && <option value={str(value)}>{str(value)}</option>}{field.options?.map((option) => <option key={option} value={option}>{option.replaceAll("-", " ")}</option>)}</select> : <input id={id} type={field.type === "url" ? "text" : field.type || "text"} inputMode={field.type === "url" ? "url" : undefined} value={field.type === "date" ? str(value).slice(0, 10) : str(value)} onChange={(event) => change(event.target.value)} min={field.min} max={field.max} step={field.type === "number" ? "any" : undefined} required={field.required} disabled={disabled || uploading} maxLength={field.type === "url" ? 2048 : 500} />}
    {field.hint && <small>{field.hint}</small>}{field.upload && <div className="ca-upload-field"><label className="ca-upload-button">{uploading ? <><LoadingMark small /> Uploading…</> : "Upload file"}<input type="file" disabled={disabled || uploading} accept={field.upload === "document" ? "application/pdf" : field.upload === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"} onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} /></label>{str(value) && <button type="button" disabled={disabled || uploading} onClick={() => change("")}>Remove {field.upload === "image" ? "image" : "file"}</button>}<small>Up to 10 MB. Save the record to apply image or file changes.</small></div>}
    {field.upload === "image" && isSafeUrl(str(value)) && <div className="ca-image-preview"><Image src={str(value)} alt={`${field.label} preview`} width={640} height={360} unoptimized /><span>Current image preview</span></div>}
    {field.upload && field.upload !== "image" && isSafeUrl(str(value)) && <a href={str(value)} target="_blank" rel="noopener noreferrer" className="ca-file-preview">Open current {field.upload === "video" ? "video" : "document"} ↗</a>}
    {error && <p className="ca-field-error" role="alert">{error}</p>}
  </div>;
}
function RecordEditor({ resource, config, initial, save, close }: { resource: string; config: Collection; initial: RecordData; save: (record: RecordData) => Promise<void>; close: () => void }) {
  const [record, setRecord] = useState<RecordData>(() => editableRecord(initial, config)); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const title = initial[config.key || "slug"] ? `Edit ${itemTitle(initial)}` : `New ${config.label.toLowerCase()} record`;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (event.currentTarget.querySelector('[data-uploading="true"]')) { setError("Wait for the file upload to finish before saving."); return; }
    const next = editableRecord(record, config);
    for (const field of config.fields) if (field.type === "number" && next[field.key] !== undefined) next[field.key] = str(next[field.key]).trim() === "" ? "" : Number(next[field.key]);
    if (resource === "impact-metrics" && next.published && next.kind === "actual" && (!next.measured_at || !str(next.source).trim())) { setError("Published actual results need a reporting date and evidence source."); return; }
    const identity = config.key || "slug";
    if (!next[identity]) {
      next[identity] = `${str(next.title || next.label).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 65) || "record"}-${crypto.randomUUID().slice(0, 8)}`;
      setRecord(next);
    }
    setSaving(true); try { await save(next); } catch (error) { setError(errorText(error)); } finally { setSaving(false); }
  }
  return <form className="ca-panel ca-editor" onSubmit={submit}><div className="ca-intro"><div><span className="ca-kicker">{config.label}</span><h2>{title}</h2></div><button type="button" onClick={close} disabled={saving}>Back to records</button></div><p>{config.description}</p>{error && <p className="ca-error" role="alert">{error}</p>}<div className="ca-form-grid">{config.fields.map((field) => <EditorField key={field.key} field={{ ...field, required: field.required && (published(record, resource) || ["title", "label", "value", "kind", "media_type"].includes(field.key)) }} value={record[field.key]} change={(value) => setRecord((current) => ({ ...current, [field.key]: value }))} disabled={saving} />)}</div><div className="ca-form-footer"><label className="ca-checkbox"><input type="checkbox" checked={published(record, resource)} disabled={saving} onChange={(event) => setRecord({ ...record, ...(resource === "impact-metrics" ? { published: event.target.checked } : { status: event.target.checked ? "published" : "draft" }) })} />Publish on the public website</label><div className="ca-actions"><button type="button" onClick={close} disabled={saving}>Cancel</button><button className="ca-primary" type="submit" disabled={saving}>{saving ? <><LoadingMark small /> Saving…</> : published(record, resource) ? "Save & publish" : "Save draft"}</button></div></div></form>;
}

const contentSections: Record<string, { label: string; fields: Field[]; defaults: RecordData }> = {
  "hero-section": { label: "Homepage introduction", fields: [{ key: "eyebrow", label: "Introductory label" }, titleField, { key: "description", label: "Description", type: "textarea" }, { key: "buttonLabel", label: "Button label" }, { key: "buttonLink", label: "Button destination", hint: "Use a section link such as #enterprises, a local path or an HTTPS URL." }, imageField], defaults: { eyebrow: "Uganda’s integrated agribusiness", title: "From fertile ground to lasting value.", description: "We build connected agricultural enterprises that create quality food, dependable markets, skilled jobs and shared prosperity.", buttonLabel: "Explore our enterprises", buttonLink: "#enterprises" } },
  "about-cedah": { label: "About, mission & vision", fields: [titleField, { key: "description", label: "Introduction", type: "textarea" }, { key: "body", label: "More about CEDAH", type: "textarea" }, { key: "vision", label: "Vision", type: "textarea" }, { key: "mission", label: "Mission", type: "textarea" }], defaults: { title: "Enterprise with a greater purpose.", description: "Capital Economic Development Alliance Holdings Ltd. is a Ugandan enterprise creating a connected future for agriculture, industry and communities.", body: "We bring production, processing, skills and market access into one practical model, building businesses that grow profitably while expanding opportunity for farmers, young people and local economies.", vision: "To become a leading East African industrial agribusiness group.", mission: "To produce quality, create work and grow community prosperity." } },
};
function WebsiteEditor({ notify }: { notify: Notice }) {
  const [section, setSection] = useState("hero-section");
  return <><div className="ca-intro"><p>Update homepage copy and images. Resource sections have dedicated editors in the administration menu.</p></div><label className="ca-section-picker">Website section<select value={section} onChange={(event) => setSection(event.target.value)}>{Object.entries(contentSections).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}</select></label><ContentForm key={section} section={section} label={contentSections[section].label} fields={contentSections[section].fields} defaults={contentSections[section].defaults} notify={notify} /></>;
}
function ContentForm({ section, label, fields, defaults, notify }: { section: string; label: string; fields: Field[]; defaults: RecordData; notify: Notice }) {
  const [content, setContent] = useState<RecordData>({}); const [isPublished, setPublished] = useState(true); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  const refresh = useCallback(async () => { setLoading(true); setError(""); try { const data = await request(`/api/admin/content?section=${encodeURIComponent(section)}`); setContent({ ...defaults, ...(data.content as RecordData || {}) }); setPublished(data.content ? Boolean(data.published) : true); } catch (error) { setError(errorText(error)); } finally { setLoading(false); } }, [section, defaults]);
  useEffect(() => { const timer = setTimeout(() => void refresh(), 0); return () => clearTimeout(timer); }, [refresh]);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); if (event.currentTarget.querySelector('[data-uploading="true"]')) { setError("Wait for the file upload to finish before saving."); return; } setSaving(true); try { await request("/api/admin/content", jsonRequest("POST", { section, content, published: isPublished })); notify(isPublished ? "Website content published." : "Website content saved as draft. The website uses its default content until this section is published."); } catch (error) { setError(errorText(error)); } finally { setSaving(false); } }
  if (loading) return <Loading />;
  if (error && !Object.keys(content).length) return <ErrorPanel error={error} retry={() => void refresh()} />;
  return <form className="ca-panel ca-editor" onSubmit={submit}><h2>{label}</h2>{error && <p className="ca-error" role="alert">{error}</p>}<div className="ca-form-grid">{fields.map((field) => <EditorField key={field.key} field={field} value={content[field.key]} change={(value) => setContent((current) => ({ ...current, [field.key]: value }))} disabled={saving} />)}</div><div className="ca-form-footer"><label className="ca-checkbox"><input type="checkbox" checked={isPublished} onChange={(event) => setPublished(event.target.checked)} disabled={saving} />Publish this section</label><button className="ca-primary" type="submit" disabled={saving}>{saving ? <><LoadingMark small /> Saving…</> : isPublished ? "Save & publish" : "Save draft"}</button></div><p className="ca-help">Unpublished sections fall back to the website’s default copy and settings.</p></form>;
}
const settingsFields: Field[] = [{ key: "legalName", label: "Legal company name", required: true }, { key: "publicEmail", label: "Public contact email", type: "email", required: true }, { key: "phone", label: "Public phone number" }, { key: "whatsapp", label: "WhatsApp number", hint: "Include the country code, for example +256769758805." }, { key: "location", label: "Office location" }, { key: "timezone", label: "Timezone" }];
function Settings({ name, email, notify }: { name: string; email: string; notify: Notice }) { return <><ContentForm section="organisation-settings" label="Organisation & public contact details" fields={settingsFields} defaults={DEFAULT_SITE_SETTINGS} notify={notify} /><article className="ca-panel ca-account"><h2>Administrator account</h2><p><strong>{name}</strong><br />{email}</p><p>Super administrator access covers every content collection, application, enquiry and public setting in this dashboard. Sign-in credentials are managed securely in the deployment configuration.</p></article></>; }

const inboxKinds = ["contact", "farmer", "training", "newsletter", "buyer"];
function submissionId(item: RecordData) { return str(item.id || item._id); }
function exportRows(items: RecordData[]) {
  const columns = ["id", "kind", "name", "email", "phone", "interest", "message", "location", "crop", "quantity", "interests", "language", "product", "consent", "consent_at", "notification_status", "status", "notes", "created_at", "details"];
  const cell = (value: unknown) => { const raw = typeof value === "object" && value !== null ? JSON.stringify(value) : str(value); const safe = /^[\s]*[=+\-@]/.test(raw) ? `'${raw}` : raw; return `"${safe.replaceAll('"', '""')}"`; };
  const csv = [columns, ...items.map((item) => columns.map((column) => column === "id" ? submissionId(item) : item[column]))].map((row) => row.map(cell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `cedah-inbox-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(url);
}
function Inbox({ notify }: { notify: Notice }) {
  const [items, setItems] = useState<RecordData[]>([]); const [selected, setSelected] = useState<RecordData | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [search, setSearch] = useState(""); const [kind, setKind] = useState("all"); const [status, setStatus] = useState("all"); const [total, setTotal] = useState(0);
  const refresh = useCallback(async () => { setLoading(true); setError(""); try { const data = await request("/api/admin/submissions?limit=500"); setItems(data.items as RecordData[] || []); setTotal(Number(data.total || (data.items as RecordData[] || []).length)); } catch (error) { setError(errorText(error)); } finally { setLoading(false); } }, []);
  useEffect(() => { const timer = setTimeout(() => void refresh(), 0); return () => clearTimeout(timer); }, [refresh]);
  const shown = items.filter((item) => (kind === "all" || (item.kind || "contact") === kind) && (status === "all" || (item.status || "new") === status) && JSON.stringify(item).toLowerCase().includes(search.toLowerCase()));
  async function save(item: RecordData, nextStatus: string, notes: string) { await request("/api/admin/submissions", jsonRequest("PATCH", { id: submissionId(item), status: nextStatus, notes })); const updated = { ...item, status: nextStatus, notes, ...(nextStatus === "unsubscribed" ? { consent: false } : {}) }; setItems((current) => current.map((row) => submissionId(row) === submissionId(item) ? updated : row)); setSelected(updated); notify("Enquiry updated."); }
  async function loadMore() { setLoading(true); try { const data = await request(`/api/admin/submissions?limit=500&offset=${items.length}`); setItems((current) => [...current, ...(data.items as RecordData[] || [])]); } catch (error) { notify(errorText(error), true); } finally { setLoading(false); } }
  return <><div className="ca-intro"><p>Track partner enquiries, producer registrations, training applications, subscribers and buyer requests. Follow-up notes remain private.</p><div className="ca-actions"><button type="button" onClick={() => void refresh()} disabled={loading}>Refresh</button><button type="button" onClick={() => exportRows(shown)} disabled={!shown.length || loading}>Export filtered CSV</button></div></div><div className="ca-toolbar"><label>Search<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, phone, location…" /></label><label>Type<select value={kind} onChange={(event) => setKind(event.target.value)}><option value="all">All types</option>{inboxKinds.map((value) => <option key={value}>{value}</option>)}</select></label><label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{SUBMISSION_STATUSES.map((value) => <option key={value}>{value}</option>)}</select></label></div>
    {loading ? <Loading /> : error ? <ErrorPanel error={error} retry={() => void refresh()} /> : <div className="ca-inbox"><div className="ca-inbox-list">{shown.length ? shown.map((item) => <button type="button" className={`ca-enquiry ${selected && submissionId(selected) === submissionId(item) ? "is-active" : ""}`} key={submissionId(item)} onClick={() => { setSelected(item); window.setTimeout(() => document.getElementById("ca-inbox-detail")?.scrollIntoView({ block: "nearest" }), 0); }}><span className="ca-record-meta"><span className="ca-badge">{str(item.kind || "contact")}</span><span>{str(item.status || "new")}</span></span><strong>{itemTitle(item)}</strong><span>{str(item.interest || item.email || item.phone)}</span><p>{str(item.message)}</p><small>{dateLabel(item.created_at)}</small></button>) : <div className="ca-empty"><h2>{items.length ? "No matching enquiries" : "Your inbox is empty"}</h2><p>Website submissions appear here as they arrive.</p></div>}</div><div className="ca-inbox-detail" id="ca-inbox-detail">{selected ? <SubmissionEditor key={submissionId(selected)} item={selected} save={save} close={() => setSelected(null)} /> : <div className="ca-empty"><h2>Select an enquiry</h2><p>Review its details, add follow-up notes and update its status.</p></div>}</div></div>}
    <p className="ca-help">{shown.length} matching enquiries among {items.length} loaded of {total} total. Refresh to check for new submissions. CSV exports contain contact information; share them only with authorised colleagues.</p>{items.length < total && <button type="button" disabled={loading} onClick={() => void loadMore()}>Load older enquiries</button>}
  </>;
}
function SubmissionEditor({ item, save, close }: { item: RecordData; save: (item: RecordData, status: string, notes: string) => Promise<void>; close: () => void }) {
  const [status, setStatus] = useState(str(item.status || "new")); const [notes, setNotes] = useState(str(item.notes)); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); setError(""); try { await save(item, status, notes); } catch (error) { setError(errorText(error)); } finally { setSaving(false); } }
  const details = { ...Object.fromEntries(["location", "crop", "quantity", "interests", "language", "product", "consent", "consent_at", "notification_status"].filter((key) => item[key] !== undefined).map((key) => [key, item[key]])), ...(item.details && typeof item.details === "object" ? item.details as RecordData : {}) };
  const availableStatuses = SUBMISSION_STATUSES.filter((value) => item.status === "unsubscribed" ? value === "unsubscribed" : value !== "unsubscribed" || item.kind === "newsletter");
  return <form onSubmit={submit} className="ca-submission"><div className="ca-intro"><h2>{itemTitle(item)}</h2><button type="button" onClick={close} disabled={saving}>Close</button></div><p>{dateLabel(item.created_at)} · {str(item.kind || "contact")}</p><dl><dt>Email</dt><dd>{item.email ? <a href={`mailto:${str(item.email)}`}>{str(item.email)}</a> : "Not provided"}</dd><dt>Phone</dt><dd>{item.phone ? <a href={`tel:${str(item.phone).replace(/[^+\d]/g, "")}`}>{str(item.phone)}</a> : "Not provided"}</dd>{Boolean(item.interest) && <><dt>Interest</dt><dd>{str(item.interest)}</dd></>}{Object.entries(details).map(([key, value]) => <div key={key}><dt>{key.replaceAll("_", " ")}</dt><dd>{typeof value === "object" ? JSON.stringify(value) : str(value)}</dd></div>)}</dl>{Boolean(item.message) && <blockquote>{str(item.message)}</blockquote>}<label>Status<select value={status} onChange={(event) => setStatus(event.target.value)} disabled={saving || item.status === "unsubscribed"}>{availableStatuses.map((value) => <option key={value}>{value}</option>)}</select></label><label>Private follow-up notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={6} maxLength={5000} disabled={saving} /></label>{error && <p className="ca-error" role="alert">{error}</p>}<button type="submit" className="ca-primary" disabled={saving}>{saving ? <><LoadingMark small /> Saving…</> : "Save follow-up"}</button></form>;
}
function MediaLibrary({ notify }: { notify: Notice }) {
  const input = useRef<HTMLInputElement>(null); const [items, setItems] = useState<RecordData[]>([]); const [loading, setLoading] = useState(true); const [uploading, setUploading] = useState(false); const [error, setError] = useState("");
  const [editing, setEditing] = useState(""); const [filename, setFilename] = useState(""); const [working, setWorking] = useState("");
  const refresh = useCallback(async () => { setLoading(true); setError(""); try { const data = await request("/api/admin/media"); setItems(data.items as RecordData[] || []); } catch (error) { setError(errorText(error)); } finally { setLoading(false); } }, []);
  useEffect(() => { const timer = setTimeout(() => void refresh(), 0); return () => clearTimeout(timer); }, [refresh]);
  async function upload(file?: File) { if (!file) return; setUploading(true); try { await uploadAsset(file); notify("File uploaded to the media library."); await refresh(); } catch (error) { notify(errorText(error), true); } finally { setUploading(false); } }
  async function copy(url: string) { try { await navigator.clipboard.writeText(url); notify("File URL copied."); } catch { notify("The browser could not copy the URL. Open the file and copy its address.", true); } }
  async function rename(event: React.FormEvent<HTMLFormElement>, item: RecordData) {
    event.preventDefault(); setWorking(str(item.public_id));
    try { await request("/api/admin/media", jsonRequest("PATCH", { public_id: item.public_id, original_filename: filename.trim() })); setEditing(""); notify("Media name updated."); await refresh(); }
    catch (error) { notify(errorText(error), true); } finally { setWorking(""); }
  }
  async function remove(item: RecordData) {
    if (!window.confirm(`Delete “${str(item.original_filename || item.public_id)}” permanently? Files used by website records must be removed from those records first.`)) return;
    setWorking(str(item.public_id));
    try { await request("/api/admin/media", jsonRequest("DELETE", { public_id: item.public_id })); notify("Media file deleted."); await refresh(); }
    catch (error) { notify(errorText(error), true); } finally { setWorking(""); }
  }
  return <><div className="ca-intro"><p>Upload approved field images, portraits, reports and videos. Copy a URL into an editor, or upload directly while editing a record.</p><div className="ca-actions"><button type="button" onClick={() => void refresh()} disabled={loading}>Refresh</button><button type="button" className="ca-primary" onClick={() => input.current?.click()} disabled={uploading}>{uploading ? <><LoadingMark small /> Uploading…</> : "+ Upload file"}</button></div><input type="file" ref={input} hidden accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4,video/webm" onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} /></div><p className="ca-help">JPG, PNG, WebP, PDF, MP4 or WebM. Maximum file size: 10 MB.</p>{loading ? <Loading /> : error ? <ErrorPanel error={error} retry={() => void refresh()} /> : items.length ? <div className="ca-media-grid">{items.map((item) => <article className="ca-media-card" key={str(item.public_id)}><div className="ca-media-preview">{item.resource_type === "image" && item.format !== "pdf" ? <span style={{ backgroundImage: `url(${JSON.stringify(str(item.secure_url))})` }} role="img" aria-label={str(item.original_filename || "Uploaded image")} /> : <strong>{str(item.format || item.resource_type || "FILE").toUpperCase()}</strong>}</div><div><h3>{str(item.original_filename || item.public_id)}</h3><small>{item.bytes ? `${(Number(item.bytes) / 1024).toFixed(0)} KB · ` : ""}{dateLabel(item.created_at)}</small><div className="ca-actions"><a href={str(item.secure_url)} target="_blank" rel="noreferrer">Open file ↗</a><button type="button" onClick={() => void copy(str(item.secure_url))}>Copy URL</button><button type="button" disabled={!!working} onClick={() => { setEditing(str(item.public_id)); setFilename(str(item.original_filename)); }}>Rename</button><button type="button" className="ca-danger" disabled={!!working} onClick={() => void remove(item)}>{working === str(item.public_id) ? "Working…" : "Delete"}</button></div>{editing === str(item.public_id) && <form className="ca-media-rename" onSubmit={(event) => void rename(event, item)}><label>File display name<input value={filename} onChange={(event) => setFilename(event.target.value)} required maxLength={200} disabled={!!working} /></label><div className="ca-actions"><button type="button" disabled={!!working} onClick={() => setEditing("")}>Cancel</button><button type="submit" className="ca-primary" disabled={!!working || !filename.trim()}>{working ? <><LoadingMark small /> Saving…</> : "Save name"}</button></div></form>}</div></article>)}</div> : <div className="ca-empty"><h2>No media uploaded yet</h2><p>Add genuine field photographs, approved portraits and public documents.</p></div>}</>;
}
