"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, LockKeyhole, ShieldCheck, TrendingUp } from "lucide-react";
import {
  AC_DESCRIPTOR_COUNTS_BY_LEVEL,
  AC_PRIMARY_LEVELS,
  AC_STRANDS,
} from "@/lib/curriculum/ac-standards";
import {
  DIAGNOSTIC_FLOOR,
  DIAGNOSTIC_MASTERY,
  DIAGNOSTIC_STRANDS,
  WHOLE_MATHS_WEIGHT_TOTAL,
  computeWholeMathsLevel,
  computeReachedCurriculumPoints,
  diagnosticAvailableWeight,
} from "@/lib/whole-maths-diagnostic";
import {
  fetchTeacherDiagnostics,
  fetchTeacherLiveMathsProgression,
  type LiveMathsProgressionRow,
  type TeacherDiagnosticSittingRow,
} from "@/lib/whole-maths-diagnostic-client";
import { formatProgressionPoint } from "@/lib/live-maths-progression";

type DiagnosticStudent = { id: string; display_name: string };
type TrackerTab = "all" | LiveMathsProgressionRow["strand"];
type FormalCheckpoint = Exclude<TeacherDiagnosticSittingRow["checkpoint"], "ad_hoc">;
type DiagnosticPoint = { checkpoint: FormalCheckpoint; level: number; completedAt: string };

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
}: {
  liveLevel: number | null;
  diagnosticPoints: DiagnosticPoint[];
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
            <span
              key={`${point.checkpoint}-${point.completedAt}`}
              className="absolute top-0 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-violet-600 text-[10px] font-black text-white shadow"
              style={{ left: levelPosition(point.level) }}
              title={`${CHECKPOINT_LABEL[point.checkpoint]}: ${formatProgressionPoint(point.level)}`}
              aria-label={`${CHECKPOINT_LABEL[point.checkpoint]} level ${formatProgressionPoint(point.level)}`}
            >
              {CHECKPOINT_SHORT[point.checkpoint]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

const WORKED_EXAMPLE = {
  number: 4,
  measurement: 4.5,
  space: 4,
  statistics: 4.5,
  algebra: 3.5,
  probability: 4,
} as const;

export default function WholeMathsDiagnosticPanel({
  selectedClass,
  students,
}: {
  selectedClass: { id: string; name: string } | null;
  students: DiagnosticStudent[];
}) {
  const [sittings, setSittings] = useState<TeacherDiagnosticSittingRow[]>([]);
  const [progression, setProgression] = useState<LiveMathsProgressionRow[]>([]);
  const [selectedStrand, setSelectedStrand] = useState<TrackerTab>("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load(showLoading: boolean) {
      if (!selectedClass?.id) {
        setSittings([]);
        setProgression([]);
        setLoading(false);
        return;
      }
      if (showLoading) setLoading(true);
      try {
        const [rows, liveProgression] = await Promise.all([
          fetchTeacherDiagnostics(selectedClass.id),
          fetchTeacherLiveMathsProgression(selectedClass.id),
        ]);
        if (!cancelled) {
          setSittings(rows);
          setProgression(liveProgression);
          setLoadError(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("[WholeMathsDiagnostic] Could not load staged diagnostics", error);
          setLoadError("The diagnostic database foundation has not been deployed yet.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load(true);
    const intervalId = window.setInterval(() => { void load(false); }, 30_000);
    return () => { cancelled = true; window.clearInterval(intervalId); };
  }, [selectedClass?.id]);

  const studentNames = useMemo(
    () => new Map(students.map((student) => [student.id, student.display_name])),
    [students],
  );
  const availableWeight = diagnosticAvailableWeight();
  const workedOverall = computeWholeMathsLevel(WORKED_EXAMPLE);
  const workedReachedPoints = computeReachedCurriculumPoints(WORKED_EXAMPLE);
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
        checkpoint: sitting.checkpoint,
        level,
        completedAt: sitting.completed_at ?? sitting.created_at,
      });
      grouped.set(sitting.student_id, checkpoints);
    }
    return new Map([...grouped].map(([studentId, checkpoints]) => [studentId, [...checkpoints.values()].sort((left, right) => left.completedAt.localeCompare(right.completedAt))]));
  }, [selectedStrand, sittings]);

  return (
    <section className="space-y-5" aria-labelledby="whole-maths-diagnostic-title">
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-amber-700">
              <LockKeyhole className="h-4 w-4" aria-hidden /> Staged build
            </div>
            <h2 id="whole-maths-diagnostic-title" className="mt-2 text-2xl font-black text-slate-950">
              Whole-Maths Diagnostic
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              The first four genre engines are coded and use their existing level-test questions.
              Full diagnostic launch and the official Whole-Maths overall remain locked until Algebra and Probability are complete.
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-right">
            <div className="text-2xl font-black text-slate-950">{availableWeight}/{WHOLE_MATHS_WEIGHT_TOTAL}</div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">curriculum points ready</div>
          </div>
        </div>
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
            <button
              type="button"
              disabled
              title="Scheduling unlocks when all six strand tests are ready."
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-black text-slate-400"
            >
              <CalendarDays className="h-4 w-4" aria-hidden /> Set Start / Mid / End
              <LockKeyhole className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600">
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-teal-600" />Live score</span>
          <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-violet-600" />Diagnostic score</span>
          <span className="text-slate-400">S = Start · M = Mid · E = End</span>
          {selectedStrand === "all" && <span className="font-semibold text-amber-700">All requires completed results from all six strands.</span>}
        </div>
        <div className="divide-y divide-slate-100">
          {loading || loadError ? (
            <div className={`px-5 py-8 text-center text-sm font-semibold ${loadError ? "text-amber-800" : "text-slate-500"}`}>{loadError ?? "Loading live progression…"}</div>
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
                    Complete Whole-Maths tracking will activate when all six strand engines are available.
                  </div>
                ) : (
                  <div className="overflow-x-auto pb-1">
                    <ProgressionTrack liveLevel={liveLevel} diagnosticPoints={diagnosticPoints} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs leading-5 text-slate-500">
          The teal marker moves as lessons, quizzes and realm tests update the live score. Purple markers are formal diagnostic results and remain fixed historical checkpoints. The complete All score is withheld until every strand has been tested.
        </div>
      </article>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {DIAGNOSTIC_STRANDS.map((definition) => {
          const strand = AC_STRANDS[definition.strand];
          return (
            <article key={definition.strand} className={`rounded-2xl border p-4 ${definition.available ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-100/70"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950">{strand.label}</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">F–6 total {strand.weight} of {WHOLE_MATHS_WEIGHT_TOTAL}</p>
                </div>
                {definition.available ? <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-label="Engine ready" /> : <Clock3 className="h-5 w-5 text-slate-400" aria-label="Waiting for realm" />}
              </div>
              <p className={`mt-4 text-xs font-bold ${definition.available ? "text-emerald-700" : "text-slate-500"}`}>
                {definition.available ? "Level-test engine ready" : definition.unavailableReason}
              </p>
            </article>
          );
        })}
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="max-w-4xl">
          <h3 className="text-lg font-black text-slate-950">How a student&apos;s overall maths level is calculated</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The complete diagnostic tests all six maths strands. It counts the Australian Curriculum v9 descriptors reached at each student&apos;s measured level in each strand, then maps the combined curriculum points back to one progression level. This handles mixed profiles without applying one fixed F–6 percentage to every year.
          </p>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><th className="pb-2">Strand</th><th className="pb-2">Points (F–6)</th><th className="pb-2">F–6 share</th><th className="pb-2">Curriculum share</th></tr></thead>
            <tbody>
              {DIAGNOSTIC_STRANDS.map((definition) => {
                const strand = AC_STRANDS[definition.strand];
                const percent = Math.round((strand.weight / WHOLE_MATHS_WEIGHT_TOTAL) * 100);
                return (
                  <tr key={strand.id} className="border-b border-slate-100 last:border-0">
                    <th className="py-3 font-bold text-slate-900">{strand.label}</th>
                    <td className="py-3 font-semibold text-slate-700">{strand.weight}</td>
                    <td className="py-3 font-black text-slate-900">{percent}%</td>
                    <td className="py-3"><div className="h-2.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-500" style={{ width: `${percent}%` }} /></div></td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-slate-200"><th className="pt-3 font-black text-slate-950">Total</th><td className="pt-3 font-black text-slate-950">{WHOLE_MATHS_WEIGHT_TOTAL}</td><td className="pt-3 font-black text-slate-950">100%</td><td /></tr>
            </tbody>
          </table>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-center text-xs">
            <caption className="mb-2 text-left font-black uppercase tracking-wide text-slate-500">AC9 descriptors at each level</caption>
            <thead><tr className="border-b border-slate-200 text-slate-500"><th className="pb-2 text-left">Strand</th>{AC_PRIMARY_LEVELS.map((level) => <th key={level} className="pb-2">{level === 0 ? "F" : `L${level}`}</th>)}<th className="pb-2">F–6</th></tr></thead>
            <tbody>
              {DIAGNOSTIC_STRANDS.map((definition) => (
                <tr key={definition.strand} className="border-b border-slate-100 last:border-0">
                  <th className="py-2 text-left font-bold text-slate-800">{AC_STRANDS[definition.strand].label}</th>
                  {AC_PRIMARY_LEVELS.map((level) => <td key={level} className="py-2 font-semibold text-slate-600">{AC_DESCRIPTOR_COUNTS_BY_LEVEL[level][definition.strand]}</td>)}
                  <td className="py-2 font-black text-slate-900">{AC_STRANDS[definition.strand].weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-slate-950 p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-300">How it&apos;s combined</p>
            <p className="mt-2 font-mono text-base font-bold">overall = level position of Σ curriculum points reached</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">An official number is withheld until all six formal strand tests are complete. A live estimate may use all six current realm predictions before then.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Worked Year 5 example</p>
            <p className="mt-2 text-sm text-slate-700">{workedReachedPoints} of {WHOLE_MATHS_WEIGHT_TOTAL} curriculum points reached</p>
            <p className="mt-1 text-2xl font-black text-slate-950">Overall level {workedOverall?.toFixed(1)}/6</p>
          </div>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-700" aria-hidden />
            <h3 className="font-black text-slate-950">Placement rules</h3>
          </div>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3"><dt className="font-semibold text-slate-600">Mastery</dt><dd className="font-black text-slate-950">{DIAGNOSTIC_MASTERY}%+</dd></div>
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3"><dt className="font-semibold text-slate-600">Instructional floor</dt><dd className="font-black text-slate-950">{DIAGNOSTIC_FLOOR}%</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="font-semibold text-slate-600">Automatic demotion</dt><dd className="font-black text-emerald-700">Never</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            Placement is calculated and written by the secure database function only. Weekly practice never silently changes an official diagnostic checkpoint.
          </p>
        </article>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-black text-slate-950">Diagnostic history</h3>
            <p className="mt-1 text-xs text-slate-500">Immutable Start, Mid, End and teacher-triggered records will appear here.</p>
          </div>
          {loading ? (
            <div className="p-8 text-center text-sm font-semibold text-slate-500">Loading diagnostic records…</div>
          ) : loadError ? (
            <div className="m-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{loadError}</div>
          ) : sittings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-bold text-slate-700">No diagnostic sittings yet</p>
              <p className="mt-1 text-sm text-slate-500">Launch remains intentionally disabled while two genre tests are missing.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sittings.map((sitting) => (
                <div key={sitting.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-bold text-slate-900">{studentNames.get(sitting.student_id) ?? "Student"}</p>
                    <p className="text-xs text-slate-500">{CHECKPOINT_LABEL[sitting.checkpoint]} · {new Date(sitting.created_at).toLocaleDateString("en-AU")}</p>
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
      </div>
    </section>
  );
}
