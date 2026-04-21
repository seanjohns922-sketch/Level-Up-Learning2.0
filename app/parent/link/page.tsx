"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setActiveStudentProfile } from "@/lib/studentIdentity";

type ClaimedStudent = {
  student_id: string;
  display_name: string;
  class_id: string | null;
  class_name: string | null;
  link_status: string;
};

export default function ParentLinkPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [claimCode, setClaimCode] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState<ClaimedStudent | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(Boolean(data.user));
      setLoading(false);
    });
  }, []);

  async function authenticate() {
    if (!email.trim() || !password) return;
    setWorking(true);
    setError(null);
    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { data: { role: "parent" } },
          })
        : await supabase.auth.signInWithPassword({ email: email.trim(), password });

    setWorking(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setHasSession(true);
  }

  async function linkProfile() {
    const cleanCode = claimCode.trim().toUpperCase();
    if (!cleanCode) return;

    setWorking(true);
    setError(null);
    const { data, error: claimErr } = await supabase.rpc("claim_student_profile", {
      claim_code_input: cleanCode,
    });
    setWorking(false);

    if (claimErr) {
      setError(claimErr.message);
      return;
    }

    const row = (Array.isArray(data) ? data[0] : data) as ClaimedStudent | null;
    if (!row) {
      setError("No student found for that claim code.");
      return;
    }

    setActiveStudentProfile(row.student_id, row.class_id);
    setClaimed(row);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf7f1] flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf7f1] px-6 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-white bg-white/85 p-6 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-black text-gray-900">Link School Profile</h1>
          <p className="mt-2 text-sm text-gray-500">
            Use the claim code from your teacher to connect school and home progress.
          </p>
        </div>

        {!hasSession ? (
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1">
              {(["signup", "login"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-black",
                    mode === option ? "bg-white text-gray-900 shadow-sm" : "text-gray-500",
                  ].join(" ")}
                >
                  {option === "signup" ? "Create parent login" : "I have a login"}
                </button>
              ))}
            </div>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Parent email"
              type="email"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-gray-900"
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-gray-900"
            />
            <button
              type="button"
              onClick={authenticate}
              disabled={working || !email.trim() || !password}
              className="rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white disabled:bg-gray-300"
            >
              {working ? "Working…" : mode === "signup" ? "Create Account" : "Log In"}
            </button>
          </div>
        ) : claimed ? (
          <div className="rounded-2xl bg-emerald-50 p-5 text-center">
            <div className="text-sm font-black uppercase tracking-wide text-emerald-700">Home linked</div>
            <div className="mt-2 text-2xl font-black text-gray-900">{claimed.display_name}</div>
            {claimed.class_name ? <p className="mt-1 text-sm text-gray-500">{claimed.class_name}</p> : null}
            <button
              type="button"
              onClick={() => router.push("/home")}
              className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white"
            >
              View Learning Journey
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            <label className="grid gap-1">
              <span className="text-sm font-bold text-gray-600">Claim code</span>
              <input
                value={claimCode}
                onChange={(event) => setClaimCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))}
                placeholder="E.G. A1B2C3D4"
                className="rounded-2xl border border-gray-200 px-4 py-4 text-center font-mono text-xl font-black tracking-[0.2em] text-gray-900"
              />
            </label>
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
              This links your home account to the same student profile used at school.
            </p>
            <button
              type="button"
              onClick={linkProfile}
              disabled={working || claimCode.trim().length < 4}
              className="rounded-2xl bg-emerald-600 px-5 py-3 font-black text-white disabled:bg-gray-300"
            >
              {working ? "Linking…" : "Link Profile"}
            </button>
          </div>
        )}

        {error ? <p className="mt-4 text-center text-sm font-bold text-red-600">{error}</p> : null}
      </div>
    </main>
  );
}
