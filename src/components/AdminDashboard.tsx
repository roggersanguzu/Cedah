"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

type Submission = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  interest: string;
  message: string;
  created_at?: string;
  status?: string;
};
const nav = [
  "Overview",
  "Website content",
  "Enterprises",
  "News & updates",
  "Projects & activities",
  "Funding & documents",
  "Team & partners",
  "Impact metrics",
  "Enquiries",
  "Media library",
  "Settings",
];
const navIcons = ["⌂", "▤", "◈", "◇", "P", "$", "T", "↗", "✉", "▧", "⚙"];
const defaultEnterprises = [
  {
    title: "Crop enterprise",
    type: "Launch enterprise",
    status: "Active",
    progress: 68,
  },
  {
    title: "Beef enterprise",
    type: "Launch enterprise",
    status: "Active",
    progress: 52,
  },
  {
    title: "Maize processing",
    type: "Expansion phase",
    status: "Planned",
    progress: 18,
  },
  {
    title: "Skills & employment",
    type: "Expansion phase",
    status: "Planned",
    progress: 10,
  },
];
const defaultNews = [
  {
    title:
      "CEDAH establishes crops and beef as its first operating value chains",
    date: "31 Aug 2026",
    status: "Published",
  },
  {
    title: "Building the producer and buyer network for responsible growth",
    date: "22 Jul 2026",
    status: "Published",
  },
  {
    title: "A phased plan from farm enterprise to industrial value addition",
    date: "16 Jun 2026",
    status: "Draft",
  },
];

export default function AdminDashboard({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState("Overview");
  const [toast, setToast] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [enterprises, setEnterprises] = useState(defaultEnterprises);
  const [newsItems, setNewsItems] = useState(defaultNews);
  const [projects, setProjects] = useState<string[]>([]);
  const [opportunities, setOpportunities] = useState<string[]>([]);
  const [team, setTeam] = useState<string[]>([]);
  const [serviceHealth, setServiceHealth] = useState<
    "checking" | "healthy" | "degraded"
  >("checking");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState("");
  const refreshSubmissions = useCallback(async (silent = false) => {
    if (!silent) setSubmissionsLoading(true);
    try {
      const response = await fetch("/api/admin/submissions", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Could not load enquiries");
      const data = await response.json();
      setSubmissions(data.items || []);
      return true;
    } catch {
      return false;
    } finally {
      if (!silent) setSubmissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void refreshSubmissions(), 0);
    const interval = window.setInterval(
      () => void refreshSubmissions(true),
      30_000,
    );
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [refreshSubmissions]);

  useEffect(() => {
    fetch("/api/admin/data/enterprises")
      .then((r) => r.json())
      .then((d) => {
        if (d.items?.length)
          setEnterprises(
            d.items.map(
              (x: {
                title: string;
                phase: string;
                status: string;
                readiness: number;
              }) => ({
                title: x.title,
                type: x.phase,
                status: x.status,
                progress: x.readiness,
              }),
            ),
          );
      })
      .catch(() => {});
    fetch("/api/admin/data/news")
      .then((r) => r.json())
      .then((d) => {
        if (d.items?.length)
          setNewsItems(
            d.items.map(
              (x: {
                title: string;
                published_at?: string;
                status: string;
              }) => ({
                title: x.title,
                date: x.published_at
                  ? new Date(x.published_at).toLocaleDateString()
                  : "Not scheduled",
                status: x.status,
              }),
            ),
          );
      })
      .catch(() => {});
    Promise.all(
      ["projects", "opportunities", "team"].map(async (resource) => {
        const response = await fetch(`/api/admin/data/${resource}`);
        const data = response.ok ? await response.json() : { items: [] };
        return [
          resource,
          (data.items || []).map((item: { title: string }) => item.title),
        ] as const;
      }),
    )
      .then((collections) => {
        for (const [resource, items] of collections) {
          if (resource === "projects") setProjects(items);
          if (resource === "opportunities") setOpportunities(items);
          if (resource === "team") setTeam(items);
        }
      })
      .catch(() => {});
    fetch("/api/health", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) =>
        setServiceHealth(data.status === "healthy" ? "healthy" : "degraded"),
      )
      .catch(() => setServiceHealth("degraded"));
  }, []);
  function notify(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  }
  async function saveRecord(data: {
    title: string;
    summary: string;
    status: string;
    date: string;
  }) {
    const resource =
      tab === "Enterprises"
        ? "enterprises"
        : tab === "News & updates"
          ? "news"
          : tab === "Projects & activities"
            ? "projects"
            : tab === "Funding & documents"
              ? "opportunities"
              : tab === "Team & partners"
                ? "team"
                : null;
    if (!resource) {
      setModal(false);
      notify("Changes saved successfully");
      return;
    }
    const slug = data.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const record =
      resource === "enterprises"
        ? {
            slug,
            title: data.title,
            summary: data.summary,
            phase: "Expansion phase",
            status: data.status.toLowerCase(),
            readiness: 0,
          }
        : resource === "news"
          ? {
              slug,
              title: data.title,
              excerpt: data.summary,
              status: data.status.toLowerCase(),
              category: "Company update",
              published_at: data.date || null,
            }
          : resource === "projects"
            ? {
                slug,
                title: data.title,
                summary: data.summary,
                status: data.status.toLowerCase(),
                category: "Field activity",
                start_date: data.date || null,
              }
            : resource === "opportunities"
              ? {
                  slug,
                  title: data.title,
                  summary: data.summary,
                  status: data.status.toLowerCase(),
                  opportunity_type: "Partnership",
                  deadline: data.date || null,
                  currency: "USD",
                }
              : {
                  slug,
                  title: data.title,
                  summary: data.summary,
                  status: data.status.toLowerCase(),
                  role: "Partner",
                };
    const response = await fetch(`/api/admin/data/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ record }),
    });
    const previousTitle = editing;
    if (response.ok) {
      const updateTitles = (items: string[]) =>
        previousTitle
          ? items.map((item) => (item === previousTitle ? data.title : item))
          : [data.title, ...items];
      if (resource === "projects") setProjects(updateTitles);
      if (resource === "opportunities") setOpportunities(updateTitles);
      if (resource === "team") setTeam(updateTitles);
      if (resource === "enterprises") {
        const item = {
          title: data.title,
          type: "Expansion phase",
          status: data.status,
          progress: 0,
        };
        setEnterprises((items) =>
          previousTitle
            ? items.map((current) =>
                current.title === previousTitle ? item : current,
              )
            : [item, ...items],
        );
      }
      if (resource === "news") {
        const item = {
          title: data.title,
          date: data.date
            ? new Date(data.date).toLocaleDateString()
            : "Not scheduled",
          status: data.status,
        };
        setNewsItems((items) =>
          previousTitle
            ? items.map((current) =>
                current.title === previousTitle ? item : current,
              )
            : [item, ...items],
        );
      }
    }
    setModal(false);
    setEditing("");
    notify(
      response.ok
        ? "Record saved to the content database"
        : "Add your MongoDB connection string to persist this record",
    );
  }
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  const title = tab;
  const today = new Intl.DateTimeFormat("en-UG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const servicesOnline = serviceHealth === "healthy";
  return (
    <main className="admin-shell">
      {toast && (
        <div className="toast">
          <span>✓</span>
          {toast}
        </div>
      )}
      <aside className="admin-sidebar">
        <Link href="/" className="admin-logo">
          <Image
            src="/images/cedah-logo.png"
            alt="CEDAH"
            width={240}
            height={80}
          />
        </Link>
        <div className="workspace-label">Workspace</div>
        <nav>
          {nav.map((item, i) => (
            <button
              key={item}
              className={tab === item ? "active" : ""}
              onClick={() => setTab(item)}
            >
              <span>{navIcons[i]}</span>
              {item}
              {item === "Enquiries" && submissions.length > 0 && (
                <b>{submissions.length}</b>
              )}
            </button>
          ))}
        </nav>
        <div className="admin-profile">
          <div>
            {name
              .split(" ")
              .map((x) => x[0])
              .join("")}
          </div>
          <span>
            <b>{name}</b>
            <small>Super administrator</small>
          </span>
          <button onClick={logout} title="Sign out">
            ↪
          </button>
        </div>
      </aside>
      <section className="admin-main">
        <header className="admin-top">
          <div>
            <span>CEDAH / {title}</span>
            <h1>{title}</h1>
          </div>
          <div className="admin-top-actions">
            <ThemeToggle compact />
            <Link href="/" target="_blank">
              View live website ↗
            </Link>
            <button
              className="admin-top-logout"
              onClick={logout}
              aria-label="Sign out of the admin dashboard"
              title="Sign out"
            >
              <span aria-hidden="true">↪</span>
            </button>
            <button
              className="notification"
              aria-label="Open enquiries"
              title="Open enquiries"
              onClick={() => setTab("Enquiries")}
            >
              {submissions.length || "•"}
            </button>
          </div>
        </header>
        {tab === "Overview" && (
          <div className="admin-view">
            <div className="welcome-card">
              <div>
                <span>{today}</span>
                <h2>Good morning, {name.split(" ")[0]}.</h2>
                <p>
                  Here’s what is happening across the CEDAH digital platform.
                </p>
              </div>
              <div className="health">
                <i className={servicesOnline ? "" : "warning"} />
                {serviceHealth === "checking"
                  ? "Checking connected services"
                  : servicesOnline
                    ? "All connected services operational"
                    : "Service attention required"}
              </div>
            </div>
            <div className="stat-grid">
              <Stat
                value={String(
                  enterprises.filter((item) =>
                    ["active", "published"].includes(item.status.toLowerCase()),
                  ).length,
                )}
                label="Active enterprises"
                change="Launch phase"
              />
              <Stat
                value={String(submissions.length)}
                label="Partner enquiries"
                change={
                  submissions.length ? "Stored in MongoDB" : "No enquiries yet"
                }
              />
              <Stat
                value={String(
                  newsItems.filter(
                    (item) => item.status.toLowerCase() === "published",
                  ).length,
                )}
                label="Published updates"
                change="Managed content"
              />
              <Stat
                value={servicesOnline ? "100%" : "Check"}
                label="Platform health"
                change={
                  serviceHealth === "checking"
                    ? "Running checks"
                    : servicesOnline
                      ? "MongoDB and Cloudinary online"
                      : "Review service health"
                }
              />
            </div>
            <div className="dashboard-grid">
              <div className="panel performance">
                <PanelHead
                  title="Enterprise readiness"
                  action="View enterprises"
                  onClick={() => setTab("Enterprises")}
                />
                {enterprises.slice(0, 2).map((e) => (
                  <div className="performance-row" key={e.title}>
                    <div>
                      <span
                        className={
                          e.title.startsWith("Crop")
                            ? "enterprise-dot crop"
                            : "enterprise-dot beef"
                        }
                      />
                      <b>{e.title}</b>
                    </div>
                    <span>{e.progress}%</span>
                    <div className="progress">
                      <i style={{ width: `${e.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="panel quick">
                <PanelHead title="Quick actions" />
                <div className="quick-grid">
                  <button
                    onClick={() => {
                      setTab("News & updates");
                      setModal(true);
                    }}
                  >
                    <span>＋</span>Publish update
                  </button>
                  <button onClick={() => setTab("Website content")}>
                    <span>✎</span>Edit homepage
                  </button>
                  <button onClick={() => setTab("Enquiries")}>
                    <span>✉</span>View enquiries
                  </button>
                  <button onClick={() => setTab("Impact metrics")}>
                    <span>↗</span>Update impact
                  </button>
                </div>
              </div>
              <div className="panel activity">
                <PanelHead title="Recent activity" />
                <ul>
                  <li>
                    <span>✓</span>
                    <div>
                      <b>Homepage content updated</b>
                      <small>By {name} • 2 hours ago</small>
                    </div>
                  </li>
                  <li>
                    <span>↗</span>
                    <div>
                      <b>New partnership enquiry received</b>
                      <small>Crop enterprise • Yesterday</small>
                    </div>
                  </li>
                  <li>
                    <span>◇</span>
                    <div>
                      <b>Roadmap update published</b>
                      <small>By {name} • 3 days ago</small>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
        {tab === "Website content" && <ContentManager notify={notify} />}
        {tab === "Enterprises" && (
          <div className="admin-view">
            <ViewIntro
              text="Manage operating units, roadmap status and the information shown on the public website."
              action="Add enterprise"
              onAction={() => setModal(true)}
            />
            <div className="data-panel">
              <div className="table-head">
                <span>Enterprise</span>
                <span>Phase</span>
                <span>Readiness</span>
                <span>Status</span>
                <span />
              </div>
              {enterprises.map((e) => (
                <div className="table-row" key={e.title}>
                  <span>
                    <i
                      className={
                        e.title.includes("Beef")
                          ? "entity-icon brown"
                          : "entity-icon"
                      }
                    >
                      ◇
                    </i>
                    <b>{e.title}</b>
                  </span>
                  <span>{e.type}</span>
                  <span>
                    <i className="mini-progress">
                      <i style={{ width: `${e.progress}%` }} />
                    </i>
                    {e.progress}%
                  </span>
                  <span>
                    <em className={`status ${e.status.toLowerCase()}`}>
                      {e.status}
                    </em>
                  </span>
                  <button
                    onClick={() => {
                      setEditing(e.title);
                      setModal(true);
                    }}
                  >
                    •••
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "News & updates" && (
          <div className="admin-view">
            <ViewIntro
              text="Draft, schedule and publish milestones, announcements and company news."
              action="Create update"
              onAction={() => setModal(true)}
            />
            <div className="data-panel">
              <div className="table-head news-table">
                <span>Title</span>
                <span>Date</span>
                <span>Status</span>
                <span />
              </div>
              {newsItems.map((n) => (
                <div className="table-row news-table" key={n.title}>
                  <span>
                    <b>{n.title}</b>
                    <small>News & updates</small>
                  </span>
                  <span>{n.date}</span>
                  <span>
                    <em className={`status ${n.status.toLowerCase()}`}>
                      {n.status}
                    </em>
                  </span>
                  <button
                    onClick={() => {
                      setEditing(n.title);
                      setModal(true);
                    }}
                  >
                    •••
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === "Projects & activities" && (
          <CollectionManager
            title="Projects & activities"
            text="Publish field activities, operational milestones, programme updates and what CEDAH teams are working on."
            action="Post activity"
            items={projects}
            open={(item) => {
              setEditing(item);
              setModal(true);
            }}
          />
        )}
        {tab === "Funding & documents" && (
          <CollectionManager
            title="Funding & documents"
            text="Manage partner briefs, funding opportunities, concept notes, calls for collaboration and due-diligence documents."
            action="Add opportunity"
            items={opportunities}
            open={(item) => {
              setEditing(item);
              setModal(true);
            }}
          />
        )}
        {tab === "Team & partners" && (
          <CollectionManager
            title="Team & partners"
            text="Publish leadership profiles, technical advisers, delivery partners and institutional relationships."
            action="Add profile"
            items={team}
            open={(item) => {
              setEditing(item);
              setModal(true);
            }}
          />
        )}
        {tab === "Impact metrics" && <ImpactManager notify={notify} />}
        {tab === "Enquiries" && (
          <EnquiryManager
            submissions={submissions}
            loading={submissionsLoading}
            refresh={async () => {
              const refreshed = await refreshSubmissions();
              notify(
                refreshed
                  ? "Enquiries refreshed from MongoDB"
                  : "Could not refresh enquiries",
              );
            }}
          />
        )}
        {tab === "Media library" && <MediaLibrary notify={notify} />}
        {tab === "Settings" && (
          <Settings name={name} email={email} notify={notify} />
        )}
      </section>
      {modal && (
        <EditorModal
          title={
            editing ||
            `New ${tab.replace("News & updates", "update").replace("Enterprises", "enterprise")}`
          }
          close={() => {
            setModal(false);
            setEditing("");
          }}
          save={saveRecord}
        />
      )}
    </main>
  );
}

function Stat({
  value,
  label,
  change,
}: {
  value: string;
  label: string;
  change: string;
}) {
  return (
    <article className="admin-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{change}</small>
    </article>
  );
}
function CollectionManager({
  title,
  text,
  action,
  items,
  open,
}: {
  title: string;
  text: string;
  action: string;
  items: string[];
  open: (item: string) => void;
}) {
  return (
    <div className="admin-view">
      <ViewIntro text={text} action={action} onAction={() => open("")} />
      {items.length ? (
        <div className="collection-cards">
          {items.map((item, index) => (
            <button key={item} onClick={() => open(item)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <b>{item}</b>
                <small>{title} • Managed record</small>
              </div>
              <i>↗</i>
            </button>
          ))}
        </div>
      ) : (
        <div className="collection-empty">
          <span>＋</span>
          <b>No records published yet</b>
          <p>Use “{action}” to create the first managed record.</p>
        </div>
      )}
    </div>
  );
}
function PanelHead({
  title,
  action,
  onClick,
}: {
  title: string;
  action?: string;
  onClick?: () => void;
}) {
  return (
    <div className="panel-head">
      <h3>{title}</h3>
      {action && <button onClick={onClick}>{action} →</button>}
    </div>
  );
}
function ViewIntro({
  text,
  action,
  onAction,
}: {
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="view-intro">
      <p>{text}</p>
      <button onClick={onAction}>＋ {action}</button>
    </div>
  );
}
function ContentManager({ notify }: { notify: (s: string) => void }) {
  const [section, setSection] = useState("Hero section");
  const [fields, setFields] = useState({
    eyebrow: "Uganda’s integrated agribusiness",
    title: "From fertile ground to lasting value.",
    description:
      "We build connected agricultural enterprises that create quality food, dependable markets, skilled jobs and shared prosperity.",
    buttonLabel: "Explore our enterprises",
    buttonLink: "#enterprises",
  });
  const [configured, setConfigured] = useState(true);
  const sections = [
    "Hero section",
    "About CEDAH",
    "Vision & mission",
    "What we do",
    "How we work",
    "Opportunity section",
    "Sustainability",
    "Investment case",
    "Field stories",
    "Get involved",
    "Contact details",
    "Footer content",
  ];
  const key = section.toLowerCase().replaceAll(" ", "-").replace("-&-", "-");
  useEffect(() => {
    fetch(`/api/admin/content?section=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((data) => {
        setConfigured(data.configured !== false);
        const defaults =
          section === "Hero section"
            ? {
                eyebrow: "Uganda’s integrated agribusiness",
                title: "From fertile ground to lasting value.",
                description:
                  "We build connected agricultural enterprises that create quality food, dependable markets, skilled jobs and shared prosperity.",
                buttonLabel: "Explore our enterprises",
                buttonLink: "#enterprises",
              }
            : {
                eyebrow: "",
                title: "",
                description: "",
                buttonLabel: "",
                buttonLink: "",
              };
        setFields({ ...defaults, ...(data.content || {}) });
      });
  }, [key, section]);
  async function save() {
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: key, content: fields, published: true }),
    });
    if (response.ok) notify(`${section} published to the live website`);
    else notify("Add your MongoDB connection string to persist these changes");
  }
  const change = (name: keyof typeof fields, value: string) =>
    setFields({ ...fields, [name]: value });
  return (
    <div className="admin-view">
      <div className="view-intro">
        <p>
          Update public website copy and calls to action without touching source
          code.{" "}
          {!configured && <b> MongoDB is required for cloud persistence.</b>}
        </p>
        <button onClick={save}>Publish changes</button>
      </div>
      <div className="content-editor">
        <aside>
          {sections.map((x) => (
            <button
              className={section === x ? "active" : ""}
              onClick={() => setSection(x)}
              key={x}
            >
              <span>▤</span>
              {x}
              <i>›</i>
            </button>
          ))}
        </aside>
        <div className="editor-form">
          <span className="field-kicker">Editing</span>
          <h2>{section}</h2>
          <label>
            Eyebrow text
            <input
              value={fields.eyebrow}
              onChange={(e) => change("eyebrow", e.target.value)}
            />
          </label>
          <label>
            Primary heading
            <input
              value={fields.title}
              onChange={(e) => change("title", e.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              value={fields.description}
              onChange={(e) => change("description", e.target.value)}
            />
          </label>
          <div className="editor-row">
            <label>
              Button label
              <input
                value={fields.buttonLabel}
                onChange={(e) => change("buttonLabel", e.target.value)}
              />
            </label>
            <label>
              Button link
              <input
                value={fields.buttonLink}
                onChange={(e) => change("buttonLink", e.target.value)}
              />
            </label>
          </div>
          <div className="save-row">
            <span>
              {configured
                ? "Connected to content database"
                : "Preview mode until MongoDB is connected"}
            </span>
            <button onClick={save}>Save & publish section</button>
          </div>
        </div>
      </div>
    </div>
  );
}
function ImpactManager({ notify }: { notify: (s: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({
    "Farmers connected": "0",
    "Jobs created": "0",
    "Land under production": "0",
    "Market partnerships": "0",
  });
  const metrics = [
    ["Farmers connected", "people"],
    ["Jobs created", "roles"],
    ["Land under production", "acres"],
    ["Market partnerships", "partners"],
  ];
  async function save() {
    const records = metrics.map(([label, unit]) => ({
      metric_key: label.toLowerCase().replaceAll(" ", "-"),
      label,
      value: Number(values[label] || 0),
      unit,
      published: Number(values[label] || 0) > 0,
    }));
    const response = await fetch("/api/admin/data/impact-metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records }),
    });
    notify(
      response.ok
        ? "Verified impact metrics published"
        : "Add your MongoDB connection string to persist impact metrics",
    );
  }
  return (
    <div className="admin-view">
      <div className="view-intro">
        <p>Track and publish verified development and enterprise indicators.</p>
        <button onClick={save}>Publish metrics</button>
      </div>
      <div className="metric-editor">
        {metrics.map(([label, unit]) => (
          <label key={label}>
            <span>{label}</span>
            <div>
              <input
                type="number"
                min="0"
                value={values[label]}
                onChange={(e) =>
                  setValues({ ...values, [label]: e.target.value })
                }
              />
              <small>{unit}</small>
            </div>
            <em>
              {Number(values[label]) > 0
                ? "Visible on public site"
                : "Hidden until verified"}
            </em>
          </label>
        ))}
      </div>
      <div className="panel metric-note">
        <b>Data integrity</b>
        <p>
          Only publish metrics backed by current operational records. The
          dashboard keeps zero values private on the live website until
          verified.
        </p>
      </div>
    </div>
  );
}
function EnquiryManager({
  submissions,
  loading,
  refresh,
}: {
  submissions: Submission[];
  loading: boolean;
  refresh: () => Promise<void>;
}) {
  const items = submissions;
  function exportCsv() {
    if (!items.length) return;
    const cell = (value: string) => {
      const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
      return `"${safe.replaceAll('"', '""')}"`;
    };
    const rows = [
      ["Name", "Email", "Phone", "Interest", "Message", "Date", "Status"],
      ...items.map((item) => [
        item.name,
        item.email,
        item.phone || "",
        item.interest,
        item.message,
        item.created_at || "",
        item.status || "new",
      ]),
    ];
    const blob = new Blob(
      [rows.map((row) => row.map((value) => cell(value)).join(",")).join("\n")],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cedah-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="admin-view">
      <div className="view-intro">
        <p>
          Review partnership, buyer, supplier and general enquiries received
          through the website.
        </p>
        <div className="enquiry-actions">
          <button onClick={() => void refresh()} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button onClick={exportCsv} disabled={!items.length}>
            Export CSV
          </button>
        </div>
      </div>
      <div className="inbox">
        <div className="inbox-list">
          {items.length ? (
            items.map((s, i) => (
              <a
                className="enquiry-item"
                key={s.id || s.email + i}
                href={`mailto:${s.email}?subject=${encodeURIComponent(`Re: CEDAH ${s.interest} enquiry`)}&body=${encodeURIComponent(`Hello ${s.name},\n\n`)}`}
              >
                <div>
                  {s.name
                    .split(" ")
                    .map((x) => x[0])
                    .join("")}
                </div>
                <span>
                  <b>{s.name}</b>
                  <small>{s.interest}</small>
                  <p>{s.message}</p>
                </span>
                <time>
                  {s.created_at
                    ? new Date(s.created_at).toLocaleDateString()
                    : "Today"}
                </time>
              </a>
            ))
          ) : (
            <div className="inbox-zero">
              <span>✉</span>
              <b>No enquiries yet</b>
              <p>New contact submissions will appear here automatically.</p>
            </div>
          )}
        </div>
        <div className="inbox-empty">
          <span>✉</span>
          <b>{items.length} total enquiries</b>
          <p>
            Select an enquiry to open a correctly addressed response in your
            email client.
          </p>
        </div>
      </div>
    </div>
  );
}
function MediaLibrary({ notify }: { notify: (s: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<
    { public_id: string; secure_url: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((d) => setMedia(d.items || []))
      .catch(() => {});
  }, []);
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    const signed = await fetch("/api/admin/media", { method: "POST" }).then(
      (r) => r.json(),
    );
    if (!signed.signature) {
      notify("Add your Cloudinary keys to upload media");
      setUploading(false);
      return;
    }
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", signed.apiKey);
    form.append("timestamp", String(signed.timestamp));
    form.append("signature", signed.signature);
    form.append("folder", signed.folder || "cedah");
    const result = await fetch(
      `https://api.cloudinary.com/v1_1/${signed.cloudName}/auto/upload`,
      { method: "POST", body: form },
    );
    const asset = await result.json();
    if (result.ok) {
      const stored = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset }),
      });
      setUploading(false);
      if (stored.ok) {
        setMedia([
          { public_id: asset.public_id, secure_url: asset.secure_url },
          ...media,
        ]);
        notify("Media uploaded and saved in MongoDB");
      } else
        notify("Image uploaded, but its MongoDB record could not be saved");
    } else {
      setUploading(false);
      notify("Media upload failed");
    }
  }
  return (
    <div className="admin-view">
      <div className="view-intro">
        <p>
          Organise approved photography, logos, reports and public documents.
        </p>
        <button onClick={() => input.current?.click()}>
          ＋ {uploading ? "Uploading…" : "Upload files"}
        </button>
        <input
          ref={input}
          hidden
          type="file"
          accept="image/png,image/jpeg,image/webp,application/pdf"
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </div>
      <div className="media-grid">
        <button className="upload-card" onClick={() => input.current?.click()}>
          <span>＋</span>
          <b>Upload media</b>
          <small>PNG, JPG, WEBP or PDF up to 10MB</small>
        </button>
        <div className="media-card">
          <Image
            src="/images/cedah-hero.png"
            alt="Agricultural hero"
            fill
            sizes="250px"
          />
          <span>cedah-hero.png</span>
        </div>
        <div className="media-card logo-card">
          <Image
            src="/images/cedah-logo.png"
            alt="CEDAH logo"
            fill
            sizes="250px"
          />
          <span>cedah-logo.png</span>
        </div>
        {media.map((item) => (
          <div className="media-card" key={item.public_id}>
            <div
              className="cloud-image"
              style={{ backgroundImage: `url(${item.secure_url})` }}
            />
            <span>{item.public_id.split("/").pop()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function Settings({
  name,
  email,
  notify,
}: {
  name: string;
  email: string;
  notify: (s: string) => void;
}) {
  const [company, setCompany] = useState({
    legalName: "Capital Economic Development Alliance Holdings Ltd.",
    publicEmail: "info@cedah.com",
    location: "Kampala, Uganda",
    timezone: "Africa/Kampala",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content?section=organisation-settings")
      .then((response) => response.json())
      .then((data) => {
        if (data.content) {
          setCompany((current) => ({ ...current, ...data.content }));
        }
      })
      .catch(() => undefined);
  }, []);

  async function saveCompany() {
    setSaving(true);
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section: "organisation-settings",
        content: company,
        published: true,
      }),
    });
    setSaving(false);
    notify(
      response.ok
        ? "Company settings saved to MongoDB"
        : "Company settings could not be saved",
    );
  }

  return (
    <div className="admin-view">
      <div className="settings-grid">
        <div className="editor-form">
          <span className="field-kicker">Organisation</span>
          <h2>Company settings</h2>
          <label>
            Legal company name
            <input
              value={company.legalName}
              onChange={(event) =>
                setCompany({ ...company, legalName: event.target.value })
              }
            />
          </label>
          <label>
            Public email
            <input
              type="email"
              value={company.publicEmail}
              onChange={(event) =>
                setCompany({ ...company, publicEmail: event.target.value })
              }
            />
          </label>
          <div className="editor-row">
            <label>
              Office location
              <input
                value={company.location}
                onChange={(event) =>
                  setCompany({ ...company, location: event.target.value })
                }
              />
            </label>
            <label>
              Timezone
              <input
                value={company.timezone}
                onChange={(event) =>
                  setCompany({ ...company, timezone: event.target.value })
                }
              />
            </label>
          </div>
          <button
            className="settings-save"
            onClick={saveCompany}
            disabled={saving}
          >
            {saving ? "Saving settings..." : "Save company settings"}
          </button>
        </div>
        <div className="editor-form">
          <span className="field-kicker">Administrator</span>
          <h2>Account & security</h2>
          <label>
            Full name
            <input value={name} readOnly />
          </label>
          <label>
            Login email
            <input value={email} readOnly />
          </label>
          <div className="security-note">
            <b>Deployment-managed credentials</b>
            <p>
              For security, administrator identity, password and session secret
              are changed through <code>SUPER_ADMIN_EMAIL</code>,{" "}
              <code>SUPER_ADMIN_PASSWORD</code> and <code>AUTH_SECRET</code> in
              the deployment environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
function EditorModal({
  title,
  close,
  save,
}: {
  title: string;
  close: () => void;
  save: (data: {
    title: string;
    summary: string;
    status: string;
    date: string;
  }) => void;
}) {
  const [name, setName] = useState(title.startsWith("New") ? "" : title);
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("Draft");
  const [date, setDate] = useState("");
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <div className="editor-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={close}>
          ×
        </button>
        <span className="field-kicker">Content editor</span>
        <h2>{title}</h2>
        <label>
          Title
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Summary
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Enter a clear public summary..."
          />
        </label>
        <div className="editor-row">
          <label>
            Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Draft</option>
              <option>Published</option>
              <option>Planned</option>
            </select>
          </label>
          <label>
            Publish date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>
        <div className="modal-actions">
          <button onClick={close}>Cancel</button>
          <button
            disabled={!name.trim()}
            onClick={() => save({ title: name, summary, status, date })}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
