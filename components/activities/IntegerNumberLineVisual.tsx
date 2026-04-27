"use client";

import type { IntegerNumberLineVisualData } from "@/data/activities/year2/lessonEngine";

export default function IntegerNumberLineVisual({
  visual,
  title = "Number line",
}: {
  visual: IntegerNumberLineVisualData;
  title?: string;
}) {
  const ticks = Array.from(
    { length: visual.max - visual.min + 1 },
    (_, index) => visual.min + index
  );
  const span = visual.max - visual.min || 1;
  const positionPercent = (value: number) => ((value - visual.min) / span) * 100;
  const targetPosition = typeof visual.target === "number" ? positionPercent(visual.target) : null;
  const highlights = visual.highlights ?? [];
  const startPosition = typeof visual.start === "number" ? positionPercent(visual.start) : null;
  const endPosition = typeof visual.end === "number" ? positionPercent(visual.end) : null;
  const arrowLeft =
    startPosition !== null && endPosition !== null ? Math.min(startPosition, endPosition) : null;
  const arrowWidth =
    startPosition !== null && endPosition !== null ? Math.abs(endPosition - startPosition) : null;
  const arrowPointsRight =
    startPosition !== null && endPosition !== null ? endPosition >= startPosition : true;
  const leftStyle = (value: number) => `calc(20px + ${positionPercent(value)}% * (100% - 40px) / 100)`;

  const markerClass = (value: number) => {
    if (value === visual.start) {
      return "border-amber-700 bg-amber-400 shadow-[0_0_0_6px_rgba(251,191,36,0.14)]";
    }
    if (value === visual.end || value === visual.target) {
      return "border-sky-700 bg-sky-500 shadow-[0_0_0_8px_rgba(14,165,233,0.12)]";
    }
    return "border-slate-500 bg-white shadow-[0_0_0_6px_rgba(148,163,184,0.12)]";
  };

  return (
    <div className="mt-5 rounded-[28px] border border-sky-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(239,246,255,0.92)_55%,_rgba(224,242,254,0.9))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">{title}</div>
      <div className="mt-4 rounded-[30px] bg-white px-6 py-7 shadow-[0_12px_28px_rgba(15,23,42,0.08)]">
        <div className="relative px-5 pt-7 pb-10">
          <div className="absolute left-5 top-[2.5rem] h-6 w-[calc(50%-20px)] rounded-l-full bg-gradient-to-r from-slate-200/80 via-slate-200/55 to-slate-300/15" />
          <div className="absolute right-5 top-[2.5rem] h-6 w-[calc(50%-20px)] rounded-r-full bg-gradient-to-r from-sky-200/15 via-sky-200/45 to-sky-200/75" />
          <div className="absolute left-5 right-5 top-[3.15rem] h-[3px] rounded-full bg-gradient-to-r from-slate-700 via-slate-500 to-sky-500" />
          <div className="absolute left-5 right-5 top-[3.15rem] h-[3px] rounded-full bg-white/20 blur-[1px]" />

          {arrowLeft !== null && arrowWidth !== null && visual.showArrow ? (
            <div
              className="absolute top-[1.45rem] h-1.5 rounded-full bg-amber-400/90 shadow-[0_0_14px_rgba(251,191,36,0.45)]"
              style={{
                left: `calc(20px + ${arrowLeft}% * (100% - 40px) / 100)`,
                width: `calc(${arrowWidth}% * (100% - 40px) / 100)`,
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

          <div className="relative h-16">
            {ticks.map((tick) => (
              <div
                key={tick}
                className="absolute top-4 -translate-x-1/2"
                style={{ left: leftStyle(tick) }}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={[
                      "rounded-full",
                      tick === 0
                        ? "h-10 w-[3px] bg-slate-950 shadow-[0_0_14px_rgba(15,23,42,0.18)]"
                        : tick % 5 === 0
                          ? "h-7 w-[2px] bg-slate-500"
                          : "h-6 w-[2px] bg-slate-400",
                    ].join(" ")}
                  />
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
                </div>
              </div>
            ))}

            {highlights
              .filter((value) => value !== visual.target && value !== visual.start && value !== visual.end)
              .map((value) => (
                <div
                  key={`highlight-${value}`}
                  className="absolute top-[1.05rem] z-10 -translate-x-1/2"
                  style={{ left: leftStyle(value) }}
                >
                  <div className="h-5 w-5 rounded-full border-2 border-slate-400/55 bg-white/75 backdrop-blur-[1px]" />
                </div>
              ))}

            {visual.start !== undefined ? (
              <div
                className="absolute top-[1.05rem] z-10 -translate-x-1/2"
                style={{ left: leftStyle(visual.start) }}
              >
                <div className={["h-5 w-5 rounded-full border-2", markerClass(visual.start)].join(" ")} />
              </div>
            ) : null}

            {visual.end !== undefined ? (
              <div
                className="absolute top-[1.05rem] z-10 -translate-x-1/2"
                style={{ left: leftStyle(visual.end) }}
              >
                <div
                  className={[
                    "h-5 w-5 rounded-full border-2 animate-pulse",
                    markerClass(visual.end),
                  ].join(" ")}
                />
              </div>
            ) : null}

            {targetPosition !== null ? (
              <div
                className="absolute top-[1.05rem] z-10 -translate-x-1/2"
                style={{ left: leftStyle(visual.target!) }}
              >
                <div
                  className={[
                    "h-5 w-5 rounded-full border-2 animate-pulse",
                    markerClass(visual.target!),
                  ].join(" ")}
                />
              </div>
            ) : null}

            {ticks.map((tick) => (
              <div
                key={`overlay-${tick}`}
                className="absolute top-4 z-20 -translate-x-1/2"
                style={{ left: leftStyle(tick) }}
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
