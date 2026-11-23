import { Mail, MessageSquare, Smartphone, X } from "lucide-react";
import Link from "next/link";
import { getT } from "@/lib/i18n-server";
import { channelLabels } from "@/lib/scenarios/categories";
import { getScenarios } from "@/lib/scenarios/data";
import { segmentScenario } from "@/lib/scenarios/segment";
import type { Inline } from "@/lib/scenarios/types";

/*
 * "Muro de estafas": la versión honesta del muro de testimonios. En vez de
 * opiniones inventadas, muestra mensajes reales del simulador (todos ficticios)
 * como tarjetas, sin revelar cuál es trampa.
 */

const ICON = { email: Mail, sms: MessageSquare, chat: Smartphone } as const;

const text = (x: Inline) => (typeof x === "string" ? x : x.t);

function initials(name: string) {
  const clean = name.replace(/[^\p{L}\s]/gu, "").trim();
  return clean ? clean.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase() : "#";
}

export async function ScamWall() {
  const { lang, t } = await getT();
  const labels = channelLabels(lang);
  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-4">
      {getScenarios(lang).map((s) => {
        const seg = segmentScenario(s);
        const name = text(s.from.name);
        const address = text(s.from.address);
        const body = seg.body.flat().map((x) => x.text).join(" ");
        const label = labels[s.channel];
        const Icon = ICON[s.channel];
        let hue = 0;
        for (const ch of name) hue = (hue * 31 + ch.charCodeAt(0)) % 360;
        return (
          <article
            key={s.id}
            className="mb-4 break-inside-avoid rounded-3xl border border-desk-line bg-desk-2 p-6 transition-colors duration-150 hover:border-fog/50"
          >
            <header className="flex items-start gap-3">
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-semibold text-white"
                style={{ background: `hsl(${hue} 45% 40%)` }}
                aria-hidden
              >
                {initials(name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{name}</p>
                <p className="truncate font-mono text-[13px] text-fog">{address}</p>
              </div>
              <X className="h-4 w-4 shrink-0 text-desk-line" strokeWidth={2} aria-hidden />
            </header>
            {s.subject && <p className="mt-4 font-semibold leading-snug">{s.subject.map(text).join(" ")}</p>}
            <p className="mt-2 line-clamp-5 text-[15px] leading-relaxed text-graphite">{body}</p>
            <footer className="mt-5 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-desk-3 px-2.5 py-1 text-xs font-medium text-fog">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                {label}
              </span>
              <Link href="/simulador" className="text-sm font-semibold text-brand hover:underline">
                {t("¿Trampa o real?", "Scam or real?")}
              </Link>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
