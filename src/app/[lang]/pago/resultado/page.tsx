import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AutoRefresh } from "@/components/billing/AutoRefresh";
import { PageShell } from "@/components/SiteHeader";
import { LOCALE } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { confirmFromRedirect } from "@/lib/server/billing";
import { collections } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/session";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("Estado del pago", "Payment status"), robots: { index: false } };
}

type Params = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

async function Result({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  // Wompi agrega identificadorEnlaceComercio, idTransaccion, idEnlace, monto y hash al volver.
  // Si los pega con "?" en vez de "&", el primero queda dentro de "ref": se separa aquí.
  const ref = first(sp.ref).split("?")[0] || first(sp.identificadorEnlaceComercio);
  const txId = first(sp.idTransaccion);

  const [user, { lang, t }] = await Promise.all([getCurrentUser(), getT()]);
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
          {t("Pagado", "Paid")}
        </div>
        <h1 className="font-display text-3xl font-semibold">
          {order.planId === "familia"
            ? t("Tu plan familiar está activo", "Your family plan is active")
            : t("Tu plan Empresa está activo", "Your Business plan is active")}
        </h1>
        <p className="mt-3 text-fog">
          {order.planId === "familia"
            ? t(
                `Hasta ${order.business.seats} personas tendrán Pro. Ahora invita a tu familia.`,
                `Up to ${order.business.seats} people will have Pro. Now invite your family.`,
              )
            : order.business.action === "renovar"
              ? t(
                  `Tienes ${order.business.seats} puestos. Ahora invita a tu equipo desde el panel de tu empresa.`,
                  `You have ${order.business.seats} seats. Now invite your team from your company dashboard.`,
                )
              : t(`Agregamos ${order.business.seats} puestos a tu empresa.`, `We added ${order.business.seats} seats to your company.`)}
        </p>
        <Link href={order.planId === "familia" ? "/familia" : "/empresa"} className="btn btn-primary mt-8 px-7 py-3.5">
          {order.planId === "familia" ? t("Invitar a mi familia →", "Invite my family →") : t("Ir al panel de mi empresa →", "Go to my company dashboard →")}
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
          {t("Pagado", "Paid")}
        </div>
        <h1 className="font-display text-3xl font-semibold">{t("Ya eres Pro", "You're Pro now")}</h1>
        <p className="mt-3 text-fog">
          {t("Tu acceso dura hasta el", "Your access lasts until")}{" "}
          {proUntil?.toLocaleDateString(LOCALE[lang], { day: "numeric", month: "long", year: "numeric" })}.{" "}
          {t("Ya puedes usar el pack avanzado, el contrarreloj y el entrenamiento.", "You can now use the advanced pack, the time trial and training.")}
        </p>
        <Link href="/progreso" className="btn btn-primary mt-8 px-7 py-3.5">
          {t("Ir a mi progreso →", "Go to my progress →")}
        </Link>
      </div>
    );
  }

  if (order.status === "refunded") {
    return (
      <div className="pop-in mx-auto max-w-lg text-center">
        <h1 className="font-display text-3xl font-semibold">{t("Este pago fue reembolsado", "This payment was refunded")}</h1>
        <p className="mt-3 text-fog">
          {t(
            `Devolvimos ${order.refund ? `US$${order.refund.amount.toFixed(2)}` : "el pago"} a tu tarjeta. Tu banco puede tardar unos días en mostrarlo.`,
            `We refunded ${order.refund ? `US$${order.refund.amount.toFixed(2)}` : "the payment"} to your card. Your bank may take a few days to show it.`,
          )}
        </p>
        <Link href="/planes" className="btn btn-ghost mt-8 px-7 py-3.5">
          {t("Ver los planes", "See plans")}
        </Link>
        <p className="mt-6 font-mono text-xs text-fog/60">Ref. {order.reference}</p>
      </div>
    );
  }

  if (order.status === "failed") {
    return (
      <div className="pop-in mx-auto max-w-lg text-center">
        <h1 className="font-display text-3xl font-semibold">{t("El pago no se completó", "The payment didn't go through")}</h1>
        <p className="mt-3 text-fog">{t("No se hizo ningún cargo a tu tarjeta. Puedes intentarlo de nuevo.", "Your card wasn't charged. You can try again.")}</p>
        <Link href="/planes" className="btn btn-primary mt-8 px-7 py-3.5">
          {t("Volver a los planes", "Back to plans")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <AutoRefresh />
      <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-desk-line border-t-brand" />
      <h1 className="font-display text-3xl font-semibold">{t("Confirmando tu pago…", "Confirming your payment…")}</h1>
      <p className="mt-3 text-fog">
        {t(
          "Esperamos la confirmación de Wompi. Suele tardar unos segundos; esta página se actualiza sola.",
          "We're waiting for Wompi to confirm. It usually takes a few seconds; this page refreshes on its own.",
        )}
      </p>
      <p className="mt-6 font-mono text-xs text-fog/60">Ref. {order.reference}</p>
    </div>
  );
}

export default function ResultadoPage(props: PageProps<"/[lang]/pago/resultado">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="h-80" />}>
        <Result searchParams={props.searchParams as Promise<Params>} />
      </Suspense>
    </PageShell>
  );
}
