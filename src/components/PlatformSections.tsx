import Image from "next/image";
import { getPublicRecords } from "@/lib/content";
import { DEFAULT_OBJECTIVES, DEFAULT_IMPACT_TARGET, DEFAULT_ROADMAP, isSafeUrl } from "@/lib/platform";
import ParticipationForm, { NewsletterForm, ParticipationLink } from "@/components/ParticipationForm";
import Reveal from "@/components/Reveal";
import SiteMap, { PublicSite } from "@/components/SiteMap";
import "@/app/platform.css";

type Row = Record<string, unknown>;
const str = (row: Row, key: string, fallback = "") => String(row[key] ?? fallback);
// Evaluate freshness on the server when this dynamic page is requested.
const requestTime = () => Date.now();
const date = (value: unknown) => {
  if (!value) return "Date to be confirmed";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.valueOf()) ? "Date to be confirmed" : parsed.toLocaleDateString("en-UG", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
};
const safeUrl = (value: unknown) => typeof value === "string" && isSafeUrl(value) ? value : "";

function Section({ id, eyebrow, title, description, children, soft = false }: { id: string; eyebrow: string; title: string; description?: string; children: React.ReactNode; soft?: boolean }) {
  return <section className={`platform-section section${soft ? " platform-soft" : ""}`} id={id}><div className="shell"><Reveal className="platform-heading"><div className="eyebrow"><span />{eyebrow}</div><h2>{title}</h2>{description && <p>{description}</p>}</Reveal><Reveal className="platform-content">{children}</Reveal></div></section>;
}
function Empty({ children }: { children: React.ReactNode }) { return <div className="platform-empty"><span aria-hidden="true">○</span><p>{children}</p></div>; }
function Photo({ src, alt }: { src: string; alt: string }) { return <Image src={src} alt={alt} width={800} height={600} sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw" unoptimized loading="lazy" className="platform-photo" />; }

export async function ObjectivesSection() {
  const objectives = await getPublicRecords("objectives", DEFAULT_OBJECTIVES);
  return <Section id="objectives" eyebrow="Our objectives" title="A practical purpose. A shared ambition." description="CEDAH connects production, processing, skills and market access into one working model. These objectives guide our development and the partnerships we build.">
    <div className="objectives-grid">{objectives.map((item, index) => <article className="objective-card" key={str(item, "slug", String(index))}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{str(item, "title")}</h3><p>{str(item, "summary")}</p></div></article>)}</div>
  </Section>;
}

export async function ImpactDashboard() {
  const metrics = await getPublicRecords("impact-metrics", [DEFAULT_IMPACT_TARGET]);
  const actuals = metrics.filter((item) => item.kind === "actual");
  const targets = metrics.filter((item) => item.kind === "target");
  return <Section id="impact-dashboard" eyebrow="Impact & accountability" title="Track the work. See the progress." description="Reported results are published with their measurement date and source. Ambitions are shown separately so you can distinguish progress from plans." soft>
    <div className="platform-grid metrics-grid">{actuals.length ? actuals.map((item) => <article className="platform-card metric-card" key={str(item, "metric_key")}><span className="platform-badge">Reported result</span><strong>{str(item, "value")} <small>{str(item, "unit")}</small></strong><h3>{str(item, "label")}</h3><p>Measured: {date(item.measured_at)}</p><p className="platform-muted">Source: {str(item, "source", "CEDAH reporting")}</p></article>) : ["Jobs created", "Farmers onboarded", "Tonnes processed", "Hectares under production"].map((label) => <article className="platform-card metric-card" key={label}><span className="platform-badge">Awaiting reported data</span><strong aria-label="Not yet reported">—</strong><h3>{label}</h3><p>No verified result published yet.</p></article>)}</div>
    {targets.length > 0 && <div className="target-band"><div><span className="platform-badge">Our ambitions</span><h3>Targets for phased development</h3></div><div>{targets.map((item) => <div key={str(item, "metric_key")}><p><strong>{str(item, "value")} {str(item, "unit")}</strong> {str(item, "label")}</p><p>{str(item, "summary")}</p><small>{str(item, "source")}</small></div>)}</div></div>}
  </Section>;
}

export async function TrustSections() {
  const [documents, team, stories] = await Promise.all([getPublicRecords("documents"), getPublicRecords("team"), getPublicRecords("field-stories")]);
  return <>
    <Section id="data-room" eyebrow="Partner data room" title="The detail behind the ambition." description="Access approved documents for partnership review and due diligence. Each published file includes its version or reporting date.">
      {documents.length ? <div className="platform-grid">{documents.map((item) => { const url = safeUrl(item.file_url); return <article className="platform-card document-card" key={str(item, "slug")}><span className="platform-badge">{str(item, "category", "Partner document")}</span><h3>{str(item, "title")}</h3><p>{str(item, "summary")}</p><small>{str(item, "version")}{item.published_at ? ` · ${date(item.published_at)}` : ""}</small>{url ? <a className="platform-link" href={url} target="_blank" rel="noopener noreferrer" download>Open / download document ↗</a> : <span className="platform-muted">Document not available yet</span>}</article>; })}</div> : <><div className="document-checklist">{["Concept note", "Phased budget", "Risk register", "Impact framework", "Governance profile"].map((title) => <div key={title}><strong>{title}</strong><span>Awaiting publication</span></div>)}</div><p className="platform-footnote">Approved files will appear here when available. <a href="#contact">Request due-diligence information ↗</a></p></>}
    </Section>
    <Section id="leadership" eyebrow="People & governance" title="Accountable leadership." description="Meet the people responsible for CEDAH’s direction, oversight and delivery." soft>
      {team.length ? ["board", "leadership", "partner"].map((kind) => { const members = team.filter((item) => (item.kind || "leadership") === kind); return members.length ? <div className="team-group" key={kind}><h3>{kind === "board" ? "Board of Governors" : kind === "leadership" ? "Leadership team" : "Strategic partners"}</h3><div className="platform-grid">{members.map((item) => <article className="platform-card person-card" key={str(item, "slug")}>{safeUrl(item.image_url) ? <Photo src={safeUrl(item.image_url)} alt={str(item, "title")} /> : <div className="person-initial" aria-hidden="true">{str(item, "title").charAt(0)}</div>}<div className="person-copy"><span className="platform-badge">{str(item, "role", kind === "board" ? "Governor" : "Team member")}</span><h3>{str(item, "title")}</h3>{!!item.organisation && <small>{str(item, "organisation")}</small>}<p>{str(item, "summary")}</p>{safeUrl(item.website_url) && <a className="platform-link" href={safeUrl(item.website_url)} target="_blank" rel="noopener noreferrer">View profile ↗</a>}</div></article>)}</div></div> : null; }) : <Empty>Board of Governors and leadership profiles are being prepared for publication. Please contact us for governance information.</Empty>}
    </Section>
    <Section id="field-work" eyebrow="From the field" title="Evidence of the work." description="CEDAH field records, with the location, date and context behind each published photograph or video.">
      {stories.length ? <div className="platform-grid">{stories.map((item) => <article className="platform-card field-card" key={str(item, "slug")}>{safeUrl(item.image_url) && <Photo src={safeUrl(item.image_url)} alt={str(item, "caption", str(item, "title"))} />}<div className="person-copy"><span className="platform-badge">{str(item, "location", "Field update")}</span><h3>{str(item, "title")}</h3><p>{str(item, "summary")}</p><small>{date(item.captured_at)}{item.credit ? ` · ${str(item, "credit")}` : ""}</small>{safeUrl(item.video_url) && <a className="platform-link" href={safeUrl(item.video_url)} target="_blank" rel="noopener noreferrer">Watch field video ↗</a>}</div></article>)}</div> : <Empty>Documented field photographs and videos will be published here as they become available. Illustrative images elsewhere on this site are not evidence of CEDAH operations.</Empty>}
    </Section>
  </>;
}

export async function ParticipationSections() {
  const renderedAt = requestTime();
  const [opportunities, prices, products, siteRows] = await Promise.all([getPublicRecords("opportunities"), getPublicRecords("market-prices"), getPublicRecords("products"), getPublicRecords("sites")]);
  const sites: PublicSite[] = siteRows.filter((item) => typeof item.latitude === "number" && typeof item.longitude === "number" && Math.abs(item.latitude) <= 90 && Math.abs(item.longitude) <= 180).map((item) => ({ slug: str(item, "slug"), title: str(item, "title"), location: str(item, "location"), summary: str(item, "summary"), latitude: Number(item.latitude), longitude: Number(item.longitude), stage: str(item, "stage"), image: safeUrl(item.image_url) }));
  return <>
    <Section id="opportunities" eyebrow="Open opportunities" title="Build with CEDAH." description="Explore published funding, supply, training and partnership opportunities." soft>
      {opportunities.length ? <div className="platform-grid">{opportunities.map((item) => <article className="platform-card" key={str(item, "slug")}>{safeUrl(item.image_url) && <Photo src={safeUrl(item.image_url)} alt={str(item, "title")} />}<span className="platform-badge">{str(item, "opportunity_type", "Partnership")}</span><h3>{str(item, "title")}</h3><p>{str(item, "summary")}</p>{item.target_amount !== undefined && item.target_amount !== "" && <p>Funding target: {str(item, "currency")} {str(item, "target_amount")}</p>}{!!item.deadline && <small>Deadline: {date(item.deadline)}</small>}{safeUrl(item.document_url) && <a className="platform-link" href={safeUrl(item.document_url)} target="_blank" rel="noopener noreferrer">Read the brief ↗</a>}<a className="platform-link" href="#contact">Discuss this opportunity ↗</a></article>)}</div> : <Empty>No specific vacancies or funding calls are published yet. You can register your interest below for future opportunities.</Empty>}
    </Section>
    <Section id="participate" eyebrow="Farmers, young people & buyers" title="Your next step starts here." description="Tell us what you grow, the skills you want to build, or the products you need. Choose English, Luganda or Kiswahili for the registration form."><ParticipationForm /></Section>
    <Section id="market-prices" eyebrow="Market information" title="Make informed supply decisions." description="Dated reference prices for published markets and grades. Prices are indicative; the team will confirm any offer, quality requirements and delivery terms." soft>
      {prices.length ? <div className="platform-grid">{prices.map((item) => { const measured = new Date(str(item, "observed_at")); const stale = !Number.isFinite(measured.valueOf()) || renderedAt - measured.valueOf() > 7 * 86400000; return <article className="platform-card price-card" key={str(item, "slug")}><span className="platform-badge">{str(item, "market", str(item, "location", "Market reference"))}</span><h3>{str(item, "title", str(item, "crop"))}</h3><strong>{str(item, "currency", "UGX")} {str(item, "price")}<small> / {str(item, "unit", "kg")}</small></strong><p>{str(item, "summary")}</p><small>Observed: {date(item.observed_at)}</small><p className="platform-muted">Source: {str(item, "source")}</p>{stale && <p className="price-stale">Older than 7 days or undated. Confirm the latest price.</p>}</article>; })}</div> : <Empty>No verified market prices have been published yet. Contact the team for current buying requirements.</Empty>}
    </Section>
    <Section id="products" eyebrow="Products & buyer enquiries" title="Connect supply with demand." description="Explore published products and request availability, specifications and delivery terms. Orders are confirmed directly by the CEDAH team.">
      {products.length ? <div className="platform-grid">{products.map((item) => <article className="platform-card product-card" key={str(item, "slug")}>{safeUrl(item.image_url) && <Photo src={safeUrl(item.image_url)} alt={str(item, "title")} />}<div className="person-copy"><span className="platform-badge">{str(item, "availability", "Enquire for availability")}</span><h3>{str(item, "title")}</h3><p>{str(item, "summary")}</p>{item.price !== undefined && item.price !== "" && <p>{str(item, "currency", "UGX")} {str(item, "price")} / {str(item, "unit")}</p>}{!!item.minimum_order && <p>Minimum order: {str(item, "minimum_order")}</p>}<ParticipationLink kind="buyer" product={str(item, "title")}>Enquire about this product ↗</ParticipationLink></div></article>)}</div> : <Empty>Our product catalogue will be published as supply becomes available. Buyers can register their requirements above.</Empty>}
    </Section>
    <Section id="sites" eyebrow="Our footprint" title="Production connected to place." description="Explore published production, ranching and aggregation locations, including their current development stage." soft>{sites.length ? <SiteMap sites={sites} /> : <Empty>Verified site locations will appear here once approved for publication.</Empty>}</Section>
    <Section id="newsletter" eyebrow="Stay connected" title="Follow the next chapter." description="Receive CEDAH news, field updates and partnership opportunities as they are published."><NewsletterForm /></Section>
  </>;
}

export async function PublishedRoadmap() {
  const rows = await getPublicRecords("roadmap", DEFAULT_ROADMAP);
  return <div className="platform-grid roadmap-records">{rows.map((item) => <article className="platform-card" key={str(item, "slug")}><span className="platform-badge">{str(item, "phase", str(item, "stage", "Planned"))}</span><h3>{str(item, "title")}</h3><p>{str(item, "summary")}</p>{!!item.stage && <small>Status: {str(item, "stage")}</small>}{!!item.target_date && <small>Target: {date(item.target_date)}</small>}<a href="#contact" className="platform-link">Discuss this phase ↗</a></article>)}</div>;
}
