"use client";

import { useRef } from "react";

/* ── The reusable Measurelands Timeline ───────────────────────────────────────
 * A horizontal time axis (minutes since midnight) with a fixed start marker, a
 * finish marker, and a duration bracket. Tap anywhere on the axis to move the
 * finish (snapped to `step`). Built once; reused for elapsed time, journeys and
 * timetables through Levels 4–6.
 * ───────────────────────────────────────────────────────────────────────────*/

const W = 600;
const H = 150;
const AXIS_Y = 100;

export function fmtTime(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const m = ((min % 60) + 60) % 60;
  const ap = h24 < 12 ? "am" : "pm";
  let h = h24 % 12;
  if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}
export function fmtHourShort(min: number): string {
  const h24 = Math.floor(min / 60) % 24;
  const ap = h24 < 12 ? "am" : "pm";
  let h = h24 % 12;
  if (h === 0) h = 12;
  return `${h}${ap}`;
}
export function fmtDur(min: number): string {
  const d = Math.abs(min);
  const h = Math.floor(d / 60);
  const m = d % 60;
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
}

const GREEN = "#0f766e";
const VIOLET = "#5b21b6";
const MARK = "#3B2A14";

export function MeasurelandsTimeline({
  rangeStartMin,
  rangeEndMin,
  startMin,
  finishMin,
  onSet,
  step = 5,
  showBracket = true,
  size = 560,
}: {
  rangeStartMin: number;
  rangeEndMin: number;
  startMin: number;
  finishMin: number;
  onSet?: (min: number) => void;
  step?: number;
  showBracket?: boolean;
  size?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const span = Math.max(1, rangeEndMin - rangeStartMin);
  const xFor = (min: number) => ((Math.max(rangeStartMin, Math.min(rangeEndMin, min)) - rangeStartMin) / span) * W;

  const handleTap = (e: React.MouseEvent) => {
    if (!onSet || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const raw = rangeStartMin + ratio * span;
    const snapped = Math.round(raw / step) * step;
    onSet(Math.max(rangeStartMin, Math.min(rangeEndMin, snapped)));
  };

  // hour + quarter ticks
  const ticks = [];
  const firstHour = Math.ceil(rangeStartMin / 60) * 60;
  for (let m = firstHour; m <= rangeEndMin; m += 60) {
    const x = xFor(m);
    ticks.push(<line key={`h${m}`} x1={x} x2={x} y1={AXIS_Y - 9} y2={AXIS_Y + 9} stroke={MARK} strokeWidth={2} strokeLinecap="round" />);
    ticks.push(<text key={`hl${m}`} x={Math.max(16, Math.min(W - 16, x))} y={AXIS_Y + 26} textAnchor="middle" fontSize={13} fontWeight={800} fill={MARK}>{fmtHourShort(m)}</text>);
  }
  for (let m = Math.ceil(rangeStartMin / 15) * 15; m <= rangeEndMin; m += 15) {
    if (m % 60 === 0) continue;
    const x = xFor(m);
    ticks.push(<line key={`q${m}`} x1={x} x2={x} y1={AXIS_Y - 5} y2={AXIS_Y + 5} stroke={MARK} strokeWidth={1} strokeLinecap="round" opacity={0.5} />);
  }

  const sx = xFor(startMin);
  const fx = xFor(finishMin);
  const Marker = ({ x, color, label, side }: { x: number; color: string; label: string; side: "up" | "down" }) => (
    <g>
      <line x1={x} x2={x} y1={AXIS_Y} y2={AXIS_Y - 30} stroke={color} strokeWidth={2.5} />
      <circle cx={x} cy={AXIS_Y - 32} r={6} fill={color} stroke="#fff" strokeWidth={1.5} />
      <g transform={`translate(${Math.max(34, Math.min(W - 34, x))}, ${side === "up" ? AXIS_Y - 46 : AXIS_Y + 44})`}>
        <rect x={-32} y={-13} width={64} height={22} rx={7} fill="#fffaf0" stroke={color} strokeWidth={1.4} />
        <text x={0} y={3} textAnchor="middle" fontSize={12} fontWeight={900} fill={color}>{label}</text>
      </g>
    </g>
  );

  return (
    <div ref={ref} onClick={handleTap} style={{ width: "100%", maxWidth: size, margin: "0 auto", cursor: onSet ? "pointer" : "default" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="A timeline">
        {/* axis */}
        <line x1={0} x2={W} y1={AXIS_Y} y2={AXIS_Y} stroke={MARK} strokeWidth={3} strokeLinecap="round" />
        {ticks}
        {/* duration bracket */}
        {showBracket ? (
          <g>
            <line x1={Math.min(sx, fx)} x2={Math.max(sx, fx)} y1={AXIS_Y - 30} y2={AXIS_Y - 30} stroke={VIOLET} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
            <g transform={`translate(${Math.max(54, Math.min(W - 54, (sx + fx) / 2))}, ${AXIS_Y - 66})`}>
              <rect x={-52} y={-15} width={104} height={26} rx={9} fill={VIOLET} />
              <text x={0} y={4} textAnchor="middle" fontSize={13} fontWeight={900} fill="#fff">{fmtDur(finishMin - startMin)}</text>
            </g>
          </g>
        ) : null}
        <Marker x={sx} color={GREEN} label={fmtTime(startMin)} side="down" />
        <Marker x={fx} color={VIOLET} label={fmtTime(finishMin)} side="up" />
      </svg>
      {onSet ? <p className="text-center text-[12px] font-bold uppercase tracking-[0.14em] text-[#a98b52]">Tap the timeline to set the finish</p> : null}
    </div>
  );
}
