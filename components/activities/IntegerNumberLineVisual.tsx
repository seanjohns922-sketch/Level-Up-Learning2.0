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
  const targetPosition = ((visual.target - visual.min) / span) * 100;

  return (
    <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">{title}</div>
      <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="relative px-3 pt-8 pb-7">
          <div className="absolute left-3 right-3 top-10 h-1 rounded-full bg-sky-300" />
          <div
            className="absolute top-1 flex -translate-x-1/2 flex-col items-center"
            style={{ left: `calc(12px + (${targetPosition}% * (100% - 24px) / 100))` }}
          >
            <div className="h-4 w-4 rounded-full border-2 border-sky-700 bg-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.14)]" />
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">
              point
            </div>
          </div>
          <div className="relative flex items-end justify-between gap-1">
            {ticks.map((tick) => (
              <div key={tick} className="flex min-w-0 flex-1 flex-col items-center">
                <div
                  className={[
                    "w-0.5 rounded-full",
                    tick === 0 ? "h-7 bg-slate-900" : "h-5 bg-slate-400",
                  ].join(" ")}
                />
                <div
                  className={[
                    "mt-2 text-sm font-black",
                    tick === 0 ? "text-slate-900" : "text-slate-600",
                  ].join(" ")}
                >
                  {tick}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
