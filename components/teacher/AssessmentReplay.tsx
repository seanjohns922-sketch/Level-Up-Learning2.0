"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  List,
  X,
} from "lucide-react";
import {
  isAssessmentQuestionSnapshot,
  type AssessmentQuestionSnapshot,
  type AssessmentReplayStatus,
} from "@/lib/assessment-replay";
import AssessmentQuestionCard from "@/components/assessment/AssessmentQuestionCard";
import { TaskRenderer } from "@/components/TaskRenderer";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

export type TeacherAssessmentAttempt = {
  id: string;
  realmId: string;
  workingLevel: string;
  assessmentType: "pretest" | "weekly_quiz" | "posttest";
  week?: number;
  attemptNumber: number;
  correctCount: number | null;
  totalQuestions: number | null;
  scorePercent: number;
  passed: boolean | null;
  completedAt: string;
  placementResult: Record<string, unknown>;
  questionResults: unknown[];
};

type ReplayFilter = "all" | AssessmentReplayStatus;

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "No answer";
  if (typeof value === "string") return value === "idk" ? "I Don't Know" : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(formatValue).join(" → ");
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.label === "string") return record.label;
    if (typeof record.value === "string" || typeof record.value === "number") return String(record.value);
    return Object.entries(record)
      .map(([key, item]) => `${key.replaceAll("_", " ")}: ${formatValue(item)}`)
      .join(", ");
  }
  return String(value);
}

function realmName(realmId: string) {
  if (realmId === "measurement") return "Measurelands";
  if (realmId === "space") return "Starpath";
  return "Number Nexus";
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return date.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function numberFrom(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function insightLabels(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string") return [item];
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    const label = record.skillLabel ?? record.label ?? record.skillId;
    return typeof label === "string" && label.trim() ? [label] : [];
  });
}

function QuestionResultBadge({ status }: { status: AssessmentReplayStatus }) {
  const meta = {
    correct: { label: "Correct", classes: "border-emerald-200 bg-emerald-50 text-emerald-700", Icon: Check },
    incorrect: { label: "Incorrect", classes: "border-rose-200 bg-rose-50 text-rose-700", Icon: X },
    skipped: { label: "Skipped", classes: "border-slate-200 bg-slate-50 text-slate-600", Icon: ArrowRight },
    dont_know: { label: "I Don't Know", classes: "border-amber-200 bg-amber-50 text-amber-700", Icon: CircleHelp },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-extrabold ${meta.classes}`}>
      <meta.Icon className="h-4 w-4" />
      {meta.label}
    </span>
  );
}

function OptionReplay({
  option,
  studentAnswer,
  correctAnswer,
}: {
  option: unknown;
  studentAnswer: unknown;
  correctAnswer: unknown;
}) {
  const label = formatValue(option);
  const optionRecord =
    option && typeof option === "object" && !Array.isArray(option)
      ? (option as Record<string, unknown>)
      : null;
  const optionValues = [
    label,
    optionRecord?.id,
    optionRecord?.value,
    optionRecord?.label,
  ].map(formatValue);
  const isStudent = optionValues.includes(formatValue(studentAnswer));
  const isCorrect = optionValues.includes(formatValue(correctAnswer));
  return (
    <div
      className={[
        "rounded-lg border px-4 py-3 text-sm font-semibold",
        isCorrect
          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
          : isStudent
            ? "border-rose-300 bg-rose-50 text-rose-900"
            : "border-slate-200 bg-white text-slate-700",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <span className="flex gap-1 text-[10px] font-extrabold uppercase tracking-[0.08em]">
          {isStudent ? <span>Student choice</span> : null}
          {isCorrect ? <span>Correct answer</span> : null}
        </span>
      </div>
    </div>
  );
}

function SnapshotQuestion({
  question,
  realmId,
}: {
  question: AssessmentQuestionSnapshot;
  realmId: string;
}) {
  const hasVisual = Boolean(question.visual);
  const hasTask = Boolean(question.task_snapshot);
  return (
    <article className="rounded-2xl border border-[#D9E2EA] bg-white p-5 shadow-[0_8px_24px_-20px_rgba(15,23,42,0.35)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-teal-700">
            Question {question.question_number} · {question.question_type.replaceAll("_", " ")}
          </div>
          <h3 className="mt-2 text-xl font-black text-slate-950">{question.question_text}</h3>
        </div>
        <QuestionResultBadge status={question.response_status} />
      </div>

      {hasVisual ? (
        <div className="pointer-events-none mt-5 rounded-xl bg-slate-950 p-4" aria-label="Original assessment visual">
          <AssessmentQuestionCard
            question={{
              type: question.question_type,
              prompt: question.question_text,
              options: question.options,
              visual: question.visual,
            }}
            value={typeof question.student_answer === "string" ? question.student_answer : null}
            onChange={() => undefined}
            realmId={realmId}
          />
        </div>
      ) : null}

      {hasTask ? (
        <div className="pointer-events-none mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="Original assessment interaction">
          <TaskRenderer
            task={question.task_snapshot as PracticeTask}
            taskNonce={0}
            assessmentMode
            callbacks={{
              markCorrect: () => undefined,
              markCorrectSoft: () => undefined,
              markWrong: () => undefined,
              markAttempted: () => undefined,
            }}
          />
        </div>
      ) : null}

      {question.options.length > 0 ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {question.options.map((option, index) => (
            <OptionReplay
              key={`${question.question_id}-option-${index}`}
              option={option}
              studentAnswer={question.student_answer}
              correctAnswer={question.correct_answer}
            />
          ))}
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Student Answer</div>
          <div className="mt-1 text-base font-bold text-slate-950">{formatValue(question.student_answer)}</div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">Correct Answer</div>
          <div className="mt-1 text-base font-bold text-emerald-950">{formatValue(question.correct_answer)}</div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50 p-4">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-cyan-800">Explanation</div>
        <p className="mt-1 text-sm font-semibold text-cyan-950">{question.explanation}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
        <span className="rounded-md bg-slate-100 px-2.5 py-1.5 text-slate-700">
          Skill: {question.curriculum_skill.label}
        </span>
        {(question.curriculum_codes ?? []).map((code) => (
          <span key={code} className="rounded-md bg-indigo-50 px-2.5 py-1.5 text-indigo-800">
            Australian Curriculum: {code}
          </span>
        ))}
        {question.lesson_mapping.map((mapping) => (
          <span key={`${mapping.week}-${mapping.lesson}`} className="rounded-md bg-teal-50 px-2.5 py-1.5 text-teal-800">
            Taught in {mapping.label}
          </span>
        ))}
      </div>
    </article>
  );
}

export default function AssessmentReplay({
  attempt,
  studentName,
  onBack,
}: {
  attempt: TeacherAssessmentAttempt;
  studentName: string;
  onBack: () => void;
}) {
  const questions = useMemo(
    () => attempt.questionResults.filter(isAssessmentQuestionSnapshot),
    [attempt.questionResults],
  );
  const [filter, setFilter] = useState<ReplayFilter>("all");
  const filteredQuestions = useMemo(
    () => questions.filter((question) => filter === "all" || question.response_status === filter),
    [filter, questions],
  );
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(questions[0]?.question_id ?? null);
  const activeIndex = Math.max(
    0,
    filteredQuestions.findIndex((question) => question.question_id === activeQuestionId),
  );
  const activeQuestion = filteredQuestions[activeIndex] ?? filteredQuestions[0] ?? null;

  const recordedStrengths = insightLabels(attempt.placementResult.strengths);
  const recordedWeakAreas = insightLabels(attempt.placementResult.weakAreas);
  const recommendedWeeks = Array.isArray(attempt.placementResult.recommendedWeeks)
    ? attempt.placementResult.recommendedWeeks.filter((week): week is number => typeof week === "number")
    : [];
  const durationSeconds =
    numberFrom((attempt.placementResult.replay_metadata as Record<string, unknown> | undefined)?.duration_seconds) ??
    numberFrom(attempt.placementResult.duration_seconds);
  const errorCounts = questions
    .filter((question) => question.response_status !== "correct")
    .reduce<Record<string, number>>((acc, question) => {
      const label = question.curriculum_skill.label;
      acc[label] = (acc[label] ?? 0) + 1;
      return acc;
    }, {});
  const commonErrors = Object.entries(errorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const skillStats = questions.reduce<Record<string, { correct: number; total: number }>>((acc, question) => {
    const label = question.curriculum_skill.label;
    const current = acc[label] ?? { correct: 0, total: 0 };
    current.total += 1;
    if (question.response_status === "correct") current.correct += 1;
    acc[label] = current;
    return acc;
  }, {});
  const derivedStrengths = Object.entries(skillStats)
    .filter(([, stats]) => stats.total > 0 && stats.correct / stats.total >= 0.8)
    .map(([label]) => label);
  const derivedWeakAreas = Object.entries(skillStats)
    .filter(([, stats]) => stats.total > 0 && stats.correct / stats.total < 0.8)
    .map(([label]) => label);
  const strengths = recordedStrengths.length > 0 ? recordedStrengths : derivedStrengths;
  const weakAreas = recordedWeakAreas.length > 0 ? recordedWeakAreas : derivedWeakAreas;
  const recommendedLessons = Array.from(
    new Map(
      questions
        .filter((question) => question.response_status !== "correct")
        .flatMap((question) => question.lesson_mapping)
        .map((mapping) => [`${mapping.week}-${mapping.lesson}`, mapping]),
    ).values(),
  ).slice(0, 4);
  const teacherComment =
    weakAreas.length > 0
      ? `${studentName} demonstrates strength in ${strengths[0] ?? "several assessed skills"} but needs further teaching in ${weakAreas.slice(0, 2).join(" and ")}. ${
          recommendedLessons.length > 0
            ? `Revisit ${recommendedLessons.map((lesson) => lesson.label).join(", ")} before progressing.`
            : "Use the question replay to select targeted practice before progressing."
        }`
      : `${studentName} demonstrated secure understanding across the assessed skills. Continue the current learning pathway.`;
  const assessmentTitle =
    attempt.assessmentType === "pretest"
      ? "Pre-Test"
      : attempt.assessmentType === "posttest"
        ? "Post-Test"
        : `Week ${attempt.week ?? "—"} Quiz`;
  const outcomeLabel =
    attempt.assessmentType === "pretest"
      ? "Pathway assigned"
      : attempt.assessmentType === "weekly_quiz"
        ? "Week outcome"
        : "Level outcome";
  const outcomeValue =
    attempt.assessmentType === "pretest"
      ? formatValue(attempt.placementResult.pathway ?? attempt.placementResult.assignedWeek ?? "Not recorded")
      : attempt.passed
        ? attempt.assessmentType === "weekly_quiz"
          ? `Week ${attempt.week ?? ""} passed`
          : "Level completed"
        : "Further practice recommended";

  function selectFilter(nextFilter: ReplayFilter) {
    setFilter(nextFilter);
    const first = questions.find((question) => nextFilter === "all" || question.response_status === nextFilter);
    setActiveQuestionId(first?.question_id ?? null);
  }

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Assessment History
      </button>

      <section className="overflow-hidden rounded-2xl border border-[#D9E2EA] bg-white">
        <div className="bg-[#0A2F2A] px-6 py-5 text-white">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#5EEAD4]">
            Read-only Assessment Replay
          </div>
          <h2 className="mt-1 text-2xl font-black">
            {assessmentTitle} · {attempt.workingLevel}
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-300">{studentName} · {realmName(attempt.realmId)}</p>
        </div>
        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Completed", formatDateTime(attempt.completedAt)],
            ["Time taken", durationSeconds != null ? `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s` : "Not recorded"],
            ["Attempt", String(attempt.attemptNumber)],
            ["Result", `${attempt.correctCount ?? "—"}/${attempt.totalQuestions ?? "—"} · ${attempt.scorePercent}%`],
            ["Outcome", attempt.passed ? "Passed" : "Not Passed"],
            [
              outcomeLabel,
              outcomeValue,
            ],
          ].map(([label, value]) => (
            <div key={label} className="bg-white px-5 py-4">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-slate-500">{label}</div>
              <div className="mt-1 text-sm font-bold text-slate-950">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ReplayInsight title="Strengths" value={strengths.length > 0 ? strengths.join(", ") : "No strengths summary recorded."} />
        <ReplayInsight title="Needs Further Teaching" value={weakAreas.length > 0 ? weakAreas.join(", ") : "No priority gaps identified."} />
        <ReplayInsight
          title="Most Common Errors"
          value={commonErrors.length > 0 ? commonErrors.map(([label, count]) => `${label} (${count})`).join(", ") : "No errors recorded."}
        />
        <ReplayInsight
          title="Recommended Lessons"
          value={
            recommendedLessons.length > 0
              ? recommendedLessons.map((lesson) => lesson.label).join(", ")
              : recommendedWeeks.length > 0
              ? `Revisit Week${recommendedWeeks.length > 1 ? "s" : ""} ${recommendedWeeks.join(", ")}.`
              : weakAreas[0] ?? "Continue the current learning pathway."
          }
        />
      </section>

      <section className="rounded-xl border border-teal-200 bg-teal-50 p-5">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-teal-800">Teacher Comment</div>
        <p className="mt-2 text-sm font-semibold leading-6 text-teal-950">{teacherComment}</p>
      </section>

      {questions.length === 0 ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-black text-amber-950">Detailed replay unavailable for this historical attempt</h3>
          <p className="mt-2 text-sm font-semibold text-amber-900">
            This assessment was completed before immutable question snapshots were stored. Its score and placement outcome remain
            canonical, but individual answers cannot be reconstructed safely.
          </p>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-[#D9E2EA] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                <List className="h-4 w-4" />
                Question Review
              </div>
              <div className="flex flex-wrap gap-2">
                {([
                  ["all", "All Questions"],
                  ["correct", "Correct"],
                  ["incorrect", "Incorrect"],
                  ["skipped", "Skipped"],
                  ["dont_know", "I Don't Know"],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectFilter(id)}
                    className={[
                      "rounded-md px-3 py-2 text-xs font-extrabold",
                      filter === id ? "bg-[#0A2F2A] text-[#5EEAD4]" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {filteredQuestions.map((question) => (
                <button
                  key={question.question_id}
                  type="button"
                  onClick={() => setActiveQuestionId(question.question_id)}
                  className={[
                    "h-9 min-w-9 rounded-md border px-2 text-xs font-black",
                    activeQuestion?.question_id === question.question_id
                      ? "border-teal-600 bg-teal-600 text-white"
                      : question.response_status === "correct"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : question.response_status === "dont_know"
                          ? "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-rose-200 bg-rose-50 text-rose-700",
                  ].join(" ")}
                >
                  {question.question_number}
                </button>
              ))}
              {filteredQuestions.length === 0 ? (
                <span className="text-sm font-semibold text-slate-500">No questions match this filter.</span>
              ) : null}
            </div>
          </section>

          {activeQuestion ? <SnapshotQuestion question={activeQuestion} realmId={attempt.realmId} /> : null}

          {activeQuestion ? (
            <div className="flex items-center justify-between">
              <button
                type="button"
                disabled={activeIndex <= 0}
                onClick={() => setActiveQuestionId(filteredQuestions[activeIndex - 1]?.question_id ?? null)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous Question
              </button>
              <button
                type="button"
                disabled={activeIndex >= filteredQuestions.length - 1}
                onClick={() => setActiveQuestionId(filteredQuestions[activeIndex + 1]?.question_id ?? null)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0A2F2A] px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                Next Question
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function ReplayInsight({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#D9E2EA] bg-white p-4">
      <div className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-teal-700">{title}</div>
      <p className="mt-2 text-sm font-semibold leading-5 text-slate-700">{value}</p>
    </div>
  );
}
