"use client";

import { useState } from "react";

const WORDS_0_20 = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
];

function toWord(n: number) {
  if (n <= 20) return WORDS_0_20[n];
  const tens = Math.floor(n / 10) * 10;
  const ones = n % 10;
  const tensWord: Record<number, string> = {
    30: "thirty",
  };
  if (n < 30) return ones === 0 ? "twenty" : `twenty-${WORDS_0_20[ones]}`;
  if (n % 10 === 0) return tensWord[tens] ?? String(n);
  if (tensWord[tens]) return `${tensWord[tens]}-${WORDS_0_20[ones]}`;
  return String(n);
}

function normalizeWord(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z]/g, "");
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function TypeTheNumber({
  min = 0,
  max = 30,
  rounds = 8,
  answer,
  mode = "word",
  onComplete,
}: {
  min?: number;
  max?: number;
  rounds?: number;
  answer?: number;
  mode?: "word" | "number";
  onComplete?: () => void;
}) {
  const [round, setRound] = useState(1);
  const fixedAnswer = typeof answer === "number" ? answer : null;
  const [currentAnswer, setCurrentAnswer] = useState(
    fixedAnswer ?? randInt(min, max)
  );
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  function nextRound() {
    if (round >= rounds) {
      onComplete?.();
      return;
    }
    setRound((r) => r + 1);
    setCurrentAnswer(fixedAnswer ?? randInt(min, max));
    setTyped("");
    setStatus("idle");
  }

  function check() {
    const correctWord = toWord(currentAnswer);
    const ok =
      mode === "word"
        ? normalizeWord(typed) === normalizeWord(correctWord)
        : Number(typed) === currentAnswer;

    if (ok) {
      setStatus("correct");
      setTimeout(nextRound, 500);
    } else {
      setStatus("wrong");
      setTimeout(() => setStatus("idle"), 500);
    }
  }

  return (
    <div>
      <div className="mb-4 text-sm text-gray-600">
        Type the Number • Round {round}/{rounds}
      </div>

      <div className="text-3xl font-extrabold mb-4">
        {mode === "word" ? "Type the word:" : "Type this number:"}
      </div>

      <div className="text-6xl font-black text-teal-600 mb-6">
        {currentAnswer}
      </div>

      <input
        value={typed}
        onChange={(e) =>
          setTyped(
            mode === "word"
              ? e.target.value.replace(/[^a-zA-Z- ]/g, "")
              : e.target.value.replace(/\D/g, "")
          )
        }
        inputMode={mode === "word" ? "text" : "numeric"}
        className="w-full px-4 py-4 text-2xl font-bold border rounded-xl mb-4"
        placeholder={mode === "word" ? "Type the word" : "Type here"}
      />

      <button
        onClick={check}
        className="w-full py-4 bg-indigo-600 text-white font-extrabold rounded-xl"
      >
        Check
      </button>

      {status === "correct" && (
        <div className="mt-2 text-green-600 font-bold">✅ Correct</div>
      )}
      {status === "wrong" && (
        <div className="mt-2 text-red-600 font-bold">❌ Try again</div>
      )}
    </div>
  );
}
