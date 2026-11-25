import { describe, expect, it } from "vitest";
import { CALL_XP, callOfDay, CALLS, callXp, randomCall } from "./calls";

describe("llamadas simuladas", () => {
  it.each(CALLS.map((c) => [c.id, c] as const))("%s está bien armada", (_id, c) => {
    expect(c.context.es && c.context.en, `${c.id}: contexto`).toBeTruthy();
    const steps = Object.keys(c.steps);
    expect(steps).toContain("start");
    const reached = new Set<string>();
    const ends = new Set<string>();
    const walk = (s: string) => {
      if (reached.has(s)) return;
      reached.add(s);
      for (const ch of c.steps[s].choices) {
        expect(ch.label.es && ch.label.en).toBeTruthy();
        if (ch.next === "fell" || ch.next === "safe" || ch.next === "ok") {
          ends.add(ch.next);
          expect(ch.note?.es && ch.note?.en, `${c.id}: nota al terminar`).toBeTruthy();
        } else {
          expect(steps, `${c.id}: paso ${ch.next}`).toContain(ch.next);
          walk(ch.next);
        }
      }
    };
    walk("start");
    expect([...reached].sort()).toEqual(steps.sort());
    // Estafa: se puede caer o salvarse. Real: se puede seguir normal o colgar para verificar (nunca "caer").
    expect([...ends].sort()).toEqual(c.scam ? ["fell", "safe"] : ["ok", "safe"]);
    // Colgar para verificar está siempre disponible
    for (const s of steps) expect(c.steps[s].choices.some((x) => x.next === "safe")).toBe(true);
  });

  it("hay estafas y llamadas reales", () => {
    expect(CALLS.filter((c) => c.scam).length).toBeGreaterThanOrEqual(3);
    expect(CALLS.filter((c) => !c.scam).length).toBeGreaterThanOrEqual(3);
  });

  it("colgar ya no da el máximo: el XP premia juzgar bien", () => {
    const scam = { scam: true };
    const real = { scam: false };
    expect(callXp(scam, "safe", "estafa")).toBe(CALL_XP.right);
    expect(callXp(scam, "safe", "real")).toBe(CALL_XP.wrongVerdict);
    expect(callXp(scam, "fell", null)).toBe(CALL_XP.fell);
    expect(callXp(real, "ok", "real")).toBe(CALL_XP.right);
    expect(callXp(real, "safe", "estafa")).toBe(CALL_XP.wrongVerdict);
    expect(callXp(real, "declined", null)).toBe(CALL_XP.declined);
    expect(CALL_XP.declined).toBeLessThan(CALL_XP.wrongVerdict);
  });

  it("la llamada del día cambia cada día, recorre todas y mezcla estafas y reales", () => {
    const days = Array.from({ length: CALLS.length }, (_, i) => callOfDay(`2026-03-${String(i + 1).padStart(2, "0")}`));
    expect(new Set(days.map((c) => c.id)).size).toBe(CALLS.length);
    // No más de 3 días seguidos del mismo tipo
    let run = 1;
    for (let i = 1; i < days.length; i++) {
      run = days[i].scam === days[i - 1].scam ? run + 1 : 1;
      expect(run).toBeLessThanOrEqual(3);
    }
  });

  it("la llamada aleatoria no repite la anterior", () => {
    const ids = CALLS.map((c) => c.id);
    for (let i = 0; i < 50; i++) expect(randomCall(ids, ids[0]).id).not.toBe(ids[0]);
  });
});
