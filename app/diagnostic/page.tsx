"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AssessmentQuestionCard from "@/components/assessment/AssessmentQuestionCard";
import ReadAloudBtn, { ReadAloudRateProvider } from "@/components/ReadAloudBtn";
import { isAssessmentAnswerCorrect } from "@/data/assessments/analysis";
import { AC_STRANDS } from "@/lib/curriculum/ac-standards";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import {
  completeDiagnosticStrand,
  fetchPendingStudentDiagnostic,
  type PendingStudentDiagnostic,
} from "@/lib/whole-maths-diagnostic-client";
import {
  decideDiagnosticPlacement,
  diagnosticLevelLabel,
  diagnosticLevelNumber,
  type DiagnosticProbeScore,
} from "@/lib/whole-maths-diagnostic";
import { getDiagnosticQuestions } from "@/lib/whole-maths-diagnostic-questions";

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
  const profile = useMemo(() => getActiveStudentProfile(), []);

  const loadPending = useCallback(async () => {
    if (!profile?.studentId) {
      router.replace("/login?error=session_missing");
      return null;
    }
    const next = await fetchPendingStudentDiagnostic(profile.studentId);
    setPending(next);
    if (next) setLevel(next.starting_level);
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
    () => pending ? getDiagnosticQuestions(pending.strand, level, pending.sitting_id) : [],
    [level, pending],
  );
  const current = linkedQuestions[index];
  const answeredCount = linkedQuestions.filter(({ question }) => answers[question.id] != null).length;

  function recordAnswer(value: string) {
    if (!current) return;
    setAnswers((previous) => ({ ...previous, [current.question.id]: value }));
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
    if (decision.shouldProbeNext) {
      setProbes(nextProbes);
      setLevel(diagnosticLevelLabel(diagnosticLevelNumber(level) + 1));
      setAnswers({});
      setIndex(0);
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
    return <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-white"><div><h1 className="text-3xl font-black">Diagnostic section complete</h1><p className="mt-2 text-slate-300">Your saved results are ready for your teacher.</p><button type="button" onClick={() => router.push("/world")} className="mt-5 rounded-xl bg-teal-400 px-5 py-3 font-black text-slate-950">Return to my world</button></div></main>;
  }
  if (linkedQuestions.length === 0 || !current) {
    return <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-center text-white"><div><h1 className="text-2xl font-black">This strand test is not ready</h1><p className="mt-2 text-slate-300">No level-test bank exists for {AC_STRANDS[pending.strand].label} at {level}. Nothing has been scored or placed.</p></div></main>;
  }

  return (
    <ReadAloudRateProvider>
      <main className="min-h-screen bg-gradient-to-b from-slate-950 to-[#0A2F2A] px-5 py-8 text-white">
        <div className="mx-auto max-w-4xl">
          <header className="mb-6 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">{checkpointLabel(pending.checkpoint)}</p>
                <h1 className="mt-2 text-3xl font-black">{AC_STRANDS[pending.strand].label} · {level}</h1>
                <p className="mt-1 text-sm text-slate-300">Question {index + 1} of {linkedQuestions.length}</p>
              </div>
              <div className="min-w-40"><div className="h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-teal-400" style={{ width: `${((index + 1) / linkedQuestions.length) * 100}%` }} /></div></div>
            </div>
          </header>

          <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-xl font-black leading-7">{current.question.prompt}</h2>
              <ReadAloudBtn text={current.question.prompt} />
            </div>
            <AssessmentQuestionCard
              key={current.question.id}
              question={current.question}
              value={answers[current.question.id] ?? null}
              onChange={recordAnswer}
              realmId={pending.strand}
            />
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-700 pt-5">
              <button type="button" disabled={index === 0 || saving} onClick={() => setIndex((value) => Math.max(0, value - 1))} className="rounded-xl border border-slate-600 px-5 py-3 font-bold disabled:opacity-40">Back</button>
              <button type="button" onClick={() => recordAnswer("__i_dont_know__")} className="text-sm font-bold text-slate-300 underline decoration-slate-500 underline-offset-4">I don&apos;t know</button>
              {index < linkedQuestions.length - 1 ? (
                <button type="button" disabled={answers[current.question.id] == null || saving} onClick={() => setIndex((value) => value + 1)} className="rounded-xl bg-teal-400 px-6 py-3 font-black text-slate-950 disabled:opacity-40">Next</button>
              ) : (
                <button type="button" disabled={answeredCount !== linkedQuestions.length || saving} onClick={() => void finishLevel()} className="rounded-xl bg-teal-400 px-6 py-3 font-black text-slate-950 disabled:opacity-40">{saving ? "Saving…" : "Finish this level"}</button>
              )}
            </div>
            {error ? <p className="mt-4 rounded-xl border border-red-400/40 bg-red-950/50 p-3 text-sm font-semibold text-red-100" role="alert">{error}</p> : null}
          </section>
        </div>
      </main>
    </ReadAloudRateProvider>
  );
}
