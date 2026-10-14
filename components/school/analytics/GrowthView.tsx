"use client";

import type { SchoolAnalyticsSnapshot } from "@/lib/school-platform-server";
import { AC_STRANDS } from "@/lib/curriculum/ac-standards";
import { LEVEL_ORDER } from "@/lib/proficiency";
import { growthHelp, type HelpAudience } from "@/lib/analytics-help";
import TabHelp from "./TabHelp";
import {
  PACE_META,
  PACE_ORDER,
  formatGrowth,
  paceFor,
  seriesTimes,
  studentGrowthAt,
  summariseGrowth,
  withStart,
  yearBounds,
  type GrowthSummary,
  type Pace,
  type SeriesPoint,
} from "@/lib/growth";

/** Growth tab: a pre-test (or the start diagnostic) sets each student's base
 * and the post-tests and diagnostics after it show the growth (tests only, no
 * live tracking). The breakdown follows the view:
 * whole school by school year, a school year by class, a class by student,
 * and a class group by its year levels. */

export type GrowthBreakdown = "years" | "classes" | "students";

type Row = {
  key: string;
  name: string;
  sub: string;
  journey: string;
  gained: number | null;
  series: SeriesPoint[];
  pace?: Record<Pace, number>;
  studentPace?: Pace | null;
  onOpen?: () => void;
};

const card = "rounded-2xl border border-slate-200 bg-white p-5 sm:p-6";
const level = (value: number | null) => (value === null ? "—" : value.toFixed(1));

export default function GrowthView({
  snapshot,
  audience,
  breakdown,
  title,
  onOpenYear,
  onOpenClass,
  onOpenStudent,
}: {
  snapshot: SchoolAnalyticsSnapshot;
  audience: HelpAudience;
  breakdown: GrowthBreakdown;
  title: string;
  onOpenYear?: (yearLevel: string) => void;
  onOpenClass?: (classId: string) => void;
  onOpenStudent?: (studentId: string) => void;
}) {
  const year = snapshot.academicYear!;
  const now = Date.parse(snapshot.windowEnd ?? snapshot.generatedAt);
  const summary = summariseGrowth(snapshot.analysisStudents, year, now);
  const times = seriesTimes(year, now);

  const groupRow = (key: string, name: string, students: SchoolAnalyticsSnapshot["analysisStudents"], onOpen?: () => void): Row => {
    const group = summariseGrowth(students, year, now);
    return {
      key,
      name,
      sub: `${group.followed} followed · ${group.tests} tests${group.waiting ? ` · ${group.waiting} waiting for a post-test` : ""}`,
      journey: group.first === null ? "—" : `${level(group.first)} → ${level(group.latest)}`,
      gained: group.gained,
      series: group.series,
      pace: group.pace,
      onOpen,
    };
  };

  let rows: Row[] = [];
  if (breakdown === "years") {
    const years = [...new Set(snapshot.analysisStudents.map((student) => student.yearLevel ?? "Not recorded"))]
      .sort((a, b) => LEVEL_ORDER.indexOf(a) - LEVEL_ORDER.indexOf(b));
    rows = years.map((label) =>
      groupRow(label, label, snapshot.analysisStudents.filter((student) => (student.yearLevel ?? "Not recorded") === label), onOpenYear && label !== "Not recorded" ? () => onOpenYear(label) : undefined));
  } else if (breakdown === "classes") {
    const names = new Map(snapshot.classes.map((item) => [item.id ?? "", item.name]));
    const ids = [...new Set(snapshot.analysisStudents.map((student) => student.classId ?? ""))]
      .sort((a, b) => (names.get(a) ?? "Not assigned").localeCompare(names.get(b) ?? "Not assigned"));
    rows = ids.map((id) =>
      groupRow(id || "none", names.get(id) ?? "Not assigned", snapshot.analysisStudents.filter((student) => (student.classId ?? "") === id), onOpenClass && id ? () => onOpenClass(id) : undefined));
  } else {
    rows = snapshot.students
      .map((student) => {
        const growth = studentGrowthAt(student.testHistory, times[times.length - 1]);
        const tests = (student.testHistory ?? []).length;
        return {
          key: student.id,
          name: student.name,
          sub: `${student.yearLevel ?? "Year not recorded"} · ${tests} test${tests === 1 ? "" : "s"}`,
          journey: growth ? `${level(growth.first)} → ${level(growth.latest)}` : "—",
          gained: growth?.gained ?? null,
          series: withStart([student], times.map((time) => {
            const point = studentGrowthAt(student.testHistory, time);
            return { at: time, gained: point?.gained ?? null, expected: point?.expected ?? null, students: point ? 1 : 0 };
          })),
          studentPace: growth ? paceFor(growth.gained, growth.expected) : null,
          onOpen: onOpenStudent ? () => onOpenStudent(student.id) : undefined,
        };
      })
      .sort((a, b) =>
        (a.studentPace ? PACE_ORDER.indexOf(a.studentPace) : 9) - (b.studentPace ? PACE_ORDER.indexOf(b.studentPace) : 9) ||
        (a.gained ?? 0) - (b.gained ?? 0) ||
        a.name.localeCompare(b.name));
  }

  const comparisons = breakdown !== "students" && rows.length >= 2 && rows.length <= 4 ? rows : [];
  const firstColumn = breakdown === "years" ? "School year" : breakdown === "classes" ? "Class" : "Student";

  if (summary.followed === 0) {
    return (
      <div className="space-y-5">
      <TabHelp content={growthHelp(audience)} />
      <section className={card}>
        <h3 className="text-xl font-extrabold tracking-tight">{title}</h3>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          A pre-test sets each student&apos;s starting point; growth appears once they sit a post-test or the mid-year diagnostic after it.
          {summary.waiting ? ` ${summary.waiting} student${summary.waiting === 1 ? " has" : "s have"} a starting test so far.` : " No tests have been sat this year yet."}
        </p>
      </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <TabHelp content={growthHelp(audience)} />
      <section className={card}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xl font-extrabold tracking-tight">{title}</h3>
          <span className="text-sm text-slate-500">
            {summary.followed} students followed · {summary.tests} tests{summary.waiting ? ` · ${summary.waiting} waiting for a post-test` : ""}
          </span>
        </div>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
          <div>
            <p className="text-[15px] font-semibold text-slate-700">Average growth since their starting test</p>
            <p className="font-display text-5xl font-black tracking-tight text-[#121314]">{formatGrowth(summary.gained)} <span className="text-xl">levels</span></p>
          </div>
          <div className="border-l-2 border-dashed border-slate-300 pl-5">
            <p className="text-[15px] font-semibold text-slate-700">Expected over the same time</p>
            <p className="font-display text-5xl font-black tracking-tight text-slate-400">{formatGrowth(summary.expected)}</p>
          </div>
          <p className="max-w-xs pb-1 text-sm text-slate-500">A quarter of a level each term, counted from each student&apos;s starting test to their latest post-test or diagnostic.</p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PACE_ORDER.map((pace) => (
            <div key={pace} className="pl-4" style={{ boxShadow: `inset 4px 0 0 ${PACE_META[pace].bg}` }}>
              <p className="text-[15px] font-semibold text-slate-700">
                <span className="cursor-help border-b-2 border-dotted border-slate-400" title={`${PACE_META[pace].label}: ${PACE_META[pace].meaning}`}>{PACE_META[pace].label}</span>
              </p>
              <p className="font-display text-4xl font-black tracking-tight text-[#121314]">{Math.round((summary.pace[pace] / summary.followed) * 100)}%</p>
              <p className="text-sm text-slate-500">{summary.pace[pace]} student{summary.pace[pace] === 1 ? "" : "s"} · {PACE_META[pace].meaning}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.75fr_1fr]">
        <section className={card}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-xl font-extrabold tracking-tight">Growth through the year</h3>
            <span className="flex flex-wrap gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2"><span className="h-[3px] w-5 bg-[#121314]" />Average growth</span>
              <span className="inline-flex items-center gap-2"><span className="w-5 border-t-2 border-dashed border-slate-400" />Expected</span>
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-4 bg-[#B9F23F]/40" />On pace</span>
            </span>
          </div>
          <GrowthChart year={year} series={summary.series} comparisons={comparisons.map((row) => ({ label: row.name, series: row.series }))} />
        </section>

        <section className={card}>
          <h3 className="text-xl font-extrabold tracking-tight">Growth by strand</h3>
          <p className="text-sm text-slate-500">Levels gained · the mark is expected growth</p>
          <StrandBars strands={summary.strands} />
        </section>
      </div>

      <section className={card}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-xl font-extrabold tracking-tight">
            {breakdown === "years" ? "By school year" : breakdown === "classes" ? "By class" : "By student"}
          </h3>
          <span className="text-sm text-slate-500">
            {breakdown === "students" ? "Slowest pace first" : breakdown === "classes" ? "Students in this view only" : "Open a year to see its classes"}
          </span>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-2 pr-3">{firstColumn}</th>
                <th className="px-3 py-2">First → latest</th>
                <th className="px-3 py-2">Gained</th>
                <th className="px-3 py-2">Pace</th>
                <th className="px-3 py-2">Trend</th>
                <th className="py-2 pl-3"><span className="sr-only">Open</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-slate-100 hover:bg-[#FAFBF8]">
                  <td className="py-3 pr-3">
                    <span className="block font-bold text-[#121314]">{row.name}</span>
                    <span className="block text-xs text-slate-500">{row.sub}</span>
                  </td>
                  <td className="px-3 py-3 tabular-nums">{row.journey}</td>
                  <td className="px-3 py-3 font-display text-base font-extrabold tabular-nums">{formatGrowth(row.gained)}</td>
                  <td className="w-[30%] px-3 py-3">
                    {row.pace ? <PaceBar pace={row.pace} /> : row.studentPace ? (
                      <span className="rounded-full px-2.5 py-1 text-xs font-extrabold" style={{ background: PACE_META[row.studentPace].bg, color: PACE_META[row.studentPace].fg }}>{PACE_META[row.studentPace].label}</span>
                    ) : (
                      <span className="rounded-full bg-[#F1F2EE] px-2.5 py-1 text-xs font-bold text-slate-500">Waiting for a post-test</span>
                    )}
                  </td>
                  <td className="px-3 py-3"><Sparkline year={year} series={row.series} /></td>
                  <td className="py-3 pl-3 text-right">
                    {row.onOpen ? <button type="button" onClick={row.onOpen} className="font-bold text-[#3D6600] hover:underline">Open</button> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PaceBar({ pace }: { pace: Record<Pace, number> }) {
  const total = PACE_ORDER.reduce((sum, key) => sum + pace[key], 0);
  if (!total) return <span className="rounded-full bg-[#F1F2EE] px-2.5 py-1 text-xs font-bold text-slate-500">Waiting for post-tests</span>;
  return (
    <span className="flex h-5 overflow-hidden rounded-md bg-[#F1F2EE]">
      {PACE_ORDER.map((key) => {
        const pct = Math.round((pace[key] / total) * 100);
        if (!pct) return null;
        return (
          <span key={key} className="grid place-items-center text-[11px] font-extrabold" style={{ width: `${pct}%`, background: PACE_META[key].bg, color: PACE_META[key].fg }} title={`${PACE_META[key].label}: ${pace[key]}`}>
            {pct >= 14 ? `${pct}%` : ""}
          </span>
        );
      })}
    </span>
  );
}

function StrandBars({ strands }: { strands: GrowthSummary["strands"] }) {
  const scale = Math.max(1, ...strands.flatMap(([, row]) => [row.gained ?? 0, row.expected ?? 0]));
  return (
    <ul className="mt-4 space-y-4">
      {strands.map(([strand, row]) => {
        const pace = row.gained === null || row.expected === null ? null : paceFor(row.gained, row.expected);
        return (
          <li key={strand}>
            <span className="flex justify-between text-sm">
              <strong>{AC_STRANDS[strand].label}</strong>
              <span className="text-slate-500">
                {row.gained === null ? "No post-tests yet" : `${formatGrowth(row.gained)} · ${row.students} student${row.students === 1 ? "" : "s"}`}
                {row.students && row.students < 5 ? <span className="ml-1.5 rounded-full bg-[#F1F2EE] px-2 py-0.5 text-[11px] font-bold text-slate-500">small group</span> : null}
              </span>
            </span>
            <span className="relative mt-1.5 block h-3 rounded-full bg-[#F1F2EE]">
              {row.gained !== null && row.gained > 0 ? (
                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(row.gained / scale) * 100}%`, background: pace ? PACE_META[pace].bg : "#B9F23F" }} />
              ) : null}
              {row.expected !== null ? <span className="absolute -inset-y-1 w-0.5 bg-[#121314]" style={{ left: `${(row.expected / scale) * 100}%` }} title={`Expected ${formatGrowth(row.expected)}`} /> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

const W = 760;
const H = 300;
const PAD = { left: 48, right: 96, top: 28, bottom: 34 };

function GrowthChart({ year, series, comparisons }: { year: { startsOn: string; endsOn: string }; series: SeriesPoint[]; comparisons: Array<{ label: string; series: SeriesPoint[] }> }) {
  const { start, end } = yearBounds(year);
  const values = [...series, ...comparisons.flatMap((item) => item.series)].flatMap((point) => [point.gained, point.expected]).filter((value): value is number => value !== null);
  const lo = Math.min(-0.25, ...values) - 0.05;
  const hi = Math.max(1, ...values.map((value) => value + 0.3));
  const x = (at: number) => PAD.left + ((at - start) / (end - start)) * (W - PAD.left - PAD.right);
  const y = (value: number) => PAD.top + ((hi - value) / (hi - lo)) * (H - PAD.top - PAD.bottom);
  const line = (points: SeriesPoint[], key: "gained" | "expected") =>
    points.filter((point) => point[key] !== null).map((point, index) => `${index ? "L" : "M"}${x(point.at).toFixed(1)} ${y(point[key]!).toFixed(1)}`).join(" ");
  const withExpected = series.filter((point) => point.expected !== null);
  const band = withExpected.length
    ? `M${withExpected.map((point) => `${x(point.at).toFixed(1)} ${y(point.expected! + 0.25).toFixed(1)}`).join(" L")} L${[...withExpected].reverse().map((point) => `${x(point.at).toFixed(1)} ${y(point.expected! - 0.25).toFixed(1)}`).join(" L")} Z`
    : "";
  const ticks = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5].filter((tick) => tick >= lo && tick <= hi);
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(start);
    const at = Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + index, 15);
    return { at, label: new Intl.DateTimeFormat("en-AU", { month: "short", timeZone: "UTC" }).format(at).slice(0, 1) };
  });
  const last = series[series.length - 1];
  const lastGained = [...series].reverse().find((point) => point.gained !== null);

  // Line-end labels, nudged apart so they never overlap.
  const endLabels = [
    ...(lastGained ? [{ text: formatGrowth(lastGained.gained), at: lastGained.at, value: lastGained.gained!, main: true }] : []),
    ...comparisons.flatMap((item) => {
      const point = [...item.series].reverse().find((entry) => entry.gained !== null);
      return point ? [{ text: `${item.label} ${formatGrowth(point.gained)}`, at: point.at, value: point.gained!, main: false }] : [];
    }),
  ]
    .map((label) => ({ ...label, x: x(label.at) + 10, y: y(label.value) }))
    .sort((a, b) => a.y - b.y);
  endLabels.forEach((label, index) => {
    if (index && label.y < endLabels[index - 1].y + 15) label.y = endLabels[index - 1].y + 15;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label={`Average growth ${formatGrowth(lastGained?.gained ?? null)} levels, expected ${formatGrowth(lastGained?.expected ?? null)}`}>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={PAD.left} x2={W - PAD.right} y1={y(tick)} y2={y(tick)} stroke={tick === 0 ? "#D5D8D1" : "#ECEEE9"} />
          <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="12" fill="#8F948C">{tick === 0 ? "0" : `+${tick}`}</text>
        </g>
      ))}
      {months.map((month) => (
        <text key={month.at} x={x(month.at)} y={H - 10} textAnchor="middle" fontSize="12" fontWeight="600" fill="#8F948C">{month.label}</text>
      ))}
      {band ? <path d={band} fill="#B9F23F" fillOpacity="0.28" /> : null}
      <path d={line(series, "expected")} fill="none" stroke="#8F948C" strokeWidth="2" strokeDasharray="7 6" />
      {comparisons.map((item) => (
        <path key={item.label} d={line(item.series, "gained")} fill="none" stroke="#B8BCB4" strokeWidth="2" strokeLinejoin="round" />
      ))}
      <path d={line(series, "gained")} fill="none" stroke="#121314" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
      {series.filter((point) => point.gained !== null).map((point) => (
        <circle key={point.at} cx={x(point.at)} cy={y(point.gained!)} r="4" fill="#B9F23F" stroke="#121314" strokeWidth="2" />
      ))}
      {last ? (
        <g>
          <line x1={x(last.at)} x2={x(last.at)} y1={PAD.top - 8} y2={H - PAD.bottom} stroke="#121314" strokeDasharray="2 4" />
          <text x={x(last.at)} y={PAD.top - 12} textAnchor="middle" fontSize="12" fontWeight="700" fill="#121314">Today</text>
        </g>
      ) : null}
      {endLabels.map((label) => (
        <text key={label.text} x={label.x} y={label.y + 4} fontSize={label.main ? "13" : "12"} fontWeight={label.main ? "800" : "700"} fill={label.main ? "#121314" : "#8F948C"}>{label.text}</text>
      ))}
    </svg>
  );
}

function Sparkline({ year, series }: { year: { startsOn: string; endsOn: string }; series: SeriesPoint[] }) {
  const points = series.filter((point) => point.gained !== null);
  if (points.length === 0) return <span className="text-xs text-slate-400">—</span>;
  const { start } = yearBounds(year);
  const until = series[series.length - 1].at;
  const values = points.flatMap((point) => [point.gained!, point.expected!]);
  const lo = Math.min(-0.1, ...values);
  const hi = Math.max(0.5, ...values);
  const x = (at: number) => 4 + ((at - start) / Math.max(1, until - start)) * 112;
  const y = (value: number) => 30 - ((value - lo) / (hi - lo)) * 26;
  const path = (key: "gained" | "expected") => points.map((point, index) => `${index ? "L" : "M"}${x(point.at).toFixed(1)} ${y(point[key]!).toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 120 34" className="h-[34px] w-[120px]" aria-hidden="true">
      <path d={path("expected")} fill="none" stroke="#C9CDC5" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d={path("gained")} fill="none" stroke="#121314" strokeWidth="2" strokeLinejoin="round" />
      {points.length === 1 ? <circle cx={x(points[0].at)} cy={y(points[0].gained!)} r="2.5" fill="#121314" /> : null}
    </svg>
  );
}
