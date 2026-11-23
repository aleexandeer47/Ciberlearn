import { ImageResponse } from "next/og";
import { collections } from "@/lib/server/db";
import { isLang } from "@/lib/i18n";
import { OG_SIZE, OgFrame, ogBadge } from "@/lib/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ lang: string; code: string }> }) {
  const { code, lang: l } = await params;
  const lang = isLang(l) ? l : "es";
  const en = lang === "en";
  const { challenges } = await collections();
  const ch = await challenges.findOne({ code: decodeURIComponent(code).slice(0, 20) }, { projection: { creatorName: 1, creatorScore: 1, exerciseIds: 1 } });
  const total = ch?.exerciseIds.length ?? 5;

  return new ImageResponse(
    (
      <OgFrame
        lang={lang}
        eyebrow={en ? "Challenge with friends" : "Reto entre amigos"}
        title={
          ch
            ? ch.creatorScore === null
              ? en
                ? `${ch.creatorName} challenges you`
                : `${ch.creatorName} te reta`
              : en
                ? `${ch.creatorName} scored ${ch.creatorScore}/${total}`
                : `${ch.creatorName} sacó ${ch.creatorScore}/${total}`
            : en
              ? "Who spots the most scams?"
              : "¿Quién detecta más estafas?"
        }
        subtitle={en ? `${total} messages: scam or real? Play without signing up.` : `${total} mensajes: ¿trampa o real? Juega sin crear cuenta.`}
        badge={ogBadge(en ? "Can you win?" : "¿Le ganas?")}
      />
    ),
    size,
  );
}
