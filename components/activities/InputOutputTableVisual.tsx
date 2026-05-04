"use client";

import { MathFormattedText } from "@/components/FractionText";
import type { InputOutputTableVisualData } from "@/data/activities/year2/lessonEngine";

export default function InputOutputTableVisual({
  visual,
}: {
  visual: InputOutputTableVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
        {visual.title}
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-900 text-center text-[10px] font-extrabold uppercase tracking-[0.18em] text-cyan-200">
          <div className="px-4 py-3">Input</div>
          <div className="border-l border-slate-700 px-4 py-3">Output</div>
        </div>
        {visual.pairs.map((pair, index) => (
          <div
            key={`${pair.input}-${pair.output}-${index}`}
            className="grid grid-cols-2 text-center text-2xl font-black text-slate-900"
          >
            <div className="px-4 py-4">
              <MathFormattedText text={pair.input} />
            </div>
            <div className="border-l border-slate-100 px-4 py-4">
              <MathFormattedText text={pair.output} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
