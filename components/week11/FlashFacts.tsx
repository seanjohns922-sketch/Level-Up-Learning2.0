"use client";

import { useEffect, useMemo, useState } from "react";

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

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type Fact = { a: number; b: number; op: "+" | "-"; answer: number };

function makeFact(): Fact {
  const op = Math.random() < 0.5 ? "+" : "-";
  if (op === "+") {
    const a = randInt(3, 15);
    const b = randInt(3, 10);
    const sum = a + b;
    if (sum > 20) return makeFact();
    return { a, b, op, answer: sum };
  }
  const a = randInt(6, 20);
  const b = randInt(2, 10);
  if (a - b < 0) return makeFact();
  return { a, b, op, answer: a - b };
}

function buildOptions(answer: number) {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const n = randInt(0, 20);
    if (n !== answer) set.add(n);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

export default function FlashFacts({
  durationSeconds,
  onCorrect,
  onStepCorrect,
  onWrong,
}: {
  durationSeconds: number;
  onCorrect?: () => void;
  onStepCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [fact, setFact] = useState<Fact>(() => makeFact());
  const [options, setOptions] = useState<number[]>(() => buildOptions(fact.answer));
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const prompt = useMemo(
    () => `${fact.a} ${fact.op} ${fact.b} = ?`,
    [fact]
  );

  useEffect(() => {
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0 && !finished) {
      setFinished(true);
      onCorrect?.();
    }
  }, [timeLeft, finished, onCorrect]);

  function nextFact() {
    const nf = makeFact();
    setFact(nf);
    setOptions(buildOptions(nf.answer));
  }

  function choose(opt: number) {
    if (opt === fact.answer) {
      setScore((s) => s + 1);
      onStepCorrect?.();
      nextFact();
    } else {
      onWrong?.();
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-lg font-extrabold text-gray-900">60-Second Flash</div>
          <div className="text-sm text-gray-600">Answer quickly!</div>
        </div>
        <button
          type="button"
          onClick={() => speak(prompt)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          🔊 Read
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-bold text-gray-700">Time: {timeLeft}s</div>
        <div className="text-sm font-bold text-gray-700">Score: {score}</div>
      </div>

      <div className="text-3xl font-extrabold text-gray-900 text-center mb-4">
        {prompt}
      </div>

      <div className="grid gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => choose(opt)}
            className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
