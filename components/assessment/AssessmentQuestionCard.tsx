"use client";

import { useMemo, useRef, useState } from "react";
import { FractionText, MathFormattedText } from "@/components/FractionText";
import DecimalModelVisual from "@/components/activities/DecimalModelVisual";
import RuleBoxVisual from "@/components/activities/RuleBoxVisual";
import BestBuyCardComparisonVisual from "@/components/activities/BestBuyCardComparisonVisual";
import CartesianGridVisual from "@/components/activities/CartesianGridVisual";
import ExpressionFlowVisual from "@/components/activities/ExpressionFlowVisual";
import InputOutputTableVisual from "@/components/activities/InputOutputTableVisual";
import FunctionMachineCardVisual from "@/components/activities/FunctionMachineCardVisual";
import { BalanceEquationCardVisual } from "@/components/activities/EquationVisualCards";

type GenericQuestion = {
  type?: string;
  prompt: string;
  options?: unknown[];
  visual?: unknown;
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

export default function AssessmentQuestionCard({
  question,
  value,
  onChange,
}: {
  question: GenericQuestion;
  value: string | null;
  onChange: (value: string) => void;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  const type = question.type ?? "mcq";
  const visual =
    typeof question.visual === "object" && question.visual !== null
      ? (question.visual as Record<string, unknown>)
      : undefined;
  const order = useMemo(
    () => (value ? value.split(type === "number_order" ? ORDER_SEPARATOR : ",").filter(Boolean) : []),
    [type, value]
  );

  const renderedVisual = visual ? (
    <>
      {visual.type === "decimal_model" ? <DecimalModelVisual visual={visual as never} title="Decimal model" /> : null}
      {visual.type === "rule_box" ? <RuleBoxVisual visual={visual as never} title="Strategy card" /> : null}
      {visual.type === "best_buy_card_comparison" ? (
        <BestBuyCardComparisonVisual visual={visual as never} revealUnitRates />
      ) : null}
      {visual.type === "cartesian_grid" ? <CartesianGridVisual visual={visual as never} /> : null}
      {visual.type === "expression_flow" ? <ExpressionFlowVisual visual={visual as never} /> : null}
      {visual.type === "input_output_table" ? <InputOutputTableVisual visual={visual as never} /> : null}
      {visual.type === "function_machine_card" ? <FunctionMachineCardVisual visual={visual as never} /> : null}
      {visual.type === "balance_equation_card" ? <BalanceEquationCardVisual visual={visual as never} /> : null}
    </>
  ) : null;

  if (type === "number_order") {
    const numbers = ((question.options as string[] | undefined) ?? []).map(String);

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
      <div className="mt-6">
        {renderedVisual}
        <div className="grid gap-4 md:grid-cols-3">
          {numbers.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => addNumber(num)}
              disabled={order.includes(num)}
              className="rounded-2xl border border-slate-600 bg-slate-700/50 p-5 text-left text-3xl font-black text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {num}
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-dashed border-slate-600 bg-slate-800/50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-teal-400">Drag To Reorder</div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {order.length > 0 ? (
              order.map((num, index) => (
                <div
                  key={`${num}-${index}`}
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => moveDragged(index)}
                  className="cursor-move rounded-2xl border border-slate-600 bg-slate-700/50 p-4 text-2xl font-black text-white shadow-sm"
                >
                  {num}
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-600 bg-slate-700/30 p-4 text-sm font-semibold text-slate-400">
                Tap the numbers in order, then drag to adjust if needed.
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={undoLast}
            disabled={order.length === 0}
            className="rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-2 font-black text-slate-300 hover:bg-slate-700 disabled:opacity-40"
          >
            Undo last
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={order.length === 0}
            className="rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-2 font-black text-slate-300 hover:bg-slate-700 disabled:opacity-40"
          >
            Clear order
          </button>
        </div>
      </div>
    );
  }

  if (type === "fraction_order") {
    const fractions = (question.options as string[] | undefined) ?? [];

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
      <div className="mt-6">
        {renderedVisual}
        <div className="grid gap-4 md:grid-cols-3">
          {fractions.map((fraction) => (
            <button
              key={fraction}
              type="button"
              onClick={() => addFraction(fraction)}
              disabled={order.includes(fraction)}
              className="rounded-2xl border border-slate-600 bg-slate-700/50 p-4 text-left shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="text-lg font-black text-white">
                <FractionText value={fraction} />
              </div>
              <div className="mt-3">
                <FractionBar fraction={fraction} large />
              </div>
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border border-dashed border-slate-600 bg-slate-800/50 p-4">
          <div className="text-xs font-bold uppercase tracking-wide text-teal-400">Drag To Reorder</div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {order.length > 0 ? (
              order.map((fraction, index) => (
                <div
                  key={`${fraction}-${index}`}
                  draggable
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => moveDragged(index)}
                  className="cursor-move rounded-2xl border border-slate-600 bg-slate-700/50 p-3 shadow-sm"
                >
                  <div className="text-sm font-black text-white">
                    <FractionText value={fraction} compact />
                  </div>
                  <div className="mt-2">
                    <FractionBar fraction={fraction} />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-600 bg-slate-700/30 p-4 text-sm font-semibold text-slate-400">
                Tap the fractions in order, then drag to adjust if needed.
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={undoLast}
            disabled={order.length === 0}
            className="rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-2 font-black text-slate-300 hover:bg-slate-700 disabled:opacity-40"
          >
            Undo last
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={order.length === 0}
            className="rounded-2xl border border-slate-600 bg-slate-700/50 px-4 py-2 font-black text-slate-300 hover:bg-slate-700 disabled:opacity-40"
          >
            Clear
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
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {renderedVisual ? <div className="md:col-span-2">{renderedVisual}</div> : null}
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={[
              "rounded-2xl border p-4 text-left shadow-sm transition",
              value === option.id
                ? "border-teal-500 bg-teal-500/10"
                : "border-slate-600 bg-slate-700/50 hover:bg-slate-700",
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
      <div className="mt-6 space-y-5">
        {renderedVisual}
        <div className="rounded-2xl border border-slate-600 bg-slate-700/50 p-5">
          <div className="text-xs font-bold uppercase tracking-wide text-teal-400">Given Part</div>
          <div className="mt-3">
            <div className="inline-flex rounded-xl border border-slate-600 bg-slate-800/50 p-3">
              <div className="h-14 w-12 rounded-[6px] bg-teal-500" />
            </div>
          </div>
          <div className="mt-3 text-lg font-black text-white">
            <FractionText value={fractionLabel} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className="rounded-2xl border border-slate-600 bg-slate-700/50 p-4 text-left shadow-sm transition hover:bg-slate-700"
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
      <div className="mt-6 space-y-5">
        {renderedVisual}
        <div className="rounded-2xl border border-slate-600 bg-slate-700/50 p-5">
          <div className="text-xs font-bold uppercase tracking-wide text-teal-400">Model</div>
          <div className="mt-2 text-lg font-black text-white">
            <FractionText value={targetFraction} />
          </div>
          <div className="mt-3 max-w-md">
            <FractionBar fraction={targetFraction} large />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-600 bg-slate-700/50 p-5">
          <div className="mb-3 text-sm font-bold text-teal-400">{denominator} equal jumps from 0 to 1</div>
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
          <div className="mt-2 flex justify-between text-sm font-bold text-slate-400">
            <span>0</span>
            <span>1</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === "numeric") {
    return (
      <div className="mt-6">
        {renderedVisual}
        <input
          type="text"
          inputMode="decimal"
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter your answer"
          className="w-full rounded-2xl border border-slate-600 bg-slate-700/50 px-5 py-4 text-2xl font-black text-white outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-slate-700"
        />
      </div>
    );
  }

  const options = (question.options ?? []) as Array<string | { id?: string; label?: string }>;
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
              "text-left rounded-2xl border p-5 transition font-semibold text-white",
              isSelected
                ? "border-teal-500 bg-teal-500/15 shadow-lg shadow-teal-500/10"
                : "border-slate-600 bg-slate-700/50 hover:bg-slate-700 hover:border-slate-500",
            ].join(" ")}
          >
            <MathFormattedText text={String(label)} compactFractions />
          </button>
        );
      })}
    </div>
  );
}
