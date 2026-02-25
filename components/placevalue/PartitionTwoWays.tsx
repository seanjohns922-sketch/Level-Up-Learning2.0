"use client";

import { useMemo, useState } from "react";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Pair = { a: number; b: number };

export default function PartitionTwoWays({
  min = 20,
  max = 99,
  onCorrect,
}: {
  min?: number;
  max?: number;
  onCorrect?: () => void;
}) {
  const target = useMemo(() => randInt(min, max), [min, max]);

  const correctPair = useMemo(() => {
    const tens = Math.floor(target / 10) * 10;
    const ones = target - tens;
    return { a: tens, b: ones };
  }, [target]);

  const options = useMemo(() => {
    const distractors: Pair[] = [];
    while (distractors.length < 3) {
      const a = randInt(1, target - 1);
      const b = randInt(1, target - 1);
      const sum = a + b;
      const dup = distractors.some((d) => d.a === a && d.b === b);
      const same = a === correctPair.a && b === correctPair.b;
      if (sum !== target && !dup && !same) distractors.push({ a, b });
    }
    return shuffle([correctPair, ...distractors]);
  }, [correctPair, target]);

  const [picked, setPicked] = useState<Pair | null>(null);
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");

  function choose(p: Pair) {
    setPicked(p);
    const ok = p.a + p.b === target;
    setStatus(ok ? "correct" : "wrong");
    if (ok) onCorrect?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-gray-600 mb-2">Partition</div>
      <div className="text-2xl font-extrabold text-gray-900 mb-4">
        Partition {target}
      </div>

      <div className="grid gap-3">
        {options.map((p, i) => {
          const isPicked = picked?.a === p.a && picked?.b === p.b;
          return (
            <button
              key={i}
              onClick={() => choose(p)}
              className={[
                "w-full text-left rounded-2xl border px-4 py-4 font-bold transition",
                isPicked
                  ? status === "correct"
                    ? "border-green-400 bg-green-50"
                    : "border-red-300 bg-red-50"
                  : "border-gray-200 bg-white hover:bg-gray-50",
              ].join(" ")}
            >
              {p.a} + {p.b}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-sm font-bold">
        {status === "correct" ? (
          <span className="text-green-700">✅ Correct!</span>
        ) : status === "wrong" ? (
          <span className="text-red-700">Not quite — try again.</span>
        ) : (
          <span className="text-gray-500">Pick a partition.</span>
        )}
      </div>
    </div>
  );
}
