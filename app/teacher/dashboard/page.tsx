"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, X, KeyRound, Brain, Building2, Download, Printer, Lock, LockOpen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/useAuthGuard";
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
import { formatAccuracy } from "@/lib/learning-score";
import {
  getRealmDefinition,
  LIVE_REALM_IDS,
  tryCanonicalRealmId,
  type LiveRealmId,
} from "@/lib/realms/realm-registry";
import { getSchoolLogo } from "@/lib/school-logos";
import { getRealmWeekNumbers, selectCanonicalTeacherProgressRow } from "@/lib/teacher/teacher-student-snapshot";

/* ── types ─────────────────────────────────────────── */
type ClassRow = {
  id: string;
  class_code: string;
  name: string;
  year_level: string;
  school_id?: string | null;
  brain_break_frequency?: string | null;
};
type StudentRow = { id: string; display_name: string; first_name?: string | null; last_name?: string | null; username?: string | null; class_id: string; user_id: string; pin?: string | null; qr_token?: string | null; school_year_level?: string | null; working_level?: string | null; year_level?: string | null; brain_break_frequency?: string | null; archived_at?: string | null };
type ProgressRow = {
  student_id: string;
  realm_id?: string;
  year: string;
  is_current?: boolean | null;
  week: number | null;
  status: string;
  pretest_score: number | null;
  completed_lesson_ids: unknown;
  unlocked_legends: unknown;
  quiz_scores: unknown;
  lesson_attempts?: unknown;
  teacher_advanced_weeks?: number[];
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

function TeacherDashboardSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#E2E8F0] via-[#DEE5EC] to-[#D6DEE6]" aria-busy="true" aria-label="Loading class dashboard">
      <header className="border-b border-[#E6E8EC] bg-white px-6 py-3">
        <div className="mx-auto flex max-w-[1800px] items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-[#0A2F2A]/15" />
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-20 animate-pulse rounded bg-slate-100" />
          <div className="ml-auto h-9 w-40 animate-pulse rounded-lg bg-slate-100" />
        </div>
      </header>
      <div className="mx-auto max-w-[1800px] px-6 py-8">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-lg border border-slate-200 bg-white/90" />
          ))}
        </div>
        <div className="mt-8 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
          <div className="h-72 animate-pulse rounded-lg border border-slate-200 bg-white/90" />
          <div className="h-72 animate-pulse rounded-lg border border-slate-200 bg-white/90" />
        </div>
      </div>
      <span className="sr-only">Loading dashboard</span>
    </main>
  );
}

const YEAR_LEVELS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

/* ── helpers ───────────────────────────────────────── */
type JsonObject = Record<string, unknown>;

function parseCompletedLessons(raw: unknown): string[] {
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
  const [schoolPreviewClassId, setSchoolPreviewClassId] = useState<
    string | null
  >(null);
  const [schoolPreviewSchoolId, setSchoolPreviewSchoolId] = useState<
    string | null
  >(null);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const isSchoolPreview = Boolean(schoolPreviewClassId);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [progressLoadError, setProgressLoadError] = useState<string | null>(null);
  const [liveRows, setLiveRows] = useState<LiveStudentActivityRow[]>([]);
  const [liveEvents, setLiveEvents] = useState<LiveActivityEventRow[]>([]);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState("Year 1");
  const [activeTab, setActiveTab] = useState<"live" | "students" | "curriculum">("live");
  const [analyticsRealmId, setAnalyticsRealmId] = useState<LiveRealmId>(LIVE_REALM_IDS[0] ?? "number");
  const [showPlacements, setShowPlacements] = useState(false);
  const [pinToast, setPinToast] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showLoginDetailsActions, setShowLoginDetailsActions] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [openingSchoolPreview, setOpeningSchoolPreview] = useState(false);
  const [schoolPreviewError, setSchoolPreviewError] = useState<string | null>(
    null,
  );

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
    const previewParams = new URLSearchParams(window.location.search);
    const requestedClassId =
      previewParams.get("schoolPreview") === "1"
        ? previewParams.get("classId")
        : null;
    const requestedSchoolId = requestedClassId
      ? previewParams.get("schoolId")
      : null;
    setSchoolPreviewClassId(requestedClassId);
    setSchoolPreviewSchoolId(requestedSchoolId);
    loadClasses(authUser.id, requestedClassId, requestedSchoolId);
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

  async function loadClasses(
    teacherId: string,
    requestedClassId: string | null = null,
    requestedSchoolId: string | null = null,
  ) {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    console.log("[TeacherDashboard] loadClasses()");

    try {
      if (requestedClassId) {
        if (!requestedSchoolId) {
          window.location.replace("/teacher/dashboard");
          return;
        }
        const accessResponse = await fetch(
          `/api/school/${requestedSchoolId}/class-access?classId=${encodeURIComponent(requestedClassId)}`,
          { cache: "no-store" },
        );
        if (!accessResponse.ok) {
          window.location.replace("/teacher/dashboard");
          return;
        }
      }

      // Load classes for current authenticated teacher id
      console.log("[TeacherDashboard] teacher_id from auth:", teacherId);

      let classQuery = supabase.from("classes").select("*");
      classQuery = requestedClassId
        ? classQuery.eq("id", requestedClassId)
        : classQuery.eq("teacher_id", teacherId);
      const { data: cls, error: clsErr } = await classQuery.order(
        "created_at",
        { ascending: false },
      );

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
        // The class shell can render immediately. Historical attempts and live
        // telemetry hydrate in the background instead of delaying first paint.
        setLoading(false);
        void loadClassData(firstClassId, false);
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
    try {
      const { data: studs, error: studErr } = await supabase
        .from("students")
        .select("*")
        .eq("class_id", classId)
        .is("archived_at", null);
      if (studErr) throw studErr;
      const newStuds = studs ?? [];
      console.log("[TeacherDashboard] students fetched for selectedClassId:", classId, "count:", newStuds.length);

      // The roster drives the visible class shell and is useful without the
      // heavier canonical-progress and activity history payloads.
      if (!diffOnly) setStudents(newStuds);

      let newProg: ProgressRow[] = [];
      let newLiveRows: LiveStudentActivityRow[] = [];
      let newLiveEvents: LiveActivityEventRow[] = [];
      if (newStuds.length > 0) {
        const ids = newStuds.map((s) => s.id);
        const [
          realmProgress,
          { data: live, error: liveError },
          { data: events, error: eventsError },
        ] = await Promise.all([
          Promise.all(
            LIVE_REALM_IDS.map((realmId) =>
              fetchRealmCompatProgressForClass(realmId, classId, ids),
            ),
          ),
          supabase.from("live_student_activity").select("*").in("student_id", ids).eq("class_id", classId),
          supabase
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
            .order("created_at", { ascending: true }),
        ]);
        newProg = realmProgress.flat();
        if (liveError) {
          console.warn("[TeacherDashboard] live student activity unavailable", liveError);
        } else {
          newLiveRows = (live ?? []) as LiveStudentActivityRow[];
        }
        if (eventsError) {
          console.warn("[TeacherDashboard] live activity events unavailable", eventsError);
        } else {
          newLiveEvents = (events ?? []) as LiveActivityEventRow[];
        }
      }

      if (diffOnly) {
        const studJson = JSON.stringify(newStuds);
        const progJson = JSON.stringify(newProg);
        const liveJson = JSON.stringify(newLiveRows);
        const eventsJson = JSON.stringify(newLiveEvents);
        setStudents((prev) => JSON.stringify(prev) === studJson ? prev : newStuds);
        setProgress((prev) => JSON.stringify(prev) === progJson ? prev : newProg);
        setLiveRows((prev) => JSON.stringify(prev) === liveJson ? prev : newLiveRows);
        setLiveEvents((prev) => JSON.stringify(prev) === eventsJson ? prev : newLiveEvents);
      } else {
        setProgress(newProg);
        setLiveRows(newLiveRows);
        setLiveEvents(newLiveEvents);
      }
      setProgressLoadError(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : error && typeof error === "object" && "message" in error &&
              typeof error.message === "string"
            ? error.message
            : "Canonical student progress could not be loaded.";
      console.error("[TeacherDashboard] canonical progress load failed", error);
      setProgressLoadError(message);
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
  const schoolHomeId =
    schoolPreviewSchoolId ?? selectedClass?.school_id ?? null;
  const schoolLogo = getSchoolLogo({ name: schoolName });
  const classStudents = students.filter(
    (student) => student.class_id === selectedClassId && !student.archived_at,
  );

  useEffect(() => {
    let cancelled = false;

    if (!schoolHomeId) {
      setSchoolName(null);
      return;
    }

    void supabase
      .from("schools")
      .select("name")
      .eq("id", schoolHomeId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setSchoolName(typeof data?.name === "string" ? data.name : null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [schoolHomeId]);

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

    // Open synchronously from the click event so browsers do not block the
    // window after the asynchronous QR-code generation has completed.
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setPinToast("Allow pop-ups to open student login details.");
      window.setTimeout(() => setPinToast(null), 3200);
      return;
    }

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Preparing student login details</title></head><body style="font-family:system-ui,sans-serif;padding:32px;color:#0f172a"><strong>Preparing student login details...</strong></body></html>`);
    printWindow.document.close();

    try {
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

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (error) {
      console.error("Unable to prepare student login details", error);
      printWindow.close();
      setPinToast("Student login details could not be prepared. Please try again.");
      window.setTimeout(() => setPinToast(null), 3200);
    }
  }

  async function downloadLoginCardsPdf() {
    if (!selectedClass || classStudents.length === 0) return;

    const classRow = selectedClass;
    const studentsForCards = [...classStudents];

    try {
      const [{ jsPDF }, QRCode] = await Promise.all([
        import("jspdf"),
        import("qrcode"),
      ]);
      const classQrUrl = `${window.location.origin}/login?code=${classRow.class_code}`;
      const classQrSrc = await QRCode.toDataURL(classQrUrl, { width: 220, margin: 1 });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 10;
      const columnGap = 6;
      const rowGap = 6;
      const cardWidth = (210 - margin * 2 - columnGap) / 2;
      const cardHeight = 86;

      studentsForCards.forEach((student, index) => {
        const pageIndex = Math.floor(index / 6);
        const position = index % 6;
        if (pageIndex > 0 && position === 0) pdf.addPage();

        const column = position % 2;
        const row = Math.floor(position / 2);
        const x = margin + column * (cardWidth + columnGap);
        const y = margin + row * (cardHeight + rowGap);
        const centreX = x + cardWidth / 2;

        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.6);
        pdf.roundedRect(x, y, cardWidth, cardHeight, 4, 4);

        pdf.setTextColor(0, 151, 136);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        pdf.text("LEVEL UP LEARNING", centreX, y + 8, { align: "center" });

        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(14);
        const studentName = pdf.splitTextToSize(student.display_name, cardWidth - 12)[0];
        pdf.text(studentName, centreX, y + 16, { align: "center" });

        pdf.setTextColor(100, 116, 139);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(
          `${classRow.name} | Class code: ${classRow.class_code}`,
          centreX,
          y + 22,
          { align: "center" },
        );

        pdf.addImage(classQrSrc, "PNG", centreX - 17, y + 26, 34, 34);
        pdf.setFontSize(7);
        pdf.text("Scan to open the login page", centreX, y + 64, { align: "center" });

        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(x + 6, y + 68, cardWidth - 12, 13, 2, 2, "F");
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(6);
        pdf.text("USERNAME", x + 10, y + 73);
        pdf.text("PASSWORD", centreX + 3, y + 73);
        pdf.setTextColor(15, 23, 42);
        pdf.setFont("courier", "bold");
        pdf.setFontSize(10);
        pdf.text(student.username ?? student.display_name, x + 10, y + 78);
        pdf.text(student.pin ?? "-", centreX + 3, y + 78);
      });

      const fileName = `${classRow.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "class"}-student-login-details.pdf`;
      pdf.save(fileName);
      setPinToast("Student login details PDF downloaded.");
      window.setTimeout(() => setPinToast(null), 2600);
    } catch (error) {
      console.error("Unable to create student login details PDF", error);
      setPinToast("Student login details PDF could not be created. Please try again.");
      window.setTimeout(() => setPinToast(null), 3200);
    }
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
    const realmDefinition = getRealmDefinition(analyticsRealmId);
    const realmWeeks = getRealmWeekNumbers(analyticsRealmId);
    const lessonsPerWeek = realmDefinition.lessonsPerWeek;
    if (!prog || lessonsPerWeek == null || realmWeeks.length === 0) {
      return <span className="text-xs font-semibold text-slate-400">Progress unavailable</span>;
    }
    const completedIds = prog ? parseCompletedLessons(prog.completed_lesson_ids) : [];
    const currentWeek = prog.week;
    const totalLessons = realmWeeks.reduce(
      (sum, week) => sum + Math.min(lessonsPerWeek, weekCompletionCount(completedIds, week)),
      0,
    );
    const overallPct = Math.round((totalLessons / (realmWeeks.length * lessonsPerWeek)) * 100);

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-[3px] flex-1">
          {realmWeeks.map((w) => {
            const lessonsCompleted = weekCompletionCount(completedIds, w);
            const isComplete = lessonsCompleted >= lessonsPerWeek;
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
                title={`Week ${w}: ${isComplete ? "Complete" : isCurrent ? `${lessonsCompleted}/${lessonsPerWeek} lessons` : "Locked"}`}
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
        </div>
      </div>
    );
  }

  /* ── expanded student detail panel ─── */
  function renderExpandedPanel(student: StudentRow) {
    if (progressLoadError) {
      return (
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 text-sm font-semibold text-slate-500">
          Progress unavailable for {getRealmDefinition(analyticsRealmId).name}.
        </div>
      );
    }

    const prog = selectCanonicalTeacherProgressRow(student.id, analyticsRealmId, progress);
    if (!prog || prog.week == null) {
      return (
        <div className="border-t border-gray-100 bg-gray-50 px-6 py-5 text-sm font-semibold text-slate-500">
          Not placed in {getRealmDefinition(analyticsRealmId).name}.
        </div>
      );
    }
    const completedIds = prog ? parseCompletedLessons(prog.completed_lesson_ids) : [];
    const currentWeek = prog.week;
    const realmDefinition = getRealmDefinition(analyticsRealmId);
    const lessonsPerWeek = realmDefinition.lessonsPerWeek ?? 0;

    const lessonsThisWeek = weekCompletionCount(completedIds, currentWeek);
    const l1 = lessonsThisWeek >= 1;
    const l2 = lessonsThisWeek >= 2;
    const l3 = lessonsThisWeek >= Math.min(3, lessonsPerWeek);
    const quizUnlocked = lessonsThisWeek >= lessonsPerWeek;
    const pretestScore = prog?.pretest_score;

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
              <span className="font-bold text-gray-900">{prog.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Week</span>
              <span className="font-bold text-gray-900">{currentWeek} / {realmDefinition.totalWeeks ?? "—"}</span>
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
                                Attempt {i + 1} — {a.score}/{a.total} ({formatAccuracy(a.score, a.total, `${a.percent}%`)})
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
                                    Lesson {item.lessonNumber}: {item.correct}/{item.total} (
                                    {formatAccuracy(item.correct, item.total, `${item.percent}%`)})
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white">
                          <span className="text-gray-600">
                            Score: {wd?.score}/{wd?.total} ({formatAccuracy(wd?.score, wd?.total, `${wd?.percent}%`)})
                          </span>
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
    return <TeacherDashboardSkeleton />;
  }

  // Whole-class KPI strip — never filter by active year/strand/tab.
  const classStudentIds = new Set(classStudents.map((student) => student.id));
  const classProgressRows = classStudents
    .map((student) => selectCanonicalTeacherProgressRow(student.id, analyticsRealmId, progress))
    .filter((row): row is ProgressRow => row != null);
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
    const strand = typeof event.payload?.strand === "string" ? event.payload.strand : null;
    const eventRealm = tryCanonicalRealmId(strand);
    if (eventRealm === analyticsRealmId && classStudentIds.has(event.student_id) && isRecentIso(event.created_at, sevenDaysAgoMs)) {
      activeStudentsThisWeek.add(event.student_id);
    }
  });

  const isDev = process.env.NODE_ENV !== "production";

  async function openSchoolPreview(destinationSchoolId?: string | null) {
    setOpeningSchoolPreview(true);
    setSchoolPreviewError(null);

    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        setSchoolPreviewError("Please sign in again before opening School Home.");
        return;
      }

      const response = await fetch("/api/school-preview-session", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const result = (await response.json().catch(() => null)) as
        | {
            error?: string;
            schools?: Array<{ id: string; name: string; role: string }>;
          }
        | null;

      if (!response.ok || !result?.schools?.length) {
        setSchoolPreviewError(
          result?.error ??
            "School Home is unavailable. Check that the preview migration is deployed.",
        );
        return;
      }

      const destinationSchool =
        (destinationSchoolId
          ? result.schools.find((school) => school.id === destinationSchoolId)
          : null) ?? result.schools[0];
      window.location.assign(`/school/${destinationSchool.id}`);
    } catch {
      setSchoolPreviewError(
        "School Home could not be opened. Please try again.",
      );
    } finally {
      setOpeningSchoolPreview(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#E2E8F0] via-[#DEE5EC] to-[#D6DEE6]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#E6E8EC] bg-white px-3 py-3 xl:px-5">
        <div className="mx-auto flex w-full min-w-0 items-center gap-1.5 overflow-x-auto 2xl:overflow-visible">
          {schoolHomeId ? (
            <button
              type="button"
              onClick={() => void openSchoolPreview(schoolHomeId)}
              disabled={openingSchoolPreview}
              className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-2 text-sm font-bold text-[#334155] transition hover:border-[#00C2A8] hover:bg-[#F0FDFA] hover:text-[#0F766E] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
              aria-label="Back to School Home"
            >
              <ArrowLeft className="h-4 w-4" />
              {openingSchoolPreview ? "Opening..." : "School Home"}
            </button>
          ) : null}

          {schoolLogo ? (
            <Image
              src={schoolLogo.src}
              alt={schoolLogo.alt}
              width={36}
              height={36}
              priority
              className="h-9 w-9 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0A2F2A] shadow-[0_0_12px_-2px_rgba(0,229,195,0.55)] ring-1 ring-[#00C2A8]/40">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 12l9-9 9 9M5 10v10h14V10" />
              </svg>
            </div>
          )}

          <h1 className="max-w-56 shrink truncate text-lg font-black tracking-tight text-[#0F172A] min-[1500px]:max-w-72 min-[1500px]:text-xl min-[1900px]:max-w-none">
            {selectedClass?.name ?? "Class Dashboard"}
          </h1>

          {selectedClass ? (
            <>
              <span className="h-1 w-1 shrink-0 rounded-full bg-[#CBD5E1]" />
              <button
                onClick={copyCode}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#00C2A8]/40 bg-white px-2 py-0.5 font-mono text-[11px] font-extrabold text-[#0A2F2A] transition hover:border-[#00C2A8] hover:shadow-[0_0_0_3px_rgba(0,194,168,0.12)]"
              >
                {copiedCode ? "Copied!" : selectedClass.class_code}
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
              <span className="hidden shrink-0 text-[11px] font-semibold text-[#94A3B8] min-[1450px]:inline">
                {classStudents.length} student{classStudents.length === 1 ? "" : "s"}
              </span>
              <span className="h-1 w-1 shrink-0 rounded-full bg-[#CBD5E1]" />
              <label className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-[#475569]">
                <span className="inline-flex items-center gap-1.5" title="Mid-lesson mini-game frequency. Override per student in their card.">
                  <Brain className="h-3.5 w-3.5" />
                  <span className="hidden min-[1650px]:inline">Brain breaks</span>
                </span>
                <select
                  value={isBrainBreakFrequency(selectedClass.brain_break_frequency) ? selectedClass.brain_break_frequency : "normal"}
                  onChange={(e) => { if (isBrainBreakFrequency(e.target.value)) void setClassBrainBreak(e.target.value); }}
                  className="rounded-md border border-[#E6E8EC] bg-white px-2 py-1 text-[11px] font-bold text-[#0F172A] transition hover:border-[#CBD5E1]"
                >
                  {BRAIN_BREAK_FREQUENCIES.map((f) => (
                    <option key={f} value={f}>{BRAIN_BREAK_FREQUENCY_LABEL[f]}</option>
                  ))}
                </select>
              </label>
              {isDev ? (
                <span className="shrink-0 font-mono text-[10px] text-[#94A3B8]">
                  id:{selectedClass.id.slice(0, 8)}
                </span>
              ) : null}
            </>
          ) : null}

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {isDev && !isSchoolPreview && (
              <button
                onClick={() => void openSchoolPreview()}
                disabled={openingSchoolPreview}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#0EA5A4]/40 bg-[#0EA5A4]/10 text-[#0F766E] font-bold text-sm hover:bg-[#0EA5A4]/15 transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
                type="button"
              >
                <Building2 className="h-4 w-4" />
                {openingSchoolPreview ? "Opening..." : "School Home Preview"}
              </button>
            )}
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
              <button
                onClick={() => setShowLoginDetailsActions(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E8EC] bg-white px-2.5 py-2 text-sm font-bold text-[#0F172A] transition hover:border-[#CBD5E1] hover:bg-[#F8FAFC] active:scale-[0.98] min-[1850px]:px-3.5"
                aria-label="Student Login Details"
                title="Student Login Details"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25">
                  <path d="M16 2H8a2 2 0 00-2 2v16a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z" />
                  <path d="M12 18h.01M8 6h8M8 10h8M8 14h4" />
                </svg>
                <span className="min-[1850px]:hidden">Login details</span>
                <span className="hidden min-[1850px]:inline">Student Login Details</span>
              </button>
            )}

            <button
              onClick={() => router.push("/teacher/classes")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E8EC] bg-white px-2.5 py-2 text-sm font-bold text-[#0F172A] transition hover:border-[#CBD5E1] hover:bg-[#F8FAFC] active:scale-[0.98] min-[1850px]:px-3.5"
              aria-label="Add or edit students"
              title="Add or edit students"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M19 8v6M16 11h6" /></svg>
              <span className="min-[1850px]:hidden">Students</span>
              <span className="hidden min-[1850px]:inline">Add / Edit Students</span>
            </button>
            {selectedClass && classStudents.length > 0 ? (
              <button
                onClick={() => setShowPlacements(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#0EA5A4]/40 bg-[#0EA5A4]/10 px-2.5 py-2 text-sm font-bold text-[#0F766E] transition hover:bg-[#0EA5A4]/15 active:scale-[0.98] min-[1850px]:px-3.5"
                aria-label="Manage placements"
                title="Manage placements"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.25"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                <span className="min-[1850px]:hidden">Placements</span>
                <span className="hidden min-[1850px]:inline">Manage Placements</span>
              </button>
            ) : null}
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
        {schoolPreviewError && (
          <div
            className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"
            role="alert"
          >
            {schoolPreviewError}
          </div>
        )}
        {progressLoadError && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">
            Student progress is temporarily unavailable. Existing results have not been replaced. {progressLoadError}
          </div>
        )}
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
                progressRows={progress}
              />
            ) : activeTab === "curriculum" ? (
              <CurriculumExplorer
                yearLabel={activeYear}
                studentCount={classStudents.length}
                studentIds={classStudents.map((student) => student.id)}
                progress={progress as any}
                progressAvailable={!progressLoadError}
              />
            ) : (
              <StrandStudentsPanel
                yearLabel={activeYear}
                students={classStudents as any}
                progress={progress as any}
                liveRows={liveRows as any}
                liveEvents={liveEvents as any}
                onRealmChange={setAnalyticsRealmId}
                onProgressChanged={() => selectedClassId ? loadClassData(selectedClassId, false) : undefined}
                progressAvailable={!progressLoadError}
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

      {showLoginDetailsActions && selectedClass && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0F172A]/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-login-details-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowLoginDetailsActions(false);
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_24px_70px_-24px_rgba(15,23,42,0.55)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="student-login-details-title" className="text-xl font-black text-[#0F172A]">
                  Student Login Details
                </h2>
                <p className="mt-1 text-sm text-[#64748B]">
                  {selectedClass.name} · {classStudents.length} students
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLoginDetailsActions(false)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                aria-label="Close student login details"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setShowLoginDetailsActions(false);
                  void downloadLoginCardsPdf();
                }}
                className="flex min-h-28 flex-col items-start justify-between rounded-xl border border-[#CBD5E1] bg-white p-4 text-left hover:border-[#009688] hover:bg-[#F0FDFA]"
              >
                <Download className="h-6 w-6 text-[#009688]" />
                <span>
                  <span className="block font-black text-[#0F172A]">Download PDF</span>
                  <span className="mt-1 block text-xs text-[#64748B]">Save login cards as a PDF file.</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLoginDetailsActions(false);
                  void printAllLoginCards();
                }}
                className="flex min-h-28 flex-col items-start justify-between rounded-xl border border-[#CBD5E1] bg-white p-4 text-left hover:border-[#009688] hover:bg-[#F0FDFA]"
              >
                <Printer className="h-6 w-6 text-[#009688]" />
                <span>
                  <span className="block font-black text-[#0F172A]">Print</span>
                  <span className="mt-1 block text-xs text-[#64748B]">Open the printable login cards.</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {pinToast && (
        <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-[#0F172A] px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_32px_-8px_rgba(15,23,42,0.5)]">
          {pinToast}
        </div>
      )}
    </main>
  );
}

