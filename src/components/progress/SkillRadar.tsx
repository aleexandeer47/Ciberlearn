/*
 * Radar de habilidades: un eje por tipo de señal (8). El polígono de fondo es el 100 %; el verde es lo
 * que detectas. Se adapta al ancho (viewBox) y funciona sin JavaScript (componente de servidor).
 */

export interface RadarSkill {
  category: string;
  label: string;
  pct: number;
  total: number;
}

const W = 600;
const H = 500;
const CX = W / 2;
const CY = H / 2 + 4;
const R = 150;

const point = (i: number, n: number, r: number): [number, number] => {
  const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};
const poly = (pts: [number, number][]) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** Parte una etiqueta larga en dos líneas por el espacio más cercano a la mitad. */
function twoLines(s: string): string[] {
  if (s.length <= 12 || !s.includes(" ")) return [s];
  const mid = s.length / 2;
  let best = -1;
  for (let i = 0; i < s.length; i++) if (s[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  return [s.slice(0, best), s.slice(best + 1)];
}

export function SkillRadar({
  skills,
  weakest,
  ariaLabel,
  noData,
}: {
  skills: RadarSkill[];
  weakest?: string | null;
  ariaLabel: string;
  noData: string;
}) {
  const n = skills.length;
  const rings = [0.25, 0.5, 0.75, 1];
  const outer = skills.map((_, i) => point(i, n, R));
  const values = skills.map((s, i) => point(i, n, R * Math.max(0.04, (s.total ? s.pct : 0) / 100)));

  return (
    <figure className="mx-auto w-full max-w-[560px]">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={ariaLabel} className="block h-auto w-full">
        {/* Fondo: el 100 % de cada habilidad */}
        <polygon points={poly(outer)} fill="#5eead4" fillOpacity={0.22} stroke="#0f766e" strokeOpacity={0.55} strokeWidth={2} />
        {rings.slice(0, -1).map((k) => (
          <polygon key={k} points={poly(skills.map((_, i) => point(i, n, R * k)))} fill="none" stroke="var(--desk-line)" strokeWidth={1} />
        ))}
        {outer.map(([x, y], i) => (
          <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--desk-line)" strokeWidth={1} />
        ))}
        {/* Lo que detectas */}
        <polygon points={poly(values)} fill="#22c55e" fillOpacity={0.45} stroke="#16a34a" strokeWidth={2.5} strokeLinejoin="round" />
        {values.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4} fill="#16a34a" stroke="var(--desk-2)" strokeWidth={1.5} />
        ))}
        {/* Etiquetas con su porcentaje */}
        {skills.map((s, i) => {
          const [x, y] = point(i, n, R + 28);
          const cos = Math.cos(-Math.PI / 2 + (i / n) * Math.PI * 2);
          const anchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
          const lines = twoLines(s.label);
          const weak = weakest === s.category;
          // Arriba se escribe hacia arriba; abajo, hacia abajo; a los lados, centrado
          const sin = Math.sin(-Math.PI / 2 + (i / n) * Math.PI * 2);
          const total = lines.length + 1;
          const startY = sin < -0.5 ? y - (total - 1) * 19 : sin > 0.5 ? y + 10 : y - ((total - 1) * 19) / 2 + 4;
          return (
            <text key={s.category} x={x} y={startY} textAnchor={anchor} className="text-[19px] font-semibold">
              {lines.map((l, k) => (
                <tspan key={k} x={x} dy={k === 0 ? 0 : 19} fill={weak ? "#ef4444" : "#16a34a"}>
                  {l}
                </tspan>
              ))}
              <tspan x={x} dy={19} className="fill-fog font-mono text-[17px] font-normal">
                {s.total ? `${s.pct}%` : noData}
              </tspan>
            </text>
          );
        })}
      </svg>
    </figure>
  );
}
