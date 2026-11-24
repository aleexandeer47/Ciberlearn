"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useT } from "@/components/i18n/LangProvider";
import { setSoundEnabled, useSoundEnabled } from "@/lib/sfx";

/** Botón del encabezado para activar o silenciar los efectos de sonido (se recuerda en este navegador). */
export function SoundToggle() {
  const on = useSoundEnabled();
  const t = useT();
  const Icon = on === false ? VolumeX : Volume2;
  return (
    <button
      type="button"
      onClick={() => setSoundEnabled(on === false)}
      aria-pressed={on !== false}
      aria-label={on === false ? t("Activar sonidos", "Turn sounds on") : t("Silenciar sonidos", "Mute sounds")}
      title={on === false ? t("Sonidos desactivados", "Sounds off") : t("Sonidos activados", "Sounds on")}
      className="grid h-10 w-10 place-items-center rounded-full text-fog transition-[color,background-color,transform] duration-150 hover:bg-desk-3 hover:text-chalk active:scale-95"
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
    </button>
  );
}

/** Versión de texto para el pie de página (en celular el botón del encabezado no cabe). */
export function SoundFooterLink() {
  const on = useSoundEnabled();
  const t = useT();
  return (
    <button type="button" onClick={() => setSoundEnabled(on === false)} className="font-medium text-chalk hover:text-brand">
      {on === false ? t("Activar sonidos", "Turn sounds on") : t("Silenciar sonidos", "Mute sounds")}
    </button>
  );
}
