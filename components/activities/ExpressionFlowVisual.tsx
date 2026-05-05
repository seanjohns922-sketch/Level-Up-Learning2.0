"use client";

import { MathFormattedText } from "@/components/FractionText";
import type { ExpressionFlowVisualData } from "@/data/activities/year2/lessonEngine";

function tokenTone(token: string) {
  if (token === "×" || token === "÷") {
    return "text-sky-300";
  }
  if (token === "+" || token === "−" || token === "-") {
    return "text-emerald-300";
  }
  if (token.includes("(") || token.includes(")")) {
    return "text-amber-300";
  }
  return "text-white";
}

export default function ExpressionFlowVisual({
  visual,
}: {
  visual: ExpressionFlowVisualData;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
          {visual.title}
        </div>
        {visual.priorityChips?.length ? (
          <div className="flex flex-wrap gap-2">
            {visual.priorityChips.map((chip) => (
              <div
                key={chip.label}
                className={[
                  "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]",
                  chip.tone === "gold"
                    ? "border border-amber-200 bg-amber-50 text-amber-800"
                    : chip.tone === "blue"
                      ? "border border-sky-200 bg-sky-50 text-sky-800"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-800",
                ].join(" ")}
              >
                {chip.label}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className={`mt-4 grid gap-4 ${visual.cards.length > 1 ? "md:grid-cols-2" : ""}`}>
        {visual.cards.map((card, cardIndex) => (
          <div
            key={`${visual.title}-${cardIndex}`}
            className="rounded-[24px] border border-cyan-300 bg-slate-950 p-4 shadow-[0_0_24px_rgba(34,211,238,0.1)]"
          >
            {card.label ? (
              <div className="mb-3 inline-flex rounded-full border border-cyan-300 bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">
                {card.label}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 text-[1.4rem] font-black md:text-[1.6rem]">
              {card.tokens.map((token, tokenIndex) => {
                const isHighlighted =
                  card.highlightRange &&
                  tokenIndex >= card.highlightRange[0] &&
                  tokenIndex <= card.highlightRange[1];

                return (
                  <div
                    key={`${token}-${tokenIndex}`}
                    className={[
                      "rounded-xl px-2 py-1 transition-all",
                      tokenTone(token),
                      isHighlighted ? "bg-cyan-400/15 shadow-[0_0_12px_rgba(34,211,238,0.35)] ring-1 ring-cyan-300/60" : "",
                    ].join(" ")}
                  >
                    <MathFormattedText text={token} />
                  </div>
                );
              })}
            </div>

            {card.result ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xl font-black text-cyan-100">
                = <MathFormattedText text={card.result} />
              </div>
            ) : null}

            {card.note ? (
              <div className="mt-3 text-sm font-semibold text-slate-300">{card.note}</div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
