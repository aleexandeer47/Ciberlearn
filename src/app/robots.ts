import type { MetadataRoute } from "next";
import { LANGS } from "@/lib/i18n";
import { PRIVATE_PATHS, absolute } from "@/lib/seo";

// /robots.txt: deja rastrear todo lo público y le indica a Google dónde está el sitemap.
export default function robots(): MetadataRoute.Robots {
  const disallow = [
    ...PRIVATE_PATHS,
    ...LANGS.flatMap((l) => PRIVATE_PATHS.filter((p) => p !== "/api/").map((p) => `/${l}${p}`)),
  ];
  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: absolute("/sitemap.xml"),
    host: absolute(""),
  };
}
