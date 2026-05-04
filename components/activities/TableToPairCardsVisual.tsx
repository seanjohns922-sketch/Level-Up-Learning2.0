"use client";

import { MathFormattedText } from "@/components/FractionText";
import type { TableToPairCardsVisualData } from "@/data/activities/year2/lessonEngine";

export default function TableToPairCardsVisual({
  visual,
}: {
  visual: TableToPairCardsVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
        {visual.title}
      </div>
      {visual.pairs && visual.pairs.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-900 text-center text-[10px] font-extrabold uppercase tracking-[0.18em] text-cyan-200">
            <div className="px-4 py-3">Input (x)</div>
            <div className="border-l border-slate-700 px-4 py-3">Output (y)</div>
          </div>
          {visual.pairs.map((pair, index) => {
            const isHighlighted =
              pair.input === visual.highlighted.input && pair.output === visual.highlighted.output;
            return (
              <div key={`${pair.input}-${pair.output}-${index}`} className="grid grid-cols-2 text-center">
                <div
                  className={[
                    "px-4 py-4 text-2xl font-black",
                    isHighlighted ? "bg-cyan-50 text-cyan-700" : "text-slate-900",
                  ].join(" ")}
                >
                  <MathFormattedText text={pair.input} />
                </div>
                <div
                  className={[
                    "border-l px-4 py-4 text-2xl font-black",
                    isHighlighted ? "bg-cyan-50 text-cyan-700" : "text-slate-900",
                  ].join(" ")}
                >
                  <MathFormattedText text={pair.output} />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      <div className="mt-4 rounded-2xl border border-cyan-300 bg-slate-900 px-4 py-4 text-center shadow-sm shadow-cyan-200/50">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-cyan-200">
          Highlighted Row
        </div>
        <div className="mt-2 text-3xl font-black text-white">
          x = <MathFormattedText text={visual.highlighted.input} />
          <span className="mx-2 text-cyan-300">|</span>
          y = <MathFormattedText text={visual.highlighted.output} />
        </div>
      </div>
    </div>
  );
}
