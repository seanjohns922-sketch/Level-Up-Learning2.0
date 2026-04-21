"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { switchActiveStudentProfile } from "@/lib/studentIdentity";

export default function StudentQRPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbf7f1] flex items-center justify-center">
          <p className="text-gray-400">Loading…</p>
        </div>
      }
    >
      <StudentQRPage />
    </Suspense>
  );
}

function StudentQRPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [className, setClassName] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);

  const lookupStudent = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.rpc("lookup_student_by_qr", { token });
    if (!data || (Array.isArray(data) && data.length === 0)) {
      setError("We couldn't find your account. Please ask your teacher for a new card.");
      setLoading(false);
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    setStudentName(row.display_name);
    setClassName(row.class_name);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (!token) {
      queueMicrotask(() => {
        setLoading(false);
        setError("No QR token found. Please scan your card again.");
      });
      return;
    }
    void Promise.resolve().then(() => lookupStudent());
  }, [lookupStudent, token]);

  async function handlePinSubmit() {
    if (locked) return;
    setError(null);

    if (pin.length !== 4) {
      setError("Enter your 4-digit PIN.");
      return;
    }

    setLoggingIn(true);

    const { data: verifyData } = await supabase.rpc("verify_student_pin", {
      token,
      pin_input: pin,
    });

    const row = Array.isArray(verifyData) ? verifyData[0] : verifyData;
    if (!row?.student_id) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLocked(true);
        setError("Too many attempts. Please wait 30 seconds and try again.");
        setTimeout(() => {
          setLocked(false);
          setAttempts(0);
          setError(null);
        }, 30000);
      } else {
        setError("That PIN doesn't match. Try again.");
      }
      setLoggingIn(false);
      return;
    }

    if (row.user_id && row.class_code) {
      const syntheticEmail = `${row.display_name.toLowerCase().replace(/\s+/g, "")}.${row.class_code.toLowerCase()}@leveluplearning.local`;
      const paddedPin = pin + "xx";
      await supabase.auth.signInWithPassword({ email: syntheticEmail, password: paddedPin });
    }

    // Clear old progress, set active student profile id.
    switchActiveStudentProfile(row.student_id);

    // Show welcome message
    setWelcomeName(row.display_name);
    setTimeout(() => {
      router.push("/home");
    }, 1500);
  }

  // Welcome transition screen
  if (welcomeName) {
    return (
      <main className="min-h-screen bg-[#fbf7f1] flex items-center justify-center p-6">
        <div className="text-center" style={{ animation: "fadeUp 0.5s ease both" }}>
          <div className="text-5xl mb-4">🚀</div>
          <h1
            className="text-3xl font-black text-gray-900"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Welcome, {welcomeName}!
          </h1>
          <p className="text-gray-500 mt-2">Loading your dashboard…</p>
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf7f1] flex items-center justify-center">
        <p className="text-gray-400 text-lg">Looking up your account…</p>
      </main>
    );
  }

  if (!studentName) {
    return (
      <main className="min-h-screen bg-[#fbf7f1] flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">Card Not Found</h1>
          <p className="text-gray-500 mb-6">{error || "We couldn't find your account."}</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-bold hover:bg-[#8fcea4] transition"
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf7f1] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8" style={{ animation: "fadeUp 0.5s ease both" }}>
          <div className="text-5xl mb-3">👋</div>
          <h1
            className="text-3xl font-black text-gray-900"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Welcome back, {studentName}
          </h1>
          <p className="text-gray-500 mt-2">
            Enter your 4-digit PIN to start your learning adventure.
          </p>
          {className && (
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              {className}
            </span>
          )}
        </div>

        <div
          className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow-xl p-6 grid gap-4"
          style={{ animation: "fadeUp 0.6s ease both 0.1s" }}
        >
          <label className="grid gap-1">
            <span className="text-sm font-bold text-gray-600">Your PIN</span>
            <div className="relative">
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="····"
                className="w-full px-4 py-5 rounded-2xl border border-gray-200 text-2xl tracking-[0.8em] text-center bg-white font-bold"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                autoFocus
                disabled={locked}
                onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
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

          {error && (
            <p className="text-sm font-bold text-red-600 text-center">{error}</p>
          )}

          <button
            onClick={handlePinSubmit}
            disabled={loggingIn || locked}
            className="w-full py-4 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-black text-xl hover:bg-[#8fcea4] transition disabled:opacity-50"
            type="button"
          >
            {loggingIn ? "Signing in…" : "Start Learning 🚀"}
          </button>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            ← Use class code instead
          </button>
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
