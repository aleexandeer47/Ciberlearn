import { cookies, headers } from "next/headers";
import { lang as rootLang } from "next/root-params";
import { DEFAULT_LANG, isLang, LANG_COOKIE, LANG_HEADER, negotiate, translator, type Lang } from "@/lib/i18n";

/** Idioma de la página actual (componentes de servidor, layouts y generateMetadata). */
export async function getLang(): Promise<Lang> {
  const l = await rootLang();
  return isLang(l) ? l : DEFAULT_LANG;
}

/** { lang, t } para la página actual. */
export async function getT() {
  const lang = await getLang();
  return { lang, t: translator(lang) };
}

/**
 * Idioma de la petición para Server Actions y Route Handlers, donde no hay
 * parámetros de ruta: cabecera que pone el proxy, luego cookie, luego navegador.
 */
export async function requestLang(): Promise<Lang> {
  const h = await headers();
  const fromProxy = h.get(LANG_HEADER);
  if (isLang(fromProxy)) return fromProxy;
  const c = (await cookies()).get(LANG_COOKIE)?.value;
  if (isLang(c)) return c;
  return negotiate(h.get("accept-language"));
}

export async function requestT() {
  const lang = await requestLang();
  return { lang, t: translator(lang) };
}
