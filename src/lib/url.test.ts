import { describe, expect, it } from "vitest";
import { dissectUrl } from "./url";

describe("dissectUrl", () => {
  it("encuentra el dominio real detrás de un subdominio engañoso", () => {
    const a = dissectUrl("http://bancoizalco.verificar-cuenta.co/login")!;
    expect(a.domain).toBe("verificar-cuenta.co");
    expect(a.subdomain).toBe("bancoizalco");
    expect(a.rest).toBe("/login");
    expect(a.secure).toBe(false);
  });

  it("respeta sufijos de dos niveles como .com.sv y .gob.sv", () => {
    expect(dissectUrl("https://intranet.grupoatlacatl.com.sv/rrhh")!.domain).toBe("grupoatlacatl.com.sv");
    expect(dissectUrl("tributos.gob.sv")!.domain).toBe("tributos.gob.sv");
  });

  it("no confunde un guion con un punto", () => {
    expect(dissectUrl("https://grupoatlacatl-com.net/owa")!.domain).toBe("grupoatlacatl-com.net");
  });

  it("acepta direcciones sin protocolo y rechaza basura", () => {
    expect(dissectUrl("enviaya-sv.delivery-pago.top/p/8812")!.domain).toBe("delivery-pago.top");
    expect(dissectUrl("")).toBeNull();
    expect(dissectUrl("hola")).toBeNull();
    expect(dissectUrl("http://")).toBeNull();
  });
});
