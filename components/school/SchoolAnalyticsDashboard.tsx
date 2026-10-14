"use client";

import {
  Activity,
  ArrowLeft,
  BookOpenCheck,
  ChevronRight,
  CircleHelp,
  Download,
  GraduationCap,
  RefreshCw,
  Search,
  School,
  TrendingUp,
  Users,
} from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import type {
  SchoolAnalyticsSnapshot,
  SchoolHomeSnapshot,
  StudentLearningJourney,
} from "@/lib/school-platform-server";
import LeaderOverview from "./analytics/LeaderOverview";
import GrowthView from "./analytics/GrowthView";
import { usesTestHistory } from "@/lib/growth";
import TabHelp from "./analytics/TabHelp";
import { classesHelp, curriculumHelp, interventionHelp, placementHelp, studentsHelp } from "@/lib/analytics-help";
import { STANDING_META, evidencedLevel, standingsFor, studentStandings, usesTests, type Standing } from "@/lib/proficiency";
import { useClassGroups } from "./useClassGroups";
import { assetUrl, openDocumentWindow, writeDocument } from "@/lib/documents/reliq-document";
import { learningJourneyHtml, placementBaselineHtml, studentProgressReportHtml } from "@/lib/documents/school-reports";
import {
  type AcStrand,
  AC_STRANDS,
  realmForStrand,
  strandForRealm,
} from "@/lib/curriculum/ac-standards";

type AnalyticsTab =
  | "overview"
  | "growth"
  | "curriculum"
  | "placement"
  | "intervention"
  | "classes"
  | "students";

type SchoolAnalyticsDashboardProps = {
  schoolId: string;
  academicYearId: string;
  classes: Array<
    Pick<SchoolHomeSnapshot["classes"][number], "id" | "name" | "yearLevels">
  >;
  audience?: "leadership" | "teacher";
  teacherClassIds?: string[];
  /** First day of the academic year (YYYY-MM-DD); enables "This school year". */
  academicYearStart?: string;
  /** School name and logo for the letterhead of printed documents. */
  schoolName?: string | null;
  schoolLogo?: { src: string; alt: string } | null;
};

/** "This school year" asks for the longest window; the analytics function
 * bounds every window by the selected academic year's start and end. */
const WHOLE_YEAR_DAYS = 400;

const TABS: Array<{ id: AnalyticsTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "growth", label: "Growth" },
  { id: "curriculum", label: "Curriculum" },
  { id: "placement", label: "Placement" },
  { id: "intervention", label: "Intervention" },
  { id: "classes", label: "Classes" },
  { id: "students", label: "Students" },
];

const REALMS: Record<string, string> = {
  number: "Number Nexus",
  measurement: "Measurelands",
  space: "Starpath",
  statistics: "Statistica",
  pattern: "Pattern Peaks",
  chance: "Chance Hollow",
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

// Level standing = working level vs the student's school grade. This is what
// "at standard" means to a school: a Grade 3 working at Level 3 is AT level; a
// Grade 4 at Level 3 is BEHIND; a Grade 3 at Level 4 is ABOVE. (The post-test %
// says how securely they hold a level; this says whether they're on track for
// their age.)
type LevelStanding = "below" | "at" | "above";
// One ladder for school years (Prep–Year 6) and working levels (up to Level 8),
// so a Year 6 student working at Level 7 reads as above level.
const SCHOOL_LEVEL_ORDER = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8"];
const PLACEMENT_LEVEL_COLUMNS = [...SCHOOL_LEVEL_ORDER, "Not placed"];
const levelIndex = (year: string | null | undefined) => (year ? SCHOOL_LEVEL_ORDER.indexOf(year) : -1);
function levelStanding(grade: string | null | undefined, working: string | null | undefined): LevelStanding | null {
  const g = levelIndex(grade);
  const w = levelIndex(working);
  if (g < 0 || w < 0) return null;
  return w > g ? "above" : w < g ? "below" : "at";
}

function realmStanding(yearLevel: string | null, realm: { realmId: string; currentLevel: string | null; pretestScore: number | null }): LevelStanding | null {
  const level = evidencedLevel(realm);
  return level === undefined ? null : levelStanding(yearLevel, level);
}
// Green ramp for ordinal levels in the placement view (Prep palest, Year 8
// darkest): adult screens use green; violet is for students.
const LEVEL_RAMP = ["#F1F9E3", "#DDF2B5", "#C6EA86", "#A9DB57", "#86C232", "#649A1E", "#477315", "#2F4F0D", "#1C3207"];
// Colour a level/grade by its position on the Ground->Year 6 ladder, so the
// school-grade bar and the working-level bar share colours (Year 3 == Level 3)
// and any mismatch between them reads as a colour shift.
const levelColor = (level: string) => { const i = levelIndex(level); return i >= 0 ? LEVEL_RAMP[i] : "#F1F2EE"; };
// School grade -> working level cell, in the standings colours: one level
// below is amber, two or more coral, the expected level lime (outlined),
// above Carbon. Not placed is grey.
function placementCell(grade: string, level: string, count: number) {
  const g = levelIndex(grade);
  const w = levelIndex(level);
  if (!count) return { bg: "#F8F9F6", fg: "#C9CDC5", border: "#ECEEE9" };
  if (g < 0 || w < 0) return { bg: "#E9EBE5", fg: "#3A3D40", border: "#D5D8D1" };
  if (w < g - 1) return { bg: "#F2998D", fg: "#4A0F09", border: "#E98576" };
  if (w < g) return { bg: "#FFD866", fg: "#3F2E00", border: "#F2C94C" };
  if (w === g) return { bg: "#B9F23F", fg: "#121314", border: "#121314" };
  return { bg: "#121314", fg: "#FFFFFF", border: "#121314" };
}


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
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[15px] font-medium text-slate-500">
              {label}
            </p>
            <span title={definition}>
              <CircleHelp className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            </span>
          </div>
          <p className={`mt-2 font-display font-black tracking-tight text-[#121314] ${String(value).length > 8 ? "text-lg leading-snug" : "text-3xl"}`}>{value}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F1F2EE] text-slate-600">
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
      <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-[#FAFBF8] px-5 text-center text-sm text-slate-500">
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
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#FAFBF8] p-3">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full" role="img">
        <title>Trend from {labels[0]} to {labels.at(-1)}</title>
        {[0, 1, 2].map((line) => (
          <line
            key={line}
            x1="24"
            x2={width - 24}
            y1={24 + line * 56}
            y2={24 + line * 56}
            stroke="#E3E5E0"
            strokeWidth="1"
          />
        ))}
        <polyline
          fill="none"
          stroke="#121314"
          strokeWidth="2.5"
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
            <circle cx={point.x} cy={point.y} r="5" fill="#B9F23F" stroke="#121314" strokeWidth="2" />
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
  audience = "leadership",
  teacherClassIds = [],
  academicYearStart,
  schoolName = null,
  schoolLogo = null,
}: SchoolAnalyticsDashboardProps) {
  const [tab, setTab] = useState<AnalyticsTab>("overview");
  const documentBrand = () => ({
    schoolName,
    schoolLogo: schoolLogo ? { src: assetUrl(schoolLogo.src, window.location.origin), alt: schoolLogo.alt } : null,
  });
  const [period, setPeriod] = useState<"year" | 7 | 30 | 90>(academicYearStart ? "year" : 90);
  const days = period === "year" ? WHOLE_YEAR_DAYS : period;
  const periodLabel = period === "year" ? "This school year" : `Last ${days} days`;
  const [yearLevel, setYearLevel] = useState("");
  // Teachers start on their own class; leaders start on the whole school.
  const [classId, setClassId] = useState(audience === "teacher" ? teacherClassIds[0] ?? "" : "");
  const [realmId, setRealmId] = useState("");
  const [snapshot, setSnapshot] = useState<SchoolAnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentSort, setStudentSort] = useState<"name" | "accuracy" | "activity" | "growth">("name");
  const [studentSearch, setStudentSearch] = useState("");
  const teacherClassIdSet = useMemo(() => new Set(teacherClassIds), [teacherClassIds]);
  const { groups: classGroups } = useClassGroups(schoolId, academicYearId);
  // Three views: a teacher's own class, a class group (its year levels), and
  // the whole school for leaders. "own" is the class or the whole school.
  const viewGroups = useMemo(
    () => (audience === "teacher" ? classGroups.filter((group) => group.classIds.some((id) => teacherClassIdSet.has(id))) : classGroups),
    [audience, classGroups, teacherClassIdSet],
  );
  // "class": one of the user's own classes (teachers, and leaders who teach).
  // "school": the whole school (leaders, and teachers who want to look wider).
  // Anything else is a class group id.
  const hasMyClass = teacherClassIds.length > 0;
  const [view, setView] = useState<string>(audience === "teacher" && hasMyClass ? "class" : "school");
  const activeGroup = view === "class" || view === "school" ? undefined : viewGroups.find((group) => group.id === view);
  // What the screen is about follows the view, not the person's role.
  const viewAudience: "teacher" | "leadership" = view === "class" ? "teacher" : "leadership";
  const viewOptions = [
    ...(audience === "teacher"
      ? [...(hasMyClass ? [{ id: "class", label: "My class" }] : []), { id: "school", label: "Whole school" }]
      : [{ id: "school", label: "Whole school" }, ...(hasMyClass ? [{ id: "class", label: "My class" }] : [])]),
    ...viewGroups.map((group) => ({ id: group.id, label: group.name })),
  ];
  const effectiveClassId = activeGroup ? "" : classId;
  const effectiveYearLevel = activeGroup ? "" : yearLevel;

  const loadAnalytics = useCallback(async () => {
    if (!academicYearId) return;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      academicYearId,
      days: String(days),
    });
    if (effectiveYearLevel) params.set("yearLevel", effectiveYearLevel);
    if (effectiveClassId) params.set("classId", effectiveClassId);
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
  }, [academicYearId, days, effectiveClassId, effectiveYearLevel, realmId, schoolId]);

  const buildExportHref = useCallback((type: "students" | "curriculum" | "results") => {
    if (!academicYearId) return "";
    const params = new URLSearchParams({ academicYearId, days: String(days), type });
    if (yearLevel) params.set("yearLevel", yearLevel);
    if (classId) params.set("classId", classId);
    if (realmId) params.set("realmId", realmId);
    return `/api/school/${schoolId}/analytics/export?${params}`;
  }, [academicYearId, classId, days, realmId, schoolId, yearLevel]);
  const exportHref = buildExportHref(tab === "curriculum" ? "curriculum" : "students");
  const resultsHref = buildExportHref("results");

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    if (classId && !classes.some((item) => item.id === classId)) setClassId(viewAudience === "teacher" ? teacherClassIds[0] ?? "" : "");
  }, [viewAudience, classId, classes, teacherClassIds]);

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

  const downloadStudentReportPdf = (student: SchoolAnalyticsSnapshot["students"][number]) => {
    if (!snapshot) return;
    const win = openDocumentWindow();
    if (!win) return;
    writeDocument(win, studentProgressReportHtml({
      brand: documentBrand(),
      student,
      year: usesTests(snapshot) ? snapshot.academicYear ?? null : null,
      windowLabel: periodLabel,
    }));
  };

  const openLearningJourney = async (studentId: string) => {
    const win = openDocumentWindow();
    if (!win) return;
    try {
      const response = await fetch(`/api/school/${schoolId}/student/${studentId}/journey`, { credentials: "same-origin" });
      const result = (await response.json()) as StudentLearningJourney & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Learning journey unavailable.");
      writeDocument(win, learningJourneyHtml({ brand: documentBrand(), journey: result }));
    } catch {
      win.document.body.innerHTML = '<p style="font-family:system-ui;padding:40px;color:#a33">Could not generate the learning journey. Please try again.</p>';
    }
  };

  // Standing per AC9 strand and school year: the same latest-test standings as
  // the Overview (each student once per strand), or working level against
  // school year before test results are available.
  const curriculumUsesTests = snapshot ? usesTests(snapshot) : false;
  const curriculumStandings = standingsFor(curriculumUsesTests);
  const standingByStrand = useMemo(() => {
    const students = snapshot?.analysisStudents ?? [];
    const year = snapshot && usesTests(snapshot) ? snapshot.academicYear ?? null : null;
    type Counts = Record<Standing, number>;
    const empty = (): Counts => ({ wellBelow: 0, below: 0, at: 0, above: 0 });
    const groups = new Map<AcStrand, { strand: AcStrand; label: string; order: number; counts: Counts; total: number; byGrade: Map<string, { counts: Counts; total: number }> }>();
    for (const student of students) {
      const grade = student.yearLevel ?? "Not recorded";
      for (const [strand, standing] of studentStandings(student, year).strands) {
        const group = groups.get(strand) ?? { strand, label: AC_STRANDS[strand].label, order: AC_STRANDS[strand].order, counts: empty(), total: 0, byGrade: new Map() };
        group.counts[standing] += 1; group.total += 1;
        const gradeRow = group.byGrade.get(grade) ?? { counts: empty(), total: 0 };
        gradeRow.counts[standing] += 1; gradeRow.total += 1;
        group.byGrade.set(grade, gradeRow);
        groups.set(strand, group);
      }
    }
    return [...groups.values()]
      .map((group) => ({
        ...group,
        onTrackPct: group.total ? Math.round(((group.counts.at + group.counts.above) / group.total) * 100) : 0,
        belowCount: group.counts.below + group.counts.wellBelow,
        grades: [...group.byGrade.entries()]
          .sort((a, b) => levelIndex(a[0]) - levelIndex(b[0]))
          .map(([grade, value]) => ({ grade, ...value, belowCount: value.counts.below + value.counts.wellBelow })),
      }))
      .sort((a, b) => a.order - b.order);
  }, [snapshot]);

  // Placement baseline: where students currently sit per AC9 strand (working
  // level distribution) and their average pre-test starting point. This is the
  // foundation the future weighted overall-maths level builds on.
  const placementByStrand = useMemo(() => {
    const students = snapshot?.analysisStudents ?? snapshot?.students ?? [];
    const groups = new Map<string, { key: string; label: string; order: number; levels: Map<string, number>; byGrade: Map<string, { levels: Map<string, number>; total: number }>; standings: Record<LevelStanding, number>; standingTotal: number; preSum: number; preCount: number; placed: number }>();
    for (const student of students) {
      for (const realm of student.realms) {
        const strand: AcStrand | null = strandForRealm(realm.realmId);
        const key = strand ?? "other";
        const label = strand ? AC_STRANDS[strand].label : "Other";
        const order = strand ? AC_STRANDS[strand].order : 99;
        const group = groups.get(key) ?? { key, label, order, levels: new Map(), byGrade: new Map(), standings: { below: 0, at: 0, above: 0 }, standingTotal: 0, preSum: 0, preCount: 0, placed: 0 };
        // Default Level 3 assignments without a pre-test show as not placed.
        const level = evidencedLevel(realm) === undefined ? "Not placed" : realm.currentLevel ?? "Not placed";
        const grade = student.yearLevel ?? "Not recorded";
        group.levels.set(level, (group.levels.get(level) ?? 0) + 1);
        const gradeRow = group.byGrade.get(grade) ?? { levels: new Map(), total: 0 };
        gradeRow.levels.set(level, (gradeRow.levels.get(level) ?? 0) + 1);
        gradeRow.total += 1;
        group.byGrade.set(grade, gradeRow);
        const standing = realmStanding(student.yearLevel, realm);
        if (standing) {
          group.standings[standing] += 1;
          group.standingTotal += 1;
        }
        group.placed += 1;
        if (realm.pretestScore !== null) { group.preSum += realm.pretestScore; group.preCount += 1; }
        groups.set(key, group);
      }
    }
    return [...groups.values()]
      .map((group) => ({
        ...group,
        levels: [...group.levels.entries()].sort((a, b) => a[0].localeCompare(b[0], "en-AU", { numeric: true })),
        gradeCounts: [...group.byGrade.entries()]
          .sort((a, b) => levelIndex(a[0]) - levelIndex(b[0]))
          .map(([grade, value]) => [grade, value.total] as [string, number]),
        gradeRows: [...group.byGrade.entries()]
          .sort((a, b) => levelIndex(a[0]) - levelIndex(b[0]))
          .map(([grade, value]) => ({
            grade,
            total: value.total,
            levels: [...value.levels.entries()].sort((a, b) => a[0].localeCompare(b[0], "en-AU", { numeric: true })),
          })),
        baseline: group.preCount ? Math.round(group.preSum / group.preCount) : null,
        onLevelPct: group.standingTotal ? Math.round(((group.standings.at + group.standings.above) / group.standingTotal) * 100) : null,
      }))
      .sort((a, b) => a.order - b.order);
  }, [snapshot?.analysisStudents, snapshot?.students]);

  // Intervention lens: for each AC9 strand x school year, how many students
  // are below level, from the same latest-test standings as the Overview (or
  // working level against school year before test results are available).
  // Aggregate only: no individual grouping, which is the teacher surface's job.
  const intervention = useMemo(() => {
    const students = snapshot?.analysisStudents ?? [];
    const year = snapshot && usesTests(snapshot) ? snapshot.academicYear ?? null : null;
    const cells = new Map<string, { strand: AcStrand; year: string; needs: number; wellBelow: number; total: number }>();
    const yearSet = new Set<string>();
    for (const student of students) {
      const schoolYear = student.yearLevel ?? "Not recorded";
      for (const [strand, standing] of studentStandings(student, year).strands) {
        yearSet.add(schoolYear);
        const key = `${strand}|${schoolYear}`;
        const cell = cells.get(key) ?? { strand, year: schoolYear, needs: 0, wellBelow: 0, total: 0 };
        cell.total += 1;
        if (standing === "below" || standing === "wellBelow") cell.needs += 1;
        if (standing === "wellBelow") cell.wellBelow += 1;
        cells.set(key, cell);
      }
    }
    // Every strand is listed once any has evidence, so a strand nobody has been
    // assessed in yet shows as an empty (grey) row rather than disappearing.
    const strands = cells.size ? (Object.keys(AC_STRANDS) as AcStrand[]).sort((a, b) => AC_STRANDS[a].order - AC_STRANDS[b].order) : [];
    const years = [...YEAR_LEVELS, "Not recorded"].filter((y) => yearSet.has(y));
    const hotspots = [...cells.values()].filter((c) => c.needs > 0).sort((a, b) => b.needs - a.needs || (b.needs / b.total) - (a.needs / a.total));
    const totalNeeds = hotspots.reduce((sum, c) => sum + c.needs, 0);
    const maxNeeds = Math.max(1, ...hotspots.map((c) => c.needs));
    return { cells, strands, years, hotspots, totalNeeds, maxNeeds };
  }, [snapshot]);

  const downloadPlacementPdf = () => {
    if (!snapshot || placementByStrand.length === 0) return;
    const win = openDocumentWindow();
    if (!win) return;
    const selectedClass = classes.find((item) => item.id === classId);
    writeDocument(win, placementBaselineHtml({
      brand: documentBrand(),
      scopeLabel: activeGroup ? activeGroup.name : selectedClass ? selectedClass.name : yearLevel ? yearLevel : "Whole school",
      strands: placementByStrand.map((group) => ({
        label: group.label,
        placed: group.placed,
        baseline: group.baseline,
        onLevelPct: group.onLevelPct,
        belowCount: group.standings.below,
        levels: group.levels,
        gradeRows: group.gradeRows,
      })),
    }));
  };

  // Classes tab: each class group's classes together with a group total
  // (no accuracy or growth total: those averages can't be combined fairly).
  const classSections = (() => {
    const rows = snapshot?.classes ?? [];
    const used = new Set<string>();
    const sections = classGroups
      .map((group) => {
        const members = rows.filter((item) => item.id && group.classIds.includes(item.id));
        members.forEach((item) => used.add(item.id!));
        return {
          key: group.id,
          title: group.name,
          rows: members,
          total: members.reduce(
            (sum, item) => ({ students: sum.students + item.students, active: sum.active + item.activeStudents, target: sum.target + item.weeklyTargetMet, mastered: sum.mastered + item.masteredLevels }),
            { students: 0, active: 0, target: 0, mastered: 0 },
          ),
        };
      })
      .filter((section) => section.rows.length > 0);
    const rest = rows.filter((item) => !item.id || !used.has(item.id));
    if (rest.length) {
      sections.push({ key: "ungrouped", title: sections.length ? "Not in a group" : "", rows: rest, total: { students: 0, active: 0, target: 0, mastered: 0 } });
    }
    return sections;
  })();

  const groupSnapshot = (() => {
    if (!activeGroup || !snapshot) return null;
    const inGroup = new Set(activeGroup.classIds);
    const groupClasses = snapshot.classes.filter((item) => item.id && inGroup.has(item.id));
    return {
      ...snapshot,
      overview: {
        ...snapshot.overview,
        students: groupClasses.reduce((total, item) => total + item.students, 0),
        activeThisWeek: groupClasses.reduce((total, item) => total + item.activeStudents, 0),
        weeklyTargetMet: groupClasses.reduce((total, item) => total + item.weeklyTargetMet, 0),
      },
      classes: groupClasses,
      analysisStudents: snapshot.analysisStudents.filter((student) => student.classId && inGroup.has(student.classId)),
      students: snapshot.students.filter((student) => student.classId && inGroup.has(student.classId)),
    };
  })();
  const groupNeedsUpdate = Boolean(activeGroup && snapshot && !snapshot.analysisStudents.some((student) => student.classId !== undefined));

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

  // Teachers see every student's name at their school once 20261014230000 is
  // applied; before it, names are limited to their own classes.
  const namesLimited = audience === "teacher" && snapshot.students.length < snapshot.analysisStudents.length;

  return (
    <section className="space-y-6">
      {viewOptions.length > 1 ? (
        <nav aria-label="Insights view" className="flex w-fit max-w-full flex-wrap gap-1 rounded-xl bg-white p-1 shadow-[inset_0_0_0_1px_#E3E5E0]">
          {viewOptions.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => {
                setView(item.id);
                setTab("overview");
                setSelectedStudentId("");
                setYearLevel("");
                setClassId(item.id === "class" ? teacherClassIds[0] ?? "" : "");
              }}
              className={`min-w-max rounded-lg px-4 py-2 text-sm font-bold transition ${view === item.id ? "bg-[var(--reliq-lime,#B9F23F)] text-[#121314]" : "text-slate-600 hover:bg-[#F1F2EE]"}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      ) : null}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-700">Showing</p>
          <div className="flex items-center gap-2">
            {tab === "placement" ? (
              <button
                type="button"
                onClick={() => downloadPlacementPdf()}
                disabled={!snapshot || placementByStrand.length === 0}
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
              >
                <Download className="h-3.5 w-3.5" /> Placement PDF
              </button>
            ) : (
              <a
                href={exportHref || undefined}
                download
                aria-disabled={!exportHref}
                className={`inline-flex items-center gap-1.5 rounded-md border border-emerald-700 px-3 py-1.5 text-xs font-bold ${exportHref ? "text-emerald-800 hover:bg-emerald-50" : "pointer-events-none text-slate-300"}`}
              >
                <Download className="h-3.5 w-3.5" /> Export {tab === "curriculum" ? "curriculum" : "students"} CSV
              </a>
            )}
            <a
              href={resultsHref || undefined}
              download
              aria-disabled={!resultsHref}
              title="Flat per-student results, mappable into Compass / Sentral"
              className={`inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-bold ${resultsHref ? "text-slate-700 hover:bg-slate-50" : "pointer-events-none text-slate-300"}`}
            >
              <Download className="h-3.5 w-3.5" /> Results (SIS)
            </a>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {viewAudience === "teacher" || activeGroup ? null : (
            <label className="text-sm font-semibold text-slate-600">
              School year level
              <select value={yearLevel} onChange={(event) => { setYearLevel(event.target.value); setClassId(""); }} className="mt-1 block h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800">
                <option value="">Whole school</option>
                {YEAR_LEVELS.map((level) => <option key={level}>{level}</option>)}
              </select>
            </label>
          )}
          {activeGroup ? null : (
            <label className="text-sm font-semibold text-slate-600">
              Class
              <select value={classId} onChange={(event) => setClassId(event.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800">
                {viewAudience === "teacher" ? null : <option value="">All classes</option>}
                {classes.filter((item) => (viewAudience === "teacher" ? teacherClassIds.includes(item.id) : !yearLevel || item.yearLevels.includes(yearLevel))).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
          )}
          <label className="text-sm font-semibold text-slate-600">
            Realm
            <select value={realmId} onChange={(event) => setRealmId(event.target.value)} className="mt-1 block h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800">
              <option value="">All realms</option>
              {Object.entries(REALMS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-600">
            Reporting window
            <select value={String(period)} onChange={(event) => setPeriod(event.target.value === "year" ? "year" : (Number(event.target.value) as 7 | 30 | 90))} className="mt-1 block h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800">
              {academicYearStart ? <option value="year">This school year</option> : null}
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </label>
        </div>
        {snapshot.windowEnd && Date.parse(snapshot.windowEnd) < Date.parse(snapshot.generatedAt) - 86400000 ? (
          <p className="mt-3 rounded-lg bg-[#F1F2EE] px-3 py-2 text-sm font-semibold text-slate-700">
            Results are shown as they stood at the end of this school year. Working levels and placements show where students are now.
          </p>
        ) : null}
        {period === "year" && !snapshot.windowStart ? (
          <p className="mt-3 rounded-lg bg-[#FFF1C7] px-3 py-2 text-sm font-semibold text-[#5C4300]">
            Showing the last {snapshot.windowDays} days. Whole-year reporting turns on after the next database update.
          </p>
        ) : null}
        {loading ? <div className="mt-3 h-1 animate-pulse rounded-full bg-[#B9F23F]" /> : null}
      </div>


      <nav className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl bg-[#ECEEE9] p-1" aria-label="School analytics views">
        {/* A class group shows its overview and its growth. */}
        {TABS.filter((item) => (activeGroup ? item.id === "overview" || item.id === "growth" : viewAudience !== "teacher" || item.id !== "classes")).map((item) => (
          <button key={item.id} type="button" aria-current={tab === item.id ? "page" : undefined} onClick={() => { setTab(item.id); setSelectedStudentId(""); }} className={`min-w-max rounded-lg px-4 py-2 text-sm font-bold transition ${tab === item.id ? "bg-[#121314] text-[var(--reliq-lime,#B9F23F)]" : "text-slate-600 hover:bg-white hover:text-[#121314]"}`}>
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "overview" && groupNeedsUpdate ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          The {activeGroup?.name} view turns on after the next analytics database update.
        </p>
      ) : tab === "overview" ? (
        <LeaderOverview
          snapshot={groupSnapshot ?? snapshot}
          audience={activeGroup ? "group" : viewAudience}
          title={activeGroup ? `Where the ${activeGroup.name} are` : viewAudience === "teacher" ? `Where ${classes.find((item) => item.id === classId)?.name ?? "my class"} is` : effectiveClassId ? `Where ${classes.find((item) => item.id === effectiveClassId)?.name ?? "this class"} is` : effectiveYearLevel ? `Where ${effectiveYearLevel} is` : "Where our students are"}
          onOpen={(target, filter) => {
            if (filter?.yearLevel) setYearLevel(filter.yearLevel);
            if (filter?.strand) setRealmId(realmForStrand(filter.strand as AcStrand));
            setTab(target);
          }}
          onOpenStudent={(studentId) => {
            setSelectedStudentId(studentId);
            setTab("students");
          }}
        />
      ) : null}

      {tab === "growth" && usesTestHistory(groupSnapshot ?? snapshot) ? (
        <GrowthView
          snapshot={groupSnapshot ?? snapshot}
          audience={activeGroup ? "group" : viewAudience}
          breakdown={
            activeGroup
              ? new Set((groupSnapshot ?? snapshot).analysisStudents.map((student) => student.yearLevel)).size > 1 ? "years" : "classes"
              : effectiveClassId ? "students" : effectiveYearLevel ? "classes" : "years"
          }
          title={
            activeGroup
              ? `${activeGroup.name} growth`
              : effectiveClassId
                ? `${classes.find((item) => item.id === effectiveClassId)?.name ?? "Class"} growth`
                : effectiveYearLevel ? `${effectiveYearLevel} growth` : "Whole-school growth"
          }
          onOpenYear={activeGroup ? undefined : (year) => setYearLevel(year)}
          onOpenClass={activeGroup || viewAudience === "teacher" ? undefined : (id) => setClassId(id)}
          onOpenStudent={(studentId) => {
            setSelectedStudentId(studentId);
            setTab("students");
          }}
        />
      ) : tab === "growth" && activeGroup ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Growth for the {activeGroup.name} turns on after the next analytics database update.
        </p>
      ) : tab === "growth" ? (
        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">School growth trend</h3><p className="mt-1 text-sm text-slate-500">Only matched pre-test and post-test pairs are included.</p><div className="mt-4"><TrendChart values={snapshot.growthTrend.flatMap((point) => point.averageGrowth === null ? [] : [point.averageGrowth])} labels={snapshot.growthTrend.filter((point) => point.averageGrowth !== null).map((point) => DATE_FORMATTER.format(new Date(point.date)))} emptyLabel="No matched pre-test and post-test pairs in this view." valueSuffix=" points" /></div></article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Growth by realm</h3><div className="mt-4 space-y-3">{snapshot.realms.map((realm) => <button key={realm.realmId} type="button" onClick={() => setRealmId(realm.realmId)} className="flex w-full items-center justify-between border-b border-slate-100 py-3 text-left"><span className="font-semibold">{REALMS[realm.realmId] ?? realm.realmId}</span><span className="font-bold text-emerald-700">{formatPercent(realm.averageGrowth, " pts")}</span></button>)}</div><p className="mt-5 text-xs leading-5 text-slate-500">{snapshot.methodology.growth}</p></article>
        </div>
      ) : null}

      {tab === "curriculum" ? (
        <div className="space-y-5">
          <TabHelp content={curriculumHelp(viewAudience)} />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-950">Standing by AC9 strand</h3>
              <p className="mt-1 text-sm text-slate-500">
                {curriculumUsesTests
                  ? "Each student's latest test in each strand, against where their school year should be in the term they sat it."
                  : "Working level compared to school year. At level means their level matches their year (e.g. Year 3 at Level 3)."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
              {curriculumStandings.map((standing) => (
                <span key={standing} className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm" style={{ background: STANDING_META[standing].bg }} />
                  {STANDING_META[standing].label}
                </span>
              ))}
            </div>
          </div>

          {standingByStrand.length === 0 ? (
            <p className="border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No placement or assessment evidence in this view yet.</p>
          ) : (
            standingByStrand.map((group) => (
              <article key={group.strand} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-bold text-slate-950">{group.label}</h4>
                    <span className="rounded-md bg-[#EEF9D9] px-2.5 py-1 text-xs font-bold text-[#3D6600]">{group.onTrackPct}% at or above</span>
                    <span className="text-xs text-slate-500">{group.total} students</span>
                  </div>
                  <div className="flex min-w-[180px] flex-1 items-center justify-end gap-3">
                    <div className="flex h-3 w-full max-w-[300px] overflow-hidden rounded-full bg-slate-100">
                      {curriculumStandings.map((standing) => group.total ? (
                        <div key={standing} title={`${STANDING_META[standing].label}: ${group.counts[standing]}`} style={{ width: `${(group.counts[standing] / group.total) * 100}%`, background: STANDING_META[standing].bg }} />
                      ) : null)}
                    </div>
                    <span className="whitespace-nowrap text-sm font-bold tabular-nums text-[#A8332A]">{group.belowCount} below level</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {group.grades.map((gradeRow) => (
                    <button
                      key={gradeRow.grade}
                      type="button"
                      onClick={() => { setRealmId(group.strand); if (gradeRow.grade !== "Not recorded") setYearLevel(gradeRow.grade); setTab("students"); }}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm hover:bg-[#FAFBF8]"
                    >
                      <span className="w-24 shrink-0 font-semibold text-slate-800">{gradeRow.grade}</span>
                      <span className="flex h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                        {curriculumStandings.map((standing) => gradeRow.total ? (
                          <span key={standing} title={`${STANDING_META[standing].label}: ${gradeRow.counts[standing]}`} style={{ width: `${(gradeRow.counts[standing] / gradeRow.total) * 100}%`, background: STANDING_META[standing].bg }} />
                        ) : null)}
                      </span>
                      <span className="w-28 shrink-0 text-right text-xs font-semibold tabular-nums">
                        {gradeRow.belowCount > 0 ? <span className="text-[#A8332A]">{gradeRow.belowCount} below level</span> : <span className="text-[#3D6600]">all at or above</span>}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </button>
                  ))}
                </div>
              </article>
            ))
          )}
        </div>
      ) : null}

      {tab === "placement" ? (
        <div className="space-y-5">
          <TabHelp content={placementHelp(viewAudience)} />
          <div>
            <h3 className="font-bold text-slate-950">Placement baseline by AC9 strand</h3>
            <p className="mt-1 text-sm text-slate-500">Where students are working now, and their average pre-test starting point per strand.</p>
          </div>

          {placementByStrand.length === 0 ? (
            <p className="border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No placement evidence in this view.</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {placementByStrand.map((group) => (
                <article key={group.key} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-bold text-slate-950">{group.label}</h4>
                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">Baseline {formatPercent(group.baseline)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{group.placed} placements</p>
                  <div className="mt-4 space-y-5">
                    <div>
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Students by school year</p>
                      <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
                        {group.gradeCounts.map(([grade, count]) => (
                          <div key={grade} title={`${grade}: ${count}`} style={{ width: `${(count / group.placed) * 100}%`, background: levelColor(grade) }} />
                        ))}
                      </div>
                      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        {group.gradeCounts.map(([grade, count]) => (
                          <li key={grade} className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: levelColor(grade) }} />
                            <span className="min-w-0 flex-1 truncate font-semibold text-slate-700">{grade}</span>
                            <span className="tabular-nums text-slate-500">{count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500">Students by working level</p>
                      <div className="flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
                        {group.levels.map(([level, count]) => (
                          <div key={level} title={`${level}: ${count}`} style={{ width: `${(count / group.placed) * 100}%`, background: levelColor(level) }} />
                        ))}
                      </div>
                      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        {group.levels.map(([level, count]) => (
                          <li key={level} className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: levelColor(level) }} />
                            <span className="min-w-0 flex-1 truncate font-semibold text-slate-700">{level}</span>
                            <span className="tabular-nums text-slate-500">{count}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">School grade → working level</p>
                      {group.onLevelPct !== null ? (
                        <span className="text-xs font-bold text-slate-700">{group.onLevelPct}% at or above</span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">No year match yet</span>
                      )}
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="grid grid-cols-[4.5rem_repeat(10,minmax(0,1fr))] gap-1 text-[10px] font-bold uppercase tracking-[0.04em] text-slate-400">
                        <span>Grade</span>
                        {PLACEMENT_LEVEL_COLUMNS.map((level) => <span key={level} className="text-center">{level === "Prep" ? "P" : level === "Not placed" ? "NP" : level.replace("Year ", "Y")}</span>)}
                      </div>
                      {group.gradeRows.map((gradeRow) => (
                        <button
                          key={gradeRow.grade}
                          type="button"
                          onClick={() => { if (group.key !== "other") setRealmId(group.key); if (gradeRow.grade !== "Not recorded") setYearLevel(gradeRow.grade); setTab("students"); }}
                          className="grid w-full grid-cols-[4.5rem_repeat(10,minmax(0,1fr))] gap-1 text-left text-xs"
                        >
                          <span className="flex h-7 items-center truncate font-bold text-slate-700">{gradeRow.grade}</span>
                          {PLACEMENT_LEVEL_COLUMNS.map((level) => {
                            const count = gradeRow.levels.find(([workingLevel]) => workingLevel === level)?.[1] ?? 0;
                            const cell = placementCell(gradeRow.grade, level, count);
                            const gap = levelIndex(gradeRow.grade) - levelIndex(level);
                            const behind = count > 0 && levelIndex(level) >= 0 && levelIndex(gradeRow.grade) >= 0 && gap > 0 ? gap : 0;
                            return (
                              <span
                                key={level}
                                title={`${gradeRow.grade} working at ${level}: ${count}${behind ? ` (${behind} ${behind === 1 ? "year" : "years"} below)` : ""}`}
                                className="flex h-7 items-center justify-center rounded-sm border text-[11px] font-black tabular-nums"
                                style={{ background: cell.bg, color: cell.fg, borderColor: cell.border, borderWidth: gradeRow.grade === level ? 1.5 : 1 }}
                              >
                                {count || ""}
                              </span>
                            );
                          })}
                        </button>
                      ))}
                    </div>
                    {group.standingTotal && group.standings.below > 0 ? (
                      <button
                        type="button"
                        onClick={() => { if (group.key !== "other") setRealmId(group.key); setTab("intervention"); }}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#A8332A] hover:underline"
                      >
                        {group.standings.below} working below their year · see Intervention
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {tab === "intervention" ? (
        <div className="space-y-5">
          <TabHelp content={interventionHelp(viewAudience)} />
          <div>
            <h3 className="font-bold text-slate-950">Where to intervene</h3>
            <p className="mt-1 text-sm text-slate-500">
              {curriculumUsesTests
                ? "Students below where their school year should be, from their latest test, by strand and school year. Direct support here, then hand the list to the class teacher."
                : "Students working below their school year, by strand and school year. Direct support here, then hand the list to the class teacher."}
            </p>
          </div>

          {intervention.hotspots.length === 0 ? (
            <p className="border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No students are below level in this view, or there isn&apos;t enough evidence yet.</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {intervention.hotspots.slice(0, 6).map((cell) => (
                  <button
                    key={`${cell.strand}-${cell.year}`}
                    type="button"
                    onClick={() => { setRealmId(realmForStrand(cell.strand)); if (cell.year !== "Not recorded") setYearLevel(cell.year); setTab("students"); }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-[#F2998D] hover:bg-[#FFF5F3]"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-950">{cell.year} · {AC_STRANDS[cell.strand].label}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{Math.round((cell.needs / cell.total) * 100)}% of {cell.total} {curriculumUsesTests ? "tested" : "placed"}{cell.wellBelow ? ` · ${cell.wellBelow} well below` : ""}</p>
                    </div>
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-[#FFE3DF] text-[#8A1C14]">
                      <span className="text-base font-black leading-none">{cell.needs}</span>
                    </span>
                  </button>
                ))}
              </div>

              <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between p-5">
                  <h4 className="font-bold text-slate-950">Intervention heatmap</h4>
                  <span className="text-xs font-semibold text-slate-500">{intervention.totalNeeds} students below level</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
                      <tr>
                        <th className="px-5 py-3 text-left">Strand</th>
                        {intervention.years.map((year) => <th key={year} className="px-3 py-3 text-center font-bold">{year.replace("Year ", "Y")}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {intervention.strands.map((strand) => (
                        <tr key={strand} className="border-t border-slate-100">
                          <td className="px-5 py-2.5 font-semibold text-slate-800">{AC_STRANDS[strand].label}</td>
                          {intervention.years.map((year) => {
                            const cell = intervention.cells.get(`${strand}|${year}`);
                            if (!cell || cell.total === 0) return <td key={year} className="px-3 py-2.5 text-center text-slate-300">—</td>;
                            const intensity = cell.needs / intervention.maxNeeds;
                            const bg = cell.needs === 0 ? "color-mix(in srgb, #B9F23F 22%, transparent)" : `color-mix(in srgb, #E2685A ${18 + Math.round(intensity * 70)}%, transparent)`;
                            return (
                              <td key={year} className="px-2 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => { setRealmId(realmForStrand(strand)); if (year !== "Not recorded") setYearLevel(year); setTab("students"); }}
                                  title={`${cell.needs} of ${cell.total} below level${cell.wellBelow ? `, ${cell.wellBelow} well below` : ""}`}
                                  className="inline-flex min-w-11 flex-col items-center rounded-md px-2 py-1.5 font-bold text-slate-900 transition hover:ring-2 hover:ring-[#121314]"
                                  style={{ background: bg }}
                                >
                                  <span className="tabular-nums">{cell.needs}</span>
                                  <span className="text-[10px] font-semibold text-slate-500">/ {cell.total}</span>
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="px-5 py-3 text-xs text-slate-500">Each cell: students below level / students {curriculumUsesTests ? "tested" : "placed"}. Tap a cell to see the students.</p>
              </article>
            </>
          )}
        </div>
      ) : null}

      {tab === "classes" ? (
        <div className="space-y-5">
        <TabHelp content={classesHelp()} />
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-end justify-between gap-3 p-5">
            <div>
              <h3 className="font-bold text-slate-950">Class comparison</h3>
              <p className="mt-1 text-sm text-slate-500">Compare participation, achievement and growth across the school. Classes in the same class group are listed together.</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{snapshot.classes.length} classes in this view</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-4 py-3 text-right">Students</th>
                  <th className="px-4 py-3 text-right">Active</th>
                  <th className="px-4 py-3 text-right">Weekly target</th>
                  <th className="px-4 py-3 text-right">Accuracy</th>
                  <th className="px-4 py-3 text-right">Mastered</th>
                  <th className="px-4 py-3 text-right">Growth</th>
                  <th className="px-5 py-3"><span className="sr-only">Open comparison</span></th>
                </tr>
              </thead>
              <tbody>
                {classSections.map((section) => (
                  <Fragment key={section.key}>
                    {section.title ? (
                      <tr className="border-t-2 border-slate-200 bg-[#F7F8F4]">
                        <td className="px-5 py-3">
                          <span className="font-extrabold text-[#121314]">{section.title}</span>
                          <span className="ml-2 text-xs font-semibold text-slate-500">{section.rows.length} {section.rows.length === 1 ? "class" : "classes"}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums">{section.total.students}</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums">{section.total.students ? Math.round((section.total.active / section.total.students) * 100) : 0}%</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums">{section.total.students ? Math.round((section.total.target / section.total.students) * 100) : 0}%</td>
                        <td className="px-4 py-3 text-right text-xs text-slate-400">—</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums">{section.total.mastered}</td>
                        <td className="px-4 py-3 text-right text-xs text-slate-400">—</td>
                        <td className="px-5 py-3 text-right text-xs font-semibold text-slate-500">Group total</td>
                      </tr>
                    ) : null}
                    {section.rows.map((item) => {
                  const isMyClass = Boolean(item.id && teacherClassIdSet.has(item.id));
                  const activeRate = item.students ? Math.round((item.activeStudents / item.students) * 100) : 0;
                  const targetRate = item.students ? Math.round((item.weeklyTargetMet / item.students) * 100) : 0;
                  return (
                    <tr key={item.id ?? item.name} className={`border-t border-slate-100 ${isMyClass ? "bg-emerald-50/60" : "hover:bg-slate-50"}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4 text-emerald-700" />
                          <span className="font-bold text-slate-950">{item.name}</span>
                          {isMyClass ? <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-800">My class</span> : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums">{item.students}</td>
                      <td className="px-4 py-4 text-right"><span className="font-bold tabular-nums">{activeRate}%</span><span className="ml-1 text-xs text-slate-400">({item.activeStudents})</span></td>
                      <td className="px-4 py-4 text-right"><span className="font-bold tabular-nums">{targetRate}%</span><span className="ml-1 text-xs text-slate-400">({item.weeklyTargetMet})</span></td>
                      <td className="px-4 py-4 text-right font-bold tabular-nums">{formatPercent(item.averageAccuracy)}</td>
                      <td className="px-4 py-4 text-right font-semibold tabular-nums">{item.masteredLevels}</td>
                      <td className="px-4 py-4 text-right font-bold tabular-nums text-emerald-700">{formatPercent(item.averageGrowth, " pts")}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.id) setClassId(item.id);
                            setTab(namesLimited && !isMyClass ? "overview" : "students");
                          }}
                          className="inline-flex items-center gap-1 font-bold text-emerald-700"
                        >
                          {namesLimited && !isMyClass ? "View class trend" : "View students"}
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {snapshot.classes.length === 0 ? <p className="border-t border-slate-100 p-5 text-sm text-slate-500">No classes match these filters.</p> : null}
        </article>
        </div>
      ) : null}

      {tab === "students" ? (
        <div className="space-y-5">
        <TabHelp content={studentsHelp(viewAudience)} />
        {selectedStudent ? (
          <article className="rounded-2xl border border-slate-200 bg-white p-5">
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
                <span className={`rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-[0.08em] ${selectedStudent.status === "on_track" ? "bg-[#EEF9D9] text-[#3D6600]" : selectedStudent.status === "needs_attention" ? "bg-[#FFF1C7] text-[#5C4300]" : "bg-[#F1F2EE] text-slate-700"}`}>
                  {selectedStudent.status === "on_track" ? "On track" : selectedStudent.status === "needs_attention" ? "Needs attention" : "Active"}
                </span>
                <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                  {selectedStudent.weeklyTargetMet ? "Weekly target met" : "Weekly target not yet met"}
                </span>
                <button type="button" onClick={() => downloadStudentReportPdf(selectedStudent)} className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50">
                  <Download className="h-3.5 w-3.5" /> Progress report
                </button>
                <button type="button" onClick={() => void openLearningJourney(selectedStudent.id)} className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700 bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800">
                  <TrendingUp className="h-3.5 w-3.5" /> Learning journey
                </button>
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
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-end justify-between gap-3 p-5">
              <div>
                <h3 className="font-bold">Student evidence</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Search or open a student to inspect realm and assessment evidence.
                  {namesLimited ? " Names show for students in your own classes; the school figures on the other tabs include everyone." : ""}
                </p>
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
                      <td className="px-4 py-3"><span className={`rounded-md px-2 py-1 text-xs font-bold ${student.status === "on_track" ? "bg-[#EEF9D9] text-[#3D6600]" : student.status === "needs_attention" ? "bg-[#FFF1C7] text-[#5C4300]" : "bg-[#F1F2EE] text-slate-700"}`}>{student.status === "on_track" ? "On track" : student.status === "needs_attention" ? "Needs attention" : "Active"}</span></td>
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
        )}
        </div>
      ) : null}
    </section>
  );
}
