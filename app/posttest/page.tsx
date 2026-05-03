"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPosttestForYearLabel } from "@/data/assessments/api";
import type { Question } from "@/data/assessments/posttests";
import { getLegendForYear } from "@/data/legends";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { ACTIVE_STUDENT_KEY, readProgress, writeProgress, type StudentProgress } from "@/data/progress";
import AssessmentQuestionCard from "@/components/assessment/AssessmentQuestionCard";
import AssessmentShell from "@/components/assessment/AssessmentShell";
import { analyzeAssessmentResult } from "@/data/assessments/analysis";
import { supabase } from "@/lib/supabase";

const PASS_THRESHOLD = 90;

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

  return (
    <div className="rounded-2xl border border-slate-600 bg-slate-700/50 p-5 mb-4">
      <div className="text-sm text-slate-400 mb-3">
        Click dots to show <span className="font-bold text-white">{leftTarget}</span> +{" "}
        <span className="font-bold text-white">{rightTarget}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {leftOn.map((on, i) => (
            <button
              key={`left-${i}`}
              type="button"
              onClick={() => toggle("left", i)}
              className={[
                "h-8 w-8 rounded-full border transition",
                on
                  ? "bg-teal-500 border-teal-400"
                  : "bg-slate-700 border-slate-500 hover:bg-slate-600",
              ].join(" ")}
            />
          ))}
        </div>
        <div className="text-4xl font-extrabold text-slate-400 select-none">+</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {rightOn.map((on, i) => (
            <button
              key={`right-${i}`}
              type="button"
              onClick={() => toggle("right", i)}
              className={[
                "h-8 w-8 rounded-full border transition",
                on
                  ? "bg-teal-500 border-teal-400"
                  : "bg-slate-700 border-slate-500 hover:bg-slate-600",
              ].join(" ")}
            />
          ))}
        </div>
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

export default function PostTestPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
          <p className="text-slate-500">Loading…</p>
        </div>
      }
    >
      <PostTestPage />
    </Suspense>
  );
}

function PostTestPage() {
  const router = useRouter();
  const params = useSearchParams();
  const year = params.get("year") ?? "Year 3";

  const test = useMemo(() => {
    return getPosttestForYearLabel(year);
  }, [year]);

  const questions: Question[] = test?.questions ?? [];

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [mab, setMab] = useState<{ tens: number; ones: number }>({
    tens: 0,
    ones: 0,
  });

  const q = questions[idx];
  const picked = answers[q?.id ?? ""] ?? "";
  const mabHasSelection = mab.tens > 0 || mab.ones > 0;

  function pick(option: string) {
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
  }

  function changeMab(nextMab: { tens: number; ones: number }) {
    setMab(nextMab);
    if (!q || q.type !== "mab") return;
    const nextTotal = nextMab.tens * 10 + nextMab.ones;
    const hasSelection = nextMab.tens > 0 || nextMab.ones > 0;
    setAnswers((prev) => ({
      ...prev,
      [q.id]: hasSelection ? String(nextTotal) : "",
    }));
  }

  function next() {
    if (idx < questions.length - 1) {
      setMab({ tens: 0, ones: 0 });
      setIdx((v) => v + 1);
    }
  }

  function back() {
    if (idx > 0) {
      setMab({ tens: 0, ones: 0 });
      setIdx((v) => v - 1);
    }
  }

  function submit() {
    if (!questions.length) return;

    const studentId = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_STUDENT_KEY) : null;
    const profile = analyzeAssessmentResult({
      questions,
      answers,
      yearLevel: Number(year.replace(/\D/g, "")) || 3,
      testType: "post",
      passThreshold: PASS_THRESHOLD,
      studentId,
    });
    const prev = readProgress();
    const correct = profile.score;
    const percent = profile.percentage;
    const assignedWeek = profile.assignedWeek ?? prev?.assignedWeek;
    const unlockedLegends = prev?.unlockedLegends ?? [];

    const legend = getLegendForYear(year);
    const didPass = percent >= PASS_THRESHOLD;
    const nextUnlocked = didPass
      ? Array.from(new Set([...unlockedLegends, legend.id]))
      : unlockedLegends;

    const nextProgress: StudentProgress = {
      year,
      scorePercent: prev?.scorePercent ?? 0,
      status: didPass ? "PASSED" : "ASSIGNED_PROGRAM",
      assignedWeek: didPass ? prev?.assignedWeek : assignedWeek,
      assignedWeeksHistory: didPass
        ? prev?.assignedWeeksHistory ?? []
        : Array.from(new Set([...(prev?.assignedWeeksHistory ?? []), ...(assignedWeek ? [assignedWeek] : [])])),
      unlockedLegends: nextUnlocked,
      lastPostTestPercent: percent,
      lastPostTestProfile: { ...profile, assignedWeek },
    };

    writeProgress(nextProgress);
    setSubmitted(true);

    (async () => {
      try {
        if (!studentId) return;

        const { data: existing } = await supabase
          .from("progress_snapshot")
          .select("quiz_scores")
          .eq("student_id", studentId)
          .eq("year", year)
          .maybeSingle();

        const prevScores = ((existing?.quiz_scores as Record<string, unknown> | null) ?? {}) as Record<
          string,
          unknown
        >;
        const existingPosttest =
          typeof prevScores.posttest === "object" && prevScores.posttest !== null
            ? (prevScores.posttest as { attempts?: unknown[] })
            : undefined;
        const previousAttempts = existingPosttest?.attempts ?? [];
        const latest = { ...profile, assignedWeek, at: new Date().toISOString() };
        const updatedScores = {
          ...prevScores,
          posttest: {
            latest,
            attempts: [...previousAttempts, latest],
          },
        };

        const { error } = await supabase
          .from("progress_snapshot")
          .upsert(
            {
              student_id: studentId,
              year,
              quiz_scores: updatedScores,
              status: didPass ? "PASSED" : "ASSIGNED_PROGRAM",
              week: didPass ? prev?.assignedWeek ?? null : assignedWeek ?? prev?.assignedWeek ?? 1,
            },
            { onConflict: "student_id,year" }
          );
        if (error) console.warn("[PostTest] DB save error:", error);
      } catch (error) {
        console.warn("[PostTest] DB save failed:", error);
      }
    })();

    router.push(
      `/results?year=${encodeURIComponent(year)}&score=${correct}&total=${questions.length}&posttest=1`
    );
  }

  if (!questions.length) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-800 rounded-3xl shadow-xl p-8 w-full max-w-xl text-center border border-slate-700/60">
          <h1 className="text-2xl font-extrabold text-white mb-2">
            Post-Test coming soon
          </h1>
          <p className="text-slate-400 mb-6">
            A post-test for <span className="font-bold text-white">{year}</span>{" "}
            is not available yet.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold hover:from-teal-400 hover:to-emerald-400 transition"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  const hasAnswer =
    q?.type === "mab" ? mabHasSelection : q?.type === "numeric" ? picked.trim().length > 0 : !!picked;

  let questionContent: React.ReactNode;

  if (q.type === "mab") {
    questionContent = (
      <MabPicker
        target={Number(q.answer ?? q.correctAnswer ?? 0)}
        maxTens={(q as Question & { maxTens?: number }).maxTens ?? 10}
        maxOnes={(q as Question & { maxOnes?: number }).maxOnes ?? 10}
        value={mab}
        onChange={changeMab}
      />
    );
  } else if (q.type === "numberLine") {
    questionContent = (
      <div className="mt-4">
        <div className="relative w-full h-20">
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-600 rounded" />
          <div className="absolute left-0 top-[55%] text-xs text-slate-400">
            {(q as Question & { min?: number }).min}
          </div>
          <div className="absolute right-0 top-[55%] text-xs text-slate-400">
            {(q as Question & { max?: number }).max}
          </div>

          {(((q.options ?? []) as number[])).map((n) => {
            const qMin = (q as Question & { min?: number }).min ?? 0;
            const qMax = (q as Question & { max?: number }).max ?? 100;
            const pct = ((n - qMin) / (qMax - qMin)) * 100;
            const isSelected = picked === String(n);

            return (
              <button
                key={n}
                onClick={() => pick(String(n))}
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
        <div className="mt-3 text-sm text-slate-400">Tap the correct point on the line.</div>
      </div>
    );
  } else if (q.type === "groups") {
    questionContent = (
      <div className="grid gap-4">
        {((q.options ?? []) as Array<{ id: string; label: string; groups: number[] }>).map((opt) => {
          const isSelected = picked === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => pick(opt.id)}
              className={[
                "w-full rounded-2xl border p-5 text-left transition",
                isSelected
                  ? "border-teal-500 bg-teal-500/10"
                  : "border-slate-600 bg-slate-700/50 hover:bg-slate-700",
              ].join(" ")}
            >
              <div className="text-lg font-extrabold text-white mb-3">{opt.label}</div>
              <GroupsVisual groups={opt.groups} />
            </button>
          );
        })}
      </div>
    );
  } else {
    const visual =
      typeof q.visual === "object" && q.visual !== null
        ? (q.visual as Record<string, unknown>)
        : undefined;

    questionContent = (
      <>
        {visual?.type === "dot_add" ? (
          <DotAddVisual
            leftTarget={Number(visual.leftTarget)}
            rightTarget={Number(visual.rightTarget)}
            maxDots={Number(visual.maxDots ?? 10)}
          />
        ) : visual?.type === "group_counters" &&
          visual.groupSize !== undefined &&
          visual.selectTarget !== undefined &&
          !((q.options ?? []) as Array<string | { groups?: number[] }>).some(
            (opt) => typeof opt !== "string" && opt.groups
          ) ? (
          <GroupCountersVisual
            totalCounters={Number(visual.totalCounters)}
            groupSize={Number(visual.groupSize)}
            selectTarget={Number(visual.selectTarget)}
          />
        ) : null}
        <AssessmentQuestionCard question={q} value={picked} onChange={pick} />
      </>
    );
  }

  return (
    <AssessmentShell
      testType="Post-Test"
      year={year}
      currentIndex={idx}
      totalQuestions={questions.length}
      subtitle="Complete all questions to unlock your Legend (90%+)"
      questionPrompt={q.prompt}
      questionContent={
        <div>
          <div className="flex justify-end mb-3">
            <ReadAloudBtn text={q.prompt} />
          </div>
          {questionContent}
        </div>
      }
      hasAnswer={hasAnswer}
      isLast={idx === questions.length - 1}
      submitted={submitted}
      onBack={back}
      onNext={next}
      onSubmit={submit}
      onExit={() => router.push("/")}
    />
  );
}
