"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Compass,
  Dices,
  DoorOpen,
  Hash,
  LockKeyhole,
  Ruler,
  Save,
  Sparkles,
  Triangle,
  type LucideIcon,
} from "lucide-react";
import AssessmentQuestionCard from "@/components/assessment/AssessmentQuestionCard";
import ReadAloudBtn, { ReadAloudRateProvider } from "@/components/ReadAloudBtn";
import { isAssessmentAnswerCorrect } from "@/data/assessments/analysis";
import { AC_STRANDS, type AcStrand } from "@/lib/curriculum/ac-standards";
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
  diagnosticLevelLabel,
  diagnosticLevelNumber,
  type DiagnosticProbeScore,
} from "@/lib/whole-maths-diagnostic";
import { getDiagnosticQuestions } from "@/lib/whole-maths-diagnostic-questions";
import { pauseDiagnosticHandoff } from "@/lib/diagnostic-handoff";

const UNKNOWN_ANSWER = "__i_dont_know__";

function checkpointLabel(checkpoint: PendingStudentDiagnostic["checkpoint"]) {
  if (checkpoint === "ad_hoc") return "Teacher check-in";
  return `${checkpoint[0]!.toUpperCase()}${checkpoint.slice(1)} diagnostic`;
}

const STRAND_PRESENTATION: Record<AcStrand, {
  realm: string;
  icon: LucideIcon;
  card: string;
  iconBox: string;
  accent: string;
  progress: string;
  button: string;
  assessmentRealmId: string;
}> = {
  number: {
    realm: "Number Nexus",
    icon: Hash,
    card: "border-cyan-300/40 bg-gradient-to-br from-cyan-400/15 to-teal-500/5",
    iconBox: "bg-cyan-300 text-cyan-950",
    accent: "text-cyan-300",
    progress: "bg-gradient-to-r from-cyan-300 to-teal-300",
    button: "bg-cyan-300 hover:bg-cyan-200 focus-visible:outline-cyan-200",
    assessmentRealmId: "number",
  },
  measurement: {
    realm: "Measurelands",
    icon: Ruler,
    card: "border-amber-300/40 bg-gradient-to-br from-amber-400/15 to-orange-500/5",
    iconBox: "bg-amber-300 text-amber-950",
    accent: "text-amber-300",
    progress: "bg-gradient-to-r from-amber-300 to-orange-300",
    button: "bg-amber-300 hover:bg-amber-200 focus-visible:outline-amber-200",
    assessmentRealmId: "measurement",
  },
  space: {
    realm: "Starpath",
    icon: Compass,
    card: "border-blue-300/40 bg-gradient-to-br from-blue-400/15 to-indigo-500/5",
    iconBox: "bg-blue-300 text-blue-950",
    accent: "text-blue-300",
    progress: "bg-gradient-to-r from-blue-300 to-indigo-300",
    button: "bg-blue-300 hover:bg-blue-200 focus-visible:outline-blue-200",
    assessmentRealmId: "space",
  },
  statistics: {
    realm: "Statistica",
    icon: BarChart3,
    card: "border-rose-300/40 bg-gradient-to-br from-rose-400/15 to-pink-500/5",
    iconBox: "bg-rose-300 text-rose-950",
    accent: "text-rose-300",
    progress: "bg-gradient-to-r from-rose-300 to-pink-300",
    button: "bg-rose-300 hover:bg-rose-200 focus-visible:outline-rose-200",
    assessmentRealmId: "statistics",
  },
  algebra: {
    realm: "Pattern Peaks",
    icon: Triangle,
    card: "border-violet-300/40 bg-gradient-to-br from-violet-400/15 to-purple-500/5",
    iconBox: "bg-violet-300 text-violet-950",
    accent: "text-violet-300",
    progress: "bg-gradient-to-r from-violet-300 to-purple-300",
    button: "bg-violet-300 hover:bg-violet-200 focus-visible:outline-violet-200",
    assessmentRealmId: "pattern",
  },
  probability: {
    realm: "Chance Hollow",
    icon: Dices,
    card: "border-fuchsia-300/40 bg-gradient-to-br from-fuchsia-400/15 to-purple-500/5",
    iconBox: "bg-fuchsia-300 text-fuchsia-950",
    accent: "text-fuchsia-300",
    progress: "bg-gradient-to-r from-fuchsia-300 to-pink-300",
    button: "bg-fuchsia-300 hover:bg-fuchsia-200 focus-visible:outline-fuchsia-200",
    assessmentRealmId: "chance",
  },
};

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
      setHasBegunStrand(
        (next.draft_index ?? 0) > 0 ||
        Object.keys(next.draft_answers ?? {}).length > 0 ||
        (next.draft_probes ?? []).length > 0,
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
    () => pending ? getDiagnosticQuestions(pending.strand, level, pending.sitting_id, pending.checkpoint) : [],
    [level, pending],
  );
  const current = linkedQuestions[index];
  const answeredCount = linkedQuestions.filter(({ question }) => answers[question.id] != null).length;

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
      pauseDiagnosticHandoff(pending.sitting_id);
      router.push("/world");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Your place could not be saved. Please try again before leaving.");
      setSaving(false);
    }
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
    const decision = decideDiagnosticPlacement(pending.starting_level, nextProbes);
    const minimumLevel = pending.strand === "algebra" || pending.strand === "probability" ? 3 : 1;
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
        setProbes(nextProbes);
        setLevel(nextLevel);
        setAnswers({});
        setIndex(0);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Your next diagnostic level could not be saved.");
      } finally {
        setSaving(false);
      }
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
      setProbes([]);
      setAnswers({});
      setIndex(0);
      if (next) window.scrollTo({ top: 0, behavior: "smooth" });
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
    const currentPresentation = STRAND_PRESENTATION[pending.strand];
    const CurrentIcon = currentPresentation.icon;
    const journeyReadout = journey.map((item) => {
      const status = item.status === "completed"
        ? "complete"
        : item.answered_count > 0
          ? `${item.answered_count} of 20 questions answered`
          : "not started";
      return `${AC_STRANDS[item.strand].label}, ${item.active_level}, ${status}`;
    }).join(". ");
    const introText = `${checkpointLabel(pending.checkpoint)}. Welcome to your maths journey. You have completed ${completedCount} of 6 realms. Complete one realm at a time at school. Your work saves automatically, so you can safely continue during the next session your teacher opens. Up next is ${currentPresentation.realm}: ${AC_STRANDS[pending.strand].label}, ${level}, with 20 questions. ${journeyReadout}.`;

    return (
      <ReadAloudRateProvider>
        <main className="relative min-h-screen overflow-hidden bg-[#06131f] px-4 py-6 text-white sm:px-6 sm:py-9">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-28 top-20 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-teal-950/70 to-transparent" />
          </div>

          <div className="relative mx-auto max-w-6xl">
            <header className="overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900/80 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-teal-200">
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                      {checkpointLabel(pending.checkpoint)}
                    </span>
                    <span className="text-sm font-bold text-slate-400">School assessment</span>
                  </div>
                  <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl">Your maths journey</h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                    Take one realm at a time. There is no rush—your place is saved, ready for the next school session.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/7 px-3 py-2 text-sm font-bold text-slate-200">
                      <Save className="h-4 w-4 text-teal-300" aria-hidden="true" /> Saves automatically
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/7 px-3 py-2 text-sm font-bold text-slate-200">
                      <LockKeyhole className="h-4 w-4 text-teal-300" aria-hidden="true" /> School session protected
                    </span>
                    <ReadAloudBtn text={introText} label="Read page" />
                  </div>
                </div>

                <div className="min-w-52 rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-end justify-between gap-6">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Journey progress</p>
                      <p className="mt-1 text-3xl font-black">{completedCount}<span className="text-lg text-slate-400"> / 6</span></p>
                    </div>
                    <span className="text-sm font-bold text-teal-300">{Math.round((completedCount / 6) * 100)}%</span>
                  </div>
                  <div className="mt-4 grid grid-cols-6 gap-1.5" aria-label={`${completedCount} of 6 realms complete`}>
                    {Array.from({ length: 6 }, (_, position) => (
                      <span key={position} className={`h-2 rounded-full ${position < completedCount ? "bg-teal-300" : "bg-white/15"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </header>

            <section className={`mt-5 overflow-hidden rounded-[2rem] border ${currentPresentation.card} p-1 shadow-xl`} aria-labelledby="next-realm-title">
              <div className="grid gap-5 rounded-[1.7rem] bg-slate-950/55 p-5 backdrop-blur sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="flex items-center gap-4">
                  <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl shadow-lg ${currentPresentation.iconBox}`}>
                    <CurrentIcon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-[0.18em] ${currentPresentation.accent}`}>Up next</p>
                    <h2 id="next-realm-title" className="mt-1 text-2xl font-black sm:text-3xl">{currentPresentation.realm}</h2>
                    <p className="mt-1 text-slate-300">{AC_STRANDS[pending.strand].label} · {level} · 20 questions</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHasBegunStrand(true)}
                  className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-teal-300 px-6 py-3 text-lg font-black text-slate-950 shadow-lg shadow-teal-950/30 transition hover:bg-teal-200 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-teal-200"
                >
                  {currentJourney?.answered_count ? "Continue" : "Begin"} {AC_STRANDS[pending.strand].label}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </button>
              </div>
            </section>

            <section className="mt-7" aria-labelledby="realm-journey-title">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">Six maths realms</p>
                  <h2 id="realm-journey-title" className="mt-1 text-2xl font-black">Your assessment path</h2>
                </div>
                <p className="hidden text-sm font-semibold text-slate-400 sm:block">Complete at your own pace</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {journey.map((item, position) => {
                  const presentation = STRAND_PRESENTATION[item.strand];
                  const StrandIcon = presentation.icon;
                  const isCurrent = item.strand === pending.strand;
                  const isComplete = item.status === "completed";
                  const isStarted = item.answered_count > 0;
                  const statusText = isComplete ? "Complete" : isStarted ? `${item.answered_count} / 20 answered` : "Not started";
                  return (
                    <article
                      key={item.strand}
                      className={`relative min-h-44 overflow-hidden rounded-3xl border p-5 transition ${presentation.card} ${isCurrent ? "ring-2 ring-teal-300 ring-offset-2 ring-offset-[#06131f]" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className={`grid h-11 w-11 place-items-center rounded-xl ${presentation.iconBox}`}>
                          <StrandIcon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        {isComplete ? (
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-300 text-emerald-950" aria-label="Complete">
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : (
                          <span className="text-xs font-black text-slate-500">{String(position + 1).padStart(2, "0")}</span>
                        )}
                      </div>
                      <p className={`mt-4 text-xs font-black uppercase tracking-[0.14em] ${presentation.accent}`}>{presentation.realm}</p>
                      <h3 className="mt-1 text-xl font-black">{AC_STRANDS[item.strand].label}</h3>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-slate-300">{item.active_level}</span>
                        <span className={`font-black ${isComplete ? "text-emerald-300" : isCurrent ? "text-teal-200" : "text-slate-400"}`}>{statusText}</span>
                      </div>
                      {isStarted && !isComplete ? (
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10" aria-label={`${item.answered_count} of 20 questions answered`}>
                          <div className="h-full rounded-full bg-teal-300" style={{ width: `${Math.min(100, (item.answered_count / 20) * 100)}%` }} />
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>

            <div className="mt-7 flex justify-center">
              <button type="button" onClick={() => router.push("/world")} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-bold text-slate-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-teal-200">
                <DoorOpen className="h-5 w-5" aria-hidden="true" />
                Return to world
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
          </header>

          <section className="overflow-hidden rounded-[2rem] border border-white/15 bg-slate-900/90 shadow-2xl shadow-black/35 backdrop-blur-xl">
            <div className="border-b border-white/10 bg-white/[0.025] px-5 py-5 sm:px-8 sm:py-6">
              <div className="flex items-center justify-between gap-4">
                <span className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] ${testPresentation.accent}`}>
                  <span className={`h-2 w-2 rounded-full ${testPresentation.progress}`} aria-hidden="true" />
                  Question {String(index + 1).padStart(2, "0")}
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
                    disabled={currentAnswer == null || saving}
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
