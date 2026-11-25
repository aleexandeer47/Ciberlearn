"use client";

import { LogIn, LogOut, Monitor, Moon, Settings, Sun, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { logout } from "@/app/actions/auth";
import { setAnalyticsConsent } from "@/components/analytics/Analytics";
import { useAccountHint } from "@/components/auth/HeaderAccount";
import { PushToggle } from "@/components/daily/PushToggle";
import { switchLang, useLang, useT } from "@/components/i18n/LangProvider";
import { InstallApp } from "@/components/pwa/Pwa";
import { setSimpleMode, useSimpleMode } from "@/components/theme/SimpleMode";
import type { ThemePref } from "@/components/theme/theme";
import { setThemePref, useThemePref } from "@/components/theme/ThemeToggle";
import { setSoundEnabled, useSoundEnabled } from "@/lib/sfx";

/** Interruptor accesible (role="switch"). */
function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? "bg-brand" : "bg-desk-line"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left] duration-150 ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-chalk">{label}</p>
        {hint && <p className="text-xs text-fog">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Segmented<V extends string>({ value, options, onChange, label }: { value: V; options: { v: V; label: string; icon?: React.ReactNode }[]; onChange: (v: V) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-xl bg-desk p-1">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
            value === o.v ? "bg-desk-2 text-chalk shadow-sm ring-1 ring-desk-line" : "text-fog hover:text-chalk"
          }`}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** La tuerca del encabezado: todas las preferencias en un solo panel. */
export function SettingsMenu() {
  const t = useT();
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const id = useId();
  const theme = useThemePref();
  const simple = useSimpleMode();
  const sound = useSoundEnabled();
  const account = useAccountHint();

  // Cerrar con Escape o tocando fuera
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      const el = e.target as Node;
      if (!panel.current?.contains(el) && !button.current?.contains(el)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const THEMES: { v: ThemePref; label: string; icon: React.ReactNode }[] = [
    { v: "system", label: t("Sistema", "System"), icon: <Monitor className="h-3.5 w-3.5" aria-hidden /> },
    { v: "light", label: t("Claro", "Light"), icon: <Sun className="h-3.5 w-3.5" aria-hidden /> },
    { v: "dark", label: t("Oscuro", "Dark"), icon: <Moon className="h-3.5 w-3.5" aria-hidden /> },
  ];

  return (
    <div className="relative">
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        aria-label={t("Configuración", "Settings")}
        title={t("Configuración", "Settings")}
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-full transition-[color,background-color,transform] duration-150 active:scale-95 sm:h-10 sm:w-10 ${
          open ? "bg-desk-3 text-chalk" : "text-fog hover:bg-desk-3 hover:text-chalk"
        }`}
      >
        <Settings className={`h-[18px] w-[18px] transition-transform duration-300 ${open ? "rotate-90" : ""}`} strokeWidth={1.8} aria-hidden />
      </button>

      {open && (
        <div
          ref={panel}
          id={id}
          role="dialog"
          aria-label={t("Configuración", "Settings")}
          className="pop-in fixed inset-x-3 top-[4.25rem] z-50 max-h-[calc(100svh-5rem)] overflow-y-auto rounded-3xl border border-desk-line bg-desk-2 p-5 shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[340px]"
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="font-display text-lg font-semibold">{t("Configuración", "Settings")}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label={t("Cerrar", "Close")} className="grid h-8 w-8 place-items-center rounded-full text-fog hover:bg-desk-3 hover:text-chalk">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-fog">{t("Apariencia", "Appearance")}</p>
          <div className="mt-2">
            <Segmented value={theme} options={THEMES} onChange={setThemePref} label={t("Tema", "Theme")} />
          </div>
          <Row label={t("Letra grande", "Large text")} hint={t("Textos y botones más grandes", "Bigger text and buttons")}>
            <Switch on={simple} onChange={setSimpleMode} label={t("Letra grande", "Large text")} />
          </Row>
          <Row label={t("Sonidos", "Sounds")} hint={t("Al acertar, fallar y en las llamadas", "On right and wrong answers and in calls")}>
            <Switch on={sound !== false} onChange={setSoundEnabled} label={t("Sonidos", "Sounds")} />
          </Row>

          <div className="my-3 h-px bg-desk-line" />
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fog">{t("Idioma", "Language")}</p>
          <div className="mt-2">
            <Segmented
              value={lang}
              options={[
                { v: "es", label: "Español" },
                { v: "en", label: "English" },
              ]}
              onChange={(v) => v !== lang && switchLang(v)}
              label={t("Idioma", "Language")}
            />
          </div>

          <div className="my-3 h-px bg-desk-line" />
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fog">{t("Recordatorio diario", "Daily reminder")}</p>
          <div className="mt-2">
            <PushToggle />
          </div>

          <div className="my-3 h-px bg-desk-line" />
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fog">{t("Privacidad", "Privacy")}</p>
          <div className="mt-1 flex flex-col items-start gap-1 text-sm">
            <button type="button" onClick={() => setAnalyticsConsent(null)} className="py-1.5 font-medium text-chalk hover:text-brand">
              {t("Preferencias de cookies", "Cookie preferences")}
            </button>
            <InstallApp className="py-1.5 font-medium text-chalk hover:text-brand" />
          </div>

          <div className="my-3 h-px bg-desk-line" />
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-fog">{t("Cuenta", "Account")}</p>
          <div className="mt-2 flex flex-col gap-2">
            {account ? (
              <>
                <Link href="/progreso" onClick={() => setOpen(false)} className="btn btn-ghost h-10 justify-start px-4 text-sm">
                  <UserRound className="h-4 w-4" aria-hidden /> {t("Mi progreso", "My progress")}
                  {account.pro && <span className="ml-auto rounded-full bg-brand px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">Pro</span>}
                </Link>
                <form action={logout}>
                  <button type="submit" className="btn h-10 w-full justify-start px-4 text-sm text-bad-text hover:bg-bad/10">
                    <LogOut className="h-4 w-4" aria-hidden /> {t("Cerrar sesión", "Log out")}
                  </button>
                </form>
              </>
            ) : (
              <Link href="/entrar" onClick={() => setOpen(false)} className="btn btn-primary h-10 px-4 text-sm">
                <LogIn className="h-4 w-4" aria-hidden /> {t("Entrar o crear cuenta", "Log in or sign up")}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
