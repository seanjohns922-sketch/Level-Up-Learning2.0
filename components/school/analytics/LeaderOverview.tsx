"use client";

import { AlertTriangle, ArrowRight, CircleDot, Sparkles } from "lucide-react";
import type { SchoolAnalyticsSnapshot } from "@/lib/school-platform-server";
import { buildLeaderSignals, weeklyUsage, type LeaderSignal, type LevelCell } from "@/lib/leader-signals";

/** The first screen a school leader sees in School Analytics: four headline
 * numbers, a ranked "where to look" list, an on-level heatmap (school year ×
 * strand), weekly usage and a class comparison. Everything comes from the
 * same analytics snapshot as the other tabs. */

const WEEK_LABEL = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "UTC" });
const MONTH_LABEL = new Intl.DateTimeFormat("en-AU", { month: "short", timeZone: "UTC" });

const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

function onLevelTone(share: number) {
  if (share >= 80) return "bg-[#B9F23F] text-[#121314]";
  if (share >= 60) return "bg-[#FFE08A] text-[#3F2E00]";
  return "bg-[#FFC9C2] text-[#6E1810]";
}

const SIGNAL_STYLE: Record<LeaderSignal["tone"], { label: string; chip: string; icon: typeof AlertTriangle }> = {
  concern: { label: "Act", chip: "bg-[#FFE3DF] text-[#8A1C14]", icon: AlertTriangle },
  watch: { label: "Watch", chip: "bg-[#FFF1C7] text-[#5C4300]", icon: CircleDot },
  strength: { label: "Strength", chip: "bg-[#EEF9D9] text-[#3D6600]", icon: Sparkles },
};

export default function LeaderOverview({
  snapshot,
  cells,
  strands,
  years,
  days,
  onOpen,
}: {
  snapshot: SchoolAnalyticsSnapshot;
  cells: LevelCell[];
  strands: Array<{ id: string; label: string }>;
  years: string[];
  days: number;
  onOpen: (target: LeaderSignal["target"], filter?: LeaderSignal["filter"]) => void;
}) {
  const signals = buildLeaderSignals(snapshot, cells);
  // Weeks run to the end of the reporting window (a past school year ends before today).
  const weeks = weeklyUsage(snapshot.engagementTrend, snapshot.windowEnd ?? snapshot.generatedAt, snapshot.windowStart ? snapshot.windowDays : days);
  // Start at the first week with activity, so a whole school year doesn't
  // open with months of empty bars before a school began.
  const firstActive = weeks.findIndex((week) => week.activities > 0);
  const shownWeeks = firstActive > 0 ? weeks.slice(firstActive) : weeks;
  const dense = shownWeeks.length > 12;
  const peak = Math.max(1, ...shownWeeks.map((week) => week.activities));
  const busiest = shownWeeks.reduce((best, week) => (week.activities > best.activities ? week : best), shownWeeks[0] ?? { weekStart: "", activities: 0 });
  const totalActivities = shownWeeks.reduce((total, week) => total + week.activities, 0);
  const placedTotal = cells.reduce((sum, cell) => sum + cell.total, 0);
  const placedBelow = cells.reduce((sum, cell) => sum + cell.below, 0);
  const cellFor = (strand: string, year: string) => cells.find((cell) => cell.strand === strand && cell.year === year);
  const schoolTarget = pct(snapshot.overview.weeklyTargetMet, snapshot.overview.students);
  const classes = [...snapshot.classes].sort((a, b) => a.name.localeCompare(b.name, "en-AU", { numeric: true }));

  const headline = [
    { label: "Used RELIQ in the last 7 days", value: `${pct(snapshot.overview.activeThisWeek, snapshot.overview.students)}%`, detail: `${snapshot.overview.activeThisWeek} of ${snapshot.overview.students} students` },
    { label: "Met the weekly target", value: `${schoolTarget}%`, detail: `${snapshot.overview.weeklyTargetMet} students did 3+ lessons in the last 7 days` },
    { label: "At or above their year level", value: placedTotal ? `${pct(placedTotal - placedBelow, placedTotal)}%` : "—", detail: placedTotal ? `${placedTotal - placedBelow} of ${placedTotal} realm placements` : "No placements yet" },
    { label: "Levels mastered", value: String(snapshot.overview.levelsMastered), detail: "Post-tests passed at 85%+" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {headline.map((item) => (
          <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[15px] font-medium text-slate-500">{item.label}</p>
            <p className="mt-2 font-display text-4xl font-black tracking-tight text-[#121314]">{item.value}</p>
            <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="text-xl font-extrabold tracking-tight">Where to look</h3>
          <p className="text-sm text-slate-500">The biggest gaps in this view, most urgent first.</p>
          {signals.length === 0 ? (
            <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">Nothing stands out yet. Signals appear once students have placements and a few weeks of lessons.</p>
          ) : (
            <ul className="mt-3">
              {signals.map((signal) => {
                const style = SIGNAL_STYLE[signal.tone];
                const Icon = style.icon;
                return (
                  <li key={signal.key} className="border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onOpen(signal.target, signal.filter)}
                      className="flex w-full items-center gap-4 py-3.5 text-left hover:bg-[#FAFBF8]"
                    >
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
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="text-xl font-extrabold tracking-tight">On level by year and strand</h3>
          <p className="text-sm text-slate-500">Share of students working at or above their school year.</p>
          {cells.length === 0 ? (
            <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">No placements in this view yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] border-separate border-spacing-1 text-sm">
                <thead>
                  <tr className="text-xs font-bold text-slate-500">
                    <th className="px-1 py-1 text-left font-bold">Strand</th>
                    {years.map((year) => <th key={year} className="px-1 py-1 text-center font-bold">{year === "Prep" ? "Prep" : year.replace("Year ", "Y")}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {strands.map((strand) => (
                    <tr key={strand.id}>
                      <td className="whitespace-nowrap pr-2 font-semibold text-slate-700">{strand.label}</td>
                      {years.map((year) => {
                        const cell = cellFor(strand.id, year);
                        if (!cell || cell.total === 0) return <td key={year} className="rounded-md bg-slate-50 py-2 text-center text-slate-300">—</td>;
                        const share = pct(cell.total - cell.below, cell.total);
                        return (
                          <td key={year} className="p-0">
                            <button
                              type="button"
                              onClick={() => onOpen("intervention", { yearLevel: year, strand: strand.id })}
                              title={`${year} ${strand.label}: ${cell.total - cell.below} of ${cell.total} at or above level`}
                              className={`flex w-full flex-col items-center rounded-md py-1.5 font-bold tabular-nums hover:ring-2 hover:ring-[#121314] ${onLevelTone(share)}`}
                            >
                              {share}%
                              <span className="text-[10px] font-semibold opacity-70">{cell.total}</span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-[#B9F23F]" />80%+</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-[#FFE08A]" />60–79%</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-[#FFC9C2]" />Below 60%</span>
                <span>Small number = students placed</span>
              </div>
            </div>
          )}
        </article>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="text-xl font-extrabold tracking-tight">Learning activities each week</h3>
          <p className="text-sm text-slate-500">Lessons, weekly quizzes and tests. Weeks start on Monday; lighter bars are part weeks.</p>
          {totalActivities === 0 ? (
            <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">No learning activity in this reporting window.</p>
          ) : (
            <>
              <p className="mt-3 text-sm">
                <strong className="tabular-nums">{totalActivities}</strong> <span className="text-slate-500">activities</span>
                <span className="mx-2 text-slate-300">·</span>
                <span className="text-slate-500">busiest week</span> <strong className="tabular-nums">{busiest.activities}</strong>{" "}
                <span className="text-slate-500">(week of {WEEK_LABEL.format(new Date(busiest.weekStart))})</span>
              </p>
              <div className={`mt-4 flex h-44 items-end ${dense ? "gap-[3px]" : "gap-1.5"}`} role="img" aria-label={`Learning activities each week: ${shownWeeks.map((week) => `week of ${WEEK_LABEL.format(new Date(week.weekStart))} ${week.activities}${week.partial ? " (part week)" : ""}`).join(", ")}`}>
                {shownWeeks.map((week, index) => {
                  const date = new Date(week.weekStart);
                  const newMonth = index === 0 || MONTH_LABEL.format(date) !== MONTH_LABEL.format(new Date(shownWeeks[index - 1].weekStart));
                  return (
                    <div key={week.weekStart} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5" title={`Week of ${WEEK_LABEL.format(date)}: ${week.activities}${week.partial ? " (part week)" : ""}`}>
                      {dense ? null : <span className="text-[11px] font-bold tabular-nums text-slate-500">{week.activities || ""}</span>}
                      <span
                        className={`w-full max-w-9 rounded-t-[3px] ${week.partial ? "bg-[#D6D9D3]" : "bg-[#121314]"}`}
                        style={{ height: `${Math.max(2, Math.round((week.activities / peak) * 130))}px` }}
                      />
                      <span className="h-3 whitespace-nowrap text-[10px] font-semibold text-slate-500">
                        {dense ? (newMonth ? MONTH_LABEL.format(date) : "") : WEEK_LABEL.format(date)}
                      </span>
                    </div>
                  );
                })}
              </div>
              {dense ? <p className="mt-2 text-xs text-slate-400">Hover a bar for that week&apos;s number.</p> : null}
            </>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Classes at a glance</h3>
              <p className="text-sm text-slate-500">Who&apos;s using RELIQ this week, how accurate they are, and levels mastered.</p>
            </div>
            <button type="button" onClick={() => onOpen("classes")} className="shrink-0 text-sm font-bold text-emerald-700 hover:underline">All classes</button>
          </div>
          {classes.length === 0 ? (
            <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">No classes in this view.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[420px] text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold text-slate-500">
                    <th className="pb-2 pr-3 font-bold">Class</th>
                    <th className="pb-2 pr-3 font-bold">Active this week</th>
                    <th className="pb-2 pr-3 font-bold">Accuracy</th>
                    <th className="pb-2 text-right font-bold">Mastered</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((item) => {
                    const active = pct(item.activeStudents, item.students);
                    return (
                      <tr key={item.id ?? item.name} className="border-t border-slate-100">
                        <td className="py-3 pr-3 font-bold">{item.name}</td>
                        <td className="py-3 pr-3">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-20 shrink-0 rounded-full bg-[#ECEEE9]"><span className="block h-full rounded-full bg-[#121314]" style={{ width: `${active}%` }} /></span>
                            <span className="tabular-nums">{item.activeStudents} of {item.students}</span>
                          </span>
                        </td>
                        <td className="py-3 pr-3">
                          {item.averageAccuracy === null ? (
                            <span className="text-slate-400">—</span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-20 shrink-0 rounded-full bg-[#ECEEE9]"><span className={`block h-full rounded-full ${item.averageAccuracy >= 80 ? "bg-[#B9F23F]" : item.averageAccuracy >= 60 ? "bg-[#FFD866]" : "bg-[#FF9C8F]"}`} style={{ width: `${Math.min(100, item.averageAccuracy)}%` }} /></span>
                              <span className="tabular-nums">{Math.round(item.averageAccuracy)}%</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right font-bold tabular-nums">{item.masteredLevels}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
