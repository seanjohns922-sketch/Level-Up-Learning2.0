"use client";

import { useMemo, useState } from "react";
import { speak } from "@/lib/speak";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type Eq = { a: number; b: number; op: "+" | "-"; answer: number };

type BossQ = { prompt: string; answer: number; options: number[] };

function buildOptions(answer: number) {
  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const n = Math.max(0, Math.min(20, answer + (Math.floor(Math.random() * 7) - 3)));
    set.add(n);
  }
  return Array.from(set).sort(() => Math.random() - 0.5);
}

function makeEq(): Eq {
  const op = Math.random() < 0.5 ? "+" : "-";
  if (op === "+") {
    const a = randInt(3, 12);
    const b = randInt(2, 8);
    if (a + b > 20) return makeEq();
    return { a, b, op, answer: a + b };
  }
  const a = randInt(6, 20);
  const b = randInt(2, 10);
  if (a - b < 0) return makeEq();
  return { a, b, op, answer: a - b };
}

function makeBossQuestion(): BossQ {
  const kind = randInt(0, 3);
  if (kind === 0) {
    const total = randInt(8, 20);
    const groups = randInt(2, 5);
    if (total % groups !== 0) return makeBossQuestion();
    const answer = total / groups;
    return {
      prompt: `Share ${total} cookies between ${groups} kids. Each gets?`,
      answer,
      options: buildOptions(answer),
    };
  }
  if (kind === 1) {
    const total = randInt(8, 20);
    const per = randInt(2, 5);
    if (total % per !== 0) return makeBossQuestion();
    const answer = total / per;
    return {
      prompt: `Make groups of ${per} from ${total}. How many groups?`,
      answer,
      options: buildOptions(answer),
    };
  }
  if (kind === 2) {
    const a = randInt(3, 12);
    const b = randInt(2, 8);
    if (a + b > 20) return makeBossQuestion();
    const answer = a + b;
    return {
      prompt: `You buy a toy for $${a} and a snack for $${b}. How much altogether?`,
      answer,
      options: buildOptions(answer),
    };
  }
  const a = randInt(6, 20);
  const b = randInt(2, 10);
  if (a - b < 0) return makeBossQuestion();
  const answer = a - b;
  return {
    prompt: `You have $${a}. You spend $${b}. How much left?`,
    answer,
    options: buildOptions(answer),
  };
}

export default function FunGames({
  onCorrect,
  onWrong,
}: {
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [stage, setStage] = useState<"tournament" | "grid" | "boss">("tournament");

  // Tournament
  const [tCount, setTCount] = useState(0);
  const [tScore, setTScore] = useState(0);
  const [tEq, setTEq] = useState<Eq>(() => makeEq());
  const tOptions = useMemo(() => buildOptions(tEq.answer), [tEq]);
  const totalTournament = 10;

  function nextTournament() {
    setTEq(makeEq());
  }

  function chooseTournament(opt: number) {
    if (opt === tEq.answer) {
      const nextCount = tCount + 1;
      setTScore((s) => s + 1);
      if (nextCount >= totalTournament) setStage("grid");
      else {
        setTCount(nextCount);
        nextTournament();
      }
    } else {
      onWrong?.();
    }
  }

  // Grid Challenge
  const [gEq, setGEq] = useState<Eq>(() => makeEq());
  const [grid, setGrid] = useState<number[]>(() => {
    const set = new Set<number>([gEq.answer]);
    while (set.size < 25) set.add(randInt(0, 20));
    return Array.from(set);
  });
  const [cleared, setCleared] = useState<Set<number>>(new Set());

  function nextGrid() {
    const ne = makeEq();
    setGEq(ne);
    const set = new Set<number>([ne.answer]);
    while (set.size < 25) set.add(randInt(0, 20));
    setGrid(Array.from(set));
  }

  function chooseGrid(n: number, idx: number) {
    if (n === gEq.answer) {
      const next = new Set(cleared);
      next.add(idx);
      setCleared(next);
      if (next.size >= 5) setStage("boss");
      else nextGrid();
    } else {
      onWrong?.();
    }
  }

  // Boss Level
  const [bossIdx, setBossIdx] = useState(0);
  const bossQ = useMemo(() => makeBossQuestion(), [bossIdx]);

  function chooseBoss(opt: number) {
    if (opt === bossQ.answer) {
      if (bossIdx + 1 >= 3) onCorrect?.();
      else setBossIdx((v) => v + 1);
    } else {
      onWrong?.();
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      {stage === "tournament" && (
        <>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-lg font-extrabold text-gray-900">Fluency Tournament</div>
              <div className="text-sm text-gray-600">Question {tCount + 1} of {totalTournament}</div>
            </div>
            <button
              type="button"
              onClick={() => speak(`${tEq.a} ${tEq.op} ${tEq.b} = ?`)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              🔊 Read
            </button>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mb-3 text-center">
            {tEq.a} {tEq.op} {tEq.b} = ?
          </div>
          <div className="grid gap-2">
            {tOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => chooseTournament(opt)}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
              >
                {opt}
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">Points: {tScore}</div>
        </>
      )}

      {stage === "grid" && (
        <>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-lg font-extrabold text-gray-900">Grid Challenge</div>
              <div className="text-sm text-gray-600">Clear 5 tiles</div>
            </div>
            <button
              type="button"
              onClick={() => speak(`${gEq.a} ${gEq.op} ${gEq.b} = ?`)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              🔊 Read
            </button>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mb-3 text-center">
            {gEq.a} {gEq.op} {gEq.b} = ?
          </div>
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}
          >
            {grid.map((n, i) => (
              <button
                key={`${n}-${i}`}
                type="button"
                onClick={() => chooseGrid(n, i)}
                className={[
                  "px-2 py-3 rounded-xl border font-bold",
                  cleared.has(i)
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 hover:bg-gray-50",
                ].join(" ")}
                disabled={cleared.has(i)}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-3 text-xs text-gray-500">Cleared: {cleared.size} / 5</div>
        </>
      )}

      {stage === "boss" && (
        <>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-lg font-extrabold text-gray-900">Boss Level</div>
              <div className="text-sm text-gray-600">Question {bossIdx + 1} of 3</div>
            </div>
            <button
              type="button"
              onClick={() => speak(bossQ.prompt)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              🔊 Read
            </button>
          </div>
          <div className="text-lg font-extrabold text-gray-900 mb-3">{bossQ.prompt}</div>
          <div className="grid gap-2">
            {bossQ.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => chooseBoss(opt)}
                className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 font-bold"
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
