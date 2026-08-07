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
    <div className={`grid gap-2 rounded-lg bg-white p-3 shadow-sm ${denominator === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
      {Array.from({ length: denominator }).map((_, index) => {
        const filled = active.includes(index);
        const cellClass = [
          "h-16 rounded-xl border-2 transition",
          filled ? "border-emerald-500 bg-emerald-400" : "border-slate-300 bg-slate-100",
        ].join(" ");
        // Display cells are plain divs so a tap falls through to the parent
        // model button — a disabled <button> would swallow the click (and nested
        // buttons are invalid), which blocked selecting a fraction picture.
        if (!interactive) {
          return <div key={index} aria-hidden className={cellClass} />;
        }
        return (
          <button
            key={index}
            type="button"
            onClick={() => onToggle?.(index)}
            className={`${cellClass} cursor-pointer hover:border-emerald-400`}
          />
        );
      })}
    </div>
  );
}

function RepeatedHalvingWhole({ parts }: { parts: number }) {
  const columns = parts === 1 ? 1 : parts === 2 || parts === 4 ? 2 : 4;
  const rows = parts <= 2 ? 1 : 2;

  return (
    <div
      className="grid h-64 w-full overflow-hidden rounded-lg border-2 border-slate-400 bg-slate-100 shadow-sm"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
      role="img"
      aria-label={`The same whole divided into ${parts} equal part${parts === 1 ? "" : "s"}`}
    >
      {Array.from({ length: parts }, (_, index) => {
        const column = index % columns;
        const row = Math.floor(index / columns);
        return (
          <div
            key={`${parts}-${index}`}
            className={[
              "bg-slate-100 transition-colors duration-300",
              column > 0 ? "border-l-2 border-slate-400" : "",
              row > 0 ? "border-t-2 border-slate-400" : "",
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
  onWrong?: (studentAnswer?: string) => void;
}) {
  const [selectedParts, setSelectedParts] = useState<number[]>([]);
  const [pickedModelId, setPickedModelId] = useState<string | null>(null);
  const [halvingParts, setHalvingParts] = useState(1);
  const [pickedConnection, setPickedConnection] = useState<string | null>(null);

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
    else onWrong?.(`${chosen.length} shaded part${chosen.length === 1 ? "" : "s"}`);
  }

  function checkModel() {
    if (!pickedModelId) return;
    if (pickedModelId === questionData.correctModelId) onCorrect?.();
    else onWrong?.(pickedModelId);
  }

  function checkHalvingConnection() {
    if (!pickedConnection) return;
    if (pickedConnection === questionData.connectionAnswer) onCorrect?.();
    else onWrong?.(pickedConnection);
  }

  if (questionData.mode === "repeated_halving") {
    const target = questionData.halvingTarget ?? questionData.denominator;
    const stageLabel =
      halvingParts === 1
        ? "One whole"
        : halvingParts === 2
          ? "2 equal parts: halves"
          : halvingParts === 4
            ? "4 equal parts: quarters"
            : "8 equal parts: eighths";
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">Repeated Halving Lab</div>
            <h2 className="mt-2 text-2xl font-black text-gray-900">{questionData.prompt}</h2>
          </div>
          <ReadAloudBtn text={questionData.prompt} />
        </div>

        <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50 p-4">
          <div className="text-center text-sm font-black text-emerald-900">{stageLabel}</div>
          <div className="mx-auto mt-3 max-w-md">
            <RepeatedHalvingWhole parts={halvingParts} />
          </div>
          {halvingParts < target ? (
            <button
              type="button"
              onClick={() => setHalvingParts((current) => Math.min(target, current * 2))}
              className="mt-4 w-full rounded-lg bg-emerald-700 px-5 py-3 font-black text-white transition hover:bg-emerald-800"
            >
              Halve every part
            </button>
          ) : null}
        </div>

        {halvingParts === target ? (
          <div className="mt-5">
            <div className="text-sm font-black text-slate-800">Which connection is true?</div>
            <div className="mt-3 grid gap-2">
              {questionData.connectionOptions?.map((option) => (
                <div key={option} className={`flex min-h-16 items-stretch overflow-hidden rounded-lg border-2 bg-white ${pickedConnection === option ? "border-emerald-500" : "border-slate-200"}`}>
                  <button
                    type="button"
                    onClick={() => setPickedConnection(option)}
                    className="min-w-0 flex-1 px-4 py-3 text-left font-bold text-slate-900"
                  >
                    {option}
                  </button>
                  <div className="grid w-14 place-items-center border-l border-slate-200">
                    <ReadAloudBtn text={option} />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={checkHalvingConnection}
              disabled={!pickedConnection}
              className="mt-4 w-full rounded-lg bg-emerald-700 px-5 py-3 font-black text-white transition hover:bg-emerald-800 disabled:opacity-40"
            >
              Check connection
            </button>
          </div>
        ) : null}
      </div>
    );
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
