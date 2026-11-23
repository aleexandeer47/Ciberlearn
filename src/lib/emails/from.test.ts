import { describe, expect, it } from "vitest";
import { parseFrom } from "./from";

describe("parseFrom", () => {
  it("separa nombre y correo", () => {
    expect(parseFrom("Unhooked <hola@unhooked.com>")).toEqual({ name: "Unhooked", email: "hola@unhooked.com" });
    expect(parseFrom('"Equipo Unhooked" <no-responder@x.com>')).toEqual({ name: "Equipo Unhooked", email: "no-responder@x.com" });
  });

  it("acepta solo el correo y usa el nombre por defecto", () => {
    expect(parseFrom("yo@gmail.com")).toEqual({ name: "Unhooked", email: "yo@gmail.com" });
    expect(parseFrom("'yo@gmail.com'")).toEqual({ name: "Unhooked", email: "yo@gmail.com" });
  });

  it("rechaza valores inválidos", () => {
    expect(parseFrom("")).toBeNull();
    expect(parseFrom("Unhooked")).toBeNull();
    expect(parseFrom("Unhooked <no-es-correo>")).toBeNull();
  });
});
