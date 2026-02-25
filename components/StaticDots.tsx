"use client";

type DotRowProps = {
  count: number;
  dotSize?: number;
  gap?: number;
  activeClassName?: string;
  inactiveClassName?: string;
  borderClassName?: string;
};

export function StaticDotRow({
  count,
  dotSize = 16,
  gap = 8,
  activeClassName = "bg-indigo-600",
  inactiveClassName = "bg-white",
  borderClassName = "border border-gray-200",
}: DotRowProps) {
  return (
    <div className="flex flex-wrap" style={{ gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={["rounded-full", borderClassName, activeClassName].join(" ")}
          style={{ width: dotSize, height: dotSize }}
        />
      ))}
      {count === 0 ? (
        <span className={["rounded-full", borderClassName, inactiveClassName].join(" ")} style={{ width: dotSize, height: dotSize }} />
      ) : null}
    </div>
  );
}

type DotRowsProps = {
  rows: number[];
  dotSize?: number;
  gap?: number;
  rowGap?: number;
  activeClassName?: string;
  inactiveClassName?: string;
  borderClassName?: string;
  highlightAllRows?: boolean;
  highlightRow?: number;
  highlightRowClassName?: string;
};

export function StaticDotRows({
  rows,
  dotSize = 14,
  gap = 8,
  rowGap = 10,
  activeClassName = "bg-indigo-600",
  inactiveClassName = "bg-white",
  borderClassName = "border border-gray-200",
  highlightAllRows = false,
  highlightRow,
  highlightRowClassName = "border-2 border-amber-500 rounded-xl px-2 py-1",
}: DotRowsProps) {
  return (
    <div className="grid" style={{ rowGap }}>
      {rows.map((count, ri) => (
        <div
          key={ri}
          className={[
            "inline-flex",
            highlightAllRows || (typeof highlightRow === "number" && ri === highlightRow)
              ? highlightRowClassName
              : "",
          ].join(" ")}
          style={{ gap }}
        >
          {Array.from({ length: count }).map((_, di) => (
            <span
              key={di}
              className={["rounded-full", borderClassName, activeClassName].join(" ")}
              style={{ width: dotSize, height: dotSize }}
            />
          ))}
          {count === 0 ? (
            <span
              className={["rounded-full", borderClassName, inactiveClassName].join(" ")}
              style={{ width: dotSize, height: dotSize }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

type DotGridProps = {
  count: number;
  cols: number;
  rows: number;
  dotSize?: number;
  gap?: number;
  activeClassName?: string;
  inactiveClassName?: string;
  borderClassName?: string;
};

export function StaticDotGrid({
  count,
  cols,
  rows,
  dotSize = 16,
  gap = 8,
  activeClassName = "bg-indigo-600",
  inactiveClassName = "bg-white",
  borderClassName = "border border-gray-200",
}: DotGridProps) {
  const total = cols * rows;
  return (
    <div
      className="mx-auto"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap,
        maxWidth: 520,
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            "rounded-full",
            borderClassName,
            i < count ? activeClassName : inactiveClassName,
          ].join(" ")}
          style={{ width: dotSize, height: dotSize }}
        />
      ))}
    </div>
  );
}

