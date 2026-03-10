"use client";

import { useEffect, useState } from "react";

type Props = {
  config: {
    min: number;
    max: number;
    count: number;
  };
};

export default function NumberOrder({ config }: Props) {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [correct, setCorrect] = useState<number[]>([]);

  useEffect(() => {
    const generated: number[] = [];

    for (let i = 0; i < config.count; i++) {
      const n = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
      generated.push(n);
    }

    const shuffled = [...generated].sort(() => Math.random() - 0.5);

    setNumbers(shuffled);
    setCorrect([...generated].sort((a, b) => a - b));
  }, [config]);

  function selectNumber(n: number) {
    if (selected.includes(n)) return;
    setSelected([...selected, n]);
  }

  const isCorrect =
    selected.length === correct.length &&
    selected.every((v, i) => v === correct[i]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-center">
        Order the numbers from smallest to largest
      </h2>

      <div className="grid grid-cols-4 gap-4">
        {numbers.map((n, idx) => (
          <button
            key={`${n}-${idx}`}
            onClick={() => selectNumber(n)}
            className="p-6 text-xl font-bold border rounded-xl hover:bg-green-50"
          >
            {n}
          </button>
        ))}
      </div>

      <div className="text-center mt-8">
        <h3 className="mb-4 text-lg">Your order</h3>

        <div className="flex justify-center gap-4">
          {selected.map((n, i) => (
            <div
              key={`${n}-${i}`}
              className="p-4 bg-green-100 rounded-lg text-xl font-bold"
            >
              {n}
            </div>
          ))}
        </div>
      </div>

      {isCorrect && (
        <div className="text-center text-green-600 font-bold text-xl mt-6">
          Correct! 🎉
        </div>
      )}
    </div>
  );
}
