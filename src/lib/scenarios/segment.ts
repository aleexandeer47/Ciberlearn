import type { Inline, Scenario, Segment, SegmentedScenario } from "./types";

const SENTENCE_SPLIT = /(?<=[.!?…])\s+/;

function toSegments(items: Inline[], prefix: string): Segment[] {
  const out: Segment[] = [];
  items.forEach((item, i) => {
    if (typeof item === "string") {
      item
        .split(SENTENCE_SPLIT)
        .filter((part) => part.trim().length > 0)
        .forEach((text, j) => out.push({ key: `${prefix}-${i}-${j}`, text }));
    } else {
      out.push({ key: `${prefix}-${i}`, text: item.t, signal: item.s, href: item.href });
    }
  });
  return out;
}

/** Convierte un escenario en piezas marcables con claves estables. */
export function segmentScenario(s: Scenario): SegmentedScenario {
  const from = {
    name: toSegments([s.from.name], "from-name"),
    address: toSegments([s.from.address], "from-addr"),
  };
  const subject = toSegments(s.subject ?? [], "subject");
  const body = s.body.map((p, i) => toSegments(p, `body-${i}`));
  const attachments: Segment[] = (s.attachments ?? []).map((a, i) => ({
    key: `att-${i}`,
    text: a.name,
    signal: a.s,
  }));

  const all = [...from.name, ...from.address, ...subject, ...body.flat(), ...attachments];
  return { from, subject, body, attachments, all };
}
