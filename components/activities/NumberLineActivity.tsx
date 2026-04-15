"use client";

import { useCallback, useMemo, useState } from "react";
import type { NumberLineQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

const fmt = (n: number, maxFractionDigits = 3) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: n % 1 === 0 ? 0 : maxFractionDigits,
  });

function decimalPlaces(n: number) {
  if (Number.isInteger(n)) return 0;
  const text = n.toString();
  if (text.includes("e-")) {
    const [, exponent] = text.split("e-");
    return Number(exponent);
  }
  return text.split(".")[1]?.length ?? 0;
}

function roundTo(value: number, digits: number) {
  return Number(value.toFixed(Math.max(0, digits)));
}

function niceStep(span: number): number {
  if (span <= 1) return 0.1;
  if (span <= 2) return 0.2;
  if (span <= 5) return 0.5;
  if (span <= 10) return 1;
  if (span <= 20) return 2;
  if (span <= 50) return 5;
  if (span <= 100) return 10;
  if (span <= 200) return 20;
  if (span <= 500) return 50;
  if (span <= 1000) return 100;
  return Math.pow(10, Math.floor(Math.log10(span)) - 1);
}

function buildTickRange(min: number, max: number, step: number) {
  const digits = decimalPlaces(step);
  const values: number[] = [];
  for (let value = min; value <= max + step / 2; value += step) {
    values.push(roundTo(value, digits));
  }
  return values;
}

type DisplayConfig = {
  min: number;
  max: number;
  snapStep: number;
  majorTicks: number[];
  minorTicks: number[];
  labelTicks: number[];
  helper: string;
  fractionDigits: number;
};

function getDisplayConfig(questionData: NumberLineQuestion): DisplayConfig {
  const originalMin = questionData.min;
  const originalMax = questionData.max;
  const originalStep = questionData.step;
  const expectedPlaces = decimalPlaces(questionData.expected);
  const stepPlaces = decimalPlaces(originalStep);

  if (questionData.mode === "rounding") {
    const span = originalMax - originalMin;
    const majorStep = niceStep(span);
    const majorTicks = buildTickRange(originalMin, originalMax, majorStep);
    const minorStep = majorStep / 2;
    const minorTicks =
      minorStep >= 1 && span / minorStep <= 40
        ? buildTickRange(originalMin, originalMax, minorStep).filter(
            (tick) => !majorTicks.some((major) => Math.abs(major - tick) < 1e-9)
          )
        : [];
    return {
      min: originalMin,
      max: originalMax,
      snapStep: originalStep,
      majorTicks,
      minorTicks,
      labelTicks: majorTicks,
      helper: questionData.helper,
      fractionDigits: 0,
    };
  }

  const isDecimalQuestion =
    originalStep < 1 || expectedPlaces > 0 || stepPlaces > 0 || originalMax - originalMin <= 6;

  if (!isDecimalQuestion) {
    const span = originalMax - originalMin;
    const majorStep = niceStep(span);
    const majorTicks = buildTickRange(originalMin, originalMax, majorStep);
    const minorStep = majorStep / 2;
    const minorTicks =
      minorStep >= 1 && span / minorStep <= 40
        ? buildTickRange(originalMin, originalMax, minorStep).filter(
            (tick) => !majorTicks.some((major) => Math.abs(major - tick) < 1e-9)
          )
        : [];
    return {
      min: originalMin,
      max: originalMax,
      snapStep: originalStep,
      majorTicks,
      minorTicks,
      labelTicks: majorTicks,
      helper: questionData.helper,
      fractionDigits: 0,
    };
  }

  // Choose the displayed scale from the target value itself, not the generator's
  // raw step metadata. Otherwise a tenths question like 0.7 can be incorrectly
  // forced into a thousandths window such as 0.70 to 0.71.
  const targetPlaces = expectedPlaces > 0 ? expectedPlaces : stepPlaces;
  const forceFullRange = questionData.displayStyle === "full_range";

  if (targetPlaces >= 3) {
    if (forceFullRange) {
      const min = originalMin;
      const max = originalMax;
      const majorTicks = buildTickRange(min, max, 0.1);
      const minorTicks = buildTickRange(min, max, 0.001).filter(
        (tick) => !majorTicks.some((major) => Math.abs(major - tick) < 1e-9)
      );
      return {
        min,
        max,
        snapStep: 0.001,
        majorTicks,
        minorTicks,
        labelTicks: majorTicks,
        helper: "Each small tick shows 0.001.",
        fractionDigits: 3,
      };
    }
    const windowSize = 0.01;
    const snapStep = 0.001;
    const min = roundTo(Math.floor(questionData.expected / windowSize) * windowSize, 3);
    const max = roundTo(min + windowSize, 3);
    const majorTicks = [min, max];
    const minorTicks = buildTickRange(min, max, snapStep).filter(
      (tick) => !majorTicks.some((major) => Math.abs(major - tick) < 1e-9)
    );
    return {
      min,
      max,
      snapStep,
      majorTicks,
      minorTicks,
      labelTicks: majorTicks,
      helper: "Each small tick shows 0.001.",
      fractionDigits: 3,
    };
  }

  if (targetPlaces === 2) {
    const snapStep = 0.01;
    if (forceFullRange) {
      const min = originalMin;
      const max = originalMax;
      const majorTicks = buildTickRange(min, max, 0.1);
      const minorTicks = buildTickRange(min, max, snapStep).filter(
        (tick) => !majorTicks.some((major) => Math.abs(major - tick) < 1e-9)
      );
      return {
        min,
        max,
        snapStep,
        majorTicks,
        minorTicks,
        labelTicks: majorTicks,
        helper: "Each small tick shows 0.01.",
        fractionDigits: 2,
      };
    }
    const wholeMin = Math.floor(questionData.expected);
    const isLessThanOne = questionData.expected >= 0 && questionData.expected < 1;
    const min = isLessThanOne
      ? roundTo(Math.floor(questionData.expected / 0.1) * 0.1, 2)
      : wholeMin;
    const max = isLessThanOne ? roundTo(min + 0.1, 2) : wholeMin + 1;
    const majorTicks = isLessThanOne ? [min, max] : buildTickRange(min, max, 0.1);
    const minorTicks = buildTickRange(min, max, snapStep).filter(
      (tick) => !majorTicks.some((major) => Math.abs(major - tick) < 1e-9)
    );
    return {
      min,
      max,
      snapStep,
      majorTicks,
      minorTicks,
      labelTicks: isLessThanOne ? majorTicks : [min, max],
      helper: "Each small tick shows 0.01.",
      fractionDigits: 2,
    };
  }

  const useBenchmarks =
    originalMin === 0 &&
    originalMax === 1 &&
    questionData.expected >= 0 &&
    questionData.expected <= 1;

  if (useBenchmarks) {
    const majorTicks = buildTickRange(0, 1, 0.1);
    return {
      min: 0,
      max: 1,
      snapStep: 0.1,
      majorTicks,
      minorTicks: [],
      labelTicks: majorTicks,
      helper: "Each interval shows 0.1.",
      fractionDigits: 1,
    };
  }

  const min = Math.floor(questionData.expected);
  const max = min + 1;
  const majorTicks = buildTickRange(min, max, 0.1);
  return {
    min,
    max,
    snapStep: 0.1,
    majorTicks,
    minorTicks: [],
    labelTicks: majorTicks,
    helper: "Each interval shows 0.1.",
    fractionDigits: 1,
  };
}

function NumberLineVisual({
  min,
  max,
  majorTicks,
  minorTicks,
  labelTicks,
  fractionDigits,
  placed,
  checked,
  isCorrect,
  expected,
  onClick,
  disabled,
}: {
  min: number;
  max: number;
  majorTicks: number[];
  minorTicks: number[];
  labelTicks: number[];
  fractionDigits: number;
  placed: number | null;
  checked: boolean;
  isCorrect: boolean;
  expected: number;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}) {
  const range = max - min || 1;
  const markerPct = placed !== null ? ((placed - min) / range) * 100 : null;
  const correctPct = checked ? ((expected - min) / range) * 100 : null;

  return (
    <div
      className={[
        "rounded-2xl border border-border bg-muted/20 px-8 py-8 select-none",
        disabled ? "opacity-60" : "",
      ].join(" ")}
    >
      <div
        className={[
          "relative mx-auto max-w-4xl",
          disabled ? "cursor-default" : "cursor-pointer",
        ].join(" ")}
        style={{ height: 84 }}
        onClick={disabled ? undefined : onClick}
      >
        <div
          className="absolute left-0 right-0 rounded-full"
          style={{ top: 34, height: 2, background: "rgba(31,41,55,0.76)" }}
        />

        {minorTicks.map((tick) => {
          const left = ((tick - min) / range) * 100;
          return (
            <div
              key={`minor-${tick}`}
              className="absolute pointer-events-none"
              style={{ left: `${left}%`, transform: "translateX(-50%)", top: 26 }}
            >
              <div
                className="mx-auto rounded-full"
                style={{ width: 1.5, height: 16, background: "rgba(107,114,128,0.72)" }}
              />
            </div>
          );
        })}

        {majorTicks.map((tick) => {
          const left = ((tick - min) / range) * 100;
          const showLabel = labelTicks.some((value) => Math.abs(value - tick) < 1e-9);
          return (
            <div
              key={`major-${tick}`}
              className="absolute text-center pointer-events-none"
              style={{ left: `${left}%`, transform: "translateX(-50%)", top: 18 }}
            >
              <div
                className="mx-auto rounded-full"
                style={{ width: 2.5, height: 28, background: "rgba(17,24,39,0.95)" }}
              />
              {showLabel ? (
                <div className="mt-1.5 text-sm font-semibold text-foreground whitespace-nowrap">
                  {fmt(tick, fractionDigits)}
                </div>
              ) : null}
            </div>
          );
        })}

        {checked && correctPct !== null && !isCorrect ? (
          <div
            className="absolute flex flex-col items-center pointer-events-none"
            style={{ left: `${correctPct}%`, transform: "translateX(-50%)", top: 22 }}
          >
            <div className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground bg-primary shadow-md" />
            <span className="mt-1 text-xs font-bold text-primary">
              {fmt(expected, fractionDigits)}
            </span>
          </div>
        ) : null}

        {markerPct !== null ? (
          <div
            className="absolute flex flex-col items-center pointer-events-none"
            style={{ left: `${markerPct}%`, transform: "translateX(-50%)", top: 22 }}
          >
            <div
              className={[
                "h-3.5 w-3.5 rounded-full border-2 shadow-lg transition-colors",
                checked
                  ? isCorrect
                    ? "bg-primary border-primary-foreground"
                    : "bg-destructive border-destructive-foreground"
                  : "bg-accent-foreground border-accent",
              ].join(" ")}
            />
          </div>
        ) : null}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        {disabled
          ? ""
          : placed === null
            ? "Tap on the number line to place your answer."
            : "Tap again to adjust."}
      </p>
    </div>
  );
}

export default function NumberLineActivity({
  questionData,
  onCorrect,
  onWrong,
}: {
  questionData: NumberLineQuestion;
  onCorrect?: () => void;
  onWrong?: () => void;
}) {
  const isRounding = questionData.mode === "rounding";
  const [roundingStep, setRoundingStep] = useState<"type" | "place" | "done">("type");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [typedCorrect, setTypedCorrect] = useState<boolean | null>(null);
  const [placed, setPlaced] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const displayConfig = useMemo(() => getDisplayConfig(questionData), [questionData]);
  const displayRange = displayConfig.max - displayConfig.min || 1;

  const handleLineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (checked) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const raw = displayConfig.min + pct * displayRange;
      const step = displayConfig.snapStep;
      const digits = decimalPlaces(step);
      const snapped =
        step < 1
          ? roundTo(
              Math.round((raw - displayConfig.min) / step) * step + displayConfig.min,
              digits
            )
          : Math.round(raw);
      setPlaced(Math.max(displayConfig.min, Math.min(displayConfig.max, snapped)));
    },
    [checked, displayConfig, displayRange]
  );

  function checkTypedAnswer() {
    const parsed = parseInt(typedAnswer.replace(/,/g, ""), 10);
    if (isNaN(parsed)) return;
    if (parsed === questionData.expected) {
      setTypedCorrect(true);
      setTimeout(() => setRoundingStep("place"), 800);
    } else {
      setTypedCorrect(false);
    }
  }

  function checkPlacement() {
    if (placed === null) return;
    setChecked(true);

    const difference = Math.abs(placed - questionData.expected);
    const allowed =
      questionData.mode === "estimate"
        ? Math.max(displayConfig.snapStep, displayConfig.snapStep * 2)
        : displayConfig.snapStep < 1
          ? displayConfig.snapStep / 4
          : Math.max(1, Math.floor(displayConfig.snapStep / 4));

    if (difference <= allowed) {
      setIsCorrect(true);
      if (isRounding) setRoundingStep("done");
      onCorrect?.();
    } else {
      setIsCorrect(false);
      onWrong?.();
    }
  }

  const originalValue = questionData.prompt.match(/\d[\d,]*/)?.[0] ?? "";

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-primary">Number Line</div>
        <div className="mt-2 flex items-center gap-2">
          <h2 className="text-2xl font-black text-foreground">{questionData.prompt}</h2>
          <ReadAloudBtn text={`${questionData.prompt}. ${displayConfig.helper}`} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{displayConfig.helper}</p>
      </div>

      {isRounding && roundingStep === "type" ? (
        <div className="mt-6">
          <div className="rounded-2xl border border-border bg-muted/30 p-6">
            <p className="mb-1 text-sm font-bold text-foreground">Step 1: Type your answer</p>
            <p className="mb-4 text-xs text-muted-foreground">
              What does {originalValue} round to?
            </p>
            <div className="flex items-center justify-center gap-3">
              <input
                type="text"
                inputMode="numeric"
                value={typedAnswer}
                onChange={(e) => {
                  setTypedAnswer(e.target.value);
                  setTypedCorrect(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && checkTypedAnswer()}
                placeholder="Type the rounded number"
                className="w-48 rounded-xl border border-border bg-background px-4 py-3 text-center text-xl font-black text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={checkTypedAnswer}
                disabled={!typedAnswer.trim()}
                className="rounded-2xl bg-primary px-6 py-3 font-black text-primary-foreground transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              >
                Check
              </button>
            </div>
            {typedCorrect === false ? (
              <p className="mt-3 text-center text-sm font-bold text-destructive">
                Not quite. Try again.
              </p>
            ) : null}
            {typedCorrect === true ? (
              <p className="mt-3 text-center text-sm font-bold text-primary">
                Correct. Now place it on the number line.
              </p>
            ) : null}
          </div>

          <div className="mt-6 opacity-50 pointer-events-none">
            <NumberLineVisual
              min={displayConfig.min}
              max={displayConfig.max}
              majorTicks={displayConfig.majorTicks}
              minorTicks={displayConfig.minorTicks}
              labelTicks={displayConfig.labelTicks}
              fractionDigits={displayConfig.fractionDigits}
              placed={null}
              checked={false}
              isCorrect={false}
              expected={questionData.expected}
              onClick={() => {}}
              disabled
            />
          </div>
        </div>
      ) : null}

      {isRounding && (roundingStep === "place" || roundingStep === "done") ? (
        <div className="mt-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-2">
            <span className="text-sm font-bold text-primary">
              {fmt(questionData.expected, displayConfig.fractionDigits)}
            </span>
            <span className="text-xs text-muted-foreground">Now place it on the number line.</span>
          </div>

          <NumberLineVisual
            min={displayConfig.min}
            max={displayConfig.max}
            majorTicks={displayConfig.majorTicks}
            minorTicks={displayConfig.minorTicks}
            labelTicks={displayConfig.labelTicks}
            fractionDigits={displayConfig.fractionDigits}
            placed={placed}
            checked={checked}
            isCorrect={isCorrect}
            expected={questionData.expected}
            onClick={handleLineClick}
            disabled={checked}
          />

          <div className="mt-6 flex justify-center">
            {!checked ? (
              <button
                type="button"
                onClick={checkPlacement}
                disabled={placed === null}
                className="rounded-2xl bg-primary px-8 py-3 font-black text-primary-foreground transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              >
                Check placement
              </button>
            ) : (
              <div
                className={[
                  "rounded-2xl px-8 py-3 text-center font-black",
                  isCorrect ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                ].join(" ")}
              >
                {isCorrect
                  ? "Correct."
                  : `Not quite. ${fmt(questionData.expected, displayConfig.fractionDigits)} goes here.`}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {!isRounding ? (
        <>
          <div className="mt-8">
            <NumberLineVisual
              min={displayConfig.min}
              max={displayConfig.max}
              majorTicks={displayConfig.majorTicks}
              minorTicks={displayConfig.minorTicks}
              labelTicks={displayConfig.labelTicks}
              fractionDigits={displayConfig.fractionDigits}
              placed={placed}
              checked={checked}
              isCorrect={isCorrect}
              expected={questionData.expected}
              onClick={handleLineClick}
              disabled={checked}
            />
          </div>

          <div className="mt-6 flex justify-center">
            {!checked ? (
              <button
                type="button"
                onClick={checkPlacement}
                disabled={placed === null}
                className="rounded-2xl bg-primary px-8 py-3 font-black text-primary-foreground transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              >
                Check answer
              </button>
            ) : (
              <div
                className={[
                  "rounded-2xl px-8 py-3 text-center font-black",
                  isCorrect ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                ].join(" ")}
              >
                {isCorrect
                  ? "Correct."
                  : `The answer was ${fmt(questionData.expected, displayConfig.fractionDigits)}.`}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
