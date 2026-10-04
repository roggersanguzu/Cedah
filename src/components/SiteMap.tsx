"use client";

import { useState } from "react";
import Image from "next/image";

export type PublicSite = { slug: string; title: string; location: string; summary: string; latitude: number; longitude: number; stage: string; image?: string };

export default function SiteMap({ sites }: { sites: PublicSite[] }) {
  const [selected, setSelected] = useState(sites[0]?.slug || "");
  const [loaded, setLoaded] = useState(false);
  const site = sites.find((item) => item.slug === selected) || sites[0];
  if (!site) return null;
  const bbox = [Math.max(-180, site.longitude - 0.08), Math.max(-90, site.latitude - 0.05), Math.min(180, site.longitude + 0.08), Math.min(90, site.latitude + 0.05)].join(",");
  const url = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${site.latitude}%2C${site.longitude}`;
  return <div className="site-map-grid">
    <div className="site-map-list" role="group" aria-label="Select an operating site">
      {sites.map((item) => <button key={item.slug} type="button" aria-pressed={site.slug === item.slug} onClick={() => setSelected(item.slug)}><span className="platform-badge">{item.stage || "Site"}</span><strong>{item.title}</strong><span>{item.location}</span></button>)}
    </div>
    <div className="site-map-detail">
      <h3>{site.title}</h3><p>{site.summary}</p>
      {site.image && <Image src={site.image} alt={site.title} width={800} height={450} className="record-preview-image" unoptimized />}
      {loaded ? <iframe title={`Map of ${site.title}`} src={url} loading="lazy" referrerPolicy="no-referrer" /> : <div className="map-placeholder"><p>View the published location on an interactive OpenStreetMap.</p><button className="platform-button" onClick={() => setLoaded(true)}>Load map</button></div>}
      <a className="platform-link" href={`https://www.openstreetmap.org/?mlat=${site.latitude}&mlon=${site.longitude}#map=13/${site.latitude}/${site.longitude}`} target="_blank" rel="noopener noreferrer">Open larger map ↗</a>
    </div>
  </div>;
}
