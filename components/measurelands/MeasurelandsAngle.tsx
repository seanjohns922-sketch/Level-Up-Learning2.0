"use client";

import { useState } from "react";

/* ── The reusable Measurelands Angle + Angle Comparator ───────────────────────
 * Draws an angle as two rays from a vertex with a turn-arc. Arm lengths vary
 * independently of the angle so students read the TURN, not the ray length.
 * With `benchmark`, a right-angle template is overlaid at the vertex so angles
 * can be compared to a right angle (equal / smaller / larger). Built once;
 * reused Levels 4–6 (later extends to a protractor / degrees).
 * ───────────────────────────────────────────────────────────────────────────*/

const ARM = "#5b21b6";
const ARM2 = "#0f766e";
const ARC = "#c2410c";
const BENCH = "#b45309";
const VERTEX = "#2c1c07";

const VX = 118;
const VY = 150;

function pt(deg: number, len: number): [number, number] {
  const r = (deg * Math.PI) / 180;
  return [VX + len * Math.cos(r), VY - len * Math.sin(r)];
}

export function MeasurelandsAngle({
  kind = "angle",
  turn = 45,
  rot = 0,
  arm1 = 95,
  arm2 = 95,
  benchmark = false,
  rightMark = false,
  size = 220,
}: {
  kind?: "angle" | "line" | "ray";
  turn?: number;
  rot?: number;
  arm1?: number;
  arm2?: number;
  /** Overlay a right-angle template at the vertex (the comparator). */
  benchmark?: boolean;
  /** Draw the little right-angle square when this IS a right angle. */
  rightMark?: boolean;
  size?: number;
}) {
  const [uid] = useState(() => Math.random().toString(36).slice(2, 9));

  if (kind === "line") {
    const [ax, ay] = pt(rot, arm1);
    const [bx, by] = pt(rot + 180, arm1);
    return (
      <svg viewBox="0 0 236 200" width="100%" style={{ maxWidth: size }} role="img" aria-label="A straight line">
        <line x1={ax} y1={ay} x2={bx} y2={by} stroke={ARM} strokeWidth={7} strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "ray") {
    const [ax, ay] = pt(rot, arm1);
    return (
      <svg viewBox="0 0 236 200" width="100%" style={{ maxWidth: size }} role="img" aria-label="A single ray">
        <line x1={VX} y1={VY} x2={ax} y2={ay} stroke={ARM} strokeWidth={7} strokeLinecap="round" />
        <circle cx={VX} cy={VY} r={6} fill={VERTEX} />
      </svg>
    );
  }

  const [a1x, a1y] = pt(rot, arm1);
  const [a2x, a2y] = pt(rot + turn, arm2);
  const isRight = Math.abs(turn - 90) < 0.5;

  // turn-arc
  const arcR = 34;
  const [p1x, p1y] = pt(rot, arcR);
  const [p2x, p2y] = pt(rot + turn, arcR);
  const largeArc = turn > 180 ? 1 : 0;
  const arcPath = `M ${p1x.toFixed(1)} ${p1y.toFixed(1)} A ${arcR} ${arcR} 0 ${largeArc} 0 ${p2x.toFixed(1)} ${p2y.toFixed(1)}`;

  // benchmark right-angle template (from ray1, opening 90°)
  const [bx, by] = pt(rot + 90, Math.min(arm1, arm2) * 0.92);
  const sq = 16;
  const [s1x, s1y] = pt(rot, sq);
  const [s2x, s2y] = pt(rot + 90, sq);
  const [scx, scy] = [s1x + (s2x - VX), s1y + (s2y - VY)];

  return (
    <svg viewBox="0 0 236 200" width="100%" style={{ maxWidth: size }} role="img" aria-label="An angle">
      <defs>
        <radialGradient id={`arc-${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={ARC} stopOpacity="0.28" />
          <stop offset="1" stopColor={ARC} stopOpacity="0.1" />
        </radialGradient>
      </defs>
      {/* shaded turn wedge */}
      <path d={`M ${VX} ${VY} L ${pt(rot, arcR)[0]} ${pt(rot, arcR)[1]} A ${arcR} ${arcR} 0 ${largeArc} 0 ${pt(rot + turn, arcR)[0]} ${pt(rot + turn, arcR)[1]} Z`} fill={`url(#arc-${uid})`} />

      {/* benchmark right-angle template */}
      {benchmark ? (
        <g opacity={0.85}>
          <line x1={VX} y1={VY} x2={bx} y2={by} stroke={BENCH} strokeWidth={4} strokeDasharray="7 5" strokeLinecap="round" />
          <path d={`M ${s1x} ${s1y} L ${scx} ${scy} L ${s2x} ${s2y}`} fill="none" stroke={BENCH} strokeWidth={2.5} />
        </g>
      ) : null}

      {/* arms */}
      <line x1={VX} y1={VY} x2={a1x} y2={a1y} stroke={ARM} strokeWidth={7} strokeLinecap="round" />
      <line x1={VX} y1={VY} x2={a2x} y2={a2y} stroke={ARM2} strokeWidth={7} strokeLinecap="round" />

      {/* arc line + right-angle square */}
      {isRight && rightMark ? (
        <path d={`M ${s1x} ${s1y} L ${scx} ${scy} L ${s2x} ${s2y}`} fill="none" stroke={ARC} strokeWidth={3} />
      ) : (
        <path d={arcPath} fill="none" stroke={ARC} strokeWidth={3.5} strokeLinecap="round" />
      )}

      <circle cx={VX} cy={VY} r={6.5} fill={VERTEX} />
    </svg>
  );
}
