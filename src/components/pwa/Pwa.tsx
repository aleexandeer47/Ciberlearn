"use client";

import { Download, Share, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useT } from "@/components/i18n/LangProvider";

/** Registra el service worker (solo en producción: en desarrollo estorbaría a la recarga en caliente). */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {});
  }, []);
  return null;
}

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Botón “Instalar app”: Android/Chrome usan el aviso del navegador; en iPhone se explica cómo hacerlo. */
const noSubscribe = () => () => {};
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent);

export function InstallApp({ className = "" }: { className?: string }) {
  const t = useT();
  const [evt, setEvt] = useState<InstallEvent | null>(null);
  const [justInstalled, setJustInstalled] = useState(false);
  const [help, setHelp] = useState(false);
  // En el servidor se asume “instalada” para no mostrar el botón hasta saberlo en el navegador
  const standalone = useSyncExternalStore(noSubscribe, isStandalone, () => true);
  const ios = useSyncExternalStore(noSubscribe, isIos, () => false);
  const installed = standalone || justInstalled;

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallEvent);
    };
    const onInstalled = () => setJustInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || (!evt && !ios)) return null;

  return (
    <span className="relative">
      <button
        type="button"
        onClick={async () => {
          if (evt) {
            await evt.prompt();
            const r = await evt.userChoice;
            if (r.outcome === "accepted") setJustInstalled(true);
            setEvt(null);
          } else setHelp((h) => !h);
        }}
        className={className || "font-medium text-chalk hover:text-brand"}
      >
        <Download className="mr-1 inline h-4 w-4 align-[-3px]" aria-hidden />
        {t("Instalar app", "Install app")}
      </button>
      {help && (
        <span role="dialog" className="absolute bottom-full left-0 z-40 mb-2 block w-72 rounded-2xl border border-desk-line bg-desk-2 p-4 text-left text-sm text-graphite shadow-xl">
          <button type="button" onClick={() => setHelp(false)} className="absolute right-2 top-2 p-1 text-fog" aria-label={t("Cerrar", "Close")}>
            <X className="h-4 w-4" aria-hidden />
          </button>
          {t("En tu iPhone, toca ", "On your iPhone, tap ")}
          <Share className="inline h-4 w-4 align-[-3px]" aria-hidden /> <strong>{t("Compartir", "Share")}</strong>{" "}
          {t("en Safari y luego ", "in Safari and then ")}
          <strong>{t("“Agregar a inicio”", "“Add to Home Screen”")}</strong>.
        </span>
      )}
    </span>
  );
}
