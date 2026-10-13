"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { SchoolHomeSnapshot } from "@/lib/school-platform-server";
import { formatClassYearLevels } from "@/lib/studentLevelLabel";
import { useClassGroups } from "./useClassGroups";

/** Administration: group similar classes (all the 3/4s, or all the Year 3
 * classes) so their teachers can compare. Groups shape dashboards only; they
 * never change who can open or edit a class. */

type ClassRow = SchoolHomeSnapshot["classes"][number];
type Draft = { groupId: string | null; name: string; classIds: string[] };

async function sendGroupCommand(schoolId: string, payload: Record<string, unknown>) {
  const response = await fetch(`/api/school/${schoolId}/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    const message = result.error ?? "The class group could not be saved.";
    throw new Error(/save_class_group|delete_class_group|could not find the function|schema cache/i.test(message)
      ? "Class groups are not switched on for this school yet."
      : message);
  }
}

export default function ClassGroupsPanel({
  schoolId,
  academicYearId,
  classes,
  onSaved,
}: {
  schoolId: string;
  academicYearId: string;
  classes: ClassRow[];
  onSaved: (message: string) => void;
}) {
  const { groups, status, reload } = useClassGroups(schoolId, academicYearId);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const classById = useMemo(() => new Map(classes.map((item) => [item.id, item])), [classes]);
  const groupOfClass = useMemo(() => {
    const map = new Map<string, string>();
    groups.forEach((group) => group.classIds.forEach((id) => map.set(id, group.name)));
    return map;
  }, [groups]);

  // Suggest one group per set of identical year levels with 2+ ungrouped classes.
  const suggestions = useMemo(() => {
    const byYears = new Map<string, ClassRow[]>();
    classes
      .filter((item) => !groupOfClass.has(item.id) && item.yearLevels.length > 0)
      .forEach((item) => {
        const key = item.yearLevels.join("|");
        byYears.set(key, [...(byYears.get(key) ?? []), item]);
      });
    return [...byYears.values()]
      .filter((items) => items.length >= 2)
      .map((items) => ({ name: `${formatClassYearLevels(items[0].yearLevels)} classes`, classIds: items.map((item) => item.id), names: items.map((item) => item.name) }));
  }, [classes, groupOfClass]);

  async function run(payload: Record<string, unknown>, message: string) {
    setBusy(true);
    setError("");
    try {
      await sendGroupCommand(schoolId, payload);
      setDraft(null);
      reload();
      onSaved(message);
    } catch (commandError) {
      setError(commandError instanceof Error ? commandError.message : "The class group could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  const save = (value: Draft) =>
    run({ action: "saveClassGroup", academicYearId, groupId: value.groupId, name: value.name, classIds: value.classIds }, `Class group "${value.name.trim()}" saved`);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="text-xl font-extrabold tracking-tight">Class groups</h2>
          <p className="mt-1 text-sm text-slate-500">
            Group similar classes, such as all the 3/4s or all the Year 3 classes. Teachers in a group see each other&apos;s classes on their home page to compare. Groups don&apos;t change who can open or edit a class.
          </p>
        </div>
        {!draft ? (
          <button
            type="button"
            onClick={() => setDraft({ groupId: null, name: "", classIds: [] })}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-800 hover:border-slate-900"
          >
            <Plus className="h-4 w-4" /> New group
          </button>
        ) : null}
      </div>

      {error ? <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p> : null}

      {!draft && suggestions.length > 0 ? (
        <div className="mt-5 space-y-2">
          {suggestions.map((suggestion) => (
            <div key={suggestion.classIds.join()} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F3FBE4] px-4 py-3">
              <p className="text-sm">
                <span className="font-bold">Suggested: {suggestion.name}</span>
                <span className="text-slate-600"> · {suggestion.names.join(", ")}</span>
              </p>
              <span className="flex gap-2">
                <button type="button" onClick={() => setDraft({ groupId: null, name: suggestion.name, classIds: suggestion.classIds })} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-white">Edit first</button>
                <button type="button" disabled={busy} onClick={() => void save({ groupId: null, name: suggestion.name, classIds: suggestion.classIds })} className="rounded-lg bg-[#121314] px-3 py-2 text-sm font-bold text-white hover:bg-[#2A2C2E] disabled:opacity-50">Create group</button>
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {draft ? (
        <form
          className="mt-5 space-y-4 rounded-xl border border-slate-200 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void save(draft);
          }}
        >
          <label className="block text-sm font-semibold text-slate-700">
            Group name
            <input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              maxLength={60}
              placeholder="e.g. 3/4 classes"
              className="mt-1 block h-11 w-full max-w-md rounded-lg border border-slate-300 px-3 font-semibold"
              required
            />
          </label>
          <fieldset>
            <legend className="text-sm font-semibold text-slate-700">Classes (choose two or more)</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((item) => {
                const checked = draft.classIds.includes(item.id);
                const elsewhere = groupOfClass.get(item.id);
                const inOtherGroup = elsewhere && !(draft.groupId && groups.find((group) => group.id === draft.groupId)?.classIds.includes(item.id));
                return (
                  <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${checked ? "border-[#121314] bg-[#F3FBE4]" : "border-slate-200"}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setDraft({ ...draft, classIds: checked ? draft.classIds.filter((id) => id !== item.id) : [...draft.classIds, item.id] })}
                      className="mt-1 h-4 w-4 accent-[#121314]"
                    />
                    <span>
                      <span className="block font-bold">{item.name}</span>
                      <span className="block text-xs text-slate-500">
                        {formatClassYearLevels(item.yearLevels) || "Year level not set"}
                        {inOtherGroup ? ` · moves from ${elsewhere}` : ""}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy || draft.classIds.length < 2 || !draft.name.trim()} className="h-11 rounded-lg bg-[var(--reliq-lime,#B9F23F)] px-4 text-sm font-bold text-[#121314] disabled:opacity-50">
              {busy ? "Saving…" : "Save group"}
            </button>
            <button type="button" onClick={() => { setDraft(null); setError(""); }} className="h-11 rounded-lg px-4 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      ) : null}

      <div className="mt-5">
        {status === "loading" ? (
          <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
        ) : groups.length === 0 ? (
          !draft && suggestions.length === 0 ? <p className="border-t border-slate-100 pt-4 text-sm text-slate-500">No class groups yet.</p> : null
        ) : (
          <ul className="divide-y divide-slate-100 border-t border-slate-100">
            {groups.map((group) => (
              <li key={group.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div>
                  <p className="font-bold">{group.name}</p>
                  <p className="text-sm text-slate-500">{group.classIds.map((id) => classById.get(id)?.name ?? "Archived class").join(", ")}</p>
                </div>
                <span className="flex gap-1">
                  <button type="button" onClick={() => setDraft({ groupId: group.id, name: group.name, classIds: group.classIds })} aria-label={`Edit ${group.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                  <button type="button" disabled={busy} onClick={() => { if (window.confirm(`Remove the group "${group.name}"? Classes and students are not affected.`)) void run({ action: "deleteClassGroup", groupId: group.id }, `Class group "${group.name}" removed`); }} aria-label={`Remove ${group.name}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
