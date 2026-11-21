import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AutoRefresh } from "@/components/billing/AutoRefresh";
import { PageShell } from "@/components/SiteHeader";
import { confirmFromRedirect } from "@/lib/server/billing";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Estado del pago", robots: { index: false } };

type Params = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

async function Result({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  // Wompi agrega identificadorEnlaceComercio, idTransaccion, idEnlace, monto y hash al volver.
  // Si los pega con "?" en vez de "&", el primero queda dentro de "ref": se separa aquí.
  const ref = first(sp.ref).split("?")[0] || first(sp.identificadorEnlaceComercio);
  const txId = first(sp.idTransaccion);

  const user = await getCurrentUser();
  if (!user) {
    const back = `/pago/resultado?ref=${encodeURIComponent(ref)}${txId ? `&idTransaccion=${encodeURIComponent(txId)}` : ""}`;
    redirect(`/entrar?next=${encodeURIComponent(back)}`);
  }
  const { orders } = await collections();
  let order = await orders.findOne({ reference: ref, userId: user._id });
  if (!order) redirect("/planes");

  // Respaldo del webhook: si aún no está pagada y Wompi nos dio la transacción, se confirma con su API.
  if ((order.status === "pending" || order.status === "failed") && order.provider === "wompi" && txId) {
    const result = await confirmFromRedirect({ reference: ref, txId, userId: user._id });
    console.info("[wompi] confirmación al volver", { reference: ref, result });
    order = (await orders.findOne({ _id: order._id }))!;
  }

  if (order.status === "paid" && order.business) {
    return (
      <div className="pop-in mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 w-max -rotate-6 rounded-xl border-4 border-double border-ok px-5 py-2 font-display text-3xl font-bold uppercase text-ok">
          Pagado
        </div>
        <h1 className="font-display text-3xl font-semibold">Tu plan Empresa está activo</h1>
        <p className="mt-3 text-fog">
          {order.business.action === "renovar"
            ? `Tienes ${order.business.seats} puestos. Ahora invita a tu equipo desde el panel de tu empresa.`
            : `Agregamos ${order.business.seats} puestos a tu empresa.`}
        </p>
        <Link href="/empresa" className="btn btn-primary mt-8 px-7 py-3.5">
          Ir al panel de mi empresa →
        </Link>
      </div>
    );
  }

  if (order.status === "paid") {
    // Se relee: el plan pudo activarse en esta misma petición.
    const fresh = await (await collections()).users.findOne({ _id: user._id }, { projection: { proUntil: 1 } });
    const proUntil = fresh?.proUntil ?? user.proUntil;
    return (
      <div className="pop-in mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 w-max -rotate-6 rounded-xl border-4 border-double border-ok px-5 py-2 font-display text-3xl font-bold uppercase text-ok">
          Pagado
        </div>
        <h1 className="font-display text-3xl font-semibold">Ya eres Pro</h1>
        <p className="mt-3 text-fog">
          Tu acceso dura hasta el{" "}
          {proUntil?.toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" })}. Ya puedes usar
          el pack avanzado, el contrarreloj y el entrenamiento.
        </p>
        <Link href="/progreso" className="btn btn-primary mt-8 px-7 py-3.5">
          Ir a mi progreso →
        </Link>
      </div>
    );
  }

  if (order.status === "refunded") {
    return (
      <div className="pop-in mx-auto max-w-lg text-center">
        <h1 className="font-display text-3xl font-semibold">Este pago fue reembolsado</h1>
        <p className="mt-3 text-fog">
          Devolvimos {order.refund ? `US$${order.refund.amount.toFixed(2)}` : "el pago"} a tu tarjeta. Tu banco puede tardar
          unos días en mostrarlo.
        </p>
        <Link href="/planes" className="btn btn-ghost mt-8 px-7 py-3.5">
          Ver los planes
        </Link>
        <p className="mt-6 font-mono text-xs text-fog/60">Ref. {order.reference}</p>
      </div>
    );
  }

  if (order.status === "failed") {
    return (
      <div className="pop-in mx-auto max-w-lg text-center">
        <h1 className="font-display text-3xl font-semibold">El pago no se completó</h1>
        <p className="mt-3 text-fog">No se hizo ningún cargo a tu tarjeta. Puedes intentarlo de nuevo.</p>
        <Link href="/planes" className="btn btn-primary mt-8 px-7 py-3.5">
          Volver a los planes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <AutoRefresh />
      <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-desk-line border-t-brand" />
      <h1 className="font-display text-3xl font-semibold">Confirmando tu pago…</h1>
      <p className="mt-3 text-fog">
        Esperamos la confirmación de Wompi. Suele tardar unos segundos; esta página se actualiza sola.
      </p>
      <p className="mt-6 font-mono text-xs text-fog/60">Ref. {order.reference}</p>
    </div>
  );
}

export default function ResultadoPage(props: PageProps<"/pago/resultado">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="h-80" />}>
        <Result searchParams={props.searchParams as Promise<Params>} />
      </Suspense>
    </PageShell>
  );
}
