"use client";

import { renderCoins } from "@/components/week7/moneyAssets";

type Visual = Record<string, unknown>;

function Surface({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-cyan-900/15 bg-[#f8fbfc] p-4 text-slate-950 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-5">{children}</div>;
}

function Tile({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return <span className={`grid min-h-16 min-w-20 place-items-center rounded-lg border px-4 text-3xl font-black ${muted ? "border-dashed border-slate-300 bg-white text-slate-500" : "border-cyan-700/30 bg-white text-slate-950"}`}>{children}</span>;
}

function Counters({ count }: { count: number }) {
  return <div className="flex max-w-md flex-wrap justify-center gap-2">{Array.from({ length: count }, (_, index) => <span key={index} className="h-6 w-6 rounded-full border border-cyan-700/30 bg-cyan-400 shadow-sm" />)}</div>;
}

function FractionBar({ parts, selected }: { parts: number; selected: number }) {
  return (
    <div className="grid h-24 w-full max-w-lg overflow-hidden rounded-lg border-2 border-cyan-800" style={{ gridTemplateColumns: `repeat(${parts}, minmax(0, 1fr))` }}>
      {Array.from({ length: parts }, (_, index) => <span key={index} className={`border-r border-cyan-800/45 last:border-r-0 ${index < selected ? "bg-cyan-300" : "bg-white"}`} />)}
    </div>
  );
}

/** Real Australian notes and coins; $20 notes are shown as notes rather than two $10 notes. */
function CoinsAndNotes({ amount }: { amount: number }) {
  if (amount < 20) return renderCoins(amount);
  const twenties = Math.floor(amount / 20);
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: twenties }, (_, index) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={index} src="/coins/note-20.png" alt="$20" className="h-11 w-20 object-contain" />
      ))}
      {amount % 20 > 0 ? renderCoins(amount % 20) : null}
    </div>
  );
}

export default function NumberNexusYear2AssessmentVisual({ visual }: { visual: Visual }) {
  const type = String(visual.type ?? "");

  if (type === "number_y2_place_value") {
    const hundreds = Number(visual.hundreds ?? 0);
    const tens = Number(visual.tens ?? 0);
    const ones = Number(visual.ones ?? 0);
    // One unit size throughout: a one is 1×1, a vertical rod 1×10 and a flat 10×10 units.
    const unit = 16;
    const side = unit * 10;
    const lines = Array.from({ length: 9 }, (_, index) => (index + 1) * unit);
    return (
      <Surface><div className="flex flex-wrap items-start justify-center gap-8">
        <div className="flex max-w-full flex-col items-center gap-3"><div className="text-sm font-black text-cyan-900">Hundreds</div><div className="flex flex-wrap justify-center gap-2" role="img" aria-label={`${hundreds} hundreds flats`}>{Array.from({ length: hundreds }, (_, index) => (
          <svg key={index} viewBox={`0 0 ${side} ${side}`} className="h-auto w-[6.5rem] shrink-0 sm:w-40" aria-hidden="true">
            <rect x="1" y="1" width={side - 2} height={side - 2} fill="#cffafe" stroke="#0e7490" strokeWidth="2" />
            {lines.map((offset) => <path key={`h${offset}`} d={`M1 ${offset}H${side - 1}`} stroke="#0e7490" strokeOpacity="0.35" />)}
            {lines.map((offset) => <path key={`v${offset}`} d={`M${offset} 1V${side - 1}`} stroke="#0e7490" strokeOpacity="0.35" />)}
          </svg>
        ))}</div></div>
        <div className="flex flex-col items-center gap-3"><div className="text-sm font-black text-cyan-900">Tens</div><div className="flex min-h-10 flex-wrap justify-center gap-2" role="img" aria-label={`${tens} tens rods`}>{Array.from({ length: tens }, (_, rod) => (
          <svg key={rod} viewBox={`0 0 ${unit} ${side}`} className="h-auto w-[0.65rem] shrink-0 sm:w-4" aria-hidden="true">
            <rect x="1" y="1" width={unit - 2} height={side - 2} fill="#cffafe" stroke="#0e7490" strokeWidth="2" />
            {lines.map((offset) => <path key={offset} d={`M1 ${offset}H${unit - 1}`} stroke="#0e7490" strokeOpacity="0.35" />)}
          </svg>
        ))}</div></div>
        <div className="flex flex-col items-center gap-3"><div className="text-sm font-black text-amber-900">Ones</div><div className="grid min-h-10 grid-cols-5 gap-2" role="img" aria-label={`${ones} ones blocks`}>{Array.from({ length: ones }, (_, index) => (
          <svg key={index} viewBox={`0 0 ${unit} ${unit}`} className="h-auto w-[0.65rem] sm:w-4" aria-hidden="true"><rect x="1" y="1" width={unit - 2} height={unit - 2} fill="#fef3c7" stroke="#b45309" strokeWidth="2" /></svg>
        ))}</div></div>
      </div></Surface>
    );
  }

  if (type === "number_y2_number_cards") {
    const values = (visual.values as number[] | undefined) ?? [];
    return <Surface><div className="flex flex-wrap justify-center gap-3">{values.map((value) => <Tile key={value}>{value}</Tile>)}</div></Surface>;
  }

  if (type === "number_y2_partition_choices") {
    const choices = (visual.choices as number[][] | undefined) ?? [];
    return <Surface><div className="grid gap-3 sm:grid-cols-3">{choices.map((choice, index) => <div key={index} className="flex items-center justify-center gap-2 rounded-lg border border-cyan-800/20 bg-white p-4 text-xl font-black">{choice.join(" + ")}</div>)}</div></Surface>;
  }

  if (type === "number_y2_fraction") {
    return <Surface><div className="flex justify-center"><FractionBar parts={Number(visual.parts ?? 2)} selected={Number(visual.selected ?? 1)} /></div></Surface>;
  }

  if (type === "number_y2_fraction_halving") {
    const before = Number(visual.before ?? 4);
    // v3 forms hide the result (after: null) so the child reasons about halving instead of counting.
    if (visual.after === null) {
      const whole = typeof visual.whole === "string" ? visual.whole : null;
      return <Surface><div className="grid items-center gap-5 sm:grid-cols-[1fr_auto_auto]"><div className="space-y-2">{whole ? <div className="text-center text-sm font-black capitalize text-cyan-900">{whole}</div> : null}<FractionBar parts={before} selected={0} /></div><span className="text-center text-3xl font-black text-cyan-800" aria-hidden="true">→</span><Tile muted>?</Tile></div></Surface>;
    }
    const after = Number(visual.after ?? 8);
    return <Surface><div className="grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]"><FractionBar parts={before} selected={before} /><span className="text-3xl font-black text-cyan-800">→</span><FractionBar parts={after} selected={after} /></div></Surface>;
  }

  if (type === "number_y2_fraction_compare") {
    const left = (visual.left as Array<number | null> | undefined) ?? [1, 2];
    const right = (visual.right as Array<number | null> | undefined) ?? [null, 4];
    return <Surface><div className="grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]"><FractionBar parts={Number(left[1])} selected={Number(left[0])} /><span className="text-3xl font-black text-cyan-800">=</span><div className="space-y-3"><FractionBar parts={Number(right[1])} selected={0} /><div className="text-center text-2xl font-black">? / {right[1]}</div></div></div></Surface>;
  }

  if (type === "number_y2_equation") return <Surface><div className="text-center text-4xl font-black">{String(visual.expression ?? "")}</div></Surface>;

  if (type === "number_y2_array") {
    const rows = Number(visual.rows ?? 0);
    const columns = Number(visual.columns ?? 0);
    return <Surface><div className="mx-auto grid w-fit gap-3" style={{ gridTemplateColumns: `repeat(${columns}, 1.5rem)` }}>{Array.from({ length: rows * columns }, (_, index) => <span key={index} className="h-6 w-6 rounded-full border border-cyan-700/30 bg-cyan-400" />)}</div></Surface>;
  }

  if (type === "number_y2_groups") {
    const supplied = (visual.groups as number[] | undefined) ?? [];
    const total = Number(visual.total ?? 0);
    const groupSize = Number(visual.groupSize ?? 0);
    // v3 grouping questions show loose counters; drawing the groups would give the answer away.
    if (visual.loose === true) return <Surface><div className="flex justify-center"><Counters count={total} /></div></Surface>;
    const groups = supplied.length ? supplied : total && groupSize ? Array.from({ length: total / groupSize }, () => groupSize) : [];
    return <Surface><div className="flex flex-wrap justify-center gap-3">{groups.map((count, index) => <div key={index} className="rounded-lg border border-cyan-800/20 bg-white p-3"><Counters count={count} /></div>)}</div></Surface>;
  }

  if (type === "number_y2_share") {
    const total = Number(visual.total ?? 0);
    const groups = Number(visual.groups ?? 0);
    return <Surface><div className="flex flex-col items-center gap-5"><Counters count={total} /><div className="grid w-full max-w-lg gap-3" style={{ gridTemplateColumns: `repeat(${groups}, minmax(0, 1fr))` }}>{Array.from({ length: groups }, (_, index) => <span key={index} className="h-16 rounded-lg border-2 border-dashed border-cyan-800/25 bg-white" />)}</div></div></Surface>;
  }

  if (type === "number_y2_money") {
    const amounts = (visual.amounts as number[] | undefined) ?? [];
    const labels = (visual.labels as string[] | undefined) ?? [];
    return <Surface><div className="grid gap-4 sm:grid-cols-2">{amounts.map((amount, index) => <div key={index} className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg border border-amber-700/20 bg-amber-50 p-4"><div className="text-sm font-black text-slate-700">{labels[index] ?? "Money"}</div><div className="flex min-h-12 items-center justify-center [&_img]:h-16 [&_img]:w-auto"><CoinsAndNotes amount={amount} /></div></div>)}</div></Surface>;
  }

  if (type === "number_y2_sequence") {
    const values = (visual.values as Array<number | null> | undefined) ?? [];
    return <Surface><div className="flex flex-wrap items-center justify-center gap-3">{values.map((value, index) => <Tile key={index} muted={value === null}>{value ?? "?"}</Tile>)}</div></Surface>;
  }

  if (type === "number_y2_fact_family") {
    const family = (visual.family as number[] | undefined) ?? [];
    return <Surface><div className="flex flex-wrap items-center justify-center gap-3">{family.map((value, index) => <Tile key={index}>{value}</Tile>)}</div></Surface>;
  }

  if (type === "number_y2_part_whole") {
    const whole = Number(visual.whole ?? 0);
    const parts = (visual.parts as Array<number | null> | undefined) ?? [];
    return <Surface><div className="flex flex-col items-center gap-4"><Tile>{whole}</Tile><div className="h-5 w-px bg-cyan-800/30" /><div className="flex gap-4">{parts.map((part, index) => <Tile key={index} muted={part === null}>{part ?? "?"}</Tile>)}</div></div></Surface>;
  }

  if (type === "number_y2_double_halve") {
    // v3 halving questions show one unsplit collection; two drawn halves would give the answer away.
    if (visual.split === false) return <Surface><div className="flex min-h-28 items-center justify-center rounded-lg border border-cyan-800/20 bg-white p-4"><Counters count={Number(visual.total ?? 0)} /></div></Surface>;
    const factor = Number(visual.factor ?? 0);
    return <Surface><div className="grid gap-4 sm:grid-cols-2">{[0, 1].map((group) => <div key={group} className="flex min-h-28 items-center justify-center rounded-lg border border-cyan-800/20 bg-white p-4"><Counters count={factor} /></div>)}</div></Surface>;
  }

  return null;
}
