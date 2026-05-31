"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/useAuthGuard";
import {
  SCHOOL_YEAR_LEVEL_OPTIONS,
  formatWorkingLevelOptionLabel,
  normalizeSchoolYearLabel,
  normalizeWorkingLevelLabel,
} from "@/lib/studentLevelLabel";
import { buildDisplayName, resolveStudentNameParts } from "@/lib/studentName";

const YEAR_LEVELS: Array<string> = [...SCHOOL_YEAR_LEVEL_OPTIONS];

type ClassRow = {
  id: string;
  class_code: string;
  name: string;
  year_level: string;
  year_levels?: string[] | null;
  created_at: string;
  archived_at?: string | null;
};

type StudentRow = {
  id: string;
  display_name: string;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  class_id: string | null;
  pin?: string | null;
  qr_token?: string | null;
  year_level?: string | null;
  school_year_level?: string | null;
  working_level?: string | null;
  notes?: string | null;
  archived_at?: string | null;
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

type StudentSortMode = "display_name" | "first_name" | "last_name" | "working_level" | "actual_year";

type EditForm = {
  first_name: string;
  last_name: string;
  username: string;
  pin: string;
  school_year_level: string;
  working_level: string;
  notes: string;
};

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

export default function TeacherClassesPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuthGuard();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [claimCodesByStudentId, setClaimCodesByStudentId] = useState<Record<string, string>>({});
  const [linkedStudentIds, setLinkedStudentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [newStudentFirstNames, setNewStudentFirstNames] = useState<Record<string, string>>({});
  const [newStudentLastNames, setNewStudentLastNames] = useState<Record<string, string>>({});
  const [newStudentUsernames, setNewStudentUsernames] = useState<Record<string, string>>({});
  const [newStudentPins, setNewStudentPins] = useState<Record<string, string>>({});
  const [newStudentSchoolYears, setNewStudentSchoolYears] = useState<Record<string, string>>({});
  const [newStudentWorkingLevels, setNewStudentWorkingLevels] = useState<Record<string, string>>({});
  const [creatingStudentForClass, setCreatingStudentForClass] = useState<string | null>(null);
  const [lastCreatedLogin, setLastCreatedLogin] = useState<{
    classId: string;
    name: string;
    pin: string;
    claimCode: string;
  } | null>(null);
  // Student edit/archive state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    first_name: "",
    last_name: "",
    username: "",
    pin: "",
    school_year_level: "",
    working_level: "AUTO_PLACEMENT",
    notes: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [archivingStudentId, setArchivingStudentId] = useState<string | null>(null);
  const [showArchivedForClass, setShowArchivedForClass] = useState<Record<string, boolean>>({});
  // Class archive/delete/edit state
  const [archivingClassId, setArchivingClassId] = useState<string | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [showArchivedClasses, setShowArchivedClasses] = useState(false);
  const [studentSortMode, setStudentSortMode] = useState<StudentSortMode>("last_name");
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassForm, setEditClassForm] = useState<{ name: string; year_levels: string[] }>({ name: "", year_levels: [] });
  const [savingClassEdit, setSavingClassEdit] = useState(false);

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

  const studentsForClass = (classId: string, includeArchived = false) =>
    students.filter((s) => s.class_id === classId && (includeArchived ? true : !s.archived_at));

  function resolveSchoolYearLabel(student: StudentRow, classId?: string) {
    const direct = normalizeSchoolYearLabel(student.school_year_level);
    if (direct) return direct;
    const cls = classes.find((entry) => entry.id === (classId ?? student.class_id));
    const fallback = normalizeSchoolYearLabel(cls?.year_level ?? null);
    return fallback ?? "—";
  }

  function resolveWorkingYearLabel(student: StudentRow) {
    return normalizeWorkingLevelLabel(student.working_level ?? student.year_level) ?? null;
  }

  function linkStatus(studentId: string) {
    if (linkedStudentIds.has(studentId)) return "Home linked";
    if (claimCodesByStudentId[studentId]) return "Pending link";
    return "School only";
  }

  async function addStudentToClass(classId: string) {
    const firstName = (newStudentFirstNames[classId] ?? "").trim();
    const lastName = (newStudentLastNames[classId] ?? "").trim();
    const name = buildDisplayName(firstName, lastName);
    const username = (newStudentUsernames[classId] ?? "").trim();
    const pin = (newStudentPins[classId] ?? "").trim();
    const schoolYear = normalizeSchoolYearLabel(newStudentSchoolYears[classId] ?? "");
    const workingYear = normalizeWorkingLevelLabel(newStudentWorkingLevels[classId] ?? "");
    if (!firstName) return;
    if (!schoolYear) {
      alert("Please select the student's school year level.");
      return;
    }
    if ((newStudentWorkingLevels[classId] ?? "") === "") {
      alert("Please choose a working level or auto placement.");
      return;
    }
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

    let created = Array.isArray(data) ? data[0] : data;

    if (error && isMissingCreateStudentRpc(error.message)) {
      console.warn("[TeacherClasses] create_student_for_class RPC missing, using direct insert fallback", error.message);
      const existingPins = new Set(
        students
          .filter((student) => student.class_id === classId)
          .map((student) => student.pin)
          .filter((value): value is string => Boolean(value))
      );
      const fallbackPin = pin || generateFallbackPin(existingPins);
      if (existingPins.has(fallbackPin)) {
        setCreatingStudentForClass(null);
        alert("That PIN is already used in this class.");
        return;
      }

      const { data: insertedStudent, error: insertError } = await supabase
        .from("students")
        .insert({
          id: crypto.randomUUID(),
          class_id: classId,
          display_name: name,
          first_name: firstName || null,
          last_name: lastName || null,
          username: username || null,
          pin: fallbackPin,
        })
        .select("id, pin, qr_token")
        .single();

      if (insertError) {
        setCreatingStudentForClass(null);
        alert(insertError.message);
        return;
      }

      created = {
        student_id: insertedStudent.id,
        pin: insertedStudent.pin ?? fallbackPin,
        claim_code: "Pending setup",
        qr_token: insertedStudent.qr_token ?? "",
      };
    } else if (error) {
      setCreatingStudentForClass(null);
      alert(error.message);
      return;
    }

    setCreatingStudentForClass(null);
    if (created) {
      setLastCreatedLogin({
        classId,
        name,
        pin: created.pin,
        claimCode: created.claim_code || "Pending setup",
      });
    }
    if (created?.student_id) {
      await supabase
        .from("students")
        .update({
          first_name: firstName || null,
          last_name: lastName || null,
          display_name: name,
          school_year_level: schoolYear,
          working_level: workingYear,
          year_level: workingYear,
        })
        .eq("id", created.student_id);
    }
    setNewStudentFirstNames((current) => ({ ...current, [classId]: "" }));
    setNewStudentLastNames((current) => ({ ...current, [classId]: "" }));
    setNewStudentUsernames((current) => ({ ...current, [classId]: "" }));
    setNewStudentPins((current) => ({ ...current, [classId]: "" }));
    setNewStudentSchoolYears((current) => ({ ...current, [classId]: "" }));
    setNewStudentWorkingLevels((current) => ({ ...current, [classId]: "AUTO_PLACEMENT" }));
    if (authUser?.id) await loadClasses(authUser.id);
  }

  function startEdit(student: StudentRow) {
    const nameParts = resolveStudentNameParts(student);
    setEditingStudentId(student.id);
    setEditForm({
      first_name: nameParts.firstName,
      last_name: nameParts.lastName,
      username: student.username ?? "",
      pin: student.pin ?? "",
      school_year_level: resolveSchoolYearLabel(student),
      working_level: resolveWorkingYearLabel(student) ?? "AUTO_PLACEMENT",
      notes: student.notes ?? "",
    });
  }

  function cancelEdit() {
    setEditingStudentId(null);
  }

  async function saveStudentEdit(studentId: string) {
    if (!editForm.first_name.trim()) return;
    if (!normalizeSchoolYearLabel(editForm.school_year_level)) {
      alert("Please select the student's school year level.");
      return;
    }
    if (editForm.pin && !/^\d{4}$/.test(editForm.pin)) {
      alert("Password must be 4 digits.");
      return;
    }
    setSavingEdit(true);
    const displayName = buildDisplayName(editForm.first_name, editForm.last_name);
    const { error } = await supabase
      .from("students")
      .update({
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim() || null,
        display_name: displayName,
        username: editForm.username.trim() || null,
        pin: editForm.pin || null,
        school_year_level: normalizeSchoolYearLabel(editForm.school_year_level),
        working_level: normalizeWorkingLevelLabel(editForm.working_level === "AUTO_PLACEMENT" ? null : editForm.working_level),
        year_level: normalizeWorkingLevelLabel(editForm.working_level === "AUTO_PLACEMENT" ? null : editForm.working_level),
        notes: editForm.notes.trim() || null,
      })
      .eq("id", studentId);
    setSavingEdit(false);
    if (error) { alert(error.message); return; }
    const normalizedWorking = normalizeWorkingLevelLabel(editForm.working_level === "AUTO_PLACEMENT" ? null : editForm.working_level);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              first_name: editForm.first_name.trim(),
              last_name: editForm.last_name.trim() || null,
              display_name: displayName,
              username: editForm.username.trim() || null,
              pin: editForm.pin || null,
              school_year_level: normalizeSchoolYearLabel(editForm.school_year_level),
              working_level: normalizedWorking,
              year_level: normalizedWorking,
              notes: editForm.notes.trim() || null,
            }
          : s
      )
    );
    setEditingStudentId(null);
  }

  async function archiveStudent(student: StudentRow) {
    if (!confirm(`Archive ${student.display_name}? They will be hidden from the class but their progress is kept.`)) return;
    setArchivingStudentId(student.id);
    const { error } = await supabase
      .from("students")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", student.id);
    setArchivingStudentId(null);
    if (error) { alert(error.message); return; }
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, archived_at: new Date().toISOString() } : s))
    );
  }

  async function deleteStudent(student: StudentRow) {
    if (!confirm(`Permanently delete ${student.display_name}? This cannot be undone and all their progress will be lost.`)) return;
    const { error } = await supabase.from("students").delete().eq("id", student.id);
    if (error) { alert(error.message); return; }
    setStudents((prev) => prev.filter((s) => s.id !== student.id));
  }

  async function unarchiveStudent(student: StudentRow) {
    const { error } = await supabase
      .from("students")
      .update({ archived_at: null })
      .eq("id", student.id);
    if (error) { alert(error.message); return; }
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, archived_at: null } : s))
    );
  }

  // ── Class archive / delete ───────────────────────────────────────────────

  async function archiveClass(cls: ClassRow) {
    if (!confirm(`Archive "${cls.name}"? It will be hidden but can be restored at any time.`)) return;
    setArchivingClassId(cls.id);
    const { error } = await supabase
      .from("classes")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", cls.id);
    setArchivingClassId(null);
    if (error) { alert(error.message); return; }
    setClasses((prev) =>
      prev.map((c) => (c.id === cls.id ? { ...c, archived_at: new Date().toISOString() } : c))
    );
  }

  async function unarchiveClass(cls: ClassRow) {
    const { error } = await supabase
      .from("classes")
      .update({ archived_at: null })
      .eq("id", cls.id);
    if (error) { alert(error.message); return; }
    setClasses((prev) =>
      prev.map((c) => (c.id === cls.id ? { ...c, archived_at: null } : c))
    );
  }

  async function deleteClass(cls: ClassRow) {
    const totalCount = studentsForClass(cls.id, true).length;
    const studentWarning =
      totalCount > 0
        ? `\n\nThis class has ${totalCount} student${totalCount !== 1 ? "s" : ""}. All student records and progress will be permanently deleted.`
        : "";
    if (!confirm(`Permanently delete "${cls.name}"?${studentWarning}\n\nThis cannot be undone.`)) return;

    setDeletingClassId(cls.id);
    // Delete students first (in case no cascade FK)
    if (totalCount > 0) {
      await supabase.from("students").delete().eq("class_id", cls.id);
    }
    const { error } = await supabase.from("classes").delete().eq("id", cls.id);
    setDeletingClassId(null);
    if (error) { alert(error.message); return; }
    setClasses((prev) => prev.filter((c) => c.id !== cls.id));
    setStudents((prev) => prev.filter((s) => s.class_id !== cls.id));
  }

  function startClassEdit(cls: ClassRow) {
    setEditingClassId(cls.id);
    setEditClassForm({
      name: cls.name,
      year_levels: cls.year_levels ?? (cls.year_level ? [cls.year_level] : []),
    });
  }

  function toggleClassYear(yr: string) {
    setEditClassForm((f) => ({
      ...f,
      year_levels: f.year_levels.includes(yr)
        ? f.year_levels.filter((y) => y !== yr)
        : [...f.year_levels, yr],
    }));
  }

  async function saveClassEdit(classId: string) {
    if (!editClassForm.name.trim()) return;
    setSavingClassEdit(true);
    const { error } = await supabase
      .from("classes")
      .update({ name: editClassForm.name.trim(), year_levels: editClassForm.year_levels.length ? editClassForm.year_levels : null })
      .eq("id", classId);
    setSavingClassEdit(false);
    if (error) { alert(error.message); return; }
    setClasses((prev) =>
      prev.map((c) =>
        c.id === classId ? { ...c, name: editClassForm.name.trim(), year_levels: editClassForm.year_levels.length ? editClassForm.year_levels : null } : c
      )
    );
    setEditingClassId(null);
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

  const activeClasses = classes.filter((c) => !c.archived_at);
  const archivedClasses = classes.filter((c) => c.archived_at);
  const visibleClasses = showArchivedClasses ? classes : activeClasses;
  const yearIndex = (label?: string | null) => {
    if (!label) return Number.POSITIVE_INFINITY;
    const index = YEAR_LEVELS.indexOf(label);
    return index === -1 ? Number.POSITIVE_INFINITY : index;
  };
  const sortSchoolYearLabel = (student: StudentRow) => normalizeSchoolYearLabel(student.school_year_level);
  const sortWorkingLevelLabel = (student: StudentRow) => normalizeWorkingLevelLabel(student.working_level);

  const sortStudentsForClass = (classId: string, includeArchived = false) => {
    const base = students.filter((s) => s.class_id === classId && (includeArchived ? true : !s.archived_at));
    return [...base].sort((a, b) => {
      if (studentSortMode === "working_level") {
        const levelDiff = yearIndex(sortWorkingLevelLabel(a)) - yearIndex(sortWorkingLevelLabel(b));
        if (levelDiff !== 0) return levelDiff;
      }
      if (studentSortMode === "actual_year") {
        const yearDiff = yearIndex(sortSchoolYearLabel(a)) - yearIndex(sortSchoolYearLabel(b));
        if (yearDiff !== 0) return yearDiff;
      }
      const aNames = resolveStudentNameParts(a);
      const bNames = resolveStudentNameParts(b);
      if (studentSortMode === "first_name") {
        const firstDiff = aNames.firstName.localeCompare(bNames.firstName, undefined, { sensitivity: "base" });
        if (firstDiff !== 0) return firstDiff;
        return aNames.lastName.localeCompare(bNames.lastName, undefined, { sensitivity: "base" });
      }
      if (studentSortMode === "last_name") {
        const lastDiff = aNames.lastName.localeCompare(bNames.lastName, undefined, { sensitivity: "base" });
        if (lastDiff !== 0) return lastDiff;
        return aNames.firstName.localeCompare(bNames.firstName, undefined, { sensitivity: "base" });
      }
      return aNames.displayName.localeCompare(bNames.displayName, undefined, { sensitivity: "base" });
    });
  };

  const sortLabel = studentSortMode === "working_level"
    ? "Working level"
    : studentSortMode === "actual_year"
      ? "School year"
      : studentSortMode === "first_name"
        ? "First name"
        : studentSortMode === "last_name"
          ? "Surname"
          : "Full name";

  return (
    <main className="min-h-screen bg-[#fbf7f1] px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <h1 className="text-3xl font-black text-gray-900">My Classes</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-500">
              <span>Order students by</span>
              <select
                value={studentSortMode}
                onChange={(event) => setStudentSortMode(event.target.value as StudentSortMode)}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-300"
              >
                <option value="display_name">Full name</option>
                <option value="first_name">First name</option>
                <option value="last_name">Surname</option>
                <option value="working_level">Working level</option>
                <option value="actual_year">School year</option>
              </select>
            </label>
            <button
              onClick={() => router.push("/teacher/classes/new")}
              className="px-5 py-2.5 rounded-2xl bg-[#9fd7b1] text-[#1f3b2a] font-bold hover:bg-[#8fcea4] transition"
            >
              + New Class
            </button>
          </div>
        </div>

        {activeClasses.length === 0 && archivedClasses.length === 0 ? (
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
            {visibleClasses.map((cls) => {
              const isClassArchived = !!cls.archived_at;
              const showArchived = showArchivedForClass[cls.id] ?? false;
              const activeStuds = sortStudentsForClass(cls.id, false);
              const archivedStuds = sortStudentsForClass(cls.id, true).filter((s) => s.archived_at);
              const visibleStuds = showArchived ? sortStudentsForClass(cls.id, true) : activeStuds;

              return (
                <div
                  key={cls.id}
                  className={[
                    "bg-white/80 backdrop-blur rounded-2xl border border-white shadow p-5",
                    isClassArchived ? "opacity-60" : "",
                  ].join(" ")}
                >
                  {/* ── Class header / edit form ── */}
                  {editingClassId === cls.id ? (
                    <div className="grid gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 mb-3">
                      <div className="text-xs font-black uppercase tracking-wide text-blue-700">Edit Class</div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block">Class Name *</label>
                        <input
                          value={editClassForm.name}
                          onChange={(e) => setEditClassForm((f) => ({ ...f, name: e.target.value }))}
                          className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-blue-300"
                          placeholder="e.g. 3/4 SJ"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 mb-1.5 block">Year Levels</label>
                        <div className="flex flex-wrap gap-2">
                          {YEAR_LEVELS.map((yr) => (
                            <button
                              key={yr}
                              type="button"
                              onClick={() => toggleClassYear(yr)}
                              className={[
                                "px-3 py-1 rounded-full text-xs font-bold border transition",
                                editClassForm.year_levels.includes(yr)
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-700",
                              ].join(" ")}
                            >
                              {yr}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveClassEdit(cls.id)}
                          disabled={savingClassEdit || !editClassForm.name.trim()}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50"
                        >
                          {savingClassEdit ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingClassId(null)}
                          className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl font-bold text-gray-900">{cls.name}</h2>
                          {isClassArchived && (
                            <span className="rounded-full px-2 py-0.5 text-[11px] font-black bg-gray-200 text-gray-500">
                              Archived
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <p className="text-sm text-gray-500">
                            Code: <span className="font-mono font-bold tracking-wider">{cls.class_code}</span>
                          </p>
                          {(cls.year_levels?.length ? cls.year_levels : cls.year_level ? [cls.year_level] : []).map((yr) => (
                            <span key={yr} className="rounded-full px-2 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {yr}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-gray-500 mr-1">
                          {activeStuds.length} student{activeStuds.length !== 1 ? "s" : ""}
                        </span>
                        <span className="text-xs font-semibold text-gray-400">
                          Sorted: {sortLabel}
                        </span>
                        {!isClassArchived && (
                          <button
                            type="button"
                            onClick={() => startClassEdit(cls)}
                            className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          >
                            Edit
                          </button>
                        )}
                        {isClassArchived ? (
                          <button
                            type="button"
                            onClick={() => unarchiveClass(cls)}
                            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => archiveClass(cls)}
                            disabled={archivingClassId === cls.id}
                            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            {archivingClassId === cls.id ? "Archiving…" : "Archive"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteClass(cls)}
                          disabled={deletingClassId === cls.id}
                          className="rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                          {deletingClassId === cls.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}

                  {!isClassArchived && (
                    <>
                      {visibleStuds.length > 0 && (
                        <div className="mt-4 grid gap-2">
                          {visibleStuds.map((s) => {
                            const isEditing = editingStudentId === s.id;
                            const isArchived = !!s.archived_at;

                            if (isEditing) {
                              return (
                                <div key={s.id} className="grid gap-3 text-sm px-3 py-3 bg-blue-50 rounded-xl border border-blue-100">
                                  <div className="text-xs font-black uppercase tracking-wide text-blue-700">Edit Student</div>

                                  {/* Name */}
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">First Name *</label>
                                    <input
                                      value={editForm.first_name}
                                      onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))}
                                      className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-blue-300"
                                      placeholder="e.g. Sean"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Last Name</label>
                                    <input
                                      value={editForm.last_name}
                                      onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))}
                                      className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-blue-300"
                                      placeholder="e.g. Johns"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Display name is generated from first + last name.</p>
                                  </div>

                                  {/* Login credentials */}
                                  <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Login Details</div>
                                    <div className="grid gap-2 md:grid-cols-3">
                                      <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Class Code</label>
                                        <div className="w-full rounded-xl border border-white bg-white/60 px-3 py-2 text-sm font-mono font-black text-gray-500 tracking-widest select-all">
                                          {cls.class_code}
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Username</label>
                                        <input
                                          value={editForm.username}
                                          onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                                          className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-blue-300"
                                          placeholder="e.g. sean"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Password (4-digit)</label>
                                        <input
                                          value={editForm.pin}
                                          onChange={(e) => setEditForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                                          className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm font-mono font-bold text-gray-900 tracking-widest outline-none focus:border-blue-300"
                                          placeholder="1234"
                                          inputMode="numeric"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid gap-2 md:grid-cols-2">
                                    <div>
                                      <label className="text-xs font-bold text-gray-500 mb-1 block">School Year Level</label>
                                      <select
                                        value={editForm.school_year_level}
                                        onChange={(e) => setEditForm((f) => ({ ...f, school_year_level: e.target.value }))}
                                        className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-blue-300"
                                      >
                                        <option value="">— select —</option>
                                        {YEAR_LEVELS.map((yr) => (
                                          <option key={yr} value={yr}>{yr}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-xs font-bold text-gray-500 mb-1 block">Working Level</label>
                                      <select
                                        value={editForm.working_level}
                                        onChange={(e) => setEditForm((f) => ({ ...f, working_level: e.target.value }))}
                                        className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-blue-300"
                                      >
                                        <option value="AUTO_PLACEMENT">Placement not completed / Auto placement</option>
                                        {YEAR_LEVELS.map((yr) => (
                                          <option key={yr} value={yr}>{formatWorkingLevelOptionLabel(yr)}</option>
                                        ))}
                                      </select>
                                      <p className="text-[10px] text-gray-400 mt-1">Placement updates this level, not the school year.</p>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Notes (optional)</label>
                                    <textarea
                                      value={editForm.notes}
                                      onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                                      rows={2}
                                      className="w-full rounded-xl border border-white bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-300 resize-none"
                                      placeholder="e.g. IEP, reading support, parent contact preference…"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => saveStudentEdit(s.id)}
                                      disabled={savingEdit || !editForm.first_name.trim()}
                                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50"
                                    >
                                      {savingEdit ? "Saving…" : "Save"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelEdit}
                                      className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={s.id}
                                className={[
                                  "grid gap-2 text-sm px-3 py-3 rounded-xl md:grid-cols-[1fr_auto]",
                                  isArchived ? "bg-gray-100 opacity-60" : "bg-gray-50",
                                ].join(" ")}
                              >
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-gray-700">{resolveStudentNameParts(s).displayName}</span>
                                    <span className="rounded-full px-2 py-0.5 text-[11px] font-black bg-sky-50 text-sky-700">
                                      School: {resolveSchoolYearLabel(s, cls.id)}
                                    </span>
                                    <span className="rounded-full px-2 py-0.5 text-[11px] font-black bg-indigo-50 text-indigo-600">
                                      Working: {resolveWorkingYearLabel(s) ? formatWorkingLevelOptionLabel(resolveWorkingYearLabel(s)!) : "Placement pending"}
                                    </span>
                                    {isArchived && (
                                      <span className="rounded-full px-2 py-0.5 text-[11px] font-black bg-gray-200 text-gray-500">
                                        Archived
                                      </span>
                                    )}
                                    {!isArchived && (
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
                                    )}
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                    {s.username && (
                                      <span>
                                        Username: <span className="font-semibold text-gray-700">{s.username}</span>
                                      </span>
                                    )}
                                    <span>
                                      Password: <span className="font-mono font-bold text-gray-700">{s.pin ?? "—"}</span>
                                    </span>
                                    {!isArchived && claimCodesByStudentId[s.id] && (
                                      <span>
                                        Claim:{" "}
                                        <span className="font-mono font-bold text-gray-700">
                                          {claimCodesByStudentId[s.id]}
                                        </span>
                                      </span>
                                    )}
                                    {s.notes && (
                                      <span className="text-gray-400 italic">{s.notes}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 md:justify-end items-start">
                                  {!isArchived && (
                                    <>
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
                                      <button
                                        type="button"
                                        onClick={() => startEdit(s)}
                                        className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => archiveStudent(s)}
                                        disabled={archivingStudentId === s.id}
                                        className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                                      >
                                        {archivingStudentId === s.id ? "Archiving…" : "Archive"}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deleteStudent(s)}
                                        className="rounded-xl border border-red-300 bg-red-100 px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-200"
                                      >
                                        Delete
                                      </button>
                                    </>
                                  )}
                                  {isArchived && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => unarchiveStudent(s)}
                                        className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                                      >
                                        Restore
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => deleteStudent(s)}
                                        className="rounded-xl border border-red-300 bg-red-100 px-3 py-2 text-xs font-bold text-red-800 hover:bg-red-200"
                                      >
                                        Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {archivedStuds.length > 0 && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setShowArchivedForClass((prev) => ({ ...prev, [cls.id]: !showArchived }))}
                            className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
                          >
                            {showArchived ? "Hide archived" : `Show ${archivedStuds.length} archived student${archivedStuds.length !== 1 ? "s" : ""}`}
                          </button>
                        </div>
                      )}

                      <div className="mt-4 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-4">
                        <div>
                          <div className="text-xs font-black uppercase tracking-wide text-emerald-700">Add Student</div>
                          <p className="text-[11px] text-emerald-600/70 mt-0.5">
                            Class code: <span className="font-mono font-black tracking-widest">{cls.class_code}</span> · Username + password are what students type to log in.
                          </p>
                        </div>
                        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_160px_180px_130px_auto]">
                          <input
                            value={newStudentFirstNames[cls.id] ?? ""}
                            onChange={(event) =>
                              setNewStudentFirstNames((current) => ({ ...current, [cls.id]: event.target.value }))
                            }
                            placeholder="First name"
                            className="rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-300"
                          />
                          <input
                            value={newStudentLastNames[cls.id] ?? ""}
                            onChange={(event) =>
                              setNewStudentLastNames((current) => ({ ...current, [cls.id]: event.target.value }))
                            }
                            placeholder="Last name"
                            className="rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-300"
                          />
                          <input
                            value={newStudentUsernames[cls.id] ?? ""}
                            onChange={(event) =>
                              setNewStudentUsernames((current) => ({ ...current, [cls.id]: event.target.value }))
                            }
                            placeholder="Username (login)"
                            className="rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-300"
                          />
                          <select
                            value={newStudentSchoolYears[cls.id] ?? ""}
                            onChange={(event) =>
                              setNewStudentSchoolYears((current) => ({ ...current, [cls.id]: event.target.value }))
                            }
                            className="rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-300"
                          >
                            <option value="">School year…</option>
                            {YEAR_LEVELS.map((yr) => (
                              <option key={yr} value={yr}>{yr}</option>
                            ))}
                          </select>
                          <select
                            value={newStudentWorkingLevels[cls.id] ?? "AUTO_PLACEMENT"}
                            onChange={(event) =>
                              setNewStudentWorkingLevels((current) => ({ ...current, [cls.id]: event.target.value }))
                            }
                            className="rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-300"
                          >
                            <option value="AUTO_PLACEMENT">Auto placement…</option>
                            {YEAR_LEVELS.map((yr) => (
                              <option key={yr} value={yr}>{formatWorkingLevelOptionLabel(yr)}</option>
                            ))}
                          </select>
                          <input
                            value={newStudentPins[cls.id] ?? ""}
                            onChange={(event) =>
                              setNewStudentPins((current) => ({
                                ...current,
                                [cls.id]: event.target.value.replace(/\D/g, "").slice(0, 4),
                              }))
                            }
                            placeholder="Password (4-digit)"
                            inputMode="numeric"
                            className="rounded-xl border border-white bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none focus:border-emerald-300"
                          />
                          <button
                            type="button"
                            onClick={() => addStudentToClass(cls.id)}
                            disabled={creatingStudentForClass === cls.id || !(newStudentFirstNames[cls.id] ?? "").trim()}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                          >
                            {creatingStudentForClass === cls.id ? "Adding…" : "Add"}
                          </button>
                        </div>
                        {lastCreatedLogin?.classId === cls.id ? (
                          <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-gray-600">
                            Student added: <span className="font-black text-gray-900">{lastCreatedLogin.name}</span> · Password:{" "}
                            <span className="font-mono font-black text-gray-900">{lastCreatedLogin.pin}</span>
                          </div>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {archivedClasses.length > 0 && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowArchivedClasses((prev) => !prev)}
              className="text-xs text-gray-400 hover:text-gray-600 font-semibold"
            >
              {showArchivedClasses
                ? "Hide archived classes"
                : `Show ${archivedClasses.length} archived class${archivedClasses.length !== 1 ? "es" : ""}`}
            </button>
          </div>
        )}

        <button
          onClick={() => router.push("/teacher/dashboard")}
          className="mt-8 text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back
        </button>
      </div>
    </main>
  );
}
