"use client";

import { Film } from "lucide-react";
import { useState } from "react";
import { useT } from "@/components/i18n/LangProvider";
import { DepthCinematic } from "./DepthCinematic";

/** Botón para ver el corte del océano completo y dónde va tu pez. */
export function DiveReplay({ zone }: { zone: number }) {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
      >
        <Film className="h-4 w-4" aria-hidden /> {t("Ver mi inmersión", "See my dive")}
      </button>
      {open && <DepthCinematic mode="recorrido" from={zone} to={zone} onClose={() => setOpen(false)} />}
    </>
  );
}
