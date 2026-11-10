"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import type { HomeAccess } from "@/components/teacher/classes/types";

// Shared pieces for My Classes, in the adult RELIQ style: black and white with the green accent.
export const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#111] bg-[#83E300] px-4 py-2.5 text-sm font-extrabold text-[#111] hover:brightness-95 disabled:opacity-50";
export const btnSecondary = "inline-flex items-center justify-center gap-2 rounded-xl border border-[#c9c9c3] bg-white px-4 py-2.5 text-sm font-bold text-[#111] hover:bg-[#f6f6f2] disabled:opacity-50";
export const btnDark = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#111] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#2a2a2a] disabled:opacity-50";
export const btnDanger = "inline-flex items-center justify-center gap-2 rounded-xl border border-[#c9c9c3] bg-white px-4 py-2.5 text-sm font-bold text-[#8a2c00] hover:bg-[#fff4ef] disabled:opacity-50";
export const iconBtn = "grid h-9 w-9 place-items-center rounded-lg text-[#4a4a46] hover:bg-[#f0f0ec] hover:text-[#111]";
export const field = "w-full rounded-xl border border-[#c9c9c3] bg-white px-3 py-2.5 text-[15px] font-medium text-[#111] outline-none focus:border-[#111]";
export const fieldLabel = "flex flex-col gap-1.5 text-[13px] font-bold text-[#4a4a46]";
export const chip = (active: boolean) =>
  `rounded-full px-3.5 py-2 text-sm font-semibold transition ${active ? "bg-[#111] text-white" : "border border-[#d0d0ca] bg-white text-[#111] hover:border-[#111]"}`;

const HOME_LABEL: Record<HomeAccess, string> = { linked: "Linked", waiting: "Waiting to link", school: "School only" };
const HOME_STYLE: Record<HomeAccess, string> = {
  linked: "bg-[#eaf8d6] text-[#2f5a00]",
  waiting: "border border-[#f0d29a] bg-[#fff4e0] text-[#8a4b00]",
  school: "bg-[#f1f1ed] text-[#3e3e3a]",
};

export function HomePill({ status }: { status: HomeAccess }) {
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${HOME_STYLE[status]}`}>{HOME_LABEL[status]}</span>;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-xs font-extrabold tracking-[0.08em] text-[#5b5b57]">{children}</h3>;
}

/** Centred dialog with a dimmed backdrop. */
export function Dialog({ title, subtitle, onClose, children, footer, width = "max-w-3xl" }: {
  title: string; subtitle?: string; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`flex max-h-[90vh] w-full ${width} flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl`}>
        <div className="flex items-start justify-between gap-4 px-7 pb-4 pt-6">
          <div>
            <h2 className="font-[Montserrat,sans-serif] text-2xl font-extrabold text-[#111]">{title}</h2>
            {subtitle ? <p className="mt-1 text-[15px] text-[#4a4a46]">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#d6d6d0] hover:bg-[#f6f6f2]"><X size={18} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-6">{children}</div>
        {footer ? <div className="flex items-center justify-between gap-3 border-t border-[#ececE7] bg-[#fafaf8] px-7 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}

/** Right-hand side panel for one student. */
export function SidePanel({ title, subtitle, onClose, children, footer }: {
  title: string; subtitle?: string; onClose: () => void; children: ReactNode; footer?: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="flex-1 cursor-default" aria-label="Close panel" onClick={onClose} />
      <aside className="flex h-full w-full max-w-[520px] flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#ececE7] px-7 pb-5 pt-7">
          <div>
            <h2 className="font-[Montserrat,sans-serif] text-2xl font-extrabold text-[#111]">{title}</h2>
            {subtitle ? <p className="mt-1 text-[15px] text-[#4a4a46]">{subtitle}</p> : null}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#d6d6d0] hover:bg-[#f6f6f2]"><X size={18} /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">{children}</div>
        {footer ? <div className="flex items-center justify-between gap-3 border-t border-[#ececE7] bg-[#fafaf8] px-7 py-4">{footer}</div> : null}
      </aside>
    </div>
  );
}
