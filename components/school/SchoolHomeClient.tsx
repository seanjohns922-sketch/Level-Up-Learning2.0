"use client";

import {
  BarChart3,
  Archive,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileSpreadsheet,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Mail,
  Pencil,
  Plus,
  RotateCcw,
  School,
  Search,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  Upload,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  SchoolHomeSnapshot,
  SchoolLicenceSummary,
  SchoolSwitcherItem,
} from "@/lib/school-platform-server";
import { supabase } from "@/lib/supabase";
import {
  readStudentTemplateFile,
  StudentTemplateError,
  templateRowIssue,
  type TemplateStudent,
} from "@/lib/school-student-template";
import { getSchoolLogo } from "@/lib/school-logos";
import { downloadStudentRosterTemplate } from "@/lib/student-roster-template";
import ReliqAdultLogo from "@/components/brand/ReliqAdultLogo";
import HomeTrends from "./HomeTrends";
import MyClassSummary from "./MyClassSummary";
import TeacherClassDashboard from "./TeacherClassDashboard";
import ClassGroupsPanel from "./ClassGroupsPanel";
import { formatClassYearLevels, normalizeClassYearLevels } from "@/lib/studentLevelLabel";

const SchoolAnalyticsDashboard = dynamic(
  () => import("./SchoolAnalyticsDashboard"),
  {
    loading: () => (
      <div className="space-y-5" aria-label="Loading school analytics">
        <div className="h-14 animate-pulse bg-slate-200" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-32 animate-pulse bg-slate-200" />
          ))}
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="h-72 animate-pulse bg-slate-200" />
          <div className="h-72 animate-pulse bg-slate-200" />
        </div>
      </div>
    ),
  },
);

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
  { id: "classes", label: "All classes", icon: BookOpen },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "support", label: "Support", icon: HelpCircle },
];

const EDUCATOR_TITLES = new Set([
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

function inferredEmailNameParts(email: string | null) {
  return (
    email
      ?.split("@")[0]
      ?.split(/[._+-]+/)
      .map((part) => part.replace(/[^a-zA-Z'-]/g, ""))
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()) ??
    []
  );
}

function educatorFullName(name: string, email: string | null) {
  const nameParts = name.trim().split(/\s+/).filter(Boolean);
  const startsWithTitle =
    nameParts.length > 0 &&
    EDUCATOR_TITLES.has(nameParts[0].replace(/\./g, "").toLowerCase());
  const personalNameParts = startsWithTitle ? nameParts.slice(1) : nameParts;

  if (personalNameParts.length > 1 && !personalNameParts[0].includes("@")) {
    return personalNameParts.join(" ");
  }

  const emailNameParts = inferredEmailNameParts(email);
  const storedSurname =
    personalNameParts.length === 1 && !personalNameParts[0].includes("@")
      ? personalNameParts[0]
      : null;

  if (emailNameParts[0] && storedSurname) {
    return emailNameParts[0].toLowerCase() === storedSurname.toLowerCase()
      ? storedSurname
      : `${emailNameParts[0]} ${storedSurname}`;
  }

  if (emailNameParts.length > 1) {
    return `${emailNameParts[0]} ${emailNameParts[1]}`;
  }

  return storedSurname ?? emailNameParts[0] ?? "Educator";
}

function educatorFirstName(name: string, email: string | null) {
  return educatorFullName(name, email).split(/\s+/)[0] ?? "Educator";
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
    studentId?: string;
    firstName?: string;
    lastInitial?: string | null;
    yearLevel?: string | null;
    alreadyAtSchool?: boolean;
    hasHomeAccess?: boolean;
    status?: "active" | "archived";
    deleted?: boolean;
    updated?: boolean;
    invitationId?: string;
    repeatedRequest?: boolean;
    emailDelivery?: "sent" | "unconfigured" | "failed";
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
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
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
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-left">
        <thead className="bg-[#FAFBF8]">
          <tr className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
            <th className="px-5 py-3">Class</th>
            <th className="px-5 py-3">Year levels</th>
            <th className="px-5 py-3">Academic year</th>
            <th className="px-5 py-3">Teachers</th>
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
              <td className="whitespace-nowrap px-5 py-4">
                {formatClassYearLevels(classRow.yearLevels) || "Not set"}
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
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold capitalize text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  {classRow.status}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                  {roleLabel(classRow.myRole)}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  {classRow.canManage ? (
                    <button
                      type="button"
                      onClick={() => onAssign(classRow)}
                      className="whitespace-nowrap rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:border-slate-900"
                    >
                      Manage staff
                    </button>
                  ) : null}
                  {classRow.canOpen ? (
                    <a
                      href={`/school/${schoolId}/classes/${classRow.id}`}
                      className="whitespace-nowrap rounded-lg bg-emerald-800 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-900"
                    >
                      Open class
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
          className="flex min-h-40 flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-950">
                  {classRow.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {formatClassYearLevels(classRow.yearLevels) || "Year level not set"}
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
            Open class
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
                {formatClassYearLevels(classRow.yearLevels) || "Year level not set"}
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
  confirmCreateNew?: boolean;
  duplicateRequestId?: string;
};

type SchoolStudentEditDraft = Omit<SchoolStudentDraft, "pin" | "idempotencyKey">;

type StudentCreateResult = {
  created: Array<Record<string, unknown>>;
  errors: Array<{
    row: number;
    name: string;
    message: string;
    code?: string;
    requestId?: string;
    candidates?: DuplicateCandidate[];
  }>;
};

type DuplicateCandidate = {
  studentId: string;
  firstName: string;
  lastInitial: string | null;
  yearLevel: string | null;
  schoolName: string | null;
  hasHomeAccess: boolean;
};

type ExistingStudentPreview = {
  studentId: string;
  firstName: string;
  lastInitial: string | null;
  yearLevel: string | null;
  alreadyAtSchool: boolean;
  hasHomeAccess: boolean;
};

type ExistingStudentLinkDraft = {
  studentId: string;
  schoolYear: string;
  classId: string;
  reason: string;
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

type SkippedImport = { row: TemplateStudent; requestId: string; matches: string[]; sameSchool: boolean; selected: boolean };

/** "a Year 4 at Cobram Primary School", "a home learner", for the duplicate summary. */
function describeMatch(candidate: DuplicateCandidate): string {
  const who = `${candidate.firstName} ${candidate.lastInitial ?? ""}`.trim();
  const year = candidate.yearLevel ? `${candidate.yearLevel}, ` : "";
  const where = candidate.schoolName ?? (candidate.hasHomeAccess ? "home learner" : "no school");
  return `${who} (${year}${where})`;
}

function StudentDirectory({
  schoolName,
  students,
  classes,
  directoryError,
  directoryLoading,
  busy,
  onReset,
  onArchive,
  onRestore,
  onDelete,
  onUpdate,
  onCreate,
  onPreviewExisting,
  onLinkExisting,
}: {
  schoolName: string;
  students: SchoolHomeSnapshot["students"];
  classes: SchoolHomeSnapshot["classes"];
  directoryError: string | null;
  directoryLoading: boolean;
  busy: boolean;
  onReset: (studentId: string, reason: string) => Promise<boolean>;
  onArchive: (studentId: string) => Promise<boolean>;
  onRestore: (studentId: string) => Promise<boolean>;
  onDelete: (
    studentId: string,
    confirmation: string,
    reason: string,
  ) => Promise<boolean>;
  onUpdate: (
    studentId: string,
    draft: SchoolStudentEditDraft,
  ) => Promise<boolean>;
  onCreate: (students: SchoolStudentDraft[]) => Promise<StudentCreateResult>;
  onPreviewExisting: (
    explorerCode: string,
  ) => Promise<ExistingStudentPreview | null>;
  onLinkExisting: (draft: ExistingStudentLinkDraft) => Promise<boolean>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [createMode, setCreateMode] = useState<"manual" | "link" | "import" | null>(
    null,
  );
  const [manualDraft, setManualDraft] = useState<SchoolStudentDraft>(
    emptyStudentDraft(),
  );
  const [duplicateReview, setDuplicateReview] = useState<{
    requestId: string;
    candidates: DuplicateCandidate[];
  } | null>(null);
  const [importRows, setImportRows] = useState<TemplateStudent[]>([]);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number } | null>(null);
  const [importResult, setImportResult] = useState<{ added: number; skipped: SkippedImport[]; failed: Array<{ name: string; message: string }> } | null>(null);
  const [addingSkipped, setAddingSkipped] = useState(false);
  const [importFileName, setImportFileName] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [linkCode, setLinkCode] = useState("");
  const [linkPreview, setLinkPreview] = useState<ExistingStudentPreview | null>(null);
  const [linkSchoolYear, setLinkSchoolYear] = useState("");
  const [linkClassId, setLinkClassId] = useState("");
  const [linkReason, setLinkReason] = useState("School enrolment");
  const [linkMessage, setLinkMessage] = useState("");
  const [readingFile, setReadingFile] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [resetStudent, setResetStudent] = useState<
    SchoolHomeSnapshot["students"][number] | null
  >(null);
  const [editStudent, setEditStudent] = useState<
    SchoolHomeSnapshot["students"][number] | null
  >(null);
  const [editDraft, setEditDraft] = useState<SchoolStudentEditDraft>({
    firstName: "",
    lastName: "",
    schoolYear: "",
    username: "",
    classId: "",
  });
  const [resetReason, setResetReason] = useState("");
  const [archiveStudent, setArchiveStudent] = useState<
    SchoolHomeSnapshot["students"][number] | null
  >(null);
  const [deleteStudent, setDeleteStudent] = useState<
    SchoolHomeSnapshot["students"][number] | null
  >(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const activeClasses = useMemo(
    () =>
      classes
        .filter((classRow) => classRow.status === "active")
        .sort((left, right) => left.name.localeCompare(right.name)),
    [classes],
  );
  const compatibleClasses = useMemo(
    () =>
      activeClasses
        .filter(
          (classRow) =>
            (!manualDraft.schoolYear ||
              classRow.yearLevels.length === 0 ||
              classRow.yearLevels.includes(manualDraft.schoolYear)),
        ),
    [activeClasses, manualDraft.schoolYear],
  );
  const compatibleLinkClasses = useMemo(
    () =>
      activeClasses.filter(
        (classRow) =>
          !linkSchoolYear ||
          classRow.yearLevels.length === 0 ||
          classRow.yearLevels.includes(linkSchoolYear),
      ),
    [activeClasses, linkSchoolYear],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const yearRank = (yearLevel: string | null) => {
    const index = yearLevel ? YEAR_LEVELS.indexOf(yearLevel) : -1;
    return index === -1 ? YEAR_LEVELS.length : index;
  };
  const filteredStudents = students
    .filter(
      (student) =>
        (showArchived || student.status === "active") &&
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

  if (directoryLoading) {
    return (
      <section aria-busy="true" aria-label="Loading school students">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded-md bg-slate-200" />
        </div>
        <div className="overflow-hidden border border-slate-200 bg-white">
          <div className="h-11 animate-pulse border-b border-slate-200 bg-slate-100" />
          {Array.from({ length: 7 }, (_, index) => (
            <div key={index} className="grid grid-cols-[1.2fr_0.6fr_1fr_1fr] gap-5 border-b border-slate-100 px-4 py-4 last:border-0">
              <div className="h-4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </section>
    );
  }

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

  function openEdit(student: SchoolHomeSnapshot["students"][number]) {
    const [firstName = "", ...lastNameParts] = student.name.trim().split(/\s+/);
    setEditStudent(student);
    setEditDraft({
      firstName,
      lastName: lastNameParts.join(" "),
      schoolYear: student.yearLevel ?? "",
      username: student.username ?? "",
      classId: student.classIds[0] ?? "",
    });
  }

  async function submitEdit() {
    if (!editStudent || !editDraft.firstName.trim() || !editDraft.schoolYear) return;
    const completed = await onUpdate(editStudent.id, editDraft);
    if (completed) setEditStudent(null);
  }

  async function submitArchive() {
    if (!archiveStudent) return;
    const completed = await onArchive(archiveStudent.id);
    if (completed) setArchiveStudent(null);
  }

  async function submitDelete() {
    if (!deleteStudent || deleteConfirmation !== "DELETE" || !deleteReason.trim()) {
      return;
    }
    const completed = await onDelete(
      deleteStudent.id,
      deleteConfirmation,
      deleteReason.trim(),
    );
    if (completed) {
      setDeleteStudent(null);
      setDeleteConfirmation("");
      setDeleteReason("");
    }
  }

  function closeCreate() {
    setCreateMode(null);
    setImportRows([]);
    setImportFileName("");
    setImportMessage("");
    setImportResult(null);
    setManualDraft(emptyStudentDraft());
    setDuplicateReview(null);
    setLinkCode("");
    setLinkPreview(null);
    setLinkSchoolYear("");
    setLinkClassId("");
    setLinkReason("School enrolment");
    setLinkMessage("");
  }

  async function submitManualStudent() {
    const result = await onCreate([manualDraft]);
    if (result.errors.length === 0) {
      closeCreate();
      return;
    }
    const error = result.errors[0];
    if (error?.code === "potential_duplicate" && error.requestId) {
      setDuplicateReview({
        requestId: error.requestId,
        candidates: error.candidates ?? [],
      });
    }
    setImportMessage(error?.message ?? "Student could not be added.");
  }

  async function confirmSeparateStudent() {
    if (!duplicateReview) return;
    const result = await onCreate([
      {
        ...manualDraft,
        confirmCreateNew: true,
        duplicateRequestId: duplicateReview.requestId,
      },
    ]);
    if (result.errors.length === 0) {
      closeCreate();
      return;
    }
    setImportMessage(result.errors[0]?.message ?? "Student could not be added.");
  }

  async function previewExistingStudent() {
    if (!linkCode.trim()) return;
    setLinkMessage("");
    const preview = await onPreviewExisting(linkCode.trim());
    if (!preview) {
      setLinkMessage(
        "We could not verify that Explorer Code. Check the code and try again.",
      );
      return;
    }
    setLinkPreview(preview);
    setLinkSchoolYear(
      preview.yearLevel && YEAR_LEVELS.includes(preview.yearLevel)
        ? preview.yearLevel
        : "",
    );
    setLinkClassId("");
  }

  async function submitExistingStudentLink() {
    if (!linkPreview || !linkSchoolYear) return;
    const completed = await onLinkExisting({
      studentId: linkPreview.studentId,
      schoolYear: linkSchoolYear,
      classId: linkClassId,
      reason: linkReason.trim() || "School enrolment",
    });
    if (completed) closeCreate();
  }

  async function handleRosterFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setReadingFile(true);
    setImportMessage("");
    setImportResult(null);
    setImportFileName(file.name);
    try {
      const rows = await readStudentTemplateFile(file);
      setImportRows(rows);
      setImportMessage(rows.length ? "" : "The Students sheet is empty. Paste your students into it, save, and upload again.");
    } catch (error) {
      setImportRows([]);
      setImportMessage(
        error instanceof StudentTemplateError
          ? error.message
          : "That file couldn't be read. Download the RELIQ template, paste your students in, then upload it.",
      );
    } finally {
      setReadingFile(false);
    }
  }

  function updateImportRow(id: string, field: "firstName" | "lastName" | "schoolYear", value: string) {
    setImportRows((current) => current.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  async function downloadImportTemplate() {
    setDownloadingTemplate(true);
    setImportMessage("");
    try {
      await downloadStudentRosterTemplate();
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Could not create the template.");
    } finally {
      setDownloadingTemplate(false);
    }
  }

  // Sends the list in batches (the server takes up to 100 at a time) so a whole school fits in one upload.
  async function submitImport() {
    const ready = importRows.filter((row) => !templateRowIssue(row, YEAR_LEVELS));
    const added: string[] = [];
    const skipped: SkippedImport[] = [];
    const failed: Array<{ name: string; message: string }> = [];
    setImportProgress({ done: 0, total: ready.length });
    for (let start = 0; start < ready.length; start += 100) {
      const batch = ready.slice(start, start + 100);
      const result = await onCreate(batch.map((row) => ({
        firstName: row.firstName,
        lastName: row.lastName,
        schoolYear: row.schoolYear,
        username: "",
        pin: "",
        classId: "",
        idempotencyKey: crypto.randomUUID(),
      })));
      added.push(...result.created.map((student) => String((student as { name?: string }).name ?? "")));
      for (const error of result.errors) {
        const row = batch[error.row - 1];
        if (error.code === "potential_duplicate" && row && error.requestId) {
          const matches = (error.candidates ?? []).map(describeMatch);
          const sameSchool = (error.candidates ?? []).some((candidate) => candidate.schoolName === schoolName);
          // A match at another school or at home is usually a different child, so it's ticked to add.
          skipped.push({ row, requestId: error.requestId, matches, sameSchool, selected: !sameSchool });
        } else failed.push({ name: error.name, message: error.message });
      }
      setImportProgress({ done: Math.min(ready.length, start + batch.length), total: ready.length });
    }
    setImportProgress(null);
    setImportRows([]);
    setImportResult({ added: added.length, skipped, failed });
  }

  // Adds the skipped students the leader has confirmed are different children.
  async function addSkippedAsNew() {
    if (!importResult) return;
    const chosen = importResult.skipped.filter((item) => item.selected);
    if (!chosen.length) return;
    setAddingSkipped(true);
    let added = 0;
    const failed: Array<{ name: string; message: string }> = [];
    for (let start = 0; start < chosen.length; start += 100) {
      const batch = chosen.slice(start, start + 100);
      const result = await onCreate(batch.map((item) => ({
        firstName: item.row.firstName,
        lastName: item.row.lastName,
        schoolYear: item.row.schoolYear,
        username: "",
        pin: "",
        classId: "",
        idempotencyKey: crypto.randomUUID(),
        confirmCreateNew: true,
        duplicateRequestId: item.requestId,
      })));
      added += result.created.length;
      failed.push(...result.errors.map((error) => ({ name: error.name, message: error.message })));
    }
    setImportResult({
      added: importResult.added + added,
      skipped: importResult.skipped.filter((item) => !item.selected),
      failed: [...importResult.failed, ...failed],
    });
    setAddingSkipped(false);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">School Students</h2>
          <p className="text-sm text-slate-500">
            {classes.length} active classes · {students.filter((student) => student.status === "active").length} active students.
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
            Upload student list
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

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
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
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(event) => setShowArchived(event.target.checked)}
              className="h-4 w-4 accent-emerald-700"
            />
            Show archived
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
                      onClick={() => openEdit(student)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-2 text-xs font-bold text-slate-700"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
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
                    {student.status === "active" ? (
                      <button
                        type="button"
                        onClick={() => setArchiveStudent(student)}
                        className="inline-flex items-center gap-1 rounded-md border border-amber-300 px-2.5 py-2 text-xs font-bold text-amber-800"
                      >
                        <Archive className="h-3.5 w-3.5" />
                        Archive
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void onRestore(student.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-emerald-300 px-2.5 py-2 text-xs font-bold text-emerald-800 disabled:opacity-50"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setDeleteStudent(student)}
                      className="inline-flex items-center gap-1 rounded-md border border-red-300 px-2.5 py-2 text-xs font-bold text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
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
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => openEdit(student)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
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
              {student.status === "active" ? (
                <button
                  type="button"
                  onClick={() => setArchiveStudent(student)}
                  className="inline-flex items-center gap-1 rounded-md border border-amber-300 px-3 py-2 text-xs font-bold text-amber-800"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Archive
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onRestore(student.id)}
                  className="inline-flex items-center gap-1 rounded-md border border-emerald-300 px-3 py-2 text-xs font-bold text-emerald-800 disabled:opacity-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </button>
              )}
              <button
                type="button"
                onClick={() => setDeleteStudent(student)}
                className="inline-flex items-center gap-1 rounded-md border border-red-300 px-3 py-2 text-xs font-bold text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
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
            <div className="flex gap-2 border-b border-slate-200 pb-4 sm:col-span-2">
              <button
                type="button"
                className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-bold text-white"
              >
                Create new
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportMessage("");
                  setCreateMode("link");
                }}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700"
              >
                Link existing
              </button>
            </div>
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
                onChange={(event) => {
                  const schoolYear = event.target.value;
                  setManualDraft((current) => {
                    const selectedClass = classes.find(
                      (classRow) => classRow.id === current.classId,
                    );
                    const classStillMatches =
                      !selectedClass ||
                      !schoolYear ||
                      selectedClass.yearLevels.length === 0 ||
                      selectedClass.yearLevels.includes(schoolYear);
                    return {
                      ...current,
                      schoolYear,
                      classId: classStillMatches ? current.classId : "",
                    };
                  });
                }}
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
            <label className="text-sm font-bold text-slate-700">
              Class (optional)
              <select
                value={manualDraft.classId}
                onChange={(event) =>
                  setManualDraft((current) => ({
                    ...current,
                    classId: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
              >
                <option value="">No class yet</option>
                {compatibleClasses.map((classRow) => (
                  <option key={classRow.id} value={classRow.id}>
                    {classRow.name}
                    {classRow.yearLevels.length
                      ? ` · ${formatClassYearLevels(classRow.yearLevels)}`
                      : ""}
                  </option>
                ))}
              </select>
            </label>
            {importMessage ? (
              <p className="text-sm font-semibold text-red-700 sm:col-span-2">
                {importMessage}
              </p>
            ) : null}
            {duplicateReview ? (
              <div className="space-y-3 rounded-md border border-amber-300 bg-amber-50 p-4 sm:col-span-2">
                <div>
                  <p className="font-bold text-amber-950">Check for an existing account</p>
                  <p className="mt-1 text-sm text-amber-900">
                    A matching name already exists. Link the existing account with its Explorer Code when it is the same child.
                  </p>
                </div>
                <div className="divide-y divide-amber-200 rounded-md border border-amber-200 bg-white">
                  {duplicateReview.candidates.map((candidate) => (
                    <div key={candidate.studentId} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                      <span className="font-bold text-slate-900">
                        {candidate.firstName} {candidate.lastInitial ?? ""}
                      </span>
                      <span className="text-slate-600">
                        {[candidate.yearLevel, candidate.schoolName].filter(Boolean).join(" · ") || "No school details"}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImportMessage("");
                      setCreateMode("link");
                    }}
                    className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-bold text-white"
                  >
                    Link existing account
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void confirmSeparateStudent()}
                    className="rounded-md border border-amber-600 bg-white px-4 py-2 text-sm font-bold text-amber-900 disabled:opacity-50"
                  >
                    This is a different child - create new
                  </button>
                </div>
              </div>
            ) : null}
            <div className="flex justify-end gap-2 sm:col-span-2">
              {!duplicateReview ? (
                <>
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
                </>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}

      {createMode === "link" ? (
        <Modal title="Add student" onClose={closeCreate}>
          <div className="space-y-5 p-6">
            <div className="flex gap-2 border-b border-slate-200 pb-4">
              <button
                type="button"
                onClick={() => {
                  setLinkMessage("");
                  setCreateMode("manual");
                }}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700"
              >
                Create new
              </button>
              <button
                type="button"
                className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-bold text-white"
              >
                Link existing
              </button>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">Find their existing account</h3>
              <p className="mt-1 text-sm text-slate-600">
                Enter the student&apos;s RELIQ Explorer Code. Their
                progress, rewards and home access will stay with them.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex-1 text-sm font-bold text-slate-700">
                Explorer Code
                <input
                  value={linkCode}
                  onChange={(event) => {
                    setLinkCode(event.target.value.toUpperCase());
                    setLinkPreview(null);
                    setLinkMessage("");
                  }}
                  placeholder="LUL-AB12-CD34"
                  autoComplete="off"
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal uppercase"
                />
              </label>
              <button
                type="button"
                disabled={busy || !linkCode.trim()}
                onClick={() => void previewExistingStudent()}
                className="self-end rounded-md bg-emerald-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy ? "Checking..." : "Check code"}
              </button>
            </div>

            {linkMessage ? (
              <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
                {linkMessage}
              </p>
            ) : null}

            {linkPreview ? (
              <>
                <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-bold uppercase text-emerald-800">
                    Account found
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {linkPreview.firstName}
                    {linkPreview.lastInitial ? ` ${linkPreview.lastInitial}.` : ""}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {linkPreview.yearLevel ?? "Year level not set"}
                    {linkPreview.hasHomeAccess ? " · Home access active" : ""}
                  </p>
                  {linkPreview.alreadyAtSchool ? (
                    <p className="mt-2 text-sm font-semibold text-emerald-900">
                      This student is already linked to this school. You can
                      update their class below.
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-bold text-slate-700">
                    Year level *
                    <select
                      value={linkSchoolYear}
                      onChange={(event) => {
                        setLinkSchoolYear(event.target.value);
                        setLinkClassId("");
                      }}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
                    >
                      <option value="">Choose year</option>
                      {YEAR_LEVELS.map((year) => (
                        <option key={year}>{year}</option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm font-bold text-slate-700">
                    Class (optional)
                    <select
                      value={linkClassId}
                      onChange={(event) => setLinkClassId(event.target.value)}
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
                    >
                      <option value="">No class yet</option>
                      {compatibleLinkClasses.map((classRow) => (
                        <option key={classRow.id} value={classRow.id}>
                          {classRow.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <label className="block text-sm font-bold text-slate-700">
                  Reason
                  <input
                    value={linkReason}
                    onChange={(event) => setLinkReason(event.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
                  />
                </label>
              </>
            ) : null}

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={closeCreate}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              {linkPreview ? (
                <button
                  type="button"
                  disabled={busy || !linkSchoolYear}
                  onClick={() => void submitExistingStudentLink()}
                  className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {busy ? "Linking..." : "Link student"}
                </button>
              ) : null}
            </div>
          </div>
        </Modal>
      ) : null}

      {createMode === "import" ? (
        <Modal title="Upload student list" onClose={closeCreate}>
          <div className="space-y-5 p-6">
            <input ref={fileInputRef} type="file" accept=".xlsx" onChange={handleRosterFile} className="hidden" />
            {importResult ? (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[#E3E5E0] p-4"><p className="font-display text-3xl font-black text-[#3D6600]">{importResult.added}</p><p className="text-xs font-semibold text-slate-600">students added</p></div>
                  <div className="rounded-xl border border-[#E3E5E0] p-4"><p className="font-display text-3xl font-black text-[#121314]">{importResult.skipped.length}</p><p className="text-xs font-semibold text-slate-600">already in RELIQ, skipped</p></div>
                  <div className="rounded-xl border border-[#E3E5E0] p-4"><p className={`font-display text-3xl font-black ${importResult.failed.length ? "text-red-700" : "text-[#121314]"}`}>{importResult.failed.length}</p><p className="text-xs font-semibold text-slate-600">couldn&apos;t be added</p></div>
                </div>
                {importResult.skipped.length ? (
                  <div className="rounded-xl border border-[#E3E5E0]">
                    <p className="border-b border-[#E3E5E0] px-4 py-3 text-sm text-slate-700">
                      <b>These names already belong to a student in RELIQ.</b> Tick the ones that are <b>different children</b> and add them. Leave unticked anyone who is already at this school.
                    </p>
                    <ul className="max-h-60 divide-y divide-slate-100 overflow-y-auto">
                      {importResult.skipped.map((item) => (
                        <li key={item.requestId}>
                          <label className="flex cursor-pointer items-start gap-3 px-4 py-2.5 text-sm">
                            <input type="checkbox" className="mt-1 h-4 w-4" checked={item.selected} onChange={(event) => setImportResult((current) => current ? { ...current, skipped: current.skipped.map((entry) => entry.requestId === item.requestId ? { ...entry, selected: event.target.checked } : entry) } : current)} />
                            <span>
                              <b>{item.row.firstName} {item.row.lastName}</b> <span className="text-slate-500">({item.row.schoolYear})</span>
                              <span className={`block text-xs ${item.sameSchool ? "font-semibold text-amber-800" : "text-slate-500"}`}>
                                {item.sameSchool ? "Already at this school · " : ""}Matches {item.matches.join("; ")}
                              </span>
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-end border-t border-[#E3E5E0] px-4 py-3">
                      <button type="button" disabled={addingSkipped || !importResult.skipped.some((item) => item.selected)} onClick={() => void addSkippedAsNew()} className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                        {addingSkipped ? "Adding..." : `Add ${importResult.skipped.filter((item) => item.selected).length} as new students`}
                      </button>
                    </div>
                  </div>
                ) : null}
                {importResult.failed.length ? (
                  <ul className="space-y-1 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {importResult.failed.map((item, index) => <li key={index}><b>{item.name || "A student"}:</b> {item.message}</li>)}
                  </ul>
                ) : null}
                <p className="text-sm text-slate-600">Next: teachers add these students to their classes with <b>Add existing students</b>, then print login cards.</p>
                <div className="flex justify-end"><button type="button" onClick={closeCreate} className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-bold text-white">Done</button></div>
              </div>
            ) : importRows.length === 0 ? (
              <>
                <ol className="space-y-3 text-sm text-slate-700">
                  <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#121314] text-xs font-black text-[#83E300]">1</span><span><b>Download the RELIQ student template.</b> It&apos;s the only file RELIQ accepts.</span></li>
                  <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#121314] text-xs font-black text-[#83E300]">2</span><span><b>Paste your students in:</b> first name, last name and year level, copied from your school system. RELIQ makes the usernames and access codes.</span></li>
                  <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#121314] text-xs font-black text-[#83E300]">3</span><span><b>Save it and upload it here.</b> You&apos;ll check the list before anything is added.</span></li>
                </ol>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={downloadingTemplate} onClick={() => void downloadImportTemplate()} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-emerald-700 bg-white px-4 text-sm font-bold text-emerald-800 disabled:opacity-50">
                    <Download className="h-4 w-4" />{downloadingTemplate ? "Creating..." : "Download template"}
                  </button>
                  <button type="button" disabled={readingFile} onClick={() => fileInputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-emerald-800 px-4 text-sm font-bold text-white disabled:opacity-50">
                    <FileSpreadsheet className="h-4 w-4" />{readingFile ? "Reading..." : "Upload completed template"}
                  </button>
                </div>
                {importMessage ? <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="alert">{importMessage}</p> : null}
              </>
            ) : (
              (() => {
                const issues = importRows.filter((row) => templateRowIssue(row, YEAR_LEVELS));
                const ready = importRows.length - issues.length;
                const byYear = YEAR_LEVELS.map((year) => [year, importRows.filter((row) => row.schoolYear === year && !templateRowIssue(row, YEAR_LEVELS)).length] as const).filter(([, count]) => count > 0);
                return (
                  <>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-bold text-slate-700">{importFileName}</p>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-emerald-800 underline">Upload a different file</button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-[#E3E5E0] p-4"><p className="font-display text-3xl font-black text-[#3D6600]">{ready}</p><p className="text-xs font-semibold text-slate-600">ready to add · {byYear.map(([year, count]) => `${year.replace("Year ", "Y")} ${count}`).join(" · ")}</p></div>
                      <div className={`rounded-xl border p-4 ${issues.length ? "border-red-200 bg-red-50" : "border-[#E3E5E0]"}`}><p className={`font-display text-3xl font-black ${issues.length ? "text-red-700" : "text-[#121314]"}`}>{issues.length}</p><p className="text-xs font-semibold text-slate-600">{issues.length ? "need fixing below (or they'll be left out)" : "need fixing"}</p></div>
                    </div>
                    <p className="text-xs text-slate-500">Students already in RELIQ are recognised when you add them and skipped, so uploading again is safe.</p>
                    {issues.length ? (
                      <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
                        <table className="w-full text-left text-xs">
                          <thead className="sticky top-0 bg-slate-50 font-bold uppercase text-slate-500"><tr><th className="px-2 py-2">First name</th><th className="px-2 py-2">Last name</th><th className="px-2 py-2">Year</th><th className="px-2 py-2">Problem</th></tr></thead>
                          <tbody className="divide-y divide-slate-100">
                            {issues.map((row) => (
                              <tr key={row.id} className="bg-red-50/40">
                                <td className="p-1.5"><input value={row.firstName} onChange={(event) => updateImportRow(row.id, "firstName", event.target.value)} className="w-full rounded-md border border-slate-300 px-2 py-1.5" /></td>
                                <td className="p-1.5"><input value={row.lastName} onChange={(event) => updateImportRow(row.id, "lastName", event.target.value)} className="w-full rounded-md border border-slate-300 px-2 py-1.5" /></td>
                                <td className="p-1.5">
                                  <select value={YEAR_LEVELS.includes(row.schoolYear) ? row.schoolYear : ""} onChange={(event) => updateImportRow(row.id, "schoolYear", event.target.value)} className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5">
                                    <option value="">Choose year</option>
                                    {YEAR_LEVELS.map((year) => <option key={year}>{year}</option>)}
                                  </select>
                                </td>
                                <td className="p-2 font-semibold text-red-700">{templateRowIssue(row, YEAR_LEVELS)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : null}
                    {importProgress ? (
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Adding {importProgress.done} of {importProgress.total}…</p>
                        <span className="mt-1 block h-2 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-emerald-700 transition-all" style={{ width: `${importProgress.total ? (importProgress.done / importProgress.total) * 100 : 0}%` }} /></span>
                      </div>
                    ) : null}
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={closeCreate} disabled={Boolean(importProgress)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold disabled:opacity-50">Cancel</button>
                      <button type="button" disabled={busy || Boolean(importProgress) || ready === 0} onClick={() => void submitImport()} className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                        {importProgress ? "Adding..." : `Add ${ready} student${ready === 1 ? "" : "s"}`}
                      </button>
                    </div>
                  </>
                );
              })()
            )}
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

      {editStudent ? (
        <Modal title={`Edit ${editStudent.name}`} onClose={() => setEditStudent(null)}>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">
              First name *
              <input
                value={editDraft.firstName}
                onChange={(event) =>
                  setEditDraft((current) => ({ ...current, firstName: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Last name
              <input
                value={editDraft.lastName}
                onChange={(event) =>
                  setEditDraft((current) => ({ ...current, lastName: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="text-sm font-bold text-slate-700">
              Year level *
              <select
                value={editDraft.schoolYear}
                onChange={(event) => {
                  const schoolYear = event.target.value;
                  setEditDraft((current) => {
                    const selectedClass = classes.find((row) => row.id === current.classId);
                    const classStillMatches =
                      !selectedClass ||
                      selectedClass.yearLevels.length === 0 ||
                      selectedClass.yearLevels.includes(schoolYear);
                    return {
                      ...current,
                      schoolYear,
                      classId: classStillMatches ? current.classId : "",
                    };
                  });
                }}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
              >
                <option value="">Choose year</option>
                {YEAR_LEVELS.map((year) => <option key={year}>{year}</option>)}
              </select>
            </label>
            <label className="text-sm font-bold text-slate-700">
              Student code / username
              <input
                value={editDraft.username}
                onChange={(event) =>
                  setEditDraft((current) => ({ ...current, username: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="text-sm font-bold text-slate-700 sm:col-span-2">
              Current class
              <select
                value={editDraft.classId}
                onChange={(event) =>
                  setEditDraft((current) => ({ ...current, classId: event.target.value }))
                }
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal"
              >
                <option value="">Not assigned</option>
                {activeClasses
                  .filter(
                    (row) =>
                      row.yearLevels.length === 0 ||
                      row.yearLevels.includes(editDraft.schoolYear),
                  )
                  .map((row) => (
                    <option key={row.id} value={row.id}>{row.name}</option>
                  ))}
              </select>
            </label>
            <p className="text-xs text-slate-500 sm:col-span-2">
              Explorer Code and PIN are unchanged. Use their separate controls when they need resetting.
            </p>
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button
                type="button"
                onClick={() => setEditStudent(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !editDraft.firstName.trim() || !editDraft.schoolYear}
                onClick={() => void submitEdit()}
                className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {archiveStudent ? (
        <Modal
          title={`Archive ${archiveStudent.name}?`}
          onClose={() => setArchiveStudent(null)}
        >
          <div className="space-y-5 p-6">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              The student will be removed from active classes and school access, but their progress and history will be preserved. You can restore them later.
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setArchiveStudent(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void submitArchive()}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              >
                {busy ? "Archiving..." : "Archive student"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {deleteStudent ? (
        <Modal
          title={`Permanently delete ${deleteStudent.name}?`}
          onClose={() => {
            setDeleteStudent(null);
            setDeleteConfirmation("");
            setDeleteReason("");
          }}
        >
          <div className="space-y-5 p-6">
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-900">
              This permanently removes the student, login identity, progress, rewards, assessment history, and reports. This cannot be undone.
            </div>
            <label className="block text-sm font-bold text-slate-700">
              Reason for deletion
              <input
                value={deleteReason}
                onChange={(event) => setDeleteReason(event.target.value)}
                placeholder="For example: duplicate student record"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              Type DELETE to confirm
              <input
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                autoComplete="off"
                className="mt-1 w-full rounded-md border border-red-300 px-3 py-2 font-mono font-bold"
              />
            </label>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteStudent(null);
                  setDeleteConfirmation("");
                  setDeleteReason("");
                }}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  busy ||
                  deleteConfirmation !== "DELETE" ||
                  !deleteReason.trim()
                }
                onClick={() => void submitDelete()}
                className="rounded-md bg-red-700 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Deleting..." : "Delete permanently"}
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
  const [directoryStudents, setDirectoryStudents] = useState(initialSnapshot.students);
  const [directoryError, setDirectoryError] = useState<string | null>(initialSnapshot.studentDirectoryError);
  const [directoryState, setDirectoryState] = useState<"idle" | "loading" | "ready">(
    initialSnapshot.students.length > 0 ? "ready" : "idle",
  );
  const [licences, setLicences] = useState<SchoolLicenceSummary[]>([]);
  const [licenceState, setLicenceState] = useState<"idle" | "loading" | "ready">("idle");
  const [licenceError, setLicenceError] = useState<string | null>(null);
  const snapshot = useMemo(
    () => ({
      ...initialSnapshot,
      classes: initialSnapshot.classes.map((classRow) => ({
        ...classRow,
        yearLevels: normalizeClassYearLevels(classRow.yearLevels),
      })),
      students: directoryStudents,
      studentDirectoryError: directoryError,
    }),
    [directoryError, directoryStudents, initialSnapshot],
  );
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

  const loadStudentDirectory = useCallback(async () => {
    setDirectoryState("loading");
    setDirectoryError(null);
    try {
      const response = await fetch(`/api/school/${initialSnapshot.school.id}/students`, {
        cache: "no-store",
      });
      const result = (await response.json().catch(() => null)) as
        | { students?: SchoolHomeSnapshot["students"]; error?: string }
        | null;
      if (!response.ok || !result?.students) {
        throw new Error(result?.error ?? "The school student directory could not be loaded.");
      }
      setDirectoryStudents(result.students);
    } catch (loadError) {
      setDirectoryError(
        loadError instanceof Error
          ? loadError.message
          : "The school student directory could not be loaded.",
      );
    } finally {
      setDirectoryState("ready");
    }
  }, [initialSnapshot.school.id]);

  useEffect(() => {
    if (tab === "students" && directoryState === "idle") {
      void loadStudentDirectory();
    }
  }, [directoryState, loadStudentDirectory, tab]);

  const loadLicenceSummaries = useCallback(async () => {
    setLicenceState("loading");
    setLicenceError(null);
    try {
      const response = await fetch(`/api/school/${initialSnapshot.school.id}/licence`, {
        cache: "no-store",
      });
      const result = (await response.json().catch(() => null)) as
        | { licences?: SchoolLicenceSummary[]; error?: string }
        | null;
      if (!response.ok || !result?.licences) {
        throw new Error(result?.error ?? "Licence information could not be loaded.");
      }
      setLicences(result.licences);
    } catch (loadError) {
      setLicenceError(
        loadError instanceof Error
          ? loadError.message
          : "Licence information could not be loaded.",
      );
    } finally {
      setLicenceState("ready");
    }
  }, [initialSnapshot.school.id]);

  useEffect(() => {
    if ((tab === "licence" || tab === "administration" || (tab === "home" && snapshot.permissions.canViewAdministration)) && licenceState === "idle") {
      void loadLicenceSummaries();
    }
  }, [licenceState, loadLicenceSummaries, snapshot.permissions.canViewAdministration, tab]);

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
  const schoolLogo = getSchoolLogo({ name: snapshot.school.name });
  const actorFirstName = educatorFirstName(
    snapshot.actor.name,
    snapshot.actor.email,
  );
  const actorFullName = educatorFullName(
    snapshot.actor.name,
    snapshot.actor.email,
  );
  const navigationItems = isAdministrator
    ? ADMIN_NAV_ITEMS
    : TEACHER_NAV_ITEMS;
  const selectedLicence = licences.find(
    (licence) => licence.academicYearId === academicYearId,
  );
  const selectedYearEnrolments = selectedAcademicYear?.activeStudentCount ?? 0;
  const unlicensedEnrolments = selectedLicence
    ? Math.max(selectedYearEnrolments - selectedLicence.used, 0)
    : 0;
  const selectedYearInvitations = snapshot.invitations.filter(
    (invitation) => invitation.status === "pending",
  );
  const administratorStaff = snapshot.staff.filter(
    (staff) =>
      staff.role === "school_admin" ||
      staff.role === "principal" ||
      staff.userId === snapshot.actor.id,
  );
  const administrationReadiness = [
    {
      label: "Classes",
      value: filteredClasses.length,
      detail:
        filteredClasses.length === 0
          ? "Create the first class for this academic year."
          : `${filteredClasses.length} active ${filteredClasses.length === 1 ? "class" : "classes"}`,
      icon: BookOpen,
      state: filteredClasses.length > 0 ? "ready" : "attention",
    },
    {
      label: "Students",
      value: selectedYearEnrolments,
      detail:
        selectedYearEnrolments === 0
          ? "Add or import student accounts."
          : `${selectedYearEnrolments} enrolled ${selectedYearEnrolments === 1 ? "student" : "students"}`,
      icon: GraduationCap,
      state: selectedYearEnrolments > 0 ? "ready" : "attention",
    },
    {
      label: "Staff",
      value: activeStaff.length,
      detail:
        activeStaff.length === 0
          ? "Invite teachers and support staff."
          : `${activeStaff.length} active staff ${activeStaff.length === 1 ? "member" : "members"}`,
      icon: Users,
      state: activeStaff.length > 0 ? "ready" : "attention",
    },
    {
      label: "Licence",
      value:
        licenceState !== "ready"
          ? "..."
          : selectedLicence
            ? `${selectedLicence.available} free`
            : "Missing",
      detail:
        licenceState !== "ready"
          ? "Loading school access."
          : selectedLicence
            ? `${selectedLicence.used}/${selectedLicence.seatLimit} licences in use`
            : "No licence for the selected academic year.",
      icon: ShieldCheck,
      state: selectedLicence ? "ready" : "attention",
    },
  ];

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
    successMessage: string | ((result: Awaited<ReturnType<typeof sendCommand>>) => string),
  ) {
    setBusy(true);
    setError("");
    try {
      const result = await sendCommand(snapshot.school.id, payload);
      notify(typeof successMessage === "function" ? successMessage(result) : successMessage);
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
    if (result?.explorerCode) await loadStudentDirectory();
    return Boolean(result?.explorerCode);
  }

  async function refreshStudentLifecycleData() {
    await Promise.all([
      loadStudentDirectory(),
      licenceState === "ready" ? loadLicenceSummaries() : Promise.resolve(),
    ]);
  }

  async function archiveSchoolStudent(studentId: string) {
    const result = await command(
      { action: "archiveStudent", studentId },
      "Student archived",
    );
    if (result?.status === "archived") {
      await refreshStudentLifecycleData();
      return true;
    }
    return false;
  }

  async function updateSchoolStudent(
    studentId: string,
    draft: SchoolStudentEditDraft,
  ) {
    const result = await command(
      { action: "updateStudent", studentId, ...draft },
      "Student updated",
    );
    if (result?.updated === true) {
      await loadStudentDirectory();
      return true;
    }
    return false;
  }

  async function restoreSchoolStudent(studentId: string) {
    const result = await command(
      { action: "restoreStudent", studentId },
      "Student restored",
    );
    if (result?.status === "active") {
      await refreshStudentLifecycleData();
      return true;
    }
    return false;
  }

  async function deleteSchoolStudent(
    studentId: string,
    confirmation: string,
    reason: string,
  ) {
    const result = await command(
      { action: "deleteStudent", studentId, confirmation, reason },
      "Student permanently deleted",
    );
    if (result?.deleted === true) {
      await refreshStudentLifecycleData();
      return true;
    }
    return false;
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
        await loadStudentDirectory();
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

  async function previewExistingSchoolStudent(
    explorerCode: string,
  ): Promise<ExistingStudentPreview | null> {
    const result = await command(
      { action: "previewExistingStudent", explorerCode },
      "Student account verified",
    );
    if (!result?.studentId) return null;
    return {
      studentId: String(result.studentId),
      firstName: String(result.firstName ?? "Student"),
      lastInitial:
        typeof result.lastInitial === "string" && result.lastInitial
          ? result.lastInitial
          : null,
      yearLevel:
        typeof result.yearLevel === "string" && result.yearLevel
          ? result.yearLevel
          : null,
      alreadyAtSchool: result.alreadyAtSchool === true,
      hasHomeAccess: result.hasHomeAccess === true,
    };
  }

  async function linkExistingSchoolStudent(
    draft: ExistingStudentLinkDraft,
  ) {
    const result = await command(
      { action: "linkExistingStudent", ...draft },
      "Existing student linked",
    );
    if (!result?.studentId) return false;
    await refreshStudentLifecycleData();
    return true;
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
      label: "Pending invitations",
      value: snapshot.invitations.length,
      icon: Mail,
    },
  ];

  const roleLine = snapshot.permissions.isLeadingTeacher
    ? "Leading teacher"
    : (SCHOOL_ROLE_LABELS[snapshot.actor.role] ?? snapshot.actor.role);

  return (
    <div className="reliq-adult min-h-screen text-slate-950 lg:flex">
      <aside className="flex flex-col gap-5 bg-[#121314] px-4 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:w-[264px] lg:shrink-0 lg:gap-7 lg:overflow-y-auto lg:py-7">
        <div className="flex items-center justify-between gap-3 px-2">
          <div>
            <ReliqAdultLogo className="w-[118px]" />
            <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8F948C]">
              {isAdministrator ? "For admin" : "For teachers"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#34373A] text-[#C9CCC6] hover:bg-[#222426] hover:text-white lg:hidden"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {schools.length > 1 ? (
          <label className="relative block px-1">
            <span className="sr-only">Switch school</span>
            <select
              value={snapshot.school.id}
              onChange={(event) => {
                window.location.assign(`/school/${event.target.value}`);
              }}
              className="w-full appearance-none rounded-lg border border-[#34373A] bg-[#1C1E20] py-2.5 pl-3 pr-9 text-sm font-semibold text-white"
            >
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-3 h-4 w-4 text-[#8F948C]" />
          </label>
        ) : null}

        <nav aria-label={isAdministrator ? "School administration" : "Teacher"} className="-mx-1 flex shrink-0 gap-1 overflow-x-auto px-1 lg:flex-col lg:overflow-visible">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const selected = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                aria-current={selected ? "page" : undefined}
                className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-semibold transition ${
                  selected
                    ? "bg-[var(--reliq-lime)] text-[#121314]"
                    : "text-[#C9CCC6] hover:bg-[#222426] hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto hidden flex-col gap-4 lg:flex">
          <div className="rounded-xl border border-[#2A2C2E] bg-[#1C1E20] p-4">
            <div className="flex h-24 items-center justify-center rounded-lg bg-white p-3">
              {schoolLogo ? (
                <Image
                  src={schoolLogo.src}
                  alt={schoolLogo.alt}
                  width={160}
                  height={80}
                  priority
                  className="h-full w-auto max-w-full object-contain"
                />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#121314] text-2xl font-black text-[var(--reliq-lime)]">
                  {snapshot.school.name.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>
            <p className="mt-3 font-bold leading-snug">{snapshot.school.name}</p>
            <p className="mt-0.5 text-sm text-[#8F948C]">
              {selectedAcademicYear?.name ?? "Academic year not set"}
            </p>
          </div>

          <div className="flex items-center gap-3 border-t border-[#2A2C2E] px-1 pt-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2A2C2E] text-sm font-bold">
              {actorFullName.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold">{actorFullName}</span>
              <span className="block truncate text-xs text-[#8F948C]">{roleLine}</span>
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#C9CCC6] hover:bg-[#222426] hover:text-white"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-7 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                {tab === "home"
                  ? isAdministrator
                    ? "School overview"
                    : "Teacher home"
                  : snapshot.school.name}
              </p>
              <h1 className="mt-1.5 font-display text-3xl font-black tracking-tight sm:text-4xl">
                {tab === "home"
                  ? `Welcome, ${actorFirstName}`
                  : navigationItems.find((item) => item.id === tab)?.label}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                Academic year
                <select
                  value={academicYearId}
                  onChange={(event) => setAcademicYearId(event.target.value)}
                  className="h-11 rounded-lg border border-slate-300 bg-white px-3 font-bold text-slate-900"
                >
                  {snapshot.academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                      {year.status === "active" ? " (Current)" : ""}
                    </option>
                  ))}
                </select>
              </label>
              {(tab === "home" || tab === "classes") &&
              isAdministrator &&
              snapshot.permissions.canCreateClass ? (
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--reliq-lime)] px-4 text-sm font-bold text-[#121314] hover:bg-[var(--reliq-lime-hover)]"
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
                <section className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
                  {homeStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-slate-200 bg-white p-5"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-[15px] font-medium text-slate-500">
                            {stat.label}
                          </p>
                          <Icon className="h-[18px] w-[18px] text-slate-400" />
                        </div>
                        <p className="mt-3 font-display text-4xl font-black tracking-tight">{stat.value}</p>
                      </div>
                    );
                  })}
                </section>

                <section>
                  <div className="mb-3">
                    <h2 className="text-xl font-extrabold tracking-tight">Classes</h2>
                    <p className="text-sm text-slate-500">
                      Active classes for the selected academic year.
                    </p>
                  </div>
                  <ClassTable
                    classes={filteredClasses}
                    schoolId={snapshot.school.id}
                    onAssign={setAssignClass}
                  />
                </section>

                <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
                  {academicYearId ? (
                    <HomeTrends
                      schoolId={snapshot.school.id}
                      academicYearId={academicYearId}
                      title="Topics to watch"
                      subtitle="Whole school, by year level · last 28 days"
                      onOpenAnalytics={() => setTab("insights")}
                    />
                  ) : null}
                  <section className="rounded-2xl bg-[#121314] p-6 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--reliq-lime)]">Licence</p>
                    <p className="mt-2 font-display text-2xl font-black">
                      {licenceState !== "ready"
                        ? "Loading…"
                        : selectedLicence
                          ? `${selectedLicence.used} of ${selectedLicence.seatLimit} in use`
                          : "No licence for this year"}
                    </p>
                    <p className="mt-1 text-sm text-[#B5B9B2]">
                      {licenceState === "ready" && selectedLicence
                        ? `${selectedLicence.available} free${unlicensedEnrolments ? ` · ${unlicensedEnrolments} students without a licence` : ""}`
                        : "School access for the selected academic year."}
                    </p>
                    <button
                      type="button"
                      onClick={() => setTab("licence")}
                      className="mt-4 text-sm font-bold text-[var(--reliq-lime)] hover:underline"
                    >
                      Manage licence
                    </button>
                  </section>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {myClasses.length === 0 ? (
                  <MyClassSummary
                    schoolId={snapshot.school.id}
                    academicYearId={academicYearId}
                    classes={myClasses}
                    allClasses={filteredClasses}
                  />
                ) : academicYearId ? (
                  myClasses.slice(0, 3).map((classRow) => (
                    <TeacherClassDashboard
                      key={classRow.id}
                      schoolId={snapshot.school.id}
                      academicYearId={academicYearId}
                      classRow={classRow}
                      allClasses={filteredClasses}
                    />
                  ))
                ) : null}

                {otherClasses.length > 0 ? (
                  <p className="text-sm text-slate-500">
                    Covering for someone?{" "}
                    <button
                      type="button"
                      onClick={() => setTab("classes")}
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      See all {filteredClasses.length} classes at {snapshot.school.name}
                    </button>
                  </p>
                ) : null}
              </div>
            )
          ) : null}

          {tab === "classes" ? (
            isAdministrator ? (
              <div className="space-y-8">
                <section>
                  <ClassTable
                    classes={filteredClasses}
                    schoolId={snapshot.school.id}
                    onAssign={setAssignClass}
                  />
                </section>
                {academicYearId ? (
                  <ClassGroupsPanel
                    schoolId={snapshot.school.id}
                    academicYearId={academicYearId}
                    classes={filteredClasses}
                    onSaved={notify}
                  />
                ) : null}
              </div>
            ) : (
              <div className="space-y-8">
                <section>
                  <h2 className="mb-3 text-xl font-extrabold tracking-tight">My classes</h2>
                  <TeacherClassCards
                    classes={myClasses}
                    schoolId={snapshot.school.id}
                  />
                </section>
                <section>
                  <h2 className="mb-1 text-xl font-extrabold tracking-tight">
                    Other classes
                  </h2>
                  <p className="mb-2 text-sm text-slate-500">
                    You can open any class to help or cover. Ask your school administrator to add you to a class if you need to make changes.
                  </p>
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
              schoolName={snapshot.school.name}
              students={snapshot.students}
              classes={filteredClasses}
              directoryError={snapshot.studentDirectoryError}
              directoryLoading={directoryState !== "ready"}
              busy={busy}
              onReset={resetExplorerCode}
              onArchive={archiveSchoolStudent}
              onRestore={restoreSchoolStudent}
              onDelete={deleteSchoolStudent}
              onUpdate={updateSchoolStudent}
              onCreate={createSchoolStudents}
              onPreviewExisting={previewExistingSchoolStudent}
              onLinkExisting={linkExistingSchoolStudent}
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
                                  (result) => result.emailDelivery === "sent"
                                    ? "Invitation email resent"
                                    : result.emailDelivery === "unconfigured"
                                      ? "Invitation refreshed, but email sending is not configured"
                                      : "Invitation refreshed, but the email could not be sent",
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
            academicYearId ? (
              <SchoolAnalyticsDashboard
                schoolId={snapshot.school.id}
                academicYearId={academicYearId}
                classes={filteredClasses}
                audience={isAdministrator ? "leadership" : "teacher"}
                academicYearStart={selectedAcademicYear?.startsOn}
                teacherClassIds={myClasses.map((classRow) => classRow.id)}
                schoolName={snapshot.school.name}
                schoolLogo={schoolLogo}
              />
            ) : (
              <EmptyState
                icon={BarChart3}
                title="Select an academic year"
                detail="School analytics require an academic year before canonical learning evidence can be loaded."
              />
            )
          ) : null}

          {tab === "administration" ? (
            <section className="space-y-6">
              <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-4">
                      {schoolLogo ? (
                        <Image
                          src={schoolLogo.src}
                          alt={schoolLogo.alt}
                          width={72}
                          height={72}
                          className="h-[72px] w-[72px] shrink-0 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-md bg-emerald-900 text-white">
                          <School className="h-8 w-8" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                          School profile
                        </p>
                        <h2 className="mt-1 truncate text-2xl font-bold text-slate-950">
                          {snapshot.school.name}
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                          {[snapshot.school.state, snapshot.school.sector]
                            .filter(Boolean)
                            .join(" · ") || "School region not set"}
                        </p>
                      </div>
                    </div>
                    <span className="w-fit rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-bold capitalize text-emerald-800">
                      {snapshot.school.status}
                    </span>
                  </div>

                  <dl className="mt-6 grid gap-4 border-t border-slate-200 pt-5 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-slate-500">Academic year</dt>
                      <dd className="mt-1 font-bold">
                        {selectedAcademicYear?.name ?? "Not set"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Starts</dt>
                      <dd className="mt-1 font-bold">
                        {selectedAcademicYear
                          ? formatSchoolDate(selectedAcademicYear.startsOn)
                          : "Not set"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Ends</dt>
                      <dd className="mt-1 font-bold">
                        {selectedAcademicYear
                          ? formatSchoolDate(selectedAcademicYear.endsOn)
                          : "Not set"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="border border-slate-200 bg-white p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
                    Quick actions
                  </p>
                  <div className="mt-4 grid gap-3">
                    {snapshot.permissions.canCreateClass ? (
                      <button
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 text-left text-sm font-bold hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <span className="inline-flex items-center gap-3">
                          <Plus className="h-4 w-4 text-emerald-700" />
                          Create class
                        </span>
                        <span className="text-xs text-slate-500">
                          {selectedAcademicYear?.name ?? "Selected year"}
                        </span>
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setTab("students")}
                      className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 text-left text-sm font-bold hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      <span className="inline-flex items-center gap-3">
                        <GraduationCap className="h-4 w-4 text-emerald-700" />
                        Add or import students
                      </span>
                      <span className="text-xs text-slate-500">
                        Students tab
                      </span>
                    </button>
                    {snapshot.permissions.canInviteStaff ? (
                      <button
                        type="button"
                        onClick={() => setInviteOpen(true)}
                        className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 text-left text-sm font-bold hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <span className="inline-flex items-center gap-3">
                          <UserPlus className="h-4 w-4 text-emerald-700" />
                          Invite staff
                        </span>
                        <span className="text-xs text-slate-500">
                          {selectedYearInvitations.length} pending
                        </span>
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setTab("licence")}
                      className="flex items-center justify-between rounded-md border border-slate-200 px-4 py-3 text-left text-sm font-bold hover:border-emerald-300 hover:bg-emerald-50"
                    >
                      <span className="inline-flex items-center gap-3">
                        <ShieldCheck className="h-4 w-4 text-emerald-700" />
                        View licence
                      </span>
                      <span className="text-xs text-slate-500">
                        Access summary
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {administrationReadiness.map((item) => {
                  const Icon = item.icon;
                  const ready = item.state === "ready";
                  return (
                    <div
                      key={item.label}
                      className="border border-slate-200 bg-white p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-md ${ready ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className={`rounded-md px-2 py-1 text-xs font-bold ${ready ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
                          {ready ? "Ready" : "Needs setup"}
                        </span>
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                        {item.value}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">{item.detail}</p>
                    </div>
                  );
                })}
              </div>

              {academicYearId ? (
                <ClassGroupsPanel
                  schoolId={snapshot.school.id}
                  academicYearId={academicYearId}
                  classes={filteredClasses}
                  onSaved={notify}
                />
              ) : null}

              <div className="grid gap-5 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="font-bold">School administrators</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      People who can manage classes, staff and school setup.
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {administratorStaff.map((staff) => (
                      <div
                        key={staff.userId}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                      >
                        <div>
                          <p className="text-sm font-bold">{staff.name}</p>
                          <p className="text-xs text-slate-500">
                            {staff.email ?? "No email"} ·{" "}
                            {SCHOOL_ROLE_LABELS[staff.role] ?? staff.role}
                          </p>
                        </div>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold capitalize text-slate-600">
                          {staff.status}
                        </span>
                      </div>
                    ))}
                    {administratorStaff.length === 0 ? (
                      <p className="px-5 py-6 text-sm text-amber-800">
                        No active school administrator is listed.
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="font-bold">Pending staff invitations</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Invitations that still need to be accepted.
                    </p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {selectedYearInvitations.slice(0, 5).map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                      >
                        <div>
                          <p className="text-sm font-bold">
                            {invitation.email}
                          </p>
                          <p className="text-xs text-slate-500">
                            {SCHOOL_ROLE_LABELS[invitation.role] ??
                              invitation.role}{" "}
                            · expires {formatSchoolDate(invitation.expiresAt)}
                          </p>
                        </div>
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                    ))}
                    {selectedYearInvitations.length === 0 ? (
                      <p className="px-5 py-6 text-sm text-slate-500">
                        No pending invitations.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {unlicensedEnrolments > 0 ? (
                <div className="border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                  <p className="font-bold">Licence reconciliation required</p>
                  <p className="mt-1">
                    {unlicensedEnrolments} enrolled student{unlicensedEnrolments === 1 ? " does" : "s do"} not currently hold an active school licence for {selectedAcademicYear?.name ?? "this academic year"}.
                  </p>
                </div>
              ) : null}
            </section>
          ) : null}

          {tab === "licence" ? (
            licenceState !== "ready" ? (
              <div className="space-y-5" aria-busy="true" aria-label="Loading licence information">
                <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
                <div className="grid gap-4 sm:grid-cols-3">
                  {Array.from({ length: 3 }, (_, index) => (
                    <div key={index} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />
                  ))}
                </div>
              </div>
            ) : licenceError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-800" role="alert">
                {licenceError}
                <button
                  type="button"
                  onClick={() => {
                    setLicenceState("idle");
                    setLicenceError(null);
                  }}
                  className="ml-3 underline"
                >
                  Try again
                </button>
              </div>
            ) : selectedLicence ? (
              <section className="space-y-5">
                <div className="flex flex-col justify-between gap-4 border border-slate-200 bg-white p-5 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">School access</p>
                      <h2 className="mt-1 text-xl font-bold text-slate-950">{selectedLicence.academicYear} licence</h2>
                    </div>
                  </div>
                  <span className={`w-fit rounded-md px-3 py-1.5 text-sm font-bold capitalize ${selectedLicence.status === "trial" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                    {selectedLicence.status}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Student licences", value: selectedLicence.seatLimit },
                    { label: "Licences in use", value: selectedLicence.used },
                    { label: "Available", value: selectedLicence.available },
                  ].map((item) => (
                    <div key={item.label} className="border border-slate-200 bg-white p-5">
                      <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                      <p className="mt-3 text-4xl font-black tracking-tight text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-4 text-sm font-bold text-slate-700">
                    <span>Licence utilisation</span>
                    <span>{selectedLicence.utilisationPercent}%</span>
                  </div>
                  <div className="mt-3 h-3 overflow-hidden rounded-sm bg-slate-200">
                    <div
                      className="h-full bg-emerald-600"
                      style={{ width: `${Math.min(selectedLicence.utilisationPercent, 100)}%` }}
                    />
                  </div>
                  <dl className="mt-5 grid gap-4 border-t border-slate-200 pt-5 text-sm sm:grid-cols-3">
                    <div><dt className="text-slate-500">Starts</dt><dd className="mt-1 font-bold">{formatSchoolDate(selectedLicence.startDate)}</dd></div>
                    <div><dt className="text-slate-500">Ends</dt><dd className="mt-1 font-bold">{formatSchoolDate(selectedLicence.endDate)}</dd></div>
                    <div><dt className="text-slate-500">Access type</dt><dd className="mt-1 font-bold capitalize">{selectedLicence.billingStatus}</dd></div>
                  </dl>
                </div>

                {unlicensedEnrolments > 0 ? (
                  <div className="border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                    <p className="font-bold">Licence reconciliation required</p>
                    <p className="mt-1">
                      {unlicensedEnrolments} enrolled student{unlicensedEnrolments === 1 ? " does" : "s do"} not currently hold an active school licence. Licence totals shown here match Platform Admin.
                    </p>
                  </div>
                ) : null}
              </section>
            ) : (
              <EmptyState
                icon={ShieldCheck}
                title="No licence for this academic year"
                detail="Contact RELIQ to configure school access for the selected academic year."
              />
            )
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
              detail="RELIQ support options will appear here. No classroom data is changed from this page."
            />
          ) : null}
        </div>
      </main>

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
              (response) => response.emailDelivery === "sent"
                ? "Staff invitation created and emailed"
                : response.emailDelivery === "unconfigured"
                  ? "Staff invitation created, but email sending is not configured"
                  : "Staff invitation created, but the email could not be sent",
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
