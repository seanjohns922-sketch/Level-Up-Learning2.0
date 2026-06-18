"use client";

import { useEffect, useMemo, useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

// Reusable interactive balance scale. The student fills/edits one pan; the
// scale is "solved" when both pans weigh the same (balanced). Used by
// Measurelands "Balance the Scales" and any future equivalence activity.

type BalanceTask = Extract<PracticeTask, { kind: "balanceScale" }>;
type BalanceItem = BalanceTask["leftItems"][number];

const sumWeight = (items: BalanceItem[]) => items.reduce((acc, it) => acc + it.weight, 0);

/* ── Gold/violet Meazurex shell (matches the other Measurelands cards) ── */
function Shell({
  badge,
  prompt,
  speakText,
  children,
}: {
  badge: string;
  prompt: string;
  speakText?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div
        className="rounded-[30px] border px-5 py-5 shadow-[0_14px_42px_rgba(76,29,149,0.1)]"
        style={{
          borderColor: "rgba(214,184,108,0.38)",
          background: "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)",
        }}
      >
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]"
          style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(167,139,250,0.34)", color: "#5b21b6" }}
        >
          {badge}
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-1 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">{prompt}</div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── The scale itself: a beam that tilts toward the heavier pan ── */
function Scale({
  leftItems,
  rightItems,
  leftWeight,
  rightWeight,
  onRemove,
  hideVerdict = false,
}: {
  leftItems: BalanceItem[];
  rightItems: BalanceItem[];
  leftWeight: number;
  rightWeight: number;
  onRemove?: (side: "left" | "right", index: number) => void;
  hideVerdict?: boolean;
}) {
  const diff = rightWeight - leftWeight; // >0 → right heavier (right drops)
  const angle = Math.max(-16, Math.min(16, diff * 6));
  const leftY = -angle * 1.7;
  const rightY = angle * 1.7;
  const balanced = diff === 0;

  const Pan = ({ items, side, y }: { items: BalanceItem[]; side: "left" | "right"; y: number }) => (
    <div className="flex w-[44%] flex-col items-center" style={{ transform: `translateY(${y}px)`, transition: "transform 360ms cubic-bezier(0.34,1.4,0.5,1)" }}>
      <div
        className="flex min-h-[84px] w-full flex-wrap items-end justify-center gap-1 rounded-b-[40px] rounded-t-[12px] border-2 px-2 pb-2 pt-3"
        style={{
          borderColor: balanced ? "rgba(94,234,212,0.85)" : "rgba(214,184,108,0.6)",
          background: balanced ? "rgba(204,251,241,0.55)" : "rgba(255,255,255,0.92)",
          boxShadow: "inset 0 -6px 12px rgba(180,120,20,0.12)",
        }}
      >
        {items.length === 0 ? (
          <span className="pb-3 text-xs font-bold text-[#a98b52]">empty</span>
        ) : (
          items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              onClick={() => onRemove?.(side, i)}
              disabled={!onRemove}
              className="text-3xl sm:text-4xl disabled:cursor-default"
              title={onRemove ? "Tap to remove" : undefined}
            >
              {it.icon}
            </button>
          ))
        )}
      </div>
      <div className="mt-1 h-5 w-px bg-[#b9914e]" />
    </div>
  );

  return (
    <div className="relative mx-auto max-w-[440px] rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
      {/* beam */}
      <div className="relative mx-auto h-3 w-[88%] rounded-full" style={{ background: "linear-gradient(90deg,#b45309,#d6b86c,#b45309)", transform: `rotate(${angle}deg)`, transition: "transform 360ms cubic-bezier(0.34,1.4,0.5,1)" }} />
      {/* pans hang below the beam ends */}
      <div className="mt-1 flex items-start justify-between">
        <Pan items={leftItems} side="left" y={leftY} />
        <Pan items={rightItems} side="right" y={rightY} />
      </div>
      {/* fulcrum */}
      <div className="mx-auto mt-1 h-0 w-0" style={{ borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderBottom: "26px solid #8a5a16" }} />
      <div className="mx-auto h-2 w-28 rounded-full bg-[#8a5a16]" />
      {hideVerdict ? null : balanced ? (
        <div className="mt-2 text-center text-sm font-black uppercase tracking-[0.16em] text-[#0f766e]">⚖️ Balanced!</div>
      ) : (
        <div className="mt-2 text-center text-sm font-black uppercase tracking-[0.16em] text-[#9f1239]">
          {diff > 0 ? "Right side is heavier" : "Left side is heavier"}
        </div>
      )}
    </div>
  );
}

/* ── Teaching demo: auto-cycles heavier-left → heavier-right → balanced ── */
const DEMO_STATES: Array<{ left: BalanceItem[]; right: BalanceItem[]; caption: string }> = [
  {
    left: [{ id: "d-rock", label: "Rock", icon: "🪨", weight: 3 }],
    right: [{ id: "d-feather", label: "Feather", icon: "🪶", weight: 1 }],
    caption: "The left side is heavier — it drops down.",
  },
  {
    left: [{ id: "d-leaf", label: "Leaf", icon: "🍃", weight: 1 }],
    right: [{ id: "d-melon", label: "Watermelon", icon: "🍉", weight: 3 }],
    caption: "The right side is heavier now.",
  },
  {
    left: [{ id: "d-a1", label: "Apple", icon: "🍎", weight: 2 }],
    right: [{ id: "d-a2", label: "Apple", icon: "🍎", weight: 2 }],
    caption: "Both sides weigh the same — it balances!",
  },
];

function DemoScene({ task, onCorrect }: { task: BalanceTask; onCorrect: () => void }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setPhase((p) => (p + 1) % DEMO_STATES.length), 1700);
    return () => window.clearInterval(id);
  }, []);
  const state = DEMO_STATES[phase]!;
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <Scale leftItems={state.left} rightItems={state.right} leftWeight={sumWeight(state.left)} rightWeight={sumWeight(state.right)} />
      <div className="text-center text-base font-bold text-[#5f4725]">{state.caption}</div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onCorrect}
          className="rounded-full px-6 py-3 text-lg font-black uppercase tracking-[0.12em] text-[#fff8e1] shadow-[0_16px_32px_rgba(180,120,20,0.22)] transition hover:-translate-y-0.5"
          style={{ background: "linear-gradient(135deg, rgba(120,53,15,0.96), rgba(180,120,20,0.96), rgba(214,184,108,0.92))" }}
        >
          Start Balancing
        </button>
      </div>
    </Shell>
  );
}

/* ── Recognise: judge a pre-set scale as Balanced / Not Balanced ── */
function JudgeScene({ task, onCorrect, onWrong }: { task: BalanceTask; onCorrect: () => void; onWrong: () => void }) {
  const [locked, setLocked] = useState(false);
  const lw = sumWeight(task.leftItems);
  const rw = sumWeight(task.rightItems);
  const isBalanced = lw === rw;

  function answer(saidBalanced: boolean) {
    if (locked) return;
    setLocked(true);
    const correct = saidBalanced === isBalanced;
    window.setTimeout(() => (correct ? onCorrect() : onWrong()), 650);
  }

  return (
    <Shell badge={task.badgeLabel ?? "Balanced or Not?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <Scale leftItems={task.leftItems} rightItems={task.rightItems} leftWeight={lw} rightWeight={rw} hideVerdict />
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => answer(true)}
          disabled={locked}
          className="flex min-h-[88px] items-center justify-center gap-2 rounded-[24px] border-2 border-[rgba(94,234,212,0.6)] bg-[rgba(204,251,241,0.4)] text-xl font-black text-[#0f766e] shadow-sm transition hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
        >
          <span className="text-4xl">⚖️</span> Balanced
        </button>
        <button
          type="button"
          onClick={() => answer(false)}
          disabled={locked}
          className="flex min-h-[88px] items-center justify-center gap-2 rounded-[24px] border-2 border-[rgba(214,184,108,0.6)] bg-[#fffaf0] text-xl font-black text-[#9f1239] shadow-sm transition hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
        >
          <span className="text-4xl">↔️</span> Not Balanced
        </button>
      </div>
    </Shell>
  );
}

export function MeasurelandsBalanceScaleCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: BalanceTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  if (task.demo) return <DemoScene task={task} onCorrect={onCorrect} />;
  if (task.judge) return <JudgeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;

  const isPile = task.supply.mode === "pile";
  const unit = task.supply.items[0]!;
  const maxAdds = task.supply.maxAdds ?? 6;

  const baseTarget = task.target === "left" ? task.leftItems : task.rightItems;
  const fixed = task.target === "left" ? task.rightItems : task.leftItems;

  const [added, setAdded] = useState<BalanceItem[]>([]);
  const [locked, setLocked] = useState(false);

  const targetItems = useMemo(() => [...baseTarget, ...added], [baseTarget, added]);
  const targetWeight = sumWeight(targetItems);
  const fixedWeight = sumWeight(fixed);

  const leftItems = task.target === "left" ? targetItems : fixed;
  const rightItems = task.target === "left" ? fixed : targetItems;
  const leftWeight = task.target === "left" ? targetWeight : fixedWeight;
  const rightWeight = task.target === "left" ? fixedWeight : targetWeight;

  const balanced = leftWeight === rightWeight;

  // Pile mode: forgiving — solved the moment it balances (after the student has
  // added at least one). Auto-finish with a short celebratory settle.
  useEffect(() => {
    if (isPile && !locked && added.length > 0 && balanced) {
      setLocked(true);
      window.setTimeout(() => onCorrect(), 650);
    }
  }, [isPile, locked, added.length, balanced, onCorrect]);

  function addUnit() {
    if (locked || !isPile || added.length >= maxAdds) return;
    setAdded((cur) => [...cur, { ...unit, id: `${unit.id}-${cur.length}-${Date.now()}` }]);
  }
  function removeFromTarget(index: number) {
    if (locked || !isPile) return;
    // Only the added items are removable (base items are fixed).
    const addedStart = baseTarget.length;
    if (index < addedStart) return;
    setAdded((cur) => cur.filter((_, i) => i !== index - addedStart));
  }

  // Shelf mode: pick ONE candidate; first pick is scored against balance.
  function pickCandidate(candidate: BalanceItem) {
    if (locked || isPile) return;
    setAdded([candidate]);
    setLocked(true);
    const willBalance = fixedWeight === candidate.weight; // target started empty
    window.setTimeout(() => (willBalance ? onCorrect() : onWrong()), 650);
  }

  return (
    <Shell badge={task.badgeLabel ?? "Balance the Scales"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <Scale
        leftItems={leftItems}
        rightItems={rightItems}
        leftWeight={leftWeight}
        rightWeight={rightWeight}
        onRemove={isPile ? (side, i) => (side === task.target ? removeFromTarget(i) : undefined) : undefined}
      />

      {isPile ? (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={addUnit}
            disabled={locked || added.length >= maxAdds}
            className="flex min-h-[72px] items-center justify-center gap-2 rounded-[22px] border-2 border-[rgba(214,184,108,0.6)] bg-[#fffaf0] px-6 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40"
          >
            <span className="text-3xl">{unit.icon}</span> Add a {unit.label}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {task.supply.items.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              onClick={() => pickCandidate(candidate)}
              disabled={locked}
              className="flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] shadow-sm transition hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
            >
              <span className="flex max-w-full flex-wrap items-center justify-center gap-0.5 text-3xl leading-none sm:text-4xl">{candidate.icon}</span>
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#5f4725]">{candidate.label}</span>
            </button>
          ))}
        </div>
      )}
    </Shell>
  );
}
