import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AutoRefresh } from "@/components/billing/AutoRefresh";
import { PageShell } from "@/components/SiteHeader";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export const metadata: Metadata = { title: "Estado del pago", robots: { index: false } };

async function Result({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref = "" } = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(`/pago/resultado?ref=${ref}`)}`);
  const { orders } = await collections();
  // El estado lo decide el webhook; aquí solo se lee la orden propia.
  const order = await orders.findOne({ reference: ref, userId: user._id });
  if (!order) redirect("/planes");

  if (order.status === "paid") {
    return (
      <div className="pop-in mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 w-max -rotate-6 rounded-xl border-4 border-double border-ok px-5 py-2 font-display text-3xl font-bold uppercase text-ok">
          Pagado
        </div>
        <h1 className="font-display text-3xl font-semibold">Ya eres Pro</h1>
        <p className="mt-3 text-fog">
          Tu acceso dura hasta el{" "}
          {user.proUntil?.toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" })}. Ya puedes usar
          el pack avanzado, el contrarreloj y el entrenamiento.
        </p>
        <Link href="/progreso" className="btn btn-primary mt-8 px-7 py-3.5">
          Ir a mi progreso →
        </Link>
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
        <Result searchParams={props.searchParams as Promise<{ ref?: string }>} />
      </Suspense>
    </PageShell>
  );
}
