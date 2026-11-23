import { langSitemapResponse } from "@/lib/seo";

// Se sirve en /en/sitemap.xml (ver rewrites en next.config.ts): las páginas en inglés.
export function GET() {
  return langSitemapResponse("en");
}
