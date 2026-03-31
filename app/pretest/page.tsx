"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getPretestForYearLabel } from "@/data/assessments/api";
import type { Question } from "@/data/assessments/pretests";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import AssessmentQuestionCard from "@/components/assessment/AssessmentQuestionCard";
import AssessmentShell from "@/components/assessment/AssessmentShell";

/* ── Inline visuals (kept from original) ── */

function MabPicker({
  target,
  maxTens = 10,
  maxOnes = 10,
  value,
  onChange,
}: {
  target: number;
  maxTens?: number;
  maxOnes?: number;
  value: { tens: number; ones: number };
  onChange: (v: { tens: number; ones: number }) => void;
}) {
  function toggleTens(idx: number) {
    const next = idx < value.tens ? idx : idx + 1;
    onChange({ tens: next, ones: value.ones });
  }

  function toggleOnes(idx: number) {
    const next = idx < value.ones ? idx : idx + 1;
    onChange({ tens: value.tens, ones: next });
  }

  return (
    <div className="mt-4">
      <div className="flex items-center justify-end gap-4 mb-4">
        <div className="px-4 py-2 rounded-xl font-bold border bg-slate-700/50 border-slate-600 text-slate-300">
          Target: {target}
        </div>
      </div>

      <div className="mb-5">
        <div className="text-sm font-bold text-slate-400 mb-2">Tens</div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: maxTens }).map((_, i) => {
            const selected = i < value.tens;
            return (
              <button
                key={`t-${i}`}
                type="button"
                onClick={() => toggleTens(i)}
                className={[
                  "w-10 h-20 rounded-xl border-2 transition",
                  selected
                    ? "border-teal-500 bg-teal-500/20"
                    : "border-slate-600 bg-slate-700/50 hover:bg-slate-700",
                ].join(" ")}
                title={selected ? "Tap to remove" : "Tap to add"}
              >
                <div className="h-full w-full flex flex-col gap-1 p-2">
                  {Array.from({ length: 10 }).map((__, k) => (
                    <div
                      key={k}
                      className={[
                        "h-2 rounded",
                        selected ? "bg-teal-500/60" : "bg-slate-600",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-sm font-bold text-slate-400 mb-2">Ones</div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: maxOnes }).map((_, i) => {
            const selected = i < value.ones;
            return (
              <button
                key={`o-${i}`}
                type="button"
                onClick={() => toggleOnes(i)}
                className={[
                  "w-10 h-10 rounded-lg border-2 transition",
                  selected
                    ? "border-teal-500 bg-teal-500/20"
                    : "border-slate-600 bg-slate-700/50 hover:bg-slate-700",
                ].join(" ")}
                title={selected ? "Tap to remove" : "Tap to add"}
              >
                <div className="w-6 h-6 rounded-md border border-slate-500 mx-auto my-auto" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GroupsVisual({ groups }: { groups: number[] }) {
  return (
    <div className="rounded-xl border border-slate-600 bg-slate-700/50 p-3">
      <div className="grid gap-2">
        {groups.map((count, rowIdx) => (
          <div key={rowIdx} className="flex flex-wrap gap-2">
            {Array.from({ length: count }).map((_, i) => (
              <span
                key={i}
                className="inline-block h-4 w-4 rounded-full border border-slate-500 bg-slate-600"
                aria-hidden
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DotAddVisual({
  leftTarget,
  rightTarget,
  maxDots = 10,
}: {
  leftTarget: number;
  rightTarget: number;
  maxDots?: number;
}) {
  const [leftOn, setLeftOn] = useState<boolean[]>(
    Array.from({ length: maxDots }, () => false)
  );
  const [rightOn, setRightOn] = useState<boolean[]>(
    Array.from({ length: maxDots }, () => false)
  );

  function toggle(side: "left" | "right", idx: number) {
    if (side === "left") {
      setLeftOn((prev) => prev.map((v, i) => (i === idx ? !v : v)));
    } else {
      setRightOn((prev) => prev.map((v, i) => (i === idx ? !v : v)));
    }
  }

  function clear() {
    setLeftOn(Array.from({ length: maxDots }, () => false));
    setRightOn(Array.from({ length: maxDots }, () => false));
  }

  const DotRow = ({
    side,
    onArr,
  }: {
    side: "left" | "right";
    onArr: boolean[];
  }) => (
    <div className="flex flex-wrap gap-2 justify-center">
      {onArr.map((on, i) => (
        <button
          key={i}
          type="button"
          onClick={() => toggle(side, i)}
          className={[
            "h-8 w-8 rounded-full border transition",
            on
              ? "bg-teal-500 border-teal-400"
              : "bg-slate-700 border-slate-500 hover:bg-slate-600",
          ].join(" ")}
          aria-label={`${side} dot ${i + 1}`}
        />
      ))}
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-600 bg-slate-700/50 p-5 mb-4">
      <div className="text-sm text-slate-400 mb-3">
        Click dots to show <span className="font-bold text-white">{leftTarget}</span> +{" "}
        <span className="font-bold text-white">{rightTarget}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <DotRow side="left" onArr={leftOn} />
        <div className="text-4xl font-extrabold text-slate-400 select-none">+</div>
        <DotRow side="right" onArr={rightOn} />
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={clear}
          className="px-3 py-2 rounded-xl bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition border border-slate-600"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function EqualSharingPreview({ groups }: { groups: number[] }) {
  return (
    <div className="flex gap-4 mt-3">
      {groups.map((size, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-600 bg-slate-700/50 p-3 flex flex-wrap gap-1 w-24"
        >
          {Array.from({ length: size }).map((_, j) => (
            <div key={j} className="h-4 w-4 rounded-full bg-teal-500" />
          ))}
        </div>
      ))}
    </div>
  );
}

function GroupCountersVisual({
  totalCounters,
  groupSize,
  selectTarget,
}: {
  totalCounters: number;
  groupSize: number;
  selectTarget: number;
}) {
  const [selected, setSelected] = useState<boolean[]>(
    Array.from({ length: totalCounters }, () => false)
  );

  function toggle(idx: number) {
    setSelected((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  }

  function clear() {
    setSelected(Array.from({ length: totalCounters }, () => false));
  }

  return (
    <div className="rounded-2xl border border-slate-600 bg-slate-700/50 p-5 mb-4">
      <div className="text-sm text-slate-400 mb-3">
        Click counters to show <b className="text-white">{selectTarget}</b> counters grouped in{" "}
        <b className="text-white">{groupSize}s</b>
      </div>

      <div
        className="grid gap-2 justify-center"
        style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
      >
        {selected.map((on, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggle(i)}
            className={[
              "h-10 w-10 rounded-full border transition",
              on
                ? "bg-teal-500 border-teal-400"
                : "bg-slate-700 border-slate-500 hover:bg-slate-600",
            ].join(" ")}
            aria-label={`counter ${i + 1}`}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={clear}
          className="px-3 py-2 rounded-xl bg-slate-700 text-slate-300 font-bold hover:bg-slate-600 transition border border-slate-600"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

/* ── Page ── */

export default function PretestPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <p className="text-slate-500">Loading…</p>
        </div>
      }
    >
      <PretestPage />
    </Suspense>
  );
}

function PretestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const year = searchParams.get("year") ?? "Year 3";

  const questions: Question[] = useMemo(
    () => getPretestForYearLabel(year),
    [year]
  );

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<string | null>>(
    Array(questions.length).fill(null)
  );
  const [mab, setMab] = useState<{ tens: number; ones: number }>({
    tens: 0,
    ones: 0,
  });

  const question = questions[index];
  const selected = answers[index];

  useEffect(() => {
    setMab({ tens: 0, ones: 0 });
  }, [index]);

  function choose(value: string) {
    const next = [...answers];
    next[index] = value;
    setAnswers(next);
  }

  function nextQuestion() {
    if (index < questions.length - 1) setIndex(index + 1);
  }

  function prevQuestion() {
    if (index > 0) setIndex(index - 1);
  }

  function finish() {
    const score = answers.reduce((acc, answer, i) => {
      const q = questions[i];
      if (!answer) return acc;
      if (q.type === "mab") {
        return acc + (Number(answer) === q.target ? 1 : 0);
      }
      if (q.type === "numberLine") {
        return acc + (Number(answer) === q.answer ? 1 : 0);
      }
      if (q.type === "groups") {
        return acc + (answer === q.answerOptionId ? 1 : 0);
      }
      if (q.answerIndex !== undefined) {
        const opt = (q.options ?? [])[q.answerIndex ?? 0];
        const correctLabel = typeof opt === "string" ? opt : opt.label;
        return acc + (answer === correctLabel ? 1 : 0);
      }
      if (q.answerOptionId !== undefined) {
        return acc + (answer === q.answerOptionId ? 1 : 0);
      }
      if (q.correctAnswer !== undefined) {
        return acc + (answer === q.correctAnswer ? 1 : 0);
      }
      return acc + (answer === q.answer ? 1 : 0);
    }, 0);

    router.push(
      `/results?year=${encodeURIComponent(year)}&score=${score}&total=${questions.length}`
    );
  }

  const mabTotal = mab.tens * 10 + mab.ones;
  const mabHasSelection = mab.tens > 0 || mab.ones > 0;
  const isReady = question?.type === "mab" ? mabHasSelection : selected !== null;

  useEffect(() => {
    if (question?.type !== "mab") return;
    const next = [...answers];
    next[index] = mabHasSelection ? String(mabTotal) : null;
    setAnswers(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mabTotal, mabHasSelection, question?.type, index]);

  if (!questions.length || !question) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-800 rounded-3xl shadow-xl p-8 w-full max-w-xl text-center border border-slate-700/60">
          <h2 className="text-xl font-bold text-white mb-2">
            No questions found
          </h2>
          <p className="text-slate-400 mb-4">
            We couldn&apos;t find a pre-test for {year}.
          </p>
          <button
            onClick={() => router.push("/levels")}
            className="px-5 py-3 rounded-2xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-400 hover:to-emerald-400 transition"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  /* Build question content based on type */
  let questionContent: React.ReactNode;

  if (question.type === "mab") {
    questionContent = (
      <MabPicker
        target={question.target ?? 0}
        maxTens={question.maxTens ?? 10}
        maxOnes={question.maxOnes ?? 10}
        value={mab}
        onChange={setMab}
      />
    );
  } else if (question.type === "numberLine") {
    questionContent = (
      <div className="mt-4">
        <div className="relative w-full h-20">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-600 rounded" />
          <div className="absolute left-0 top-[55%] text-xs text-slate-400">
            {question.min}
          </div>
          <div className="absolute right-0 top-[55%] text-xs text-slate-400">
            {question.max}
          </div>

          {(question.options ?? []).map((n: any) => {
            const qMin = question.min ?? 0;
            const qMax = question.max ?? 100;
            const pct = ((n - qMin) / (qMax - qMin)) * 100;
            const isSelected = selected === String(n);

            return (
              <button
                key={n}
                onClick={() => choose(String(n))}
                className={[
                  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2",
                  "w-14 h-14 rounded-full border-2 font-extrabold transition",
                  isSelected
                    ? "border-teal-500 bg-teal-500/20 text-teal-300"
                    : "border-slate-500 bg-slate-700 hover:bg-slate-600 text-slate-300",
                ].join(" ")}
                style={{ left: `${pct}%` }}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="mt-3 text-sm text-slate-400">
          Tap the correct point on the line.
        </div>
      </div>
    );
  } else if (question.type === "groups") {
    questionContent = (
      <div className="grid gap-4">
        {(question.options ?? []).map((opt: any) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => choose(opt.id)}
              className={[
                "w-full rounded-2xl border p-5 text-left transition",
                isSelected
                  ? "border-teal-500 bg-teal-500/10"
                  : "border-slate-600 bg-slate-700/50 hover:bg-slate-700",
              ].join(" ")}
            >
              <div className="text-lg font-extrabold text-white mb-3">
                {opt.label}
              </div>
              <GroupsVisual groups={opt.groups} />
            </button>
          );
        })}
      </div>
    );
  } else {
    questionContent = (
      <>
        {question.visual?.type === "dot_add" ? (
          <DotAddVisual
            leftTarget={question.visual.leftTarget}
            rightTarget={question.visual.rightTarget}
            maxDots={question.visual.maxDots ?? 10}
          />
        ) : question.visual?.type === "group_counters" &&
          question.visual.groupSize !== undefined &&
          question.visual.selectTarget !== undefined &&
          !(question.options ?? []).some(
            (opt) => typeof opt !== "string" && opt.groups
          ) ? (
          <GroupCountersVisual
            totalCounters={question.visual.totalCounters}
            groupSize={question.visual.groupSize}
            selectTarget={question.visual.selectTarget}
          />
        ) : null}
        <AssessmentQuestionCard
          question={question}
          value={selected}
          onChange={choose}
        />
      </>
    );
  }

  return (
    <AssessmentShell
      testType="Pre-Test"
      year={year}
      currentIndex={index}
      totalQuestions={questions.length}
      questionPrompt={question.prompt}
      questionContent={
        <div>
          <div className="flex justify-end mb-3">
            <ReadAloudBtn text={question.prompt} />
          </div>
          {questionContent}
        </div>
      }
      hasAnswer={isReady}
      isLast={index === questions.length - 1}
      onBack={prevQuestion}
      onNext={nextQuestion}
      onSubmit={finish}
      onExit={() => router.push("/levels")}
    />
  );
}
