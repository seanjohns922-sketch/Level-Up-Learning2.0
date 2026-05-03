"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { getLatestPosttestProfile } from "@/data/assessments/analysis";
import CurriculumExplorer from "@/components/teacher/CurriculumExplorer";
import StrandStudentsPanel from "@/components/teacher/StrandStudentsPanel";

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

const YEAR_LEVELS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
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
          className="text-xs px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 transition disabled:opacity-50"
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
  const [activeTab, setActiveTab] = useState<"students" | "curriculum">("students");
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
        .from("progress_snapshot")
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
            if (isComplete) bg = "bg-stone-1000";
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
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-stone-700 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded-md whitespace-nowrap">
              ★ Legend
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
                quizUnlocked ? "bg-stone-200 text-stone-700" : "bg-gray-200 text-gray-400",
              ].join(" ")}
            >
              Quiz {quizUnlocked ? "🔓" : "🔒"}
            </span>
          </div>

          {legends.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-stone-700 font-bold">🏆 Legend Unlocked</span>
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
                  <span className="inline-flex items-center rounded-full bg-stone-200 px-2.5 py-1 text-[11px] font-bold text-stone-700">
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
      <main className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-2 w-2 rounded-full bg-stone-1000 animate-pulse" />
          <p className="text-sm font-semibold">Loading dashboard…</p>
        </div>
      </main>
    );
  }

  // Stats (precomputed for header KPI strip + summary tiles)
  const yearProg = progress.filter((p) => p.year === activeYear);
  const activeThisWeek = yearProg.filter((p) => (p.week ?? 0) > 0).length;
  const legendsUnlocked = yearProg.filter((p) => parseUnlockedLegends(p.unlocked_legends).length > 0).length;
  const avgWeek = classStudents.length > 0 && yearProg.length > 0
    ? (yearProg.reduce((s, p) => s + (p.week ?? 0), 0) / yearProg.length).toFixed(1)
    : "—";
  const postTests = yearProg.filter((p) => getLatestPosttestProfile(p.quiz_scores)).length;
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#EEF2F6] via-[#F1F4F8] to-[#E9EEF3]">
      {/* Header */}
      <header className="bg-white border-b border-[#E6E8EC] px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-stone-1000 to-stone-500 flex items-center justify-center">
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
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono font-extrabold text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md hover:bg-stone-200 transition"
                >
                  {copiedCode ? "Copied!" : selectedClass.class_code}
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                </button>
                <span className="text-[11px] font-semibold text-[#94A3B8]">· {classStudents.length} student{classStudents.length === 1 ? "" : "s"}</span>
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
            <button
              onClick={() => router.push("/teacher/classes/new")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F172A] text-white font-bold text-sm hover:bg-[#1E293B] transition active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
              New Class
            </button>
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
            <div className="mx-auto h-12 w-12 rounded-xl bg-stone-100 flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m3-5.13a4 4 0 100-8 4 4 0 000 8zm6-2a3 3 0 100-6 3 3 0 000 6z" /></svg>
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
              <KpiTile primary label="Students" value={classStudents.length} accent="#0EA5A4" icon={(<path d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m3-5.13a4 4 0 100-8 4 4 0 000 8zm6-2a3 3 0 100-6 3 3 0 000 6z" />)} />
              <KpiTile label="Active This Week" value={activeThisWeek} accent="#0EA5A4" icon={(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)} />
              <KpiTile label="Legends Unlocked" value={legendsUnlocked} accent="#F59E0B" icon={(<path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />)} />
              <KpiTile label="Avg Week" value={avgWeek} accent="#0EA5A4" icon={(<><path d="M3 3v18h18" /><path d="M7 14l3-3 3 3 5-5" /></>)} />
              <KpiTile label="Post-Tests" value={postTests} accent="#6366F1" icon={(<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></>)} />
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
                  { id: "students",   label: "Students" },
                  { id: "curriculum", label: "Curriculum" },
                ] as const).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={[
                      "px-3.5 py-1.5 rounded-lg font-bold text-sm whitespace-nowrap transition",
                      activeTab === t.id
                        ? "bg-gradient-to-b from-stone-1000 to-stone-700 text-white shadow-[0_4px_14px_-4px_rgba(120,113,108,0.55)]"
                        : "text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]",
                    ].join(" ")}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "curriculum" ? (
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
              />
            )}
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

function KpiTile({
  label, value, accent, icon, primary,
}: {
  label: string; value: string | number; accent: string; icon: React.ReactNode; primary?: boolean;
}) {
  if (primary) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl px-5 py-4 border border-stone-300/70 bg-gradient-to-br from-white via-stone-100/40 to-stone-100/60 shadow-[0_8px_24px_-12px_rgba(120,113,108,0.35)]"
      >
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-stone-500 to-stone-500" />
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] font-extrabold text-stone-700 uppercase tracking-[0.18em]">{label}</div>
            <div className="mt-1 text-[44px] leading-none font-black text-[#0F172A] tabular-nums tracking-tight">
              {value}
            </div>
            <div className="mt-1.5 text-[11px] font-semibold text-[#475569] tracking-wide">
              enrolled in this class
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-white shadow-sm border border-stone-200 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
    </div>
  );
}
