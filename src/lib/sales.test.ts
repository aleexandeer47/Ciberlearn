import { describe, expect, it } from "vitest";
import {
  daysUntilSales,
  hasLaunchDiscount,
  launchDiscountActive,
  SALES_OPEN_AT,
  salesClosedMessage,
  salesOpen,
  salesOpenLabel,
  withLaunchDiscount,
} from "./sales";

describe("apertura de ventas", () => {
  it("está cerrada antes de la fecha y abierta desde la fecha", () => {
    expect(salesOpen(new Date(SALES_OPEN_AT.getTime() - 1))).toBe(false);
    expect(salesOpen(SALES_OPEN_AT)).toBe(true);
    expect(salesOpen(new Date(SALES_OPEN_AT.getTime() + 864e5))).toBe(true);
  });

  it("abre a medianoche de El Salvador, no de UTC", () => {
    expect(SALES_OPEN_AT.toISOString()).toBe("2026-12-04T06:00:00.000Z");
    expect(salesOpen(new Date("2026-12-04T05:59:59Z"))).toBe(false);
  });

  it("cuenta los días que faltan", () => {
    expect(daysUntilSales(new Date("2026-11-27T12:00:00-06:00"))).toBe(7);
    expect(daysUntilSales(new Date("2026-12-03T23:00:00-06:00"))).toBe(1);
    expect(daysUntilSales(new Date("2026-12-05T00:00:00-06:00"))).toBe(0);
  });

  it("da 50% solo el día de apertura y solo con 800 XP o más", () => {
    const launch = new Date("2026-12-04T15:00:00-06:00");
    expect(hasLaunchDiscount(800, launch)).toBe(true);
    expect(hasLaunchDiscount(799, launch)).toBe(false);
    expect(hasLaunchDiscount(null, launch)).toBe(false);
    expect(hasLaunchDiscount(5000, new Date("2026-12-03T23:59:00-06:00"))).toBe(false);
    expect(hasLaunchDiscount(5000, new Date("2026-12-05T00:00:00-06:00"))).toBe(false);
    expect(launchDiscountActive(SALES_OPEN_AT)).toBe(true);
  });

  it("calcula el precio con descuento en centavos", () => {
    expect(withLaunchDiscount(29.99)).toBe(15);
    expect(withLaunchDiscount(3.99)).toBe(2);
    expect(withLaunchDiscount(49.99)).toBe(25);
    expect(withLaunchDiscount(240)).toBe(120);
    expect(withLaunchDiscount(1)).toBe(1);
  });

  it("muestra la fecha en cada idioma", () => {
    expect(salesOpenLabel("es")).toBe("4 de diciembre");
    expect(salesOpenLabel("en")).toBe("December 4");
    expect(salesClosedMessage("es", new Date("2026-12-03T10:00:00-06:00"))).toContain("en 1 día)");
  });
});
