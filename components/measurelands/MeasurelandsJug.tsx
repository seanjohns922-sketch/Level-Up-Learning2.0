"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
 * The reusable Measurelands Measuring Jug — reads capacity in mL or L.
 * A premium glass jug (spout + handle) with a labelled scale; the water line
 * sits EXACTLY on the marking for `value` (by construction, like the ruler's
 * cm marks and the scale's needle). Reused Week 4 and Levels 3–6.
 * Extend this — don't fork it.
 * ═══════════════════════════════════════════════════════════════════════════ */
const GLASS = "rgba(210,232,244,0.30)";
const WALL = "#5B8FB0";
const WATER_TOP = "#8FD0EC";
const WATER = "#6FBEE0";
const TICK = "#33566B";
const LABEL = "#20404F";

// interior coordinate box (SVG units)
const X_L = 58;
const X_R = 176;
const Y_TOP = 78; // liquid level at v = max
const Y_BOT = 256; // liquid level at v = 0

export function MeasurelandsJug({
  value,
  unit,
  max,
  majorStep,
  minorStep: minorStepProp,
  pointer,
  size = 240,
}: {
  value: number;
  unit: "mL" | "L";
  max: number;
  majorStep: number;
  /** Distance between minor (unlabelled) ticks. Defaults to majorStep/5. Level 4
   *  passes a coarser value so partial readings land on a minor mark (e.g.
   *  0.5 L, or 250 mL). */
  minorStep?: number;
  /** Optional bold arrow pointing at a level (e.g. the top, for "how much more"). */
  pointer?: number;
  size?: number;
}) {
  const [uid] = useState(() => Math.random().toString(36).slice(2, 9));
  const yFor = (v: number) => Y_BOT - (Math.max(0, Math.min(max, v)) / max) * (Y_BOT - Y_TOP);
  const minorStep = minorStepProp ?? majorStep / 5;
  const steps = Math.round(max / minorStep);
  const waterY = yFor(value);

  const ticks = [];
  for (let i = 0; i <= steps; i += 1) {
    const v = Number((i * minorStep).toFixed(4));
    const y = yFor(v);
    const major = Math.abs(v / majorStep - Math.round(v / majorStep)) < 1e-6;
    ticks.push(<line key={`t${i}`} x1={X_R - (major ? 20 : 10)} y1={y} x2={X_R - 2} y2={y} stroke={TICK} strokeWidth={major ? 2 : 1} strokeLinecap="round" opacity={major ? 0.95 : 0.6} />);
    if (major) {
      ticks.push(
        <text key={`n${i}`} x={X_R - 24} y={y + 4} textAnchor="end" fontSize={12} fontWeight={800} fill={LABEL}>
          {Number(v.toFixed(2))} {unit}
        </text>,
      );
    }
  }

  return (
    <div className="mx-auto w-full" style={{ maxWidth: size }}>
      <svg viewBox="0 0 240 300" width="100%" role="img" aria-label={`A measuring jug with ${value} ${unit}`}>
        <defs>
          <clipPath id={`interior-${uid}`}>
            <path d={`M ${X_L} ${Y_TOP - 8} L ${X_R} ${Y_TOP - 8} L ${X_R} ${Y_BOT} Q ${X_R} ${Y_BOT + 10} ${X_R - 12} ${Y_BOT + 10} L ${X_L + 12} ${Y_BOT + 10} Q ${X_L} ${Y_BOT + 10} ${X_L} ${Y_BOT} Z`} />
          </clipPath>
          <linearGradient id={`water-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={WATER_TOP} />
            <stop offset="1" stopColor={WATER} />
          </linearGradient>
        </defs>

        {/* handle */}
        <path d={`M ${X_R + 6} 96 C ${X_R + 44} 104, ${X_R + 44} 210, ${X_R + 6} 216`} fill="none" stroke={WALL} strokeWidth={9} strokeLinecap="round" opacity={0.9} />
        {/* spout */}
        <path d={`M ${X_L + 2} 78 L ${X_L - 22} 86 L ${X_L + 2} 100 Z`} fill={GLASS} stroke={WALL} strokeWidth={3} strokeLinejoin="round" />

        {/* glass body */}
        <path
          d={`M ${X_L - 4} 70 L ${X_R + 4} 70 L ${X_R + 4} ${Y_BOT} Q ${X_R + 4} ${Y_BOT + 16} ${X_R - 12} ${Y_BOT + 16} L ${X_L + 12} ${Y_BOT + 16} Q ${X_L - 4} ${Y_BOT + 16} ${X_L - 4} ${Y_BOT} Z`}
          fill={GLASS}
          stroke={WALL}
          strokeWidth={3.5}
          strokeLinejoin="round"
        />
        {/* rim */}
        <ellipse cx={116} cy={70} rx={62} ry={7} fill={GLASS} stroke={WALL} strokeWidth={3} />

        {/* water (clipped to interior) */}
        <g clipPath={`url(#interior-${uid})`}>
          <rect x={X_L - 6} y={waterY} width={X_R - X_L + 12} height={Y_BOT + 16 - waterY} fill={`url(#water-${uid})`} />
          <ellipse cx={116} cy={waterY} rx={(X_R - X_L) / 2 + 3} ry={5} fill={WATER_TOP} />
        </g>

        {/* glass highlight */}
        <rect x={X_L + 4} y={84} width={7} height={Y_BOT - 96} rx={3.5} fill="#ffffff" opacity={0.35} />

        {/* scale */}
        {ticks}

        {/* optional pointer arrow */}
        {typeof pointer === "number" ? (
          <g>
            <line x1={X_L - 34} y1={yFor(pointer)} x2={X_R - 26} y2={yFor(pointer)} stroke="#1a1a1a" strokeWidth={3} />
            <path d={`M ${X_R - 26} ${yFor(pointer) - 6} L ${X_R - 14} ${yFor(pointer)} L ${X_R - 26} ${yFor(pointer) + 6} Z`} fill="#1a1a1a" />
          </g>
        ) : null}
      </svg>
    </div>
  );
}
