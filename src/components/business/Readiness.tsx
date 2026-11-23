import { readinessLevel, type ReadinessInput } from "@/lib/business";
import { LOCALE } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";

const TONE = { ok: "#16a34a", warn: "#f59e0b", bad: "#dc2626" } as const;

/** Medidor semicircular del índice de preparación (0-100). */
export async function ReadinessGauge({ score, size = 200 }: { score: number | null; size?: number }) {
  const { lang, t } = await getT();
  const s = score ?? 0;
  const level = score === null ? null : readinessLevel(s, lang);
  const color = level ? TONE[level.tone] : "#94a3b8";
  // Arco de 180°: longitud = π·r
  const r = 80;
  const len = Math.PI * r;
  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 200 115" width={size} aria-hidden>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="16" strokeLinecap="round" />
        <path
          d="M20 100 A80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${(s / 100) * len} ${len}`}
        />
      </svg>
      <p className="-mt-12 font-display text-4xl tabular-nums">{score === null ? "—" : score}</p>
      <p className="mt-1 text-sm font-semibold" style={{ color }}>
        {level ? level.label : t("Sin datos aún", "No data yet")}
      </p>
    </div>
  );
}

/** Qué compone el índice, para que el encargado sepa qué mejorar. */
export async function ReadinessParts({ input, track = "bg-desk-3" }: { input: ReadinessInput; track?: string }) {
  const { t } = await getT();
  const rows = [
    [t("Avance de la ruta", "Path progress"), input.pathPct, t("Que todos completen sus lecciones", "Everyone completing their lessons")],
    [t("Bandeja de entrenamiento", "Training inbox"), input.inboxScore, t("Puntaje promedio del equipo", "Team average score")],
    [
      t("No cayeron en simulacros", "Didn't fall for drills"),
      input.clickRate === null ? null : 100 - input.clickRate,
      t("Menos clics es mejor", "Fewer clicks is better"),
    ],
    [t("Reportaron los simulacros", "Reported the drills"), input.reportRate, t("Reportar avisa a los demás", "Reporting warns everyone else")],
  ] as const;
  return (
    <ul className="space-y-3">
      {rows.map(([label, v, hint]) => (
        <li key={label}>
          <div className="flex justify-between text-sm">
            <span>{label}</span>
            <span className="tabular-nums text-fog">{v === null ? t("sin datos", "no data") : `${v}%`}</span>
          </div>
          <div className={`mt-1.5 h-2 overflow-hidden rounded-full ${track}`}>
            <div className="h-full rounded-full bg-brand" style={{ width: `${v ?? 0}%` }} />
          </div>
          <p className="mt-0.5 text-xs text-fog">{hint}</p>
        </li>
      ))}
    </ul>
  );
}

/** Evolución mensual del índice. */
export async function ReadinessHistory({ history }: { history: { month: string; score: number }[] }) {
  const { lang, t } = await getT();
  if (history.length < 2)
    return <p className="text-sm text-fog">{t("La evolución mensual aparecerá a partir del próximo mes.", "The monthly trend will show up starting next month.")}</p>;
  const label = (m: string) => new Date(`${m}-15T12:00:00Z`).toLocaleDateString(LOCALE[lang], { month: "short" });
  return (
    <div className="flex h-28 items-end gap-2">
      {history.map((h) => (
        <div key={h.month} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs tabular-nums text-fog">{h.score}</span>
          <div className="w-full rounded-t-md bg-brand" style={{ height: `${Math.max(6, h.score * 0.8)}px` }} />
          <span className="text-xs text-fog">{label(h.month)}</span>
        </div>
      ))}
    </div>
  );
}
