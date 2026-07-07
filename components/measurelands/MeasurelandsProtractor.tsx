"use client";

import { useRef } from "react";

// The permanent Measurelands protractor (Levels 5-6). Dual-scale (inner + outer),
// premium styling, optional scale/baseline highlighting, and an optional
// draggable arm for constructing angles. All whole degrees, 0-180.

const W = 480, H = 300;
const VX = 240, VY = 236, R = 196;

function pt(deg: number, len: number): [number, number] {
  const r = (deg * Math.PI) / 180;
  return [VX + len * Math.cos(r), VY - len * Math.sin(r)];
}

export function MeasurelandsProtractor({
  angle = 60,
  baselineSide = "right",
  guidance = "none",
  interactive = false,
  targetDeg,
  currentDeg,
  onDeg,
  size = 460,
}: {
  angle?: number;
  baselineSide?: "left" | "right";
  guidance?: "full" | "baseline" | "none";
  interactive?: boolean;
  targetDeg?: number;
  currentDeg?: number;
  onDeg?: (deg: number) => void;
  size?: number;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);

  // Direction (deg CCW from +x) of the two arms.
  const baselineDeg = baselineSide === "right" ? 0 : 180;
  const shownAngle = interactive ? currentDeg ?? 0 : angle;
  const armDeg = interactive ? currentDeg ?? 0 : baselineSide === "right" ? angle : 180 - angle;
  const correctScale: "outer" | "inner" = baselineSide === "right" ? "outer" : "inner";

  const degFromEvent = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    let deg = (Math.atan2(VY - py, px - VX) * 180) / Math.PI;
    deg = Math.max(0, Math.min(180, deg));
    if (targetDeg != null && Math.abs(deg - targetDeg) <= 4) return targetDeg; // magnetic snap
    return Math.round(deg);
  };
  const move = (e: React.PointerEvent) => { if (dragging.current && onDeg) onDeg(degFromEvent(e)); };

  const ticks: React.ReactNode[] = [];
  for (let t = 0; t <= 180; t += 5) {
    const major = t % 10 === 0;
    const [x1, y1] = pt(t, R);
    const [x2, y2] = pt(t, R - (major ? 16 : 9));
    ticks.push(<line key={`t${t}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6d5b2a" strokeWidth={major ? 1.8 : 1} />);
  }
  const num = (scale: "outer" | "inner") => {
    const active = guidance === "full" ? correctScale === scale : true;
    const faded = guidance === "full" && correctScale !== scale;
    const rad = scale === "outer" ? R + 15 : R - 24;
    const out: React.ReactNode[] = [];
    for (let t = 0; t <= 180; t += 10) {
      const val = scale === "outer" ? t : 180 - t;
      const [x, y] = pt(t, rad);
      out.push(<text key={`${scale}${t}`} x={x} y={y + 4} textAnchor="middle" fontSize={11.5} fontWeight={active && guidance === "full" ? 900 : 700} fill={faded ? "rgba(120,90,40,0.32)" : active && guidance === "full" ? "#b45309" : "#5a4423"}>{val}</text>);
    }
    return out;
  };

  const [bx, by] = pt(baselineDeg, R);
  const [ax, ay] = pt(armDeg, R);
  const baseGlow = guidance === "full" || guidance === "baseline";
  const atTarget = interactive && targetDeg != null && currentDeg === targetDeg;

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: size, touchAction: "none" }} role="img" aria-label="protractor"
      onPointerMove={interactive ? move : undefined}
      onPointerUp={interactive ? () => { dragging.current = false; } : undefined}
      onPointerLeave={interactive ? () => { dragging.current = false; } : undefined}
    >
      <style>{"@keyframes mlGlowArc{0%,100%{opacity:.5}50%{opacity:1}}"}</style>
      {/* protractor body */}
      <path d={`M ${VX - R} ${VY} A ${R} ${R} 0 0 1 ${VX + R} ${VY} Z`} fill="rgba(124,58,237,0.07)" stroke="#c9962a" strokeWidth={3} />
      <line x1={VX - R} y1={VY} x2={VX + R} y2={VY} stroke="#c9962a" strokeWidth={3} />
      {ticks}
      {/* active-scale glowing band */}
      {guidance === "full" ? (
        <path d={`M ${pt(0, correctScale === "outer" ? R + 2 : R - 12)[0]} ${pt(0, correctScale === "outer" ? R + 2 : R - 12)[1]} A ${correctScale === "outer" ? R + 2 : R - 12} ${correctScale === "outer" ? R + 2 : R - 12} 0 0 1 ${pt(180, correctScale === "outer" ? R + 2 : R - 12)[0]} ${pt(180, correctScale === "outer" ? R + 2 : R - 12)[1]}`} fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth={8} strokeLinecap="round" style={{ animation: "mlGlowArc 1.6s ease infinite" }} />
      ) : null}
      {num("outer")}
      {num("inner")}
      {/* baseline arm */}
      {baseGlow ? <line x1={VX} y1={VY} x2={bx} y2={by} stroke="#f59e0b" strokeWidth={11} strokeLinecap="round" opacity={0.5} style={{ filter: "drop-shadow(0 0 3px rgba(245,158,11,0.9))" }} /> : null}
      <line x1={VX} y1={VY} x2={bx} y2={by} stroke="#2c1c07" strokeWidth={5} strokeLinecap="round" />
      {/* angle wedge arc */}
      <path d={`M ${pt(baselineDeg, 46)[0]} ${pt(baselineDeg, 46)[1]} A 46 46 0 0 ${baselineDeg === 0 ? 0 : 1} ${pt(armDeg, 46)[0]} ${pt(armDeg, 46)[1]}`} fill="none" stroke="#5b21b6" strokeWidth={3} />
      {/* measured arm */}
      <line x1={VX} y1={VY} x2={ax} y2={ay} stroke={atTarget ? "#16a34a" : "#7c3aed"} strokeWidth={6} strokeLinecap="round" style={atTarget ? { filter: "drop-shadow(0 0 5px rgba(22,163,74,0.8))" } : undefined} />
      {interactive ? (
        <circle cx={ax} cy={ay} r={16} fill={atTarget ? "#16a34a" : "#7c3aed"} stroke="#fff" strokeWidth={3} style={{ cursor: "grab" }}
          onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); }} />
      ) : null}
      {/* vertex + live value */}
      <circle cx={VX} cy={VY} r={7} fill="#5b21b6" stroke="#fff" strokeWidth={2} />
      {interactive ? (
        <g>
          <rect x={VX - 44} y={VY + 14} width={88} height={34} rx={10} fill={atTarget ? "#16a34a" : "#5b21b6"} />
          <text x={VX} y={VY + 37} textAnchor="middle" fontSize={22} fontWeight={900} fill="#fff">{shownAngle}°{atTarget ? " ✓" : ""}</text>
        </g>
      ) : null}
    </svg>
  );
}
