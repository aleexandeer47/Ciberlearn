"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { useT } from "@/components/i18n/LangProvider";
import { LEGAL } from "@/lib/legal";
import { SITE } from "@/lib/site";

/*
 * Google Analytics (por Google Tag Manager) SOLO con permiso. Hasta que la persona acepta,
 * no se carga ningún script de Google ni se guarda ninguna cookie de analítica.
 * La decisión se guarda en este navegador y se puede cambiar desde “Preferencias de cookies” en el pie.
 */

export const CONSENT_KEY = "ciberlearn-analytics";
const EVENT = "ciberlearn-consent-change";
type Choice = "granted" | "denied" | null;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function read(): Choice {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return "denied";
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

export function setAnalyticsConsent(choice: "granted" | "denied" | null) {
  try {
    if (choice) localStorage.setItem(CONSENT_KEY, choice);
    else localStorage.removeItem(CONSENT_KEY);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

let loaded = false;
function loadGtm(id: string) {
  if (loaded) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  // Snippet de Google: gtag() pone sus argumentos en dataLayer
  // Google espera el objeto `arguments`, no un arreglo
  const gtag: (...args: unknown[]) => void = function () {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "granted" });
  gtag("js", new Date());
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(s);
}

/** Aviso de cookies + carga de Google Tag Manager cuando hay permiso (solo en producción). */
export function Analytics() {
  const t = useT();
  const choice = useSyncExternalStore(subscribe, read, () => "denied" as Choice);
  const id = SITE.gtmId;
  const active = process.env.NODE_ENV === "production" && !!id;

  useEffect(() => {
    if (active && choice === "granted") loadGtm(id);
  }, [active, choice, id]);

  // Si la persona retira el permiso, se recarga la página para que Google deje de medir
  useEffect(() => {
    if (choice === "denied" && loaded) window.location.reload();
  }, [choice]);

  if (!active || choice !== null) return null;

  return (
    <div
      role="dialog"
      aria-label={t("Aviso de cookies", "Cookie notice")}
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-3xl border border-desk-line bg-desk-2 p-5 shadow-2xl sm:inset-x-6"
    >
      <p className="text-sm leading-relaxed text-graphite">
        {t(
          "Usamos Google Analytics para saber, de forma agregada, cómo se usa el sitio y mejorarlo. Solo lo activamos si aceptas. Puedes cambiar de opinión cuando quieras.",
          "We use Google Analytics to understand, in aggregate, how the site is used and improve it. We only turn it on if you accept. You can change your mind anytime.",
        )}{" "}
        <Link href={LEGAL.cookies.path} className="font-medium text-chalk underline underline-offset-2">
          {t("Más información", "Learn more")}
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setAnalyticsConsent("granted")} className="btn btn-primary h-10 px-5 text-sm">
          {t("Aceptar", "Accept")}
        </button>
        <button type="button" onClick={() => setAnalyticsConsent("denied")} className="btn btn-ghost h-10 px-5 text-sm">
          {t("Rechazar", "Reject")}
        </button>
      </div>
    </div>
  );
}

/** Enlace del pie para volver a decidir. */
export function CookiePrefsLink() {
  const t = useT();
  if (!SITE.gtmId) return null;
  return (
    <button type="button" onClick={() => setAnalyticsConsent(null)} className="font-medium text-chalk hover:text-brand">
      {t("Preferencias de cookies", "Cookie preferences")}
    </button>
  );
}
