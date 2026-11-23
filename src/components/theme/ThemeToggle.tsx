"use client";

import { useSyncExternalStore } from "react";
import { useT } from "@/components/i18n/LangProvider";
import { THEME_KEY, type ThemePref } from "./theme";

const ORDER: ThemePref[] = ["system", "light", "dark"];
const EVENT = "ciberlearn-theme-change";
const media = () => window.matchMedia("(prefers-color-scheme: dark)");

function read(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

function apply(pref: ThemePref) {
  const dark = pref === "dark" || (pref === "system" && media().matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
}

function subscribe(cb: () => void) {
  // Si el tema es "Sistema", seguir los cambios del sistema operativo en vivo.
  const onMedia = () => {
    if (read() === "system") apply("system");
    cb();
  };
  const mq = media();
  mq.addEventListener("change", onMedia);
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    mq.removeEventListener("change", onMedia);
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

function Icon({ pref }: { pref: ThemePref }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (pref === "light")
    return (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
        <circle cx="12" cy="12" r="4" {...common} />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" {...common} />
      </svg>
    );
  if (pref === "dark")
    return (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" {...common} />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <rect x="3" y="4" width="18" height="12" rx="2" {...common} />
      <path d="M8 20h8M12 16v4" {...common} />
    </svg>
  );
}

/** Botón que cambia entre Sistema → Claro → Oscuro. */
export function ThemeToggle() {
  const pref = useSyncExternalStore(subscribe, read, () => "system" as ThemePref);
  const next = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
  const t = useT();
  const LABEL: Record<ThemePref, string> = { system: t("Sistema", "System"), light: t("Claro", "Light"), dark: t("Oscuro", "Dark") };

  const onClick = () => {
    try {
      if (next === "system") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, next);
    } catch {}
    apply(next);
    window.dispatchEvent(new Event(EVENT));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t(`Tema: ${LABEL[pref]}. Cambiar a ${LABEL[next]}`, `Theme: ${LABEL[pref]}. Switch to ${LABEL[next]}`)}
      title={t(`Tema: ${LABEL[pref]}`, `Theme: ${LABEL[pref]}`)}
      className="grid h-10 w-10 place-items-center rounded-full text-fog transition-[color,background-color,transform] duration-150 hover:bg-desk-3 hover:text-chalk active:scale-95"
    >
      <Icon pref={pref} />
    </button>
  );
}
