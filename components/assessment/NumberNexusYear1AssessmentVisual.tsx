"use client";

import { BookOpen, Circle, CircleDot, Gamepad2, Puzzle, Sprout, WalletCards, Wind } from "lucide-react";
import { GroundAssessmentToken } from "@/components/assessment/NumberNexusGroundAssessmentVisual";
import { renderCoins } from "@/components/week7/moneyAssets";

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

function MoneyItemIcon({ label }: { label: string }) {
  const normalized = label.toLowerCase();
  const Icon = normalized.includes("puzzle")
    ? Puzzle
    : normalized.includes("kite")
      ? Wind
      : normalized.includes("game")
        ? Gamepad2
        : normalized.includes("ball")
          ? CircleDot
          : WalletCards;
  return <Icon className="h-8 w-8" aria-hidden />;
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
        <div className="flex flex-wrap items-start justify-center gap-8 sm:gap-12">
          <div className="flex flex-col items-center gap-3">
            <div className="text-sm font-black text-cyan-900">Tens</div>
            <div className="flex items-end gap-2" aria-label={`${tens} tens blocks, worth ${tens * 10}`}>
              {Array.from({ length: tens }, (_, rodIndex) => (
                <span key={rodIndex} className="grid overflow-hidden rounded-sm border-2 border-cyan-700 bg-cyan-100 shadow-sm">
                  {Array.from({ length: 10 }, (__, unitIndex) => (
                    <span key={unitIndex} className="h-2.5 w-7 border-b border-cyan-700/35 last:border-b-0" />
                  ))}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="text-sm font-black text-amber-900">Ones</div>
            <div className="grid grid-cols-5 gap-2" aria-label={`${ones} ones blocks`}>
              {Array.from({ length: ones }, (_, index) => <span key={index} className="h-7 w-7 rounded-sm border-2 border-amber-600/55 bg-amber-100 shadow-sm" />)}
            </div>
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
    const labels = (visual.labels as string[] | undefined) ?? [];
    return (
      <Surface>
        <div className={`grid gap-4 ${amounts.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          {amounts.map((amount, index) => (
            <div key={index} className={`flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg border p-4 ${roles[index] === "spend" ? "border-rose-700/20 bg-rose-50" : "border-amber-700/20 bg-amber-50"}`}>
              <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                <MoneyItemIcon label={labels[index] ?? roles[index] ?? "Money"} />
                <span>{labels[index] ?? (roles[index] === "spend" ? "Item" : "Money")}</span>
              </div>
              <div className="flex min-h-12 items-center justify-center">{renderCoins(amount)}</div>
            </div>
          ))}
        </div>
      </Surface>
    );
  }

  if (type === "number_y1_money_compare") {
    const groups = (visual.groups as number[][] | undefined) ?? [];
    const labels = (visual.labels as string[] | undefined) ?? ["Mia", "Sam"];
    return (
      <Surface>
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((coins, groupIndex) => (
            <div key={groupIndex} className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg border border-amber-800/20 bg-white p-4">
              <div className="text-sm font-black text-slate-700">{labels[groupIndex]}</div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {coins.map((coin, index) => <div key={index}>{renderCoins(coin)}</div>)}
              </div>
            </div>
          ))}
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
