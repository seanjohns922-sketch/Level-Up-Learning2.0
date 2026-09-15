"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";
import AssessmentQuestionCard from "@/components/assessment/AssessmentQuestionCard";
import ReadAloudBtn, { ReadAloudRateProvider } from "@/components/ReadAloudBtn";
import { ACTIVE_STUDENT_KEY } from "@/data/progress";
import { isAssessmentAnswerCorrect } from "@/data/assessments/analysis";
import { AC_STRANDS, type AcStrand } from "@/lib/curriculum/ac-standards";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { STRAND_PRESENTATION } from "@/lib/diagnostic-presentation";
import {
  DIAGNOSTIC_STRANDS,
  decideDiagnosticPlacement,
  diagnosticLevelLabel,
  diagnosticLevelNumber,
  type DiagnosticCheckpoint,
} from "@/lib/whole-maths-diagnostic";
import { getDiagnosticQuestions } from "@/lib/whole-maths-diagnostic-questions";

// Demo Review lens on the Whole-Maths Diagnostic: the exact level-test questions a student
// receives, rendered through the real question card. Nothing here reads or writes a sitting.
const UNKNOWN_ANSWER = "__i_dont_know__";
const PREVIEW_SITTING_ID = "demo-review-preview";
const LONG_PROMPT_WORDS = 20;
const CHECKPOINTS: readonly { id: Exclude<DiagnosticCheckpoint, "ad_hoc">; label: string }[] = [
  { id: "start", label: "Start" },
  { id: "mid", label: "Mid" },
  { id: "end", label: "End" },
];
const PREVIEW_STRANDS = DIAGNOSTIC_STRANDS.filter((definition) => definition.available).map((definition) => definition.strand);

type PreviewCheckpoint = (typeof CHECKPOINTS)[number]["id"];

function minimumLevel(strand: AcStrand) {
  return strand === "number" ? 0 : strand === "algebra" || strand === "probability" ? 3 : 1;
}

function levelsFor(strand: AcStrand) {
  return Array.from({ length: 7 - minimumLevel(strand) }, (_, offset) => diagnosticLevelLabel(minimumLevel(strand) + offset));
}

function parseStrand(value: string | null): AcStrand {
  return PREVIEW_STRANDS.find((strand) => strand === value) ?? "measurement";
}

function parseLevel(strand: AcStrand, value: string | null) {
  const levels = levelsFor(strand);
  return levels.find((level) => level === value) ?? (levels.includes("Year 3") ? "Year 3" : levels[0]!);
}

function parseCheckpoint(value: string | null): PreviewCheckpoint {
  return CHECKPOINTS.find((checkpoint) => checkpoint.id === value)?.id ?? "start";
}

export default function DiagnosticPreview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const strand = parseStrand(searchParams.get("strand"));
  const level = parseLevel(strand, searchParams.get("level"));
  const checkpoint = parseCheckpoint(searchParams.get("checkpoint"));

  useEffect(() => {
    if (!isDemoPreviewMode() || localStorage.getItem(ACTIVE_STUDENT_KEY) !== "demo-preview") {
      router.replace("/login?returnTo=%2Fdemo-review");
    }
  }, [router]);

  function select(next: { strand?: AcStrand; level?: string; checkpoint?: PreviewCheckpoint }) {
    const nextStrand = next.strand ?? strand;
    const params = new URLSearchParams({
      strand: nextStrand,
      level: parseLevel(nextStrand, next.level ?? level),
      checkpoint: next.checkpoint ?? checkpoint,
    });
    router.replace(`/demo-review/diagnostic?${params.toString()}`);
  }

  return (
    <ReadAloudRateProvider>
      <main className="min-h-screen bg-[#06131f] px-4 pb-5 pt-20 text-white sm:px-6 sm:pb-7 md:pt-7">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push(`/demo-review?realm=${DIAGNOSTIC_STRANDS.find(s=>s.strand===strand)?.realmId ?? "number"}&year=${encodeURIComponent(level)}`)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Demo Review
            </button>
            <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-amber-200">
              Diagnostic preview · Nothing is saved
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_12rem_auto]">
            <label className="text-xs font-bold text-slate-400">Realm
              <select
                value={strand}
                onChange={(event) => select({ strand: parseStrand(event.target.value) })}
                className="mt-2 h-11 w-full rounded-xl border border-white/15 bg-[#171a22] px-3 text-sm font-bold text-white"
              >
                {PREVIEW_STRANDS.map((item) => (
                  <option key={item} value={item}>{STRAND_PRESENTATION[item].realm} · {AC_STRANDS[item].label}</option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold text-slate-400">Level
              <select
                value={level}
                onChange={(event) => select({ level: event.target.value })}
                className="mt-2 h-11 w-full rounded-xl border border-white/15 bg-[#171a22] px-3 text-sm font-bold text-white"
              >
                {levelsFor(strand).map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <div className="text-xs font-bold text-slate-400">
              Checkpoint
              <div className="mt-2 flex h-11 overflow-hidden rounded-xl border border-white/15" role="group" aria-label="Diagnostic checkpoint">
                {CHECKPOINTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={item.id === checkpoint}
                    onClick={() => select({ checkpoint: item.id })}
                    className={`flex-1 px-4 text-sm font-black transition sm:flex-none ${item.id === checkpoint ? "bg-white text-slate-950" : "bg-[#171a22] text-slate-300 hover:bg-white/10"}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <PreviewSession key={`${strand}-${level}-${checkpoint}`} strand={strand} level={level} checkpoint={checkpoint} />
        </div>
      </main>
    </ReadAloudRateProvider>
  );
}

function PreviewSession({ strand, level, checkpoint }: { strand: AcStrand; level: string; checkpoint: PreviewCheckpoint }) {
  const questions = useMemo(
    () => getDiagnosticQuestions(strand, level, PREVIEW_SITTING_ID, checkpoint, 5,3,3,3),
    [checkpoint, level, strand],
  );
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const presentation = STRAND_PRESENTATION[strand];
  const StrandIcon = presentation.icon;

  const reviews = useMemo(() => questions.map(({ question, curriculumCodes }) => {
    const record = question as unknown as Record<string, unknown>;
    const words = question.prompt.trim().split(/\s+/).filter(Boolean).length;
    const rawAnswer = record.correctAnswer ?? record.answer;
    const answerText = rawAnswer == null ? null : String(rawAnswer);
    return {
      hasVisual: record.visual != null,
      words,
      longPrompt: words > LONG_PROMPT_WORDS,
      skill: typeof record.skillLabel === "string" ? record.skillLabel : null,
      // Interactive realm tasks store a sentinel; the task itself marks the response.
      answer: answerText && !/^__.+__$/.test(answerText) ? answerText : null,
      curriculumCodes,
    };
  }), [questions]);

  if (questions.length === 0) {
    return (
      <p className="mt-6 rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-slate-300">
        No diagnostic level test exists for {AC_STRANDS[strand].label} at {level}.
      </p>
    );
  }

  const current = questions[index]!;
  const review = reviews[index]!;
  const currentAnswer = answers[current.question.id] ?? null;
  const isUnknownAnswer = currentAnswer === UNKNOWN_ANSWER;
  const visibleAnswer = isUnknownAnswer ? null : currentAnswer;
  const answeredCount = questions.filter(({ question }) => answers[question.id] != null).length;
  const withoutVisual = reviews.filter((item) => !item.hasVisual).length;
  const longPrompts = reviews.filter((item) => item.longPrompt).length;

  function record(value: string) {
    setAnswers((previous) => ({ ...previous, [current.question.id]: value }));
  }

  function goTo(nextIndex: number) {
    setIndex(Math.max(0, Math.min(questions.length - 1, nextIndex)));
    setShowAnswer(false);
    setFinished(false);
  }

  function restart() {
    setAnswers({});
    setIndex(0);
    setShowAnswer(false);
    setFinished(false);
  }

  const score = questions.reduce(
    (total, { question }) => total + (isAssessmentAnswerCorrect(question, answers[question.id]) ? 1 : 0),
    0,
  );
  const percent = Math.round((score / questions.length) * 100);
  let outcome = "Realm complete at this level";
  if (finished) {
    const decision = decideDiagnosticPlacement(level, [{
      level,
      score,
      total: questions.length,
      percent,
      curriculumCodes: Array.from(new Set(questions.flatMap((item) => item.curriculumCodes))),
      questionIds: questions.map(({ question }) => question.id),
    }],minimumLevel(strand));
    const levelNumber = diagnosticLevelNumber(level);
    if (decision.shouldProbeNext) {
      outcome = `Follow-up test at ${diagnosticLevelLabel(levelNumber + 1)}, after the other realms`;
    } else if (decision.shouldProbeLower && levelNumber > minimumLevel(strand)) {
      outcome = `Follow-up test at ${diagnosticLevelLabel(levelNumber - 1)}, after the other realms`;
    }
  }

  return (
    <>
      <section className={`mt-6 overflow-hidden rounded-[2rem] border ${presentation.card} shadow-xl`}>
        <div className="bg-slate-950/55 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl shadow-lg ${presentation.iconBox}`}>
                <StrandIcon className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <p className={`text-xs font-black uppercase tracking-[0.18em] ${presentation.accent}`}>
                  {CHECKPOINTS.find((item) => item.id === checkpoint)!.label} diagnostic · {presentation.realm}
                </p>
                <h1 className="mt-1 text-2xl font-black sm:text-3xl">{AC_STRANDS[strand].label} <span className="text-slate-500">·</span> {level}</h1>
                <p className="mt-1 text-sm font-semibold text-slate-400">
                  {withoutVisual} of {questions.length} without a visual · {longPrompts} over {LONG_PROMPT_WORDS} words
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Restart
            </button>
          </div>

          <ol className="mt-5 flex flex-wrap gap-1.5" aria-label="Questions">
            {reviews.map((item, position) => {
              const flagged = !item.hasVisual || item.longPrompt;
              const answered = answers[questions[position]!.question.id] != null;
              return (
                <li key={questions[position]!.question.id}>
                  <button
                    type="button"
                    onClick={() => goTo(position)}
                    aria-current={position === index && !finished ? "step" : undefined}
                    aria-label={`Question ${position + 1}${answered ? ", answered" : ""}${item.hasVisual ? "" : ", no visual"}${item.longPrompt ? ", long prompt" : ""}`}
                    className={`relative grid h-9 w-9 place-items-center rounded-lg text-xs font-black transition ${
                      position === index && !finished
                        ? "bg-white text-slate-950"
                        : answered
                          ? "bg-white/20 text-white hover:bg-white/30"
                          : "bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {position + 1}
                    {flagged ? <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-slate-950" aria-hidden="true" /> : null}
                  </button>
                </li>
              );
            })}
          </ol>
          <p className="mt-2 text-xs font-semibold text-slate-500">Amber dot: no visual or a long prompt.</p>
        </div>
      </section>

      {finished ? (
        <section className="mt-5 rounded-[2rem] border border-white/15 bg-slate-900/90 p-6 shadow-2xl shadow-black/35 sm:p-8" aria-labelledby="preview-result-title">
          <p className={`text-xs font-black uppercase tracking-[0.18em] ${presentation.accent}`}>Preview result</p>
          <h2 id="preview-result-title" className="mt-2 text-4xl font-black">{score} / {questions.length} <span className="text-2xl text-slate-400">({percent}%)</span></h2>
          <p className="mt-3 text-lg font-semibold text-slate-200">{outcome}</p>
          <p className="mt-1 text-sm text-slate-400">Students return to the diagnostic home after every level test.</p>
          <button
            type="button"
            onClick={restart}
            className={`mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl px-6 py-3 font-black text-slate-950 shadow-lg transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 ${presentation.button}`}
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" /> Run again
          </button>
        </section>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_19rem] lg:items-start">
          <section className="overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900/90 shadow-2xl shadow-black/35">
            <div className="border-b border-white/10 bg-white/[0.025] px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex items-center justify-between gap-4">
                <span className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] ${presentation.accent}`}>
                  <span className={`h-2 w-2 rounded-full ${presentation.progress}`} aria-hidden="true" />
                  Question {String(index + 1).padStart(2, "0")} of {questions.length}
                </span>
                <ReadAloudBtn text={current.question.prompt} label="Read question" />
              </div>
              <h2 className="mt-4 max-w-4xl text-2xl font-black leading-tight tracking-tight sm:text-3xl">{current.question.prompt}</h2>
            </div>

            <div className="p-4 sm:p-7">
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-3 sm:p-5">
                <AssessmentQuestionCard
                  key={current.question.id}
                  question={current.question}
                  value={visibleAnswer}
                  onChange={record}
                  realmId={presentation.assessmentRealmId}
                />
              </div>

              {isUnknownAnswer ? (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-slate-600/70 bg-slate-800/70 px-4 py-3 text-sm font-bold text-slate-300" role="status">
                  <CircleHelp className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                  Marked “I don&apos;t know”. You can still choose an answer before moving on.
                </div>
              ) : null}

              <div className="mt-6 grid grid-cols-2 items-center gap-3 border-t border-white/10 pt-5 sm:grid-cols-[1fr_auto_1fr]">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => goTo(index - 1)}
                  className="inline-flex min-h-12 w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-black text-slate-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-300 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => record(UNKNOWN_ANSWER)}
                  className={`col-span-2 row-start-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-300 sm:col-span-1 sm:col-start-2 sm:row-start-1 ${isUnknownAnswer ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                >
                  <CircleHelp className="h-5 w-5" aria-hidden="true" /> I don&apos;t know
                </button>
                {index < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => goTo(index + 1)}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 justify-self-end rounded-xl px-6 py-3 font-black text-slate-950 shadow-lg transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 ${presentation.button}`}
                  >
                    Next <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={answeredCount !== questions.length}
                    onClick={() => setFinished(true)}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 justify-self-end rounded-xl px-6 py-3 font-black text-slate-950 shadow-lg transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-35 ${presentation.button}`}
                  >
                    Finish this level <Check className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
              {index === questions.length - 1 && answeredCount !== questions.length ? (
                <p className="mt-3 text-right text-xs font-bold text-slate-500">{answeredCount} of {questions.length} answered. Answer every question to finish.</p>
              ) : null}
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl shadow-black/25" aria-label="Reviewer notes">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Reviewer notes</p>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-xs font-bold text-slate-500">Visual</dt>
                <dd className={`mt-1 font-black ${review.hasVisual ? "text-emerald-300" : "text-amber-300"}`}>{review.hasVisual ? "Has a visual" : "No visual"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-500">Prompt length</dt>
                <dd className={`mt-1 font-black ${review.longPrompt ? "text-amber-300" : "text-white"}`}>{review.words} words{review.longPrompt ? " · long" : ""}</dd>
              </div>
              {review.skill ? (
                <div>
                  <dt className="text-xs font-bold text-slate-500">Skill</dt>
                  <dd className="mt-1 font-semibold text-slate-200">{review.skill}</dd>
                </div>
              ) : null}
              {review.curriculumCodes.length > 0 ? (
                <div>
                  <dt className="text-xs font-bold text-slate-500">Curriculum</dt>
                  <dd className="mt-1 font-mono text-xs font-bold text-slate-200">{review.curriculumCodes.join(", ")}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs font-bold text-slate-500">Question ID</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-400">{current.question.id}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setShowAnswer((value) => !value)}
              aria-expanded={showAnswer}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
            >
              {showAnswer ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              {showAnswer ? "Hide correct answer" : "Show correct answer"}
            </button>
            {showAnswer ? (
              <p className="mt-3 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-3 py-2.5 text-sm font-bold text-emerald-100">
                {review.answer ?? "This interactive task marks the response itself."}
              </p>
            ) : null}
          </aside>
        </div>
      )}
    </>
  );
}
