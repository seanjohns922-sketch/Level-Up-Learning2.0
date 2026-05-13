"use client";

import { useEffect, useMemo, useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type GroundCollectTask = Extract<PracticeTask, { kind: "groundCollect" }>;
type GroundBuildTask = Extract<PracticeTask, { kind: "groundBuild" }>;
type GroundCompareTask = Extract<PracticeTask, { kind: "groundCompare" }>;
type GroundFlashTask = Extract<PracticeTask, { kind: "groundFlash" }>;
type GroundHuntTask = Extract<PracticeTask, { kind: "groundHunt" }>;
type GroundSequenceTask = Extract<PracticeTask, { kind: "groundSequence" }>;
type GroundTapCountTask = Extract<PracticeTask, { kind: "groundTapCount" }>;
type GroundMoveCountTask = Extract<PracticeTask, { kind: "groundMoveCount" }>;
type GroundFeedTask = Extract<PracticeTask, { kind: "groundFeed" }>;
type GroundSoundCountTask = Extract<PracticeTask, { kind: "groundSoundCount" }>;
type GroundOrderTapTask = Extract<PracticeTask, { kind: "groundOrderTap" }>;
type GroundGrowingCountTask = Extract<PracticeTask, { kind: "groundGrowingCount" }>;

const OBJECT_META = {
  dots: { label: "dots", emoji: "●" },
  gems: { label: "gems", emoji: "◆" },
  stars: { label: "stars", emoji: "★" },
  blocks: { label: "blocks", emoji: "■" },
  robot_tokens: { label: "robot tokens", emoji: "⬢" },
  energy_orbs: { label: "energy orbs", emoji: "⬤" },
  crystals: { label: "crystals", emoji: "✦" },
  bolts: { label: "bolts", emoji: "⚡" },
  futuristic_coins: { label: "coins", emoji: "◉" },
  planets: { label: "planets", emoji: "🪐" },
  rockets: { label: "rockets", emoji: "🚀" },
  number_orbs: { label: "number orbs", emoji: "🔵" },
} as const;

type GroundPatternLayout = GroundFlashTask["patternLayout"];

function getPatternGrid(layout: GroundPatternLayout, quantity: number) {
  if (layout === "ten_frame") {
    return { columns: 5, slots: 10, filled: Array.from({ length: quantity }, (_, index) => index) };
  }
  if (layout === "finger") {
    return { columns: 5, slots: 5, filled: Array.from({ length: Math.min(quantity, 5) }, (_, index) => index) };
  }
  if (layout === "domino") {
    const patterns: Record<number, number[]> = {
      1: [1],
      2: [0, 2],
      3: [0, 1, 2],
      4: [0, 2, 3, 5],
      5: [0, 1, 2, 3, 5],
      6: [0, 1, 2, 3, 4, 5],
      7: [0, 1, 2, 3, 4, 5, 6],
      8: [0, 1, 2, 3, 4, 5, 6, 7],
      9: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      10: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    };
    return { columns: 2, slots: 10, filled: patterns[quantity] ?? Array.from({ length: Math.min(quantity, 10) }, (_, index) => index) };
  }
  if (layout === "symmetry") {
    const patterns: Record<number, number[]> = {
      1: [2],
      2: [1, 3],
      3: [1, 2, 3],
      4: [0, 1, 3, 4],
      5: [0, 1, 2, 3, 4],
      6: [0, 1, 3, 4, 6, 7],
      7: [0, 1, 2, 3, 4, 6, 7],
      8: [0, 1, 2, 3, 4, 5, 6, 7],
      9: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      10: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    };
    return { columns: 5, slots: 10, filled: patterns[quantity] ?? Array.from({ length: Math.min(quantity, 10) }, (_, index) => index) };
  }
  const dicePatterns: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };
  return { columns: 3, slots: 9, filled: dicePatterns[quantity] ?? Array.from({ length: Math.min(quantity, 9) }, (_, index) => index) };
}

function StructuredReveal({ quantity, objectType, patternLayout }: { quantity: number; objectType: keyof typeof OBJECT_META; patternLayout?: GroundPatternLayout }) {
  const meta = OBJECT_META[objectType];
  const grid = patternLayout ? getPatternGrid(patternLayout, quantity) : null;
  if (!grid) {
    return (
      <div className="flex flex-wrap justify-center gap-3">
        {Array.from({ length: quantity }).map((_, index) => (
          <span key={`${objectType}-${index}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-3xl text-teal-700 shadow-sm">
            {meta.emoji}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="mx-auto grid max-w-[240px] justify-center gap-3" style={{ gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: grid.slots }).map((_, index) => {
        const filled = grid.filled.includes(index);
        return (
          <span key={`${objectType}-${index}`} className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-3xl ${filled ? "bg-white text-teal-700 shadow-sm" : "bg-transparent text-transparent"}`}>
            {meta.emoji}
          </span>
        );
      })}
    </div>
  );
}

function GroundMiniShell({
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
      <div className="rounded-[28px] border border-cyan-200/70 bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-5 shadow-[0_6px_18px_rgba(13,148,136,0.08)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-800">
          {badge}
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-1 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
            {prompt}
          </div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

function GroundToken({
  objectType,
  selected = false,
  onClick,
}: {
  objectType: keyof typeof OBJECT_META;
  selected?: boolean;
  onClick?: () => void;
}) {
  const meta = OBJECT_META[objectType];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex h-14 w-14 items-center justify-center rounded-full border-2 text-3xl transition sm:h-16 sm:w-16 ${
        selected
          ? "border-teal-400 bg-teal-100 text-teal-800 shadow-[0_0_18px_rgba(45,212,191,0.25)]"
          : "border-cyan-200 bg-white text-teal-700 hover:border-cyan-300 hover:bg-cyan-50"
      }`}
    >
      {meta.emoji}
    </button>
  );
}

function GroundNumeralOption({
  numeral,
  onClick,
}: {
  numeral: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[112px] items-center justify-center rounded-[24px] border-2 border-cyan-200 bg-white text-5xl font-black text-teal-900 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.14)] active:scale-[0.98]"
    >
      {numeral}
    </button>
  );
}

function GroundCountBadge({ count, target }: { count: number; target?: number }) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-2xl bg-cyan-50 px-4 py-2">
      <div className="text-sm font-black uppercase tracking-[0.16em] text-teal-800">Count</div>
      <div className="text-2xl font-black text-teal-900">
        {count}
        {typeof target === "number" ? ` / ${target}` : ""}
      </div>
    </div>
  );
}

export function GroundCollectTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundCollectTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  function toggle(id: number) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  }

  function check() {
    if (selectedIds.length === task.targetNumber) onCorrect();
    else onWrong();
  }

  return (
    <GroundMiniShell badge="Collect Game" prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-cyan-50 px-4 py-2">
          <div className="text-sm font-black uppercase tracking-[0.16em] text-teal-800">Collected</div>
          <div className="text-2xl font-black text-teal-900">
            {selectedIds.length} / {task.targetNumber}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {Array.from({ length: task.totalObjects }).map((_, index) => (
            <GroundToken
              key={`${task.objectType}-${index}`}
              objectType={task.objectType}
              selected={selectedIds.includes(index)}
              onClick={() => toggle(index)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setSelectedIds([])}
          className="rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-4 text-base font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={check}
          className="rounded-[22px] bg-gradient-to-r from-teal-600 to-cyan-500 px-4 py-4 text-base font-black text-white shadow-[0_10px_24px_rgba(13,148,136,0.18)] transition hover:brightness-110"
        >
          Done
        </button>
      </div>
    </GroundMiniShell>
  );
}

export function GroundBuildTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundBuildTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [built, setBuilt] = useState(task.startingBuilt ?? 0);
  const compareMode = task.compareMode ?? "exact";
  const compareBase = task.compareBase ?? task.targetNumber;
  const traySize = Math.max(5, Math.min(10, task.maxBuild ?? task.targetNumber ?? compareBase));
  const tray = useMemo(() => Array.from({ length: traySize }), [traySize]);

  function check() {
    const correct =
      compareMode === "more_than"
        ? built > compareBase
        : compareMode === "less_than"
          ? built < compareBase
          : built === task.targetNumber;
    if (correct) onCorrect();
    else onWrong();
  }

  return (
    <GroundMiniShell badge="Build Game" prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-cyan-50 px-4 py-2">
          <div className="text-sm font-black uppercase tracking-[0.16em] text-teal-800">Built</div>
          <div className="text-2xl font-black text-teal-900">{built}</div>
        </div>
        {task.referenceGroup ? (
          <div className="mb-4 rounded-[22px] border-2 border-cyan-200 bg-cyan-50 p-3">
            <div className="mb-2 text-center text-xs font-black uppercase tracking-[0.16em] text-teal-800">Match this group</div>
            <CompareGroupCard
              quantity={task.referenceGroup.quantity}
              objectType={task.referenceGroup.objectType}
              patternLayout={task.referenceGroup.patternLayout}
            />
          </div>
        ) : null}
        {compareMode !== "exact" ? (
          <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-teal-800">
            {compareMode === "more_than" ? `Make more than ${compareBase}` : `Make less than ${compareBase}`}
          </div>
        ) : null}
        <div className="grid grid-cols-5 gap-3">
          {tray.map((_, index) => (
            <div
              key={`tray-${index}`}
              className="flex h-14 items-center justify-center rounded-full border-2 border-dashed border-cyan-200 bg-cyan-50/50 text-3xl sm:h-16"
            >
              {index < built ? OBJECT_META[task.objectType].emoji : ""}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setBuilt((current) => Math.max(0, current - 1))}
          className="rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-4 text-2xl font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setBuilt((current) => Math.min(traySize, current + 1))}
          className="rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-4 text-2xl font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
        >
          +
        </button>
        <button
          type="button"
          onClick={check}
          className="rounded-[22px] bg-gradient-to-r from-teal-600 to-cyan-500 px-4 py-4 text-base font-black text-white shadow-[0_10px_24px_rgba(13,148,136,0.18)] transition hover:brightness-110"
        >
          Done
        </button>
      </div>
    </GroundMiniShell>
  );
}

function CompareGroupCard({
  quantity,
  objectType,
  patternLayout,
  emphasized = false,
}: {
  quantity: number;
  objectType: keyof typeof OBJECT_META;
  patternLayout?: GroundPatternLayout;
  emphasized?: boolean;
}) {
  return (
    <div className={`rounded-[22px] border-2 px-3 py-3 shadow-sm transition ${emphasized ? "border-teal-300 bg-teal-50" : "border-cyan-200 bg-white"}`}>
      <StructuredReveal quantity={quantity} objectType={objectType} patternLayout={patternLayout} />
    </div>
  );
}

export function GroundCompareTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundCompareTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [orderProgress, setOrderProgress] = useState<string[]>([]);
  const sortedOrder = useMemo(
    () => [...task.groups].sort((a, b) => a.quantity - b.quantity).map((group) => group.id),
    [task.groups]
  );

  function tapGroup(groupId: string) {
    if (task.comparisonType === "order") {
      if (orderProgress.includes(groupId)) return;
      const expectedId = sortedOrder[orderProgress.length];
      if (groupId !== expectedId) {
        setOrderProgress([]);
        onWrong();
        return;
      }
      const next = [...orderProgress, groupId];
      if (next.length === sortedOrder.length) {
        onCorrect();
        return;
      }
      setOrderProgress(next);
      return;
    }

    if (groupId === task.correctGroupId) onCorrect();
    else onWrong();
  }

  function answerYesNo(answer: boolean) {
    const left = task.groups[0]?.quantity ?? 0;
    const right = task.groups[1]?.quantity ?? 0;
    const isTrue =
      task.comparisonType === "equal"
        ? left === right
        : task.statementRelation === "less"
          ? left < right
          : task.statementRelation === "equal"
            ? left === right
            : left > right;
    if (answer === isTrue) onCorrect();
    else onWrong();
  }

  const badge =
    task.helperVariant === "numbot"
      ? "Numbot Compare"
      : task.helperVariant === "battle"
        ? "Group Battle"
        : task.helperVariant === "flash"
          ? "Quick Eyes"
          : task.helperVariant === "ten_frame"
            ? "Ten Frame Compare"
            : "Compare Game";

  return (
    <GroundMiniShell badge={badge} prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        {task.referenceGroup ? (
          <div className="mb-4 rounded-[22px] border-2 border-cyan-200 bg-cyan-50 p-3">
            <div className="mb-2 text-center text-xs font-black uppercase tracking-[0.16em] text-teal-800">
              {task.comparisonType === "different" ? "Find the different group" : "Match this group"}
            </div>
            <CompareGroupCard
              quantity={task.referenceGroup.quantity}
              objectType={task.referenceGroup.objectType}
              patternLayout={task.referenceGroup.patternLayout}
            />
          </div>
        ) : null}
        {task.comparisonType === "order" ? (
          <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-teal-800">
            Tap from smallest to biggest
          </div>
        ) : null}
        <div className={`grid gap-3 ${task.groups.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          {task.groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => tapGroup(group.id)}
              disabled={task.comparisonType === "equal" || task.comparisonType === "statement"}
              className="text-left disabled:cursor-default"
            >
              <CompareGroupCard
                quantity={group.quantity}
                objectType={group.objectType}
                patternLayout={group.patternLayout}
                emphasized={orderProgress.includes(group.id)}
              />
            </button>
          ))}
        </div>
      </div>

      {task.comparisonType === "equal" || task.comparisonType === "statement" ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => answerYesNo(true)}
            className="rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-4 text-2xl font-black uppercase text-teal-900 transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => answerYesNo(false)}
            className="rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-4 text-2xl font-black uppercase text-teal-900 transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            No
          </button>
        </div>
      ) : null}
    </GroundMiniShell>
  );
}

export function GroundFlashTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundFlashTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setRevealed(false), task.revealMs ?? 1200);
    return () => window.clearTimeout(timeout);
  }, [task]);

  return (
    <GroundMiniShell badge="Flash Game" prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-teal-800">
          {revealed ? "Look carefully" : "Now tap the number"}
        </div>
        <div className="flex min-h-[108px] items-center justify-center rounded-[20px] bg-cyan-50 px-4 py-4">
          {revealed ? (
            task.revealType === "numeral" ? (
              <div className="text-7xl font-black text-teal-900 sm:text-8xl">{task.displayNumber ?? task.targetNumber}</div>
            ) : (
              <StructuredReveal quantity={task.displayNumber ?? task.targetNumber} objectType={task.objectType} patternLayout={task.patternLayout} />
            )
          ) : (
            <div className="text-lg font-black text-slate-500">{task.promptAfterReveal ?? "What did you see?"}</div>
          )}
        </div>
      </div>

      <div className={task.options.length === 4 ? "grid grid-cols-2 gap-3 sm:grid-cols-4" : "grid grid-cols-3 gap-3"}>
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="flex min-h-[112px] items-center justify-center rounded-[24px] border-2 border-cyan-200 bg-white text-5xl font-black text-teal-900 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.14)] active:scale-[0.98]"
          >
            {option.numeral}
          </button>
        ))}
      </div>
    </GroundMiniShell>
  );
}

export function GroundHuntTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundHuntTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function tapTile(id: string, isTarget: boolean) {
    if (selectedIds.includes(id)) return;
    if (!isTarget) {
      onWrong();
      setSelectedIds([]);
      return;
    }

    const nextSelected = [...selectedIds, id];
    setSelectedIds(nextSelected);
    const totalTargets = task.tiles.filter((tile) => tile.isTarget).length;
    if (nextSelected.length === totalTargets) {
      onCorrect();
    }
  }

  return (
    <GroundMiniShell badge="Number Hunt" prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <GroundCountBadge count={selectedIds.length} target={task.tiles.filter((tile) => tile.isTarget).length} />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {task.tiles.map((tile) => (
            <button
              key={tile.id}
              type="button"
              onClick={() => tapTile(tile.id, tile.isTarget)}
              className={`flex min-h-[88px] items-center justify-center rounded-[22px] border-2 text-4xl font-black shadow-sm transition ${
                selectedIds.includes(tile.id)
                  ? "border-teal-400 bg-teal-100 text-teal-900"
                  : "border-cyan-200 bg-white text-teal-900 hover:border-cyan-300 hover:bg-cyan-50"
              }`}
            >
              {tile.numeral}
            </button>
          ))}
        </div>
      </div>
    </GroundMiniShell>
  );
}

export function GroundSequenceTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundSequenceTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <GroundMiniShell badge="Missing Number" prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {task.sequence.map((value, index) => (
            <div
              key={`${task.targetNumber}-seq-${index}`}
              className={`flex h-16 min-w-[72px] items-center justify-center rounded-[20px] border-2 px-4 text-3xl font-black shadow-sm sm:h-20 sm:min-w-[88px] sm:text-4xl ${
                value === "__"
                  ? "border-dashed border-cyan-300 bg-cyan-50 text-cyan-500"
                  : "border-cyan-200 bg-white text-teal-900"
              }`}
            >
              {value === "__" ? "?" : value}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {task.options.map((option) => (
          <GroundNumeralOption
            key={option.id}
            numeral={option.numeral}
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
          />
        ))}
      </div>
    </GroundMiniShell>
  );
}

export function GroundTapCountTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundTapCountTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [tappedIds, setTappedIds] = useState<number[]>([]);

  function tapObject(id: number) {
    setTappedIds((current) => (current.includes(id) ? current : [...current, id]));
  }

  const allTapped = tappedIds.length === task.targetNumber;

  return (
    <GroundMiniShell badge="Tap Count" prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <GroundCountBadge count={tappedIds.length} target={task.targetNumber} />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {Array.from({ length: task.targetNumber }).map((_, index) => (
            <GroundToken
              key={`${task.objectType}-${index}`}
              objectType={task.objectType}
              selected={tappedIds.includes(index)}
              onClick={() => tapObject(index)}
            />
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-teal-800">
          {allTapped ? "How many?" : "Tap each one first"}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {task.options.map((option) => (
            <GroundNumeralOption
              key={option.id}
              numeral={option.numeral}
              onClick={() => {
                if (!allTapped) {
                  onWrong();
                  return;
                }
                if (option.id === task.correctOptionId) onCorrect();
                else onWrong();
              }}
            />
          ))}
        </div>
      </div>
    </GroundMiniShell>
  );
}

export function GroundMoveCountTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundMoveCountTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [movedIds, setMovedIds] = useState<number[]>([]);

  function moveObject(id: number) {
    setMovedIds((current) => (current.includes(id) ? current : [...current, id]));
  }

  const allMoved = movedIds.length === task.targetNumber;

  return (
    <GroundMiniShell badge="Move To Count" prompt={task.prompt} speakText={task.speakText}>
      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
          <GroundCountBadge count={movedIds.length} target={task.targetNumber} />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {Array.from({ length: task.targetNumber }).map((_, index) => (
              <GroundToken
                key={`${task.objectType}-${index}`}
                objectType={task.objectType}
                selected={movedIds.includes(index)}
                onClick={() => moveObject(index)}
              />
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border-2 border-dashed border-cyan-300 bg-cyan-50/70 p-4 shadow-sm">
          <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-teal-800">
            Counting Zone
          </div>
          <div className="grid min-h-[140px] grid-cols-2 gap-2">
            {Array.from({ length: movedIds.length }).map((_, index) => (
              <span
                key={`moved-${index}`}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-teal-700 shadow-sm"
              >
                {OBJECT_META[task.objectType].emoji}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-teal-800">
          {allMoved ? "How many?" : "Move each one first"}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {task.options.map((option) => (
            <GroundNumeralOption
              key={option.id}
              numeral={option.numeral}
              onClick={() => {
                if (!allMoved) {
                  onWrong();
                  return;
                }
                if (option.id === task.correctOptionId) onCorrect();
                else onWrong();
              }}
            />
          ))}
        </div>
      </div>
    </GroundMiniShell>
  );
}

export function GroundFeedTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundFeedTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [fedIds, setFedIds] = useState<number[]>([]);

  function feedObject(id: number) {
    setFedIds((current) => (current.includes(id) ? current : [...current, id]));
  }

  function check() {
    if (fedIds.length === task.targetNumber) onCorrect();
    else onWrong();
  }

  return (
    <GroundMiniShell badge="Feed Numbot" prompt={task.prompt} speakText={task.speakText}>
      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
          <GroundCountBadge count={fedIds.length} target={task.targetNumber} />
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {Array.from({ length: task.totalObjects }).map((_, index) => (
              <GroundToken
                key={`${task.objectType}-${index}`}
                objectType={task.objectType}
                selected={fedIds.includes(index)}
                onClick={() => feedObject(index)}
              />
            ))}
          </div>
        </div>
        <div className="rounded-[24px] border border-cyan-200 bg-gradient-to-br from-teal-100 via-cyan-50 to-white p-4 shadow-sm">
          <div className="mb-2 text-center text-sm font-black uppercase tracking-[0.16em] text-teal-800">
            Numbot Bouncer
          </div>
          <div className="mb-3 flex justify-center text-6xl">🤖</div>
          <div className="rounded-full bg-white px-4 py-2 text-center text-xl font-black text-teal-900 shadow-sm">
            {fedIds.length} / {task.targetNumber}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setFedIds([])}
          className="rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-4 text-base font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={check}
          className="rounded-[22px] bg-gradient-to-r from-teal-600 to-cyan-500 px-4 py-4 text-base font-black text-white shadow-[0_10px_24px_rgba(13,148,136,0.18)] transition hover:brightness-110"
        >
          Feed
        </button>
      </div>
    </GroundMiniShell>
  );
}

export function GroundSoundCountTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundSoundCountTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [activePulse, setActivePulse] = useState(-1);

  function replayPulses() {
    setActivePulse(-1);
    for (let index = 0; index < task.targetNumber; index += 1) {
      window.setTimeout(() => setActivePulse(index), index * 500);
    }
    window.setTimeout(() => setActivePulse(-1), task.targetNumber * 500);
  }

  useEffect(() => {
    replayPulses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task]);

  return (
    <GroundMiniShell badge="Sound Count" prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <div className="mb-4 text-center text-sm font-black uppercase tracking-[0.16em] text-teal-800">
          Listen and watch
        </div>
        <div className="mb-4 flex justify-center gap-3">
          {Array.from({ length: task.targetNumber }).map((_, index) => (
            <span
              key={`pulse-${index}`}
              className={`inline-flex h-14 w-14 items-center justify-center rounded-full border-2 text-2xl transition ${
                activePulse === index
                  ? "border-teal-400 bg-teal-100 text-teal-800 shadow-[0_0_18px_rgba(45,212,191,0.25)]"
                  : "border-cyan-200 bg-cyan-50 text-cyan-500"
              }`}
            >
              〰
            </span>
          ))}
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={replayPulses}
            className="rounded-[20px] border-2 border-cyan-200 bg-white px-5 py-3 text-base font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
          >
            Replay
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {task.options.map((option) => (
          <GroundNumeralOption
            key={option.id}
            numeral={option.numeral}
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
          />
        ))}
      </div>
    </GroundMiniShell>
  );
}


export function GroundOrderTapTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundOrderTapTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [progressIndex, setProgressIndex] = useState(0);
  const direction = task.direction ?? "ASC";
  const expectedNumeral = direction === "DESC" ? task.targetNumber - progressIndex : progressIndex + 1;

  function tapTile(numeral: number) {
    if (numeral !== expectedNumeral) {
      setProgressIndex(0);
      onWrong();
      return;
    }

    const nextIndex = progressIndex + 1;
    if (nextIndex >= task.targetNumber) {
      onCorrect();
      return;
    }
    setProgressIndex(nextIndex);
  }

  return (
    <GroundMiniShell badge="Number Path" prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <GroundCountBadge count={progressIndex} target={task.targetNumber} />
        <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-teal-800">
          Tap {expectedNumeral} next
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {task.tiles.map((tile) => {
            const isCompleted =
              direction === "DESC"
                ? tile.numeral > expectedNumeral && tile.numeral <= task.targetNumber
                : tile.numeral <= progressIndex;
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => tapTile(tile.numeral)}
                className={`flex min-h-[88px] items-center justify-center rounded-[22px] border-2 text-4xl font-black shadow-sm transition ${
                  isCompleted
                    ? "border-teal-400 bg-teal-100 text-teal-900"
                    : "border-cyan-200 bg-white text-teal-900 hover:border-cyan-300 hover:bg-cyan-50"
                }`}
              >
                {tile.numeral}
              </button>
            );
          })}
        </div>
      </div>
    </GroundMiniShell>
  );
}

export function GroundGrowingCountTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundGrowingCountTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const timeouts: number[] = [];
    for (let index = 0; index < task.targetNumber; index += 1) {
      timeouts.push(window.setTimeout(() => setVisibleCount(index + 1), index * 420));
    }
    return () => {
      timeouts.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, [task]);

  return (
    <GroundMiniShell badge="Rocket Count" prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-teal-800">
          Count as they appear
        </div>
        <div className="flex min-h-[120px] flex-wrap justify-center gap-3 rounded-[20px] bg-cyan-50 px-4 py-4">
          {Array.from({ length: visibleCount }).map((_, index) => (
            <span
              key={`${task.objectType}-${index}`}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-3xl text-teal-700 shadow-sm"
            >
              {OBJECT_META[task.objectType].emoji}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {task.options.map((option) => (
          <GroundNumeralOption
            key={option.id}
            numeral={option.numeral}
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
          />
        ))}
      </div>
    </GroundMiniShell>
  );
}
