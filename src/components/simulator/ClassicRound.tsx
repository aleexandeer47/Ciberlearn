"use client";

import { useEffect, useState } from "react";
import { pickRound } from "@/lib/scenarios/round";
import type { Scenario } from "@/lib/scenarios/types";
import { Simulator } from "./Simulator";

const LAST_KEY = "ciberlearn-last-round";

function readLast(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(LAST_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Simulador clásico: cada ronda elige 10 mensajes al azar del banco gratuito y evita los de la
 * ronda anterior (recordados en este navegador). Se elige en el navegador para que cada visita sea distinta.
 */
export function ClassicRound({ pool }: { pool: Scenario[] }) {
  const [round, setRound] = useState<{ n: number; list: Scenario[] } | null>(null);

  const newRound = () => {
    const list = pickRound(pool, readLast());
    try {
      localStorage.setItem(LAST_KEY, JSON.stringify(list.map((s) => s.id)));
    } catch {}
    setRound((r) => ({ n: (r?.n ?? 0) + 1, list }));
    window.scrollTo({ top: 0 });
  };

  // Al azar solo en el navegador (en el servidor no se sabe qué tocó la vez anterior)
  useEffect(() => {
    Promise.resolve().then(newRound);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!round) return <div className="mx-auto h-[70vh] max-w-6xl animate-pulse rounded-3xl bg-desk-2/50" aria-hidden />;
  return <Simulator key={round.n} scenarios={round.list} onNewRound={newRound} />;
}
