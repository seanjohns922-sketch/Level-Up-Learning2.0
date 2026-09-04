"use client";

import { MathFormattedText } from "@/components/FractionText";
import type { DecisionPathCardVisualData } from "@/data/activities/year2/lessonEngine";

function ExitColumn({
  side,
  label,
  operation,
  output,
  active,
  dimmed,
}: {
  side: "pass" | "fail";
  label: string;
  operation: string;
  output?: string;
  active: boolean;
  dimmed: boolean;
}) {
  const pass = side === "pass";
  return (
    <div
      className={[
        "flex flex-col items-center gap-2 transition-opacity duration-200",
        dimmed ? "opacity-35" : "opacity-100",
      ].join(" ")}
    >
      <span
        className={[
          "rounded-full px-3 py-0.5 text-[11px] font-black uppercase tracking-[0.16em]",
          pass ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700",
        ].join(" ")}
      >
        {label}
      </span>
      <div
        className={[
          "flex w-full max-w-[9rem] flex-col items-center rounded-2xl border-2 px-4 py-3 text-center shadow-sm transition-all",
          pass ? "border-emerald-200 bg-white" : "border-rose-200 bg-white",
          active ? (pass ? "ring-2 ring-emerald-400" : "ring-2 ring-rose-400") : "",
        ].join(" ")}
      >
        <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
          Then
        </div>
        <div className="mt-1 text-xl font-black text-slate-900">
          <MathFormattedText text={operation} />
        </div>
      </div>
      <div className="text-lg font-black text-slate-300">↓</div>
      <div
        className={[
          "flex h-12 w-full max-w-[9rem] items-center justify-center rounded-2xl border-2 text-2xl font-black shadow-sm",
          active
            ? pass
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-rose-300 bg-rose-50 text-rose-800"
            : "border-slate-200 bg-slate-50 text-slate-900",
        ].join(" ")}
      >
        <MathFormattedText text={output ?? "?"} />
      </div>
    </div>
  );
}

export default function DecisionPathCardVisual({
  visual,
}: {
  visual: DecisionPathCardVisualData;
}) {
  const active = visual.activeBranch;
  return (
    <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-violet-800">
        {visual.title}
      </div>

      <div className="mt-4 flex flex-col items-center">
        {/* Number arriving at the gate */}
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center shadow-sm">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
            Number in
          </div>
          <div className="mt-1 text-3xl font-black text-slate-900">
            <MathFormattedText text={visual.input} />
          </div>
        </div>

        <div className="text-xl font-black text-violet-300">↓</div>

        {/* Decision diamond */}
        <div className="relative flex h-28 w-56 items-center justify-center">
          <div
            className="absolute inset-0 border-2 border-violet-300 bg-white shadow-sm"
            style={{ clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" }}
            aria-hidden
          />
          <div className="relative z-10 px-6 text-center">
            <div className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-violet-500">
              Gate
            </div>
            <div className="text-base font-black leading-tight text-slate-900">
              <MathFormattedText text={visual.decision} />
            </div>
          </div>
        </div>

        {/* Split to the two exits */}
        <div className="grid w-full max-w-sm grid-cols-2 items-start gap-6 pt-1">
          <ExitColumn
            side="pass"
            label="Yes"
            operation={visual.passLabel}
            output={visual.passOutput}
            active={active === "pass"}
            dimmed={active === "fail"}
          />
          <ExitColumn
            side="fail"
            label="No"
            operation={visual.failLabel}
            output={visual.failOutput}
            active={active === "fail"}
            dimmed={active === "pass"}
          />
        </div>
      </div>
    </div>
  );
}
