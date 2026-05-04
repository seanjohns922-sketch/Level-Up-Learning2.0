"use client";

import type { CartesianGridVisualData } from "@/data/activities/year2/lessonEngine";

const SIZE = 320;
const PADDING = 24;

function toSvgX(value: number, min: number, max: number) {
  return PADDING + ((value - min) / (max - min)) * (SIZE - PADDING * 2);
}

function toSvgY(value: number, min: number, max: number) {
  return SIZE - PADDING - ((value - min) / (max - min)) * (SIZE - PADDING * 2);
}

export default function CartesianGridVisual({
  visual,
}: {
  visual: CartesianGridVisualData;
}) {
  const xTicks = Array.from({ length: visual.xMax - visual.xMin + 1 }, (_, i) => visual.xMin + i);
  const yTicks = Array.from({ length: visual.yMax - visual.yMin + 1 }, (_, i) => visual.yMin + i);
  const zeroX = toSvgX(0, visual.xMin, visual.xMax);
  const zeroY = toSvgY(0, visual.yMin, visual.yMax);

  const pathPoints = visual.points.map((point) => ({
    ...point,
    px: toSvgX(point.x, visual.xMin, visual.xMax),
    py: toSvgY(point.y, visual.yMin, visual.yMax),
  }));

  const polylinePoints = pathPoints.map((point) => `${point.px},${point.py}`).join(" ");
  const closedPolylinePoints =
    visual.closePath && pathPoints.length > 1
      ? `${polylinePoints} ${pathPoints[0]?.px},${pathPoints[0]?.py}`
      : polylinePoints;

  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
            {visual.title}
          </div>
          {visual.subtitle ? (
            <div className="mt-1 text-sm font-semibold text-slate-600">{visual.subtitle}</div>
          ) : null}
        </div>
        {visual.targetCoordinate ? (
          <div className="rounded-full border border-cyan-300 bg-slate-900 px-3 py-1 text-xs font-black tracking-[0.14em] text-cyan-200">
            {visual.targetCoordinate}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex justify-center">
        <div className="rounded-[28px] border border-cyan-300 bg-slate-950 p-3 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-[320px] w-[320px]">
            <defs>
              <pattern id="gridPattern" width={(SIZE - PADDING * 2) / (visual.xMax - visual.xMin)} height={(SIZE - PADDING * 2) / (visual.yMax - visual.yMin)} patternUnits="userSpaceOnUse">
                <path d={`M ${(SIZE - PADDING * 2) / (visual.xMax - visual.xMin)} 0 L 0 0 0 ${(SIZE - PADDING * 2) / (visual.yMax - visual.yMin)}`} fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth="1" />
              </pattern>
            </defs>

            <rect x={PADDING} y={PADDING} width={SIZE - PADDING * 2} height={SIZE - PADDING * 2} fill="url(#gridPattern)" rx="18" />

            <line x1={PADDING} y1={zeroY} x2={SIZE - PADDING} y2={zeroY} stroke="rgba(34,211,238,0.8)" strokeWidth="2.5" />
            <line x1={zeroX} y1={PADDING} x2={zeroX} y2={SIZE - PADDING} stroke="rgba(34,211,238,0.8)" strokeWidth="2.5" />

            {xTicks.map((tick) => {
              const x = toSvgX(tick, visual.xMin, visual.xMax);
              return (
                <g key={`x-${tick}`}>
                  <line x1={x} y1={zeroY - 5} x2={x} y2={zeroY + 5} stroke="rgba(203,213,225,0.9)" strokeWidth="1.5" />
                  <text x={x} y={SIZE - 4} textAnchor="middle" className="fill-slate-300 text-[10px] font-bold">
                    {tick}
                  </text>
                </g>
              );
            })}

            {yTicks.map((tick) => {
              const y = toSvgY(tick, visual.yMin, visual.yMax);
              return (
                <g key={`y-${tick}`}>
                  <line x1={zeroX - 5} y1={y} x2={zeroX + 5} y2={y} stroke="rgba(203,213,225,0.9)" strokeWidth="1.5" />
                  <text x={8} y={y + 4} textAnchor="start" className="fill-slate-300 text-[10px] font-bold">
                    {tick}
                  </text>
                </g>
              );
            })}

            <circle cx={zeroX} cy={zeroY} r="5" fill="rgba(34,211,238,0.95)" />
            <text x={zeroX + 8} y={zeroY - 8} className="fill-cyan-200 text-[10px] font-black">
              (0,0)
            </text>

            {visual.connectPoints && pathPoints.length > 1 ? (
              <polyline
                points={closedPolylinePoints}
                fill="none"
                stroke="rgba(34,211,238,0.95)"
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}

            {pathPoints.map((point, index) => (
              <g key={`${point.x}-${point.y}-${index}`}>
                <circle cx={point.px} cy={point.py} r="8" fill="rgba(6,182,212,0.95)" />
                <circle cx={point.px} cy={point.py} r="16" fill="rgba(34,211,238,0.18)" />
                <text x={point.px} y={point.py + 3} textAnchor="middle" className="fill-slate-950 text-[10px] font-black">
                  {index + 1}
                </text>
                {point.label ? (
                  <text x={point.px + 10} y={point.py - 10} className="fill-cyan-100 text-[10px] font-black">
                    {point.label}
                  </text>
                ) : null}
              </g>
            ))}

            <text x={SIZE - 18} y={zeroY - 10} textAnchor="end" className="fill-cyan-200 text-[11px] font-black">
              x
            </text>
            <text x={zeroX + 10} y={18} className="fill-cyan-200 text-[11px] font-black">
              y
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
