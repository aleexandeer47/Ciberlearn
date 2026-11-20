"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Firma de Ciberlearn: un trazo a mano bajo la palabra clave de un título,
 * como la marca de un revisor. Se dibuja una sola vez al entrar en pantalla.
 * El estado se escribe directo en el DOM (data-drawn) para no re-renderizar.
 */
export function Mark({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.drawn = "true";
          io.disconnect();
        }
      },
      { threshold: 0.8 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <span ref={ref} className="mark">
      {children}
      <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden>
        <path d="M3 9.6c28-3.6 60-6.2 97-5.4 35 .8 66 2.9 97 1.4" pathLength={1} />
      </svg>
    </span>
  );
}
