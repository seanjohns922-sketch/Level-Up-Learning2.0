"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

  const [studentCode, setStudentCode] = useState("");
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

    await supabase.from("teachers").upsert({
      id: userId,
      email: teacherEmail,
      display_name: teacherName.trim() || teacherEmail,
    });

    if (className.trim()) {
      const { data: code } = await supabase.rpc("generate_class_code");
      if (code) {
        await supabase.from("classes").insert({
          name: className.trim(),
          year_level: "1",
          class_code: code,
          teacher_id: userId,
        });
        setCreatedCode(code);
        const record: ClassRecord = {
          code,
          name: className.trim(),
          teacherEmail,
          teacherName: teacherName.trim() || undefined,
          students: [],
          createdAt: new Date().toISOString(),
        };
        saveClasses({ ...classes, [code]: record });
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
    const normalizedCode = studentCode.trim().toUpperCase();
    const displayName = studentName.trim();
    const name = displayName;
    const pin = studentPin.trim();
    if (!normalizedCode || !name || pin.length !== 4) {
      setStudentError("Please enter class code, name, and 4-digit PIN.");
      return;
    }

    const { data: cls } = await supabase
      .from("classes")
      .select("id")
      .eq("class_code", normalizedCode)
      .single();

    if (!cls) {
      setStudentError("Class code not found.");
      return;
    }

    const syntheticEmail = `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.${normalizedCode.toLowerCase()}@leveluplearning.app`;
    const paddedPin = pin + "xx";
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: syntheticEmail,
      password: paddedPin,
    });

    if (signUpErr) {
      if (signUpErr.message.includes("already")) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
          email: syntheticEmail,
          password: paddedPin,
        });
        if (signInErr) {
          setStudentError("That name is taken in this class, or your PIN is wrong.");
          return;
        }
        const { data: existing } = await supabase
          .from("students")
          .select("id, class_id")
          .eq("user_id", signInData.user.id)
          .single();
        if (existing) {
          localStorage.setItem("lul_student_id", existing.id);
          localStorage.setItem("lul_class_id", existing.class_id);
          router.push("/home");
          return;
        }
      }
      setStudentError(signUpErr.message);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setStudentError("Could not create account.");
      return;
    }

    const studentId = crypto.randomUUID();
    const { data: student } = await supabase
      .from("students")
      .insert({
        id: studentId,
        class_id: cls.id,
        display_name: displayName.trim(),
        pin,
        user_id: userId,
      })
      .select()
      .single();

    if (!student) {
      setStudentError("Could not create student.");
      return;
    }

    localStorage.setItem("lul_student_id", student.id);
    localStorage.setItem("lul_class_id", cls.id);
    router.push("/home");
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-start">
      {/* Full-bleed fantasy background */}
      <div className="absolute inset-0">
        <img
          src="/images/login-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-4 pt-6 pb-10 flex flex-col items-center">
        {/* Skip to Demo */}
        <div className="w-full flex justify-end mb-2">
          <button
            onClick={() => {
              supabase.auth.signOut().then(() => router.push("/home"));
            }}
            className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur text-white/90 text-sm font-semibold hover:bg-white/30 transition"
            type="button"
          >
            Skip to Demo &rarr;
          </button>
        </div>

        {/* Title area */}
        <div className="text-center mb-6" style={{ animation: "fadeUp 0.6s ease both" }}>
          <h1
            className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg"
            style={{ fontFamily: "'Nunito', 'Avenir Next', 'Trebuchet MS', sans-serif" }}
          >
            Level Up
            <span className="block">Learning</span>
          </h1>
          <p className="text-base text-white/70 mt-2 italic">
            Climb the Tower. Master the Worlds.
            <br />
            Unlock your Legend.
          </p>
        </div>

        {/* Frosted glass card */}
        <div
          className="w-full bg-white/30 backdrop-blur-xl rounded-[28px] shadow-2xl border border-white/40 p-6 md:p-8"
          style={{ animation: "fadeUp 0.7s ease both 0.1s" }}
        >
          {/* Tab toggle */}
          <div className="flex items-center justify-center mb-5">
            <div className="inline-flex rounded-2xl bg-white/40 p-1 w-full">
              <button
                type="button"
                onClick={() => setTab("student")}
                className={[
                  "flex-1 py-2.5 rounded-xl font-bold text-sm transition",
                  tab === "student"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-700",
                ].join(" ")}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setTab("teacher")}
                className={[
                  "flex-1 py-2.5 rounded-xl font-bold text-sm transition",
                  tab === "teacher"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-700",
                ].join(" ")}
              >
                Teacher / Parent
              </button>
            </div>
          </div>

          {tab === "student" ? (
            <div className="grid gap-3">
              <p className="text-xs text-gray-600 text-center">
                Enter your class code, name &amp; PIN
              </p>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-gray-700">Class Code</span>
                <input
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  placeholder="E.G. K9F2Q"
                  className="px-4 py-3 rounded-xl border border-white/60 text-base font-semibold tracking-[0.3em] text-center uppercase bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-gray-700">Your Name</span>
                <input
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your first name"
                  className="px-4 py-3 rounded-xl border border-white/60 text-base bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-gray-700">4-Digit PIN</span>
                <div className="relative">
                  <input
                    value={studentPin}
                    onChange={(e) => setStudentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="····"
                    className="w-full px-4 py-3 rounded-xl border border-white/60 text-base tracking-[0.5em] text-center bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    type={showPin ? "text" : "password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPin ? "Hide PIN" : "Show PIN"}
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </label>

              {studentError && (
                <div className="text-sm font-bold text-red-600 text-center bg-red-50/80 rounded-lg py-1">{studentError}</div>
              )}

              <button
                onClick={handleStudentLogin}
                className="mt-1 w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-black text-lg hover:opacity-90 transition shadow-lg shadow-amber-900/20 active:scale-[0.98]"
                type="button"
              >
                Let&apos;s Go!
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              {/* Login / Signup toggle */}
              <div className="flex items-center justify-center gap-3 mb-1">
                <button
                  type="button"
                  onClick={() => setTeacherMode("login")}
                  className={[
                    "px-5 py-1.5 rounded-full font-bold text-sm transition",
                    teacherMode === "login"
                      ? "bg-white/60 text-gray-900"
                      : "text-gray-600",
                  ].join(" ")}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setTeacherMode("signup")}
                  className={[
                    "px-5 py-1.5 rounded-full font-bold text-sm transition",
                    teacherMode === "signup"
                      ? "bg-white/60 text-gray-900"
                      : "text-gray-600",
                  ].join(" ")}
                >
                  Sign Up
                </button>
              </div>

              <label className="grid gap-1">
                <span className="text-xs font-bold text-gray-700">Email</span>
                <input
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="teacher@school.edu"
                  className="px-4 py-3 rounded-xl border border-white/60 bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold text-gray-700">Password</span>
                <input
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  placeholder="********"
                  type="password"
                  className="px-4 py-3 rounded-xl border border-white/60 bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                />
              </label>

              {teacherMode === "signup" && (
                <>
                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-gray-700">Teacher Name (optional)</span>
                    <input
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="Ms Johnson"
                      className="px-4 py-3 rounded-xl border border-white/60 bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs font-bold text-gray-700">Class Name (optional)</span>
                    <input
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      placeholder="3/4 SJ"
                      className="px-4 py-3 rounded-xl border border-white/60 bg-white/70 backdrop-blur focus:outline-none focus:ring-2 focus:ring-teal-400/50"
                    />
                  </label>
                </>
              )}

              {teacherError && (
                <p className="text-sm text-red-600 font-bold text-center bg-red-50/80 rounded-lg py-1">{teacherError}</p>
              )}

              <button
                onClick={teacherMode === "signup" ? handleTeacherSignup : handleTeacherLogin}
                disabled={teacherLoading}
                className="mt-1 w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-700 text-white font-black text-lg hover:opacity-90 transition shadow-lg shadow-teal-900/20 active:scale-[0.98] disabled:opacity-50"
                type="button"
              >
                {teacherLoading ? "Please wait…" : teacherMode === "signup" ? "Sign Up" : "Log In"}
              </button>

              {createdClass && (
                <div className="rounded-xl border border-teal-200/60 bg-teal-50/80 p-3 text-sm">
                  <div className="font-bold text-teal-800">Class Created</div>
                  <div className="text-teal-700">Name: {createdClass.name} · Code: {createdClass.code}</div>
                </div>
              )}
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
