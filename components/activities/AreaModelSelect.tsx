"use client";

import { useState } from "react";
import type { AreaModelSelectQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

function FractionGrid({
  denominator,
  shadedParts,
  interactive,
  selectedParts,
  onToggle,
}: {
  denominator: number;
  shadedParts: number[];
  interactive?: boolean;
  selectedParts?: number[];
  onToggle?: (index: number) => void;
}) {
  const active = interactive ? selectedParts ?? [] : shadedParts;
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-3 shadow-sm">
      {Array.from({ length: denominator }).map((_, index) => {
        const filled = active.includes(index);
        return (
          <button
            key={index}
            type="button"
            onClick={() => onToggle?.(index)}
            disabled={!interactive}
            className={[
              "h-16 rounded-xl border-2 transition",
              filled ? "border-emerald-500 bg-emerald-400" : "border-slate-300 bg-slate-100",
              interactive ? "cursor-pointer hover:border-emerald-400" : "cursor-default",
            ].join(" ")}
          />
        );
      })}
    </div>
  );
}

export default function AreaModelSelect({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: AreaModelSelectQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [selectedParts, setSelectedParts] = useState<number[]>([]);
  const [pickedModelId, setPickedModelId] = useState<string | null>(null);

  function togglePart(index: number) {
    setSelectedParts((current) =>
      current.includes(index) ? current.filter((value) => value !== index) : [...current, index]
    );
  }

  function checkShade() {
    const chosen = [...selectedParts].sort((a, b) => a - b);
    const expected = Array.from({ length: questionData.numerator }, (_, index) => index);
    const correct =
      chosen.length === expected.length && chosen.every((value, index) => value === expected[index]);
    if (correct) onCorrect?.();
    else onWrong?.();
  }

  function checkModel() {
    if (!pickedModelId) return;
    if (pickedModelId === questionData.correctModelId) onCorrect?.();
    else onWrong?.();
  }

  const needsModelPick = questionData.mode !== "shade_fraction";

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>
      <p className="mt-2 text-sm text-slate-600">
        {needsModelPick ? "Choose the picture that matches the fraction." : "Tap the equal parts you want to shade."}
      </p>

      {!needsModelPick ? (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
          <FractionGrid
            denominator={questionData.denominator}
            shadedParts={[]}
            interactive
            selectedParts={selectedParts}
            onToggle={togglePart}
          />
          <button
            type="button"
            onClick={checkShade}
            className="mt-4 w-full rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-700"
          >
            Check shading
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {questionData.models?.map((model) => (
            <button
              key={model.id}
              type="button"
              onClick={() => setPickedModelId(model.id)}
              className={[
                "rounded-2xl border p-4 text-left transition",
                pickedModelId === model.id
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-gray-200 bg-slate-50 hover:bg-slate-100",
              ].join(" ")}
            >
              <FractionGrid
                denominator={model.denominator}
                shadedParts={model.shadedParts ?? []}
              />
            </button>
          ))}
          <button
            type="button"
            onClick={checkModel}
            disabled={!pickedModelId}
            className="sm:col-span-2 rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            Check choice
          </button>
        </div>
      )}
    </div>
  );
}
