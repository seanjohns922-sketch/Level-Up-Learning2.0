"use client";

import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Download,
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
  StudentLearningJourney,
} from "@/lib/school-platform-server";
import {
  type AcStrand,
  AC_STRANDS,
  strandForRealm,
} from "@/lib/curriculum/ac-standards";

type AnalyticsTab =
  | "overview"
  | "growth"
  | "curriculum"
  | "placement"
  | "intervention"
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
  { id: "placement", label: "Placement" },
  { id: "intervention", label: "Intervention" },
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

// Level standing = working level vs the student's school grade. This is what
// "at standard" means to a school: a Grade 3 working at Level 3 is AT level; a
// Grade 4 at Level 3 is BEHIND; a Grade 3 at Level 4 is ABOVE. (The post-test %
// says how securely they hold a level; this says whether they're on track for
// their age.)
type LevelStanding = "below" | "at" | "above";
const SCHOOL_LEVEL_ORDER = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const PLACEMENT_LEVEL_COLUMNS = [...SCHOOL_LEVEL_ORDER, "Not placed"];
const levelIndex = (year: string | null | undefined) => (year ? SCHOOL_LEVEL_ORDER.indexOf(year) : -1);
function levelStanding(grade: string | null | undefined, working: string | null | undefined): LevelStanding | null {
  const g = levelIndex(grade);
  const w = levelIndex(working);
  if (g < 0 || w < 0) return null;
  return w > g ? "above" : w < g ? "below" : "at";
}
const STANDING_STYLE: Record<LevelStanding, { label: string; pill: string; bar: string }> = {
  below: { label: "Below level", pill: "bg-rose-100 text-rose-800", bar: "#c2534d" },
  at: { label: "At level", pill: "bg-emerald-100 text-emerald-800", bar: "#0f9d6b" },
  above: { label: "Above level", pill: "bg-indigo-100 text-indigo-800", bar: "#5b6ee6" },
};
const STANDING_ORDER: LevelStanding[] = ["below", "at", "above"];
// Sequential ramp for ordinal working levels in the placement view.
const LEVEL_RAMP = ["#0b6f4c", "#0f9d6b", "#3fb889", "#7fce9f", "#a9dcb3", "#cfe8cc", "#e6e2b0"];
// Colour a level/grade by its position on the Ground->Year 6 ladder, so the
// school-grade bar and the working-level bar share colours (Year 3 == Level 3)
// and any mismatch between them reads as a colour shift.
const levelColor = (level: string) => { const i = levelIndex(level); return i >= 0 ? LEVEL_RAMP[i] : "#cbd5e1"; };

const JOURNEY_PASS = 85;
const JOURNEY_LADDER: Array<[string, string]> = [
  ["Prep", "Ground"], ["Year 1", "Level 1"], ["Year 2", "Level 2"], ["Year 3", "Level 3"],
  ["Year 4", "Level 4"], ["Year 5", "Level 5"], ["Year 6", "Level 6"],
];
const JOURNEY_REALMS: Record<string, { name: string; color: string; order: number }> = {
  number: { name: "Number Nexus", color: "#0e9c93", order: 0 },
  measurement: { name: "Measurelands", color: "#c2892e", order: 1 },
  space: { name: "Starpath", color: "#5b6ee6", order: 2 },
  statistics: { name: "Statistica", color: "#c2557a", order: 3 },
};
const JOURNEY_CHECK = '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M5 12l4 4 10-10" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Render a printable Learning Journey document from live progression data. Kept
// as a pure string builder so it can be written into a popup for print/PDF.
function buildJourneyHtml(data: StudentLearningJourney): string {
  const meta = (id: string) => JOURNEY_REALMS[id] ?? { name: id, color: "#5a6a62", order: 99 };
  const fmt = (iso: string | null) => (iso ? new Intl.DateTimeFormat("en-AU", { month: "short", year: "numeric", timeZone: "Australia/Melbourne" }).format(new Date(iso)) : "");
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
  const labelFor = (workingLevel: string) => JOURNEY_LADDER.find((l) => l[0] === workingLevel)?.[1] ?? workingLevel;

  const byRealm = new Map<string, StudentLearningJourney["levels"]>();
  for (const lv of data.levels) {
    const list = byRealm.get(lv.realmId) ?? [];
    list.push(lv);
    byRealm.set(lv.realmId, list);
  }
  const realmIds = [...byRealm.keys()].sort((a, b) => meta(a).order - meta(b).order);
  const passed = (r?: StudentLearningJourney["levels"][number]) => Boolean(r && r.posttestScore != null && r.posttestScore >= JOURNEY_PASS);

  let mastered = 0;
  const milestones: Array<{ iso: string; date: string; realm: string; color: string; level: string; score: number; next: string }> = [];

  const sections = realmIds.map((rid) => {
    const rows = byRealm.get(rid)!;
    const m = meta(rid);
    const curRow = rows.find((r) => r.isCurrent);
    const curLabel = curRow ? labelFor(curRow.workingLevel) : null;
    let masteredHere = 0;
    const steps = JOURNEY_LADDER.map(([id, label], i) => {
      const row = rows.find((r) => r.workingLevel === id);
      const isPass = passed(row);
      const isCurrent = Boolean(row && row.isCurrent && !isPass);
      let cls = ""; let date = "";
      if (isPass && row) {
        cls = "done"; masteredHere += 1;
        date = i === 0 ? "start" : fmt(row.posttestCompletedAt);
        if (row.posttestCompletedAt) milestones.push({ iso: row.posttestCompletedAt, date: fmt(row.posttestCompletedAt), realm: m.name, color: m.color, level: label, score: row.posttestScore!, next: JOURNEY_LADDER[i + 1]?.[1] ?? "complete" });
      } else if (isCurrent && row) {
        cls = "current"; date = row.currentWeek ? `Week ${row.currentWeek}` : "current";
      } else if (row) {
        cls = "started";
      }
      const node = isPass ? JOURNEY_CHECK : id === "Prep" ? "G" : String(i);
      return `<div class="step ${cls}"><span class="node">${node}</span><span class="lab">${label}</span><span class="date">${date}</span></div>`;
    }).join("");
    mastered += masteredHere;
    return `<section class="realm" style="--accent:${m.color}"><div class="realm-head"><h3>${esc(m.name)}</h3><div class="rmeta"><span class="mastered">${masteredHere} mastered</span>${curLabel ? `<span class="now">${curLabel}${curRow && curRow.currentWeek ? ` · Week ${curRow.currentWeek}` : ""}</span>` : ""}</div></div><div class="stepwrap"><div class="stepper">${steps}</div></div></section>`;
  }).join("");

  milestones.sort((a, b) => b.iso.localeCompare(a.iso));
  const mileHtml = milestones.length
    ? milestones.map((ms) => `<div class="mile" style="--accent:${ms.color}"><div class="when">${ms.date}</div><div class="what"><span class="rdot"></span><div class="txt"><b>${esc(ms.realm)}</b> — passed ${ms.level} post-test <span class="score">${ms.score}%</span> <span class="adv">→ ${ms.next === "complete" ? "realm complete" : `advanced to ${ms.next}`}</span></div></div></div>`).join("")
    : `<p style="color:#8a988f;font-size:13px;padding:8px 0">No post-tests passed yet.</p>`;

  const generated = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Melbourne" }).format(new Date());
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(data.student.name)} — Learning Journey</title><style>
    *{box-sizing:border-box}body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0d1512;margin:0;padding:30px 40px;font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased}
    .eyebrow{font-size:10.5px;font-weight:800;letter-spacing:.19em;text-transform:uppercase;color:#0a6f4b}
    h1{font-size:30px;margin:5px 0 2px;font-weight:850}.meta{margin:0;color:#5a6a62;font-size:13px;font-weight:600}
    .head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;border-bottom:1px solid #dde4df;padding-bottom:18px}
    .stats{display:flex;gap:12px;margin:20px 0}.stat{flex:1;border:1px solid #dde4df;border-radius:12px;padding:12px 15px}.stat b{display:block;font-size:26px;font-weight:900;line-height:1}.stat span{font-size:11px;font-weight:700;color:#5a6a62;text-transform:uppercase;letter-spacing:.05em}
    h2{font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#8a988f;margin:26px 0 12px}
    .realm{border:1px solid #dde4df;border-radius:15px;padding:16px 20px 20px;margin-bottom:12px;border-left:4px solid var(--accent)}
    .realm-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}.realm-head h3{margin:0;font-size:16px;font-weight:850;color:var(--accent)}
    .rmeta{display:flex;gap:12px;align-items:center}.mastered{font-size:11.5px;font-weight:700;color:#5a6a62}.now{font-size:12px;font-weight:800;color:#fff;background:var(--accent);border-radius:20px;padding:3px 11px}
    .stepwrap{overflow-x:auto;padding-top:16px}.stepper{position:relative;display:flex;justify-content:space-between;min-width:460px}
    .step{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;gap:5px}
    .step::before{content:"";position:absolute;top:15px;right:50%;width:100%;height:3px;background:#dde4df;z-index:-1}.step:first-child::before{display:none}
    .step.done::before,.step.current::before{background:var(--accent)}
    .node{width:31px;height:31px;border-radius:50%;display:grid;place-items:center;background:#f1f5f2;border:2.5px solid #dde4df;color:#8a988f;font-size:11px;font-weight:800}
    .step.done .node{background:var(--accent);border-color:var(--accent);color:#fff}
    .step.current .node{background:#fff;border-color:var(--accent);color:var(--accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 20%,transparent)}
    .step.started .node{border-color:var(--accent)}
    .lab{font-size:10px;font-weight:800;color:#5a6a62;white-space:nowrap}.step.current .lab{color:var(--accent)}
    .date{font-size:9px;font-weight:700;color:#8a988f;min-height:11px}.step.current .date{color:var(--accent)}
    .timeline{border:1px solid #dde4df;border-radius:15px;padding:6px 20px}
    .mile{display:grid;grid-template-columns:90px 1fr;gap:14px;padding:13px 0;border-bottom:1px solid #eef2ef}.mile:last-child{border-bottom:0}
    .when{font-size:12px;font-weight:800;color:#5a6a62}.what{display:flex;gap:10px;align-items:flex-start}.rdot{width:11px;height:11px;border-radius:50%;background:var(--accent);margin-top:4px;flex:0 0 auto}
    .txt{font-size:13px}.score{font-weight:800;color:var(--accent)}.adv{color:#5a6a62;font-weight:600}
    footer{margin-top:22px;font-size:10.5px;color:#8a988f}
    .btn{margin-top:20px;padding:9px 16px;border:0;border-radius:8px;background:#0f9d6b;color:#fff;font-weight:800;font-size:13px;cursor:pointer}
    @media print{body{padding:12mm}.noprint{display:none}}
  </style></head><body>
    <div class="head"><div><div class="eyebrow">Level Up Learning · Learning Journey</div><h1>${esc(data.student.name)}</h1><p class="meta">${esc(data.student.yearLevel ?? "Year not recorded")} · ${esc(data.student.className)} · Generated ${generated}</p></div></div>
    <div class="stats"><div class="stat"><b>${mastered}</b><span>Levels mastered</span></div><div class="stat"><b>${realmIds.length}</b><span>Realms active</span></div><div class="stat"><b>${milestones.length}</b><span>Post-tests passed</span></div></div>
    <h2>Realm progression</h2>${sections || '<p style="color:#8a988f;font-size:13px">No realm progress recorded yet.</p>'}
    <h2>Milestones</h2><div class="timeline">${mileHtml}</div>
    <footer>A level is mastered when its post-test is passed (${JOURNEY_PASS}%+). Each realm progresses Ground → Level 1–6. Dates show when each post-test was passed.</footer>
    <button class="btn noprint" onclick="window.print()">Print / Save as PDF</button>
  </body></html>`;
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

  const downloadStudentReportPdf = async (student: SchoolAnalyticsSnapshot["students"][number]) => {
    const generated = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Melbourne" }).format(new Date());
    const pct = (v: number | null) => (v === null ? "—" : `${v}%`);
    const statusText = student.status === "on_track" ? "On track" : student.status === "needs_attention" ? "Needs attention" : "Active";
    const { default: jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 16;
    let y = 18;
    const addPageIfNeeded = (height: number) => {
      if (y + height <= 282) return;
      pdf.addPage();
      y = 18;
    };
    const text = (value: string, x: number, nextY: number, options?: Parameters<typeof pdf.text>[3]) => {
      pdf.text(value, x, nextY, options);
      y = Math.max(y, nextY);
    };

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(11, 111, 76);
    pdf.setFontSize(9);
    text("LEVEL UP LEARNING · STUDENT PROGRESS", margin, y);
    pdf.setTextColor(14, 21, 18);
    pdf.setFontSize(22);
    text(student.name, margin, y + 9);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(92, 107, 99);
    text(`${student.yearLevel ?? "Year not recorded"} · ${student.className || "No class"} · Last ${days} days · Generated ${generated}`, margin, y + 6);

    const pill = (label: string, x: number, nextY: number) => {
      const width = pdf.getTextWidth(label) + 8;
      pdf.setFillColor(227, 244, 236);
      pdf.roundedRect(x, nextY - 5, width, 7.5, 3.5, 3.5, "F");
      pdf.setTextColor(11, 111, 76);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.text(label, x + 4, nextY);
      return x + width + 4;
    };
    let pillX = margin;
    pillX = pill(statusText, pillX, y + 11);
    pill(student.weeklyTargetMet ? "Weekly target met" : "Weekly target not yet met", pillX, y + 11);
    y += 20;

    const cards = [
      ["Avg accuracy", pct(student.averageAccuracy)],
      ["Avg growth", student.averageGrowth === null ? "—" : `${student.averageGrowth} pts`],
      ["Levels mastered", String(student.masteredLevels)],
      ["Learning days", String(student.learningDays)],
    ];
    const cardWidth = (pageWidth - margin * 2 - 9) / 4;
    cards.forEach(([label, value], index) => {
      const x = margin + index * (cardWidth + 3);
      pdf.setDrawColor(214, 221, 215);
      pdf.roundedRect(x, y, cardWidth, 23, 3, 3);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(92, 107, 99);
      pdf.text(label.toUpperCase(), x + 4, y + 7);
      pdf.setTextColor(14, 21, 18);
      pdf.setFontSize(15);
      pdf.text(value, x + 4, y + 17);
    });
    y += 35;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(13);
    pdf.setTextColor(14, 21, 18);
    text("Progress by curriculum strand", margin, y);
    y += 8;

    const headers = ["Realm / strand", "Current", "Latest", "Band", "Pre", "Post", "Growth"];
    const widths = [39, 34, 20, 27, 18, 18, 25];
    const drawRow = (values: string[], header = false) => {
      addPageIfNeeded(header ? 11 : 10);
      let x = margin;
      pdf.setFont("helvetica", header ? "bold" : "normal");
      pdf.setFontSize(header ? 7.2 : 8.5);
      pdf.setTextColor(header ? 92 : 14, header ? 107 : 21, header ? 99 : 18);
      if (header) {
        pdf.setDrawColor(214, 221, 215);
        pdf.line(margin, y + 2, pageWidth - margin, y + 2);
      }
      values.forEach((value, index) => {
        const lines = pdf.splitTextToSize(value, widths[index] - 2).slice(0, 2);
        pdf.text(lines, x, y + (header ? 0 : 2));
        x += widths[index];
      });
      if (!header) {
        pdf.setDrawColor(238, 242, 239);
        pdf.line(margin, y + 8, pageWidth - margin, y + 8);
      }
      y += header ? 8 : 10;
    };
    drawRow(headers, true);
    if (student.realms.length === 0) {
      drawRow(["No realm evidence in this window.", "", "", "", "", "", ""]);
    } else {
      student.realms.forEach((realm) => {
        const standing = levelStanding(student.yearLevel, realm.currentLevel);
        drawRow([
          REALMS[realm.realmId] ?? realm.realmId,
          `${realm.currentLevel ?? "Not placed"}${realm.currentWeek ? ` · Wk ${realm.currentWeek}` : ""}`,
          pct(realm.assessmentScore),
          standing ? STANDING_STYLE[standing].label : "—",
          pct(realm.pretestScore),
          pct(realm.posttestScore),
          realm.growth === null ? "—" : `${realm.growth > 0 ? "+" : ""}${realm.growth} pts`,
        ]);
      });
    }

    addPageIfNeeded(28);
    pdf.setDrawColor(214, 221, 215);
    pdf.line(margin, y + 4, pageWidth - margin, y + 4);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    pdf.setTextColor(138, 152, 143);
    const footer = "Latest test = most recent post-test (or placement pre-test). Standing compares working level to school grade. Growth uses matched pre/post-test pairs.";
    pdf.text(pdf.splitTextToSize(footer, pageWidth - margin * 2), margin, y + 12);
    const fileName = `${student.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "student"}-progress-report.pdf`;
    pdf.save(fileName);
  };

  const openLearningJourney = async (studentId: string) => {
    const win = window.open("", "_blank", "width=1000,height=1200");
    if (!win) return;
    win.document.write('<!doctype html><meta charset="utf-8"><body style="font-family:system-ui;padding:40px;color:#334">Generating learning journey…</body>');
    try {
      const response = await fetch(`/api/school/${schoolId}/student/${studentId}/journey`, { credentials: "same-origin" });
      const result = (await response.json()) as StudentLearningJourney & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Learning journey unavailable.");
      win.document.open();
      win.document.write(buildJourneyHtml(result));
      win.document.close();
    } catch {
      win.document.body.innerHTML = '<p style="font-family:system-ui;padding:40px;color:#a33">Could not generate the learning journey. Please try again.</p>';
    }
  };

  // Group curriculum evidence by AC9 strand, with an evidence-weighted band
  // distribution per strand (the visual leaders scan first).
  const standingByStrand = useMemo(() => {
    const students = snapshot?.students ?? [];
    type Counts = Record<LevelStanding, number>;
    const groups = new Map<AcStrand, { strand: AcStrand; label: string; order: number; counts: Counts; total: number; byGrade: Map<string, { counts: Counts; total: number }> }>();
    for (const student of students) {
      const grade = student.yearLevel ?? "Not recorded";
      for (const realm of student.realms) {
        const strand = strandForRealm(realm.realmId);
        const standing = levelStanding(student.yearLevel, realm.currentLevel);
        if (!strand || !standing) continue;
        const group = groups.get(strand) ?? { strand, label: AC_STRANDS[strand].label, order: AC_STRANDS[strand].order, counts: { below: 0, at: 0, above: 0 }, total: 0, byGrade: new Map() };
        group.counts[standing] += 1; group.total += 1;
        const gradeRow = group.byGrade.get(grade) ?? { counts: { below: 0, at: 0, above: 0 }, total: 0 };
        gradeRow.counts[standing] += 1; gradeRow.total += 1;
        group.byGrade.set(grade, gradeRow);
        groups.set(strand, group);
      }
    }
    return [...groups.values()]
      .map((group) => ({
        ...group,
        onTrackPct: group.total ? Math.round(((group.counts.at + group.counts.above) / group.total) * 100) : 0,
        grades: [...group.byGrade.entries()]
          .sort((a, b) => levelIndex(a[0]) - levelIndex(b[0]))
          .map(([grade, value]) => ({ grade, ...value })),
      }))
      .sort((a, b) => a.order - b.order);
  }, [snapshot?.students]);

  // Placement baseline: where students currently sit per AC9 strand (working
  // level distribution) and their average pre-test starting point. This is the
  // foundation the future weighted overall-maths level builds on.
  const placementByStrand = useMemo(() => {
    const students = snapshot?.students ?? [];
    const groups = new Map<string, { key: string; label: string; order: number; levels: Map<string, number>; byGrade: Map<string, { levels: Map<string, number>; total: number }>; standings: Record<LevelStanding, number>; standingTotal: number; preSum: number; preCount: number; placed: number }>();
    for (const student of students) {
      for (const realm of student.realms) {
        const strand: AcStrand | null = strandForRealm(realm.realmId);
        const key = strand ?? "other";
        const label = strand ? AC_STRANDS[strand].label : "Other";
        const order = strand ? AC_STRANDS[strand].order : 99;
        const group = groups.get(key) ?? { key, label, order, levels: new Map(), byGrade: new Map(), standings: { below: 0, at: 0, above: 0 }, standingTotal: 0, preSum: 0, preCount: 0, placed: 0 };
        const level = realm.currentLevel ?? "Not placed";
        const grade = student.yearLevel ?? "Not recorded";
        group.levels.set(level, (group.levels.get(level) ?? 0) + 1);
        const gradeRow = group.byGrade.get(grade) ?? { levels: new Map(), total: 0 };
        gradeRow.levels.set(level, (gradeRow.levels.get(level) ?? 0) + 1);
        gradeRow.total += 1;
        group.byGrade.set(grade, gradeRow);
        const standing = levelStanding(student.yearLevel, realm.currentLevel);
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
  }, [snapshot?.students]);

  // Leadership intervention lens: for each AC9 strand x school year, how many
  // students are below their grade level (aggregate only — no individual
  // grouping/reassignment; that is the teacher surface's job).
  const intervention = useMemo(() => {
    const students = snapshot?.students ?? [];
    const cells = new Map<string, { strand: AcStrand; year: string; needs: number; total: number }>();
    const yearSet = new Set<string>();
    for (const student of students) {
      const year = student.yearLevel ?? "Not recorded";
      for (const realm of student.realms) {
        const strand = strandForRealm(realm.realmId);
        const standing = levelStanding(student.yearLevel, realm.currentLevel);
        if (!strand || !standing) continue;
        yearSet.add(year);
        const key = `${strand}|${year}`;
        const cell = cells.get(key) ?? { strand, year, needs: 0, total: 0 };
        cell.total += 1;
        if (standing === "below") cell.needs += 1;
        cells.set(key, cell);
      }
    }
    const strands = [...new Set([...cells.values()].map((c) => c.strand))].sort((a, b) => AC_STRANDS[a].order - AC_STRANDS[b].order);
    const years = [...YEAR_LEVELS, "Not recorded"].filter((y) => yearSet.has(y));
    const hotspots = [...cells.values()].filter((c) => c.needs > 0).sort((a, b) => b.needs - a.needs || (b.needs / b.total) - (a.needs / a.total));
    const totalNeeds = hotspots.reduce((sum, c) => sum + c.needs, 0);
    const maxNeeds = Math.max(1, ...hotspots.map((c) => c.needs));
    return { cells, strands, years, hotspots, totalNeeds, maxNeeds };
  }, [snapshot?.students]);

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
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Filters</p>
          <div className="flex items-center gap-2">
            <a
              href={exportHref || undefined}
              download
              aria-disabled={!exportHref}
              className={`inline-flex items-center gap-1.5 rounded-md border border-emerald-700 px-3 py-1.5 text-xs font-bold ${exportHref ? "text-emerald-800 hover:bg-emerald-50" : "pointer-events-none text-slate-300"}`}
            >
              <Download className="h-3.5 w-3.5" /> Export {tab === "curriculum" ? "curriculum" : "students"} CSV
            </a>
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
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-950">On-track standing by AC9 strand</h3>
              <p className="mt-1 text-sm text-slate-500">Working level compared to school grade. At level means their level matches their year (e.g. Grade 3 at Level 3).</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
              {STANDING_ORDER.map((standing) => (
                <span key={standing} className="inline-flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm" style={{ background: STANDING_STYLE[standing].bar }} />
                  {STANDING_STYLE[standing].label}
                </span>
              ))}
            </div>
          </div>

          {standingByStrand.length === 0 ? (
            <p className="border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No placement or assessment evidence in this view yet.</p>
          ) : (
            standingByStrand.map((group) => (
              <article key={group.strand} className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-bold text-slate-950">{group.label}</h4>
                    <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">{group.onTrackPct}% at or above</span>
                    <span className="text-xs text-slate-500">{group.total} students</span>
                  </div>
                  <div className="flex min-w-[180px] flex-1 items-center justify-end gap-3">
                    <div className="flex h-3 w-full max-w-[300px] overflow-hidden rounded-full bg-slate-100">
                      {STANDING_ORDER.map((standing) => group.total ? (
                        <div key={standing} title={`${STANDING_STYLE[standing].label}: ${group.counts[standing]}`} style={{ width: `${(group.counts[standing] / group.total) * 100}%`, background: STANDING_STYLE[standing].bar }} />
                      ) : null)}
                    </div>
                    <span className="text-sm font-bold tabular-nums text-rose-700">{group.counts.below} behind</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {group.grades.map((gradeRow) => (
                    <button
                      key={gradeRow.grade}
                      type="button"
                      onClick={() => { setRealmId(group.strand); if (gradeRow.grade !== "Not recorded") setYearLevel(gradeRow.grade); setTab("students"); }}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm hover:bg-emerald-50"
                    >
                      <span className="w-24 shrink-0 font-semibold text-slate-800">{gradeRow.grade}</span>
                      <span className="flex h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                        {STANDING_ORDER.map((standing) => gradeRow.total ? (
                          <span key={standing} style={{ width: `${(gradeRow.counts[standing] / gradeRow.total) * 100}%`, background: STANDING_STYLE[standing].bar }} />
                        ) : null)}
                      </span>
                      <span className="w-28 shrink-0 text-right text-xs font-semibold tabular-nums">
                        {gradeRow.counts.below > 0 ? <span className="text-rose-700">{gradeRow.counts.below} behind</span> : <span className="text-emerald-700">all on track</span>}
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-emerald-700" />
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
          <div>
            <h3 className="font-bold text-slate-950">Placement baseline by AC9 strand</h3>
            <p className="mt-1 text-sm text-slate-500">Where students are working now, and their average pre-test starting point per strand.</p>
          </div>

          {placementByStrand.length === 0 ? (
            <p className="border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No placement evidence in this view.</p>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {placementByStrand.map((group) => (
                <article key={group.key} className="border border-slate-200 bg-white p-5 shadow-sm">
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
                      <div className="grid grid-cols-[4.5rem_repeat(8,minmax(0,1fr))] gap-1 text-[10px] font-bold uppercase tracking-[0.04em] text-slate-400">
                        <span>Grade</span>
                        {PLACEMENT_LEVEL_COLUMNS.map((level) => <span key={level} className="text-center">{level === "Prep" ? "P" : level === "Not placed" ? "NP" : level.replace("Year ", "Y")}</span>)}
                      </div>
                      {group.gradeRows.map((gradeRow) => (
                        <button
                          key={gradeRow.grade}
                          type="button"
                          onClick={() => { if (group.key !== "other") setRealmId(group.key); if (gradeRow.grade !== "Not recorded") setYearLevel(gradeRow.grade); setTab("students"); }}
                          className="grid w-full grid-cols-[4.5rem_repeat(8,minmax(0,1fr))] gap-1 text-left text-xs"
                        >
                          <span className="flex h-7 items-center truncate font-bold text-slate-700">{gradeRow.grade}</span>
                          {PLACEMENT_LEVEL_COLUMNS.map((level, index) => {
                            const count = gradeRow.levels.find(([workingLevel]) => workingLevel === level)?.[1] ?? 0;
                            const isExpected = gradeRow.grade === level;
                            const workingIndex = levelIndex(level);
                            const gradeIndex = levelIndex(gradeRow.grade);
                            const isBelow = count > 0 && workingIndex >= 0 && gradeIndex >= 0 && workingIndex < gradeIndex;
                            return (
                              <span
                                key={level}
                                title={`${gradeRow.grade} working at ${level}: ${count}`}
                                className={`flex h-7 items-center justify-center rounded-sm border text-[11px] font-black tabular-nums ${isExpected ? "border-slate-900" : isBelow ? "border-rose-300" : "border-slate-100"} ${count ? "text-white" : "text-slate-300"}`}
                                style={{ background: count ? (isBelow ? STANDING_STYLE.below.bar : LEVEL_RAMP[index % LEVEL_RAMP.length]) : "#f8fafc" }}
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
                        className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:text-rose-800"
                      >
                        {group.standings.below} need lift in {group.label}
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
          <div>
            <h3 className="font-bold text-slate-950">Where to intervene</h3>
            <p className="mt-1 text-sm text-slate-500">Students working below their grade level, by strand and school year. Direct support here, then hand the list to the class teacher.</p>
          </div>

          {intervention.hotspots.length === 0 ? (
            <p className="border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">No students are working below their grade level in this view — or there isn&apos;t enough evidence yet.</p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {intervention.hotspots.slice(0, 6).map((cell) => (
                  <button
                    key={`${cell.strand}-${cell.year}`}
                    type="button"
                    onClick={() => { setRealmId(cell.strand); if (cell.year !== "Not recorded") setYearLevel(cell.year); setTab("students"); }}
                    className="flex items-center justify-between gap-3 border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-rose-400 hover:bg-rose-50"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-950">{cell.year} · {AC_STRANDS[cell.strand].label}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{Math.round((cell.needs / cell.total) * 100)}% of {cell.total} placed</p>
                    </div>
                    <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-rose-100 text-rose-800">
                      <span className="text-base font-black leading-none">{cell.needs}</span>
                    </span>
                  </button>
                ))}
              </div>

              <article className="overflow-hidden border border-slate-200 bg-white shadow-sm">
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
                            const bg = cell.needs === 0 ? "color-mix(in srgb, #0f9d6b 12%, transparent)" : `color-mix(in srgb, #c2534d ${12 + Math.round(intensity * 66)}%, transparent)`;
                            return (
                              <td key={year} className="px-2 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => { setRealmId(strand); if (year !== "Not recorded") setYearLevel(year); setTab("students"); }}
                                  title={`${cell.needs} of ${cell.total} below level`}
                                  className="inline-flex min-w-11 flex-col items-center rounded-md px-2 py-1.5 font-bold text-slate-900 transition hover:ring-2 hover:ring-rose-400"
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
                <p className="px-5 py-3 text-xs text-slate-500">Each cell: students below grade level / students placed. Tap a cell to see the students.</p>
              </article>
            </>
          )}
        </div>
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
                <button type="button" onClick={() => void downloadStudentReportPdf(selectedStudent)} className="inline-flex items-center gap-1.5 rounded-md border border-emerald-700 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-50">
                  <Download className="h-3.5 w-3.5" /> Download PDF
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
