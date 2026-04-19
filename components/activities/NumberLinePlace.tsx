"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { NumberLinePlaceQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { FractionText, MathFormattedText } from "@/components/FractionText";

function parseFraction(label: string) {
  const trimmed = label.trim();
  if (!trimmed.includes("/")) {
    const whole = Number(trimmed);
    return { whole, numerator: 0, denominator: 1, value: whole };
  }
  const [wholePart, fractionPart] = trimmed.includes(" ") ? trimmed.split(" ") : ["0", trimmed];
  const [numerator, denominator] = fractionPart.split("/").map(Number);
  const whole = Number(wholePart);
  return { whole, numerator, denominator, value: whole + numerator / denominator };
}

function formatNumberLineLabel(step: number, denominator: number) {
  if (step === 0) return "0";
  const whole = Math.floor(step / denominator);
  const numerator = step % denominator;
  if (numerator === 0) return String(whole);
  if (whole === 0) return `${numerator}/${denominator}`;
  return `${whole} ${numerator}/${denominator}`;
}

function FractionBar({
  fraction,
  showLabel = true,
  large = false,
  showFilled = true,
  totalWholes,
  tone = "violet",
}: {
  fraction: string;
  showLabel?: boolean;
  large?: boolean;
  showFilled?: boolean;
  totalWholes?: number;
  tone?: "violet" | "emerald";
}) {
  const { whole, numerator, denominator } = parseFraction(fraction);
  const totalParts = denominator * Math.max(1, totalWholes ?? whole + (numerator > 0 ? 1 : 0));
  const shadedParts = showFilled ? whole * denominator + numerator : 0;
  const fillClass = tone === "emerald" ? "bg-emerald-400" : "bg-violet-500";
  const labelClass = tone === "emerald" ? "text-slate-900" : "text-violet-900";
  return (
    <div
      className={
        large
          ? "w-full"
          : tone === "emerald"
          ? "rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm"
          : "rounded-2xl border border-violet-200 bg-white p-3 shadow-sm"
      }
    >
      <div
        className={[
          "grid overflow-hidden rounded-xl border-2 border-slate-300 bg-slate-100 p-1",
          large ? "gap-0.5" : "gap-1",
        ].join(" ")}
        style={{ gridTemplateColumns: `repeat(${totalParts}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: totalParts }).map((_, index) => (
          <div
            key={index}
            className={[
              large ? "h-16 rounded-[4px]" : "h-8 rounded-sm",
              index < shadedParts ? fillClass : "bg-white",
            ].join(" ")}
          />
        ))}
      </div>
      {showLabel ? (
        <div className={`mt-2 text-center text-lg font-black ${labelClass}`}>
          <FractionText value={fraction} />
        </div>
      ) : null}
    </div>
  );
}

export default function NumberLinePlace({
  questionData,
  onCorrect,
  onWrong,
  renderMode = "lesson",
}: {
  questionData: NumberLinePlaceQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
  renderMode?: "lesson" | "quiz";
}) {
  const [order, setOrder] = useState<string[]>([]);
  const [placedFraction, setPlacedFraction] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [animatedFraction, setAnimatedFraction] = useState<string | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);

  const fractionOptions = questionData.options ?? ["1/5", "1/2", "4/5"];
  const targetFraction = questionData.targetFraction ?? fractionOptions[0] ?? "1/2";
  const parsedTarget = useMemo(() => parseFraction(targetFraction), [targetFraction]);
  const denominator =
    questionData.partitionDenominator ?? questionData.denominator ?? parsedTarget.denominator ?? 1;
  const maxWhole = questionData.maxWhole ?? Math.max(1, Math.ceil(parsedTarget.value));
  const showPartitions = questionData.showPartitions ?? true;
  const isPointPick = questionData.mode === "pick_point" && Boolean(questionData.pointOptions?.length);
  const lineStops = useMemo(
    () =>
      Array.from({ length: denominator * maxWhole + 1 }, (_, index) => ({
        x: index / (denominator * maxWhole),
        label: formatNumberLineLabel(index, denominator),
      })),
    [denominator, maxWhole]
  );

  function choose(value: string) {
    if (questionData.mode === "order_fractions") {
      setOrder((current) => (current.includes(value) ? current : [...current, value]));
    }
  }

  function undoLastChoice() {
    setOrder((current) => current.slice(0, -1));
  }

  function clearOrder() {
    setOrder([]);
  }

  function choosePoint(pointId: string) {
    setSelectedPoint(pointId);
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
    if (!placedFraction || questionData.mode === "order_fractions" || isPointPick) return;
    const placedIndex = lineStops.findIndex((stop) => stop.label === placedFraction);
    if (placedIndex < 0) return;

    const timers: Array<ReturnType<typeof setTimeout>> = [];
    timers.push(
      setTimeout(() => {
        setAnimatedFraction("0");
      }, 0)
    );
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
  }, [isPointPick, lineStops, placedFraction, questionData.mode]);

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-black text-gray-900">
          <MathFormattedText text={questionData.prompt} />
        </h2>
        <ReadAloudBtn text={questionData.prompt} />
      </div>

      {questionData.mode === "order_fractions" ? (
        <div className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            {(questionData.fractions ?? []).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => choose(value)}
                className="rounded-2xl border border-emerald-200 bg-white p-4 text-left shadow-sm transition hover:bg-emerald-50"
              >
                <div className="text-lg font-black text-slate-900">
                  <FractionText value={value} />
                </div>
                <div className="mt-3">
                  <FractionBar fraction={value} showLabel={false} large tone="emerald" />
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-dashed border-emerald-300 bg-white p-4 text-lg font-black text-emerald-900">
            {order.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {order.map((value, index) => (
                  <span key={`${value}-${index}`} className="rounded-lg bg-emerald-100 px-2 py-1">
                    <FractionText value={value} compact />
                  </span>
                ))}
              </div>
            ) : (
              "Tap fractions in order here"
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={undoLastChoice}
              disabled={order.length === 0}
              className="rounded-2xl border border-emerald-300 bg-white px-4 py-2 font-black text-emerald-900 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Undo last
            </button>
            <button
              type="button"
              onClick={clearOrder}
              disabled={order.length === 0}
              className="rounded-2xl border border-emerald-300 bg-white px-4 py-2 font-black text-emerald-900 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear order
            </button>
          </div>
          <button
            type="button"
            onClick={() => (order.join(",") === questionData.answer ? onCorrect?.() : onWrong?.())}
            disabled={order.length !== (questionData.fractions ?? []).length}
            className="mt-4 w-full rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            Check order
          </button>
        </div>
      ) : (
        <>
          {renderMode === "lesson" && questionData.showSupportModel !== false && !isPointPick ? (
            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="text-xs font-bold uppercase tracking-wide text-emerald-700">Visual Support</div>
              <div className="mt-3 max-w-sm">
                <FractionBar
                  fraction={targetFraction}
                  showLabel
                  showFilled
                  totalWholes={maxWhole}
                  tone="emerald"
                />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Count equal jumps from 0 to {maxWhole}.
              </p>
            </div>
          ) : null}

          <div className="mt-6 rounded-3xl border border-emerald-100 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.13),transparent_38%),linear-gradient(135deg,#ecfdf5,#f8fafc)] p-5 shadow-inner">
            {renderMode === "lesson" ? (
              <div className="mb-3 text-sm font-bold text-emerald-700">
                {isPointPick
                  ? `Find ${targetFraction} on the data rail.`
                  : showPartitions
                  ? `${denominator} equal jumps from 0 to ${maxWhole}`
                  : `Estimate where ${targetFraction} belongs between 0 and ${maxWhole}`}
              </div>
            ) : null}
            <div
              ref={lineRef}
              className={[
                "relative mx-4 h-24",
                isPointPick ? "" : "cursor-pointer",
              ].join(" ")}
              onClick={(event) => {
                if (!isPointPick) placeDot(event.clientX);
              }}
            >
              <div className="absolute top-11 left-0 right-0 h-1.5 rounded-full bg-slate-300 shadow-[0_0_18px_rgba(20,184,166,0.25)]" />
              {showPartitions && lineStops.slice(0, -1).map((stop, index) => {
                const next = lineStops[index + 1];
                if (!next) return null;
                return (
                  <div
                    key={`${stop.label}-${next.label}`}
                    className="absolute top-[38px] h-4 rounded-full bg-emerald-200/70"
                    style={{
                      left: `${stop.x * 100}%`,
                      width: `${(next.x - stop.x) * 100}%`,
                    }}
                  />
                );
              })}
              {(showPartitions ? lineStops : [lineStops[0], lineStops[lineStops.length - 1]]).filter(Boolean).map((stop) => (
                <div
                  key={stop!.label}
                  className="absolute top-8 h-7 w-0.5 -translate-x-1/2 rounded bg-slate-500"
                  style={{ left: `${stop!.x * 100}%` }}
                >
                  {renderMode === "lesson" && (stop!.label === "0" || stop!.label === String(maxWhole)) ? (
                    <span className="absolute top-8 -translate-x-1/2 text-sm font-black text-slate-700">
                      {stop!.label}
                    </span>
                  ) : null}
                </div>
              ))}
              {isPointPick
                ? (questionData.pointOptions ?? []).map((point) => {
                    const pointValue = parseFraction(point.fraction).value / maxWhole;
                    const isSelected = selectedPoint === point.id;
                    return (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => choosePoint(point.id)}
                        className={[
                          "absolute top-[25px] flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-2 text-sm font-black shadow-sm transition",
                          isSelected
                            ? "border-teal-500 bg-teal-500 text-white shadow-[0_0_18px_rgba(20,184,166,0.45)]"
                            : "border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50",
                        ].join(" ")}
                        style={{ left: `${pointValue * 100}%` }}
                      >
                        {point.id}
                      </button>
                    );
                  })
                : null}
              {!isPointPick && animatedFraction ? (
                <div
                  className="absolute top-6 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-2 border-teal-600 bg-teal-500 text-white shadow-[0_0_18px_rgba(20,184,166,0.45)] transition-all duration-150"
                  style={{
                    left: `${(parseFraction(animatedFraction).value / maxWhole) * 100}%`,
                  }}
                >
                  •
                </div>
              ) : null}
            </div>
            <div className="mt-2 flex justify-between text-sm font-bold text-slate-700">
              <span>0</span>
              <span>{maxWhole}</span>
            </div>
            {renderMode === "lesson" && animatedFraction && animatedFraction !== "0" ? (
              <div className="mt-3 text-sm font-bold text-emerald-700">
                Jumped to <FractionText value={animatedFraction} compact />
              </div>
            ) : null}
          </div>

          {isPointPick ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {(questionData.pointOptions ?? []).map((point) => (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => choosePoint(point.id)}
                  className={[
                    "rounded-2xl border px-5 py-4 text-xl font-black transition",
                    selectedPoint === point.id
                      ? "border-teal-400 bg-teal-50 text-teal-900"
                      : "border-slate-200 bg-white text-slate-900 hover:bg-emerald-50",
                  ].join(" ")}
                >
                  Point {point.id}
                </button>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => {
              if (isPointPick) {
                if (selectedPoint === questionData.answer) onCorrect?.();
                else onWrong?.();
                return;
              }
              const placedValue = placedFraction ? parseFraction(placedFraction).value : NaN;
              const answerValue = questionData.answer ? parseFraction(questionData.answer).value : NaN;
              if (Number.isFinite(placedValue) && Number.isFinite(answerValue) && placedValue === answerValue) {
                onCorrect?.();
                return;
              }
              onWrong?.();
            }}
            disabled={isPointPick ? !selectedPoint : !placedFraction}
            className="mt-6 w-full rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            {isPointPick ? "Check point" : "Check position"}
          </button>
        </>
      )}
    </div>
  );
}
