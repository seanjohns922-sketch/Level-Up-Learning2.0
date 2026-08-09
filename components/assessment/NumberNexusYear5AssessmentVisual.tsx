"use client";

import { Bus, Calculator, PackageOpen, ReceiptText, Ticket, Users } from "lucide-react";

type Visual = Record<string, unknown>;

function Surface({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-cyan-900/15 bg-[#f8fbfc] p-4 text-slate-950 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-5">
      {children}
    </div>
  );
}

function Tile({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span className={`grid min-h-16 min-w-20 place-items-center rounded-lg border px-4 text-2xl font-black ${muted ? "border-dashed border-slate-300 bg-white text-slate-500" : "border-cyan-700/25 bg-white text-slate-950"}`}>
      {children}
    </span>
  );
}

function Rows({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="mx-auto grid max-w-xl divide-y divide-slate-200 overflow-hidden rounded-lg border border-cyan-900/15 bg-white">
      {rows.map(([label, value]) => (
        <div key={`${label}-${value}`} className="grid grid-cols-[1fr_auto] items-center gap-6 px-4 py-3">
          <span className="font-semibold text-slate-600">{label}</span>
          <span className="text-xl font-black text-slate-950">{value}</span>
        </div>
      ))}
    </div>
  );
}

function IconHeading({ type }: { type: string }) {
  const Icon = type.includes("bus") ? Bus : type.includes("box") || type.includes("book") ? PackageOpen : type.includes("ticket") ? Ticket : type.includes("passenger") || type.includes("seat") ? Users : Calculator;
  return <Icon className="mx-auto mb-3 h-8 w-8 text-cyan-800" aria-hidden />;
}

export default function NumberNexusYear5AssessmentVisual({ visual }: { visual: Visual }) {
  const type = String(visual.type ?? "");

  if (type === "number_y5_decimal_chart") {
    const [whole = "0", decimal = "000"] = String(visual.value ?? "0.000").split(".");
    const places = [["Ones", whole], ["Tenths", decimal[0] ?? "0"], ["Hundredths", decimal[1] ?? "0"], ["Thousandths", decimal[2] ?? "0"]];
    return <Surface><div className="mx-auto grid max-w-2xl grid-cols-2 overflow-hidden rounded-lg border border-cyan-800/20 bg-white sm:grid-cols-4">{places.map(([label, value], index) => <div key={label} className={`p-4 text-center ${index < places.length - 1 ? "sm:border-r sm:border-cyan-800/15" : ""}`}><div className="text-xs font-black uppercase text-cyan-900">{label}</div><div className="mt-2 text-4xl font-black">{value}</div></div>)}</div></Surface>;
  }

  if (type === "number_y5_decimal_words") {
    const rows: Array<[string, string]> = [["Ones", String(visual.whole ?? 0)], ["Tenths", String(visual.tenths ?? 0)], ["Hundredths", String(visual.hundredths ?? 0)], ["Thousandths", String(visual.thousandths ?? 0)]];
    return <Surface><Rows rows={rows} /></Surface>;
  }

  if (type === "number_y5_decimal_set" || type === "number_y5_fraction_set") {
    const values = (visual.values as Array<string | number> | undefined) ?? [];
    return <Surface><div className="flex flex-wrap justify-center gap-3">{values.map((value) => <Tile key={String(value)}>{String(value)}</Tile>)}</div></Surface>;
  }

  if (type === "number_y5_factor_card") {
    return <Surface><div className="text-center"><div className="text-xs font-black uppercase text-cyan-900">Number</div><div className="mt-2 text-6xl font-black">{String(visual.number ?? "")}</div></div></Surface>;
  }

  if (type === "number_y5_claim") {
    return <Surface><div className="mx-auto max-w-3xl rounded-lg border border-amber-300 bg-amber-50 px-5 py-4 text-center text-xl font-bold">{String(visual.statement ?? "")}</div></Surface>;
  }

  if (type === "number_y5_number_line") {
    const min = Number(visual.min ?? 0);
    const max = Number(visual.max ?? 1);
    const divisions = Math.max(1, Number(visual.divisions ?? 1));
    const marker = Math.min(divisions, Math.max(0, Number(visual.marker ?? 0)));
    return <Surface><div className="mx-auto max-w-3xl px-4 py-8"><div className="relative h-1 bg-slate-800">{Array.from({ length: divisions + 1 }, (_, index) => <span key={index} className="absolute top-1/2 h-4 w-px -translate-y-1/2 bg-slate-700" style={{ left: `${(index / divisions) * 100}%` }} />)}<span className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-cyan-600 shadow" style={{ left: `${(marker / divisions) * 100}%` }} /></div><div className="mt-4 flex justify-between text-lg font-black"><span>{min}</span><span>{max}</span></div></div></Surface>;
  }

  if (type === "number_y5_percent_grid") {
    const shaded = Math.min(100, Math.max(0, Number(visual.shaded ?? 0)));
    return <Surface><div className="mx-auto grid aspect-square w-full max-w-[300px] grid-cols-10 overflow-hidden rounded-lg border border-cyan-800/25 bg-white">{Array.from({ length: 100 }, (_, index) => <span key={index} className={`border-b border-r border-slate-200 ${index < shaded ? "bg-cyan-500" : "bg-white"}`} />)}</div></Surface>;
  }

  if (type === "number_y5_fdp") {
    return <Surface><div className="flex flex-wrap items-center justify-center gap-4"><Tile>{String(visual.fraction ?? "?")}</Tile><span className="text-2xl font-black text-cyan-800">=</span><Tile muted>{String(visual.decimal ?? "decimal")}</Tile><span className="text-2xl font-black text-cyan-800">=</span><Tile muted>{String(visual.percent ?? "percent")}</Tile></div></Surface>;
  }

  if (type === "number_y5_fraction_equation" || type === "number_y5_calculation" || type === "number_y5_estimate") {
    return <Surface><div className="text-center text-4xl font-black">{String(visual.expression ?? "")}</div></Surface>;
  }

  if (type === "number_y5_division") {
    return <Surface><div className="text-center text-4xl font-black">{String(visual.dividend ?? "")} ÷ {String(visual.divisor ?? "")}</div></Surface>;
  }

  if (type === "number_y5_model") {
    const rows = ((visual.rows as Array<[string, string]> | undefined) ?? []).map(([label, value]) => [String(label), String(value)] as [string, string]);
    return <Surface><IconHeading type={rows.map(([label]) => label.toLowerCase()).join(" ")} /><Rows rows={rows} /></Surface>;
  }

  if (type === "number_y5_receipt") {
    const rows = ((visual.rows as Array<[string, string]> | undefined) ?? []).map(([label, value]) => [String(label), String(value)] as [string, string]);
    return <Surface><ReceiptText className="mx-auto mb-3 h-8 w-8 text-cyan-800" aria-hidden /><Rows rows={rows} /></Surface>;
  }

  if (type === "number_y5_budget") {
    const items = ((visual.items as Array<[string, string]> | undefined) ?? []).map(([label, value]) => [String(label), String(value)] as [string, string]);
    return <Surface><Rows rows={[["Budget", `$${String(visual.budget ?? "")}`], ...items]} /></Surface>;
  }

  if (type === "number_y5_algorithm") {
    const steps = (visual.steps as string[] | undefined) ?? [];
    return <Surface><div className="flex flex-wrap items-center justify-center gap-3"><Tile>{String(visual.start ?? "")}</Tile>{steps.map((step) => <div key={step} className="flex items-center gap-3"><span className="text-2xl font-black text-cyan-800">→</span><span className="rounded-lg border border-cyan-800/20 bg-white px-4 py-3 text-lg font-bold">{step}</span></div>)}<span className="text-2xl font-black text-cyan-800">→</span><Tile muted>?</Tile></div></Surface>;
  }

  if (type === "number_y5_algorithm_target" || type === "number_y5_divisibility_target") {
    const rules = (visual.rules as string[] | undefined) ?? [];
    return <Surface><div className="text-center"><div className="text-5xl font-black">{String(visual.number ?? "?")}</div>{visual.test ? <div className="mt-3 text-lg font-bold text-cyan-900">{String(visual.test)}</div> : null}{rules.length ? <div className="mt-4 flex flex-wrap justify-center gap-2">{rules.map((rule) => <span key={rule} className="rounded-lg border border-cyan-800/20 bg-white px-4 py-2 font-bold">{rule}</span>)}</div> : null}</div></Surface>;
  }

  return null;
}
