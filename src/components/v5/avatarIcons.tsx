import type { AvatarKind } from "@/world/avatars";

// The island palette, by value, so this file never pulls three.js into the page bundle.
const INK = "#2b1e1a";
const K = {
  cream: "#fff8ec",
  coral: "#ff6b4a",
  red: "#e63946",
  screen: "#1d2350",
  glow: "#7cf6ff",
  sun: "#ffc93c",
  rose: "#ff4f8b",
  blush: "#ff8fa3",
  ginger: "#ff9a3c",
  gingerDark: "#d9541e",
  cocoa: "#7a4a33",
  earPink: "#ffb3c1",
  muzzle: "#fff1dc",
  duck: "#ffd23f",
  beak: "#ff8a1f",
  elephant: "#b0a8d4",
  earIn: "#f6b4c8",
  gold: "#f4b63f",
  teal: "#16a3a3",
  cobalt: "#2453e6",
  green: "#3bb273",
  spot: "#1b2a99",
  ivory: "#f3dfb6",
};

const line = { stroke: INK, strokeWidth: 2.75, strokeLinejoin: "round", strokeLinecap: "round" } as const;

/** Bead eye with a highlight. */
function Eye({ x, y, r = 3.4 }: { x: number; y: number; r?: number }) {
  return (
    <>
      <ellipse cx={x} cy={y} rx={r * 0.88} ry={r * 1.15} fill={INK} />
      <circle cx={x + r * 0.32} cy={y - r * 0.45} r={r * 0.38} fill="#fff" />
    </>
  );
}

function Cheeks({ y, dx, cx = 32 }: { y: number; dx: number; cx?: number }) {
  return (
    <>
      <ellipse cx={cx - dx} cy={y} rx={3.6} ry={2.1} fill={K.blush} />
      <ellipse cx={cx + dx} cy={y} rx={3.6} ry={2.1} fill={K.blush} />
    </>
  );
}

function Robot() {
  return (
    <>
      <path d="M20 64 L21 55 Q22 51 27 51 L37 51 Q42 51 43 55 L44 64 Z" fill={K.cream} {...line} />
      <circle cx={32} cy={58} r={2.6} fill={K.sun} {...line} strokeWidth={2} />
      <path d="M32 15 L32 8" {...line} />
      <circle cx={32} cy={6.5} r={3.6} fill={K.red} {...line} strokeWidth={2.25} />
      <rect x={5.5} y={27} width={6} height={11} rx={2.5} fill={K.coral} {...line} />
      <rect x={52.5} y={27} width={6} height={11} rx={2.5} fill={K.coral} {...line} />
      <path d="M21 14.5 L43 14 Q53.5 14.2 53.5 24.5 L53.8 41 Q53.6 51.5 43 51.5 L21 51.8 Q10.4 51.6 10.5 41 L10.2 24.5 Q10.5 14.6 21 14.5 Z" fill={K.cream} {...line} />
      <rect x={16} y={20} width={32} height={24.5} rx={6.5} fill={K.screen} />
      <ellipse cx={25} cy={30} rx={3.3} ry={4.4} fill={K.glow} />
      <ellipse cx={39} cy={30} rx={3.3} ry={4.4} fill={K.glow} />
      <path d="M28.5 37 Q32 40.5 35.5 37" fill="none" stroke={K.glow} strokeWidth={2.4} strokeLinecap="round" />
      <ellipse cx={20.5} cy={37.5} rx={2.6} ry={1.5} fill={K.rose} />
      <ellipse cx={43.5} cy={37.5} rx={2.6} ry={1.5} fill={K.rose} />
    </>
  );
}

function Cat() {
  return (
    <>
      <path d="M20 64 Q21 54 32 54 Q43 54 44 64 Z" fill={K.ginger} {...line} />
      <path d="M11.5 31 L13 7.5 L30 19.5 Z" fill={K.cocoa} {...line} />
      <path d="M16 25 L16.8 13.5 L25 19.5 Z" fill={K.earPink} />
      <path d="M52.5 31 L51 7.5 L34 19.5 Z" fill={K.ginger} {...line} />
      <path d="M48 25 L47.2 13.5 L39 19.5 Z" fill={K.earPink} />
      <path d="M32 18.5 Q55.5 18 55 38 Q54.5 57 32 57 Q9.5 57 9 38 Q8.6 18.2 32 18.5 Z" fill={K.ginger} {...line} />
      <path d="M28.5 21.5 L29.5 26 M32 21 L32 25.5 M35.5 21.5 L34.5 26" stroke={K.gingerDark} strokeWidth={2.4} strokeLinecap="round" />
      <ellipse cx={32} cy={45.5} rx={9.5} ry={6.5} fill={K.muzzle} />
      <Eye x={23} y={35.5} />
      <Eye x={41} y={35.5} />
      <Cheeks y={44} dx={15} />
      <path d="M29.6 41.4 L34.4 41.4 L32 44 Z" fill={K.rose} stroke={K.rose} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M28 46.5 Q30 49.2 32 46.5 Q34 49.2 36 46.5" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <path d="M12 43.5 L2.5 41.5 M12 47 L3 49.5 M52 43.5 L61.5 41.5 M52 47 L61 49.5" stroke={INK} strokeWidth={2} strokeLinecap="round" />
    </>
  );
}

function Duck() {
  return (
    <>
      <ellipse cx={32} cy={63} rx={20} ry={10} fill={K.duck} {...line} />
      <path d="M25.5 15 Q23.5 8.5 28.8 9.8 Q29.5 3.5 34.3 8.8 Q39.5 6.2 38.6 15 Z" fill={K.duck} {...line} />
      <path d="M32 12.8 Q52.8 12.6 52.6 33 Q52.4 53.2 32 53.2 Q11.5 53.4 11.4 33 Q11.2 12.9 32 12.8 Z" fill={K.duck} {...line} />
      <Eye x={24} y={30} />
      <Eye x={40} y={30} />
      <Cheeks y={38.5} dx={15} />
      <path d="M21.5 39.5 Q22 34.6 32 34.8 Q42 34.6 42.5 39.5 Q42 44.5 32 44.6 Q22 44.5 21.5 39.5 Z" fill={K.beak} {...line} />
      <path d="M23.5 40 Q32 42.6 40.5 40" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
    </>
  );
}

function Elephant() {
  return (
    <>
      {/* the cloth peeking up at the bottom: bands and gold dots */}
      <path d="M13 64 L14.5 53 Q32 49.5 49.5 53 L51 64 Z" fill={K.rose} {...line} />
      <path d="M14.8 55.5 Q32 52 49.2 55.5" fill="none" stroke={K.gold} strokeWidth={2.4} />
      {[19, 25, 39, 45].map((x) => (
        <circle key={x} cx={x} cy={60} r={1.5} fill={K.gold} />
      ))}
      <ellipse cx={12.5} cy={32} rx={11} ry={14.5} fill={K.elephant} {...line} transform="rotate(-12 12.5 32)" />
      <ellipse cx={13.5} cy={33} rx={6.4} ry={9.5} fill={K.earIn} transform="rotate(-12 13.5 33)" />
      <ellipse cx={51.5} cy={32} rx={11} ry={14.5} fill={K.elephant} {...line} transform="rotate(12 51.5 32)" />
      <ellipse cx={50.5} cy={33} rx={6.4} ry={9.5} fill={K.earIn} transform="rotate(12 50.5 33)" />
      <path d="M32 13.2 Q49.8 13 49.6 31 Q49.4 48.6 32 48.8 Q14.6 48.6 14.4 31 Q14.2 13.1 32 13.2 Z" fill={K.elephant} {...line} />
      {/* trunk: an ink tube with a lavender core, curling up at the tip */}
      <path d="M32 39 C32 49 30.5 54.5 36.5 56.2 C40.5 57.2 43 54 40.6 51.4" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" />
      <path d="M32 39 C32 49 30.5 54.5 36.5 56.2 C40.5 57.2 43 54 40.6 51.4" fill="none" stroke={K.elephant} strokeWidth={5} strokeLinecap="round" />
      <path d="M32 14.5 Q35.4 18.5 32 22 Q28.6 18.5 32 14.5 Z" fill={K.gold} {...line} strokeWidth={2} />
      <Eye x={24.5} y={30} />
      <Eye x={39.5} y={30} />
      <Cheeks y={38.5} dx={13} />
    </>
  );
}

const FAN = [-78, -52, -26, 0, 26, 52, 78];

function Peacock() {
  return (
    <>
      {FAN.map((a) => (
        <g key={a} transform={`rotate(${a} 32 44)`}>
          <ellipse cx={32} cy={26} rx={6.4} ry={16} fill={K.green} {...line} strokeWidth={2.25} />
          <circle cx={32} cy={16.5} r={3.9} fill={K.gold} />
          <circle cx={32} cy={16.5} r={2} fill={K.spot} />
        </g>
      ))}
      <path d="M21 64 Q22 47 32 47 Q42 47 43 64 Z" fill={K.cobalt} {...line} />
      <path d="M32 22 L26.5 12.5 M32 22 L32 10 M32 22 L37.5 12.5" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      <circle cx={26.5} cy={11.5} r={2.6} fill={K.teal} {...line} strokeWidth={1.8} />
      <circle cx={32} cy={9} r={2.6} fill={K.teal} {...line} strokeWidth={1.8} />
      <circle cx={37.5} cy={11.5} r={2.6} fill={K.teal} {...line} strokeWidth={1.8} />
      <path d="M32 21.5 Q46 21.3 45.8 35.5 Q45.6 49.6 32 49.6 Q18.4 49.6 18.2 35.5 Q18 21.6 32 21.5 Z" fill={K.cobalt} {...line} />
      <Eye x={26.5} y={33.5} r={3.1} />
      <Eye x={37.5} y={33.5} r={3.1} />
      <Cheeks y={41} dx={10.5} />
      <path d="M29.2 39 Q32 37.8 34.8 39 L32 45 Z" fill={K.ivory} {...line} strokeWidth={2} />
    </>
  );
}

const ICONS: Record<AvatarKind, () => React.JSX.Element> = { robot: Robot, cat: Cat, duck: Duck, elephant: Elephant, peacock: Peacock };

/** A flat, hand-inked face for each traveler. Decorative: the chooser button carries the name. */
export function AvatarIcon({ kind, className }: { kind: AvatarKind; className?: string }) {
  const Face = ICONS[kind];
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <Face />
    </svg>
  );
}
