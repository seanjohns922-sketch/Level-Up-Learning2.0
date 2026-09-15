"use client";

import { FractionText } from "@/components/FractionText";

/** A blank number line: only the learner's selected point is highlighted. */
export default function FractionPlacementLine({ targetFraction, value, onChange }: {
  targetFraction: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const divisions = 12;
  return (
    <div className="mt-4 rounded-xl border border-cyan-900/20 bg-[#f8fbfc] p-5 text-slate-950 sm:p-8">
      <div className="text-center text-sm font-bold text-teal-800">Find this fraction</div>
      <div className="my-4 text-center text-4xl font-black"><FractionText value={targetFraction} /></div>
      <p className="text-center font-semibold text-slate-600">12 equal parts from 0 to 1</p>
      <p className="mt-2 text-center text-sm text-slate-600">Tap a tick to place your point. You can change your choice.</p>
      <div className="mt-6 overflow-x-auto pb-3" tabIndex={0} aria-label="Number line. Scroll sideways on small screens to see all ticks.">
        <div className="relative mx-auto flex min-w-[572px] max-w-4xl" role="group" aria-label="Choose a point on the number line">
          <div aria-hidden="true" className="absolute left-[3.846154%] right-[3.846154%] top-8 h-1 bg-slate-800" />
          {Array.from({ length: divisions + 1 }, (_, tick) => {
            const response = `${tick}/${divisions}`;
            const selected = value === response;
            return (
              <button key={tick} type="button" aria-label={tick === 0 ? "Zero" : tick === divisions ? "One" : `Tick ${tick} of 12`}
                aria-pressed={selected} onClick={() => onChange(response)}
                className="relative h-24 min-w-11 flex-1 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 hover:bg-teal-100/60">
                <span aria-hidden="true" className="absolute left-1/2 top-6 h-5 w-0.5 -translate-x-1/2 bg-slate-800" />
                {selected && <span aria-hidden="true" className="absolute left-1/2 top-[19px] h-7 w-7 -translate-x-1/2 rounded-full border-4 border-white bg-teal-600 shadow" />}
                {(tick === 0 || tick === divisions) && <span aria-hidden="true" className="absolute inset-x-0 top-14 text-xl font-bold">{tick === 0 ? '0' : '1'}</span>}
              </button>
            );
          })}
        </div>
      </div>
      <p aria-live="polite" className="text-center text-sm font-semibold text-teal-800">{value ? "Point selected. Tap another tick to move it." : "No point selected yet."}</p>
    </div>
  );
}
