"use client";

import { useState } from "react";

/* ── The reusable Measurelands Thermometer ────────────────────────────────────
 * A premium glass tube with a brass bulb and engraved Celsius scale, or a brass
 * digital probe with an LCD readout. The liquid column's top sits EXACTLY on the
 * reading (like the ruler's marks, the scale's needle and the jug's water line).
 * Single liquid colour at every temperature — students read the scale, not the
 * hue. Built once; reused Levels 4–6 (structured to allow negatives/decimals
 * later). Do NOT introduce a second thermometer — extend this one.
 * ───────────────────────────────────────────────────────────────────────────*/

const MARK = "#3B2A14";
const BRASS = { lo: "#B8860B", hi: "#F0D888", mid: "#D9B25A" };
const GLASS = { top: "#F4FAFF", mid: "#E6F1F8", bot: "#D4E4EE" };
const LIQUID = { hi: "#F26D4E", mid: "#E4472E", lo: "#B5301C" }; // one consistent warm colour

// Portrait geometry (SVG units). Scale runs 0 (bottom) → max (top).
const CX = 40;
const TOP_Y = 40; // y of `max`
const BOT_Y = 268; // y of 0
const BULB_CY = 292;
const BULB_R = 17;
const TUBE_W = 15;

export function MeasurelandsThermometer({
  value,
  max = 50,
  display = "analog",
  size = 150,
}: {
  value: number;
  /** Top of the scale. Labels every 10°, a longer mark every 5°, minors every 1°. */
  max?: number;
  display?: "analog" | "digital";
  size?: number;
}) {
  const [uid] = useState(() => Math.random().toString(36).slice(2, 9));
  const yFor = (v: number) => BOT_Y - (Math.max(0, Math.min(max, v)) / max) * (BOT_Y - TOP_Y);

  if (display === "digital") {
    return <DigitalThermometer value={value} size={size} uid={uid} />;
  }

  const ticks = [];
  for (let v = 0; v <= max; v += 1) {
    const y = yFor(v);
    const isMajor = v % 10 === 0;
    const isFive = !isMajor && v % 5 === 0;
    const len = isMajor ? 15 : isFive ? 9 : 5;
    ticks.push(
      <line
        key={`t${v}`}
        x1={CX + TUBE_W / 2 + 2}
        x2={CX + TUBE_W / 2 + 2 + len}
        y1={y}
        y2={y}
        stroke={MARK}
        strokeWidth={isMajor ? 1.8 : 1}
        strokeLinecap="round"
        opacity={isMajor ? 0.95 : 0.6}
      />,
    );
    if (isMajor) {
      ticks.push(
        <text key={`n${v}`} x={CX + TUBE_W / 2 + 21} y={y + 4} fontSize={12} fontWeight={800} fill={MARK}>
          {v}
        </text>,
      );
    }
  }

  const liquidTopY = yFor(value);

  return (
    <div className="mx-auto" style={{ width: size }}>
      <svg viewBox="0 0 90 320" width="100%" role="img" aria-label={`A thermometer reading ${value} degrees Celsius`}>
        <defs>
          <linearGradient id={`glass-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={GLASS.bot} />
            <stop offset="0.4" stopColor={GLASS.top} />
            <stop offset="1" stopColor={GLASS.mid} />
          </linearGradient>
          <linearGradient id={`liquid-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={LIQUID.lo} />
            <stop offset="0.5" stopColor={LIQUID.hi} />
            <stop offset="1" stopColor={LIQUID.mid} />
          </linearGradient>
          <linearGradient id={`brass-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={BRASS.hi} />
            <stop offset="0.5" stopColor={BRASS.mid} />
            <stop offset="1" stopColor={BRASS.lo} />
          </linearGradient>
        </defs>

        {/* brass bulb cap ring */}
        <circle cx={CX} cy={BULB_CY} r={BULB_R + 3} fill={`url(#brass-${uid})`} stroke="#8A6A2E" strokeWidth={1} />

        {/* glass tube */}
        <rect x={CX - TUBE_W / 2} y={TOP_Y - 8} width={TUBE_W} height={BULB_CY - (TOP_Y - 8)} rx={TUBE_W / 2} fill={`url(#glass-${uid})`} stroke="#AFC6D4" strokeWidth={1.2} />
        {/* glass bulb */}
        <circle cx={CX} cy={BULB_CY} r={BULB_R} fill={`url(#glass-${uid})`} stroke="#AFC6D4" strokeWidth={1.2} />

        {/* liquid: bulb + column up to the reading */}
        <circle cx={CX} cy={BULB_CY} r={BULB_R - 3} fill={`url(#liquid-${uid})`} />
        <rect x={CX - (TUBE_W - 7) / 2} y={liquidTopY} width={TUBE_W - 7} height={BULB_CY - liquidTopY} fill={`url(#liquid-${uid})`} rx={(TUBE_W - 7) / 2} />
        {/* glass highlight */}
        <rect x={CX - TUBE_W / 2 + 2} y={TOP_Y - 4} width={2.4} height={BULB_CY - TOP_Y} rx={1.2} fill="#FFFFFF" opacity={0.5} />

        {ticks}
        <text x={CX + TUBE_W / 2 + 21} y={TOP_Y - 14} fontSize={12} fontWeight={900} fill={MARK}>°C</text>
      </svg>
    </div>
  );
}

function DigitalThermometer({ value, size, uid }: { value: number; size: number; uid: string }) {
  return (
    <div className="mx-auto" style={{ width: size }}>
      <svg viewBox="0 0 120 320" width="100%" role="img" aria-label={`A digital thermometer reading ${value} degrees Celsius`}>
        <defs>
          <linearGradient id={`dbody-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#E7EDF2" />
            <stop offset="0.5" stopColor="#FBFDFF" />
            <stop offset="1" stopColor="#D6DFE7" />
          </linearGradient>
          <linearGradient id={`dbrass-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={BRASS.hi} />
            <stop offset="1" stopColor={BRASS.lo} />
          </linearGradient>
        </defs>
        {/* metal probe */}
        <rect x={54} y={196} width={12} height={104} rx={6} fill={`url(#dbrass-${uid})`} stroke="#8A6A2E" strokeWidth={1} />
        <circle cx={60} cy={300} r={7} fill={`url(#dbrass-${uid})`} stroke="#8A6A2E" strokeWidth={1} />
        {/* device body */}
        <rect x={18} y={28} width={84} height={168} rx={18} fill={`url(#dbody-${uid})`} stroke="#AFC0CC" strokeWidth={1.4} />
        {/* LCD screen */}
        <rect x={30} y={52} width={60} height={92} rx={8} fill="#0f2a24" stroke="#0a1f1b" strokeWidth={1.4} />
        <text x={60} y={104} textAnchor="middle" fontSize={30} fontWeight={900} fontFamily="ui-monospace, monospace" fill="#7CF5B0">{value}</text>
        <text x={60} y={128} textAnchor="middle" fontSize={15} fontWeight={800} fontFamily="ui-monospace, monospace" fill="#7CF5B0">°C</text>
        {/* button */}
        <circle cx={60} cy={168} r={9} fill="#C7D2DA" stroke="#9AA9B3" strokeWidth={1.2} />
      </svg>
    </div>
  );
}
