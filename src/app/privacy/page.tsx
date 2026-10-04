import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/content";
export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How CEDAH collects, uses and safeguards information submitted through its website.",
  alternates: { canonical: "/privacy" },
};
export default async function Privacy() {
  const settings = await getSiteSettings();
  return (
    <>
      <Header settings={settings} />
      <main className="legal-page" id="main-content" tabIndex={-1}>
        <div className="shell legal-wrap">
          <span className="legal-kicker">Legal & data protection</span>
          <h1>Privacy policy</h1>
          <p className="legal-lead">
            CEDAH respects the privacy of visitors, partners and people who
            contact us through this platform.
          </p>
          <section>
            <h2>Information we collect</h2>
            <p>
              We collect information you voluntarily provide through enquiry and
              partnership, farmer registration, training, buyer and newsletter forms,
              including your name, email, telephone number, district, crops,
              estimated quantities, skills, area of interest, consent and message. Basic technical and
              analytics information may be collected when analytics services are
              enabled.
            </p>
          </section>
          <section>
            <h2>How information is used</h2>
            <p>
              Information is used to respond to enquiries, evaluate partnership
              opportunities and training applications, match supply and buyer requirements,
              improve our services, maintain appropriate business
              records and communicate relevant organisational updates where
              permission has been given.
            </p>
          </section>
          <section>
            <h2>Storage and safeguards</h2>
            <p>
              Website records are stored in access-controlled systems. Media
              files are stored through Cloudinary, while their public URLs and
              descriptive metadata are recorded in MongoDB. Service credentials
              remain server-side.
            </p>
          </section>
          <section>
            <h2>Your choices</h2>
            <p>
              You may request access, correction or deletion of personal
              information by emailing <a href={`mailto:${settings.publicEmail}`}>{settings.publicEmail}</a>. Newsletter subscribers can also
              use the personal unsubscribe link provided after signing up. Some records may be
              retained where required for legitimate legal or operational
              purposes.
            </p>
          </section>
          <section>
            <h2>Updates</h2>
            <p>
              This policy may be updated as CEDAH’s operations and regulatory
              responsibilities develop. Material changes will be published on
              this page.
            </p>
          </section>
        </div>
      </main>
      <Footer settings={settings} />
    </>
  );
}
