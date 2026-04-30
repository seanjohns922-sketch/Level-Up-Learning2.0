"use client";

import type { FractionContextVisualData } from "@/data/activities/year2/lessonEngine";
import { FractionText } from "@/components/FractionText";

function getTheme(context: FractionContextVisualData["context"]) {
  switch (context) {
    case "tank":
      return {
        badge: "Tank model",
        shell: "border-cyan-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.98),_rgba(236,254,255,0.92)_55%,_rgba(224,242,254,0.95))]",
        fill: "bg-cyan-500",
        remove: "bg-rose-400",
        add: "bg-emerald-400",
      };
    case "runner":
    case "trail":
      return {
        badge: "Distance model",
        shell: "border-violet-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.98),_rgba(245,243,255,0.92)_55%,_rgba(237,233,254,0.95))]",
        fill: "bg-violet-500",
        remove: "bg-rose-400",
        add: "bg-emerald-400",
      };
    case "recipe":
    case "container":
      return {
        badge: "Amount model",
        shell: "border-amber-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.98),_rgba(255,251,235,0.92)_55%,_rgba(254,243,199,0.95))]",
        fill: "bg-amber-400",
        remove: "bg-rose-400",
        add: "bg-emerald-400",
      };
    default:
      return {
        badge: "Fraction model",
        shell: "border-sky-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.98),_rgba(239,246,255,0.92)_55%,_rgba(224,242,254,0.95))]",
        fill: "bg-sky-500",
        remove: "bg-rose-400",
        add: "bg-emerald-400",
      };
  }
}

function StageBar({
  totalUnits,
  filledUnits,
  highlightUnits = 0,
  highlightKind,
  tone,
}: {
  totalUnits: number;
  filledUnits: number;
  highlightUnits?: number;
  highlightKind?: "add" | "remove";
  tone: ReturnType<typeof getTheme>;
}) {
  return (
    <div
      className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-1.5 shadow-sm"
      style={{ gridTemplateColumns: `repeat(${totalUnits}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: totalUnits }).map((_, index) => {
        let cellClass = "bg-white";

        if (index < filledUnits) {
          cellClass = tone.fill;
        }

        if (highlightKind === "remove" && index >= Math.max(0, filledUnits - highlightUnits) && index < filledUnits) {
          cellClass = tone.remove;
        }

        if (highlightKind === "add" && index >= Math.max(0, filledUnits - highlightUnits) && index < filledUnits) {
          cellClass = tone.add;
        }

        return (
          <div
            key={index}
            className={`h-8 rounded-[4px] border-r border-white/70 last:border-r-0 ${cellClass}`}
          />
        );
      })}
    </div>
  );
}

export default function FractionContextVisual({
  visual,
}: {
  visual: FractionContextVisualData;
}) {
  const theme = getTheme(visual.context);
  const stages = visual.steps.reduce<
    Array<{
      label: string;
      fraction: string;
      filledUnits: number;
      highlightUnits: number;
      highlightKind?: "add" | "remove";
    }>
  >(
    (accumulator, step) => {
      const previousFilledUnits = accumulator[accumulator.length - 1]?.filledUnits ?? visual.startUnits;
      const nextFilledUnits = previousFilledUnits + (step.kind === "add" ? step.units : -step.units);
      accumulator.push({
        label: step.stageLabel,
        fraction: step.label,
        filledUnits: nextFilledUnits,
        highlightUnits: step.units,
        highlightKind: step.kind,
      });
      return accumulator;
    },
    [
      {
        label: "Start",
        fraction: visual.startLabel,
        filledUnits: visual.startUnits,
        highlightUnits: 0,
        highlightKind: undefined,
      },
    ]
  );

  return (
    <div className={`mt-5 rounded-[28px] border p-5 shadow-sm ${theme.shell}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">{theme.badge}</div>
        <div className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-600 shadow-sm">
          {visual.title}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {stages.map((stage, index) => (
          <div key={`${stage.label}-${index}`} className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{stage.label}</div>
              <div className="text-sm font-black text-slate-900">
                <FractionText value={stage.fraction} size="sm" />
              </div>
            </div>
            <StageBar
              totalUnits={visual.totalUnits}
              filledUnits={stage.filledUnits}
              highlightUnits={stage.highlightUnits}
              highlightKind={stage.highlightKind}
              tone={theme}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
