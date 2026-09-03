"use client";

import { useState } from "react";

export default function ArrayVisual({
  rows,
  cols,
  highlightedRows,
  title = "Grouped set model",
  rotatable = false,
}: {
  rows: number;
  cols: number;
  highlightedRows?: number[];
  title?: string;
  rotatable?: boolean;
}) {
  const [turned, setTurned] = useState(false);
  const highlighted = new Set(highlightedRows ?? []);
  const displayRows = turned ? cols : rows;
  const displayCols = turned ? rows : cols;

  return (
    <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
          {title}
        </div>
        {rotatable ? (
          <button
            type="button"
            onClick={() => setTurned((current) => !current)}
            aria-pressed={turned}
            className="rounded-xl border border-teal-300 bg-white px-4 py-2 text-sm font-black text-teal-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200"
          >
            ↻ Turn array
          </button>
        ) : null}
      </div>
      <div
        key={`${displayRows}-${displayCols}`}
        className="inline-flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm transition-all duration-300"
      >
        {Array.from({ length: displayRows }).map((_, r) => {
          const isHighlighted = highlighted.has(r);
          return (
            <div
              key={r}
              className={[
                "flex gap-2 rounded-xl px-2 py-1 transition",
                isHighlighted ? "bg-amber-100 ring-2 ring-amber-300" : "bg-slate-50",
              ].join(" ")}
            >
              {Array.from({ length: displayCols }).map((__, c) => (
                <div
                  key={`${r}-${c}`}
                  className={[
                    "h-5 w-5 rounded-full",
                    isHighlighted ? "bg-amber-500" : "bg-teal-600",
                  ].join(" ")}
                />
              ))}
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-sm font-bold text-teal-800" aria-live="polite">
        {displayRows} rows of {displayCols} = {displayRows * displayCols}
        {rotatable ? (turned ? " — turned" : " — original") : null}
      </div>
    </div>
  );
}
