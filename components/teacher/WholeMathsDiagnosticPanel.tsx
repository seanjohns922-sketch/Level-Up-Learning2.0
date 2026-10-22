"use client";

import { useEffect, useMemo, useState } from "react";
import { assetUrl, openDocumentWindow, writeDocument } from "@/lib/documents/reliq-document";
import { diagnosticReportHtml, type RealmTestRow } from "@/lib/documents/diagnostic-report";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Check, ChevronDown, Info, ListChecks, Lock, TrendingUp, Unlock, UserPlus, X } from "lucide-react";
import { STANDING_META, STANDING_ORDER, expectedLevel, standingForGap } from "@/lib/proficiency";
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

type DiagnosticStudent = { id: string; display_name: string; school_year_level?: string | null; year_level?: string | null };
type TrackerTab = "all" | LiveMathsProgressionRow["strand"];
type DiagnosticView = "live" | "run";
type LiveSortKey = "surname" | "given" | "expected" | "start" | "mid" | "end" | "live" | "growth" | "diagnostic";
type StudentSort = "behind-first" | `${LiveSortKey}-${"asc" | "desc"}`;
type RunSortKey = "name" | "result" | string; // a strand id sorts by that strand's progress
type FormalCheckpoint = Exclude<TeacherDiagnosticSittingRow["checkpoint"], "ad_hoc">;
type DiagnosticPoint = { sittingId: string; checkpoint: FormalCheckpoint; level: number; completedAt: string };

const CHECKPOINT_LABEL = {
  start: "Start-of-year diagnostic",
  mid: "Mid-year diagnostic",
  end: "End-of-year diagnostic",
  ad_hoc: "Ad hoc",
} as const;

const TRACK_MAX_LEVEL = 8;
const NAME_COLLATOR = new Intl.Collator("en-AU", { numeric: true, sensitivity: "base" });

function studentNameParts(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  return {
    given: parts[0] ?? "",
    surname: parts.length > 1 ? parts.slice(1).join(" ") : parts[0] ?? "",
  };
}

function compareNullableLevels(left: number | null, right: number | null, direction: "asc" | "desc") {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;
  return direction === "asc" ? left - right : right - left;
}

const CHECKPOINT_SHORT_LABEL: Record<FormalCheckpoint, string> = { start: "Start", mid: "Mid", end: "End" };
const RUN_COLS = "grid grid-cols-[minmax(170px,1.3fr)_repeat(6,minmax(56px,0.55fr))_minmax(170px,1fr)] items-center gap-3";

function formatTimeLeft(closesAt: string, now: number) {
  const minutes = Math.max(0, Math.round((new Date(closesAt).getTime() - now) / 60000));
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m left` : `${minutes}m left`;
}

/** Standing of a finished sitting against the level expected when it was sat. */
function sittingStanding(student: DiagnosticStudent, sitting: TeacherDiagnosticSittingRow) {
  if (sitting.overall_level == null) return null;
  const testedAt = sitting.completed_at ?? sitting.created_at;
  const year = testedAt.slice(0, 4);
  const expected = expectedLevel(student.school_year_level ?? student.year_level ?? null, testedAt, { startsOn: `${year}-01-01`, endsOn: `${year}-12-31` });
  return expected == null ? null : STANDING_META[standingForGap(sitting.overall_level - expected)];
}

function RunStep({ n, title, active = false, children }: { n: number; title: string; active?: boolean; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border p-4 ${active ? "border-[#83E300] bg-[#F6FDEB]" : "border-[#E3E5E0] bg-white"}`}>
      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#8F948C]">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#121314] text-[10px] text-white">{n}</span>{title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function RunStrandCell({ result }: { result: TeacherDiagnosticSittingRow["strand_results"][number] | undefined }) {
  if (result?.status === "completed") {
    return <span title="Done" className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#121314] text-[#83E300]"><Check className="h-4 w-4" strokeWidth={3} aria-label="Done" /></span>;
  }
  const answered = result?.answered_count ?? 0;
  if (result?.status === "pending" && answered > 0) {
    return (
      <span title={`${answered} of 20 answered`} className="mx-auto flex w-12 flex-col items-center">
        <span className="text-[11px] font-black tabular-nums text-[#121314]">{answered}/20</span>
        <span className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-[#ECEDE9]"><span className="block h-full rounded-full bg-[#5FAE00]" style={{ width: `${Math.min(100, (answered / 20) * 100)}%` }} /></span>
      </span>
    );
  }
  return <span title={result?.status === "unavailable" ? "Unavailable" : "Not started"} className="mx-auto block h-1.5 w-4 rounded-full bg-[#E3E5E0]" />;
}

// Live progression table: Expected now, Start, Mid, End, Live now, growth; a row opens its growth line.
const LIVE_COLS = "grid grid-cols-[minmax(180px,1.4fr)_repeat(5,minmax(58px,0.55fr))_minmax(150px,1fr)_20px] items-center gap-3";
// The growth bar spans a level and a quarter, so a full year's expected growth sits at 80%.
const GROWTH_BAR_MAX = 1.25;

type Standing = ReturnType<typeof standingForGap>;
type LiveCheckpointPoint = DiagnosticPoint & { standing: Standing | null };
type LiveRow = {
  student: DiagnosticStudent;
  schoolYear: string | null;
  liveLevel: number | null;
  liveStanding: Standing | null;
  expectedNow: number | null;
  points: LiveCheckpointPoint[];
  byCheckpoint: Map<FormalCheckpoint, LiveCheckpointPoint>;
  firstCheckpoint: FormalCheckpoint | null;
  growth: number | null;
  expectedGrowth: number | null;
};

const signed = (value: number, digits = 1) => `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;

/** "Year 3", "3", "Foundation" → the labels the expectation scale uses. */
function normalizeYearLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/prep|foundation|ground/i.test(value)) return "Prep";
  const match = /(\d+)/.exec(value);
  return match ? `Year ${match[1]}` : null;
}

function expectedAt(schoolYear: string | null, iso: string) {
  const year = iso.slice(0, 4);
  return expectedLevel(schoolYear, iso, { startsOn: `${year}-01-01`, endsOn: `${year}-12-31` });
}

function LevelBlock({ level, standing }: { level: number; standing: Standing | null }) {
  const meta = standing ? STANDING_META[standing] : null;
  return (
    <span
      className="inline-flex min-w-12 justify-center rounded-lg px-2 py-1 text-sm font-black tabular-nums"
      style={meta ? { background: meta.bg, color: meta.fg } : { background: "#F1F2EE", color: "#121314" }}
    >
      {level.toFixed(1)}
    </span>
  );
}

/** One student's growth line, zoomed to the levels that matter for them. */
function GrowthLine({ row, onReport, onOpenSitting }: { row: LiveRow; onReport: () => void; onOpenSitting: (sittingId: string) => void }) {
  const first = row.points[0] ?? null;
  const lastLevel = row.liveLevel ?? row.points.at(-1)?.level ?? null;
  const values = [...row.points.map((point) => point.level), row.liveLevel, row.expectedNow].filter((value): value is number => value != null);
  if (values.length === 0) {
    return <div className="border-t border-[#E3E5E0] bg-[#FAFBF8] px-5 py-5 text-sm text-[#5A5E63]">No live score or diagnostic yet for {row.student.display_name}.</div>;
  }
  const lo = Math.max(0, Math.floor(Math.min(...values) - 0.25));
  const hi = Math.min(TRACK_MAX_LEVEL, Math.max(lo + 2, Math.ceil(Math.max(...values) + 0.25)));
  const x = (value: number) => `${((Math.max(lo, Math.min(hi, value)) - lo) / (hi - lo)) * 100}%`;
  const liveMeta = row.liveStanding ? STANDING_META[row.liveStanding] : null;
  const liveColour = liveMeta ? (liveMeta.bg === "#121314" ? "#5FAE00" : liveMeta.bg) : "#5FAE00";
  return (
    <div className="grid gap-5 border-t border-[#E3E5E0] bg-[#FAFBF8] px-5 py-5 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8F948C]">Growth line · {row.student.display_name}</p>
        <div className="relative mx-6 mt-9 h-24">
          {Array.from({ length: hi - lo + 1 }, (_, index) => lo + index).map((level) => (
            <span key={level} className="absolute top-12 -translate-x-1/2 text-center" style={{ left: x(level) }}>
              <span className="mx-auto block h-3 w-px bg-[#C9CCC6]" />
              <span className="mt-1 block whitespace-nowrap text-[10px] font-black text-[#8F948C]">{level === 0 ? "Prep" : `Level ${level}`}</span>
            </span>
          ))}
          <span className="absolute inset-x-0 top-[54px] h-px bg-[#D9DBD4]" />
          {row.expectedNow != null ? (
            <>
              <span className="absolute top-0 h-[66px] w-0 -translate-x-1/2 border-l-2 border-dashed border-[#121314]/40" style={{ left: x(row.expectedNow) }} />
              <span className="absolute -top-5 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-[#5A5E63]" style={{ left: x(row.expectedNow) }}>Expected now {row.expectedNow.toFixed(1)}</span>
            </>
          ) : null}
          {first && lastLevel != null && lastLevel > first.level ? (
            <span className="absolute top-[52px] h-1.5 rounded-full bg-[#121314]" style={{ left: x(first.level), width: `calc(${x(lastLevel)} - ${x(first.level)})` }} />
          ) : null}
          {row.points.map((point) => (
            <button key={point.sittingId} type="button" onClick={() => onOpenSitting(point.sittingId)} title="Open diagnostic details" className="absolute top-[47px] -translate-x-1/2" style={{ left: x(point.level) }}>
              <span className="block h-4 w-4 rounded-full border-[3px] border-[#121314] bg-white" />
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#121314] px-1.5 py-0.5 text-[10px] font-black text-white">{CHECKPOINT_SHORT_LABEL[point.checkpoint]} {point.level.toFixed(1)}</span>
            </button>
          ))}
          {row.liveLevel != null ? (
            <span className="absolute top-[45px] -translate-x-1/2" style={{ left: x(row.liveLevel) }}>
              <span className="block h-5 w-5 rounded-full ring-4 ring-[#FAFBF8]" style={{ background: liveColour }} />
              <span className="absolute left-1/2 top-7 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-black" style={liveMeta ? { background: liveMeta.bg, color: liveMeta.fg } : { background: "#F1F2EE", color: "#121314" }}>Now {row.liveLevel.toFixed(1)}</span>
            </span>
          ) : null}
        </div>
      </div>
      <div className="grid content-start gap-2 rounded-2xl border border-[#E3E5E0] bg-white p-4">
        {liveMeta ? <span className="inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-black" style={{ background: liveMeta.bg, color: liveMeta.fg }}>{liveMeta.label}</span> : null}
        {row.growth == null || row.expectedGrowth == null || !first ? (
          <p className="text-sm text-[#5A5E63]">{row.liveLevel == null ? "The live score appears once there is progress to measure." : "No diagnostic yet. The growth line starts at their first Start, Mid or End result."}</p>
        ) : (
          <>
            <p className="text-sm text-[#121314]"><b>{signed(row.growth)} levels</b> since {CHECKPOINT_SHORT_LABEL[first.checkpoint]}</p>
            <p className="text-sm text-[#5A5E63]">Expected {signed(row.expectedGrowth, 2)} in that time.</p>
            <p className={`text-sm font-black ${row.growth >= row.expectedGrowth ? "text-[#3D6600]" : "text-[#8A5A00]"}`}>{row.growth >= row.expectedGrowth ? "Growing faster than expected" : "Growing slower than expected"}</p>
          </>
        )}
        <button type="button" onClick={onReport} className="mt-2 inline-flex w-fit rounded-full bg-[#121314] px-4 py-2 text-xs font-bold text-[#83E300] hover:bg-black" aria-label={`Diagnostic report for ${row.student.display_name}`}>Open full report</button>
      </div>
    </div>
  );
}

function SortArrow({ direction }: { direction: "asc" | "desc" | null }) {
  return <span aria-hidden="true" className={`text-[9px] ${direction ? "text-[#121314]" : "opacity-50"}`}>{direction === "asc" ? "▲" : direction === "desc" ? "▼" : "↕"}</span>;
}

/** A Live progression column heading: click to sort, click again to reverse. Levels start highest first. */
function SortHeading({ label, sortKey, sort, onSort, first = "desc", align = "center" }: {
  label: string; sortKey: LiveSortKey; sort: StudentSort; onSort: (sort: StudentSort) => void; first?: "asc" | "desc"; align?: "left" | "center";
}) {
  const active = sort.startsWith(`${sortKey}-`) ? (sort.split("-")[1] as "asc" | "desc") : null;
  const next = active ? (active === "asc" ? "desc" : "asc") : first;
  return (
    <button type="button" onClick={() => onSort(`${sortKey}-${next}`)} aria-label={`Sort by ${label}`} className={`flex min-w-0 items-center gap-1 uppercase tracking-[inherit] transition hover:text-[#121314] ${align === "left" ? "justify-start text-left" : "justify-center"} ${active ? "text-[#121314]" : ""}`}>
      <span className="truncate">{label}</span><SortArrow direction={active} />
    </button>
  );
}

function RunSortHeading({ label, sortKey, sort, onSort, first = "desc", align = "center" }: {
  label: string; sortKey: RunSortKey; sort: { key: RunSortKey; direction: "asc" | "desc" }; onSort: (sort: { key: RunSortKey; direction: "asc" | "desc" }) => void; first?: "asc" | "desc"; align?: "left" | "center" | "right";
}) {
  const active = sort.key === sortKey ? sort.direction : null;
  return (
    <button type="button" onClick={() => onSort({ key: sortKey, direction: active ? (active === "asc" ? "desc" : "asc") : first })} aria-label={`Sort by ${label}`} className={`flex min-w-0 items-center gap-1 uppercase tracking-[inherit] transition hover:text-[#121314] ${align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center"} ${active ? "text-[#121314]" : ""}`}>
      <span className="truncate">{label}</span><SortArrow direction={active} />
    </button>
  );
}

export default function WholeMathsDiagnosticPanel({
  selectedClass,
  students,
  schoolName = null,
  schoolLogo = null,
}: {
  selectedClass: { id: string; name: string } | null;
  students: DiagnosticStudent[];
  /** For the letterhead of the printed diagnostic report. */
  schoolName?: string | null;
  schoolLogo?: { src: string; alt: string } | null;
}) {
  const [sittings, setSittings] = useState<TeacherDiagnosticSittingRow[]>([]);
  const openDiagnosticReport = async (studentId: string) => {
    const student = students.find((item) => item.id === studentId);
    if (!student) return;
    // Open from the click so pop-up blockers allow it, then fill it in.
    const win = openDocumentWindow();
    if (!win) return;
    // Pre-tests count as Start and June / December post-tests as Mid / End
    // where no whole-maths diagnostic was sat.
    const { data: realmTests, error } = await supabase
      .from("student_realm_assessments")
      .select("realm_id,assessment_type,working_level,score_percent,completed_at,question_results")
      .eq("student_id", studentId);
    if (error) console.warn("[WholeMathsDiagnosticPanel] realm tests unavailable for the report", error);
    writeDocument(win, diagnosticReportHtml({
      brand: {
        schoolName,
        schoolLogo: schoolLogo ? { src: assetUrl(schoolLogo.src, window.location.origin), alt: schoolLogo.alt } : null,
      },
      student: { name: student.display_name, yearLevel: student.school_year_level ?? student.year_level ?? null, className: selectedClass?.name ?? null },
      sittings: sittings.filter((sitting) => sitting.student_id === studentId),
      realmTests: (realmTests ?? []) as RealmTestRow[],
    }));
  };
  const [progression, setProgression] = useState<LiveMathsProgressionRow[]>([]);
  const [view, setView] = useState<DiagnosticView>("live");
  const [selectedStrand, setSelectedStrand] = useState<TrackerTab>("all");
  const [studentSort, setStudentSort] = useState<StudentSort>("behind-first");
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [runSort, setRunSort] = useState<{ key: RunSortKey; direction: "asc" | "desc" }>({ key: "name", direction: "asc" });
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
  const [now, setNow] = useState(() => Date.now());

  // Keep the open session's time left current.
  useEffect(() => {
    if (!schoolSession) return;
    const intervalId = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(intervalId);
  }, [schoolSession]);

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
        // An open session fixes the checkpoint the page shows.
        if (sessionResult.value) setAssignmentCheckpoint(sessionResult.value.checkpoint);
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

  const trackerStudents = useMemo(() => {
    const rows = students.map((student) => {
      const studentProgression = progressionByStudent.get(student.id) ?? [];
      const realmRow = selectedStrand === "all"
        ? null
        : studentProgression.find((row) => row.strand === selectedStrand) ?? null;
      const liveLevel = selectedStrand === "all"
        ? computeWholeMathsLevel(Object.fromEntries(studentProgression.map((row) => [row.strand, row.predicted_level])))
        : realmRow?.predicted_level ?? null;
      const diagnosticPoints = diagnosticPointsByStudent.get(student.id) ?? [];
      return {
        student,
        liveLevel,
        diagnosticPoints,
        latestDiagnostic: diagnosticPoints.at(-1)?.level ?? null,
        ...studentNameParts(student.display_name),
      };
    });

    return rows.sort((left, right) => {
      let comparison = 0;
      switch (studentSort) {
        case "surname-asc": comparison = NAME_COLLATOR.compare(left.surname, right.surname); break;
        case "surname-desc": comparison = NAME_COLLATOR.compare(right.surname, left.surname); break;
        case "given-asc": comparison = NAME_COLLATOR.compare(left.given, right.given); break;
        case "live-desc": comparison = compareNullableLevels(left.liveLevel, right.liveLevel, "desc"); break;
        case "live-asc": comparison = compareNullableLevels(left.liveLevel, right.liveLevel, "asc"); break;
        case "diagnostic-desc": comparison = compareNullableLevels(left.latestDiagnostic, right.latestDiagnostic, "desc"); break;
        case "diagnostic-asc": comparison = compareNullableLevels(left.latestDiagnostic, right.latestDiagnostic, "asc"); break;
      }
      return comparison || NAME_COLLATOR.compare(left.student.display_name, right.student.display_name);
    });
  }, [diagnosticPointsByStudent, progressionByStudent, selectedStrand, studentSort, students]);

  const liveRows = useMemo<LiveRow[]>(() => {
    const nowIso = new Date(now).toISOString();
    const rows = trackerStudents.map(({ student, liveLevel, diagnosticPoints }) => {
      const schoolYear = normalizeYearLabel(student.school_year_level ?? student.year_level ?? null);
      const expectedNow = expectedAt(schoolYear, nowIso);
      const points: LiveCheckpointPoint[] = diagnosticPoints.map((point) => {
        const expected = expectedAt(schoolYear, point.completedAt);
        return { ...point, standing: expected == null ? null : standingForGap(point.level - expected) };
      });
      const first = points[0] ?? null;
      const firstExpected = first ? expectedAt(schoolYear, first.completedAt) : null;
      return {
        student,
        schoolYear,
        liveLevel,
        liveStanding: liveLevel != null && expectedNow != null ? standingForGap(liveLevel - expectedNow) : null,
        expectedNow,
        points,
        byCheckpoint: new Map(points.map((point) => [point.checkpoint, point])),
        firstCheckpoint: first?.checkpoint ?? null,
        growth: first && liveLevel != null ? liveLevel - first.level : null,
        expectedGrowth: first && expectedNow != null && firstExpected != null ? Math.max(0, expectedNow - firstExpected) : null,
      };
    });
    const byName = (left: LiveRow, right: LiveRow) => NAME_COLLATOR.compare(left.student.display_name, right.student.display_name);
    if (studentSort === "behind-first") {
      const gap = (row: LiveRow) => (row.liveLevel != null && row.expectedNow != null ? row.liveLevel - row.expectedNow : null);
      return [...rows].sort((left, right) => compareNullableLevels(gap(left), gap(right), "asc") || byName(left, right));
    }
    const [key, direction] = studentSort.split("-") as [LiveSortKey, "asc" | "desc"];
    if (key === "surname" || key === "given") {
      const part = (row: LiveRow) => studentNameParts(row.student.display_name)[key === "surname" ? "surname" : "given"];
      return [...rows].sort((left, right) => (direction === "asc" ? 1 : -1) * NAME_COLLATOR.compare(part(left), part(right)) || byName(left, right));
    }
    const value = (row: LiveRow): number | null => {
      switch (key) {
        case "expected": return row.expectedNow;
        case "start": case "mid": case "end": return row.byCheckpoint.get(key)?.level ?? null;
        case "live": return row.liveLevel;
        case "growth": return row.growth;
        case "diagnostic": return row.points.at(-1)?.level ?? null;
        default: return null;
      }
    };
    return [...rows].sort((left, right) => compareNullableLevels(value(left), value(right), direction) || byName(left, right));
  }, [now, studentSort, trackerStudents]);

  const runRows = useMemo(() => students.map((student) => {
    const own = sittings
      .filter((sitting) => sitting.student_id === student.id)
      .sort((left, right) => right.created_at.localeCompare(left.created_at));
    const sitting = own.find((item) => item.checkpoint === assignmentCheckpoint) ?? null;
    const otherOpen = own.find((item) => item.status !== "completed" && item.checkpoint !== assignmentCheckpoint && item.checkpoint !== "ad_hoc");
    const state = !sitting
      ? "unassigned" as const
      : sitting.status === "completed"
        ? "finished" as const
        : sitting.strand_results.some((result) => result.status === "completed" || (result.answered_count ?? 0) > 0)
          ? "progress" as const
          : "notStarted" as const;
    return { student, sitting, state, otherActive: otherOpen ? otherOpen.checkpoint as FormalCheckpoint : null };
  }).sort((left, right) => {
    const byName = NAME_COLLATOR.compare(studentNameParts(left.student.display_name).surname, studentNameParts(right.student.display_name).surname)
      || NAME_COLLATOR.compare(left.student.display_name, right.student.display_name);
    if (runSort.key === "name") return runSort.direction === "asc" ? byName : -byName;
    // Result: overall level. A strand: done counts above any answered count; unassigned last.
    const value = (row: { sitting: TeacherDiagnosticSittingRow | null }) => {
      if (!row.sitting) return null;
      if (runSort.key === "result") return row.sitting.overall_level;
      const result = row.sitting.strand_results.find((item) => item.strand === runSort.key);
      return result?.status === "completed" ? 21 : result?.answered_count ?? 0;
    };
    return compareNullableLevels(value(left), value(right), runSort.direction) || byName;
  }), [assignmentCheckpoint, runSort, sittings, students]);
  const runCounts = useMemo(() => runRows.reduce(
    (acc, row) => {
      if (row.state !== "unassigned") acc.assigned += 1;
      if (row.state === "finished") acc.finished += 1;
      if (row.state === "progress") acc.progress += 1;
      if (row.state === "notStarted") acc.notStarted += 1;
      return acc;
    },
    { assigned: 0, finished: 0, progress: 0, notStarted: 0 },
  ), [runRows]);

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
      <header className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#E3E5E0] bg-white px-5 py-4">
        <h2 id="whole-maths-diagnostic-title" className="font-display text-xl font-black text-[#121314]">
          Whole-Maths Diagnostic
        </h2>
        <div className="inline-flex rounded-xl bg-[#F1F2EE] p-1" aria-label="Diagnostic views">
          <button type="button" onClick={() => setView("live")} aria-pressed={view === "live"} className={view === "live" ? "inline-flex items-center gap-1.5 rounded-lg bg-[#121314] px-3.5 py-1.5 text-sm font-bold text-white" : "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-bold text-[#3F4246]"}><TrendingUp className="h-4 w-4" />Live progression</button>
          <button type="button" onClick={() => setView("run")} aria-pressed={view === "run"} className={view === "run" ? "inline-flex items-center gap-1.5 rounded-lg bg-[#121314] px-3.5 py-1.5 text-sm font-bold text-white" : "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-bold text-[#3F4246]"}><ListChecks className="h-4 w-4" />Run diagnostic</button>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          {view === "run" ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8F948C]">Checkpoint</span>
              <div role="radiogroup" aria-label="Checkpoint" className="flex items-center gap-1 rounded-full border-2 border-[#121314] p-0.5 text-sm font-bold">
                {(["start", "mid", "end"] as FormalCheckpoint[]).map((checkpoint) => (
                  <button key={checkpoint} type="button" role="radio" aria-checked={assignmentCheckpoint === checkpoint} disabled={Boolean(schoolSession)} title={schoolSession ? "Close the open session to switch checkpoint" : undefined} onClick={() => setAssignmentCheckpoint(checkpoint)} className={`rounded-full px-4 py-1 transition disabled:cursor-not-allowed ${assignmentCheckpoint === checkpoint ? "bg-[#121314] text-white" : "text-[#121314] hover:bg-[#F1F2EE]"}`}>{CHECKPOINT_SHORT_LABEL[checkpoint]}</button>
                ))}
              </div>
            </div>
          ) : null}
          <button type="button" onClick={() => setScoringOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-[#D9DBD4] px-3.5 py-1.5 text-sm font-bold text-[#121314] hover:border-[#121314]"><Info className="h-4 w-4" />How scoring works</button>
        </div>
      </header>

      {view === "run" ? (
        <div className="space-y-4">
          {/* Live session strip */}
          {schoolSession ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-[#121314] px-5 py-3.5 text-white">
              <span className="relative flex h-3 w-3" aria-hidden="true"><span className="absolute inset-0 animate-ping rounded-full bg-[#83E300] opacity-70" /><span className="relative h-3 w-3 rounded-full bg-[#83E300]" /></span>
              <p className="text-sm font-black">{CHECKPOINT_SHORT_LABEL[schoolSession.checkpoint]} diagnostic session open</p>
              <p className="text-sm text-[#C9CCC6]">
                Closes {new Date(schoolSession.closes_at).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}
                {" · "}<b className="text-white">{formatTimeLeft(schoolSession.closes_at, now)}</b>{" · "}assigned students can work now
              </p>
              <button type="button" disabled={sessionBusy} onClick={() => void toggleSchoolSession()} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-black text-[#121314] disabled:opacity-50"><Lock className="h-4 w-4" />{sessionBusy ? "Closing…" : "Close now"}</button>
            </div>
          ) : null}

          {/* Three steps */}
          <div className="grid gap-3 md:grid-cols-3">
            <RunStep n={1} title="Assign">
              <p className="font-display text-3xl font-black text-[#121314]">{runCounts.assigned}<span className="text-lg text-[#8F948C]"> / {students.length}</span></p>
              <p className="text-xs font-semibold text-[#5A5E63]">students assigned the {CHECKPOINT_SHORT_LABEL[assignmentCheckpoint]} diagnostic</p>
              <button type="button" onClick={openAssignment} aria-label="Assign Start / Mid / End diagnostic to students" disabled={!selectedClass || assignableStudents.length === 0 || Boolean(diagnosticError)} className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#121314] px-3.5 py-1.5 text-sm font-bold text-[#121314] transition hover:bg-[#121314] hover:text-white disabled:opacity-40"><CalendarDays className="h-4 w-4" />Assign students</button>
            </RunStep>
            <RunStep n={2} title="Supervised school session" active={Boolean(schoolSession)}>
              {schoolSession ? (
                <>
                  <p className="font-display text-3xl font-black text-[#3D6600]">Open</p>
                  <p className="text-xs font-semibold text-[#5A5E63]">{CHECKPOINT_SHORT_LABEL[schoolSession.checkpoint]} · until {new Date(schoolSession.closes_at).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" })}</p>
                </>
              ) : (
                <>
                  <p className="font-display text-3xl font-black text-[#121314]">Closed</p>
                  <p className="text-xs font-semibold text-[#5A5E63]">Students can only work during a session at school</p>
                  <button type="button" disabled={!selectedClass || sessionBusy || Boolean(sessionError)} onClick={() => void toggleSchoolSession()} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#83E300] px-4 py-1.5 text-sm font-black text-[#121314] transition hover:bg-[#74CC00] disabled:opacity-40"><Unlock className="h-4 w-4" />{sessionBusy ? "Opening…" : `Open ${CHECKPOINT_SHORT_LABEL[assignmentCheckpoint]} for 2 hours`}</button>
                </>
              )}
            </RunStep>
            <RunStep n={3} title="Progress">
              <div className="grid grid-cols-3 gap-2">
                <div><p className="font-display text-3xl font-black text-[#121314]">{runCounts.finished}</p><p className="text-[11px] font-semibold text-[#5A5E63]">finished</p></div>
                <div><p className="font-display text-3xl font-black text-[#3D6600]">{runCounts.progress}</p><p className="text-[11px] font-semibold text-[#5A5E63]">in progress</p></div>
                <div><p className="font-display text-3xl font-black text-[#8F948C]">{runCounts.notStarted}</p><p className="text-[11px] font-semibold text-[#5A5E63]">not started</p></div>
              </div>
            </RunStep>
          </div>
          {sessionError ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-800">{sessionError}</p> : null}
          {!diagnosticLoading && !diagnosticError && sittings.length === 0 ? (
            <p className="flex items-center gap-2 rounded-xl border border-[#E3E5E0] bg-white px-4 py-3 text-sm text-[#3F4246]">
              <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span><b className="text-[#121314]">No diagnostic sittings yet.</b> Trial schools can begin with the End diagnostic when they are ready. No Start or Mid result is required.</span>
            </p>
          ) : null}

          {/* Every student, six strands */}
          <article className="overflow-hidden rounded-2xl border border-[#E3E5E0] bg-white">
            {diagnosticLoading ? (
              <div className="p-8 text-center text-sm font-semibold text-[#5A5E63]">Loading diagnostic records…</div>
            ) : diagnosticError ? (
              <div className="m-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{diagnosticError}</div>
            ) : (
              <>
                <div className={`${RUN_COLS} border-b border-[#E3E5E0] bg-[#FAFBF8] px-5 py-3 text-center text-[10px] font-black uppercase tracking-[0.12em] text-[#8F948C]`}>
                  <RunSortHeading label="Student" sortKey="name" first="asc" sort={runSort} onSort={setRunSort} align="left" />
                  {DIAGNOSTIC_STRANDS.map((definition) => <RunSortHeading key={definition.strand} label={AC_STRANDS[definition.strand].label} sortKey={definition.strand} sort={runSort} onSort={setRunSort} />)}
                  <RunSortHeading label={`${CHECKPOINT_SHORT_LABEL[assignmentCheckpoint]} result`} sortKey="result" sort={runSort} onSort={setRunSort} align="right" />
                </div>
                {runRows.map(({ student, sitting, state, otherActive }) => {
                  const done = sitting ? sitting.strand_results.filter((result) => result.status === "completed").length : 0;
                  const standing = sitting?.overall_level != null ? sittingStanding(student, sitting) : null;
                  return (
                    <div key={student.id} className={`${RUN_COLS} border-b border-[#F1F2EE] px-5 py-2.5 text-center last:border-0 ${state === "unassigned" ? "bg-[#FAFBF8]" : ""}`}>
                      <div className="min-w-0 text-left">
                        {sitting ? (
                          <button type="button" onClick={() => setSelectedSittingId(sitting.id)} className="block max-w-full truncate text-left text-sm font-black text-[#121314] hover:underline">{student.display_name}</button>
                        ) : <p className="truncate text-sm font-black text-[#A3A7A1]">{student.display_name}</p>}
                        <p className="text-[11px] font-semibold text-[#8F948C]">
                          {state === "finished" ? "Finished" : state === "progress" ? `${done} of 6 strands` : state === "notStarted" ? "Assigned · not started" : otherActive ? `${CHECKPOINT_SHORT_LABEL[otherActive]} diagnostic still open` : "Not assigned"}
                        </p>
                      </div>
                      {sitting ? DIAGNOSTIC_STRANDS.map((definition) => (
                        <RunStrandCell key={definition.strand} result={sitting.strand_results.find((result) => result.strand === definition.strand)} />
                      )) : <span className="col-span-6 text-xs font-semibold text-[#A3A7A1]">Not assigned the {CHECKPOINT_SHORT_LABEL[assignmentCheckpoint]} diagnostic</span>}
                      <div className="flex items-center justify-end gap-2">
                        {state === "finished" && sitting?.overall_level != null ? (
                          <>
                            <span className="rounded-lg px-2 py-1 text-sm font-black tabular-nums" style={standing ? { background: standing.bg, color: standing.fg } : { background: "#F1F2EE", color: "#121314" }} title={standing ? standing.label : undefined}>{sitting.overall_level.toFixed(1)}</span>
                            <button type="button" onClick={() => void openDiagnosticReport(student.id)} className="rounded-full bg-[#121314] px-3 py-1 text-xs font-bold text-[#83E300] hover:bg-black">Report</button>
                          </>
                        ) : state === "unassigned" && !otherActive ? (
                          <button type="button" onClick={() => { setSelectedStudentIds([student.id]); setAssignmentMessage(null); setAssignmentOpen(true); }} className="inline-flex items-center gap-1 rounded-full border border-[#121314] px-3 py-1 text-xs font-bold text-[#121314] hover:bg-[#121314] hover:text-white"><UserPlus className="h-3.5 w-3.5" />Assign</button>
                        ) : state === "unassigned" ? null : (
                          <span className="text-xs font-semibold text-[#A3A7A1]">After all 6 strands</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <p className="flex items-center gap-2 border-t border-[#E3E5E0] bg-[#FAFBF8] px-5 py-3 text-xs font-semibold text-[#5A5E63]">
                  <Info className="h-4 w-4 shrink-0" aria-hidden="true" />Each strand is 20 questions and saves after every answer. The overall result appears once all six strands are done. A diagnostic can move a student up a level but never down.
                </p>
              </>
            )}
          </article>
        </div>
      ) : null}

      {view === "live" ? <article aria-label="Live progression tracker" className="overflow-hidden rounded-2xl border border-[#E3E5E0] bg-white">
        {/* Realm filter and order */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E3E5E0] px-5 py-3">
          <button
            type="button"
            onClick={() => setSelectedStrand("all")}
            aria-pressed={selectedStrand === "all"}
            className={`whitespace-nowrap rounded-full border-2 border-[#121314] px-3.5 py-1.5 text-[13px] font-bold transition ${selectedStrand === "all" ? "bg-[#121314] text-white" : "bg-white text-[#121314] hover:bg-[#EEFBDB]"}`}
          >
            All
          </button>
          {DIAGNOSTIC_STRANDS.filter((definition) => definition.available).map((definition) => (
            <button
              key={definition.strand}
              type="button"
              onClick={() => setSelectedStrand(definition.strand as LiveMathsProgressionRow["strand"])}
              aria-pressed={selectedStrand === definition.strand}
              className={`whitespace-nowrap rounded-full border-2 border-[#121314] px-3.5 py-1.5 text-[13px] font-bold transition ${selectedStrand === definition.strand ? "bg-[#121314] text-white" : "bg-white text-[#121314] hover:bg-[#EEFBDB]"}`}
            >
              {AC_STRANDS[definition.strand].label}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs font-bold text-[#5A5E63]">
            <span className="whitespace-nowrap">Order by</span>
            <select
              value={studentSort}
              onChange={(event) => setStudentSort(event.target.value as StudentSort)}
              className="rounded-full border border-[#D9DBD4] bg-white px-3 py-1.5 text-sm font-bold text-[#121314] outline-none focus:border-[#121314]"
            >
              <option value="behind-first">Furthest behind first</option>
              <option value="surname-asc">Surname A–Z</option>
              <option value="surname-desc">Surname Z–A</option>
              <option value="given-asc">First name A–Z</option>
              <option value="live-desc">Live level: highest</option>
              <option value="live-asc">Live level: lowest</option>
              <option value="diagnostic-desc">Diagnostic: highest</option>
              <option value="diagnostic-asc">Diagnostic: lowest</option>
              <option value="expected-desc">Expected now: highest</option>
              <option value="expected-asc">Expected now: lowest</option>
              <option value="start-desc">Start: highest</option>
              <option value="start-asc">Start: lowest</option>
              <option value="mid-desc">Mid: highest</option>
              <option value="mid-asc">Mid: lowest</option>
              <option value="end-desc">End: highest</option>
              <option value="end-asc">End: lowest</option>
              <option value="growth-desc">Growth: most</option>
              <option value="growth-asc">Growth: least</option>
            </select>
          </label>
        </div>

        {/* Column headings */}
        <div className={`${LIVE_COLS} sticky top-0 z-10 border-b border-[#E3E5E0] bg-[#FAFBF8] px-5 py-3 text-center text-[10px] font-black uppercase tracking-[0.14em] text-[#8F948C]`}>
          <SortHeading label="Student" sortKey="surname" first="asc" sort={studentSort} onSort={setStudentSort} align="left" />
          <SortHeading label="Expected now" sortKey="expected" sort={studentSort} onSort={setStudentSort} />
          <SortHeading label="Start" sortKey="start" sort={studentSort} onSort={setStudentSort} />
          <SortHeading label="Mid" sortKey="mid" sort={studentSort} onSort={setStudentSort} />
          <SortHeading label="End" sortKey="end" sort={studentSort} onSort={setStudentSort} />
          <SortHeading label="Live now" sortKey="live" sort={studentSort} onSort={setStudentSort} />
          <SortHeading label="Growth vs expected" sortKey="growth" sort={studentSort} onSort={setStudentSort} align="left" />
          <span />
        </div>

        <div>
          {liveLoading || liveError ? (
            <div className={`px-5 py-8 text-center text-sm font-semibold ${liveError ? "text-rose-700" : "text-[#5A5E63]"}`}>{liveError ?? "Loading live progression…"}</div>
          ) : students.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm font-semibold text-[#5A5E63]">No students in this class.</div>
          ) : liveRows.map((row) => {
            const isOpen = expandedStudentId === row.student.id;
            return (
              <div key={row.student.id} className="border-b border-[#F1F2EE] last:border-0">
                <div
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onClick={() => setExpandedStudentId(isOpen ? null : row.student.id)}
                  onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setExpandedStudentId(isOpen ? null : row.student.id); } }}
                  className={`${LIVE_COLS} cursor-pointer px-5 py-2.5 text-center transition hover:bg-[#FAFBF8] ${isOpen ? "bg-[#FAFBF8]" : ""}`}
                >
                  <p className="truncate text-left text-sm font-black text-[#121314]">
                    {row.student.display_name}
                    {row.schoolYear ? <span className="ml-2 text-xs font-semibold text-[#8F948C]">{row.schoolYear.replace("Year ", "Y")}</span> : null}
                  </p>
                  <span className="text-sm font-bold tabular-nums text-[#8F948C]">{row.expectedNow == null ? "—" : row.expectedNow.toFixed(1)}</span>
                  {(["start", "mid", "end"] as FormalCheckpoint[]).map((checkpoint) => {
                    const point = row.byCheckpoint.get(checkpoint);
                    return point ? (
                      <button
                        key={checkpoint}
                        type="button"
                        onClick={(event) => { event.stopPropagation(); setSelectedSittingId(point.sittingId); }}
                        title={`${CHECKPOINT_LABEL[checkpoint]} · ${formatProgressionPoint(point.level)} · open details`}
                        className="mx-auto"
                      >
                        <LevelBlock level={point.level} standing={point.standing} />
                      </button>
                    ) : <span key={checkpoint} className="text-sm text-[#C9CCC6]">—</span>;
                  })}
                  {row.liveLevel == null ? (
                    <span className="text-sm text-[#C9CCC6]" title={selectedStrand === "all" ? "A Whole-Maths live score appears after progress in all six strands" : undefined}>—</span>
                  ) : (
                    <span className="mx-auto" title={`Live ${formatProgressionPoint(row.liveLevel)}`}><LevelBlock level={row.liveLevel} standing={row.liveStanding} /></span>
                  )}
                  {row.growth == null || row.expectedGrowth == null ? (
                    <span className="text-left text-xs font-semibold text-[#A3A7A1]">{row.liveLevel == null ? "Live score pending" : "No diagnostic yet"}</span>
                  ) : (
                    <div className="flex items-center gap-2 text-left" title={`${signed(row.growth)} since ${CHECKPOINT_SHORT_LABEL[row.firstCheckpoint ?? "start"]} · expected ${signed(row.expectedGrowth, 2)}`}>
                      <div className="relative h-2 flex-1 rounded-full bg-[#ECEDE9]">
                        <div className={`h-full rounded-full ${row.growth >= row.expectedGrowth ? "bg-[#5FAE00]" : "bg-[#F0A23B]"}`} style={{ width: `${Math.max(0, Math.min(100, (row.growth / GROWTH_BAR_MAX) * 100))}%` }} />
                        <span className="absolute -top-1 h-4 w-0.5 rounded bg-[#121314]" style={{ left: `${Math.max(0, Math.min(100, (row.expectedGrowth / GROWTH_BAR_MAX) * 100))}%` }} />
                      </div>
                      <span className="w-10 text-xs font-black tabular-nums text-[#121314]">{signed(row.growth)}</span>
                    </div>
                  )}
                  <ChevronDown className={`h-4 w-4 text-[#8F948C] transition ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </div>
                {isOpen ? (
                  <GrowthLine
                    row={row}
                    onReport={() => void openDiagnosticReport(row.student.id)}
                    onOpenSitting={setSelectedSittingId}
                  />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Key */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#E3E5E0] bg-[#FAFBF8] px-5 py-3 text-[11px] font-bold">
          {STANDING_ORDER.map((standing) => (
            <span key={standing} className="rounded-full px-2.5 py-1" style={{ background: STANDING_META[standing].bg, color: STANDING_META[standing].fg }}>{STANDING_META[standing].label}</span>
          ))}
          <span className="font-semibold text-[#5A5E63]">
            Live score = Live now, updated by lessons, quizzes and realm tests. Diagnostic score = the fixed Start, Mid and End results (S = Start · M = Mid · E = End), each coloured against where the student was expected to be when they sat it.
            {" "}<span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-0.5 rounded bg-[#121314]" />on the growth bar = growth expected since their first diagnostic (a quarter of a level per term).</span>
            {selectedStrand === "all" ? " “All” needs results from all six strands." : ""}
            {diagnosticError ? " Diagnostic results are temporarily unavailable; live scores remain current." : ""}
          </span>
        </div>
      </article> : null}

      {assignmentOpen ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !assignmentBusy) setAssignmentOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="assign-diagnostic-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div><h3 id="assign-diagnostic-title" className="text-xl font-black text-slate-950">Assign Whole-Maths Diagnostic</h3><p className="mt-1 text-sm text-slate-500">Students complete six 20-question starting-level tests over several school sessions. Their work saves after every response and resumes when you next open the checkpoint.</p>{assignmentCheckpoint === "end" ? <p className="mt-2 text-xs font-bold text-[#3D6600]">End may be the student&apos;s first formal checkpoint. Start and Mid will remain blank.</p> : null}</div>
              <button type="button" disabled={assignmentBusy} onClick={() => setAssignmentOpen(false)} aria-label="Close assignment" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-5 p-5">
              <fieldset><legend className="text-sm font-black text-slate-900">Checkpoint</legend><div className="mt-2 grid gap-2 sm:grid-cols-3">{(["start", "mid", "end"] as FormalCheckpoint[]).map((checkpoint) => <label key={checkpoint} className={`cursor-pointer rounded-xl border p-3 ${assignmentCheckpoint === checkpoint ? "border-[#121314] bg-[#F1F2EE]" : "border-slate-200"}`}><input type="radio" name="diagnostic-checkpoint" value={checkpoint} checked={assignmentCheckpoint === checkpoint} onChange={() => setAssignmentCheckpoint(checkpoint)} className="mr-2" /><span className="font-bold text-slate-900">{checkpoint === "start" ? "Start" : checkpoint === "mid" ? "Mid" : "End"}</span></label>)}</div></fieldset>
              <fieldset><legend className="sr-only">Students</legend><div className="flex items-center justify-between gap-3"><span className="text-sm font-black text-slate-900">Students</span><button type="button" onClick={() => setSelectedStudentIds(selectedStudentIds.length === assignableStudents.length ? [] : assignableStudents.map((student) => student.id))} className="text-xs font-black text-[#3D6600]">{selectedStudentIds.length === assignableStudents.length ? "Clear all" : "Select all"}</button></div><div className="mt-2 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">{students.map((student) => { const active = activeStudentIds.has(student.id); return <label key={student.id} className={`rounded-xl border p-3 ${active ? "cursor-not-allowed bg-slate-100 text-slate-400" : "cursor-pointer border-slate-200 text-slate-900"}`}><input type="checkbox" disabled={active || assignmentBusy} checked={selectedStudentIds.includes(student.id)} onChange={() => setSelectedStudentIds((current) => current.includes(student.id) ? current.filter((id) => id !== student.id) : [...current, student.id])} className="mr-2" /><span className="font-bold">{student.display_name}</span>{active ? <span className="ml-2 text-xs">Active diagnostic</span> : null}</label>; })}</div></fieldset>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">Official overall results appear only after Number, Measurement, Space, Statistics, Algebra and Probability are all complete. Start, Mid and End may securely promote a mastered realm, but never automatically demote a student.</div>
              {assignmentMessage ? <p role="status" className="rounded-xl bg-slate-100 p-3 text-sm font-bold text-slate-800">{assignmentMessage}</p> : null}
              <div className="flex justify-end gap-2"><button type="button" disabled={assignmentBusy} onClick={() => setAssignmentOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700">Close</button><button type="button" disabled={assignmentBusy || selectedStudentIds.length === 0} onClick={() => void assignDiagnostics()} className="rounded-xl bg-[#121314] px-5 py-2.5 font-black text-white disabled:opacity-40">{assignmentBusy ? "Assigning…" : `Assign to ${selectedStudentIds.length}`}</button></div>
            </div>
          </section>
        </div>
      ) : null}

      {selectedSitting ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSittingId(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="diagnostic-detail-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-[#121314]">{CHECKPOINT_LABEL[selectedSitting.checkpoint]}</p>
                <h3 id="diagnostic-detail-title" className="mt-1 text-xl font-black text-slate-950">{studentNames.get(selectedSitting.student_id) ?? "Student"}</h3>
                <p className="mt-1 text-sm text-slate-500">Overall {selectedSitting.overall_level == null ? "pending" : formatProgressionPoint(selectedSitting.overall_level)}</p>
              </div>
              <button type="button" onClick={() => setSelectedSittingId(null)} aria-label="Close diagnostic details" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {DIAGNOSTIC_STRANDS.map((definition) => {
                const result = selectedSitting.strand_results.find((item) => item.strand === definition.strand);
                return <div key={definition.strand} className="rounded-xl border border-slate-200 p-4"><p className="font-black text-slate-900">{AC_STRANDS[definition.strand].label}</p><p className="mt-1 text-2xl font-black text-[#121314]">{result?.measured_level == null ? "—" : formatProgressionPoint(result.measured_level)}</p><p className="mt-1 text-xs font-semibold capitalize text-slate-500">{result?.status ?? "Not recorded"}</p></div>;
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
              <p>All six maths strand engines are connected. Levels G–6 have 20 questions per strand test; Levels 7–8 have 30. An official overall result appears only when all six strands are complete.</p>
              <div className="grid gap-2 sm:grid-cols-2">{DIAGNOSTIC_STRANDS.map((definition) => <div key={definition.strand} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="font-bold text-slate-800">{AC_STRANDS[definition.strand].label}</span><span>{AC_STRANDS[definition.strand].weight}/{WHOLE_MATHS_WEIGHT_TOTAL}</span></div>)}</div>
              <p><strong className="text-slate-900">Adaptive testing:</strong> {DIAGNOSTIC_MASTERY}% or higher probes the next level. A very low result may probe down to produce a more accurate measurement. Existing placements are never automatically lowered.</p>
              <p><strong className="text-slate-900">Trial schools:</strong> End can be the first official checkpoint. It produces a valid achievement result; diagnostic growth appears only when two formal checkpoints exist.</p>
              <p><strong className="text-slate-900">Follow-up placement:</strong> After mastering a level, {DIAGNOSTIC_FLOOR}% or more on the next level earns placement there. Below {DIAGNOSTIC_FLOOR}%, the student stays at the last mastered level. Live lesson placement currently extends to Level 7.</p>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
