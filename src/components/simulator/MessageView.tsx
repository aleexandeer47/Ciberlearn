"use client";

import { Paperclip } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Scenario, Segment, SegmentedScenario, Verdict } from "@/lib/scenarios/types";
import { useT } from "@/components/i18n/LangProvider";
import { dissectUrl } from "@/lib/url";

export type SegState = "idle" | "marked" | "found" | "missed" | "false-positive";

interface Props {
  scenario: Scenario;
  segmented: SegmentedScenario;
  marked: ReadonlySet<string>;
  revealed: boolean;
  /** Veredicto que eligió el usuario: se estampa como sello. */
  stamped?: Verdict | "timeout";
  signalNumbers: Map<string, number>;
  onToggle: (key: string) => void;
}

interface Tip {
  href: string;
  x: number;
  y: number;
}

function stateOf(seg: Segment, marked: ReadonlySet<string>, revealed: boolean, found: ReadonlySet<string>): SegState {
  const isMarked = marked.has(seg.key);
  if (!revealed) return isMarked ? "marked" : "idle";
  // Una señal puede repartirse en varias frases: basta con marcar una.
  if (seg.signal) return found.has(seg.signal) ? "found" : "missed";
  return isMarked ? "false-positive" : "idle";
}

export function MessageView(props: Props) {
  const { scenario, segmented, stamped, revealed } = props;
  const frameRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const t = useT();

  const showTip = (href: string, el: HTMLElement) => {
    const frame = frameRef.current;
    if (!frame) return;
    const f = frame.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = Math.min(Math.max(r.left + r.width / 2 - f.left, 140), f.width - 140);
    setTip({ href, x, y: r.top - f.top });
  };

  const firstOfSignal = new Set<string>();
  const seen = new Set<string>();
  const found = new Set<string>();
  for (const seg of segmented.all) {
    if (seg.signal && !seen.has(seg.signal)) {
      seen.add(seg.signal);
      firstOfSignal.add(seg.key);
    }
    if (seg.signal && props.marked.has(seg.key)) found.add(seg.signal);
  }

  const render = (segs: Segment[]) =>
    segs.map((seg, i) => (
      <SegmentSpan
        key={seg.key}
        seg={seg}
        badge={firstOfSignal.has(seg.key)}
        found={found}
        {...props}
        trailing={i < segs.length - 1 ? " " : ""}
        onLink={showTip}
        onLinkLeave={() => setTip(null)}
      />
    ));

  const tipNode = tip && <LinkTip tip={tip} revealed={revealed} />;
  const stamp = stamped && (
    <div className="stamp" data-kind={stamped === "timeout" ? "phishing" : stamped}>
      {stamped === "phishing" ? "Phishing" : stamped === "legit" ? t("Legítimo", "Legit") : t("Sin tiempo", "Time's up")}
    </div>
  );

  const frame = (children: ReactNode, className: string) => (
    <div
      ref={frameRef}
      key={`${scenario.id}-${stamped ?? "open"}`}
      className={`relative ${className} ${stamped ? "thud" : ""}`}
      onMouseLeave={() => setTip(null)}
    >
      {children}
      {stamp}
      {tipNode}
    </div>
  );

  if (scenario.channel === "email") {
    return frame(
      <div className="overflow-hidden rounded-2xl bg-paper text-ink shadow-[0_30px_60px_-30px_var(--shadow)] ring-1 ring-line">
        <div className="flex items-center gap-1.5 border-b border-line bg-paper-2/70 px-4 py-2.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="ml-3 font-mono text-[11px] text-ink-3">{t("Bandeja de entrada", "Inbox")}</span>
        </div>
        <div className="space-y-2 border-b border-line px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3">
            <Avatar name={segmented.from.name.map((s) => s.text).join(" ")} />
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{render(segmented.from.name)}</div>
              <div className="break-all font-mono text-[13px] text-ink-2">&lt;{render(segmented.from.address)}&gt;</div>
            </div>
            <span className="shrink-0 text-xs text-ink-3">{scenario.time}</span>
          </div>
          {segmented.subject.length > 0 && (
            <div className="pt-2 font-semibold text-lg leading-snug sm:text-xl">{render(segmented.subject)}</div>
          )}
        </div>
        <div className="space-y-4 px-5 py-6 text-[15.5px] leading-[1.75] sm:px-7">
          {segmented.body.map((p, i) => (
            <p key={i}>{render(p)}</p>
          ))}
          {segmented.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {segmented.attachments.map((a) => (
                <span key={a.key} className="inline-flex items-center gap-2 rounded-lg border border-line bg-paper-2 px-3 py-2 text-sm">
                  <Paperclip className="h-4 w-4 text-ink-3" strokeWidth={1.5} aria-hidden />
                  <SegmentSpan seg={a} badge={firstOfSignal.has(a.key)} found={found} {...props} trailing="" />
                </span>
              ))}
            </div>
          )}
        </div>
      </div>,
      "",
    );
  }

  // SMS y chat: un teléfono
  return frame(
    <div className="overflow-hidden rounded-[34px] border-[6px] border-desk-3 bg-paper text-ink shadow-[0_30px_60px_-30px_var(--shadow)] ring-1 ring-line">
      <div className="flex items-center gap-3 border-b border-line bg-paper-2/70 px-4 py-3">
        <Avatar name={segmented.from.name.map((s) => s.text).join(" ")} round />
        <div className="min-w-0">
          <div className="font-semibold">{render(segmented.from.name)}</div>
          <div className="text-xs text-ink-3">{render(segmented.from.address)}</div>
        </div>
        <span className="ml-auto rounded-full bg-ink/5 px-2 py-0.5 font-mono text-[10px] text-ink-3">
          {scenario.channel === "sms" ? "SMS" : "Chat"}
        </span>
      </div>
      <div className="min-h-[300px] space-y-2.5 px-3 py-6 [background:repeating-linear-gradient(0deg,transparent_0_23px,rgb(0_0_0/0.025)_23px_24px)]">
        <p className="pb-2 text-center font-mono text-[10px] text-ink-3">{t("Hoy", "Today")} {scenario.time}</p>
        {segmented.body.map((bubble, i) => (
          <div
            key={i}
            style={{ animationDelay: `${i * 90}ms` }}
            className="reveal-item max-w-[88%] rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-[15px] leading-relaxed shadow-sm ring-1 ring-line"
          >
            {render(bubble)}
          </div>
        ))}
      </div>
    </div>,
    "mx-auto max-w-md",
  );
}

function Avatar({ name, round = true }: { name: string; round?: boolean }) {
  const clean = name.replace(/[^\p{L}\s]/gu, "").trim();
  const initials = clean
    ? clean
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "#";
  let hue = 0;
  for (const ch of name) hue = (hue * 31 + ch.charCodeAt(0)) % 360;
  return (
    <span
      aria-hidden
      className={`grid h-10 w-10 shrink-0 place-items-center font-semibold text-xs font-semibold text-white ${round ? "rounded-full" : "rounded-lg"}`}
      style={{ background: `hsl(${hue} 45% 38%)` }}
    >
      {initials}
    </span>
  );
}

function LinkTip({ tip, revealed }: { tip: Tip; revealed: boolean }) {
  const t = useT();
  const a = revealed ? dissectUrl(tip.href) : null;
  return (
    <div
      role="tooltip"
      className="link-tip pointer-events-none absolute z-20 w-max max-w-[min(92vw,420px)] -translate-x-1/2 -translate-y-full rounded-xl bg-desk px-3.5 py-2.5 font-mono text-xs text-chalk shadow-2xl ring-1 ring-desk-line"
      style={{ left: tip.x, top: tip.y - 10 }}
    >
      <span className="mb-1 block text-[10px] text-fog">{t("Este enlace lleva a", "This link goes to")}</span>
      {a ? (
        <span className="break-all">
          <span className="text-fog">{a.protocol}{a.subdomain && `${a.subdomain}.`}</span>
          <span className="rounded bg-hl px-0.5 text-ink">{a.domain}</span>
          <span className="text-fog">{a.rest}</span>
        </span>
      ) : (
        <span className="break-all">{tip.href}</span>
      )}
    </div>
  );
}

function SegmentSpan({
  seg,
  badge,
  found,
  trailing,
  marked,
  revealed,
  signalNumbers,
  onToggle,
  onLink,
  onLinkLeave,
}: Props & {
  seg: Segment;
  badge: boolean;
  found: ReadonlySet<string>;
  trailing: string;
  onLink?: (href: string, el: HTMLElement) => void;
  onLinkLeave?: () => void;
}) {
  const state = stateOf(seg, marked, revealed, found);
  const num = revealed && badge && seg.signal ? signalNumbers.get(seg.signal) : undefined;

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(seg.key);
    }
  };

  const content: ReactNode = seg.href ? <span className="seg-link">{seg.text}</span> : seg.text;

  const linkHandlers =
    seg.href && onLink
      ? {
          onMouseEnter: (e: React.MouseEvent<HTMLElement>) => onLink(seg.href!, e.currentTarget),
          onFocus: (e: React.FocusEvent<HTMLElement>) => onLink(seg.href!, e.currentTarget),
          onBlur: onLinkLeave,
        }
      : {};

  return (
    <>
      <span
        className="seg"
        data-state={state}
        data-mode={revealed ? "review" : "inspect"}
        {...(revealed
          ? { tabIndex: seg.href ? 0 : undefined }
          : {
              role: "button",
              tabIndex: 0,
              "aria-pressed": marked.has(seg.key),
              onClick: (e: React.MouseEvent<HTMLElement>) => {
                if (seg.href && onLink) onLink(seg.href, e.currentTarget);
                onToggle(seg.key);
              },
              onKeyDown: onKey,
            })}
        {...linkHandlers}
      >
        {content}
        {num !== undefined && (
          <sup
            className={`reveal-item ml-0.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 align-super font-sans text-[10px] font-semibold not-italic text-white ${
              state === "found" ? "bg-ok" : "bg-bad"
            }`}
            style={{ "--i": num } as React.CSSProperties}
          >
            {num}
          </sup>
        )}
      </span>
      {trailing}
    </>
  );
}
