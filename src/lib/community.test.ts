import { describe, expect, it } from "vitest";
import { challengeOutcome, cleanPlayerName, cleanReportText, defang, isReportChannel, pickRandom } from "./community";
import { caseForDay, currentStreak, DAILY_CASES, nextStreak, prevDay, publicDaily } from "./daily";

describe("estafa del día", () => {
  it("hay casos suficientes, con ids únicos y mezcla de trampas y reales", () => {
    expect(DAILY_CASES.length).toBeGreaterThanOrEqual(30);
    expect(new Set(DAILY_CASES.map((c) => c.id)).size).toBe(DAILY_CASES.length);
    const legit = DAILY_CASES.filter((c) => c.answer === "legit").length;
    expect(legit).toBeGreaterThan(5);
    expect(legit).toBeLessThan(DAILY_CASES.length / 2);
  });

  it("el caso es el mismo todo el día y cambia al siguiente", () => {
    expect(caseForDay("2026-11-21").id).toBe(caseForDay("2026-11-21").id);
    expect(caseForDay("2026-11-21").id).not.toBe(caseForDay("2026-11-22").id);
    // Recorre todos los casos antes de repetir uno
    const day = (i: number) => new Date(Date.UTC(2026, 10, 1) + i * 864e5).toISOString().slice(0, 10);
    const ids = new Set(Array.from({ length: DAILY_CASES.length }, (_, i) => caseForDay(day(i)).id));
    expect(ids.size).toBe(DAILY_CASES.length);
  });

  it("calcula el día anterior, incluso al cambiar de mes y año", () => {
    expect(prevDay("2026-03-01")).toBe("2026-02-28");
    expect(prevDay("2027-01-01")).toBe("2026-12-31");
  });

  it("la racha sigue si respondiste ayer y se corta si no", () => {
    const a = nextStreak(undefined, "2026-11-20");
    expect(a).toEqual({ lastDay: "2026-11-20", streak: 1, best: 1 });
    const b = nextStreak(a, "2026-11-21");
    expect(b.streak).toBe(2);
    expect(nextStreak(b, "2026-11-21")).toBe(b); // responder dos veces el mismo día no suma
    const c = nextStreak(b, "2026-11-25");
    expect(c).toEqual({ lastDay: "2026-11-25", streak: 1, best: 2 });
    expect(currentStreak(b, "2026-11-22")).toBe(2); // aún puede responder hoy
    expect(currentStreak(b, "2026-11-23")).toBe(0);
  });

  it("la versión pública no trae la respuesta", () => {
    const json = JSON.stringify(DAILY_CASES.map(publicDaily));
    expect(json).not.toContain('"answer"');
    expect(json).not.toContain('"explain"');
  });
});

describe("retos", () => {
  it("valida el nombre del jugador", () => {
    expect(cleanPlayerName("  Ana   María ")).toBe("Ana María");
    expect(cleanPlayerName("<script>")).toBeNull();
    expect(cleanPlayerName("a")).toBeNull();
  });

  it("elige sin repetir", () => {
    const r = pickRandom([1, 2, 3, 4, 5, 6, 7], 5, () => 0.42);
    expect(r).toHaveLength(5);
    expect(new Set(r).size).toBe(5);
  });

  it("compara puntajes", () => {
    expect(challengeOutcome(4, 3)).toBe("ganaste");
    expect(challengeOutcome(3, 3)).toBe("empate");
    expect(challengeOutcome(2, 3)).toBe("perdiste");
    expect(challengeOutcome(2, null)).toBeNull();
  });
});

describe("alertas", () => {
  it("desactiva enlaces y dominios para que no se puedan tocar", () => {
    expect(defang("Entra a https://bancoizalco-alertas.com/login ya")).toBe("Entra a hxxps://bancoizalco-alertas[.]com/login ya");
    expect(defang("escribe a soporte@pago-sv.top")).toBe("escribe a soporte@pago-sv[.]top");
    expect(defang("Pague $1.95 o $10.50")).toBe("Pague $1.95 o $10.50");
    expect(defang("IP 192.168.1.1")).toBe("IP 192.168.1.1");
  });

  it("limpia caracteres de control y respeta el largo", () => {
    expect(cleanReportText("hola\u0000  mundo\n\n\n\nfin", 100)).toBe("hola mundo\n\nfin");
    expect(cleanReportText("x".repeat(50), 10)).toHaveLength(10);
  });

  it("solo acepta canales conocidos", () => {
    expect(isReportChannel("SMS")).toBe(true);
    expect(isReportChannel("Fax")).toBe(false);
  });
});
