"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowLeft, ArrowUp, ArrowUpDown, Check, ChevronRight, Lock, MoreHorizontal, X } from "lucide-react";
import { reliqRealmColor } from "@/components/brand/ReliqRealmLogo";
import ReliqAdultLogo from "@/components/brand/ReliqAdultLogo";
import { LEVEL_CATALOG as BASE_LEVEL_CATALOG } from "@/lib/level-catalog";
import { LEVEL7_LIVE } from "@/lib/level7-release";
import { cave7Realm } from "@/lib/cave7-config";

// Once Level 7 is live, teachers can also place students at Level 7 in its six realms.
const LEVEL_CATALOG = LEVEL7_LIVE ? [...BASE_LEVEL_CATALOG, { ...BASE_LEVEL_CATALOG[BASE_LEVEL_CATALOG.length - 1], id: "Year 7", label: "Level 7" }] : BASE_LEVEL_CATALOG;
import { getLiveRealmDefinitions, isFirstLevelPretestEnabled, isRealmFirstLevel } from "@/lib/realms/realm-registry";
import {
  fetchRealmCompatProgressForClass,
  fetchTeacherRealmPlacements,
  teacherChangeStartingLevels,
  teacherResetPretest,
  teacherResetRealm,
  teacherResetWeek,
  type CompatProgressRow,
  type PlacementEntryMode,
  type TeacherRealmPlacementRow,
} from "@/lib/realm-progress-compat";
import { normalizeSchoolYearLabel } from "@/lib/studentLevelLabel";

// Class placement in three views: realm cards (level spread, pre-test status,
// who needs placing), a class grid (every student x every realm) and a per-realm
// table (tick students, set levels in bulk). Unsaved changes are kept per realm
// and saved together. Writes teacher intent via teacher_change_starting_level;
// never overwrites live progress.
type PMStudent = {
  id: string;
  display_name: string;
  first_name?: string | null;
  last_name?: string | null;
  school_year_level?: string | null;
  working_level?: string | null;
  year_level?: string | null;
};

const PLACEMENT_REALMS = getLiveRealmDefinitions()
  .map((realm) => ({
    id: realm.realmId,
    label: `${realm.name} (${realm.strand})`,
    levelLabels: LEVEL7_LIVE && cave7Realm(realm.realmId) ? [...realm.levelLabels, "Year 7"] : realm.levelLabels,
    active: true,
  }));
const ACTIVE_REALM_IDS = PLACEMENT_REALMS.filter((r) => r.active).map((r) => r.id);

const ENTRY_MODES: { value: PlacementEntryMode; label: string }[] = [
  { value: "pretest", label: "Pre-test first" },
  { value: "full_level", label: "Skip pre-test" },
  { value: "ground_week1", label: "Ground Level · Week 1" },
];

function normalizeEntryMode(realmId: string, level: string, entry: PlacementEntryMode): PlacementEntryMode {
  if (isRealmFirstLevel(realmId, level)) {
    if (level === "Prep" && !isFirstLevelPretestEnabled(realmId, level)) return "ground_week1";
    if (!isFirstLevelPretestEnabled(realmId, level)) return "full_level";
    return entry === "ground_week1" ? "pretest" : entry;
  }
  return entry === "ground_week1" ? "pretest" : entry;
}

function entryModesForLevel(realmId: string, level: string) {
  if (isRealmFirstLevel(realmId, level)) {
    if (level === "Prep" && !isFirstLevelPretestEnabled(realmId, level)) return ENTRY_MODES.filter((mode) => mode.value === "ground_week1");
    if (isFirstLevelPretestEnabled(realmId, level)) return ENTRY_MODES.filter((mode) => mode.value !== "ground_week1");
    return ENTRY_MODES.filter((mode) => mode.value === "full_level");
  }
  return level === "Prep"
    ? ENTRY_MODES.filter((mode) => mode.value === "ground_week1")
    : ENTRY_MODES.filter((mode) => mode.value !== "ground_week1");
}

const YEAR_ORDER = LEVEL_CATALOG.map((l) => l.id);
const NAME_COLLATOR = new Intl.Collator("en-AU", { sensitivity: "base", numeric: true });
type PlacementSortKey = "surname" | "schoolYear" | "assignedStart" | "currentProgress";
type SortDirection = "asc" | "desc";

function levelLabel(year?: string | null) {
  return LEVEL_CATALOG.find((l) => l.id === year)?.label ?? (year ?? "—");
}
function schoolYearOf(s: PMStudent) {
  return normalizeSchoolYearLabel(s.school_year_level ?? s.year_level) ?? "Year 1";
}
function surnameOf(s: PMStudent) {
  const savedSurname = s.last_name?.trim();
  if (savedSurname) return savedSurname;
  const nameParts = s.display_name.trim().split(/\s+/).filter(Boolean);
  return nameParts.at(-1) ?? s.display_name;
}

function placementErrorMessage(error: unknown, realmLabel: string) {
  const message = error && typeof error === "object" && "message" in error
    ? String(error.message)
    : error instanceof Error ? error.message : "";
  if (/invalid realm/i.test(message)) {
    return `${realmLabel} placement is not enabled in the live database. A database migration must be deployed.`;
  }
  if (/not authorized|permission|row-level security/i.test(message)) {
    return "Your teacher account is not authorised to place one or more of these students.";
  }
  if (/canonical progress|could not be verified/i.test(message)) {
    return "The placement was recorded, but the student's learning program was not created. Please contact support before retrying.";
  }
  return message ? `Placements were not saved: ${message}` : "Placements were not saved. Please try again.";
}

type Edit = { level: string; entry: PlacementEntryMode };
type PretestState = "done" | "waiting" | "skipped" | null;

// Level chips: lighter for lower levels, so a class's spread reads at a glance.
const LEVEL_SHADES = ["#F5E6C8", "#FDE68A", "#D9F0A3", "#C7EA8E", "#9AD6F0", "#BFD7FF", "#C4B5FD", "#E9C2F5", "#F5B5C8"];
function levelShade(level: string) {
  const index = Math.max(0, YEAR_ORDER.indexOf(level));
  return LEVEL_SHADES[index % LEVEL_SHADES.length];
}
function shortLevel(level: string) {
  const label = levelLabel(level);
  return label.startsWith("Level ") ? `L${label.slice(6)}` : label === "Ground Level" ? "Ground" : label;
}
function gradeLabel(schoolYear: string) {
  return schoolYear === "Prep" ? "Foundation" : schoolYear.replace("Year", "Grade");
}

export default function PlacementManager({
  selectedClass,
  students,
  onClose,
  previewData,
}: {
  selectedClass: { id: string; name: string } | null;
  students: PMStudent[];
  onClose: () => void;
  /** Review pages only: show this sample data instead of loading (nothing is saved). */
  previewData?: { progressByRealm: Record<string, CompatProgressRow[]>; placements: TeacherRealmPlacementRow[] };
}) {
  const [view, setView] = useState<"realms" | "grid">("realms");
  const [realmId, setRealmId] = useState<string | null>(null);
  const [progressByRealm, setProgressByRealm] = useState<Record<string, CompatProgressRow[]>>({});
  const [placements, setPlacements] = useState<TeacherRealmPlacementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Unsaved changes for every realm, keyed realm -> student.
  const [pendingAll, setPendingAll] = useState<Record<string, Record<string, Edit>>>({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [filter, setFilter] = useState<"all" | "needs" | "waiting">("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<PlacementSortKey>("surname");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const load = useCallback(async () => {
    if (!selectedClass?.id) return;
    if (previewData) {
      setProgressByRealm(previewData.progressByRealm);
      setPlacements(previewData.placements);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    const ids = students.map((s) => s.id);
    try {
      const [results, savedPlacements] = await Promise.all([
        Promise.all(
          ACTIVE_REALM_IDS.map((id) =>
            fetchRealmCompatProgressForClass(id, selectedClass.id, ids).catch(() => [] as CompatProgressRow[])
          )
        ),
        fetchTeacherRealmPlacements(ids),
      ]);
      const map: Record<string, CompatProgressRow[]> = {};
      ACTIVE_REALM_IDS.forEach((id, i) => (map[id] = results[i] ?? []));
      setProgressByRealm(map);
      setPlacements(savedPlacements);
    } catch (error) {
      console.warn("[PlacementManager] failed to load placements", error);
      setLoadError("Could not load saved placements. Please retry.");
    } finally {
      setLoading(false);
    }
  }, [previewData, selectedClass?.id, students]);

  useEffect(() => {
    void load();
  }, [load]);

  const rosterStudentIds = useMemo(
    () => new Set(students.map((student) => student.id)),
    [students],
  );

  const placedIdsByRealm = useMemo(() => {
    const out: Record<string, Set<string>> = {};
    for (const id of ACTIVE_REALM_IDS) {
      out[id] = new Set(
        (progressByRealm[id] ?? [])
          .map((row) => row.student_id)
          .filter((studentId) => rosterStudentIds.has(studentId)),
      );
      placements
        .filter(
          (placement) =>
            placement.realm_id === id && rosterStudentIds.has(placement.student_id),
        )
        .forEach((placement) => out[id].add(placement.student_id));
    }
    return out;
  }, [placements, progressByRealm, rosterStudentIds]);

  const placementByStudentRealm = useMemo(
    () => new Map(placements.map((placement) => [`${placement.realm_id}:${placement.student_id}`, placement])),
    [placements]
  );

  const activeRealm = PLACEMENT_REALMS.find((realm) => realm.id === realmId);
  const activeLevelCatalog = LEVEL_CATALOG.filter((level) => activeRealm?.levelLabels.includes(level.id));
  const pending = useMemo(() => (realmId ? pendingAll[realmId] ?? {} : {}), [pendingAll, realmId]);

  function setPendingFor(realm: string, update: (previous: Record<string, Edit>) => Record<string, Edit>) {
    setSaveMessage(null);
    setPendingAll((all) => {
      const previous = all[realm] ?? {};
      const next = update(previous);
      return next === previous ? all : { ...all, [realm]: next };
    });
  }

  function supportedLevel(realm: string, requestedLevel: string) {
    const definition = PLACEMENT_REALMS.find((candidate) => candidate.id === realm);
    return definition?.levelLabels.includes(requestedLevel)
      ? requestedLevel
      : definition?.levelLabels[0] ?? requestedLevel;
  }

  function savedPlacement(realm: string, studentId: string) {
    return placementByStudentRealm.get(`${realm}:${studentId}`) ?? null;
  }

  // Current live level/week per (realm, student): pick the furthest level row.
  function currentProgress(realm: string, studentId: string): { year: string; week: number | null } | null {
    const rows = (progressByRealm[realm] ?? []).filter((r) => r.student_id === studentId);
    if (rows.length === 0) return null;
    const best = rows.reduce((a, b) =>
      YEAR_ORDER.indexOf(b.year) > YEAR_ORDER.indexOf(a.year) ? b : a
    );
    return { year: best.year, week: best.week };
  }

  function defaultLevel(realm: string, s: PMStudent): string {
    return supportedLevel(
      realm,
      savedPlacement(realm, s.id)?.assigned_start_level ?? currentProgress(realm, s.id)?.year ?? schoolYearOf(s),
    );
  }

  function isPlaced(realm: string, studentId: string) {
    return placedIdsByRealm[realm]?.has(studentId) ?? false;
  }

  // The level a student shows in a realm: unsaved change, else saved, else none.
  function shownLevel(realm: string, s: PMStudent): string | null {
    const edit = pendingAll[realm]?.[s.id];
    if (edit) return edit.level;
    return isPlaced(realm, s.id) ? defaultLevel(realm, s) : null;
  }

  // Pre-test status for the student's current level in a realm.
  function pretestState(realm: string, studentId: string): { state: PretestState; score: number | null } {
    const current = currentProgress(realm, studentId);
    const row = current ? (progressByRealm[realm] ?? []).find((r) => r.student_id === studentId && r.year === current.year) : null;
    if (row && (row.placement_complete || row.status === "PASSED")) {
      return { state: row.pretest_score != null ? "done" : "skipped", score: row.pretest_score ?? null };
    }
    const entry = savedPlacement(realm, studentId)?.assigned_entry_mode;
    if (!isPlaced(realm, studentId)) return { state: null, score: null };
    return { state: entry === "pretest" || entry == null ? "waiting" : "skipped", score: null };
  }

  // A newly enrolled student has neither teacher placement nor realm progress.
  // Make the school-year default a real pending save, not a visual-only fallback.
  useEffect(() => {
    if (!realmId || loading) return;
    setPendingAll((all) => {
      const previous = all[realmId] ?? {};
      const next = { ...previous };
      let changed = false;
      for (const student of students) {
        const saved = placementByStudentRealm.get(`${realmId}:${student.id}`);
        const savedLevelIsSupported = saved
          ? activeRealm?.levelLabels.includes(saved.assigned_start_level) === true
          : false;
        const hasRealmProgress = (progressByRealm[realmId] ?? []).some(
          (row) => row.student_id === student.id && activeRealm?.levelLabels.includes(row.year),
        );
        if (savedLevelIsSupported || hasRealmProgress || next[student.id]) continue;
        const level = supportedLevel(realmId, schoolYearOf(student));
        next[student.id] = {
          level,
          entry: normalizeEntryMode(realmId, level, "pretest"),
        };
        changed = true;
      }
      return changed ? { ...all, [realmId]: next } : all;
    });
  }, [activeRealm, loading, placementByStudentRealm, progressByRealm, realmId, students]);

  function toggleSort(nextKey: PlacementSortKey) {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDirection("asc");
  }

  const studentsBySurname = useMemo(
    () => [...students].sort((a, b) => NAME_COLLATOR.compare(surnameOf(a), surnameOf(b))),
    [students],
  );

  const visibleStudents = useMemo(() => {
    if (!realmId) return [];
    const filtered = students.filter((s) => {
      if (yearFilter !== "all" && schoolYearOf(s) !== yearFilter) return false;
      if (filter === "needs" && placedIdsByRealm[realmId]?.has(s.id)) return false;
      if (filter === "waiting" && pretestState(realmId, s.id).state !== "waiting") return false;
      return true;
    });

    return filtered.sort((a, b) => {
      const progressFor = (student: PMStudent) => {
        const rows = (progressByRealm[realmId] ?? []).filter(
          (row) => row.student_id === student.id,
        );
        return rows.reduce<CompatProgressRow | null>((best, row) => {
          if (!best) return row;
          return YEAR_ORDER.indexOf(row.year) > YEAR_ORDER.indexOf(best.year) ? row : best;
        }, null);
      };
      const assignedFor = (student: PMStudent) =>
        pending[student.id]?.level ??
        placementByStudentRealm.get(`${realmId}:${student.id}`)?.assigned_start_level ??
        progressFor(student)?.year ??
        schoolYearOf(student);

      let comparison = 0;
      if (sortKey === "surname") {
        comparison = NAME_COLLATOR.compare(surnameOf(a), surnameOf(b));
      } else if (sortKey === "schoolYear") {
        comparison = YEAR_ORDER.indexOf(schoolYearOf(a)) - YEAR_ORDER.indexOf(schoolYearOf(b));
      } else if (sortKey === "assignedStart") {
        comparison = YEAR_ORDER.indexOf(assignedFor(a)) - YEAR_ORDER.indexOf(assignedFor(b));
      } else {
        const aProgress = progressFor(a);
        const bProgress = progressFor(b);
        const aLevel = aProgress ? YEAR_ORDER.indexOf(aProgress.year) : -1;
        const bLevel = bProgress ? YEAR_ORDER.indexOf(bProgress.year) : -1;
        comparison = aLevel - bLevel || (aProgress?.week ?? 0) - (bProgress?.week ?? 0);
      }

      if (comparison === 0) {
        comparison = NAME_COLLATOR.compare(surnameOf(a), surnameOf(b));
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    // pretestState reads the same progress and placement data listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, pending, placedIdsByRealm, placementByStudentRealm, progressByRealm, realmId, sortDirection, sortKey, students, yearFilter]);

  const pendingCount = Object.values(pendingAll).reduce((sum, edits) => sum + Object.keys(edits).length, 0);
  const pendingRealmCount = Object.values(pendingAll).filter((edits) => Object.keys(edits).length > 0).length;

  function setRowLevel(studentId: string, level: string, realm: string) {
    setPendingFor(realm, (prev) => ({
      ...prev,
      [studentId]: {
        level,
        entry: normalizeEntryMode(
          realm,
          level,
          prev[studentId]?.entry ?? savedPlacement(realm, studentId)?.assigned_entry_mode ?? "pretest",
        ),
      },
    }));
  }
  function setRowEntry(studentId: string, entry: PlacementEntryMode, s: PMStudent, realm: string) {
    setPendingFor(realm, (prev) => ({
      ...prev,
      [studentId]: {
        level: prev[studentId]?.level ?? defaultLevel(realm, s),
        entry: normalizeEntryMode(realm, prev[studentId]?.level ?? defaultLevel(realm, s), entry),
      },
    }));
  }

  // "Fill empty with…": give a level only to students with no level yet in the
  // chosen realms (their grade, or one level for everyone). Placed students are
  // left alone, so the teacher then adjusts the few that differ.
  function fillEmpty(realms: string[], choice: string) {
    for (const realm of realms) {
      setPendingFor(realm, (prev) => {
        const next = { ...prev };
        let changed = false;
        for (const s of students) {
          if (isPlaced(realm, s.id) || next[s.id]) continue;
          const level = supportedLevel(realm, choice === "grade" ? schoolYearOf(s) : choice);
          next[s.id] = { level, entry: normalizeEntryMode(realm, level, "pretest") };
          changed = true;
        }
        return changed ? next : prev;
      });
    }
  }

  // "Place everyone at their grade" — preview only (fills the dropdowns); the
  // teacher can still adjust exceptions before Save.
  function useSchoolYearForAll() {
    if (!realmId) return;
    if (!window.confirm(`Set every student shown to their grade's level in ${activeRealm?.label}?\n\nNothing is saved until you press Save. Students who have started keep their progress.`)) return;
    setPendingFor(realmId, (prev) => {
      const next = { ...prev };
      for (const s of visibleStudents) {
        const level = supportedLevel(realmId, schoolYearOf(s));
        next[s.id] = {
          level,
          entry: normalizeEntryMode(
            realmId,
            level,
            prev[s.id]?.entry ?? savedPlacement(realmId, s.id)?.assigned_entry_mode ?? "pretest",
          ),
        };
      }
      return next;
    });
  }

  function setSelectedLevel(level: string) {
    if (!realmId || !level) return;
    for (const studentId of selected) setRowLevel(studentId, supportedLevel(realmId, level), realmId);
  }
  function setSelectedEntry(entry: PlacementEntryMode) {
    if (!realmId) return;
    for (const s of students) if (selected.has(s.id)) setRowEntry(s.id, entry, s, realmId);
  }

  async function saveRealm(realm: string, edits: Array<[string, Edit]>, selectedClassId: string) {
    await teacherChangeStartingLevels(
      realm,
      edits.map(([studentId, edit]) => ({
        studentId,
        assignedLevel: edit.level,
        entryMode: normalizeEntryMode(realm, edit.level, edit.entry),
      }))
    );

    const confirmed = await fetchTeacherRealmPlacements(edits.map(([studentId]) => studentId));
    const confirmedByStudent = new Map(
      confirmed.filter((placement) => placement.realm_id === realm).map((placement) => [placement.student_id, placement])
    );
    const unconfirmed = edits.some(([studentId, edit]) => {
      const saved = confirmedByStudent.get(studentId);
      return saved?.assigned_start_level !== edit.level || saved.assigned_entry_mode !== normalizeEntryMode(realm, edit.level, edit.entry);
    });
    if (unconfirmed) throw new Error("Saved placements could not be verified");

    const confirmedProgress = await fetchRealmCompatProgressForClass(
      realm,
      selectedClassId,
      edits.map(([studentId]) => studentId),
    );
    const studentsWithCanonicalProgress = new Set(
      confirmedProgress
        .filter((row) => row.realm_id === realm)
        .map((row) => row.student_id),
    );
    const missingCanonicalProgress = edits.some(
      ([studentId]) => !studentsWithCanonicalProgress.has(studentId),
    );
    if (missingCanonicalProgress) {
      throw new Error("Saved placements are missing canonical progress");
    }
  }

  async function savePlacements() {
    const selectedClassId = selectedClass?.id;
    if (!selectedClassId || pendingCount === 0) return;
    if (previewData) {
      setSaveMessage({ kind: "success", text: "Review page: nothing is saved" });
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    let savedCount = 0;
    let failedRealm: string | null = null;
    try {
      for (const [realm, edits] of Object.entries(pendingAll)) {
        const entries = Object.entries(edits);
        if (entries.length === 0) continue;
        failedRealm = realm;
        await saveRealm(realm, entries, selectedClassId);
        savedCount += entries.length;
        // Clear each realm as it saves, so a later failure keeps only what is left.
        setPendingAll((all) => ({ ...all, [realm]: {} }));
      }
      failedRealm = null;
      await load();
      setSelected(new Set());
      setSaveMessage({
        kind: "success",
        text: `${savedCount} placement${savedCount === 1 ? "" : "s"} saved`,
      });
    } catch (err) {
      console.warn("[PlacementManager] save failed", err);
      const label = PLACEMENT_REALMS.find((realm) => realm.id === failedRealm)?.label ?? "This realm";
      setSaveMessage({ kind: "error", text: placementErrorMessage(err, label) });
      void load();
    } finally {
      setSaving(false);
    }
  }

  // ── Reset actions (each explicit, confirmed, audited server-side) ──────────
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [resetRealmFor, setResetRealmFor] = useState<PMStudent | null>(null);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [busyStudent, setBusyStudent] = useState<string | null>(null);

  async function runReset(studentId: string, fn: () => Promise<void>) {
    setMenuFor(null);
    setBusyStudent(studentId);
    try {
      await fn();
      await load();
    } catch (err) {
      console.warn("[PlacementManager] reset failed", err);
      alert("Could not complete that action. Please try again.");
    } finally {
      setBusyStudent(null);
    }
  }

  function onResetPretest(s: PMStudent) {
    if (!realmId) return;
    if (!window.confirm(`Reset ${s.display_name}'s pre-test for ${activeRealm?.label}?\n\nThis clears the pre-test attempt and the pathway it generated, and returns them to "Ready for Pre-Test". Completed lesson history is kept.`)) return;
    void runReset(s.id, () => teacherResetPretest(s.id, realmId));
  }
  function onResetWeek(s: PMStudent) {
    if (!realmId) return;
    if (!window.confirm(`Reset ${s.display_name}'s current week to Week 1 for ${activeRealm?.label}?\n\nThis moves the week pointer only — lesson, quiz and assessment records are preserved.`)) return;
    void runReset(s.id, () => teacherResetWeek(s.id, realmId));
  }
  function confirmResetRealm() {
    const s = resetRealmFor;
    if (!s || !realmId) return;
    if (resetConfirmText.trim().toUpperCase() !== "RESET") return;
    void runReset(s.id, () => teacherResetRealm(s.id, realmId));
    setResetRealmFor(null);
    setResetConfirmText("");
  }

  // Students with no level (saved or unsaved) in at least one realm.
  const unplaced = useMemo(() => students.map((s) => ({
    student: s,
    realms: PLACEMENT_REALMS.filter((realm) => !placedIdsByRealm[realm.id]?.has(s.id) && !pendingAll[realm.id]?.[s.id]).map((realm) => realm.id),
  })).filter((entry) => entry.realms.length > 0), [pendingAll, placedIdsByRealm, students]);
  const gradeLevels = useMemo(() => [...new Set(students.map(schoolYearOf))].sort((a, b) => YEAR_ORDER.indexOf(a) - YEAR_ORDER.indexOf(b)), [students]);
  const classSubtitle = `${selectedClass?.name ?? "Class"} · ${students.length} student${students.length === 1 ? "" : "s"}${gradeLevels.length ? ` · ${gradeLevels.map(gradeLabel).join(" and ")}` : ""}`;
  const anyWaiting = (realm: string) => students.filter((s) => pretestState(realm, s.id).state === "waiting").length;

  function openRealm(id: string) {
    setRealmId(id);
    setFilter("all");
    setYearFilter("all");
    setSelected(new Set());
  }

  const pill = "rounded-full px-3.5 py-2 text-sm font-bold transition";
  const pillOff = `${pill} border border-[#E3E5E0] bg-white text-[#3F4246] hover:bg-[#F1F2EE]`;
  const pillOn = `${pill} bg-[#121314] text-white`;
  const primary = "rounded-full bg-[#83E300] px-4 py-2 text-sm font-extrabold text-[#121314] transition hover:bg-[#9AF01F] disabled:cursor-not-allowed disabled:opacity-40";

  function FillEmpty({ realms }: { realms: string[] }) {
    const empty = students.filter((s) => realms.some((realm) => !isPlaced(realm, s.id) && !pendingAll[realm]?.[s.id])).length;
    return (
      <label className={`inline-flex items-center gap-2 ${pillOff} ${empty === 0 ? "opacity-50" : ""}`} title="Give a level to everyone who doesn't have one yet. Students already placed are not changed.">
        <span>Fill empty ({empty}) with</span>
        <select
          value=""
          disabled={empty === 0}
          onChange={(event) => { if (event.target.value) fillEmpty(realms, event.target.value); }}
          className="appearance-none rounded-md border-0 bg-transparent font-extrabold text-[#121314] focus:outline-none"
          aria-label="Fill empty placements with"
        >
          <option value="">choose ▾</option>
          <option value="grade">their grade</option>
          {LEVEL_CATALOG.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
      </label>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F6F7F4] font-sans">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 border-b border-[#E3E5E0] bg-white px-6 py-4">
        <div className="flex min-w-0 items-center gap-4">
          <ReliqAdultLogo variant="onLight" className="w-[96px] flex-shrink-0" />
          <span className="h-9 w-px flex-shrink-0 bg-[#E3E5E0]" aria-hidden="true" />
          {realmId ? (
            <button
              onClick={() => { setRealmId(null); setFilter("all"); setYearFilter("all"); setSelected(new Set()); }}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E5E0] px-3.5 py-2 text-sm font-bold text-[#3F4246] hover:bg-[#F1F2EE]"
            >
              <ArrowLeft className="h-4 w-4" /> Realms
            </button>
          ) : null}
          <div className="min-w-0">
            <h1 className="flex items-center gap-2.5 font-display text-xl font-black text-[#121314]">
              {activeRealm ? <span className="h-3.5 w-3.5 rounded-[4px]" style={{ background: reliqRealmColor(activeRealm.id) }} /> : null}
              {activeRealm ? activeRealm.label : "Manage Placements"}
            </h1>
            <p className="truncate text-sm font-semibold text-[#5A5E63]">
              {activeRealm ? `${selectedClass?.name ?? "Class"} · ${placedIdsByRealm[activeRealm.id]?.size ?? 0} of ${rosterStudentIds.size} placed` : classSubtitle}
            </p>
          </div>
        </div>
        {!realmId ? (
          <div className="flex rounded-full bg-[#F1F2EE] p-1" role="tablist" aria-label="Placement view">
            {([["realms", "Realms"], ["grid", "Class grid"]] as const).map(([key, label]) => (
              <button key={key} role="tab" aria-selected={view === key} onClick={() => setView(key)} className={`rounded-full px-4 py-2 text-sm font-extrabold ${view === key ? "bg-[#121314] text-white" : "text-[#3F4246]"}`}>{label}</button>
            ))}
          </div>
        ) : null}
        <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E3E5E0] text-[#5A5E63] hover:bg-[#F1F2EE]" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="rounded-2xl border border-[#E3E5E0] bg-white p-10 text-center text-sm font-semibold text-[#5A5E63]">
            Loading class placement…
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-semibold text-red-700">{loadError}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800"
            >
              Retry
            </button>
          </div>
        ) : !realmId && view === "realms" ? (
          /* Realm cards: level spread, pre-tests and who still needs a level */
          <div className="space-y-4">
            {unplaced.length ? (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#F5D9A8] bg-[#FFF7E8] px-5 py-3.5">
                <AlertTriangle className="h-5 w-5 text-[#B45309]" aria-hidden="true" />
                <p className="font-display text-[15px] font-black text-[#121314]">{unplaced.length} student{unplaced.length === 1 ? " needs" : "s need"} placing</p>
                <p className="min-w-0 flex-1 truncate font-semibold text-[#5A5E63]">
                  {unplaced.slice(0, 3).map((entry) => `${entry.student.display_name} (${entry.realms.length === PLACEMENT_REALMS.length ? "all realms" : `${entry.realms.length} realm${entry.realms.length === 1 ? "" : "s"}`})`).join(", ")}{unplaced.length > 3 ? ` and ${unplaced.length - 3} more` : ""}
                </p>
                <button type="button" className={primary} onClick={() => fillEmpty(ACTIVE_REALM_IDS, "grade")}>Fill all at their grade</button>
                <button type="button" className={pillOff} onClick={() => { setView("grid"); setFilter("needs"); }}>Choose levels…</button>
              </div>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {PLACEMENT_REALMS.map((realm) => {
                if (!realm.active) {
                  return (
                    <div key={realm.id} className="rounded-2xl border border-[#E3E5E0] bg-white/60 p-5 opacity-70">
                      <div className="flex items-center justify-between">
                        <div className="text-base font-black text-[#8A8E89]">{realm.label}</div>
                        <Lock className="h-4 w-4 text-[#C9CCC6]" />
                      </div>
                      <div className="mt-6 text-xs font-bold uppercase tracking-wide text-[#8A8E89]">Coming soon</div>
                    </div>
                  );
                }
                const placed = placedIdsByRealm[realm.id]?.size ?? 0;
                const need = Math.max(0, rosterStudentIds.size - placed);
                const counts = new Map<string, number>();
                for (const s of students) {
                  if (!isPlaced(realm.id, s.id)) continue;
                  const level = defaultLevel(realm.id, s);
                  counts.set(level, (counts.get(level) ?? 0) + 1);
                }
                const spread = [...counts.entries()].sort((a, b) => YEAR_ORDER.indexOf(a[0]) - YEAR_ORDER.indexOf(b[0]));
                const done = students.filter((s) => pretestState(realm.id, s.id).state === "done").length;
                const waiting = anyWaiting(realm.id);
                const needNames = students.filter((s) => !isPlaced(realm.id, s.id));
                const queued = Object.keys(pendingAll[realm.id] ?? {}).length;
                const [name, strand] = realm.label.replace(")", "").split(" (");
                return (
                  <div key={realm.id} className="rounded-[20px] border border-[#E3E5E0] bg-white p-5 shadow-[0_10px_28px_-18px_rgba(15,23,42,0.25)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 font-display text-[17px] font-black text-[#121314]"><span className="h-3 w-3 rounded-[4px]" style={{ background: reliqRealmColor(realm.id) }} />{name}</p>
                        <p className="text-[13px] font-semibold text-[#5A5E63]">{strand}</p>
                      </div>
                      <button type="button" onClick={() => openRealm(realm.id)} className="inline-flex items-center gap-1 text-sm font-extrabold text-[#3D6600] hover:underline">
                        Manage <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 flex h-[30px] overflow-hidden rounded-[9px] bg-[#F1F2EE]" aria-label="Level spread">
                      {spread.map(([level, count]) => (
                        <span key={level} title={`${levelLabel(level)}: ${count}`} className="grid place-items-center font-display text-[11px] font-black text-[#121314]" style={{ width: `${(count / Math.max(1, rosterStudentIds.size)) * 100}%`, background: levelShade(level) }}>{count}</span>
                      ))}
                      {need > 0 ? <span title={`Not placed: ${need}`} className="grid place-items-center font-display text-[11px] font-black text-[#9A3412]" style={{ width: `${(need / Math.max(1, rosterStudentIds.size)) * 100}%`, background: "repeating-linear-gradient(45deg,#FFE4C2 0 6px,#FFF4E5 6px 12px)" }}>{need}</span> : null}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-bold text-[#5A5E63]">
                      {spread.map(([level]) => <span key={level}><span className="mr-1 inline-block h-2.5 w-2.5 rounded-[3px] align-[-1px]" style={{ background: levelShade(level) }} />{levelLabel(level)}</span>)}
                      {need > 0 ? <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-[3px] bg-[#FFD9A8] align-[-1px]" />Not placed</span> : null}
                    </div>
                    <div className="mt-3.5 flex gap-5 border-t border-[#F1F2EE] pt-3">
                      <div><p className="font-display text-xl font-black text-[#121314]">{placed}/{rosterStudentIds.size}</p><p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#5A5E63]">Placed</p></div>
                      <div><p className="font-display text-xl font-black text-[#121314]">{done}</p><p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#5A5E63]">Pre-test done</p></div>
                      <div><p className={`font-display text-xl font-black ${waiting ? "text-[#B45309]" : "text-[#121314]"}`}>{waiting}</p><p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#5A5E63]">Waiting to sit</p></div>
                    </div>
                    {need > 0 ? (
                      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-[#FFF7E8] px-3 py-2">
                        <span className="truncate text-sm font-bold text-[#121314]">
                          {queued >= need ? `${need} ready to save` : `${needNames.slice(0, 2).map((s) => s.display_name).join(", ")}${needNames.length > 2 ? ` +${needNames.length - 2}` : ""} need${needNames.length === 1 ? "s" : ""} a level`}
                        </span>
                        {queued < need ? <button type="button" className="flex-shrink-0 rounded-full bg-[#83E300] px-3 py-1.5 text-[13px] font-extrabold text-[#121314] hover:bg-[#9AF01F]" onClick={() => fillEmpty([realm.id], "grade")}>Place at their grade</button> : null}
                      </div>
                    ) : (
                      <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#F2FBE3] px-3 py-2 text-sm font-extrabold text-[#3D6600]"><Check className="h-4 w-4" />Everyone placed</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : !realmId ? (
          /* Class grid: every student x every realm, edit in place */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {([["all", `All ${students.length}`], ["needs", `Needs placing (${unplaced.length})`], ["waiting", "Pre-test waiting"]] as const).map(([key, label]) => (
                <button key={key} type="button" onClick={() => setFilter(key)} className={filter === key ? pillOn : pillOff}>{label}</button>
              ))}
              <FillEmpty realms={ACTIVE_REALM_IDS} />
              <span className="ml-auto flex flex-wrap items-center gap-3 text-[13px] font-bold text-[#5A5E63]">
                <span><span className="mr-1 rounded-full bg-[#E4F8C4] px-2 py-0.5 text-[#3D6600]">L5</span>above grade</span>
                <span><span className="mr-1 rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[#92400E]">L2</span>below grade</span>
                <span><span className="mr-1 text-[11px] font-extrabold text-[#B45309]">pre-test</span>still to sit</span>
                <span><span className="mr-1 inline-block rounded-full px-2 py-0.5 ring-2 ring-[#121314]">L3</span>not saved yet</span>
              </span>
            </div>
            <div className="overflow-auto rounded-2xl border border-[#E3E5E0] bg-white">
              <table className="w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 border-b border-[#E3E5E0] bg-[#FAFBF8] px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8A8E89]">Student</th>
                    <th className="border-b border-[#E3E5E0] bg-[#FAFBF8] px-3 py-3 text-left text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8A8E89]">Grade</th>
                    {PLACEMENT_REALMS.map((realm) => (
                      <th key={realm.id} className="border-b border-[#E3E5E0] bg-[#FAFBF8] px-3 py-3 text-left text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8A8E89]">
                        <button type="button" onClick={() => openRealm(realm.id)} className="inline-flex items-center gap-1.5 uppercase tracking-[0.12em] hover:text-[#3F4246]" title={`Open ${realm.label}`}>
                          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: reliqRealmColor(realm.id) }} />{realm.label.split(" (")[0]}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studentsBySurname
                    .filter((s) => filter === "needs" ? unplaced.some((entry) => entry.student.id === s.id) : filter === "waiting" ? PLACEMENT_REALMS.some((realm) => pretestState(realm.id, s.id).state === "waiting") : true)
                    .map((s) => {
                      const grade = schoolYearOf(s);
                      return (
                        <tr key={s.id} className="hover:bg-[#FAFBF8]">
                          <td className="sticky left-0 border-b border-[#F1F2EE] bg-white px-4 py-2 font-bold text-[#121314]">{s.display_name}</td>
                          <td className="border-b border-[#F1F2EE] px-3 py-2 font-bold text-[#5A5E63]">{gradeLabel(grade).replace("Grade ", "G")}</td>
                          {PLACEMENT_REALMS.map((realm) => {
                            const level = shownLevel(realm.id, s);
                            const changed = Boolean(pendingAll[realm.id]?.[s.id]);
                            const diff = level ? YEAR_ORDER.indexOf(level) - YEAR_ORDER.indexOf(grade) : 0;
                            const tone = !level ? "bg-[#FFEDD5] text-[#9A3412]" : diff > 0 ? "bg-[#E4F8C4] text-[#3D6600]" : diff < 0 ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#F1F2EE] text-[#121314]";
                            const waiting = pretestState(realm.id, s.id).state === "waiting";
                            return (
                              <td key={realm.id} className="border-b border-[#F1F2EE] px-3 py-2">
                                <span className="inline-flex items-center gap-1.5">
                                  <select
                                    value={level ?? ""}
                                    onChange={(event) => { if (event.target.value) setRowLevel(s.id, event.target.value, realm.id); }}
                                    aria-label={`${s.display_name} ${realm.label} level`}
                                    className={`cursor-pointer appearance-none rounded-full px-3 py-1 text-[13px] font-extrabold focus:outline-none focus:ring-2 focus:ring-[#121314] ${tone} ${changed ? "ring-2 ring-[#121314]" : ""}`}
                                  >
                                    {!level ? <option value="">Place ▾</option> : null}
                                    {LEVEL_CATALOG.filter((l) => realm.levelLabels.includes(l.id)).map((l) => <option key={l.id} value={l.id}>{shortLevel(l.id)}</option>)}
                                  </select>
                                  {waiting && !changed ? <span className="text-[11px] font-extrabold text-[#B45309]">pre-test</span> : null}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <p className="text-xs font-semibold text-[#8A8E89]">Changed cells are outlined in black until you save. New students start with the pre-test for their level. Open a realm (click its name) to change how a student starts or to reset.</p>
          </div>
        ) : (
          /* Per-realm table: tick students and set levels together */
          <div className="space-y-4">
            {selected.size > 0 ? (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#121314] px-4 py-3 text-white">
                <Check className="h-5 w-5" aria-hidden="true" />
                <p className="font-display text-[15px] font-black">{selected.size} selected</p>
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white/70">{students.filter((s) => selected.has(s.id)).map((s) => s.display_name.split(" ")[0]).join(", ")}</p>
                <select value="" onChange={(event) => setSelectedLevel(event.target.value)} aria-label="Set start level for selected students" className="appearance-none rounded-full bg-white px-3.5 py-2 text-sm font-extrabold text-[#121314]">
                  <option value="">Set start level ▾</option>
                  {activeLevelCatalog.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
                <select value="" onChange={(event) => { if (event.target.value) setSelectedEntry(event.target.value as PlacementEntryMode); }} aria-label="Set how selected students start" className="appearance-none rounded-full bg-white px-3.5 py-2 text-sm font-extrabold text-[#121314]">
                  <option value="">Set how they start ▾</option>
                  <option value="pretest">Pre-test first</option>
                  <option value="full_level">Skip pre-test</option>
                </select>
                <button type="button" onClick={() => setSelected(new Set())} className="rounded-full border border-white/30 px-3.5 py-2 text-sm font-extrabold">Clear</button>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2">
              {([["all", `All ${students.length}`], ["needs", `Needs placing (${Math.max(0, rosterStudentIds.size - (placedIdsByRealm[realmId]?.size ?? 0))})`], ["waiting", `Pre-test waiting (${anyWaiting(realmId)})`]] as const).map(([key, label]) => (
                <button key={key} type="button" onClick={() => setFilter(key)} className={filter === key ? pillOn : pillOff}>{label}</button>
              ))}
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                aria-label="Filter by grade"
                className="rounded-full border border-[#E3E5E0] bg-white px-3.5 py-2 text-sm font-bold text-[#3F4246]"
              >
                <option value="all">All grades</option>
                {["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((y) => (
                  <option key={y} value={y}>{gradeLabel(y)}</option>
                ))}
              </select>
              <FillEmpty realms={[realmId]} />
              <button type="button" onClick={useSchoolYearForAll} className={`ml-auto ${pillOff}`}>
                Place everyone at their grade…
              </button>
            </div>

            <div className="overflow-auto rounded-2xl border border-[#E3E5E0] bg-white">
              <div className="grid min-w-[980px] grid-cols-[40px_1.5fr_0.7fr_1fr_1.1fr_0.9fr_1.1fr_40px] items-center gap-3 border-b border-[#E3E5E0] bg-[#FAFBF8] px-4 py-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8A8E89]">
                <input
                  type="checkbox"
                  aria-label="Select all shown"
                  checked={visibleStudents.length > 0 && visibleStudents.every((s) => selected.has(s.id))}
                  onChange={(event) => setSelected(event.target.checked ? new Set(visibleStudents.map((s) => s.id)) : new Set())}
                  className="h-4 w-4 accent-[#121314]"
                />
                <button type="button" onClick={() => toggleSort("surname")} className="inline-flex items-center gap-1 text-left uppercase tracking-[0.12em] hover:text-[#3F4246]" title="Sort by surname">
                  Student {sortKey === "surname" ? (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3" />}
                </button>
                <button type="button" onClick={() => toggleSort("schoolYear")} className="inline-flex items-center gap-1 text-left uppercase tracking-[0.12em] hover:text-[#3F4246]">
                  Grade {sortKey === "schoolYear" ? (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3" />}
                </button>
                <button type="button" onClick={() => toggleSort("assignedStart")} className="inline-flex items-center gap-1 text-left uppercase tracking-[0.12em] hover:text-[#3F4246]">
                  Start at {sortKey === "assignedStart" ? (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3" />}
                </button>
                <span>How they start</span>
                <span>Pre-test</span>
                <button type="button" onClick={() => toggleSort("currentProgress")} className="inline-flex items-center gap-1 text-left uppercase tracking-[0.12em] hover:text-[#3F4246]">
                  Now working on {sortKey === "currentProgress" ? (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3" />}
                </button>
                <span className="sr-only">Actions</span>
              </div>
              {visibleStudents.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-[#5A5E63]">No students match this filter.</div>
              ) : (
                visibleStudents.map((s) => {
                  const cur = currentProgress(realmId, s.id);
                  const level = pending[s.id]?.level ?? defaultLevel(realmId, s);
                  const entry = normalizeEntryMode(
                    realmId,
                    level,
                    pending[s.id]?.entry ?? savedPlacement(realmId, s.id)?.assigned_entry_mode ?? "pretest",
                  );
                  const changed = Boolean(pending[s.id]);
                  const test = pretestState(realmId, s.id);
                  const isSelected = selected.has(s.id);
                  return (
                    <div
                      key={s.id}
                      className={`grid min-w-[980px] grid-cols-[40px_1.5fr_0.7fr_1fr_1.1fr_0.9fr_1.1fr_40px] items-center gap-3 border-b border-[#F1F2EE] px-4 py-2.5 last:border-0 ${isSelected ? "bg-[#F7FBEF]" : changed ? "bg-[#FFFBEB]" : ""}`}
                    >
                      <input
                        type="checkbox"
                        aria-label={`Select ${s.display_name}`}
                        checked={isSelected}
                        onChange={(event) => setSelected((current) => {
                          const next = new Set(current);
                          if (event.target.checked) next.add(s.id); else next.delete(s.id);
                          return next;
                        })}
                        className="h-4 w-4 accent-[#121314]"
                      />
                      <span className="truncate text-sm font-bold text-[#121314]">{s.display_name}</span>
                      <span className="text-sm font-bold text-[#5A5E63]">{gradeLabel(schoolYearOf(s))}</span>
                      <select
                        value={level}
                        onChange={(e) => setRowLevel(s.id, e.target.value, realmId)}
                        aria-label={`${s.display_name} start level`}
                        className={`rounded-lg border bg-white px-2.5 py-1.5 text-sm font-bold text-[#121314] ${changed ? "border-[#121314] ring-1 ring-[#121314]" : "border-[#E3E5E0]"}`}
                      >
                        {activeLevelCatalog.map((l) => (
                          <option key={l.id} value={l.id}>{l.label}</option>
                        ))}
                      </select>
                      <select
                        value={entry}
                        onChange={(e) => setRowEntry(s.id, e.target.value as PlacementEntryMode, s, realmId)}
                        aria-label={`${s.display_name} how they start`}
                        className="rounded-lg border border-[#E3E5E0] bg-white px-2.5 py-1.5 text-sm font-bold text-[#121314]"
                      >
                        {entryModesForLevel(realmId, level).map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                      <span>
                        {test.state === "done" ? <span className="rounded-full bg-[#F2FBE3] px-2.5 py-1 text-xs font-extrabold text-[#3D6600]">✓ {test.score != null ? `${Math.round(test.score)}%` : "Done"}</span>
                          : test.state === "waiting" ? <span className="rounded-full bg-[#FFF7E8] px-2.5 py-1 text-xs font-extrabold text-[#B45309]">Waiting to sit</span>
                          : test.state === "skipped" ? <span className="rounded-full bg-[#F1F2EE] px-2.5 py-1 text-xs font-extrabold text-[#5A5E63]">Not needed</span>
                          : <span className="text-xs font-bold text-[#8A8E89]">—</span>}
                      </span>
                      <span className="text-sm font-semibold text-[#5A5E63]">
                        {cur ? `${levelLabel(cur.year)}${cur.week ? ` · Week ${cur.week}` : ""}` : "Not started"}
                      </span>
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setMenuFor((m) => (m === s.id ? null : s.id))}
                          disabled={busyStudent === s.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8A8E89] hover:bg-[#F1F2EE] hover:text-[#3F4246] disabled:opacity-50"
                          aria-label="Student actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {menuFor === s.id ? (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
                            <div className="absolute right-0 top-9 z-20 w-52 overflow-hidden rounded-xl border border-[#E3E5E0] bg-white py-1 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.35)]">
                              {(level !== "Prep" || isFirstLevelPretestEnabled(realmId, level)) ? <button onClick={() => onResetPretest(s)} className="block w-full px-3 py-2 text-left text-sm font-semibold text-[#3F4246] hover:bg-[#FAFBF8]">Reset pre-test</button> : null}
                              <button onClick={() => onResetWeek(s)} className="block w-full px-3 py-2 text-left text-sm font-semibold text-[#3F4246] hover:bg-[#FAFBF8]">Reset current week</button>
                              <div className="my-1 h-px bg-[#F1F2EE]" />
                              <button onClick={() => { setMenuFor(null); setResetRealmFor(s); setResetConfirmText(""); }} className="block w-full px-3 py-2 text-left text-sm font-bold text-[#DC2626] hover:bg-[#FEF2F2]">Reset this realm…</button>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-xs font-semibold text-[#8A8E89]">
              Changing a level for a student who has already started records your choice; it never
              overwrites their progress. Use ⋯ to reset a pre-test, a week or the whole realm.
            </p>
          </div>
        )}
      </div>

      {/* Save bar: shown whenever there are unsaved changes in any realm */}
      {pendingCount > 0 || saveMessage ? (
        <div className="flex min-h-16 items-center justify-between gap-3 border-t border-[#E3E5E0] bg-white py-3 pl-6 pr-56">
          <span className={`text-sm font-semibold ${saveMessage?.kind === "success" ? "text-emerald-700" : saveMessage?.kind === "error" ? "text-red-700" : "text-[#5A5E63]"}`}>
            {saveMessage?.text ?? `${pendingCount} change${pendingCount === 1 ? "" : "s"} ready to save${pendingRealmCount > 1 ? ` across ${pendingRealmCount} realms` : ""}`}
          </span>
          <div className="flex items-center gap-2">
            {pendingCount > 0 ? (
              <button type="button" onClick={() => { setPendingAll({}); setSaveMessage(null); }} className="rounded-full border border-[#E3E5E0] px-4 py-2.5 text-sm font-bold text-[#3F4246] hover:bg-[#F1F2EE]">
                Discard
              </button>
            ) : null}
            <button
              onClick={savePlacements}
              disabled={saving || pendingCount === 0}
              className="rounded-full bg-[#83E300] px-6 py-2.5 text-sm font-extrabold text-[#121314] transition hover:bg-[#9AF01F] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? "Saving…" : pendingCount > 0 ? `Save placements (${pendingCount})` : "Save placements"}
            </button>
          </div>
        </div>
      ) : null}

      {/* Destructive: reset this realm — typed confirmation */}
      {resetRealmFor ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-[#121314]">Reset {activeRealm?.label} for {resetRealmFor.display_name}?</h3>
            <p className="mt-2 text-sm text-[#3F4246]">
              This permanently clears this student&apos;s <strong>{activeRealm?.label}</strong> progress, assessments and
              unlocks. Other realms are not affected. This cannot be undone.
            </p>
            <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-[#8A8E89]">Type RESET to confirm</label>
            <input
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E3E5E0] px-3 py-2 text-sm font-semibold text-[#121314]"
              placeholder="RESET"
              autoFocus
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => { setResetRealmFor(null); setResetConfirmText(""); }}
                className="rounded-lg border border-[#E3E5E0] px-4 py-2 text-sm font-bold text-[#3F4246] hover:bg-[#F1F2EE]"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetRealm}
                disabled={resetConfirmText.trim().toUpperCase() !== "RESET"}
                className="rounded-lg bg-[#DC2626] px-4 py-2 text-sm font-extrabold text-white hover:bg-[#B91C1C] disabled:opacity-40"
              >
                Reset realm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
