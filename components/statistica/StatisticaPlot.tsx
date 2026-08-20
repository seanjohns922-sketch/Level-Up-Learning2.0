"use client";

import type { ReactNode } from "react";
import DataIcon from "@/components/statistica/DataIcon";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";

export type PlotCat = { id: string; label: string; color: string; count: number };

type Props = {
  categories: PlotCat[];
  display: "objects" | "pictures" | "columns";
  // Override each column's height (e.g. build mode); defaults to its count.
  values?: number[];
  // When provided, each whole column is a big tap target.
  onColumnClick?: (id: string, index: number) => void;
  selectedIds?: string[];
  statusById?: Record<string, "correct" | "wrong">;
  // Rendered under each column label (e.g. +/- build controls).
  footer?: (cat: PlotCat, index: number) => ReactNode;
  // Override individual cells (e.g. tappable "extra" marks for the gap task).
  cell?: (cat: PlotCat, cellIndex: number, colIndex: number, cellSize: number) => ReactNode;
  labelReadAloud?: boolean;
};

// The shared premium data-plot used by every Statistica graph card: column
// tracks, a grounded baseline, interval gridlines and adaptive cell sizing so
// small data gets big icons and tall columns still fit.
export default function StatisticaPlot({ categories, display, values, onColumnClick, selectedIds = [], statusById = {}, footer, cell, labelReadAloud = true }: Props) {
  const heights = categories.map((c, i) => values?.[i] ?? c.count);
  const rows = Math.max(1, ...categories.map((c) => c.count), ...heights);
  const unit = Math.max(14, Math.min(34, Math.floor(360 / rows)));
  const cellGap = Math.max(2, Math.min(6, Math.round(unit * 0.16)));
  const cellSize = unit - cellGap;
  const plotH = rows * unit;
  const isColumns = display === "columns";
  const colWidth = isColumns ? Math.min(64, cellSize + 40) : cellSize + 22;
  const AXIS = 24;
  const COL_GAP = 20; // fixed spacing between columns, so every graph matches
  const step = rows <= 6 ? 1 : rows <= 12 ? 2 : 5;
  const stops: number[] = [];
  for (let v = step; v <= rows; v += step) stops.push(v);
  if (stops[stops.length - 1] !== rows) stops.push(rows);
  const cellShape = display === "pictures" ? "rounded-full" : "rounded-[3px]";

  const defaultCell = (cat: PlotCat, key: number) =>
    display === "pictures" ? (
      <div key={key} className="grid place-items-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" style={{ height: cellSize, width: cellSize }}><DataIcon name={cat.label} color={cat.color} size={cellSize} /></div>
    ) : (
      <div key={key} className={`${cellShape} shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]`} style={{ height: cellSize, width: cellSize, background: cat.color }} />
    );

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[#f2bc45]/35 bg-gradient-to-b from-[#1c3226] to-[#101d15] p-4 pt-3 shadow-[inset_0_1px_0_rgba(255,240,199,0.14),0_12px_32px_rgba(0,0,0,0.32)]">
      <div className="relative mx-auto" style={{ height: plotH }}>
        {stops.map((v) => (
          <div key={v} className="pointer-events-none absolute right-0 flex items-center" style={{ left: AXIS, bottom: v * unit }}>
            <span className="absolute -translate-x-full -translate-y-1/2 pr-1.5 text-right text-[9px] font-black tabular-nums text-[#f2bc45]/60" style={{ left: 0 }}>{v}</span>
            <div className="h-px w-full" style={{ borderTop: "1px dashed rgba(242,188,69,0.16)" }} />
          </div>
        ))}
        <div className="absolute bottom-0 h-[2px] rounded-full bg-[#f2bc45]/40" style={{ left: AXIS - 4, right: 0 }} />

        <div className="absolute bottom-0 flex items-end justify-center" style={{ left: AXIS, right: 0, height: plotH, gap: COL_GAP }}>
          {categories.map((cat, i) => {
            const value = heights[i]!;
            const status = statusById[cat.id];
            const selected = selectedIds.includes(cat.id);
            const shadow = status === "correct" ? "0 0 0 3px #34d399" : status === "wrong" ? "0 0 0 3px #f87171" : selected ? `0 0 0 3px ${cat.color}` : `inset 0 -3px 0 ${cat.color}66`;
            const track = (
              <div className={`relative flex h-full w-full flex-col-reverse items-center overflow-hidden rounded-t-lg ${isColumns ? "" : "pt-1"}`} style={{ gap: isColumns ? 0 : cellGap, background: `${cat.color}14` }}>
                {isColumns ? (
                  <div className="w-full rounded-t-md shadow-[inset_0_2px_0_rgba(255,255,255,0.28)]" style={{ height: value * unit, background: `linear-gradient(to top, ${cat.color}, ${cat.color}cc)` }} />
                ) : (
                  Array.from({ length: value }, (_, r) => (cell ? cell(cat, r, i, cellSize) : defaultCell(cat, r)))
                )}
              </div>
            );
            return onColumnClick ? (
              <button key={cat.id} type="button" onClick={() => onColumnClick(cat.id, i)} aria-pressed={selected} className="rounded-t-lg transition active:scale-[0.98]" style={{ height: plotH, width: colWidth, boxShadow: shadow }}>{track}</button>
            ) : (
              <div key={cat.id} className="rounded-t-lg" style={{ height: plotH, width: colWidth, boxShadow: shadow }}>{track}</div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center" style={{ paddingLeft: AXIS, gap: COL_GAP }}>
        {categories.map((cat, i) => (
          <div key={cat.id} className="flex flex-col items-center" style={{ width: colWidth }}>
            <div className="mt-2 flex items-center gap-1 text-center text-[11px] font-bold leading-tight text-white/90">
              <span className="max-w-[68px]">{cat.label}</span>
              {labelReadAloud ? <OptionReadAloudButton text={cat.label} /> : null}
            </div>
            {footer ? footer(cat, i) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
