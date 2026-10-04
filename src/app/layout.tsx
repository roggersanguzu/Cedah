import type { Metadata, Viewport } from "next";
import { DM_Sans, Manrope } from "next/font/google";
import "./globals.css";
const body = DM_Sans({ variable: "--font-body", subsets: ["latin"] });
const display = Manrope({ variable: "--font-display", subsets: ["latin"] });
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "CEDAH | Building Value. Growing Communities.",
    template: "%s | CEDAH",
  },
  description:
    "Capital Economic Development Alliance Holdings Ltd. - integrated crop and beef enterprises creating jobs, markets and sustainable growth in Uganda.",
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
      "Connected agricultural enterprises creating food, markets, skilled jobs and shared prosperity.",
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
  themeColor: "#041f39",
  colorScheme: "light",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Capital Economic Development Alliance Holdings Ltd.",
    alternateName: "CEDAH",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/images/cedah-logo.png`,
    description:
      "An integrated Ugandan agribusiness group focused initially on crop production and beef, with a roadmap into processing, skills and market access.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kampala",
      addressCountry: "UG",
    },
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@cedah.com",
    sameAs: [process.env.NEXT_PUBLIC_LINKEDIN_URL].filter(Boolean),
  };
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${body.variable} ${display.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
