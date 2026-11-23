import { Check } from "lucide-react";
import type { CSSProperties } from "react";
import { useLang, useT } from "@/components/i18n/LangProvider";
import { categoryLabels } from "@/lib/scenarios/categories";
import type { Scenario } from "@/lib/scenarios/types";
import type { ScenarioResult } from "@/lib/scoring";

interface Props {
  scenario: Scenario;
  result: ScenarioResult;
  signalNumbers: Map<string, number>;
  /** null cuando se está repasando un mensaje anterior. */
  onNext: (() => void) | null;
  isLast: boolean;
}

const i = (n: number) => ({ "--i": n }) as CSSProperties;

export function ResultPanel({ scenario, result, signalNumbers, onNext, isLast }: Props) {
  const isPhishing = scenario.verdict === "phishing";
  const perfect = result.points === 100;
  const lang = useLang();
  const t = useT();
  const fp = result.falsePositives.length;

  return (
    <section aria-live="polite" className="space-y-6 rounded-3xl border border-desk-line bg-desk-2 p-5 sm:p-7">
      <div className="reveal-item flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className={`font-mono text-xs ${result.verdictCorrect ? "text-ok" : "text-bad"}`}>
            {perfect ? t("Perfecto", "Perfect") : result.verdictCorrect ? t("Bien visto", "Well spotted") : t("Esta vez no", "Not this time")}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">{isPhishing ? t("Era phishing", "It was phishing") : t("Era legítimo", "It was legit")}</h2>
        </div>
        <div className="text-right">
          <div className="font-display text-4xl font-semibold leading-none tabular-nums">
            +{result.points}
          </div>
          <div className="mt-1 text-xs text-fog">{t("de 100 puntos", "out of 100 points")}</div>
        </div>
      </div>

      {isPhishing ? (
        <div>
          <p className="reveal-item mb-4 text-sm text-fog" style={i(1)}>
            {t("Encontraste", "You found")} <strong className="text-chalk">{result.foundSignals.length}</strong> {t("de", "of")}{" "}
            {scenario.signals.length} {t("señales.", "signs.")}
            {fp > 0 &&
              t(
                ` Marcaste ${fp} ${fp === 1 ? "parte normal" : "partes normales"} (tachadas).`,
                ` You marked ${fp} normal ${fp === 1 ? "part" : "parts"} (crossed out).`,
              )}
          </p>
          <ol className="space-y-3">
            {scenario.signals.map((sig, n) => {
              const found = result.foundSignals.includes(sig.id);
              return (
                <li key={sig.id} className="reveal-item flex gap-3 rounded-2xl bg-desk p-4" style={i(n + 2)}>
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold text-white ${found ? "bg-ok" : "bg-bad"}`}
                  >
                    {signalNumbers.get(sig.id)}
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold">
                      {sig.title}
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-normal ${
                          found ? "bg-ok/15 text-ok" : "bg-bad/15 text-bad"
                        }`}
                      >
                        {found ? t("encontrada", "found") : t("se te pasó", "missed")}
                      </span>
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-fog">{categoryLabels(lang)[sig.category].label}</p>
                    <p className="mt-2 text-sm leading-relaxed text-chalk/85">{sig.explanation}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <div>
          <p className="reveal-item mb-4 text-sm text-fog" style={i(1)}>
            {fp === 0
              ? t("No marcaste nada sospechoso. Muy bien: aquí no había nada raro.", "You didn't mark anything suspicious. Nice: there was nothing odd here.")
              : t(
                  `Marcaste ${fp} ${fp === 1 ? "parte" : "partes"} que eran normales (tachadas).`,
                  `You marked ${fp} ${fp === 1 ? "part" : "parts"} that were normal (crossed out).`,
                )}
          </p>
          <ul className="space-y-2">
            {scenario.legitReasons?.map((r, n) => (
              <li key={r} className="reveal-item flex gap-3 rounded-2xl bg-desk p-4 text-sm leading-relaxed" style={i(n + 2)}>
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ok text-white" aria-hidden>
                  <Check className="h-3.5 w-3.5" strokeWidth={2.25} />
                </span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className="reveal-item rounded-2xl bg-hl p-4 text-ink"
        style={i((isPhishing ? scenario.signals.length : (scenario.legitReasons?.length ?? 0)) + 2)}
      >
        <p className="font-mono text-[11px]">{t("Para recordar", "Remember")}</p>
        <p className="mt-1 leading-relaxed">{scenario.takeaway}</p>
      </div>

      {onNext && (
        <button type="button" onClick={onNext} className="btn btn-primary w-full px-6 py-3.5 sm:w-auto">
          {isLast ? t("Ver mi resultado", "See my result") : t("Siguiente mensaje", "Next message")} <span aria-hidden>→</span>
          <kbd className="ml-1 hidden sm:inline">Enter</kbd>
        </button>
      )}
    </section>
  );
}
