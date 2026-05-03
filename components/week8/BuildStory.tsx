"use client";

import { useState } from "react";
import { StaticDotRow } from "@/components/StaticDots";
import { speak } from "@/lib/speak";

export default function BuildStory({
  story,
  mode,
  start,
  change,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  story: string;
  mode: "add" | "subtract";
  start: number;
  change: number;
  options: string[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);

  const targetLeft = mode === "add" ? start : start;
  const targetRight = mode === "add" ? change : change;
  const total = mode === "add" ? left + right : left - right;

  function choose(opt: string) {
    if (Number(opt) === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-lg font-extrabold text-gray-900">{story}</div>
        <button
          type="button"
          onClick={() => speak(story)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          🔊 Read
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">
            {mode === "add" ? "Start counters" : "Start counters"}
          </div>
          <StaticDotRow count={left} dotSize={20} gap={6} />
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLeft((v) => Math.max(0, v - 1))}
              className="px-3 py-2 rounded-lg bg-gray-100 font-bold"
            >
              −
            </button>
            <div className="text-sm font-bold text-gray-700">
              {left}/{targetLeft}
            </div>
            <button
              type="button"
              onClick={() => setLeft((v) => Math.min(targetLeft, v + 1))}
              className="px-3 py-2 rounded-lg bg-gray-100 font-bold"
            >
              +
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">
            {mode === "add" ? "Add counters" : "Take away"}
          </div>
          <StaticDotRow count={right} dotSize={20} gap={6} />
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRight((v) => Math.max(0, v - 1))}
              className="px-3 py-2 rounded-lg bg-gray-100 font-bold"
            >
              −
            </button>
            <div className="text-sm font-bold text-gray-700">
              {right}/{targetRight}
            </div>
            <button
              type="button"
              onClick={() => setRight((v) => Math.min(targetRight, v + 1))}
              className="px-3 py-2 rounded-lg bg-gray-100 font-bold"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm font-bold text-gray-700">
        {mode === "add" ? "How many now?" : "How many left?"}
      </div>
      <div className="mt-2 grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            onClick={() => choose(opt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
            type="button"
            disabled={left !== targetLeft || right !== targetRight}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Built: {left} {mode === "add" ? "+" : "−"} {right} = {total}
      </div>
    </div>
  );
}
