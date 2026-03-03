"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ACTIVE_STUDENT_KEY, clearScopedProgress } from "@/data/progress";
import { clearScopedProgramStore } from "@/lib/program-progress";
import { supabase } from "@/lib/supabase";

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

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

export default function LoginPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen bg-[#fbf7f1]" />}><LoginPage /></Suspense>;
}

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get("demo") === "1";
  const [tab, setTab] = useState<"student" | "teacher">("student");
  const [teacherMode, setTeacherMode] = useState<"login" | "signup">("login");
  const [classes, setClasses] = useState<ClassesStore>({});

  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [className, setClassName] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  const [studentCode, setStudentCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentPin, setStudentPin] = useState("");
  const [studentError, setStudentError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);

  const createdClass = createdCode ? { name: className.trim() || "Class", code: createdCode } : null;

  const classList = useMemo<ClassRecord[]>(() => [], []);
  const [teacherError, setTeacherError] = useState<string | null>(null);
  const [teacherLoading, setTeacherLoading] = useState(false);

  function saveClasses(next: ClassesStore) {
    setClasses(next);
    writeClasses(next);
  }

  function clearStudentLocalProgress() {
    if (typeof window === "undefined") return;
    clearScopedProgress();
    clearScopedProgramStore();
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("lul_week_")) localStorage.removeItem(key);
      });
    } catch {
      // ignore
    }
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

    if (signUpErr) {
      setTeacherError(signUpErr.message);
      setTeacherLoading(false);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setTeacherError("Sign up failed. Please try again.");
      setTeacherLoading(false);
      return;
    }

    // Create role + teacher record
    await supabase.from("user_roles").insert({ user_id: userId, role: "teacher" as any });
    await supabase.from("teachers").insert({
      user_id: userId,
      name: teacherName.trim() || teacherEmail,
      email: teacherEmail,
    } as any);

    // Optionally create a class if name provided
    if (className.trim()) {
      const { data: code } = await supabase.rpc("generate_class_code");
      if (code) {
        const { data: teacherId } = await supabase.rpc("get_teacher_id");
        if (teacherId) {
          await supabase.from("classes").insert({
            name: className.trim(),
            year_level: "1",
            class_code: code,
            teacher_id: teacherId,
          });
          // DB is the source of truth for class listings
          setCreatedCode(code);
        }
      }
    }

    setTeacherLoading(false);
    router.push("/teacher/dashboard");
  }

  async function handleTeacherLogin() {
    if (!teacherEmail || !teacherPassword) return;
    setTeacherError(null);
    setTeacherLoading(true);

    const { data, error: signInErr } = await supabase.auth.signInWithPassword({
      email: teacherEmail,
      password: teacherPassword,
    });

    if (signInErr) {
      setTeacherError(signInErr.message);
      setTeacherLoading(false);
      return;
    }

    if (data?.user) {
      setTeacherLoading(false);
      router.push("/teacher/dashboard");
      return;
    }

    setTeacherError("Login failed.");
    setTeacherLoading(false);
  }

  async function handleStudentLogin() {
    setStudentError(null);
    const code = studentCode.trim().toUpperCase();
    const name = studentName.trim();
    const pin = studentPin.trim();
    if (!code || !name || pin.length !== 4) {
      setStudentError("Please enter class code, name, and 4-digit PIN.");
      return;
    }

    console.log("[StudentJoin] code entered:", code);

    // 1) Look up class in Supabase — DB only, no localStorage fallback
    const { data: cls, error: clsErr } = await supabase
      .from("classes")
      .select("id, name, class_code")
      .eq("class_code", code)
      .maybeSingle();

    if (!cls) {
      console.warn("[StudentJoin] class not found for code:", code, clsErr);
      setStudentError("Class code not found. Please check with your teacher.");
      return;
    }

    console.log("[StudentJoin] class lookup result:", { id: cls.id, code: cls.class_code });

    // 2) Supabase auth: synthetic email from name + class code
    const syntheticEmail = `${name.toLowerCase().replace(/\s+/g, "")}.${code.toLowerCase()}@leveluplearning.local`;
    const paddedPin = pin + "xx"; // Pad to meet Supabase 6-char minimum

    // Try sign in first (returning student)
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password: paddedPin,
    });

    if (signInData?.user) {
      console.log("[StudentJoin] returning student signed in:", signInData.user.id);
      localStorage.setItem(ACTIVE_STUDENT_KEY, signInData.user.id);
      clearStudentLocalProgress();
      const seen = localStorage.getItem("lul_intro_seen") === "1";
      router.push(seen ? "/home" : "/onboarding/intro");
      return;
    }

    // New student - sign up
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: syntheticEmail,
      password: paddedPin,
      options: { data: { display_name: name, role: "student" } },
    });

    if (signUpErr) {
      console.error("[StudentJoin] signup error:", signUpErr.message);
      if (signUpErr.message.includes("already")) {
        setStudentError("That name is taken in this class, or your PIN is wrong.");
      } else {
        setStudentError(signUpErr.message);
      }
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setStudentError("Sign up failed. Please try again.");
      return;
    }

    // Create role + student record
    const { error: roleErr } = await supabase.from("user_roles").insert({ user_id: userId, role: "student" as any });
    const { data: insertedStudent, error: studErr } = await supabase
      .from("students")
      .insert({
        user_id: userId,
        display_name: name,
        class_id: cls.id,
        pin: pin,
      } as any)
      .select("id, class_id")
      .single();

    console.log("[StudentJoin] inserted student row:", insertedStudent, "roleErr:", roleErr, "studErr:", studErr);

    localStorage.setItem(ACTIVE_STUDENT_KEY, userId);
    clearStudentLocalProgress();
    const seen = localStorage.getItem("lul_intro_seen") === "1";
    router.push(seen ? "/levels" : "/onboarding/intro");
  }

  // Legacy localStorage flow removed — all joins now go through DB

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#fbf7f1] px-6 py-10">
      <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#efe7d8] opacity-70" />
      <div className="absolute top-12 right-8 h-56 w-56 rounded-full bg-[#e8f1ff] opacity-70" />
      <div className="absolute bottom-0 left-[-100px] h-80 w-80 rounded-full bg-[#f1f7ee] opacity-70" />

      <div className="absolute left-10 top-28 h-3 w-3 rounded-full bg-[#d7c9b3]" />
      <div className="absolute right-28 top-40 h-2.5 w-2.5 rounded-full bg-[#e6cfa7]" />
      <div className="absolute left-16 bottom-40 h-4 w-4 rounded-full bg-[#cfe3cf]" />
      <div className="absolute right-16 bottom-28 h-3 w-3 rounded-full bg-[#f0d7b1]" />

      <div className="relative max-w-4xl mx-auto">
        <div
          className="text-center mb-8"
          style={{ animation: "fadeUp 0.6s ease both" }}
        >
          <h1
            className="text-5xl md:text-6xl font-black text-[#1f2937] tracking-tight"
            style={{ fontFamily: "'Nunito', 'Avenir Next', 'Trebuchet MS', sans-serif" }}
          >
            Level Up
            <span className="block">Learning</span>
          </h1>
          <p className="text-lg text-gray-500 mt-3">
            Sign in to start your adventure
          </p>
          {isDemoMode && (
            <button
              onClick={() => {
                supabase.auth.signOut().then(() => {
                  const seen = localStorage.getItem("lul_intro_seen") === "1";
                  router.push(seen ? "/home" : "/onboarding/intro");
                });
              }}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#eef2f6] text-gray-600 font-semibold hover:bg-white shadow-sm"
              type="button"
            >
              Skip to Demo &rarr;
            </button>
          )}
        </div>

        <div
          className="bg-white/80 backdrop-blur rounded-[28px] shadow-xl border border-white p-6 md:p-8"
          style={{ animation: "fadeUp 0.7s ease both 0.1s" }}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex rounded-2xl bg-[#edf1f4] p-1 w-full max-w-lg">
              <button
                type="button"
                onClick={() => setTab("student")}
                className={[
                  "flex-1 py-2 rounded-xl font-bold",
                  tab === "student"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500",
                ].join(" ")}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setTab("teacher")}
                className={[
                  "flex-1 py-2 rounded-xl font-bold",
                  tab === "teacher"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500",
                ].join(" ")}
              >
                Teacher / Parent
              </button>
            </div>
          </div>

          {tab === "student" ? (
            <div className="grid gap-4 max-w-xl mx-auto">
              <p className="text-sm text-gray-500 text-center">
                Enter your class code, name &amp; PIN - new accounts are created automatically!
              </p>

              <label className="grid gap-1">
                <span className="text-sm font-bold text-gray-600">Class Code</span>
                <input
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="E.G. K9F2Q"
                  className="px-4 py-4 rounded-2xl border border-gray-200 text-lg font-semibold tracking-[0.4em] text-center uppercase bg-white"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-bold text-gray-600">Your Name</span>
                <input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your first name"
                  className="px-4 py-4 rounded-2xl border border-gray-200 text-lg bg-white"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-bold text-gray-600">4-Digit PIN</span>
                <div className="relative">
                  <input
                    value={studentPin}
                    onChange={(e) => setStudentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="...."
                    className="w-full px-4 py-4 rounded-2xl border border-gray-200 text-lg tracking-[0.6em] text-center bg-white"
                    type={showPin ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPin ? "Hide PIN" : "Show PIN"}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </label>

              {studentError ? (
                <div className="text-sm font-bold text-red-600 text-center">{studentError}</div>
              ) : null}

              <button
                onClick={handleStudentLogin}
                className="mt-2 w-full py-4 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-black text-xl hover:bg-[#8fcea4] transition shadow-sm"
                type="button"
              >
                Let's Go!
              </button>
            </div>
          ) : (
            <div className="grid gap-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setTeacherMode("login")}
                  className={[
                    "px-6 py-2 rounded-full font-bold",
                    teacherMode === "login"
                      ? "bg-[#e8f1ff] text-[#2b4b7b]"
                      : "text-gray-500",
                  ].join(" ")}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setTeacherMode("signup")}
                  className={[
                    "px-6 py-2 rounded-full font-bold",
                    teacherMode === "signup"
                      ? "bg-[#e8f1ff] text-[#2b4b7b]"
                      : "text-gray-500",
                  ].join(" ")}
                >
                  Sign Up
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <label className="grid gap-1">
                  <span className="text-sm font-bold text-gray-600">Email</span>
                  <input
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="teacher@school.edu"
                    className="px-4 py-4 rounded-2xl border border-gray-200 bg-white"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm font-bold text-gray-600">Password</span>
                  <input
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="********"
                    type="password"
                    className="px-4 py-4 rounded-2xl border border-gray-200 bg-white"
                  />
                </label>
              </div>

              {teacherMode === "signup" ? (
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="grid gap-1">
                    <span className="text-sm font-bold text-gray-600">Teacher Name (optional)</span>
                    <input
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="Ms Johnson"
                      className="px-4 py-4 rounded-2xl border border-gray-200 bg-white"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm font-bold text-gray-600">Class Name (optional)</span>
                    <input
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="3/4 SJ"
                      className="px-4 py-4 rounded-2xl border border-gray-200 bg-white"
                    />
                  </label>
                </div>
              ) : null}

              {teacherError && (
                <p className="text-sm text-red-600 font-bold text-center">{teacherError}</p>
              )}

              <button
                onClick={teacherMode === "signup" ? handleTeacherSignup : handleTeacherLogin}
                disabled={teacherLoading}
                className="mt-2 w-full py-4 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-black text-lg hover:bg-[#8fcea4] transition disabled:opacity-50"
                type="button"
              >
                {teacherLoading ? "Please wait…" : teacherMode === "signup" ? "Sign Up" : "Sign In"}
              </button>

              {createdClass ? (
                <div className="rounded-2xl border border-[#cfe1ff] bg-[#eef4ff] p-4">
                  <div className="text-sm font-bold text-[#2b4b7b]">Class Created</div>
                  <div className="text-sm text-[#2b4b7b]">Name: {createdClass.name}</div>
                  <div className="text-sm text-[#2b4b7b]">Code: {createdClass.code}</div>
                </div>
              ) : null}

              {classList.length ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="text-sm font-bold text-gray-700 mb-2">Your Classes</div>
                  <div className="grid gap-3">
                    {classList.map((cls) => (
                      <div
                        key={cls.code}
                        className="rounded-xl border border-gray-200 p-3"
                      >
                        <div className="font-bold text-gray-900">{cls.name}</div>
                        <div className="text-xs text-gray-500">Code: {cls.code}</div>
                        <div className="mt-2 text-xs font-semibold text-gray-600">
                          Students: {cls.students.length}
                        </div>
                        <div className="mt-2 grid gap-2">
                          {cls.students.map((s) => (
                            <div
                              key={s.id}
                              className="flex items-center justify-between text-xs text-gray-600"
                            >
                              <div>{s.firstName}</div>
                              <div>{s.progressPercent}% - Week {s.currentWeek}</div>
                            </div>
                          ))}
                          {cls.students.length === 0 ? (
                            <div className="text-xs text-gray-400">No students yet.</div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
