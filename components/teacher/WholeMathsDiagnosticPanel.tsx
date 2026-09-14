"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Info, ListChecks, TrendingUp, X } from "lucide-react";
import { AC_STRANDS } from "@/lib/curriculum/ac-standards";
import {
  DIAGNOSTIC_FLOOR,
  DIAGNOSTIC_MASTERY,
  DIAGNOSTIC_STRANDS,
  WHOLE_MATHS_WEIGHT_TOTAL,
  computeWholeMathsLevel,
} from "@/lib/whole-maths-diagnostic";
import {
  fetchTeacherDiagnostics,
  fetchTeacherLiveMathsProgression,
  assignWholeMathsDiagnostic,
  closeDiagnosticSchoolSession,
  fetchDiagnosticSchoolSession,
  openDiagnosticSchoolSession,
  type DiagnosticSchoolSession,
  type LiveMathsProgressionRow,
  type TeacherDiagnosticSittingRow,
} from "@/lib/whole-maths-diagnostic-client";
import { formatProgressionPoint } from "@/lib/live-maths-progression";

type DiagnosticStudent = { id: string; display_name: string };
type TrackerTab = "all" | LiveMathsProgressionRow["strand"];
type DiagnosticView = "live" | "run";
type FormalCheckpoint = Exclude<TeacherDiagnosticSittingRow["checkpoint"], "ad_hoc">;
type DiagnosticPoint = { sittingId: string; checkpoint: FormalCheckpoint; level: number; completedAt: string };

const CHECKPOINT_LABEL = {
  start: "Start-of-year diagnostic",
  mid: "Mid-year diagnostic",
  end: "End-of-year diagnostic",
  ad_hoc: "Ad hoc",
} as const;

const CHECKPOINT_SHORT: Record<FormalCheckpoint, string> = {
  start: "S",
  mid: "M",
  end: "E",
};

const TRACK_LEVELS = ["Prep", "1", "2", "3", "4", "5", "6"] as const;

function levelPosition(level: number) {
  return `${(Math.max(0, Math.min(6, level)) / 6) * 100}%`;
}

function ProgressionTrack({
  liveLevel,
  diagnosticPoints,
  onSelectDiagnostic,
}: {
  liveLevel: number | null;
  diagnosticPoints: DiagnosticPoint[];
  onSelectDiagnostic: (sittingId: string) => void;
}) {
  const latestDiagnostic = diagnosticPoints.at(-1)?.level ?? null;
  return (
    <div className="min-w-[520px]">
      <div className="relative ml-[76px] h-4 text-[10px] font-black uppercase tracking-wide text-slate-400" aria-hidden>
        {TRACK_LEVELS.map((level, index) => (
          <span key={level} className="absolute -translate-x-1/2" style={{ left: levelPosition(index) }}>{level}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-[68px_1fr] items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-wide text-teal-700">Live</span>
        <div className="relative h-5">
          <div className="absolute inset-x-0 top-2 h-1 rounded-full bg-slate-100" />
          {liveLevel != null && <>
            <div className="absolute left-0 top-2 h-1 rounded-full bg-teal-500" style={{ width: levelPosition(liveLevel) }} />
            <span className="absolute top-0 h-5 w-5 -translate-x-1/2 rounded-full border-[3px] border-white bg-teal-600 shadow" style={{ left: levelPosition(liveLevel) }} aria-label={`Current live level ${formatProgressionPoint(liveLevel)}`} />
          </>}
        </div>
      </div>
      <div className="mt-2 grid grid-cols-[68px_1fr] items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-wide text-violet-700">Diagnostic</span>
        <div className="relative h-7">
          <div className="absolute inset-x-0 top-3 h-1 rounded-full bg-slate-100" />
          {latestDiagnostic != null && <div className="absolute left-0 top-3 h-1 rounded-full bg-violet-400" style={{ width: levelPosition(latestDiagnostic) }} />}
          {diagnosticPoints.map((point) => (
            <button
              key={`${point.checkpoint}-${point.completedAt}`}
              type="button"
              onClick={() => onSelectDiagnostic(point.sittingId)}
              className="absolute top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-violet-600 text-[10px] font-black text-white shadow"
              style={{ left: levelPosition(point.level) }}
              title={`${CHECKPOINT_LABEL[point.checkpoint]}: ${formatProgressionPoint(point.level)}. Open details.`}
              aria-label={`Open ${CHECKPOINT_LABEL[point.checkpoint]} result at level ${formatProgressionPoint(point.level)}`}
            >
              {CHECKPOINT_SHORT[point.checkpoint]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function WholeMathsDiagnosticPanel({
  selectedClass,
  students,
}: {
  selectedClass: { id: string; name: string } | null;
  students: DiagnosticStudent[];
}) {
  const [sittings, setSittings] = useState<TeacherDiagnosticSittingRow[]>([]);
  const [progression, setProgression] = useState<LiveMathsProgressionRow[]>([]);
  const [view, setView] = useState<DiagnosticView>("live");
  const [selectedStrand, setSelectedStrand] = useState<TrackerTab>("all");
  const [liveLoading, setLiveLoading] = useState(true);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(true);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [assignmentCheckpoint, setAssignmentCheckpoint] = useState<FormalCheckpoint>("end");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [assignmentBusy, setAssignmentBusy] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState<string | null>(null);
  const [schoolSession, setSchoolSession] = useState<DiagnosticSchoolSession | null>(null);
  const [sessionBusy, setSessionBusy] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [scoringOpen, setScoringOpen] = useState(false);
  const [selectedSittingId, setSelectedSittingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadLive(showLoading: boolean) {
      if (!selectedClass?.id) {
        setProgression([]);
        setLiveLoading(false);
        return;
      }
      if (showLoading) setLiveLoading(true);
      try {
        const rows = await fetchTeacherLiveMathsProgression(selectedClass.id);
        if (!cancelled) {
          setProgression(rows);
          setLiveError(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("[WholeMathsDiagnostic] Could not load live progression", error);
          setProgression([]);
          setLiveError("Live progression could not be loaded. Try again shortly.");
        }
      } finally {
        if (!cancelled) setLiveLoading(false);
      }
    }
    void loadLive(true);
    const intervalId = window.setInterval(() => { void loadLive(false); }, 30_000);
    return () => { cancelled = true; window.clearInterval(intervalId); };
  }, [selectedClass?.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadDiagnostic(showLoading: boolean) {
      if (!selectedClass?.id) {
        setSittings([]);
        setSchoolSession(null);
        setDiagnosticLoading(false);
        return;
      }
      if (showLoading) setDiagnosticLoading(true);
      const [recordsResult, sessionResult] = await Promise.allSettled([
        fetchTeacherDiagnostics(selectedClass.id),
        fetchDiagnosticSchoolSession(selectedClass.id),
      ]);
      if (cancelled) return;
      if (recordsResult.status === "fulfilled") {
        setSittings(recordsResult.value);
        setDiagnosticError(null);
      } else {
        console.warn("[WholeMathsDiagnostic] Could not load diagnostic records", recordsResult.reason);
        setSittings([]);
        setDiagnosticError("Diagnostic results could not be loaded. Live progression is unaffected.");
      }
      if (sessionResult.status === "fulfilled") {
        setSchoolSession(sessionResult.value);
        setSessionError(null);
      } else {
        console.warn("[WholeMathsDiagnostic] Could not load supervised session", sessionResult.reason);
        setSchoolSession(null);
        setSessionError("The supervised-session control is unavailable until the diagnostic database update is deployed.");
      }
      setDiagnosticLoading(false);
    }
    void loadDiagnostic(true);
    const intervalId = window.setInterval(() => { void loadDiagnostic(false); }, 30_000);
    return () => { cancelled = true; window.clearInterval(intervalId); };
  }, [selectedClass?.id]);

  const studentNames = useMemo(
    () => new Map(students.map((student) => [student.id, student.display_name])),
    [students],
  );
  const progressionByStudent = useMemo(() => {
    const grouped = new Map<string, LiveMathsProgressionRow[]>();
    for (const row of progression) {
      const rows = grouped.get(row.student_id) ?? [];
      rows.push(row);
      grouped.set(row.student_id, rows);
    }
    return grouped;
  }, [progression]);

  const diagnosticPointsByStudent = useMemo(() => {
    const grouped = new Map<string, Map<FormalCheckpoint, DiagnosticPoint>>();
    for (const sitting of [...sittings].sort((left, right) => left.created_at.localeCompare(right.created_at))) {
      if (sitting.checkpoint === "ad_hoc" || sitting.status !== "completed") continue;
      const level = selectedStrand === "all"
        ? sitting.overall_level
        : sitting.strand_results.find((result) => result.strand === selectedStrand && result.status === "completed")?.measured_level;
      if (level == null) continue;
      const checkpoints = grouped.get(sitting.student_id) ?? new Map<FormalCheckpoint, DiagnosticPoint>();
      checkpoints.set(sitting.checkpoint, {
        sittingId: sitting.id,
        checkpoint: sitting.checkpoint,
        level,
        completedAt: sitting.completed_at ?? sitting.created_at,
      });
      grouped.set(sitting.student_id, checkpoints);
    }
    return new Map([...grouped].map(([studentId, checkpoints]) => [studentId, [...checkpoints.values()].sort((left, right) => left.completedAt.localeCompare(right.completedAt))]));
  }, [selectedStrand, sittings]);

  const activeStudentIds = useMemo(
    () => new Set(sittings.filter((sitting) => sitting.status !== "completed").map((sitting) => sitting.student_id)),
    [sittings],
  );
  const assignableStudents = students.filter((student) => !activeStudentIds.has(student.id));
  const selectedSitting = selectedSittingId
    ? sittings.find((sitting) => sitting.id === selectedSittingId) ?? null
    : null;

  function openAssignment() {
    setSelectedStudentIds(assignableStudents.map((student) => student.id));
    setAssignmentMessage(null);
    setAssignmentOpen(true);
  }

  async function assignDiagnostics() {
    if (!selectedClass?.id || selectedStudentIds.length === 0) return;
    setAssignmentBusy(true);
    setAssignmentMessage(null);
    const outcomes = await Promise.allSettled(selectedStudentIds.map((studentId) =>
      assignWholeMathsDiagnostic(
        studentId,
        assignmentCheckpoint,
        DIAGNOSTIC_STRANDS.map((definition) => definition.strand),
      ),
    ));
    const assigned = outcomes.filter((outcome) => outcome.status === "fulfilled").length;
    const failed = outcomes.length - assigned;
    try {
      setSittings(await fetchTeacherDiagnostics(selectedClass.id));
      setDiagnosticError(null);
    } catch {
      // The assignment result remains authoritative; normal polling retries the report.
      setDiagnosticError("The diagnostic was assigned, but its class progress could not be refreshed.");
    }
    setAssignmentBusy(false);
    setAssignmentMessage(failed === 0
      ? `${assigned} diagnostic${assigned === 1 ? "" : "s"} assigned successfully.`
      : `${assigned} assigned. ${failed} could not be assigned because an active diagnostic or class access rule prevented it.`);
    if (failed === 0) setSelectedStudentIds([]);
  }

  async function toggleSchoolSession() {
    if (!selectedClass?.id) return;
    setSessionBusy(true);
    setSessionError(null);
    try {
      if (schoolSession) {
        await closeDiagnosticSchoolSession(selectedClass.id);
        setSchoolSession(null);
      } else {
        await openDiagnosticSchoolSession(selectedClass.id, assignmentCheckpoint, 120);
        setSchoolSession(await fetchDiagnosticSchoolSession(selectedClass.id));
      }
    } catch (cause) {
      setSessionError(cause instanceof Error ? cause.message : "The supervised session could not be changed.");
    } finally {
      setSessionBusy(false);
    }
  }

  return (
    <section className="space-y-5" aria-labelledby="whole-maths-diagnostic-title">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="whole-maths-diagnostic-title" className="text-2xl font-black text-slate-950">
              Whole-Maths Diagnostic
            </h2>
            <p className="mt-1 text-sm text-slate-500">Follow live learning every day and run a formal Start, Mid or End checkpoint when your school is ready.</p>
          </div>
          <button type="button" onClick={() => setScoringOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"><Info className="h-4 w-4" />How scoring works</button>
        </div>
        <div className="mt-4 inline-flex rounded-xl bg-slate-100 p-1" aria-label="Diagnostic views">
          <button type="button" onClick={() => setView("live")} className={view === "live" ? "inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white shadow" : "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black text-slate-600"}><TrendingUp className="h-4 w-4" />Live progression</button>
          <button type="button" onClick={() => setView("run")} className={view === "run" ? "inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white shadow" : "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-black text-slate-600"}><ListChecks className="h-4 w-4" />Run diagnostic</button>
        </div>
      </header>

      {view === "run" ? <article className={`rounded-2xl border p-4 shadow-sm ${schoolSession ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white"}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-slate-950">Supervised school session</p>
            <p className="mt-1 text-xs font-semibold text-slate-600">{schoolSession
              ? `${CHECKPOINT_LABEL[schoolSession.checkpoint]} is open until ${new Date(schoolSession.closes_at).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}. Assigned students can continue at school.`
              : "Closed. Students cannot open or continue diagnostic questions at home."}</p>
          </div>
          <button type="button" disabled={!selectedClass || sessionBusy || Boolean(sessionError)} onClick={() => void toggleSchoolSession()} className={`rounded-xl px-4 py-2.5 text-sm font-black text-white disabled:opacity-40 ${schoolSession ? "bg-rose-600" : "bg-emerald-700"}`}>{sessionBusy ? "Saving…" : schoolSession ? "Close session" : `Open ${assignmentCheckpoint === "start" ? "Start" : assignmentCheckpoint === "mid" ? "Mid" : "End"} for 2 hours`}</button>
        </div>
        {!schoolSession ? <div className="mt-3 flex flex-wrap gap-2">{(["start","mid","end"] as FormalCheckpoint[]).map((checkpoint) => <button key={checkpoint} type="button" onClick={() => setAssignmentCheckpoint(checkpoint)} className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${assignmentCheckpoint === checkpoint ? "border-emerald-500 bg-emerald-100 text-emerald-900" : "border-slate-200 bg-slate-50 text-slate-600"}`}>{checkpoint === "start" ? "Start" : checkpoint === "mid" ? "Mid" : "End"}</button>)}</div> : null}
        {!schoolSession && assignmentCheckpoint === "end" ? <p className="mt-3 text-xs font-semibold text-slate-500">End can be this school&apos;s first formal checkpoint. No Start or Mid result is required.</p> : null}
        {sessionError ? <p role="alert" className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-800">{sessionError}</p> : null}
      </article> : null}

      {view === "live" ? <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-teal-700" aria-hidden /><h3 className="text-lg font-black text-slate-950">Live progression tracker</h3></div>
            <p className="mt-1 text-sm text-slate-500">Compare each student&apos;s live learning level with their Start, Mid and End diagnostic checkpoints on the Prep–6 continuum.</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setSelectedStrand("all")}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${selectedStrand === "all" ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}
              >
                All
              </button>
              {DIAGNOSTIC_STRANDS.filter((definition) => definition.available).map((definition) => (
                <button
                  key={definition.strand}
                  type="button"
                  onClick={() => setSelectedStrand(definition.strand as LiveMathsProgressionRow["strand"])}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition ${selectedStrand === definition.strand ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-white"}`}
                >
                  {AC_STRANDS[definition.strand].label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-teal-600" />Live score</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-violet-600" />Diagnostic score</span>
          <span className="text-slate-400">S = Start · M = Mid · E = End</span>
          {diagnosticError ? <span className="font-semibold text-amber-700">Diagnostic markers are temporarily unavailable; live scores remain current.</span> : null}
          {selectedStrand === "all" && <span className="font-semibold text-amber-700">All requires completed results from all six strands.</span>}
        </div>
        <div className="divide-y divide-slate-100">
          {liveLoading || liveError ? (
            <div className={`px-5 py-8 text-center text-sm font-semibold ${liveError ? "text-rose-700" : "text-slate-500"}`}>{liveError ?? "Loading live progression…"}</div>
          ) : students.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm font-semibold text-slate-500">No students in this class.</div>
          ) : students.map((student) => {
            const studentProgression = progressionByStudent.get(student.id) ?? [];
            const realmRow = selectedStrand === "all"
              ? null
              : studentProgression.find((row) => row.strand === selectedStrand) ?? null;
            const liveLevel = selectedStrand === "all"
              ? computeWholeMathsLevel(Object.fromEntries(studentProgression.map((row) => [row.strand, row.predicted_level])))
              : realmRow?.predicted_level ?? null;
            const diagnosticPoints = diagnosticPointsByStudent.get(student.id) ?? [];
            const latestDiagnostic = diagnosticPoints.at(-1)?.level ?? null;
            return (
              <div key={student.id} className="grid gap-4 px-5 py-4 xl:grid-cols-[220px_minmax(560px,1fr)] xl:items-center">
                <div>
                  <p className="font-black text-slate-950">{student.display_name}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs font-bold">
                    <span className="text-teal-700">Live {liveLevel == null ? "—" : formatProgressionPoint(liveLevel)}</span>
                    <span className="text-violet-700">Diagnostic {latestDiagnostic == null ? "—" : formatProgressionPoint(latestDiagnostic)}</span>
                  </div>
                </div>
                {selectedStrand === "all" && liveLevel == null && diagnosticPoints.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    A complete Whole-Maths live score appears after the student has progress in all six strands.
                  </div>
                ) : (
                  <div className="overflow-x-auto pb-1">
                    <ProgressionTrack liveLevel={liveLevel} diagnosticPoints={diagnosticPoints} onSelectDiagnostic={setSelectedSittingId} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs leading-5 text-slate-500">
          The teal marker moves as lessons, quizzes and realm tests update the live score. Purple markers are fixed formal results. Trial schools can begin with an End checkpoint; Start and Mid remain blank.
        </div>
      </article> : null}

      {assignmentOpen ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !assignmentBusy) setAssignmentOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="assign-diagnostic-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div><h3 id="assign-diagnostic-title" className="text-xl font-black text-slate-950">Assign Whole-Maths Diagnostic</h3><p className="mt-1 text-sm text-slate-500">Students complete six 20-question starting-level tests over several school sessions. Their work saves after every response and resumes when you next open the checkpoint.</p>{assignmentCheckpoint === "end" ? <p className="mt-2 text-xs font-bold text-teal-700">End may be the student&apos;s first formal checkpoint. Start and Mid will remain blank.</p> : null}</div>
              <button type="button" disabled={assignmentBusy} onClick={() => setAssignmentOpen(false)} aria-label="Close assignment" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-5 p-5">
              <fieldset><legend className="text-sm font-black text-slate-900">Checkpoint</legend><div className="mt-2 grid gap-2 sm:grid-cols-3">{(["start", "mid", "end"] as FormalCheckpoint[]).map((checkpoint) => <label key={checkpoint} className={`cursor-pointer rounded-xl border p-3 ${assignmentCheckpoint === checkpoint ? "border-teal-500 bg-teal-50" : "border-slate-200"}`}><input type="radio" name="diagnostic-checkpoint" value={checkpoint} checked={assignmentCheckpoint === checkpoint} onChange={() => setAssignmentCheckpoint(checkpoint)} className="mr-2" /><span className="font-bold text-slate-900">{checkpoint === "start" ? "Start" : checkpoint === "mid" ? "Mid" : "End"}</span></label>)}</div></fieldset>
              <fieldset><legend className="sr-only">Students</legend><div className="flex items-center justify-between gap-3"><span className="text-sm font-black text-slate-900">Students</span><button type="button" onClick={() => setSelectedStudentIds(selectedStudentIds.length === assignableStudents.length ? [] : assignableStudents.map((student) => student.id))} className="text-xs font-black text-teal-700">{selectedStudentIds.length === assignableStudents.length ? "Clear all" : "Select all"}</button></div><div className="mt-2 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">{students.map((student) => { const active = activeStudentIds.has(student.id); return <label key={student.id} className={`rounded-xl border p-3 ${active ? "cursor-not-allowed bg-slate-100 text-slate-400" : "cursor-pointer border-slate-200 text-slate-900"}`}><input type="checkbox" disabled={active || assignmentBusy} checked={selectedStudentIds.includes(student.id)} onChange={() => setSelectedStudentIds((current) => current.includes(student.id) ? current.filter((id) => id !== student.id) : [...current, student.id])} className="mr-2" /><span className="font-bold">{student.display_name}</span>{active ? <span className="ml-2 text-xs">Active diagnostic</span> : null}</label>; })}</div></fieldset>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">Official overall results appear only after Number, Measurement, Space, Statistics, Algebra and Probability are all complete. Start, Mid and End may securely promote a mastered realm, but never automatically demote a student.</div>
              {assignmentMessage ? <p role="status" className="rounded-xl bg-slate-100 p-3 text-sm font-bold text-slate-800">{assignmentMessage}</p> : null}
              <div className="flex justify-end gap-2"><button type="button" disabled={assignmentBusy} onClick={() => setAssignmentOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700">Close</button><button type="button" disabled={assignmentBusy || selectedStudentIds.length === 0} onClick={() => void assignDiagnostics()} className="rounded-xl bg-teal-600 px-5 py-2.5 font-black text-white disabled:opacity-40">{assignmentBusy ? "Assigning…" : `Assign to ${selectedStudentIds.length}`}</button></div>
            </div>
          </section>
        </div>
      ) : null}

      {view === "run" ? <div>
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div>
              <h3 className="font-black text-slate-950">Class diagnostic progress</h3>
              <p className="mt-1 text-xs text-slate-500">Students complete all six strands over multiple supervised sessions.</p>
            </div>
            <button type="button" onClick={openAssignment} disabled={!selectedClass || assignableStudents.length === 0 || Boolean(diagnosticError)} className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-black text-white disabled:opacity-40"><CalendarDays className="h-4 w-4" />Assign Start / Mid / End</button>
          </div>
          {diagnosticLoading ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading diagnostic records…</div>
          ) : diagnosticError ? (
            <div className="m-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{diagnosticError}</div>
          ) : sittings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-bold text-slate-700">No diagnostic sittings yet</p>
              <p className="mt-1 text-sm text-slate-500">Trial schools can begin with the End diagnostic when they are ready.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sittings.map((sitting) => (
                <div key={sitting.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-bold text-slate-900">{studentNames.get(sitting.student_id) ?? "Student"}</p>
                    <p className="text-xs text-slate-500">{CHECKPOINT_LABEL[sitting.checkpoint]} · {new Date(sitting.created_at).toLocaleDateString("en-AU")}</p>
                    {sitting.status !== "completed" ? (() => {
                      const completed = sitting.strand_results.filter((result) => result.status === "completed").length;
                      const active = sitting.strand_results.find((result) => result.status === "pending" && (result.answered_count ?? 0) > 0)
                        ?? sitting.strand_results.find((result) => result.status === "pending");
                      return <p className="mt-1 text-xs font-semibold text-teal-700">{completed}/6 strands complete{active ? ` · ${AC_STRANDS[active.strand].label} ${active.answered_count ?? 0}/20` : ""}</p>;
                    })() : null}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black capitalize text-slate-800">{sitting.status.replace("_", " ")}</p>
                    <p className="text-xs text-slate-500">Overall: {sitting.overall_level == null ? "Pending all 6 strands" : sitting.overall_level.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </div> : null}

      {selectedSitting ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSittingId(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="diagnostic-detail-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-violet-700">{CHECKPOINT_LABEL[selectedSitting.checkpoint]}</p>
                <h3 id="diagnostic-detail-title" className="mt-1 text-xl font-black text-slate-950">{studentNames.get(selectedSitting.student_id) ?? "Student"}</h3>
                <p className="mt-1 text-sm text-slate-500">Overall {selectedSitting.overall_level == null ? "pending" : formatProgressionPoint(selectedSitting.overall_level)}</p>
              </div>
              <button type="button" onClick={() => setSelectedSittingId(null)} aria-label="Close diagnostic details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {DIAGNOSTIC_STRANDS.map((definition) => {
                const result = selectedSitting.strand_results.find((item) => item.strand === definition.strand);
                return <div key={definition.strand} className="rounded-xl border border-slate-200 p-4"><p className="font-black text-slate-900">{AC_STRANDS[definition.strand].label}</p><p className="mt-1 text-2xl font-black text-violet-700">{result?.measured_level == null ? "—" : formatProgressionPoint(result.measured_level)}</p><p className="mt-1 text-xs font-semibold capitalize text-slate-500">{result?.status ?? "Not recorded"}</p></div>;
              })}
            </div>
          </section>
        </div>
      ) : null}

      {scoringOpen ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setScoringOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="scoring-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div><h3 id="scoring-title" className="text-xl font-black text-slate-950">How scoring works</h3><p className="mt-1 text-sm text-slate-500">The detail is available here without crowding the live tracker.</p></div>
              <button type="button" onClick={() => setScoringOpen(false)} aria-label="Close scoring information" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-5 p-5 text-sm leading-6 text-slate-600">
              <p>All six maths strand engines are connected. Each starting-level strand test has 20 questions. An official overall result appears only when all six strands are complete.</p>
              <div className="grid gap-2 sm:grid-cols-2">{DIAGNOSTIC_STRANDS.map((definition) => <div key={definition.strand} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="font-bold text-slate-800">{AC_STRANDS[definition.strand].label}</span><span>{AC_STRANDS[definition.strand].weight}/{WHOLE_MATHS_WEIGHT_TOTAL}</span></div>)}</div>
              <p><strong className="text-slate-900">Adaptive testing:</strong> {DIAGNOSTIC_MASTERY}% or higher probes the next level. A very low result may probe down to produce a more accurate measurement. Existing placements are never automatically lowered.</p>
              <p><strong className="text-slate-900">Trial schools:</strong> End can be the first official checkpoint. It produces a valid achievement result; diagnostic growth appears only when two formal checkpoints exist.</p>
              <p><strong className="text-slate-900">Instructional band:</strong> {DIAGNOSTIC_FLOOR}% to {DIAGNOSTIC_MASTERY - 1}% indicates learning within the tested level.</p>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
