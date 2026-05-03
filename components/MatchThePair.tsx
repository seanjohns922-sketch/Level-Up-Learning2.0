"use client";

import { useEffect, useMemo, useState } from "react";
import { speak } from "@/lib/speak";

type Pair = { a: number; b: number };

type MatchConfig = {
  min?: number;
  max?: number;
  pairsCount?: number;
  rounds?: number;
  mode?: "number-number" | "number-word";
};

type Card = {
  id: string;
  pairId: string;
  kind: "left" | "right";
  value: number;
  label: string;
  matched: boolean;
};

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

const WORDS_0_20 = [
  "zero","one","two","three","four","five","six","seven","eight","nine",
  "ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"
];

function toWord(n: number) {
  if (n <= 20) return WORDS_0_20[n];
  const tens = Math.floor(n / 10) * 10;
  const ones = n % 10;

  const tensWord: Record<number, string> = {
    30: "thirty",
    40: "forty",
    50: "fifty",
  };

  if (n === 21) return "twenty-one";
  if (n < 30) return `twenty-${WORDS_0_20[ones]}`;
  if (n % 10 === 0) return tensWord[tens] ?? String(n);
  if (tensWord[tens]) return `${tensWord[tens]}-${WORDS_0_20[ones]}`;
  return String(n);
}

function buildPairs(min: number, max: number, count: number): number[] {
  const set = new Set<number>();
  while (set.size < count) set.add(randInt(min, max));
  return Array.from(set);
}

function buildCards(values: number[], mode: MatchConfig["mode"]): Card[] {
  const cards: Card[] = [];
  values.forEach((v) => {
    const pairId = `p-${v}`;
    cards.push({
      id: `${pairId}-L`,
      pairId,
      kind: "left",
      value: v,
      label: String(v),
      matched: false,
    });

    const rightLabel = mode === "number-word" ? toWord(v) : String(v);
    cards.push({
      id: `${pairId}-R`,
      pairId,
      kind: "right",
      value: v,
      label: rightLabel,
      matched: false,
    });
  });

  const left = shuffle(cards.filter((c) => c.kind === "left"));
  const right = shuffle(cards.filter((c) => c.kind === "right"));
  return [...left, ...right];
}

export default function MatchThePair({
  config,
  onComplete,
}: {
  config?: MatchConfig;
  onComplete?: (summary: { roundsCompleted: number; correctMatches: number; attempts: number }) => void;
}) {
  const min = config?.min ?? 0;
  const max = config?.max ?? 50;
  const pairsCount = config?.pairsCount ?? 6;
  const rounds = config?.rounds ?? 8;
  const mode: MatchConfig["mode"] = config?.mode ?? "number-number";

  const [roundIndex, setRoundIndex] = useState(0);
  const [values, setValues] = useState<number[]>(() => buildPairs(min, max, pairsCount));
  const [cards, setCards] = useState<Card[]>(() => buildCards(values, mode));
  const [pickedLeft, setPickedLeft] = useState<Card | null>(null);
  const [pickedRight, setPickedRight] = useState<Card | null>(null);
  const [locked, setLocked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [correctMatches, setCorrectMatches] = useState(0);

  const leftCards = useMemo(() => cards.filter((c) => c.kind === "left"), [cards]);
  const rightCards = useMemo(() => cards.filter((c) => c.kind === "right"), [cards]);

  const matchedCount = useMemo(
    () => cards.filter((c) => c.matched).length / 2,
    [cards]
  );

  function newRound(nextIndex: number) {
    const newVals = buildPairs(min, max, pairsCount);
    setValues(newVals);
    setCards(buildCards(newVals, mode));
    setPickedLeft(null);
    setPickedRight(null);
    setLocked(false);
    setRoundIndex(nextIndex);
  }

  useEffect(() => {
    if (matchedCount === pairsCount) {
      const timeout = setTimeout(() => {
        const next = roundIndex + 1;
        if (next >= rounds) {
          onComplete?.({
            roundsCompleted: rounds,
            correctMatches,
            attempts,
          });
          return;
        }
        newRound(next);
      }, 550);
      return () => clearTimeout(timeout);
    }
  }, [matchedCount, pairsCount, roundIndex, rounds, onComplete, correctMatches, attempts]);

  function pick(card: Card) {
    if (locked || card.matched) return;
    if (card.kind === "left") setPickedLeft(card);
    if (card.kind === "right") setPickedRight(card);
  }

  useEffect(() => {
    if (!pickedLeft || !pickedRight) return;
    setAttempts((a) => a + 1);
    const isMatch = pickedLeft.pairId === pickedRight.pairId;
    setLocked(true);

    if (isMatch) {
      setCorrectMatches((c) => c + 1);
      speak(String(pickedLeft.value));
      setCards((prev) =>
        prev.map((c) =>
          c.pairId === pickedLeft.pairId ? { ...c, matched: true } : c
        )
      );
      setTimeout(() => {
        setPickedLeft(null);
        setPickedRight(null);
        setLocked(false);
      }, 350);
    } else {
      setTimeout(() => {
        setPickedLeft(null);
        setPickedRight(null);
        setLocked(false);
      }, 500);
    }
  }, [pickedLeft, pickedRight]);

  function cardClass(c: Card, side: "left" | "right") {
    const picked = (side === "left" ? pickedLeft?.id : pickedRight?.id) === c.id;
    const mismatch =
      locked &&
      pickedLeft &&
      pickedRight &&
      picked &&
      pickedLeft.pairId !== pickedRight.pairId;
    const matchFlash =
      locked &&
      pickedLeft &&
      pickedRight &&
      picked &&
      pickedLeft.pairId === pickedRight.pairId;

    return [
      "w-full rounded-2xl border px-4 py-5 text-left font-extrabold text-lg sm:text-xl",
      "transition active:scale-[0.98]",
      c.matched ? "bg-green-50 border-green-300 text-green-900" : "bg-white border-gray-200 hover:bg-gray-50",
      picked ? "ring-2 ring-teal-400 border-teal-400" : "",
      mismatch ? "bg-red-50 border-red-300 ring-red-300" : "",
      matchFlash ? "bg-green-50 border-green-300 ring-green-300" : "",
      locked && !c.matched ? "cursor-not-allowed opacity-95" : "",
    ].join(" ");
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          Match the Pair • Round {Math.min(roundIndex + 1, rounds)}/{rounds}
        </div>
        <div className="text-sm font-semibold text-gray-700">
          Matched: {matchedCount}/{pairsCount}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 mb-4">
        <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Match the Pair
        </div>
        <div className="text-sm text-gray-500 mt-1">
          Tap one card on the left, then its matching card on the right.
        </div>
        <div className="mt-3 text-sm text-gray-700">
          Attempts: <span className="font-bold">{attempts}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-2 sm:space-y-3">
          {leftCards.map((c) => (
            <button key={c.id} onClick={() => pick(c)} className={cardClass(c, "left")}>
              {c.label}
            </button>
          ))}
        </div>

        <div className="space-y-2 sm:space-y-3">
          {rightCards.map((c) => (
            <button key={c.id} onClick={() => pick(c)} className={cardClass(c, "right")}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={() => newRound(roundIndex)}
          className="px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
          title="Regenerate this round"
        >
          New set 🔁
        </button>

        <button
          onClick={() => {
            const next = roundIndex + 1;
            if (next < rounds) newRound(next);
          }}
          className="px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
          title="Skip (testing)"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
