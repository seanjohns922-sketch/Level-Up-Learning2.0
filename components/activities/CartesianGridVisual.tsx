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

function fromSvgX(svgX: number, min: number, max: number) {
  const ratio = (svgX - PADDING) / (SIZE - PADDING * 2);
  return min + ratio * (max - min);
}

function fromSvgY(svgY: number, min: number, max: number) {
  const ratio = (SIZE - PADDING - svgY) / (SIZE - PADDING * 2);
  return min + ratio * (max - min);
}

export default function CartesianGridVisual({
  visual,
  interactive = false,
  selectedPoint = null,
  onPointSelect,
}: {
  visual: CartesianGridVisualData;
  interactive?: boolean;
  selectedPoint?: { x: number; y: number } | null;
  onPointSelect?: (point: { x: number; y: number }) => void;
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
  const selectedPointPosition = selectedPoint
    ? {
        ...selectedPoint,
        px: toSvgX(selectedPoint.x, visual.xMin, visual.xMax),
        py: toSvgY(selectedPoint.y, visual.yMin, visual.yMax),
      }
    : null;

  const polylinePoints = pathPoints.map((point) => `${point.px},${point.py}`).join(" ");
  const closedPolylinePoints =
    visual.closePath && pathPoints.length > 1
      ? `${polylinePoints} ${pathPoints[0]?.px},${pathPoints[0]?.py}`
      : polylinePoints;

  function handleGridPointerDown(event: React.PointerEvent<SVGRectElement>) {
    if (!interactive || !onPointSelect) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const plotSize = SIZE - PADDING * 2;
    const localPlotX = ((event.clientX - bounds.left) / bounds.width) * plotSize;
    const localPlotY = ((event.clientY - bounds.top) / bounds.height) * plotSize;
    const localX = PADDING + localPlotX;
    const localY = PADDING + localPlotY;

    const snappedX = Math.max(
      visual.xMin,
      Math.min(visual.xMax, Math.round(fromSvgX(localX, visual.xMin, visual.xMax)))
    );
    const snappedY = Math.max(
      visual.yMin,
      Math.min(visual.yMax, Math.round(fromSvgY(localY, visual.yMin, visual.yMax)))
    );

    onPointSelect({ x: snappedX, y: snappedY });
  }

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
        {visual.targetCoordinate && !interactive ? (
          <div className="rounded-full border border-cyan-300 bg-slate-900 px-3 py-1 text-xs font-black tracking-[0.14em] text-cyan-200">
            {visual.targetCoordinate}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex justify-center">
        <div className="rounded-[28px] border border-cyan-300 bg-slate-950 p-3 shadow-[0_0_30px_rgba(34,211,238,0.12)]">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-[320px] w-[320px]">
            <defs>
              <pattern
                id="gridPattern"
                width={(SIZE - PADDING * 2) / (visual.xMax - visual.xMin)}
                height={(SIZE - PADDING * 2) / (visual.yMax - visual.yMin)}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${(SIZE - PADDING * 2) / (visual.xMax - visual.xMin)} 0 L 0 0 0 ${(SIZE - PADDING * 2) / (visual.yMax - visual.yMin)}`}
                  fill="none"
                  stroke="rgba(186,230,253,0.36)"
                  strokeWidth="1.05"
                />
              </pattern>
              <marker
                id="axisArrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L6,3 z" fill="rgba(103,232,249,0.58)" />
              </marker>
              <marker
                id="movementArrow"
                markerWidth="10"
                markerHeight="10"
                refX="8"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L9,3 z" fill="rgba(34,211,238,0.95)" />
              </marker>
            </defs>

            <rect x={PADDING} y={PADDING} width={SIZE - PADDING * 2} height={SIZE - PADDING * 2} fill="url(#gridPattern)" rx="18" />
            {interactive ? (
              <rect
                x={PADDING}
                y={PADDING}
                width={SIZE - PADDING * 2}
                height={SIZE - PADDING * 2}
                fill="transparent"
                rx="18"
                className="cursor-pointer"
                pointerEvents="all"
                onPointerDown={handleGridPointerDown}
              />
            ) : null}

            <line
              x1={PADDING}
              y1={zeroY}
              x2={SIZE - PADDING}
              y2={zeroY}
              stroke="rgba(103,232,249,0.96)"
              strokeWidth="3"
              markerEnd="url(#axisArrow)"
            />
            <line
              x1={zeroX}
              y1={SIZE - PADDING}
              x2={zeroX}
              y2={PADDING}
              stroke="rgba(103,232,249,0.96)"
              strokeWidth="3"
              markerEnd="url(#axisArrow)"
            />

            {xTicks.map((tick) => {
              const x = toSvgX(tick, visual.xMin, visual.xMax);
              const isMajor = tick !== 0 && tick % 5 === 0;
              return (
                <g key={`x-${tick}`} className="group">
                  <line
                    x1={x}
                    y1={PADDING}
                    x2={x}
                    y2={SIZE - PADDING}
                    stroke="rgba(34,211,238,0.12)"
                    strokeWidth="1.5"
                    opacity="0"
                    className="transition-opacity duration-150 group-hover:opacity-100"
                  />
                  <line
                    x1={x}
                    y1={zeroY - (isMajor ? 7 : 5)}
                    x2={x}
                    y2={zeroY + (isMajor ? 7 : 5)}
                    stroke={isMajor ? "rgba(226,232,240,0.96)" : "rgba(226,232,240,0.88)"}
                    strokeWidth={isMajor ? "2" : "1.6"}
                  />
                  <text
                    x={x}
                    y={zeroY + (tick === 0 ? 24 : 18)}
                    textAnchor="middle"
                    className="fill-slate-200 text-[10px] font-semibold transition-all duration-150 group-hover:fill-cyan-200 group-hover:[filter:drop-shadow(0_0_6px_rgba(34,211,238,0.55))]"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {yTicks.map((tick) => {
              const y = toSvgY(tick, visual.yMin, visual.yMax);
              const isMajor = tick !== 0 && tick % 5 === 0;
              return (
                <g key={`y-${tick}`}>
                  <line
                    x1={zeroX - (isMajor ? 7 : 5)}
                    y1={y}
                    x2={zeroX + (isMajor ? 7 : 5)}
                    y2={y}
                    stroke={isMajor ? "rgba(226,232,240,0.96)" : "rgba(226,232,240,0.88)"}
                    strokeWidth={isMajor ? "2" : "1.6"}
                  />
                  <text
                    x={zeroX - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-slate-200 text-[10px] font-semibold"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            <circle cx={zeroX} cy={zeroY} r="12" fill="rgba(34,211,238,0.08)">
              <animate
                attributeName="r"
                values="8;14;12"
                dur="0.5s"
                begin="0s"
                fill="freeze"
              />
              <animate
                attributeName="opacity"
                values="0.2;0.45;0.18"
                dur="0.5s"
                begin="0s"
                fill="freeze"
              />
            </circle>
            <circle cx={zeroX} cy={zeroY} r="7" fill="none" stroke="rgba(103,232,249,0.72)" strokeWidth="1.8" />
            <circle cx={zeroX} cy={zeroY} r="6" fill="rgba(34,211,238,0.98)" />
            <text x={zeroX + 10} y={zeroY - 10} className="fill-cyan-100 text-[10px] font-semibold">
              (0,0)
            </text>

            {visual.connectPoints && pathPoints.length > 1 ? (
              <>
                <polyline
                  points={closedPolylinePoints}
                  fill="none"
                  stroke="rgba(34,211,238,0.95)"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  markerEnd={visual.movementArrow ? "url(#movementArrow)" : undefined}
                />
              </>
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

            {interactive
              ? xTicks.flatMap((xTick) =>
                  yTicks.map((yTick) => {
                    const px = toSvgX(xTick, visual.xMin, visual.xMax);
                    const py = toSvgY(yTick, visual.yMin, visual.yMax);
                    return (
                      <g key={`pick-${xTick}-${yTick}`} className="group">
                        <circle
                          cx={px}
                          cy={py}
                          r="12"
                          fill="rgba(34,211,238,0.001)"
                          pointerEvents="all"
                          className="cursor-pointer"
                          onPointerDown={(event) => {
                            event.stopPropagation();
                            onPointSelect?.({ x: xTick, y: yTick });
                          }}
                        />
                        <circle
                          cx={px}
                          cy={py}
                          r="4"
                          fill="rgba(148,163,184,0.14)"
                          className="pointer-events-none transition-all duration-150 group-hover:fill-[rgba(103,232,249,0.38)] group-hover:r-[5]"
                        />
                      </g>
                    );
                  })
                )
              : null}

            {selectedPointPosition ? (
              <g>
                <circle cx={selectedPointPosition.px} cy={selectedPointPosition.py} r="18" fill="rgba(34,211,238,0.16)" />
                <circle
                  cx={selectedPointPosition.px}
                  cy={selectedPointPosition.py}
                  r="9"
                  fill="rgba(34,211,238,0.98)"
                  stroke="rgba(207,250,254,0.95)"
                  strokeWidth="2"
                />
              </g>
            ) : null}

            <text
              x={SIZE - PADDING + 8}
              y={zeroY - 8}
              textAnchor="start"
              className="fill-cyan-200/80 text-[11px] font-medium"
            >
              x
            </text>
            <text
              x={zeroX + 8}
              y={PADDING - 6}
              className="fill-cyan-200/80 text-[11px] font-medium"
            >
              y
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}
