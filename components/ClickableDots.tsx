"use client";

import { useMemo, useState } from "react";

type DotRowProps = {
  count: number;
  dotSize?: number;
  gap?: number;
  activeClassName?: string;
  inactiveClassName?: string;
  borderClassName?: string;
};

export function ClickableDotRow({
  count,
  dotSize = 16,
  gap = 8,
  activeClassName = "bg-teal-600",
  inactiveClassName = "bg-white",
  borderClassName = "border border-gray-200",
}: DotRowProps) {
  return (
    <ClickableDotRowInner
      key={count}
      count={count}
      dotSize={dotSize}
      gap={gap}
      activeClassName={activeClassName}
      inactiveClassName={inactiveClassName}
      borderClassName={borderClassName}
    />
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
  highlightRow?: number;
  highlightRowClassName?: string;
  highlightAllRows?: boolean;
};

export function ClickableDotRows({
  rows,
  dotSize = 14,
  gap = 8,
  rowGap = 10,
  activeClassName = "bg-teal-600",
  inactiveClassName = "bg-white",
  borderClassName = "border border-gray-200",
  highlightRow,
  highlightRowClassName = "border-2 border-amber-500 rounded-xl px-2 py-1",
  highlightAllRows = false,
}: DotRowsProps) {
  const rowsKey = rows.join(",");
  return (
    <ClickableDotRowsInner
      key={rowsKey}
      rows={rows}
      dotSize={dotSize}
      gap={gap}
      rowGap={rowGap}
      activeClassName={activeClassName}
      inactiveClassName={inactiveClassName}
      borderClassName={borderClassName}
      highlightRow={highlightRow}
      highlightRowClassName={highlightRowClassName}
      highlightAllRows={highlightAllRows}
    />
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

export function ClickableDotGrid({
  count,
  cols,
  rows,
  dotSize = 16,
  gap = 8,
  activeClassName = "bg-teal-600",
  inactiveClassName = "bg-white",
  borderClassName = "border border-gray-200",
}: DotGridProps) {
  return (
    <ClickableDotGridInner
      key={`${count}-${cols}-${rows}`}
      count={count}
      cols={cols}
      rows={rows}
      dotSize={dotSize}
      gap={gap}
      activeClassName={activeClassName}
      inactiveClassName={inactiveClassName}
      borderClassName={borderClassName}
    />
  );
}

function ClickableDotRowInner({
  count,
  dotSize,
  gap,
  activeClassName,
  inactiveClassName,
  borderClassName,
}: DotRowProps) {
  const [active, setActive] = useState<boolean[]>(() => Array.from({ length: count }, () => true));

  return (
    <div className="flex flex-wrap" style={{ gap }}>
      {Array.from({ length: count }).map((_, i) => {
        const on = active[i] ?? true;
        return (
          <button
            key={i}
            type="button"
            aria-pressed={on}
            onClick={() =>
              setActive((prev) => {
                const next = [...prev];
                next[i] = !next[i];
                return next;
              })
            }
            className={["rounded-full transition", borderClassName, on ? activeClassName : inactiveClassName].join(" ")}
            style={{ width: dotSize, height: dotSize }}
          />
        );
      })}
    </div>
  );
}

function ClickableDotRowsInner({
  rows,
  dotSize,
  gap,
  rowGap,
  activeClassName,
  inactiveClassName,
  borderClassName,
  highlightRow,
  highlightRowClassName,
  highlightAllRows,
}: DotRowsProps) {
  const [active, setActive] = useState<boolean[][]>(() =>
    rows.map((count) => Array.from({ length: count }, () => true))
  );

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
          {Array.from({ length: count }).map((_, di) => {
            const on = active[ri]?.[di] ?? true;
            return (
              <button
                key={di}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setActive((prev) => {
                    const next = prev.map((row) => [...row]);
                    next[ri][di] = !next[ri][di];
                    return next;
                  })
                }
                className={["rounded-full transition", borderClassName, on ? activeClassName : inactiveClassName].join(" ")}
                style={{ width: dotSize, height: dotSize }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ClickableDotGridInner({
  count,
  cols,
  rows,
  dotSize,
  gap,
  activeClassName,
  inactiveClassName,
  borderClassName,
}: DotGridProps) {
  const total = cols * rows;
  const [active, setActive] = useState<boolean[]>(() =>
    Array.from({ length: total }, (_, i) => i < count)
  );

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
      {Array.from({ length: total }).map((_, i) => {
        const on = active[i] ?? i < count;
        return (
          <button
            key={i}
            type="button"
            aria-pressed={on}
            onClick={() =>
              setActive((prev) => {
                const next = [...prev];
                next[i] = !next[i];
                return next;
              })
            }
            className={["rounded-full transition", borderClassName, on ? activeClassName : inactiveClassName].join(" ")}
            style={{ width: dotSize, height: dotSize }}
          />
        );
      })}
    </div>
  );
}
