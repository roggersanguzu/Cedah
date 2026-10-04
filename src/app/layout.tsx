import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import WhatsAppLink from "@/components/WhatsAppLink";
import { getSiteSettings } from "@/lib/content";
import "./globals.css";
// Public contact settings must follow administrator changes without rebuilding.
export const dynamic = "force-dynamic";
const body = localFont({ src: "./fonts/dm-sans-latin.woff2", variable: "--font-body", weight: "100 1000", display: "swap", fallback: ["Arial", "sans-serif"] });
const display = localFont({ src: "./fonts/manrope-latin.woff2", variable: "--font-display", weight: "200 800", display: "swap", fallback: ["Arial", "sans-serif"] });
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "CEDAH | Building Value. Growing Communities.",
    template: "%s | CEDAH",
  },
  description:
    "Capital Economic Development Alliance Holdings Ltd. connects grain processing, livestock, vocational skills and market access in Uganda. Explore our objectives and partnership opportunities.",
  applicationName: "CEDAH",
  category: "Agribusiness",
  creator: "Capital Economic Development Alliance Holdings Ltd.",
  publisher: "Capital Economic Development Alliance Holdings Ltd.",
  alternates: { canonical: "/" },
  keywords: [
    "CEDAH",
    "Uganda agribusiness",
    "crop production",
    "beef enterprise",
    "agricultural processing",
    "farmer market access",
    "agricultural investment Uganda",
    "youth employment agriculture",
    "maize processing Uganda",
  ],
  openGraph: {
    title: "CEDAH | From fertile ground to lasting value",
    description:
      "Connecting production, processing, skills and market access. Explore CEDAH’s objectives, development roadmap and partnership opportunities.",
    type: "website",
    locale: "en_UG",
    images: [
      {
        url: "/images/cedah-hero.png",
        width: 2048,
        height: 768,
        alt: "CEDAH crops and beef enterprises",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CEDAH | Building Value. Growing Communities.",
    description: "Uganda’s integrated crop and beef enterprise.",
    images: ["/images/cedah-hero.png"],
  },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.png", apple: "/icon.png" },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
export const viewport: Viewport = {
  themeColor: "#f8fbfa",
  colorScheme: "light dark",
  viewportFit: "cover",
};
async function SiteIdentity() {
  const settings = await getSiteSettings();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.legalName,
    alternateName: "CEDAH",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/images/cedah-logo.png`,
    description:
      "An integrated Ugandan agribusiness group focused initially on crop production and beef, with a roadmap into processing, skills and market access.",
    address: settings.location,
    email: settings.publicEmail,
    telephone: settings.phone,
    sameAs: [process.env.NEXT_PUBLIC_LINKEDIN_URL].filter(Boolean),
  };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /><WhatsAppLink number={settings.whatsapp} /></>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var saved;try{saved=localStorage.getItem('cedah-theme');}catch(e){}var theme=saved==='dark'||saved==='light'?saved:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',theme==='dark'?'#071925':'#f8fbfa');})();`,
          }}
        />
      </head>
      <body className={`${body.variable} ${display.variable}`}>
        {children}
        <Suspense fallback={null}><SiteIdentity /></Suspense>
      </body>
    </html>
  );
}
