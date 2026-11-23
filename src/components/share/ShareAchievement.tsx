"use client";

import { Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getShareLink, stopSharing } from "@/app/actions/share";
import { useT } from "@/components/i18n/LangProvider";
import { SITE } from "@/lib/site";
import { ShareButtons } from "./ShareButtons";

/** Crea el enlace público de la tarjeta de logro solo cuando la persona decide compartir. */
export function ShareAchievement({ initialPath }: { initialPath: string | null }) {
  const [path, setPath] = useState(initialPath);
  const [busy, setBusy] = useState(false);
  const t = useT();

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
        {busy ? t("Creando…", "Creating…") : t("Compartir mi logro", "Share my achievement")}
      </button>
    );

  return (
    <div className="space-y-3">
      <ShareButtons
        compact
        path={path}
        text={t(
          `Mira mi nivel detectando estafas en ${SITE.name}. ¿Tú cuánto sacas?`,
          `Check out my scam-spotting level on ${SITE.name}. What's yours?`,
        )}
      />
      <p className="text-xs text-fog">
        {t(
          "Tu tarjeta muestra tu apodo, nivel, XP y lecciones; nunca tu nombre ni tu correo.",
          "Your card shows your nickname, level, XP and lessons; never your name or email.",
        )}{" "}
        <Link href={path} className="underline underline-offset-2" target="_blank">
          {t("Ver tarjeta", "View card")}
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
          {t("Dejar de compartir", "Stop sharing")}
        </button>
      </p>
    </div>
  );
}
