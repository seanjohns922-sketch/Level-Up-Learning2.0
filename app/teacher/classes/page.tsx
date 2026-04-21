"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/useAuthGuard";

type ClassRow = {
  id: string;
  class_code: string;
  name: string;
  year_level: string;
  created_at: string;
};

type StudentRow = {
  id: string;
  display_name: string;
  class_id: string | null;
  pin?: string | null;
  qr_token?: string | null;
};

type StudentAccessCredentialRow = {
  student_id: string;
  credential_type: "pin" | "claim_code" | "qr_token";
  credential_secret: string;
  revoked_at: string | null;
};

type ParentStudentLinkRow = {
  student_id: string;
  status: string;
};

export default function TeacherClassesPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuthGuard();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [claimCodesByStudentId, setClaimCodesByStudentId] = useState<Record<string, string>>({});
  const [linkedStudentIds, setLinkedStudentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [newStudentNames, setNewStudentNames] = useState<Record<string, string>>({});
  const [newStudentPins, setNewStudentPins] = useState<Record<string, string>>({});
  const [creatingStudentForClass, setCreatingStudentForClass] = useState<string | null>(null);
  const [lastCreatedLogin, setLastCreatedLogin] = useState<{
    classId: string;
    name: string;
    pin: string;
    claimCode: string;
  } | null>(null);

  const loadClasses = useCallback(async (teacherId: string) => {
    const { data: cls } = await supabase
      .from("classes")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    setClasses(cls ?? []);
    if (cls && cls.length > 0) {
      const classIds = cls.map((c) => c.id);
      const { data: studs } = await supabase
        .from("students")
        .select("*")
        .in("class_id", classIds);
      const loadedStudents = (studs ?? []) as StudentRow[];
      setStudents(loadedStudents);

      const studentIds = loadedStudents.map((student) => student.id);
      if (studentIds.length > 0) {
        const [{ data: links }, { data: credentials }] = await Promise.all([
          supabase
            .from("parent_student_links")
            .select("student_id,status")
            .in("student_id", studentIds),
          supabase
            .from("student_access_credentials")
            .select("student_id,credential_type,credential_secret,revoked_at")
            .eq("credential_type", "claim_code")
            .is("revoked_at", null)
            .in("student_id", studentIds),
        ]);

        setLinkedStudentIds(
          new Set(
            ((links ?? []) as ParentStudentLinkRow[])
              .filter((link) => link.status === "active")
              .map((link) => link.student_id)
          )
        );
        setClaimCodesByStudentId(
          Object.fromEntries(
            ((credentials ?? []) as StudentAccessCredentialRow[]).map((credential) => [
              credential.student_id,
              credential.credential_secret,
            ])
          )
        );
      } else {
        setLinkedStudentIds(new Set());
        setClaimCodesByStudentId({});
      }
    } else {
      setStudents([]);
      setLinkedStudentIds(new Set());
      setClaimCodesByStudentId({});
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading || !authUser) return;
    void Promise.resolve().then(() => loadClasses(authUser.id));
  }, [authLoading, authUser, loadClasses]);

  const studentsForClass = (classId: string) =>
    students.filter((s) => s.class_id === classId);

  function linkStatus(studentId: string) {
    if (linkedStudentIds.has(studentId)) return "Home linked";
    if (claimCodesByStudentId[studentId]) return "Pending link";
    return "School only";
  }

  async function addStudentToClass(classId: string) {
    const name = (newStudentNames[classId] ?? "").trim();
    const pin = (newStudentPins[classId] ?? "").trim();
    if (!name) return;
    if (pin && !/^\d{4}$/.test(pin)) {
      alert("PIN must be 4 digits.");
      return;
    }

    setCreatingStudentForClass(classId);
    const { data, error } = await supabase.rpc("create_student_for_class", {
      class_uuid: classId,
      display_name_input: name,
      pin_input: pin || null,
    });

    setCreatingStudentForClass(null);
    if (error) {
      alert(error.message);
      return;
    }

    const created = Array.isArray(data) ? data[0] : data;
    if (created) {
      setLastCreatedLogin({
        classId,
        name,
        pin: created.pin,
        claimCode: created.claim_code,
      });
    }
    setNewStudentNames((current) => ({ ...current, [classId]: "" }));
    setNewStudentPins((current) => ({ ...current, [classId]: "" }));
    if (authUser?.id) await loadClasses(authUser.id);
  }

  function copyText(value: string) {
    navigator.clipboard.writeText(value);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fbf7f1] flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf7f1] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900">My Classes</h1>
          <button
            onClick={() => router.push("/teacher/classes/new")}
            className="px-5 py-2.5 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-bold hover:bg-[#8fcea4] transition"
          >
            + New Class
          </button>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No classes yet.</p>
            <button
              onClick={() => router.push("/teacher/classes/new")}
              className="px-6 py-3 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-bold"
            >
              Create Your First Class
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {classes.map((cls) => {
              const studs = studentsForClass(cls.id);
              return (
                <div
                  key={cls.id}
                  className="bg-white/80 backdrop-blur rounded-2xl border border-white shadow p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{cls.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Code: <span className="font-mono font-bold tracking-wider">{cls.class_code}</span>
                        {" · "}Year {cls.year_level}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-500">
                      {studs.length} student{studs.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {studs.length > 0 && (
                    <div className="mt-4 grid gap-2">
                      {studs.map((s) => (
                        <div
                          key={s.id}
                          className="grid gap-2 text-sm px-3 py-3 bg-gray-50 rounded-xl md:grid-cols-[1fr_auto]"
                        >
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-gray-700">{s.display_name}</span>
                              <span
                                className={[
                                  "rounded-full px-2 py-0.5 text-[11px] font-black",
                                  linkedStudentIds.has(s.id)
                                    ? "bg-emerald-100 text-emerald-700"
                                    : claimCodesByStudentId[s.id]
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-500",
                                ].join(" ")}
                              >
                                {linkStatus(s.id)}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                              <span>
                                PIN: <span className="font-mono font-bold text-gray-700">{s.pin ?? "—"}</span>
                              </span>
                              <span>
                                Claim:{" "}
                                <span className="font-mono font-bold text-gray-700">
                                  {claimCodesByStudentId[s.id] ?? "—"}
                                </span>
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 md:justify-end">
                            {claimCodesByStudentId[s.id] ? (
                              <button
                                type="button"
                                onClick={() => copyText(claimCodesByStudentId[s.id])}
                                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                              >
                                Copy claim
                              </button>
                            ) : null}
                            {s.qr_token ? (
                              <button
                                type="button"
                                onClick={() => copyText(`${window.location.origin}/student?token=${s.qr_token}`)}
                                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                              >
                                Copy QR link
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4">
                    <div className="text-xs font-black uppercase tracking-wide text-emerald-700">
                      Add Student
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-[1fr_120px_auto]">
                      <input
                        value={newStudentNames[cls.id] ?? ""}
                        onChange={(event) =>
                          setNewStudentNames((current) => ({ ...current, [cls.id]: event.target.value }))
                        }
                        placeholder="Student name"
                        className="rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-300"
                      />
                      <input
                        value={newStudentPins[cls.id] ?? ""}
                        onChange={(event) =>
                          setNewStudentPins((current) => ({
                            ...current,
                            [cls.id]: event.target.value.replace(/\D/g, "").slice(0, 4),
                          }))
                        }
                        placeholder="PIN"
                        inputMode="numeric"
                        className="rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-300"
                      />
                      <button
                        type="button"
                        onClick={() => addStudentToClass(cls.id)}
                        disabled={creatingStudentForClass === cls.id || !(newStudentNames[cls.id] ?? "").trim()}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                      >
                        {creatingStudentForClass === cls.id ? "Adding…" : "Add"}
                      </button>
                    </div>
                    {lastCreatedLogin?.classId === cls.id ? (
                      <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-600">
                        Login card ready for {lastCreatedLogin.name}: PIN{" "}
                        <span className="font-mono font-black text-gray-900">{lastCreatedLogin.pin}</span>, claim code{" "}
                        <span className="font-mono font-black text-gray-900">{lastCreatedLogin.claimCode}</span>.
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => router.push("/login")}
          className="mt-8 text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back
        </button>
      </div>
    </main>
  );
}
