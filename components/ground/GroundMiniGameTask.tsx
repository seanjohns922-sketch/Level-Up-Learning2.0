"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
type BuildVisualStyle = GroundBuildTask["visualStyle"];
type CompareVisualStyle = GroundCompareTask["visualStyle"];

function getPatternGrid(layout: GroundPatternLayout, quantity: number) {
  if (layout === "ten_frame") {
    return { columns: 5, slots: quantity > 10 ? 20 : 10, filled: Array.from({ length: quantity }, (_, index) => index) };
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

function StructuredFrame({
  quantity,
  objectType,
  columns,
  slots,
  filled,
}: {
  quantity: number;
  objectType: keyof typeof OBJECT_META;
  columns: number;
  slots: number;
  filled: number[];
}) {
  const meta = OBJECT_META[objectType];
  return (
    <div className="mx-auto grid justify-center gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {Array.from({ length: slots }).map((_, index) => {
        const isFilled = filled.includes(index);
        return (
          <span key={`${objectType}-${quantity}-${index}`} className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-3xl ${isFilled ? "bg-white text-teal-700 shadow-sm" : "bg-transparent text-transparent"}`}>
            {meta.emoji}
          </span>
        );
      })}
    </div>
  );
}

function StructuredReveal({ quantity, objectType, patternLayout }: { quantity: number; objectType: keyof typeof OBJECT_META; patternLayout?: GroundPatternLayout }) {
  const meta = OBJECT_META[objectType];
  if (patternLayout === "ten_frame" && quantity > 10) {
    return (
      <div className="mx-auto flex max-w-[260px] flex-col gap-3">
        <div className="rounded-[18px] border border-cyan-200 bg-white p-2 shadow-sm">
          <div className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.16em] text-teal-700">Full 10</div>
          <StructuredFrame quantity={10} objectType={objectType} columns={5} slots={10} filled={Array.from({ length: 10 }, (_, index) => index)} />
        </div>
        <div className="rounded-[18px] border border-cyan-200 bg-white p-2 shadow-sm">
          <div className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.16em] text-teal-700">Extras</div>
          <StructuredFrame quantity={quantity - 10} objectType={objectType} columns={5} slots={10} filled={Array.from({ length: quantity - 10 }, (_, index) => index)} />
        </div>
      </div>
    );
  }
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
  return <StructuredFrame quantity={quantity} objectType={objectType} columns={grid.columns} slots={grid.slots} filled={grid.filled} />;
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

function getBuildVisualStyle(task: GroundBuildTask): NonNullable<BuildVisualStyle> {
  return task.visualStyle ?? (task.targetNumber > 10 ? "double_ten_frame" : "build_trays");
}

function getCompareVisualStyle(task: GroundCompareTask): NonNullable<CompareVisualStyle> {
  return task.visualStyle ?? (task.targetNumber > 10 ? "double_ten_frame" : "balance_panels");
}

function getBoardConfig(style: BuildVisualStyle | CompareVisualStyle | undefined) {
  switch (style) {
    case "crate_system":
      return { columns: 4, sectionSize: 4, panelClass: "rounded-[24px] border border-amber-200 bg-amber-50/60 p-3 shadow-sm", cellClass: "rounded-[14px] border-2 border-amber-200 bg-white" };
    case "collection_shelves":
      return { columns: 5, sectionSize: 5, panelClass: "rounded-[24px] border border-cyan-200 bg-slate-50/80 p-3 shadow-sm", cellClass: "rounded-[12px] border-2 border-cyan-200 bg-white" };
    case "reactor_cells":
      return { columns: 5, sectionSize: 10, panelClass: "rounded-[24px] border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-3 shadow-[0_0_20px_rgba(34,211,238,0.1)]", cellClass: "rounded-[16px] border-2 border-cyan-200 bg-slate-900/5" };
    case "stacked_groups":
      return { columns: 5, sectionSize: 5, panelClass: "rounded-[24px] border border-cyan-200 bg-white p-3 shadow-sm", cellClass: "rounded-full border-2 border-cyan-200 bg-cyan-50" };
    case "energy_cell_grid":
      return { columns: 5, sectionSize: 10, panelClass: "rounded-[24px] border border-cyan-200 bg-cyan-50/70 p-3 shadow-sm", cellClass: "rounded-[14px] border-2 border-cyan-200 bg-white" };
    case "double_ten_frame":
      return { columns: 5, sectionSize: 10, panelClass: "rounded-[24px] border border-cyan-200 bg-white p-3 shadow-sm", cellClass: "rounded-full border-2 border-cyan-200 bg-cyan-50" };
    default:
      return { columns: 5, sectionSize: 5, panelClass: "rounded-[24px] border border-cyan-200 bg-cyan-50/40 p-3 shadow-sm", cellClass: "rounded-[16px] border-2 border-dashed border-cyan-200 bg-white" };
  }
}

function QuantityBoard({
  objectType,
  totalSlots,
  filledStates,
  style,
  onCellClick,
}: {
  objectType: keyof typeof OBJECT_META;
  totalSlots: number;
  filledStates: Array<"empty" | "filled" | "left" | "right">;
  style?: BuildVisualStyle | CompareVisualStyle;
  onCellClick?: (index: number) => void;
}) {
  const config = getBoardConfig(style);
  const meta = OBJECT_META[objectType];
  const sections = [];
  for (let start = 0; start < totalSlots; start += config.sectionSize) sections.push(start);
  return (
    <div className={`space-y-3 ${config.panelClass}`}>
      {sections.map((start) => {
        const end = Math.min(totalSlots, start + config.sectionSize);
        const sectionCount = end - start;
        const sectionLabel = style === "double_ten_frame" && totalSlots > 10 ? (start === 0 ? "Full 10" : "Extras") : style === "collection_shelves" ? `Shelf ${start / config.sectionSize + 1}` : style === "build_trays" ? `Tray ${start / config.sectionSize + 1}` : style === "reactor_cells" ? `Reactor ${start / config.sectionSize + 1}` : style === "crate_system" ? `Crates ${start / config.sectionSize + 1}` : undefined;
        return (
          <div key={`${style ?? "default"}-${start}`} className="space-y-2">
            {sectionLabel ? <div className="text-center text-[10px] font-black uppercase tracking-[0.16em] text-teal-700">{sectionLabel}</div> : null}
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${config.columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: sectionCount }).map((_, localIndex) => {
                const index = start + localIndex;
                const state = filledStates[index] ?? "empty";
                const filled = state !== "empty";
                const tone = state === "left"
                  ? "border-teal-400 bg-teal-400/20 text-teal-900"
                  : state === "right"
                    ? "border-orange-400 bg-orange-400/20 text-orange-900"
                    : state === "filled"
                      ? "border-cyan-400 bg-cyan-100 text-teal-900"
                      : "border-cyan-200 bg-white text-transparent";
                const contentClass = state === "left"
                  ? "bg-teal-400/80"
                  : state === "right"
                    ? "bg-orange-400/80"
                    : state === "filled"
                      ? "bg-cyan-400/80"
                      : "bg-cyan-50";
                const Component = onCellClick ? "button" : "div";
                return (
                  <Component
                    key={`${style ?? "board"}-${index}`}
                    type={onCellClick ? "button" : undefined}
                    onClick={onCellClick ? () => onCellClick(index) : undefined}
                    className={`flex h-12 w-full items-center justify-center border-2 text-2xl transition sm:h-14 ${config.cellClass} ${tone}`}
                  >
                    {filled ? (
                      <span className={`flex h-7 w-7 items-center justify-center rounded-full text-lg ${contentClass}`}>{meta.emoji}</span>
                    ) : (
                      <span className="h-6 w-6 rounded-full border border-cyan-200 bg-cyan-50" />
                    )}
                  </Component>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
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

function SplitBuildZone({
  count,
  onAdd,
  onRemove,
  canAdd,
  canRemove,
}: {
  count: number;
  onAdd: () => void;
  onRemove: () => void;
  canAdd: boolean;
  canRemove: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-cyan-200 bg-white px-3 py-2 shadow-sm">
      <div className="mb-1 text-center text-3xl font-black text-teal-900">{count}</div>
      <div className="grid grid-cols-[44px_1fr_44px] items-center gap-2">
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="rounded-[14px] border-2 border-cyan-200 bg-white px-2 py-2 text-lg font-black text-slate-700 transition enabled:hover:border-cyan-300 enabled:hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          −
        </button>
        <div className="rounded-full bg-cyan-50 px-2 py-1.5 text-center text-base font-black text-teal-800">
          {count}
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={!canAdd}
          className="rounded-[14px] border-2 border-cyan-200 bg-white px-2 py-2 text-lg font-black text-slate-700 transition enabled:hover:border-cyan-300 enabled:hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-45"
        >
          +
        </button>
      </div>
    </div>
  );
}

function ExampleBuildRow({
  parts,
}: {
  parts: number[];
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-black text-teal-900">
      <span className="uppercase tracking-[0.14em] text-teal-700">One way</span>
      <span>{parts[0] ?? 0}</span>
      <span className="text-cyan-500">+</span>
      <span>{parts[1] ?? 0}</span>
      <span className="text-cyan-500">=</span>
      <span>{(parts[0] ?? 0) + (parts[1] ?? 0)}</span>
    </div>
  );
}

function TenFrameBuilder({
  target,
  leftCount,
  rightCount,
  activePart,
  objectType,
  visualStyle,
  onSelectPart,
  onToggleDot,
}: {
  target: number;
  leftCount: number;
  rightCount: number;
  activePart: "left" | "right";
  objectType: keyof typeof OBJECT_META;
  visualStyle?: BuildVisualStyle;
  onSelectPart: (part: "left" | "right") => void;
  onToggleDot: (index: number) => void;
}) {
  const totalSlots = target > 10 ? 20 : 10;
  const builderStyle: NonNullable<BuildVisualStyle> = target > 10 ? "double_ten_frame" : visualStyle ?? "build_trays";
  const cells = Array.from({ length: totalSlots }, (_, index) => {
    if (index < leftCount) return "left" as const;
    if (index < leftCount + rightCount) return "right" as const;
    return "empty" as const;
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSelectPart("left")}
          className={`rounded-[16px] border-2 px-3 py-2 text-sm font-black transition ${
            activePart === "left"
              ? "border-teal-400 bg-teal-100 text-teal-900 shadow-[0_0_16px_rgba(20,184,166,0.16)]"
              : "border-cyan-200 bg-white text-slate-700"
          }`}
        >
          Green part
        </button>
        <button
          type="button"
          onClick={() => onSelectPart("right")}
          className={`rounded-[16px] border-2 px-3 py-2 text-sm font-black transition ${
            activePart === "right"
              ? "border-orange-300 bg-orange-100 text-orange-900 shadow-[0_0_16px_rgba(251,146,60,0.16)]"
              : "border-cyan-200 bg-white text-slate-700"
          }`}
        >
          Red part
        </button>
      </div>
      <QuantityBoard
        objectType={objectType}
        totalSlots={totalSlots}
        filledStates={cells}
        style={builderStyle}
        onCellClick={onToggleDot}
      />
      <div className="text-center text-xs font-black uppercase tracking-[0.16em] text-teal-700">
        Tap cells to build {target} with two colours
      </div>
    </div>
  );
}

export function GroundBuildTaskCard({
  task,
  onCorrect,
  onWrong,
  onInteract,
}: {
  task: GroundBuildTask;
  onCorrect: () => void;
  onWrong: () => void;
  onInteract?: () => void;
}) {
  const buildMode = task.buildMode ?? "single";
  const [built, setBuilt] = useState(task.startingBuilt ?? 0);
  const [leftBuilt, setLeftBuilt] = useState(0);
  const [rightBuilt, setRightBuilt] = useState(0);
  const [activePart, setActivePart] = useState<"left" | "right">("left");
  const compareMode = task.compareMode ?? "exact";
  const compareBase = task.compareBase ?? task.targetNumber;
  const visualStyle = getBuildVisualStyle(task);
  const traySize = Math.max(5, Math.min(20, task.maxBuild ?? task.targetNumber ?? compareBase));
  const tray = useMemo(() => Array.from({ length: traySize }), [traySize]);
  const splitTotal = leftBuilt + rightBuilt;
  const exampleKey = (task.exampleParts ?? []).join("+");
  const builtKey = `${leftBuilt}+${rightBuilt}`;
  const splitHitsTarget = splitTotal === task.targetNumber;
  const splitHasTwoParts = leftBuilt > 0 && rightBuilt > 0;
  const splitDifferentFromExample = !task.requireDifferentFromExample || builtKey !== exampleKey;
  const splitValid = splitHitsTarget && splitHasTwoParts && splitDifferentFromExample;
  const hideSplitSupport = task.hideSplitSupport === true;
  const hasInteractedRef = useRef(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  function markInteracted() {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      setHasInteracted(true);
      onInteract?.();
    }
  }

  function check() {
    if (buildMode === "split") {
      if (splitValid) onCorrect();
      else onWrong();
      return;
    }
    const correct =
      compareMode === "more_than"
        ? built > compareBase
        : compareMode === "less_than"
          ? built < compareBase
          : built === task.targetNumber;
    if (correct) onCorrect();
    else onWrong();
  }

  function toggleSplitDot(index: number) {
    markInteracted();
    if (index < leftBuilt) {
      setLeftBuilt((current) => current - 1);
      return;
    }
    if (index < leftBuilt + rightBuilt) {
      setRightBuilt((current) => current - 1);
      return;
    }
    if (splitTotal >= task.targetNumber) return;
    if (activePart === "left") setLeftBuilt((current) => current + 1);
    else setRightBuilt((current) => current + 1);
  }

  if (buildMode === "split") {
    return (
      <GroundMiniShell badge="Build Game" prompt={task.prompt} speakText={task.speakText}>
        <div className="rounded-[28px] border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-4 shadow-sm">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-cyan-200 bg-white px-4 py-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">Target</div>
                <div className={`mt-1 text-4xl font-black transition ${splitValid ? "scale-105 text-emerald-700" : "text-teal-900"}`}>{task.targetNumber}</div>
              </div>
              <div className={`rounded-[18px] border-2 px-3 py-2 transition ${splitValid ? "border-emerald-300 bg-emerald-50 shadow-[0_0_20px_rgba(16,185,129,0.18)]" : "border-teal-300 bg-white shadow-[0_0_16px_rgba(45,212,191,0.12)]"}`}>
                <StructuredReveal
                  quantity={task.targetNumber}
                  objectType={task.referenceGroup?.objectType ?? task.objectType}
                  patternLayout={task.targetNumber > 10 ? "ten_frame" : task.referenceGroup?.patternLayout ?? "ten_frame"}
                />
              </div>
            </div>

            {task.showExample !== false && task.exampleParts && task.exampleParts.length === 2 ? (
              <div className="rounded-[18px] border border-cyan-200 bg-white px-3 py-2 shadow-sm">
                <ExampleBuildRow parts={task.exampleParts} />
              </div>
            ) : null}

            <TenFrameBuilder
              target={task.targetNumber}
              leftCount={leftBuilt}
              rightCount={rightBuilt}
              activePart={activePart}
              objectType={task.objectType}
              visualStyle={visualStyle}
              onSelectPart={setActivePart}
              onToggleDot={toggleSplitDot}
            />

            {!hideSplitSupport ? (
              <>
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-center">
                  <SplitBuildZone
                    count={leftBuilt}
                    canAdd={splitTotal < task.targetNumber}
                    canRemove={leftBuilt > 0}
                    onAdd={() => {
                      setActivePart("left");
                      if (splitTotal < task.targetNumber) { markInteracted(); setLeftBuilt((current) => current + 1); }
                    }}
                    onRemove={() => setLeftBuilt((current) => Math.max(0, current - 1))}
                  />
                  <div className="text-center text-3xl font-black text-cyan-500">+</div>
                  <SplitBuildZone
                    count={rightBuilt}
                    canAdd={splitTotal < task.targetNumber}
                    canRemove={rightBuilt > 0}
                    onAdd={() => {
                      setActivePart("right");
                      if (splitTotal < task.targetNumber) { markInteracted(); setRightBuilt((current) => current + 1); }
                    }}
                    onRemove={() => setRightBuilt((current) => Math.max(0, current - 1))}
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-black text-teal-800">
                    {splitValid
                      ? "You built it in two parts."
                      : splitHitsTarget && !splitDifferentFromExample
                        ? "Try a different way."
                        : "Build it with two colours."}
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLeftBuilt(0);
                        setRightBuilt(0);
                        setActivePart("left");
                      }}
                      className="rounded-[18px] border-2 border-cyan-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={check}
                      disabled={!hasInteracted}
                      className="rounded-[18px] bg-gradient-to-r from-teal-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(13,148,136,0.18)] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLeftBuilt(0);
                    setRightBuilt(0);
                    setActivePart("left");
                  }}
                  className="rounded-[18px] border-2 border-cyan-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={check}
                  disabled={!hasInteracted}
                  className="rounded-[18px] bg-gradient-to-r from-teal-600 to-cyan-500 px-5 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(13,148,136,0.18)] transition enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      </GroundMiniShell>
    );
  }

  return (
    <GroundMiniShell badge="Build Game" prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-cyan-50 px-4 py-2">
          <div className="text-sm font-black uppercase tracking-[0.16em] text-teal-800">Your Build</div>
          <div className="text-sm font-black uppercase tracking-[0.16em] text-cyan-600">Count with your eyes</div>
        </div>
        {task.referenceGroup ? (
          <div className="mb-4 rounded-[22px] border-2 border-cyan-200 bg-cyan-50 p-3">
            <div className="mb-2 text-center text-xs font-black uppercase tracking-[0.16em] text-teal-800">Match this group</div>
            <CompareGroupCard
              quantity={task.referenceGroup.quantity}
              objectType={task.referenceGroup.objectType}
              patternLayout={task.referenceGroup.patternLayout}
              visualStyle={visualStyle as CompareVisualStyle}
            />
          </div>
        ) : null}
        {compareMode !== "exact" ? (
          <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-teal-800">
            {compareMode === "more_than" ? `Make more than ${compareBase}` : `Make less than ${compareBase}`}
          </div>
        ) : null}
        <QuantityBoard
          objectType={task.objectType}
          totalSlots={traySize}
          filledStates={tray.map((_, index) => (index < built ? "filled" : "empty"))}
          style={visualStyle}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => { markInteracted(); setBuilt((current) => Math.max(0, current - 1)); }}
          className="rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-4 text-2xl font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => { markInteracted(); setBuilt((current) => Math.min(traySize, current + 1)); }}
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
function CompareGroupCard(
{
  quantity,
  objectType,
  patternLayout,
  emphasized = false,
  orderIndex,
  visualStyle,
}: {
  quantity: number;
  objectType: keyof typeof OBJECT_META;
  patternLayout?: GroundPatternLayout;
  emphasized?: boolean;
  orderIndex?: number;
  visualStyle?: CompareVisualStyle;
}) {
  const config = getBoardConfig(visualStyle);
  const cardTone = visualStyle === "balance_panels"
    ? emphasized ? "border-teal-300 bg-teal-50" : "border-cyan-200 bg-cyan-50/60"
    : visualStyle === "reactor_cells"
      ? emphasized ? "border-teal-300 bg-teal-50 shadow-[0_0_18px_rgba(45,212,191,0.12)]" : "border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-teal-50"
      : visualStyle === "collection_shelves"
        ? emphasized ? "border-teal-300 bg-teal-50" : "border-cyan-200 bg-slate-50"
        : visualStyle === "crate_system"
          ? emphasized ? "border-amber-300 bg-amber-50" : "border-amber-200 bg-white"
          : emphasized ? "border-teal-300 bg-teal-50" : "border-cyan-200 bg-white";
  return (
    <div className={`relative rounded-[22px] border-2 px-3 py-3 shadow-sm transition ${cardTone}`}>
      {typeof orderIndex === "number" ? (
        <div className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-teal-300 bg-white text-xl font-black text-teal-800 shadow-sm">
          {orderIndex + 1}
        </div>
      ) : null}
      <div className={config.panelClass}><StructuredReveal quantity={quantity} objectType={objectType} patternLayout={patternLayout} /></div>
    </div>
  );
}

// ── Memory Challenge (student-controlled reveal) ─────────────────────────────
// Lower-level memory activities used to flash a quantity for 2–3 seconds and
// auto-hide it, so a distracted student could miss the reveal entirely. Instead
// the student now controls the timing: press Reveal → study for as long as they
// like → press "I've Seen It" → the quantity hides → they answer. This measures
// number recognition / subitising / memory, not reaction speed.
export type MemoryPhase = "ready" | "revealed" | "hidden";

export function MemoryChallengeBox({
  phase,
  onReveal,
  onHide,
  studyLabel,
  hiddenLabel,
  children,
  hiddenPlaceholder,
}: {
  phase: MemoryPhase;
  onReveal: () => void;
  onHide: () => void;
  studyLabel: string;
  hiddenLabel: string;
  children: React.ReactNode;
  hiddenPlaceholder: React.ReactNode;
}) {
  if (phase === "ready") {
    return (
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3 rounded-[20px] bg-cyan-50 px-4 py-6 text-center">
          <div className="text-5xl" aria-hidden>👀</div>
          <div className="text-lg font-black uppercase tracking-[0.16em] text-teal-800">Memory Challenge</div>
          <div className="text-sm font-bold text-slate-500">Press when ready.</div>
          <button
            type="button"
            onClick={onReveal}
            className="mt-1 rounded-full bg-gradient-to-r from-teal-600 to-cyan-500 px-8 py-3 text-lg font-black uppercase tracking-[0.12em] text-white shadow-[0_10px_24px_rgba(13,148,136,0.22)] transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Reveal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-teal-800">
        {phase === "revealed" ? studyLabel : hiddenLabel}
      </div>
      <div className="flex min-h-[108px] items-center justify-center rounded-[20px] bg-cyan-50 px-4 py-4">
        {phase === "revealed" ? children : hiddenPlaceholder}
      </div>
      {phase === "revealed" ? (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={onHide}
            className="rounded-full bg-gradient-to-r from-teal-600 to-cyan-500 px-8 py-3 text-base font-black uppercase tracking-[0.12em] text-white shadow-[0_10px_24px_rgba(13,148,136,0.22)] transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            I&apos;ve Seen It
          </button>
        </div>
      ) : null}
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
  const [memoryPhase, setMemoryPhase] = useState<MemoryPhase>(task.referenceGroup ? "ready" : "hidden");
  const sortedOrder = useMemo(() => {
    if (task.correctOrderIds?.length) return task.correctOrderIds;
    const direction = task.orderDirection ?? "ASC";
    return [...task.groups]
      .sort((a, b) => (direction === "DESC" ? b.quantity - a.quantity : a.quantity - b.quantity))
      .map((group) => group.id);
  }, [task.correctOrderIds, task.groups, task.orderDirection]);

  // When a reference group must be memorised, the student controls the reveal
  // and hide timing (no auto-timeout); answers stay locked until they've hidden
  // it, so a delayed glance never costs accuracy.
  const hasReferenceMemory = Boolean(task.referenceGroup);
  const answersEnabled = !hasReferenceMemory || memoryPhase === "hidden";
  const orderDirectionLabel = task.orderDirection === "DESC" ? "Biggest to smallest" : "Smallest to biggest";

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
          <div className="mb-4">
            <MemoryChallengeBox
              phase={memoryPhase}
              onReveal={() => setMemoryPhase("revealed")}
              onHide={() => setMemoryPhase("hidden")}
              studyLabel="Remember this group"
              hiddenLabel={task.comparisonType === "different" ? "Find the different group" : "Match this group"}
              hiddenPlaceholder={
                <div className="text-center text-sm font-black uppercase tracking-[0.16em] text-teal-700">
                  Which group matched?
                </div>
              }
            >
              <CompareGroupCard
                quantity={task.referenceGroup.quantity}
                objectType={task.referenceGroup.objectType}
                patternLayout={task.referenceGroup.patternLayout}
                visualStyle={getCompareVisualStyle(task)}
              />
            </MemoryChallengeBox>
          </div>
        ) : null}
        {task.comparisonType === "order" ? (
          <>
            <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-teal-800">
              {task.orderDirection === "DESC" ? "Tap from biggest to smallest" : "Tap from smallest to biggest"}
            </div>
            <div className="mb-4 rounded-[20px] border border-cyan-200 bg-cyan-50 px-4 py-3">
              <div className="mb-2 text-center text-[11px] font-black uppercase tracking-[0.16em] text-teal-800">
                {orderDirectionLabel}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {sortedOrder.map((_, index) => {
                  const chosenId = orderProgress[index];
                  const chosenGroup = task.groups.find((group) => group.id === chosenId);
                  return (
                    <div
                      key={`slot-${index}`}
                      className={`flex min-h-[52px] min-w-[72px] items-center justify-center rounded-[18px] border-2 px-3 text-sm font-black shadow-sm ${
                        chosenGroup ? "border-teal-300 bg-white text-teal-900" : "border-dashed border-cyan-300 bg-white/70 text-cyan-400"
                      }`}
                    >
                      {chosenGroup ? chosenGroup.quantity : index + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
        <div
          className={`grid gap-3 ${task.groups.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"} ${
            answersEnabled ? "" : "pointer-events-none opacity-40"
          }`}
        >
          {task.groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => tapGroup(group.id)}
              disabled={task.comparisonType === "equal" || task.comparisonType === "statement" || !answersEnabled}
              className="text-left disabled:cursor-default"
            >
              <CompareGroupCard
                quantity={group.quantity}
                objectType={group.objectType}
                patternLayout={group.patternLayout}
                emphasized={orderProgress.includes(group.id)}
                orderIndex={orderProgress.indexOf(group.id) >= 0 ? orderProgress.indexOf(group.id) : undefined}
                visualStyle={getCompareVisualStyle(task)}
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
            disabled={!answersEnabled}
            className="rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-4 text-2xl font-black uppercase text-teal-900 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-cyan-200 disabled:hover:bg-white"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => answerYesNo(false)}
            disabled={!answersEnabled}
            className="rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-4 text-2xl font-black uppercase text-teal-900 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-cyan-200 disabled:hover:bg-white"
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
  // Student-controlled reveal: starts on the "ready" screen, the student decides
  // when to reveal and when to hide. No automatic timeout.
  const [phase, setPhase] = useState<MemoryPhase>("ready");
  const answerEnabled = phase === "hidden";

  return (
    <GroundMiniShell badge="Flash Game" prompt={task.prompt} speakText={task.speakText}>
      <MemoryChallengeBox
        phase={phase}
        onReveal={() => setPhase("revealed")}
        onHide={() => setPhase("hidden")}
        studyLabel="Look carefully"
        hiddenLabel="Now tap the number"
        hiddenPlaceholder={
          <div className="text-lg font-black text-slate-500">{task.promptAfterReveal ?? "What did you see?"}</div>
        }
      >
        {task.revealType === "numeral" ? (
          <div className="text-7xl font-black text-teal-900 sm:text-8xl">{task.displayNumber ?? task.targetNumber}</div>
        ) : (
          <StructuredReveal quantity={task.displayNumber ?? task.targetNumber} objectType={task.objectType} patternLayout={task.patternLayout} />
        )}
      </MemoryChallengeBox>

      <div className={task.options.length === 4 ? "grid grid-cols-2 gap-3 sm:grid-cols-4" : "grid grid-cols-3 gap-3"}>
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={!answerEnabled}
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="flex min-h-[112px] items-center justify-center rounded-[24px] border-2 border-cyan-200 bg-white text-5xl font-black text-teal-900 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.14)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:border-cyan-200 disabled:hover:shadow-sm"
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
        {task.options.map((option) => {
          const label = Array.isArray(option.numerals) ? option.numerals.join(", ") : String(option.numeral ?? "");
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
              className="flex min-h-[112px] items-center justify-center rounded-[24px] border-2 border-cyan-200 bg-white px-3 text-center text-3xl font-black text-teal-900 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50 hover:shadow-[0_0_18px_rgba(34,211,238,0.14)] active:scale-[0.98] sm:text-4xl"
            >
              {label}
            </button>
          );
        })}
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
  const isOrderMode = task.uiMode === "order";
  const orderedNumerals = (task.pathNumerals?.length ? [...task.pathNumerals] : [...task.tiles].map((tile) => tile.numeral))
    .sort((a, b) => (direction === "DESC" ? b - a : a - b));
  const expectedNumeral = orderedNumerals[progressIndex] ?? orderedNumerals[orderedNumerals.length - 1] ?? task.targetNumber;
  const currentNumeral =
    progressIndex === 0
      ? task.startNumber ?? orderedNumerals[0] ?? task.targetNumber
      : orderedNumerals[Math.max(0, progressIndex - 1)] ?? task.targetNumber;

  function tapTile(numeral: number) {
    if (numeral !== expectedNumeral) {
      setProgressIndex(0);
      onWrong();
      return;
    }

    const nextIndex = progressIndex + 1;
    if (nextIndex >= orderedNumerals.length) {
      onCorrect();
      return;
    }
    setProgressIndex(nextIndex);
  }

  return (
    <GroundMiniShell badge={task.badgeLabel ?? (isOrderMode ? "Number Order" : "Number Path")} prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <GroundCountBadge count={progressIndex} target={orderedNumerals.length} />
        <div className="mb-4 rounded-[20px] border border-cyan-200 bg-cyan-50 px-4 py-3 text-center shadow-sm">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-teal-700">{isOrderMode ? "Sorting Tray" : "Numbot Trail"}</div>
          <div className="mt-2 flex items-center justify-center gap-3 text-base font-black text-teal-900 sm:text-lg">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-teal-300 bg-white text-2xl shadow-sm">{isOrderMode ? "🏁" : "🤖"}</span>
            <span>{isOrderMode ? `Placed ${progressIndex}` : `On ${currentNumeral}`}</span>
            <span className="text-cyan-400">→</span>
            <span className="rounded-full bg-white px-4 py-2 text-cyan-700 shadow-sm">{isOrderMode ? "Keep sorting" : "Keep moving"}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {task.tiles.map((tile) => {
            const completedIndex = orderedNumerals.indexOf(tile.numeral);
            const isCompleted = completedIndex >= 0 && completedIndex < progressIndex;
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => tapTile(tile.numeral)}
                className={`relative flex min-h-[88px] items-center justify-center rounded-[22px] border-2 text-4xl font-black shadow-sm transition ${
                  isCompleted
                    ? "border-teal-400 bg-teal-100 text-teal-900"
                    : "border-cyan-200 bg-white text-teal-900 hover:border-cyan-300 hover:bg-cyan-50"
                }`}
              >
                {isCompleted ? <span className="absolute -top-2 right-2 text-lg">✨</span> : null}
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
