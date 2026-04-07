"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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

/* ── Floating particles (client-only to avoid hydration mismatch) ── */
function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; left: string; bottom: string; size: number; opacity: number; duration: number; delay: number; drift: string }>>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 14 }, (_, i) => {
        const size = 2 + Math.random() * 3;
        return {
          id: i,
          left: `${Math.random() * 100}%`,
          bottom: `${-size}px`,
          size,
          opacity: 0.5 + Math.random() * 0.3,
          duration: 14 + Math.random() * 12,
          delay: Math.random() * 8,
          drift: `${-20 + Math.random() * 40}px`,
        };
      })
    );
  }, []);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(255,215,100,${p.opacity}), transparent)`,
            animation: `floatUp ${p.duration}s ${p.delay}s linear infinite`,
            ["--drift" as string]: p.drift,
          }}
        />
      ))}
    </div>
  );
}

/* ── Shared input wrapper (defined outside LoginPage to avoid remounts) ── */
function InputField({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 z-10">{icon}</span>
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
    const normalizedCode = studentCode.trim().toUpperCase();
    const displayName = studentName.trim();
    const name = displayName;
    const pin = studentPin.trim();
    if (!normalizedCode || !name || pin.length !== 4) { setStudentError("Please enter class code, name, and 4-digit PIN."); return; }
    const { data: cls } = await supabase.from("classes").select("id").eq("class_code", normalizedCode).single();
    if (!cls) { setStudentError("Class code not found."); return; }
    const syntheticEmail = `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.${normalizedCode.toLowerCase()}@leveluplearning.app`;
    const paddedPin = pin + "xx";
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({ email: syntheticEmail, password: paddedPin });
    if (signUpErr) {
      if (signUpErr.message.includes("already")) {
        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email: syntheticEmail, password: paddedPin });
        if (signInErr) { setStudentError("That name is taken in this class, or your PIN is wrong."); return; }
        const { data: existing } = await supabase.from("students").select("id, class_id").eq("user_id", signInData.user.id).single();
        if (existing) { localStorage.setItem("lul_student_id", existing.id); localStorage.setItem("lul_class_id", existing.class_id); router.push("/home"); return; }
      }
      setStudentError(signUpErr.message);
      return;
    }
    const userId = signUpData.user?.id;
    if (!userId) { setStudentError("Could not create account."); return; }
    const studentId = crypto.randomUUID();
    const { data: student } = await supabase.from("students").insert({ id: studentId, class_id: cls.id, display_name: displayName.trim(), pin, user_id: userId }).select().single();
    if (!student) { setStudentError("Could not create student."); return; }
    localStorage.setItem("lul_student_id", student.id);
    localStorage.setItem("lul_class_id", cls.id);
    router.push("/home");
  }

  const inputCls =
    "w-full pl-11 pr-4 py-3.5 rounded-[14px] text-[15px] text-white font-medium placeholder-white/50 bg-[rgba(255,255,255,0.08)] border border-white/20 focus:outline-none focus:border-white/40 focus:bg-[rgba(255,255,255,0.12)] transition-all duration-200";
  const innerShadow = {};
  const labelCls = "text-[12px] font-bold text-white pl-1 uppercase tracking-wider"
  const labelStyle = { textShadow: "0 1px 4px rgba(0,0,0,0.3)", fontFamily: "'Nunito', sans-serif" };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-start">
      {/* Background */}
      <div className="absolute inset-0">
        <img src="/images/login-bg.jpg" alt="" className="w-full h-full object-cover object-[center_65%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      <FloatingParticles />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[480px] mx-auto px-4 pt-8 pb-10 flex flex-col items-center">
        {/* Skip */}
        <div className="w-full flex justify-end mb-3">
          <button
            onClick={() => { supabase.auth.signOut().then(() => router.push("/home")); }}
            className="px-4 py-1.5 rounded-full text-white/70 text-xs font-semibold hover:text-white/90 transition"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
            type="button"
          >
            Skip to Demo
          </button>
        </div>

        {/* ── Portal Card ── */}
        <div
          className="w-full rounded-[22px] p-7 md:p-9"
          style={{
            background: "linear-gradient(170deg, rgba(180,200,240,0.18) 0%, rgba(200,210,240,0.12) 40%, rgba(180,190,230,0.08) 100%)",
            backdropFilter: "blur(14px) saturate(1.2)",
            WebkitBackdropFilter: "blur(14px) saturate(1.2)",
            border: "1px solid rgba(255,255,255,0.25)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.15)",
            animation: "fadeUp 0.6s ease both",
          }}
        >
          {/* Header */}
          <div className="text-center mb-5">
            <h1
              className="text-[2.2rem] font-black text-white tracking-tight leading-tight"
              style={{
                fontFamily: "'Nunito', sans-serif",
                textShadow: "0 2px 20px rgba(255,190,60,0.3), 0 1px 3px rgba(0,0,0,0.4)",
              }}
            >
              Level Up Learning
            </h1>
            <p
              className="text-sm text-white/50 mt-1 tracking-wide font-medium"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Begin your journey
            </p>
          </div>

          {/* ── Tab Toggle ── */}
          <div className="mb-5">
            <div
              className="relative flex rounded-full p-[3px]"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div
                className="absolute top-[3px] bottom-[3px] rounded-full transition-all duration-300 ease-out"
                style={{
                  width: "calc(50% - 3px)",
                  left: tab === "student" ? 3 : "calc(50%)",
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  boxShadow: "0 0 10px rgba(255,190,60,0.12)",
                }}
              />
              <button
                type="button"
                onClick={() => setTab("student")}
                className="relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-sm transition-colors duration-200"
                style={{ color: tab === "student" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)" }}
              >
                <GraduationCap size={16} strokeWidth={2.2} /> Student
              </button>
              <button
                type="button"
                onClick={() => setTab("teacher")}
                className="relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full font-bold text-sm transition-colors duration-200"
                style={{ color: tab === "teacher" ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)" }}
              >
                <Briefcase size={15} strokeWidth={2.2} /> Teacher
              </button>
            </div>
          </div>

          {/* ── Student Form ── */}
          {tab === "student" ? (
            <div className="grid gap-3">
              <label className="grid gap-1.5">
                <span className={labelCls} style={labelStyle}>Class Code</span>
                <InputField icon={<KeyRound size={16} />}>
                  <input value={studentCode} onChange={(e) => setStudentCode(e.target.value)} placeholder="e.g. K9F2Q" className={`${inputCls} tracking-[0.3em] text-center uppercase font-semibold`} style={innerShadow} />
                </InputField>
              </label>
              <label className="grid gap-1.5">
                <span className={labelCls} style={labelStyle}>Your Name</span>
                <InputField icon={<User size={16} />}>
                  <input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter your first name" className={inputCls} style={innerShadow} />
                </InputField>
              </label>
              <label className="grid gap-1.5">
                <span className={labelCls} style={labelStyle}>4-Digit PIN</span>
                <InputField icon={<Lock size={16} />}>
                  <input
                    value={studentPin}
                    onChange={(e) => setStudentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="----"
                    className={`${inputCls} tracking-[0.5em] text-center font-semibold`}
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    style={innerShadow}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition z-10"
                    aria-label={showPin ? "Hide PIN" : "Show PIN"}
                  >
                    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2">
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
                className="mt-1 w-full py-3.5 rounded-full font-black text-base text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, hsl(220 10% 18%), hsl(220 8% 28%))",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
                type="button"
              >
                Enter the Tower
              </button>
            </div>
          ) : (
            /* ── Teacher Form ── */
            <div className="grid gap-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                {(["login", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTeacherMode(m)}
                    className="px-5 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-200"
                    style={{
                      background: teacherMode === m ? "rgba(255,255,255,0.12)" : "transparent",
                      color: teacherMode === m ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
                      border: teacherMode === m ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
                    }}
                  >
                    {m === "login" ? "Log In" : "Sign Up"}
                  </button>
                ))}
              </div>

              <label className="grid gap-1.5">
                <span className={labelCls} style={labelStyle}>Email</span>
                <InputField icon={<User size={16} />}>
                  <input value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)} placeholder="teacher@school.edu" className={inputCls} style={innerShadow} />
                </InputField>
              </label>
              <label className="grid gap-1.5">
                <span className={labelCls} style={labelStyle}>Password</span>
                <InputField icon={<Lock size={16} />}>
                  <input value={teacherPassword} onChange={(e) => setTeacherPassword(e.target.value)} placeholder="********" type="password" className={inputCls} style={innerShadow} />
                </InputField>
              </label>

              {teacherMode === "signup" && (
                <>
                  <label className="grid gap-1.5">
                    <span className={labelCls} style={labelStyle}>Teacher Name</span>
                    <InputField icon={<User size={16} />}>
                      <input value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="Ms Johnson" className={inputCls} style={innerShadow} />
                    </InputField>
                  </label>
                  <label className="grid gap-1.5">
                    <span className={labelCls} style={labelStyle}>Class Name</span>
                    <InputField icon={<Briefcase size={16} />}>
                      <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="3/4 SJ" className={inputCls} style={innerShadow} />
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
                className="mt-1 w-full py-3.5 rounded-full font-black text-base text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, hsl(220 10% 18%), hsl(220 8% 28%))",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
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

          {/* Footer legend hint */}
          <p
            className="mt-5 text-center text-[10px] tracking-[0.08em] uppercase font-semibold"
            style={{ color: "rgba(255,200,100,0.4)", fontFamily: "'Quicksand', sans-serif" }}
          >
            Unlock your Level Up Legend by mastering your skills
          </p>
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
