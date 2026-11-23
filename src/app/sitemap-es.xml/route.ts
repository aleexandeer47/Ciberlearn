import { langSitemapResponse } from "@/lib/seo";

// Se sirve en /es/sitemap.xml (ver rewrites en next.config.ts): las páginas en español.
export function GET() {
  return langSitemapResponse("es");
}
