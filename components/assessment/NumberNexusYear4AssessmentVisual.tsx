"use client";

import { ArrowRight, Boxes, ReceiptText, Workflow } from "lucide-react";
import { renderCoins } from "@/components/week7/moneyAssets";

type Visual = Record<string, unknown>;

function Surface({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-cyan-900/15 bg-[#f8fbfc] p-4 text-slate-950 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-5">{children}</div>;
}

function Tile({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return <span className={`grid min-h-16 min-w-20 place-items-center rounded-lg border px-4 text-2xl font-black ${muted ? "border-dashed border-slate-300 bg-white text-slate-500" : "border-cyan-700/25 bg-white text-slate-950"}`}>{children}</span>;
}

function Fraction({ numerator, denominator }: { numerator: number | null; denominator: number }) {
  return <span className="inline-grid min-w-16 grid-rows-[1fr_auto_1fr] place-items-center text-2xl font-black"><span>{numerator ?? "?"}</span><span className="h-0.5 w-full bg-slate-900" /><span>{denominator}</span></span>;
}

export default function NumberNexusYear4AssessmentVisual({ visual }: { visual: Visual }) {
  const type = String(visual.type ?? "");

  if (type === "number_y4_decimal_chart") {
    const value = String(visual.value ?? "0.00");
    const [whole = "0", decimal = "00"] = value.split(".");
    return <Surface><div className="mx-auto grid max-w-xl grid-cols-3 overflow-hidden rounded-lg border border-cyan-800/25 bg-white text-center"><div className="border-r border-cyan-800/20 p-4"><div className="text-xs font-black uppercase text-cyan-900">Ones</div><div className="mt-2 text-4xl font-black">{whole}</div></div><div className="border-r border-cyan-800/20 p-4"><div className="text-xs font-black uppercase text-cyan-900">Tenths</div><div className="mt-2 text-4xl font-black">{decimal[0] ?? "0"}</div></div><div className="p-4"><div className="text-xs font-black uppercase text-cyan-900">Hundredths</div><div className="mt-2 text-4xl font-black">{decimal[1] ?? "0"}</div></div></div></Surface>;
  }

  if (type === "number_y4_decimal_compare") {
    return <Surface><div className="flex items-center justify-center gap-4"><Tile>{String(visual.left ?? "")}</Tile><span className="text-3xl font-black text-cyan-800">?</span><Tile>{String(visual.right ?? "")}</Tile></div></Surface>;
  }

  if (type === "number_y4_number_set") {
    const values = (visual.values as number[] | undefined) ?? [];
    return <Surface><div className="flex flex-wrap justify-center gap-3">{values.map((value) => <Tile key={value}>{value}</Tile>)}</div></Surface>;
  }

  if (type === "number_y4_equation") {
    return <Surface><div className="text-center text-4xl font-black">{String(visual.expression ?? "")}</div>{visual.label ? <div className="mt-2 text-center text-sm font-bold text-cyan-900">{String(visual.label)}</div> : null}</Surface>;
  }

  if (type === "number_y4_fraction_equivalence") {
    const left = (visual.left as Array<number | null> | undefined) ?? [1, 2];
    const right = (visual.right as Array<number | null> | undefined) ?? [null, 4];
    return <Surface><div className="flex items-center justify-center gap-7"><Fraction numerator={left[0] ?? null} denominator={Number(left[1])} /><span className="text-3xl font-black text-cyan-800">=</span><Fraction numerator={right[0] ?? null} denominator={Number(right[1])} /></div></Surface>;
  }

  if (type === "number_y4_fraction_decimal") {
    const numerator = Number(visual.numerator ?? 0);
    const denominator = Number(visual.denominator ?? 1);
    return <Surface><div className="flex items-center justify-center gap-6"><Fraction numerator={numerator} denominator={denominator} /><ArrowRight className="h-7 w-7 text-cyan-800" aria-hidden="true" /><Tile muted>{visual.reported ? String(visual.reported) : "?"}</Tile></div></Surface>;
  }

  if (type === "number_y4_fraction_sequence" || type === "number_y4_sequence") {
    const values = (visual.values as Array<string | number> | undefined) ?? [];
    return <Surface><div className="flex flex-wrap items-center justify-center gap-3">{values.map((value, index) => <Tile key={index} muted={String(value).includes("?")}>{value}</Tile>)}</div></Surface>;
  }

  if (type === "number_y4_number_line") {
    const min = Number(visual.min ?? 0);
    const max = Number(visual.max ?? 1);
    const divisions = Number(visual.divisions ?? 4);
    const marker = Number(visual.marker ?? 1);
    return <Surface><div className="mx-auto max-w-3xl px-4 py-5"><div className="relative h-16"><div className="absolute left-0 right-0 top-8 h-1 rounded bg-slate-800" />{Array.from({ length: divisions + 1 }, (_, index) => <div key={index} className="absolute top-5 -translate-x-1/2" style={{ left: `${(index / divisions) * 100}%` }}><span className="block h-7 w-0.5 bg-slate-800" />{index === 0 || index === divisions ? <span className="mt-1 block -translate-x-1/2 text-sm font-black">{index === 0 ? min : max}</span> : null}</div>)}<span className="absolute top-0 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-white bg-cyan-500 shadow" style={{ left: `${(marker / divisions) * 100}%` }} aria-label="marked point" /></div></div></Surface>;
  }

  if (type === "number_y4_vertical_calculation") {
    return <Surface><div className="mx-auto w-fit font-mono text-4xl font-black"><div className="text-right">{Number(visual.top ?? 0).toLocaleString()}</div><div className="flex gap-5 border-b-4 border-slate-900 pb-2"><span>{String(visual.operation ?? "+")}</span><span>{Number(visual.bottom ?? 0).toLocaleString()}</span></div></div></Surface>;
  }

  if (type === "number_y4_rounding") {
    return <Surface><div className="flex items-center justify-center gap-5"><Tile>{Number(visual.value ?? 0).toLocaleString()}</Tile><ArrowRight className="h-7 w-7 text-cyan-800" aria-hidden="true" /><div className="text-center"><Tile muted>?</Tile><div className="mt-2 text-sm font-black text-cyan-900">nearest {Number(visual.benchmark ?? 10).toLocaleString()}</div></div></div></Surface>;
  }

  if (type === "number_y4_receipt") {
    const rows = (visual.rows as string[][] | undefined) ?? [];
    return <Surface><div className="mx-auto max-w-lg"><div className="mb-3 flex items-center gap-2 text-sm font-black uppercase text-cyan-900"><ReceiptText className="h-5 w-5" aria-hidden="true" />Transaction</div><div className="divide-y divide-slate-200 border-y border-slate-300">{rows.map((row, index) => <div key={index} className="flex justify-between gap-4 py-3 text-lg font-bold"><span>{row[0]}</span><span>{row[1]}</span></div>)}</div>{visual.reported ? <div className="mt-3 text-right text-xl font-black">{String(visual.reported)}</div> : null}</div></Surface>;
  }

  if (type === "number_y4_budget") {
    const budget = visual.budget === null || visual.budget === undefined ? null : Number(visual.budget);
    const items = (visual.items as Array<{ label: string; quantity: number; price: number }> | undefined) ?? [];
    return <Surface><div className="mx-auto max-w-3xl space-y-4">{budget !== null ? <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4"><span className="text-sm font-black uppercase text-cyan-900">Budget</span><span className="text-2xl font-black">${budget}</span></div> : null}<div className="grid gap-3 sm:grid-cols-2">{items.map((item, index) => <div key={index} className="flex items-center justify-between gap-3 rounded-lg border border-amber-700/20 bg-amber-50 p-4"><div><div className="font-black">{item.label}</div><div className="text-sm font-bold text-slate-600">{item.quantity} at ${item.price}</div></div><div className="flex min-h-10 max-w-72 items-center justify-end">{renderCoins(item.price)}</div></div>)}</div></div></Surface>;
  }

  if (type === "number_y4_groups") {
    return <Surface><div className="flex items-center justify-center gap-5"><Boxes className="h-12 w-12 text-cyan-700" aria-hidden="true" /><Tile>{Number(visual.groups ?? 0)} groups</Tile><span className="text-2xl font-black">×</span><Tile>{Number(visual.each ?? 0)} {String(visual.label ?? "items")}</Tile></div></Surface>;
  }

  if (type === "number_y4_model") {
    const rows = (visual.rows as string[][] | undefined) ?? [];
    return <Surface><div className="mx-auto grid max-w-2xl gap-2 sm:grid-cols-3">{rows.map((row, index) => <div key={index} className="rounded-lg border border-cyan-800/20 bg-white p-4 text-center"><div className="text-sm font-black text-cyan-900">{row[0]}</div><div className="mt-2 text-3xl font-black">{row[1]}</div></div>)}</div></Surface>;
  }

  if (type === "number_y4_algorithm") {
    const outputs = (visual.outputs as Array<number | null> | undefined) ?? [];
    return <Surface><div className="flex flex-col items-center gap-4"><div className="flex items-center gap-2 text-sm font-black uppercase text-cyan-900"><Workflow className="h-5 w-5" aria-hidden="true" />{String(visual.rule ?? "Rule")}</div><div className="flex flex-wrap items-center justify-center gap-3">{outputs.map((value, index) => <Tile key={index} muted={value === null}>{value ?? "?"}</Tile>)}</div></div></Surface>;
  }

  return null;
}
