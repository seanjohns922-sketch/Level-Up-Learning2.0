"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type SpeedQ = { prompt: string; answer: number; options: number[] };

function buildOptions(answer: number) {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    set.add(Math.max(0, Math.min(20, answer + randInt(-3, 3))));
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

function makeQuestion(): SpeedQ {
  const kind = randInt(0, 2);
  if (kind === 0) {
    const a = randInt(1, 14);
    const b = randInt(1, 20 - a);
    return { prompt: `${a} + ${b}`, answer: a + b, options: buildOptions(a + b) };
  }
  if (kind === 1) {
    const a = randInt(2, 20);
    const b = randInt(1, a);
    return { prompt: `${a} − ${b}`, answer: a - b, options: buildOptions(a - b) };
  }
  const answer = randInt(2, 18);
  const a = randInt(1, answer - 1);
  const b = answer - a;
  const sum = a + b;
  return { prompt: `${a} + __ = ${sum}`, answer: b, options: buildOptions(b) };
}

export type SpeedRoundQuestion = {
  kind: "speed_round";
  prompt: string;
  durationSeconds: number;
};

export default function SpeedRound({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: SpeedRoundQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const duration = questionData.durationSeconds || 30;
  const [timeLeft, setTimeLeft] = useState(duration);
  const [q, setQ] = useState<SpeedQ>(() => makeQuestion());
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && !finishedRef.current) {
      finishedRef.current = true;
      setFinished(true);
    }
  }, [timeLeft]);

  const choose = useCallback(
    (opt: number) => {
      if (finishedRef.current) return;
      if (opt === q.answer) {
        const newStreak = streak + 1;
        setScore((s) => s + 1);
        setStreak(newStreak);
        setBestStreak((b) => Math.max(b, newStreak));
        setFlash("correct");
      } else {
        setStreak(0);
        setFlash("wrong");
      }
      setTimeout(() => {
        setFlash(null);
        setQ(makeQuestion());
      }, 300);
    },
    [q.answer, streak]
  );

  function handleDone() {
    onCorrect?.();
  }

  if (finished) {
    return (
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm text-center">
        <div className="text-5xl mb-3">⚡</div>
        <h2 className="text-2xl font-black text-gray-900">Speed Round Complete!</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Total Correct
            </div>
            <div className="mt-1 text-3xl font-black text-emerald-600">{score}</div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Best Streak
            </div>
            <div className="mt-1 text-3xl font-black text-amber-600">{bestStreak}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDone}
          className="mt-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-lg font-extrabold text-white hover:opacity-90 transition-all active:scale-[0.98] shadow-lg"
        >
          Continue →
        </button>
      </div>
    );
  }

  const pct = Math.max(0, (timeLeft / duration) * 100);

  return (
    <div
      className={[
        "rounded-3xl border bg-white p-5 shadow-sm transition-all duration-150",
        flash === "correct"
          ? "border-emerald-300 bg-emerald-50/30"
          : flash === "wrong"
          ? "border-red-300 bg-red-50/30"
          : "border-gray-100",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="text-sm font-extrabold text-gray-700">Speed Round</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-500">
            🔥 {streak}
          </span>
          <span className="text-sm font-black tabular-nums text-gray-700">
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-5">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-linear"
          style={{
            width: `${pct}%`,
            background:
              pct > 50
                ? "hsl(145 65% 42%)"
                : pct > 20
                ? "hsl(42 95% 55%)"
                : "hsl(0 72% 51%)",
          }}
        />
      </div>

      {/* Question */}
      <div className="text-center mb-5">
        <div className="text-4xl font-black text-gray-900 tracking-tight">
          {q.prompt} = ?
        </div>
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, i) => (
          <button
            key={`${opt}-${i}`}
            type="button"
            onClick={() => choose(opt)}
            className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-2xl font-black text-gray-900 hover:bg-gray-50 active:scale-95 transition-all"
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Score */}
      <div className="mt-3 text-center text-xs font-bold text-gray-400">
        Score: {score}
      </div>
    </div>
  );
}
