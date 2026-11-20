"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Anima un número hasta `target` con ease-out. Respeta prefers-reduced-motion.
 *
 * Anima siempre desde el valor que se está mostrando (shownRef), no desde el
 * objetivo anterior. Así funciona aunque el efecto se cancele y se repita, como
 * hace React en desarrollo (StrictMode) o cuando el objetivo cambia a media animación.
 */
export function useCountUp(target: number, duration = 700, initial = target) {
  const [value, setValue] = useState(initial);
  const shownRef = useRef(initial);

  useEffect(() => {
    const from = shownRef.current;
    if (from === target) return;
    const ms = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
    const start = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = ms === 0 ? 1 : Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 4);
      const v = Math.round(from + (target - from) * eased);
      shownRef.current = v;
      setValue(v);
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}
