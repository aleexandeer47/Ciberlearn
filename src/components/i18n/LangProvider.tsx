"use client";

import { createContext, use } from "react";
import { DEFAULT_LANG, LANG_COOKIE, translator, stripLang, type Lang } from "@/lib/i18n";

const LangContext = createContext<Lang>(DEFAULT_LANG);

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangContext value={lang}>{children}</LangContext>;
}

export const useLang = () => use(LangContext);

/** t("español", "English") en componentes de cliente. */
export function useT() {
  return translator(useLang());
}

/** Cambia el idioma: guarda la cookie y recarga la misma página en el otro idioma. */
export function switchLang(next: Lang) {
  document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  const { pathname, search, hash } = window.location;
  const bare = stripLang(pathname);
  // Si la URL tenía /es o /en, se cambia el prefijo; si no, se queda igual.
  const target = bare === pathname ? pathname : `/${next}${bare === "/" ? "" : bare}`;
  window.location.assign(target + search + hash);
}

/** Botón ES/EN del encabezado. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const lang = useLang();
  const next: Lang = lang === "es" ? "en" : "es";
  return (
    <button
      type="button"
      onClick={() => switchLang(next)}
      className={`grid h-9 min-w-9 place-items-center rounded-full border border-desk-line px-2 font-mono text-xs font-semibold text-chalk transition-colors hover:border-fog/60 hover:text-brand ${className}`}
      aria-label={lang === "es" ? "Switch to English" : "Cambiar a español"}
      title={lang === "es" ? "English" : "Español"}
      lang={next}
    >
      {next.toUpperCase()}
    </button>
  );
}
