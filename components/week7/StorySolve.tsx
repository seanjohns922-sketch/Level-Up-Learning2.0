"use client";

import { useState } from "react";

function speak(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.9;
  u.pitch = 1.0;
  u.volume = 1.0;
  synth.speak(u);
}

export default function StorySolve({
  story,
  a,
  b,
  op,
  answer,
  options,
  requireOpChoice,
  hideEquation,
  allowEquationInput,
  onCorrect,
  onWrong,
}: {
  story: string;
  a: number;
  b: number;
  op: "add" | "subtract";
  answer: number;
  options: string[];
  requireOpChoice?: boolean;
  hideEquation?: boolean;
  allowEquationInput?: boolean;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [pickedOp, setPickedOp] = useState<"add" | "subtract" | null>(
    requireOpChoice ? null : op
  );
  const [picked, setPicked] = useState<string | null>(null);
  const [equationText, setEquationText] = useState("");

  function chooseOp(v: "add" | "subtract") {
    setPickedOp(v);
  }

  function chooseAnswer(v: string) {
    setPicked(v);
    if (v === String(answer)) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-sm font-bold text-gray-600">Solve the story</div>
        <button
          onClick={() => speak(story)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
          type="button"
        >
          🔊 Read
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-800">
        {story}
      </div>

      {requireOpChoice ? (
        <div className="mt-4 grid md:grid-cols-2 gap-3">
          <button
            onClick={() => chooseOp("add")}
            className={[
              "px-5 py-4 rounded-2xl border text-lg font-black transition",
              pickedOp === "add"
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 hover:bg-gray-50",
            ].join(" ")}
            type="button"
          >
            ➕ Add
          </button>
          <button
            onClick={() => chooseOp("subtract")}
            className={[
              "px-5 py-4 rounded-2xl border text-lg font-black transition",
              pickedOp === "subtract"
                ? "border-rose-500 bg-rose-50"
                : "border-gray-200 hover:bg-gray-50",
            ].join(" ")}
            type="button"
          >
            ➖ Subtract
          </button>
        </div>
      ) : null}

      <div className="mt-4">
        {!hideEquation && pickedOp ? (
          <div className="text-3xl font-black text-gray-900 text-center mb-3">
            {a} {pickedOp === "add" ? "+" : "-"} {b}
          </div>
        ) : null}
        {allowEquationInput && pickedOp ? (
          <div className="mb-3">
            <label className="text-sm font-bold text-gray-600 block mb-2">
              Type the equation (optional)
            </label>
            <input
              value={equationText}
              onChange={(e) => setEquationText(e.target.value)}
              placeholder="e.g., 10 + 7"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-lg font-bold"
            />
          </div>
        ) : null}
        {requireOpChoice && !pickedOp ? (
          <div className="text-sm text-gray-500 mb-2">
            Choose + or −, then answer the question.
          </div>
        ) : null}
        <div
          className={[
            "grid gap-3",
            requireOpChoice && !pickedOp ? "opacity-50 pointer-events-none" : "",
          ].join(" ")}
        >
          {options.map((opt, i) => (
            <button
              key={`${opt}-${i}`}
              onClick={() => chooseAnswer(opt)}
              className={[
                "w-full text-left px-5 py-4 rounded-2xl border text-2xl font-black transition",
                picked === opt
                  ? "border-teal-600 bg-teal-50"
                  : "border-gray-200 hover:bg-gray-50",
              ].join(" ")}
              type="button"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
