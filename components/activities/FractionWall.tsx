"use client";

import { useMemo, useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { FractionWallQuestion } from "@/data/activities/year2/lessonEngine";

const ROW_COLORS = [
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-400",
  "bg-lime-500",
  "bg-green-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-violet-500",
] as const;

function arraysMatch(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

export default function FractionWall({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: FractionWallQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  const sortedSelected = useMemo(() => [...selected].sort(), [selected]);

  function togglePiece(key: string) {
    setSelected((current) =>
      current.includes(key) ? current.filter((value) => value !== key) : [...current, key]
    );
  }

  function checkAnswer() {
    const correct = questionData.answerSets.some((answerSet) =>
      arraysMatch(sortedSelected, [...answerSet].sort())
    );
    if (correct) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>
      {questionData.helper ? (
        <p className="mt-2 text-sm text-slate-600">{questionData.helper}</p>
      ) : null}

      <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="mb-3 text-xs font-bold uppercase tracking-wide text-emerald-700">
          Fraction Wall
        </div>
        <div className="space-y-2">
          {questionData.rows.map((denominator, rowIndex) => {
            const color = ROW_COLORS[rowIndex % ROW_COLORS.length] ?? "bg-emerald-500";
            const pieces = denominator === 1 ? 1 : denominator;
            return (
              <div key={denominator} className="grid grid-cols-[64px_1fr] items-center gap-3">
                <div className="text-sm font-black text-slate-700">
                  {denominator === 1 ? "1" : `1/${denominator}`}
                </div>
                <div
                  className="grid overflow-hidden rounded-xl border border-white/70 bg-white/70"
                  style={{ gridTemplateColumns: `repeat(${pieces}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: pieces }).map((_, index) => {
                    const key = `${denominator}-${index}`;
                    const picked = selected.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => togglePiece(key)}
                        className={[
                          "relative h-14 border-r border-white/80 last:border-r-0 transition",
                          picked ? color : `${color} opacity-30`,
                        ].join(" ")}
                      >
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-black text-white">
                          {denominator === 1 ? "1" : `1/${denominator}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={checkAnswer}
        className="mt-5 w-full rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-700"
      >
        Check wall
      </button>
    </div>
  );
}
