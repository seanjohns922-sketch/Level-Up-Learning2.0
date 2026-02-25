"use client";

import { useState } from "react";
import { StaticDotRow } from "@/components/StaticDots";

export default function WhatHappened({
  before,
  after,
  answerOp,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  before: number;
  after: number;
  answerOp: "add" | "subtract";
  options: string[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [pickedOp, setPickedOp] = useState<"add" | "subtract" | null>(null);

  function chooseOp(op: "add" | "subtract") {
    setPickedOp(op);
  }

  function chooseAnswer(opt: string) {
    if (!pickedOp) return;
    const correctOp = pickedOp === answerOp;
    const correctAnswer = Number(opt) === answer;
    if (correctOp && correctAnswer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-lg font-extrabold text-gray-900 mb-3">What happened?</div>
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 grid gap-3">
        <div>
          <div className="text-xs font-bold text-gray-600 mb-2">Before</div>
          <StaticDotRow count={before} dotSize={20} gap={6} />
        </div>
        <div>
          <div className="text-xs font-bold text-gray-600 mb-2">After</div>
          <StaticDotRow count={after} dotSize={20} gap={6} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => chooseOp("add")}
          className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-extrabold"
        >
          ➕ Added
        </button>
        <button
          type="button"
          onClick={() => chooseOp("subtract")}
          className="px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-extrabold"
        >
          ➖ Taken away
        </button>
      </div>

      <div className="mt-4 text-sm font-bold text-gray-700">How many are there now?</div>
      <div className="mt-2 grid gap-2">
        {options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            onClick={() => chooseAnswer(opt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
            type="button"
            disabled={!pickedOp}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
