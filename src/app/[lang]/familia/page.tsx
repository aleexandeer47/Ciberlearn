import { Eye, Flame, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { leaveOrg, rotateInvite } from "@/app/actions/org";
import { FamilyCheckout } from "@/components/business/SeatCheckout";
import { CopyLink, InviteForm, RemoveMemberButton } from "@/components/business/TeamTools";
import { PageShell } from "@/components/SiteHeader";
import { daysLeft, FAMILY, orgActive } from "@/lib/business";
import { LOCALE, type Lang } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { collections } from "@/lib/server/db";
import { env } from "@/lib/server/env";
import { teamReport } from "@/lib/server/org";
import { getCurrentUser, type CurrentUser } from "@/lib/server/session";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    alternates: await alternatesFor("/familia"),
    title: t("Pro Familiar", "Family plan"),
    description: t(
      `Protege a tu familia de las estafas: Pro para ${FAMILY.seats} personas por US$${FAMILY.price} al año, y ve su avance.`,
      `Protect your family from scams: Pro for ${FAMILY.seats} people for US$${FAMILY.price} a year, and see their progress.`,
    ),
  };
}

const fmtIn = (lang: Lang) => (d: Date) => d.toLocaleDateString(LOCALE[lang], { day: "numeric", month: "short", year: "numeric" });

function Card({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`scroll-mt-24 rounded-3xl border border-desk-line bg-desk-2 p-6 ${className}`}>{children}</section>;
}

async function Pitch({ user, error }: { user: CurrentUser | null; error?: string }) {
  const { t } = await getT();
  const PERKS = [
    {
      icon: ShieldCheck,
      title: t(`Pro para ${FAMILY.seats} personas`, `Pro for ${FAMILY.seats} people`),
      text: t(
        "Vidas infinitas, bandeja de entrenamiento, mensajes avanzados y certificado para cada uno.",
        "Unlimited lives, the training inbox, advanced messages and a certificate for each person.",
      ),
    },
    {
      icon: Eye,
      title: t("Mira cómo van", "See how they're doing"),
      text: t(
        "Quien paga ve el avance de su familia: lecciones, XP y racha. Ideal para cuidar a papá y mamá.",
        "Whoever pays sees the family's progress: lessons, XP and streak. Ideal for looking after mom and dad.",
      ),
    },
    {
      icon: Flame,
      title: t("Un minuto al día", "One minute a day"),
      text: t(
        "La estafa del día y la letra grande del modo sencillo hacen fácil practicar a cualquier edad.",
        "The scam of the day and simple mode's large text make practicing easy at any age.",
      ),
    },
  ];
  return (
    <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
      <div>
        <span className="eyebrow">{t("Pro Familiar", "Family plan")}</span>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
          {t("Que nadie en tu familia caiga en una estafa", "Don't let anyone in your family fall for a scam")}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-fog">
          {t(
            `Las estafas por llamada, WhatsApp y transferencias apuntan a quienes más queremos. Con un solo pago, hasta ${FAMILY.seats} personas entrenan con Pro y tú ves cómo van.`,
            `Phone, WhatsApp and money-transfer scams target the people we love most. With a single payment, up to ${FAMILY.seats} people train with Pro and you see how they're doing.`,
          )}
        </p>
        <ul className="mt-8 space-y-4">
          {PERKS.map((p) => (
            <li key={p.title} className="flex gap-4 rounded-3xl border border-desk-line bg-desk-2 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-field text-brand">
                <p.icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">{p.title}</span>
                <span className="text-sm text-fog">{p.text}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-fog">
          {t("¿Es para tus papás?", "Is it for your parents?")}{" "}
          <Link href="/mayores" className="font-medium text-brand underline-offset-2 hover:underline">
            {t("Mira cómo usarlo con personas mayores", "See how to use it with older adults")}
          </Link>
          .
        </p>
      </div>
      <Card id="comprar" className="lg:sticky lg:top-24">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl">{t("Activa tu plan", "Activate your plan")}</h2>
          <p className="text-sm text-fog">
            <span className="font-display text-2xl text-chalk">US${FAMILY.price}</span> {t("al año", "a year")}
          </p>
        </div>
        <p className="mt-1 text-sm text-fog">
          {t(
            `Hasta ${FAMILY.seats} personas (te incluye a ti). Equivale a US$${(FAMILY.price / FAMILY.seats).toFixed(2)} por persona.`,
            `Up to ${FAMILY.seats} people (including you). That's US$${(FAMILY.price / FAMILY.seats).toFixed(2)} per person.`,
          )}
        </p>
        <div className="mt-5 space-y-4">
          {error && (
            <p role="alert" className="rounded-2xl bg-bad/15 px-4 py-3 text-sm text-bad-text">
              {error}
            </p>
          )}
          {!user ? (
            <>
              <Link href="/registro?next=/familia" className="btn btn-primary w-full px-6 py-3.5">
                {t("Crear cuenta y continuar", "Sign up and continue")}
              </Link>
              <Link href="/entrar?next=/familia" className="btn btn-ghost w-full px-6 py-3">
                {t("Ya tengo cuenta", "I already have an account")}
              </Link>
            </>
          ) : user.org ? (
            <p className="text-sm text-graphite">
              {t(`Ya eres parte de ${user.org.name}. Sal de ahí para crear tu plan familiar.`, `You're already part of ${user.org.name}. Leave it to create your family plan.`)}
            </p>
          ) : (
            <FamilyCheckout mode="nueva" />
          )}
        </div>
      </Card>
    </div>
  );
}

async function OwnerView({ user, error, joined }: { user: CurrentUser; error?: string; joined: boolean }) {
  const { orgs } = await collections();
  const org = (await orgs.findOne({ _id: user.org!._id }))!;
  const { lang, t } = await getT();
  const fmt = fmtIn(lang);
  if (!orgActive(org.paidUntil)) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <span className="eyebrow">{t("Pro Familiar", "Family plan")}</span>
        <h1 className="font-display text-4xl">{org.name}</h1>
        {error && <p className="rounded-2xl bg-bad/15 px-4 py-3 text-sm text-bad-text">{error}</p>}
        <Card id="comprar">
          <h2 className="font-display text-2xl">{org.paidUntil ? t("Tu plan venció", "Your plan expired") : t("Falta activar tu plan", "Your plan isn't active yet")}</h2>
          <p className="mb-5 mt-1 text-sm text-fog">
            {org.paidUntil
              ? t(`Venció el ${fmt(org.paidUntil)}. Renueva para que tu familia vuelva a tener Pro.`, `It expired on ${fmt(org.paidUntil)}. Renew so your family gets Pro again.`)
              : t("Paga para activar Pro para tu familia.", "Pay to activate Pro for your family.")}
          </p>
          <FamilyCheckout mode="renovar" />
        </Card>
      </div>
    );
  }

  const report = await teamReport(org._id, lang);
  const inviteUrl = `${env.appUrl}/familia/unirse/${org.inviteCode}`;
  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <span className="eyebrow">{t("Pro Familiar", "Family plan")}</span>
        <h1 className="mt-2 font-display text-4xl">{org.name}</h1>
        <p className="mt-2 text-fog">
          {t(
            `${org.memberCount} de ${org.seats} personas · vigente hasta el ${fmt(org.paidUntil!)} (${daysLeft(org.paidUntil)} días)`,
            `${org.memberCount} of ${org.seats} people · active until ${fmt(org.paidUntil!)} (${daysLeft(org.paidUntil)} days)`,
          )}
        </p>
      </div>
      {joined && (
        <p className="rounded-2xl bg-ok/15 px-4 py-3 text-sm text-ok">
          {t("Tu plan familiar está activo. Ahora invita a tu familia.", "Your family plan is active. Now invite your family.")}
        </p>
      )}
      {error && <p className="rounded-2xl bg-bad/15 px-4 py-3 text-sm text-bad-text">{error}</p>}

      <Card>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-brand" aria-hidden />
          <h2 className="font-display text-xl">{t("Tu familia", "Your family")}</h2>
        </div>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {report.rows.map((m) => (
            <li key={m.id} className="rounded-2xl border border-desk-line bg-desk-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    {m.name}
                    {m.role === "owner" && <span className="ml-2 text-xs font-normal text-fog">{t("(tú)", "(you)")}</span>}
                  </p>
                  <p className="text-xs text-fog">
                    {t("Última vez", "Last seen")}: {m.lastLoginAt ? fmt(m.lastLoginAt) : "—"}
                  </p>
                </div>
                {m.role === "member" && <RemoveMemberButton userId={m.id} name={m.name} />}
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-xl bg-desk-2 p-2">
                  <dd className="font-display text-xl tabular-nums">
                    {m.lessonsDone}/{report.totalLessons}
                  </dd>
                  <dt className="text-xs text-fog">{t("lecciones", "lessons")}</dt>
                </div>
                <div className="rounded-xl bg-desk-2 p-2">
                  <dd className="font-display text-xl tabular-nums">{m.xp}</dd>
                  <dt className="text-xs text-fog">XP</dt>
                </div>
                <div className="rounded-xl bg-desk-2 p-2">
                  <dd className="font-display text-xl tabular-nums">{m.streak}</dd>
                  <dt className="text-xs text-fog">{t("días de racha", "day streak")}</dt>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl">{t("Invita a tu familia", "Invite your family")}</h2>
              <p className="mt-1 text-sm text-fog">
                {t("Mándales este enlace por WhatsApp. Cada quien entra con su propia cuenta.", "Send them this link over WhatsApp. Each person joins with their own account.")}
              </p>
            </div>
            <form action={rotateInvite}>
              <button
                type="submit"
                className="btn h-9 shrink-0 whitespace-nowrap px-3 text-xs text-fog hover:text-chalk"
                title={t("El enlace anterior dejará de funcionar", "The previous link will stop working")}
              >
                {t("Nuevo enlace", "New link")}
              </button>
            </form>
          </div>
          <div className="mt-4 space-y-5">
            <CopyLink url={inviteUrl} />
            <InviteForm placeholder={t("mama@gmail.com, juan@hotmail.com", "mom@gmail.com, john@outlook.com")} />
          </div>
        </Card>
        <Card>
          <h2 className="font-display text-xl">{t("Renovar", "Renew")}</h2>
          <p className="mb-5 mt-1 text-sm text-fog">
            {t("Suma un año al vencimiento actual. No hay cobros automáticos.", "Adds a year to the current expiry date. No automatic charges.")}
          </p>
          <FamilyCheckout mode="renovar" />
        </Card>
      </div>
    </div>
  );
}

async function MemberView({ user, joined }: { user: CurrentUser; joined: boolean }) {
  const org = user.org!;
  const { lang, t } = await getT();
  const fmt = fmtIn(lang);
  return (
    <div className="mx-auto max-w-xl space-y-6">
      {joined && (
        <p className="rounded-2xl bg-ok/15 px-4 py-3 text-sm text-ok">{t(`¡Listo! Ya eres parte de ${org.name}.`, `Done! You're now part of ${org.name}.`)}</p>
      )}
      <Card>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-field text-brand">
          <HeartHandshake className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-3xl">{org.name}</h1>
        <p className="mt-2 text-graphite">
          {org.active
            ? t(`Tienes Pro por tu familia hasta el ${fmt(org.paidUntil!)}.`, `You have Pro through your family until ${fmt(org.paidUntil!)}.`)
            : t("El plan de tu familia no está activo. Avísale a quien lo administra.", "Your family plan isn't active. Let whoever manages it know.")}
        </p>
        <p className="mt-3 text-sm text-fog">
          {t(
            "Quien administra el plan puede ver tus lecciones, tu XP y tu racha. Así lo autorizaste al unirte.",
            "Whoever manages the plan can see your lessons, XP and streak. You allowed this when you joined.",
          )}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/diaria" className="btn btn-primary px-5 py-3">
            {t("La estafa de hoy", "Today's scam")}
          </Link>
          <Link href="/ruta" className="btn btn-ghost px-5 py-3">
            {t("Seguir la ruta", "Continue the path")}
          </Link>
          <form action={leaveOrg}>
            <button type="submit" className="btn btn-ghost px-5 py-3">
              {t("Salir del plan", "Leave the plan")}
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}

async function Familia({ searchParams }: { searchParams: PageProps<"/[lang]/familia">["searchParams"] }) {
  await connection();
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error.slice(0, 200) : undefined;
  const [user, { t }] = await Promise.all([getCurrentUser(), getT()]);
  // Quien está en una empresa usa la página de empresa
  if (user?.org && user.org.kind !== "familia" && !error) redirect("/empresa");
  if (user?.org?.kind === "familia" && user.org.role === "owner") return <OwnerView user={user} error={error} joined={sp.unido === "1"} />;
  if (user?.org?.kind === "familia") return <MemberView user={user} joined={sp.unido === "1"} />;
  return (
    <>
      {sp.salida === "1" && <p className="mx-auto mb-6 max-w-[1100px] rounded-2xl bg-ok/15 px-4 py-3 text-sm text-ok">{t("Saliste del plan familiar.", "You left the family plan.")}</p>}
      <Pitch user={user} error={error} />
    </>
  );
}

export default function FamiliaPage(props: PageProps<"/[lang]/familia">) {
  return (
    <PageShell>
      <Suspense fallback={<div className="mx-auto h-[70vh] max-w-[1100px] animate-pulse rounded-3xl bg-desk-3" />}>
        <Familia searchParams={props.searchParams} />
      </Suspense>
    </PageShell>
  );
}
