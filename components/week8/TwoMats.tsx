"use client";

import { useState } from "react";
import { StaticDotRow } from "@/components/StaticDots";

export default function TwoMats({
  story,
  mode,
  a,
  b,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  story: string;
  mode: "add" | "subtract";
  a: number;
  b: number;
  options: string[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [left, setLeft] = useState(mode === "add" ? 0 : a);
  const [right, setRight] = useState(0);
  const [joined, setJoined] = useState(false);

  function reset() {
    setLeft(mode === "add" ? 0 : a);
    setRight(0);
    setJoined(false);
  }

  function choose(opt: string) {
    if (Number(opt) === answer) onCorrect?.();
    else onWrong?.();
  }

  const remaining = mode === "add" ? left : a - right;
  const total = mode === "add" ? left + right : remaining;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm font-bold text-gray-600 mb-2">{story}</div>
      <div className="text-lg font-extrabold text-gray-900 mb-3">
        {mode === "add" ? "Act it out: Join the two groups." : "Act it out: Take some away."}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">
            {mode === "add" ? "Group A" : "Remaining"}
          </div>
          <StaticDotRow count={mode === "add" ? left : remaining} dotSize={20} gap={6} />
          {mode === "add" ? (
            <div className="mt-3 flex items-center gap-2">
              <button type="button" onClick={() => setLeft((v) => Math.max(0, v - 1))} className="px-3 py-2 rounded-lg bg-gray-100 font-bold">−</button>
              <div className="text-sm font-bold text-gray-700">{left}/{a}</div>
              <button type="button" onClick={() => setLeft((v) => Math.min(a, v + 1))} className="px-3 py-2 rounded-lg bg-gray-100 font-bold">+</button>
            </div>
          ) : (
            <div className="mt-3 text-sm font-bold text-gray-700">
              Start: {a} · Left: {remaining}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
          <div className="text-xs font-bold text-gray-600 mb-2">
            {mode === "add" ? "Group B" : "Taken away"}
          </div>
          <StaticDotRow count={right} dotSize={20} gap={6} />
          <div className="mt-3 flex items-center gap-2">
            <button type="button" onClick={() => setRight((v) => Math.max(0, v - 1))} className="px-3 py-2 rounded-lg bg-gray-100 font-bold">−</button>
            <div className="text-sm font-bold text-gray-700">{right}/{b}</div>
            <button type="button" onClick={() => setRight((v) => Math.min(b, v + 1))} className="px-3 py-2 rounded-lg bg-gray-100 font-bold">+</button>
          </div>
        </div>
      </div>

      {mode === "add" ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setJoined(true)}
            className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700 transition"
            disabled={left !== a || right !== b}
          >
            Join
          </button>
        </div>
      ) : null}

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
            disabled={mode === "add" ? !joined : right !== b}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-gray-100 font-bold"
        >
          Reset
        </button>
        <div className="text-xs text-gray-500">
          {mode === "add"
            ? `Built: ${left} + ${right} = ${total}`
            : `Remaining: ${a} − ${right} = ${total}`}
        </div>
      </div>
    </div>
  );
}
