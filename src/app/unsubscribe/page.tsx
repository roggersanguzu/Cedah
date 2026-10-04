import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UnsubscribeForm from "@/components/UnsubscribeForm";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = { title: "Newsletter preferences", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function Unsubscribe({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const [{ token = "" }, settings] = await Promise.all([searchParams, getSiteSettings()]);
  return <>
    <Header settings={settings} />
    <main className="legal-page" id="main-content" tabIndex={-1}>
      <div className="shell legal-wrap">
        <span className="legal-kicker">Your preferences</span>
        <h1>Newsletter preferences</h1>
        <UnsubscribeForm token={token} />
        <p>Need help? <a href={`mailto:${settings.publicEmail}`}>{settings.publicEmail}</a></p>
      </div>
    </main>
    <Footer settings={settings} />
  </>;
}
