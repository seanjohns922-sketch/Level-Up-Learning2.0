"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recoverInvalidRefreshToken, supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/useAuthGuard";
import QRCode from "qrcode";
import {
  SCHOOL_YEAR_LEVEL_OPTIONS,
  formatWorkingLevelOptionLabel,
  normalizeSchoolYearLabel,
  normalizeWorkingLevelLabel,
} from "@/lib/studentLevelLabel";

type AddedStudent = { name: string; pin: string; claimCode: string };

function isMissingCreateStudentRpc(message?: string | null) {
  return Boolean(message && /create_student_for_class|schema cache|could not find the function/i.test(message));
}

function generateFallbackPin(existingPins: Set<string>) {
  let nextPin = "";
  do {
    nextPin = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  } while (existingPins.has(nextPin));
  return nextPin;
}

export default function NewClassPage() {
  const router = useRouter();
  useAuthGuard();
  const [className, setClassName] = useState("");
  const [yearLevels, setYearLevels] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [createdClassId, setCreatedClassId] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Student adding state
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentSchoolYear, setNewStudentSchoolYear] = useState("");
  const [newStudentWorkingLevel, setNewStudentWorkingLevel] = useState("AUTO_PLACEMENT");
  const [newStudentPin, setNewStudentPin] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);
  const [addedStudents, setAddedStudents] = useState<AddedStudent[]>([]);
  const [studentError, setStudentError] = useState<string | null>(null);

  const yearLevelOptions = [...SCHOOL_YEAR_LEVEL_OPTIONS];

  function toggleYear(yr: string) {
    setYearLevels((prev) => prev.includes(yr) ? prev.filter((y) => y !== yr) : [...prev, yr]);
  }

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
        if (userErr) recoverInvalidRefreshToken(userErr);
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

      const insertPayload: Record<string, unknown> = {
        name: className.trim(),
        class_code: code,
        teacher_id: user.id,
      };
      if (yearLevels.length > 0) insertPayload.year_levels = yearLevels;

      let { data: insertedClass, error: classErr } = await supabase
        .from("classes")
        .insert(insertPayload)
        .select("id")
        .single();

      if (classErr && /row-level security|get_teacher_id|permission/i.test(classErr.message)) {
        const displayName =
          (user.user_metadata?.display_name as string | undefined) ??
          user.email ??
          "Teacher";

        await supabase.from("teachers").upsert(
          { id: user.id, display_name: displayName, email: user.email ?? `${user.id}@placeholder.local` },
          { onConflict: "id" },
        );

        const retry = await supabase
          .from("classes")
          .insert(insertPayload)
          .select("id")
          .single();

        classErr = retry.error;
        insertedClass = retry.data;
      }

      if (classErr) {
        setError(classErr.message);
        return;
      }

      setCreatedCode(code);
      setCreatedClassId(insertedClass?.id ?? null);

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

  async function addStudent() {
    if (!newStudentName.trim() || !createdClassId) return;
    const schoolYear = normalizeSchoolYearLabel(newStudentSchoolYear);
    const workingYear = normalizeWorkingLevelLabel(newStudentWorkingLevel === "AUTO_PLACEMENT" ? null : newStudentWorkingLevel);
    if (!schoolYear) {
      setStudentError("Please select the student's school year level.");
      return;
    }
    if (newStudentPin && !/^\d{4}$/.test(newStudentPin)) {
      setStudentError("PIN must be 4 digits.");
      return;
    }
    setStudentError(null);
    setAddingStudent(true);
    const { data, error: stuErr } = await supabase.rpc("create_student_for_class", {
      class_uuid: createdClassId,
      display_name_input: newStudentName.trim(),
      pin_input: newStudentPin || null,
    });

    let created = Array.isArray(data) ? data[0] : data;

    if (stuErr && isMissingCreateStudentRpc(stuErr.message)) {
      console.warn("[NewClassPage] create_student_for_class RPC missing, using direct insert fallback", stuErr.message);
      const existingPins = new Set(addedStudents.map((student) => student.pin));
      const fallbackPin = newStudentPin || generateFallbackPin(existingPins);
      if (existingPins.has(fallbackPin)) {
        setAddingStudent(false);
        setStudentError("That PIN is already used in this class.");
        return;
      }

      const { data: insertedStudent, error: insertError } = await supabase
        .from("students")
        .insert({
          id: crypto.randomUUID(),
          class_id: createdClassId,
          display_name: newStudentName.trim(),
          pin: fallbackPin,
        })
        .select("id, pin, qr_token")
        .single();

      if (insertError) {
        setAddingStudent(false);
        setStudentError(insertError.message);
        return;
      }

      created = {
        student_id: insertedStudent.id,
        pin: insertedStudent.pin ?? fallbackPin,
        claim_code: "Pending setup",
        qr_token: insertedStudent.qr_token ?? "",
      };
    } else if (stuErr) {
      setAddingStudent(false);
      setStudentError(stuErr.message);
      return;
    }

    setAddingStudent(false);
    if (created?.student_id) {
      await supabase
        .from("students")
        .update({
          school_year_level: schoolYear,
          working_level: workingYear,
          year_level: workingYear,
        })
        .eq("id", created.student_id);
      if (workingYear) {
        await supabase.rpc("save_student_progress_state", {
          p_student_id: created.student_id,
          p_year: workingYear,
          p_data: {
            status: "ASSIGNED_PROGRAM",
            placement_complete: true,
            week: 1,
            assigned_week: 1,
          },
        });
      }
    }
    if (created) {
      setAddedStudents((prev) => [
        ...prev,
        { name: newStudentName.trim(), pin: created.pin, claimCode: created.claim_code || "Pending setup" },
      ]);
    }
    setNewStudentName("");
    setNewStudentSchoolYear("");
    setNewStudentWorkingLevel("AUTO_PLACEMENT");
    setNewStudentPin("");
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

            <div className="grid gap-2">
              <span className="text-sm font-bold text-gray-600">
                Year Levels <span className="font-normal text-gray-400">(select all that apply)</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {yearLevelOptions.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => toggleYear(yr)}
                    className={[
                      "px-3 py-1.5 rounded-full text-sm font-bold border transition",
                      yearLevels.includes(yr)
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300 hover:text-emerald-700",
                    ].join(" ")}
                  >
                    {yr}
                  </button>
                ))}
              </div>
              {yearLevels.length > 0 && (
                <p className="text-xs text-emerald-600 font-semibold">
                  Selected: {yearLevels.join(", ")}
                </p>
              )}
            </div>

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
          <div className="grid gap-4">
            {/* Class code + QR */}
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow p-6 text-center">
              <div className="text-green-600 text-lg font-bold mb-1">Class Created!</div>
              <p className="text-gray-500 text-sm mb-4">Share this code or QR so students can join:</p>
              <div className="text-4xl font-mono font-black tracking-[0.3em] text-gray-900 mb-4">
                {createdCode}
              </div>
              {qrDataUrl && (
                <div className="flex justify-center mb-3">
                  <img src={qrDataUrl} alt="QR code to join class" className="rounded-xl w-40 h-40" />
                </div>
              )}
              <p className="text-xs text-gray-400">
                Students go to <span className="font-mono">/join?code={createdCode}</span>
              </p>
            </div>

            {/* Add students inline */}
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow p-6">
              <div className="text-sm font-black uppercase tracking-wide text-emerald-700 mb-4">
                Add Students to This Class
              </div>

              {addedStudents.length > 0 && (
                <div className="mb-4 grid gap-2">
                  {addedStudents.map((s, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-2 text-sm">
                      <span className="font-semibold text-gray-800">{s.name}</span>
                      <span className="text-gray-500 font-mono text-xs">PIN: <span className="font-black text-gray-800">{s.pin}</span></span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-2 md:grid-cols-[1fr_160px_180px_120px_auto]">
                <input
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void addStudent(); }}
                  placeholder="Student name"
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-300"
                />
                <select
                  value={newStudentSchoolYear}
                  onChange={(e) => setNewStudentSchoolYear(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-300"
                >
                  <option value="">School year…</option>
                  {yearLevelOptions.map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
                <select
                  value={newStudentWorkingLevel}
                  onChange={(e) => setNewStudentWorkingLevel(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-300"
                >
                  <option value="AUTO_PLACEMENT">Auto placement…</option>
                  {yearLevelOptions.map((yr) => (
                    <option key={yr} value={yr}>{formatWorkingLevelOptionLabel(yr)}</option>
                  ))}
                </select>
                <input
                  value={newStudentPin}
                  onChange={(e) => setNewStudentPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  onKeyDown={(e) => { if (e.key === "Enter") void addStudent(); }}
                  placeholder="PIN (opt.)"
                  inputMode="numeric"
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-300"
                />
                <button
                  type="button"
                  onClick={() => void addStudent()}
                  disabled={addingStudent || !newStudentName.trim()}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {addingStudent ? "Adding…" : "Add"}
                </button>
              </div>
              {studentError && <p className="mt-2 text-xs text-red-600 font-bold">{studentError}</p>}
            </div>

            {/* Done / Create Another */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/teacher/classes")}
                className="flex-1 py-3 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-black text-base hover:bg-[#8fcea4] transition"
              >
                Done — View Classes
              </button>
              <button
                onClick={() => {
                  setCreatedCode(null);
                  setCreatedClassId(null);
                  setClassName("");
                  setYearLevels([]);
                  setQrDataUrl(null);
                  setAddedStudents([]);
                  setNewStudentName("");
                  setNewStudentPin("");
                }}
                className="px-5 py-3 rounded-2xl bg-white border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition"
              >
                + New Class
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
