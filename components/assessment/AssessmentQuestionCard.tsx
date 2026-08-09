"use client";

import { useMemo, useRef, useState } from "react";
import { RotateCcw, Trash2, Undo2 } from "lucide-react";
import { FractionText, MathFormattedText } from "@/components/FractionText";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import DecimalModelVisual from "@/components/activities/DecimalModelVisual";
import RuleBoxVisual from "@/components/activities/RuleBoxVisual";
import BestBuyCardComparisonVisual from "@/components/activities/BestBuyCardComparisonVisual";
import CartesianGridVisual from "@/components/activities/CartesianGridVisual";
import ExpressionFlowVisual from "@/components/activities/ExpressionFlowVisual";
import InputOutputTableVisual from "@/components/activities/InputOutputTableVisual";
import FunctionMachineCardVisual from "@/components/activities/FunctionMachineCardVisual";
import { BalanceEquationCardVisual } from "@/components/activities/EquationVisualCards";
import MeasurelandsAssessmentVisual from "@/components/assessment/MeasurelandsAssessmentVisual";
import NumberNexusGroundAssessmentVisual, { GroundAssessmentToken } from "@/components/assessment/NumberNexusGroundAssessmentVisual";
import NumberNexusYear1AssessmentVisual from "@/components/assessment/NumberNexusYear1AssessmentVisual";
import NumberNexusYear2AssessmentVisual from "@/components/assessment/NumberNexusYear2AssessmentVisual";
import NumberNexusYear4AssessmentVisual from "@/components/assessment/NumberNexusYear4AssessmentVisual";
import NumberNexusYear5AssessmentVisual from "@/components/assessment/NumberNexusYear5AssessmentVisual";
import MeasurelandsAnswerWidget from "@/components/assessment/MeasurelandsAnswerWidget";
import type { MeasurelandsAnswerFormat } from "@/data/assessments/measurelandsPresentation";
import { MeasurelandsObjectArt } from "@/components/measurelands/MeasurelandsObjectArt";
import type { MzVisual } from "@/data/assessments/measurelandsVisuals";
import {
  emojiFor as measurelandsEmojiFor,
  objectBaseNameForLabel,
  visualScaleForLabel,
} from "@/data/assessments/measurelandsVisuals";
import { getRealmTheme } from "@/lib/useRealmTheme";

type GenericQuestion = {
  id?: string;
  type?: string;
  prompt: string;
  options?: unknown[];
  visual?: unknown;
  inputMode?: "decimal" | "text";
  answerFormat?: MeasurelandsAnswerFormat;
};

function parseFraction(label: string) {
  const [numerator, denominator] = label.split("/").map(Number);
  return { numerator, denominator };
}

const ORDER_SEPARATOR = "||";

function FractionBar({
  fraction,
  large = false,
}: {
  fraction: string;
  large?: boolean;
}) {
  const { numerator, denominator } = parseFraction(fraction);
  return (
    <div className="w-full">
      <div
        className={["grid rounded-xl bg-slate-700/50 p-1", large ? "gap-0.5" : "gap-1"].join(" ")}
        style={{ gridTemplateColumns: `repeat(${denominator}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: denominator }).map((_, index) => (
          <div
            key={index}
            className={[
              large ? "h-14 rounded-[4px]" : "h-8 rounded-sm",
              index < numerator ? "bg-teal-500" : "bg-slate-600",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}

function WholeOption({
  parts,
  selected,
}: {
  parts: number;
  selected: boolean;
}) {
  return (
    <div
      className={[
        "grid rounded-xl bg-slate-700/50 p-1",
        selected ? "ring-2 ring-teal-500" : "",
      ].join(" ")}
      style={{ gridTemplateColumns: `repeat(${parts}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: parts }).map((_, index) => (
        <div
          key={index}
          className={[
            "h-12 rounded-[4px]",
            index === 0 ? "bg-teal-500" : "bg-slate-600",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

function prepObjectGlyph(object?: string) {
  switch (object) {
    case "rocket":
      return "🚀";
    case "robot":
      return "🤖";
    case "alien":
      return "👽";
    case "crystal":
      return "✦";
    case "portal":
      return "◉";
    case "energy":
      return "●";
    default:
      return "●";
  }
}

function PrepToken({ object }: { object?: string }) {
  const glyph = prepObjectGlyph(object);
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-600 bg-slate-700/60 text-3xl text-teal-300 shadow-sm">
      {glyph}
    </div>
  );
}

function PrepCollectionVisual({
  quantity,
  object,
  layout = "ten_frame",
}: {
  quantity: number;
  object?: string;
  layout?: string;
}) {
  if (layout === "double_ten_frame") {
    const fullTen = Math.min(quantity, 10);
    const extras = Math.max(0, quantity - 10);
    return (
      <div className="grid gap-4">
        <div className="rounded-2xl border border-slate-600 bg-slate-700/50 p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-teal-400">Full 10</div>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, index) =>
              index < fullTen ? (
                <PrepToken key={`full-${index}`} object={object} />
              ) : (
                <div key={`full-${index}`} className="h-14 w-14 rounded-full border border-slate-600 bg-slate-800/40" />
              )
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-600 bg-slate-700/50 p-4">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-teal-400">Extras</div>
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, index) =>
              index < extras ? (
                <PrepToken key={`extra-${index}`} object={object} />
              ) : (
                <div key={`extra-${index}`} className="h-14 w-14 rounded-full border border-slate-600 bg-slate-800/40" />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  const columns = layout === "columns" ? 2 : 5;
  return (
    <div
      className="grid gap-3 rounded-2xl border border-slate-600 bg-slate-700/50 p-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, max-content))` }}
    >
      {Array.from({ length: quantity }).map((_, index) => (
        <PrepToken key={index} object={object} />
      ))}
    </div>
  );
}

function PrepCompareCollectionsVisual({
  groups,
}: {
  groups: Array<{ id: string; label: string; quantity: number; object?: string; layout?: string }>;
}) {
  return (
    <div className={`grid gap-4 ${groups.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
      {groups.map((group) => (
        <div key={group.id} className="rounded-2xl border border-slate-600 bg-slate-700/50 p-4">
          <div className="mb-3 text-sm font-black text-teal-300">{group.label}</div>
          <PrepCollectionVisual quantity={group.quantity} object={group.object} layout={group.layout} />
        </div>
      ))}
    </div>
  );
}

function PrepRaceFinishVisual({
  finishers,
}: {
  finishers: Array<{ name: string; icon: string; place: string }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {finishers.map((finisher) => (
        <div key={finisher.place} className="rounded-2xl border border-slate-600 bg-slate-700/50 p-4 text-center">
          <div className="text-xs font-bold uppercase tracking-wide text-amber-300">{finisher.place}</div>
          <div className="mt-3 text-5xl">{finisher.icon}</div>
          <div className="mt-2 text-lg font-black text-white">{finisher.name}</div>
        </div>
      ))}
    </div>
  );
}

function PrepSpatialSceneVisual({
  rows,
  cols,
  items,
}: {
  rows: number;
  cols: number;
  items: Array<{ row: number; col: number; label: string; icon: string }>;
}) {
  return (
    <div
      className="grid gap-3 rounded-2xl border border-slate-600 bg-slate-700/50 p-4"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: rows * cols }).map((_, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const item = items.find((entry) => entry.row === row && entry.col === col);
        return (
          <div key={`${row}-${col}`} className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-slate-600 bg-slate-800/40 p-3 text-center">
            {item ? (
              <>
                <div className="text-4xl">{item.icon}</div>
                <div className="mt-2 text-sm font-black text-white">{item.label}</div>
              </>
            ) : (
              <div className="h-10 w-10 rounded-full border border-dashed border-slate-600" />
            )}
          </div>
        );
      })}
    </div>
  );
}

function measurelandsConceptIcon(label: string): string | null {
  switch (label.trim().toLowerCase()) {
    case "length":
      return "📏";
    case "mass":
      return "⚖️";
    case "capacity":
      return "🫙";
    case "duration":
      return "⏱️";
    case "morning":
      return "🌅";
    case "afternoon":
      return "☀️";
    case "night":
      return "🌙";
    default:
      return null;
  }
}

function isMeasurelandsVisualOption(label: string) {
  return measurelandsEmojiFor(label) !== "📦" || measurelandsConceptIcon(label) !== null;
}

export default function AssessmentQuestionCard({
  question,
  value,
  onChange,
  realmId,
}: {
  question: GenericQuestion;
  value: string | null;
  onChange: (value: string) => void;
  realmId?: string;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const theme = getRealmTheme(realmId);
  const accentLabel = theme.isMeasurement ? "text-[#b8893a]" : "text-teal-400";
  const selectedCard = theme.isMeasurement
    ? "border-[#b8893a] bg-[#3c280f]/40 shadow-lg shadow-[#b8893a]/10"
    : "border-teal-500 bg-teal-500/15 shadow-lg shadow-teal-500/10";
  const selectedSoft = theme.isMeasurement ? "border-[#b8893a] bg-[#3c280f]/25" : "border-teal-500 bg-teal-500/10";
  const focusBorder = theme.isMeasurement ? "focus:border-[#b8893a]" : "focus:border-teal-500";

  const type = question.type ?? "mcq";
  const visual =
    typeof question.visual === "object" && question.visual !== null
      ? (question.visual as Record<string, unknown>)
      : undefined;
  const isYearFiveNumberVisual = typeof visual?.type === "string" && visual.type.startsWith("number_y5_");
  const isEarlyNumberVisual =
    question.id?.startsWith("y3-a-") ||
    question.id?.startsWith("y3-b-") ||
    (typeof visual?.type === "string" &&
      (visual.type.startsWith("number_ground_") ||
        visual.type.startsWith("number_y1_") ||
        visual.type.startsWith("number_y2_") ||
        visual.type.startsWith("number_y4_") ||
        visual.type.startsWith("number_y5_")));
  const order = useMemo(
    () => (value ? value.split(type === "number_order" ? ORDER_SEPARATOR : ",").filter(Boolean) : []),
    [type, value]
  );

  const renderedVisual = visual ? (
    <>
      {typeof visual.kind === "string" ? <MeasurelandsAssessmentVisual visual={visual as unknown as MzVisual} /> : null}
      {visual.type === "decimal_model" ? <DecimalModelVisual visual={visual as never} title="Decimal model" /> : null}
      {visual.type === "rule_box" ? <RuleBoxVisual visual={{ ...(visual as Record<string, unknown>), decisionLabel: undefined } as never} title="Given information" /> : null}
      {visual.type === "best_buy_card_comparison" ? (
        <BestBuyCardComparisonVisual visual={visual as never} revealUnitRates={false} />
      ) : null}
      {visual.type === "cartesian_grid" ? <CartesianGridVisual visual={visual as never} /> : null}
      {visual.type === "expression_flow" ? <ExpressionFlowVisual visual={visual as never} /> : null}
      {visual.type === "input_output_table" ? <InputOutputTableVisual visual={visual as never} /> : null}
      {visual.type === "function_machine_card" ? <FunctionMachineCardVisual visual={visual as never} /> : null}
      {visual.type === "balance_equation_card" ? <BalanceEquationCardVisual visual={visual as never} /> : null}
      {visual.type === "prep_collection" ? (
        <PrepCollectionVisual
          quantity={Number(visual.quantity ?? 0)}
          object={typeof visual.object === "string" ? visual.object : undefined}
          layout={typeof visual.layout === "string" ? visual.layout : undefined}
        />
      ) : null}
      {visual.type === "prep_compare_collections" ? (
        <PrepCompareCollectionsVisual
          groups={Array.isArray(visual.groups) ? (visual.groups as Array<{ id: string; label: string; quantity: number; object?: string; layout?: string }>) : []}
        />
      ) : null}
      {visual.type === "prep_race_finish" ? (
        <PrepRaceFinishVisual
          finishers={Array.isArray(visual.finishers) ? (visual.finishers as Array<{ name: string; icon: string; place: string }>) : []}
        />
      ) : null}
      {visual.type === "prep_spatial_scene" ? (
        <PrepSpatialSceneVisual
          rows={Number(visual.rows ?? 2)}
          cols={Number(visual.cols ?? 3)}
          items={Array.isArray(visual.items) ? (visual.items as Array<{ row: number; col: number; label: string; icon: string }>) : []}
        />
      ) : null}
      {typeof visual.type === "string" && visual.type.startsWith("number_ground_") ? (
        <NumberNexusGroundAssessmentVisual visual={visual} />
      ) : null}
      {typeof visual.type === "string" && visual.type.startsWith("number_y1_") ? (
        <NumberNexusYear1AssessmentVisual visual={visual} />
      ) : null}
      {typeof visual.type === "string" && visual.type.startsWith("number_y2_") ? (
        <NumberNexusYear2AssessmentVisual visual={visual} />
      ) : null}
      {typeof visual.type === "string" && visual.type.startsWith("number_y4_") ? (
        <NumberNexusYear4AssessmentVisual visual={visual} />
      ) : null}
      {typeof visual.type === "string" && visual.type.startsWith("number_y5_") ? (
        <NumberNexusYear5AssessmentVisual visual={visual} />
      ) : null}
    </>
  ) : null;

  if (type === "pattern_build") {
    const tokens = ((question.options ?? []) as string[]).map(String);
    const built = value ? value.split(ORDER_SEPARATOR).filter(Boolean) : [];
    const slots = Number(visual?.answerSlots ?? 2);
    return (
      <div className="mt-3 space-y-4">
        {renderedVisual}
        <div className="rounded-lg border-2 border-dashed border-cyan-900/20 bg-[#f8fbfc] p-4">
          <div className="flex min-h-16 flex-wrap justify-center gap-3">
            {Array.from({ length: slots }, (_, index) => built[index]
              ? <GroundAssessmentToken key={index} token={built[index]!} />
              : <span key={index} className="h-11 w-11 rounded-lg border-2 border-dashed border-cyan-900/25" />)}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {tokens.map((token) => (
            <div key={token} className="flex items-center justify-between rounded-lg border-2 border-slate-300 bg-[#f8fbfc] p-3 shadow-sm">
              <button type="button" disabled={built.length >= slots} onClick={() => onChange([...built, token].join(ORDER_SEPARATOR))} className="rounded-lg p-1 disabled:opacity-40" aria-label={`Place ${token}`}>
                <GroundAssessmentToken token={token} />
              </button>
              <OptionReadAloudButton text={token} />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onChange("")}
          disabled={built.length === 0}
          className="grid h-11 w-11 place-items-center rounded-lg border-2 border-slate-300 bg-[#f8fbfc] text-slate-600 shadow-sm disabled:opacity-40"
          aria-label="Clear pattern"
          title="Clear pattern"
        >
          <RotateCcw className="h-5 w-5" aria-hidden />
        </button>
      </div>
    );
  }

  if (type === "number_order") {
    const numbers = ((question.options as string[] | undefined) ?? []).map(String);
    const visualValues = Array.isArray(visual?.values) ? visual.values.map(String) : [];
    const numberLabels = visual?.type === "number_y5_decimal_set" && visualValues.length === numbers.length
      ? visualValues
      : numbers;
    const showOrderVisual = visual?.type !== "number_y5_decimal_set";

    function addNumber(num: string) {
      if (order.includes(num)) return;
      onChange([...order, num].join(ORDER_SEPARATOR));
    }

    function undoLast() {
      onChange(order.slice(0, -1).join(ORDER_SEPARATOR));
    }

    function clear() {
      onChange("");
    }

    function moveDragged(targetIndex: number) {
      if (draggedIndex === null || draggedIndex === targetIndex) return;
      const next = [...order];
      const [moved] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, moved);
      onChange(next.join(ORDER_SEPARATOR));
      setDraggedIndex(null);
    }

    return (
      <div className={isEarlyNumberVisual ? "mt-3" : "mt-6"}>
        {showOrderVisual ? renderedVisual : null}
        <div className="grid gap-4 md:grid-cols-3">
          {numbers.map((num, index) => (
            <div key={num} className={isEarlyNumberVisual ? "flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-[#f8fbfc] p-2 shadow-sm" : "flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-700/50 p-2"}>
              <button
                type="button"
                onClick={() => addNumber(num)}
                disabled={order.includes(num)}
                className={isEarlyNumberVisual
                  ? "min-h-14 flex-1 rounded-lg px-3 text-left text-3xl font-black text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  : "min-h-14 flex-1 rounded-lg px-3 text-left text-3xl font-black text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"}
              >
                {numberLabels[index] ?? num}
              </button>
              <OptionReadAloudButton text={numberLabels[index] ?? num} className="shrink-0" />
            </div>
          ))}
        </div>
        <div className={isEarlyNumberVisual ? "mt-5 rounded-lg border-2 border-dashed border-cyan-900/20 bg-[#f8fbfc] p-4" : "mt-5 rounded-lg border border-dashed border-slate-600 bg-slate-800/50 p-4"}>
          {!isEarlyNumberVisual ? <div className={`text-xs font-bold uppercase tracking-wide ${accentLabel}`}>Drag To Reorder</div> : null}
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {order.length > 0 ? (
              order.map((num, index) => (
                <div
                  key={`${num}-${index}`}
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => moveDragged(index)}
                  className={isEarlyNumberVisual
                    ? "cursor-move rounded-lg border-2 border-cyan-600 bg-white p-4 text-center text-2xl font-black text-slate-950 shadow-sm"
                    : "cursor-move rounded-2xl border border-slate-600 bg-slate-700/50 p-4 text-2xl font-black text-white shadow-sm"}
                >
                  {numberLabels[numbers.indexOf(num)] ?? num}
                </div>
              ))
            ) : (
              isEarlyNumberVisual
                ? Array.from({ length: numbers.length }, (_, index) => <div key={index} className="h-14 rounded-lg border-2 border-dashed border-cyan-900/25" />)
                : <div className="col-span-full rounded-2xl border border-dashed border-slate-600 bg-slate-700/30 p-4 text-sm font-semibold text-slate-400">Tap the numbers in order, then drag to adjust if needed.</div>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={undoLast}
            disabled={order.length === 0}
            className={isEarlyNumberVisual ? "grid h-11 w-11 place-items-center rounded-lg border-2 border-slate-300 bg-[#f8fbfc] text-slate-600 shadow-sm disabled:opacity-40" : "rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-2 font-black text-slate-300 hover:bg-slate-700 disabled:opacity-40"}
            aria-label="Undo last number"
            title="Undo last number"
          >
            {isEarlyNumberVisual ? <Undo2 className="h-5 w-5" aria-hidden /> : "Undo last"}
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={order.length === 0}
            className={isEarlyNumberVisual ? "grid h-11 w-11 place-items-center rounded-lg border-2 border-slate-300 bg-[#f8fbfc] text-slate-600 shadow-sm disabled:opacity-40" : "rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-2 font-black text-slate-300 hover:bg-slate-700 disabled:opacity-40"}
            aria-label="Clear order"
            title="Clear order"
          >
            {isEarlyNumberVisual ? <Trash2 className="h-5 w-5" aria-hidden /> : "Clear order"}
          </button>
        </div>
      </div>
    );
  }

  if (type === "fraction_order") {
    const fractions = (question.options as string[] | undefined) ?? [];
    const showOrderVisual = visual?.type !== "number_y5_fraction_set";

    function addFraction(fraction: string) {
      if (order.includes(fraction)) return;
      onChange([...order, fraction].join(","));
    }

    function undoLast() {
      onChange(order.slice(0, -1).join(","));
    }

    function clear() {
      onChange("");
    }

    function moveDragged(targetIndex: number) {
      if (draggedIndex === null || draggedIndex === targetIndex) return;
      const next = [...order];
      const [moved] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, moved);
      onChange(next.join(","));
      setDraggedIndex(null);
    }

    return (
      <div className={isEarlyNumberVisual ? "mt-3" : "mt-6"}>
        {showOrderVisual ? renderedVisual : null}
        <div className="grid gap-4 md:grid-cols-3">
          {fractions.map((fraction) => (
            <button
              key={fraction}
              type="button"
              onClick={() => addFraction(fraction)}
              disabled={order.includes(fraction)}
              className={isEarlyNumberVisual
                ? "rounded-lg border-2 border-slate-300 bg-[#f8fbfc] p-4 text-left shadow-sm transition hover:border-cyan-600 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                : "rounded-2xl border border-slate-600 bg-slate-700/50 p-4 text-left shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"}
            >
              <div className={isEarlyNumberVisual ? "text-lg font-black text-slate-950" : "text-lg font-black text-white"}>
                <FractionText value={fraction} />
              </div>
              {!isYearFiveNumberVisual ? <div className="mt-3"><FractionBar fraction={fraction} large /></div> : null}
            </button>
          ))}
        </div>
        <div className={isEarlyNumberVisual ? "mt-5 rounded-lg border-2 border-dashed border-cyan-900/20 bg-[#f8fbfc] p-4" : "mt-5 rounded-2xl border border-dashed border-slate-600 bg-slate-800/50 p-4"}>
          {!isEarlyNumberVisual ? <div className={`text-xs font-bold uppercase tracking-wide ${accentLabel}`}>Drag To Reorder</div> : null}
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {order.length > 0 ? (
              order.map((fraction, index) => (
                <div
                  key={`${fraction}-${index}`}
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => moveDragged(index)}
                  className={isEarlyNumberVisual ? "cursor-move rounded-lg border-2 border-cyan-600 bg-white p-3 shadow-sm" : "cursor-move rounded-2xl border border-slate-600 bg-slate-700/50 p-3 shadow-sm"}
                >
                  <div className={isEarlyNumberVisual ? "text-sm font-black text-slate-950" : "text-sm font-black text-white"}>
                    <FractionText value={fraction} compact />
                  </div>
                  {!isYearFiveNumberVisual ? <div className="mt-2"><FractionBar fraction={fraction} /></div> : null}
                </div>
              ))
            ) : (
              isEarlyNumberVisual
                ? Array.from({ length: fractions.length }, (_, index) => <div key={index} className="h-16 rounded-lg border-2 border-dashed border-cyan-900/25" />)
                : <div className="col-span-full rounded-2xl border border-dashed border-slate-600 bg-slate-700/30 p-4 text-sm font-semibold text-slate-400">Tap the fractions in order, then drag to adjust if needed.</div>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={undoLast}
            disabled={order.length === 0}
            className={isEarlyNumberVisual ? "grid h-11 w-11 place-items-center rounded-lg border-2 border-slate-300 bg-[#f8fbfc] text-slate-600 shadow-sm disabled:opacity-40" : "rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-2 font-black text-slate-300 hover:bg-slate-700 disabled:opacity-40"}
            aria-label="Undo last fraction"
            title="Undo last fraction"
          >
            {isEarlyNumberVisual ? <Undo2 className="h-5 w-5" aria-hidden /> : "Undo last"}
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={order.length === 0}
            className={isEarlyNumberVisual ? "grid h-11 w-11 place-items-center rounded-lg border-2 border-slate-300 bg-[#f8fbfc] text-slate-600 shadow-sm disabled:opacity-40" : "rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-2 font-black text-slate-300 hover:bg-slate-700 disabled:opacity-40"}
            aria-label="Clear fraction order"
            title="Clear fraction order"
          >
            {isEarlyNumberVisual ? <Trash2 className="h-5 w-5" aria-hidden /> : "Clear"}
          </button>
        </div>
      </div>
    );
  }

  if (type === "fraction_model_select") {
    const options = (question.options as Array<{
      id: string;
      label: string;
      numerator: number;
      denominator: number;
    }> | undefined) ?? [];

    return (
      <div className={isEarlyNumberVisual ? "mt-3 grid gap-3 md:grid-cols-2" : "mt-6 grid gap-4 md:grid-cols-2"}>
        {renderedVisual ? <div className="md:col-span-2">{renderedVisual}</div> : null}
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={[
              isEarlyNumberVisual ? "rounded-lg border-2 bg-[#f8fbfc] p-4 text-left shadow-sm transition" : "rounded-2xl border p-4 text-left shadow-sm transition",
              value === option.id
                ? isEarlyNumberVisual ? "border-cyan-500 ring-4 ring-cyan-500/15" : selectedSoft
                : isEarlyNumberVisual ? "border-slate-300 hover:border-cyan-600 hover:bg-white" : "border-slate-600 bg-slate-700/50 hover:bg-slate-700",
            ].join(" ")}
          >
            <div className="mt-1">
              <FractionBar fraction={`${option.numerator}/${option.denominator}`} large />
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (type === "build_whole") {
    const denominator = Number(visual?.denominator ?? 2);
    const fractionLabel = String(visual?.fractionLabel ?? `1/${denominator}`);
    const options = (question.options as Array<{ id: string; parts: number }> | undefined) ?? [];

    return (
      <div className={isEarlyNumberVisual ? "mt-3 space-y-4" : "mt-6 space-y-5"}>
        {renderedVisual}
        <div className={isEarlyNumberVisual ? "rounded-lg border border-cyan-900/15 bg-[#f8fbfc] p-5 text-slate-950 shadow-sm" : "rounded-2xl border border-slate-600 bg-slate-700/50 p-5"}>
          <div className={isEarlyNumberVisual ? "text-xs font-bold uppercase text-cyan-900" : "text-xs font-bold uppercase tracking-wide text-teal-400"}>Given Part</div>
          <div className="mt-3">
            <div className={isEarlyNumberVisual ? "inline-flex rounded-lg border border-cyan-900/20 bg-white p-3" : "inline-flex rounded-xl border border-slate-600 bg-slate-800/50 p-3"}>
              <div className="h-14 w-12 rounded-[6px] bg-teal-500" />
            </div>
          </div>
          <div className={isEarlyNumberVisual ? "mt-3 text-lg font-black text-slate-950" : "mt-3 text-lg font-black text-white"}>
            <FractionText value={fractionLabel} />
          </div>
          <div className={isEarlyNumberVisual ? "mt-2 text-sm font-semibold text-slate-600" : "mt-2 text-sm font-semibold text-slate-300"}>
            This block is 1 of {denominator} equal parts.
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={isEarlyNumberVisual ? "rounded-lg border-2 border-slate-300 bg-[#f8fbfc] p-4 text-left shadow-sm transition hover:border-cyan-600 hover:bg-white" : "rounded-2xl border border-slate-600 bg-slate-700/50 p-4 text-left shadow-sm transition hover:bg-slate-700"}
            >
              <WholeOption parts={option.parts} selected={value === option.id} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (type === "fraction_number_line") {
    const targetFraction = String(visual?.targetFraction ?? "1/2");
    const denominator = parseFraction(targetFraction).denominator;
    const lineStops = Array.from({ length: denominator + 1 }, (_, index) => ({
      x: index / denominator,
      label: index === 0 ? "0" : index === denominator ? "1" : `${index}/${denominator}`,
    }));

    function placeDot(clientX: number) {
      if (!lineRef.current) return;
      const rect = lineRef.current.getBoundingClientRect();
      const relative = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const nearest = lineStops.reduce((best, stop) =>
        Math.abs(stop.x - relative) < Math.abs(best.x - relative) ? stop : best
      );
      onChange(nearest.label);
    }

    return (
      <div className={isEarlyNumberVisual ? "mt-3 space-y-4" : "mt-6 space-y-5"}>
        {renderedVisual}
        <div className={isEarlyNumberVisual ? "rounded-lg border border-cyan-900/15 bg-[#f8fbfc] p-5 text-slate-950 shadow-sm" : "rounded-2xl border border-slate-600 bg-slate-700/50 p-5"}>
          <div className={isEarlyNumberVisual ? "text-xs font-bold uppercase text-cyan-900" : "text-xs font-bold uppercase tracking-wide text-teal-400"}>Model</div>
          <div className={isEarlyNumberVisual ? "mt-2 text-lg font-black text-slate-950" : "mt-2 text-lg font-black text-white"}>
            <FractionText value={targetFraction} />
          </div>
          <div className="mt-3 max-w-md">
            <FractionBar fraction={targetFraction} large />
          </div>
        </div>
        <div className={isEarlyNumberVisual ? "rounded-lg border border-cyan-900/15 bg-[#f8fbfc] p-5 text-slate-950 shadow-sm" : "rounded-2xl border border-slate-600 bg-slate-700/50 p-5"}>
          <div className={isEarlyNumberVisual ? "mb-3 text-sm font-bold text-cyan-900" : "mb-3 text-sm font-bold text-teal-400"}>{denominator} equal jumps from 0 to 1</div>
          <div
            ref={lineRef}
            className="relative mx-3 h-16 cursor-pointer"
            onClick={(event) => placeDot(event.clientX)}
          >
            <div className="absolute top-7 left-0 right-0 h-1 rounded bg-slate-500" />
            {lineStops.slice(0, -1).map((stop, index) => {
              const next = lineStops[index + 1];
              if (!next) return null;
              return (
                <div
                  key={`${stop.label}-${next.label}`}
                  className="absolute top-[22px] h-3 rounded-full bg-teal-500/30"
                  style={{
                    left: `${stop.x * 100}%`,
                    width: `${(next.x - stop.x) * 100}%`,
                  }}
                />
              );
            })}
            {lineStops.map((stop) => (
              <div
                key={stop.label}
                className="absolute top-5 h-5 w-0.5 -translate-x-1/2 rounded bg-slate-500"
                style={{ left: `${stop.x * 100}%` }}
              />
            ))}
            {value ? (
              <div
                className="absolute top-3 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 border-teal-400 bg-teal-500 text-white shadow-sm"
                style={{
                  left: `${((lineStops.find((stop) => stop.label === value)?.x ?? 0) * 100)}%`,
                }}
              >
                •
              </div>
            ) : null}
          </div>
          <div className={isEarlyNumberVisual ? "mt-2 flex justify-between text-sm font-bold text-slate-600" : "mt-2 flex justify-between text-sm font-bold text-slate-400"}>
            <span>0</span>
            <span>1</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "numeric") {
    if (isEarlyNumberVisual) {
      return (
        <div className="mt-3 space-y-4">
          {renderedVisual}
          <div className="flex justify-center">
            <input
              type="text"
              inputMode={question.inputMode ?? "decimal"}
              value={value ?? ""}
              onChange={(event) => onChange(event.target.value)}
              aria-label="Answer"
              className="h-20 w-36 rounded-lg border-2 border-cyan-700 bg-[#f8fbfc] px-3 text-center text-4xl font-black text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
            />
          </div>
        </div>
      );
    }
    return (
      <div className="mt-6">
        {renderedVisual}
        {theme.isMeasurement && question.answerFormat ? <MeasurelandsAnswerWidget key={question.id} format={question.answerFormat} value={value} onChange={onChange} inputMode={question.inputMode} /> : <input type="text" inputMode={question.inputMode ?? "decimal"} value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder="Enter your answer" aria-label="Answer" className={`w-full rounded-2xl border border-slate-600 bg-slate-700/50 px-5 py-4 text-2xl font-black text-white outline-none transition placeholder:text-slate-400 ${focusBorder} focus:bg-slate-700`} />}
      </div>
    );
  }

  const options = (question.options ?? []) as Array<string | { id?: string; label?: string }>;
  const useMeasurelandsVisualOptions =
    theme.isMeasurement &&
    options.length > 0 &&
    options.every((option) => {
      const label = typeof option === "string" ? option : option.label ?? option.id ?? "";
      return isMeasurelandsVisualOption(String(label));
    });

  if (isEarlyNumberVisual) {
    const gridClass = options.length === 2
      ? "sm:grid-cols-2"
      : options.length === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";
    return (
      <div className="mt-3 space-y-4">
        {renderedVisual}
        <div className={`grid gap-3 ${gridClass}`}>
          {options.map((option) => {
            const label = String(typeof option === "string" ? option : option.label ?? option.id ?? "");
            const optionId = typeof option === "string" ? undefined : option.id;
            const isSelected = value === label || value === optionId;
            const isToken = label === "star" || label === "robot" || label === "crystal";
            return (
              <button
                key={label}
                type="button"
                onClick={() => onChange(String(optionId ?? label))}
                className={[
                  "flex min-h-20 items-center justify-between gap-3 rounded-lg border-2 bg-[#f8fbfc] px-4 py-3 text-left text-slate-950 shadow-sm transition",
                  isSelected
                    ? "border-cyan-500 ring-4 ring-cyan-500/15"
                    : "border-slate-300 hover:border-cyan-600 hover:bg-white",
                ].join(" ")}
              >
                <span className={isToken ? "" : "text-xl font-black sm:text-2xl"}>
                  {isToken ? <GroundAssessmentToken token={label} /> : <MathFormattedText text={label} compactFractions />}
                </span>
                <OptionReadAloudButton text={label} className="shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (useMeasurelandsVisualOptions) {
    return (
      <div className="mt-6 grid gap-3">
        {renderedVisual ? <div className="mb-1">{renderedVisual}</div> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const label = typeof option === "string" ? option : option.label ?? option.id;
            const optionId = typeof option === "string" ? undefined : option.id;
            const isSelected = value === label || value === optionId;
            const conceptIcon = measurelandsConceptIcon(String(label));
            return (
              <button
                key={String(label)}
                type="button"
                onClick={() => onChange(String(optionId ?? label))}
                className={[
                  "rounded-2xl border px-4 py-4 text-left transition",
                  isSelected
                    ? selectedCard
                    : "border-slate-600 bg-slate-700/50 hover:bg-slate-700 hover:border-slate-500",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#b8893a]/50 bg-[#fff8e8]">
                      {conceptIcon ? (
                        <span className="text-4xl" aria-hidden>
                          {conceptIcon}
                        </span>
                      ) : (
                        <MeasurelandsObjectArt
                          name={objectBaseNameForLabel(String(label))}
                          emoji={measurelandsEmojiFor(String(label))}
                          size={Math.round(56 * visualScaleForLabel(String(label)))}
                        />
                      )}
                    </div>
                    <div className="min-w-0 text-lg font-semibold text-white">
                      <MathFormattedText text={String(label)} compactFractions />
                    </div>
                  </div>
                  <OptionReadAloudButton text={String(label)} className="shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-3">
      {renderedVisual ? <div className="mb-1">{renderedVisual}</div> : null}
      {options.map((option) => {
        const label = typeof option === "string" ? option : option.label ?? option.id;
        const optionId = typeof option === "string" ? undefined : option.id;
        const isSelected = value === label || value === optionId;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(String(optionId ?? label))}
            className={[
              "flex items-center justify-between gap-3 text-left rounded-2xl border p-5 transition font-semibold text-white",
              isSelected
                ? selectedCard
                : "border-slate-600 bg-slate-700/50 hover:bg-slate-700 hover:border-slate-500",
            ].join(" ")}
          >
            <MathFormattedText text={String(label)} compactFractions />
            {/* Per-option voiceover so children can hear each answer read aloud. */}
            <OptionReadAloudButton text={String(label)} className="shrink-0" />
          </button>
        );
      })}
    </div>
  );
}
