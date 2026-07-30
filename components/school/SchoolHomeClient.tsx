"use client";

import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileSpreadsheet,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Plus,
  RotateCcw,
  School,
  Search,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  SchoolHomeSnapshot,
  SchoolSwitcherItem,
} from "@/lib/school-platform-server";
import { supabase } from "@/lib/supabase";
import {
  parseRosterWorkbook,
  type RosterDraft,
} from "@/lib/roster-import";

type TabId =
  | "home"
  | "classes"
  | "students"
  | "staff"
  | "insights"
  | "administration"
  | "licence"
  | "settings"
  | "support";

type NavItem = {
  id: TabId;
  label: string;
  icon: typeof LayoutDashboard;
};

const TEACHER_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: LayoutDashboard },
  { id: "classes", label: "Classes", icon: BookOpen },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "support", label: "Support", icon: HelpCircle },
];

function schoolLogoFor(name: string) {
  const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return key === "cobramprimary" || key === "cobramprimaryschool"
    ? "/schools/cobram-primary-logo.png"
    : null;
}

function educatorFirstName(name: string, email: string | null) {
  const titles = new Set([
    "mr",
    "mrs",
    "ms",
    "miss",
    "mx",
    "dr",
    "prof",
    "sir",
    "dame",
  ]);
  const nameParts = name.trim().split(/\s+/).filter(Boolean);
  const startsWithTitle =
    nameParts.length > 0 &&
    titles.has(nameParts[0].replace(/\./g, "").toLowerCase());
  const personalNameParts = startsWithTitle ? nameParts.slice(1) : nameParts;

  if (!startsWithTitle || personalNameParts.length > 1) {
    return personalNameParts[0] ?? "Educator";
  }

  const emailFirstName = email
    ?.split("@")[0]
    ?.split(/[._+-]/)[0]
    ?.replace(/[^a-zA-Z'-]/g, "");
  if (!emailFirstName) return personalNameParts[0] ?? "Educator";

  return emailFirstName.charAt(0).toUpperCase() + emailFirstName.slice(1);
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: LayoutDashboard },
  { id: "classes", label: "Classes", icon: BookOpen },
  { id: "staff", label: "Staff", icon: Users },
  { id: "students", label: "Students", icon: GraduationCap },
  { id: "insights", label: "School Analytics", icon: BarChart3 },
  { id: "administration", label: "Administration", icon: Settings },
  { id: "licence", label: "Licence", icon: ShieldCheck },
  { id: "support", label: "Support", icon: HelpCircle },
];

const YEAR_LEVELS = [
  "Prep",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
];

const SCHOOL_ROLE_LABELS: Record<string, string> = {
  school_admin: "School administrator",
  principal: "Principal",
  teacher: "Teacher",
  support_staff: "Support staff",
  platform_admin: "Platform administrator",
};

const CLASS_ROLE_LABELS: Record<string, string> = {
  lead_teacher: "Lead teacher",
  teacher: "Teacher",
  support_staff: "Support staff",
  viewer: "Viewer",
};

function roleLabel(role: string | null) {
  if (!role) return "School-wide view";
  return CLASS_ROLE_LABELS[role] ?? SCHOOL_ROLE_LABELS[role] ?? role;
}

const SCHOOL_DATE_FORMATTER = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Australia/Melbourne",
});

function formatSchoolDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : SCHOOL_DATE_FORMATTER.format(date);
}

function createCode(name: string) {
  const letters = name.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 4);
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${letters || "CLASS"}${suffix}`.slice(0, 10);
}

async function sendCommand(
  schoolId: string,
  payload: Record<string, unknown>,
) {
  const response = await fetch(`/api/school/${schoolId}/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = (await response.json()) as {
    error?: string;
    classId?: string;
    explorerCode?: string;
    created?: Array<Record<string, unknown>>;
    errors?: Array<{ row: number; name: string; message: string }>;
  };
  if (!response.ok) throw new Error(result.error ?? "Action failed");
  return result;
}

function EmptyState({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof School;
  title: string;
  detail: string;
}) {
  return (
    <div className="border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <Icon className="mx-auto h-7 w-7 text-slate-400" />
      <h3 className="mt-3 text-sm font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ClassTable({
  classes,
  schoolId,
  onAssign,
}: {
  classes: SchoolHomeSnapshot["classes"];
  schoolId: string;
  onAssign: (classRow: SchoolHomeSnapshot["classes"][number]) => void;
}) {
  if (classes.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No classes in this academic year"
        detail="Select another academic year or create a class when you are ready."
      />
    );
  }

  return (
    <div className="overflow-x-auto border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left">
        <thead className="bg-slate-50">
          <tr className="text-xs font-bold uppercase text-slate-500">
            <th className="px-5 py-3">Class</th>
            <th className="px-5 py-3">Year levels</th>
            <th className="px-5 py-3">Academic year</th>
            <th className="px-5 py-3">Teaching team</th>
            <th className="px-5 py-3">Students</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Your access</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {classes.map((classRow) => (
            <tr key={classRow.id} className="text-sm text-slate-700">
              <td className="px-5 py-4">
                <p className="font-bold text-slate-950">{classRow.name}</p>
                <p className="mt-0.5 font-mono text-xs text-slate-400">
                  {classRow.code}
                </p>
              </td>
              <td className="px-5 py-4">
                {classRow.yearLevels.join(", ") || "Not set"}
              </td>
              <td className="px-5 py-4">
                {classRow.academicYear ?? "Not set"}
              </td>
              <td className="px-5 py-4">
                <p>{classRow.leadTeacher ?? "Lead teacher not assigned"}</p>
                {classRow.coTeachers.length > 0 ? (
                  <p className="mt-0.5 text-xs text-slate-500">
                    With {classRow.coTeachers.join(", ")}
                  </p>
                ) : null}
              </td>
              <td className="px-5 py-4 font-semibold">
                {classRow.studentCount}
              </td>
              <td className="px-5 py-4">
                <span className="inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold capitalize text-emerald-800">
                  {classRow.status}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                  {roleLabel(classRow.myRole)}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  {classRow.canManage ? (
                    <button
                      type="button"
                      onClick={() => onAssign(classRow)}
                      className="rounded-md border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Manage staff
                    </button>
                  ) : null}
                  {classRow.canOpen ? (
                    <a
                      href={`/school/${schoolId}/classes/${classRow.id}`}
                      className="rounded-md bg-emerald-800 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-900"
                    >
                      View class
                    </a>
                  ) : (
                    <span className="px-3 py-2 text-xs font-semibold text-slate-400">
                      View only
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TeacherClassCards({
  classes,
  schoolId,
}: {
  classes: SchoolHomeSnapshot["classes"];
  schoolId: string;
}) {
  if (classes.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No assigned classes"
        detail="Your school administrator can add you to a class."
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {classes.map((classRow) => (
        <article
          key={classRow.id}
          className="flex min-h-40 flex-col justify-between rounded-md border border-slate-200 bg-white p-5"
        >
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">
                  {classRow.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {classRow.yearLevels.join(", ") || "Year level not set"}
                </p>
              </div>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-800">
                {roleLabel(classRow.myRole)}
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
              <span>{classRow.studentCount} students</span>
              <span>{classRow.leadTeacher ?? "Teacher not assigned"}</span>
            </div>
          </div>
          <a
            href={`/school/${schoolId}/classes/${classRow.id}`}
            className="mt-5 inline-flex min-h-10 w-fit items-center rounded-md bg-emerald-800 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-900"
          >
            Open Class
          </a>
        </article>
      ))}
    </div>
  );
}

function OtherSchoolClasses({
  classes,
  schoolId,
}: {
  classes: SchoolHomeSnapshot["classes"];
  schoolId: string;
}) {
  if (classes.length === 0) {
    return (
      <p className="border-t border-slate-200 py-5 text-sm text-slate-500">
        No other classes are listed for this academic year.
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-200 border-y border-slate-200">
      {classes.map((classRow) => (
        <div
          key={classRow.id}
          className="grid gap-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-bold text-slate-950">{classRow.name}</h3>
              <span className="text-sm text-slate-500">
                {classRow.yearLevels.join(", ") || "Year level not set"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {classRow.leadTeacher ?? "Teacher not assigned"} ·{" "}
              {classRow.studentCount} students
            </p>
          </div>
          {classRow.canOpen ? (
            <a
              href={`/school/${schoolId}/classes/${classRow.id}`}
              className="inline-flex min-h-9 w-fit items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 hover:border-emerald-700 hover:text-emerald-800"
            >
              View
            </a>
          ) : (
            <span className="text-xs font-semibold text-slate-400">
              Not assigned
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

type SchoolStudentDraft = {
  firstName: string;
  lastName: string;
  schoolYear: string;
  username: string;
  pin: string;
  classId: string;
  idempotencyKey: string;
};

type StudentCreateResult = {
  created: Array<Record<string, unknown>>;
  errors: Array<{ row: number; name: string; message: string }>;
};

function emptyStudentDraft(classId = ""): SchoolStudentDraft {
  return {
    firstName: "",
    lastName: "",
    schoolYear: "",
    username: "",
    pin: "",
    classId,
    idempotencyKey: crypto.randomUUID(),
  };
}

function StudentDirectory({
  students,
  classes,
  directoryError,
  busy,
  onReset,
  onCreate,
}: {
  students: SchoolHomeSnapshot["students"];
  classes: SchoolHomeSnapshot["classes"];
  directoryError: string | null;
  busy: boolean;
  onReset: (studentId: string, reason: string) => Promise<boolean>;
  onCreate: (students: SchoolStudentDraft[]) => Promise<StudentCreateResult>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [copiedCode, setCopiedCode] = useState("");
  const [createMode, setCreateMode] = useState<"manual" | "import" | null>(
    null,
  );
  const [manualDraft, setManualDraft] = useState<SchoolStudentDraft>(
    emptyStudentDraft(),
  );
  const [importRows, setImportRows] = useState<RosterDraft[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [readingFile, setReadingFile] = useState(false);
  const [resetStudent, setResetStudent] = useState<
    SchoolHomeSnapshot["students"][number] | null
  >(null);
  const [resetReason, setResetReason] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const yearRank = (yearLevel: string | null) => {
    const index = yearLevel ? YEAR_LEVELS.indexOf(yearLevel) : -1;
    return index === -1 ? YEAR_LEVELS.length : index;
  };
  const filteredStudents = students
    .filter(
      (student) =>
        (!yearFilter || student.yearLevel === yearFilter) &&
        [
        student.name,
        student.username ?? "",
        student.explorerCode ?? "",
        ...student.classes,
        ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    )
    .sort(
      (left, right) =>
        yearRank(left.yearLevel) - yearRank(right.yearLevel) ||
        left.name.localeCompare(right.name),
    );

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(""), 1800);
  }

  async function submitReset() {
    if (!resetStudent || !resetReason.trim()) return;
    const completed = await onReset(resetStudent.id, resetReason.trim());
    if (completed) {
      setResetStudent(null);
      setResetReason("");
    }
  }

  function closeCreate() {
    setCreateMode(null);
    setImportRows([]);
    setImportFileName("");
    setImportMessage("");
    setManualDraft(emptyStudentDraft());
  }

  async function submitManualStudent() {
    const result = await onCreate([manualDraft]);
    if (result.errors.length === 0) {
      closeCreate();
      return;
    }
    setImportMessage(result.errors[0]?.message ?? "Student could not be added.");
  }

  async function handleRosterFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setReadingFile(true);
    setImportMessage("");
    setImportFileName(file.name);
    try {
      const rows = await parseRosterWorkbook(file, "");
      setImportRows(rows);
      setImportMessage(
        rows.length
          ? "Review the students before adding them."
          : "No student names were found in that file.",
      );
    } catch (error) {
      setImportRows([]);
      setImportMessage(
        error instanceof Error ? error.message : "Could not read that file.",
      );
    } finally {
      setReadingFile(false);
    }
  }

  function updateImportRow(
    id: string,
    field: keyof RosterDraft,
    value: string,
  ) {
    setImportRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  }

  async function submitImport() {
    const validRows = importRows.filter(
      (row) =>
        row.firstName.trim() &&
        YEAR_LEVELS.includes(row.schoolYear) &&
        (!row.pin || /^\d{4}$/.test(row.pin)),
    );
    const result = await onCreate(
      validRows.map((row) => ({
        firstName: row.firstName,
        lastName: row.lastName,
        schoolYear: row.schoolYear,
        username: row.username,
        pin: row.pin,
        classId: "",
        idempotencyKey: row.id,
      })),
    );
    if (result.errors.length === 0) {
      closeCreate();
      return;
    }
    setImportMessage(
      `${result.created.length} added. ${result.errors.length} could not be added: ${result.errors
        .map((error) => `${error.name || `row ${error.row}`}: ${error.message}`)
        .join("; ")}`,
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">School Students</h2>
          <p className="text-sm text-slate-500">
            {classes.length} active classes · {students.length} students.
            Explorer Codes are generated automatically.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setCreateMode("import")}
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700"
          >
            <Upload className="h-4 w-4" />
            Import spreadsheet
          </button>
          <button
            type="button"
            onClick={() => setCreateMode("manual")}
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-bold text-white"
          >
            <UserPlus className="h-4 w-4" />
            Add student
          </button>
        </div>
      </div>

      {directoryError ? (
        <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          Student directory could not be loaded: {directoryError}
        </div>
      ) : null}

      <div className="mb-4 border-b border-slate-200">
        <div className="flex overflow-x-auto" role="tablist" aria-label="Year level">
          {[{ value: "", label: "All" }, ...YEAR_LEVELS.map((year, index) => ({
            value: year,
            label: index === 0 ? "F" : String(index),
          }))].map((year) => (
            <button
              key={year.value || "all"}
              type="button"
              role="tab"
              aria-selected={yearFilter === year.value}
              onClick={() => setYearFilter(year.value)}
              className={`min-w-14 border-b-2 px-4 py-3 text-sm font-bold ${
                yearFilter === year.value
                  ? "border-emerald-700 text-emerald-800"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {year.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
          <label className="relative block w-full max-w-lg">
            <span className="sr-only">Search students</span>
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find student by name or code"
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm"
            />
          </label>
      </div>

      {students.length === 0 && !directoryError ? (
        <EmptyState
          icon={GraduationCap}
          title="No students found"
          detail="Import the school roster or add a student manually. Students can be placed into classes after they are in the directory."
        />
      ) : null}

      {students.length > 0 ? (
        <>
      <div className="hidden overflow-x-auto border border-slate-200 bg-white md:block">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">PIN</th>
              <th className="px-4 py-3">Explorer Code</th>
              <th className="px-4 py-3">Current classes</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="text-sm">
                <td className="px-4 py-4 font-bold text-slate-950">
                  {student.name}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {student.yearLevel ?? "Not set"}
                </td>
                <td className="px-4 py-4 font-mono text-xs text-slate-600">
                  {student.username ?? "Not set"}
                </td>
                <td className="px-4 py-4 capitalize text-slate-600">
                  {student.pinStatus === "set" ? "Set" : "Not set"}
                </td>
                <td className="px-4 py-4">
                  <span className="font-mono font-bold text-slate-900">
                    {student.explorerCode ?? "Pending"}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {student.classes.join(", ") || "Not assigned"}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold capitalize text-slate-600">
                    {student.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={!student.explorerCode}
                      onClick={() =>
                        student.explorerCode
                          ? void copyCode(student.explorerCode)
                          : undefined
                      }
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-2 text-xs font-bold"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      {copiedCode === student.explorerCode ? "Copied" : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetStudent(student)}
                      className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-2 text-xs font-bold text-red-700"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-200 border border-slate-200 bg-white md:hidden">
        {filteredStudents.map((student) => (
          <details key={student.id} className="group px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-bold">{student.name}</span>
                <span className="font-mono text-xs text-slate-500">
                  {student.explorerCode ?? "Code pending"}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400 group-open:rotate-180" />
            </summary>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="font-bold text-slate-500">Year</dt>
                <dd>{student.yearLevel ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">PIN</dt>
                <dd>{student.pinStatus === "set" ? "Set" : "Not set"}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">Username</dt>
                <dd>{student.username ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">Classes</dt>
                <dd>{student.classes.join(", ") || "Not assigned"}</dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                disabled={!student.explorerCode}
                onClick={() =>
                  student.explorerCode
                    ? void copyCode(student.explorerCode)
                    : undefined
                }
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-bold"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
              <button
                type="button"
                onClick={() => setResetStudent(student)}
                className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </details>
        ))}
      </div>

      {filteredStudents.length === 0 ? (
        <p className="border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">
          No students match this search.
        </p>
      ) : null}
        </>
      ) : null}

      {createMode === "manual" ? (
        <Modal title="Add student" onClose={closeCreate}>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">
              First name *
              <input
                value={manualDraft.firstName}
                onChange={(event) =>
                  setManualDraft((current) => ({
                    ...current,
                    firstName: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Last name
              <input
                value={manualDraft.lastName}
                onChange={(event) =>
                  setManualDraft((current) => ({
                    ...current,
                    lastName: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Year level *
              <select
                value={manualDraft.schoolYear}
                onChange={(event) =>
                  setManualDraft((current) => ({
                    ...current,
                    schoolYear: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
              >
                <option value="">Choose year</option>
                {YEAR_LEVELS.map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700">
              Student code / username
              <input
                value={manualDraft.username}
                onChange={(event) =>
                  setManualDraft((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                placeholder="Generated from name if blank"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="text-sm font-bold text-slate-700">
              4-digit access code
              <input
                inputMode="numeric"
                maxLength={4}
                value={manualDraft.pin}
                onChange={(event) =>
                  setManualDraft((current) => ({
                    ...current,
                    pin: event.target.value.replace(/\D/g, "").slice(0, 4),
                  }))
                }
                placeholder="Generated if blank"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
            {importMessage ? (
              <p className="text-sm font-semibold text-red-700 sm:col-span-2">
                {importMessage}
              </p>
            ) : null}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={closeCreate}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  busy ||
                  !manualDraft.firstName.trim() ||
                  !manualDraft.schoolYear ||
                  Boolean(manualDraft.pin && manualDraft.pin.length !== 4)
                }
                onClick={() => void submitManualStudent()}
                className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy ? "Adding..." : "Add student"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {createMode === "import" ? (
        <Modal title="Import students" onClose={closeCreate}>
          <div className="space-y-5 p-6">
            <div className="flex justify-end">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.xlsx"
                onChange={handleRosterFile}
                className="hidden"
              />
              <button
                type="button"
                disabled={readingFile}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-bold text-white disabled:opacity-50"
              >
                <FileSpreadsheet className="h-4 w-4" />
                {readingFile ? "Reading..." : "Choose CSV or Excel"}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Use columns: First Name, Last Name, Year Level, Student Code, and
              Access Code. Student and access codes may be blank and will be
              generated. Explorer Codes are always generated by Level Up Learning.
            </p>
            {importFileName ? (
              <p className="text-xs font-bold text-slate-600">
                {importFileName}
              </p>
            ) : null}
            {importMessage ? (
              <p className="text-sm font-semibold text-slate-700" role="status">
                {importMessage}
              </p>
            ) : null}
            {importRows.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200">
                <table className="min-w-[760px] divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-2 py-2">First name *</th>
                      <th className="px-2 py-2">Last name</th>
                      <th className="px-2 py-2">Year *</th>
                      <th className="px-2 py-2">Student code</th>
                      <th className="px-2 py-2">Access code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {importRows.map((row) => (
                      <tr key={row.id}>
                        <td className="p-1.5">
                          <input
                            value={row.firstName}
                            onChange={(event) =>
                              updateImportRow(
                                row.id,
                                "firstName",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            value={row.lastName}
                            onChange={(event) =>
                              updateImportRow(
                                row.id,
                                "lastName",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5"
                          />
                        </td>
                        <td className="p-1.5">
                          <select
                            value={row.schoolYear}
                            onChange={(event) =>
                              updateImportRow(
                                row.id,
                                "schoolYear",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5"
                          >
                            <option value="">Choose year</option>
                            {YEAR_LEVELS.map((year) => (
                              <option key={year}>{year}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1.5">
                          <input
                            value={row.username}
                            onChange={(event) =>
                              updateImportRow(
                                row.id,
                                "username",
                                event.target.value,
                              )
                            }
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            inputMode="numeric"
                            maxLength={4}
                            value={row.pin}
                            onChange={(event) =>
                              updateImportRow(
                                row.id,
                                "pin",
                                event.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 4),
                              )
                            }
                            className="w-full rounded-md border border-slate-300 px-2 py-1.5"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeCreate}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  busy ||
                  !importRows.some(
                    (row) =>
                      row.firstName.trim() &&
                      YEAR_LEVELS.includes(row.schoolYear) &&
                      (!row.pin || row.pin.length === 4),
                  )
                }
                onClick={() => void submitImport()}
                className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy
                  ? "Adding..."
                  : `Add ${
                      importRows.filter(
                        (row) =>
                          row.firstName.trim() &&
                          YEAR_LEVELS.includes(row.schoolYear) &&
                          (!row.pin || row.pin.length === 4),
                      ).length
                    } students`}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {resetStudent ? (
        <Modal
          title="Reset Explorer Code?"
          onClose={() => {
            setResetStudent(null);
            setResetReason("");
          }}
        >
          <div className="space-y-4 p-6">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-bold">{resetStudent.name}</p>
              <p className="mt-1">
                The old code will stop working immediately. Progress, XP and
                account data will not change.
              </p>
            </div>
            <label className="block text-sm font-bold text-slate-700">
              Reason
              <textarea
                value={resetReason}
                onChange={(event) => setResetReason(event.target.value)}
                rows={3}
                placeholder="Required for the audit record"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setResetStudent(null);
                  setResetReason("");
                }}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !resetReason.trim()}
                onClick={() => void submitReset()}
                className="rounded-md bg-red-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy ? "Resetting..." : "Reset Explorer Code"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

export default function SchoolHomeClient({
  initialSnapshot,
  schools,
}: {
  initialSnapshot: SchoolHomeSnapshot;
  schools: SchoolSwitcherItem[];
}) {
  const router = useRouter();
  const snapshot = initialSnapshot;
  const [tab, setTab] = useState<TabId>("home");
  const activeYear =
    snapshot.academicYears.find((year) => year.status === "active") ??
    snapshot.academicYears[0];
  const [academicYearId, setAcademicYearId] = useState(activeYear?.id ?? "");
  const selectedAcademicYear = snapshot.academicYears.find(
    (year) => year.id === academicYearId,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [assignClass, setAssignClass] = useState<
    SchoolHomeSnapshot["classes"][number] | null
  >(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredClasses = useMemo(
    () =>
      snapshot.classes.filter(
        (classRow) => classRow.academicYearId === academicYearId,
      ),
    [snapshot.classes, academicYearId],
  );
  const myClasses = filteredClasses.filter((classRow) => classRow.myRole);
  const otherClasses = filteredClasses.filter((classRow) => !classRow.myRole);
  const activeStaff = snapshot.staff.filter(
    (staff) => staff.status === "active",
  );
  const isAdministrator = snapshot.permissions.canViewAdministration;
  const schoolLogo = schoolLogoFor(snapshot.school.name);
  const actorFirstName = educatorFirstName(
    snapshot.actor.name,
    snapshot.actor.email,
  );
  const navigationItems = isAdministrator
    ? ADMIN_NAV_ITEMS
    : TEACHER_NAV_ITEMS;
  const myStudentCount = myClasses.reduce(
    (total, classRow) => total + classRow.studentCount,
    0,
  );

  function notify(text: string) {
    setMessage(text);
    setError("");
    window.setTimeout(() => setMessage(""), 3000);
  }

  async function signOut() {
    await fetch("/api/school-preview-session", { method: "DELETE" });
    await supabase.auth.signOut();
    router.replace("/login");
  }

  async function command(
    payload: Record<string, unknown>,
    successMessage: string,
  ) {
    setBusy(true);
    setError("");
    try {
      const result = await sendCommand(snapshot.school.id, payload);
      notify(successMessage);
      router.refresh();
      return result;
    } catch (commandError) {
      setError(
        commandError instanceof Error ? commandError.message : "Action failed",
      );
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function resetExplorerCode(studentId: string, reason: string) {
    const result = await command(
      {
        action: "resetExplorerCode",
        studentId,
        reason,
      },
      "Explorer Code reset",
    );
    return Boolean(result?.explorerCode);
  }

  async function createSchoolStudents(
    students: SchoolStudentDraft[],
  ): Promise<StudentCreateResult> {
    setBusy(true);
    setError("");
    try {
      const result = await sendCommand(snapshot.school.id, {
        action: "createStudents",
        students,
      });
      const created = result.created ?? [];
      const errors = result.errors ?? [];
      if (created.length > 0) {
        notify(
          `${created.length} student${created.length === 1 ? "" : "s"} added`,
        );
        router.refresh();
      }
      return { created, errors };
    } catch (createError) {
      const message =
        createError instanceof Error
          ? createError.message
          : "Students could not be added";
      setError(message);
      return {
        created: [],
        errors: [{ row: 1, name: "", message }],
      };
    } finally {
      setBusy(false);
    }
  }

  const homeStats = [
    {
      label: "Active classes",
      value: filteredClasses.length,
      icon: BookOpen,
    },
    {
      label: "Active students",
      value:
        snapshot.academicYears.find((year) => year.id === academicYearId)
          ?.activeStudentCount ?? 0,
      icon: GraduationCap,
    },
    {
      label: "Active educators",
      value: activeStaff.length,
      icon: Users,
    },
    {
      label: "Academic year",
      value: selectedAcademicYear?.calendarYear ?? "Not set",
      icon: School,
    },
    {
      label: "Pending invitations",
      value: snapshot.invitations.length,
      icon: Mail,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5 px-5 py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {schoolLogo ? (
              <Image
                src={schoolLogo}
                alt={`${snapshot.school.name} logo`}
                width={44}
                height={44}
                priority
                className="h-11 w-11 shrink-0 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-900 text-white">
                <School className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-lg font-bold">
                {snapshot.school.name}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                {isAdministrator
                  ? "School administration"
                  : "Teacher workspace"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {schools.length > 1 ? (
              <label className="relative hidden sm:block">
                <span className="sr-only">Switch school</span>
                <select
                  value={snapshot.school.id}
                  onChange={(event) => {
                    window.location.assign(`/school/${event.target.value}`);
                  }}
                  className="appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-9 text-sm font-semibold"
                >
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
              </label>
            ) : null}
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold">{snapshot.actor.name}</p>
              <p className="text-xs text-slate-500">
                {snapshot.permissions.isLeadingTeacher
                  ? "Leading teacher"
                  : (SCHOOL_ROLE_LABELS[snapshot.actor.role] ??
                    snapshot.actor.role)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white">
              {snapshot.actor.name.slice(0, 1).toUpperCase()}
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-950 lg:hidden"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[220px_1fr]">
        <aside className="border-r border-slate-200 bg-white px-3 py-5">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const selected = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`flex min-w-max items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition ${
                    selected
                      ? "bg-emerald-50 text-emerald-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {item.id === "insights" && isAdministrator ? (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                      Soon
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-6 hidden w-full items-center gap-3 border-t border-slate-200 px-3 pt-5 text-left text-sm font-bold text-slate-500 hover:text-slate-950 lg:flex"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </aside>

        <main className="min-w-0 px-5 py-7 lg:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-emerald-700">
                {tab === "home"
                  ? isAdministrator
                    ? "School overview"
                    : "Teacher home"
                  : tab}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">
                {tab === "home"
                  ? `Welcome, ${actorFirstName}`
                  : navigationItems.find((item) => item.id === tab)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-slate-600">
                Academic year
                <select
                  value={academicYearId}
                  onChange={(event) => setAcademicYearId(event.target.value)}
                  className="ml-2 rounded-md border border-slate-300 bg-white px-3 py-2 font-bold text-slate-900"
                >
                  {snapshot.academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                      {year.status === "active" ? " (Current)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              {tab !== "students" &&
              isAdministrator &&
              snapshot.permissions.canCreateClass ? (
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-2 rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-900"
                >
                  <Plus className="h-4 w-4" />
                  Create class
                </button>
              ) : null}
            </div>
          </div>

          {message ? (
            <div className="mb-5 flex items-center gap-2 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
              <CheckCircle2 className="h-4 w-4" />
              {message}
            </div>
          ) : null}
          {error ? (
            <div className="mb-5 border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              {error}
            </div>
          ) : null}

          {tab === "home" ? (
            isAdministrator ? (
              <div className="space-y-8">
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {homeStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="rounded-md border border-slate-200 bg-white p-5"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-500">
                            {stat.label}
                          </p>
                          <Icon className="h-4 w-4 text-emerald-700" />
                        </div>
                        <p className="mt-3 text-3xl font-bold">{stat.value}</p>
                      </div>
                    );
                  })}
                </section>

                <section>
                  <div className="mb-3">
                    <h2 className="text-lg font-bold">All Classes</h2>
                    <p className="text-sm text-slate-500">
                      All active classes for the selected academic year.
                    </p>
                  </div>
                  <ClassTable
                    classes={filteredClasses}
                    schoolId={snapshot.school.id}
                    onAssign={setAssignClass}
                  />
                </section>

              </div>
            ) : (
              <div className="space-y-8">
                <section className="border-y border-slate-200 py-4">
                  <p className="text-sm font-semibold text-slate-500">
                    {snapshot.school.name} ·{" "}
                    {selectedAcademicYear?.name ?? "Academic year not set"}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {myClasses.length}{" "}
                    {myClasses.length === 1 ? "class" : "classes"} ·{" "}
                    {myStudentCount} students
                  </p>
                </section>

                <section>
                  <div className="mb-3">
                    <h2 className="text-lg font-bold">My Classes</h2>
                    <p className="text-sm text-slate-500">
                      Open your classroom to teach, monitor progress and support
                      students.
                    </p>
                  </div>
                  <TeacherClassCards
                    classes={myClasses}
                    schoolId={snapshot.school.id}
                  />
                </section>

                <section>
                  <div className="mb-1">
                    <h2 className="text-lg font-bold">Other School Classes</h2>
                    <p className="text-sm text-slate-500">
                      Classes across {snapshot.school.name}.
                    </p>
                  </div>
                  <OtherSchoolClasses
                    classes={otherClasses}
                    schoolId={snapshot.school.id}
                  />
                </section>
              </div>
            )
          ) : null}

          {tab === "classes" ? (
            isAdministrator ? (
              <section>
                <ClassTable
                  classes={filteredClasses}
                  schoolId={snapshot.school.id}
                  onAssign={setAssignClass}
                />
              </section>
            ) : (
              <div className="space-y-8">
                <section>
                  <h2 className="mb-3 text-lg font-bold">My Classes</h2>
                  <TeacherClassCards
                    classes={myClasses}
                    schoolId={snapshot.school.id}
                  />
                </section>
                <section>
                  <h2 className="mb-1 text-lg font-bold">
                    Other School Classes
                  </h2>
                  <OtherSchoolClasses
                    classes={otherClasses}
                    schoolId={snapshot.school.id}
                  />
                </section>
              </div>
            )
          ) : null}

          {tab === "students" ? (
            <StudentDirectory
              students={snapshot.students}
              classes={filteredClasses}
              directoryError={snapshot.studentDirectoryError}
              busy={busy}
              onReset={resetExplorerCode}
              onCreate={createSchoolStudents}
            />
          ) : null}

          {tab === "staff" ? (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Active and inactive school staff with their class assignments.
                </p>
                {snapshot.permissions.canInviteStaff ? (
                  <button
                    type="button"
                    onClick={() => setInviteOpen(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white"
                  >
                    <UserPlus className="h-4 w-4" />
                    Invite staff
                  </button>
                ) : null}
              </div>
              <div className="overflow-x-auto border border-slate-200 bg-white">
                <table className="min-w-full divide-y divide-slate-200 text-left">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Staff member</th>
                      <th className="px-5 py-3">School role</th>
                      <th className="px-5 py-3">Assigned classes</th>
                      <th className="px-5 py-3">Status</th>
                      {snapshot.permissions.canManageSchool ? (
                        <th className="px-5 py-3 text-right">Manage</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {snapshot.staff.map((staff) => (
                      <tr key={staff.userId} className="text-sm">
                        <td className="px-5 py-4">
                          <p className="font-bold">{staff.name}</p>
                          <p className="text-xs text-slate-500">{staff.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          {snapshot.permissions.canManageSchool ? (
                            <select
                              defaultValue={staff.role}
                              disabled={busy}
                              onChange={(event) =>
                                void command(
                                  {
                                    action: "changeMemberRole",
                                    userId: staff.userId,
                                    role: event.target.value,
                                  },
                                  "Staff role updated",
                                )
                              }
                              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-semibold"
                            >
                              <option value="school_admin">
                                School administrator
                              </option>
                              <option value="principal">Principal</option>
                              <option value="teacher">Teacher</option>
                              <option value="support_staff">Support staff</option>
                            </select>
                          ) : (
                            SCHOOL_ROLE_LABELS[staff.role] ?? staff.role
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {staff.assignedClasses
                            .map((item) => item.name)
                            .join(", ") || "None"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold capitalize text-slate-600">
                            {staff.status}
                          </span>
                        </td>
                        {snapshot.permissions.canManageSchool ? (
                          <td className="px-5 py-4 text-right">
                            {staff.userId !== snapshot.actor.id &&
                            staff.status === "active" ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  void command(
                                    {
                                      action: "deactivateMember",
                                      userId: staff.userId,
                                    },
                                    "Staff membership deactivated",
                                  )
                                }
                                className="text-xs font-bold text-red-700 hover:underline"
                              >
                                Deactivate
                              </button>
                            ) : null}
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {snapshot.permissions.canManageSchool ? (
                <div>
                  <h2 className="mb-3 text-lg font-bold">
                    Pending invitations
                  </h2>
                  {snapshot.invitations.length ? (
                    <div className="divide-y divide-slate-100 border border-slate-200 bg-white">
                      {snapshot.invitations.map((invitation) => (
                        <div
                          key={invitation.id}
                          className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                        >
                          <div>
                            <p className="text-sm font-bold">
                              {invitation.email}
                            </p>
                            <p className="text-xs text-slate-500">
                              {SCHOOL_ROLE_LABELS[invitation.role]} · expires{" "}
                              {formatSchoolDate(invitation.expiresAt)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void command(
                                  {
                                    action: "resendInvitation",
                                    invitationId: invitation.id,
                                  },
                                  "Invitation refreshed",
                                )
                              }
                              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-bold"
                            >
                              Resend
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void command(
                                  {
                                    action: "revokeInvitation",
                                    invitationId: invitation.id,
                                  },
                                  "Invitation revoked",
                                )
                              }
                              className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700"
                            >
                              Revoke
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Mail}
                      title="No pending invitations"
                      detail="New staff invitations will appear here until accepted or revoked."
                    />
                  )}
                </div>
              ) : null}
            </section>
          ) : null}

          {tab === "insights" ? (
            <EmptyState
              icon={BarChart3}
              title={
                isAdministrator
                  ? "Whole-school insights are coming soon"
                  : "Class insights are available inside each class"
              }
              detail={
                isAdministrator
                  ? "This phase does not invent analytics. Existing class learning data remains in the class dashboard."
                  : "Open a class to view learning trends, assessment summaries and student insights."
              }
            />
          ) : null}

          {tab === "administration" ? (
            <EmptyState
              icon={ShieldCheck}
              title="Administration foundation is ready"
              detail="Imports, rollover, licences and advanced school settings are intentionally reserved for later phases."
            />
          ) : null}

          {tab === "licence" ? (
            <EmptyState
              icon={ShieldCheck}
              title="Licence management is coming later"
              detail="School licensing is reserved for the subscription phase and is not represented with placeholder data."
            />
          ) : null}

          {tab === "settings" ? (
            <EmptyState
              icon={Settings}
              title="Teacher settings are coming soon"
              detail="Account settings will appear here. Class settings remain inside each class."
            />
          ) : null}

          {tab === "support" ? (
            <EmptyState
              icon={HelpCircle}
              title="Support"
              detail="Level Up Learning support options will appear here. No classroom data is changed from this page."
            />
          ) : null}
        </main>
      </div>

      {createOpen ? (
        <CreateClassModal
          snapshot={snapshot}
          initialAcademicYearId={academicYearId}
          busy={busy}
          onClose={() => setCreateOpen(false)}
          onSubmit={async (form) => {
            const result = await command(
              { action: "createClass", ...form },
              "Class created",
            );
            if (result?.classId) {
              setCreateOpen(false);
              router.push(
                `/school/${snapshot.school.id}/classes/${result.classId}`,
              );
            }
          }}
        />
      ) : null}

      {inviteOpen ? (
        <InviteStaffModal
          snapshot={snapshot}
          classes={filteredClasses}
          busy={busy}
          onClose={() => setInviteOpen(false)}
          onSubmit={async (form) => {
            const result = await command(
              { action: "inviteStaff", ...form },
              "Staff invitation created",
            );
            if (result) setInviteOpen(false);
          }}
        />
      ) : null}

      {assignClass ? (
        <AssignStaffModal
          classRow={assignClass}
          staff={activeStaff}
          busy={busy}
          onClose={() => setAssignClass(null)}
          onSubmit={async (form) => {
            const result = await command(
              {
                action: "assignClassStaff",
                classId: assignClass.id,
                ...form,
              },
              "Class staffing updated",
            );
            if (result) setAssignClass(null);
          }}
        />
      ) : null}
    </div>
  );
}

function CreateClassModal({
  snapshot,
  initialAcademicYearId,
  busy,
  onClose,
  onSubmit,
}: {
  snapshot: SchoolHomeSnapshot;
  initialAcademicYearId: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (form: Record<string, unknown>) => Promise<void>;
}) {
  const educators = snapshot.staff.filter(
    (staff) =>
      staff.status === "active" &&
      ["school_admin", "principal", "teacher"].includes(staff.role),
  );
  const [name, setName] = useState("");
  const [classCode, setClassCode] = useState("");
  const [academicYearId, setAcademicYearId] = useState(initialAcademicYearId);
  const [yearLevels, setYearLevels] = useState<string[]>([]);
  const [leadTeacherId, setLeadTeacherId] = useState(snapshot.actor.id);
  const [coTeacherIds, setCoTeacherIds] = useState<string[]>([]);

  return (
    <Modal title="Create class" onClose={onClose}>
      <form
        className="space-y-5 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit({
            name,
            classCode: classCode || createCode(name),
            academicYearId,
            yearLevels,
            leadTeacherId,
            coTeacherIds,
            idempotencyKey: crypto.randomUUID(),
          });
        }}
      >
        <label className="block text-sm font-bold">
          Class name
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 font-medium"
            placeholder="3/4J"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold">
            Academic year
            <select
              value={academicYearId}
              onChange={(event) => setAcademicYearId(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5"
            >
              {snapshot.academicYears.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold">
            Class code
            <div className="mt-2 flex gap-2">
              <input
                value={classCode}
                onChange={(event) =>
                  setClassCode(
                    event.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 10),
                  )
                }
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2.5 font-mono"
                placeholder="Generated automatically"
              />
              <button
                type="button"
                onClick={() => setClassCode(createCode(name))}
                className="rounded-md border border-slate-300 px-3 text-xs font-bold"
              >
                Generate
              </button>
            </div>
          </label>
        </div>
        <label className="block text-sm font-bold">
          Status
          <select
            value="active"
            disabled
            className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-600"
          >
            <option value="active">Active</option>
          </select>
        </label>
        <fieldset>
          <legend className="text-sm font-bold">Year levels</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {YEAR_LEVELS.map((level) => (
              <label
                key={level}
                className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold"
              >
                <input
                  type="checkbox"
                  checked={yearLevels.includes(level)}
                  onChange={() =>
                    setYearLevels((current) =>
                      current.includes(level)
                        ? current.filter((item) => item !== level)
                        : [...current, level],
                    )
                  }
                />
                {level}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="block text-sm font-bold">
          Lead teacher
          <select
            value={leadTeacherId}
            onChange={(event) => setLeadTeacherId(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5"
          >
            {educators.map((staff) => (
              <option key={staff.userId} value={staff.userId}>
                {staff.name}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="text-sm font-bold">
            Co-teachers <span className="font-normal text-slate-400">(optional)</span>
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {educators
              .filter((staff) => staff.userId !== leadTeacherId)
              .map((staff) => (
                <label
                  key={staff.userId}
                  className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold"
                >
                  <input
                    type="checkbox"
                    checked={coTeacherIds.includes(staff.userId)}
                    onChange={() =>
                      setCoTeacherIds((current) =>
                        current.includes(staff.userId)
                          ? current.filter((id) => id !== staff.userId)
                          : [...current, staff.userId],
                      )
                    }
                  />
                  {staff.name}
                </label>
              ))}
          </div>
        </fieldset>
        <div className="flex items-center justify-between border-t border-slate-200 pt-5">
          <p className="text-xs font-semibold text-slate-500">
            Status: Active
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy || !name || !academicYearId || !leadTeacherId}
              className="rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {busy ? "Creating..." : "Create class"}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

function InviteStaffModal({
  snapshot,
  classes,
  busy,
  onClose,
  onSubmit,
}: {
  snapshot: SchoolHomeSnapshot;
  classes: SchoolHomeSnapshot["classes"];
  busy: boolean;
  onClose: () => void;
  onSubmit: (form: Record<string, unknown>) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("teacher");
  const [classId, setClassId] = useState("");

  return (
    <Modal title="Invite staff" onClose={onClose}>
      <form
        className="space-y-5 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit({
            email,
            role,
            classId: classId || null,
            idempotencyKey: crypto.randomUUID(),
          });
        }}
      >
        <label className="block text-sm font-bold">
          Email
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5"
            placeholder="teacher@school.edu.au"
          />
        </label>
        <label className="block text-sm font-bold">
          School role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5"
          >
            <option value="school_admin">School administrator</option>
            <option value="principal">Principal</option>
            <option value="teacher">Teacher</option>
            <option value="support_staff">Support staff</option>
          </select>
        </label>
        <label className="block text-sm font-bold">
          Class assignment{" "}
          <span className="font-normal text-slate-400">(optional)</span>
          <select
            value={classId}
            onChange={(event) => setClassId(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5"
          >
            <option value="">Assign after invitation</option>
            {classes.map((classRow) => (
              <option key={classRow.id} value={classRow.id}>
                {classRow.name}
              </option>
            ))}
          </select>
        </label>
        <p className="rounded-md bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
          A one-time invitation is created securely. Raw invitation tokens are
          never displayed in School Home.
        </p>
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !email}
            className="rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy ? "Inviting..." : `Invite to ${snapshot.school.name}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AssignStaffModal({
  classRow,
  staff,
  busy,
  onClose,
  onSubmit,
}: {
  classRow: SchoolHomeSnapshot["classes"][number];
  staff: SchoolHomeSnapshot["staff"];
  busy: boolean;
  onClose: () => void;
  onSubmit: (form: Record<string, unknown>) => Promise<void>;
}) {
  const [userId, setUserId] = useState(staff[0]?.userId ?? "");
  const [role, setRole] = useState("teacher");

  return (
    <Modal title={`Assign staff to ${classRow.name}`} onClose={onClose}>
      <form
        className="space-y-5 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit({ userId, role });
        }}
      >
        <label className="block text-sm font-bold">
          Staff member
          <select
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5"
          >
            {staff.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.name} · {SCHOOL_ROLE_LABELS[member.role]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold">
          Class role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5"
          >
            <option value="lead_teacher">Lead teacher</option>
            <option value="teacher">Teacher</option>
            <option value="support_staff">Support staff</option>
            <option value="viewer">Viewer</option>
          </select>
        </label>
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !userId}
            className="rounded-md bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {busy ? "Assigning..." : "Assign staff"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
