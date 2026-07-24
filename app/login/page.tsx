"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { recoverInvalidRefreshToken, supabase } from "@/lib/supabase";
import { clearActiveStudentSession, getActiveStudentIdentity, getActiveStudentProfile, hasActiveStudentSeenIntro, markActiveStudentIntroSeen, setActiveStudentProfile, setStudentSessionToken } from "@/lib/studentIdentity";
import { restoreStudentStateFromServer, StudentRestoreSupersededError } from "@/lib/student-progress-sync";
import { clearScopedProgress, isPlacementComplete, readProgress, writeProgress } from "@/data/progress";
import { clearScopedProgramStore } from "@/lib/program-progress";
import { resolveStudentNameParts } from "@/lib/studentName";
import { normalizeSchoolYearLabel, normalizeWorkingLevelLabel } from "@/lib/studentLevelLabel";
import { activateDemoPreviewMode, deactivateDemoPreviewMode, isDemoAccessFeatureEnabled } from "@/lib/demo-mode";
import { resolveStudentDestination } from "@/lib/student-destination";
import { tryNormalizeStarpathLevel } from "@/lib/starpath-levels";
import { buildStarpathWorldHref, STARPATH_REALM_ID } from "@/lib/starpath-routes";
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
type DemoAccessDebug = {
  featureEnabledRaw?: string | null;
  hasExpectedCode?: boolean;
  expectedCodeLength?: number;
  submittedCodeLength?: number;
  submittedTrimmedLength?: number;
  trimmedComparisonPasses?: boolean;
  status?: number;
  contentType?: string | null;
  rawText?: string | null;
  error?: string | null;
  message?: string | null;
};

const CLASSES_KEY = "lul_classes_v1";
function normalizeClassCode(code: string) {
  return code.replace(/\s+/g, "").trim().toUpperCase();
}

function persistStudentIdentity(args: {
  studentId: string;
  classId: string | null;
  displayName: string;
  yearLevel: string;
}) {
  try {
    setActiveStudentProfile(args.studentId, args.classId, {
      displayName: args.displayName,
      yearLevel: args.yearLevel,
    });
    const activeIdentity = getActiveStudentIdentity();
    const activeProfile = getActiveStudentProfile();
    if (activeIdentity.studentId !== args.studentId || activeProfile?.studentId !== args.studentId) {
      throw new Error("active student profile did not persist");
    }

    return true;
  } catch (error) {
    console.warn("[Login] Student bootstrap storage failed", error);
    clearActiveStudentSession();
    return false;
  }
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
  const [teacherResetNotice, setTeacherResetNotice] = useState<string | null>(null);
  const [teacherResetLoading, setTeacherResetLoading] = useState(false);
  const [passwordRecoveryMode, setPasswordRecoveryMode] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryConfirmPassword, setRecoveryConfirmPassword] = useState("");
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoverySaving, setRecoverySaving] = useState(false);
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  const [studentCode, setStudentCode] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("code") ?? "";
  });
  const [studentName, setStudentName] = useState("");
  const [studentPin, setStudentPin] = useState("");
  const [studentError, setStudentError] = useState<string | null>(null);
  const [studentBootstrapState, setStudentBootstrapState] = useState<"idle" | "loading" | "resolved" | "error">("idle");
  const studentLoginAttemptRef = useRef(0);
  const [showPin, setShowPin] = useState(false);
  const doorTapCountRef = useRef(0);
  const lastDoorTapAtRef = useRef(0);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoCode, setDemoCode] = useState("");
  const [demoError, setDemoError] = useState<string | null>(null);
  const [demoDebug, setDemoDebug] = useState<DemoAccessDebug | null>(null);
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const demoQueryHandledRef = useRef(false);

  const createdClass = createdCode ? classes[createdCode] : null;
  const classList = useMemo(() => Object.values(classes), [classes]);
  const [teacherError, setTeacherError] = useState<string | null>(null);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const demoAccessEnabled = isDemoAccessFeatureEnabled();

  useEffect(() => {
    console.log("[DemoAccess] demo enabled:", demoAccessEnabled);
  }, [demoAccessEnabled]);

  useEffect(() => {
    if (!demoAccessEnabled || demoQueryHandledRef.current || typeof window === "undefined") return;
    demoQueryHandledRef.current = true;
    if (new URLSearchParams(window.location.search).get("demo") === "1") {
      queueMicrotask(() => setShowDemoModal(true));
    }
  }, [demoAccessEnabled]);

  useEffect(() => {
    if (showDemoModal) {
      console.log("[DemoAccess] modal opened");
    }
  }, [showDemoModal]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setTab("teacher");
        setTeacherMode("login");
        setPasswordRecoveryMode(true);
        setTeacherError(null);
        setTeacherResetNotice(null);
        setRecoveryError(null);
        setRecoverySuccess(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    let { data, error: signInErr } = await supabase.auth.signInWithPassword({ email: teacherEmail, password: teacherPassword });
    if (signInErr && recoverInvalidRefreshToken(signInErr)) {
      ({ data, error: signInErr } = await supabase.auth.signInWithPassword({ email: teacherEmail, password: teacherPassword }));
    }
    if (signInErr) { setTeacherError(signInErr.message); setTeacherLoading(false); return; }
    if (data?.user) { setTeacherLoading(false); router.push("/teacher/dashboard"); return; }
    setTeacherError("Login failed.");
    setTeacherLoading(false);
  }

  async function handleTeacherPasswordReset() {
    const email = teacherEmail.trim();
    if (!email) {
      setTeacherError("Enter your email first.");
      return;
    }

    setTeacherError(null);
    setTeacherResetNotice(null);
    setTeacherResetLoading(true);
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    setTeacherResetLoading(false);

    if (error) {
      setTeacherError(error.message);
      return;
    }

    setTeacherResetNotice("Reset link sent. Check your email.");
  }

  async function handleRecoveredPasswordUpdate() {
    setRecoveryError(null);
    setRecoverySuccess(null);

    if (recoveryPassword.length < 6) {
      setRecoveryError("Password must be at least 6 characters.");
      return;
    }

    if (recoveryPassword !== recoveryConfirmPassword) {
      setRecoveryError("Passwords do not match.");
      return;
    }

    setRecoverySaving(true);
    const { error } = await supabase.auth.updateUser({ password: recoveryPassword });
    setRecoverySaving(false);

    if (error) {
      setRecoveryError(error.message);
      return;
    }

    setRecoverySuccess("Password updated. Redirecting…");
    setRecoveryPassword("");
    setRecoveryConfirmPassword("");
    setPasswordRecoveryMode(false);
    setTimeout(() => {
      router.push("/teacher/dashboard");
    }, 900);
  }

  async function handleStudentLogin() {
    if (studentBootstrapState === "loading") return;

    const loginAttempt = ++studentLoginAttemptRef.current;
    const isCurrentAttempt = () => studentLoginAttemptRef.current === loginAttempt;
    const failCurrentAttempt = (message: string, clearSession = false) => {
      if (!isCurrentAttempt()) return;
      if (clearSession) clearActiveStudentSession();
      setStudentError(message);
      setStudentBootstrapState("error");
    };

    setStudentError(null);
    setStudentBootstrapState("loading");
    const normalizedCode = normalizeClassCode(studentCode);
    const displayName = studentName.trim();
    const name = displayName;
    const pin = studentPin.trim();

    if (!normalizedCode || !name || pin.length !== 4) {
      failCurrentAttempt("Please enter class code, username, and password.");
      return;
    }

    const { data: lookupRows, error: classLookupError } = await supabase
      .rpc("find_class_by_code", { input_code: normalizedCode });
    const cls = Array.isArray(lookupRows) ? lookupRows[0] ?? null : null;

    if (!isCurrentAttempt()) return;
    if (classLookupError || !cls) {
      failCurrentAttempt("Class code not found.");
      return;
    }

    // Look up student server-side — SECURITY DEFINER bypasses RLS entirely, no auth needed
    const { data: studentRows, error: studentErr } = await supabase.rpc("student_login_lookup", {
      p_class_id: cls.id,
      p_display_name: displayName.trim(),
      p_pin: pin,
    });

    const student = Array.isArray(studentRows) ? studentRows[0] : studentRows;
    if (!isCurrentAttempt()) return;
    if (studentErr || !student?.student_id) {
      failCurrentAttempt("Username or password not recognised. Ask your teacher to check your details.");
      return;
    }
    if (!student.session_token) {
      failCurrentAttempt("A secure student session could not be created. Please try again.");
      return;
    }

    const explicitWorkingYear = normalizeWorkingLevelLabel(student.working_level) ?? null;
    const legacyWorkingYear = normalizeWorkingLevelLabel(student.year_level) ?? null;
    const studentWorkingYear = explicitWorkingYear ?? legacyWorkingYear;
    const studentSchoolYear =
      normalizeSchoolYearLabel(student.school_year_level) ??
      normalizeSchoolYearLabel(student.year_level) ??
      null;
    const resolvedStudentName = resolveStudentNameParts(student).displayName || displayName;
    const resolvedYearLevel = studentSchoolYear ?? studentWorkingYear ?? "Year 1";

    // A real student session must never inherit Demo Mode from another user of
    // the same browser. Clear both the local preview marker and demo cookie
    // before establishing the student's canonical identity.
    deactivateDemoPreviewMode();

    // Clear only the incoming student's cache. Other students' scoped records
    // remain isolated and available for their own next login.
    clearScopedProgress(student.student_id);
    clearScopedProgramStore(student.student_id);
    setStudentSessionToken(student.session_token);
    if (!persistStudentIdentity({
      studentId: student.student_id,
      classId: student.class_id,
      displayName: resolvedStudentName,
      yearLevel: resolvedYearLevel,
    })) {
      failCurrentAttempt("This device could not save your session. Please allow browser storage, refresh, and try again.", true);
      return;
    }

    let progress: ReturnType<typeof readProgress> = null;
    let introSeen = false;
    let progressSource: "progress_snapshot" | "none" = "none";
    let restoredRowsSummary: unknown[] = [];
    try {
      const restored = await restoreStudentStateFromServer(student.student_id, "number");
      if (!isCurrentAttempt()) return;
      const measurementRestored = await restoreStudentStateFromServer(student.student_id, "measurement");
      if (!isCurrentAttempt()) return;
      const spaceRestored = await restoreStudentStateFromServer(student.student_id, "space");
      if (!isCurrentAttempt()) return;
      if (restored.progress) {
        progress = restored.progress;
        progressSource = "progress_snapshot";
      }
      introSeen = restored.introSeen;
      restoredRowsSummary = restored.rows.map((row) => ({
        realm_id: row.realm_id,
        is_current: row.is_current,
        year: row.year,
        status: row.status,
        week: row.week,
        placement_complete: row.placement_complete,
        assigned_week: row.assigned_week,
        has_seen_intro: row.has_seen_intro,
        pretest_score: row.pretest_score,
      }));
      restoredRowsSummary.push(...measurementRestored.rows.map((row) => ({
        realm_id: row.realm_id,
        is_current: row.is_current,
        year: row.year,
        status: row.status,
        week: row.week,
        placement_complete: row.placement_complete,
        assigned_week: row.assigned_week,
        pretest_score: row.pretest_score,
      })));
      restoredRowsSummary.push(...spaceRestored.rows.map((row) => ({
        realm_id: row.realm_id,
        is_current: row.is_current,
        year: row.year,
        status: row.status,
        week: row.week,
        placement_complete: row.placement_complete,
        assigned_week: row.assigned_week,
        pretest_score: row.pretest_score,
      })));
    } catch (error) {
      if (error instanceof StudentRestoreSupersededError || !isCurrentAttempt()) return;
      console.warn("[Login] Authoritative student progress restore failed", error);
      failCurrentAttempt("We could not load your saved progress. Please try again.", true);
      return;
    }

    if (!progress) {
      failCurrentAttempt("Your learning placement is not ready yet. Please ask your teacher to check your starting level, then try again.", true);
      return;
    }

    const placementComplete = isPlacementComplete(progress);

    const dest = resolveStudentDestination({
      progress,
      introSeen,
      fallbackYear: studentWorkingYear ?? studentSchoolYear ?? "Year 1",
    });
    console.log("[LoginRouteDebug]", {
      student_id: student.student_id,
      student_table: {
        working_level: student.working_level ?? null,
        school_year_level: student.school_year_level ?? null,
      },
      localStorage_after_switch: {
        introSeenForStudent: hasActiveStudentSeenIntro(student.student_id),
        progress: summarizeProgress(readProgress()),
      },
      progress_snapshot_rows: restoredRowsSummary,
      resolved: {
        hasSeenIntro: introSeen,
        hasSeenIntroSource: "students_table",
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
    if (!isCurrentAttempt() || getActiveStudentIdentity().studentId !== student.student_id) return;
    setStudentBootstrapState("resolved");
    router.push(dest);
  }

  function registerSecretDoorTap(source: "click" | "pointer" | "touch") {
    if (!demoAccessEnabled) {
      console.log("[DemoAccess] tap ignored because feature is disabled");
      return;
    }

    const now = Date.now();
    if (now - lastDoorTapAtRef.current < 300) {
      return;
    }
    lastDoorTapAtRef.current = now;

    setDemoError(null);
    doorTapCountRef.current += 1;
    console.log("[DemoAccess] hotspot click count", {
      source,
      count: doorTapCountRef.current,
    });
    if (doorTapCountRef.current >= 5) {
      doorTapCountRef.current = 0;
      setShowDemoModal(true);
    }
  }

  async function handleDemoAccess() {
    if (!demoAccessEnabled || !demoCode.trim()) return;
    setDemoSubmitting(true);
    setDemoError(null);
    setDemoDebug(null);
    try {
      const response = await fetch("/api/demo-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: demoCode.trim() }),
      });
      const contentType = response.headers.get("content-type");
      let payload: { ok?: boolean; debug?: DemoAccessDebug; error?: string; message?: string } | null = null;
      let rawText: string | null = null;

      if (contentType?.includes("application/json")) {
        payload = (await response.json()) as { ok?: boolean; debug?: DemoAccessDebug; error?: string; message?: string };
      } else {
        rawText = await response.text();
      }

      if (!response.ok) {
        setDemoDebug({
          ...(payload?.debug ?? {}),
          status: response.status,
          contentType,
          rawText,
          error: payload?.error ?? null,
          message: payload?.message ?? null,
        });
        setDemoError("Access code not recognised.");
        setDemoSubmitting(false);
        return;
      }

      activateDemoPreviewMode();
      setActiveStudentProfile("demo-preview", null, {
        displayName: "Demo Preview",
        yearLevel: "Prep",
      });
      markActiveStudentIntroSeen("demo-preview");
      clearScopedProgress("demo-preview");
      clearScopedProgramStore("demo-preview");
      writeProgress({
        year: "Prep",
        scorePercent: 0,
        status: "ASSIGNED_PROGRAM",
        placementComplete: true,
        assignedWeek: 1,
        requiredWeeks: [],
        optionalWeeks: [],
        unlockedLegends: [],
      });
      setShowDemoModal(false);
      setDemoCode("");
      const search = new URLSearchParams(window.location.search);
      const requestedReturn = search.get("returnTo");
      let demoDestination = "/realms";
      if (requestedReturn?.startsWith("/") && !requestedReturn.startsWith("//")) {
        const candidate = new URL(requestedReturn, window.location.origin);
        const selectedLevel = tryNormalizeStarpathLevel(candidate.searchParams.get("level"));
        if (
          candidate.origin === window.location.origin &&
          candidate.pathname === "/starpath" &&
          candidate.searchParams.get("realm_id") === STARPATH_REALM_ID &&
          candidate.searchParams.get("destination") === "world" &&
          selectedLevel
        ) {
          demoDestination = buildStarpathWorldHref({ selectedLevel });
        }
      }
      router.push(demoDestination);
    } catch {
      setDemoError("Demo access could not be activated.");
    } finally {
      setDemoSubmitting(false);
    }
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
        {demoAccessEnabled ? (
          <>
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => registerSecretDoorTap("click")}
              onPointerDown={() => registerSecretDoorTap("pointer")}
              onTouchStart={() => registerSecretDoorTap("touch")}
              className="absolute z-10 cursor-default bg-transparent"
              style={{
                left: "50.5%",
                top: "64%",
                width: "11rem",
                height: "15rem",
                opacity: 0,
                transform: "translate(-50%, -50%)",
                touchAction: "manipulation",
                pointerEvents: "auto",
              }}
            >
              Hidden demo access door hotspot
            </button>
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onClick={() => registerSecretDoorTap("click")}
              onPointerDown={() => registerSecretDoorTap("pointer")}
              onTouchStart={() => registerSecretDoorTap("touch")}
              className="absolute z-10 cursor-default bg-transparent"
              style={{
                left: "52%",
                top: "48%",
                width: "18rem",
                height: "30rem",
                opacity: 0,
                transform: "translate(-50%, -50%)",
                touchAction: "manipulation",
                pointerEvents: "auto",
              }}
            >
              Hidden demo access tower hotspot
            </button>
          </>
        ) : null}
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
                <input disabled={studentBootstrapState === "loading"} value={studentCode} onChange={(e) => setStudentCode(e.target.value)} placeholder="e.g. K9F2Q" className={`${inputCls} tracking-[0.3em] text-center uppercase font-semibold disabled:opacity-60`} />
              </InputField>
            </label>
            <label className="grid gap-1.5">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest pl-1">Username</span>
              <InputField icon={<User size={15} />}>
                <input disabled={studentBootstrapState === "loading"} value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter your username" className={`${inputCls} disabled:opacity-60`} />
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
                  disabled={studentBootstrapState === "loading"}
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
              disabled={studentBootstrapState === "loading"}
              className="mt-1 w-full py-4 rounded-2xl font-black text-lg text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] active:scale-[0.97] cursor-pointer disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
              style={{
                background: "linear-gradient(135deg, hsl(0 0% 22%), hsl(0 0% 15%))",
                boxShadow: "0 6px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
              type="button"
            >
              {studentBootstrapState === "loading" ? "Loading your progress..." : "Enter the Tower"}
            </button>
          </div>
        ) : passwordRecoveryMode ? (
          <div className="grid gap-4">
            <div
              className="rounded-2xl px-4 py-3 text-sm font-semibold text-white/80"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              Enter a new password for your account.
            </div>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest pl-1">New Password</span>
              <InputField icon={<Lock size={15} />}>
                <input
                  value={recoveryPassword}
                  onChange={(e) => setRecoveryPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  type="password"
                  className={inputCls}
                />
              </InputField>
            </label>
            <label className="grid gap-1.5">
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest pl-1">Confirm Password</span>
              <InputField icon={<Lock size={15} />}>
                <input
                  value={recoveryConfirmPassword}
                  onChange={(e) => setRecoveryConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  type="password"
                  className={inputCls}
                />
              </InputField>
            </label>

            {recoveryError && (
              <p className="text-sm text-red-300 font-bold text-center rounded-xl py-2" style={{ background: "rgba(220,50,50,0.12)" }}>{recoveryError}</p>
            )}
            {recoverySuccess && (
              <p className="text-sm text-emerald-200 font-bold text-center rounded-xl py-2" style={{ background: "rgba(40,180,100,0.12)" }}>{recoverySuccess}</p>
            )}

            <button
              onClick={handleRecoveredPasswordUpdate}
              disabled={recoverySaving}
              className="mt-1 w-full py-4 rounded-2xl font-black text-lg text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] active:scale-[0.97] disabled:opacity-50 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, hsl(0 0% 22%), hsl(0 0% 15%))",
                boxShadow: "0 6px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
              type="button"
            >
              {recoverySaving ? "Saving..." : "Set New Password"}
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

            {teacherMode === "login" && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={handleTeacherPasswordReset}
                  disabled={teacherResetLoading}
                  className="text-xs font-bold tracking-wide text-amber-200/90 hover:text-amber-100 disabled:opacity-50 transition"
                >
                  {teacherResetLoading ? "Sending reset link..." : "Forgot password?"}
                </button>
              </div>
            )}

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
            {teacherResetNotice && (
              <p className="text-sm text-emerald-200 font-bold text-center rounded-xl py-2" style={{ background: "rgba(40,180,100,0.12)" }}>{teacherResetNotice}</p>
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

      {showDemoModal ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 px-6">
          <div className="w-full max-w-md rounded-[28px] border border-white/12 bg-[#111827]/95 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="mb-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-amber-300/70">Demo Access</div>
              <h2 className="mt-2 text-2xl font-black text-white">Enter access code</h2>
            </div>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-bold text-white/45 uppercase tracking-widest pl-1">Access Code</span>
              <input
                value={demoCode}
                onChange={(event) => setDemoCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void handleDemoAccess();
                }}
                placeholder="Enter code"
                className={inputCls}
              />
            </label>

            {demoError ? (
              <div className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm font-bold text-red-200">
                <div>{demoError}</div>
                {demoDebug ? (
                  <div className="mt-2 space-y-1 text-[11px] font-semibold tracking-[0.04em] text-red-100/80">
                    <div>status: {demoDebug.status ?? 0}</div>
                    <div>content type: {demoDebug.contentType ?? "null"}</div>
                    <div>feature enabled: {String(demoDebug.featureEnabledRaw ?? "null")}</div>
                    <div>has expected code: {String(Boolean(demoDebug.hasExpectedCode))}</div>
                    <div>expected length: {demoDebug.expectedCodeLength ?? 0}</div>
                    <div>submitted length: {demoDebug.submittedCodeLength ?? 0}</div>
                    <div>submitted trimmed length: {demoDebug.submittedTrimmedLength ?? 0}</div>
                    <div>trimmed match: {String(Boolean(demoDebug.trimmedComparisonPasses))}</div>
                    {demoDebug.error ? <div>error: {demoDebug.error}</div> : null}
                    {demoDebug.message ? <div>message: {demoDebug.message}</div> : null}
                    {demoDebug.rawText ? <div>raw: {demoDebug.rawText.slice(0, 120)}</div> : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDemoModal(false);
                  setDemoCode("");
                  setDemoError(null);
                  setDemoDebug(null);
                }}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDemoAccess()}
                disabled={demoSubmitting || !demoCode.trim()}
                className="flex-1 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {demoSubmitting ? "Checking..." : "Unlock"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
