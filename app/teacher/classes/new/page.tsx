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
  const yearLevelOptions = [
    { value: 1, label: "Year 1" },
    { value: 2, label: "Year 2" },
    { value: 3, label: "Year 3" },
    { value: 4, label: "Year 4" },
    { value: 5, label: "Year 5" },
    { value: 6, label: "Year 6" },
  ];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
    });
  }, []);

  function generateLocalClassCode(length = 5) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < length; i += 1) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  async function handleCreate() {
    if (!className.trim()) return;

    setCreating(true);
    setError("");

    try {
      const { data: auth, error: userErr } = await supabase.auth.getUser();
      if (userErr || !auth?.user) {
        setError("Please log in again.");
        return;
      }

      const user = auth.user;

      let code = "";
      const { data: rpcCode, error: codeErr } = await supabase.rpc("generate_class_code");
      if (codeErr || !rpcCode) {
        console.error("[create-class] generate_class_code failed, using local fallback", codeErr);
        code = generateLocalClassCode();
      } else {
        code = rpcCode;
      }

      let { error: classErr } = await supabase.from("classes").insert({
        name: className.trim(),
        year_level: yearLevel,
        class_code: code,
        teacher_id: user.id,
      });

      if (classErr && /row-level security|get_teacher_id|permission/i.test(classErr.message)) {
        const displayName =
          (user.user_metadata?.display_name as string | undefined) ??
          user.email ??
          "Teacher";

        await supabase
          .from("teachers")
          .upsert(
            {
              id: user.id,
              user_id: user.id,
              name: displayName,
              email: user.email ?? `${user.id}@placeholder.local`,
            },
            { onConflict: "user_id" },
          );

        await supabase.from("teachers").upsert({
          id: user.id,
          display_name: displayName,
          email: user.email ?? `${user.id}@placeholder.local`,
        });

        const retry = await supabase.from("classes").insert({
          name: className.trim(),
          year_level: yearLevel,
          class_code: code,
          teacher_id: user.id,
        });

        classErr = retry.error;
      }

      if (classErr) {
        setError(classErr.message);
        return;
      }

      setCreatedCode(code);

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
                {yearLevelOptions.map((option) => (
                  <option key={option.value} value={String(option.value)}>
                    {option.label}
                  </option>
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
