"use client";

import { useEffect } from "react";

/** Al abrir la ruta con avance, baja hasta la lección actual (sin animación si se pidió menos movimiento). */
export function ScrollToCurrent({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    const el = document.getElementById("leccion-actual");
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }), 350);
    return () => clearTimeout(t);
  }, [enabled]);
  return null;
}
