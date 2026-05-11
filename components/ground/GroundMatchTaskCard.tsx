"use client";

import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type GroundMatchTask = Extract<PracticeTask, { kind: "groundMatch" }>;

const OBJECT_META = {
  dots: { label: "dots", emoji: "●" },
  gems: { label: "gems", emoji: "◆" },
  stars: { label: "stars", emoji: "★" },
  blocks: { label: "blocks", emoji: "■" },
  robot_tokens: { label: "robot tokens", emoji: "⬢" },
  energy_orbs: { label: "energy orbs", emoji: "⬤" },
} as const;

function GroundNumberCard({ value }: { value: number }) {
  return (
    <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[28px] border-2 border-cyan-300/70 bg-gradient-to-br from-cyan-100 via-white to-teal-100 text-6xl font-black text-teal-900 shadow-[0_0_24px_rgba(45,212,191,0.18)]">
      {value}
    </div>
  );
}

function GroundQuantityCard({
  quantity,
  objectType = "dots",
  compact = false,
}: {
  quantity: number;
  objectType?: GroundMatchTask["objectType"];
  compact?: boolean;
}) {
  const meta = OBJECT_META[objectType ?? "dots"];
  const baseSize = compact ? "text-2xl" : "text-4xl";
  const minHeight = compact ? "min-h-[72px]" : "min-h-[112px]";

  return (
    <div className={`rounded-[24px] border-2 border-cyan-200 bg-white/95 px-4 py-4 shadow-[0_0_18px_rgba(45,212,191,0.12)] ${minHeight}`}>
      <div className="flex flex-wrap justify-center gap-3">
        {Array.from({ length: quantity }).map((_, index) => (
          <span
            key={`${meta.label}-${index}`}
            className={`${baseSize} inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-teal-700 shadow-sm`}
          >
            {meta.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}

function GroundPairCard({
  numeral,
  quantity,
  objectType,
}: {
  numeral: number;
  quantity: number;
  objectType?: GroundMatchTask["objectType"];
}) {
  return (
    <div className="flex items-center justify-center gap-4 rounded-[24px] border-2 border-cyan-200 bg-white/95 px-4 py-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-cyan-100 to-teal-100 text-4xl font-black text-teal-900">
        {numeral}
      </div>
      <GroundQuantityCard quantity={quantity} objectType={objectType} compact />
    </div>
  );
}

function GroundOptionButton({
  selected,
  onClick,
  children,
}: {
  selected?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[28px] border-2 px-4 py-4 text-left transition hover:-translate-y-0.5 active:scale-[0.98] ${
        selected
          ? "border-cyan-400 bg-cyan-50 shadow-[0_0_18px_rgba(34,211,238,0.22)]"
          : "border-cyan-200 bg-white shadow-sm hover:border-cyan-300"
      }`}
    >
      {children}
    </button>
  );
}

function renderQuestionVisual(task: GroundMatchTask) {
  if (task.promptType === "group_to_numeral" && task.shownQuantity) {
    return <GroundQuantityCard quantity={task.shownQuantity} objectType={task.objectType} />;
  }
  if (task.shownNumeral) {
    return <GroundNumberCard value={task.shownNumeral} />;
  }
  return null;
}

function renderOption(option: GroundMatchTask["options"][number]) {
  if (option.kind === "numeral" && typeof option.numeral === "number") {
    return <GroundNumberCard value={option.numeral} />;
  }
  if (option.kind === "quantity" && typeof option.quantity === "number") {
    return <GroundQuantityCard quantity={option.quantity} objectType={option.objectType} />;
  }
  if (
    option.kind === "pair" &&
    typeof option.pairNumeral === "number" &&
    typeof option.pairQuantity === "number"
  ) {
    return (
      <GroundPairCard
        numeral={option.pairNumeral}
        quantity={option.pairQuantity}
        objectType={option.objectType}
      />
    );
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
          <div className="flex-1 text-3xl font-black leading-tight text-slate-900">
            {task.prompt}
          </div>
          <ReadAloudBtn text={task.speakText ?? task.prompt} size="md" className="shrink-0" />
        </div>
        {renderQuestionVisual(task) ? (
          <div className="mt-5 flex justify-center">{renderQuestionVisual(task)}</div>
        ) : null}
      </div>

      <div className="grid gap-4">
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
