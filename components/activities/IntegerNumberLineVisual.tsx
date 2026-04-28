"use client";

import type { IntegerNumberLineVisualData } from "@/data/activities/year2/lessonEngine";

export default function IntegerNumberLineVisual({
  visual,
  title = "Number line",
}: {
  visual: IntegerNumberLineVisualData;
  title?: string;
}) {
  const min = visual.min ?? -10;
  const max = visual.max ?? 10;
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);

  const clampValue = (value: number) => Math.min(safeMax, Math.max(safeMin, value));
  const getPercent = (value: number) => {
    const clamped = clampValue(value);
    return ((clamped - safeMin) / (safeMax - safeMin || 1)) * 100;
  };

  const ticks = Array.from(
    { length: safeMax - safeMin + 1 },
    (_, i) => safeMin + i
  );

  const markerValue =
    typeof visual.markerValue === "number"
      ? clampValue(visual.markerValue)
      : typeof visual.target === "number"
        ? clampValue(visual.target)
        : undefined;

  const highlightedValues = (visual.highlightedValues ?? visual.highlights ?? []).map(clampValue);

  const startValue =
    typeof visual.startValue === "number"
      ? clampValue(visual.startValue)
      : typeof visual.start === "number"
        ? clampValue(visual.start)
        : undefined;

  const movement =
    typeof visual.movement === "number"
      ? visual.movement
      : typeof visual.jump === "number"
        ? visual.jump
        : undefined;

  const endValue =
    typeof visual.end === "number"
      ? clampValue(visual.end)
      : startValue !== undefined && typeof movement === "number"
        ? clampValue(startValue + movement)
        : undefined;

  if (
    markerValue === undefined &&
    highlightedValues.length === 0 &&
    startValue === undefined &&
    endValue === undefined
  ) {
    console.warn("Invalid number line data", visual);
    return null;
  }

  const labelStep = ticks.length <= 13 ? 1 : ticks.length <= 25 ? 2 : 2;
  const showDenseEndpoints = ticks.length <= 25;
  const shouldLabel = (tick: number) => {
    if (tick === 0) return true;
    if (labelStep === 1) return true;
    if ((tick - safeMin) % labelStep === 0) return true;
    if (showDenseEndpoints && (tick === safeMin || tick === safeMax)) return true;
    return false;
  };

  const arrowLeft =
    startValue !== undefined && endValue !== undefined
      ? Math.min(getPercent(startValue), getPercent(endValue))
      : undefined;
  const arrowWidth =
    startValue !== undefined && endValue !== undefined
      ? Math.abs(getPercent(endValue) - getPercent(startValue))
      : undefined;
  const arrowPointsRight =
    startValue !== undefined && endValue !== undefined ? endValue >= startValue : true;

  const renderMarker = (
    value: number,
    tone: "target" | "highlight" | "start" | "end"
  ) => {
    const classes =
      tone === "highlight"
        ? "border-slate-400 bg-white shadow-[0_0_0_6px_rgba(148,163,184,0.12)]"
        : tone === "start"
          ? "border-amber-700 bg-amber-400 shadow-[0_0_0_7px_rgba(251,191,36,0.14)]"
          : "border-sky-700 bg-sky-500 shadow-[0_0_0_8px_rgba(14,165,233,0.14)]";

    return (
      <div
        key={`${tone}-${value}`}
        className="absolute z-10"
        style={{
          left: `${getPercent(value)}%`,
          transform: "translateX(-50%)",
          top: "12px",
        }}
      >
        <div className={`h-5 w-5 rounded-full border-2 ${classes}`} />
      </div>
    );
  };

  return (
    <div className="mt-5 rounded-[28px] border border-sky-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(239,246,255,0.92)_55%,_rgba(224,242,254,0.9))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">{title}</div>
      <div className="mt-4 rounded-[30px] bg-white px-8 py-8 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
        <div className="relative h-[140px]">
          <div className="absolute left-0 top-[40px] h-7 w-1/2 rounded-l-full bg-gradient-to-r from-slate-200/70 via-slate-200/35 to-transparent" />
          <div className="absolute right-0 top-[40px] h-7 w-1/2 rounded-r-full bg-gradient-to-r from-transparent via-sky-200/30 to-sky-200/65" />

          <div className="absolute left-0 right-0 top-[48px] h-[3px] bg-slate-800" />
          <div className="absolute left-[-1px] top-[42px] h-0 w-0 border-y-[7px] border-y-transparent border-r-[11px] border-r-slate-800" />
          <div className="absolute right-[-1px] top-[42px] h-0 w-0 border-y-[7px] border-y-transparent border-l-[11px] border-l-slate-800" />

          {arrowLeft !== undefined && arrowWidth !== undefined && visual.showArrow ? (
            <div
              className="absolute top-[18px] z-0 h-1.5 rounded-full bg-amber-400/95 shadow-[0_0_14px_rgba(251,191,36,0.45)]"
              style={{
                left: `${arrowLeft}%`,
                width: `${arrowWidth}%`,
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

          {highlightedValues
            .filter((value) => value !== markerValue && value !== startValue && value !== endValue)
            .map((value) => renderMarker(value, "highlight"))}

          {startValue !== undefined ? renderMarker(startValue, "start") : null}
          {endValue !== undefined ? renderMarker(endValue, "end") : null}
          {markerValue !== undefined ? renderMarker(markerValue, "target") : null}

          {ticks.map((tick) => (
            <div
              key={tick}
              className="absolute top-[40px] z-20 w-px text-center"
              style={{
                left: `${getPercent(tick)}%`,
                transform: "translateX(-50%)",
              }}
            >
              <div
                className={[
                  "mx-auto rounded-full",
                  tick === 0
                    ? "h-7 w-[3px] bg-slate-950 shadow-[0_0_14px_rgba(14,165,233,0.18)]"
                    : tick % 5 === 0
                      ? "h-5 w-[2px] bg-slate-500"
                      : "h-[18px] w-[2px] bg-slate-400",
                ].join(" ")}
              />
              {shouldLabel(tick) ? (
                <div
                  className={[
                    "mt-2 -translate-x-1/2 whitespace-nowrap text-center tabular-nums",
                    tick === 0
                      ? "text-[18px] font-extrabold text-slate-950"
                      : tick < 0
                        ? "text-[14px] font-bold text-slate-600"
                        : "text-[14px] font-bold text-sky-700/95",
                  ].join(" ")}
                  style={{ marginLeft: "0.5px" }}
                >
                  {tick}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
