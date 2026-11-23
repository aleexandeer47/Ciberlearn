import type { Metadata } from "next";
import { A, LegalPage, MailLink, Section } from "@/components/legal/LegalPage";
import type { Lang } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { LEGAL } from "@/lib/legal";
import { SITE } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: LEGAL.cookies.title[lang],
    description:
      lang === "en"
        ? `What cookies and data ${SITE.name} stores in your browser, and why we don't need to ask your permission for them.`
        : `Qué cookies y qué datos guarda ${SITE.name} en tu navegador, y por qué no necesitamos pedirte permiso para ellos.`,
  };
}

/*
 * Debe coincidir con el código:
 *  - cookie ciberlearn_session            src/lib/server/session.ts
 *  - cookie lang                          src/proxy.ts y src/components/i18n/LangProvider.tsx
 *  - localStorage ciberlearn-theme        src/components/theme/theme.ts
 *  - localStorage ciberlearn-simple       src/components/theme/SimpleMode.tsx
 *  - Cache Storage ciberlearn-*           public/sw.js
 *  - localStorage ciberlearn-visit-day    src/components/VisitBeacon.tsx
 *  - sessionStorage ciberlearn:pendingRun src/components/simulator/Summary.tsx
 * Si agregas analítica, publicidad o cualquier herramienta de terceros que guarde datos en el navegador,
 * necesitarás un aviso de consentimiento ANTES de activarla, y actualizar esta página.
 */

type Row = { name: string; kind: string; purpose: string; duration: string; type: string };

const COPY: Record<
  Lang,
  {
    sections: { id: string; title: string }[];
    summary: string[];
    whatTitle: string;
    what: string;
    listIntro: string;
    head: [string, string, string, string];
    rows: Row[];
    fonts: string;
    third: string;
    whyTitle: string;
    why: [string, string];
    controlTitle: string;
    control: string;
    more: [string, string, string];
  }
> = {
  es: {
    sections: [
      { id: "que-son", title: "Qué son" },
      { id: "lista", title: "Lo que usamos" },
      { id: "terceros", title: "Cookies de terceros" },
      { id: "consentimiento", title: "¿Por qué no hay aviso de cookies?" },
      { id: "control", title: "Cómo borrarlas" },
    ],
    summary: [
      "Usamos dos cookies necesarias: una para mantener tu sesión y otra para recordar tu idioma.",
      "No usamos cookies de publicidad, de rastreo ni analítica de terceros.",
      "Por eso no te mostramos un aviso para aceptar cookies.",
    ],
    whatTitle: "Qué son",
    what: "Las cookies y el almacenamiento local son pequeños datos que un sitio guarda en tu navegador para recordar algo, por ejemplo que ya iniciaste sesión. Se quedan en tu dispositivo.",
    listIntro: `Esta es la lista completa de lo que ${SITE.name} guarda en tu navegador:`,
    head: ["Nombre", "Para qué sirve", "Duración", "Tipo"],
    rows: [
      { name: "ciberlearn_session", kind: "Cookie", purpose: "Mantiene tu sesión iniciada. Sin ella no podrías entrar a tu cuenta.", duration: "30 días o hasta que cierres sesión", type: "Necesaria" },
      { name: "lang", kind: "Cookie", purpose: "Recuerda el idioma del sitio (español o inglés) que elegiste o que usa tu navegador.", duration: "1 año", type: "Necesaria" },
      { name: "ciberlearn-theme", kind: "Almacenamiento local", purpose: "Recuerda si elegiste el modo claro u oscuro.", duration: "Hasta que la borres", type: "Preferencia" },
      { name: "ciberlearn-simple", kind: "Almacenamiento local", purpose: "Recuerda si activaste la letra grande (modo sencillo).", duration: "Hasta que la borres", type: "Preferencia" },
      {
        name: "ciberlearn-static / ciberlearn-pages",
        kind: "Caché de la app",
        purpose: "Si instalas la app, guarda los archivos del sitio para que cargue más rápido y una página de “sin conexión”. No guarda páginas con tus datos.",
        duration: "Hasta que se actualice o desinstales la app",
        type: "Funcional",
      },
      { name: "ciberlearn-visit-day", kind: "Almacenamiento local", purpose: "Guarda solo la fecha de hoy, para contar tu visita una sola vez al día en el total de visitas. No te identifica.", duration: "Se reemplaza cada día", type: "Funcional" },
      { name: "ciberlearn:pendingRun", kind: "Almacenamiento de sesión", purpose: "Si juegas sin cuenta, guarda el resultado de tu ronda para sumarlo a tu progreso si te registras.", duration: "Hasta que cierres la pestaña", type: "Funcional" },
    ],
    fonts: "Las fuentes tipográficas se sirven desde nuestro propio dominio, así que cargar el sitio no envía tus datos a otras empresas.",
    third: `${SITE.name} no instala cookies de terceros. Cuando pagas un plan, te llevamos a la página de Wompi, que puede usar sus propias cookies bajo su política. Eso ocurre en el sitio de Wompi, no en el nuestro.`,
    whyTitle: "¿Por qué no hay aviso de cookies?",
    why: [
      "Los avisos de cookies sirven para pedir permiso antes de usar cookies que no son necesarias, como las de publicidad o las que te siguen entre sitios. Nosotros no usamos ninguna de esas: la cookie de sesión es indispensable para que puedas entrar a tu cuenta, la del idioma es indispensable para mostrarte el sitio en tu idioma, y lo demás son preferencias y datos que se quedan en tu navegador y no te identifican.",
      "Si algún día agregamos herramientas de analítica o de terceros, te pediremos permiso antes de activarlas y actualizaremos esta página.",
    ],
    controlTitle: "Cómo borrarlas",
    control: "Puedes borrar las cookies y el almacenamiento del sitio desde la configuración de tu navegador (en la mayoría, en “Privacidad” o “Datos de sitios”). Si borras la cookie de sesión, tendrás que volver a iniciar sesión.",
    more: ["Más sobre cómo tratamos tus datos en la", "Política de privacidad", "¿Dudas? Escríbenos a"],
  },
  en: {
    sections: [
      { id: "que-son", title: "What they are" },
      { id: "lista", title: "What we use" },
      { id: "terceros", title: "Third-party cookies" },
      { id: "consentimiento", title: "Why is there no cookie banner?" },
      { id: "control", title: "How to delete them" },
    ],
    summary: [
      "We use two necessary cookies: one to keep you logged in and one to remember your language.",
      "We don't use advertising, tracking or third-party analytics cookies.",
      "That's why we don't show you a banner to accept cookies.",
    ],
    whatTitle: "What they are",
    what: "Cookies and local storage are small pieces of data a site saves in your browser to remember something, for example that you've already logged in. They stay on your device.",
    listIntro: `This is the complete list of what ${SITE.name} stores in your browser:`,
    head: ["Name", "What it's for", "Duration", "Type"],
    rows: [
      { name: "ciberlearn_session", kind: "Cookie", purpose: "Keeps you logged in. Without it you couldn't access your account.", duration: "30 days or until you log out", type: "Necessary" },
      { name: "lang", kind: "Cookie", purpose: "Remembers the site language (English or Spanish) you chose or your browser uses.", duration: "1 year", type: "Necessary" },
      { name: "ciberlearn-theme", kind: "Local storage", purpose: "Remembers whether you chose light or dark mode.", duration: "Until you delete it", type: "Preference" },
      { name: "ciberlearn-simple", kind: "Local storage", purpose: "Remembers whether you turned on large text (simple mode).", duration: "Until you delete it", type: "Preference" },
      {
        name: "ciberlearn-static / ciberlearn-pages",
        kind: "App cache",
        purpose: "If you install the app, it stores the site's files so it loads faster, plus an “offline” page. It doesn't store pages with your data.",
        duration: "Until it updates or you uninstall the app",
        type: "Functional",
      },
      { name: "ciberlearn-visit-day", kind: "Local storage", purpose: "Stores only today's date, so your visit is counted once a day in the total visits. It doesn't identify you.", duration: "Replaced every day", type: "Functional" },
      { name: "ciberlearn:pendingRun", kind: "Session storage", purpose: "If you play without an account, it keeps your round's result so it can be added to your progress if you sign up.", duration: "Until you close the tab", type: "Functional" },
    ],
    fonts: "Fonts are served from our own domain, so loading the site doesn't send your data to other companies.",
    third: `${SITE.name} doesn't set third-party cookies. When you pay for a plan, we take you to Wompi's page, which may use its own cookies under its policy. That happens on Wompi's site, not ours.`,
    whyTitle: "Why is there no cookie banner?",
    why: [
      "Cookie banners are for asking permission before using cookies that aren't necessary, like advertising cookies or ones that follow you across sites. We don't use any of those: the session cookie is essential for you to access your account, the language cookie is essential to show you the site in your language, and the rest are preferences and data that stay in your browser and don't identify you.",
      "If we ever add analytics or third-party tools, we'll ask your permission before turning them on and update this page.",
    ],
    controlTitle: "How to delete them",
    control: "You can delete the site's cookies and storage from your browser settings (in most browsers, under “Privacy” or “Site data”). If you delete the session cookie, you'll have to log in again.",
    more: ["More about how we handle your data in the", "Privacy policy", "Questions? Write to us at"],
  },
};

export default async function CookiesPage() {
  const c = COPY[await getLang()];
  const s = Object.fromEntries(c.sections.map((x) => [x.id, x.title]));
  return (
    <LegalPage
      doc="cookies"
      sections={c.sections}
      summary={
        <ul className="list-disc space-y-1 pl-5">
          {c.summary.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      }
    >
      <Section id="que-son" title={c.whatTitle}>
        <p>{c.what}</p>
      </Section>

      <Section id="lista" title={s.lista}>
        <p>{c.listIntro}</p>
        <div className="overflow-x-auto rounded-2xl border border-desk-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-desk-2 text-fog">
              <tr>
                {c.head.map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.rows.map((r) => (
                <tr key={r.name} className="border-t border-desk-line align-top">
                  <td className="px-4 py-3">
                    <code className="font-mono text-[13px] text-chalk">{r.name}</code>
                    <p className="mt-0.5 text-xs text-fog">{r.kind}</p>
                  </td>
                  <td className="px-4 py-3">{r.purpose}</td>
                  <td className="px-4 py-3">{r.duration}</td>
                  <td className="px-4 py-3">{r.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>{c.fonts}</p>
      </Section>

      <Section id="terceros" title={s.terceros}>
        <p>{c.third}</p>
      </Section>

      <Section id="consentimiento" title={c.whyTitle}>
        <p>{c.why[0]}</p>
        <p>{c.why[1]}</p>
      </Section>

      <Section id="control" title={c.controlTitle}>
        <p>{c.control}</p>
        <p>
          {c.more[0]} <A href={LEGAL.privacidad.path}>{c.more[1]}</A>. {c.more[2]} <MailLink />.
        </p>
      </Section>
    </LegalPage>
  );
}
