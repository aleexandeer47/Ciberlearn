import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { mockPay } from "@/app/actions/billing";
import { PageShell } from "@/components/SiteHeader";
import { isPlanId, PLANS } from "@/lib/plans";
import { mockPaymentsEnabled } from "@/lib/server/billing";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Pago simulado", robots: { index: false } };

async function MockCheckout({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  if (!mockPaymentsEnabled()) redirect("/planes");
  const { ref = "" } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/entrar?next=/planes");
  const { orders } = await collections();
  const order = await orders.findOne({ reference: ref, userId: user._id });
  if (!order) redirect("/planes");
  const title = order.title ?? (isPlanId(order.planId) ? PLANS[order.planId].name : "Compra");

  return (
    <div className="mx-auto max-w-md">
      <p className="mb-4 rounded-xl border border-accent/40 bg-hl/10 px-4 py-3 text-sm text-accent">
        Modo de prueba: no se cobra nada. Con credenciales de Wompi aquí aparecería su página de pago.
      </p>
      <div className="rounded-3xl bg-paper p-7 text-ink ring-1 ring-line">
        <p className="font-mono text-xs text-ink-3">Resumen de compra</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">{title}</h1>
        <div className="mt-6 space-y-2 border-y border-line py-4 text-sm">
          {order.days > 0 && (
            <div className="flex justify-between">
              <span className="text-ink-2">Acceso Pro</span>
              <span>{order.days} días</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-ink-2">Referencia</span>
            <span className="font-mono text-xs">{order.reference}</span>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <span className="text-ink-2">Total</span>
          <span className="font-display text-3xl font-semibold">${order.amount.toFixed(2)}</span>
        </div>
        <form action={mockPay} className="mt-6 grid gap-2">
          <input type="hidden" name="ref" value={order.reference} />
          <button name="outcome" value="approve" className="btn btn-ok px-6 py-3.5">
            Simular pago aprobado
          </button>
          <button name="outcome" value="reject" className="btn px-6 py-3 text-ink-2 hover:bg-paper-2">
            Simular pago rechazado
          </button>
        </form>
      </div>
    </div>
  );
}

export default function MockPage(props: PageProps<"/pago/simulado">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="h-96" />}>
        <MockCheckout searchParams={props.searchParams as Promise<{ ref?: string }>} />
      </Suspense>
    </PageShell>
  );
}
