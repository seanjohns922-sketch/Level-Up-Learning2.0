"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Eye, EyeOff, MoreHorizontal, Search } from "lucide-react";
import { RosterImportPanel } from "@/components/teacher/RosterImportPanel";
import { AddStudentsDialog, type AddTab } from "@/components/teacher/classes/AddStudentsDialog";
import { ClassSettingsDialog } from "@/components/teacher/classes/ClassSettingsDialog";
import { StudentPanel } from "@/components/teacher/classes/StudentPanel";
import type { ClassRow, EditForm, HomeAccess, SchoolDirectoryStudent, StudentRow, StudentSortMode } from "@/components/teacher/classes/types";
import { Dialog, HomePill, btnDark, btnPrimary, btnSecondary, chip, field, fieldLabel, iconBtn } from "@/components/teacher/classes/ui";
import { classLoginCardsHtml, familyLinkCardsHtml, singleLoginCardHtml } from "@/lib/documents/login-cards";
import { assetUrl, openDocumentWindow, writeDocument } from "@/lib/documents/reliq-document";
import type { RosterDraft } from "@/lib/roster-import";
import { getSchoolLogo } from "@/lib/school-logos";
import { supabase } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/useAuthGuard";
import {
  SCHOOL_YEAR_LEVEL_OPTIONS,
  normalizeClassYearLevels,
  normalizeSchoolYearLabel,
} from "@/lib/studentLevelLabel";
import { buildDisplayName, buildStudentUsername, resolveStudentNameParts } from "@/lib/studentName";

const YEAR_LEVELS: Array<string> = [...SCHOOL_YEAR_LEVEL_OPTIONS];

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

type StudentExplorerCodeRow = {
  student_id: string;
  explorer_code: string;
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

/** Orders the school directory in Add students: last name (default), first name or year group. */
function compareDirectoryStudents(a: SchoolDirectoryStudent, b: SchoolDirectoryStudent, mode: StudentSortMode) {
  const byText = (x: string, y: string) => x.localeCompare(y, undefined, { sensitivity: "base" });
  const year = (label: string | null) => { const i = label ? YEAR_LEVELS.indexOf(label) : -1; return i === -1 ? Number.POSITIVE_INFINITY : i; };
  if (mode === "actual_year" && year(a.yearLevel) !== year(b.yearLevel)) return year(a.yearLevel) - year(b.yearLevel);
  const an = resolveStudentNameParts({ display_name: a.name });
  const bn = resolveStudentNameParts({ display_name: b.name });
  return mode === "first_name"
    ? byText(an.firstName, bn.firstName) || byText(an.lastName, bn.lastName)
    : byText(an.lastName, bn.lastName) || byText(an.firstName, bn.firstName);
}

const classYears = (cls: ClassRow) => normalizeClassYearLevels(cls.year_levels?.length ? cls.year_levels : cls.year_level ? [cls.year_level] : []);

export default function TeacherClassesPage() {
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuthGuard();
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [claimCodesByStudentId, setClaimCodesByStudentId] = useState<Record<string, string>>({});
  const [explorerCodesByStudentId, setExplorerCodesByStudentId] = useState<Record<string, string>>({});
  const [linkedStudentIds, setLinkedStudentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [newStudentFirstNames, setNewStudentFirstNames] = useState<Record<string, string>>({});
  const [newStudentLastNames, setNewStudentLastNames] = useState<Record<string, string>>({});
  const [newStudentUsernames, setNewStudentUsernames] = useState<Record<string, string>>({});
  const [newStudentPins, setNewStudentPins] = useState<Record<string, string>>({});
  const [newStudentSchoolYears, setNewStudentSchoolYears] = useState<Record<string, string>>({});
  const [creatingStudentForClass, setCreatingStudentForClass] = useState<string | null>(null);
  const [lastCreatedLogin, setLastCreatedLogin] = useState<{
    classId: string;
    name: string;
    username: string;
    pin: string;
    claimCode: string;
  } | null>(null);

  async function getTeacherAccessToken() {
    const { data, error } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (error || !accessToken) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    return accessToken;
  }
  // Student panel: the student being viewed and edited.
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    first_name: "",
    last_name: "",
    username: "",
    pin: "",
    school_year_level: "",
    notes: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [archivingStudentId, setArchivingStudentId] = useState<string | null>(null);
  const [showArchivedStudents, setShowArchivedStudents] = useState(false);
  // Class archive/delete/edit state
  const [archivingClassId, setArchivingClassId] = useState<string | null>(null);
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);
  const [showArchivedClasses, setShowArchivedClasses] = useState(false);
  const [studentSortMode, setStudentSortMode] = useState<StudentSortMode>("last_name");
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editClassForm, setEditClassForm] = useState<{ name: string; year_levels: string[] }>({ name: "", year_levels: [] });
  const [savingClassEdit, setSavingClassEdit] = useState(false);
  const [revealedPinIds, setRevealedPinIds] = useState<Set<string>>(new Set());
  // Page layout: one class at a time, chosen from the tabs.
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [studentQuery, setStudentQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [homeWaitingOnly, setHomeWaitingOnly] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [addDialogClassId, setAddDialogClassId] = useState<string | null>(null);
  const [addTab, setAddTab] = useState<AddTab>("new");
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState("");
  const [moving, setMoving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // Each school's current school year: its classes come first, other years sit under their own tab.
  const [currentYearBySchool, setCurrentYearBySchool] = useState<Record<string, number | null>>({});
  const [showOtherYears, setShowOtherYears] = useState(false);
  // Already at your school (the school directory).
  const [directoryStudents, setDirectoryStudents] = useState<SchoolDirectoryStudent[]>([]);
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [directoryYear, setDirectoryYear] = useState("");
  // Students not in any class yet: what a teacher building a new class usually wants.
  const [directoryUnassignedOnly, setDirectoryUnassignedOnly] = useState(true);
  const [directorySort, setDirectorySort] = useState<StudentSortMode>("last_name");
  const [selectedDirectoryIds, setSelectedDirectoryIds] = useState<Set<string>>(new Set());
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [directoryError, setDirectoryError] = useState("");

  const directoryClass = classes.find((entry) => entry.id === addDialogClassId) ?? null;
  const directorySearch = directoryQuery.trim().toLowerCase();
  const shownDirectoryStudents = directoryClass
    ? directoryStudents
      .filter((student) => student.status === "active")
      .filter((student) => !(student.classIds ?? []).includes(directoryClass.id))
      .filter((student) => !directoryUnassignedOnly || (student.classIds ?? []).length === 0)
      .filter((student) => !directoryYear || student.yearLevel === directoryYear)
      .filter((student) => !directorySearch || [student.name, student.username ?? "", student.explorerCode ?? ""].some((value) => value.toLowerCase().includes(directorySearch)))
      .sort((left, right) => compareDirectoryStudents(left, right, directorySort))
    : [];

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }

  const loadClasses = useCallback(async (teacherId: string) => {
    const { data: cls } = await supabase
      .from("classes")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    const loadedClasses = (cls ?? []) as ClassRow[];
    const schoolIds = [...new Set(loadedClasses.map((entry) => entry.school_id).filter((id): id is string => Boolean(id)))];
    let schoolNamesById: Record<string, string> = {};
    if (schoolIds.length > 0) {
      const { data: schools } = await supabase.from("schools").select("id,name").in("id", schoolIds);
      schoolNamesById = Object.fromEntries((schools ?? []).map((school) => [school.id, school.name]));
    }
    setClasses(loadedClasses.map((entry) => ({
      ...entry,
      school_name: entry.school_id ? schoolNamesById[entry.school_id] ?? null : null,
    })));
    const yearEntries = await Promise.all(schoolIds.map(async (schoolId) => {
      const { data: years } = await supabase.rpc("get_school_years", { p_school_id: schoolId });
      const currentYear = (years as { currentYear?: number | null } | null)?.currentYear;
      return [schoolId, typeof currentYear === "number" ? currentYear : null] as const;
    }));
    setCurrentYearBySchool(Object.fromEntries(yearEntries));
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
        const [{ data: links }, { data: credentials }, { data: explorerCodes }] = await Promise.all([
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
          supabase.rpc("get_student_explorer_codes", {
            p_student_ids: studentIds,
          }),
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
        setExplorerCodesByStudentId(
          Object.fromEntries(
            ((explorerCodes ?? []) as StudentExplorerCodeRow[]).map((entry) => [
              entry.student_id,
              entry.explorer_code,
            ])
          )
        );
      } else {
        setLinkedStudentIds(new Set());
        setClaimCodesByStudentId({});
        setExplorerCodesByStudentId({});
      }
    } else {
      setStudents([]);
      setLinkedStudentIds(new Set());
      setClaimCodesByStudentId({});
      setExplorerCodesByStudentId({});
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading || !authUser) return;
    void Promise.resolve().then(() => loadClasses(authUser.id));
  }, [authLoading, authUser, loadClasses]);

  function resolveSchoolYearLabel(student: StudentRow, classId?: string) {
    const direct = normalizeSchoolYearLabel(student.school_year_level);
    if (direct) return direct;
    const cls = classes.find((entry) => entry.id === (classId ?? student.class_id));
    const fallback = normalizeSchoolYearLabel(cls?.year_level ?? null);
    return fallback ?? "—";
  }

  function homeAccess(studentId: string): HomeAccess {
    if (linkedStudentIds.has(studentId)) return "linked";
    if (claimCodesByStudentId[studentId]) return "waiting";
    return "school";
  }

  async function createStudentRecord(
    classId: string,
    draft: Pick<RosterDraft, "firstName" | "lastName" | "username" | "pin" | "schoolYear">,
    reservedPins: Set<string>
  ) {
    const firstName = draft.firstName.trim();
    const lastName = draft.lastName.trim();
    const name = buildDisplayName(firstName, lastName);
    const username = draft.username.trim() || buildStudentUsername(firstName, lastName);
    const pin = draft.pin.trim();
    const schoolYear = normalizeSchoolYearLabel(draft.schoolYear);
    if (!firstName) throw new Error("First name is required");
    if (!schoolYear) throw new Error("School year is required");
    if (pin && !/^\d{4}$/.test(pin)) throw new Error("Access code must be 4 digits");
    if (pin && reservedPins.has(pin)) throw new Error("Access code is already used in this class");

    const targetClass = classes.find((classRow) => classRow.id === classId);
    if (targetClass?.school_id) {
      const accessToken = await getTeacherAccessToken();
      const response = await fetch(`/api/teacher/classes/${classId}/students`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schoolId: targetClass.school_id,
          firstName,
          lastName,
          schoolYear,
          username,
          pin: pin || null,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const payload = (await response.json()) as {
        student?: {
          studentId?: string;
          name?: string;
          username?: string;
          pin?: string;
        };
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Student could not be added");
      }
      const createdStudent = payload.student;
      if (!createdStudent?.studentId) {
        throw new Error("Student creation did not return a student record");
      }
      const createdPin = createdStudent.pin ?? pin;
      if (createdPin) reservedPins.add(createdPin);
      return {
        classId,
        name: createdStudent.name ?? name,
        username: createdStudent.username ?? username,
        pin: createdPin,
        claimCode: "",
      };
    }

    const { data, error } = await supabase.rpc("create_student_for_class", {
      class_uuid: classId,
      display_name_input: name,
      pin_input: pin || null,
    });

    let created = Array.isArray(data) ? data[0] : data;

    if (error && isMissingCreateStudentRpc(error.message)) {
      console.warn("[TeacherClasses] create_student_for_class RPC missing, using direct insert fallback", error.message);
      const fallbackPin = pin || generateFallbackPin(reservedPins);

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
        throw new Error(insertError.message);
      }

      created = {
        student_id: insertedStudent.id,
        pin: insertedStudent.pin ?? fallbackPin,
        claim_code: "Pending setup",
        qr_token: insertedStudent.qr_token ?? "",
      };
    } else if (error) {
      throw new Error(error.message);
    }

    if (!created?.student_id) throw new Error("Student creation did not return a student record");
    const { error: updateError } = await supabase
      .from("students")
      .update({
        first_name: firstName || null,
        last_name: lastName || null,
        display_name: name,
        username,
        school_year_level: schoolYear,
      })
      .eq("id", created.student_id);
    if (updateError) {
      await supabase.from("students").delete().eq("id", created.student_id);
      throw new Error(updateError.message);
    }

    const createdPin = String(created?.pin ?? pin);
    if (createdPin) reservedPins.add(createdPin);
    return {
      classId,
      name,
      username,
      pin: createdPin,
      claimCode: created?.claim_code || "Pending setup",
    };
  }

  async function addStudentToClass(classId: string) {
    const reservedPins = new Set(
      students
        .filter((student) => student.class_id === classId)
        .map((student) => student.pin)
        .filter((value): value is string => Boolean(value))
    );

    setCreatingStudentForClass(classId);
    try {
      const created = await createStudentRecord(classId, {
        firstName: newStudentFirstNames[classId] ?? "",
        lastName: newStudentLastNames[classId] ?? "",
        username: newStudentUsernames[classId] ?? "",
        pin: newStudentPins[classId] ?? "",
        schoolYear: newStudentSchoolYears[classId] ?? "",
      }, reservedPins);
      setLastCreatedLogin(created);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Could not add student");
      setCreatingStudentForClass(null);
      return;
    }
    setCreatingStudentForClass(null);
    setNewStudentFirstNames((current) => ({ ...current, [classId]: "" }));
    setNewStudentLastNames((current) => ({ ...current, [classId]: "" }));
    setNewStudentUsernames((current) => ({ ...current, [classId]: "" }));
    setNewStudentPins((current) => ({ ...current, [classId]: "" }));
    // Keep the year group: teachers usually add several students from the same year.
    if (authUser?.id) await loadClasses(authUser.id);
  }

  async function importRoster(classId: string, roster: RosterDraft[]) {
    const reservedPins = new Set(
      students
        .filter((student) => student.class_id === classId)
        .map((student) => student.pin)
        .filter((value): value is string => Boolean(value))
    );
    const errors: string[] = [];
    let created = 0;

    setCreatingStudentForClass(classId);
    for (const student of roster) {
      try {
        await createStudentRecord(classId, student, reservedPins);
        created += 1;
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown error";
        errors.push(`${buildDisplayName(student.firstName, student.lastName) || "Unnamed row"}: ${reason}`);
      }
    }
    setCreatingStudentForClass(null);
    if (authUser?.id) await loadClasses(authUser.id);
    return { created, errors };
  }

  function regeneratePin() {
    const editing = students.find((s) => s.id === editingStudentId);
    const classId = editing?.class_id;
    const existing = new Set(
      students
        .filter((s) => s.class_id === classId && s.id !== editingStudentId)
        .map((s) => s.pin)
        .filter((value): value is string => Boolean(value))
    );
    setEditForm((f) => ({ ...f, pin: generateFallbackPin(existing) }));
  }

  function startEdit(student: StudentRow) {
    const nameParts = resolveStudentNameParts(student);
    setEditingStudentId(student.id);
    setEditForm({
      first_name: nameParts.firstName,
      last_name: nameParts.lastName,
      username: student.username ?? "",
      pin: student.pin ?? "",
      school_year_level: resolveSchoolYearLabel(student) === "—" ? "" : resolveSchoolYearLabel(student),
      notes: student.notes ?? "",
    });
  }

  async function saveStudentEdit(studentId: string) {
    if (!editForm.first_name.trim()) return;
    if (!normalizeSchoolYearLabel(editForm.school_year_level)) {
      alert("Please select the student's school year level.");
      return;
    }
    if (editForm.pin && !/^\d{4}$/.test(editForm.pin)) {
      alert("Access code must be 4 digits.");
      return;
    }
    setSavingEdit(true);
    const displayName = buildDisplayName(editForm.first_name, editForm.last_name);
    const username = editForm.username.trim() || buildStudentUsername(editForm.first_name, editForm.last_name);
    const { error } = await supabase
      .from("students")
      .update({
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim() || null,
        display_name: displayName,
        username,
        pin: editForm.pin || null,
        school_year_level: normalizeSchoolYearLabel(editForm.school_year_level),
        notes: editForm.notes.trim() || null,
      })
      .eq("id", studentId);
    setSavingEdit(false);
    if (error) { alert(error.message); return; }
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              first_name: editForm.first_name.trim(),
              last_name: editForm.last_name.trim() || null,
              display_name: displayName,
              username,
              pin: editForm.pin || null,
              school_year_level: normalizeSchoolYearLabel(editForm.school_year_level),
              notes: editForm.notes.trim() || null,
            }
          : s
      )
    );
    setEditingStudentId(null);
    flash(`${displayName} saved`);
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
    setEditingStudentId(null);
  }

  async function archiveSelectedStudents(list: StudentRow[]) {
    if (!list.length) return;
    if (!confirm(`Archive ${list.length} student${list.length === 1 ? "" : "s"}? They will be hidden from the class but their progress is kept.`)) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from("students").update({ archived_at: now }).in("id", list.map((s) => s.id));
    if (error) { alert(error.message); return; }
    const ids = new Set(list.map((s) => s.id));
    setStudents((prev) => prev.map((s) => (ids.has(s.id) ? { ...s, archived_at: now } : s)));
    setSelectedStudentIds(new Set());
  }

  async function deleteStudent(student: StudentRow) {
    if (!confirm(`Permanently delete ${student.display_name}? This cannot be undone and all their progress will be lost.`)) return;
    const { error } = await supabase.from("students").delete().eq("id", student.id);
    if (error) { alert(error.message); return; }
    setStudents((prev) => prev.filter((s) => s.id !== student.id));
    setEditingStudentId(null);
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
    setEditingStudentId(null);
  }

  // ── Class archive / delete ───────────────────────────────────────────────

  async function archiveClass(cls: ClassRow) {
    if (!confirm(`Archive "${cls.name}"? It will be hidden but can be restored at any time.`)) return;
    setArchivingClassId(cls.id);
    const { error } = await supabase
      .from("classes")
      .update({ archived_at: new Date().toISOString(), status: "archived" })
      .eq("id", cls.id);
    setArchivingClassId(null);
    if (error) { alert(error.message); return; }
    setClasses((prev) =>
      prev.map((c) => (c.id === cls.id ? { ...c, archived_at: new Date().toISOString(), status: "archived" } : c))
    );
    setEditingClassId(null);
    setSelectedClassId(null);
  }

  async function unarchiveClass(cls: ClassRow) {
    const { error } = await supabase
      .from("classes")
      .update({ archived_at: null, status: "active" })
      .eq("id", cls.id);
    if (error) { alert(error.message); return; }
    setClasses((prev) =>
      prev.map((c) => (c.id === cls.id ? { ...c, archived_at: null, status: "active" } : c))
    );
  }

  async function deleteClass(cls: ClassRow) {
    const totalCount = students.filter((s) => s.class_id === cls.id).length;
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
    setEditingClassId(null);
    setSelectedClassId(null);
  }

  function startClassEdit(cls: ClassRow) {
    setEditingClassId(cls.id);
    setEditClassForm({
      name: cls.name,
      year_levels: normalizeClassYearLevels(cls.year_levels ?? (cls.year_level ? [cls.year_level] : [])),
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
    void navigator.clipboard.writeText(value).then(() => flash("Copied")).catch(() => {});
  }

  function openAddStudents(classRow: ClassRow) {
    setAddDialogClassId(classRow.id);
    setLastCreatedLogin(null);
    if (classRow.school_id) {
      setAddTab("school");
      void loadSchoolDirectory(classRow);
    } else {
      setAddTab("new");
    }
  }

  async function loadSchoolDirectory(classRow: ClassRow) {
    if (!classRow.school_id) return;
    setDirectoryStudents([]);
    setSelectedDirectoryIds(new Set());
    setDirectoryQuery("");
    setDirectoryYear("");
    setDirectoryUnassignedOnly(true);
    setDirectoryError("");
    setDirectoryLoading(true);
    try {
      const accessToken = await getTeacherAccessToken();
      const response = await fetch(`/api/school/${classRow.school_id}/students`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const payload = (await response.json()) as {
        students?: SchoolDirectoryStudent[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? "Student directory could not be loaded");
      }
      setDirectoryStudents(payload.students ?? []);
    } catch (error) {
      setDirectoryError(
        error instanceof Error ? error.message : "Student directory could not be loaded",
      );
    } finally {
      setDirectoryLoading(false);
    }
  }

  /** Puts school students into a class; a student in another class moves, keeping everything. */
  async function assignStudents(schoolId: string, classId: string, studentIds: string[]) {
    const accessToken = await getTeacherAccessToken();
    const response = await fetch(`/api/school/${schoolId}/command`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "assignStudentsToClass",
        classId,
        studentIds,
        idempotencyKey: crypto.randomUUID(),
      }),
    });
    const payload = (await response.json()) as {
      assigned?: string[];
      errors?: Array<{ message: string }>;
      error?: string;
    };
    if (!response.ok) {
      throw new Error(payload.error ?? "Students could not be added");
    }
    if (payload.errors?.length) {
      throw new Error(payload.errors.map((error) => error.message).join("; "));
    }
  }

  async function assignDirectoryStudents() {
    if (!directoryClass?.school_id || selectedDirectoryIds.size === 0) return;
    setDirectoryLoading(true);
    setDirectoryError("");
    try {
      await assignStudents(directoryClass.school_id, directoryClass.id, [...selectedDirectoryIds]);
      flash(`${selectedDirectoryIds.size} student${selectedDirectoryIds.size === 1 ? "" : "s"} added`);
      setAddDialogClassId(null);
      if (authUser) await loadClasses(authUser.id);
    } catch (error) {
      setDirectoryError(
        error instanceof Error ? error.message : "Students could not be added",
      );
    } finally {
      setDirectoryLoading(false);
    }
  }

  async function moveSelectedStudents(from: ClassRow, list: StudentRow[]) {
    const target = classes.find((c) => c.id === moveTargetId);
    if (!from.school_id || !target || !list.length) return;
    setMoving(true);
    try {
      await assignStudents(from.school_id, target.id, list.map((s) => s.id));
      flash(`${list.length} student${list.length === 1 ? "" : "s"} moved to ${target.name}`);
      setMoveOpen(false);
      setSelectedStudentIds(new Set());
      if (authUser) await loadClasses(authUser.id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Students could not be moved");
    } finally {
      setMoving(false);
    }
  }

  function togglePinVisibility(studentId: string) {
    setRevealedPinIds((current) => {
      const next = new Set(current);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  }

  function logoFor(cls: ClassRow) {
    const logo = getSchoolLogo({ name: cls.school_name ?? null });
    return logo ? { src: assetUrl(logo.src, window.location.origin), alt: logo.alt } : null;
  }

  async function printLoginCards(cls: ClassRow, list: StudentRow[]) {
    if (!list.length) return;
    // Open from the click so the browser does not block it after the QR code is made.
    const printWindow = openDocumentWindow();
    if (!printWindow) { flash("Allow pop-ups to print login cards."); return; }
    try {
      const QRCode = await import("qrcode");
      const qrSrc = await QRCode.toDataURL(`${window.location.origin}/login?code=${cls.class_code}`, { width: 300, margin: 1 });
      writeDocument(printWindow, classLoginCardsHtml({
        schoolName: cls.school_name ?? null,
        schoolLogo: logoFor(cls),
        className: cls.name,
        classCode: cls.class_code,
        websiteHost: window.location.host,
        qrSrc,
        students: list.map((s) => ({ name: s.display_name, username: s.username ?? s.display_name, password: s.pin ?? null })),
      }));
    } catch {
      printWindow.close();
      flash("Login cards could not be prepared. Please try again.");
    }
  }

  async function printOneLoginCard(cls: ClassRow, student: StudentRow) {
    const printWindow = openDocumentWindow();
    if (!printWindow) { flash("Allow pop-ups to print login cards."); return; }
    try {
      const QRCode = await import("qrcode");
      const url = student.qr_token ? `${window.location.origin}/student?token=${student.qr_token}` : `${window.location.origin}/login?code=${cls.class_code}`;
      const qrSrc = await QRCode.toDataURL(url, { width: 300, margin: 1 });
      writeDocument(printWindow, singleLoginCardHtml({
        schoolName: cls.school_name ?? null,
        schoolLogo: logoFor(cls),
        className: cls.name,
        classCode: cls.class_code,
        websiteHost: window.location.host,
        qrSrc,
        student: { name: student.display_name, username: student.username ?? student.display_name, password: student.pin ?? null },
      }));
    } catch {
      printWindow.close();
      flash("The login card could not be prepared. Please try again.");
    }
  }

  function printFamilyCards(cls: ClassRow, list: StudentRow[]) {
    const cards = list.filter((s) => explorerCodesByStudentId[s.id]);
    if (!cards.length) { flash("These students don't have explorer codes yet."); return; }
    const printWindow = openDocumentWindow();
    if (!printWindow) { flash("Allow pop-ups to print family link cards."); return; }
    writeDocument(printWindow, familyLinkCardsHtml({
      websiteHost: window.location.host,
      schoolName: cls.school_name ?? null,
      schoolLogo: logoFor(cls),
      cards: cards.map((s) => ({ name: s.display_name, className: cls.name, explorerCode: explorerCodesByStudentId[s.id], accessCode: s.pin ?? null })),
    }));
  }

  const activeClasses = classes.filter((c) => !c.archived_at);
  const archivedClasses = classes.filter((c) => c.archived_at);
  const schoolYearOf = (c: ClassRow) => (c.school_id ? currentYearBySchool[c.school_id] ?? null : null);
  const isThisYear = (c: ClassRow) => schoolYearOf(c) === null || !c.academic_year || c.academic_year === schoolYearOf(c);
  const currentClasses = activeClasses.filter(isThisYear);
  const otherYearClasses = activeClasses.filter((c) => !isThisYear(c)).sort((a, b) => (b.academic_year ?? 0) - (a.academic_year ?? 0));
  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? currentClasses[0] ?? activeClasses[0] ?? null;
  const yearIndex = (label?: string | null) => {
    if (!label) return Number.POSITIVE_INFINITY;
    const index = YEAR_LEVELS.indexOf(label);
    return index === -1 ? Number.POSITIVE_INFINITY : index;
  };

  const sortStudents = useCallback((list: StudentRow[]) => [...list].sort((a, b) => {
    if (studentSortMode === "actual_year") {
      const yearDiff = yearIndex(normalizeSchoolYearLabel(a.school_year_level)) - yearIndex(normalizeSchoolYearLabel(b.school_year_level));
      if (yearDiff !== 0) return yearDiff;
    }
    const aNames = resolveStudentNameParts(a);
    const bNames = resolveStudentNameParts(b);
    if (studentSortMode === "first_name") {
      const firstDiff = aNames.firstName.localeCompare(bNames.firstName, undefined, { sensitivity: "base" });
      if (firstDiff !== 0) return firstDiff;
      return aNames.lastName.localeCompare(bNames.lastName, undefined, { sensitivity: "base" });
    }
    const lastDiff = aNames.lastName.localeCompare(bNames.lastName, undefined, { sensitivity: "base" });
    if (lastDiff !== 0) return lastDiff;
    return aNames.firstName.localeCompare(bNames.firstName, undefined, { sensitivity: "base" });
  }), [studentSortMode]);

  const classStudents = useMemo(() => (selectedClass ? students.filter((s) => s.class_id === selectedClass.id) : []), [students, selectedClass]);
  const activeStudents = classStudents.filter((s) => !s.archived_at);
  const archivedStudents = classStudents.filter((s) => s.archived_at);
  const waitingCount = activeStudents.filter((s) => homeAccess(s.id) === "waiting").length;
  const yearCounts = YEAR_LEVELS.map((yr) => ({ yr, n: activeStudents.filter((s) => resolveSchoolYearLabel(s) === yr).length })).filter((y) => y.n > 0);
  const query = studentQuery.trim().toLowerCase();
  const shownStudents = sortStudents((showArchivedStudents ? archivedStudents : activeStudents)
    .filter((s) => !yearFilter || resolveSchoolYearLabel(s) === yearFilter)
    .filter((s) => !homeWaitingOnly || homeAccess(s.id) === "waiting")
    .filter((s) => !query || [s.display_name, s.username ?? "", explorerCodesByStudentId[s.id] ?? ""].some((v) => v.toLowerCase().includes(query))));
  const selectedList = shownStudents.filter((s) => selectedStudentIds.has(s.id));
  const allShownSelected = shownStudents.length > 0 && shownStudents.every((s) => selectedStudentIds.has(s.id));
  const moveTargets = selectedClass?.school_id ? activeClasses.filter((c) => c.id !== selectedClass.id && c.school_id === selectedClass.school_id) : [];
  const panelStudent = students.find((s) => s.id === editingStudentId) ?? null;
  const teacherName = (authUser?.user_metadata?.display_name as string | undefined) ?? authUser?.email ?? null;

  function chooseClass(id: string) {
    setSelectedClassId(id);
    setSelectedStudentIds(new Set());
    setStudentQuery("");
    setYearFilter("");
    setHomeWaitingOnly(false);
    setShowArchivedStudents(false);
    setShowArchivedClasses(false);
    setShowOtherYears(false);
  }

  function toggleStudent(id: string) {
    setSelectedStudentIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <main className="reliq-adult flex min-h-screen items-center justify-center bg-[#f5f5f2]">
        <p className="text-lg text-[#5b5b57]">Loading…</p>
      </main>
    );
  }

  const gridCols = "grid-cols-[40px_minmax(0,2.2fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,1.2fr)_48px]";

  return (
    <main className="reliq-adult min-h-screen bg-[#f5f5f2] px-4 py-8 text-[#111] sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-5">
            <h1 className="font-[Montserrat,sans-serif] text-3xl font-extrabold">My Classes</h1>
            {classes.length ? (
              <nav aria-label="Classes" className="flex max-w-full flex-wrap gap-1 rounded-xl border border-[#e2e2dd] bg-white p-1">
                {currentClasses.map((c) => (
                  <button key={c.id} type="button" onClick={() => chooseClass(c.id)} aria-current={!showArchivedClasses && !showOtherYears && selectedClass?.id === c.id ? "page" : undefined}
                    className={`rounded-lg px-4 py-2 text-[15px] font-bold ${!showArchivedClasses && !showOtherYears && selectedClass?.id === c.id ? "bg-[#111] text-white" : "hover:bg-[#f2f2ee]"}`}>{c.name}</button>
                ))}
                {otherYearClasses.length ? (
                  <button type="button" onClick={() => { setShowOtherYears((v) => !v); setShowArchivedClasses(false); }} aria-pressed={showOtherYears}
                    className={`rounded-lg px-4 py-2 text-[15px] font-semibold ${showOtherYears ? "bg-[#111] text-white" : "text-[#5b5b57] hover:bg-[#f2f2ee]"}`}>Other years ({otherYearClasses.length})</button>
                ) : null}
                {archivedClasses.length ? (
                  <button type="button" onClick={() => { setShowArchivedClasses((v) => !v); setShowOtherYears(false); }} aria-pressed={showArchivedClasses}
                    className={`rounded-lg px-4 py-2 text-[15px] font-semibold ${showArchivedClasses ? "bg-[#111] text-white" : "text-[#5b5b57] hover:bg-[#f2f2ee]"}`}>Archived ({archivedClasses.length})</button>
                ) : null}
              </nav>
            ) : null}
          </div>
          <button type="button" onClick={() => router.push("/teacher/classes/new")} className={btnSecondary}>New class</button>
        </div>

        {!classes.length ? (
          <div className="rounded-[18px] border border-[#e2e2dd] bg-white px-6 py-16 text-center">
            <p className="text-lg text-[#4a4a46]">No classes yet.</p>
            <button type="button" onClick={() => router.push("/teacher/classes/new")} className={`${btnPrimary} mt-4`}>Create your first class</button>
          </div>
        ) : showOtherYears ? (
          <section aria-label="Classes from other years" className="overflow-hidden rounded-[18px] border border-[#e2e2dd] bg-white">
            <p className="border-b border-[#f0f0ec] px-6 py-3 text-sm text-[#4a4a46]">Classes from other school years. Their students and results are kept. Add students to this year&apos;s classes to move them on.</p>
            {otherYearClasses.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0ec] px-6 py-4 last:border-b-0">
                <span><strong className="text-lg">{c.name}</strong> <span className="text-[#5b5b57]">· {c.academic_year ?? "Year not set"} · {students.filter((s) => s.class_id === c.id && !s.archived_at).length} students</span></span>
                <button type="button" onClick={() => chooseClass(c.id)} className={btnSecondary}>Open</button>
              </div>
            ))}
          </section>
        ) : showArchivedClasses ? (
          <section aria-label="Archived classes" className="overflow-hidden rounded-[18px] border border-[#e2e2dd] bg-white">
            {archivedClasses.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0ec] px-6 py-4 last:border-b-0">
                <span><strong className="text-lg">{c.name}</strong> <span className="text-[#5b5b57]">· {students.filter((s) => s.class_id === c.id).length} students · archived</span></span>
                <span className="flex gap-2">
                  <button type="button" onClick={() => void unarchiveClass(c)} className={btnSecondary}>Restore</button>
                  <button type="button" onClick={() => void deleteClass(c)} disabled={deletingClassId === c.id} className={`${btnSecondary} text-[#8a2c00]`}>{deletingClassId === c.id ? "Deleting…" : "Delete"}</button>
                </span>
              </div>
            ))}
          </section>
        ) : selectedClass ? (
          <>
            <section aria-label={`Class ${selectedClass.name}`} className="flex flex-wrap items-center justify-between gap-5 rounded-[18px] border border-[#e2e2dd] bg-white px-7 py-6">
              <div className="flex min-w-0 flex-col gap-2.5">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h2 className="font-[Montserrat,sans-serif] text-3xl font-extrabold">{selectedClass.name}</h2>
                  <span className="text-base text-[#4a4a46]">
                    {[classYears(selectedClass).join(", ") || null, teacherName, selectedClass.school_name, selectedClass.academic_year ? String(selectedClass.academic_year) : null, `${activeStudents.length} student${activeStudents.length === 1 ? "" : "s"}`].filter(Boolean).join(" · ")}
                  </span>
                </div>
                {!isThisYear(selectedClass) ? (
                  <p className="rounded-lg bg-[#fff4e0] px-3 py-1.5 text-sm font-semibold text-[#8a4b00]">{selectedClass.academic_year} class. Your school is now in {schoolYearOf(selectedClass)}, so add students to your {schoolYearOf(selectedClass)} classes.</p>
                ) : null}
                <div className="flex items-center gap-2.5 text-[15px] text-[#4a4a46]">
                  Class code
                  <span className="rounded-lg bg-[#f2f2ee] px-2.5 py-1 font-mono text-[17px] font-extrabold tracking-[0.15em] text-[#111]">{selectedClass.class_code}</span>
                  <button type="button" onClick={() => copyText(selectedClass.class_code)} aria-label="Copy class code" className="grid h-9 w-9 place-items-center rounded-lg border border-[#d6d6d0] hover:bg-[#f6f6f2]"><Copy size={16} /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => openAddStudents(selectedClass)} className={btnPrimary}>Add students</button>
                <button type="button" onClick={() => void printLoginCards(selectedClass, sortStudents(activeStudents))} disabled={!activeStudents.length} className={btnSecondary}>Print login cards</button>
                <button type="button" onClick={() => startClassEdit(selectedClass)} className={btnSecondary}>Class settings</button>
              </div>
            </section>

            {waitingCount > 0 && !homeWaitingOnly ? (
              <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f0d29a] bg-[#fff4e0] px-5 py-3.5 text-[15px]">
                <span><strong>{waitingCount} famil{waitingCount === 1 ? "y hasn't" : "ies haven't"} linked home access yet.</strong> Send a family link card so {waitingCount === 1 ? "this student" : "these students"} can learn at home.</span>
                <button type="button" onClick={() => { setHomeWaitingOnly(true); setShowArchivedStudents(false); }} className="rounded-xl border border-[#111] bg-white px-4 py-2 text-sm font-bold">Show them</button>
              </div>
            ) : null}

            <section aria-label="Students" className="overflow-hidden rounded-[18px] border border-[#e2e2dd] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ececE7] px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="relative">
                    <span className="sr-only">Search students</span>
                    <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#8a8a84]" />
                    <input type="search" value={studentQuery} onChange={(e) => setStudentQuery(e.target.value)} placeholder="Search students" className={`${field} w-60 pl-9`} />
                  </label>
                  <button type="button" onClick={() => { setYearFilter(""); setHomeWaitingOnly(false); setShowArchivedStudents(false); }} className={chip(!yearFilter && !homeWaitingOnly && !showArchivedStudents)}>All {activeStudents.length}</button>
                  {yearCounts.length > 1 ? yearCounts.map(({ yr, n }) => (
                    <button key={yr} type="button" onClick={() => { setYearFilter(yearFilter === yr ? "" : yr); setShowArchivedStudents(false); }} className={chip(yearFilter === yr)}>{yr} · {n}</button>
                  )) : null}
                  {waitingCount ? <button type="button" onClick={() => { setHomeWaitingOnly(!homeWaitingOnly); setShowArchivedStudents(false); }} className={chip(homeWaitingOnly)}>Home link waiting · {waitingCount}</button> : null}
                  {archivedStudents.length ? <button type="button" onClick={() => { setShowArchivedStudents(!showArchivedStudents); setYearFilter(""); setHomeWaitingOnly(false); setSelectedStudentIds(new Set()); }} className={chip(showArchivedStudents)}>Archived · {archivedStudents.length}</button> : null}
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-[#4a4a46]">Sort
                  <select value={studentSortMode} onChange={(e) => setStudentSortMode(e.target.value as StudentSortMode)} className="rounded-xl border border-[#c9c9c3] bg-white px-3 py-2 text-sm text-[#111]">
                    <option value="last_name">Last name</option>
                    <option value="first_name">First name</option>
                    <option value="actual_year">Year group</option>
                  </select>
                </label>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[880px]">
                  <div className={`grid ${gridCols} items-center border-b border-[#ececE7] bg-[#fafaf8] px-5 py-2.5 text-xs font-bold tracking-[0.05em] text-[#5b5b57]`}>
                    <span><input type="checkbox" aria-label="Select all shown students" className="h-[18px] w-[18px]" checked={allShownSelected} onChange={() => setSelectedStudentIds(allShownSelected ? new Set() : new Set(shownStudents.map((s) => s.id)))} /></span>
                    <span>STUDENT</span><span>YEAR</span><span>ACCESS CODE</span><span>EXPLORER CODE</span><span>HOME ACCESS</span><span />
                  </div>
                  {shownStudents.length === 0 ? (
                    <p className="px-5 py-12 text-center text-[15px] text-[#5b5b57]">{activeStudents.length || showArchivedStudents ? "No students match." : "No students yet. Choose Add students to get started."}</p>
                  ) : shownStudents.map((s) => {
                    const selected = selectedStudentIds.has(s.id);
                    const code = explorerCodesByStudentId[s.id];
                    return (
                      <div key={s.id} className={`grid ${gridCols} items-center border-b border-[#f0f0ec] px-5 py-3 text-[15px] last:border-b-0 ${selected ? "bg-[#f6fceb]" : "hover:bg-[#fcfcfa]"}`}>
                        <span><input type="checkbox" aria-label={`Select ${s.display_name}`} className="h-[18px] w-[18px]" checked={selected} onChange={() => toggleStudent(s.id)} /></span>
                        <button type="button" onClick={() => startEdit(s)} className="flex min-w-0 flex-col items-start text-left">
                          <span className="truncate text-base font-bold hover:underline">{resolveStudentNameParts(s).displayName}</span>
                          <span className="truncate text-sm text-[#5b5b57]">{s.username ? `@${s.username}` : "No username"}{s.notes ? ` · ${s.notes}` : ""}</span>
                        </button>
                        <span>{resolveSchoolYearLabel(s, selectedClass.id)}</span>
                        <span className="flex items-center gap-1">
                          <span className="min-w-12 font-mono font-bold tracking-[0.15em]">{revealedPinIds.has(s.id) ? s.pin ?? "—" : "••••"}</span>
                          <button type="button" onClick={() => togglePinVisibility(s.id)} aria-label={revealedPinIds.has(s.id) ? "Hide access code" : "Show access code"} className={iconBtn}>{revealedPinIds.has(s.id) ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        </span>
                        <span className="flex min-w-0 items-center gap-1 font-mono text-sm font-bold">
                          <span className="truncate">{code ?? "—"}</span>
                          {code ? <button type="button" onClick={() => copyText(code)} aria-label={`Copy Explorer Code: ${code}`} className={iconBtn}><Copy size={15} /></button> : null}
                        </span>
                        <span>{s.archived_at ? <span className="rounded-full bg-[#ececE7] px-2.5 py-1 text-xs font-bold text-[#5b5b57]">Archived</span> : <HomePill status={homeAccess(s.id)} />}</span>
                        <button type="button" onClick={() => startEdit(s)} aria-label={`Open ${s.display_name}`} className="grid h-10 w-10 place-items-center rounded-xl border border-[#e0e0da] bg-white hover:border-[#111]"><MoreHorizontal size={18} /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {selectedList.length > 0 && !showArchivedStudents ? (
              <div className="sticky bottom-4 z-30 mx-auto flex flex-wrap items-center gap-2 rounded-2xl bg-[#111] px-4 py-3 text-white shadow-2xl">
                <span className="px-2 font-bold">{selectedList.length} selected</span>
                <button type="button" onClick={() => void printLoginCards(selectedClass, selectedList)} className="rounded-xl bg-[#83E300] px-4 py-2 text-sm font-extrabold text-[#111]">Print login cards</button>
                <button type="button" onClick={() => printFamilyCards(selectedClass, selectedList)} className="rounded-xl border border-[#555] px-4 py-2 text-sm font-semibold hover:bg-white/10">Print family link cards</button>
                {moveTargets.length ? <button type="button" onClick={() => { setMoveTargetId(moveTargets[0].id); setMoveOpen(true); }} className="rounded-xl border border-[#555] px-4 py-2 text-sm font-semibold hover:bg-white/10">Move to class</button> : null}
                <button type="button" onClick={() => void archiveSelectedStudents(selectedList)} className="rounded-xl border border-[#555] px-4 py-2 text-sm font-semibold hover:bg-white/10">Archive</button>
                <button type="button" onClick={() => setSelectedStudentIds(new Set())} className="rounded-xl px-3 py-2 text-sm font-semibold text-white/70 hover:text-white">Clear</button>
              </div>
            ) : null}
          </>
        ) : (
          <p className="rounded-[18px] border border-[#e2e2dd] bg-white px-6 py-12 text-center text-[#4a4a46]">All your classes are archived. Open Archived to restore one, or create a new class.</p>
        )}

        <button type="button" onClick={() => router.push("/teacher/dashboard")} className="self-start text-sm font-semibold text-[#5b5b57] hover:text-[#111]">← Back to dashboard</button>
      </div>

      {/* The floating Full Screen button would sit over panel and dialog buttons. */}
      <style>{`body:has([role="dialog"]) .fullscreen-toggle{display:none}`}</style>
      {toast ? <div role="status" className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-[#111] px-4 py-2.5 text-sm font-bold text-white shadow-xl">{toast}</div> : null}

      {panelStudent && selectedClass ? (
        <StudentPanel
          student={panelStudent}
          className={classes.find((c) => c.id === panelStudent.class_id)?.name ?? selectedClass.name}
          classCode={classes.find((c) => c.id === panelStudent.class_id)?.class_code ?? selectedClass.class_code}
          explorerCode={explorerCodesByStudentId[panelStudent.id] ?? null}
          claimCode={claimCodesByStudentId[panelStudent.id] ?? null}
          homeAccess={homeAccess(panelStudent.id)}
          yearLevels={YEAR_LEVELS}
          pinRevealed={revealedPinIds.has(panelStudent.id)}
          onTogglePin={() => togglePinVisibility(panelStudent.id)}
          copyText={copyText}
          editForm={editForm}
          setEditForm={setEditForm}
          onRegeneratePin={regeneratePin}
          saving={savingEdit}
          onSave={() => void saveStudentEdit(panelStudent.id)}
          onClose={() => setEditingStudentId(null)}
          archiving={archivingStudentId === panelStudent.id}
          onArchive={() => void archiveStudent(panelStudent)}
          onRestore={() => void unarchiveStudent(panelStudent)}
          onDelete={() => void deleteStudent(panelStudent)}
          onPrintLoginCard={() => void printOneLoginCard(selectedClass, panelStudent)}
          onPrintHomeCard={() => printFamilyCards(selectedClass, [panelStudent])}
        />
      ) : null}

      {directoryClass ? (
        <AddStudentsDialog
          cls={directoryClass}
          tab={addTab}
          onTab={(tab) => { setAddTab(tab); if (tab === "school" && !directoryStudents.length) void loadSchoolDirectory(directoryClass); }}
          onClose={() => setAddDialogClassId(null)}
          yearLevels={YEAR_LEVELS}
          directory={{
            students: shownDirectoryStudents,
            query: directoryQuery, setQuery: setDirectoryQuery,
            year: directoryYear, setYear: setDirectoryYear,
            unassignedOnly: directoryUnassignedOnly, setUnassignedOnly: setDirectoryUnassignedOnly,
            sort: directorySort, setSort: setDirectorySort,
            selected: selectedDirectoryIds,
            toggle: (id) => setSelectedDirectoryIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; }),
            toggleAllShown: () => setSelectedDirectoryIds((current) => {
              const next = new Set(current);
              const allShown = shownDirectoryStudents.every((student) => next.has(student.id));
              shownDirectoryStudents.forEach((student) => (allShown ? next.delete(student.id) : next.add(student.id)));
              return next;
            }),
            loading: directoryLoading, error: directoryError, onAdd: () => void assignDirectoryStudents(),
          }}
          draft={{
            first: newStudentFirstNames[directoryClass.id] ?? "",
            last: newStudentLastNames[directoryClass.id] ?? "",
            username: newStudentUsernames[directoryClass.id] ?? "",
            pin: newStudentPins[directoryClass.id] ?? "",
            year: newStudentSchoolYears[directoryClass.id] ?? (classYears(directoryClass).length === 1 ? classYears(directoryClass)[0] : ""),
          }}
          setDraft={(patch) => {
            const id = directoryClass.id;
            if (patch.first !== undefined) setNewStudentFirstNames((c) => ({ ...c, [id]: patch.first! }));
            if (patch.last !== undefined) setNewStudentLastNames((c) => ({ ...c, [id]: patch.last! }));
            if (patch.username !== undefined) setNewStudentUsernames((c) => ({ ...c, [id]: patch.username! }));
            if (patch.pin !== undefined) setNewStudentPins((c) => ({ ...c, [id]: patch.pin! }));
            if (patch.year !== undefined) setNewStudentSchoolYears((c) => ({ ...c, [id]: patch.year! }));
          }}
          creating={creatingStudentForClass === directoryClass.id}
          onCreate={() => {
            const id = directoryClass.id;
            if (newStudentSchoolYears[id] === undefined && classYears(directoryClass).length === 1) {
              setNewStudentSchoolYears((c) => ({ ...c, [id]: classYears(directoryClass)[0] }));
            }
            void addStudentToClass(id);
          }}
          lastCreated={lastCreatedLogin?.classId === directoryClass.id ? lastCreatedLogin : null}
          upload={directoryClass.school_id ? (
            <p className="rounded-2xl border border-[#e6e6e1] bg-[#fafaf8] px-5 py-4 text-[15px] text-[#4a4a46]">Your school leader uploads student lists in Administration, so nobody is added twice. Once they&apos;re in RELIQ, add them here from <strong>Already at your school</strong>.</p>
          ) : (
            <RosterImportPanel
              classYearLevels={classYears(directoryClass)}
              onClose={() => setAddDialogClassId(null)}
              onImport={(roster) => importRoster(directoryClass.id, roster)}
            />
          )}
        />
      ) : null}

      {editingClassId ? (() => {
        const cls = classes.find((c) => c.id === editingClassId);
        if (!cls) return null;
        return (
          <ClassSettingsDialog
            cls={cls}
            yearLevels={YEAR_LEVELS}
            form={editClassForm}
            setName={(name) => setEditClassForm((f) => ({ ...f, name }))}
            toggleYear={toggleClassYear}
            saving={savingClassEdit}
            onSave={() => void saveClassEdit(cls.id)}
            onClose={() => setEditingClassId(null)}
            archiving={archivingClassId === cls.id}
            onArchive={() => void archiveClass(cls)}
            deleting={deletingClassId === cls.id}
            onDelete={() => void deleteClass(cls)}
          />
        );
      })() : null}

      {moveOpen && selectedClass ? (
        <Dialog title={`Move ${selectedList.length} student${selectedList.length === 1 ? "" : "s"}`} subtitle="Their progress, results and rewards move with them." onClose={() => setMoveOpen(false)} width="max-w-lg"
          footer={(
            <>
              <button type="button" onClick={() => setMoveOpen(false)} className={btnSecondary}>Cancel</button>
              <button type="button" onClick={() => void moveSelectedStudents(selectedClass, selectedList)} disabled={moving || !moveTargetId} className={btnDark}>{moving ? "Moving…" : "Move students"}</button>
            </>
          )}>
          <label className={fieldLabel}>Move to
            <select className={field} value={moveTargetId} onChange={(e) => setMoveTargetId(e.target.value)}>
              {moveTargets.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </Dialog>
      ) : null}
    </main>
  );
}
