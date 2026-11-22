import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name}: aprende a detectar estafas`,
    short_name: SITE.name,
    description: SITE.description,
    lang: "es-SV",
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
      { name: "La estafa del día", url: "/diaria" },
      { name: "Ruta guiada", url: "/ruta" },
      { name: "Alertas de estafas", url: "/alertas" },
    ],
  };
}
