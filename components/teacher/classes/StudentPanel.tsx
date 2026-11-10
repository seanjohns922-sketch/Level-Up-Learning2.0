"use client";

import type { Dispatch, SetStateAction } from "react";
import { buildStudentUsername } from "@/lib/studentName";
import type { EditForm, HomeAccess, StudentRow } from "@/components/teacher/classes/types";
import { SectionTitle, SidePanel, btnDanger, btnDark, btnPrimary, btnSecondary, field, fieldLabel } from "@/components/teacher/classes/ui";

type Props = {
  student: StudentRow;
  className: string;
  classCode: string;
  explorerCode: string | null;
  claimCode: string | null;
  homeAccess: HomeAccess;
  yearLevels: string[];
  pinRevealed: boolean;
  onTogglePin: () => void;
  copyText: (value: string) => void;
  editForm: EditForm;
  setEditForm: Dispatch<SetStateAction<EditForm>>;
  onRegeneratePin: () => void;
  saving: boolean;
  onSave: () => void;
  onClose: () => void;
  archiving: boolean;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onPrintLoginCard: () => void;
  onPrintHomeCard: () => void;
};

export function StudentPanel(p: Props) {
  const s = p.student;
  const archived = Boolean(s.archived_at);
  const row = "flex items-center justify-between gap-3 border-b border-[#f0f0ec] px-4 py-2.5 last:border-b-0";
  const small = "rounded-lg border border-[#d6d6d0] bg-white px-3 py-1.5 text-sm font-bold hover:bg-[#f6f6f2]";
  const qrLink = s.qr_token ? `${typeof window === "undefined" ? "" : window.location.origin}/student?token=${s.qr_token}` : null;

  return (
    <SidePanel
      title={s.display_name}
      subtitle={`${p.editForm.school_year_level || "Year not set"} · ${p.className}${s.username ? ` · @${s.username}` : ""}${archived ? " · Archived" : ""}`}
      onClose={p.onClose}
      footer={archived ? (
        <>
          <button type="button" onClick={p.onDelete} className={btnDanger}>Delete permanently</button>
          <button type="button" onClick={p.onRestore} className={btnDark}>Restore student</button>
        </>
      ) : (
        <>
          <button type="button" onClick={p.onArchive} disabled={p.archiving} className={btnDanger}>{p.archiving ? "Archiving…" : "Archive student"}</button>
          <button type="button" onClick={p.onSave} disabled={p.saving || !p.editForm.first_name.trim()} className={btnDark}>{p.saving ? "Saving…" : "Save changes"}</button>
        </>
      )}
    >
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3" aria-label="Logging in at school">
          <SectionTitle>LOGGING IN AT SCHOOL</SectionTitle>
          <div className="overflow-hidden rounded-2xl border border-[#e6e6e1] text-[15px]">
            <div className={row}><span className="text-[#4a4a46]">Class code</span><strong className="font-mono tracking-widest">{p.classCode}</strong></div>
            <div className={row}><span className="text-[#4a4a46]">Username</span><strong>{s.username ?? "—"}</strong></div>
            <div className={row}><span className="text-[#4a4a46]">Access code</span>
              <span className="flex items-center gap-2">
                <strong className="min-w-12 text-right font-mono tracking-[0.2em]">{p.pinRevealed ? s.pin ?? "—" : "••••"}</strong>
                <button type="button" onClick={p.onTogglePin} className={small}>{p.pinRevealed ? "Hide" : "Show"}</button>
                {s.pin ? <button type="button" onClick={() => p.copyText(s.pin!)} className={small}>Copy</button> : null}
              </span>
            </div>
            <div className={row}><span className="text-[#4a4a46]">Explorer code</span>
              <span className="flex items-center gap-2" aria-label={`Explorer Code: ${p.explorerCode ?? "not set"}`}>
                <strong className="font-mono text-sm">{p.explorerCode ?? "—"}</strong>
                {p.explorerCode ? <button type="button" onClick={() => p.copyText(p.explorerCode!)} className={small}>Copy</button> : null}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={p.onPrintLoginCard} className={btnSecondary}>Print login card</button>
            {qrLink ? <button type="button" onClick={() => p.copyText(qrLink)} className={btnSecondary}>Copy QR login link</button> : null}
          </div>
        </section>

        {!archived ? (
          <section className="flex flex-col gap-3" aria-label="Home access">
            <SectionTitle>HOME ACCESS</SectionTitle>
            {p.homeAccess === "linked" ? (
              <div className="rounded-2xl bg-[#eaf8d6] px-4 py-3.5 text-[15px] font-semibold text-[#2f5a00]">A parent has linked this account. {s.first_name ?? "This student"} can learn at home.</div>
            ) : (
              <div className={`flex flex-col gap-3 rounded-2xl px-4 py-4 ${p.homeAccess === "waiting" ? "border border-[#f0d29a] bg-[#fff8ec]" : "border border-[#e6e6e1] bg-[#fafaf8]"}`}>
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-base">{p.homeAccess === "waiting" ? "Waiting for a parent to link" : "Not set up for home yet"}</strong>
                  {p.claimCode ? <span className="font-mono text-sm font-extrabold">{p.claimCode}</span> : null}
                </div>
                <p className="text-sm leading-relaxed text-[#4a4a46]">Send the family a link card. A parent signs up, chooses Link a child, enters the explorer code and confirms with {s.first_name ?? "their child"}&apos;s access code.</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={p.onPrintHomeCard} className={btnPrimary} disabled={!p.explorerCode}>Print family link card</button>
                  {p.claimCode ? <button type="button" onClick={() => p.copyText(p.claimCode!)} className={btnSecondary}>Copy claim code</button> : null}
                </div>
              </div>
            )}
          </section>
        ) : null}

        <section className="flex flex-col gap-3" aria-label="Details">
          <SectionTitle>DETAILS</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <label className={fieldLabel}>First name
              <input className={field} value={p.editForm.first_name} disabled={archived} onChange={(e) => p.setEditForm((f) => ({ ...f, first_name: e.target.value }))} />
            </label>
            <label className={fieldLabel}>Last name
              <input className={field} value={p.editForm.last_name} disabled={archived} onChange={(e) => p.setEditForm((f) => ({ ...f, last_name: e.target.value }))} />
            </label>
            <label className={fieldLabel}>Year group
              <select className={field} value={p.editForm.school_year_level} disabled={archived} onChange={(e) => p.setEditForm((f) => ({ ...f, school_year_level: e.target.value }))}>
                <option value="">Select…</option>
                {p.yearLevels.map((yr) => <option key={yr} value={yr}>{yr}</option>)}
              </select>
            </label>
            <label className={fieldLabel}>Username
              <input className={field} value={p.editForm.username} disabled={archived} placeholder={buildStudentUsername(p.editForm.first_name, p.editForm.last_name)} onChange={(e) => p.setEditForm((f) => ({ ...f, username: e.target.value }))} />
            </label>
            <label className={`${fieldLabel} col-span-2`}>Access code (4 digits)
              <span className="flex gap-2">
                <input className={`${field} font-mono tracking-[0.3em]`} inputMode="numeric" value={p.editForm.pin} disabled={archived} onChange={(e) => p.setEditForm((f) => ({ ...f, pin: e.target.value.replace(/\D/g, "").slice(0, 4) }))} />
                <button type="button" onClick={p.onRegeneratePin} disabled={archived} className={`${btnSecondary} whitespace-nowrap`}>New code</button>
              </span>
            </label>
            <label className={`${fieldLabel} col-span-2`}>Notes (only teachers see these)
              <textarea className={`${field} resize-none`} rows={2} value={p.editForm.notes} disabled={archived} placeholder="e.g. reading support" onChange={(e) => p.setEditForm((f) => ({ ...f, notes: e.target.value }))} />
            </label>
          </div>
        </section>
      </div>
    </SidePanel>
  );
}
