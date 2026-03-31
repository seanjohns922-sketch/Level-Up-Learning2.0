"use client";

import { useMemo, useRef, useState } from "react";

type GenericQuestion = {
  type?: string;
  prompt: string;
  options?: any[];
  visual?: any;
};

function parseFraction(label: string) {
  const [numerator, denominator] = label.split("/").map(Number);
  return { numerator, denominator };
}

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
        className={["grid rounded-xl bg-slate-200 p-1", large ? "gap-0.5" : "gap-1"].join(" ")}
        style={{ gridTemplateColumns: `repeat(${denominator}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: denominator }).map((_, index) => (
          <div
            key={index}
            className={[
              large ? "h-14 rounded-[4px]" : "h-8 rounded-sm",
              index < numerator ? "bg-violet-500" : "bg-slate-100",
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
        "grid rounded-xl bg-slate-200 p-1",
        selected ? "ring-2 ring-violet-500" : "",
      ].join(" ")}
      style={{ gridTemplateColumns: `repeat(${parts}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: parts }).map((_, index) => (
        <div
          key={index}
          className={[
            "h-12 rounded-[4px]",
            index === 0 ? "bg-violet-500" : "bg-slate-100",
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
  const order = useMemo(() => (value ? value.split(",").filter(Boolean) : []), [value]);

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
        <div className="grid gap-4 md:grid-cols-3">
          {fractions.map((fraction) => (
            <button
              key={fraction}
              type="button"
              onClick={() => addFraction(fraction)}
              disabled={order.includes(fraction)}
              className="rounded-2xl border border-slate-600 bg-slate-700/50 p-4 text-left shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="text-lg font-black text-white">{fraction}</div>
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
                  <div className="text-sm font-black text-white">{fraction}</div>
                  <div className="mt-2">
                    <FractionBar fraction={fraction} />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-violet-200 bg-white p-4 text-sm font-semibold text-violet-700">
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
            className="rounded-2xl border border-violet-300 bg-white px-4 py-2 font-black text-violet-900 hover:bg-violet-50 disabled:opacity-40"
          >
            Undo last
          </button>
          <button
            type="button"
            onClick={clear}
            disabled={order.length === 0}
            className="rounded-2xl border border-violet-300 bg-white px-4 py-2 font-black text-violet-900 hover:bg-violet-50 disabled:opacity-40"
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
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={[
              "rounded-2xl border bg-white p-4 text-left shadow-sm transition",
              value === option.id
                ? "border-violet-500 bg-violet-50"
                : "border-violet-200 hover:bg-violet-50",
            ].join(" ")}
          >
            <div className="text-sm font-black text-violet-900">{option.label}</div>
            <div className="mt-3">
              <FractionBar fraction={`${option.numerator}/${option.denominator}`} large />
            </div>
          </button>
        ))}
      </div>
    );
  }

  if (type === "build_whole") {
    const denominator = Number(question.visual?.denominator ?? 2);
    const fractionLabel = question.visual?.fractionLabel ?? `1/${denominator}`;
    const options = (question.options as Array<{ id: string; parts: number }> | undefined) ?? [];

    return (
      <div className="mt-6 space-y-5">
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
          <div className="text-xs font-bold uppercase tracking-wide text-violet-700">Given Part</div>
          <div className="mt-3 max-w-sm">
            <div className="grid rounded-xl bg-slate-200 p-1" style={{ gridTemplateColumns: "repeat(1, minmax(0, 1fr))" }}>
              <div className="h-14 rounded-[4px] bg-violet-500" />
            </div>
          </div>
          <div className="mt-3 text-lg font-black text-violet-900">{fractionLabel}</div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className="rounded-2xl border border-violet-200 bg-white p-4 text-left shadow-sm transition hover:bg-violet-50"
            >
              <WholeOption parts={option.parts} selected={value === option.id} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (type === "fraction_number_line") {
    const targetFraction = question.visual?.targetFraction ?? "1/2";
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
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
          <div className="text-xs font-bold uppercase tracking-wide text-violet-700">Model</div>
          <div className="mt-2 text-lg font-black text-violet-900">{targetFraction}</div>
          <div className="mt-3 max-w-md">
            <FractionBar fraction={targetFraction} large />
          </div>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">
          <div className="mb-3 text-sm font-bold text-violet-700">{denominator} equal jumps from 0 to 1</div>
          <div
            ref={lineRef}
            className="relative mx-3 h-16 cursor-pointer"
            onClick={(event) => placeDot(event.clientX)}
          >
            <div className="absolute top-7 left-0 right-0 h-1 rounded bg-slate-400" />
            {lineStops.slice(0, -1).map((stop, index) => {
              const next = lineStops[index + 1];
              if (!next) return null;
              return (
                <div
                  key={`${stop.label}-${next.label}`}
                  className="absolute top-[22px] h-3 rounded-full bg-violet-200/70"
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
                className="absolute top-5 h-5 w-0.5 -translate-x-1/2 rounded bg-slate-400"
                style={{ left: `${stop.x * 100}%` }}
              />
            ))}
            {value ? (
              <div
                className="absolute top-3 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 border-violet-600 bg-violet-500 text-white shadow-sm"
                style={{
                  left: `${((lineStops.find((stop) => stop.label === value)?.x ?? 0) * 100)}%`,
                }}
              >
                •
              </div>
            ) : null}
          </div>
          <div className="mt-2 flex justify-between text-sm font-bold text-slate-700">
            <span>0</span>
            <span>1</span>
          </div>
        </div>
      </div>
    );
  }

  const options = (question.options ?? []) as any[];
  return (
    <div className="mt-6 grid gap-3">
      {options.map((option) => {
        const label = typeof option === "string" ? option : option.label ?? option.id;
        const isSelected = value === label || value === option.id;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(String(option.id ?? label))}
            className={[
              "text-left rounded-2xl border p-5 shadow-sm transition",
              isSelected
                ? "border-violet-500 bg-violet-50"
                : "border-gray-200 bg-white hover:border-violet-300",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
