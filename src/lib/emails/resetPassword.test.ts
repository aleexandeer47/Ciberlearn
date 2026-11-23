import { describe, expect, it } from "vitest";
import { resetPasswordEmail } from "./resetPassword";

describe("correo de recuperación", () => {
  const link = "https://ejemplo.com/restablecer?token=abc123";

  it("incluye el enlace y el vencimiento en ambas versiones", () => {
    const m = resetPasswordEmail({ name: "Ana Prueba", link, minutes: 60 });
    expect(m.text).toContain(link);
    expect(m.html).toContain(link);
    expect(m.text).toContain("60 minutos");
    expect(m.text.startsWith("Hola, Ana:")).toBe(true);
  });

  it("sale en inglés si se pide", () => {
    const m = resetPasswordEmail({ name: "Ana Prueba", link, minutes: 60, lang: "en" });
    expect(m.subject).toMatch(/^Reset your/);
    expect(m.text).toContain("60 minutes");
    expect(m.html).toContain('lang="en"');
  });

  it("escapa el nombre para que no se pueda inyectar HTML", () => {
    const m = resetPasswordEmail({ name: '<img src=x onerror="alert(1)">', link, minutes: 60 });
    expect(m.html).not.toContain("<img src=x");
    expect(m.html).toContain("&lt;img");
  });
});
