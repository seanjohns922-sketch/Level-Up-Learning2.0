"use client";

import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  GraduationCap,
  RefreshCw,
  Search,
  School,
  TrendingUp,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  SchoolAnalyticsSnapshot,
  SchoolHomeSnapshot,
} from "@/lib/school-platform-server";

type AnalyticsTab =
  | "overview"
  | "growth"
  | "curriculum"
  | "engagement"
  | "classes"
  | "students";

type SchoolAnalyticsDashboardProps = {
  schoolId: string;
  academicYearId: string;
  classes: Array<
    Pick<SchoolHomeSnapshot["classes"][number], "id" | "name" | "yearLevels">
  >;
};

const TABS: Array<{ id: AnalyticsTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "growth", label: "Growth" },
  { id: "curriculum", label: "Curriculum" },
  { id: "engagement", label: "Engagement" },
  { id: "classes", label: "Classes" },
  { id: "students", label: "Students" },
];

const REALMS: Record<string, string> = {
  number: "Number Nexus",
  measurement: "Measurelands",
  space: "Starpath",
};

const YEAR_LEVELS = [
  "Prep",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
];

const DATE_FORMATTER = new Intl.DateTimeFormat("en-AU", {
  day: "numeric",
  month: "short",
  timeZone: "Australia/Melbourne",
});

function formatPercent(value: number | null, suffix = "%") {
  return value === null ? "Not enough evidence" : `${value}${suffix}`;
}

function MetricCard({
  label,
  value,
  detail,
  definition,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  definition: string;
  icon: typeof Users;
}) {
  return (
    <article className="min-w-0 border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              {label}
            </p>
            <span title={definition}>
              <CircleHelp className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

function TrendChart({
  values,
  labels,
  emptyLabel,
  valueSuffix = "",
  onPointClick,
}: {
  values: number[];
  labels: string[];
  emptyLabel: string;
  valueSuffix?: string;
  onPointClick?: (index: number) => void;
}) {
  if (values.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center border border-dashed border-slate-300 bg-slate-50 px-5 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  const width = 640;
  const height = 180;
  const min = Math.min(0, ...values);
  const max = Math.max(...values, min + 1);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = 24 + (index * (width - 48)) / Math.max(values.length - 1, 1);
    const y = 20 + ((max - value) / range) * (height - 52);
    return { x, y, value };
  });
  const path = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="overflow-hidden border border-slate-200 bg-slate-50 p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full" role="img">
        <title>Trend from {labels[0]} to {labels.at(-1)}</title>
        {[0, 1, 2].map((line) => (
          <line
            key={line}
            x1="24"
            x2={width - 24}
            y1={24 + line * 56}
            y2={24 + line * 56}
            stroke="#dbe3ea"
            strokeWidth="1"
          />
        ))}
        <polyline
          fill="none"
          stroke="#059669"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={path}
        />
        {points.map((point, index) => (
          <g
            key={`${labels[index]}-${index}`}
            role={onPointClick ? "button" : undefined}
            tabIndex={onPointClick ? 0 : undefined}
            className={onPointClick ? "cursor-pointer" : undefined}
            onClick={() => onPointClick?.(index)}
            onKeyDown={(event) => {
              if (onPointClick && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onPointClick(index);
              }
            }}
            aria-label={onPointClick ? `Open details for ${labels[index]}` : undefined}
          >
            <circle cx={point.x} cy={point.y} r="5" fill="#fff" stroke="#059669" strokeWidth="3" />
            <title>{`${labels[index]}: ${point.value}${valueSuffix}`}</title>
          </g>
        ))}
        <text x="24" y={height - 5} fontSize="12" fill="#64748b">{labels[0]}</text>
        <text x={width - 24} y={height - 5} textAnchor="end" fontSize="12" fill="#64748b">
          {labels.at(-1)}
        </text>
      </svg>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="space-y-5" aria-label="Loading school analytics">
      <div className="h-14 animate-pulse bg-slate-200" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-32 animate-pulse bg-slate-200" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-72 animate-pulse bg-slate-200" />
        <div className="h-72 animate-pulse bg-slate-200" />
      </div>
    </div>
  );
}

export default function SchoolAnalyticsDashboard({
  schoolId,
  academicYearId,
  classes,
}: SchoolAnalyticsDashboardProps) {
  const [tab, setTab] = useState<AnalyticsTab>("overview");
  const [days, setDays] = useState(30);
  const [yearLevel, setYearLevel] = useState("");
  const [classId, setClassId] = useState("");
  const [realmId, setRealmId] = useState("");
  const [snapshot, setSnapshot] = useState<SchoolAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentSort, setStudentSort] = useState<"name" | "accuracy" | "activity" | "growth">("name");
  const [studentSearch, setStudentSearch] = useState("");

  const loadAnalytics = useCallback(async () => {
    if (!academicYearId) return;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      academicYearId,
      days: String(days),
    });
    if (yearLevel) params.set("yearLevel", yearLevel);
    if (classId) params.set("classId", classId);
    if (realmId) params.set("realmId", realmId);

    try {
      const response = await fetch(`/api/school/${schoolId}/analytics?${params}`, {
        credentials: "same-origin",
      });
      const result = (await response.json()) as SchoolAnalyticsSnapshot & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "School analytics could not be loaded.");
      setSnapshot(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "School analytics could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [academicYearId, classId, days, realmId, schoolId, yearLevel]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    if (classId && !classes.some((item) => item.id === classId)) setClassId("");
  }, [classId, classes]);

  useEffect(() => {
    if (selectedStudentId && !snapshot?.students.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId("");
    }
  }, [selectedStudentId, snapshot?.students]);

  const selectedStudent = snapshot?.students.find((student) => student.id === selectedStudentId) ?? null;
  const sortedStudents = useMemo(() => {
    const query = studentSearch.trim().toLocaleLowerCase("en-AU");
    const students = (snapshot?.students ?? []).filter((student) => {
      if (!query) return true;
      const realmEvidence = student.realms.map((realm) => `${REALMS[realm.realmId] ?? realm.realmId} ${realm.currentLevel ?? ""} ${realm.pathwayStatus ?? ""}`).join(" ");
      return `${student.name} ${student.yearLevel ?? ""} ${student.className} ${student.status} ${realmEvidence}`
        .toLocaleLowerCase("en-AU")
        .includes(query);
    });
    return students.sort((a, b) => {
      if (studentSort === "accuracy") return (b.averageAccuracy ?? -1) - (a.averageAccuracy ?? -1);
      if (studentSort === "growth") return (b.averageGrowth ?? -999) - (a.averageGrowth ?? -999);
      if (studentSort === "activity") {
        return (b.lastActive ? Date.parse(b.lastActive) : 0) - (a.lastActive ? Date.parse(a.lastActive) : 0);
      }
      return a.name.localeCompare(b.name);
    });
  }, [snapshot?.students, studentSearch, studentSort]);

  const strongestRealm = useMemo(
    () => [...(snapshot?.realms ?? [])].filter((realm) => realm.averageAccuracy !== null).sort((a, b) => (b.averageAccuracy ?? 0) - (a.averageAccuracy ?? 0))[0],
    [snapshot?.realms],
  );
  const priorityRealm = useMemo(
    () => [...(snapshot?.realms ?? [])].filter((realm) => realm.averageAccuracy !== null).sort((a, b) => (a.averageAccuracy ?? 0) - (b.averageAccuracy ?? 0))[0],
    [snapshot?.realms],
  );

  if (loading && !snapshot) return <LoadingView />;

  if (error && !snapshot) {
    return (
      <div className="border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-bold text-red-900">School analytics are temporarily unavailable</h2>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button type="button" onClick={() => void loadAnalytics()} className="mt-4 inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-bold text-white">
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  if (!snapshot) return null;

  const activeRate = snapshot.overview.students
    ? Math.round((snapshot.overview.activeThisWeek / snapshot.overview.students) * 100)
    : 0;
  const targetRate = snapshot.overview.students
    ? Math.round((snapshot.overview.weeklyTargetMet / snapshot.overview.students) * 100)
    : 0;
  const onTrackRate = snapshot.overview.students
    ? Math.round((snapshot.overview.onTrack / snapshot.overview.students) * 100)
    : 0;

  return (
    <section className="space-y-6">
      <div className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
            School year level
            <select value={yearLevel} onChange={(event) => { setYearLevel(event.target.value); setClassId(""); }} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-800">
              <option value="">Whole school</option>
              {YEAR_LEVELS.map((level) => <option key={level}>{level}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
            Class
            <select value={classId} onChange={(event) => setClassId(event.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-800">
              <option value="">All classes</option>
              {classes.filter((item) => !yearLevel || item.yearLevels.includes(yearLevel)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
            Realm
            <select value={realmId} onChange={(event) => setRealmId(event.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-800">
              <option value="">All realms</option>
              {Object.entries(REALMS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
          <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">
            Reporting window
            <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-slate-800">
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </label>
        </div>
        {loading ? <div className="mt-3 h-1 animate-pulse bg-emerald-300" /> : null}
      </div>

      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200" aria-label="School analytics views">
        {TABS.map((item) => (
          <button key={item.id} type="button" onClick={() => { setTab(item.id); setSelectedStudentId(""); }} className={`min-w-max border-b-2 px-4 py-3 text-sm font-bold ${tab === item.id ? "border-emerald-700 text-emerald-800" : "border-transparent text-slate-500 hover:text-slate-900"}`}>
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "overview" ? (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <MetricCard label="Students" value={snapshot.overview.students} detail="Current school cohort" definition="Active school-entitled students in the selected academic year. Home-only students are excluded." icon={Users} />
            <MetricCard label="Active this week" value={snapshot.overview.activeThisWeek} detail={`${activeRate}% of students`} definition="Students with canonical lesson, quiz or assessment activity in the last 7 days." icon={Activity} />
            <MetricCard label="Weekly target met" value={snapshot.overview.weeklyTargetMet} detail={`${targetRate}% completed 3+ lessons`} definition={snapshot.methodology.weeklyTarget} icon={CheckCircle2} />
            <MetricCard label="On track" value={snapshot.overview.onTrack} detail={`${onTrackRate}% with recent evidence`} definition={snapshot.methodology.onTrack} icon={UserRoundCheck} />
            <MetricCard label="Levels mastered" value={snapshot.overview.levelsMastered} detail="Latest post-tests at 85%+" definition={snapshot.methodology.mastery} icon={GraduationCap} />
            <MetricCard label="Average growth" value={formatPercent(snapshot.overview.averageGrowth, " pts")} detail={`${snapshot.overview.matchedGrowthPairs} matched pairs`} definition={snapshot.methodology.growth} icon={TrendingUp} />
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <article className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="font-bold text-slate-950">Learning engagement</h3><p className="mt-1 text-sm text-slate-500">Active students by learning day.</p></div>
                <button type="button" onClick={() => setTab("engagement")} className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">Explore <ChevronRight className="h-4 w-4" /></button>
              </div>
              <div className="mt-4"><TrendChart values={snapshot.engagementTrend.map((point) => point.activeStudents)} labels={snapshot.engagementTrend.map((point) => DATE_FORMATTER.format(new Date(point.date)))} emptyLabel="No learning activity is recorded in this reporting window." onPointClick={() => setTab("engagement")} /></div>
            </article>
            <article className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div><h3 className="font-bold text-slate-950">Measured growth</h3><p className="mt-1 text-sm text-slate-500">Matched pre-test to post-test change.</p></div>
                <button type="button" onClick={() => setTab("growth")} className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">Explore <ChevronRight className="h-4 w-4" /></button>
              </div>
              <div className="mt-4"><TrendChart values={snapshot.growthTrend.flatMap((point) => point.averageGrowth === null ? [] : [point.averageGrowth])} labels={snapshot.growthTrend.filter((point) => point.averageGrowth !== null).map((point) => DATE_FORMATTER.format(new Date(point.date)))} emptyLabel="Growth appears after students complete matched pre-tests and post-tests." valueSuffix=" points" onPointClick={() => setTab("growth")} /></div>
            </article>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
            <article className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between"><h3 className="font-bold">Realm evidence</h3><button type="button" onClick={() => setTab("curriculum")} className="text-sm font-bold text-emerald-700">Curriculum view</button></div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {snapshot.realms.map((realm) => (
                  <button key={realm.realmId} type="button" onClick={() => { setRealmId(realm.realmId); setTab("growth"); }} className="border border-slate-200 p-4 text-left hover:border-emerald-500 hover:bg-emerald-50">
                    <p className="font-bold text-slate-950">{REALMS[realm.realmId] ?? realm.realmId}</p>
                    <p className="mt-3 text-2xl font-bold">{formatPercent(realm.averageAccuracy)}</p>
                    <p className="mt-1 text-xs text-slate-500">{realm.activeStudents} active · {realm.lessons} lessons · {realm.quizzes} quizzes</p>
                  </button>
                ))}
                {snapshot.realms.length === 0 ? <p className="text-sm text-slate-500">No realm evidence in this reporting window.</p> : null}
              </div>
            </article>
            <article className="border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-bold">Decision snapshot</h3>
              <div className="mt-4 space-y-4 text-sm">
                <div><p className="text-xs font-bold uppercase tracking-[0.1em] text-emerald-700">Strongest evidence</p><p className="mt-1 font-semibold">{strongestRealm ? `${REALMS[strongestRealm.realmId] ?? strongestRealm.realmId} · ${strongestRealm.averageAccuracy}%` : "Not enough evidence"}</p></div>
                <div><p className="text-xs font-bold uppercase tracking-[0.1em] text-amber-700">Priority for review</p><p className="mt-1 font-semibold">{priorityRealm ? `${REALMS[priorityRealm.realmId] ?? priorityRealm.realmId} · ${priorityRealm.averageAccuracy}%` : "Not enough evidence"}</p></div>
              </div>
            </article>
          </div>
        </div>
      ) : null}

      {tab === "growth" ? (
        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <article className="border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-bold">School growth trend</h3><p className="mt-1 text-sm text-slate-500">Only matched pre-test and post-test pairs are included.</p><div className="mt-4"><TrendChart values={snapshot.growthTrend.flatMap((point) => point.averageGrowth === null ? [] : [point.averageGrowth])} labels={snapshot.growthTrend.filter((point) => point.averageGrowth !== null).map((point) => DATE_FORMATTER.format(new Date(point.date)))} emptyLabel="No matched pre-test and post-test pairs in this view." valueSuffix=" points" /></div></article>
          <article className="border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-bold">Growth by realm</h3><div className="mt-4 space-y-3">{snapshot.realms.map((realm) => <button key={realm.realmId} type="button" onClick={() => setRealmId(realm.realmId)} className="flex w-full items-center justify-between border-b border-slate-100 py-3 text-left"><span className="font-semibold">{REALMS[realm.realmId] ?? realm.realmId}</span><span className="font-bold text-emerald-700">{formatPercent(realm.averageGrowth, " pts")}</span></button>)}</div><p className="mt-5 text-xs leading-5 text-slate-500">{snapshot.methodology.growth}</p></article>
        </div>
      ) : null}

      {tab === "curriculum" ? (
        <article className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="p-5"><h3 className="font-bold">Curriculum evidence heatmap</h3><p className="mt-1 text-sm text-slate-500">Observed performance by lesson topic and school year. This reports evidence, not a curriculum-coverage claim.</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.1em] text-slate-500"><tr><th className="px-5 py-3">Skill group</th><th className="px-4 py-3">Year</th><th className="px-4 py-3">Students</th><th className="px-4 py-3">Evidence</th><th className="px-4 py-3">Accuracy</th><th className="px-4 py-3"><span className="sr-only">Drill down</span></th></tr></thead><tbody>{snapshot.curriculum.map((row) => { const accuracy = row.averageAccuracy ?? 0; const shade = row.averageAccuracy === null ? "bg-slate-100" : accuracy >= 85 ? "bg-emerald-100 text-emerald-900" : accuracy >= 70 ? "bg-amber-100 text-amber-900" : "bg-red-100 text-red-900"; return <tr key={`${row.topic}-${row.yearLevel}`} className="border-t border-slate-100"><td className="px-5 py-3 font-semibold">{row.topic}</td><td className="px-4 py-3">{row.yearLevel ?? "Not recorded"}</td><td className="px-4 py-3">{row.students}</td><td className="px-4 py-3">{row.evidenceCount}</td><td className="px-4 py-3"><span className={`inline-flex min-w-20 justify-center rounded-md px-3 py-1 font-bold ${shade}`}>{formatPercent(row.averageAccuracy)}</span></td><td className="px-4 py-3 text-right"><button type="button" onClick={() => { if (row.yearLevel) setYearLevel(row.yearLevel); setTab("students"); }} className="inline-flex items-center gap-1 font-bold text-emerald-700">View students <ChevronRight className="h-4 w-4" /></button></td></tr>; })}</tbody></table></div>
          {snapshot.curriculum.length === 0 ? <p className="p-5 text-sm text-slate-500">No curriculum evidence in this reporting window.</p> : null}
        </article>
      ) : null}

      {tab === "engagement" ? (
        <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><MetricCard label="Active learners" value={snapshot.engagement.activeLearners} detail={`Last ${days} days`} definition="Distinct students with canonical learning activity in the reporting window." icon={Users} /><MetricCard label="Learning days" value={snapshot.engagement.averageLearningDays ?? "—"} detail="Average per active learner" definition="Distinct calendar days with learning activity, averaged across active learners." icon={Activity} /><MetricCard label="Returning learners" value={snapshot.engagement.returningLearners} detail="Active on 2+ days" definition="Students with learning activity on at least two distinct days." icon={UserRoundCheck} /><MetricCard label="Lessons" value={snapshot.engagement.lessonsCompleted} detail="Unique lesson completions" definition={snapshot.methodology.lessonDeduplication} icon={BookOpenCheck} /><MetricCard label="Quizzes" value={snapshot.engagement.quizzesCompleted} detail="Unique weekly quizzes" definition={snapshot.methodology.quizDeduplication} icon={BarChart3} /></div><article className="border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-bold">Engagement trend</h3><div className="mt-4"><TrendChart values={snapshot.engagementTrend.map((point) => point.activeStudents)} labels={snapshot.engagementTrend.map((point) => DATE_FORMATTER.format(new Date(point.date)))} emptyLabel="No engagement is recorded in this reporting window." /></div></article></div>
      ) : null}

      {tab === "classes" ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.classes.map((item) => {
            const classActiveRate = item.students
              ? Math.round((item.activeStudents / item.students) * 100)
              : 0;
            return (
              <button
                key={item.id ?? item.name}
                type="button"
                onClick={() => {
                  if (item.id) setClassId(item.id);
                  setTab("students");
                }}
                className="border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-emerald-500 hover:bg-emerald-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-950">{item.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">Open student evidence</p>
                  </div>
                  <School className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <p className="text-slate-500">Active this week</p>
                    <p className="font-bold">{item.activeStudents} of {item.students} ({classActiveRate}%)</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Weekly target</p>
                    <p className="font-bold">{item.weeklyTargetMet} students</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Average accuracy</p>
                    <p className="font-bold">{formatPercent(item.averageAccuracy)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Levels mastered</p>
                    <p className="font-bold">{item.masteredLevels}</p>
                  </div>
                  <div className="col-span-2 border-t border-slate-100 pt-3">
                    <p className="text-slate-500">Matched assessment growth</p>
                    <p className="font-bold text-emerald-700">{formatPercent(item.averageGrowth, " pts")}</p>
                  </div>
                </div>
              </button>
            );
          })}
          {snapshot.classes.length === 0 ? (
            <p className="text-sm text-slate-500">No classes match these filters.</p>
          ) : null}
        </div>
      ) : null}

      {tab === "students" ? (
        selectedStudent ? (
          <article className="border border-slate-200 bg-white p-5 shadow-sm">
            <button
              type="button"
              onClick={() => setSelectedStudentId("")}
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" /> Students
            </button>
            <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-emerald-700">Student evidence</p>
                <h3 className="mt-1 text-2xl font-bold">{selectedStudent.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedStudent.yearLevel ?? "Year not recorded"} · {selectedStudent.className || "No class"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] ${selectedStudent.status === "on_track" ? "bg-emerald-100 text-emerald-800" : selectedStudent.status === "needs_attention" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"}`}>
                  {selectedStudent.status === "on_track" ? "On track" : selectedStudent.status === "needs_attention" ? "Needs attention" : "Active"}
                </span>
                <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {selectedStudent.weeklyTargetMet ? "Weekly target met" : "Weekly target not yet met"}
                </span>
              </div>
            </div>
            <div className="mt-6 grid gap-3 lg:grid-cols-3">
              {selectedStudent.realms.map((realm) => (
                <div key={realm.realmId} className="border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold">{REALMS[realm.realmId] ?? realm.realmId}</p>
                    {realm.mastered ? (
                      <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">Mastered</span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-2xl font-bold">{formatPercent(realm.averageAccuracy)}</p>
                  <p className="mt-1 text-xs text-slate-500">{realm.activities} canonical evidence points</p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-slate-100 pt-3 text-xs">
                    <div><dt className="text-slate-500">Current</dt><dd className="mt-0.5 font-semibold">{realm.currentLevel ?? "Not placed"}{realm.currentWeek ? ` · Week ${realm.currentWeek}` : ""}</dd></div>
                    <div><dt className="text-slate-500">Pathway</dt><dd className="mt-0.5 font-semibold">{realm.pathwayStatus ?? "Not recorded"}</dd></div>
                    <div><dt className="text-slate-500">Pre-test</dt><dd className="mt-0.5 font-semibold">{formatPercent(realm.pretestScore)}</dd></div>
                    <div><dt className="text-slate-500">Post-test</dt><dd className="mt-0.5 font-semibold">{formatPercent(realm.posttestScore)}</dd></div>
                    <div className="col-span-2"><dt className="text-slate-500">Matched growth</dt><dd className="mt-0.5 font-semibold text-emerald-700">{formatPercent(realm.growth, " pts")}</dd></div>
                  </dl>
                </div>
              ))}
              {selectedStudent.realms.length === 0 ? (
                <p className="text-sm text-slate-500">No realm evidence matches the selected filters.</p>
              ) : null}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Learning days" value={selectedStudent.learningDays} detail={`Last ${days} days`} definition="Distinct learning days in this reporting window." icon={Activity} />
              <MetricCard label="Realms used" value={selectedStudent.realmsUsed} detail="With canonical activity" definition="Distinct realms with learning evidence in this reporting window." icon={BookOpenCheck} />
              <MetricCard label="Levels mastered" value={selectedStudent.masteredLevels} detail="Latest post-tests at 85%+" definition={snapshot.methodology.mastery} icon={GraduationCap} />
              <MetricCard label="Average growth" value={formatPercent(selectedStudent.averageGrowth, " pts")} detail="Matched assessment pairs" definition={snapshot.methodology.growth} icon={TrendingUp} />
            </div>
          </article>
        ) : (
          <article className="overflow-hidden border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-3 p-5">
              <div>
                <h3 className="font-bold">Student evidence</h3>
                <p className="mt-1 text-sm text-slate-500">Search or open a student to inspect realm and assessment evidence.</p>
              </div>
              <div className="flex w-full flex-wrap gap-2 lg:w-auto">
                <label className="relative min-w-0 flex-1 lg:w-72">
                  <span className="sr-only">Search students</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={studentSearch}
                    onChange={(event) => setStudentSearch(event.target.value)}
                    placeholder="Search name, class, level or pathway"
                    className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm"
                  />
                </label>
                <select
                  value={studentSort}
                  onChange={(event) => setStudentSort(event.target.value as typeof studentSort)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold"
                >
                  <option value="name">Sort by name</option>
                  <option value="accuracy">Sort by accuracy</option>
                  <option value="activity">Sort by recent activity</option>
                  <option value="growth">Sort by growth</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[940px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.1em] text-slate-500">
                  <tr><th className="px-5 py-3">Student</th><th className="px-4 py-3">Year</th><th className="px-4 py-3">Class</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Accuracy</th><th className="px-4 py-3">Mastered</th><th className="px-4 py-3">Growth</th><th className="px-4 py-3"><span className="sr-only">Open</span></th></tr>
                </thead>
                <tbody>
                  {sortedStudents.map((student) => (
                    <tr key={student.id} className="border-t border-slate-100 hover:bg-emerald-50">
                      <td className="px-5 py-3 font-semibold">{student.name}</td>
                      <td className="px-4 py-3">{student.yearLevel ?? "—"}</td>
                      <td className="px-4 py-3">{student.className || "—"}</td>
                      <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-bold ${student.status === "on_track" ? "bg-emerald-100 text-emerald-800" : student.status === "needs_attention" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"}`}>{student.status === "on_track" ? "On track" : student.status === "needs_attention" ? "Needs attention" : "Active"}</span></td>
                      <td className="px-4 py-3">{formatPercent(student.averageAccuracy)}</td>
                      <td className="px-4 py-3">{student.masteredLevels}</td>
                      <td className="px-4 py-3">{formatPercent(student.averageGrowth, " pts")}</td>
                      <td className="px-4 py-3 text-right"><button type="button" onClick={() => setSelectedStudentId(student.id)} className="inline-flex items-center gap-1 font-bold text-emerald-700">View <ChevronRight className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sortedStudents.length === 0 ? (
              <p className="border-t border-slate-100 p-5 text-sm text-slate-500">No students match this view.</p>
            ) : null}
          </article>
        )
      ) : null}
    </section>
  );
}
