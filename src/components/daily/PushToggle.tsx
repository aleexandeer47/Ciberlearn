"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { deletePushSub, savePushSub } from "@/app/actions/push";
import { useT } from "@/components/i18n/LangProvider";

const KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function keyBytes(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function registration() {
  return (await navigator.serviceWorker.getRegistration("/")) ?? navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

type State = "loading" | "unsupported" | "off" | "on" | "denied";

/** Recordatorio diario de la estafa del día por notificación (funciona sin cuenta). */
export function PushToggle() {
  const t = useT();
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  // Por qué no se pudo activar (antes volvía a "Activar" sin decir nada)
  const [error, setError] = useState("");

  useEffect(() => {
    const supported = KEY && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    if (!supported) {
      Promise.resolve().then(() => setState("unsupported"));
      return;
    }
    if (Notification.permission === "denied") {
      Promise.resolve().then(() => setState("denied"));
      return;
    }
    navigator.serviceWorker
      .getRegistration("/")
      .then((r) => r?.pushManager.getSubscription())
      .then((s) => setState(s ? "on" : "off"))
      .catch(() => setState("off"));
  }, []);

  if (state === "loading" || state === "unsupported") return null;

  const enable = async () => {
    setBusy(true);
    setError("");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "denied" : "off");
        return;
      }
      const reg = await registration();
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(KEY) });
      const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const r = await savePushSub({ endpoint: json.endpoint, keys: json.keys });
      if (r.ok) {
        setState("on");
        return;
      }
      // El navegador quedó suscrito pero el servidor no lo guardó: se deshace para no quedar a medias
      await sub.unsubscribe().catch(() => {});
      setState("off");
      setError(
        r.reason === "config"
          ? t("Las notificaciones todavía no están activadas en el sitio. Inténtalo más tarde.", "Notifications aren't enabled on the site yet. Please try again later.")
          : t("Tu navegador dio una suscripción que no pudimos guardar. Inténtalo de nuevo.", "Your browser returned a subscription we couldn't save. Please try again."),
      );
    } catch (e) {
      console.error("[push]", e);
      setState("off");
      setError(
        t(
          "Tu navegador no permitió activar las notificaciones. Revisa que no estés en modo incógnito y que el sitio tenga permiso de notificaciones.",
          "Your browser didn't allow notifications. Make sure you're not in private mode and that the site has notification permission.",
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const sub = await (await navigator.serviceWorker.getRegistration("/"))?.pushManager.getSubscription();
      if (sub) {
        await deletePushSub(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-desk-line bg-desk-2 p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-field text-brand">
          {state === "on" ? <Bell className="h-5 w-5" aria-hidden /> : <BellOff className="h-5 w-5" aria-hidden />}
        </span>
        <div>
          <p className="font-semibold">{t("Recordatorio diario", "Daily reminder")}</p>
          <p className="text-sm text-fog">
            {state === "on"
              ? t("Activado: te avisamos cada día con el caso nuevo.", "On: we'll notify you every day with the new case.")
              : state === "denied"
                ? t("Bloqueaste las notificaciones de este sitio en tu navegador.", "You blocked notifications for this site in your browser.")
                : t("Una notificación al día para no perder tu racha.", "One notification a day so you don't lose your streak.")}
          </p>
          {error && (
            <p role="alert" className="mt-1 text-sm text-bad-text">
              {error}
            </p>
          )}
        </div>
      </div>
      {state !== "denied" && (
        <button type="button" onClick={state === "on" ? disable : enable} disabled={busy} className={`btn h-10 px-4 text-sm ${state === "on" ? "btn-ghost" : "btn-primary"} disabled:opacity-60`}>
          {state === "on" ? t("Desactivar", "Turn off") : t("Activar", "Turn on")}
        </button>
      )}
    </div>
  );
}
