import Image from "next/image";
import Link from "next/link";
import { DEFAULT_SITE_SETTINGS } from "@/lib/platform";
export default function Footer({ settings }: { settings?: Partial<typeof DEFAULT_SITE_SETTINGS> }) {
  const organisation = { ...DEFAULT_SITE_SETTINGS, ...settings };
  return (
    <footer>
      <div className="shell footer-main">
        <div className="footer-brand">
          <Image
            src="/images/cedah-logo.png"
            alt="CEDAH"
            width={300}
            height={100}
          />
          <p>
            Building profitable enterprises.
            <br />
            Growing sustainable communities.
          </p>
          <Link href="/#contact" className="footer-cta">
            Start a partnership <span>↗</span>
          </Link>
        </div>
        <div>
          <b>Company</b>
          <Link href="/#about">About us</Link>
          <Link href="/#objectives">Our objectives</Link>
          <Link href="/#leadership">Board & leadership</Link>
          <Link href="/#how-we-work">Our model</Link>
          <Link href="/#impact-dashboard">Reported impact</Link>
          <Link href="/#investment">Investment case</Link>
          <Link href="/#news">News</Link>
        </div>
        <div>
          <b>Enterprises</b>
          <Link href="/#enterprises">Crop enterprise</Link>
          <Link href="/#enterprises">Beef enterprise</Link>
          <Link href="/#roadmap">Growth roadmap</Link>
          <Link href="/#sustainability">Sustainability</Link>
          <Link href="/#market-prices">Market prices</Link>
          <Link href="/#products">Products & buyers</Link>
        </div>
        <div>
          <b>Resources</b>
          <Link href="/#data-room">Partner data room</Link>
          <Link href="/#field-work">Field work</Link>
          <Link href="/#participate">Farmer & training registration</Link>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms of use</Link>
          <Link href="/admin/login">Administrator login</Link>
        </div>
        <div>
          <b>Connect</b>
          <Link href="/#contact">Partner with us</Link>
          <Link href="/#newsletter">Newsletter signup</Link>
          <a href={`mailto:${organisation.publicEmail}`}>{organisation.publicEmail}</a>
          <a href={`tel:${organisation.phone}`}>{organisation.phone}</a>
          <span>{organisation.location}</span>
          {process.env.NEXT_PUBLIC_LINKEDIN_URL && <a
            href={process.env.NEXT_PUBLIC_LINKEDIN_URL}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn ↗
          </a>}
        </div>
      </div>
      <div className="shell copyright">
        <span>© {new Date().getFullYear()} {organisation.legalName}</span>
        <span>
          <Link href="/privacy">Privacy</Link> ·{" "}
          <Link href="/terms">Terms</Link> · Built for growth
        </span>
      </div>
    </footer>
  );
}
