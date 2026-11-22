import { ImageResponse } from "next/og";
import { collections } from "@/lib/server/db";
import { OG_SIZE, OgFrame, ogBadge } from "@/lib/og";

export const alt = "Reto de Ciberlearn: ¿trampa o real?";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { challenges } = await collections();
  const ch = await challenges.findOne({ code: decodeURIComponent(code).slice(0, 20) }, { projection: { creatorName: 1, creatorScore: 1, exerciseIds: 1 } });
  const total = ch?.exerciseIds.length ?? 5;

  return new ImageResponse(
    (
      <OgFrame
        eyebrow="Reto entre amigos"
        title={ch ? (ch.creatorScore === null ? `${ch.creatorName} te reta` : `${ch.creatorName} sacó ${ch.creatorScore}/${total}`) : "¿Quién detecta más estafas?"}
        subtitle={`${total} mensajes: ¿trampa o real? Juega sin crear cuenta.`}
        badge={ogBadge("¿Le ganas?")}
      />
    ),
    size,
  );
}
