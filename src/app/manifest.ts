import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Capital Economic Development Alliance Holdings Ltd.",
    short_name: "CEDAH",
    description:
      "Integrated agribusiness creating jobs, markets and sustainable growth.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f8fa",
    theme_color: "#041f39",
    icons: [{ src: "/icon.png", sizes: "1024x1024", type: "image/png" }],
  };
}
