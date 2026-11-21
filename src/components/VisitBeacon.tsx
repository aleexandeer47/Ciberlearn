"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { dayKey } from "@/lib/dayKey";

const KEY = "ciberlearn-visit-day";

/** Avisa una visita por navegador y por día. No cuenta recargas ni las páginas de admin. */
export function VisitBeacon() {
  const path = usePathname();

  useEffect(() => {
    if (path?.startsWith("/admin")) return;
    const today = dayKey();
    try {
      if (localStorage.getItem(KEY) === today) return;
      localStorage.setItem(KEY, today);
    } catch {
      return; // sin almacenamiento no podemos evitar contar dos veces: mejor no contar
    }
    fetch("/api/visit", { method: "POST", keepalive: true }).catch(() => {});
  }, [path]);

  return null;
}
