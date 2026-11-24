import type { Lang } from "@/lib/i18n";

/*
 * Evolución del pez en la ruta: una criatura por zona del mar, cada vez más grande y más difícil de
 * engañar. Empieza como un alevín en la superficie y termina como el Kraken en el abismo (la prueba final).
 * Todas miran a la derecha (el Kraken, de frente). Dibujos propios en SVG.
 */

type Svg = (p: { className?: string }) => React.ReactElement;

const Fry: Svg = ({ className }) => (
  <svg viewBox="0 0 32 20" className={className} aria-hidden>
    <path d="M8 10 L2 5 L3 10 L2 15 Z" fill="#fcd34d" />
    <ellipse cx="18" cy="10" rx="10" ry="5" fill="#fde68a" />
    <ellipse cx="17" cy="11.5" rx="6" ry="2" fill="#fef9c3" opacity="0.8" />
    <circle cx="23.5" cy="9" r="1.7" fill="#0a0f1c" />
  </svg>
);

const ReefFish: Svg = ({ className }) => (
  <svg viewBox="0 0 48 28" className={className} aria-hidden>
    <path d="M8 14 C 14 3, 32 2, 40 14 C 32 26, 14 25, 8 14 Z" fill="#fbbf24" />
    <path d="M8 14 L 1 6 L 2 14 L 1 22 Z" fill="#f59e0b" />
    <path d="M22 9 q 3 5 0 10" stroke="#f59e0b" strokeWidth="1.6" fill="none" />
    <circle cx="33" cy="12" r="2.2" fill="#0a0f1c" />
  </svg>
);

const PUFFER_SPIKES = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  const r1 = 13;
  const r2 = 18;
  const w = 0.13;
  const p = (r: number, ang: number) => `${(26 + r * Math.cos(ang)).toFixed(1)} ${(20 + r * Math.sin(ang)).toFixed(1)}`;
  return `M${p(r1, a - w)} L${p(r2, a)} L${p(r1, a + w)} Z`;
}).join(" ");

const Puffer: Svg = ({ className }) => (
  <svg viewBox="0 0 48 40" className={className} aria-hidden>
    <path d={PUFFER_SPIKES} fill="#ea580c" />
    <path d="M13 20 L5 13 L6 20 L5 27 Z" fill="#f97316" />
    <circle cx="26" cy="20" r="13" fill="#fb923c" />
    <ellipse cx="26" cy="25.5" rx="9" ry="5.5" fill="#fed7aa" />
    <circle cx="32" cy="16" r="3" fill="#fff" />
    <circle cx="33" cy="16" r="1.6" fill="#0a0f1c" />
    <path d="M37 22 q 2 1.5 0 3" stroke="#9a3412" strokeWidth="1.4" fill="none" strokeLinecap="round" />
  </svg>
);

const Swordfish: Svg = ({ className }) => (
  <svg viewBox="0 0 72 32" className={className} aria-hidden>
    <path d="M26 9 L31 1 L37 9 Z" fill="#1d4ed8" />
    <path d="M11 16 L1 4 L5 16 L1 28 Z" fill="#1d4ed8" />
    <path d="M10 16 C 20 6, 44 6, 55 15 C 44 26, 20 26, 10 16 Z" fill="#3b82f6" />
    <path d="M16 18 C 26 24, 42 23, 53 16 C 42 21, 26 21, 16 18 Z" fill="#bfdbfe" />
    <line x1="54" y1="14.5" x2="71" y2="13" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" />
    <circle cx="48" cy="13" r="2" fill="#0a0f1c" />
  </svg>
);

/** El rape usa un señuelo luminoso para atraer presas: el phishing hecho pez. Ahora tú lo eres. */
const Angler: Svg = ({ className }) => (
  <svg viewBox="0 0 60 44" className={className} aria-hidden>
    <path d="M9 26 L1 17 L3 26 L1 35 Z" fill="#1e293b" />
    <path d="M8 26 C 10 10, 40 8, 49 22 C 51 34, 31 42, 14 37 Z" fill="#334155" />
    <path d="M33 13 Q 40 0 51 6" stroke="#94a3b8" strokeWidth="1.5" fill="none" />
    <circle className="dive-lure" cx="51.5" cy="7.5" r="3.4" fill="#fde047" style={{ filter: "drop-shadow(0 0 4px #fde047)" }} />
    <path d="M33 28 Q 43 33 50 25" stroke="#e2e8f0" strokeWidth="1.4" fill="none" />
    <path d="M36 29.5 l1.5 -3 l1.5 3.4 l1.5 -3.2 l1.5 3.2 l1.6 -3.6 l1.5 2.6" stroke="#f8fafc" strokeWidth="1" fill="none" strokeLinejoin="round" />
    <circle cx="39" cy="18" r="2.6" fill="#fde047" />
    <circle cx="39.6" cy="18" r="1.2" fill="#0a0f1c" />
  </svg>
);

const Shark: Svg = ({ className }) => (
  <svg viewBox="0 0 76 36" className={className} aria-hidden>
    <path d="M34 11 L41 0 L47 11 Z" fill="#475569" />
    <path d="M8 19 L0 4 L5 19 L1 30 Z" fill="#475569" />
    <path d="M6 19 C 18 7, 52 5, 71 18 C 57 26, 27 30, 6 19 Z" fill="#64748b" />
    <path d="M22 22 C 36 28, 55 26, 69 19 C 55 23, 36 25, 22 22 Z" fill="#e2e8f0" />
    <path d="M40 22 L33 33 L48 24 Z" fill="#475569" />
    <path d="M51 14 v6 M54 13.5 v6 M57 13 v6" stroke="#334155" strokeWidth="1" strokeLinecap="round" />
    <circle cx="62" cy="14.5" r="1.9" fill="#0a0f1c" />
  </svg>
);

const Squid: Svg = ({ className }) => (
  <svg viewBox="0 0 80 40" className={className} aria-hidden>
    <g stroke="#fb7185" strokeWidth="2.3" strokeLinecap="round" fill="none">
      <path d="M45 15 C 34 9, 24 17, 7 11" />
      <path d="M45 18 C 31 16, 20 22, 3 19" />
      <path d="M45 22 C 31 24, 21 20, 4 26" />
      <path d="M45 25 C 35 31, 23 26, 8 33" />
    </g>
    <g stroke="#fda4af" strokeWidth="1.4" strokeLinecap="round" fill="none">
      <path d="M45 19 C 30 8, 18 4, 1 6" />
      <path d="M45 21 C 30 32, 18 36, 1 35" />
    </g>
    {/* Manto alargado y en punta, con las aletas en rombo cerca de la punta (no como cola de pez) */}
    <path d="M64 17 L73 6 L79 20 Z M64 23 L73 34 L79 20 Z" fill="#e11d48" />
    <path d="M44 20 C 47 12, 62 11, 79 20 C 62 29, 47 28, 44 20 Z" fill="#f43f5e" />
    <path d="M56 15 C 62 16, 68 18, 74 20" stroke="#fda4af" strokeWidth="1" fill="none" opacity="0.7" />
    <circle cx="52" cy="17" r="3.4" fill="#fff" />
    <circle cx="52.8" cy="17" r="1.8" fill="#0a0f1c" />
  </svg>
);

const Kraken: Svg = ({ className }) => (
  <svg viewBox="0 0 96 80" className={className} aria-hidden style={{ filter: "drop-shadow(0 0 10px rgba(168,85,247,0.55))" }}>
    {/* Tentáculos, que se enroscan hacia afuera */}
    <g stroke="#6d28d9" strokeWidth="6" strokeLinecap="round" fill="none">
      <path d="M36 44 C 24 52, 10 50, 8 62 C 7 70, 16 72, 18 66" />
      <path d="M40 48 C 32 60, 22 66, 26 76 C 28 80, 34 78, 32 73" />
      <path d="M56 48 C 64 60, 74 66, 70 76 C 68 80, 62 78, 64 73" />
      <path d="M60 44 C 72 52, 86 50, 88 62 C 89 70, 80 72, 78 66" />
    </g>
    <g stroke="#7c3aed" strokeWidth="5" strokeLinecap="round" fill="none">
      <path d="M44 50 C 42 62, 38 70, 42 78" />
      <path d="M52 50 C 54 62, 58 70, 54 78" />
      <path d="M33 40 C 20 40, 10 34, 4 40 C 0 44, 4 50, 9 46" />
      <path d="M63 40 C 76 40, 86 34, 92 40 C 96 44, 92 50, 87 46" />
    </g>
    <g fill="#c4b5fd" opacity="0.8">
      <circle cx="13" cy="56" r="1.3" /><circle cx="27" cy="68" r="1.2" /><circle cx="83" cy="56" r="1.3" />
      <circle cx="69" cy="68" r="1.2" /><circle cx="9" cy="38" r="1.1" /><circle cx="87" cy="38" r="1.1" />
    </g>
    {/* Cabeza */}
    {/* Sin degradados con id: el Kraken aparece varias veces en la página y los id se repetirían */}
    <path d="M28 44 C 22 14, 74 14, 68 44 C 62 52, 34 52, 28 44 Z" fill="#6b21a8" />
    <path d="M32 40 C 28 18, 68 18, 64 40 C 58 46, 38 46, 32 40 Z" fill="#9333ea" />
    <path d="M38 22 q 4 -4 9 -3" stroke="#d8b4fe" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
    {/* Ojos luminosos de pupila rasgada */}
    <ellipse cx="39" cy="36" rx="5" ry="4" fill="#fde047" style={{ filter: "drop-shadow(0 0 3px #fde047)" }} />
    <ellipse cx="57" cy="36" rx="5" ry="4" fill="#fde047" style={{ filter: "drop-shadow(0 0 3px #fde047)" }} />
    <rect x="38.2" y="32.5" width="1.6" height="7" rx="0.8" fill="#1e1b4b" />
    <rect x="56.2" y="32.5" width="1.6" height="7" rx="0.8" fill="#1e1b4b" />
    <path d="M36 30 l7 2.5 M60 30 l-7 2.5" stroke="#3b0764" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export interface Creature {
  name: Record<Lang, string>;
  Svg: Svg;
  /** Tamaño en el mapa (más chico en celular para no salirse del mar) */
  size: string;
  /** Mira de frente (no se voltea) */
  front?: boolean;
}

/** Una criatura por zona (src/components/path/DiveMap.tsx ZONES), de la superficie al abismo. */
export const CREATURES: Creature[] = [
  { name: { es: "Alevín", en: "Fry" }, Svg: Fry, size: "h-5 w-8" },
  { name: { es: "Pez del arrecife", en: "Reef fish" }, Svg: ReefFish, size: "h-7 w-12" },
  { name: { es: "Pez globo", en: "Pufferfish" }, Svg: Puffer, size: "h-9 w-11" },
  { name: { es: "Pez espada", en: "Swordfish" }, Svg: Swordfish, size: "h-8 w-14 sm:h-9 sm:w-[4.5rem]" },
  { name: { es: "Rape abisal", en: "Anglerfish" }, Svg: Angler, size: "h-10 w-14" },
  { name: { es: "Tiburón", en: "Shark" }, Svg: Shark, size: "h-9 w-16 sm:h-11 sm:w-[5.5rem]" },
  { name: { es: "Calamar gigante", en: "Giant squid" }, Svg: Squid, size: "h-9 w-16 sm:h-11 sm:w-[5.5rem]" },
  { name: { es: "Kraken", en: "Kraken" }, Svg: Kraken, size: "h-14 w-16 sm:h-[4.5rem] sm:w-[5.5rem]", front: true },
];

/** Criatura de la zona `u` de `total` (si algún día hay más o menos zonas, el Kraken sigue siendo la última). */
export function creatureFor(u: number, total: number): Creature {
  if (total <= 1) return CREATURES[CREATURES.length - 1];
  const i = Math.round((u * (CREATURES.length - 1)) / (total - 1));
  return CREATURES[Math.min(CREATURES.length - 1, Math.max(0, i))];
}
