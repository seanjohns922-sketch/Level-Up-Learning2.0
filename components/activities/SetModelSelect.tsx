"use client";

import { useState } from "react";
import type { SetModelSelectQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

function CounterGrid({
  total,
  selected,
  highlightedCount,
  groupCount,
  groupSize,
  interactive,
  onToggle,
}: {
  total: number;
  selected?: number[];
  highlightedCount?: number;
  groupCount?: number;
  groupSize?: number;
  interactive?: boolean;
  onToggle?: (index: number) => void;
}) {
  const active = interactive
    ? new Set(selected ?? [])
    : new Set(Array.from({ length: highlightedCount ?? 0 }, (_, index) => index));
  if (groupCount && groupSize) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: groupCount }).map((_, groupIndex) => (
          <div key={groupIndex} className="flex flex-wrap gap-2 rounded-2xl bg-white p-3 shadow-sm">
            {Array.from({ length: groupSize }).map((__, itemIndex) => {
              const index = groupIndex * groupSize + itemIndex;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onToggle?.(index)}
                  disabled={!interactive}
                  className={[
                    "h-10 w-10 rounded-full border-2 transition",
                    active.has(index) ? "border-sky-500 bg-sky-400" : "border-slate-300 bg-slate-100",
                    interactive ? "cursor-pointer hover:border-sky-400" : "cursor-default",
                  ].join(" ")}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-4 gap-2 rounded-2xl bg-white p-3 shadow-sm">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onToggle?.(index)}
          disabled={!interactive}
          className={[
            "h-10 w-10 rounded-full border-2 transition",
            active.has(index) ? "border-sky-500 bg-sky-400" : "border-slate-300 bg-slate-100",
            interactive ? "cursor-pointer hover:border-sky-400" : "cursor-default",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

export default function SetModelSelect({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: SetModelSelectQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [pickedOption, setPickedOption] = useState<string | null>(null);
  const [pickedNumber, setPickedNumber] = useState<number | null>(null);
  const [pickedLabel, setPickedLabel] = useState<string | null>(null);

  function toggle(index: number) {
    setSelected((current) =>
      current.includes(index) ? current.filter((value) => value !== index) : [...current, index]
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>

      {questionData.mode === "tap_fraction" ? (
        <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <CounterGrid
            total={questionData.totalObjects}
            selected={selected}
            groupCount={questionData.groupCount}
            groupSize={questionData.groupSize}
            interactive
            onToggle={toggle}
          />
          <button
            type="button"
            onClick={() => (selected.length === questionData.answer ? onCorrect?.() : onWrong?.())}
            className="mt-4 w-full rounded-2xl bg-sky-600 px-5 py-3 font-black text-white hover:bg-sky-700"
          >
            Check counters
          </button>
        </div>
      ) : null}

      {questionData.mode === "pick_set" ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {questionData.options?.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPickedOption(option.id)}
              className={[
                "rounded-2xl border p-4 transition",
                pickedOption === option.id ? "border-sky-400 bg-sky-50" : "border-gray-200 bg-slate-50",
              ].join(" ")}
            >
              <CounterGrid
                total={questionData.totalObjects}
                highlightedCount={option.highlightedCount}
                groupCount={questionData.groupCount}
                groupSize={questionData.groupSize}
              />
            </button>
          ))}
          <button
            type="button"
            onClick={() => (pickedOption === questionData.correctOptionId ? onCorrect?.() : onWrong?.())}
            disabled={!pickedOption}
            className="sm:col-span-3 rounded-2xl bg-sky-600 px-5 py-3 font-black text-white hover:bg-sky-700 disabled:opacity-40"
          >
            Check choice
          </button>
        </div>
      ) : null}

      {questionData.mode === "complete_sentence" ? (
        <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <CounterGrid
            total={questionData.totalObjects}
            highlightedCount={questionData.highlightedIndices?.length ?? 0}
            groupCount={questionData.groupCount}
            groupSize={questionData.groupSize}
          />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[questionData.answer, (questionData.answer ?? 0) + 1, Math.max(1, (questionData.answer ?? 1) - 1)]
              .filter((value, index, all) => all.indexOf(value) === index)
              .map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPickedNumber(value ?? null)}
                  className={[
                    "rounded-2xl border px-4 py-3 text-xl font-black",
                    pickedNumber === value ? "border-sky-400 bg-white text-sky-900" : "border-gray-200 bg-white text-gray-900",
                  ].join(" ")}
                >
                  {value}
                </button>
              ))}
          </div>
          <button
            type="button"
            onClick={() => (pickedNumber === questionData.answer ? onCorrect?.() : onWrong?.())}
            disabled={pickedNumber === null}
            className="mt-4 w-full rounded-2xl bg-sky-600 px-5 py-3 font-black text-white hover:bg-sky-700 disabled:opacity-40"
          >
            Check answer
          </button>
        </div>
      ) : null}

      {questionData.mode === "label_shared_group" ? (
        <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4">
          <CounterGrid
            total={questionData.totalObjects}
            highlightedCount={questionData.highlightedIndices?.length ?? 0}
            groupCount={questionData.groupCount}
            groupSize={questionData.groupSize}
          />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {questionData.labelOptions?.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setPickedLabel(label)}
                className={[
                  "rounded-2xl border px-4 py-3 text-xl font-black",
                  pickedLabel === label ? "border-sky-400 bg-white text-sky-900" : "border-gray-200 bg-white text-gray-900",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => (pickedLabel === questionData.correctLabel ? onCorrect?.() : onWrong?.())}
            disabled={!pickedLabel}
            className="mt-4 w-full rounded-2xl bg-sky-600 px-5 py-3 font-black text-white hover:bg-sky-700 disabled:opacity-40"
          >
            Check label
          </button>
        </div>
      ) : null}
    </div>
  );
}
