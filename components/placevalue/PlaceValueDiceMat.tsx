"use client";

import { useMemo, useState } from "react";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function PlaceValueDiceMat({
  onCorrect,
}: {
  onCorrect?: () => void;
}) {
  const [seed, setSeed] = useState(0);

  const roll = useMemo(() => {
    const tens = randInt(1, 9);
    const ones = randInt(0, 9);
    return { tens, ones, target: tens * 10 + ones };
  }, [seed]);

  const [tensPick, setTensPick] = useState(0);
  const [onesPick, setOnesPick] = useState(0);
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");

  function resetRound() {
    setTensPick(0);
    setOnesPick(0);
    setStatus("idle");
    setSeed((s) => s + 1);
  }

  function check() {
    const ok = tensPick === roll.tens && onesPick === roll.ones;
    setStatus(ok ? "correct" : "wrong");
    if (ok) onCorrect?.();
    if (ok) setTimeout(resetRound, 600);
  }

  function dicePips(n: number) {
    const maps: Record<number, number[]> = {
      0: [],
      1: [4],
      2: [0, 8],
      3: [0, 4, 8],
      4: [0, 2, 6, 8],
      5: [0, 2, 4, 6, 8],
      6: [0, 2, 3, 5, 6, 8],
      7: [0, 2, 3, 4, 5, 6, 8],
      8: [0, 1, 2, 3, 5, 6, 7, 8],
      9: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    };
    return maps[n] ?? [];
  }

  function DiceFace({ value, label }: { value: number; label: string }) {
    const pips = dicePips(value);
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-xs font-bold text-gray-500">{label}</div>
        <div className="w-14 h-14 rounded-xl border-2 border-gray-300 bg-white grid grid-cols-3 grid-rows-3 p-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <div
                className={[
                  "h-2.5 w-2.5 rounded-full",
                  pips.includes(i) ? "bg-gray-800" : "bg-transparent",
                ].join(" ")}
              />
            </div>
          ))}
        </div>
        {value === 0 && (
          <div className="text-[10px] font-bold text-gray-400">0</div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-gray-600 mb-2">Dice Place Value</div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="text-2xl font-extrabold text-gray-900">
            Make: {roll.target}
          </div>
          <div className="text-sm text-gray-500">
            Rolled dice:
          </div>
          <div className="mt-2 flex items-center gap-4">
            <DiceFace value={roll.tens} label="Tens die" />
            <DiceFace value={roll.ones} label="Ones die" />
          </div>
        </div>

        <button
          onClick={resetRound}
          className="px-4 py-2 rounded-xl bg-gray-100 font-bold hover:bg-gray-200"
          type="button"
        >
          Re-roll
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200 p-4">
          <div className="font-bold mb-2">Tens</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTensPick((v) => Math.max(0, v - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 font-extrabold"
              type="button"
            >
              –
            </button>
            <div className="text-2xl font-extrabold w-10 text-center">
              {tensPick}
            </div>
            <button
              onClick={() => setTensPick((v) => Math.min(9, v + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 font-extrabold"
              type="button"
            >
              +
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-4">
          <div className="font-bold mb-2">Ones</div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOnesPick((v) => Math.max(0, v - 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 font-extrabold"
              type="button"
            >
              –
            </button>
            <div className="text-2xl font-extrabold w-10 text-center">
              {onesPick}
            </div>
            <button
              onClick={() => setOnesPick((v) => Math.min(9, v + 1))}
              className="w-10 h-10 rounded-xl bg-gray-100 font-extrabold"
              type="button"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={check}
          className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-extrabold hover:bg-indigo-700"
          type="button"
        >
          Check
        </button>

        <div className="text-sm font-bold">
          {status === "correct" ? (
            <span className="text-green-700">✅ Correct!</span>
          ) : status === "wrong" ? (
            <span className="text-red-700">Try again.</span>
          ) : (
            <span className="text-gray-500">Set tens and ones.</span>
          )}
        </div>
      </div>
    </div>
  );
}
