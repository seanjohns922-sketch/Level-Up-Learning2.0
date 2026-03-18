"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/useAuthGuard";

/* ── types ─────────────────────────────────────────── */
type ClassRow = { id: string; class_code: string; name: string; year_level: string };
type StudentRow = { id: string; display_name: string; class_id: string; user_id: string; pin?: string | null; qr_token?: string | null };
type ProgressRow = {
  student_id: string;
  year: string;
  week: number | null;
  status: string;
  pretest_score: number | null;
  completed_lesson_ids: any;
  unlocked_legends: any;
  quiz_scores: any;
};

type WeekResult = { week: number; score: number; passed: boolean };

const YEAR_LEVELS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const WEEKS = Array.from({ length: 12 }, (_, i) => i + 1);

/* ── helpers ───────────────────────────────────────── */
function parseCompletedLessons(raw: any): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") try { return JSON.parse(raw); } catch { return []; }
  return [];
}
function parseUnlockedLegends(raw: any): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") try { return JSON.parse(raw); } catch { return []; }
  return [];
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
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Login Card - ${student.display_name}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;display:flex;justify-content:center;padding:20px}
      .card{border:2px solid #e5e7eb;border-radius:16px;padding:32px;width:340px;text-align:center}
      .brand{font-size:14px;font-weight:800;color:#6b7280;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:20px}
      .name{font-size:22px;font-weight:900;color:#111827;margin-bottom:4px}
      .class{font-size:14px;color:#6b7280;margin-bottom:16px}
      .qr{margin:16px auto}.qr img{width:160px;height:160px}
      .scan-label{font-size:12px;color:#9ca3af;margin-bottom:16px}
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
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState("Year 1");
  const [copiedCode, setCopiedCode] = useState(false);

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
        await loadClassData(firstClassId, false);
      } else {
        setSelectedClassId(null);
        selectedClassRef.current = null;
        setStudents([]);
        setProgress([]);
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
    if (newStuds.length > 0) {
      const ids = newStuds.map((s) => s.id);
      const { data: prog } = await supabase
        .from("progress")
        .select("*")
        .in("student_id", ids);
      newProg = prog ?? [];
    }

    if (diffOnly) {
      // Only update state if data actually changed — prevents unnecessary re-renders
      const studJson = JSON.stringify(newStuds);
      const progJson = JSON.stringify(newProg);
      setStudents((prev) => JSON.stringify(prev) === studJson ? prev : newStuds);
      setProgress((prev) => JSON.stringify(prev) === progJson ? prev : newProg);
    } else {
      setStudents(newStuds);
      setProgress(newProg);
    }
  }

  function selectClass(classId: string) {
    const cls = classes.find(c => c.id === classId);
    console.log("[TeacherDashboard] selectedClassId:", classId, "code:", cls?.class_code);
    setSelectedClassId(classId);
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

  async function handleResetPin(student: StudentRow) {
    const newPin = prompt(`Reset PIN for ${student.display_name}.\nEnter new 4-digit PIN:`);
    if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      alert("PIN must be exactly 4 digits.");
      return;
    }
    await supabase.from("students").update({ pin: newPin } as any).eq("id", student.id);
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, pin: newPin } : s))
    );
    alert(`PIN for ${student.display_name} reset to ${newPin}.`);
  }

  /* ── segment bar for a student's level ─── */
  function renderWeekBar(prog: ProgressRow | undefined) {
    const completedIds = prog ? parseCompletedLessons(prog.completed_lesson_ids) : [];
    const currentWeek = prog?.week ?? 1;
    const legends = prog ? parseUnlockedLegends(prog.unlocked_legends) : [];
    const hasLegend = legends.length > 0;

    return (
      <div className="flex items-center gap-1">
        {WEEKS.map((w) => {
          const lessonsCompleted = weekCompletionCount(completedIds, w);
          const isComplete = lessonsCompleted >= 3;
          const isCurrent = w === currentWeek && !isComplete;
          const isLocked = w > currentWeek;

          let bg = "bg-gray-200"; // locked
          if (isComplete) bg = "bg-emerald-400";
          else if (isCurrent) {
            if (lessonsCompleted === 0) bg = "bg-amber-200";
            else if (lessonsCompleted === 1) bg = "bg-amber-300";
            else bg = "bg-amber-400";
          }

          return (
            <div
              key={w}
              className={`h-5 flex-1 rounded-sm ${bg} transition-colors relative group`}
              title={`Week ${w}: ${isComplete ? "Complete" : isCurrent ? `${lessonsCompleted}/3 lessons` : "Locked"}`}
            >
              {isCurrent && (
                <div className="absolute inset-0 rounded-sm ring-2 ring-amber-500 ring-offset-1" />
              )}
            </div>
          );
        })}
        {hasLegend && (
          <span className="ml-2 text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full whitespace-nowrap">
            🏆 Legend
          </span>
        )}
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
                {label} {done ? "✓" : "🔒"}
              </span>
            ))}
            <span
              className={[
                "px-3 py-1 rounded-full text-xs font-bold",
                quizUnlocked ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-400",
              ].join(" ")}
            >
              Quiz {quizUnlocked ? "🔓" : "🔒"}
            </span>
          </div>

          {legends.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-teal-600 font-bold">🏆 Legend Unlocked</span>
            </div>
          )}
        </div>

        {/* Login Details - QR + PIN */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🔐 Login Details</h4>
          <StudentQRSection student={student} classCode={selectedClass?.class_code ?? ""} className2={selectedClass?.name ?? ""} onRegenerate={(newToken) => {
            setStudents((prev) => prev.map((s) => s.id === student.id ? { ...s, qr_token: newToken } : s));
          }} />
        </div>

        {/* Quiz History */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quiz History</h4>
          {(() => {
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
                              <span className={["font-bold text-xs px-2 py-0.5 rounded-full", a.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"].join(" ")}>
                                {a.passed ? "✅ Pass" : "❌ Fail"}
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
                          <span className={["font-bold text-xs px-2 py-0.5 rounded-full", wd?.passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"].join(" ")}>
                            {wd?.passed ? "✅ Pass" : "❌ Fail"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf7f1] flex items-center justify-center">
        <p className="text-gray-400 text-lg">Loading dashboard…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf7f1]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-100 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Teacher Dashboard</h1>
            {selectedClass && (
              <>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500">{selectedClass.name}</span>
                  <button
                    onClick={copyCode}
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full hover:bg-blue-100 transition"
                  >
                    {copiedCode ? "Copied!" : selectedClass.class_code}
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  </button>
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  Debug — Class ID: {selectedClass.id} • Students loaded: {classStudents.length}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {classes.length > 1 && (
              <select
                value={selectedClassId ?? ""}
                onChange={(e) => selectClass(e.target.value)}
                className="text-sm px-3 py-2 rounded-xl border border-gray-200 bg-white"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => router.push("/teacher/classes/new")}
              className="px-4 py-2 rounded-xl bg-[#9fd7b1] text-[#1f3b2a] font-bold text-sm hover:bg-[#8fcea4] transition"
            >
              + New Class
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-sm font-bold transition"
              type="button"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              Log Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {classes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No classes yet.</p>
            <button
              onClick={() => router.push("/teacher/classes/new")}
              className="px-6 py-3 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-bold"
            >
              Create Your First Class
            </button>
          </div>
        ) : (
          <>
            {/* Year level tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
              {YEAR_LEVELS.map((yr) => (
                <button
                  key={yr}
                  onClick={() => setActiveYear(yr)}
                  className={[
                    "px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition",
                    activeYear === yr
                      ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                      : "text-gray-400 hover:text-gray-600",
                  ].join(" ")}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Student table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[200px_1fr] md:grid-cols-[240px_1fr] border-b border-gray-100 px-6 py-3 bg-gray-50/50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Student</span>
                <div className="flex items-center gap-1">
                  {WEEKS.map((w) => (
                    <span
                      key={w}
                      className="flex-1 text-center text-[10px] font-bold text-gray-300"
                    >
                      W{w}
                    </span>
                  ))}
                </div>
              </div>

              {classStudents.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400">
                  No students enrolled yet. Share the class code to get started.
                </div>
              ) : (
                classStudents.map((student) => {
                  const isExpanded = expandedStudent === student.id;
                  const prog = getStudentProgress(student.id, activeYear);

                  return (
                    <div key={student.id}>
                      <div
                        className={[
                          "grid grid-cols-[200px_1fr] md:grid-cols-[240px_1fr] px-6 py-3 cursor-pointer hover:bg-gray-50/50 transition items-center",
                          isExpanded ? "bg-gray-50/80" : "",
                        ].join(" ")}
                        onClick={() =>
                          setExpandedStudent(isExpanded ? null : student.id)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-400 flex items-center justify-center text-xs font-bold text-white">
                            {student.display_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-gray-800 truncate">
                            {student.display_name}
                          </span>
                          <svg
                            className={`h-4 w-4 text-gray-300 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </div>

                        <div>{renderWeekBar(prog)}</div>
                      </div>

                      {isExpanded && renderExpandedPanel(student)}
                    </div>
                  );
                })
              )}
            </div>

            {/* Summary */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Students" value={classStudents.length} />
              <StatCard
                label="Active This Week"
                value={
                  progress.filter(
                    (p) => p.year === activeYear && (p.week ?? 0) > 0
                  ).length
                }
              />
              <StatCard
                label="Legends Unlocked"
                value={
                  progress.filter(
                    (p) =>
                      p.year === activeYear &&
                      parseUnlockedLegends(p.unlocked_legends).length > 0
                  ).length
                }
              />
              <StatCard
                label="Avg Week"
                value={
                  classStudents.length > 0
                    ? (
                        progress
                          .filter((p) => p.year === activeYear)
                          .reduce((sum, p) => sum + (p.week ?? 0), 0) /
                        Math.max(
                          1,
                          progress.filter((p) => p.year === activeYear).length
                        )
                      ).toFixed(1)
                    : "—"
                }
              />
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-black text-gray-900 mt-1">{value}</div>
    </div>
  );
}
