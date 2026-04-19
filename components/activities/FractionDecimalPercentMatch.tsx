"use client";

import { useMemo, useState } from "react";
import type { FractionDecimalPercentMatchQuestion } from "@/data/activities/year2/lessonEngine";
import { MathFormattedText } from "@/components/FractionText";

type Card = {
  id: string;
  setId: string;
  column: "fraction" | "decimal" | "percent";
  label: string;
};

export default function FractionDecimalPercentMatch({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: FractionDecimalPercentMatchQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const cards = useMemo(() => {
    const fractions = questionData.sets.map((set) => ({
      id: `${set.id}-fraction`,
      setId: set.id,
      column: "fraction" as const,
      label: set.fraction,
    }));
    const decimals = questionData.sets.map((set) => ({
      id: `${set.id}-decimal`,
      setId: set.id,
      column: "decimal" as const,
      label: set.decimal,
    }));
    const percents = questionData.sets.map((set) => ({
      id: `${set.id}-percent`,
      setId: set.id,
      column: "percent" as const,
      label: set.percent,
    }));

    return {
      fractions: shuffleCards(fractions),
      decimals: shuffleCards(decimals),
      percents: shuffleCards(percents),
    };
  }, [questionData.sets]);
  const [selected, setSelected] = useState<Card[]>([]);
  const [matchedSetIds, setMatchedSetIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");

  function choose(card: Card) {
    if (matchedSetIds.includes(card.setId)) return;
    setFeedback("");
    setSelected((current) => {
      const withoutSameColumn = current.filter((item) => item.column !== card.column);
      const next = [...withoutSameColumn, card];

      if (next.length === 3) {
        const isMatch = next.every((item) => item.setId === card.setId);
        if (isMatch) {
          const nextMatched = [...matchedSetIds, card.setId];
          setMatchedSetIds(nextMatched);
          setFeedback("Correct — all three show the same value.");
          if (nextMatched.length === questionData.sets.length) onCorrect?.();
        } else {
          setFeedback("Not quite — choose one fraction, one decimal and one percentage with the same value.");
          onWrong?.();
        }
        return [];
      }

      return next;
    });
  }

  function renderColumn(title: string, columnCards: Card[]) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
        <div className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
          {title}
        </div>
        <div className="grid gap-2">
          {columnCards.map((card) => {
            const isSelected = selected.some((item) => item.id === card.id);
            const isMatched = matchedSetIds.includes(card.setId);

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => choose(card)}
                disabled={isMatched}
                className={[
                  "rounded-xl border px-4 py-4 text-center text-xl font-black transition",
                  isMatched
                    ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                    : isSelected
                    ? "border-teal-500 bg-teal-50 text-teal-900 shadow-sm"
                    : "border-slate-200 bg-white text-slate-900 hover:border-teal-300 hover:bg-teal-50",
                ].join(" ")}
              >
                <MathFormattedText text={card.label} compactFractions />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(2,23,22,0.04),0_8px_24px_rgba(2,23,22,0.05)]">
      <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-teal-700/90">
        Match the Representations
      </div>
      <h2 className="mt-2 text-[1.65rem] font-bold leading-[1.15] tracking-[-0.02em] text-slate-900">
        {questionData.prompt}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-500">{questionData.helper}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {renderColumn("Fractions", cards.fractions)}
        {renderColumn("Decimals", cards.decimals)}
        {renderColumn("Percentages", cards.percents)}
      </div>
      {feedback ? <p className="mt-4 text-sm font-bold text-slate-700">{feedback}</p> : null}
    </div>
  );
}

function shuffleCards<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}
