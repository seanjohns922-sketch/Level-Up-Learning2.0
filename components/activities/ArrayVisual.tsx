"use client";

import { useState } from "react";

export default function ArrayVisual({
  rows,
  cols,
  highlightedRows,
  title = "Grouped set model",
  rotatable = false,
  splitAfterColumns,
}: {
  rows: number;
  cols: number;
  highlightedRows?: number[];
  title?: string;
  rotatable?: boolean;
  splitAfterColumns?: number;
}) {
  const [turned, setTurned] = useState(false);
  const [selectedPart, setSelectedPart] = useState<"left" | "right" | null>(null);
  const highlighted = new Set(highlightedRows ?? []);
  const displayRows = turned ? cols : rows;
  const displayCols = turned ? rows : cols;
  const hasSplit = !turned
    && splitAfterColumns != null
    && splitAfterColumns > 0
    && splitAfterColumns < displayCols;
  const rightColumns = hasSplit ? displayCols - splitAfterColumns : 0;

  function partition(part: "left" | "right", columns: number) {
    const selected = selectedPart === part;
    const dimmed = selectedPart != null && !selected;
    const colour = part === "left" ? "bg-teal-600" : "bg-violet-500";
    return (
      <button
        type="button"
        onClick={() => setSelectedPart((current) => current === part ? null : part)}
        aria-pressed={selected}
        aria-label={`Select the ${part === "left" ? "teal" : "violet"} ${displayRows} by ${columns} section`}
        className={[
          "rounded-2xl border-2 bg-white p-3 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200",
          selected ? "scale-[1.02] border-violet-400 shadow-md" : "border-transparent hover:border-teal-200",
          dimmed ? "opacity-45" : "opacity-100",
        ].join(" ")}
      >
        <span className="flex flex-col gap-2">
          {Array.from({ length: displayRows }).map((_, r) => (
            <span key={r} className="flex gap-2 rounded-lg bg-slate-50 px-2 py-1">
              {Array.from({ length: columns }).map((__, c) => (
                <span key={`${r}-${c}`} className={`h-5 w-5 rounded-full ${colour}`} />
              ))}
            </span>
          ))}
        </span>
        <span className={`mt-3 block text-sm font-black ${part === "left" ? "text-teal-800" : "text-violet-800"}`}>
          {displayRows} × {columns}
        </span>
      </button>
    );
  }

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
      {hasSplit ? (
        <div className="flex flex-wrap items-stretch gap-4" aria-label={`${displayRows} by ${displayCols} array split after 10 columns`}>
          {partition("left", splitAfterColumns)}
          {partition("right", rightColumns)}
        </div>
      ) : (
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
      )}
      <div className="mt-3 text-sm font-bold text-teal-800" aria-live="polite">
        {displayRows} rows of {displayCols} = {displayRows * displayCols}
        {rotatable ? (turned ? " — turned" : " — original") : null}
      </div>
      {hasSplit ? (
        <div className="mt-3">
          <div className="inline-flex flex-wrap items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-base font-black text-white">
            <span>{displayRows} × {displayCols}</span>
            <span className="text-cyan-300">=</span>
            <span className="text-teal-300">({displayRows} × {splitAfterColumns})</span>
            <span className="text-cyan-300">+</span>
            <span className="text-violet-300">({displayRows} × {rightColumns})</span>
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-600" aria-live="polite">
            {selectedPart === "left"
              ? `Teal section selected: ${displayRows} rows × ${splitAfterColumns} columns.`
              : selectedPart === "right"
                ? `Violet section selected: ${displayRows} rows × ${rightColumns} columns.`
                : "Tap either coloured section to isolate that partial product."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
