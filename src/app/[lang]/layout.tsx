import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";
import { Analytics } from "@/components/analytics/Analytics";
import { LangProvider } from "@/components/i18n/LangProvider";
import { THEME_SCRIPT } from "@/components/theme/theme";
import { RegisterSW } from "@/components/pwa/Pwa";
import { VisitBeacon } from "@/components/VisitBeacon";
import { LANGS } from "@/lib/i18n";
import { getLang } from "@/lib/i18n-server";
import { SITE } from "@/lib/site";
import "../globals.css";

// Inter: interfaz, textos y botones. Bricolage Grotesque: titulares (20px o más).
// Geist Mono: solo direcciones de correo, enlaces y cifras técnicas.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const display = Bricolage_Grotesque({ variable: "--font-display", subsets: ["latin"], weight: ["400", "500", "600"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Dominio público: hace absolutas las URLs de las imágenes para compartir (WhatsApp las necesita completas).
const siteUrl =
  process.env.APP_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

// Una versión de cada página por idioma (ver src/proxy.ts).
export async function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `${SITE.name}: ${SITE.tagline[lang]}`, template: `%s · ${SITE.name}` },
    description: SITE.description[lang],
    applicationName: SITE.name,
    appleWebApp: { capable: true, title: SITE.name, statusBarStyle: "black-translucent" },
    openGraph: { siteName: SITE.name, locale: lang === "en" ? "en_US" : "es_419" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0f1c" },
  ],
};

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const lang = await getLang();
  return (
    // suppressHydrationWarning: el script de abajo pone data-theme antes de que React hidrate.
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${inter.variable} ${mono.variable} ${display.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <LangProvider lang={lang}>
          {children}
          <Suspense>
            <VisitBeacon />
          </Suspense>
          <RegisterSW />
          <Analytics />
        </LangProvider>
      </body>
    </html>
  );
}
