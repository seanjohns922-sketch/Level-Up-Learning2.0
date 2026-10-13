"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { ClassGroup, SchoolAnalyticsSnapshot, SchoolHomeSnapshot } from "@/lib/school-platform-server";
import { useClassGroups } from "./useClassGroups";
import { formatClassYearLevels } from "@/lib/studentLevelLabel";

/** Teacher home: one card per class the teacher teaches, with four numbers
 * from the school analytics snapshot. When the school administrator has put
 * the class in a class group, participation, weekly target and mastery sit
 * beside the group's figure (otherwise the whole-school figure) and the
 * group's classes are listed to compare. Accuracy has no comparison. */

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

function statsFor(classId: string, snapshot: SchoolAnalyticsSnapshot, group: ClassGroup | undefined): Stat[] | null {
  const row = snapshot.classes.find((item) => item.id === classId);
  if (!row) return null;
  const peers = group ? snapshot.classes.filter((item) => item.id && group.classIds.includes(item.id)) : [];
  const useGroup = peers.length >= 2;
  const scope = useGroup ? `across ${group!.name}` : "school-wide";
  const sum = (key: "students" | "activeStudents" | "weeklyTargetMet" | "masteredLevels") => peers.reduce((total, item) => total + item[key], 0);
  const base = useGroup
    ? { students: sum("students"), active: sum("activeStudents"), target: sum("weeklyTargetMet"), mastered: sum("masteredLevels") }
    : { students: snapshot.overview.students, active: snapshot.overview.activeThisWeek, target: snapshot.overview.weeklyTargetMet, mastered: snapshot.overview.levelsMastered };
  return [
    { label: "Used RELIQ in the last 7 days", value: `${row.activeStudents} of ${row.students}`, compare: `${pct(base.active, base.students)}% ${scope}` },
    { label: "Met the weekly target", value: `${pct(row.weeklyTargetMet, row.students)}%`, compare: `${pct(base.target, base.students)}% ${scope}` },
    // No comparison: class averages only cover students with evidence, and the
    // snapshot doesn't say how many, so a weighted figure would mislead.
    { label: "Average accuracy", value: row.averageAccuracy === null ? "—" : `${row.averageAccuracy}%`, compare: "Lessons, quizzes and tests" },
    { label: "Levels mastered", value: String(row.masteredLevels), compare: `${base.mastered} ${scope}` },
  ];
}

export default function MyClassSummary({
  schoolId,
  academicYearId,
  classes,
  allClasses,
}: {
  schoolId: string;
  academicYearId: string;
  classes: ClassRow[];
  /** Every class this year, for names and teachers in the group panel. */
  allClasses: ClassRow[];
}) {
  const { groups } = useClassGroups(schoolId, academicYearId);
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
        const group = groups.find((item) => item.classIds.includes(classRow.id));
        const stats = snapshot ? statsFor(classRow.id, snapshot, group) : null;
        const groupClasses = group
          ? allClasses.filter((item) => group.classIds.includes(item.id)).sort((a, b) => a.name.localeCompare(b.name, "en-AU", { numeric: true }))
          : [];
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

            {group && groupClasses.length >= 2 ? (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-lg font-extrabold tracking-tight">{group.name}</h4>
                  <p className="text-sm text-slate-500">{groupClasses.length} classes · listed in order, never ranked</p>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {groupClasses.map((peer) => {
                    const row = snapshot?.classes.find((item) => item.id === peer.id);
                    const mine = peer.id === classRow.id;
                    return (
                      <a
                        key={peer.id}
                        href={`/school/${schoolId}/classes/${peer.id}`}
                        className={`block rounded-xl p-4 text-[#121314] no-underline transition hover:border-[#121314] ${mine ? "border-2 border-[#121314]" : "border border-slate-200"}`}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-display text-lg font-black">{peer.name}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${mine ? "bg-[var(--reliq-lime,#B9F23F)]" : "bg-slate-100 text-slate-600"}`}>{mine ? "Your class" : "Same group"}</span>
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">{peer.leadTeacher ?? "Teacher not assigned"} · {peer.studentCount} students</span>
                        <span className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <span><span className="block text-[11px] text-slate-500">Weekly target</span><span className="font-bold">{row ? `${pct(row.weeklyTargetMet, row.students)}%` : "—"}</span></span>
                          <span><span className="block text-[11px] text-slate-500">Accuracy</span><span className="font-bold">{row?.averageAccuracy == null ? "—" : `${row.averageAccuracy}%`}</span></span>
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
