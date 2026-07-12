"use client";

import { useRef } from "react";
import { fmt } from "@/data/activities/year6Measurelands/metricLadders";

// Measurement Lab instruments — a jug (capacity), dial scale (mass) and tape
// (length). The scale is marked in the SMALL unit (mL / g / cm), so a task given
// in the big unit ("Pour 1.5 L") requires a real conversion. Level 6 W4.

export type LabKind = "jug" | "scale" | "tape";

export function MeasurelandsLabInstrument({
  kind, value, max, step, smallUnit, target, onChange, size = 320,
}: {
  kind: LabKind;
  value: number;
  max: number;
  step: number;
  smallUnit: string;
  bigUnit?: string;
  factor?: number;
  target?: number | null;
  onChange?: (v: number) => void;
  size?: number;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);
  const snap = (v: number) => Math.max(0, Math.min(max, Math.round(v / step) * step));
  const major = Math.max(step, Math.round(max / 4)); // label ~4 values
  const minor = major / 2;
  const rel = (e: React.PointerEvent) => { const r = svgRef.current!.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, vb: r }; };

  if (kind === "jug") {
    const W = 285, H = 300, jx = 40, jw = 108, jTop = 24, jBot = 282, jh = jBot - jTop;
    const lvl = (v: number) => jBot - (v / max) * jh;
    const move = (e: React.PointerEvent) => { if (!dragging.current || !onChange) return; const { y, vb } = rel(e); onChange(snap(((jBot - (y / vb.height) * H) / jh) * max)); };
    const ticks: React.ReactNode[] = [];
    for (let v = 0; v <= max; v += minor) {
      const y = lvl(v), isMaj = v % major === 0;
      ticks.push(<line key={`t${v}`} x1={jx + jw} y1={y} x2={jx + jw + (isMaj ? 14 : 8)} y2={y} stroke="#6d5b2a" strokeWidth={isMaj ? 1.8 : 1} />);
      if (isMaj) ticks.push(<text key={`l${v}`} x={jx + jw + 18} y={y + 4} fontSize={12} fontWeight={800} fill="#5a4423">{fmt(v)} {smallUnit}</text>);
    }
    return (
      <div className="mx-auto" style={{ maxWidth: size }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ touchAction: "none" }} onPointerMove={onChange ? move : undefined} onPointerUp={() => (dragging.current = false)} onPointerLeave={() => (dragging.current = false)}>
          <rect x={jx} y={jTop} width={jw} height={jh} rx={14} fill="rgba(255,255,255,0.7)" stroke="#7c3aed" strokeWidth={3} />
          <clipPath id="jugclip"><rect x={jx} y={jTop} width={jw} height={jh} rx={14} /></clipPath>
          <g clipPath="url(#jugclip)"><rect x={jx} y={lvl(value)} width={jw} height={jBot - lvl(value)} fill="rgba(59,130,246,0.45)" /><rect x={jx} y={lvl(value)} width={jw} height={6} fill="rgba(59,130,246,0.8)" /></g>
          {target != null ? <><line x1={jx - 6} y1={lvl(target)} x2={jx + jw + 6} y2={lvl(target)} stroke="#16a34a" strokeWidth={3} strokeDasharray="7 5" /><text x={jx - 8} y={lvl(target) + 4} textAnchor="end" fontSize={12} fontWeight={900} fill="#16a34a">target</text></> : null}
          {ticks}
          {onChange ? <circle cx={jx + jw / 2} cy={lvl(value)} r={13} fill="#7c3aed" stroke="#fff" strokeWidth={3} style={{ cursor: "grab" }} onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); }} /> : null}
        </svg>
      </div>
    );
  }

  if (kind === "tape") {
    const W = 380, H = 150, tx = 24, tw = 332, tTop = 46, tHt = 40;
    const px = (v: number) => tx + (v / max) * tw;
    const move = (e: React.PointerEvent) => { if (!dragging.current || !onChange) return; const { x, vb } = rel(e); onChange(snap((((x / vb.width) * W - tx) / tw) * max)); };
    const ticks: React.ReactNode[] = [];
    for (let v = 0; v <= max; v += minor) {
      const x = px(v), isMaj = v % major === 0;
      ticks.push(<line key={`t${v}`} x1={x} y1={tTop} x2={x} y2={tTop + (isMaj ? 16 : 8)} stroke="#6d5b2a" strokeWidth={isMaj ? 1.8 : 1} />);
      if (isMaj) ticks.push(<text key={`l${v}`} x={x} y={tTop + 32} textAnchor="middle" fontSize={12} fontWeight={800} fill="#5a4423">{fmt(v)}</text>);
    }
    return (
      <div className="mx-auto" style={{ maxWidth: size }}>
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ touchAction: "none" }} onPointerMove={onChange ? move : undefined} onPointerUp={() => (dragging.current = false)} onPointerLeave={() => (dragging.current = false)}>
          <rect x={tx} y={tTop} width={tw} height={tHt} rx={8} fill="#fff7df" stroke="#c9962a" strokeWidth={2} />
          <rect x={tx} y={tTop} width={px(value) - tx} height={tHt} rx={8} fill="rgba(124,58,237,0.28)" />
          <text x={tx + tw} y={tTop + tHt + 30} textAnchor="end" fontSize={12} fontWeight={900} fill="#a98b52">{smallUnit}</text>
          {ticks}
          {target != null ? <><line x1={px(target)} y1={tTop - 8} x2={px(target)} y2={tTop + tHt + 8} stroke="#16a34a" strokeWidth={3} strokeDasharray="7 5" /><text x={px(target)} y={tTop - 12} textAnchor="middle" fontSize={12} fontWeight={900} fill="#16a34a">target</text></> : null}
          {onChange ? <circle cx={px(value)} cy={tTop + tHt / 2} r={13} fill="#7c3aed" stroke="#fff" strokeWidth={3} style={{ cursor: "grab" }} onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); }} /> : null}
        </svg>
      </div>
    );
  }

  // SCALE (semicircular dial)
  const W = 320, H = 210, cx = 160, cy = 186, R = 138;
  const ang = (v: number) => Math.PI - (v / max) * Math.PI;
  const pt = (v: number, rr: number): [number, number] => [cx + rr * Math.cos(ang(v)), cy - rr * Math.sin(ang(v))];
  const move = (e: React.PointerEvent) => { if (!dragging.current || !onChange) return; const { x, y, vb } = rel(e); let a = Math.atan2(cy - (y / vb.height) * H, (x / vb.width) * W - cx); if (a < 0) a = 0; if (a > Math.PI) a = Math.PI; onChange(snap(((Math.PI - a) / Math.PI) * max)); };
  const ticks: React.ReactNode[] = [];
  for (let v = 0; v <= max; v += minor) {
    const isMaj = v % major === 0;
    const [x1, y1] = pt(v, R), [x2, y2] = pt(v, R - (isMaj ? 16 : 9));
    ticks.push(<line key={`t${v}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6d5b2a" strokeWidth={isMaj ? 1.8 : 1} />);
    if (isMaj) { const [lx, ly] = pt(v, R - 30); ticks.push(<text key={`l${v}`} x={lx} y={ly + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill="#5a4423">{fmt(v)}</text>); }
  }
  const [hx, hy] = pt(value, R - 4);
  return (
    <div className="mx-auto" style={{ maxWidth: size }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ touchAction: "none" }} onPointerMove={onChange ? move : undefined} onPointerUp={() => (dragging.current = false)} onPointerLeave={() => (dragging.current = false)}>
        <path d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="rgba(124,58,237,0.06)" stroke="#c9962a" strokeWidth={3} />
        {ticks}
        {target != null ? (() => { const [tx1, ty1] = pt(target, R + 2), [tx2, ty2] = pt(target, R - 22); return <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#16a34a" strokeWidth={4} strokeLinecap="round" />; })() : null}
        <text x={cx} y={cy + 20} textAnchor="middle" fontSize={12} fontWeight={900} fill="#a98b52">{smallUnit}</text>
        <line x1={cx} y1={cy} x2={hx} y2={hy} stroke="#7c3aed" strokeWidth={5} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={8} fill="#5b21b6" />
        {onChange ? <circle cx={hx} cy={hy} r={13} fill="#7c3aed" stroke="#fff" strokeWidth={3} style={{ cursor: "grab" }} onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); }} /> : null}
      </svg>
    </div>
  );
}
