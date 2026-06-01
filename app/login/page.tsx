"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getActiveStudentIdentity, hasActiveStudentSeenIntro, setActiveStudentProfile } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer } from "@/lib/student-progress-sync";
import { clearScopedProgress, isPlacementComplete, readProgress, writeProgress } from "@/data/progress";
import { clearScopedProgramStore } from "@/lib/program-progress";
import { resolveStudentNameParts } from "@/lib/studentName";
import { normalizeSchoolYearLabel, normalizeWorkingLevelLabel } from "@/lib/studentLevelLabel";
import { GraduationCap, Briefcase, KeyRound, User, Lock } from "lucide-react";

type StudentRecord = {
  id: string;
  firstName: string;
  pin: string;
  progressPercent: number;
  currentWeek: number;
  pretestPercent?: number | null;
};

type ClassRecord = {
  code: string;
  name: string;
  teacherEmail: string;
  teacherName?: string;
  students: StudentRecord[];
  createdAt: string;
};

type ClassesStore = Record<string, ClassRecord>;

const CLASSES_KEY = "lul_classes_v1";
function normalizeClassCode(code: string) {
  return code.replace(/\s+/g, "").trim().toUpperCase();
}

function isMissingStudentUserIdColumn(message?: string | null) {
  return Boolean(message && /user_id.*students|students.*user_id|schema cache/i.test(message));
}
function readClasses(): ClassesStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CLASSES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ClassesStore;
  } catch {
    return {};
  }
}

function writeClasses(store: ClassesStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLASSES_KEY, JSON.stringify(store));
}

function summarizeProgress(progress: ReturnType<typeof readProgress>) {
  return progress
    ? {
        status: progress.status ?? null,
        year: progress.year ?? null,
        week: progress.assignedWeek ?? null,
        placementComplete: progress.placementComplete ?? null,
      }
    : null;
}

/* ── Shared input wrapper (defined outside LoginPage to avoid remounts) ── */
function InputField({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 z-10">{icon}</span>
      {children}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"student" | "teacher">("student");
  const [teacherMode, setTeacherMode] = useState<"login" | "signup">("login");
  const [classes, setClasses] = useState<ClassesStore>(() => readClasses());

  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [className, setClassName] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const [studentCode, setStudentCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("code") ?? "";
  });
  const [studentName, setStudentName] = useState("");
  const [studentPin, setStudentPin] = useState("");
  const [studentError, setStudentError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  const createdClass = createdCode ? classes[createdCode] : null;
  const classList = useMemo(() => Object.values(classes), [classes]);
  const [teacherError, setTeacherError] = useState<string | null>(null);
  const [teacherLoading, setTeacherLoading] = useState(false);

  function saveClasses(next: ClassesStore) {
    setClasses(next);
    writeClasses(next);
  }

  async function handleTeacherSignup() {
    if (!teacherEmail || !teacherPassword) return;
    setTeacherError(null);
    setTeacherLoading(true);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: teacherEmail,
      password: teacherPassword,
      options: { data: { display_name: teacherName || teacherEmail, role: "teacher" } },
    });
    if (signUpErr) { setTeacherError(signUpErr.message); setTeacherLoading(false); return; }
    const userId = signUpData.user?.id;
    if (!userId) { setTeacherError("Sign up failed. Please try again."); setTeacherLoading(false); return; }
    await supabase.from("teachers").upsert({ id: userId, email: teacherEmail, display_name: teacherName.trim() || teacherEmail });
    if (className.trim()) {
      const { data: code } = await supabase.rpc("generate_class_code");
      if (code) {
        await supabase.from("classes").insert({ name: className.trim(), year_level: "1", class_code: code, teacher_id: userId });
        setCreatedCode(code);
        saveClasses({ ...classes, [code]: { code, name: className.trim(), teacherEmail, teacherName: teacherName.trim() || undefined, students: [], createdAt: new Date().toISOString() } });
      }
    }
    setTeacherLoading(false);
    router.push("/teacher/dashboard");
  }

  async function handleTeacherLogin() {
    if (!teacherEmail || !teacherPassword) return;
    setTeacherError(null);
    setTeacherLoading(true);
    const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email: teacherEmail, password: teacherPassword });
    if (signInErr) { setTeacherError(signInErr.message); setTeacherLoading(false); return; }
    if (data?.user) { setTeacherLoading(false); router.push("/teacher/dashboard"); return; }
    setTeacherError("Login failed.");
    setTeacherLoading(false);
  }

  async function handleStudentLogin() {
    setStudentError(null);
    const normalizedCode = normalizeClassCode(studentCode);
    const displayName = studentName.trim();
    const name = displayName;
    const pin = studentPin.trim();

    if (!normalizedCode || !name || pin.length !== 4) { setStudentError("Please enter class code, username, and password."); return; }

    const { data: lookupRows, error: classLookupError } = await supabase
      .rpc("find_class_by_code", { input_code: normalizedCode });
    const cls = Array.isArray(lookupRows) ? lookupRows[0] ?? null : null;

    if (classLookupError || !cls) { setStudentError("Class code not found."); return; }

    // Look up student server-side — SECURITY DEFINER bypasses RLS entirely, no auth needed
    const { data: studentRows, error: studentErr } = await supabase.rpc("student_login_lookup", {
      p_class_id: cls.id,
      p_display_name: displayName.trim(),
      p_pin: pin,
    });

    const student = Array.isArray(studentRows) ? studentRows[0] : studentRows;
    if (studentErr || !student?.student_id) {
      setStudentError("Username or password not recognised. Ask your teacher to check your details.");
      return;
    }

    const explicitWorkingYear = normalizeWorkingLevelLabel(student.working_level) ?? null;
    const legacyWorkingYear = normalizeWorkingLevelLabel(student.year_level) ?? null;
    const studentWorkingYear = explicitWorkingYear ?? legacyWorkingYear;
    const studentSchoolYear =
      normalizeSchoolYearLabel(student.school_year_level) ??
      normalizeSchoolYearLabel(student.year_level) ??
      null;
    const previousActiveStudent = getActiveStudentIdentity().studentId;
    const previousScopedProgress = readProgress();

    if (previousActiveStudent && previousActiveStudent !== student.student_id) {
      clearScopedProgress(previousActiveStudent);
      clearScopedProgramStore(previousActiveStudent);
    }

    const resolvedStudentName = resolveStudentNameParts(student).displayName || displayName;

    setActiveStudentProfile(student.student_id, student.class_id, {
      displayName: resolvedStudentName,
      yearLevel: studentSchoolYear ?? studentWorkingYear ?? "Year 1",
    });
    clearScopedProgress(student.student_id);
    clearScopedProgramStore(student.student_id);

    let progress = readProgress();
    let introSeen = hasActiveStudentSeenIntro(student.student_id);
    let introSeenSource: "localStorage" | "students_table" = "localStorage";
    let progressSource: "localStorage" | "progress_snapshot" | "default" = progress ? "localStorage" : "default";
    let restoredRowsSummary: unknown[] = [];
    try {
      const restored = await restoreStudentStateFromServer(student.student_id);
      if (restored.progress) {
        progress = restored.progress;
        progressSource = "progress_snapshot";
      }
      introSeen = restored.introSeen;
      introSeenSource = "students_table";
      restoredRowsSummary = restored.rows.map((row) => ({
        year: row.year,
        status: row.status,
        week: row.week,
        placement_complete: row.placement_complete,
        assigned_week: row.assigned_week,
        has_seen_intro: row.has_seen_intro,
        pretest_score: row.pretest_score,
      }));
    } catch (error) {
      console.warn("[Login] Could not restore student progress from Supabase", error);
    }

    if (!progress) {
      progress = {
        year: studentSchoolYear ?? studentWorkingYear ?? "Year 1",
        scorePercent: 0,
        status: "ASSIGNED_PROGRAM",
        placementComplete: false,
        assignedWeek: 1,
        requiredWeeks: [],
        optionalWeeks: [],
        unlockedLegends: [],
      };
      writeProgress(progress);
      progressSource = "default";
    }

    const placementComplete = isPlacementComplete(progress);

    let dest: string;
    if (!introSeen) {
      dest = `/home`;
    } else if (!placementComplete) {
      dest = `/pretest?year=${encodeURIComponent(progress?.year ?? studentWorkingYear ?? studentSchoolYear ?? "Year 1")}`;
    } else {
      dest = `/levels`;
    }
    console.log("[LoginRouteDebug]", {
      student_id: student.student_id,
      previous_active_student_id: previousActiveStudent,
      student_table: {
        working_level: student.working_level ?? null,
        school_year_level: student.school_year_level ?? null,
      },
      localStorage_before_switch: {
        activeStudentId: previousActiveStudent,
        progress: summarizeProgress(previousScopedProgress),
      },
      localStorage_after_switch: {
        introSeenForStudent: hasActiveStudentSeenIntro(student.student_id),
        progress: summarizeProgress(readProgress()),
      },
      progress_snapshot_rows: restoredRowsSummary,
      resolved: {
        hasSeenIntro: introSeen,
        hasSeenIntroSource: introSeenSource,
        placementComplete,
        placementCompleteSource: progressSource === "progress_snapshot" ? "progress_snapshot.placement_complete" : progressSource,
        progressStatus: progress?.status ?? null,
        progressStatusSource: progressSource,
        progressYear: progress?.year ?? null,
        progressYearSource: progressSource === "progress_snapshot" ? "progress_snapshot.year" : progressSource,
        progressWeek: progress?.assignedWeek ?? null,
        progressWeekSource: progressSource === "progress_snapshot" ? "progress_snapshot.assigned_week/week" : progressSource,
      },
      route: dest,
    });
    router.push(dest);
  }

  const inputCls =
    "w-full pl-10 pr-4 py-3 rounded-xl text-[15px] text-white font-medium placeholder-white/30 bg-transparent border border-white/15 focus:outline-none focus:border-amber-400/50 focus:bg-white/[0.03] transition-all duration-200";

  return (
    <main className="min-h-screen relative overflow-hidden flex">
      {/* ── Full-screen background ── */}
      <div className="absolute inset-0">
        <img
          src="/images/login-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
          style={{ objectPosition: "-10% 65%" }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: "inset 0 0 200px 80px rgba(0,0,0,0.5)",
          }}
        />
        {/* Left darkening for text readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 35%, transparent 55%)",
          }}
        />
        {/* Bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none" />
      </div>


{/* ── Left panel — floating UI ── */}
      <div
        className="relative z-10 w-full md:w-[440px] min-h-screen flex flex-col justify-center px-8 md:px-12 py-10"
        style={{ animation: "fadeUp 0.7s ease both" }}
      >
        {/* Title */}
        <div className="mb-8">
          <h1
            className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tight"
            style={{
              fontFamily: "'Nunito', sans-serif",
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          >
            Level Up
            <br />
            Learning
          </h1>
          <p
            className="text-white/40 mt-3 text-sm font-medium tracking-wide"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            Begin your journey to the Tower
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="mb-5">
          <div className="flex gap-1 p-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
            <button
              type="button"
              onClick={() => setTab("student")}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-full font-bold text-sm transition-all duration-200"
              style={{
                background: tab === "student" ? "rgba(255,255,255,0.1)" : "transparent",
                color: tab === "student" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
              }}
            >
              <GraduationCap size={15} strokeWidth={2.2} /> Student
            </button>
            <button
              type="button"
              onClick={() => setTab("teacher")}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-full font-bold text-sm transition-all duration-200"
              style={{
                background: tab === "teacher" ? "rgba(255,255,255,0.1)" : "transparent",
                color: tab === "teacher" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
              }}
            >
              <Briefcase size={14} strokeWidth={2.2} /> Teacher / Parent
            </button>
          </div>
        </div>

        {/* ── Student Form ── */}
        {tab === "student" ? (
          <div className="grid gap-4">
            <label className="grid gap-1.5">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest pl-1">Class Code</span>
              <InputField icon={<KeyRound size={15} />}>
                <input value={studentCode} onChange={(e) => setStudentCode(e.target.value)} placeholder="e.g. K9F2Q" className={`${inputCls} tracking-[0.3em] text-center uppercase font-semibold`} />
              </InputField>
            </label>
            <label className="grid gap-1.5">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest pl-1">Username</span>
              <InputField icon={<User size={15} />}>
                <input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter your username" className={inputCls} />
              </InputField>
            </label>
            <label className="grid gap-1.5">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest pl-1">Password</span>
              <InputField icon={<Lock size={15} />}>
                <input
                  value={studentPin}
                  onChange={(e) => setStudentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="----"
                  className={`${inputCls} tracking-[0.5em] text-center font-semibold`}
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  onClick={() => setShowPin((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition z-10"
                  aria-label={showPin ? "Hide PIN" : "Show PIN"}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </InputField>
            </label>

            {studentError && (
              <div className="text-sm font-bold text-red-300 text-center rounded-xl py-2" style={{ background: "rgba(220,50,50,0.12)" }}>{studentError}</div>
            )}

            <button
              onClick={handleStudentLogin}
              className="mt-1 w-full py-4 rounded-2xl font-black text-lg text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] active:scale-[0.97] cursor-pointer"
              style={{
                background: "linear-gradient(135deg, hsl(0 0% 22%), hsl(0 0% 15%))",
                boxShadow: "0 6px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
              type="button"
            >
              Enter the Tower
            </button>
          </div>
        ) : (
          /* ── Teacher Form ── */
          <div className="grid gap-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTeacherMode(m)}
                  className="px-5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-200"
                  style={{
                    background: teacherMode === m ? "rgba(255,255,255,0.1)" : "transparent",
                    color: teacherMode === m ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
                    border: teacherMode === m ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                  }}
                >
                  {m === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest pl-1">Email</span>
              <InputField icon={<User size={15} />}>
                <input value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} placeholder="teacher@school.edu" className={inputCls} />
              </InputField>
            </label>
            <label className="grid gap-1.5">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest pl-1">Password</span>
              <InputField icon={<Lock size={15} />}>
                <input value={teacherPassword} onChange={(e) => setTeacherPassword(e.target.value)} placeholder="********" type="password" className={inputCls} />
              </InputField>
            </label>

            {teacherMode === "signup" && (
              <>
                <label className="grid gap-1.5">
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest pl-1">Teacher Name</span>
                  <InputField icon={<User size={15} />}>
                    <input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="Ms Johnson" className={inputCls} />
                  </InputField>
                </label>
                <label className="grid gap-1.5">
                  <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest pl-1">Class Name</span>
                  <InputField icon={<Briefcase size={14} />}>
                    <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="3/4 SJ" className={inputCls} />
                  </InputField>
                </label>
              </>
            )}

            {teacherError && (
              <p className="text-sm text-red-300 font-bold text-center rounded-xl py-2" style={{ background: "rgba(220,50,50,0.12)" }}>{teacherError}</p>
            )}

            <button
              onClick={teacherMode === "signup" ? handleTeacherSignup : handleTeacherLogin}
              disabled={teacherLoading}
              className="mt-1 w-full py-4 rounded-2xl font-black text-lg text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] active:scale-[0.97] disabled:opacity-50 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, hsl(0 0% 22%), hsl(0 0% 15%))",
                boxShadow: "0 6px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
              type="button"
            >
              {teacherLoading ? "Please wait..." : teacherMode === "signup" ? "Sign Up" : "Log In"}
            </button>

            {createdClass && (
              <div className="rounded-xl p-3 text-sm text-emerald-200" style={{ background: "rgba(40,180,100,0.12)", border: "1px solid rgba(80,200,120,0.2)" }}>
                <div className="font-bold">Class Created</div>
                <div>Name: {createdClass.name} · Code: {createdClass.code}</div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p
          className="mt-6 text-[10px] tracking-[0.06em] uppercase font-medium"
          style={{ color: "rgba(255,200,100,0.3)", fontFamily: "'Quicksand', sans-serif" }}
        >
          Unlock your Level Up Legend by mastering your skills
        </p>
      </div>
    </main>
  );
}
