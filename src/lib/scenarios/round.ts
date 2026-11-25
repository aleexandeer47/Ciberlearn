import type { Scenario } from "./types";

/*
 * Arma una ronda del simulador clásico a partir del banco gratuito (data.ts + extra.ts):
 *  - 10 mensajes, con 3 reales (para no premiar decir "trampa" a todo) y el resto trampas;
 *  - evita los de la ronda anterior mientras alcance el banco;
 *  - de lo más fácil a lo más difícil, con orden al azar dentro de cada dificultad.
 * Sin dependencias del servidor: se usa en el navegador.
 */

export const ROUND_SIZE = 10;
export const ROUND_LEGIT = 3;

function shuffle<T>(list: T[], rng: () => number): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Toma `n` de `list`, primero los que no están en `avoid`. */
function take<T extends { id: string }>(list: T[], n: number, avoid: ReadonlySet<string>, rng: () => number) {
  const fresh = shuffle(list.filter((s) => !avoid.has(s.id)), rng);
  const seen = shuffle(list.filter((s) => avoid.has(s.id)), rng);
  return [...fresh, ...seen].slice(0, n);
}

export function pickRound(pool: Scenario[], avoid: readonly string[] = [], rng: () => number = Math.random, size = ROUND_SIZE): Scenario[] {
  const skip = new Set(avoid);
  const legit = take(pool.filter((s) => s.verdict === "legit"), Math.min(ROUND_LEGIT, size), skip, rng);
  const phishing = take(pool.filter((s) => s.verdict === "phishing"), size - legit.length, skip, rng);
  const picked = shuffle([...legit, ...phishing], rng);
  // Orden estable por dificultad (dentro de cada nivel queda el orden al azar)
  return picked.map((s, i) => ({ s, i })).sort((a, b) => a.s.difficulty - b.s.difficulty || a.i - b.i).map((x) => x.s);
}
