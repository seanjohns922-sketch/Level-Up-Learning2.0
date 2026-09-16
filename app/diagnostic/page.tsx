"use client";
import { assessmentSpokenPrompt } from "@/lib/assessment-spoken-prompt";
import { groundNumberHasAnswer } from "@/lib/ground-number-answer";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  DoorOpen,
  LockKeyhole,
  Save,
  Sparkles,
} from "lucide-react";
import AssessmentQuestionNavigator from "@/components/assessment/AssessmentQuestionNavigator";
import { canVisitAssessmentQuestion } from "@/lib/assessment-navigation";
import AssessmentQuestionCard from "@/components/assessment/AssessmentQuestionCard";
import ReadAloudBtn, { ReadAloudRateProvider } from "@/components/ReadAloudBtn";
import { isAssessmentAnswerCorrect } from "@/data/assessments/analysis";
import { AC_STRANDS } from "@/lib/curriculum/ac-standards";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import {
  completeDiagnosticStrand,
  fetchPendingStudentDiagnostic,
  fetchStudentDiagnosticJourney,
  saveDiagnosticProgress,
  type StudentDiagnosticJourneyRow,
  type PendingStudentDiagnostic,
} from "@/lib/whole-maths-diagnostic-client";
import {
  decideDiagnosticPlacement,
  diagnosticQuestionCount,
  diagnosticLevelLabel,
  diagnosticLevelNumber,
  type DiagnosticProbeScore,
} from "@/lib/whole-maths-diagnostic";
import { getDiagnosticQuestions } from "@/lib/whole-maths-diagnostic-questions";
import { pauseDiagnosticHandoff } from "@/lib/diagnostic-handoff";
import { STRAND_PRESENTATION } from "@/lib/diagnostic-presentation";

const UNKNOWN_ANSWER = "__i_dont_know__";

function checkpointLabel(checkpoint: PendingStudentDiagnostic["checkpoint"]) {
  if (checkpoint === "ad_hoc") return "Teacher check-in";
  return `${checkpoint[0]!.toUpperCase()}${checkpoint.slice(1)} diagnostic`;
}

export default function WholeMathsDiagnosticPage() {
  const router = useRouter();
  const [pending, setPending] = useState<PendingStudentDiagnostic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState("Year 1");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [probes, setProbes] = useState<DiagnosticProbeScore[]>([]);
  const [saving, setSaving] = useState(false);
  const [journey, setJourney] = useState<StudentDiagnosticJourneyRow[]>([]);
  const [hasBegunStrand, setHasBegunStrand] = useState(false);
  const profile = useMemo(() => getActiveStudentProfile(), []);

  const loadPending = useCallback(async () => {
    if (!profile?.studentId) {
      router.replace("/login?error=session_missing");
      return null;
    }
    const next = await fetchPendingStudentDiagnostic(profile.studentId, true);
    setJourney(await fetchStudentDiagnosticJourney(profile.studentId));
    setPending(next);
    if (next) {
      setLevel(next.active_level ?? next.starting_level);
      setAnswers(next.draft_answers ?? {});
      setProbes(next.draft_probes ?? []);
      setIndex(Math.max(0, next.draft_index ?? 0));
      // A waiting follow-up level (saved probes, no answers yet) opens on the home screen first.
      setHasBegunStrand(
        (next.draft_index ?? 0) > 0 ||
        Object.keys(next.draft_answers ?? {}).length > 0,
      );
    }
    return next;
  }, [profile?.studentId, router]);

  useEffect(() => {
    let cancelled = false;
    void loadPending()
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "The diagnostic could not load.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [loadPending]);

  const linkedQuestions = useMemo(
    () => pending ? getDiagnosticQuestions(pending.strand, level, pending.sitting_id, pending.checkpoint, pending.number_level1_bank_version ?? 2,pending.number_ground_bank_version??1,pending.number_level2_bank_version??2,pending.number_level4_bank_version??2,pending.number_level5_bank_version??2,pending.number_level6_bank_version??2,pending.number_level3_bank_version??2,pending.number_maximum_level??6,pending.measurement_ground_bank_version??3,pending.measurement_level1_bank_version??3,pending.measurement_level2_bank_version??3) : [],
    [level, pending],
  );
  const current = linkedQuestions[index];
  const isAnswered=(question:typeof linkedQuestions[number]["question"])=>answers[question.id]===UNKNOWN_ANSWER || (question.type==="prepNumberTask" ? groundNumberHasAnswer(question,answers[question.id]) : answers[question.id]!=null && answers[question.id]!=="");
  const answeredCount = linkedQuestions.filter(({question})=>isAnswered(question)).length;

  async function recordAnswer(value: string) {
    if (!current || !pending || !profile?.studentId) return;
    const nextAnswers = { ...answers, [current.question.id]: value };
    setAnswers(nextAnswers);
    setSaving(true);
    try {
      await saveDiagnosticProgress(profile.studentId, pending.sitting_id, pending.strand, level, nextAnswers, probes, index);
      setError(null);
    } catch {
      setError("Your answer is still on this screen, but it could not be saved. Check your connection before continuing.");
    } finally {
      setSaving(false);
    }
  }

  async function moveToQuestion(nextIndex: number) {
    if (!pending || !profile?.studentId) return;
    const boundedIndex = Math.max(0, Math.min(linkedQuestions.length - 1, nextIndex));
    const flags = linkedQuestions.map(({question})=>isAnswered(question));
    if (saving || !canVisitAssessmentQuestion(boundedIndex, flags, index)) return;
    setIndex(boundedIndex);
    try {
      await saveDiagnosticProgress(profile.studentId, pending.sitting_id, pending.strand, level, answers, probes, boundedIndex);
      setError(null);
    } catch {
      setError("Your place could not be saved. Check your connection before leaving this page.");
    }
  }

  async function exitDiagnostic() {
    if (!pending || !profile?.studentId || saving) return;
    setSaving(true);
    setError(null);
    try {
      await saveDiagnosticProgress(
        profile.studentId,
        pending.sitting_id,
        pending.strand,
        level,
        answers,
        probes,
        index,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your place could not be saved. Please try again before leaving.");
      setSaving(false);
      return;
    }
    try {
      setJourney(await fetchStudentDiagnosticJourney(profile.studentId));
    } catch {
      // The place is saved; the home screen can fall back to the journey it already has.
    }
    setSaving(false);
    setHasBegunStrand(false);
    window.scrollTo({ top: 0 });
  }

  function leaveToCentralHub() {
    if (pending) pauseDiagnosticHandoff(pending.sitting_id);
    router.push("/world");
  }

  async function finishLevel() {
    if (!pending || !profile?.studentId || linkedQuestions.length === 0 || answeredCount !== linkedQuestions.length) return;
    const score = linkedQuestions.reduce(
      (total, { question }) => total + (isAssessmentAnswerCorrect(question, answers[question.id]) ? 1 : 0),
      0,
    );
    const curriculumCodes = Array.from(new Set(linkedQuestions.flatMap((item) => item.curriculumCodes)));
    const probe: DiagnosticProbeScore = {
      level,
      score,
      total: linkedQuestions.length,
      percent: Math.round((score / linkedQuestions.length) * 100),
      curriculumCodes,
      questionIds: linkedQuestions.map(({ question }) => question.id),
    };
    const nextProbes = [...probes, probe];
    const minimumLevel = (pending.strand === "number" && pending.number_ground_bank_version===3 || pending.strand === "measurement" && pending.measurement_ground_bank_version===4) ? 0 : pending.strand === "algebra" || pending.strand === "probability" ? 3 : 1;
    const decision = decideDiagnosticPlacement(pending.starting_level, nextProbes,minimumLevel,pending.strand === "number" ? pending.number_maximum_level ?? 6 : 6);
    const nextProbeLevel = decision.shouldProbeNext
      ? diagnosticLevelNumber(level) + 1
      : decision.shouldProbeLower && diagnosticLevelNumber(level) > minimumLevel
        ? diagnosticLevelNumber(level) - 1
        : null;
    if (nextProbeLevel != null) {
      const nextLevel = diagnosticLevelLabel(nextProbeLevel);
      setSaving(true);
      setError(null);
      try {
        await saveDiagnosticProgress(profile.studentId, pending.sitting_id, pending.strand, nextLevel, {}, nextProbes, 0);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Your next diagnostic level could not be saved.");
        setSaving(false);
        return;
      }
      // The follow-up level waits so students aren't given back-to-back tests. Return to the
      // diagnostic home, where the server lines up fresh realms before any follow-ups.
      setProbes(nextProbes);
      setLevel(nextLevel);
      setAnswers({});
      setIndex(0);
      try {
        await loadPending();
      } catch {
        // The follow-up is saved; the home screen can show this realm's follow-up as up next.
      }
      setHasBegunStrand(false);
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await completeDiagnosticStrand(
        profile.studentId,
        pending.sitting_id,
        pending.strand,
        nextProbes,
      );
      if (result.sitting_complete) {
        setPending(null);
        setProbes([]);
        setAnswers({});
        return;
      }
      const next = await loadPending();
      // loadPending restores the next realm's saved follow-up scores; only clear when nothing is left.
      if (!next) {
        setProbes([]);
        setAnswers({});
        setIndex(0);
      }
      setHasBegunStrand(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your result could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 text-lg font-bold text-white">Loading your diagnostic…</main>;
  }
  if (error && !pending) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-white"><div><h1 className="text-2xl font-black">Diagnostic unavailable</h1><p className="mt-2 text-slate-300">{error}</p><button type="button" onClick={() => router.push("/world")} className="mt-5 rounded-xl bg-teal-400 px-5 py-3 font-black text-slate-950">Return to my world</button></div></main>;
  }
  if (!pending) {
    const completionText = "Diagnostic complete. Your six strand results and overall maths level are saved for your teacher.";
    return <ReadAloudRateProvider><main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-white"><div><h1 className="text-3xl font-black">Diagnostic complete</h1><p className="mt-2 text-slate-300">Your six strand results and overall maths level are saved for your teacher.</p><ReadAloudBtn text={completionText} className="mt-4" /><button type="button" onClick={() => router.push("/world")} className="mt-5 rounded-xl bg-teal-400 px-5 py-3 font-black text-slate-950">Return to my world</button></div></main></ReadAloudRateProvider>;
  }
  if (!pending.access_open) {
    const lockedText = "Your diagnostic is safely saved. It can only be continued at school when your teacher opens a supervised session.";
    return <ReadAloudRateProvider><main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-white"><div className="max-w-xl"><p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">School assessment</p><h1 className="mt-2 text-3xl font-black">Diagnostic session closed</h1><p className="mt-3 text-slate-300">Your diagnostic is safely saved. It can only be continued at school when your teacher opens a supervised session.</p><ReadAloudBtn text={lockedText} label="Read this" className="mt-4" /><button type="button" onClick={() => router.push("/world")} className="mt-6 rounded-xl bg-teal-400 px-5 py-3 font-black text-slate-950">Return to my world</button></div></main></ReadAloudRateProvider>;
  }
  if (!hasBegunStrand) {
    const completedCount = journey.filter((item) => item.status === "completed").length;
    const currentJourney = journey.find((item) => item.strand === pending.strand);
    const currentStep = Math.max(0, journey.findIndex((item) => item.strand === pending.strand)) + 1;
    const currentAnswered = currentJourney?.answered_count ?? 0;
    const isFollowUp = probes.length > 0;
    const currentPresentation = STRAND_PRESENTATION[pending.strand];
    const CurrentIcon = currentPresentation.icon;
    const ringCircumference = 2 * Math.PI * 42;
    const journeyReadout = journey.map((item) => {
      const status = item.status === "completed"
        ? "complete"
        : item.answered_count > 0
          ? `${item.answered_count} of ${diagnosticQuestionCount(item.strand, item.active_level || item.starting_level)} questions answered`
          : item.active_level !== item.starting_level
            ? "follow-up test waiting"
            : "not started";
      return `${AC_STRANDS[item.strand].label}, ${item.active_level}, ${status}`;
    }).join(". ");
    const introText = `${checkpointLabel(pending.checkpoint)}. Welcome to your maths journey. You have completed ${completedCount} of 6 realms. Complete one realm at a time at school. Your work saves automatically, so you can safely continue during the next session your teacher opens. Up next is ${isFollowUp ? "a follow-up test in " : ""}${currentPresentation.realm}: ${AC_STRANDS[pending.strand].label}, ${level}, with ${linkedQuestions.length} questions. You can also go back to the Central Hub. ${journeyReadout}.`;

    return (
      <ReadAloudRateProvider>
        <main className="relative min-h-screen overflow-hidden bg-[#070d1a] px-4 py-6 text-white sm:px-6 sm:py-10">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-x-0 top-0 h-[46rem] bg-[url('/images/tower-plaza-bg.jpg')] bg-cover bg-[position:58%_18%]" />
            <div className="absolute inset-x-0 top-0 h-[46rem] bg-gradient-to-r from-[#070d1a]/95 via-[#070d1a]/55 to-[#070d1a]/5" />
            <div className="absolute inset-x-0 top-0 h-[46rem] bg-gradient-to-b from-[#070d1a]/10 via-[#070d1a]/35 to-[#070d1a]" />
            <div className="absolute -right-24 top-10 h-96 w-96 rounded-full bg-amber-200/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-6xl">
            <header className="grid gap-8 pt-2 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-2xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/30 bg-amber-200/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-amber-100 backdrop-blur">
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    {checkpointLabel(pending.checkpoint)}
                  </span>
                  <span className="text-sm font-bold text-slate-300">Tower of Knowledge · School assessment</span>
                </div>
                <h1 className="mt-5 text-4xl font-black tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] sm:text-6xl">Your maths journey</h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                  Take one realm at a time. There is no rush—your place is saved, ready for the next school session.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-sm font-bold text-slate-200 backdrop-blur">
                    <Save className="h-4 w-4 text-amber-200" aria-hidden="true" /> Saves automatically
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-sm font-bold text-slate-200 backdrop-blur">
                    <LockKeyhole className="h-4 w-4 text-amber-200" aria-hidden="true" /> School session protected
                  </span>
                  <ReadAloudBtn text={introText} label="Read page" />
                </div>
              </div>

              <div className="flex w-fit items-center gap-5 rounded-3xl border border-white/10 bg-slate-950/55 p-5 pr-7 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <div className="relative h-24 w-24 shrink-0">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden="true">
                    <defs>
                      <linearGradient id="journey-ring" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#fef3c7" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="9" />
                    {completedCount > 0 ? (
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke="url(#journey-ring)"
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringCircumference * (1 - completedCount / 6)}
                      />
                    ) : null}
                  </svg>
                  <p className="absolute inset-0 grid place-items-center text-2xl font-black">
                    <span>{completedCount}<span className="text-sm text-slate-400">/6</span></span>
                  </p>
                </div>
                <div aria-label={`${completedCount} of 6 realms complete`}>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-200">Realms complete</p>
                  <p className="mt-1 text-lg font-black">
                    {completedCount === 6 ? "All realms done" : `${6 - completedCount} to go`}
                  </p>
                  <p className="text-sm font-semibold text-slate-400">{Math.round((completedCount / 6) * 100)}% of your journey</p>
                </div>
              </div>
            </header>

            <section className={`mt-9 overflow-hidden rounded-[2rem] border ${currentPresentation.card} shadow-2xl shadow-black/40`} aria-labelledby="next-realm-title">
              <div className="grid bg-slate-950/75 backdrop-blur-xl md:grid-cols-[minmax(16rem,22rem)_1fr]">
                <div className="relative h-52 md:h-auto md:min-h-80">
                  <img src={currentPresentation.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-slate-950/80" aria-hidden="true" />
                  <div className={`absolute left-4 top-4 grid h-12 w-12 place-items-center rounded-2xl shadow-lg ${currentPresentation.iconBox}`}>
                    <CurrentIcon className="h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-6 p-6 sm:p-8 lg:p-10">
                  <div>
                    <p className={`text-xs font-black uppercase tracking-[0.2em] ${currentPresentation.accent}`}>
                      {currentAnswered ? "Pick up where you left off" : isFollowUp ? "Follow-up test" : "Up next"}
                    </p>
                    <h2 id="next-realm-title" className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">{currentPresentation.realm}</h2>
                    <p className="mt-2 text-lg font-semibold text-slate-300">{AC_STRANDS[pending.strand].label} · {level}</p>
                  </div>

                  <dl className="grid max-w-md grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04]">
                    <div className="px-4 py-3">
                      <dt className="text-xs font-bold text-slate-400">Questions</dt>
                      <dd className="mt-0.5 text-2xl font-black">{linkedQuestions.length}</dd>
                    </div>
                    <div className="px-4 py-3">
                      <dt className="text-xs font-bold text-slate-400">Answered</dt>
                      <dd className="mt-0.5 text-2xl font-black">{currentAnswered}</dd>
                    </div>
                    <div className="px-4 py-3">
                      <dt className="text-xs font-bold text-slate-400">Realm</dt>
                      <dd className="mt-0.5 text-2xl font-black">{currentStep}<span className="text-base text-slate-500"> of 6</span></dd>
                    </div>
                  </dl>

                  {currentAnswered > 0 ? (
                    <div className="h-2 max-w-md overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                      <div className={`h-full rounded-full ${currentPresentation.progress}`} style={{ width: `${Math.min(100, (currentAnswered / linkedQuestions.length) * 100)}%` }} />
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setHasBegunStrand(true)}
                    className={`group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl px-7 py-3 text-lg font-black text-slate-950 shadow-lg shadow-black/30 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 sm:w-fit ${currentPresentation.button}`}
                  >
                    {currentAnswered ? "Continue" : "Begin"} {AC_STRANDS[pending.strand].label}
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </section>

            <section className="mt-12" aria-labelledby="realm-journey-title">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-200">Six maths realms</p>
                  <h2 id="realm-journey-title" className="mt-1 text-2xl font-black sm:text-3xl">Your assessment path</h2>
                </div>
                <p className="hidden text-sm font-semibold text-slate-400 sm:block">Complete at your own pace</p>
              </div>
              <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-6">
                {journey.map((item, position) => {
                  const presentation = STRAND_PRESENTATION[item.strand];
                  const StrandIcon = presentation.icon;
                  const isCurrent = item.strand === pending.strand;
                  const isComplete = item.status === "completed";
                  const isUnavailable = item.status === "unavailable";
                  const isStarted = item.answered_count > 0;
                  const hasFollowUp = !isComplete && item.active_level !== item.starting_level;
                  const statusText = isComplete
                    ? "Complete"
                    : isUnavailable
                      ? "Unavailable"
                      : isStarted
                        ? `${item.answered_count} / ${diagnosticQuestionCount(item.strand, item.active_level || item.starting_level)} answered`
                        : hasFollowUp
                          ? "Follow-up waiting"
                          : isCurrent
                          ? "Ready to begin"
                          : "Not started";
                  return (
                    <li
                      key={item.strand}
                      className={`relative overflow-hidden rounded-3xl border bg-slate-950 shadow-xl shadow-black/30 ${
                        isCurrent
                          ? `border-transparent ring-2 ${presentation.ring} ring-offset-4 ring-offset-[#070d1a]`
                          : isComplete
                            ? "border-emerald-300/40"
                            : "border-white/10"
                      }`}
                    >
                      <div className="relative aspect-[4/5]">
                        <img
                          src={presentation.poster}
                          alt=""
                          className={`absolute inset-0 h-full w-full object-cover ${isComplete || isCurrent || isStarted || hasFollowUp ? "" : "opacity-40 saturate-[0.35]"}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/0" aria-hidden="true" />

                        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
                          <span className="rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-black text-slate-200 backdrop-blur">
                            {String(position + 1).padStart(2, "0")}
                          </span>
                          {isComplete ? (
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-300 text-emerald-950 shadow-lg" aria-hidden="true">
                              <Check className="h-5 w-5" strokeWidth={3} />
                            </span>
                          ) : isCurrent ? (
                            <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-slate-950 ${presentation.iconBox}`}>
                              Up next
                            </span>
                          ) : null}
                        </div>

                        <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
                          <span className={`grid h-7 w-7 place-items-center rounded-lg ${presentation.iconBox}`}>
                            <StrandIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <p className={`mt-2 text-[0.68rem] font-black uppercase leading-tight tracking-[0.1em] ${presentation.accent}`}>{presentation.realm}</p>
                          <h3 className="mt-2 text-lg font-black leading-tight">{AC_STRANDS[item.strand].label}</h3>
                          <p className="mt-1 text-xs font-semibold text-slate-400">{item.active_level}</p>
                          <p className={`mt-1 text-sm font-black ${isComplete ? "text-emerald-300" : isCurrent ? "text-white" : "text-slate-400"}`}>{statusText}</p>
                          {isStarted && !isComplete ? (
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                              <div className={`h-full rounded-full ${presentation.progress}`} style={{ width: `${Math.min(100, (item.answered_count / diagnosticQuestionCount(item.strand, item.active_level || item.starting_level)) * 100)}%` }} />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            <div className="mt-10 flex justify-center">
              <button type="button" onClick={leaveToCentralHub} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-bold text-slate-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-200">
                <DoorOpen className="h-5 w-5" aria-hidden="true" />
                Go to Central Hub
              </button>
            </div>
          </div>
        </main>
      </ReadAloudRateProvider>
    );
  }
  if (linkedQuestions.length === 0 || !current) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-white"><div><h1 className="text-2xl font-black">This strand test is not ready</h1><p className="mt-2 text-slate-300">No level-test bank exists for {AC_STRANDS[pending.strand].label} at {level}. Nothing has been scored or placed.</p></div></main>;
  }

  const testPresentation = STRAND_PRESENTATION[pending.strand];
  const TestStrandIcon = testPresentation.icon;
  const currentAnswer = answers[current.question.id] ?? null;
  const isUnknownAnswer = currentAnswer === UNKNOWN_ANSWER;
  const visibleAnswer = isUnknownAnswer ? null : currentAnswer;
  const progressPercent = Math.round(((index + 1) / linkedQuestions.length) * 100);

  return (
    <ReadAloudRateProvider>
      <main className="relative min-h-screen overflow-hidden bg-[#06131f] px-4 py-5 text-white sm:px-6 sm:py-7">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute -right-36 bottom-0 h-[28rem] w-[28rem] rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-teal-950/75 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <header className={`mb-5 overflow-hidden rounded-[2rem] border ${testPresentation.card} shadow-xl`}>
            <div className="grid gap-5 bg-slate-950/55 p-5 backdrop-blur-xl sm:p-6 lg:grid-cols-[1fr_minmax(18rem,24rem)] lg:items-center">
              <div className="flex items-center gap-4">
                <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl shadow-lg ${testPresentation.iconBox}`}>
                  <TestStrandIcon className="h-7 w-7" aria-hidden="true" />
                </div>
                <div>
                  <p className={`text-xs font-black uppercase tracking-[0.18em] ${testPresentation.accent}`}>{checkpointLabel(pending.checkpoint)} · {testPresentation.realm}</p>
                  <h1 className="mt-1 text-2xl font-black sm:text-3xl">{AC_STRANDS[pending.strand].label} <span className="text-slate-500">·</span> {level}</h1>
                  <p className="mt-1 text-sm font-semibold text-slate-400">Your answers save as you go</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-black text-slate-200">Question {index + 1} <span className="text-slate-500">of {linkedQuestions.length}</span></p>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void exitDiagnostic()}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-black text-white transition hover:border-white/25 hover:bg-white/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-teal-200 disabled:opacity-50"
                  >
                    <DoorOpen className="h-4 w-4" aria-hidden="true" />
                    {saving ? "Saving…" : "Save & exit"}
                  </button>
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Diagnostic progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}>
                  <div className={`h-full rounded-full transition-all duration-500 ${testPresentation.progress}`} style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="mt-2 text-right text-xs font-bold text-slate-500">{progressPercent}% through this realm</p>
              </div>
            </div>
            <div className="px-5 pb-5 sm:px-6">
              <AssessmentQuestionNavigator
                answeredFlags={linkedQuestions.map(({question})=>isAnswered(question))}
                currentIndex={index} onJump={next => void moveToQuestion(next)}
                realmId={testPresentation.assessmentRealmId} disabled={saving}/>
            </div>
          </header>

          <section className="overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900/90 shadow-2xl shadow-black/35 backdrop-blur-xl">
            <div className="border-b border-white/10 bg-white/[0.025] px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex items-center justify-between gap-4">
                <span className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] ${testPresentation.accent}`}>
                  <span className={`h-2 w-2 rounded-full ${testPresentation.progress}`} aria-hidden="true" />
                  Question {String(index + 1).padStart(2, "0")}
                </span>
                <ReadAloudBtn text={assessmentSpokenPrompt(current.question)} label="Read question" />
              </div>
              <h2 className="mt-4 max-w-4xl text-2xl font-black leading-tight tracking-tight sm:text-3xl">{current.question.prompt}</h2>
            </div>

            <div className="p-4 sm:p-7">
              <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-3 sm:p-5">
                <AssessmentQuestionCard
                  key={current.question.id}
                  question={current.question}
                  value={visibleAnswer}
                  onChange={(value) => { void recordAnswer(value); }}
                  realmId={testPresentation.assessmentRealmId}
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
                  disabled={index === 0 || saving}
                  onClick={() => void moveToQuestion(index - 1)}
                  className="inline-flex min-h-12 w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-black text-slate-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-300 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" /> Back
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void recordAnswer(UNKNOWN_ANSWER)}
                  className={`col-span-2 row-start-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-300 disabled:opacity-40 sm:col-span-1 sm:col-start-2 sm:row-start-1 ${isUnknownAnswer ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                >
                  <CircleHelp className="h-5 w-5" aria-hidden="true" /> I don&apos;t know
                </button>
                {index < linkedQuestions.length - 1 ? (
                  <button
                    type="button"
                    disabled={!isAnswered(current.question) || saving}
                    onClick={() => void moveToQuestion(index + 1)}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 justify-self-end rounded-xl px-6 py-3 font-black text-slate-950 shadow-lg transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-35 ${testPresentation.button}`}
                  >
                    Next <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={answeredCount !== linkedQuestions.length || saving}
                    onClick={() => void finishLevel()}
                    className={`inline-flex min-h-12 items-center justify-center gap-2 justify-self-end rounded-xl px-6 py-3 font-black text-slate-950 shadow-lg transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-35 ${testPresentation.button}`}
                  >
                    {saving ? "Saving…" : "Finish this level"} <Check className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </div>
              {error ? <p className="mt-4 rounded-xl border border-red-400/40 bg-red-950/50 p-3 text-sm font-semibold text-red-100" role="alert">{error}</p> : null}
            </div>
          </section>
        </div>
      </main>
    </ReadAloudRateProvider>
  );
}
