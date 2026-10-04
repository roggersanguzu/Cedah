import Image from "next/image";
import Link from "next/link";
export default function Footer() {
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
          <Link href="/#how-we-work">Our model</Link>
          <Link href="/#impact">Impact</Link>
          <Link href="/#investment">Investment case</Link>
          <Link href="/#news">News</Link>
        </div>
        <div>
          <b>Enterprises</b>
          <Link href="/#crop-enterprise">Crop enterprise</Link>
          <Link href="/#beef-enterprise">Beef enterprise</Link>
          <Link href="/#roadmap">Growth roadmap</Link>
          <Link href="/#sustainability">Sustainability</Link>
          <Link href="/#contact">Market access</Link>
        </div>
        <div>
          <b>Resources</b>
          <Link href="/#investment">Partner brief</Link>
          <Link href="/#field-stories">Field stories</Link>
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms of use</Link>
          <Link href="/admin/login">Administrator login</Link>
        </div>
        <div>
          <b>Connect</b>
          <Link href="/#contact">Partner with us</Link>
          <a href="mailto:info@cedah.com">info@cedah.com</a>
          <span>Kampala, Uganda</span>
          <a
            href={process.env.NEXT_PUBLIC_LINKEDIN_URL || "/#contact"}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn ↗
          </a>
        </div>
      </div>
      <div className="shell copyright">
        <span>© 2026 Capital Economic Development Alliance Holdings Ltd.</span>
        <span>
          <Link href="/privacy">Privacy</Link> ·{" "}
          <Link href="/terms">Terms</Link> · Built for growth
        </span>
      </div>
    </footer>
  );
}
