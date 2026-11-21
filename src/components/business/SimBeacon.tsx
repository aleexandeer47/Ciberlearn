"use client";

import { useEffect } from "react";
import { markSimClicked } from "@/app/actions/org";

/**
 * Registra el clic desde el navegador, no al cargar la página en el servidor: los filtros de
 * correo que abren los enlaces para revisarlos no ejecutan JavaScript y no cuentan como clic.
 */
export function SimBeacon({ token }: { token: string }) {
  useEffect(() => {
    const t = setTimeout(() => void markSimClicked(token), 800);
    return () => clearTimeout(t);
  }, [token]);
  return null;
}
