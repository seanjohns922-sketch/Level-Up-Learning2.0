"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ACTIVE_STUDENT_KEY, clearScopedProgress } from "@/data/progress";
import { clearScopedProgramStore } from "@/lib/program-progress";
import { supabase } from "@/lib/supabase";

export default function JoinPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen bg-[#fbf7f1] flex items-center justify-center"><p className="text-gray-400">Loading…</p></div>}><JoinPage /></Suspense>;
}

function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code") ?? "";

  const [classCode, setClassCode] = useState(codeFromUrl);
  const [className, setClassName] = useState<string | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"code" | "signup">(codeFromUrl ? "code" : "code");
  const [loading, setLoading] = useState(!!codeFromUrl);

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

  useEffect(() => {
    if (codeFromUrl) lookupCode(codeFromUrl);
  }, [codeFromUrl]);

  async function lookupCode(code: string) {
    setLoading(true);
    setError(null);
    const upper = code.trim().toUpperCase();
    console.log("[JoinPage] looking up class code:", upper);
    const { data, error: lookupErr } = await supabase
      .from("classes")
      .select("id, name, class_code")
      .eq("class_code", upper)
      .maybeSingle();
    if (!data) {
      console.warn("[JoinPage] class not found:", upper, lookupErr);
      setError("Class not found. Check the code and try again.");
      setLoading(false);
      return;
    }
    console.log("[JoinPage] class lookup result:", { id: data.id, code: data.class_code });
    setClassName(data.name);
    setClassId(data.id);
    setClassCode(data.class_code);
    setStep("signup");
    setLoading(false);
  }

  async function handleJoin() {
    setError(null);
    const name = username.trim();
    const pinVal = pin.trim();
    if (!name || pinVal.length < 4) {
      setError("Enter your name and a 4-digit PIN.");
      return;
    }
    if (!classId || !classCode) {
      setError("No class selected.");
      return;
    }

    setLoading(true);

    // Create synthetic email from username + class code
    const syntheticEmail = `${name.toLowerCase().replace(/\s+/g, "")}.${classCode.toLowerCase()}@leveluplearning.local`;
    const paddedPin = pinVal + "xx"; // Pad to meet Supabase 6-char minimum

    // Try sign in first (returning student)
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: syntheticEmail,
      password: paddedPin,
    });

    if (signInData?.user) {
      localStorage.setItem(ACTIVE_STUDENT_KEY, signInData.user.id);
      clearStudentLocalProgress();
      router.push("/home");
      setLoading(false);
      return;
    }

    // New student - sign up
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: syntheticEmail,
      password: paddedPin,
      options: { data: { display_name: name, role: "student" } },
    });

    if (signUpErr) {
      if (signUpErr.message.includes("already")) {
        setError("That name is taken in this class. Try a different name or check your PIN.");
      } else {
        setError(signUpErr.message);
      }
      setLoading(false);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setError("Sign up failed. Please try again.");
      setLoading(false);
      return;
    }

    const { error: roleErr } = await supabase.from("user_roles").insert({ user_id: userId, role: "student" as any });
    const { data: insertedStudent, error: studErr } = await supabase
      .from("students")
      .insert({
        user_id: userId,
        display_name: name,
        class_id: classId,
        pin: pinVal,
      } as any)
      .select("id, class_id")
      .single();

    console.log("[JoinPage] inserted student row:", insertedStudent, "roleErr:", roleErr, "studErr:", studErr);

    localStorage.setItem(ACTIVE_STUDENT_KEY, userId);
    clearStudentLocalProgress();
    router.push("/levels");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#fbf7f1] px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-black text-gray-900"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Join a Class
          </h1>
          <p className="text-gray-500 mt-2">Enter your class code to get started</p>
        </div>

        <div className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow-xl p-6 grid gap-4">
          {step === "code" && (
            <>
              <label className="grid gap-1">
                <span className="text-sm font-bold text-gray-600">Class Code</span>
                <input
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  placeholder="E.G. K9F2Q"
                  className="px-4 py-4 rounded-2xl border border-gray-200 text-lg font-semibold tracking-[0.4em] text-center uppercase bg-white"
                  maxLength={8}
                />
              </label>
              {error && <p className="text-sm text-red-600 font-bold text-center">{error}</p>}
              <button
                onClick={() => lookupCode(classCode)}
                disabled={loading || classCode.trim().length < 3}
                className="w-full py-4 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-black text-lg hover:bg-[#8fcea4] transition disabled:opacity-50"
              >
                {loading ? "Looking up…" : "Find My Class"}
              </button>
            </>
          )}

          {step === "signup" && (
            <>
              <div className="text-center mb-2">
                <div className="text-sm text-gray-500">Joining</div>
                <div className="text-xl font-bold text-gray-900">{className}</div>
                <button
                  onClick={() => { setStep("code"); setClassName(null); setClassId(null); setError(null); }}
                  className="text-xs text-blue-500 hover:underline mt-1"
                >
                  Change class
                </button>
              </div>

              <label className="grid gap-1">
                <span className="text-sm font-bold text-gray-600">Your Name</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your first name"
                  className="px-4 py-4 rounded-2xl border border-gray-200 text-lg bg-white"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-bold text-gray-600">4-Digit PIN</span>
                <div className="relative">
                  <input
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="····"
                    className="w-full px-4 py-4 rounded-2xl border border-gray-200 text-lg tracking-[0.6em] text-center bg-white"
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPin ? "🙈" : "👁"}
                  </button>
                </div>
              </label>

              {error && <p className="text-sm text-red-600 font-bold text-center">{error}</p>}

              <button
                onClick={handleJoin}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-black text-xl hover:bg-[#8fcea4] transition disabled:opacity-50"
              >
                {loading ? "Joining…" : "Let's Go!"}
              </button>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </main>
  );
}
