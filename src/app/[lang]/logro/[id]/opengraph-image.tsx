import { ImageResponse } from "next/og";
import { OG_SIZE, OgFrame, ogBadge } from "@/lib/og";
import { isLang, LOCALE } from "@/lib/i18n";
import { achievementByShareId } from "@/lib/server/achievement";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const p = await params;
  const id = p.id;
  const lang = isLang(p.lang) ? p.lang : "es";
  const en = lang === "en";
  const a = await achievementByShareId(id, lang);
  const xp = a?.xp.toLocaleString(LOCALE[lang]);
  return new ImageResponse(
    (
      <OgFrame
        lang={lang}
        eyebrow={en ? "Scam detective" : "Detective de estafas"}
        title={a ? (en ? `${a.name}: level ${a.level.name}` : `${a.name}: nivel ${a.level.name}`) : en ? "Learn to spot scams" : "Aprende a detectar estafas"}
        subtitle={
          a
            ? en
              ? `${xp} XP · ${a.lessons} of ${a.totalLessons} lessons · ${a.bestStreak}-day streak`
              : `${xp} XP · ${a.lessons} de ${a.totalLessons} lecciones · racha de ${a.bestStreak} días`
            : undefined
        }
        badge={ogBadge(en ? "What about you?" : "¿Y tú?")}
      />
    ),
    size,
  );
}
