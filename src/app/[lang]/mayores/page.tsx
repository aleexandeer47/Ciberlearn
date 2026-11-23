import { CalendarDays, HeartHandshake, Phone, PhoneCall, Type } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/SiteHeader";
import { ListenButton, SimpleModeButton } from "@/components/theme/SimpleMode";
import { getT } from "@/lib/i18n-server";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    alternates: await alternatesFor("/mayores"),
    title: t("Para personas mayores", "For older adults"),
    description: t(
      "Aprende a reconocer estafas con letra grande, mensajes que se pueden escuchar y consejos simples.",
      "Learn to recognize scams with large text, messages you can listen to and simple tips.",
    ),
  };
}

export default async function MayoresPage() {
  const { t } = await getT();
  const RULES = [
    [
      t("Nadie de verdad te pide códigos ni claves", "Nobody real asks for codes or passwords"),
      t(
        "Ni el banco, ni la compañía de teléfono, ni un familiar. Si te piden el código que te llegó por mensaje, es una estafa.",
        "Not your bank, not the phone company, not a relative. If someone asks for the code you got by text, it's a scam.",
      ),
    ],
    [
      t("Si te apuran, detente", "If they rush you, stop"),
      t(
        "“Es urgente”, “hoy se bloquea su cuenta”, “no le digas a nadie”: la prisa es la trampa. Cuelga y respira.",
        "“It's urgent”, “your account will be locked today”, “don't tell anyone”: the rush is the trap. Hang up and breathe.",
      ),
    ],
    [
      t("Llama tú al número de siempre", "Call the usual number yourself"),
      t(
        "Si te llaman “del banco” o un familiar con otro número, cuelga y llama tú al número que ya conoces.",
        "If someone calls “from the bank”, or a relative from a different number, hang up and call the number you already know.",
      ),
    ],
    [
      t("Premios que no buscaste no existen", "Prizes you didn't look for don't exist"),
      t(
        "Si ganaste algo sin participar o te piden pagar para recibirlo, es una estafa.",
        "If you won something without entering, or they ask you to pay to receive it, it's a scam.",
      ),
    ],
    [
      t("Ante la duda, pregunta", "When in doubt, ask"),
      t(
        "Muéstrale el mensaje a un hijo, nieto o persona de confianza antes de hacer cualquier cosa.",
        "Show the message to a child, grandchild or someone you trust before doing anything.",
      ),
    ],
  ];

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl">
        <span className="eyebrow">{t("Para personas mayores y sus familias", "For older adults and their families")}</span>
        <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
          {t("Aprender a no caer, con calma y letra grande", "Learn not to fall for it, calmly and in large text")}
        </h1>
        <p className="mt-4 text-xl leading-relaxed text-graphite">
          {t(
            "Las estafas por llamada y por WhatsApp buscan sobre todo a personas mayores. Aquí puedes practicar a tu ritmo, con letra grande y escuchando los mensajes en voz alta.",
            "Phone and WhatsApp scams target older adults above all. Here you can practice at your own pace, with large text and by listening to the messages out loud.",
          )}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4 rounded-3xl bg-field p-6">
          <Type className="h-8 w-8 shrink-0 text-brand" aria-hidden />
          <p className="min-w-56 flex-1 text-lg">
            {t(
              "Activa la letra grande. También puedes usar el botón “Aa” de arriba en cualquier página.",
              "Turn on large text. You can also use the “Aa” button at the top of any page.",
            )}
          </p>
          <SimpleModeButton />
        </div>

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-3xl">{t("Las 5 reglas de oro", "The 5 golden rules")}</h2>
            <ListenButton
              text={RULES.map(([title, d], n) => `${t("Regla", "Rule")} ${n + 1}: ${title}. ${d}`).join(" ")}
              className="text-base text-brand"
            />
          </div>
          <ol className="mt-6 space-y-4">
            {RULES.map(([title, d], n) => (
              <li key={title} className="flex gap-4 rounded-3xl border border-desk-line bg-desk-2 p-6">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand font-display text-2xl text-white">{n + 1}</span>
                <span>
                  <span className="block text-xl font-semibold">{title}</span>
                  <span className="mt-1 block text-lg leading-relaxed text-graphite">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          <Link href="/llamadas" className="rounded-3xl border border-desk-line bg-desk-2 p-6 transition-colors hover:border-brand">
            <PhoneCall className="h-8 w-8 text-bad" aria-hidden />
            <p className="mt-3 text-xl font-semibold">{t("Practica con una llamada falsa", "Practice with a fake call")}</p>
            <p className="mt-1 text-lg text-graphite">
              {t("Escucha cómo suena un estafador y decide qué hacer, sin riesgo.", "Hear what a scammer sounds like and decide what to do, risk-free.")}
            </p>
          </Link>
          <Link href="/diaria" className="rounded-3xl border border-desk-line bg-desk-2 p-6 transition-colors hover:border-brand">
            <CalendarDays className="h-8 w-8 text-[#f97316]" aria-hidden />
            <p className="mt-3 text-xl font-semibold">{t("Practica con un mensaje al día", "Practice with one message a day")}</p>
            <p className="mt-1 text-lg text-graphite">
              {t(
                "Un solo mensaje, una sola pregunta: ¿es trampa o es real? Puedes escucharlo.",
                "One message, one question: scam or real? You can listen to it.",
              )}
            </p>
          </Link>
          <Link href="/simulador" className="rounded-3xl border border-desk-line bg-desk-2 p-6 transition-colors hover:border-brand">
            <Phone className="h-8 w-8 text-brand" aria-hidden />
            <p className="mt-3 text-xl font-semibold">{t("Prueba con 10 mensajes", "Try 10 messages")}</p>
            <p className="mt-1 text-lg text-graphite">
              {t("Sin crear cuenta. Al final te explicamos cada uno.", "No account needed. At the end we explain each one.")}
            </p>
          </Link>
        </section>

        <section className="mt-12 flex flex-wrap items-center gap-5 rounded-3xl border border-desk-line bg-desk-2 p-6">
          <HeartHandshake className="h-10 w-10 shrink-0 text-brand" aria-hidden />
          <div className="min-w-56 flex-1">
            <p className="text-xl font-semibold">{t("¿Quieres cuidar a tus papás?", "Want to look after your parents?")}</p>
            <p className="mt-1 text-lg text-graphite">
              {t(
                "Con Pro Familiar, hasta 5 personas entrenan con todo incluido y tú ves cómo van.",
                "With the Family plan, up to 5 people train with everything included and you see how they're doing.",
              )}
            </p>
          </div>
          <Link href="/familia" className="btn btn-primary h-14 px-7 text-lg">
            {t("Ver Pro Familiar", "See Family plan")}
          </Link>
        </section>
      </div>
    </PageShell>
  );
}
