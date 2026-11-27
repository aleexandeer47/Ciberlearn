import type { Lang } from "@/lib/i18n";

/*
 * Evolución del pez en la ruta: una criatura por zona del mar, cada vez más grande y más difícil de
 * engañar. Empieza como un alevín en la superficie, llega a Kraken al final de la sección 1 (el abismo) y,
 * en la sección 2, baja por las fosas hasta convertirse en el Leviatán de las Marianas.
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

/* ---- Sección 2: las fosas. Criaturas reales del mar profundo, cada vez más inquietantes ---- */

/** Pez trípode: vive en la llanura abisal parado sobre tres aletas largas, esperando a su presa. */
const TripodFish: Svg = ({ className }) => (
  <svg viewBox="0 0 72 40" className={className} aria-hidden>
    <path d="M12 16 L2 9 L4 16 L2 23 Z" fill="#475569" />
    <path d="M10 16 C 20 8, 46 8, 60 14 C 64 16, 64 18, 60 20 C 46 24, 20 24, 10 16 Z" fill="#64748b" />
    {/* Las tres “patas”: aletas larguísimas */}
    <path d="M22 21 L16 39 M34 22 L36 39 M14 18 L6 39" stroke="#94a3b8" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M40 10 C 44 2, 52 2, 58 4" stroke="#94a3b8" strokeWidth="1" fill="none" />
    <circle cx="55" cy="14" r="1.6" fill="#0a0f1c" />
  </svg>
);

/** Pez víbora: colmillos enormes y puntos de luz en el vientre. */
const Viperfish: Svg = ({ className }) => (
  <svg viewBox="0 0 76 34" className={className} aria-hidden>
    <path d="M10 17 L1 8 L4 17 L1 26 Z" fill="#1e293b" />
    <path d="M9 17 C 18 8, 44 7, 60 13 L 70 15 L 62 19 C 46 26, 20 26, 9 17 Z" fill="#334155" />
    <path d="M22 9 L26 2 L30 9 Z" fill="#1e293b" />
    <g fill="#67e8f9" style={{ filter: "drop-shadow(0 0 2px #67e8f9)" }}>
      <circle cx="20" cy="21" r="1" /><circle cx="27" cy="22" r="1" /><circle cx="34" cy="22.5" r="1" /><circle cx="41" cy="22" r="1" /><circle cx="48" cy="21" r="1" />
    </g>
    {/* Colmillos que no caben en la boca */}
    <path d="M60 15 L59 26 L62 16 Z M65 15.5 L66 25 L67 16 Z M61 18 L63 7 L64 17 Z" fill="#f8fafc" />
    <circle cx="57" cy="12.5" r="2.4" fill="#e0f2fe" />
    <circle cx="57.4" cy="12.5" r="1.2" fill="#0a0f1c" />
  </svg>
);

/** Anguila pelícano: una boca gigante y una cola larga con la punta brillante. */
const GulperEel: Svg = ({ className }) => (
  <svg viewBox="0 0 80 40" className={className} aria-hidden>
    <path d="M44 20 C 34 26, 24 12, 14 22 C 8 28, 4 26, 2 30" stroke="#312e81" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="2.5" cy="30" r="2.6" fill="#f472b6" style={{ filter: "drop-shadow(0 0 4px #f472b6)" }} />
    {/* Bolsa de la boca abierta */}
    <path d="M42 18 C 50 6, 70 4, 78 12 L 62 20 L 78 30 C 70 38, 50 34, 42 22 Z" fill="#4338ca" />
    <path d="M62 20 L78 12 L78 30 Z" fill="#0a0f1c" />
    <path d="M64 19 l3 -2 l2 3 l3 -2.5 l2 3 M64 21 l3 2 l2 -3 l3 2.5 l2 -3" stroke="#e0e7ff" strokeWidth="1" fill="none" />
    <circle cx="57" cy="13" r="1.6" fill="#c7d2fe" />
  </svg>
);

/** Pez dragón negro: cuerpo de sombra y un señuelo rojo bajo la mandíbula. */
const Dragonfish: Svg = ({ className }) => (
  <svg viewBox="0 0 80 36" className={className} aria-hidden>
    <path d="M10 17 L1 9 L3 17 L1 25 Z" fill="#020617" />
    <path d="M8 17 C 22 9, 52 8, 70 14 C 74 16, 74 19, 70 21 C 52 26, 22 25, 8 17 Z" fill="#0f172a" stroke="#334155" strokeWidth="0.8" />
    <path d="M64 21 L62 26 L66 22 Z M68 20.5 L67 25 L70 21 Z" fill="#f8fafc" />
    {/* Barbilla con luz: su propio anzuelo */}
    <path d="M60 22 C 58 30, 52 32, 48 34" stroke="#64748b" strokeWidth="1" fill="none" />
    <circle cx="47.5" cy="34" r="2.2" fill="#ef4444" className="dive-lure" style={{ filter: "drop-shadow(0 0 5px #ef4444)" }} />
    <circle cx="64" cy="14.5" r="2.2" fill="#fecaca" />
    <circle cx="64.4" cy="14.5" r="1.1" fill="#7f1d1d" />
    <ellipse cx="60" cy="17" rx="2" ry="1" fill="#ef4444" style={{ filter: "drop-shadow(0 0 3px #ef4444)" }} />
  </svg>
);

/** Pez caracol hadal: pálido, casi transparente, el pez que vive más hondo. */
const Snailfish: Svg = ({ className }) => (
  <svg viewBox="0 0 72 34" className={className} aria-hidden>
    <path d="M28 18 C 18 14, 10 22, 1 18 C 10 26, 20 26, 30 22 Z" fill="#f5d0fe" opacity="0.55" />
    <path d="M24 17 C 30 4, 60 4, 68 15 C 70 22, 62 30, 46 30 C 34 30, 26 26, 24 17 Z" fill="#fae8ff" opacity="0.75" />
    {/* Órganos que se ven a través de la piel */}
    <ellipse cx="46" cy="20" rx="7" ry="4" fill="#f472b6" opacity="0.55" />
    <ellipse cx="38" cy="18" rx="4" ry="2.5" fill="#c084fc" opacity="0.5" />
    <circle cx="60" cy="13" r="2" fill="#0a0f1c" />
    <path d="M64 19 q 3 1 4 -1" stroke="#a21caf" strokeWidth="1" fill="none" />
  </svg>
);

/** El Leviatán de las Marianas: la criatura del fondo del planeta. Muchos ojos rojos y nada de luz. */
const Leviathan: Svg = ({ className }) => (
  <svg viewBox="0 0 100 92" className={className} aria-hidden style={{ filter: "drop-shadow(0 0 14px rgba(185,28,28,0.6))" }}>
    {/* Tentáculos espinosos que salen de debajo de la cabeza */}
    <g stroke="#120303" strokeLinecap="round" fill="none">
      <path d="M24 56 C 12 62, 4 58, 2 70 C 0 80, 8 86, 12 80" strokeWidth="5" />
      <path d="M76 56 C 88 62, 96 58, 98 70 C 100 80, 92 86, 88 80" strokeWidth="5" />
      <path d="M34 66 C 28 76, 22 82, 26 91" strokeWidth="4" />
      <path d="M66 66 C 72 76, 78 82, 74 91" strokeWidth="4" />
    </g>
    <g fill="#2a0606">
      <path d="M7 66 l-4 -2 l3 4 Z M93 66 l4 -2 l-3 4 Z M26 78 l-4 0 l3 3 Z M74 78 l4 0 l-3 3 Z" />
    </g>
    {/* Cresta de espinas irregulares */}
    <path d="M16 30 L6 8 L22 24 L20 6 L32 20 L36 2 L42 16 L50 0 L58 16 L64 2 L68 20 L80 6 L78 24 L94 8 L84 30 Z" fill="#1a0404" />
    {/* Cabeza */}
    <path d="M12 36 C 8 16, 34 8, 50 9 C 66 8, 92 16, 88 36 C 87 44, 82 50, 78 54 L 22 54 C 18 50, 13 44, 12 36 Z" fill="#0b0101" stroke="#3f0a0a" strokeWidth="0.8" />
    {/* Venas que brillan */}
    <path d="M24 20 q 6 6 4 14 M76 20 q -6 6 -4 14 M50 12 q -3 5 0 8" stroke="#7f1d1d" strokeWidth="0.9" fill="none" opacity="0.9" />
    {/* Fauces abiertas: garganta roja y dientes como agujas */}
    <path d="M20 50 C 24 82, 76 82, 80 50 C 66 56, 34 56, 20 50 Z" fill="#120000" />
    <ellipse cx="50" cy="66" rx="16" ry="7" fill="#b91c1c" opacity="0.55" style={{ filter: "blur(3px)" }} />
    <ellipse cx="50" cy="67" rx="7" ry="3" fill="#f97316" opacity="0.45" style={{ filter: "blur(2px)" }} />
    <g fill="#f5f0e6">
      {/* fila de arriba (irregular, apuntando hacia abajo) */}
      <path d="M22 51 L24 61 L26 52 Z M27 52.5 L29.5 66 L31.5 53.5 Z M33 54 L35 62 L36.5 54.5 Z M38 54.6 L40.5 70 L42.5 55 Z M45 55 L46.5 63 L48 55.2 Z M52 55.2 L53.5 64 L55 55 Z M57.5 55 L59.5 71 L62 54.6 Z M63.5 54.5 L65 61 L67 54 Z M68.5 53.5 L70.5 67 L73 52.5 Z M74 52 L76 60 L78 51 Z" />
      {/* fila de abajo (apuntando hacia arriba) */}
      <path d="M28 70 L30 62 L32 72 Z M35 74 L37.5 64 L40 75.5 Z M43 76.5 L45 68 L47 77 Z M53 77 L55 67 L57 76.5 Z M60 75.5 L62.5 63 L65 74 Z M68 72 L70 63 L72 70 Z" />
    </g>
    {/* Baba que cuelga */}
    <path d="M40.5 70 q -0.5 5 0.5 9 M59.5 71 q 0.6 4 -0.3 8 M29.5 66 q -0.4 4 0.4 7" stroke="#fca5a5" strokeWidth="0.5" fill="none" opacity="0.6" />
    {/* Ojos: dos grandes rasgados, un tercer ojo en la frente y otros más pequeños */}
    <g style={{ filter: "drop-shadow(0 0 5px #ef4444)" }}>
      <path d="M26 33 Q 34 24 44 32 Q 35 37 26 33 Z" fill="#ff2d0a" />
      <path d="M74 33 Q 66 24 56 32 Q 65 37 74 33 Z" fill="#ff2d0a" />
      <ellipse cx="50" cy="20" rx="3.2" ry="5" fill="#ff2d0a" />
      <circle cx="22" cy="24" r="1.7" fill="#ef4444" />
      <circle cx="78" cy="24" r="1.7" fill="#ef4444" />
      <circle cx="38" cy="19" r="1.3" fill="#ef4444" />
      <circle cx="62" cy="19" r="1.3" fill="#ef4444" />
    </g>
    <g fill="#000">
      <rect x="34.2" y="27.5" width="1.6" height="8" rx="0.8" />
      <rect x="64.2" y="27.5" width="1.6" height="8" rx="0.8" />
      <rect x="49.4" y="16" width="1.2" height="8" rx="0.6" />
    </g>
    {/* Ceño */}
    <path d="M24 28 L44 30 M76 28 L56 30" stroke="#000" strokeWidth="2.2" strokeLinecap="round" />
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

/** Una criatura por zona (src/components/path/DiveMap.tsx ZONES), de la superficie a la Fosa de las Marianas. */
export const CREATURES: Creature[] = [
  { name: { es: "Alevín", en: "Fry" }, Svg: Fry, size: "h-5 w-8" },
  { name: { es: "Pez del arrecife", en: "Reef fish" }, Svg: ReefFish, size: "h-7 w-12" },
  { name: { es: "Pez globo", en: "Pufferfish" }, Svg: Puffer, size: "h-9 w-11" },
  { name: { es: "Pez espada", en: "Swordfish" }, Svg: Swordfish, size: "h-8 w-14 sm:h-9 sm:w-[4.5rem]" },
  { name: { es: "Rape abisal", en: "Anglerfish" }, Svg: Angler, size: "h-10 w-14" },
  { name: { es: "Tiburón", en: "Shark" }, Svg: Shark, size: "h-9 w-16 sm:h-11 sm:w-[5.5rem]" },
  { name: { es: "Calamar gigante", en: "Giant squid" }, Svg: Squid, size: "h-9 w-16 sm:h-11 sm:w-[5.5rem]" },
  { name: { es: "Kraken", en: "Kraken" }, Svg: Kraken, size: "h-14 w-16 sm:h-[4.5rem] sm:w-[5.5rem]", front: true },
  // Sección 2: las fosas (el pez caracol es el que de verdad vive en la Fosa de las Marianas)
  { name: { es: "Pez trípode", en: "Tripod fish" }, Svg: TripodFish, size: "h-9 w-14 sm:h-10 sm:w-[4.5rem]" },
  { name: { es: "Pez víbora", en: "Viperfish" }, Svg: Viperfish, size: "h-9 w-16 sm:h-10 sm:w-[5rem]" },
  { name: { es: "Anguila pelícano", en: "Gulper eel" }, Svg: GulperEel, size: "h-9 w-16 sm:h-11 sm:w-[5.5rem]" },
  { name: { es: "Pez dragón negro", en: "Black dragonfish" }, Svg: Dragonfish, size: "h-9 w-16 sm:h-11 sm:w-[5.5rem]" },
  { name: { es: "Pez caracol hadal", en: "Hadal snailfish" }, Svg: Snailfish, size: "h-9 w-16 sm:h-10 sm:w-[5rem]" },
];

/** El jefe de la Fosa de las Marianas. Quien lo vence se convierte en él (la forma final de la ruta). */
export const LEVIATHAN: Creature = {
  name: { es: "Leviatán de las Marianas", en: "Leviathan of the Mariana Trench" },
  Svg: Leviathan,
  size: "h-16 w-[4.5rem] sm:h-20 sm:w-24",
  front: true,
};

/** Índice de la criatura de la zona `u`: una por zona; si hubiera más zonas que criaturas, se queda la última. */
export const creatureIndex = (u: number) => Math.min(CREATURES.length - 1, Math.max(0, u));

/** Criatura de la zona `u`. */
export function creatureFor(u: number): Creature {
  return CREATURES[creatureIndex(u)];
}
