"use client";

import { BookOpen, Circle, Sprout } from "lucide-react";
import { GroundAssessmentToken } from "@/components/assessment/NumberNexusGroundAssessmentVisual";

type Visual = Record<string, unknown>;

function Surface({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-cyan-900/15 bg-[#f8fbfc] p-4 text-slate-950 shadow-[0_8px_24px_rgba(15,23,42,0.08)] sm:p-5">
      {children}
    </div>
  );
}

function Counter({ token = "counter" }: { token?: string }) {
  if (["star", "robot", "crystal"].includes(token)) return <GroundAssessmentToken token={token} />;
  const Icon = token === "book" ? BookOpen : token === "plant" ? Sprout : Circle;
  return (
    <span className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-700/30 bg-cyan-50 text-cyan-800">
      <Icon className="h-5 w-5" aria-hidden />
    </span>
  );
}

function CounterSet({ count, token }: { count: number; token?: string }) {
  return (
    <div className="flex max-w-sm flex-wrap justify-center gap-2">
      {Array.from({ length: count }, (_, index) => <Counter key={index} token={token} />)}
    </div>
  );
}

function NumberTile({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span className={`grid min-h-16 min-w-20 place-items-center rounded-lg border px-4 text-3xl font-black ${muted ? "border-dashed border-slate-300 bg-white text-slate-500" : "border-cyan-700/30 bg-white text-slate-950"}`}>
      {children}
    </span>
  );
}

export default function NumberNexusYear1AssessmentVisual({ visual }: { visual: Visual }) {
  const type = String(visual.type ?? "");

  if (type === "number_y1_place_value") {
    if (typeof visual.number === "number") {
      return <Surface><div className="flex justify-center"><NumberTile>{visual.number}</NumberTile></div></Surface>;
    }
    const tens = Number(visual.tens ?? 0);
    const ones = Number(visual.ones ?? 0);
    return (
      <Surface>
        <div className="flex flex-wrap items-end justify-center gap-5">
          <div className="flex gap-2" aria-label={`${tens} tens blocks`}>
            {Array.from({ length: tens }, (_, index) => <span key={index} className="h-24 w-5 rounded-sm border border-cyan-700/30 bg-cyan-100" />)}
          </div>
          <div className="grid grid-cols-5 gap-2" aria-label={`${ones} ones blocks`}>
            {Array.from({ length: ones }, (_, index) => <span key={index} className="h-5 w-5 rounded-sm border border-amber-600/35 bg-amber-100" />)}
          </div>
        </div>
      </Surface>
    );
  }

  if (type === "number_y1_part_whole") {
    const whole = visual.whole as number | null;
    const parts = (visual.parts as Array<number | null> | undefined) ?? [];
    return (
      <Surface>
        <div className="flex flex-col items-center gap-4">
          <NumberTile muted={whole === null}>{whole ?? "?"}</NumberTile>
          <div className="h-5 w-px bg-cyan-800/30" />
          <div className="flex flex-wrap justify-center gap-4">
            {parts.map((part, index) => <NumberTile key={index} muted={part === null}>{part ?? "?"}</NumberTile>)}
          </div>
        </div>
      </Surface>
    );
  }

  if (type === "number_y1_groups") {
    const suppliedGroups = Array.isArray(visual.groups) ? (visual.groups as number[]) : [];
    const total = Number(visual.total ?? 0);
    const groupSize = Number(visual.groupSize ?? 0);
    const groups = suppliedGroups.length > 0
      ? suppliedGroups
      : total > 0 && groupSize > 0
        ? [total]
        : [];
    return (
      <Surface>
        <div className="flex flex-wrap justify-center gap-3">
          {groups.map((count, groupIndex) => (
            <div key={groupIndex} className="flex flex-wrap justify-center gap-2 rounded-lg border border-cyan-800/20 bg-white p-3">
              <CounterSet count={count} />
            </div>
          ))}
        </div>
      </Surface>
    );
  }

  if (type === "number_y1_share") {
    const total = Number(visual.total ?? 0);
    const groups = Number(visual.groups ?? 0);
    return (
      <Surface>
        <div className="flex flex-col items-center gap-5">
          <CounterSet count={total} />
          <div className="grid w-full max-w-md gap-3" style={{ gridTemplateColumns: `repeat(${groups}, minmax(0, 1fr))` }}>
            {Array.from({ length: groups }, (_, index) => <span key={index} className="h-14 rounded-lg border-2 border-dashed border-cyan-800/25 bg-white" />)}
          </div>
        </div>
      </Surface>
    );
  }

  if (type === "number_y1_sequence") {
    const values = (visual.values as Array<number | null> | undefined) ?? [];
    return <Surface><div className="flex flex-wrap justify-center gap-3">{values.map((value, index) => <NumberTile key={index} muted={value === null}>{value ?? "?"}</NumberTile>)}</div></Surface>;
  }

  if (type === "number_y1_equation") {
    return <Surface><div className="text-center text-4xl font-black text-slate-950">{String(visual.expression ?? "")}</div></Surface>;
  }

  if (type === "number_y1_change") {
    const start = Number(visual.start ?? 0);
    const change = Number(visual.change ?? 0);
    const token = String(visual.token ?? "counter");
    return (
      <Surface>
        <div className="flex flex-wrap items-center justify-center gap-5">
          <CounterSet count={start} token={token} />
          <span className="text-3xl font-black text-cyan-800">+</span>
          <CounterSet count={change} token={token} />
        </div>
      </Surface>
    );
  }

  if (type === "number_y1_money") {
    const amounts = (visual.amounts as number[] | undefined) ?? [];
    const roles = (visual.roles as string[] | undefined) ?? [];
    return (
      <Surface>
        <div className="flex flex-wrap justify-center gap-3">
          {amounts.map((amount, index) => (
            <div key={index} className={`grid h-20 min-w-24 place-items-center rounded-lg border px-4 text-3xl font-black ${roles[index] === "spend" ? "border-rose-700/25 bg-rose-50" : "border-amber-700/25 bg-amber-50"}`}>${amount}</div>
          ))}
        </div>
      </Surface>
    );
  }

  if (type === "number_y1_money_compare") {
    const groups = (visual.groups as number[][] | undefined) ?? [];
    return (
      <Surface>
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((coins, groupIndex) => <div key={groupIndex} className="flex min-h-24 flex-wrap items-center justify-center gap-2 rounded-lg border border-amber-800/20 bg-white p-3">{coins.map((coin, index) => <span key={index} className="grid h-12 w-12 place-items-center rounded-full border-2 border-amber-600 bg-amber-100 text-sm font-black">{coin}c</span>)}</div>)}
        </div>
      </Surface>
    );
  }

  if (type === "number_y1_pattern") {
    const sequence = (visual.sequence as string[] | undefined) ?? [];
    return (
      <Surface>
        <div className="flex flex-wrap justify-center gap-3">
          {sequence.map((token, index) => token === "?" ? <NumberTile key={index} muted>?</NumberTile> : <GroundAssessmentToken key={index} token={token} />)}
        </div>
      </Surface>
    );
  }

  if (type === "number_y1_number_cards") {
    const values = (visual.values as number[] | undefined) ?? [];
    return <Surface><div className="flex flex-wrap justify-center gap-3">{values.map((value) => <NumberTile key={value}>{value}</NumberTile>)}</div></Surface>;
  }

  if (type === "number_y1_partition_choices") {
    const choices = (visual.choices as number[][] | undefined) ?? [];
    return <Surface><div className="grid gap-3 sm:grid-cols-3">{choices.map((parts, index) => <div key={index} className="rounded-lg border border-cyan-800/20 bg-white p-4 text-center text-2xl font-black">{parts.join(" + ")}</div>)}</div></Surface>;
  }

  if (type === "number_y1_group_choices") {
    return (
      <Surface>
        <div className="grid gap-3 sm:grid-cols-3">
          {[10, 4, 8].map((size, index) => <div key={size} className="rounded-lg border border-cyan-800/20 bg-white p-4 text-center text-xl font-black">{[3, 6, 4][index]} groups of {size}</div>)}
        </div>
      </Surface>
    );
  }

  return null;
}
