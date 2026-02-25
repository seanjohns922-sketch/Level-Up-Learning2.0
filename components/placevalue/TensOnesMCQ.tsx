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

type Option = { tens: number; ones: number };

export default function TensOnesMCQ({
  min = 10,
  max = 99,
  onCorrect,
}: {
  min?: number;
  max?: number;
  onCorrect?: () => void;
}) {
  const target = useMemo(() => randInt(min, max), [min, max]);
  const tens = Math.floor(target / 10);
  const ones = target % 10;

  const options = useMemo(() => {
    const correct: Option = { tens, ones };
    const distractors: Option[] = [];
    while (distractors.length < 3) {
      const dt = randInt(1, 9);
      const do1 = randInt(0, 9);
      const same = dt === tens && do1 === ones;
      const dup = distractors.some((d) => d.tens === dt && d.ones === do1);
      if (!same && !dup) distractors.push({ tens: dt, ones: do1 });
    }
    return shuffle([correct, ...distractors]);
  }, [tens, ones]);

  const [picked, setPicked] = useState<Option | null>(null);
  const [status, setStatus] = useState<"idle" | "wrong" | "correct">("idle");

  function choose(opt: Option) {
    setPicked(opt);
    const ok = opt.tens === tens && opt.ones === ones;
    setStatus(ok ? "correct" : "wrong");
    if (ok) onCorrect?.();
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-gray-600 mb-2">Tens & Ones</div>
      <div className="text-2xl font-extrabold text-gray-900 mb-4">
        {target} = ?
      </div>

      <div className="grid gap-3">
        {options.map((o, idx) => {
          const isPicked = picked?.tens === o.tens && picked?.ones === o.ones;
          return (
            <button
              key={idx}
              onClick={() => choose(o)}
              className={[
                "w-full text-left rounded-2xl border px-4 py-4 font-bold transition",
                isPicked
                  ? status === "correct"
                    ? "border-green-400 bg-green-50"
                    : "border-red-300 bg-red-50"
                  : "border-gray-200 bg-white hover:bg-gray-50",
              ].join(" ")}
            >
              {o.tens} tens, {o.ones} ones
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-sm font-bold">
        {status === "correct" ? (
          <span className="text-green-700">✅ Correct!</span>
        ) : status === "wrong" ? (
          <span className="text-red-700">Try again.</span>
        ) : (
          <span className="text-gray-500">Choose an option.</span>
        )}
      </div>
    </div>
  );
}
