"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";
import { setActiveStudentProfile } from "@/lib/studentIdentity";

function normalizeClassCode(code: string) {
  return code.replace(/\s+/g, "").trim().toUpperCase();
}

function isMissingStudentUserIdColumn(message?: string | null) {
  return Boolean(message && /user_id.*students|students.*user_id|schema cache/i.test(message));
}

export default function JoinPageWrapper() {
  return <Suspense fallback={<div className="min-h-screen bg-[#fbf7f1] flex items-center justify-center"><p className="text-gray-400">Loading…</p></div>}><JoinPage /></Suspense>;
}

function JoinPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get("code") ?? "";

  const [classCode, setClassCode] = useState(codeFromUrl);
  const [className, setClassName] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrValue, setQrValue] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [step, setStep] = useState<"code" | "signup">(codeFromUrl ? "code" : "code");
  const [loading, setLoading] = useState(!!codeFromUrl);

  useEffect(() => {
    if (typeof window === "undefined") return;
    console.log("[JoinPage] raw URL:", window.location.href);
    console.log("[JoinPage] raw code param:", codeFromUrl);
  }, [codeFromUrl]);

  const lookupCode = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    const normalizedCode = normalizeClassCode(code);
    console.log("[JoinPage] submitted code:", code);
    console.log("[JoinPage] normalised code:", normalizedCode);
    console.log("[JoinPage] Supabase query target:", "public.classes.class_code via find_class_by_code RPC");
    const { data: lookupRows, error: queryError } = await supabase
      .rpc("find_class_by_code", { input_code: normalizedCode });
    const data = Array.isArray(lookupRows) ? lookupRows[0] ?? null : null;
    console.log("[JoinPage] Supabase query result:", data);
    console.log("[JoinPage] Supabase error:", queryError);
    if (queryError) {
      setError("Class not found. Check the code and try again.");
      setLoading(false);
      return;
    }
    if (!data) {
      setError("Class not found. Check the code and try again.");
      setLoading(false);
      return;
    }
    setClassName(data.name);
    setClassCode(data.class_code);
    setStep("signup");
    setLoading(false);
  }, []);

  useEffect(() => {
    if (codeFromUrl) void Promise.resolve().then(() => lookupCode(codeFromUrl));
  }, [codeFromUrl, lookupCode]);

  useEffect(() => {
    let mounted = true;
    if (!qrValue) {
      return () => {
        mounted = false;
      };
    }
    QRCode.toDataURL(qrValue, { width: 220, margin: 1 })
      .then((url) => {
        if (mounted) setQrDataUrl(url);
      })
      .catch(() => {
        if (mounted) setQrDataUrl("");
      });
    return () => {
      mounted = false;
    };
  }, [qrValue]);

  async function handleJoin() {
    setError("");
    const normalizedCode = normalizeClassCode(classCode);
    const cleanName = studentName.trim();
    const cleanPin = pin.trim();

    console.log("[JoinPage] submitted code:", classCode);
    console.log("[JoinPage] normalised code:", normalizedCode);

    if (!normalizedCode || !cleanName || !cleanPin) {
      setError("Please enter class code, name, and PIN.");
      return;
    }

    if (!/^\d{4}$/.test(cleanPin)) {
      setError("PIN must be 4 digits.");
      return;
    }

    setLoading(true);

    // 1) Find class
    console.log("[JoinPage] Supabase query target:", "public.classes.class_code via find_class_by_code RPC");
    const { data: lookupRows, error: classErr } = await supabase
      .rpc("find_class_by_code", { input_code: normalizedCode });
    const klass = Array.isArray(lookupRows) ? lookupRows[0] ?? null : null;

    console.log("[JoinPage] Supabase query result:", klass);
    console.log("[JoinPage] Supabase error:", classErr);

    if (classErr || !klass) {
      setError("Class code not found.");
      setLoading(false);
      return;
    }

    // 2) Create student
    const studentId = crypto.randomUUID();

    // Create a synthetic auth user for the student
    const syntheticEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")}.${normalizedCode.toLowerCase()}@leveluplearning.app`;
    const paddedPin = cleanPin + "xx";
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: syntheticEmail,
      password: paddedPin,
    });

    if (signUpErr) {
      setError(signUpErr.message);
      setLoading(false);
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setError("Could not create account.");
      setLoading(false);
      return;
    }

    let { data: student, error: studentErr } = await supabase
      .from("students")
      .insert({
        id: studentId,
        class_id: klass.id,
        display_name: cleanName,
        pin: cleanPin,
        user_id: userId,
      })
      .select("id, class_id, display_name")
      .single();

    if (studentErr && isMissingStudentUserIdColumn(studentErr.message)) {
      ({ data: student, error: studentErr } = await supabase
        .from("students")
        .insert({
          id: studentId,
          class_id: klass.id,
          display_name: cleanName,
          pin: cleanPin,
        })
        .select("id, class_id, display_name")
        .single());
    }

    if (studentErr || !student) {
      setError(studentErr?.message ?? "Could not create student.");
      setLoading(false);
      return;
    }

    // 3) Persist session locally
    setActiveStudentProfile(student.id, student.class_id);

    // 4) Create QR payload for next time
    const qrPayload = student.id;
    setQrValue(qrPayload);

    // 5) Optional event
    await supabase.from("events").insert({
      student_id: student.id,
      class_id: student.class_id,
      year_level: 1,
      event_type: "student_created",
      value: { method: "class_code_pin" },
    });

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
                  onClick={() => { setStep("code"); setClassName(null); setError(null); }}
                  className="text-xs text-blue-500 hover:underline mt-1"
                >
                  Change class
                </button>
              </div>

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
                    {showPin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
              {qrValue && (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="text-sm font-medium">Save this QR for next time</div>
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Student QR code" width={220} height={220} />
                  ) : (
                    <div className="text-xs opacity-70">Generating QR...</div>
                  )}
                  <div className="text-xs opacity-70 break-all text-center">{qrValue}</div>
                  <button onClick={() => router.push("/home")} className="btn-primary">
                    Continue
                  </button>
                </div>
              )}
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
