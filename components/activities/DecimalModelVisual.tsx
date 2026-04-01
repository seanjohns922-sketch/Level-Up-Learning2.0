"use client";

import type { DecimalVisualData } from "@/data/activities/year2/lessonEngine";

export default function DecimalModelVisual({
  visual,
  title = "Decimal model",
}: {
  visual: DecimalVisualData;
  title?: string;
}) {
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
          <div className="grid gap-1 rounded-2xl bg-white p-3 shadow-sm" style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}>
            {Array.from({ length: 100 }).map((_, index) => (
              <div
                key={index}
                className={[
                  "h-6 rounded-sm border",
                  index < visual.numerator
                    ? "border-teal-300 bg-teal-500"
                    : "border-slate-200 bg-slate-100",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
      ) : null}

      {visual.model === "place_value_chart" ? (
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[
            { label: "Ones", value: visual.ones },
            { label: "Tenths", value: visual.tenths },
            { label: "Hundredths", value: visual.hundredths },
          ].map((column) => (
            <div key={column.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
                {column.label}
              </div>
              <div className="mt-3 text-4xl font-black text-teal-700">{column.value}</div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
