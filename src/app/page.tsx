import Image from "next/image";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Reveal from "@/components/Reveal";
import ScrollProgress from "@/components/ScrollProgress";
import { getPublishedContent, getPublicRecords } from "@/lib/content";

// Admin-published MongoDB content should be visible without a new deployment.
export const dynamic = "force-dynamic";

const Arrow = () => <span aria-hidden>↗</span>;
const Icon = ({ name }: { name: string }) => {
  const paths: Record<string, React.ReactNode> = {
    crop: (
      <>
        <path d="M12 21V10M12 14c-4.7 0-7-2.7-7-7 4.7 0 7 2.7 7 7Zm0-4c4.7 0 7-2.7 7-7-4.7 0-7 2.7-7 7Z" />
      </>
    ),
    beef: (
      <>
        <path d="M5 9 3 5l5 2c1.1-.7 2.5-1 4-1s2.9.3 4 1l5-2-2 4c.6 1 .9 2 .9 3.2C19.9 16 16.4 19 12 19s-7.9-3-7.9-6.8C4.1 11 4.4 10 5 9Z" />
        <path d="M8.5 12h.01M15.5 12h.01M9.5 16c1.7.7 3.3.7 5 0" />
      </>
    ),
    market: (
      <>
        <path d="M4 20V10m16 10V10M2 10h20l-2-6H4l-2 6Zm4 10h12M8 20v-6h8v6" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5.5a3 3 0 0 1 0 5.8M17 14a5 5 0 0 1 4 5v1" />
      </>
    ),
    factory: (
      <>
        <path d="M3 21V10l6 3V9l6 4V5h6v16H3Z" />
        <path d="M7 17h1m4 0h1m4 0h1" />
      </>
    ),
    skill: (
      <>
        <path d="m2 9 10-5 10 5-10 5L2 9Z" />
        <path d="M6 11.5V16c3 3 9 3 12 0v-4.5M22 9v6" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      {paths[name]}
    </svg>
  );
};

const pillars = [
  {
    icon: "crop",
    title: "Crop production",
    text: "Climate-aware commercial farming focused initially on maize and carefully selected high-value crops.",
  },
  {
    icon: "beef",
    title: "Beef value chain",
    text: "Responsible livestock production built around herd health, traceability, quality and reliable markets.",
  },
  {
    icon: "factory",
    title: "Processing & value addition",
    text: "Turning primary production into quality, market-ready food, feed and useful agricultural by-products.",
  },
  {
    icon: "market",
    title: "Aggregation & market access",
    text: "Connecting surrounding producers to dependable buyers, stronger pricing and a secure supply network.",
  },
  {
    icon: "skill",
    title: "Skills & enterprise",
    text: "Training people in practical production, technical, quality-control, sales and supervisory roles.",
  },
  {
    icon: "people",
    title: "Employment pathways",
    text: "Absorbing qualified graduates into CEDAH and connecting others to partner businesses and markets.",
  },
];
const updates = [
  {
    tag: "Enterprise",
    date: "August 2026",
    title:
      "CEDAH establishes crops and beef as its first operating value chains",
    text: "The opening phase connects primary production with a long-term path into processing and market access.",
  },
  {
    tag: "Partnerships",
    date: "July 2026",
    title: "Building the producer and buyer network for responsible growth",
    text: "Early conversations focus on strong farm supply, dependable off-take and measurable shared value.",
  },
  {
    tag: "Roadmap",
    date: "June 2026",
    title: "A phased plan from farm enterprise to industrial value addition",
    text: "CEDAH’s growth roadmap prioritizes disciplined execution before expansion into new units.",
  },
];

export default async function Home() {
  const [cms, databaseNews, databaseProjects] = await Promise.all([
    getPublishedContent(),
    getPublicRecords("news"),
    getPublicRecords("projects"),
  ]);
  const hero = cms["hero-section"] || {};
  const about = cms["about-cedah"] || {};
  const publicUpdates = databaseNews.length
    ? databaseNews.map((item) => ({
        tag: String(item.category || "Update"),
        date: item.published_at
          ? new Date(item.published_at as string).toLocaleDateString("en-UG", {
              month: "long",
              year: "numeric",
            })
          : "Latest",
        title: String(item.title || "CEDAH update"),
        text: String(item.excerpt || ""),
      }))
    : updates;
  const currentProjects = databaseProjects.length
    ? databaseProjects.map((item) => ({
        title: String(item.title || "Current activity"),
        text: String(item.summary || ""),
        status: String(item.stage || item.status || "Published"),
        category: String(item.category || "Field activity"),
      }))
    : [
        {
          title: "Crop production launch planning",
          text: "Farm planning, production systems, input strategy and responsible routes to market.",
          status: "In preparation",
          category: "Crop enterprise",
        },
        {
          title: "Beef systems and supplier mapping",
          text: "Developing livestock health, traceability, production and market-readiness frameworks.",
          status: "In preparation",
          category: "Beef enterprise",
        },
        {
          title: "Founding partner engagement",
          text: "Building relationships across capital, technical expertise, supply and off-take.",
          status: "Open",
          category: "Partnerships",
        },
      ];
  return (
    <main>
      <ScrollProgress />
      <Header />
      <section className="hero" id="home">
        <Image
          src="/images/cedah-hero.png"
          alt="Green crop fields and beef cattle on a Ugandan farm at sunrise"
          fill
          priority
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-shade" />
        <div className="hero-grain" />
        <div className="shell hero-content">
          <div className="eyebrow light">
            <span />
            {hero.eyebrow || "Uganda’s integrated agribusiness"}
          </div>
          <h1>
            {hero.title || (
              <>
                From fertile ground
                <br />
                to <em>lasting value.</em>
              </>
            )}
          </h1>
          <p>
            {hero.description ||
              "We build connected agricultural enterprises that create quality food, dependable markets, skilled jobs and shared prosperity."}
          </p>
          <div className="hero-actions">
            <Link
              href={hero.buttonLink || "#enterprises"}
              className="button teal"
            >
              {hero.buttonLabel || "Explore our enterprises"} <Arrow />
            </Link>
            <Link href="#about" className="text-link">
              Discover our vision <span>→</span>
            </Link>
          </div>
          <div className="hero-signals" aria-label="CEDAH launch priorities">
            <span>
              <b>01</b> Maize-led crops
            </span>
            <span>
              <b>02</b> Responsible beef
            </span>
            <span>
              <b>03</b> Market access
            </span>
          </div>
        </div>
        <Link href="#investment" className="hero-brief-card">
          <small>Founding partner brief</small>
          <strong>Capital with a clear operating path.</strong>
          <span>
            Review the investment case <b>↗</b>
          </span>
        </Link>
        <div className="hero-foot">
          <div className="shell">
            <span>Our launch focus</span>
            <div>
              <b>01</b> Crop production
            </div>
            <div>
              <b>02</b> Beef enterprise
            </div>
            <a href="#about" aria-label="Scroll to about">
              ↓
            </a>
          </div>
        </div>
      </section>

      <section className="intro section" id="about">
        <div className="shell intro-grid">
          <Reveal>
            <div className="eyebrow">
              <span />
              Who we are
            </div>
            <h2>
              {about.title || (
                <>
                  Enterprise with a<br />
                  <em>greater purpose.</em>
                </>
              )}
            </h2>
            <div className="mini-stat">
              <strong>01</strong>
              <span>
                Connected group
                <br />
                Multiple value chains
              </span>
            </div>
          </Reveal>
          <Reveal className="intro-copy" delay={140}>
            <p className="lead">
              {about.description ||
                "Capital Economic Development Alliance Holdings Ltd. is a Ugandan enterprise creating a connected future for agriculture, industry and communities."}
            </p>
            <p>
              We bring production, processing, skills and market access into one
              practical model, building businesses that grow profitably while
              expanding opportunity for farmers, young people and local
              economies.
            </p>
            <div className="vision-mission">
              <div>
                <small>Our vision</small>
                <b>
                  To become a leading East African industrial agribusiness
                  group.
                </b>
              </div>
              <div>
                <small>Our mission</small>
                <b>
                  To produce quality, create work and grow community prosperity.
                </b>
              </div>
            </div>
            <Link href="#how-we-work" className="underline-link">
              Our story and ambition <Arrow />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="story-visual section" id="opportunity">
        <div className="shell story-grid">
          <Reveal className="story-image-wrap">
            <Link href="#contact" className="story-image">
              <Image
                src="/images/field-farmer.jpg"
                alt="Farmer caring for crops in a green agricultural field"
                fill
                sizes="(max-width: 800px) 100vw, 55vw"
              />
              <span className="image-label">
                <b>Production first</b>Practical systems rooted in the field
              </span>
            </Link>
            <a
              className="photo-credit"
              href="https://www.pexels.com/photo/a-farmer-in-an-agricultural-field-11588042/"
              target="_blank"
              rel="noreferrer"
            >
              Photo source: Pexels ↗
            </a>
          </Reveal>
          <Reveal className="story-copy" delay={120}>
            <div className="eyebrow">
              <span />
              The opportunity
            </div>
            <h2>
              Commercial discipline.
              <br />
              <em>Community reach.</em>
            </h2>
            <p className="lead">
              CEDAH is designed to solve connected problems together: fragmented
              supply, limited value addition, weak market access and too few
              practical pathways into work.
            </p>
            <div className="story-points">
              <Link href="#enterprises">
                <span>01</span>
                <div>
                  <b>Build productive assets</b>
                  <small>
                    Farms, livestock systems and essential infrastructure.
                  </small>
                </div>
                <i>↗</i>
              </Link>
              <Link href="#how-we-work">
                <span>02</span>
                <div>
                  <b>Keep more value locally</b>
                  <small>
                    Aggregation, processing, quality assurance and market
                    linkage.
                  </small>
                </div>
                <i>↗</i>
              </Link>
              <Link href="#impact">
                <span>03</span>
                <div>
                  <b>Convert growth into opportunity</b>
                  <small>
                    Skills, jobs, supplier income and stronger local enterprise.
                  </small>
                </div>
                <i>↗</i>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="enterprises section" id="enterprises">
        <div className="shell">
          <Reveal className="section-head">
            <div>
              <div className="eyebrow">
                <span />
                Where we begin
              </div>
              <h2>
                Two value chains.
                <br />
                <em>One connected future.</em>
              </h2>
            </div>
            <p>
              We are starting where Uganda’s opportunity is strongest, building
              resilient crop and beef enterprises designed to reinforce one
              another.
            </p>
          </Reveal>
          <div className="venture-grid">
            <Reveal>
              <Link
                href="#contact"
                className="venture-card crop-card"
                id="crop-enterprise"
              >
                <div className="card-num">01 / CROPS</div>
                <div className="round-icon">
                  <Icon name="crop" />
                </div>
                <h3>Crop enterprise</h3>
                <p>
                  Commercial crop production with a focus on quality,
                  productivity and future value addition, from farm planning to
                  market.
                </p>
                <ul>
                  <li>Maize and selected high-value crops</li>
                  <li>Modern, climate-aware production systems</li>
                  <li>Aggregation, milling and processing</li>
                </ul>
                <span className="venture-link">
                  Discuss crop opportunities <Arrow />
                </span>
              </Link>
            </Reveal>
            <Reveal delay={140}>
              <Link
                href="#contact"
                className="venture-card beef-card"
                id="beef-enterprise"
              >
                <div className="card-num">02 / BEEF</div>
                <div className="round-icon">
                  <Icon name="beef" />
                </div>
                <h3>Beef enterprise</h3>
                <p>
                  A responsible, traceable beef value chain built from healthy
                  livestock and reliable systems to quality markets.
                </p>
                <ul>
                  <li>Livestock and ranch production</li>
                  <li>Animal health and traceability</li>
                  <li>Processing, packaging and market linkage</li>
                </ul>
                <span className="venture-link">
                  Discuss beef opportunities <Arrow />
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="pillars section" id="what-we-do">
        <div className="shell">
          <Reveal className="split-title">
            <div>
              <div className="eyebrow">
                <span />
                What we do
              </div>
              <h2>
                One ecosystem.
                <br />
                <em>Six capabilities.</em>
              </h2>
            </div>
            <p>
              The holding structure lets each operating unit specialize while
              sharing supply, talent, infrastructure, knowledge and markets.
            </p>
          </Reveal>
          <div className="pillar-grid">
            {pillars.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 90}>
                <Link href="#contact" className="pillar-card">
                  <span className="pillar-index">0{i + 1}</span>
                  <Icon name={item.icon} />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <b className="card-arrow">Discuss this capability ↗</b>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="model section" id="how-we-work">
        <div className="shell model-grid">
          <Reveal className="model-copy">
            <div className="eyebrow light">
              <span />
              How we work
            </div>
            <h2>
              More value at
              <br />
              <em>every link.</em>
            </h2>
            <p>
              CEDAH connects the full journey, from what is grown and raised to
              how it is processed, sold and transformed into opportunity.
            </p>
            <Link href="#contact" className="button outline">
              Build with us <Arrow />
            </Link>
          </Reveal>
          <div className="model-steps">
            {[
              ["01", "Produce", "Crops & livestock"],
              ["02", "Process", "Quality & value addition"],
              ["03", "Connect", "Markets & partnerships"],
              ["04", "Prosper", "Jobs & community growth"],
            ].map((x, i) => (
              <Reveal key={x[0]} delay={i * 80}>
                <div>
                  <span>{x[0]}</span>
                  <b>{x[1]}</b>
                  <small>{x[2]}</small>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="sustainability section" id="sustainability">
        <div className="shell sustainability-grid">
          <Reveal className="sustainability-copy">
            <div className="eyebrow light">
              <span />
              Responsible by design
            </div>
            <h2>
              Resilience is part of
              <br />
              <em>the business model.</em>
            </h2>
            <p>
              Long-term value depends on healthy land, healthy livestock,
              transparent operations and communities that benefit from growth.
              CEDAH will build these principles into every operating unit from
              the beginning.
            </p>
            <div className="sustainability-list">
              <Link href="#contact">
                <b>01</b>
                <span>Climate-aware production</span>
                <i>→</i>
              </Link>
              <Link href="#contact">
                <b>02</b>
                <span>Animal welfare & traceability</span>
                <i>→</i>
              </Link>
              <Link href="#impact">
                <b>03</b>
                <span>Measurable social outcomes</span>
                <i>→</i>
              </Link>
              <Link href="#investment">
                <b>04</b>
                <span>Transparent governance</span>
                <i>→</i>
              </Link>
            </div>
          </Reveal>
          <Reveal className="sustainability-image" delay={120}>
            <Link href="#beef-enterprise">
              <Image
                src="/images/cattle-ranch.jpg"
                alt="Cattle grazing in open pasture"
                fill
                sizes="(max-width: 800px) 100vw, 50vw"
              />
              <span>
                Responsible livestock systems <b>↗</b>
              </span>
            </Link>
            <a
              className="photo-credit light-credit"
              href="https://unsplash.com/photos/two-black-jersey-cattle-on-ranch-duLT3Qmu6Xw"
              target="_blank"
              rel="noreferrer"
            >
              Photo: Kelly Sikkema / Unsplash ↗
            </a>
          </Reveal>
        </div>
      </section>

      <section className="roadmap section" id="roadmap">
        <div className="shell">
          <Reveal className="center-head">
            <div className="eyebrow">
              <span />
              Disciplined expansion
            </div>
            <h2>
              Built in phases.
              <br />
              <em>Designed for scale.</em>
            </h2>
            <p>
              We grow each unit to operational strength before opening the next,
              protecting quality and long-term value.
            </p>
          </Reveal>
          <div className="timeline">
            <div className="timeline-line" />
            <Reveal>
              <Link href="#contact" className="timeline-card-link">
                <article className="active">
                  <span>Now</span>
                  <b>Launch foundations</b>
                  <p>
                    Crop production, beef enterprise, operating systems and
                    founding partnerships.
                  </p>
                  <span className="timeline-link">Discuss this phase ↗</span>
                </article>
              </Link>
            </Reveal>
            <Reveal delay={100}>
              <Link href="#contact" className="timeline-card-link">
                <article>
                  <span>Next</span>
                  <b>Value addition</b>
                  <p>
                    Maize milling, animal feed, meat handling, aggregation and
                    stronger market access.
                  </p>
                  <span className="timeline-link">Discuss this phase ↗</span>
                </article>
              </Link>
            </Reveal>
            <Reveal delay={200}>
              <Link href="#contact" className="timeline-card-link">
                <article>
                  <span>Scale</span>
                  <b>Skills & industry</b>
                  <p>
                    Enterprise-linked training, graduate employment and
                    additional selected crops.
                  </p>
                  <span className="timeline-link">Discuss this phase ↗</span>
                </article>
              </Link>
            </Reveal>
            <Reveal delay={300}>
              <Link href="#contact" className="timeline-card-link">
                <article>
                  <span>Future</span>
                  <b>Regional growth</b>
                  <p>
                    Multiple sites, export-ready standards and expansion into
                    East African markets.
                  </p>
                  <span className="timeline-link">Discuss this phase ↗</span>
                </article>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="value-gallery section" id="field-stories">
        <div className="shell">
          <Reveal className="split-title">
            <div>
              <div className="eyebrow">
                <span />A living value chain
              </div>
              <h2>
                People, production
                <br />
                <em>and possibility.</em>
              </h2>
            </div>
            <p>
              CEDAH’s model is designed around real work: producing well,
              handling quality carefully, building dependable teams and
              connecting every stage to a viable market.
            </p>
          </Reveal>
          <div className="gallery-grid">
            <Reveal>
              <Link href="#contact" className="gallery-card gallery-large">
                <Image
                  src="/images/harvest-team.jpg"
                  alt="Agricultural workers harvesting crops together"
                  fill
                  sizes="(max-width: 800px) 100vw, 60vw"
                />
                <div>
                  <span>Producer networks</span>
                  <h3>Growing supply through trusted farmer relationships.</h3>
                  <b>Join the network ↗</b>
                </div>
              </Link>
              <a
                className="photo-credit"
                href="https://www.pexels.com/photo/people-working-on-the-farm-field-11196879/"
                target="_blank"
                rel="noreferrer"
              >
                Photo source: Pexels ↗
              </a>
            </Reveal>
            <Reveal delay={120}>
              <Link href="#what-we-do" className="gallery-card">
                <Image
                  src="/images/grain-enterprise.jpg"
                  alt="Woman handling grain during harvest"
                  fill
                  sizes="(max-width: 800px) 100vw, 40vw"
                />
                <div>
                  <span>Value addition</span>
                  <h3>Keeping more agricultural value close to its source.</h3>
                  <b>Explore the model ↗</b>
                </div>
              </Link>
              <a
                className="photo-credit"
                href="https://www.pexels.com/photo/woman-working-on-field-20302802/"
                target="_blank"
                rel="noreferrer"
              >
                Photo: Fatima Yusuf / Pexels ↗
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="impact section" id="impact">
        <div className="shell">
          <Reveal className="center-head">
            <div className="eyebrow">
              <span />
              Built for shared prosperity
            </div>
            <h2>
              Growth that reaches
              <br />
              <em>beyond the farm.</em>
            </h2>
          </Reveal>
          <div className="impact-grid">
            <Reveal>
              <Link href="#contact" className="impact-card">
                <Icon name="market" />
                <h3>Reliable markets</h3>
                <p>
                  Connecting farmers and quality products to dependable buyers
                  and stronger value chains.
                </p>
                <b className="card-arrow">Discuss market partnerships ↗</b>
              </Link>
            </Reveal>
            <Reveal delay={100}>
              <Link href="#contact" className="impact-card">
                <Icon name="people" />
                <h3>Practical employment</h3>
                <p>
                  Building real pathways into technical, farm, processing, sales
                  and management roles.
                </p>
                <b className="card-arrow">Discuss employment pathways ↗</b>
              </Link>
            </Reveal>
            <Reveal delay={200}>
              <Link href="#contact" className="impact-card">
                <Icon name="crop" />
                <h3>Farmer prosperity</h3>
                <p>
                  Supporting producer networks with aggregation, knowledge and
                  access to opportunity.
                </p>
                <b className="card-arrow">Discuss producer participation ↗</b>
              </Link>
            </Reveal>
          </div>
          <Reveal className="impact-band">
            <div>
              <strong>Production</strong>
              <span>Quality-led farming and livestock</span>
            </div>
            <div>
              <strong>People</strong>
              <span>Skills linked to real work</span>
            </div>
            <div>
              <strong>Prosperity</strong>
              <span>Value shared across communities</span>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="investment section" id="investment">
        <div className="shell">
          <Reveal className="investment-head">
            <div>
              <div className="eyebrow light">
                <span />
                Investment & funding readiness
              </div>
              <h2>
                A credible platform for
                <br />
                <em>patient, productive capital.</em>
              </h2>
            </div>
            <div>
              <p>
                CEDAH offers funders and investors a phased route into food
                production, value addition, employment and measurable local
                economic growth, without overstating unverified outcomes.
              </p>
              <Link href="#contact" className="button teal">
                Request the partner brief <Arrow />
              </Link>
            </div>
          </Reveal>
          <div className="funding-grid">
            {[
              [
                "01",
                "Phased use of capital",
                "Capital is matched to clear operating milestones, from production assets and livestock systems to processing and market expansion.",
              ],
              [
                "02",
                "Market-led execution",
                "Operating decisions begin with quality requirements, buyer demand, supply reliability and realistic unit economics.",
              ],
              [
                "03",
                "Governance & reporting",
                "The platform is structured for documented decisions, role-based administration, data stewardship and partner reporting.",
              ],
              [
                "04",
                "Measurable additionality",
                "CEDAH will track production, jobs, farmer participation, skills pathways, market relationships and value retained locally.",
              ],
            ].map((item, i) => (
              <Reveal key={item[0]} delay={i * 70}>
                <Link href="#contact" className="funding-card">
                  <span>{item[0]}</span>
                  <h3>{item[1]}</h3>
                  <p>{item[2]}</p>
                  <b>Discuss this area ↗</b>
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="due-diligence">
            <div>
              <span>Partner-ready information</span>
              <b>Concept note</b>
              <b>Phased budget</b>
              <b>Risk register</b>
              <b>Impact framework</b>
              <b>Governance profile</b>
            </div>
            <Link href="#contact">
              Open a due-diligence conversation <Arrow />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="get-involved section" id="get-involved">
        <div className="shell">
          <Reveal className="split-title">
            <div>
              <div className="eyebrow">
                <span />
                Get involved
              </div>
              <h2>
                There is a place
                <br />
                <em>for you in the chain.</em>
              </h2>
            </div>
            <p>
              CEDAH welcomes aligned partners who bring patient capital,
              expertise, reliable supply, strong markets or a commitment to
              practical employment.
            </p>
          </Reveal>
          <div className="involve-grid">
            {[
              [
                "01",
                "Invest & fund",
                "Help build productive assets and scalable operating units.",
              ],
              [
                "02",
                "Supply & produce",
                "Join our growing farmer, input and service-provider network.",
              ],
              [
                "03",
                "Buy & distribute",
                "Source dependable products and build long-term market relationships.",
              ],
              [
                "04",
                "Train & collaborate",
                "Develop practical skills, technology and industry standards with us.",
              ],
            ].map((x, i) => (
              <Reveal key={x[0]} delay={i * 70}>
                <Link href="#contact">
                  <span>{x[0]}</span>
                  <h3>{x[1]}</h3>
                  <p>{x[2]}</p>
                  <b>↗</b>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="current-work section" id="current-work">
        <div className="shell">
          <Reveal className="split-title">
            <div>
              <div className="eyebrow">
                <span />
                Live from the roadmap
              </div>
              <h2>
                What we are
                <br />
                <em>working on now.</em>
              </h2>
            </div>
            <p>
              These records can be published directly by the super
              administrator. They give partners a transparent view of current
              priorities, progress and opportunities to contribute.
            </p>
          </Reveal>
          <div className="work-grid">
            {currentProjects.slice(0, 6).map((project, i) => (
              <Reveal key={project.title} delay={(i % 3) * 80}>
                <Link href="#contact" className="work-card">
                  <div>
                    <span>{project.category}</span>
                    <em>{project.status}</em>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.text}</p>
                  <b>Discuss or support this work ↗</b>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="news section" id="news">
        <div className="shell">
          <Reveal className="news-head">
            <div>
              <div className="eyebrow">
                <span />
                News & updates
              </div>
              <h2>
                Follow the
                <br />
                <em>journey.</em>
              </h2>
            </div>
            <Link href="#contact" className="underline-link">
              Media enquiries <Arrow />
            </Link>
          </Reveal>
          <div className="news-grid">
            {publicUpdates.map((item, i) => (
              <Reveal key={item.title} delay={i * 100}>
                <Link href="#contact" className="news-card">
                  <div className="news-meta">
                    <span>{item.tag}</span>
                    <time>{item.date}</time>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <span className="news-read">
                    Discuss this update <Arrow />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="cta section" id="contact">
        <div className="shell cta-box">
          <Reveal>
            <div className="eyebrow light">
              <span />
              Let’s build together
            </div>
            <h2>
              Partner in Uganda’s
              <br />
              <em>next growth story.</em>
            </h2>
            <p>
              Whether you invest, supply, buy, train or build alongside us,
              there is a place for your expertise in the CEDAH ecosystem.
            </p>
            <div className="contact-direct">
              <span>Direct email</span>
              <a href="mailto:info@cedah.com">info@cedah.com</a>
              <span>Head office</span>
              <b>Kampala, Uganda</b>
            </div>
          </Reveal>
          <Reveal delay={130}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
      <Footer />
    </main>
  );
}
