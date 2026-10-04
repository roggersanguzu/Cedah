import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How CEDAH collects, uses and safeguards information submitted through its website.",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <>
      <Header />
      <main className="legal-page">
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
              partnership forms, including your name, email, telephone number,
              organisation, area of interest and message. Basic technical and
              analytics information may be collected when analytics services are
              enabled.
            </p>
          </section>
          <section>
            <h2>How information is used</h2>
            <p>
              Information is used to respond to enquiries, evaluate partnership
              opportunities, improve our services, maintain appropriate business
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
              information by emailing info@cedah.com. Some records may be
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
      <Footer />
    </>
  );
}
