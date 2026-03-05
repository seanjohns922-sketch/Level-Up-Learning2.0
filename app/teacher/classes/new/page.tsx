"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";

export default function NewClassPage() {
  const router = useRouter();
  const [className, setClassName] = useState("");
  const [yearLevel, setYearLevel] = useState("1");
  const [creating, setCreating] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
    });
  }, []);

  async function handleCreate() {
    if (!className.trim()) return;

    setCreating(true);
    setError("");

    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user) {
        setError("Please log in again.");
        return;
      }

      const displayName =
        (user.user_metadata?.display_name as string | undefined) ??
        user.email ??
        "Teacher";

      const { error: teacherErr } = await supabase.from("teachers").upsert({
        id: user.id,
        email: user.email ?? null,
        display_name: displayName,
      });

      if (teacherErr) {
        setError(`Couldn't create teacher profile: ${teacherErr.message}`);
        return;
      }

      const { data: code, error: codeErr } = await supabase.rpc("generate_class_code");
      if (codeErr || !code) {
        setError(`Couldn't generate class code: ${codeErr?.message ?? "unknown error"}`);
        return;
      }

      const { error: classErr } = await supabase.from("classes").insert({
        name: className.trim(),
        year_level: yearLevel,
        class_code: code,
        teacher_id: user.id,
      });

      if (classErr) {
        setError(`Couldn't create class: ${classErr.message}`);
        return;
      }

      setCreatedCode(code);

      // Generate QR
      const joinUrl = `${window.location.origin}/join?code=${code}`;
      const dataUrl = await QRCode.toDataURL(joinUrl, { width: 256, margin: 2 });
      setQrDataUrl(dataUrl);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Something went wrong";
      setError(message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbf7f1] px-6 py-10">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-6">Create a Class</h1>

        {!createdCode ? (
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow p-6 grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-bold text-gray-600">Class Name</span>
              <input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. 3/4 SJ"
                className="px-4 py-3 rounded-2xl border border-gray-200 bg-white text-lg"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-bold text-gray-600">Year Level</span>
              <select
                value={yearLevel}
                onChange={(e) => setYearLevel(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-gray-200 bg-white"
              >
                {[1, 2, 3, 4, 5, 6].map((y) => (
                  <option key={y} value={String(y)}>Year {y}</option>
                ))}
              </select>
            </label>

            {error && <p className="text-sm text-red-600 font-bold">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={creating || !className.trim()}
              className="mt-2 w-full py-3 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-black text-lg hover:bg-[#8fcea4] transition disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create Class"}
            </button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow p-6 text-center">
            <div className="text-green-600 text-lg font-bold mb-2">✅ Class Created!</div>
            <p className="text-gray-600 mb-4">Share this code or QR with your students:</p>

            <div className="text-4xl font-mono font-black tracking-[0.3em] text-gray-900 mb-6">
              {createdCode}
            </div>

            {qrDataUrl && (
              <div className="flex justify-center mb-6">
                <img src={qrDataUrl} alt="QR code to join class" className="rounded-xl" />
              </div>
            )}

            <p className="text-sm text-gray-500 mb-4">
              Students go to <span className="font-mono font-bold">/join?code={createdCode}</span>
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.push("/teacher/classes")}
                className="px-5 py-2.5 rounded-2xl bg-[#eef2f6] text-gray-700 font-bold hover:bg-white"
              >
                View Classes
              </button>
              <button
                onClick={() => {
                  setCreatedCode(null);
                  setClassName("");
                  setQrDataUrl(null);
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-bold hover:bg-[#8fcea4]"
              >
                Create Another
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => router.push("/teacher/classes")}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back to Classes
        </button>
      </div>
    </main>
  );
}
