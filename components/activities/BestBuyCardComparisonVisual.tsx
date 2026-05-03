"use client";

import type { BestBuyCardVisualData } from "@/data/activities/year2/lessonEngine";

function formatMoney(value: number) {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

export default function BestBuyCardComparisonVisual({
  visual,
  revealUnitRates = false,
}: {
  visual: BestBuyCardVisualData;
  revealUnitRates?: boolean;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4">
      <div className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
        {visual.title}
      </div>
      <div
        className={[
          "mt-4 grid gap-4",
          visual.cards.length > 1 ? "md:grid-cols-2" : "grid-cols-1",
        ].join(" ")}
      >
        {visual.cards.map((card, index) => {
          const shouldReveal =
            card.unitRate !== undefined &&
            (!card.hideUnitRateUntilReveal || revealUnitRates);

          return (
            <div
              key={`${card.label}-${card.productName}-${index}`}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-sky-700">
                    {card.label}
                  </div>
                  <div className="mt-1 text-xl font-black text-slate-900">
                    {card.productName}
                  </div>
                </div>
                <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-amber-800">
                  Best Buy
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                    Total Price
                  </div>
                  <div className="mt-1 text-3xl font-black text-slate-900">
                    {formatMoney(card.price)}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                    Quantity
                  </div>
                  <div className="mt-1 text-2xl font-black text-slate-900">
                    {card.quantityLabel}
                  </div>
                </div>
              </div>

              {typeof card.chunkCount === "number" && card.chunkCount > 0 ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                    Chunked View
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {Array.from({ length: card.chunkCount }).map((_, chunkIndex) => (
                      <div
                        key={`${card.productName}-chunk-${chunkIndex}`}
                        className="rounded-xl border border-sky-200 bg-white px-2 py-2 text-center text-xs font-black text-sky-800"
                      >
                        {card.chunkLabel ?? "1 unit"}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3">
                <div className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-700">
                  Unit Price
                </div>
                <div className="mt-1 text-lg font-black text-slate-900">
                  {card.unitRateLabel}: {shouldReveal && card.unitRate !== undefined ? formatMoney(card.unitRate) : "?"}
                </div>
                {!shouldReveal ? (
                  <div className="mt-1 text-sm font-semibold text-slate-500">
                    Work it out to compare fairly.
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
