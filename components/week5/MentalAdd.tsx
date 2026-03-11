"use client";

import { useState } from "react";

export default function MentalAdd({
  prompt,
  equation,
  strategy,
  a,
  b,
  options,
  answer,
  onCorrect,
  onWrong,
}: {
  prompt: string;
  equation: string;
  strategy: "make10" | "double" | "nearDouble";
  a: number;
  b: number;
  options: number[];
  answer: number;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);

  function TenFrame({
    count,
    colorClass,
  }: {
    count: number;
    colorClass: string;
  }) {
    return (
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 10 }).map((_, i) => {
          const on = i < count;
          return (
            <span
              key={i}
              className={[
                "h-5 w-5 rounded-full border",
                on ? colorClass : "border-gray-300 bg-white",
              ].join(" ")}
            />
          );
        })}
      </div>
    );
  }

  function DotGrid({
    count,
    highlightIndex,
  }: {
    count: number;
    highlightIndex?: number;
  }) {
    return (
      <div className="grid grid-cols-3 gap-2 justify-items-center">
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={[
              "h-5 w-5 rounded-full border",
              highlightIndex === i
                ? "border-amber-500 bg-amber-200"
                : "border-teal-600 bg-teal-100",
            ].join(" ")}
          />
        ))}
      </div>
    );
  }

  function renderVisual() {
    if (strategy === "make10") {
      const need = Math.max(0, 10 - a);
      const leftover = Math.max(0, b - need);
      return (
        <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
          <div className="text-xs font-bold text-indigo-700 mb-3">
            Make 10, then add the rest
          </div>
          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-indigo-200 bg-white px-4 py-2 font-bold text-indigo-900">
                {a}
              </div>
              <div className="text-gray-500 font-bold">+</div>
              <div className="rounded-xl border border-emerald-200 bg-white px-4 py-2 font-bold text-emerald-900">
                {b}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-indigo-200 bg-white px-4 py-2 font-bold text-indigo-900">
                {a}
              </div>
              <div className="text-gray-500 font-bold">+</div>
              <div className="rounded-xl border border-emerald-200 bg-white px-4 py-2 font-bold text-emerald-900">
                {need}
              </div>
              <div className="text-gray-400 font-bold">+</div>
              <div className="rounded-xl border border-emerald-200 bg-white px-4 py-2 font-bold text-emerald-900">
                {leftover}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-indigo-300 bg-indigo-100 px-4 py-2 font-black text-indigo-900">
                10
              </div>
              <div className="text-gray-500 font-bold">+</div>
              <div className="rounded-xl border border-emerald-200 bg-white px-4 py-2 font-bold text-emerald-900">
                {leftover}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (strategy === "double") {
      return (
        <div className="mt-4 rounded-2xl border border-purple-100 bg-purple-50 p-4">
          <div className="text-xs font-bold text-purple-700 mb-3">
            Doubles are the same
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-purple-200 bg-white p-3">
              <div className="text-xs font-bold text-gray-600 mb-2">Left</div>
              <DotGrid count={a} />
            </div>
            <div className="rounded-xl border border-purple-200 bg-white p-3">
              <div className="text-xs font-bold text-gray-600 mb-2">Right</div>
              <DotGrid count={b} />
            </div>
          </div>
        </div>
      );
    }

    const extra = Math.abs(a - b);
    const base = Math.min(a, b);
    return (
      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="text-xs font-bold text-emerald-700 mb-3">
          Near doubles: double {base} + {extra}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-emerald-200 bg-white p-3">
            <div className="text-xs font-bold text-gray-600 mb-2">Base</div>
            <DotGrid count={base} />
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white p-3">
            <div className="text-xs font-bold text-gray-600 mb-2">Extra</div>
            <DotGrid count={base + extra} highlightIndex={base} />
          </div>
        </div>
      </div>
    );
  }

  function choose(v: number) {
    setPicked(v);
    if (v === answer) onCorrect?.();
    else onWrong?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm font-bold text-gray-600">{prompt}</div>
      <div className="mt-2 text-5xl font-black text-gray-900 text-center">
        {equation}
      </div>

      {renderVisual()}

      <div className="mt-6 grid gap-3">
        {options.map((v, i) => (
          <button
            key={`${v}-${i}`}
            onClick={() => choose(v)}
            className={[
              "w-full text-left px-5 py-4 rounded-2xl border text-2xl font-black transition",
              picked === v
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 hover:bg-gray-50",
            ].join(" ")}
            type="button"
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
