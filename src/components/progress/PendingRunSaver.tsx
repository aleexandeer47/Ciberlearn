"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { saveRun, type RunInput } from "@/app/actions/runs";
import { PENDING_RUN_KEY } from "@/components/simulator/Summary";

/** Sube la ronda que se hizo antes de crear la cuenta (guardada en sessionStorage). */
export function PendingRunSaver() {
  const router = useRouter();
  const [saved, setSaved] = useState<number | null>(null);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    let run: RunInput | null = null;
    try {
      const raw = sessionStorage.getItem(PENDING_RUN_KEY);
      if (raw) run = JSON.parse(raw);
      sessionStorage.removeItem(PENDING_RUN_KEY);
    } catch {}
    if (!run) return;
    saveRun(run).then((res) => {
      if (res.ok) {
        setSaved(res.score);
        router.refresh();
      }
    });
  }, [router]);

  if (saved === null) return null;
  return (
    <p className="pop-in rounded-2xl border border-ok/40 bg-ok/10 px-5 py-3 text-sm">
      <strong className="text-ok">Listo:</strong> guardamos la ronda que hiciste antes de registrarte ({saved} pts).
    </p>
  );
}
