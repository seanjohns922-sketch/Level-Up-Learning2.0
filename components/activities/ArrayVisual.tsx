"use client";

export default function ArrayVisual({
  rows,
  cols,
  highlightedRows,
  title = "Grouped set model",
}: {
  rows: number;
  cols: number;
  highlightedRows?: number[];
  title?: string;
}) {
  const highlighted = new Set(highlightedRows ?? []);

  return (
    <div className="mt-4 rounded-2xl border border-teal-100 bg-teal-50 p-4">
      <div className="mb-3 text-xs font-bold uppercase tracking-wide text-teal-700">
        {title}
      </div>
      <div className="inline-flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
        {Array.from({ length: rows }).map((_, r) => {
          const isHighlighted = highlighted.has(r);
          return (
            <div
              key={r}
              className={[
                "flex gap-2 rounded-xl px-2 py-1 transition",
                isHighlighted ? "bg-amber-100 ring-2 ring-amber-300" : "bg-slate-50",
              ].join(" ")}
            >
              {Array.from({ length: cols }).map((__, c) => (
                <div
                  key={`${r}-${c}`}
                  className={[
                    "h-5 w-5 rounded-full",
                    isHighlighted ? "bg-amber-500" : "bg-teal-600",
                  ].join(" ")}
                />
              ))}
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-sm font-bold text-teal-800">
        {rows} equal groups of {cols}
      </div>
    </div>
  );
}
