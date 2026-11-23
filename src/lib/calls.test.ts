import { describe, expect, it } from "vitest";
import { callOfDay, CALLS } from "./calls";

describe("llamadas simuladas", () => {
  it.each(CALLS.map((c) => [c.id, c] as const))("%s está bien armada", (_id, c) => {
    const steps = Object.keys(c.steps);
    expect(steps).toContain("start");
    const reached = new Set<string>();
    const ends = new Set<string>();
    const walk = (s: string) => {
      if (reached.has(s)) return;
      reached.add(s);
      for (const ch of c.steps[s].choices) {
        expect(ch.label.es && ch.label.en).toBeTruthy();
        if (ch.next === "fell" || ch.next === "safe") {
          ends.add(ch.next);
          expect(ch.note?.es && ch.note?.en, `${c.id}: nota al terminar`).toBeTruthy();
        } else {
          expect(steps, `${c.id}: paso ${ch.next}`).toContain(ch.next);
          walk(ch.next);
        }
      }
    };
    walk("start");
    // Todo paso se puede alcanzar, hay forma de ganar y de caer, y colgar está siempre disponible
    expect([...reached].sort()).toEqual(steps.sort());
    expect([...ends].sort()).toEqual(["fell", "safe"]);
    for (const s of steps) expect(c.steps[s].choices.some((x) => x.next === "safe")).toBe(true);
  });

  it("la llamada del día cambia cada día y recorre todas", () => {
    const ids = new Set(Array.from({ length: CALLS.length }, (_, i) => callOfDay(`2026-03-${String(i + 1).padStart(2, "0")}`).id));
    expect(ids.size).toBe(CALLS.length);
  });
});
