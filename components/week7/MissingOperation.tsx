"use client";

import { Volume2 } from "lucide-react";
import { useState } from "react";
import { speak } from "@/lib/speak";

export default function MissingOperation({
  story,
  a,
  b,
  result,
  answer,
  onCorrect,
  onWrong,
}: {
  story?: string;
  a: number;
  b: number;
  result: number;
  answer: "+" | "-";
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<"+" | "-" | null>(null);

  function choose(v: "+" | "-") {
    setPicked(v);
    if (v === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      {story ? (
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-800">
            {story}
          </div>
          <button
            onClick={() => speak(story)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
            type="button"
          >
            <span className="inline-flex items-center gap-1.5"><Volume2 className="h-4 w-4" /> Read</span>
          </button>
        </div>
      ) : null}
      <div className="text-3xl font-black text-slate-900 text-center mb-4">
        {a} <span className="px-2">□</span> {b} = {result}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => choose("+")}
          className={[
            "px-5 py-4 rounded-lg border text-2xl font-black transition",
            picked === "+"
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-200 hover:bg-slate-50",
          ].join(" ")}
          type="button"
        >
          +
        </button>
        <button
          onClick={() => choose("-")}
          className={[
            "px-5 py-4 rounded-lg border text-2xl font-black transition",
            picked === "-"
              ? "border-rose-500 bg-rose-50"
              : "border-slate-200 hover:bg-slate-50",
          ].join(" ")}
          type="button"
        >
          −
        </button>
      </div>
    </div>
  );
}
