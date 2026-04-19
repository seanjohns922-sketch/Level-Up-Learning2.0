"use client";

import type { DecimalVisualData } from "@/data/activities/year2/lessonEngine";

export default function DecimalModelVisual({
  visual,
  title = "Decimal model",
}: {
  visual: DecimalVisualData;
  title?: string;
}) {
  const fullTenthsColumns =
    visual.model === "hundredths_grid" ? Math.floor(visual.numerator / 10) : 0;
  const extraHundredths =
    visual.model === "hundredths_grid" ? visual.numerator % 10 : 0;

  return (
    <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
        {title}
      </div>

      {visual.model === "tenths_bar" ? (
        <div className="mt-3">
          <div className="grid gap-1 rounded-2xl bg-white p-3 shadow-sm" style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}>
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className={[
                  "h-16 rounded-md border",
                  index < visual.numerator
                    ? "border-teal-300 bg-teal-500"
                    : "border-slate-200 bg-slate-100",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      ) : null}

      {visual.model === "hundredths_grid" ? (
        <div className="mt-3">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <div className="space-y-1.5">
              {Array.from({ length: 10 }).map((_, rowIndex) => {
                return (
                  <div
                    key={rowIndex}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-1"
                  >
                    <div
                      className="grid gap-1"
                      style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}
                    >
                      {Array.from({ length: 10 }).map((__, columnIndex) => (
                        <div
                          key={`${rowIndex}-${columnIndex}`}
                          className={[
                            "h-6 rounded-sm border",
                            columnIndex < fullTenthsColumns ||
                            (columnIndex === fullTenthsColumns && rowIndex < extraHundredths)
                              ? "border-teal-300 bg-teal-500"
                              : "border-slate-200 bg-slate-100",
                          ].join(" ")}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-3 text-sm font-medium text-teal-800">
            {fullTenthsColumns} tenths and {extraHundredths} hundredths
          </div>
          <div className="mt-1 text-xs text-teal-700">
            Each full column shows 1 tenth. Each small square shows 1 hundredth.
          </div>
        </div>
      ) : null}

      {visual.model === "place_value_chart" ? (
        <div className="mt-3 grid gap-2.5 md:grid-cols-4">
          {[
            { label: "Ones", value: visual.ones },
            { label: "Tenths", value: visual.tenths },
            { label: "Hundredths", value: visual.hundredths },
            { label: "Thousandths", value: visual.thousandths ?? 0 },
          ].map((column) => (
            <div
              key={column.label}
              className="relative rounded-xl border border-teal-100 bg-white px-4 py-3"
            >
              <div className="text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-slate-400">
                {column.label}
              </div>
              <div className="mt-1.5 text-[2.6rem] leading-none font-black text-teal-700 tabular-nums">
                {column.value}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
