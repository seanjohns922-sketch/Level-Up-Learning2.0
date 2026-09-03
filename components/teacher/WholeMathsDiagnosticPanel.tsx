"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, LockKeyhole, ShieldCheck } from "lucide-react";
import { AC_STRANDS } from "@/lib/curriculum/ac-standards";
import {
  DIAGNOSTIC_FLOOR,
  DIAGNOSTIC_MASTERY,
  DIAGNOSTIC_STRANDS,
  WHOLE_MATHS_WEIGHT_TOTAL,
  computeWholeMathsLevel,
  diagnosticAvailableWeight,
} from "@/lib/whole-maths-diagnostic";
import {
  fetchTeacherDiagnostics,
  type TeacherDiagnosticSittingRow,
} from "@/lib/whole-maths-diagnostic-client";

type DiagnosticStudent = { id: string; display_name: string };

const CHECKPOINT_LABEL = {
  start: "Start",
  mid: "Mid",
  end: "End",
  ad_hoc: "Ad hoc",
} as const;

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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!selectedClass?.id) {
        setSittings([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const rows = await fetchTeacherDiagnostics(selectedClass.id);
        if (!cancelled) setSittings(rows);
      } catch (error) {
        if (!cancelled) {
          console.warn("[WholeMathsDiagnostic] Could not load staged diagnostics", error);
          setLoadError("The diagnostic database foundation has not been deployed yet.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [selectedClass?.id]);

  const studentNames = useMemo(
    () => new Map(students.map((student) => [student.id, student.display_name])),
    [students],
  );
  const availableWeight = diagnosticAvailableWeight();
  const workedOverall = computeWholeMathsLevel(WORKED_EXAMPLE);
  const workedWeightedSum = DIAGNOSTIC_STRANDS.reduce(
    (sum, definition) => sum + WORKED_EXAMPLE[definition.strand] * AC_STRANDS[definition.strand].weight,
    0,
  );

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
              Full diagnostic launch and the official weighted overall remain locked until Algebra and Probability are complete.
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-white px-4 py-3 text-right">
            <div className="text-2xl font-black text-slate-950">{availableWeight}/{WHOLE_MATHS_WEIGHT_TOTAL}</div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">curriculum points ready</div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {DIAGNOSTIC_STRANDS.map((definition) => {
          const strand = AC_STRANDS[definition.strand];
          return (
            <article key={definition.strand} className={`rounded-2xl border p-4 ${definition.available ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-slate-100/70"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950">{strand.label}</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Weight {strand.weight} of {WHOLE_MATHS_WEIGHT_TOTAL}</p>
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
          <h3 className="text-lg font-black text-slate-950">How a student&apos;s overall maths level is weighted</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The complete diagnostic tests all six maths strands. Each strand counts in proportion to how much of the Australian Curriculum v9 Foundation–Year 6 curriculum it covers. Number carries the most weight and Probability the least.
          </p>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><th className="pb-2">Strand</th><th className="pb-2">Points (F–6)</th><th className="pb-2">Weight</th><th className="pb-2">Curriculum share</th></tr></thead>
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
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl bg-slate-950 p-4 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-300">How it&apos;s combined</p>
            <p className="mt-2 font-mono text-base font-bold">overall = Σ (strand level × points) ÷ {WHOLE_MATHS_WEIGHT_TOTAL}</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">The official number is withheld unless all six strand levels are present.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Worked Year 5 example</p>
            <p className="mt-2 text-sm text-slate-700">Weighted sum {workedWeightedSum} ÷ {WHOLE_MATHS_WEIGHT_TOTAL}</p>
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
