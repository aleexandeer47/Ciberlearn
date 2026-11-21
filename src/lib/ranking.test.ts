import { describe, expect, it } from "vitest";
import { defaultNickname, NICK_RE, weekStart } from "./ranking";

describe("ranking", () => {
  it("la semana empieza el lunes 00:00 de El Salvador", () => {
    // Sábado 21 nov 2026, 13:00 en El Salvador (19:00 UTC)
    expect(weekStart(new Date("2026-11-21T19:00:00Z")).toISOString()).toBe("2026-11-16T06:00:00.000Z");
    // Domingo 22 nov a las 23:30 SV sigue siendo la misma semana
    expect(weekStart(new Date("2026-11-23T05:30:00Z")).toISOString()).toBe("2026-11-16T06:00:00.000Z");
    // Lunes 23 nov 00:30 SV ya es semana nueva
    expect(weekStart(new Date("2026-11-23T06:30:00Z")).toISOString()).toBe("2026-11-23T06:00:00.000Z");
  });

  it("valida apodos", () => {
    expect(NICK_RE.test("Ana_95")).toBe(true);
    expect(NICK_RE.test("Peñita.sv")).toBe(true);
    expect(NICK_RE.test("ab")).toBe(false);
    expect(NICK_RE.test("con espacio")).toBe(false);
    expect(NICK_RE.test("<script>")).toBe(false);
  });

  it("apodo por defecto sin datos personales", () => {
    expect(defaultNickname("65f1a2b3c4d5e6f7a8b94f2a")).toBe("Detective-4F2A");
  });
});
