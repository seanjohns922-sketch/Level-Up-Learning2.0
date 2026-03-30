"use client";

import { useState } from "react";
import type { NumberLinePlaceQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

export default function NumberLinePlace({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: NumberLinePlaceQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [order, setOrder] = useState<string[]>([]);

  const quarterOptions = questionData.options ?? ["1/4", "1/2", "3/4"];

  function choose(value: string) {
    if (questionData.mode === "order_fractions") {
      setOrder((current) => (current.includes(value) ? current : [...current, value]));
      return;
    }
    setPicked(value);
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>

      <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
        <div className="relative mx-4 h-1 rounded bg-slate-400">
          {["0", ...quarterOptions, "1"].map((value, index, all) => (
            <button
              key={value}
              type="button"
              onClick={() => choose(value)}
              className={[
                "absolute -top-3 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 text-xs font-black",
                picked === value ? "border-violet-600 bg-violet-500 text-white" : "border-slate-400 bg-white text-slate-700",
              ].join(" ")}
              style={{ left: `${(index / (all.length - 1)) * 100}%` }}
            >
              •
            </button>
          ))}
        </div>
        <div className="mt-8 flex justify-between text-sm font-bold text-slate-700">
          {["0", ...quarterOptions, "1"].map((value) => (
            <span key={value}>{value}</span>
          ))}
        </div>
      </div>

      {questionData.mode === "order_fractions" ? (
        <div className="mt-6">
          <div className="flex flex-wrap gap-3">
            {(questionData.fractions ?? []).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => choose(value)}
                className="rounded-2xl border border-violet-300 bg-white px-4 py-3 text-lg font-black text-violet-900"
              >
                {value}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-dashed border-violet-300 bg-white p-4 text-lg font-black text-violet-900">
            {order.length > 0 ? order.join(" , ") : "Tap fractions in order here"}
          </div>
          <button
            type="button"
            onClick={() => (order.join(",") === questionData.answer ? onCorrect?.() : onWrong?.())}
            className="mt-4 w-full rounded-2xl bg-violet-600 px-5 py-3 font-black text-white hover:bg-violet-700"
          >
            Check order
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => (picked === questionData.answer ? onCorrect?.() : onWrong?.())}
          disabled={!picked}
          className="mt-6 w-full rounded-2xl bg-violet-600 px-5 py-3 font-black text-white hover:bg-violet-700 disabled:opacity-40"
        >
          Check position
        </button>
      )}
    </div>
  );
}
