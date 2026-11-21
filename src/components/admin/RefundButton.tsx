"use client";

import { RotateCcw, X } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { refundAction, type RefundState } from "@/app/actions/admin";

export function RefundButton({
  reference,
  amount,
  days,
  email,
  inRetract,
}: {
  reference: string;
  amount: number;
  days: number;
  email: string;
  inRetract: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, action, pending] = useActionState<RefundState, FormData>(refundAction, {});

  useEffect(() => {
    if (state.ok) dialog.current?.close();
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="btn btn-ghost h-8 px-2.5 text-xs"
        aria-label={`Reembolsar el pago ${reference}`}
      >
        <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        Reembolsar
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={`${reference}-t`}
        className="m-auto w-[min(92vw,460px)] rounded-3xl border border-desk-line bg-desk-2 p-0 text-left text-chalk backdrop:bg-black/60"
      >
        {/* key: tras un error React reinicia el formulario; así vuelve con lo que se había escrito */}
        <form key={state.error ?? "nuevo"} action={action} className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 id={`${reference}-t`} className="font-display text-xl">
                Reembolsar pago
              </h3>
              <p className="mt-1 text-sm text-fog">
                {email} · <span className="font-mono text-xs">{reference}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="grid h-8 w-8 place-items-center rounded-lg text-fog hover:text-chalk"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <p className={`rounded-xl px-3 py-2 text-sm ${inRetract ? "bg-ok/15 text-ok" : "bg-desk-3 text-fog"}`}>
            {inRetract
              ? "Está dentro de los 8 días de retracto: corresponde devolver el total."
              : "Ya pasaron los 8 días de retracto. Reembolsa solo si es un cobro erróneo o un caso de la política."}
          </p>

          <ol className="list-decimal space-y-1 pl-5 text-sm text-graphite">
            <li>Haz la devolución en el panel de Wompi (aquí no se mueve dinero).</li>
            <li>Regístrala aquí para que la cuenta y las ganancias queden al día.</li>
          </ol>

          <input type="hidden" name="reference" value={reference} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Monto devuelto (US$)</span>
            <input
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              max={amount}
              defaultValue={state.values?.amount ?? amount.toFixed(2)}
              required
              className="field"
            />
          </label>
          <label className="flex gap-2.5 text-sm">
            <input type="checkbox" name="removeDays" value="si" defaultChecked={state.values?.removeDays ?? true} className="mt-0.5 h-4 w-4 accent-[var(--brand)]" />
            <span>Quitar los {days} días de Pro de este pago</span>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Motivo (opcional)</span>
            <input name="note" maxLength={300} defaultValue={state.values?.note} placeholder="Ej.: retracto pedido por correo el 21/11" className="field" />
          </label>
          <label className="flex gap-2.5 text-sm">
            <input type="checkbox" name="confirm" value="si" required className="mt-0.5 h-4 w-4 accent-[var(--brand)]" />
            <span>Ya devolví el dinero en el panel de Wompi.</span>
          </label>

          {state.error && (
            <p role="alert" className="rounded-xl bg-bad/15 px-3 py-2 text-sm text-bad-text">
              {state.error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => dialog.current?.close()} className="btn btn-ghost px-4 py-2.5 text-sm">
              Cancelar
            </button>
            <button type="submit" disabled={pending} className="btn btn-danger px-4 py-2.5 text-sm disabled:opacity-60">
              {pending ? "Registrando…" : "Registrar reembolso"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
