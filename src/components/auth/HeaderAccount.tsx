"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { useT } from "@/components/i18n/LangProvider";

/*
 * Botón de cuenta del encabezado sin parpadeo.
 * El servidor tarda unos milisegundos en confirmar la sesión; mientras tanto se muestra lo que este
 * navegador recuerda de la última vez (solo la inicial del nombre y si es Pro, en localStorage),
 * en vez de "Entrar / Crear cuenta". Cuando llega la respuesta del servidor, se actualiza el recuerdo.
 */

const KEY = "ciberlearn-account";
interface Hint {
  initial: string;
  pro: boolean;
}

function readRaw(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

function parse(raw: string): Hint | null {
  if (!raw) return null;
  try {
    const h = JSON.parse(raw) as Hint;
    return typeof h.initial === "string" ? h : null;
  } catch {
    return null;
  }
}

const noop = () => () => {};

export function GuestLinks({ forget = false }: { forget?: boolean }) {
  const t = useT();
  useEffect(() => {
    if (!forget) return;
    try {
      localStorage.removeItem(KEY);
    } catch {}
  }, [forget]);
  // En celular no caben dos botones: solo "Entrar" (desde ahí también se crea la cuenta).
  // El mostrar/ocultar va en un contenedor: la clase .btn fija su propio display y ganaría.
  return (
    <>
      <span className="sm:hidden">
        <Link href="/entrar" className="btn btn-primary h-9 whitespace-nowrap px-4 text-sm">
          {t("Entrar", "Log in")}
        </Link>
      </span>
      <span className="hidden items-center gap-2 sm:flex">
        <Link href="/entrar" className="rounded-lg px-2 py-2 font-medium text-chalk transition-colors hover:text-brand">
          {t("Entrar", "Log in")}
        </Link>
        <Link href="/registro" className="btn btn-primary h-10 whitespace-nowrap px-5 text-sm">
          {t("Crear cuenta gratis", "Sign up free")}
        </Link>
      </span>
    </>
  );
}

export function AccountPill({ initial, pro, remember = false }: Hint & { remember?: boolean }) {
  const t = useT();
  useEffect(() => {
    if (!remember) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ initial, pro }));
    } catch {}
  }, [remember, initial, pro]);
  return (
    <Link
      href="/progreso"
      className="group flex items-center gap-2.5 rounded-full border border-desk-line py-1 pl-1 pr-3.5 transition-colors hover:border-fog/60"
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-semibold text-white">{initial}</span>
      {/* Con el menú completo (lg) no cabe el texto hasta pantallas anchas (xl) */}
      <span className="hidden whitespace-nowrap text-chalk sm:inline lg:hidden xl:inline">{t("Mi progreso", "My progress")}</span>
      {pro && <span className="rounded-full bg-brand px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">Pro</span>}
    </Link>
  );
}

/** Lo que se ve mientras el servidor confirma la sesión. */
export function AccountFallback() {
  // null en el servidor (no conoce el navegador): un espacio vacío, nunca "Entrar"
  const raw = useSyncExternalStore(noop, readRaw, () => null);
  if (raw === null) return <span aria-hidden className="block h-10 w-10" />;
  const hint = parse(raw);
  return hint ? <AccountPill initial={hint.initial} pro={hint.pro} /> : <GuestLinks />;
}
