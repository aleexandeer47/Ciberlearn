import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// El manifiesto es uno solo para los dos idiomas: nombre de marca y textos cortos.
// Las páginas que abre (/ruta, /diaria...) salen en el idioma de cada persona.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: `${SITE.description.es} / ${SITE.description.en}`,
    start_url: "/ruta",
    scope: "/",
    display: "standalone",
    background_color: "#0a0f1c",
    theme_color: "#2563eb",
    categories: ["education", "security"],
    icons: [
      { src: "/app-icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/app-icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/app-icon?size=512&maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Hoy · Today", url: "/diaria" },
      { name: "Ruta · Path", url: "/ruta" },
      { name: "Alertas · Alerts", url: "/alertas" },
    ],
  };
}
