// Idiomas del sitio. Sin dependencias de servidor: se usa en cliente, servidor y proxy.
//
// Cómo se elige el idioma (ver src/proxy.ts):
//  1. /en/... o /es/... en la URL (enlaces para compartir).
//  2. La cookie "lang" (la pone el selector ES/EN o la primera visita).
//  3. El idioma del navegador: español si lo prefiere; si no, inglés.
// Las direcciones de siempre (/ruta, /planes...) sirven en los dos idiomas.

export const LANGS = ["es", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "es";
export const LANG_COOKIE = "lang";
export const LANG_HEADER = "x-lang";

export const isLang = (v: unknown): v is Lang => v === "es" || v === "en";

/** Elige entre la versión en español y la versión en inglés. */
export type T = <V>(es: V, en: V) => V;
export const translator =
  (lang: Lang): T =>
  (es, en) =>
    lang === "en" ? en : es;

/** Configuración regional para fechas y números. */
export const LOCALE: Record<Lang, string> = { es: "es", en: "en-US" };

export const LANG_NAME: Record<Lang, string> = { es: "Español", en: "English" };

/**
 * Idioma según la cabecera Accept-Language: el primero (por preferencia) que sea
 * español o inglés. Cualquier otro idioma (francés, portugués...) recibe inglés.
 */
export function negotiate(acceptLanguage: string | null | undefined): Lang {
  if (!acceptLanguage) return DEFAULT_LANG;
  const prefs = acceptLanguage
    .split(",")
    .map((part, i) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { base: tag.split("-")[0], q: q ? Number(q.trim().slice(2)) || 0 : 1, i };
    })
    .filter((p) => p.base && p.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  for (const p of prefs) if (isLang(p.base)) return p.base;
  return prefs.length ? "en" : DEFAULT_LANG;
}

/** Quita /es o /en del inicio de una ruta: "/en/ruta" -> "/ruta". */
export function stripLang(pathname: string) {
  const seg = pathname.split("/")[1];
  if (!isLang(seg)) return pathname;
  const rest = pathname.slice(seg.length + 1);
  return rest || "/";
}
