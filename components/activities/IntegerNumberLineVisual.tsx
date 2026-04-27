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

  const markerClass = (value: number) => {
    if (value === visual.start) {
      return "border-amber-700 bg-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.18)]";
    }
    if (value === visual.end || value === visual.target) {
      return "border-sky-700 bg-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.14)]";
    }
    return "border-emerald-700 bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.14)]";
  };

  return (
    <div className="mt-5 rounded-2xl border border-sky-100 bg-gradient-to-r from-slate-100 via-white to-sky-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">{title}</div>
      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="relative px-5 pt-12 pb-10">
          <div className="absolute left-5 right-5 top-[3.15rem] h-1 rounded-full bg-gradient-to-r from-slate-500 via-slate-400 to-sky-400" />
          <div className="absolute left-5 top-[2.75rem] h-8 w-[1px] bg-slate-500/30" />
          <div className="absolute right-5 top-[2.75rem] h-8 w-[1px] bg-sky-400/30" />

          {arrowLeft !== null && arrowWidth !== null && visual.showArrow ? (
            <div
              className="absolute top-5 h-1.5 rounded-full bg-amber-400"
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

          {targetPosition !== null ? (
            <div
              className="absolute top-2 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `calc(20px + ${targetPosition}% * (100% - 40px) / 100)` }}
            >
              <div className={["h-4 w-4 rounded-full border-2", markerClass(visual.target!)].join(" ")} />
              <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">
                point
              </div>
            </div>
          ) : null}

          {highlights
            .filter((value) => value !== visual.target)
            .map((value) => (
              <div
                key={`highlight-${value}`}
                className="absolute top-2 flex -translate-x-1/2 flex-col items-center"
                style={{ left: `calc(20px + ${positionPercent(value)}% * (100% - 40px) / 100)` }}
              >
                <div className={["h-4 w-4 rounded-full border-2", markerClass(value)].join(" ")} />
              </div>
            ))}

          {visual.start !== undefined && visual.end !== undefined && visual.start !== visual.end ? (
            <>
              <div
                className="absolute top-2 flex -translate-x-1/2 flex-col items-center"
                style={{ left: `calc(20px + ${startPosition}% * (100% - 40px) / 100)` }}
              >
                <div className={["h-4 w-4 rounded-full border-2", markerClass(visual.start)].join(" ")} />
              </div>
              <div
                className="absolute top-2 flex -translate-x-1/2 flex-col items-center"
                style={{ left: `calc(20px + ${endPosition}% * (100% - 40px) / 100)` }}
              >
                <div className={["h-4 w-4 rounded-full border-2", markerClass(visual.end)].join(" ")} />
              </div>
            </>
          ) : null}

          <div className="relative h-16">
            {ticks.map((tick) => (
              <div
                key={tick}
                className="absolute top-6 -translate-x-1/2"
                style={{ left: `calc(20px + ${positionPercent(tick)}% * (100% - 40px) / 100)` }}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={[
                      "w-0.5 rounded-full",
                      tick === 0 ? "h-8 bg-slate-900 shadow-[0_0_10px_rgba(15,23,42,0.18)]" : "h-5 bg-slate-400",
                    ].join(" ")}
                  />
                  <div
                    className={[
                      "mt-2 min-w-[1.2rem] text-center text-sm font-black",
                      tick === 0
                        ? "text-slate-900"
                        : tick < 0
                          ? "text-slate-600"
                          : "text-sky-700",
                    ].join(" ")}
                  >
                    {tick}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
