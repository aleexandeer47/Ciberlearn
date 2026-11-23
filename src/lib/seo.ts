// Datos para buscadores: dirección oficial (canónica) de cada página y su versión en el otro idioma.
// Lo usan el generateMetadata de cada página pública, src/app/sitemap.ts y src/app/robots.ts.

import type { Metadata } from "next";
import { LANGS, type Lang } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { SITE } from "@/lib/site";

/** Páginas públicas que deben salir en Google (con su prioridad en el sitemap). */
export const PUBLIC_PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/simulador", priority: 0.9 },
  { path: "/revisar", priority: 0.9 },
  { path: "/ruta", priority: 0.8 },
  { path: "/diaria", priority: 0.8 },
  { path: "/bandeja", priority: 0.7 },
  { path: "/llamadas", priority: 0.7 },
  { path: "/alertas", priority: 0.7 },
  { path: "/mayores", priority: 0.7 },
  { path: "/reto", priority: 0.6 },
  { path: "/ranking", priority: 0.6 },
  { path: "/ia", priority: 0.6 },
  { path: "/planes", priority: 0.6 },
  { path: "/empresa", priority: 0.6 },
  { path: "/familia", priority: 0.5 },
  { path: "/clase", priority: 0.5 },
  { path: "/registro", priority: 0.4 },
  { path: "/entrar", priority: 0.3 },
  { path: "/terminos", priority: 0.2 },
  { path: "/privacidad", priority: 0.2 },
  { path: "/cookies", priority: 0.2 },
  { path: "/reembolsos", priority: 0.2 },
];

/** Rutas privadas o de un solo uso que no deben rastrearse (también llevan noindex en su página). */
export const PRIVATE_PATHS = [
  "/api/",
  "/admin",
  "/progreso",
  "/certificado",
  "/pago/",
  "/simulacro/",
  "/recuperar",
  "/restablecer",
  "/offline",
  "/empresa/informe",
  "/empresa/unirse/",
  "/familia/unirse/",
];

/** Dirección absoluta en el dominio oficial. */
export const absolute = (path: string) => `${SITE.url}${path || "/"}`;

/** Las versiones de una página en cada idioma; "x-default" es la dirección sin idioma (elige según el navegador). */
export const languageUrls = (path: string) => ({
  ...Object.fromEntries(LANGS.map((l) => [l, `/${l}${path}`])),
  "x-default": path || "/",
});

/**
 * Entradas del sitemap: todas, o solo las de un idioma (para /es/sitemap.xml y /en/sitemap.xml).
 * Sin hreflang: ese enlace entre idiomas ya va en el <head> de cada página (alternatesFor), y
 * ponerlo también aquí hace que el navegador muestre el sitemap como texto suelto.
 */
export function sitemapEntries(only?: Lang) {
  return PUBLIC_PAGES.flatMap(({ path, priority }) =>
    LANGS.filter((l) => !only || l === only).map((lang) => ({
      url: absolute(`/${lang}${path}`),
      changeFrequency: (path === "/diaria" || path === "/alertas" || path === "/ranking" ? "daily" : "weekly") as
        | "daily"
        | "weekly",
      priority,
    })),
  );
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/** Respuesta XML del sitemap de un idioma (src/app/sitemap-es.xml y sitemap-en.xml). */
export function langSitemapResponse(lang: Lang) {
  const urls = sitemapEntries(lang)
    .map((e) =>
      [
        "<url>",
        `<loc>${esc(e.url)}</loc>`,
        `<changefreq>${e.changeFrequency}</changefreq>`,
        `<priority>${e.priority}</priority>`,
        "</url>",
      ].join("\n"),
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}

/** canonical + hreflang para el generateMetadata de una página pública. */
export async function alternatesFor(path: string): Promise<Metadata["alternates"]> {
  const lang = await getLang();
  return { canonical: `/${lang}${path}`, languages: languageUrls(path) };
}
