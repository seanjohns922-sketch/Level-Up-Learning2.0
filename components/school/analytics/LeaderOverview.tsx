"use client";

import { AlertTriangle, ArrowRight, CircleDot, Sparkles } from "lucide-react";
import type { SchoolAnalyticsSnapshot } from "@/lib/school-platform-server";
import { buildLeaderSignals, type LeaderSignal } from "@/lib/leader-signals";
import { AC_STRANDS } from "@/lib/curriculum/ac-standards";
import { overviewHelp } from "@/lib/analytics-help";
import TabHelp from "./TabHelp";
import {
  STANDING_META,
  buildDistributions,
  share,
  standingsFor,
  studentStandings,
  usesTests,
  type Distribution,
  type Standing,
} from "@/lib/proficiency";

/** School Analytics overview for the three views: whole school (leaders), a
 * class group, and a teacher's own class (the snapshot is already filtered).
 * Each student counts once overall and once per strand, from their latest
 * diagnostic, pre-test or post-test against where they should be on the day
 * they sat it: Well below / Below level / At level / Above level. No class is
 * ranked against another. */

const SIGNAL_STYLE: Record<LeaderSignal["tone"], { label: string; chip: string; icon: typeof AlertTriangle }> = {
  concern: { label: "Act", chip: "bg-[#FFE3DF] text-[#8A1C14]", icon: AlertTriangle },
  watch: { label: "Watch", chip: "bg-[#FFF1C7] text-[#5C4300]", icon: CircleDot },
  strength: { label: "Strength", chip: "bg-[#EEF9D9] text-[#3D6600]", icon: Sparkles },
};

const SMALL_GROUP = 10;

function StackedBar({ row, categories, height = "h-7", labels = true }: { row: Distribution; categories: Standing[]; height?: string; labels?: boolean }) {
  return (
    <span className={`flex ${height} overflow-hidden rounded-lg bg-[#F1F2EE]`}>
      {categories.map((category) => {
        const pct = share(row.counts[category], row.total);
        if (!pct) return null;
        const meta = STANDING_META[category];
        return (
          <span
            key={category}
            className="grid place-items-center text-xs font-extrabold"
            style={{ width: `${pct}%`, background: meta.bg, color: meta.fg }}
            title={`${meta.label}: ${row.counts[category]} (${pct}%)`}
          >
            {labels && pct >= 9 ? `${pct}%` : ""}
          </span>
        );
      })}
    </span>
  );
}

export default function LeaderOverview({
  snapshot,
  audience,
  title,
  onOpen,
  onOpenStudent,
}: {
  snapshot: SchoolAnalyticsSnapshot;
  /** leadership: whole school · group: a class group's year levels · teacher: one class */
  audience: "leadership" | "group" | "teacher";
  title: string;
  onOpen: (target: LeaderSignal["target"], filter?: LeaderSignal["filter"]) => void;
  onOpenStudent: (studentId: string) => void;
}) {
  const usingTests = usesTests(snapshot);
  const schoolYear = usingTests ? snapshot.academicYear ?? null : null;
  const categories = standingsFor(usingTests);
  const { overall, years, strands, byClass } = buildDistributions(snapshot.analysisStudents, schoolYear);
  const signals = buildLeaderSignals(
    { overall, years, strands },
    { students: snapshot.overview.students, activeThisWeek: snapshot.overview.activeThisWeek },
    audience === "teacher" ? "class" : "school",
  );
  const withoutEvidence = Math.max(0, snapshot.overview.students - overall.total);

  // Teachers: named lists from the students they can see.
  const named = snapshot.students.map((student) => {
    const standings = studentStandings({ yearLevel: student.yearLevel, realms: student.realms, tests: student.tests }, schoolYear);
    const below = [...standings.strands.entries()]
      .filter(([, standing]) => standing === "below" || standing === "wellBelow")
      .map(([strand, standing]) => ({ label: AC_STRANDS[strand].label, standing }));
    return { student, below, level: standings.overall };
  });
  const needSupport = named
    .filter((row) => row.below.length > 0)
    .sort((a, b) =>
      b.below.filter((item) => item.standing === "wellBelow").length - a.below.filter((item) => item.standing === "wellBelow").length ||
      b.below.length - a.below.length ||
      a.student.name.localeCompare(b.student.name));
  const readyForMore = named
    .filter((row) => row.level === "above")
    .sort((a, b) => a.student.name.localeCompare(b.student.name));

  const card = "rounded-2xl border border-slate-200 bg-white p-5 sm:p-6";

  return (
    <div className="space-y-5">
      <TabHelp content={overviewHelp(audience)} />
      <section className={card}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xl font-extrabold tracking-tight">{title}</h3>
          <span className="text-sm text-slate-500">
            {overall.total} students with evidence{withoutEvidence ? ` · ${withoutEvidence} not yet placed` : ""}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => {
            const meta = STANDING_META[category];
            return (
              <div key={category} className="pl-4" style={{ boxShadow: `inset 4px 0 0 ${meta.bg}` }}>
                <p className="text-[15px] font-semibold text-slate-700">
                  <span className="cursor-help border-b-2 border-dotted border-slate-400" title={`${meta.label}: ${meta.meaning}`}>{meta.label}</span>
                </p>
                <p className="font-display text-4xl font-black tracking-tight text-[#121314]">{share(overall.counts[category], overall.total)}%</p>
                <p className="text-sm text-slate-500">{overall.counts[category]} students</p>
              </div>
            );
          })}
        </div>
        <div className="mt-5" role="img" aria-label={categories.map((category) => `${STANDING_META[category].label} ${share(overall.counts[category], overall.total)}%`).join(", ")}>
          <StackedBar row={overall} categories={categories} height="h-5" labels={false} />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
          {categories.map((category) => (
            <span key={category} className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded" style={{ background: STANDING_META[category].bg }} />
              <strong className="text-[#121314]">{STANDING_META[category].label}</strong> {STANDING_META[category].meaning}
            </span>
          ))}
        </div>
        {usingTests ? null : (
          <p className="mt-3 text-xs text-slate-400">Based on current working level against school year. Results from each student&apos;s latest test appear after the analytics update.</p>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {audience !== "teacher" ? (
          <section className={card}>
            <h3 className="text-xl font-extrabold tracking-tight">By school year</h3>
            <p className="text-sm text-slate-500">Each student once, overall maths</p>
            <ul className="mt-4 space-y-3">
              {years.map(([year, row]) => (
                <li key={year} className="grid grid-cols-[5rem_1fr_3rem] items-center gap-3 text-sm">
                  <button type="button" onClick={() => onOpen("placement", { yearLevel: year })} className="text-left font-bold hover:underline">{year}</button>
                  <StackedBar row={row} categories={categories} />
                  <span className="text-right text-slate-500">{row.total}</span>
                </li>
              ))}
              {years.length === 0 ? <li className="text-sm text-slate-500">No placements yet.</li> : null}
            </ul>
          </section>
        ) : null}

        <section className={card}>
          <h3 className="text-xl font-extrabold tracking-tight">By strand</h3>
          <p className="text-sm text-slate-500">Only students who have sat a test in that strand</p>
          <ul className="mt-4 space-y-3">
            {strands.map(([strand, row]) => (
              <li key={strand} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-3 text-sm">
                <span className="font-bold">{AC_STRANDS[strand].label}</span>
                {row.total === 0 ? (
                  <span className="flex h-7 items-center rounded-lg bg-[#F1F2EE] px-3 text-slate-400">No tests yet</span>
                ) : (
                  <span style={{ opacity: row.total < SMALL_GROUP ? 0.45 : 1 }}>
                    <StackedBar row={row} categories={categories} />
                  </span>
                )}
                <span className="text-right text-slate-500">{row.total || "—"}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={card}>
          <h3 className="text-xl font-extrabold tracking-tight">{audience === "teacher" ? "Where to look in your class" : audience === "group" ? "Where to look in this group" : "Where to look"}</h3>
          <p className="text-sm text-slate-500">The biggest gaps, most urgent first.</p>
          {signals.length === 0 ? (
            <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">Nothing stands out yet.</p>
          ) : (
            <ul className="mt-3">
              {signals.map((signal) => {
                const style = SIGNAL_STYLE[signal.tone];
                const Icon = style.icon;
                return (
                  <li key={signal.key} className="border-t border-slate-100">
                    <button type="button" onClick={() => onOpen(signal.target, signal.filter)} className="flex w-full items-center gap-4 py-3.5 text-left hover:bg-[#FAFBF8]">
                      <span className={`inline-flex w-[88px] shrink-0 items-center justify-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${style.chip}`}>
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        {style.label}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-[#121314]">{signal.headline}</span>
                        <span className="block text-sm text-slate-500">{signal.detail}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {audience === "leadership" ? (
          <section className={card}>
            <div className="flex items-end justify-between gap-3">
              <h3 className="text-xl font-extrabold tracking-tight">Classes at a glance</h3>
              <button type="button" onClick={() => onOpen("classes")} className="shrink-0 text-sm font-bold text-emerald-700 hover:underline">All classes</button>
            </div>
            <div className="mt-4 grid grid-cols-[5.5rem_1fr_4.5rem] gap-3 text-xs font-bold text-slate-500">
              <span>Class</span><span>Where students are</span><span className="text-right">Active 7 days</span>
            </div>
            <ul>
              {[...snapshot.classes]
                .sort((a, b) => a.name.localeCompare(b.name, "en-AU", { numeric: true }))
                .map((item) => {
                  const row = item.id ? byClass.get(item.id) : undefined;
                  return (
                    <li key={item.id ?? item.name} className="grid grid-cols-[5.5rem_1fr_4.5rem] items-center gap-3 border-t border-slate-100 py-2.5 text-sm">
                      <span className="truncate font-bold">{item.name}</span>
                      {row && row.total ? <StackedBar row={row} categories={categories} height="h-3.5" labels={false} /> : <span className="text-xs text-slate-400">No tests yet</span>}
                      <span className="text-right tabular-nums">{item.activeStudents} of {item.students}</span>
                    </li>
                  );
                })}
            </ul>
          </section>
        ) : audience === "teacher" ? (
          <section className={card}>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-xl font-extrabold tracking-tight">Students who need support</h3>
              <span className="text-sm text-slate-500">{needSupport.length} students</span>
            </div>
            <p className="text-sm text-slate-500">Below level in at least one strand, most behind first</p>
            {needSupport.length === 0 ? (
              <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">No students are below level in any strand.</p>
            ) : (
              <ul className="mt-3">
                {needSupport.map(({ student, below }) => (
                  <li key={student.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100 py-2.5">
                    <button type="button" onClick={() => onOpenStudent(student.id)} className="min-w-0 flex-1 basis-40 text-left">
                      <span className="block font-bold text-[#121314] hover:underline">{student.name}</span>
                      <span className="block text-xs text-slate-500">{student.yearLevel ?? "Year not set"}</span>
                    </button>
                    <span className="flex flex-wrap gap-1.5">
                      {below.map((item) => (
                        <span key={item.label} className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: STANDING_META[item.standing].bg, color: STANDING_META[item.standing].fg }}>
                          {item.label}{item.standing === "wellBelow" ? " · well below" : ""}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {audience === "teacher" ? (
          <section className={card}>
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-xl font-extrabold tracking-tight">Ready for more</h3>
              <span className="text-sm text-slate-500">{readyForMore.length} students</span>
            </div>
            <p className="text-sm text-slate-500">More than a term ahead overall</p>
            {readyForMore.length === 0 ? (
              <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">No students yet.</p>
            ) : (
              <ul className="mt-3">
                {readyForMore.map(({ student, level }) => (
                  <li key={student.id} className="border-t border-slate-100 py-2.5">
                    <button type="button" onClick={() => onOpenStudent(student.id)} className="text-left">
                      <span className="block font-bold text-[#121314] hover:underline">{student.name}</span>
                      <span className="block text-xs text-slate-500">{level ? STANDING_META[level].label : ""} · {student.yearLevel ?? "Year not set"}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
