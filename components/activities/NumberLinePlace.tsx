"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { NumberLinePlaceQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

function parseFraction(label: string) {
  const [numerator, denominator] = label.split("/").map(Number);
  return { numerator, denominator };
}

function FractionBar({ fraction }: { fraction: string }) {
  const { numerator, denominator } = parseFraction(fraction);
  return (
    <div className="rounded-2xl border border-violet-200 bg-white p-3 shadow-sm">
      <div
        className="grid gap-1 rounded-xl bg-slate-200 p-1"
        style={{ gridTemplateColumns: `repeat(${denominator}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: denominator }).map((_, index) => (
          <div
            key={index}
            className={[
              "h-8 rounded-sm",
              index < numerator ? "bg-violet-500" : "bg-slate-100",
            ].join(" ")}
          />
        ))}
      </div>
      <div className="mt-2 text-center text-lg font-black text-violet-900">{fraction}</div>
    </div>
  );
}

export default function NumberLinePlace({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: NumberLinePlaceQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const [order, setOrder] = useState<string[]>([]);
  const [placedFraction, setPlacedFraction] = useState<string | null>(null);
  const [animatedFraction, setAnimatedFraction] = useState<string | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  const fractionOptions = questionData.options ?? ["1/5", "1/2", "4/5"];
  const targetFraction = questionData.targetFraction ?? fractionOptions[0] ?? "1/2";
  const denominator = useMemo(() => parseFraction(targetFraction).denominator, [targetFraction]);
  const lineStops = useMemo(
    () =>
      Array.from({ length: denominator + 1 }, (_, index) => ({
        x: index / denominator,
        label:
          index === 0
            ? "0"
            : index === denominator
            ? "1"
            : `${index}/${denominator}`,
      })),
    [denominator]
  );

  function choose(value: string) {
    if (questionData.mode === "order_fractions") {
      setOrder((current) => (current.includes(value) ? current : [...current, value]));
    }
  }

  function placeDot(clientX: number) {
    if (!lineRef.current) return;
    const rect = lineRef.current.getBoundingClientRect();
    const relative = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const nearest = lineStops.reduce((best, stop) =>
      Math.abs(stop.x - relative) < Math.abs(best.x - relative) ? stop : best
    );
    setPlacedFraction(nearest.label);
  }

  useEffect(() => {
    if (!placedFraction || questionData.mode === "order_fractions") return;
    const placedIndex = lineStops.findIndex((stop) => stop.label === placedFraction);
    if (placedIndex < 0) return;

    setAnimatedFraction("0");
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    for (let index = 1; index <= placedIndex; index += 1) {
      const stop = lineStops[index];
      if (!stop) continue;
      timers.push(
        setTimeout(() => {
          setAnimatedFraction(stop.label);
        }, index * 180)
      );
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [lineStops, placedFraction, questionData.mode]);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-black text-gray-900">{questionData.prompt}</h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>

      {questionData.mode === "order_fractions" ? (
        <div className="mt-6">
          <div className="flex flex-wrap gap-3">
            {(questionData.fractions ?? []).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => choose(value)}
                className="rounded-2xl border border-violet-300 bg-white p-3 text-left"
              >
                <div className="text-lg font-black text-violet-900">{value}</div>
                <div className="mt-2">
                  <FractionBar fraction={value} />
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-dashed border-violet-300 bg-white p-4 text-lg font-black text-violet-900">
            {order.length > 0 ? order.join(" , ") : "Tap fractions in order here"}
          </div>
          <button
            type="button"
            onClick={() => (order.join(",") === questionData.answer ? onCorrect?.() : onWrong?.())}
            className="mt-4 w-full rounded-2xl bg-violet-600 px-5 py-3 font-black text-white hover:bg-violet-700"
          >
            Check order
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
            <div className="text-xs font-bold uppercase tracking-wide text-violet-700">Visual Support</div>
            <div className="mt-3 max-w-sm">
              <FractionBar fraction={targetFraction} />
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Use the bar model to count equal jumps from 0 to 1.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
            <div className="mb-3 text-sm font-bold text-violet-700">
              {denominator} equal jumps from 0 to 1
            </div>
            <div
              ref={lineRef}
              className="relative mx-4 h-16 cursor-pointer"
              onClick={(event) => placeDot(event.clientX)}
            >
              <div className="absolute top-7 left-0 right-0 h-1 rounded bg-slate-400" />
              {lineStops.slice(0, -1).map((stop, index) => {
                const next = lineStops[index + 1];
                if (!next) return null;
                return (
                  <div
                    key={`${stop.label}-${next.label}`}
                    className="absolute top-[22px] h-3 rounded-full bg-violet-200/70"
                    style={{
                      left: `${stop.x * 100}%`,
                      width: `${(next.x - stop.x) * 100}%`,
                    }}
                  />
                );
              })}
              {lineStops.map((stop) => (
                <div
                  key={stop.label}
                  className="absolute top-5 h-5 w-0.5 -translate-x-1/2 rounded bg-slate-400"
                  style={{ left: `${stop.x * 100}%` }}
                />
              ))}
              {animatedFraction ? (
                <div
                  className="absolute top-3 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border-2 border-violet-600 bg-violet-500 text-white shadow-sm transition-all duration-150"
                  style={{
                    left: `${((lineStops.find((stop) => stop.label === animatedFraction)?.x ?? 0) * 100)}%`,
                  }}
                >
                  •
                </div>
              ) : null}
            </div>
            <div className="mt-2 flex justify-between text-sm font-bold text-slate-700">
              <span>0</span>
              <span>1</span>
            </div>
            {animatedFraction && animatedFraction !== "0" ? (
              <div className="mt-3 text-sm font-bold text-violet-700">
                Jumped to {animatedFraction}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => (placedFraction === questionData.answer ? onCorrect?.() : onWrong?.())}
            disabled={!placedFraction}
            className="mt-6 w-full rounded-2xl bg-violet-600 px-5 py-3 font-black text-white hover:bg-violet-700 disabled:opacity-40"
          >
            Check position
          </button>
        </>
      )}
    </div>
  );
}
