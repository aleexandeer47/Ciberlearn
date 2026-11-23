import { isLang } from "@/lib/i18n";
import { sitemapEntries } from "@/lib/seo";

// /es/sitemap.xml y /en/sitemap.xml: las páginas de ese idioma (un sitemap solo puede listar
// direcciones dentro de su carpeta). El sitemap completo está en /sitemap.xml.

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

export async function GET(_req: Request, ctx: RouteContext<"/[lang]/sitemap.xml">) {
  const { lang } = await ctx.params;
  if (!isLang(lang)) return new Response("Not found", { status: 404 });

  const urls = sitemapEntries(lang)
    .map((e) =>
      [
        "<url>",
        `<loc>${esc(e.url)}</loc>`,
        ...Object.entries(e.alternates.languages).map(
          ([hl, href]) => `<xhtml:link rel="alternate" hreflang="${hl}" href="${esc(href)}" />`,
        ),
        `<changefreq>${e.changeFrequency}</changefreq>`,
        `<priority>${e.priority}</priority>`,
        "</url>",
      ].join("\n"),
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
