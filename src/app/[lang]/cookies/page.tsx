import type { Metadata } from "next";
import { A, LegalPage, MailLink, Section } from "@/components/legal/LegalPage";
import type { Lang } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { LEGAL } from "@/lib/legal";
import { SITE } from "@/lib/site";
import { alternatesFor } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    alternates: await alternatesFor("/cookies"),
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
 *  - localStorage ciberlearn-analytics    src/components/analytics/Analytics.tsx (permiso del aviso)
 *  - localStorage ciberlearn-sound        src/lib/sfx.ts (sonidos activados o silenciados)
 *  - localStorage ciberlearn-account      src/components/auth/HeaderAccount.tsx (inicial y si es Pro, para el encabezado)
 *  - cookies _ga / _ga_*                  Google Analytics, SOLO si la persona acepta en el aviso
 * Cualquier otra herramienta de terceros necesita pasar por el mismo aviso y actualizar esta página.
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
      { id: "consentimiento", title: "Tu permiso para la analítica" },
      { id: "control", title: "Cómo borrarlas" },
    ],
    summary: [
      "Usamos dos cookies necesarias: una para mantener tu sesión y otra para recordar tu idioma.",
      "Usamos Google Analytics para medir el uso del sitio, solo si lo aceptas en el aviso de cookies.",
      "No usamos cookies de publicidad.",
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
      { name: "ciberlearn-analytics", kind: "Almacenamiento local", purpose: "Recuerda si aceptaste o rechazaste la analítica en el aviso de cookies.", duration: "Hasta que la borres o cambies tu decisión", type: "Necesaria" },
      { name: "ciberlearn-sound", kind: "Almacenamiento local", purpose: "Recuerda si silenciaste los efectos de sonido.", duration: "Hasta que la borres", type: "Preferencia" },
      { name: "ciberlearn-account", kind: "Almacenamiento local", purpose: "Si tienes la sesión iniciada, guarda la inicial de tu nombre y si eres Pro, para mostrar tu botón de perfil sin parpadeos al cambiar de página. Se borra al cerrar sesión.", duration: "Hasta que cierres sesión", type: "Funcional" },
      { name: "_ga, _ga_*", kind: "Cookies de Google Analytics", purpose: "Solo si aceptas: distinguen visitas para contar, de forma agregada, cuántas personas usan el sitio y qué páginas ven.", duration: "Hasta 2 años", type: "Analítica (opcional)" },
    ],
    fonts: "Las fuentes tipográficas se sirven desde nuestro propio dominio, así que cargar el sitio no envía tus datos a otras empresas.",
    third: `La única herramienta de terceros es Google Analytics (por medio de Google Tag Manager), y solo se carga si la aceptas. Cuando pagas un plan, te llevamos a la página de Wompi, que puede usar sus propias cookies bajo su política; eso ocurre en el sitio de Wompi, no en el nuestro.`,
    whyTitle: "Tu permiso para la analítica",
    why: [
      "Las cookies de sesión y de idioma son indispensables y no necesitan permiso. Google Analytics no lo es: por eso, la primera vez que entras te preguntamos si lo aceptas. Hasta que aceptes, no se carga ningún script de Google ni se guarda ninguna cookie de analítica, y rechazarla no cambia nada de lo que puedes hacer en el sitio.",
      "Puedes cambiar tu decisión cuando quieras con “Preferencias de cookies”, al pie de cualquier página. Google trata esos datos como proveedor nuestro, según su propia política de privacidad.",
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
      { id: "consentimiento", title: "Your permission for analytics" },
      { id: "control", title: "How to delete them" },
    ],
    summary: [
      "We use two necessary cookies: one to keep you logged in and one to remember your language.",
      "We use Google Analytics to measure site usage, only if you accept it in the cookie notice.",
      "We don't use advertising cookies.",
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
      { name: "ciberlearn-analytics", kind: "Local storage", purpose: "Remembers whether you accepted or rejected analytics in the cookie notice.", duration: "Until you delete it or change your choice", type: "Necessary" },
      { name: "ciberlearn-sound", kind: "Local storage", purpose: "Remembers whether you muted the sound effects.", duration: "Until you delete it", type: "Preference" },
      { name: "ciberlearn-account", kind: "Local storage", purpose: "If you’re logged in, it keeps your name’s initial and whether you’re Pro, so your profile button shows without flicker when you change pages. It’s deleted when you log out.", duration: "Until you log out", type: "Functional" },
      { name: "_ga, _ga_*", kind: "Google Analytics cookies", purpose: "Only if you accept: they tell visits apart to count, in aggregate, how many people use the site and which pages they view.", duration: "Up to 2 years", type: "Analytics (optional)" },
    ],
    fonts: "Fonts are served from our own domain, so loading the site doesn't send your data to other companies.",
    third: `The only third-party tool is Google Analytics (through Google Tag Manager), and it only loads if you accept it. When you pay for a plan, we take you to Wompi's page, which may use its own cookies under its policy; that happens on Wompi's site, not ours.`,
    whyTitle: "Your permission for analytics",
    why: [
      "The session and language cookies are essential and don't need permission. Google Analytics isn't: that's why, the first time you visit, we ask whether you accept it. Until you accept, no Google script is loaded and no analytics cookie is stored, and rejecting it doesn't change anything you can do on the site.",
      "You can change your choice anytime with “Cookie preferences” at the bottom of any page. Google processes that data as our provider, under its own privacy policy.",
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
