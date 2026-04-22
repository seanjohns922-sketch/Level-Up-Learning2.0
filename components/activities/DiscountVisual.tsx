"use client";

import type {
  DiscountPriceVisualData,
  DiscountStepMethodVisualData,
} from "@/data/activities/year2/lessonEngine";

function formatMoney(value: number) {
  return `$${Number.isInteger(value) ? value : value.toFixed(2)}`;
}

export default function DiscountVisual({
  visual,
}: {
  visual: DiscountPriceVisualData | DiscountStepMethodVisualData;
}) {
  const mode = visual.visualMode ?? "price_tag";
  const discountPercent = Math.max(0, Math.min(100, visual.percent));

  return (
    <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
            Sale Deal
          </div>
          <div className="mt-1 text-xl font-black capitalize text-slate-900">
            {visual.item}
          </div>
        </div>
        <div className="rounded-full bg-rose-600 px-4 py-2 text-lg font-black text-white shadow-sm">
          {visual.percent}% OFF
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            Original Price
          </div>
          <div className="mt-2 text-4xl font-black text-slate-900">
            {formatMoney(visual.price)}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            {mode === "before_after" ? "After Discount" : "Discount Amount"}
          </div>
          <div
            className={[
              "mt-2 text-4xl font-black",
              mode === "before_after" ? "text-emerald-700" : "text-rose-700",
            ].join(" ")}
          >
            {mode === "before_after" ? formatMoney(visual.finalPrice) : formatMoney(visual.discount)}
          </div>
        </div>
      </div>

      {mode === "percent_bar" || mode === "price_tag" || mode === "shop_item" ? (
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.14em] text-slate-500">
            <span>100% price</span>
            <span>{visual.percent}% discount</span>
          </div>
          <div className="mt-3 h-5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-400 to-amber-400"
              style={{ width: `${discountPercent}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
