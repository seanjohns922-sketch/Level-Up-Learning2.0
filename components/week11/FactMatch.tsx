"use client";

import { useMemo, useState } from "react";
import { speak } from "@/lib/speak";

type Card = {
  id: string;
  label: string;
  matchId: string;
};

function buildCards(): Card[] {
  const pairs = [
    { eq: "7 + 6", ans: "13" },
    { eq: "8 + 8", ans: "16" },
    { eq: "9 + 5", ans: "14" },
    { eq: "12 - 5", ans: "7" },
    { eq: "15 - 9", ans: "6" },
    { eq: "6 + 6", ans: "12" },
  ];
  const cards: Card[] = [];
  pairs.forEach((p, idx) => {
    const matchId = `m-${idx}`;
    cards.push({ id: `${matchId}-eq`, label: p.eq, matchId });
    cards.push({ id: `${matchId}-ans`, label: p.ans, matchId });
  });
  return cards.sort(() => Math.random() - 0.5);
}

export default function FactMatch({
  onCorrect,
  onStepCorrect,
}: {
  onCorrect?: () => void;
  onStepCorrect?: () => void;
}) {
  const [cards, setCards] = useState<Card[]>(() => buildCards());
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());

  const done = matched.size === cards.length / 2;

  function reset() {
    setCards(buildCards());
    setOpen([]);
    setMatched(new Set());
  }

  function click(card: Card) {
    if (open.includes(card.id)) return;
    if (matched.has(card.matchId)) return;
    const nextOpen = [...open, card.id];
    if (nextOpen.length === 2) {
      const [a, b] = nextOpen;
      const ca = cards.find((c) => c.id === a);
      const cb = cards.find((c) => c.id === b);
      if (ca && cb && ca.matchId === cb.matchId) {
        const nextMatched = new Set(matched);
        nextMatched.add(ca.matchId);
        setMatched(nextMatched);
        setOpen([]);
        if (nextMatched.size === cards.length / 2) onCorrect?.();
        else onStepCorrect?.();
      } else {
        setOpen(nextOpen);
        setTimeout(() => setOpen([]), 600);
      }
    } else {
      setOpen(nextOpen);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-lg font-extrabold text-gray-900">Fact Match</div>
          <div className="text-sm text-gray-600">Match each equation with its answer.</div>
        </div>
        <button
          type="button"
          onClick={() => speak("Match each equation with its answer.")}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          🔊 Read
        </button>
      </div>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}
      >
        {cards.map((card) => {
          const isOpen = open.includes(card.id);
          const isMatched = matched.has(card.matchId);
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => click(card)}
              className={[
                "px-2 py-4 rounded-xl border font-bold text-sm",
                isMatched
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : isOpen
                  ? "border-teal-300 bg-teal-50"
                  : "border-gray-200 bg-white hover:bg-gray-50",
              ].join(" ")}
            >
              {isOpen || isMatched ? card.label : "?"}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Matches: {matched.size} / {cards.length / 2}
        </div>
        <button
          type="button"
          onClick={reset}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {done ? (
        <div className="mt-3 text-sm font-bold text-emerald-700">Great job!</div>
      ) : null}
    </div>
  );
}
