"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { MathFormattedText } from "@/components/FractionText";
import type { BenchmarkSortQuestion } from "@/data/activities/year2/lessonEngine";

type BenchmarkCategory = "less" | "equal" | "greater";

const CATEGORY_LABELS: Record<BenchmarkCategory, string> = {
  less: "Less than 1/2",
  equal: "Equal to 1/2",
  greater: "Greater than 1/2",
};

export default function BenchmarkSort({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: BenchmarkSortQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const valuesKey = useMemo(
    () => questionData.values.map((value) => value.id).join("|"),
    [questionData.values]
  );
  const initialPlacements = useMemo(
    () => Object.fromEntries(questionData.values.map((value) => [value.id, null])) as Record<string, BenchmarkCategory | null>,
    [questionData.values]
  );
  const [placementState, setPlacementState] = useState<{
    key: string;
    placements: Record<string, BenchmarkCategory | null>;
  }>(() => ({ key: valuesKey, placements: initialPlacements }));
  const [feedbackState, setFeedbackState] = useState<{
    key: string;
    feedbackById: Record<string, "correct" | "wrong" | undefined>;
  }>(() => ({ key: valuesKey, feedbackById: {} }));
  const submittedRef = useRef<string | null>(null);
  const placements = placementState.key === valuesKey ? placementState.placements : initialPlacements;
  const feedbackById = feedbackState.key === valuesKey ? feedbackState.feedbackById : {};

  const allPlaced = useMemo(
    () => questionData.values.length > 0 && questionData.values.every((value) => placements[value.id]),
    [placements, questionData.values]
  );

  useEffect(() => {
    if (!allPlaced || submittedRef.current === valuesKey) return;
    const allCorrect = questionData.values.every((value) => placements[value.id] === value.category);
    submittedRef.current = valuesKey;
    if (allCorrect) onCorrect?.();
    else onWrong?.();
  }, [allPlaced, onCorrect, onWrong, placements, questionData.values, valuesKey]);

  function placeValue(id: string, category: BenchmarkCategory) {
    if (submittedRef.current === valuesKey) return;
    const value = questionData.values.find((item) => item.id === id);
    setPlacementState((current) => ({
      key: valuesKey,
      placements: {
        ...(current.key === valuesKey ? current.placements : initialPlacements),
        [id]: category,
      },
    }));
    setFeedbackState((current) => ({
      key: valuesKey,
      feedbackById: {
        ...(current.key === valuesKey ? current.feedbackById : {}),
        [id]: value?.category === category ? "correct" : "wrong",
      },
    }));
  }

  return (
    <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(2,23,22,0.04),0_8px_24px_rgba(2,23,22,0.05)]">
      <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-teal-700/90">
        Benchmark Sort
      </div>
      <div className="mt-2 flex items-start gap-2.5">
        <h2 className="text-[1.65rem] font-bold leading-[1.15] tracking-[-0.02em] text-slate-900">
          {questionData.prompt}
        </h2>
        <div className="mt-1.5">
          <ReadAloudBtn text={questionData.prompt} />
        </div>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-500">{questionData.helper}</p>

      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
            Sort using 1/2
          </div>
          <div className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-800 shadow-sm">
            <MathFormattedText text="0 • 1/2 • 1" compactFractions />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {questionData.values.map((value) => (
            <div
              key={value.id}
              className={[
                "rounded-2xl border bg-white p-4 shadow-sm",
                feedbackById[value.id] === "correct"
                  ? "border-emerald-300 ring-1 ring-emerald-200"
                  : feedbackById[value.id] === "wrong"
                  ? "border-rose-300 ring-1 ring-rose-200"
                  : "border-white",
              ].join(" ")}
            >
              <div className="text-center text-3xl font-black text-slate-900">
                <MathFormattedText text={value.label} compactFractions />
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {(["less", "equal", "greater"] as BenchmarkCategory[]).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => placeValue(value.id, category)}
                    className={[
                      "rounded-xl px-3 py-2 text-sm font-black transition",
                      placements[value.id] === category
                        ? "bg-teal-700 text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-900",
                    ].join(" ")}
                  >
                    <MathFormattedText text={CATEGORY_LABELS[category]} compactFractions />
                  </button>
                ))}
              </div>
              {feedbackById[value.id] ? (
                <p
                  className={[
                    "mt-2 text-center text-xs font-bold",
                    feedbackById[value.id] === "correct" ? "text-emerald-700" : "text-rose-700",
                  ].join(" ")}
                >
                  {feedbackById[value.id] === "correct"
                    ? "Correct benchmark."
                    : "Try comparing it to 1/2."}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
