"use client";

import { Heart, Infinity as InfinityIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { fmtWait, type LivesView } from "@/lib/lives";

/** Vidas con cuenta regresiva hasta la próxima. */
export function Hearts({ lives, compact = false }: { lives: LivesView; compact?: boolean }) {
  const [left, setLeft] = useState(lives.nextInMs);
  const [shownAt] = useState(() => Date.now());

  useEffect(() => {
    if (lives.nextInMs === null) return;
    const id = setInterval(() => setLeft(Math.max(0, lives.nextInMs! - (Date.now() - shownAt))), 1000);
    return () => clearInterval(id);
  }, [lives.nextInMs, shownAt]);

  if (lives.infinite) {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-bad" title="Vidas infinitas con Pro">
        <Heart className="h-5 w-5 fill-current" strokeWidth={1.5} aria-hidden />
        <InfinityIcon className="h-4 w-4" strokeWidth={2.25} aria-label="infinitas" />
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2" aria-label={`${lives.count} de ${lives.max} vidas`}>
      {compact ? (
        <span className="inline-flex items-center gap-1 font-semibold text-bad">
          <Heart className="h-5 w-5 fill-current" strokeWidth={1.5} aria-hidden />
          <span className="tabular-nums">{lives.count}</span>
        </span>
      ) : (
        <span className="flex gap-0.5" aria-hidden>
          {Array.from({ length: lives.max }, (_, i) => (
            <Heart
              key={i}
              className={`h-5 w-5 transition-colors duration-200 ${i < lives.count ? "fill-current text-bad" : "text-desk-line"}`}
              strokeWidth={1.5}
            />
          ))}
        </span>
      )}
      {left !== null && lives.count < lives.max && (
        <span className="text-xs tabular-nums text-fog">+1 en {fmtWait(left)}</span>
      )}
    </span>
  );
}
