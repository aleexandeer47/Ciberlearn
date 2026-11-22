"use client";

import { Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getShareLink, stopSharing } from "@/app/actions/share";
import { ShareButtons } from "./ShareButtons";

/** Crea el enlace público de la tarjeta de logro solo cuando la persona decide compartir. */
export function ShareAchievement({ initialPath }: { initialPath: string | null }) {
  const [path, setPath] = useState(initialPath);
  const [busy, setBusy] = useState(false);

  if (!path)
    return (
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const r = await getShareLink();
          setBusy(false);
          if (r.ok) setPath(r.path);
        }}
        className="btn btn-primary h-11 px-5 text-sm disabled:opacity-60"
      >
        <Share2 className="h-4 w-4" aria-hidden />
        {busy ? "Creando…" : "Compartir mi logro"}
      </button>
    );

  return (
    <div className="space-y-3">
      <ShareButtons compact path={path} text="Mira mi nivel detectando estafas en Ciberlearn. ¿Tú cuánto sacas?" />
      <p className="text-xs text-fog">
        Tu tarjeta muestra tu apodo, nivel, XP y lecciones; nunca tu nombre ni tu correo.{" "}
        <Link href={path} className="underline underline-offset-2" target="_blank">
          Ver tarjeta
        </Link>{" "}
        ·{" "}
        <button
          type="button"
          className="underline underline-offset-2"
          onClick={async () => {
            await stopSharing();
            setPath(null);
          }}
        >
          Dejar de compartir
        </button>
      </p>
    </div>
  );
}
