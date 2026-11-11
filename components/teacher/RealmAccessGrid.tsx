"use client";

import { useCallback, useEffect, useState } from "react";
import { Lock, LockOpen } from "lucide-react";
import { reliqRealmColor } from "@/components/brand/ReliqRealmLogo";
import { fetchClassRealmLocks, saveClassRealmLocks, type RealmLock } from "@/lib/realm-locks";

// Placements > Realm access: every student x every realm, locked or open. Locks
// apply at school and at home until a teacher opens the realm again. Changes are
// staged and saved together, like placements.
type Student = { id: string; display_name: string };
type Realm = { id: string; label: string };

const key = (studentId: string, realmId: string) => `${studentId}:${realmId}`;
const pill = "inline-flex items-center gap-2 rounded-full border border-[#E3E5E0] bg-white px-4 py-2 text-sm font-extrabold text-[#3F4246]";

export default function RealmAccessGrid({ classId, students, realms, preview = false }: {
  classId: string | null;
  students: Student[];
  realms: Realm[];
  preview?: boolean;
}) {
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Map<string, boolean>>(new Map());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const toSet = (rows: RealmLock[]) => new Set(rows.map((row) => key(row.studentId, row.realmId)));

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      setSaved(preview || !classId ? new Set() : toSet(await fetchClassRealmLocks(classId)));
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Realm access could not be loaded." });
    } finally {
      setLoading(false);
    }
  }, [classId, preview]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const isLocked = (studentId: string, realmId: string) => pending.get(key(studentId, realmId)) ?? saved.has(key(studentId, realmId));

  function stage(studentId: string, realmId: string, locked: boolean) {
    setPending((current) => {
      const next = new Map(current);
      if (saved.has(key(studentId, realmId)) === locked) next.delete(key(studentId, realmId));
      else next.set(key(studentId, realmId), locked);
      return next;
    });
  }

  // "Lock for everyone" / "Open for everyone": one realm, or every realm.
  function setEveryone(realmChoice: string, locked: boolean) {
    const chosen = realmChoice === "all" ? realms.map((realm) => realm.id) : [realmChoice];
    for (const student of students) for (const realmId of chosen) stage(student.id, realmId, locked);
  }

  const lockedCount = students.reduce((n, s) => n + realms.filter((r) => isLocked(s.id, r.id)).length, 0);

  async function save() {
    if (!pending.size) return;
    setBusy(true);
    setMessage(null);
    const changes = [...pending.entries()].map(([k, locked]) => { const [studentId, realmId] = k.split(":"); return { studentId, realmId, locked }; });
    try {
      if (preview || !classId) {
        setSaved((current) => { const next = new Set(current); for (const c of changes) { if (c.locked) next.add(key(c.studentId, c.realmId)); else next.delete(key(c.studentId, c.realmId)); } return next; });
      } else {
        setSaved(toSet(await saveClassRealmLocks(classId, changes)));
      }
      setPending(new Map());
      setMessage({ kind: "success", text: `Realm access saved${preview ? " (preview only)" : ""}.` });
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Realm access could not be saved." });
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="rounded-2xl border border-[#E3E5E0] bg-white p-10 text-center text-sm font-semibold text-[#5A5E63]">Loading realm access…</div>;

  const realmChoices = <>
    <option value="">choose ▾</option>
    <option value="all">All realms</option>
    {realms.map((realm) => <option key={realm.id} value={realm.id}>{realm.label.split(" (")[0]}</option>)}
  </>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className={pill}>
          <Lock className="h-4 w-4" aria-hidden="true" />Lock for everyone
          <select value="" onChange={(event) => { if (event.target.value) setEveryone(event.target.value, true); }} aria-label="Lock a realm for everyone" className="appearance-none rounded-md border-0 bg-transparent font-extrabold text-[#121314] focus:outline-none">{realmChoices}</select>
        </label>
        <label className={pill}>
          <LockOpen className="h-4 w-4" aria-hidden="true" />Open for everyone
          <select value="" onChange={(event) => { if (event.target.value) setEveryone(event.target.value, false); }} aria-label="Open a realm for everyone" className="appearance-none rounded-md border-0 bg-transparent font-extrabold text-[#121314] focus:outline-none">{realmChoices}</select>
        </label>
        <span className="ml-auto text-[13px] font-bold text-[#5A5E63]">{lockedCount ? `${lockedCount} locked` : "Every realm open"}</span>
      </div>

      <div className="overflow-auto rounded-2xl border border-[#E3E5E0] bg-white">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b border-[#E3E5E0] bg-[#FAFBF8] px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8A8E89]">Student</th>
              {realms.map((realm) => (
                <th key={realm.id} className="border-b border-[#E3E5E0] bg-[#FAFBF8] px-3 py-3 text-left text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8A8E89]">
                  <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: reliqRealmColor(realm.id) }} />{realm.label.split(" (")[0]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-[#FAFBF8]">
                <td className="sticky left-0 border-b border-[#F1F2EE] bg-white px-4 py-2 font-bold text-[#121314]">{student.display_name}</td>
                {realms.map((realm) => {
                  const locked = isLocked(student.id, realm.id);
                  const changed = pending.has(key(student.id, realm.id));
                  return (
                    <td key={realm.id} className="border-b border-[#F1F2EE] px-3 py-2">
                      <button
                        type="button"
                        onClick={() => stage(student.id, realm.id, !locked)}
                        aria-pressed={locked}
                        aria-label={`${student.display_name} ${realm.label.split(" (")[0]}: ${locked ? "locked" : "open"}`}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-extrabold ${locked ? "bg-[#121314] text-white" : "bg-[#F1F2EE] text-[#3F4246] hover:bg-[#E6E8E2]"} ${changed ? "ring-2 ring-[#83E300] ring-offset-1" : ""}`}
                      >
                        {locked ? <Lock className="h-3.5 w-3.5" aria-hidden="true" /> : null}{locked ? "Locked" : "Open"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 text-xs font-semibold text-[#8A8E89]">Click a cell to lock or open a realm. Locked realms stay shut at school and at home until you open them. Students keep all their progress.</p>
        {message ? <p role={message.kind === "error" ? "alert" : "status"} className={`text-sm font-bold ${message.kind === "error" ? "text-red-700" : "text-[#3D6600]"}`}>{message.text}</p> : null}
        <button type="button" disabled={!pending.size || busy} onClick={() => setPending(new Map())} className="rounded-full border-2 border-[#121314] px-4 py-2 text-sm font-bold disabled:opacity-40">Discard</button>
        <button type="button" disabled={!pending.size || busy} onClick={() => void save()} className="rounded-full bg-[#83E300] px-5 py-2 text-sm font-extrabold text-[#121314] disabled:opacity-40">
          {busy ? "Saving…" : `Save realm access${pending.size ? ` (${pending.size})` : ""}`}
        </button>
      </div>
    </div>
  );
}
