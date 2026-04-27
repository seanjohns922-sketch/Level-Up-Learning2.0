"use client";

import type { IntegerNumberLineVisualData } from "@/data/activities/year2/lessonEngine";

export default function IntegerNumberLineVisual({
  visual,
  title = "Number line",
}: {
  visual: IntegerNumberLineVisualData;
  title?: string;
}) {
  const min = Number.isFinite(visual.min) ? Number(visual.min) : -10;
  const max = Number.isFinite(visual.max) ? Number(visual.max) : 10;
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);
  const span = safeMax - safeMin || 1;
  const clamp = (value: number) => Math.min(safeMax, Math.max(safeMin, value));
  const getPercent = (value: number) => ((clamp(value) - safeMin) / span) * 100;

  const markerValue =
    typeof visual.markerValue === "number"
      ? clamp(visual.markerValue)
      : typeof visual.target === "number"
        ? clamp(visual.target)
        : undefined;
  const highlightedValues = (visual.highlightedValues ?? visual.highlights ?? []).map(clamp);
  const startValue =
    typeof visual.startValue === "number"
      ? clamp(visual.startValue)
      : typeof visual.start === "number"
        ? clamp(visual.start)
        : undefined;
  const movement =
    typeof visual.movement === "number"
      ? visual.movement
      : typeof visual.jump === "number"
        ? visual.jump
        : undefined;
  const endValue =
    typeof visual.end === "number"
      ? clamp(visual.end)
      : startValue !== undefined && typeof movement === "number"
        ? clamp(startValue + movement)
        : undefined;

  const hasRenderableData =
    markerValue !== undefined ||
    highlightedValues.length > 0 ||
    startValue !== undefined ||
    endValue !== undefined;

  if (!hasRenderableData) {
    console.warn("Invalid number line data", visual);
    return null;
  }

  const ticks = Array.from(
    { length: safeMax - safeMin + 1 },
    (_, index) => safeMin + index
  );
  const showEveryTickLabel = ticks.length <= 13;
  const shouldLabelTick = (tick: number) =>
    tick === 0 || showEveryTickLabel || tick === safeMin || tick === safeMax || tick % 2 === 0;

  const axisLeft = 28;
  const axisRight = 28;
  const leftStyle = (value: number) =>
    `calc(${axisLeft}px + ${getPercent(value)}% * (100% - ${axisLeft + axisRight}px) / 100)`;
  const arrowLeft =
    startValue !== undefined && endValue !== undefined
      ? Math.min(getPercent(startValue), getPercent(endValue))
      : null;
  const arrowWidth =
    startValue !== undefined && endValue !== undefined
      ? Math.abs(getPercent(endValue) - getPercent(startValue))
      : null;
  const arrowPointsRight =
    startValue !== undefined && endValue !== undefined ? endValue >= startValue : true;

  const resolvedTitle =
    title ??
    (visual.emphasis === "movement"
      ? "Integer movement"
      : visual.emphasis === "distance"
        ? "Distance from zero"
        : visual.emphasis === "compare"
          ? "Integer comparison"
          : "Number line position");

  const renderMarker = (
    value: number,
    tone: "target" | "highlight" | "start" | "end"
  ) => {
    const baseClass =
      tone === "start"
        ? "border-amber-700 bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.16)]"
        : tone === "highlight"
          ? "border-slate-500 bg-white shadow-[0_0_0_6px_rgba(148,163,184,0.14)]"
          : "border-sky-700 bg-sky-500 shadow-[0_0_0_8px_rgba(14,165,233,0.16)]";

    return (
      <div
        key={`${tone}-${value}`}
        className="absolute z-10 -translate-x-1/2"
        style={{ left: leftStyle(value), top: "0.55rem" }}
      >
        <div className={`h-5 w-5 rounded-full border-2 ${baseClass}`} />
      </div>
    );
  };

  return (
    <div className="mt-5 rounded-[28px] border border-sky-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(239,246,255,0.92)_55%,_rgba(224,242,254,0.9))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
        {resolvedTitle}
      </div>
      <div className="mt-4 rounded-[30px] bg-white px-6 py-7 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
        <div className="relative px-6 pt-6 pb-12">
          <div className="absolute left-7 top-[2.15rem] h-8 w-[calc(50%-28px)] rounded-l-full bg-gradient-to-r from-slate-200/65 via-slate-200/35 to-transparent" />
          <div className="absolute right-7 top-[2.15rem] h-8 w-[calc(50%-28px)] rounded-r-full bg-gradient-to-r from-transparent via-sky-200/30 to-sky-200/65" />
          <div className="absolute left-7 right-7 top-[2.95rem] h-[2px] bg-slate-800" />
          <div className="absolute left-[18px] top-[2.55rem] h-0 w-0 border-y-[6px] border-y-transparent border-r-[10px] border-r-slate-800" />
          <div className="absolute right-[18px] top-[2.55rem] h-0 w-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-slate-800" />

          {arrowLeft !== null && arrowWidth !== null && visual.showArrow ? (
            <div
              className="absolute top-[1.55rem] h-1.5 rounded-full bg-amber-400/90 shadow-[0_0_14px_rgba(251,191,36,0.45)]"
              style={{
                left: `calc(${axisLeft}px + ${arrowLeft}% * (100% - ${axisLeft + axisRight}px) / 100)`,
                width: `calc(${arrowWidth}% * (100% - ${axisLeft + axisRight}px) / 100)`,
              }}
            >
              <div
                className={[
                  "absolute top-1/2 h-0 w-0 -translate-y-1/2 border-y-[7px] border-y-transparent",
                  arrowPointsRight
                    ? "right-[-8px] border-l-[10px] border-l-amber-500"
                    : "left-[-8px] border-r-[10px] border-r-amber-500",
                ].join(" ")}
              />
            </div>
          ) : null}

          <div className="relative h-24">
            {ticks.map((tick) => (
              <div
                key={tick}
                className="absolute -translate-x-1/2"
                style={{ left: leftStyle(tick) }}
              >
                <div className="flex flex-col items-center" style={{ marginTop: "1.55rem" }}>
                  <div
                    className={[
                      "rounded-full",
                      tick === 0
                        ? "h-10 w-[3px] bg-slate-950 shadow-[0_0_18px_rgba(14,165,233,0.2)]"
                        : tick % 5 === 0
                          ? "h-7 w-[2px] bg-slate-500"
                          : "h-6 w-[2px] bg-slate-400",
                    ].join(" ")}
                  />
                  {shouldLabelTick(tick) ? (
                    <div
                      className={[
                        "mt-2 min-w-[1.4rem] text-center text-sm font-black tabular-nums",
                        tick === 0
                          ? "text-slate-950"
                          : tick < 0
                            ? "text-slate-600"
                            : "text-sky-700/95",
                      ].join(" ")}
                    >
                      {tick}
                    </div>
                  ) : (
                    <div className="mt-2 h-5" />
                  )}
                </div>
              </div>
            ))}

            {highlightedValues
              .filter((value) => value !== markerValue && value !== startValue && value !== endValue)
              .map((value) => renderMarker(value, "highlight"))}

            {startValue !== undefined ? renderMarker(startValue, "start") : null}
            {endValue !== undefined ? renderMarker(endValue, "end") : null}
            {markerValue !== undefined ? renderMarker(markerValue, "target") : null}

            {ticks.map((tick) => (
              <div
                key={`overlay-${tick}`}
                className="absolute z-20 -translate-x-1/2"
                style={{ left: leftStyle(tick), top: "1.55rem" }}
              >
                <div
                  className={[
                    "rounded-full",
                    tick === 0
                      ? "h-10 w-[3px] bg-slate-950"
                      : tick % 5 === 0
                        ? "h-7 w-[2px] bg-slate-500"
                        : "h-6 w-[2px] bg-slate-400",
                  ].join(" ")}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
