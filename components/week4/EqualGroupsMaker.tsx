"use client";

import { useMemo, useState } from "react";

type Prompt = { groups: number; perGroup: number; total: number };
const COLORS = [
  { name: "Blue", bg: "bg-blue-600", soft: "bg-blue-50", border: "border-blue-300" },
  { name: "Red", bg: "bg-red-600", soft: "bg-red-50", border: "border-red-300" },
  { name: "Green", bg: "bg-green-600", soft: "bg-green-50", border: "border-green-300" },
  { name: "Orange", bg: "bg-orange-500", soft: "bg-orange-50", border: "border-orange-300" },
  { name: "Purple", bg: "bg-purple-600", soft: "bg-purple-50", border: "border-purple-300" },
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makePrompt(): Prompt {
  const options: Array<[number, number]> = [
    [3, 2],
    [3, 3],
    [4, 2],
    [4, 3],
    [5, 2],
    [5, 3],
  ];
  const [groups, perGroup] = options[randInt(0, options.length - 1)];
  return { groups, perGroup, total: groups * perGroup };
}

export default function EqualGroupsMaker({
  onCorrect,
}: {
  onCorrect?: () => void;
}) {
  const [seed, setSeed] = useState(0);
  const prompt = useMemo(() => makePrompt(), [seed]);

  const [assign, setAssign] = useState<number[]>(
    () => Array(prompt.total).fill(-1)
  );
  const [activeGroup, setActiveGroup] = useState(0);
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");

  function reset() {
    setAssign(Array(prompt.total).fill(-1));
    setActiveGroup(0);
    setStatus("idle");
    setSeed((s) => s + 1);
  }

  function toggleCounter(i: number) {
    setAssign((prev) => {
      const next = [...prev];
      next[i] = next[i] === activeGroup ? -1 : activeGroup;
      return next;
    });
    setStatus("idle");
  }

  function check() {
    const counts = Array(prompt.groups).fill(0);
    for (const g of assign) if (g >= 0) counts[g] += 1;

    const allAssigned = assign.every((g) => g >= 0);
    const equal = counts.every((c) => c === prompt.perGroup);

    const ok = allAssigned && equal;
    setStatus(ok ? "correct" : "wrong");
    if (ok) onCorrect?.();
    if (ok) setTimeout(reset, 650);
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-2xl font-extrabold text-gray-900">
            You have {prompt.total} counters
          </div>
          <div className="text-sm text-gray-600 mt-1 font-semibold">
            Divide them evenly into {prompt.groups} colors.
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Tap a color, then tap counters to color them.
          </div>
        </div>
        <div className="text-xs font-bold text-gray-500">
          Total: {prompt.total}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-5">
        {Array.from({ length: prompt.groups }).map((_, i) => {
          const count = assign.filter((g) => g === i).length;
          const c = COLORS[i % COLORS.length];
          return (
            <button
              key={i}
              onClick={() => setActiveGroup(i)}
              className={[
                "rounded-2xl border px-3 py-3 text-left transition",
                activeGroup === i
                  ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                  : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50",
              ].join(" ")}
              type="button"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-wide">
                  {c?.name ?? `Color ${i + 1}`}
                </div>
                <div className={["h-3 w-3 rounded-full", c?.bg ?? ""].join(" ")} />
              </div>
              <div className="text-2xl font-extrabold">{count}</div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
        <div className="grid grid-cols-6 gap-2">
          {assign.map((g, i) => {
            const c = g === -1 ? null : COLORS[g];
            return (
              <button
                key={i}
                onClick={() => toggleCounter(i)}
                className={[
                  "h-11 rounded-2xl border font-extrabold transition flex items-center justify-center",
                  g === -1
                    ? "bg-white border-gray-200 hover:bg-gray-100"
                    : `${c?.soft ?? "bg-gray-100"} ${c?.border ?? "border-gray-300"}`,
                ].join(" ")}
                title={g === -1 ? "Unassigned" : c?.name ?? `Color ${g + 1}`}
                type="button"
              >
                <span
                  className={[
                    "h-3.5 w-3.5 rounded-full",
                    c?.bg ?? "bg-gray-300",
                  ].join(" ")}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={check}
          className="px-5 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700"
          type="button"
        >
          Check
        </button>
        <button
          onClick={reset}
          className="px-5 py-3 rounded-2xl bg-gray-100 font-extrabold hover:bg-gray-200"
          type="button"
        >
          New
        </button>

        <div className="text-sm font-bold">
          {status === "correct" ? (
            <span className="text-green-700">✅ Correct!</span>
          ) : status === "wrong" ? (
            <span className="text-red-700">Not quite — try again.</span>
          ) : (
            <span className="text-gray-500">Make them equal.</span>
          )}
        </div>
      </div>
    </div>
  );
}
