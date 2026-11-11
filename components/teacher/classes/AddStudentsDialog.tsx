"use client";

import type { ReactNode } from "react";
import { Check, Search } from "lucide-react";
import type { ClassRow, SchoolDirectoryStudent, StudentSortMode } from "@/components/teacher/classes/types";
import { Dialog, btnPrimary, btnSecondary, field, fieldLabel } from "@/components/teacher/classes/ui";

export type AddTab = "school" | "new" | "upload";

type NewStudent = { first: string; last: string; username: string; pin: string; year: string };

type Props = {
  cls: ClassRow;
  tab: AddTab;
  onTab: (tab: AddTab) => void;
  onClose: () => void;
  yearLevels: string[];
  // Already at your school
  directory: {
    students: SchoolDirectoryStudent[];
    query: string; setQuery: (v: string) => void;
    year: string; setYear: (v: string) => void;
    unassignedOnly: boolean; setUnassignedOnly: (v: boolean) => void;
    sort: StudentSortMode; setSort: (v: StudentSortMode) => void;
    selected: Set<string>; toggle: (id: string) => void; toggleAllShown: () => void;
    loading: boolean; error: string; onAdd: () => void;
  };
  // New student
  draft: NewStudent;
  setDraft: (patch: Partial<NewStudent>) => void;
  creating: boolean;
  onCreate: () => void;
  lastCreated: { name: string; username: string; pin: string } | null;
  // Upload a list
  upload: ReactNode;
};

export function AddStudentsDialog(p: Props) {
  const isSchool = Boolean(p.cls.school_id);
  const d = p.directory;
  const tabs: Array<{ id: AddTab; title: string; text: string; show: boolean }> = [
    { id: "school", title: "Already at your school", text: "Students in RELIQ who aren't in this class", show: isSchool },
    { id: "new", title: "New student", text: "Type a name and year group", show: true },
    { id: "upload", title: "Upload a list", text: "A spreadsheet of names and year groups", show: true },
  ];
  const allShownSelected = d.students.length > 0 && d.students.every((s) => d.selected.has(s.id));

  const footer = p.tab === "school" ? (
    <>
      <span className="text-[15px] font-semibold">{d.selected.size} selected</span>
      <span className="flex gap-2">
        <button type="button" onClick={p.onClose} className={btnSecondary}>Cancel</button>
        <button type="button" onClick={d.onAdd} disabled={d.loading || d.selected.size === 0} className={btnPrimary}>
          {d.loading && d.students.length ? "Adding…" : `Add ${d.selected.size} student${d.selected.size === 1 ? "" : "s"}`}
        </button>
      </span>
    </>
  ) : p.tab === "new" ? (
    <>
      <span className="text-sm text-[#5b5b57]">A username and access code are made if you leave them blank.</span>
      <button type="button" onClick={p.onCreate} disabled={p.creating || !p.draft.first.trim() || !p.draft.year} className={btnPrimary}>{p.creating ? "Adding…" : "Add student"}</button>
    </>
  ) : null;

  return (
    <Dialog title={`Add students to ${p.cls.name}`} subtitle="Choose how you'd like to add them." onClose={p.onClose} footer={footer} width="max-w-4xl">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${tabs.filter((t) => t.show).length}, minmax(0, 1fr))` }}>
        {tabs.filter((t) => t.show).map((t) => (
          <button key={t.id} type="button" aria-pressed={p.tab === t.id} onClick={() => p.onTab(t.id)}
            className={`flex flex-col gap-1 rounded-2xl px-4 py-3.5 text-left ${p.tab === t.id ? "border-2 border-[#111] bg-[#f6fceb]" : "border border-[#d6d6d0] bg-white hover:border-[#111]"}`}>
            <span className="text-base font-extrabold">{t.title}</span>
            <span className="text-sm text-[#4a4a46]">{t.text}</span>
          </button>
        ))}
      </div>

      {p.tab === "school" ? (
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-end gap-3">
            <label className={`${fieldLabel} min-w-64 flex-1`}>Search your school
              <span className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#8a8a84]" />
                <input type="search" className={`${field} pl-9`} value={d.query} onChange={(e) => d.setQuery(e.target.value)} placeholder="Name, username or explorer code" />
              </span>
            </label>
            <label className={fieldLabel}>Year group
              <select className={field} value={d.year} onChange={(e) => d.setYear(e.target.value)}>
                <option value="">All years</option>
                {p.yearLevels.map((yr) => <option key={yr} value={yr}>{yr}</option>)}
              </select>
            </label>
            <label className={fieldLabel}>Sort by
              <select className={field} value={d.sort} onChange={(e) => d.setSort(e.target.value as StudentSortMode)}>
                <option value="last_name">Last name</option>
                <option value="first_name">First name</option>
                <option value="actual_year">Year group</option>
              </select>
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
              <input type="checkbox" className="h-4 w-4" checked={d.unassignedOnly} onChange={(e) => d.setUnassignedOnly(e.target.checked)} /> Not in a class yet
            </label>
            <button type="button" onClick={d.toggleAllShown} disabled={!d.students.length} className={btnSecondary}>{allShownSelected ? "Clear" : `Select all (${d.students.length})`}</button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#e6e6e1]">
            {d.loading && !d.students.length ? <p className="px-4 py-10 text-center text-sm text-[#5b5b57]">Loading your school&apos;s students…</p>
              : d.error ? <p className="bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{d.error}</p>
              : !d.students.length ? <p className="px-4 py-10 text-center text-sm text-[#5b5b57]">{d.unassignedOnly ? "Everyone is already in a class. Untick “Not in a class yet” to see all students." : "No students match. Your school leader adds new students to RELIQ."}</p>
              : d.students.map((s) => {
                const on = d.selected.has(s.id);
                return (
                  <button key={s.id} type="button" onClick={() => d.toggle(s.id)} aria-pressed={on}
                    className={`grid w-full grid-cols-[32px_1fr_120px_180px] items-center border-b border-[#f0f0ec] px-4 py-3 text-left text-[15px] last:border-b-0 ${on ? "bg-[#f6fceb]" : "bg-white hover:bg-[#fafaf8]"}`}>
                    <span className={`grid h-5 w-5 place-items-center rounded border ${on ? "border-[#111] bg-[#111] text-white" : "border-[#b5b5ae]"}`}>{on ? <Check size={13} /> : null}</span>
                    <span className="font-bold">{s.name}</span>
                    <span>{s.yearLevel ?? "Year not set"}</span>
                    <span className="text-[#5b5b57]">{s.classes.length ? `In ${s.classes.join(", ")}` : "Not in a class"}</span>
                  </button>
                );
              })}
          </div>
          <p className="text-sm text-[#5b5b57]">A student already in another class moves here. Their progress, results and rewards come with them.</p>
        </div>
      ) : null}

      {p.tab === "new" ? (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className={fieldLabel}>First name
            <input className={field} value={p.draft.first} onChange={(e) => p.setDraft({ first: e.target.value })} />
          </label>
          <label className={fieldLabel}>Last name
            <input className={field} value={p.draft.last} onChange={(e) => p.setDraft({ last: e.target.value })} />
          </label>
          <label className={fieldLabel}>Year group
            <select className={field} value={p.draft.year} onChange={(e) => p.setDraft({ year: e.target.value })}>
              <option value="">Select…</option>
              {p.yearLevels.map((yr) => <option key={yr} value={yr}>{yr}</option>)}
            </select>
          </label>
          <span className="grid grid-cols-2 gap-3">
            <label className={fieldLabel}>Username (optional)
              <input className={field} value={p.draft.username} onChange={(e) => p.setDraft({ username: e.target.value })} />
            </label>
            <label className={fieldLabel}>Access code (optional)
              <input className={`${field} font-mono tracking-[0.25em]`} inputMode="numeric" value={p.draft.pin} onChange={(e) => p.setDraft({ pin: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
            </label>
          </span>
          {p.lastCreated ? (
            <div role="status" className="col-span-2 rounded-2xl bg-[#eaf8d6] px-4 py-3 text-[15px] text-[#2f5a00]">
              Added <strong>{p.lastCreated.name}</strong> · username <strong>{p.lastCreated.username}</strong> · access code <strong className="font-mono">{p.lastCreated.pin}</strong>
            </div>
          ) : null}
        </div>
      ) : null}

      {p.tab === "upload" ? <div className="mt-5">{p.upload}</div> : null}
    </Dialog>
  );
}
