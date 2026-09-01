"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock3,
  Gem,
  RotateCcw,
  Sparkles,
  Trophy,
} from "lucide-react";
import { REALM_QUIZ_THEMES, RealmWeeklyQuizChrome } from "@/components/quiz/RealmWeeklyQuizChrome";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { TaskRenderer } from "@/components/TaskRenderer";
import { weeklyQuizMinimumCorrect, weeklyQuizPassed, ASSESSMENT_THRESHOLDS } from "@/lib/assessment-rules";
import { writeStarpathDemoJourney } from "@/lib/starpath-demo-state";
import { saveNumberWeeklyQuizAttempt } from "@/lib/student-progress-sync";
import { getActiveStudentIdentity } from "@/lib/studentIdentity";
import type { RealmLevelId } from "@/lib/realms/realm-dashboard-config";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { buildAssessmentQuestionSnapshots, type ReplayQuestionSource } from "@/lib/assessment-replay";
import { buildIncorrectFeedbackSpeech } from "@/lib/incorrect-feedback";

export type StarpathVoyageQuizMeta = {
  level: RealmLevelId;
  levelLabel: string;
  week: number;
  title: string;
  coverage: string;
  lessonTitles: [string, string, string];
  lessonCurriculumCodes: [string[], string[], string[]];
  lessonSkillIds: [string[], string[], string[]];
  weekHref: string;
  nextWeekHref?: string;
};

type VoyageQuizRealm = "space" | "statistics";

type QuizPhase = "home" | "quiz" | "results" | "review";

type SavedVoyageQuiz = {
  version: 2;
  order: number[];
  index: number;
  answers: Record<string, boolean>;
  responses?: Record<string, string>;
};

const QUIZ_XP = 20;

function taskFeedback(task: PracticeTask) {
  return (task as { feedback?: { correct: string; wrong: string } }).feedback;
}

function taskPrompt(task: PracticeTask) {
  return "prompt" in task && typeof task.prompt === "string" ? task.prompt : "Starpath quiz question";
}

function optionLabel(task: PracticeTask, optionId: string) {
  if (!("options" in task) || !Array.isArray(task.options)) return optionId;
  const option = task.options.find((candidate) =>
    typeof candidate === "object" && candidate !== null && "id" in candidate && String(candidate.id) === optionId
  );
  return option && typeof option === "object" && "label" in option ? String(option.label) : optionId;
}

function categoryLabel(task: PracticeTask, categoryId: string) {
  const rows = "categories" in task && Array.isArray(task.categories)
    ? task.categories
    : "rows" in task && Array.isArray(task.rows)
      ? task.rows
      : [];
  const row = rows.find((candidate) => candidate.id === categoryId);
  return row && "label" in row && typeof row.label === "string" ? row.label : categoryId;
}

function studentAnswerForReview(task: PracticeTask, response?: string) {
  if (!response?.trim()) return "Incorrect attempt";
  if (response.includes(" | ")) return response.split(" | ").map((part) => optionLabel(task, part)).join("; ");
  if (response.includes(",")) return response.split(",").map((part) => categoryLabel(task, part)).join(", ");
  const option = optionLabel(task, response);
  return option === response ? categoryLabel(task, response) : option;
}

function correctAnswerForReview(task: PracticeTask) {
  if ("correctOptionIds" in task && Array.isArray(task.correctOptionIds) && task.correctOptionIds.length > 0) {
    return task.correctOptionIds.map((optionId) => optionLabel(task, optionId)).join(" or ");
  }
  if ("correctCategoryId" in task && typeof task.correctCategoryId === "string") {
    return categoryLabel(task, task.correctCategoryId);
  }
  if ("correctRowId" in task && typeof task.correctRowId === "string") {
    return categoryLabel(task, task.correctRowId);
  }
  if ("answerCount" in task && typeof task.answerCount === "number") return String(task.answerCount);
  if ("difference" in task && typeof task.difference === "number") return String(task.difference);
  if ("correctOrderIds" in task && Array.isArray(task.correctOrderIds)) {
    return task.correctOrderIds.map((categoryId) => categoryLabel(task, categoryId)).join(", ");
  }
  if ("correctDisplay" in task && typeof task.correctDisplay === "string") return `${task.correctDisplay} display`;
  if ("mode" in task && task.mode === "record" && "count" in task && typeof task.count === "number") {
    return String(task.count);
  }
  if ("categories" in task && Array.isArray(task.categories)) {
    const categoryCounts = task.categories.flatMap((category) =>
      "label" in category && "count" in category && typeof category.count === "number"
        ? [`${category.label}: ${category.count}`]
        : []
    );
    if (categoryCounts.length > 0) return categoryCounts.join(", ");
  }
  return "See the data model shown in the question";
}

function lessonOrder(length: number) {
  return Array.from({ length }, (_, index) => index);
}

function newCompletionKey() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export default function StarpathVoyageQuiz({
  quiz,
  tasks,
  realm = "space",
}: {
  quiz: StarpathVoyageQuizMeta;
  tasks: PracticeTask[];
  realm?: VoyageQuizRealm;
}) {
  const router = useRouter();
  const theme = REALM_QUIZ_THEMES[realm];
  const isStatistica = realm === "statistics";
  const unitLabel = isStatistica ? "lesson" : "mission";
  const realmTitle = isStatistica ? "Statistica Data Quiz" : "Starpath Voyage Quiz";
  const levelNumber = quiz.level === "Prep" ? 0 : Number(quiz.level.replace(/\D/g, "")) || 0;
  const answersAreEditable = true;
  const storageKey = `${realm}-weekly-quiz:v2:${getActiveStudentIdentity().studentId ?? "demo"}:${quiz.level}:${quiz.week}`;

  const [phase, setPhase] = useState<QuizPhase>("home");
  const [order, setOrder] = useState<number[]>(() => tasks.map((_, index) => index));
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [nonce, setNonce] = useState(0);
  const [hasResume, setHasResume] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const orderedTasks = useMemo(
    () => order.map((taskIndex) => tasks[taskIndex]).filter((task): task is PracticeTask => Boolean(task)),
    [order, tasks]
  );
  const task = orderedTasks[index];
  const currentAnswer = answers[String(index)];
  const answeredCount = Object.keys(answers).length;
  const total = orderedTasks.length;
  const percent = total > 0 ? Math.round((finalScore / total) * 100) : 0;
  const passed = weeklyQuizPassed(percent);
  const requiredCorrect = weeklyQuizMinimumCorrect(total);
  const lessonScores = [0, 1, 2].map((lessonIndex) => {
    const start = lessonIndex * 5;
    const score = Array.from({ length: 5 }, (_, offset) => answers[String(start + offset)])
      .filter((answer) => answer === true).length;
    return {
      lesson: lessonIndex + 1,
      title: quiz.lessonTitles[lessonIndex],
      score,
    };
  });
  const weakestScore = Math.min(...lessonScores.map((result) => result.score));
  const weakestLessons = lessonScores.filter((result) => result.score === weakestScore);
  const wrongIndexes = orderedTasks
    .map((_, questionIndex) => questionIndex)
    .filter((questionIndex) => answers[String(questionIndex)] === false);
  const quizIntroduction = `${quiz.title}. Great work completing this week's ${unitLabel}s! It is time to show what you discovered across all three ${unitLabel}s. There are 15 questions, with five questions from each ${unitLabel}. The quiz takes approximately 8 to 10 minutes. Work at your own pace. The pass mark is 80 percent. You can earn ${QUIZ_XP} XP, chain progress, and gems.`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setOrder(lessonOrder(tasks.length));
        return;
      }
      const saved = JSON.parse(raw) as SavedVoyageQuiz;
      const validOrder =
        saved.version === 2 &&
        saved.order.length === tasks.length &&
        new Set(saved.order).size === tasks.length &&
        saved.order.every((taskIndex) => taskIndex >= 0 && taskIndex < tasks.length);
      if (!validOrder) {
        localStorage.removeItem(storageKey);
        setOrder(lessonOrder(tasks.length));
        return;
      }
      setOrder(saved.order);
      setIndex(Math.min(saved.index, tasks.length - 1));
      setAnswers(saved.answers);
      setResponses(saved.responses ?? {});
      setHasResume(Object.keys(saved.answers).length > 0);
    } catch {
      localStorage.removeItem(storageKey);
      setOrder(lessonOrder(tasks.length));
    }
  }, [storageKey, tasks.length]);

  useEffect(() => {
    if (phase !== "quiz") return;
    const saved: SavedVoyageQuiz = { version: 2, order, index, answers, responses };
    localStorage.setItem(storageKey, JSON.stringify(saved));
  }, [answers, index, order, phase, responses, storageKey]);

  function answer(ok: boolean, response?: string) {
    if (!task || (!answersAreEditable && currentAnswer !== undefined)) return;
    setAnswers((current) => ({ ...current, [String(index)]: ok }));
    if (response) {
      setResponses((current) => ({ ...current, [String(index)]: response }));
    }
  }

  function changeAnswer() {
    const answerKey = String(index);
    setAnswers((current) => {
      const next = { ...current };
      delete next[answerKey];
      return next;
    });
    setResponses((current) => {
      const next = { ...current };
      delete next[answerKey];
      return next;
    });
    setNonce((value) => value + 1);
  }

  function beginQuiz() {
    if (!hasResume) {
      setOrder(lessonOrder(tasks.length));
      setIndex(0);
      setAnswers({});
      setResponses({});
      localStorage.removeItem(storageKey);
    }
    setStartedAt((current) => current ?? Date.now());
    setPhase("quiz");
  }

  async function finishQuiz() {
    if (saving || answeredCount !== total) return;
    setSaving(true);
    const score = Object.values(answers).filter(Boolean).length;
    const finalPercent = total > 0 ? Math.round((score / total) * 100) : 0;
    const studentId = getActiveStudentIdentity().studentId;
    const completedAt = new Date().toISOString();
    const replaySources: ReplayQuestionSource[] = orderedTasks.map((quizTask, questionIndex) => {
      const lessonIndex = Math.min(2, Math.floor(questionIndex / 5));
      return {
        id: `${quiz.level}-${realm}-w${quiz.week}-quiz-q${questionIndex + 1}`,
        prompt: taskPrompt(quizTask),
        type: "practiceTask",
        correctAnswer: correctAnswerForReview(quizTask),
        skillId: quiz.lessonSkillIds[lessonIndex][0],
        skillLabel: quiz.lessonTitles[lessonIndex],
        strand: isStatistica ? "Statistics" : "Space",
        curriculumCodes: quiz.lessonCurriculumCodes[lessonIndex],
        linkedWeeks: [quiz.week],
        linkedLessons: [lessonIndex + 1],
        reviewFeedback: taskFeedback(quizTask)?.wrong,
        practiceTask: quizTask,
      };
    });
    const questionResults = buildAssessmentQuestionSnapshots(
      replaySources,
      (_question, questionIndex) =>
        answers[String(questionIndex)] === true
          ? correctAnswerForReview(orderedTasks[questionIndex]!)
          : studentAnswerForReview(orderedTasks[questionIndex]!, responses[String(questionIndex)]),
      (_question) => {
        const questionIndex = replaySources.indexOf(_question);
        return answers[String(questionIndex)] === true;
      },
      completedAt,
    );

    try {
      const passedQuiz = weeklyQuizPassed(finalPercent);
      if (!isStatistica) {
        writeStarpathDemoJourney(quiz.level, {
          currentWeek: passedQuiz ? Math.min(8, quiz.week + 1) : quiz.week,
          currentLesson: passedQuiz ? 0 : 3,
        });
      }
      if (studentId) {
        await saveNumberWeeklyQuizAttempt(
          studentId,
          quiz.level,
          quiz.week,
          {
            percent: finalPercent,
            score,
            total,
            passed: passedQuiz,
            lessonBreakdown: lessonScores.map((result) => ({
              lessonNumber: result.lesson,
              lessonTitle: result.title,
              correct: result.score,
              total: 5,
              percent: result.score * 20,
            })),
            questionResults,
            replay_metadata: {
              duration_seconds: startedAt ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) : null,
              question_snapshot_schema: 1,
            },
            at: completedAt,
          },
          newCompletionKey(),
          realm
        );
      }
      localStorage.removeItem(storageKey);
      setHasResume(false);
      setFinalScore(score);
      setPhase("results");
    } catch (error) {
      console.warn(`[${isStatistica ? "Statistica" : "Starpath"}] Weekly quiz persist failed`, error);
      window.alert("We couldn't save this quiz yet. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function restart() {
    setOrder(lessonOrder(tasks.length));
    setAnswers({});
    setResponses({});
    setIndex(0);
    setNonce((value) => value + 1);
    setFinalScore(0);
    setStartedAt(Date.now());
    setHasResume(false);
    localStorage.removeItem(storageKey);
    setPhase("quiz");
  }

  return (
    <main className="relative isolate min-h-screen px-3 py-4 text-white sm:px-6">
      <div className="mx-auto w-full max-w-[1200px]">
        <RealmWeeklyQuizChrome
          realm={realm}
          levelNumber={levelNumber}
          levelLabel={quiz.levelLabel}
          year={quiz.level}
          week={quiz.week}
          questionCount={total || 15}
          focus={quiz.coverage}
          demoMode
          onBack={() => router.push(quiz.weekHref)}
        />

        <section
          className="rounded-b-lg border px-4 py-6 text-slate-950 shadow-[0_24px_90px_rgba(0,0,0,0.42)] sm:px-7"
          style={{ background: theme.workspaceBg, borderColor: theme.panelBorder }}
        >
          {phase === "home" ? (
            <div className="mx-auto max-w-4xl">
              <div className="overflow-hidden rounded-lg border shadow-xl" style={{ borderColor: theme.panelBorder, background: isStatistica ? "#163a32" : "#111735" }}>
                <div className="relative px-6 py-9 text-white sm:px-10">
                  <div className={isStatistica ? "absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(240,107,100,0.28),transparent_34%),radial-gradient(circle_at_82%_28%,rgba(242,188,69,0.22),transparent_30%)]" : "absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.38),transparent_34%),radial-gradient(circle_at_82%_28%,rgba(34,211,238,0.28),transparent_30%)]"} />
                  <div className="relative">
                    <div className="font-mono text-xs font-black uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
                      {realmTitle}
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-black sm:text-5xl">{quiz.title}</h1>
                      <ReadAloudBtn
                        text={quizIntroduction}
                        speechKey={`${realm}-weekly-quiz-${quiz.level}-${quiz.week}`}
                        size="md"
                        label="Read quiz"
                        className={isStatistica ? "border-amber-200/30 bg-emerald-950/60 text-amber-50 hover:border-amber-200 hover:text-white" : "border-cyan-200/30 bg-indigo-950/70 text-cyan-100 hover:border-cyan-200 hover:text-white"}
                      />
                    </div>
                    <p className="mt-4 max-w-2xl text-base font-semibold leading-7" style={{ color: theme.accentSoft }}>
                      Great work completing this week&apos;s {unitLabel}s! It&apos;s time to show what you discovered across all three {unitLabel}s.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 border-t border-white/10 p-5 sm:grid-cols-4 sm:p-7" style={{ background: isStatistica ? "#101d15" : "#0b1029" }}>
                  {[
                    { icon: BookOpen, value: "15 questions", label: `Five from each ${unitLabel}` },
                    { icon: Clock3, value: "8–10 minutes", label: "Work at your own pace" },
                    { icon: Trophy, value: "80% pass mark", label: "Show your mastery" },
                    { icon: Gem, value: `${QUIZ_XP} XP`, label: "Plus chain and gems" },
                  ].map(({ icon: Icon, value, label }) => (
                    <div key={value} className="rounded-lg border border-white/10 bg-white/5 p-4 text-white">
                      <Icon className="h-6 w-6" style={{ color: theme.accent }} />
                      <div className="mt-3 font-black">{value}</div>
                      <div className="mt-1 text-sm" style={{ color: theme.accentSoft }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={beginQuiz}
                className="mx-auto mt-6 flex min-h-14 items-center justify-center gap-2 rounded-lg px-8 text-lg font-black text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
                style={{ background: isStatistica ? "linear-gradient(90deg, #a83e4b, #e85d63 58%, #f2bc45)" : "linear-gradient(90deg, #7c3aed, #06b6d4)" }}
              >
                <Sparkles className="h-5 w-5" />
                {hasResume ? "Resume Quiz" : "Begin Quiz"}
              </button>
            </div>
          ) : null}

          {phase === "quiz" ? (
            <div className="mx-auto max-w-3xl">
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="font-mono text-xs font-black uppercase tracking-[0.16em]" style={{ color: isStatistica ? "#8e3341" : "#5b21b6" }}>
                  Question {index + 1} of {total}
                </span>
                <span className="font-mono text-xs font-black uppercase tracking-[0.16em]" style={{ color: isStatistica ? "#13785f" : "#0e7490" }}>
                  {answeredCount} answered
                </span>
              </div>
              <div className="mb-6 h-2 overflow-hidden rounded-full" style={{ background: isStatistica ? "#dcebd6" : "#ede9fe" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${total ? (answeredCount / total) * 100 : 0}%`, background: isStatistica ? "linear-gradient(90deg, #20b486, #f2bc45)" : "linear-gradient(90deg, #8b5cf6, #22d3ee)" }}
                />
              </div>

              {task ? (
                <div className={!answersAreEditable && currentAnswer !== undefined ? "pointer-events-none opacity-75" : ""}>
                  <TaskRenderer
                    key={`${index}-${nonce}`}
                    task={task}
                    taskNonce={nonce}
                    assessmentMode
                    editableAssessmentMode={answersAreEditable}
                    assessmentAnswer={responses[String(index)]}
                    callbacks={{
                      markCorrect: () => answer(true),
                      markCorrectSoft: () => answer(true),
                      markWrong: (response) => answer(false, response == null ? undefined : String(response)),
                      recordAssessmentAnswer: (correct, response) => answer(correct, response),
                    }}
                  />
                </div>
              ) : null}

              {currentAnswer !== undefined ? (
                <div className={`mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 ${isStatistica ? "border-[#79b85a]/60 bg-[#edf5e8]" : "border-cyan-200 bg-cyan-50"}`}>
                  <div className={`flex items-center gap-2 font-bold ${isStatistica ? "text-[#244531]" : "text-cyan-950"}`}>
                    <Check className={`h-5 w-5 ${isStatistica ? "text-[#20b486]" : "text-cyan-600"}`} />
                    Answer recorded. You can change it before finishing the quiz.
                  </div>
                  <button
                    type="button"
                    onClick={changeAnswer}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-lg border bg-white px-4 text-sm font-black transition ${isStatistica ? "border-[#f06b64]/55 text-[#8e3341] hover:bg-[#fff0df]" : "border-violet-300 text-violet-800 hover:bg-violet-50"}`}
                  >
                    <RotateCcw className="h-4 w-4" /> Change answer
                  </button>
                </div>
              ) : null}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => {
                    setIndex((value) => Math.max(0, value - 1));
                    setNonce((value) => value + 1);
                  }}
                  className={`inline-flex min-h-12 items-center gap-2 rounded-lg border-2 bg-white px-5 font-black disabled:cursor-not-allowed disabled:opacity-40 ${isStatistica ? "border-[#f06b64]/55 text-[#8e3341]" : "border-violet-300 text-violet-800"}`}
                >
                  <ArrowLeft className="h-5 w-5" /> Back
                </button>

                {index < total - 1 ? (
                  <button
                    type="button"
                    disabled={currentAnswer === undefined}
                    onClick={() => {
                      setIndex((value) => Math.min(total - 1, value + 1));
                      setNonce((value) => value + 1);
                    }}
                    className={`inline-flex min-h-12 items-center gap-2 rounded-lg px-6 font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40 ${isStatistica ? "bg-gradient-to-r from-[#a83e4b] via-[#e85d63] to-[#f2bc45]" : "bg-gradient-to-r from-violet-600 to-cyan-500"}`}
                  >
                    Next <ArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={answeredCount !== total || saving}
                    onClick={finishQuiz}
                    className={`inline-flex min-h-12 items-center gap-2 rounded-lg px-6 font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-40 ${isStatistica ? "bg-gradient-to-r from-[#a83e4b] via-[#e85d63] to-[#f2bc45]" : "bg-gradient-to-r from-violet-600 to-cyan-500"}`}
                  >
                    {saving ? "Saving…" : "Finish Quiz"} <Check className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {phase === "results" ? (
            <div className="mx-auto max-w-xl text-center">
              <div className={`font-mono text-[11px] font-black uppercase tracking-[0.2em] ${isStatistica ? "text-[#a83e4b]" : "text-violet-700"}`}>
                {quiz.title}
              </div>
              <div
                className={[
                  "mx-auto mt-4 flex h-24 w-24 items-center justify-center rounded-full text-white shadow-lg",
                  passed
                    ? isStatistica ? "bg-gradient-to-br from-[#a83e4b] via-[#e85d63] to-[#f2bc45]" : "bg-gradient-to-br from-violet-600 to-cyan-500"
                    : "bg-gradient-to-br from-amber-500 to-amber-700",
                ].join(" ")}
              >
                <span className="text-3xl font-black">{percent}%</span>
              </div>
              <h2 className="mt-5 text-3xl font-black text-slate-950">
                {passed ? (isStatistica ? "Data check complete!" : "Voyage complete!") : "Keep exploring!"}
              </h2>
              <p className="mt-2 text-base font-semibold text-slate-600">
                You answered {finalScore}/{total} correctly.
                {passed
                  ? ` You passed the ${ASSESSMENT_THRESHOLDS.weeklyQuizPassPercent}% mark and earned ${QUIZ_XP} XP.`
                  : ` You need ${requiredCorrect}/${total} to pass and unlock Week ${quiz.week + 1}.`}
              </p>
              {!passed ? (
                <div className="mt-4 rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-3 font-bold text-amber-950">
                  Week {quiz.week + 1} is not unlocked yet. Review a {isStatistica ? "lesson" : "mission"} below, then try the quiz again.
                </div>
              ) : null}
              <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
                {lessonScores.map((result) => (
                  <div
                    key={result.lesson}
                    className={[
                      "rounded-lg border-2 p-4",
                      result.score >= 4
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-amber-200 bg-amber-50",
                    ].join(" ")}
                  >
                    <div className={`font-mono text-xs font-black uppercase tracking-[0.16em] ${isStatistica ? "text-[#a83e4b]" : "text-violet-700"}`}>
                      {isStatistica ? "Lesson" : "Mission"} {result.lesson}
                    </div>
                    <div className="mt-2 text-2xl font-black text-slate-950">{result.score}/5</div>
                    <div className="mt-1 text-sm font-bold text-slate-700">{result.title}</div>
                  </div>
                ))}
              </div>
              {wrongIndexes.length ? (
                <div className={`mt-5 rounded-lg border-2 p-4 text-left ${isStatistica ? "border-[#79b85a]/45 bg-[#edf5e8]" : "border-violet-200 bg-violet-50"}`}>
                  <div className={`font-mono text-xs font-black uppercase tracking-[0.16em] ${isStatistica ? "text-[#13785f]" : "text-violet-700"}`}>
                    Where to practise
                  </div>
                  <p className="mt-2 font-bold text-slate-900">
                    Return to {weakestLessons
                      .map((result) => `${isStatistica ? "Lesson" : "Mission"} ${result.lesson}: ${result.title}`)
                      .join(" and ")} for more practice.
                  </p>
                </div>
              ) : null}
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                {!passed ? (
                  <button
                    type="button"
                    onClick={restart}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border-2 bg-white px-6 text-base font-black ${isStatistica ? "border-[#f06b64]/55 text-[#8e3341]" : "border-violet-300 text-violet-800"}`}
                  >
                    <RotateCcw className="h-5 w-5" /> Retry Quiz
                  </button>
                ) : null}
                {wrongIndexes.length ? (
                  <button
                    type="button"
                    onClick={() => setPhase("review")}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-6 text-base font-black text-white ${isStatistica ? "bg-[#c74f4b] hover:bg-[#a93f3c]" : "bg-violet-700"}`}
                  >
                    Review Answers <BookOpen className="h-5 w-5" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => router.push(passed && quiz.nextWeekHref ? quiz.nextWeekHref : quiz.weekHref)}
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-6 text-base font-black text-white shadow-lg ${isStatistica ? "bg-gradient-to-r from-[#a83e4b] via-[#e85d63] to-[#f2bc45]" : "bg-gradient-to-r from-violet-600 to-cyan-500"}`}
                >
                  {passed && quiz.nextWeekHref
                    ? `Continue to Week ${quiz.week + 1}`
                    : `Back to Week ${quiz.week}`}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : null}

          {phase === "review" ? (
            <div className="mx-auto max-w-3xl">
              <div className="text-center">
                <div className={`font-mono text-xs font-black uppercase tracking-[0.2em] ${isStatistica ? "text-[#a83e4b]" : "text-violet-700"}`}>
                  Quiz Review
                </div>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Questions to revisit</h2>
              </div>
              <div className="mt-6 space-y-3">
                {wrongIndexes.map((questionIndex) => {
                  const reviewTask = orderedTasks[questionIndex]!;
                  return (
                    <div key={questionIndex} className={`rounded-lg border-2 p-4 ${isStatistica ? "border-[#f06b64]/40 bg-[#fff0df]" : "border-rose-200 bg-rose-50"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-mono text-xs font-black uppercase tracking-[0.16em] text-rose-700">
                          Question {questionIndex + 1}
                        </div>
                        <ReadAloudBtn
                          text={buildIncorrectFeedbackSpeech({
                            prompt: taskPrompt(reviewTask),
                            studentAnswer: studentAnswerForReview(reviewTask, responses[String(questionIndex)]),
                            correctAnswer: correctAnswerForReview(reviewTask),
                            explanation:
                              taskFeedback(reviewTask)?.wrong ??
                              "Review this question and try the quiz again.",
                          })}
                          speechKey={`${realm}-quiz-review:${quiz.level}:${quiz.week}:${questionIndex}`}
                          label="Read feedback"
                          className={isStatistica ? "shrink-0 border-[#f06b64]/40 bg-white text-[#8e3341]" : "shrink-0 border-rose-200 bg-white text-rose-800"}
                        />
                      </div>
                      <div className="mt-2 text-lg font-black text-slate-950">{taskPrompt(reviewTask)}</div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-800">
                          <span className="font-black">Your answer:</span> {studentAnswerForReview(reviewTask, responses[String(questionIndex)])}
                        </div>
                        <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-bold text-emerald-800">
                          <span className="font-black">Correct answer:</span> {correctAnswerForReview(reviewTask)}
                        </div>
                      </div>
                      <div className={`mt-2 rounded-lg border px-3 py-2 font-semibold ${isStatistica ? "border-[#f2bc45]/50 bg-[#fffaf0] text-[#5b2e27]" : "border-rose-200 bg-white text-rose-900"}`}>
                        {taskFeedback(reviewTask)?.wrong ?? "Review this question and try the quiz again."}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => setPhase("results")}
                className={`mx-auto mt-6 flex min-h-12 items-center gap-2 rounded-lg border-2 bg-white px-6 font-black ${isStatistica ? "border-[#f06b64]/55 text-[#8e3341]" : "border-violet-300 text-violet-800"}`}
              >
                <ArrowLeft className="h-5 w-5" /> Back to Results
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
