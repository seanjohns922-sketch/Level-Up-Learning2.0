"use client";

import type { MoneyVisualData } from "@/data/activities/year2/lessonEngine";

function formatDollars(value: number) {
  return `$${value}`;
}

function MoneyPiece({
  label,
  kind,
}: {
  label: string;
  kind: "coin" | "note";
}) {
  if (kind === "note") {
    return (
      <div className="flex h-16 w-28 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100 text-lg font-black text-emerald-900 shadow-sm">
        {label}
      </div>
    );
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-amber-300 bg-amber-100 text-base font-black text-amber-900 shadow-sm">
      {label}
    </div>
  );
}

export default function MoneyContextVisual({
  visual,
}: {
  visual: MoneyVisualData;
}) {
  if (visual.type === "shopping_list") {
    return (
      <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
          {visual.boardLabel ? `${visual.title} Price Board` : visual.title}
        </div>
        <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
          {visual.budget ? (
            <div className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-900">
              Budget: {formatDollars(visual.budget)}
            </div>
          ) : null}
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <div className="grid grid-cols-[1.4fr_1fr_88px] bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-500">
              <div>Item</div>
              <div>Type</div>
              <div className="text-right">Price</div>
            </div>
            {visual.items.map((item) => (
              <div
                key={`${item.label}-${item.price}-${item.quantity ?? 1}`}
                className="grid grid-cols-[1.4fr_1fr_88px] items-center border-t border-slate-100 px-3 py-3"
              >
                <div className="text-base font-black text-slate-900">{item.label}</div>
                <div className="text-sm text-slate-500">{item.detail ?? "Standard"}</div>
                <div className="text-right text-sm font-black text-slate-700">
                  {formatDollars(item.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (visual.type === "australian_money") {
    return (
      <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4">
        <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
          {visual.boardLabel ? `${visual.title} Shop Board` : visual.title}
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-[1.2fr_0.9fr]">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-sm font-bold text-slate-600">Shop item</div>
            <div className="mt-2 text-xl font-black text-slate-900">{visual.itemLabel}</div>
            <div className="mt-1 text-sm text-slate-500">
              {visual.itemDetail ? `${visual.itemDetail} • ` : ""}
              {visual.quantity ? `${visual.quantity} × ${formatDollars(visual.itemPrice ?? 0)}` : formatDollars(visual.itemPrice ?? 0)}
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="text-sm font-bold text-slate-600">Money shown</div>
            <div className="mt-3 flex flex-wrap gap-3">
              {visual.pieces.map((piece, index) => (
                <MoneyPiece key={`${piece.label}-${index}`} label={piece.label} kind={piece.kind} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-teal-700">
        {visual.boardLabel ? `${visual.title} Receipt` : visual.title}
      </div>
      <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <div className="grid grid-cols-[1.4fr_1fr_88px] bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-500">
            <div>Item</div>
            <div>Qty</div>
            <div className="text-right">Price</div>
          </div>
          {visual.lines.map((line) => (
            <div
              key={`${line.label}-${line.price}-${line.quantity ?? 1}`}
              className="grid grid-cols-[1.4fr_1fr_88px] items-center border-t border-slate-100 px-3 py-3"
            >
              <div>
                <div className="text-base font-black text-slate-900">{line.label}</div>
                <div className="text-xs text-slate-500">{line.detail ?? ""}</div>
              </div>
              <div className="text-sm font-bold text-slate-600">{line.quantity ?? 1}</div>
              <div className="text-right text-sm font-black text-slate-700">
                {formatDollars(line.price)}
              </div>
            </div>
          ))}
        </div>
        {visual.payment ? (
          <div className="mt-4 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-900">
            Payment: {formatDollars(visual.payment)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
