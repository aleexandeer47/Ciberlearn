import { ImageResponse } from "next/og";
import { OG_SIZE, OgFrame, ogBadge } from "@/lib/og";
import { achievementByShareId } from "@/lib/server/achievement";

export const alt = "Tarjeta de logro de Ciberlearn";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await achievementByShareId(id);
  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Detective de estafas"
        title={a ? `${a.name}: nivel ${a.level.name}` : "Aprende a detectar estafas"}
        subtitle={a ? `${a.xp.toLocaleString("es-SV")} XP · ${a.lessons} de ${a.totalLessons} lecciones · racha de ${a.bestStreak} días` : undefined}
        badge={ogBadge("¿Y tú?")}
      />
    ),
    size,
  );
}
