"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { SchoolAnalyticsSnapshot, SchoolHomeSnapshot } from "@/lib/school-platform-server";
import { formatClassYearLevels } from "@/lib/studentLevelLabel";

/** Teacher home: one card per class the teacher teaches, with four numbers
 * from the school analytics snapshot. Participation, weekly target and
 * mastery sit beside the whole-school figure; accuracy is shown without a
 * comparison. */

const WINDOW_DAYS = 28;
const ROLE_LABELS: Record<string, string> = {
  lead_teacher: "Lead teacher",
  teacher: "Teacher",
  support_staff: "Support staff",
  viewer: "Viewer",
};

type ClassRow = SchoolHomeSnapshot["classes"][number];
type Stat = { label: string; value: string; compare: string };

const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

function statsFor(classId: string, snapshot: SchoolAnalyticsSnapshot): Stat[] | null {
  const row = snapshot.classes.find((item) => item.id === classId);
  if (!row) return null;
  const school = snapshot.overview;
  return [
    { label: "Used RELIQ in the last 7 days", value: `${row.activeStudents} of ${row.students}`, compare: `${pct(school.activeThisWeek, school.students)}% school-wide` },
    { label: "Met the weekly target", value: `${pct(row.weeklyTargetMet, row.students)}%`, compare: `${pct(school.weeklyTargetMet, school.students)}% school-wide` },
    // No school comparison: class averages only cover students with evidence,
    // and the snapshot doesn't say how many, so a weighted figure would mislead.
    { label: "Average accuracy", value: row.averageAccuracy === null ? "—" : `${row.averageAccuracy}%`, compare: "Lessons, quizzes and tests" },
    { label: "Levels mastered", value: String(row.masteredLevels), compare: `${school.levelsMastered} school-wide` },
  ];
}

export default function MyClassSummary({
  schoolId,
  academicYearId,
  classes,
}: {
  schoolId: string;
  academicYearId: string;
  classes: ClassRow[];
}) {
  const requestKey = `${schoolId}|${academicYearId}`;
  const [result, setResult] = useState<{ key: string; snapshot: SchoolAnalyticsSnapshot | null } | null>(null);
  const snapshot = result?.key === requestKey ? result.snapshot : undefined;

  useEffect(() => {
    if (!academicYearId) return;
    let cancelled = false;
    const params = new URLSearchParams({ academicYearId, days: String(WINDOW_DAYS) });
    fetch(`/api/school/${schoolId}/analytics?${params}`, { credentials: "same-origin" })
      .then(async (response) => (response.ok ? ((await response.json()) as SchoolAnalyticsSnapshot) : null))
      .catch(() => null)
      .then((loaded) => {
        if (!cancelled) setResult({ key: requestKey, snapshot: loaded });
      });
    return () => {
      cancelled = true;
    };
  }, [academicYearId, requestKey, schoolId]);

  if (classes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <h3 className="text-sm font-bold text-slate-900">No assigned classes</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">Your school administrator can add you to a class.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {classes.map((classRow) => {
        const stats = snapshot ? statsFor(classRow.id, snapshot) : null;
        return (
          <article key={classRow.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-2xl font-black tracking-tight">{classRow.name}</h3>
                  <span className="rounded-full bg-[#EEF9D9] px-2.5 py-1 text-xs font-bold text-[#3D6600]">
                    {ROLE_LABELS[classRow.myRole ?? ""] ?? "Teacher"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {formatClassYearLevels(classRow.yearLevels) || "Year level not set"} · {classRow.studentCount} students
                </p>
              </div>
              <a
                href={`/school/${schoolId}/classes/${classRow.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--reliq-lime)] px-4 text-sm font-bold text-[#121314] hover:bg-[var(--reliq-lime-hover)]"
              >
                Open class <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {snapshot === undefined
                ? [0, 1, 2, 3].map((index) => <div key={index} className="h-24 animate-pulse rounded-xl bg-slate-100" />)
                : stats
                  ? stats.map((stat) => (
                      <div key={stat.label} className="rounded-xl bg-[#F7F8F4] p-4">
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        <p className="mt-1 font-display text-2xl font-black tracking-tight text-[#121314]">{stat.value}</p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-500">{stat.compare}</p>
                      </div>
                    ))
                  : <p className="text-sm text-slate-500 sm:col-span-2 xl:col-span-4">Class numbers could not be loaded right now.</p>}
            </div>
          </article>
        );
      })}
    </div>
  );
}
