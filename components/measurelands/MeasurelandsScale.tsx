"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
 * The reusable Measurelands Scale — reads mass in grams or kilograms.
 * "dial"  = classic round kitchen scale (full-circle face, red needle).
 * "digital" = LCD readout on the same body.
 * Reused for Week 3 (mass) and, conceptually, Week 4's measuring jug.
 * Extend this — don't fork it.
 * ═══════════════════════════════════════════════════════════════════════════ */
const BODY = { top: "#8FD0EC", mid: "#6FBFE0", bot: "#57A9CE" };
const PAN = { top: "#BEE4F4", bot: "#93CFE9" };
const NECK = "#4E90C4";
const FEET = "#3C4A54";
const TAN = "#B99A5E";
const FACE = "#FDFDFB";
const MARK = "#233";
const NEEDLE = "#D0342C";

const CX = 130;
const CY = 152;
const R = 82;

function pointFor(angleDeg: number, radius: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180; // 0° = 12 o'clock, clockwise
  return [CX + radius * Math.sin(rad), CY - radius * Math.cos(rad)];
}

export function MeasurelandsScale({
  value,
  unit,
  max,
  majorStep,
  minorStep,
  display = "dial",
  object,
  size = 260,
}: {
  value: number;
  unit: "g" | "kg";
  max: number;
  majorStep: number;
  /** Distance between minor ticks. Defaults to majorStep/5 (Level 3). Level 4
   *  passes a coarser value so readings land cleanly on a partial graduation
   *  (e.g. 0.5 kg with one minor between each labelled kilogram). */
  minorStep?: number;
  display?: "dial" | "digital";
  object?: { label: string; emoji: string };
  size?: number;
}) {
  const [uid] = useState(() => Math.random().toString(36).slice(2, 9));
  const unitWord = unit === "g" ? "grams" : "kilograms";
  const majorCount = Math.round(max / majorStep);
  const step = minorStep ?? majorStep / 5;
  const minorTicks = Math.round(max / step);

  const ticks = [];
  for (let m = 0; m < minorTicks; m += 1) {
    const v = m * step;
    const a = (v / max) * 360;
    const isMajor = Math.abs(v / majorStep - Math.round(v / majorStep)) < 1e-6;
    const [x1, y1] = pointFor(a, R - 3);
    const [x2, y2] = pointFor(a, R - (isMajor ? 12 : 7));
    ticks.push(<line key={`t${m}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={MARK} strokeWidth={isMajor ? 2 : 1} strokeLinecap="round" opacity={isMajor ? 0.95 : 0.6} />);
  }
  const numbers = [];
  for (let k = 0; k < majorCount; k += 1) {
    const v = k * majorStep;
    const a = (v / max) * 360;
    const [x, y] = pointFor(a, R - 26);
    numbers.push(
      <text key={`n${k}`} x={x} y={y + 5} textAnchor="middle" fontSize={14} fontWeight={800} fill={MARK}>
        {Number(v.toFixed(0))}
      </text>,
    );
  }

  const t = Math.max(0, Math.min(1, value / max));
  const a = t * 360;
  const [nx, ny] = pointFor(a, R - 30);
  const [tx, ty] = pointFor(a + 180, 15);

  return (
    <div className="mx-auto w-full" style={{ maxWidth: size }}>
      <svg viewBox="0 -34 260 334" width="100%" role="img" aria-label={`A scale reading ${value} ${unit}`}>
        <defs>
          <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={BODY.top} />
            <stop offset="0.5" stopColor={BODY.mid} />
            <stop offset="1" stopColor={BODY.bot} />
          </linearGradient>
          <linearGradient id={`pan-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={PAN.top} />
            <stop offset="1" stopColor={PAN.bot} />
          </linearGradient>
        </defs>

        {/* feet */}
        <rect x={62} y={250} width={36} height={18} rx={7} fill={FEET} />
        <rect x={162} y={250} width={36} height={18} rx={7} fill={FEET} />

        {/* neck + pan, then the object resting ON TOP of the pan */}
        <rect x={CX - 11} y={40} width={22} height={16} fill={NECK} />
        <ellipse cx={CX} cy={40} rx={94} ry={12} fill={`url(#pan-${uid})`} stroke="#7FB9D6" strokeWidth={1} />
        <ellipse cx={CX} cy={37} rx={80} ry={8} fill="#ffffff" opacity={0.4} />
        {object ? (
          <text x={CX} y={34} textAnchor="middle" fontSize={48} style={{ dominantBaseline: "alphabetic" }}>
            {object.emoji}
          </text>
        ) : null}

        {/* body */}
        <path d="M40 74 Q40 54 62 54 H198 Q220 54 220 74 L226 236 Q228 258 206 258 H54 Q32 258 34 236 Z" fill={`url(#body-${uid})`} stroke="#4E90C4" strokeWidth={1.5} />

        {display === "dial" ? (
          <g>
            <circle cx={CX} cy={CY} r={R + 6} fill={TAN} />
            <circle cx={CX} cy={CY} r={R + 2} fill="#8A7038" opacity={0.35} />
            <circle cx={CX} cy={CY} r={R} fill={FACE} stroke="#CBB88A" strokeWidth={1} />
            {ticks}
            {numbers}
            <text x={CX} y={CY + 30} textAnchor="middle" fontSize={13} fontWeight={800} fill="#555" fontStyle="italic">
              {unitWord}
            </text>
            <line x1={tx} y1={ty} x2={nx} y2={ny} stroke={NEEDLE} strokeWidth={4} strokeLinecap="round" />
            <circle cx={CX} cy={CY} r={8} fill={NEEDLE} />
            <circle cx={CX} cy={CY} r={3} fill="#7a1712" />
          </g>
        ) : (
          <g>
            <rect x={54} y={116} width={152} height={80} rx={12} fill="#0E1A17" stroke="#0a2a24" strokeWidth={2} />
            <rect x={60} y={122} width={140} height={20} rx={6} fill="#123" opacity={0.5} />
            <text x={CX} y={176} textAnchor="middle" fontSize={42} fontWeight={900} fill="#5EEAD4" style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
              {value}
              <tspan fontSize={22} dx={6} fill="#2dd4bf">{unit}</tspan>
            </text>
            <text x={CX} y={224} textAnchor="middle" fontSize={12} fontWeight={800} fill="#e0f2ef" style={{ letterSpacing: 2 }}>
              {unitWord.toUpperCase()}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
