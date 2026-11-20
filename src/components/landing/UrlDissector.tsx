"use client";

import { useId, useState } from "react";
import { dissectUrl } from "@/lib/url";

const EXAMPLES = [
  "http://bancoizalco.verificar-cuenta.co/login",
  "https://intranet.grupoatlacatl.com.sv/rrhh",
  "https://grupoatlacatl-com.net/owa/auth",
  "enviaya-sv.delivery-pago.top/p/8812",
];

// Marcas ficticias del simulador; si aparecen fuera de su dominio, es imitación.
const BRANDS = ["bancoizalco", "enviaya", "grupoatlacatl", "tributos", "banco", "paypal", "netflix", "amazon"];

export function UrlDissector() {
  const [value, setValue] = useState(EXAMPLES[0]);
  const inputId = useId();
  const a = dissectUrl(value);

  return (
    <div className="rounded-3xl border border-desk-line bg-desk-2 p-5 sm:p-8">
      <label htmlFor={inputId} className="mb-2 block text-sm text-fog">
        Pega o escribe cualquier enlace
      </label>
      <input
        id={inputId}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        inputMode="url"
        className="w-full rounded-xl border border-desk-line bg-desk px-4 py-3.5 font-mono text-sm text-chalk outline-none transition-colors placeholder:text-fog/50 focus:border-accent"
        placeholder="https://..."
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => setValue(ex)}
            className={`btn max-w-full truncate px-3 py-1.5 font-mono text-[11px] font-normal ${
              ex === value ? "bg-brand text-white" : "btn-ghost text-fog"
            }`}
          >
            {ex.replace(/^https?:\/\//, "").slice(0, 34)}
            {ex.replace(/^https?:\/\//, "").length > 34 ? "…" : ""}
          </button>
        ))}
      </div>

      <div className="mt-8 min-h-[150px]" aria-live="polite">
        {a ? (
          <>
            <p className="font-mono text-base leading-[2.1] [overflow-wrap:anywhere] sm:text-xl">
              {a.protocol && <span className="text-fog/70">{a.protocol}</span>}
              {a.subdomain && (
                <span className="rounded bg-desk-3 px-1 text-fog" title="Subdominio">
                  {a.subdomain}.
                </span>
              )}
              <span key={a.domain} className="reveal-item rounded bg-hl px-1 font-semibold text-ink">
                {a.domain}
              </span>
              {a.rest && <span className="text-fog/70">{a.rest}</span>}
            </p>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
              <p className="rounded-xl bg-desk p-3">
                <span className="mb-1 block font-mono text-[11px] text-accent">Dominio real</span>
                <span className="font-semibold">{a.domain}</span>: es quien controla la página. Lo demás se puede
                inventar.
              </p>
              <p className="rounded-xl bg-desk p-3">
                <span className="mb-1 block font-mono text-[11px] text-fog">Subdominio</span>
                {a.subdomain ? (
                  <>
                    “{a.subdomain}” lo elige el dueño de {a.domain}.{" "}
                    {BRANDS.some((b) => a.subdomain.includes(b) && !a.domain.includes(b))
                      ? "Usa el nombre de otra marca para engañarte."
                      : "Es normal si el dominio es el correcto."}
                  </>
                ) : (
                  "No tiene. El enlace va directo al dominio."
                )}
              </p>
              <p className="rounded-xl bg-desk p-3">
                <span className="mb-1 block font-mono text-[11px] text-fog">Candado</span>
                {a.secure
                  ? "Usa https, pero eso solo cifra la conexión: un sitio falso también puede tenerlo."
                  : a.protocol
                    ? "Sin https. Nunca escribas datos aquí."
                    : "Sin protocolo escrito: fíjate en el dominio igual."}
              </p>
            </div>
          </>
        ) : (
          <p className="text-fog">Escribe un enlace completo, por ejemplo bancoizalco.com.sv</p>
        )}
      </div>
    </div>
  );
}
