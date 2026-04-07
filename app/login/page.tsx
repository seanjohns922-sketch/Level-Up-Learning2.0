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

/* ── Floating particle component ── */
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 8;
    const duration = 10 + Math.random() * 12;
    const size = 2 + Math.random() * 4;
    const drift = -30 + Math.random() * 60;
    return (
      <div
        key={i}
        className="absolute rounded-full pointer-events-none"
        style={{
          left: `${left}%`,
          bottom: `-${size}px`,
          width: size,
          height: size,
          background: `radial-gradient(circle, rgba(255,215,100,${0.6 + Math.random() * 0.4}), transparent)`,
          animation: `floatUp ${duration}s ${delay}s linear infinite`,
          ["--drift" as string]: `${drift}px`,
        }}
      />
    );
  });
  return <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">{particles}</div>;
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

  const inputBase =
    "w-full pl-11 pr-4 py-3.5 rounded-2xl border border-white/20 text-base bg-white/10 backdrop-blur-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/40 transition shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]";

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-start">
      <div className="absolute inset-0">
        <img
          src="/images/login-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-[center_65%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />
      </div>

      <FloatingParticles />

      <div className="relative z-10 w-full max-w-md mx-auto px-4 pt-6 pb-10 flex flex-col items-center">
        <div className="w-full flex justify-end mb-3">
          <button
            onClick={() => {
              supabase.auth.signOut().then(() => router.push("/home"));
            }}
            className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-sm font-semibold hover:bg-white/20 transition"
            type="button"
          >
            Skip to Demo &rarr;
          </button>
        </div>

        <div
          className="w-full rounded-[32px] p-6 md:p-8"
          style={{
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px) saturate(1.4)",
            WebkitBackdropFilter: "blur(20px) saturate(1.4)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow:
              "0 8px 40px rgba(0,0,0,0.35), 0 0 60px rgba(255,190,60,0.08), inset 0 1px 0 rgba(255,255,255,0.15)",
            animation: "fadeUp 0.7s ease both 0.05s",
          }}
        >
          <div className="text-center mb-5" style={{ animation: "fadeUp 0.6s ease both 0.1s" }}>
            <h1
              className="text-4xl md:text-5xl font-black text-white tracking-tight"
              style={{
                fontFamily: "'Nunito', 'Avenir Next', 'Trebuchet MS', sans-serif",
                textShadow:
                  "0 2px 16px rgba(255,190,60,0.35), 0 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              Enter the Tower
            </h1>
            <p
              className="text-sm text-white/60 mt-1.5 tracking-wide"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Begin your journey
            </p>
          </div>

          <div className="flex items-center justify-center mb-5">
            <div
              className="relative inline-flex rounded-2xl p-1 w-full"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div
                className="absolute top-1 bottom-1 rounded-xl transition-all duration-300 ease-out"
                style={{
                  width: "calc(50% - 4px)",
                  left: tab === "student" ? 4 : "calc(50% + 0px)",
                  background: "rgba(255,255,255,0.15)",
                  boxShadow: "0 0 12px rgba(255,190,60,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
              <button
                type="button"
                onClick={() => setTab("student")}
                className="relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors duration-200"
                style={{ color: tab === "student" ? "white" : "rgba(255,255,255,0.5)" }}
              >
                <span className="text-base">🎓</span> Student
              </button>
              <button
                type="button"
                onClick={() => setTab("teacher")}
                className="relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-colors duration-200"
                style={{ color: tab === "teacher" ? "white" : "rgba(255,255,255,0.5)" }}
              >
                <span className="text-base">🧑‍🏫</span> Teacher
              </button>
            </div>
          </div>

          {tab === "student" ? (
            <div className="grid gap-3.5">
              <p className="text-xs text-white/50 text-center tracking-wide">
                Enter your class code, name & PIN
              </p>

              <label className="grid gap-1.5">
                <span className="text-xs font-bold text-white/70 pl-1">Class Code</span>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">🔑</span>
                  <input
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="E.G. K9F2Q"
                    className={`${inputBase} tracking-[0.3em] text-center uppercase font-semibold`}
                  />
                </div>
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs font-bold text-white/70 pl-1">Your Name</span>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">👤</span>
                  <input
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Enter your first name"
                    className={inputBase}
                  />
                </div>
              </label>

              <label className="grid gap-1.5">
                <span className="text-xs font-bold text-white/70 pl-1">4-Digit PIN</span>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">🔒</span>
                  <input
                    value={studentPin}
                    onChange={(e) => setStudentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="····"
                    className={`${inputBase} tracking-[0.5em] text-center`}
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition"
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
                <div className="text-sm font-bold text-red-300 text-center bg-red-500/15 rounded-xl py-2">{studentError}</div>
              )}

              <button
                onClick={handleStudentLogin}
                className="group mt-1 w-full py-4 rounded-2xl font-black text-lg text-white transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, hsl(30 95% 55%), hsl(45 100% 50%), hsl(30 95% 55%))",
                  backgroundSize: "200% 200%",
                  boxShadow:
                    "0 4px 20px rgba(255,160,30,0.35), 0 0 30px rgba(255,190,60,0.15), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
                type="button"
              >
                <span className="flex items-center justify-center gap-2">
                  Enter the Tower <span className="text-xl group-hover:translate-x-0.5 transition-transform">🚀</span>
                </span>
              </button>
            </div>
          ) : (
            <div className="grid gap-3.5">
              <div className="flex items-center justify-center gap-3 mb-1">
                <button
                  type="button"
                  onClick={() => setTeacherMode("login")}
                  className="px-5 py-1.5 rounded-full font-bold text-sm transition"
                  style={{
                    background: teacherMode === "login" ? "rgba(255,255,255,0.15)" : "transparent",
                    color: teacherMode === "login" ? "white" : "rgba(255,255,255,0.5)",
                    border: teacherMode === "login" ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                  }}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setTeacherMode("signup")}
                  className="px-5 py-1.5 rounded-full font-bold text-sm transition"
                  style={{
                    background: teacherMode === "signup" ? "rgba(255,255,255,0.15)" : "transparent",
                    color: teacherMode === "signup" ? "white" : "rgba(255,255,255,0.5)",
                    border: teacherMode === "signup" ? "1px solid rgba(255,255,255,0.12)" : "1px solid transparent",
                  }}
                >
                  Sign Up
                </button>
              </div>

              <label className="grid gap-1.5">
                <span className="text-xs font-bold text-white/70 pl-1">Email</span>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">📧</span>
                  <input
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    placeholder="teacher@school.edu"
                    className={inputBase}
                  />
                </div>
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-bold text-white/70 pl-1">Password</span>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">🔒</span>
                  <input
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                    placeholder="********"
                    type="password"
                    className={inputBase}
                  />
                </div>
              </label>

              {teacherMode === "signup" && (
                <>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-bold text-white/70 pl-1">Teacher Name (optional)</span>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">👤</span>
                      <input
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        placeholder="Ms Johnson"
                        className={inputBase}
                      />
                    </div>
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-bold text-white/70 pl-1">Class Name (optional)</span>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg">🏫</span>
                      <input
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        placeholder="3/4 SJ"
                        className={inputBase}
                      />
                    </div>
                  </label>
                </>
              )}

              {teacherError && (
                <p className="text-sm text-red-300 font-bold text-center bg-red-500/15 rounded-xl py-2">{teacherError}</p>
              )}

              <button
                onClick={teacherMode === "signup" ? handleTeacherSignup : handleTeacherLogin}
                disabled={teacherLoading}
                className="group mt-1 w-full py-4 rounded-2xl font-black text-lg text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, hsl(30 95% 55%), hsl(45 100% 50%), hsl(30 95% 55%))",
                  backgroundSize: "200% 200%",
                  boxShadow:
                    "0 4px 20px rgba(255,160,30,0.35), 0 0 30px rgba(255,190,60,0.15), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}
                type="button"
              >
                {teacherLoading ? "Please wait…" : teacherMode === "signup" ? "Sign Up" : "Log In"}
              </button>

              {createdClass && (
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 p-3 text-sm text-emerald-200">
                  <div className="font-bold">Class Created</div>
                  <div>Name: {createdClass.name} · Code: {createdClass.code}</div>
                </div>
              )}
            </div>
          )}

          <div className="mt-5 text-center">
            <p
              className="text-[11px] tracking-wider uppercase font-semibold"
              style={{
                color: "rgba(255,190,60,0.55)",
                fontFamily: "'Quicksand', sans-serif",
              }}
            >
              ✦ Unlock your Level Up Legend by mastering your skills ✦
            </p>
          </div>
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
