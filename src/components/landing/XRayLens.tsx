"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/*
 * Dos capas con filas de la MISMA altura: el correo tal como se ve y su
 * "radiografía". La capa de rayos X se recorta con un círculo que sigue al
 * puntero (variables CSS, sin re-render). Pasar la lupa por una fila la
 * cuenta como pista descubierta.
 */

interface Row {
  h: string;
  surface: ReactNode;
  xray: ReactNode;
  clue?: string;
}

// En la radiografía: rojo = lo que delata la trampa, azul = el dato correcto.
const Truth = ({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "danger" }) => (
  <span className={tone === "danger" ? "font-semibold text-[#ff8a8a]" : "text-accent"}>{children}</span>
);

const ROWS: Row[] = [
  {
    h: "h-[84px]",
    clue: "Remitente falso",
    surface: (
      <div className="flex h-full items-center gap-3 border-b border-line px-5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0f4c81] font-semibold text-sm text-white">
          BI
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-ink">Banco Izalco</p>
          <p className="truncate font-mono text-xs text-ink-2">seguridad@bancoizalco-alertas.com</p>
        </div>
        <span className="ml-auto text-xs text-ink-3">7:42</span>
      </div>
    ),
    xray: (
      <div className="flex h-full flex-col justify-center border-b border-white/10 px-5 font-mono text-xs leading-relaxed">
        <p className="text-fog">remitente real:</p>
        <p>
          seguridad@<Truth tone="danger">bancoizalco-alertas.com</Truth>
        </p>
        <p className="text-fog">
          el banco usa <Truth>bancoizalco.com.sv</Truth>
        </p>
      </div>
    ),
  },
  {
    h: "h-[72px]",
    clue: "Urgencia",
    surface: (
      <div className="flex h-full items-center px-5">
        <p className="font-semibold leading-snug text-ink">URGENTE: su cuenta será bloqueada en 24 horas</p>
      </div>
    ),
    xray: (
      <div className="flex h-full items-center px-5 font-mono text-xs">
        <p>
          <Truth tone="danger">presión:</Truth> te quieren apurar para que no pienses
        </p>
      </div>
    ),
  },
  {
    h: "h-[48px]",
    clue: "Saludo genérico",
    surface: (
      <div className="flex h-full items-center px-5 text-ink">
        <p>Estimado cliente:</p>
      </div>
    ),
    xray: (
      <div className="flex h-full items-center px-5 font-mono text-xs">
        <p>
          <Truth>¿y tu nombre?</Truth> → enviado a miles a la vez
        </p>
      </div>
    ),
  },
  {
    h: "h-[76px]",
    surface: (
      <div className="flex h-full items-center px-5 text-[15px] leading-relaxed text-ink-2">
        <p>Detectamos actividad inusual. Verifique su identidad para evitar la suspensión de su cuenta.</p>
      </div>
    ),
    xray: (
      <div className="flex h-full items-center px-5 font-mono text-xs leading-relaxed text-fog">
        <p>texto de relleno: suena serio, pero no dice nada concreto</p>
      </div>
    ),
  },
  {
    h: "h-[72px]",
    clue: "Enlace engañoso",
    surface: (
      <div className="flex h-full items-center px-5">
        <span className="rounded-lg bg-[#0f4c81] px-5 py-2.5 text-sm font-semibold text-white">Verificar mi cuenta</span>
      </div>
    ),
    xray: (
      <div className="flex h-full flex-col justify-center px-5 font-mono text-xs leading-relaxed">
        <p className="text-fog">el botón lleva a:</p>
        <p className="break-all">
          http://bancoizalco.<Truth tone="danger">verificar-cuenta.co</Truth>/login
        </p>
      </div>
    ),
  },
  {
    h: "h-[64px]",
    clue: "Pide tu clave",
    surface: (
      <div className="flex h-full items-center border-t border-line px-5 text-sm text-ink-2">
        <p>Tenga a mano su usuario, contraseña y el código SMS.</p>
      </div>
    ),
    xray: (
      <div className="flex h-full items-center border-t border-white/10 px-5 font-mono text-xs">
        <p>
          <Truth tone="danger">clave + código</Truth> = te vacían la cuenta
        </p>
      </div>
    ),
  },
];

const CLUE_ROWS = ROWS.map((r, i) => (r.clue ? i : -1)).filter((i) => i >= 0);

export function XRayLens() {
  const stageRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [full, setFull] = useState(false);
  const foundRef = useRef(found);
  useEffect(() => {
    foundRef.current = found;
  }, [found]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cur = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let active = false;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let raf = 0;
    const t0 = performance.now();

    const place = () => {
      const r = stage.getBoundingClientRect();
      cur.x = target.x = r.width * 0.55;
      cur.y = target.y = r.height * 0.62;
    };
    place();

    const hitRow = (y: number) => {
      rowRefs.current.forEach((el, i) => {
        if (!el || !ROWS[i].clue || foundRef.current.has(i)) return;
        if (y >= el.offsetTop && y <= el.offsetTop + el.offsetHeight) {
          setFound((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
        }
      });
    };

    const tick = (now: number) => {
      const r = stage.getBoundingClientRect();
      if (!active && !reduce) {
        // Paseo lento en forma de 8 mientras nadie la toca.
        const t = (now - t0) / 1000;
        target.x = r.width * (0.5 + 0.32 * Math.sin(t * 0.55));
        target.y = r.height * (0.5 + 0.36 * Math.sin(t * 0.37 + 1));
      }
      // Interpolación suave: la lente tiene "peso" en vez de pegarse al cursor.
      const k = reduce ? 1 : 0.16;
      cur.x += (target.x - cur.x) * k;
      cur.y += (target.y - cur.y) * k;
      stage.style.setProperty("--lx", `${cur.x}px`);
      stage.style.setProperty("--ly", `${cur.y}px`);
      if (active) hitRow(cur.y);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
      active = true;
      clearTimeout(idleTimer);
    };
    const onLeave = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => (active = false), 1400);
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerdown", onMove);
    stage.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idleTimer);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerdown", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", place);
    };
  }, []);

  const revealAll = () => {
    setFull((f) => !f);
    setFound(new Set(CLUE_ROWS));
  };

  const done = found.size === CLUE_ROWS.length;

  return (
    <div className="relative">
      <div
        ref={stageRef}
        className="relative mx-auto max-w-[520px] touch-pan-y select-none overflow-hidden rounded-2xl shadow-[0_40px_80px_-30px_var(--shadow)] ring-1 ring-desk-line"
        style={full ? ({ "--lr": "900px" } as CSSProperties) : undefined}
        aria-label="Correo de ejemplo con lupa de rayos X"
        role="img"
      >
        {/* Capa visible: el correo en papel */}
        <div className="bg-paper">
          {ROWS.map((row, i) => (
            <div key={i} ref={(el) => void (rowRefs.current[i] = el)} className={`${row.h} overflow-hidden`}>
              {row.surface}
            </div>
          ))}
        </div>
        {/* Capa de rayos X, recortada por la lupa */}
        <div
          aria-hidden
          data-theme="dark"
          className="xray-layer absolute inset-0 bg-desk-3 text-chalk [background-image:linear-gradient(rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.04)_1px,transparent_1px)] [background-size:16px_16px]"
        >
          {ROWS.map((row, i) => (
            <div key={i} className={`${row.h} overflow-hidden`}>
              {row.xray}
            </div>
          ))}
        </div>
        <div aria-hidden className="xray-ring" style={{ opacity: full ? 0 : 1 }} />
      </div>

      {/* Pistas */}
      <div className="mx-auto mt-5 max-w-[520px]">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-fog">
            {done ? (
              <span className="text-accent">Encontraste las 5 trampas</span>
            ) : (
              <>
                Pasa la lupa: <strong className="tabular-nums text-chalk">{found.size}/5</strong> pistas
              </>
            )}
          </span>
          <button type="button" onClick={revealAll} className="btn btn-ghost px-3 py-1.5 text-xs">
            {full ? "Volver a la lupa" : "Radiografía completa"}
          </button>
        </div>
        <ul className="flex flex-wrap gap-1.5" aria-live="polite">
          {CLUE_ROWS.map((i, n) => {
            const on = found.has(i);
            return (
              <li
                key={i}
                className={`rounded-full border px-2.5 py-1 font-mono text-[11px] transition-all duration-300 ease-[var(--ease-out)] ${
                  on ? "border-accent bg-hl text-ink" : "border-desk-line text-fog/60"
                }`}
              >
                {on ? <Check className="mr-1 inline h-3 w-3 -translate-y-px" strokeWidth={2.25} aria-hidden /> : `${n + 1}. `}
                {on ? ROWS[i].clue : "???"}
              </li>
            );
          })}
        </ul>
        {done && (
          <Link href="/simulador" className="btn btn-primary reveal-item mt-4 w-full px-5 py-3">
            Ahora encuéntralas tú solo en 10 mensajes →
          </Link>
        )}
      </div>
    </div>
  );
}
