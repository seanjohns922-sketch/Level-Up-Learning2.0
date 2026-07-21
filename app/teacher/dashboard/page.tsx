"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Check, X, Lock, LockOpen, KeyRound, Trophy, Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { getLatestPosttestProfile } from "@/data/assessments/analysis";
import CurriculumExplorer from "@/components/teacher/CurriculumExplorer";
import LiveClassPanel from "@/components/teacher/LiveClassPanel";
import StrandStudentsPanel from "@/components/teacher/StrandStudentsPanel";
import PlacementManager from "@/components/teacher/PlacementManager";
import { fetchRealmCompatProgressForClass } from "@/lib/realm-progress-compat";
import {
  BRAIN_BREAK_FREQUENCIES,
  BRAIN_BREAK_FREQUENCY_LABEL,
  isBrainBreakFrequency,
  type BrainBreakFrequency,
} from "@/lib/brain-break-settings";

/* ── types ─────────────────────────────────────────── */
type ClassRow = { id: string; class_code: string; name: string; year_level: string; brain_break_frequency?: string | null };
type StudentRow = { id: string; display_name: string; username?: string | null; class_id: string; user_id: string; pin?: string | null; qr_token?: string | null; school_year_level?: string | null; working_level?: string | null; year_level?: string | null; brain_break_frequency?: string | null };
type ProgressRow = {
  student_id: string;
  realm_id?: string;
  year: string;
  week: number | null;
  status: string;
  pretest_score: number | null;
  completed_lesson_ids: unknown;
  unlocked_legends: unknown;
  quiz_scores: unknown;
  lesson_attempts?: unknown;
  updated_at?: string | null;
};

type LiveStudentActivityRow = {
  student_id: string;
  class_id: string;
  current_level?: string | null;
  current_week?: number | null;
  current_lesson?: string | null;
  current_lesson_title?: string | null;
  current_activity_label?: string | null;
  progress_percent?: number | null;
  progress_label?: string | null;
  latest_event_type?: string | null;
  current_lesson_status?: string | null;
  last_active_at?: string | null;
  updated_at?: string | null;
};

type LiveActivityEventRow = {
  student_id: string;
  class_id: string;
  event_type: string;
  created_at: string;
  payload: Record<string, unknown> | null;
};

const YEAR_LEVELS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const WEEKS = Array.from({ length: 12 }, (_, i) => i + 1);

/* ── helpers ───────────────────────────────────────── */
type JsonObject = Record<string, unknown>;

function parseCompletedLessons(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") try { return JSON.parse(raw); } catch { return []; }
  return [];
}
function parseUnlockedLegends(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") try { return JSON.parse(raw); } catch { return []; }
  return [];
}
function parseQuizScores(raw: unknown): Record<string, JsonObject> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, JsonObject>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, JsonObject>)
        : {};
    } catch {
      return {};
    }
  }
  return {};
}

type LessonAttemptSummary = {
  completedAt?: string | null;
  questionsAnswered?: number | null;
  correctAnswers?: number | null;
  correctCount?: number | null;
  totalQuestions?: number | null;
};

type LessonAttemptRecord = {
  latestSummary?: LessonAttemptSummary | null;
  attempts?: LessonAttemptSummary[] | null;
};

function parseLessonAttempts(raw: unknown): Record<string, LessonAttemptRecord> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) return raw as Record<string, LessonAttemptRecord>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, LessonAttemptRecord>)
        : {};
    } catch {
      return {};
    }
  }
  return {};
}

function isRecentIso(value: unknown, cutoffMs: number) {
  if (typeof value !== "string" || !value) return false;
  const time = new Date(value).getTime();
  return Number.isFinite(time) && time >= cutoffMs;
}

function lessonSummaryStats(summary: LessonAttemptSummary | null | undefined) {
  if (!summary) return { correct: 0, total: 0 };
  const correctCandidate = summary.correctCount ?? summary.correctAnswers ?? null;
  const totalCandidate = summary.totalQuestions ?? summary.questionsAnswered ?? null;
  const correct = typeof correctCandidate === "number" && Number.isFinite(correctCandidate) ? correctCandidate : 0;
  const total = typeof totalCandidate === "number" && Number.isFinite(totalCandidate) ? totalCandidate : 0;
  return { correct, total };
}

function weekCompletedLessons(ids: string[], week: number) {
  const tag = `-w${week}-`;
  return ids.filter((id) => id.includes(tag)).length;
}

function weekQuizPassed(quiz: JsonObject | undefined) {
  if (!quiz) return false;
  if (quiz.passed === true) return true;
  const attempts = Array.isArray(quiz.attempts) ? quiz.attempts : [];
  return attempts.some((attempt) => {
    if (!attempt || typeof attempt !== "object") return false;
    const record = attempt as Record<string, unknown>;
    return record.passed === true;
  });
}

function weekCompletionCount(completedIds: string[], week: number): number {
  // lesson ids like "y1-w3-l1", "y1-w3-l2", "y1-w3-l3"
  const prefix = `-w${week}-`;
  return completedIds.filter((id) => id.includes(prefix)).length;
}

/* ── QR section for expanded student panel ─── */
function StudentQRSection({ student, classCode, className2, onRegenerate }: {
  student: StudentRow;
  classCode: string;
  className2: string;
  onRegenerate: (token: string) => void;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const token = student.qr_token ?? "";

  useEffect(() => {
    if (!token) return;
    const url = `${window.location.origin}/student?token=${token}`;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(url, { width: 180, margin: 1 }).then((dataUrl: string) => {
        setQrDataUrl(dataUrl);
      });
    });
  }, [token]);

  async function handleRegenerate() {
    setRegenerating(true);
    const { data, error } = await supabase.rpc("regenerate_student_qr", { student_uuid: student.id });
    if (data && !error) {
      onRegenerate(data);
    }
    setRegenerating(false);
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !qrDataUrl) return;
    const websiteUrl = window.location.origin;
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Login Card - ${student.display_name}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;display:flex;justify-content:center;padding:20px}
      .card{border:2px solid #e5e7eb;border-radius:16px;padding:32px;width:340px;text-align:center}
      .brand{font-size:14px;font-weight:800;color:#6b7280;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:20px}
      .name{font-size:22px;font-weight:900;color:#111827;margin-bottom:4px}
      .class{font-size:14px;color:#6b7280;margin-bottom:16px}
      .qr{margin:16px auto}.qr img{width:160px;height:160px}
      .scan-label{font-size:12px;color:#9ca3af;margin-bottom:8px}
      .website{font-size:12px;color:#0f172a;font-weight:700;word-break:break-all;margin-bottom:16px}
      .details{display:flex;justify-content:space-between;padding:12px 16px;background:#f9fafb;border-radius:12px;margin-top:12px}
      .detail-label{font-size:11px;color:#9ca3af;text-transform:uppercase;font-weight:700}
      .detail-value{font-size:16px;font-weight:800;color:#111827;font-family:monospace;letter-spacing:0.15em}
      @media print{body{padding:0}.card{border:2px solid #d1d5db}}</style></head>
      <body><div class="card">
      <div class="brand">Level Up Learning</div>
      <div class="name">${student.display_name}</div>
      <div class="class">${className2}</div>
      <div class="qr"><img src="${qrDataUrl}" alt="QR Code"/></div>
      <div class="scan-label">Scan to log in</div>
      <div class="website">${websiteUrl}</div>
      <div class="details"><div><div class="detail-label">Class Code</div><div class="detail-value">${classCode}</div></div>
      <div><div class="detail-label">PIN</div><div class="detail-value">${student.pin ?? "—"}</div></div></div>
      </div><script>window.onload=function(){window.print()}</script></body></html>`);
    printWindow.document.close();
  }

  return (
    <div className="grid gap-3">
      <div className="flex justify-between items-center">
        <span className="text-gray-500 text-sm">PIN</span>
        <span className="font-mono font-bold text-lg text-gray-900">{student.pin ?? "—"}</span>
      </div>
      {qrDataUrl ? (
        <div className="flex justify-center">
          <img src={qrDataUrl} alt="Student QR Code" className="w-32 h-32 rounded-lg" />
        </div>
      ) : token ? (
        <p className="text-xs text-gray-400 text-center">Generating QR…</p>
      ) : (
        <p className="text-xs text-gray-400 text-center">No QR token</p>
      )}
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition disabled:opacity-50"
        >
          {regenerating ? "Regenerating…" : "Regenerate QR"}
        </button>
        <button
          onClick={handlePrint}
          disabled={!qrDataUrl}
          className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition disabled:opacity-50 inline-flex items-center gap-1"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
          Print Card
        </button>
      </div>
    </div>
  );
}

/* ── component ─────────────────────────────────────── */
export default function TeacherDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [liveRows, setLiveRows] = useState<LiveStudentActivityRow[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveActivityEventRow[]>([]);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState("Year 1");
  const [activeTab, setActiveTab] = useState<"live" | "students" | "curriculum">("live");
  const [analyticsRealmId, setAnalyticsRealmId] = useState<"number" | "measurement">("number");
  const [showPlacements, setShowPlacements] = useState(false);
  const [pinToast, setPinToast] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Refs to prevent duplicate fetches and stale closures
  const mountedRef = useRef(false);
  const selectedClassRef = useRef<string | null>(null);
  const fetchingRef = useRef(false);
  const renderCount = useRef(0);
  renderCount.current++;
  if (process.env.NODE_ENV === "development") {
    console.log("[TeacherDashboard] render #", renderCount.current);
  }

  // Keep ref in sync
  selectedClassRef.current = selectedClassId;

  const { user: authUser, loading: authLoading } = useAuthGuard();

  useEffect(() => {
    if (authLoading || !authUser) return;
    if (mountedRef.current) return;
    mountedRef.current = true;
    loadClasses(authUser.id);
  }, [authLoading, authUser]);

  // Re-fetch students when tab gains focus — uses ref to avoid dep on selectedClassId
  useEffect(() => {
    function handleFocus() {
      const cid = selectedClassRef.current;
      if (cid) loadClassData(cid, true);
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []); // stable — no deps needed thanks to ref

  // Poll class progress so the student roster stays in sync with live lesson activity.
  useEffect(() => {
    const cid = selectedClassRef.current;
    if (!cid) return;

    const intervalId = window.setInterval(() => {
      const currentClassId = selectedClassRef.current;
      if (currentClassId) {
        void loadClassData(currentClassId, true);
      }
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [selectedClassId]);

  async function loadClasses(teacherId: string) {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    console.log("[TeacherDashboard] loadClasses()");

    try {
      // Load classes for current authenticated teacher id
      console.log("[TeacherDashboard] teacher_id from auth:", teacherId);

      const { data: cls, error: clsErr } = await supabase
        .from("classes")
        .select("*")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });

      console.log(
        "[TeacherDashboard] classes loaded:",
        (cls ?? []).map((c) => ({ id: c.id, code: c.class_code, name: c.name })),
        "error:",
        clsErr
      );

      setClasses(cls ?? []);
      if (cls && cls.length > 0) {
        const firstClassId = cls[0].id;
        setSelectedClassId(firstClassId);
        selectedClassRef.current = firstClassId;
        setActiveYear(cls[0].year_level ?? "Year 1");
        await loadClassData(firstClassId, false);
      } else {
        setSelectedClassId(null);
        selectedClassRef.current = null;
        setStudents([]);
        setProgress([]);
        setLiveRows([]);
        setLiveEvents([]);
      }
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  }

  async function loadClassData(classId: string, diffOnly: boolean) {
    const selected = classes.find((c) => c.id === classId);
    console.log(
      "[TeacherDashboard] loadClassData() class_id:",
      classId,
      "code:",
      selected?.class_code,
      diffOnly ? "(diff)" : ""
    );
    const { data: studs, error: studErr } = await supabase
      .from("students")
      .select("*")
      .eq("class_id", classId);
    const newStuds = studs ?? [];
    console.log("[TeacherDashboard] students fetched for selectedClassId:", classId, "count:", newStuds.length, "error:", studErr);

    let newProg: ProgressRow[] = [];
    let newLiveRows: LiveStudentActivityRow[] = [];
    let newLiveEvents: LiveActivityEventRow[] = [];
    if (newStuds.length > 0) {
      const ids = newStuds.map((s) => s.id);
      const [numberProgress, measurementProgress] = await Promise.all([
        fetchRealmCompatProgressForClass("number", classId, ids),
        fetchRealmCompatProgressForClass("measurement", classId, ids),
      ]);
      newProg = [...numberProgress, ...measurementProgress];

      const { data: live } = await supabase
        .from("live_student_activity")
        .select("*")
        .in("student_id", ids)
        .eq("class_id", classId);
      newLiveRows = (live ?? []) as LiveStudentActivityRow[];

      const { data: events } = await supabase
        .from("live_activity_events")
        .select("student_id,class_id,event_type,created_at,payload")
        .in("student_id", ids)
        .eq("class_id", classId)
        .in("event_type", [
          "lesson_started",
          "quiz_started",
          "question_loaded",
          "answer_correct",
          "answer_incorrect",
          "lesson_completed",
          "quiz_completed",
        ])
        .order("created_at", { ascending: true });
      newLiveEvents = (events ?? []) as LiveActivityEventRow[];
    }

    if (diffOnly) {
      // Only update state if data actually changed — prevents unnecessary re-renders
      const studJson = JSON.stringify(newStuds);
      const progJson = JSON.stringify(newProg);
      const liveJson = JSON.stringify(newLiveRows);
      const eventsJson = JSON.stringify(newLiveEvents);
      setStudents((prev) => JSON.stringify(prev) === studJson ? prev : newStuds);
      setProgress((prev) => JSON.stringify(prev) === progJson ? prev : newProg);
      setLiveRows((prev) => JSON.stringify(prev) === liveJson ? prev : newLiveRows);
      setLiveEvents((prev) => JSON.stringify(prev) === eventsJson ? prev : newLiveEvents);
    } else {
      setStudents(newStuds);
      setProgress(newProg);
      setLiveRows(newLiveRows);
      setLiveEvents(newLiveEvents);
    }
  }

  function selectClass(classId: string) {
    const cls = classes.find(c => c.id === classId);
    console.log("[TeacherDashboard] selectedClassId:", classId, "code:", cls?.class_code);
    setSelectedClassId(classId);
    setActiveYear(cls?.year_level ?? "Year 1");
    setExpandedStudent(null);
    loadClassData(classId, false);
  }

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const classStudents = students.filter((s) => s.class_id === selectedClassId);

  function getStudentProgress(studentId: string, year: string): ProgressRow | undefined {
    return progress.find((p) => p.student_id === studentId && p.year === year);
  }

  function copyCode() {
    if (!selectedClass) return;
    navigator.clipboard.writeText(selectedClass.class_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }

  async function changePassword() {
    setPasswordError(null);
    if (newPassword.length < 6) { setPasswordError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords don't match."); return; }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);
    if (error) { setPasswordError(error.message); return; }
    setPasswordSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => {
      setPasswordSuccess(false);
      setShowPasswordModal(false);
    }, 2000);
  }

  async function printAllLoginCards() {
    if (!selectedClass || classStudents.length === 0) return;
    setShowLoginMenu(false);

    const websiteUrl = window.location.origin;

    const QRCode = await import("qrcode");
    const classQrUrl = `${window.location.origin}/login?code=${selectedClass.class_code}`;
    const classQrSrc = await QRCode.toDataURL(classQrUrl, { width: 220, margin: 1 });
    const cards = classStudents.map((s) => ({ ...s, qrSrc: classQrSrc }));

    const cardHtml = cards
      .map(
        (s) => `
      <div class="card">
        <div class="brand">Level Up Learning</div>
        <div class="student-name">${s.display_name}</div>
        <div class="class-name">${selectedClass.name} · Code: <strong>${selectedClass.class_code}</strong></div>
        <img class="qr" src="${s.qrSrc}" alt="QR Code" />
        <div class="scan-hint">Scan to open login page</div>
        <div class="website">${websiteUrl}</div>
        <div class="creds">
          <div class="cred"><div class="cred-label">Username</div><div class="cred-value">${s.username ?? s.display_name}</div></div>
          <div class="divider"></div>
          <div class="cred"><div class="cred-label">Password</div><div class="cred-value">${s.pin ?? "—"}</div></div>
        </div>
      </div>`
      )
      .join("");

    const html = `<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>Student Login Cards — ${selectedClass.name}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background:#f5f5f5; padding:24px; }
        h1 { font-size:18px; font-weight:800; color:#0F172A; margin-bottom:4px; }
        .subtitle { font-size:12px; color:#64748B; margin-bottom:20px; }
        .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .card { background:#fff; border:2px solid #E2E8F0; border-radius:16px; padding:20px; text-align:center; page-break-inside:avoid; }
        .brand { font-size:10px; font-weight:800; color:#00C2A8; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:12px; }
        .student-name { font-size:18px; font-weight:900; color:#0F172A; margin-bottom:2px; }
        .class-name { font-size:11px; color:#64748B; margin-bottom:12px; }
        .qr { width:140px; height:140px; margin:0 auto 6px; display:block; }
        .qr-missing { width:140px; height:140px; margin:0 auto 6px; background:#f1f5f9; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:11px; color:#94A3B8; }
        .scan-hint { font-size:10px; color:#94A3B8; margin-bottom:6px; }
        .website { font-size:10px; font-weight:800; color:#0F172A; margin-bottom:12px; word-break:break-all; }
        .creds { display:flex; align-items:center; justify-content:center; gap:0; background:#F8FAFC; border-radius:10px; overflow:hidden; }
        .cred { flex:1; padding:10px 8px; }
        .divider { width:1px; background:#E2E8F0; height:36px; }
        .cred-label { font-size:9px; font-weight:700; color:#94A3B8; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:3px; }
        .cred-value { font-size:16px; font-weight:900; color:#0F172A; font-family:monospace; letter-spacing:0.12em; }
        @media print {
          body { background:#fff; padding:10px; }
          .grid { gap:10px; }
          .card { border-color:#D1D5DB; }
        }
      </style>
    </head><body>
      <h1>Student Login Details — ${selectedClass.name}</h1>
      <div class="subtitle">Class Code: ${selectedClass.class_code} · ${classStudents.length} student${classStudents.length !== 1 ? "s" : ""} · Level Up Learning</div>
      <div class="grid">${cardHtml}</div>
      <script>window.onload = function(){ window.print(); }</script>
    </body></html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
  }

  async function handleResetPin(student: StudentRow) {
    // One-click random passcode (avoids collisions within the class).
    const existing = new Set(
      students
        .filter((s) => s.class_id === student.class_id && s.id !== student.id)
        .map((s) => s.pin)
        .filter((value): value is string => Boolean(value))
    );
    let newPin = "";
    do {
      newPin = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    } while (existing.has(newPin));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from("students").update({ pin: newPin } as any).eq("id", student.id);
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, pin: newPin } : s))
    );
    setPinToast(`New passcode for ${student.display_name}: ${newPin}`);
    window.setTimeout(() => setPinToast(null), 2600);
  }

  // Brain-break frequency: class default + per-student override (null = inherit).
  async function setClassBrainBreak(value: BrainBreakFrequency) {
    if (!selectedClassId) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from("classes").update({ brain_break_frequency: value } as any).eq("id", selectedClassId);
    setClasses((prev) => prev.map((c) => (c.id === selectedClassId ? { ...c, brain_break_frequency: value } : c)));
  }
  async function setStudentBrainBreak(student: StudentRow, value: BrainBreakFrequency | null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await supabase.from("students").update({ brain_break_frequency: value } as any).eq("id", student.id);
    setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...s, brain_break_frequency: value } : s)));
  }

  /* ── segment bar for a student's level ─── */
  function renderWeekBar(prog: ProgressRow | undefined) {
    const completedIds = prog ? parseCompletedLessons(prog.completed_lesson_ids) : [];
    const currentWeek = prog?.week ?? 1;
    const legends = prog ? parseUnlockedLegends(prog.unlocked_legends) : [];
    const hasLegend = legends.length > 0;
    const totalLessons = WEEKS.reduce((s, w) => s + Math.min(3, weekCompletionCount(completedIds, w)), 0);
    const overallPct = Math.round((totalLessons / (12 * 3)) * 100);

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-[3px] flex-1">
          {WEEKS.map((w) => {
            const lessonsCompleted = weekCompletionCount(completedIds, w);
            const isComplete = lessonsCompleted >= 3;
            const isCurrent = w === currentWeek && !isComplete;

            let bg = "bg-slate-200/70"; // locked
            if (isComplete) bg = "bg-teal-500";
            else if (isCurrent) {
              if (lessonsCompleted === 0) bg = "bg-amber-300";
              else if (lessonsCompleted === 1) bg = "bg-amber-400";
              else bg = "bg-amber-500";
            }

            return (
              <div
                key={w}
                className={`h-2 flex-1 rounded-full ${bg} transition-colors relative`}
                title={`Week ${w}: ${isComplete ? "Complete" : isCurrent ? `${lessonsCompleted}/3 lessons` : "Locked"}`}
              >
                {isCurrent && (
                  <div className="absolute -inset-y-1 inset-x-0 rounded-full ring-2 ring-amber-500/60" />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2 min-w-[88px] justify-end">
          <span className="tabular-nums text-xs font-bold text-slate-700">{overallPct}%</span>
          {hasLegend && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-md whitespace-nowrap">
              <Star className="h-3 w-3" fill="currentColor" /> Legend
            </span>
          )}
        </div>
      </div>
    );
  }

  /* ── expanded student detail panel ─── */
  function renderExpandedPanel(student: StudentRow) {
    const prog = getStudentProgress(student.id, activeYear);
    const completedIds = prog ? parseCompletedLessons(prog.completed_lesson_ids) : [];
    const currentWeek = prog?.week ?? 1;
    const legends = prog ? parseUnlockedLegends(prog.unlocked_legends) : [];

    const lessonsThisWeek = weekCompletionCount(completedIds, currentWeek);
    const l1 = lessonsThisWeek >= 1;
    const l2 = lessonsThisWeek >= 2;
    const l3 = lessonsThisWeek >= 3;
    const quizUnlocked = l3;
    const pretestScore = prog?.pretest_score;
    const posttestProfile = getLatestPosttestProfile(prog?.quiz_scores);

    return (
      <div
        className="bg-gray-50 border-t border-gray-100 px-6 py-4 grid md:grid-cols-3 gap-6"
        style={{ animation: "fadeIn 0.2s ease" }}
      >
        {/* Current Status */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Current Status</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Level</span>
              <span className="font-bold text-gray-900">{activeYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Week</span>
              <span className="font-bold text-gray-900">{currentWeek} / 12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pre-test</span>
              <span className={`font-bold ${pretestScore != null ? "text-gray-900" : "text-gray-400"}`}>
                {pretestScore != null ? `${pretestScore}%` : "Not completed"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">PIN</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-gray-900">{student.pin ?? "—"}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleResetPin(student); }}
                  className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold hover:bg-amber-200 transition"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Brain breaks</span>
              <select
                value={isBrainBreakFrequency(student.brain_break_frequency) ? student.brain_break_frequency : ""}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                  const v = e.target.value;
                  void setStudentBrainBreak(student, isBrainBreakFrequency(v) ? v : null);
                }}
                className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-900"
              >
                <option value="">Class default</option>
                {BRAIN_BREAK_FREQUENCIES.map((f) => (
                  <option key={f} value={f}>{BRAIN_BREAK_FREQUENCY_LABEL[f]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lesson pills */}
          <div className="flex gap-2 mt-4">
            {[
              { label: "L1", done: l1 },
              { label: "L2", done: l2 },
              { label: "L3", done: l3 },
            ].map(({ label, done }) => (
              <span
                key={label}
                className={[
                  "px-3 py-1 rounded-full text-xs font-bold",
                  done ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-400",
                ].join(" ")}
              >
                <span className="inline-flex items-center gap-1">{label} {done ? <Check className="h-3 w-3" /> : <Lock className="h-3 w-3" />}</span>
              </span>
            ))}
            <span
              className={[
                "px-3 py-1 rounded-full text-xs font-bold",
                quizUnlocked ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-400",
              ].join(" ")}
            >
              <span className="inline-flex items-center gap-1">Quiz {quizUnlocked ? <LockOpen className="h-3 w-3" /> : <Lock className="h-3 w-3" />}</span>
            </span>
          </div>

          {legends.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 text-teal-600 font-bold"><Trophy className="h-4 w-4" /> Legend Unlocked</span>
            </div>
          )}

          {posttestProfile ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">Post-Test</div>
              <div className="text-sm font-bold text-gray-900">
                {posttestProfile.percentage}% ({posttestProfile.score}/{posttestProfile.total}) {posttestProfile.passed ? "• Pass" : "• Needs Review"}
              </div>
              {!posttestProfile.passed && (prog?.week ?? posttestProfile.assignedWeek) ? (
                <div className="mt-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                    Assigned: Week {prog?.week ?? posttestProfile.assignedWeek}
                  </span>
                </div>
              ) : null}
              {posttestProfile.weakAreas.slice(0, 3).map((item) => (
                <div key={item.skillId} className="mt-2 text-xs text-gray-600">
                  {item.skillLabel} ({item.incorrectCount}/{item.total} incorrect) → Week{item.linkedWeeks.length > 1 ? "s" : ""} {item.linkedWeeks.join(", ")}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Login Details - QR + PIN */}
        <div>
          <h4 className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3"><KeyRound className="h-3.5 w-3.5" /> Login Details</h4>
          <StudentQRSection student={student} classCode={selectedClass?.class_code ?? ""} className2={selectedClass?.name ?? ""} onRegenerate={(newToken) => {
            setStudents((prev) => prev.map((s) => s.id === student.id ? { ...s, qr_token: newToken } : s));
          }} />
        </div>

        {/* Quiz History */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quiz History</h4>
          {(() => {
            /* eslint-disable @typescript-eslint/no-explicit-any */
            const qs: Record<string, any> = (prog?.quiz_scores && typeof prog.quiz_scores === "object") ? prog.quiz_scores as any : {};
            const weekKeys = Object.keys(qs).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b);

            if (weekKeys.length === 0) {
              return <p className="text-gray-400 text-xs">No quiz attempts yet.</p>;
            }

            return (
              <div className="grid gap-1.5 text-sm max-h-48 overflow-y-auto">
                {(() => {
                  const allAttempts = weekKeys.flatMap((w) => {
                    const wd = qs[String(w)];
                    return wd?.attempts ?? [];
                  });
                  if (allAttempts.length === 0) return null;
                  const passedCount = allAttempts.filter((a: any) => a.passed).length;
                  const passRate = Math.round((passedCount / allAttempts.length) * 100);
                  return (
                    <div className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
                      Quiz pass rate: {passedCount}/{allAttempts.length} ({passRate}%)
                    </div>
                  );
                })()}
                {weekKeys.map((w) => {
                  const wd = qs[String(w)];
                  const attempts: any[] = wd?.attempts ?? [];

                  return (
                    <div key={w}>
                      <div className="text-xs font-bold text-gray-500 mt-1 mb-0.5">Week {w}</div>
                      {attempts.length > 0 ? (
                        attempts.map((a: any, i: number) => (
                          <div key={i} className="py-1.5 px-3 rounded-lg bg-white mb-0.5">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 text-xs">
                                Attempt {i + 1} — {a.score}/{a.total} ({a.percent}%)
                              </span>
                              <span className={["inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full", a.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"].join(" ")}>
                                {a.passed ? <><Check className="h-3 w-3" /> Pass</> : <><X className="h-3 w-3" /> Fail</>}
                              </span>
                            </div>
                            <div className="mt-1 text-[11px] text-gray-500">
                              Pass rate: {a.passRate ?? a.percent ?? 0}%
                            </div>
                            {Array.isArray(a.lessonBreakdown) && a.lessonBreakdown.length > 0 ? (
                              <div className="mt-1 grid gap-1">
                                {a.lessonBreakdown.map((item: any) => (
                                  <div key={item.lessonNumber} className="text-[11px] text-gray-500">
                                    Lesson {item.lessonNumber}: {item.correct}/{item.total} ({item.percent}%)
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white">
                          <span className="text-gray-600">Score: {wd?.score}/{wd?.total} ({wd?.percent}%)</span>
                          <span className={["inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full", wd?.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"].join(" ")}>
                            {wd?.passed ? <><Check className="h-3 w-3" /> Pass</> : <><X className="h-3 w-3" /> Fail</>}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
            /* eslint-enable @typescript-eslint/no-explicit-any */
          })()}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
          <p className="text-sm font-semibold">Loading dashboard…</p>
        </div>
      </main>
    );
  }

  // Whole-class KPI strip — never filter by active year/strand/tab.
  const classStudentIds = new Set(classStudents.map((student) => student.id));
  const classProgressRows = progress.filter((row) => {
    const realm = row.realm_id?.trim().toLowerCase();
    const normalizedRealm = realm === "measurement" || realm === "measurelands" ? "measurement" : "number";
    return classStudentIds.has(row.student_id) && normalizedRealm === analyticsRealmId;
  });
  const sevenDaysAgoMs = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const activeStudentsThisWeek = new Set<string>();

  classProgressRows.forEach((row) => {
    const lessonAttempts = parseLessonAttempts(row.lesson_attempts);
    const quizScores = parseQuizScores(row.quiz_scores);

    Object.values(lessonAttempts).forEach((attempt) => {
      const attempts = Array.isArray(attempt?.attempts) ? attempt.attempts : [];
      attempts.forEach((entry) => {
        if (isRecentIso(entry?.completedAt, sevenDaysAgoMs)) {
          activeStudentsThisWeek.add(row.student_id);
        }
      });
      if (isRecentIso(attempt?.latestSummary?.completedAt, sevenDaysAgoMs)) {
        activeStudentsThisWeek.add(row.student_id);
      }
    });

    Object.values(quizScores).forEach((quiz) => {
      if (isRecentIso(quiz?.completedAt, sevenDaysAgoMs)) {
        activeStudentsThisWeek.add(row.student_id);
      }
      const attempts = Array.isArray(quiz?.attempts) ? quiz.attempts : [];
      attempts.forEach((attempt) => {
        if (attempt && typeof attempt === "object" && isRecentIso((attempt as Record<string, unknown>).completedAt, sevenDaysAgoMs)) {
          activeStudentsThisWeek.add(row.student_id);
        }
      });
    });

    if (isRecentIso(row.updated_at, sevenDaysAgoMs)) {
      activeStudentsThisWeek.add(row.student_id);
    }
  });

  liveEvents.forEach((event) => {
    const strand = typeof event.payload?.strand === "string" ? event.payload.strand.trim().toLowerCase() : "number";
    const eventRealm = strand === "measurement" || strand === "measurelands" ? "measurement" : "number";
    if (eventRealm === analyticsRealmId && classStudentIds.has(event.student_id) && isRecentIso(event.created_at, sevenDaysAgoMs)) {
      activeStudentsThisWeek.add(event.student_id);
    }
  });

  let lessonCorrectSum = 0;
  let lessonQuestionSum = 0;
  let lessonsCompleted = 0;
  classProgressRows.forEach((row) => {
    const lessonAttempts = parseLessonAttempts(row.lesson_attempts);
    Object.values(lessonAttempts).forEach((attempt) => {
      const attempts = Array.isArray(attempt?.attempts) && attempt.attempts.length > 0
        ? attempt.attempts
        : attempt?.latestSummary
          ? [attempt.latestSummary]
          : [];
      attempts.forEach((summary) => {
        if (!summary?.completedAt) return;
        const stats = lessonSummaryStats(summary);
        if (stats.total <= 0) return;
        lessonsCompleted += 1;
        lessonCorrectSum += stats.correct;
        lessonQuestionSum += stats.total;
      });
    });
  });

  const averageLessonScore = lessonQuestionSum > 0
    ? `${Math.round((lessonCorrectSum / lessonQuestionSum) * 100)}%`
    : "—";

  const weeksPassed = classProgressRows.reduce((sum, row) => {
    const completedIds = parseCompletedLessons(row.completed_lesson_ids);
    const quizScores = parseQuizScores(row.quiz_scores);
    const passedWeeks = WEEKS.filter((week) => {
      return weekCompletedLessons(completedIds, week) >= 3 && weekQuizPassed(quizScores[String(week)]);
    }).length;
    return sum + passedWeeks;
  }, 0);
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#E2E8F0] via-[#DEE5EC] to-[#D6DEE6]">
      {/* Header */}
      <header className="bg-white border-b border-[#E6E8EC] px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#0A2F2A] ring-1 ring-[#00C2A8]/40 shadow-[0_0_12px_-2px_rgba(0,229,195,0.55)] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 12l9-9 9 9M5 10v10h14V10" />
                </svg>
              </div>
              <h1 className="text-xl font-black text-[#0F172A] tracking-tight">Teacher Dashboard</h1>
            </div>
            {selectedClass && (
              <div className="flex items-center gap-2 mt-1.5 ml-9">
                <span className="text-sm font-semibold text-[#475569]">{selectedClass.name}</span>
                <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono font-extrabold text-[#0A2F2A] bg-white border border-[#00C2A8]/40 px-2 py-0.5 rounded-md hover:border-[#00C2A8] hover:shadow-[0_0_0_3px_rgba(0,194,168,0.12)] transition"
                >
                  {copiedCode ? "Copied!" : selectedClass.class_code}
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                </button>
                <span className="text-[11px] font-semibold text-[#94A3B8]">· {classStudents.length} student{classStudents.length === 1 ? "" : "s"}</span>
                <span className="h-1 w-1 rounded-full bg-[#CBD5E1]" />
                <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#475569]">
                  <span className="inline-flex items-center gap-1.5" title="Mid-lesson mini-game frequency. Override per student in their card."><Brain className="h-3.5 w-3.5" /> Brain breaks</span>
                  <select
                    value={isBrainBreakFrequency(selectedClass.brain_break_frequency) ? selectedClass.brain_break_frequency : "normal"}
                    onChange={(e) => { if (isBrainBreakFrequency(e.target.value)) void setClassBrainBreak(e.target.value); }}
                    className="rounded-md border border-[#E6E8EC] bg-white px-2 py-0.5 text-[11px] font-bold text-[#0F172A] hover:border-[#CBD5E1] transition"
                  >
                    {BRAIN_BREAK_FREQUENCIES.map((f) => (
                      <option key={f} value={f}>{BRAIN_BREAK_FREQUENCY_LABEL[f]}</option>
                    ))}
                  </select>
                </label>
                {isDev && (
                  <span className="ml-2 text-[10px] font-mono text-[#94A3B8]">id:{selectedClass.id.slice(0, 8)}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {classes.length > 1 && (
              <select
                value={selectedClassId ?? ""}
                onChange={(e) => selectClass(e.target.value)}
                className="text-sm font-semibold px-3 py-2 rounded-lg border border-[#E6E8EC] bg-white text-[#0F172A] hover:border-[#CBD5E1] transition"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}

            {/* Student Login Details */}
            {selectedClass && classStudents.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowLoginMenu((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E6E8EC] bg-white text-[#0F172A] font-bold text-sm hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition active:scale-[0.98]"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25">
                    <path d="M16 2H8a2 2 0 00-2 2v16a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z" />
                    <path d="M12 18h.01M8 6h8M8 10h8M8 14h4" />
                  </svg>
                  Student Login Details
                  <svg viewBox="0 0 24 24" className="h-3 w-3 text-[#94A3B8]" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {showLoginMenu && (
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl border border-[#E6E8EC] shadow-lg z-30 py-1">
                    <button
                      onClick={printAllLoginCards}
                      className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#64748B]" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                        <rect x="6" y="14" width="12" height="8" />
                      </svg>
                      PDF Version
                    </button>
                  </div>
                )}
                {showLoginMenu && (
                  <div className="fixed inset-0 z-20" onClick={() => setShowLoginMenu(false)} />
                )}
              </div>
            )}

            <button
              onClick={() => router.push("/teacher/classes")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E6E8EC] bg-white text-[#0F172A] font-bold text-sm hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M19 8v6M16 11h6" /></svg>
              Add / Edit Students
            </button>
            {selectedClass && classStudents.length > 0 ? (
              <button
                onClick={() => setShowPlacements(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#0EA5A4]/40 bg-[#0EA5A4]/10 text-[#0F766E] font-bold text-sm hover:bg-[#0EA5A4]/15 transition active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                Manage Placements
              </button>
            ) : null}
            <button
              onClick={() => router.push("/teacher/classes/new")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F172A] text-white font-bold text-sm hover:bg-[#1E293B] transition active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
              New Class
            </button>

            {/* Settings gear */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu((v) => !v)}
                className="h-9 w-9 rounded-lg border border-[#E6E8EC] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] hover:border-[#CBD5E1] transition flex items-center justify-center"
                type="button"
                aria-label="Settings"
                title="Settings"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </button>
              {showSettingsMenu && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-[#E6E8EC] shadow-lg z-30 py-1">
                  <div className="px-4 py-2 border-b border-[#F1F5F9]">
                    <p className="text-xs font-bold text-[#0F172A]">Account Settings</p>
                    <p className="text-[11px] text-[#94A3B8] truncate">{authUser?.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowSettingsMenu(false); setShowPasswordModal(true); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#64748B]" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    Change Password
                  </button>
                  <button
                    onClick={() => { setShowSettingsMenu(false); router.push("/teacher/classes"); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] flex items-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#64748B]" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m3-5.13a4 4 0 100-8 4 4 0 000 8zm6-2a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                    Manage Classes
                  </button>
                </div>
              )}
              {showSettingsMenu && (
                <div className="fixed inset-0 z-20" onClick={() => setShowSettingsMenu(false)} />
              )}
            </div>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="h-9 w-9 rounded-lg border border-[#E6E8EC] text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEF2F2] hover:border-[#FECACA] transition flex items-center justify-center"
              type="button"
              aria-label="Log out"
              title="Log out"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {classes.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-[#E6E8EC]">
            <div className="mx-auto h-12 w-12 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m3-5.13a4 4 0 100-8 4 4 0 000 8zm6-2a3 3 0 100-6 3 3 0 000 6z" /></svg>
            </div>
            <p className="text-[#0F172A] font-bold mb-1">No classes yet</p>
            <p className="text-sm text-[#64748B] mb-5">Create your first class to start tracking students.</p>
            <button
              onClick={() => router.push("/teacher/classes/new")}
              className="px-5 py-2.5 rounded-lg bg-[#0F172A] text-white font-bold text-sm hover:bg-[#1E293B] transition"
            >
              Create Your First Class
            </button>
          </div>
        ) : (
          <>
            {/* KPI strip — primary stat dominates, secondary stats supporting */}
            <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-3">
              <KpiTile primary label="Students" value={classStudents.length} subtitle="enrolled in this class" accent="#0EA5A4" icon={(<path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m3-5.13a4 4 0 100-8 4 4 0 000 8zm6-2a3 3 0 100-6 3 3 0 000 6z" />)} />
              <KpiTile label="Active This Week" value={activeStudentsThisWeek.size} subtitle={`${activeStudentsThisWeek.size} student${activeStudentsThisWeek.size === 1 ? "" : "s"} active`} accent="#0EA5A4" icon={(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)} />
              <KpiTile label="Average Accuracy" value={averageLessonScore} subtitle={averageLessonScore === "—" ? "no completed lessons" : "average lesson accuracy"} accent="#0EA5A4" icon={(<><path d="M3 3v18h18" /><path d="M7 14l3-3 3 3 5-5" /></>)} />
              <KpiTile label="Lessons Completed" value={lessonsCompleted} subtitle={`${lessonsCompleted} lesson${lessonsCompleted === 1 ? "" : "s"} completed`} accent="#F59E0B" icon={(<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></>)} />
              <KpiTile label="Weeks Passed" value={weeksPassed} subtitle={`${weeksPassed} week${weeksPassed === 1 ? "" : "s"} completed`} accent="#6366F1" icon={(<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></>)} />
            </div>

            {/* Year level + view tabs */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {activeTab === "curriculum" ? (
                <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#E6E8EC] w-fit overflow-x-auto">
                  {YEAR_LEVELS.map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setActiveYear(yr)}
                      className={[
                        "px-3.5 py-1.5 rounded-lg font-bold text-sm whitespace-nowrap transition",
                        activeYear === yr
                          ? "bg-[#0F172A] text-white shadow-sm"
                          : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]",
                      ].join(" ")}
                    >
                      {yr}
                    </button>
                  ))}
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#E6E8EC] w-fit shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                {([
                  { id: "live",       label: "Live Class" },
                  { id: "students",   label: "Students" },
                  { id: "curriculum", label: "Curriculum" },
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={[
                      "px-3.5 py-1.5 rounded-lg font-bold text-sm whitespace-nowrap transition",
                      activeTab === t.id
                        ? "bg-[#0A2F2A] text-[#00E5C3] ring-1 ring-[#00C2A8]/50 shadow-[0_0_14px_-2px_rgba(0,229,195,0.45)]"
                        : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]",
                    ].join(" ")}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* eslint-disable @typescript-eslint/no-explicit-any */}
            {activeTab === "live" ? (
              <LiveClassPanel
                selectedClass={selectedClass ?? null}
                students={classStudents as any}
              />
            ) : activeTab === "curriculum" ? (
              <CurriculumExplorer
                yearLabel={activeYear}
                studentCount={classStudents.length}
                progress={progress as any}
              />
            ) : (
              <StrandStudentsPanel
                yearLabel={activeYear}
                students={classStudents as any}
                progress={progress as any}
                liveRows={liveRows as any}
                liveEvents={liveEvents as any}
                onRealmChange={setAnalyticsRealmId}
              />
            )}
            {/* eslint-enable @typescript-eslint/no-explicit-any */}
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Change Password Modal ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowPasswordModal(false); setPasswordError(null); setNewPassword(""); setConfirmPassword(""); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <h2 className="text-lg font-black text-[#0F172A] mb-1">Change Password</h2>
            <p className="text-sm text-[#64748B] mb-5">Enter a new password for your account.</p>

            <div className="grid gap-3">
              <label className="grid gap-1">
                <span className="text-xs font-bold text-[#64748B]">New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E6E8EC] text-sm font-medium text-[#0F172A] outline-none focus:border-[#0F172A] transition"
                  autoFocus
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-[#64748B]">Confirm Password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E6E8EC] text-sm font-medium text-[#0F172A] outline-none focus:border-[#0F172A] transition"
                  onKeyDown={(e) => e.key === "Enter" && changePassword()}
                />
              </label>

              {passwordError && (
                <p className="text-sm font-bold text-red-600 text-center">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm font-bold text-emerald-600 text-center">Password updated!</p>
              )}

              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={changePassword}
                  disabled={passwordSaving || passwordSuccess}
                  className="flex-1 py-2.5 rounded-xl bg-[#0F172A] text-white font-bold text-sm hover:bg-[#1E293B] transition disabled:opacity-50"
                >
                  {passwordSaving ? "Saving…" : passwordSuccess ? "Saved!" : "Save Password"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowPasswordModal(false); setPasswordError(null); setNewPassword(""); setConfirmPassword(""); }}
                  className="px-4 py-2.5 rounded-xl border border-[#E6E8EC] text-sm font-bold text-[#64748B] hover:bg-[#F8FAFC] transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPlacements && (
        <PlacementManager
          selectedClass={selectedClass ? { id: selectedClass.id, name: selectedClass.name } : null}
          students={classStudents}
          onClose={() => setShowPlacements(false)}
        />
      )}

      {pinToast && (
        <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_32px_-8px_rgba(15,23,42,0.5)]">
          {pinToast}
        </div>
      )}
    </main>
  );
}

function KpiTile({
  label, value, subtitle, accent, icon, primary,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  accent: string;
  icon: React.ReactNode;
  primary?: boolean;
}) {
  if (primary) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl px-5 py-4 border border-white/5 bg-[linear-gradient(135deg,#0A2F2A_0%,#0F3A34_60%,#0A2F2A_100%)] shadow-[0_10px_30px_-14px_rgba(0,0,0,0.55)]"
      >
        <div className="absolute inset-y-0 left-0 w-[3px] bg-[#00E5C3] shadow-[0_0_18px_2px_rgba(0,229,195,0.55)]" />
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[#00C2A8]/10 blur-2xl pointer-events-none" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-[#00E5C3] uppercase tracking-[0.18em]">{label}</div>
            <div className="mt-1 text-[44px] leading-none font-black text-white tabular-nums tracking-tight">
              {value}
            </div>
            <div className="mt-1.5 text-[11px] font-semibold text-slate-300/80 tracking-wide">
              {subtitle ?? "enrolled in this class"}
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-[#062521] border border-[#00C2A8]/30 shadow-[inset_0_0_8px_rgba(0,229,195,0.18)] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#00E5C3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {icon}
            </svg>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl border border-[#E6E8EC] px-4 py-3.5 hover:border-[#CBD5E1] transition shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between mb-2">
        <div className="h-8 w-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {icon}
          </svg>
        </div>
      </div>
      <div className="text-xl font-black text-[#0F172A] leading-none tabular-nums opacity-80">{value}</div>
      <div className="flex items-center gap-2 mt-1.5">
        <div className="h-0.5 w-4 rounded-full" style={{ backgroundColor: accent }} />
        <div className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-[0.14em]">{label}</div>
      </div>
      <div className="mt-1 text-[11px] font-semibold text-[#94A3B8]">
        {subtitle ?? ""}
      </div>
    </div>
  );
}
