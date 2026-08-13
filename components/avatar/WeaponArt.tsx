import type { CSSProperties, ReactNode } from "react";

// Held gear for the explorer avatar (avatar_hand slot). Weapons are drawn in a
// grip-relative frame (grip at 0,0; blade extends up along -y) so the same art
// renders both on the avatar (translated to the hand at 96,156) and centred on a
// marketplace card. Legendary pieces carry a pulsing glow; the Flame Blade burns.

export type WeaponType =
  | "sword" | "wand" | "staff" | "axe" | "bow" | "shield"
  | "hammer" | "spear" | "dagger" | "torch" | "trident" | "scythe";

export type WeaponDef = { type: WeaponType; color: string; glow?: boolean; fire?: boolean };

export const WEAPONS: Record<string, WeaponDef> = {
  wooden_sword: { type: "sword", color: "#cbd5e1" },
  knights_sword: { type: "sword", color: "#e2e8f0" },
  flame_blade: { type: "sword", color: "#fb7185", fire: true, glow: true },
  apprentice_wand: { type: "wand", color: "#a5f3fc" },
  crystal_wand: { type: "wand", color: "#c4b5fd" },
  archmage_staff: { type: "staff", color: "#a78bfa", glow: true },
  nature_staff: { type: "staff", color: "#34d399" },
  stone_axe: { type: "axe", color: "#94a3b8" },
  golden_axe: { type: "axe", color: "#fbbf24" },
  hunters_bow: { type: "bow", color: "#a16207" },
  guardian_shield: { type: "shield", color: "#38bdf8" },
  war_hammer: { type: "hammer", color: "#cbd5e1" },
  explorers_spear: { type: "spear", color: "#e2e8f0" },
  shadow_dagger: { type: "dagger", color: "#818cf8" },
  adventurers_torch: { type: "torch", color: "#f97316" },
  ocean_trident: { type: "trident", color: "#22d3ee" },
  reaper_scythe: { type: "scythe", color: "#a78bfa", glow: true },
};

export const isWeaponKey = (key: string | undefined | null): key is string => Boolean(key && key in WEAPONS);

function shade(hex: string, d: number) {
  const n = parseInt(hex.slice(1), 16);
  const cl = (v: number) => Math.max(0, Math.min(255, v));
  const r = cl((n >> 16) + d), g = cl(((n >> 8) & 255) + d), b = cl((n & 255) + d);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

const KEYFRAMES = `@keyframes lulw-flick{0%,100%{transform:scaleY(.9) scaleX(1.05);opacity:.85}50%{transform:scaleY(1.35) scaleX(.9);opacity:1}}@keyframes lulw-glow{0%,100%{opacity:.3}50%{opacity:.66}}`;

const flameStyle = (dur: number, delay: number): CSSProperties => ({ transformBox: "fill-box", transformOrigin: "center bottom", animation: `lulw-flick ${dur}s ease-in-out ${delay}s infinite` });

function Flame({ x, y, h, delay }: { x: number; y: number; h: number; delay: number }) {
  const outer = `M ${x} ${y} C ${x - h * 0.5} ${y - h * 0.4}, ${x - h * 0.16} ${y - h * 0.8}, ${x} ${y - h} C ${x + h * 0.16} ${y - h * 0.8}, ${x + h * 0.5} ${y - h * 0.4}, ${x} ${y} Z`;
  const inner = `M ${x} ${y} C ${x - h * 0.28} ${y - h * 0.35}, ${x - h * 0.1} ${y - h * 0.6}, ${x} ${y - h * 0.7} C ${x + h * 0.1} ${y - h * 0.6}, ${x + h * 0.28} ${y - h * 0.35}, ${x} ${y} Z`;
  return (
    <>
      <path d={outer} fill="#f97316" style={flameStyle(0.5, delay)} />
      <path d={inner} fill="#fde047" style={flameStyle(0.42, delay + 0.1)} />
    </>
  );
}

/** Weapon paths in a grip-relative frame (grip at 0,0, blade up). */
export function WeaponShapes({ held, color }: { held: string; color?: string }) {
  const def = WEAPONS[held];
  if (!def) return null;
  const c = color ?? def.color;
  const dark = shade(c, -45), light = shade(c, 60), handle = "#7c4a1e";
  const parts: ReactNode[] = [];
  const glowStyle: CSSProperties = { filter: "blur(7px)", opacity: 0.5, animation: "lulw-glow 1.7s ease-in-out infinite" };
  if (def.glow) parts.push(<circle key="glow" cx={0} cy={-46} r={30} fill={def.fire ? "#f97316" : c} style={glowStyle} />);

  if (def.type === "sword") {
    parts.push(<rect key="grip" x={-3} y={-2} width={6} height={14} rx={2} fill={handle} />);
    parts.push(<circle key="pom" cx={0} cy={13} r={4} fill={c} />);
    parts.push(<rect key="guard" x={-11} y={-4} width={22} height={5} rx={2} fill={dark} />);
    parts.push(<polygon key="blade" points="-5,-4 5,-4 3,-70 0,-80 -3,-70" fill={c} />);
    parts.push(<polygon key="edge" points="0,-78 3,-70 0,-6" fill={light} />);
    if (def.fire) {
      parts.push(<polygon key="aura" points="-8,-4 8,-4 0,-82" fill="#f97316" fillOpacity={0.22} />);
      for (let i = 0; i < 6; i += 1) { const y = -12 - i * 11, side = i % 2 ? 1 : -1; parts.push(<Flame key={`f${i}`} x={side * 4.5} y={y} h={13 + (i % 2 ? 3 : 0)} delay={i * 0.12} />); }
      parts.push(<Flame key="ftip" x={0} y={-80} h={22} delay={0.04} />);
    }
  } else if (def.type === "wand") {
    parts.push(<rect key="shaft" x={-2} y={-58} width={4} height={70} rx={2} fill="#3b2a4a" />);
    parts.push(<Star key="star" cx={0} cy={-64} r={7} fill={c} />);
    parts.push(<circle key="tip" cx={0} cy={-64} r={2.5} fill={light} />);
  } else if (def.type === "staff") {
    parts.push(<rect key="shaft" x={-2.5} y={-70} width={5} height={82} rx={2.5} fill={handle} />);
    parts.push(<circle key="orb" cx={0} cy={-78} r={11} fill={c} fillOpacity={0.9} />);
    parts.push(<circle key="ring" cx={0} cy={-78} r={11} fill="none" stroke={light} strokeWidth={2} />);
    parts.push(<circle key="hl" cx={-3} cy={-81} r={3} fill="#fff" fillOpacity={0.7} />);
  } else if (def.type === "axe") {
    parts.push(<rect key="shaft" x={-2.5} y={-64} width={5} height={78} rx={2} fill={handle} />);
    parts.push(<path key="head" d="M2 -58 q26 4 20 26 q-14 -8 -20 -6 z" fill={c} stroke={dark} strokeWidth={1} />);
    parts.push(<path key="hl" d="M2 -58 q26 4 20 26" fill="none" stroke={light} strokeWidth={1.5} />);
  } else if (def.type === "bow") {
    parts.push(<path key="bow" d="M0 -64 Q30 -30 0 8" fill="none" stroke={handle} strokeWidth={4} strokeLinecap="round" />);
    parts.push(<line key="str" x1={0} y1={-64} x2={0} y2={8} stroke="#e5e7eb" strokeWidth={1.2} />);
    parts.push(<polygon key="arr" points="-8,-28 6,-28 6,-31 14,-26 6,-21 6,-24 -8,-24" fill={c} />);
  } else if (def.type === "shield") {
    parts.push(<path key="sh" d="M-16 -30 L16 -30 L16 -4 Q0 16 -16 -4 Z" fill={c} stroke={dark} strokeWidth={2} />);
    parts.push(<path key="in" d="M-9 -23 L9 -23 L9 -8 Q0 4 -9 -8 Z" fill={light} fillOpacity={0.5} />);
    parts.push(<Star key="star" cx={0} cy={-14} r={6} fill="#fff" />);
  } else if (def.type === "hammer") {
    parts.push(<rect key="shaft" x={-2.5} y={-58} width={5} height={72} rx={2} fill={handle} />);
    parts.push(<rect key="head" x={-13} y={-64} width={26} height={16} rx={3} fill={c} stroke={dark} strokeWidth={1} />);
    parts.push(<rect key="hl" x={-13} y={-64} width={26} height={6} rx={3} fill={light} fillOpacity={0.5} />);
  } else if (def.type === "spear") {
    parts.push(<rect key="shaft" x={-2} y={-52} width={4} height={66} rx={2} fill={handle} />);
    parts.push(<polygon key="tip" points="0,-82 6,-56 -6,-56" fill={c} stroke={dark} strokeWidth={1} />);
    parts.push(<polygon key="hl" points="0,-80 6,-58 0,-58" fill={light} />);
  } else if (def.type === "dagger") {
    parts.push(<rect key="grip" x={-2.5} y={-2} width={5} height={12} rx={2} fill={handle} />);
    parts.push(<rect key="guard" x={-8} y={-4} width={16} height={4} rx={2} fill={dark} />);
    parts.push(<polygon key="blade" points="-3,-4 3,-4 2,-34 0,-40 -2,-34" fill={c} />);
  } else if (def.type === "torch") {
    parts.push(<rect key="shaft" x={-2.5} y={-30} width={5} height={44} rx={2} fill={handle} />);
    parts.push(<Flame key="f0" x={-3} y={-32} h={16} delay={0} />);
    parts.push(<Flame key="f1" x={3} y={-34} h={18} delay={0.15} />);
    parts.push(<Flame key="f2" x={0} y={-38} h={22} delay={0.08} />);
  } else if (def.type === "trident") {
    parts.push(<rect key="shaft" x={-2} y={-50} width={4} height={64} rx={2} fill={c} />);
    parts.push(<line key="bar" x1={-9} y1={-52} x2={9} y2={-52} stroke={c} strokeWidth={3} />);
    [-9, 0, 9].forEach((x) => parts.push(<polygon key={`p${x}`} points={`${x},-72 ${x + 3},-52 ${x - 3},-52`} fill={c} stroke={dark} strokeWidth={0.8} />));
  } else if (def.type === "scythe") {
    parts.push(<rect key="shaft" x={-2.5} y={-70} width={5} height={84} rx={2} fill={handle} />);
    parts.push(<path key="blade" d="M0 -70 q30 -6 34 22 q-10 -18 -34 -14 z" fill={c} stroke={dark} strokeWidth={1} />);
  }

  return <g data-weapon={held}><style>{KEYFRAMES}</style>{parts}</g>;
}

function Star({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const rr = i % 2 ? r * 0.45 : r;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return <polygon points={pts} fill={fill} stroke="#fff7d6" strokeWidth={0.6} />;
}
