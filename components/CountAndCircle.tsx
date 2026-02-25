"use client";

import { useMemo, useState } from "react";

type CountCircleConfig = {
  minTarget?: number;
  maxTarget?: number;
  totalDots?: number;
  rounds?: number;
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function CountAndCircle({
  config,
  onComplete,
}: {
  config?: CountCircleConfig;
  onComplete?: () => void;
}) {
  const minTarget = config?.minTarget ?? 5;
  const maxTarget = config?.maxTarget ?? 50;
  const totalDots = config?.totalDots ?? 36;
  const rounds = config?.rounds ?? 8;

  const [round, setRound] = useState(1);
  const [target, setTarget] = useState(() =>
    randInt(minTarget, Math.min(maxTarget, totalDots))
  );
  const [selected, setSelected] = useState<boolean[]>(
    Array(totalDots).fill(false)
  );
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const selectedCount = useMemo(
    () => selected.filter(Boolean).length,
    [selected]
  );

  function toggle(i: number) {
    if (status !== "idle") return;
    setSelected((prev) => {
      const copy = [...prev];
      copy[i] = !copy[i];
      return copy;
    });
  }

  function check() {
    if (selectedCount === target) {
      setStatus("correct");
      setTimeout(nextRound, 600);
    } else {
      setStatus("wrong");
      setTimeout(() => setStatus("idle"), 600);
    }
  }

  function nextRound() {
    const next = round + 1;
    if (next > rounds) {
      onComplete?.();
      return;
    }
    setRound(next);
    setTarget(randInt(minTarget, Math.min(maxTarget, totalDots)));
    setSelected(Array(totalDots).fill(false));
    setStatus("idle");
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4 text-sm text-gray-600">
        <div>
          Count & Circle • Round {round}/{rounds}
        </div>
        <div>
          Selected: <strong>{selectedCount}</strong>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 mb-4">
        <div className="text-2xl font-extrabold text-gray-900">
          Circle <span className="text-indigo-600">{target}</span> counters
        </div>

        {status === "correct" && (
          <div className="mt-2 text-green-700 font-bold">✅ Correct!</div>
        )}
        {status === "wrong" && (
          <div className="mt-2 text-red-700 font-bold">❌ Try again</div>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-5 mb-4">
        <div className="grid grid-cols-6 gap-3 max-w-[420px] mx-auto">
          {selected.map((on, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className={[
                "w-10 h-10 rounded-full border-2 transition",
                on
                  ? "bg-indigo-600 border-indigo-700"
                  : "bg-white border-gray-300 hover:bg-gray-50",
              ].join(" ")}
              type="button"
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-between">
        <button
          onClick={() => {
            setSelected(Array(totalDots).fill(false));
            setStatus("idle");
          }}
          className="px-4 py-3 rounded-xl bg-gray-100 font-bold"
        >
          Reset
        </button>

        <button
          onClick={check}
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-extrabold"
        >
          Check
        </button>
      </div>
    </div>
  );
}
