import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms governing use of the CEDAH website and its published information.",
  alternates: { canonical: "/terms" },
};
export default function Terms() {
  return (
    <>
      <Header />
      <main className="legal-page">
        <div className="shell legal-wrap">
          <span className="legal-kicker">Website terms</span>
          <h1>Terms of use</h1>
          <p className="legal-lead">
            These terms apply when you access or use the CEDAH website.
          </p>
          <section>
            <h2>Information purpose</h2>
            <p>
              Website content describes CEDAH’s strategy, intended activities
              and development roadmap. Forward-looking statements, proposed
              milestones and future opportunities are not guarantees of
              performance or investment returns.
            </p>
          </section>
          <section>
            <h2>Partnership enquiries</h2>
            <p>
              Submitting an enquiry does not create a partnership, contract,
              funding commitment or employment relationship. Formal commitments
              require authorised written agreements.
            </p>
          </section>
          <section>
            <h2>Intellectual property</h2>
            <p>
              CEDAH branding and original website content may not be reproduced
              for commercial use without written permission. Third-party
              photography remains subject to its original licence and
              attribution terms.
            </p>
          </section>
          <section>
            <h2>Responsible use</h2>
            <p>
              You must not misuse the platform, attempt unauthorised access,
              submit unlawful material or interfere with its security and
              operation.
            </p>
          </section>
          <section>
            <h2>Contact</h2>
            <p>Questions about these terms can be sent to info@cedah.com.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
