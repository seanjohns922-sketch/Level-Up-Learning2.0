"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Lock, MoreHorizontal, Users, X } from "lucide-react";
import { getAllRealms } from "@/data/programs/genres";
import { LEVEL_CATALOG } from "@/lib/level-catalog";
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

// Realm-first placement: pick a realm (Step 1 cards with stats), then set the
// whole class's starting level for THAT realm only (Step 2 table). Writes teacher
// intent via teacher_change_starting_level — never overwrites live progress.
type PMStudent = {
  id: string;
  display_name: string;
  school_year_level?: string | null;
  working_level?: string | null;
  year_level?: string | null;
};

const PLACEMENT_REALMS = getAllRealms()
  .filter((realm) => realm.id !== "space")
  .map((realm) => ({
    id: realm.id,
    label: `${realm.realm} (${realm.strand})`,
    active: realm.hasContent,
  }));
const ACTIVE_REALM_IDS = PLACEMENT_REALMS.filter((r) => r.active).map((r) => r.id);

const ENTRY_MODES: { value: PlacementEntryMode; label: string }[] = [
  { value: "pretest", label: "Begin with Pre-Test" },
  { value: "full_level", label: "Begin Full Level" },
  { value: "ground_week1", label: "Ground Level: Week 1" },
];

const YEAR_ORDER = LEVEL_CATALOG.map((l) => l.id);

function levelLabel(year?: string | null) {
  return LEVEL_CATALOG.find((l) => l.id === year)?.label ?? (year ?? "—");
}
function schoolYearOf(s: PMStudent) {
  return normalizeSchoolYearLabel(s.school_year_level ?? s.year_level) ?? "Year 1";
}

export default function PlacementManager({
  selectedClass,
  students,
  onClose,
}: {
  selectedClass: { id: string; name: string } | null;
  students: PMStudent[];
  onClose: () => void;
}) {
  const [realmId, setRealmId] = useState<string | null>(null);
  const [progressByRealm, setProgressByRealm] = useState<Record<string, CompatProgressRow[]>>({});
  const [placements, setPlacements] = useState<TeacherRealmPlacementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState<Record<string, { level: string; entry: PlacementEntryMode }>>({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [filter, setFilter] = useState<"all" | "needs">("all");
  const [yearFilter, setYearFilter] = useState<string>("all");

  const load = useCallback(async () => {
    if (!selectedClass?.id) return;
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
  }, [selectedClass?.id, students]);

  useEffect(() => {
    void load();
  }, [load]);

  const placedIdsByRealm = useMemo(() => {
    const out: Record<string, Set<string>> = {};
    for (const id of ACTIVE_REALM_IDS) {
      out[id] = new Set((progressByRealm[id] ?? []).map((r) => r.student_id));
      placements.filter((placement) => placement.realm_id === id).forEach((placement) => out[id].add(placement.student_id));
    }
    return out;
  }, [placements, progressByRealm]);

  const placementByStudentRealm = useMemo(
    () => new Map(placements.map((placement) => [`${placement.realm_id}:${placement.student_id}`, placement])),
    [placements]
  );

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
    return savedPlacement(realm, s.id)?.assigned_start_level ?? currentProgress(realm, s.id)?.year ?? schoolYearOf(s);
  }

  const visibleStudents = useMemo(() => {
    if (!realmId) return [];
    return students.filter((s) => {
      if (yearFilter !== "all" && schoolYearOf(s) !== yearFilter) return false;
      if (filter === "needs" && placedIdsByRealm[realmId]?.has(s.id)) return false;
      return true;
    });
  }, [students, realmId, filter, yearFilter, placedIdsByRealm]);

  const pendingCount = Object.keys(pending).length;

  function setRowLevel(studentId: string, level: string, realm: string) {
    setSaveMessage(null);
    setPending((prev) => ({
      ...prev,
      [studentId]: {
        level,
        entry: prev[studentId]?.entry ?? savedPlacement(realm, studentId)?.assigned_entry_mode ?? "pretest",
      },
    }));
  }
  function setRowEntry(studentId: string, entry: PlacementEntryMode, s: PMStudent, realm: string) {
    setSaveMessage(null);
    setPending((prev) => ({
      ...prev,
      [studentId]: { level: prev[studentId]?.level ?? defaultLevel(realm, s), entry },
    }));
  }

  // Bulk "Use School Year for All" — preview only (fills the dropdowns); the
  // teacher can still adjust exceptions before Save.
  function useSchoolYearForAll() {
    if (!realmId) return;
    setSaveMessage(null);
    setPending((prev) => {
      const next = { ...prev };
      for (const s of visibleStudents) {
        next[s.id] = {
          level: schoolYearOf(s),
          entry: prev[s.id]?.entry ?? savedPlacement(realmId, s.id)?.assigned_entry_mode ?? "pretest",
        };
      }
      return next;
    });
  }

  async function savePlacements() {
    const selectedClassId = selectedClass?.id;
    if (!realmId || !selectedClassId || pendingCount === 0) return;
    const edits = Object.entries(pending);
    setSaving(true);
    setSaveMessage(null);
    try {
      await teacherChangeStartingLevels(
        realmId,
        edits.map(([studentId, edit]) => ({
          studentId,
          assignedLevel: edit.level,
          entryMode: edit.entry,
        }))
      );

      const confirmed = await fetchTeacherRealmPlacements(edits.map(([studentId]) => studentId));
      const confirmedByStudent = new Map(
        confirmed.filter((placement) => placement.realm_id === realmId).map((placement) => [placement.student_id, placement])
      );
      const unconfirmed = edits.some(([studentId, edit]) => {
        const saved = confirmedByStudent.get(studentId);
        return saved?.assigned_start_level !== edit.level || saved.assigned_entry_mode !== edit.entry;
      });
      if (unconfirmed) throw new Error("Saved placements could not be verified");

      const confirmedProgress = await fetchRealmCompatProgressForClass(
        realmId,
        selectedClassId,
        edits.map(([studentId]) => studentId),
      );
      const studentsWithCanonicalProgress = new Set(
        confirmedProgress
          .filter((row) => row.realm_id === realmId)
          .map((row) => row.student_id),
      );
      const missingCanonicalProgress = edits.some(
        ([studentId]) => !studentsWithCanonicalProgress.has(studentId),
      );
      if (missingCanonicalProgress) {
        throw new Error("Saved placements are missing canonical progress");
      }

      await load();
      setPending({});
      setSaveMessage({
        kind: "success",
        text: `${edits.length} placement${edits.length === 1 ? "" : "s"} saved`,
      });
    } catch (err) {
      console.warn("[PlacementManager] save failed", err);
      setSaveMessage({ kind: "error", text: "Placements were not fully saved. Please try again." });
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

  const activeRealm = PLACEMENT_REALMS.find((r) => r.id === realmId);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F7F8FA]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-[#E6E8EC] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          {realmId ? (
            <button
              onClick={() => { setRealmId(null); setPending({}); setFilter("all"); setYearFilter("all"); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E8EC] px-3 py-1.5 text-sm font-bold text-[#475569] hover:bg-[#F1F5F9]"
            >
              <ArrowLeft className="h-4 w-4" /> Realms
            </button>
          ) : null}
          <div>
            <h1 className="text-lg font-black text-[#0F172A]">Manage Placements</h1>
            <p className="text-xs font-semibold text-[#64748B]">
              {selectedClass?.name ?? "Class"}{activeRealm ? ` · ${activeRealm.label}` : ""}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E6E8EC] text-[#64748B] hover:bg-[#F1F5F9]" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="rounded-2xl border border-[#E6E8EC] bg-white p-10 text-center text-sm font-semibold text-[#64748B]">
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
        ) : !realmId ? (
          /* Step 1 — realm cards */
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {PLACEMENT_REALMS.map((realm) => {
              if (!realm.active) {
                return (
                  <div key={realm.id} className="rounded-2xl border border-[#E6E8EC] bg-white/60 p-5 opacity-70">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-black text-[#94A3B8]">{realm.label}</div>
                      <Lock className="h-4 w-4 text-[#CBD5E1]" />
                    </div>
                    <div className="mt-6 text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Coming soon</div>
                  </div>
                );
              }
              const placed = placedIdsByRealm[realm.id]?.size ?? 0;
              const need = students.length - placed;
              return (
                <button
                  key={realm.id}
                  onClick={() => setRealmId(realm.id)}
                  className="rounded-2xl border border-[#E6E8EC] bg-white p-5 text-left shadow-[0_10px_28px_-18px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 hover:border-[#0EA5A4]/40 hover:shadow-[0_16px_36px_-18px_rgba(13,148,136,0.35)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-base font-black text-[#0F172A]">{realm.label}</div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0EA5A4]">
                      Manage <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div>
                      <div className="text-2xl font-black text-[#0F172A]">{placed}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">Placed</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-black ${need > 0 ? "text-[#B45309]" : "text-[#15803D]"}`}>{need}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-[#64748B]">Need placement</div>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5 text-[#94A3B8]">
                      <Users className="h-4 w-4" />
                      <span className="text-sm font-bold">{students.length}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Step 2 — per-realm placement table */
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={useSchoolYearForAll}
                className="rounded-lg border border-[#0EA5A4]/40 bg-[#0EA5A4]/10 px-3 py-1.5 text-sm font-bold text-[#0F766E] hover:bg-[#0EA5A4]/15"
              >
                Use School Year for All
              </button>
              <div className="mx-1 h-5 w-px bg-[#E6E8EC]" />
              {(["all", "needs"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-3 py-1.5 text-sm font-bold transition ${filter === f ? "bg-[#0F172A] text-white" : "border border-[#E6E8EC] text-[#475569] hover:bg-[#F1F5F9]"}`}
                >
                  {f === "all" ? "All" : "Needs placement"}
                </button>
              ))}
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="rounded-full border border-[#E6E8EC] bg-white px-3 py-1.5 text-sm font-bold text-[#475569]"
              >
                <option value="all">All years</option>
                {["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-[#E6E8EC] bg-white">
              <div className="grid grid-cols-[1.6fr_0.7fr_1.1fr_1.2fr_1.2fr_0.4fr] gap-3 border-b border-[#E6E8EC] bg-[#F8FAFC] px-5 py-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#94A3B8]">
                <span>Student</span>
                <span>School Year</span>
                <span>Assigned Start</span>
                <span>Entry Method</span>
                <span>Current Progress</span>
                <span className="text-right">Actions</span>
              </div>
              {visibleStudents.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-[#64748B]">No students match this filter.</div>
              ) : (
                visibleStudents.map((s) => {
                  const cur = currentProgress(realmId, s.id);
                  const level = pending[s.id]?.level ?? defaultLevel(realmId, s);
                  const entry = pending[s.id]?.entry ?? savedPlacement(realmId, s.id)?.assigned_entry_mode ?? "pretest";
                  const changed = Boolean(pending[s.id]);
                  return (
                    <div
                      key={s.id}
                      className={`grid grid-cols-[1.6fr_0.7fr_1.1fr_1.2fr_1.2fr_0.4fr] items-center gap-3 border-b border-[#F1F5F9] px-5 py-2.5 last:border-0 ${changed ? "bg-amber-50/50" : ""}`}
                    >
                      <span className="truncate text-sm font-bold text-[#0F172A]">{s.display_name}</span>
                      <span className="text-xs font-bold text-[#475569]">{schoolYearOf(s)}</span>
                      <select
                        value={level}
                        onChange={(e) => setRowLevel(s.id, e.target.value, realmId)}
                        className="rounded-lg border border-[#E6E8EC] bg-white px-2 py-1.5 text-sm font-semibold text-[#0F172A]"
                      >
                        {LEVEL_CATALOG.map((l) => (
                          <option key={l.id} value={l.id}>{l.label}</option>
                        ))}
                      </select>
                      <select
                        value={entry}
                        onChange={(e) => setRowEntry(s.id, e.target.value as PlacementEntryMode, s, realmId)}
                        className="rounded-lg border border-[#E6E8EC] bg-white px-2 py-1.5 text-sm font-semibold text-[#0F172A]"
                      >
                        {ENTRY_MODES.map((m) => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                      <span className="text-xs font-semibold text-[#64748B]">
                        {cur ? `Currently ${levelLabel(cur.year)}${cur.week ? ` · W${cur.week}` : ""}` : "No progress yet"}
                      </span>
                      <div className="relative flex justify-end">
                        <button
                          onClick={() => setMenuFor((m) => (m === s.id ? null : s.id))}
                          disabled={busyStudent === s.id}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#475569] disabled:opacity-50"
                          aria-label="Student actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {menuFor === s.id ? (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
                            <div className="absolute right-0 top-8 z-20 w-52 overflow-hidden rounded-xl border border-[#E6E8EC] bg-white py-1 shadow-[0_12px_32px_-12px_rgba(15,23,42,0.35)]">
                              <button onClick={() => onResetPretest(s)} className="block w-full px-3 py-2 text-left text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC]">Reset pre-test</button>
                              <button onClick={() => onResetWeek(s)} className="block w-full px-3 py-2 text-left text-sm font-semibold text-[#475569] hover:bg-[#F8FAFC]">Reset current week</button>
                              <div className="my-1 h-px bg-[#F1F5F9]" />
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
            <p className="text-xs text-[#94A3B8]">
              Changing a level for a student who already has progress records your intent only — it never
              overwrites their live progress. To hard-reset and re-apply, use the reset actions.
            </p>
          </div>
        )}
      </div>

      {/* Persistent save bar (per-realm view) */}
      {realmId ? (
        <div className="flex min-h-16 items-center justify-between gap-3 border-t border-[#E6E8EC] bg-white py-3 pl-6 pr-56">
          <span className={`text-sm font-semibold ${saveMessage?.kind === "success" ? "text-emerald-700" : saveMessage?.kind === "error" ? "text-red-700" : "text-[#64748B]"}`}>
            {saveMessage?.text ?? (pendingCount > 0 ? `${pendingCount} change${pendingCount === 1 ? "" : "s"} ready to save` : "No changes to save")}
          </span>
          <button
            onClick={savePlacements}
            disabled={saving || pendingCount === 0}
            className="rounded-lg bg-[#F59E0B] px-5 py-2.5 text-sm font-extrabold text-[#0F172A] transition hover:bg-[#FBBF24] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving…" : pendingCount > 0 ? `Save Placements (${pendingCount})` : "Save Placements"}
          </button>
        </div>
      ) : null}

      {/* Destructive: reset this realm — typed confirmation */}
      {resetRealmFor ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-black text-[#0F172A]">Reset {activeRealm?.label} for {resetRealmFor.display_name}?</h3>
            <p className="mt-2 text-sm text-[#475569]">
              This permanently clears this student&apos;s <strong>{activeRealm?.label}</strong> progress, assessments and
              unlocks. Other realms are not affected. This cannot be undone.
            </p>
            <label className="mt-4 block text-xs font-bold uppercase tracking-wide text-[#94A3B8]">Type RESET to confirm</label>
            <input
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#E6E8EC] px-3 py-2 text-sm font-semibold text-[#0F172A]"
              placeholder="RESET"
              autoFocus
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => { setResetRealmFor(null); setResetConfirmText(""); }}
                className="rounded-lg border border-[#E6E8EC] px-4 py-2 text-sm font-bold text-[#475569] hover:bg-[#F1F5F9]"
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
