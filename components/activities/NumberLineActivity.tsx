"use client";

import { useMemo, useState, useCallback } from "react";
import type { NumberLineQuestion } from "@/data/activities/year2/lessonEngine";
import ReadAloudBtn from "@/components/ReadAloudBtn";

const fmt = (n: number) => n.toLocaleString();

/* Pick a clean tick step so we get 5–11 labelled ticks */
function niceStep(span: number): number {
  if (span <= 10) return 1;
  if (span <= 20) return 2;
  if (span <= 50) return 5;
  if (span <= 100) return 10;
  if (span <= 200) return 20;
  if (span <= 500) return 50;
  if (span <= 1000) return 100;
  if (span <= 2000) return 200;
  if (span <= 5000) return 500;
  if (span <= 10000) return 1000;
  if (span <= 20000) return 2000;
  if (span <= 50000) return 5000;
  if (span <= 100000) return 10000;
  if (span <= 200000) return 20000;
  if (span <= 500000) return 50000;
  if (span <= 1000000) return 100000;
  return Math.pow(10, Math.floor(Math.log10(span)) - 1);
}

/* ── Number line visual (shared between modes) ── */
function NumberLineVisual({
  min,
  max,
  ticks,
  minorTicks,
  placed,
  checked,
  isCorrect,
  expected,
  onClick,
  disabled,
}: {
  min: number;
  max: number;
  ticks: number[];
  minorTicks: number[];
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
        "rounded-2xl border border-border bg-muted/30 px-8 py-8 select-none",
        disabled ? "opacity-60 cursor-default" : "cursor-pointer",
      ].join(" ")}
      onClick={disabled ? undefined : onClick}
    >
      <div className="relative mx-auto max-w-3xl" style={{ height: 80 }}>
        {/* Base line */}
        <div
          className="absolute left-0 right-0 bg-primary/70 rounded-full"
          style={{ top: 36, height: 3 }}
        />
        {/* End caps */}
        <div
          className="absolute bg-primary/70 rounded-full"
          style={{ left: 0, top: 20, width: 3, height: 36 }}
        />
        <div
          className="absolute bg-primary/70 rounded-full"
          style={{ right: 0, top: 20, width: 3, height: 36 }}
        />

        {/* Minor tick marks */}
        {minorTicks.map((tick) => {
          const left = ((tick - min) / range) * 100;
          return (
            <div
              key={`m-${tick}`}
              className="absolute pointer-events-none"
              style={{ left: `${left}%`, transform: "translateX(-50%)", top: 24 }}
            >
              <div
                className="mx-auto bg-primary/30 rounded-full"
                style={{ width: 2, height: 24 }}
              />
            </div>
          );
        })}

        {/* Major tick marks */}
        {ticks.map((tick) => {
          const left = ((tick - min) / range) * 100;
          return (
            <div
              key={tick}
              className="absolute text-center pointer-events-none"
              style={{ left: `${left}%`, transform: "translateX(-50%)", top: 16 }}
            >
              <div
                className="mx-auto bg-primary/60 rounded-full"
                style={{ width: 3, height: 40 }}
              />
              <div className="mt-1.5 text-sm font-bold text-foreground whitespace-nowrap">
                {fmt(tick)}
              </div>
            </div>
          );
        })}

        {/* Correct answer marker (shown after wrong check) */}
        {checked && correctPct !== null && !isCorrect && (
          <div
            className="absolute flex flex-col items-center pointer-events-none"
            style={{ left: `${correctPct}%`, transform: "translateX(-50%)", top: 22 }}
          >
            <div className="w-5 h-5 rounded-full bg-primary border-2 border-primary-foreground shadow-md" />
            <span className="mt-0.5 text-xs font-bold text-primary">{fmt(expected)}</span>
          </div>
        )}

        {/* User's placed marker */}
        {markerPct !== null && (
          <div
            className="absolute flex flex-col items-center pointer-events-none"
            style={{ left: `${markerPct}%`, transform: "translateX(-50%)", top: 22 }}
          >
            <div
              className={[
                "w-5 h-5 rounded-full border-2 shadow-lg transition-colors",
                checked
                  ? isCorrect
                    ? "bg-primary border-primary-foreground"
                    : "bg-destructive border-destructive-foreground"
                  : "bg-accent-foreground border-accent",
              ].join(" ")}
            />
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4">
        {disabled
          ? ""
          : placed === null
            ? "👆 Tap on the number line to place your answer"
            : "Tap again to adjust"}
      </p>
    </div>
  );
}

/* ── Main component ── */
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

  // Step tracking for rounding: "type" → "place" → "done"
  const [roundingStep, setRoundingStep] = useState<"type" | "place" | "done">("type");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [typedCorrect, setTypedCorrect] = useState<boolean | null>(null);

  // Placement state (used for all modes, and step 2 of rounding)
  const [placed, setPlaced] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const range = questionData.max - questionData.min || 1;

  const ticks = useMemo(() => {
    const span = questionData.max - questionData.min;
    const step = niceStep(span);
    const values: number[] = [];
    const start = Math.ceil(questionData.min / step) * step;
    for (let v = start; v <= questionData.max; v += step) values.push(v);
    if (values[0] !== questionData.min) values.unshift(questionData.min);
    if (values[values.length - 1] !== questionData.max) values.push(questionData.max);
    return values;
  }, [questionData.max, questionData.min]);

  const minorTicks = useMemo(() => {
    const span = questionData.max - questionData.min;
    const majorStep = niceStep(span);
    const minorStep = majorStep / 2;
    if (minorStep < 1 || span / minorStep > 40) return [];
    const values: number[] = [];
    const start = Math.ceil(questionData.min / minorStep) * minorStep;
    for (let v = start; v <= questionData.max; v += minorStep) {
      if (v % majorStep === 0 && v >= questionData.min) continue;
      values.push(v);
    }
    return values;
  }, [questionData.max, questionData.min]);

  const handleLineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (checked) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const raw = questionData.min + pct * range;
      const snapped = Math.round(raw);
      const clamped = Math.max(questionData.min, Math.min(questionData.max, snapped));
      setPlaced(clamped);
    },
    [checked, questionData.min, questionData.max, range]
  );

  /* ── Rounding step 1: check typed answer ── */
  function checkTypedAnswer() {
    const parsed = parseInt(typedAnswer.replace(/,/g, ""), 10);
    if (isNaN(parsed)) return;
    if (parsed === questionData.expected) {
      setTypedCorrect(true);
      // Move to step 2 after a brief delay
      setTimeout(() => setRoundingStep("place"), 800);
    } else {
      setTypedCorrect(false);
    }
  }

  /* ── Step 2 / non-rounding: check placement ── */
  function checkPlacement() {
    if (placed === null) return;
    setChecked(true);

    const difference = Math.abs(placed - questionData.expected);
    const allowed =
      questionData.mode === "estimate"
        ? Math.max(5, Math.floor(questionData.step / 2))
        : Math.max(1, Math.floor(questionData.step / 4));

    if (difference <= allowed) {
      setIsCorrect(true);
      if (isRounding) setRoundingStep("done");
      onCorrect?.();
    } else {
      setIsCorrect(false);
      onWrong?.();
    }
  }

  // Extract the original value from the prompt for display (e.g. "Round 9976 to...")
  const originalValue = questionData.prompt.match(/\d[\d,]*/)?.[0] ?? "";

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-primary">
          Number Line
        </div>
        <div className="flex items-center gap-2 mt-2">
          <h2 className="text-2xl font-black text-foreground">{questionData.prompt}</h2>
          <ReadAloudBtn text={`${questionData.prompt}. ${questionData.helper}`} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{questionData.helper}</p>
      </div>

      {/* ── Rounding Step 1: Type the rounded number ── */}
      {isRounding && roundingStep === "type" && (
        <div className="mt-6">
          <div className="rounded-2xl border border-border bg-muted/30 p-6">
            <p className="text-sm font-bold text-foreground mb-1">Step 1: Type your answer</p>
            <p className="text-xs text-muted-foreground mb-4">
              What does {originalValue} round to?
            </p>
            <div className="flex items-center gap-3 justify-center">
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
                className="rounded-2xl bg-primary px-6 py-3 font-black text-primary-foreground hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40"
              >
                Check
              </button>
            </div>
            {typedCorrect === false && (
              <p className="mt-3 text-sm font-bold text-destructive text-center">
                Not quite — try again!
              </p>
            )}
            {typedCorrect === true && (
              <p className="mt-3 text-sm font-bold text-primary text-center">
                ✅ Correct! Now place it on the number line…
              </p>
            )}
          </div>

          {/* Show number line as preview (disabled) */}
          <div className="mt-6 opacity-50 pointer-events-none">
            <NumberLineVisual
              min={questionData.min}
              max={questionData.max}
              ticks={ticks}
              minorTicks={minorTicks}
              placed={null}
              checked={false}
              isCorrect={false}
              expected={questionData.expected}
              onClick={() => {}}
              disabled
            />
          </div>
        </div>
      )}

      {/* ── Rounding Step 2: Place on number line ── */}
      {isRounding && (roundingStep === "place" || roundingStep === "done") && (
        <div className="mt-6">
          <div className="rounded-2xl border border-primary/30 bg-primary/5 px-4 py-2 mb-4 inline-flex items-center gap-2">
            <span className="text-sm font-bold text-primary">
              ✅ {fmt(questionData.expected)}
            </span>
            <span className="text-xs text-muted-foreground">
              — Now place it on the number line
            </span>
          </div>

          <NumberLineVisual
            min={questionData.min}
            max={questionData.max}
            ticks={ticks}
            minorTicks={minorTicks}
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
                className="rounded-2xl bg-primary px-8 py-3 font-black text-primary-foreground hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40"
              >
                Check placement
              </button>
            ) : (
              <div
                className={[
                  "rounded-2xl px-8 py-3 font-black text-center",
                  isCorrect
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive",
                ].join(" ")}
              >
                {isCorrect ? "✅ Well done!" : `❌ Not quite — ${fmt(questionData.expected)} goes here`}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Non-rounding: standard single-step flow ── */}
      {!isRounding && (
        <>
          <div className="mt-8">
            <NumberLineVisual
              min={questionData.min}
              max={questionData.max}
              ticks={ticks}
              minorTicks={minorTicks}
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
                className="rounded-2xl bg-primary px-8 py-3 font-black text-primary-foreground hover:opacity-90 active:scale-[0.98] transition disabled:opacity-40"
              >
                Check answer
              </button>
            ) : (
              <div
                className={[
                  "rounded-2xl px-8 py-3 font-black text-center",
                  isCorrect
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive",
                ].join(" ")}
              >
                {isCorrect ? "✅ Correct!" : `❌ The answer was ${fmt(questionData.expected)}`}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
