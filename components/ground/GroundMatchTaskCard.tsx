"use client";

import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type GroundMatchTask = Extract<PracticeTask, { kind: "groundMatch" }>;
type GroundOption = GroundMatchTask["options"][number];

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

type GroundPatternLayout = GroundMatchTask["patternLayout"];

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

function GroundNumberCard({ value }: { value: number }) {
  return (
    <div className="mx-auto flex h-24 w-full max-w-[168px] items-center justify-center rounded-[24px] border-2 border-cyan-300/70 bg-gradient-to-br from-cyan-100 via-white to-teal-100 text-5xl font-black text-teal-900 shadow-[0_0_18px_rgba(45,212,191,0.18)] sm:h-28 sm:text-6xl">
      {value}
    </div>
  );
}

function GroundWordCard({ word }: { word: string }) {
  return (
    <div className="mx-auto flex min-h-[96px] w-full max-w-[188px] items-center justify-center rounded-[24px] border-2 border-cyan-300/70 bg-gradient-to-br from-cyan-100 via-white to-teal-100 px-4 text-3xl font-black lowercase text-teal-900 shadow-[0_0_18px_rgba(45,212,191,0.18)] sm:min-h-[108px] sm:text-4xl">
      {word}
    </div>
  );
}

function GroundQuantityCard({
  quantity,
  objectType = "dots",
  compact = false,
  patternLayout,
}: {
  quantity: number;
  objectType?: GroundMatchTask["objectType"];
  compact?: boolean;
  patternLayout?: GroundPatternLayout;
}) {
  const meta = OBJECT_META[objectType ?? "dots"];
  const baseSize = compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl";
  const bubbleSize = compact ? "h-8 w-8 sm:h-9 sm:w-9" : "h-9 w-9 sm:h-10 sm:w-10";
  const minHeight = compact ? "min-h-[64px]" : "min-h-[92px] sm:min-h-[104px]";

  const grid = patternLayout ? getPatternGrid(patternLayout, quantity) : null;

  return (
    <div className={`rounded-[20px] border-2 border-cyan-200 bg-white/95 px-3 py-3 shadow-[0_0_14px_rgba(45,212,191,0.12)] ${minHeight}`}>
      {grid ? (
        <div
          className="mx-auto grid max-w-[240px] justify-center gap-2 sm:gap-3"
          style={{ gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: grid.slots }).map((_, index) => {
            const filled = grid.filled.includes(index);
            return (
              <span
                key={`${meta.label}-${index}`}
                className={`${baseSize} ${bubbleSize} inline-flex items-center justify-center rounded-full ${filled ? "bg-cyan-50 text-teal-700 shadow-sm" : "bg-transparent text-transparent"}`}
              >
                {meta.emoji}
              </span>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {Array.from({ length: quantity }).map((_, index) => (
            <span
              key={`${meta.label}-${index}`}
              className={`${baseSize} ${bubbleSize} inline-flex items-center justify-center rounded-full bg-cyan-50 text-teal-700 shadow-sm`}
            >
              {meta.emoji}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function GroundPartsCard({
  numeral,
  parts,
  partObjectTypes,
  partLayouts,
}: {
  numeral: number;
  parts: number[];
  partObjectTypes?: GroundOption["pairPartObjectTypes"];
  partLayouts?: GroundOption["pairPartLayouts"];
}) {
  return (
    <div className="w-full rounded-[20px] border-2 border-cyan-200 bg-white/95 px-3 py-3 shadow-[0_0_14px_rgba(45,212,191,0.12)]">
      <div className="mb-3 flex items-center justify-center gap-2 rounded-full bg-cyan-50 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-teal-800">
        <span>Make</span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-teal-100 text-lg text-teal-900">{numeral}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {parts.map((part, index) => (
          <div key={`${numeral}-${part}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span className="text-2xl font-black text-cyan-500">+</span> : null}
            <GroundQuantityCard
              quantity={part}
              objectType={partObjectTypes?.[index] ?? "dots"}
              patternLayout={partLayouts?.[index]}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function GroundPairCard({
  numeral,
  quantity,
  word,
  objectType,
  patternLayout,
}: {
  numeral: number;
  quantity: number;
  word?: string;
  objectType?: GroundMatchTask["objectType"];
  patternLayout?: GroundPatternLayout;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-[20px] border-2 border-cyan-200 bg-white/95 px-3 py-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-cyan-100 to-teal-100 text-3xl font-black text-teal-900 sm:h-16 sm:w-16 sm:text-4xl">
        {numeral}
      </div>
      {word ? (
        <div className="rounded-[18px] border-2 border-cyan-200 bg-cyan-50 px-4 py-3 text-2xl font-black lowercase text-teal-900 sm:text-3xl">
          {word}
        </div>
      ) : null}
      <GroundQuantityCard quantity={quantity} objectType={objectType} patternLayout={patternLayout} compact />
    </div>
  );
}

function GroundOptionButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[132px] w-full items-center justify-center rounded-[24px] border-2 border-cyan-200 bg-white px-3 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.14)] active:scale-[0.98] sm:min-h-[148px] sm:px-4 sm:py-4"
    >
      {children}
    </button>
  );
}

function renderQuestionVisual(task: GroundMatchTask) {
  if (typeof task.shownQuantity === "number" && (task.promptType === "group_to_numeral" || task.promptType === "match_pair")) {
    if (typeof task.shownNumeral === "number" && task.promptType === "group_to_numeral") {
      return (
        <div className="grid w-full gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <GroundNumberCard value={task.shownNumeral} />
          <GroundQuantityCard quantity={task.shownQuantity} objectType={task.objectType} patternLayout={task.patternLayout} />
        </div>
      );
    }
    return <GroundQuantityCard quantity={task.shownQuantity} objectType={task.objectType} patternLayout={task.patternLayout} />;
  }
  if (task.shownSequence && task.shownSequence.length > 0) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {task.shownSequence.map((value, index) => (
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
    );
  }
  if (task.promptType === "same_or_different_group" && task.shownQuantity && task.shownSecondQuantity) {
    return (
      <div className="grid w-full gap-3 sm:grid-cols-2">
        <GroundQuantityCard quantity={task.shownQuantity} objectType={task.objectType} patternLayout={task.patternLayout} />
        <GroundQuantityCard
          quantity={task.shownSecondQuantity}
          objectType={task.shownSecondObjectType ?? task.objectType}
          patternLayout={task.shownSecondPatternLayout ?? task.patternLayout}
        />
      </div>
    );
  }
  if (
    typeof task.shownNumeral === "number" &&
    (task.promptType === "numeral_to_word" || task.promptType === "numeral_to_group" || task.promptType === "number_to_objects" || task.promptType === "match_pair")
  ) {
    return <GroundNumberCard value={task.shownNumeral} />;
  }
  if (typeof task.shownWord === "string") {
    return <GroundWordCard word={task.shownWord} />;
  }
  return null;
}

function renderHelperVisual(task: GroundMatchTask) {
  if (task.helperVariant === "numbot") {
    return (
      <div className="mt-4 flex items-center justify-center gap-3 rounded-[22px] border border-cyan-200 bg-white/90 px-4 py-3 shadow-sm">
        <div className="text-5xl">🤖</div>
        <div className="rounded-full bg-cyan-50 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-teal-800">
          Numbot says
        </div>
      </div>
    );
  }
  if (task.helperVariant === "speech_bubble") {
    return (
      <div className="mt-4 flex justify-center">
        <div className="rounded-[22px] border border-cyan-200 bg-white/90 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-teal-800 shadow-sm">
          🔊 Number bubble
        </div>
      </div>
    );
  }
  if (task.helperVariant === "memory") {
    return (
      <div className="mt-4 flex justify-center">
        <div className="rounded-[22px] border border-cyan-200 bg-white/90 px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-teal-800 shadow-sm">
          Listen, then remember
        </div>
      </div>
    );
  }
  return null;
}

function renderOption(option: GroundOption) {
  if (option.kind === "numeral" && typeof option.numeral === "number") {
    return <GroundNumberCard value={option.numeral} />;
  }
  if (option.kind === "quantity" && typeof option.quantity === "number") {
    return <GroundQuantityCard quantity={option.quantity} objectType={option.objectType} patternLayout={option.patternLayout} />;
  }
  if (option.kind === "word" && typeof option.word === "string") {
    return <GroundWordCard word={option.word} />;
  }
  if (option.kind === "pair" && typeof option.pairNumeral === "number") {
    if (option.pairParts && option.pairParts.length > 0) {
      return (
        <GroundPartsCard
          numeral={option.pairNumeral}
          parts={option.pairParts}
          partObjectTypes={option.pairPartObjectTypes}
          partLayouts={option.pairPartLayouts}
        />
      );
    }
    if (typeof option.pairQuantity === "number" || typeof option.pairWord === "string") {
      return (
        <GroundPairCard
          numeral={option.pairNumeral}
          quantity={option.pairQuantity ?? option.pairNumeral}
          word={option.pairWord}
          objectType={option.objectType}
          patternLayout={option.patternLayout}
        />
      );
    }
  }
  return null;
}

export default function GroundMatchTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundMatchTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-cyan-200/70 bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-5 shadow-[0_6px_18px_rgba(13,148,136,0.08)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-800">
          Ground Explorer
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-1 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
            {task.prompt}
          </div>
          <ReadAloudBtn text={task.speakText ?? task.prompt} size="md" className="shrink-0" />
        </div>
        {renderHelperVisual(task)}
        {renderQuestionVisual(task) ? (
          <div className="mt-4 flex justify-center">{renderQuestionVisual(task)}</div>
        ) : null}
      </div>

      <div
        className={[
          "grid gap-3 sm:gap-4",
          task.options.length === 4
            ? "grid-cols-2 sm:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-3",
        ].join(" ")}
      >
        {task.options.map((option) => (
          <GroundOptionButton
            key={option.id}
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
          >
            {renderOption(option)}
          </GroundOptionButton>
        ))}
      </div>
    </div>
  );
}
