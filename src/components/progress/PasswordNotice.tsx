"use client";

import { useSearchParams } from "next/navigation";

export function PasswordNotice() {
  if (useSearchParams().get("clave") !== "actualizada") return null;
  return (
    <p className="pop-in rounded-2xl border border-ok/40 bg-ok/10 px-5 py-3 text-sm">
      <strong className="text-ok">Contraseña actualizada.</strong> Cerramos tu sesión en los demás dispositivos.
    </p>
  );
}
