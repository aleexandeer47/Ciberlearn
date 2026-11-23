import type { MetadataRoute } from "next";
import { sitemapEntries } from "@/lib/seo";

// /sitemap.xml: cada página pública en español y en inglés, enlazadas entre sí (hreflang).
// Para agregar una página, súmala a PUBLIC_PAGES en src/lib/seo.ts.
// También existen /es/sitemap.xml y /en/sitemap.xml (src/app/[lang]/sitemap.xml/route.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries();
}
