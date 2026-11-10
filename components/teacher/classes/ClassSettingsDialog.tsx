"use client";

import type { ClassRow } from "@/components/teacher/classes/types";
import { Dialog, btnDanger, btnDark, btnSecondary, field, fieldLabel, SectionTitle } from "@/components/teacher/classes/ui";

type Props = {
  cls: ClassRow;
  yearLevels: string[];
  form: { name: string; year_levels: string[] };
  setName: (name: string) => void;
  toggleYear: (year: string) => void;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
  archiving: boolean;
  onArchive: () => void;
  deleting: boolean;
  onDelete: () => void;
};

export function ClassSettingsDialog(p: Props) {
  return (
    <Dialog
      title="Class settings"
      subtitle={`${p.cls.name} · class code ${p.cls.class_code}`}
      onClose={p.onClose}
      width="max-w-2xl"
      footer={(
        <>
          <button type="button" onClick={p.onClose} className={btnSecondary}>Cancel</button>
          <button type="button" onClick={p.onSave} disabled={p.saving || !p.form.name.trim()} className={btnDark}>{p.saving ? "Saving…" : "Save changes"}</button>
        </>
      )}
    >
      <div className="flex flex-col gap-6">
        <label className={fieldLabel}>Class name
          <input className={field} value={p.form.name} onChange={(e) => p.setName(e.target.value)} placeholder="e.g. 3/4J" />
        </label>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-[#4a4a46]">Year groups in this class</span>
          <div className="flex flex-wrap gap-2">
            {p.yearLevels.map((yr) => {
              const on = p.form.year_levels.includes(yr);
              return (
                <button key={yr} type="button" aria-pressed={on} onClick={() => p.toggleYear(yr)}
                  className={`rounded-full px-3.5 py-2 text-sm font-bold ${on ? "bg-[#111] text-white" : "border border-[#d0d0ca] bg-white hover:border-[#111]"}`}>{yr}</button>
              );
            })}
          </div>
        </div>
        <section className="flex flex-col gap-3 rounded-2xl border border-[#ececE7] p-4">
          <SectionTitle>CLOSE THIS CLASS</SectionTitle>
          <p className="text-sm text-[#4a4a46]">Archiving hides the class but keeps every student and result. You can restore it any time. Deleting removes the class and its students for good.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={p.onArchive} disabled={p.archiving} className={btnSecondary}>{p.archiving ? "Archiving…" : "Archive class"}</button>
            <button type="button" onClick={p.onDelete} disabled={p.deleting} className={btnDanger}>{p.deleting ? "Deleting…" : "Delete class"}</button>
          </div>
        </section>
      </div>
    </Dialog>
  );
}
