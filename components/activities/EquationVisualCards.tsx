"use client";

import { MathFormattedText } from "@/components/FractionText";
import type {
  BalanceEquationCardVisualData,
  BracketEquationCardVisualData,
  CheckBySubstitutionCardVisualData,
  InverseStepCardVisualData,
  UnknownTileEquationVisualData,
} from "@/data/activities/year2/lessonEngine";

function renderUnknownAware(text: string, unknownSymbol = "x") {
  const parts = text.split(unknownSymbol);
  if (parts.length === 1) {
    return <MathFormattedText text={text} />;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="inline-flex items-center gap-2">
          {part ? <MathFormattedText text={part} /> : null}
          {index < parts.length - 1 ? (
            <span className="inline-flex h-9 min-w-[2.2rem] items-center justify-center rounded-xl border border-cyan-300 bg-cyan-400/15 px-2 text-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.3)]">
              {unknownSymbol}
            </span>
          ) : null}
        </span>
      ))}
    </span>
  );
}

function EquationSide({
  label,
  value,
  unknownSymbol,
  accent = "slate",
}: {
  label: string;
  value: string;
  unknownSymbol?: string;
  accent?: "slate" | "gold";
}) {
  return (
    <div
      className={[
        "rounded-[24px] border px-4 py-4 text-center shadow-sm",
        accent === "gold"
          ? "border-amber-200 bg-amber-50"
          : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-black text-slate-900">
        {renderUnknownAware(value, unknownSymbol)}
      </div>
    </div>
  );
}

export function BalanceEquationCardVisual({
  visual,
}: {
  visual: BalanceEquationCardVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
        {visual.title}
      </div>
      <div className="mt-4 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        <EquationSide label="Left side" value={visual.left} unknownSymbol={visual.unknownSymbol} />
        <div className="text-center text-3xl font-black text-cyan-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.35)]">
          =
        </div>
        <EquationSide label="Right side" value={visual.right} unknownSymbol={visual.unknownSymbol} />
      </div>
    </div>
  );
}

export function InverseStepCardVisual({
  visual,
}: {
  visual: InverseStepCardVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
        {visual.title}
      </div>
      <div className="mt-4 rounded-[24px] border border-cyan-200 bg-slate-950 p-4 shadow-[0_0_24px_rgba(34,211,238,0.1)]">
        <div className="text-center text-2xl font-black text-white">
          <MathFormattedText text={visual.equation} />
        </div>
        <div className="mt-4 inline-flex rounded-full border border-cyan-300 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200">
          {visual.focusLabel ?? "Undo step"}
        </div>
        <div className="mt-3 text-lg font-black text-cyan-100">{visual.inverseOperation}</div>
      </div>
    </div>
  );
}

export function UnknownTileEquationVisual({
  visual,
}: {
  visual: UnknownTileEquationVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
        {visual.title}
      </div>
      <div className="mt-4 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        <EquationSide
          label="Mystery side"
          value={visual.left}
          unknownSymbol={visual.unknownSymbol ?? "□"}
        />
        <div className="text-center text-3xl font-black text-cyan-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.35)]">
          =
        </div>
        <EquationSide label="Known side" value={visual.right} unknownSymbol={visual.unknownSymbol ?? "□"} />
      </div>
    </div>
  );
}

export function BracketEquationCardVisual({
  visual,
}: {
  visual: BracketEquationCardVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
        {visual.title}
      </div>
      <div className="mt-4 grid items-center gap-3 md:grid-cols-[1fr_auto_1fr]">
        <EquationSide label="Left side" value={visual.left} unknownSymbol="x" accent="gold" />
        <div className="text-center text-3xl font-black text-cyan-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.35)]">
          =
        </div>
        <EquationSide label="Right side" value={visual.right} unknownSymbol="x" />
      </div>
      {(visual.bracketGroup || visual.outsideFactor) ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {visual.bracketGroup ? (
            <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-800">
              Bracket group: {visual.bracketGroup}
            </div>
          ) : null}
          {visual.outsideFactor ? (
            <div className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sky-800">
              Outside step: {visual.outsideFactor}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function CheckBySubstitutionCardVisual({
  visual,
}: {
  visual: CheckBySubstitutionCardVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
        {visual.title}
      </div>
      <div className="mt-4 rounded-[24px] border border-cyan-200 bg-slate-950 p-4 shadow-[0_0_24px_rgba(34,211,238,0.1)]">
        <div className="text-center text-2xl font-black text-white">
          <MathFormattedText text={visual.equation} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {visual.candidateValues.map((value) => (
            <div
              key={value}
              className="rounded-full border border-cyan-300 bg-cyan-400/10 px-3 py-1 text-sm font-black text-cyan-100"
            >
              x = {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
