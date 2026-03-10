"use client";

import { useEffect, useState } from "react";

type Props = {
  config: {
    min: number;
    max: number;
    count: number;
    ascending?: boolean;
  };
};

function shuffle<T>(items: T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }
  return next;
}

export default function NumberOrder({ config }: Props) {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [correct, setCorrect] = useState<number[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const generated = new Set<number>();

    while (generated.size < config.count) {
      const n = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
      generated.add(n);
    }

    const pool = Array.from(generated);
    const sorted = [...pool].sort((a, b) =>
      config.ascending === false ? b - a : a - b
    );

    setNumbers(shuffle(pool));
    setCorrect(sorted);
    setSelected([]);
  }, [config, attempt]);

  function selectNumber(n: number) {
    if (selected.includes(n)) return;
    setSelected([...selected, n]);
  }

  function removeLast() {
    setSelected((current) => current.slice(0, -1));
  }

  function resetRound() {
    setAttempt((current) => current + 1);
  }

  const isCorrect =
    selected.length === correct.length &&
    selected.every((v, i) => v === correct[i]);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Number Order
          </div>
          <h2 className="mt-2 text-2xl font-black text-gray-900">
            Order the numbers from{" "}
            {config.ascending === false ? "largest to smallest" : "smallest to largest"}
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={removeLast}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={resetRound}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            New set
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {numbers.map((n, idx) => (
          <button
            key={`${n}-${idx}`}
            type="button"
            onClick={() => selectNumber(n)}
            disabled={selected.includes(n)}
            className={[
              "rounded-2xl border p-6 text-xl font-black transition",
              selected.includes(n)
                ? "border-gray-200 bg-gray-100 text-gray-400"
                : "border-gray-200 bg-white text-gray-900 hover:bg-emerald-50",
            ].join(" ")}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-indigo-700">
          Your order
        </h3>

        <div className="mt-4 flex flex-wrap gap-3">
          {selected.length > 0 ? (
            selected.map((n, i) => (
              <div
                key={`${n}-${i}`}
                className="rounded-xl bg-white px-4 py-3 text-xl font-black text-indigo-900 shadow-sm"
              >
                {n}
              </div>
            ))
          ) : (
            <div className="text-sm font-bold text-indigo-700">
              Tap the cards in order.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm font-bold">
        {isCorrect ? (
          <span className="text-emerald-700">Correct.</span>
        ) : selected.length === correct.length ? (
          <span className="text-red-700">Order is not correct yet. Try a new set.</span>
        ) : (
          <span className="text-gray-500">Keep arranging the numbers.</span>
        )}
      </div>
    </div>
  );
}
