// Vidas de la ruta guiada. Funciones puras: el servidor guarda { count, updatedAt }
// y la regeneración se calcula al leer (no hace falta ningún proceso en segundo plano).

export const MAX_LIVES = 5;
export const REGEN_MS = 30 * 60 * 1000; // 1 vida cada 30 minutos

export interface LivesState {
  count: number;
  /** Momento desde el que corre la regeneración de la próxima vida. */
  updatedAt: Date;
}

export interface LivesView {
  count: number;
  max: number;
  infinite: boolean;
  /** ms hasta la próxima vida (null si están llenas o son infinitas) */
  nextInMs: number | null;
  /** ms hasta tener todas (null si están llenas o son infinitas) */
  fullInMs: number | null;
}

/** Aplica la regeneración transcurrida y devuelve el estado normalizado. */
export function regen(state: LivesState | null | undefined, now = new Date()): LivesState {
  if (!state) return { count: MAX_LIVES, updatedAt: now };
  if (state.count >= MAX_LIVES) return { count: MAX_LIVES, updatedAt: now };
  const elapsed = Math.max(0, now.getTime() - state.updatedAt.getTime());
  const gained = Math.floor(elapsed / REGEN_MS);
  if (gained <= 0) return state;
  const count = Math.min(MAX_LIVES, state.count + gained);
  // Si aún no están llenas, se conserva el "resto" para la siguiente vida.
  const updatedAt = count >= MAX_LIVES ? now : new Date(state.updatedAt.getTime() + gained * REGEN_MS);
  return { count, updatedAt };
}

export function view(state: LivesState | null | undefined, isPro: boolean, now = new Date()): LivesView {
  if (isPro) return { count: MAX_LIVES, max: MAX_LIVES, infinite: true, nextInMs: null, fullInMs: null };
  const s = regen(state, now);
  if (s.count >= MAX_LIVES) return { count: MAX_LIVES, max: MAX_LIVES, infinite: false, nextInMs: null, fullInMs: null };
  const nextInMs = REGEN_MS - (now.getTime() - s.updatedAt.getTime());
  return {
    count: s.count,
    max: MAX_LIVES,
    infinite: false,
    nextInMs,
    fullInMs: nextInMs + (MAX_LIVES - s.count - 1) * REGEN_MS,
  };
}

/** Quita una vida (tras regenerar). Si estaban llenas, el reloj empieza ahora. */
export function loseOne(state: LivesState | null | undefined, now = new Date()): LivesState {
  const s = regen(state, now);
  if (s.count <= 0) return s;
  return { count: s.count - 1, updatedAt: s.count >= MAX_LIVES ? now : s.updatedAt };
}

export function fmtWait(ms: number) {
  const m = Math.ceil(ms / 60000);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return `${h} h ${m % 60} min`;
}
