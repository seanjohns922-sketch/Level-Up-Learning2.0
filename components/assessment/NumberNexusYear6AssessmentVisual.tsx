"use client";

import { BadgePercent, Landmark, Scale } from "lucide-react";
import NumberNexusYear5AssessmentVisual from "@/components/assessment/NumberNexusYear5AssessmentVisual";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";

type Visual = Record<string, unknown>;

function Surface({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-cyan-900/15 bg-[#f8fbfc] p-4 text-slate-950 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-5">{children}</div>;
}

function Rows({ rows }: { rows: Array<[string, string]> }) {
  return <div className="mx-auto grid max-w-xl divide-y divide-slate-200 overflow-hidden rounded-lg border border-cyan-900/15 bg-white">{rows.map(([label, value]) => <div key={`${label}-${value}`} className="grid grid-cols-[1fr_auto] items-center gap-6 px-4 py-3"><span className="font-semibold text-slate-600">{label}</span><span className="text-xl font-black">{value}</span></div>)}</div>;
}

function ReadableVisual({ text, children }: { text: string; children: React.ReactNode }) {
  return <div className="space-y-2"><div className="flex justify-end"><OptionReadAloudButton text={text} /></div>{children}</div>;
}

function mappedVisualReadAloud(type: string, visual: Visual) {
  if (type === "number_y6_integer_set" || type === "number_y6_fraction_set") {
    return `Values: ${((visual.values as Array<string | number> | undefined) ?? []).join(", ")}.`;
  }
  if (type === "number_y6_number_card") return `Number: ${String(visual.number ?? "")}.`;
  if (type === "number_y6_constraint") {
    return `Conditions: ${((visual.rules as string[] | undefined) ?? []).join(", ")}.`;
  }
  if (type === "number_y6_number_line") {
    return `Number line from ${String(visual.min ?? 0)} to ${String(visual.max ?? 1)}, divided into ${String(visual.divisions ?? "")} equal intervals. A point is marked on the line.`;
  }
  if (type === "number_y6_claim") return `Claim: ${String(visual.statement ?? "")}.`;
  return String(visual.expression ?? "");
}

export default function NumberNexusYear6AssessmentVisual({ visual }: { visual: Visual }) {
  const type = String(visual.type ?? "");

  if (type === "number_y6_coordinate") {
    const points = (visual.points as Array<{ x: number; y: number; label: string }> | undefined) ?? [];
    const spoken = points.map((point) => `Point ${point.label} is at ${point.x}, ${point.y}.`).join(" ");
    const scale = [-4, -3, -2, -1, 1, 2, 3, 4];
    return <ReadableVisual text={spoken}><Surface><div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-lg border border-cyan-900/20 bg-[linear-gradient(to_right,rgba(8,145,178,.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(8,145,178,.12)_1px,transparent_1px)] bg-[size:10%_10%]"><span className="absolute left-1/2 top-0 h-full w-px bg-slate-700" /><span className="absolute left-0 top-1/2 h-px w-full bg-slate-700" />{scale.map((value) => <span key={`x-${value}`} aria-hidden className="absolute top-[52%] -translate-x-1/2 text-[10px] font-bold text-slate-500" style={{ left: `${50 + value * 10}%` }}>{value}</span>)}{scale.map((value) => <span key={`y-${value}`} aria-hidden className="absolute left-[52%] -translate-y-1/2 text-[10px] font-bold text-slate-500" style={{ top: `${50 - value * 10}%` }}>{value}</span>)}<span aria-hidden className="absolute right-2 top-[45%] text-xs font-black text-slate-600">x</span><span aria-hidden className="absolute left-[52%] top-2 text-xs font-black text-slate-600">y</span>{points.map((point) => <span key={point.label} className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cyan-700 text-sm font-black text-white shadow" style={{ left: `${50 + point.x * 10}%`, top: `${50 - point.y * 10}%` }}>{point.label}</span>)}</div></Surface></ReadableVisual>;
  }

  if (type === "number_y6_quantity") {
    const spoken = `Whole: ${String(visual.whole ?? "unknown")}. Part: ${String(visual.part ?? "unknown")}.`;
    return <ReadableVisual text={spoken}><Surface><div className="flex flex-wrap items-center justify-center gap-5"><div className="rounded-lg border border-cyan-800/20 bg-white px-6 py-4 text-center"><div className="text-xs font-black uppercase text-cyan-900">Whole</div><div className="mt-1 text-4xl font-black">{String(visual.whole ?? "?")}</div></div><BadgePercent className="h-8 w-8 text-cyan-800" aria-hidden /><div className="rounded-lg border border-cyan-800/20 bg-white px-6 py-4 text-center"><div className="text-xs font-black uppercase text-cyan-900">Part</div><div className="mt-1 text-3xl font-black">{String(visual.part ?? "?")}</div></div></div></Surface></ReadableVisual>;
  }

  if (type === "number_y6_discount") {
    const spoken = `Original price ${String(visual.price ?? "")} dollars. Discount ${String(visual.discount ?? "")} percent.`;
    return <ReadableVisual text={spoken}><Surface><BadgePercent className="mx-auto mb-3 h-8 w-8 text-cyan-800" aria-hidden /><Rows rows={[["Original price", `$${String(visual.price ?? "")}`], ["Discount", `${String(visual.discount ?? "")}%`]]} /></Surface></ReadableVisual>;
  }

  if (type === "number_y6_rates") {
    const rows = ((visual.rows as Array<[string, string]> | undefined) ?? []).map(([label, value]) => [String(label), String(value)] as [string, string]);
    return <ReadableVisual text={rows.map(([label, value]) => `${label}: ${value}.`).join(" ")}><Surface><Scale className="mx-auto mb-3 h-8 w-8 text-cyan-800" aria-hidden /><Rows rows={rows} /></Surface></ReadableVisual>;
  }

  if (type === "number_y6_budget") {
    const rows = ((visual.rows as Array<[string, string]> | undefined) ?? []).map(([label, value]) => [String(label), String(value)] as [string, string]);
    const allRows: Array<[string, string]> = [["Budget", `$${String(visual.budget ?? "")}`], ...rows];
    return <ReadableVisual text={allRows.map(([label, value]) => `${label}: ${value}.`).join(" ")}><Surface><Landmark className="mx-auto mb-3 h-8 w-8 text-cyan-800" aria-hidden /><Rows rows={allRows} /></Surface></ReadableVisual>;
  }

  const mappedType: Record<string, string> = {
    number_y6_integer_set: "number_y5_decimal_set",
    number_y6_number_card: "number_y5_factor_card",
    number_y6_constraint: "number_y5_divisibility_target",
    number_y6_fraction_set: "number_y5_fraction_set",
    number_y6_number_line: "number_y5_number_line",
    number_y6_calculation: "number_y5_calculation",
    number_y6_claim: "number_y5_claim",
    number_y6_fraction_equation: "number_y5_fraction_equation",
    number_y6_estimate: "number_y5_estimate",
  };
  const mapped = mappedType[type];
  const spoken = mappedVisualReadAloud(type, visual);
  return mapped ? <ReadableVisual text={spoken}><NumberNexusYear5AssessmentVisual visual={{ ...visual, type: mapped }} /></ReadableVisual> : null;
}
