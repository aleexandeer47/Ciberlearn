import type { MetadataRoute } from "next";
import { LANGS } from "@/lib/i18n";
import { PUBLIC_PAGES, absolute, languageUrls } from "@/lib/seo";

// /sitemap.xml: cada página pública en español y en inglés, enlazadas entre sí (hreflang).
// Para agregar una página, súmala a PUBLIC_PAGES en src/lib/seo.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PAGES.flatMap(({ path, priority }) => {
    const languages = Object.fromEntries(Object.entries(languageUrls(path)).map(([k, v]) => [k, absolute(v)]));
    return LANGS.map((lang) => ({
      url: absolute(`/${lang}${path}`),
      changeFrequency: path === "/diaria" || path === "/alertas" || path === "/ranking" ? "daily" : "weekly",
      priority,
      alternates: { languages },
    }));
  });
}
