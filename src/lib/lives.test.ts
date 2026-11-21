import { describe, expect, it } from "vitest";
import { fmtWait, loseOne, MAX_LIVES, regen, REGEN_MS, view } from "./lives";

const t0 = new Date("2026-11-21T12:00:00Z");
const at = (ms: number) => new Date(t0.getTime() + ms);

describe("vidas", () => {
  it("una cuenta nueva empieza con todas", () => {
    expect(regen(null, t0)).toEqual({ count: MAX_LIVES, updatedAt: t0 });
    expect(view(undefined, false, t0)).toMatchObject({ count: 5, nextInMs: null });
  });

  it("perder con vidas llenas arranca el reloj en ese momento", () => {
    const s = loseOne(null, t0);
    expect(s).toEqual({ count: 4, updatedAt: t0 });
    expect(view(s, false, at(10 * 60000)).nextInMs).toBe(20 * 60000);
  });

  it("regenera 1 cada 30 min y conserva el resto", () => {
    const s = { count: 1, updatedAt: t0 };
    const r = regen(s, at(75 * 60000)); // 2 vidas y 15 min de resto
    expect(r.count).toBe(3);
    expect(r.updatedAt).toEqual(at(60 * 60000));
    expect(view(s, false, at(75 * 60000)).nextInMs).toBe(15 * 60000);
  });

  it("nunca pasa del máximo", () => {
    expect(regen({ count: 0, updatedAt: t0 }, at(10 * REGEN_MS)).count).toBe(MAX_LIVES);
  });

  it("perder no rompe el reloj en curso", () => {
    const s = loseOne({ count: 3, updatedAt: t0 }, at(10 * 60000));
    expect(s).toEqual({ count: 2, updatedAt: t0 });
  });

  it("en cero no baja más y dice cuánto esperar", () => {
    const s = { count: 0, updatedAt: t0 };
    expect(loseOne(s, at(1000)).count).toBe(0);
    const v = view(s, false, at(5 * 60000));
    expect(v.nextInMs).toBe(25 * 60000);
    expect(v.fullInMs).toBe(25 * 60000 + 4 * REGEN_MS);
  });

  it("Pro tiene vidas infinitas", () => {
    expect(view({ count: 0, updatedAt: t0 }, true, t0)).toMatchObject({ infinite: true, count: MAX_LIVES });
  });

  it("formatea la espera", () => {
    expect(fmtWait(25 * 60000)).toBe("25 min");
    expect(fmtWait(150 * 60000)).toBe("2 h 30 min");
  });
});
