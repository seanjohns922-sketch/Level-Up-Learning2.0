"use client";

import { useState } from "react";
import type { BuildTheWholeQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

function WholeBar({ parts, activeParts }: { parts: number; activeParts: number }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${parts}, minmax(0, 1fr))` }}>
      {Array.from({ length: parts }).map((_, index) => (
        <div
          key={index}
          className={[
            "h-16 rounded-xl border-2",
            index < activeParts ? "border-amber-500 bg-amber-300" : "border-slate-300 bg-slate-100",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

function PartCard({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-wide text-amber-700">Given Part</div>
      <div className="mt-3 grid gap-2">
        <div className="h-16 rounded-xl border-2 border-amber-500 bg-amber-300" />
      </div>
      <div className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-900">
        {label}
      </div>
    </div>
  );
}

export default function BuildTheWhole({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: BuildTheWholeQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [selectedParts, setSelectedParts] = useState(1);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [pickedTotal, setPickedTotal] = useState<number | null>(null);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>
      <p className="mt-2 text-sm text-slate-600">Use the part to work out the whole.</p>

      {questionData.mode === "build_whole" ? (
        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <WholeBar parts={questionData.denominator} activeParts={selectedParts} />
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedParts((value) => Math.max(1, value - 1))}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-black"
            >
              - Part
            </button>
            <div className="text-lg font-black text-slate-900">{selectedParts} parts selected</div>
            <button
              type="button"
              onClick={() => setSelectedParts((value) => Math.min(questionData.denominator + 1, value + 1))}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 font-black"
            >
              + Part
            </button>
          </div>
          <button
            type="button"
            onClick={() => (selectedParts === questionData.answer ? onCorrect?.() : onWrong?.())}
            className="mt-4 w-full rounded-2xl bg-amber-500 px-5 py-3 font-black text-white hover:bg-amber-600"
          >
            Check whole
          </button>
        </div>
      ) : null}

      {questionData.mode === "fill_total" ? (
        <div className="mt-6 grid gap-3">
          {questionData.options?.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPickedTotal(option.total ?? null)}
              className={[
                "rounded-2xl border px-5 py-4 text-left text-xl font-black",
                pickedTotal === option.total ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-white",
              ].join(" ")}
            >
              {option.total}
            </button>
          ))}
          <button
            type="button"
            onClick={() => (pickedTotal === questionData.answer ? onCorrect?.() : onWrong?.())}
            disabled={pickedTotal === null}
            className="rounded-2xl bg-amber-500 px-5 py-3 font-black text-white hover:bg-amber-600 disabled:opacity-40"
          >
            Check answer
          </button>
        </div>
      ) : null}

      {questionData.mode === "pick_whole" ? (
        <div className="mt-6">
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-amber-700">Given Part</div>
            <p className="mt-2 text-sm font-medium text-slate-700">
              This one part is {questionData.fractionLabel}.
            </p>
            <div className="mt-4 max-w-xs">
              <PartCard label={questionData.fractionLabel} />
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Answer Choices</div>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              {questionData.options?.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPickedId(option.id)}
                  className={[
                    "rounded-2xl border p-4 text-left transition",
                    pickedId === option.id ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-slate-50",
                  ].join(" ")}
                >
                  <div className="mb-3 text-sm font-bold text-slate-600">
                    {option.parts} equal parts
                  </div>
                  <WholeBar parts={option.parts} activeParts={option.parts} />
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => (pickedId === questionData.correctOptionId ? onCorrect?.() : onWrong?.())}
            disabled={!pickedId}
            className="mt-4 w-full rounded-2xl bg-amber-500 px-5 py-3 font-black text-white hover:bg-amber-600 disabled:opacity-40"
          >
            Check whole
          </button>
        </div>
      ) : null}
    </div>
  );
}
