"use client";

import { useEffect, useMemo, useState } from "react";
import { speak } from "@/lib/speak";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type SprintQ = { prompt: string; answer: number };

function buildOptions(answer: number) {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const n = Math.max(0, Math.min(20, answer + (Math.floor(Math.random() * 7) - 3)));
    set.add(n);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

function makeQuestion(): SprintQ {
  const kind = randInt(0, 5);
  if (kind === 0) {
    const a = randInt(3, 15);
    const b = randInt(2, 10);
    if (a + b > 20) return makeQuestion();
    return { prompt: `${a} + ${b} = ?`, answer: a + b };
  }
  if (kind === 1) {
    const a = randInt(6, 20);
    const b = randInt(2, 10);
    if (a - b < 0) return makeQuestion();
    return { prompt: `${a} − ${b} = ?`, answer: a - b };
  }
  if (kind === 2) {
    const a = randInt(3, 12);
    const sum = randInt(a + 3, Math.min(20, a + 10));
    return { prompt: `__ + ${a} = ${sum}`, answer: sum - a };
  }
  if (kind === 3) {
    const a = randInt(2, 9);
    return { prompt: `${a} + __ = 10`, answer: 10 - a };
  }
  if (kind === 4) {
    const total = randInt(6, 20);
    const groups = randInt(2, 5);
    if (total % groups !== 0) return makeQuestion();
    return {
      prompt: `Share ${total} between ${groups}. Each gets?`,
      answer: total / groups,
    };
  }
  const total = randInt(8, 20);
  const perGroup = randInt(2, 5);
  if (total % perGroup !== 0) return makeQuestion();
  return {
    prompt: `Make groups of ${perGroup} from ${total}. How many groups?`,
    answer: total / perGroup,
  };
}

export default function MixedReviewSprint({
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
  const [q, setQ] = useState<SprintQ>(() => makeQuestion());
  const [options, setOptions] = useState<number[]>(() => buildOptions(q.answer));
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

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

  function nextQ() {
    const nq = makeQuestion();
    setQ(nq);
    setOptions(buildOptions(nq.answer));
  }

  function choose(opt: number) {
    if (opt === q.answer) {
      setScore((s) => s + 1);
      onStepCorrect?.();
      nextQ();
    } else {
      onWrong?.();
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-sm font-bold text-gray-700">Time: {timeLeft}s</div>
        <button
          type="button"
          onClick={() => speak(q.prompt)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          🔊 Read
        </button>
      </div>

      <div className="text-2xl font-extrabold text-gray-900 mb-3 text-center">
        {q.prompt}
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

      <div className="mt-3 text-xs text-gray-500">Score: {score}</div>
    </div>
  );
}
