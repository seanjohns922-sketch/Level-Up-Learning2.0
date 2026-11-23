"use client";
// Teachers send Rex the maths T-rex to the whole class or to the students they tick.
import { Footprints, X } from "lucide-react";
import { useState } from "react";
import { REX_QUESTIONS, REX_XP } from "@/lib/rex";
import { sendRex } from "@/lib/rex-client";

type Student = { id: string; display_name: string };

export function SendRexDialog({ classId, className, students, onClose, onSent }: { classId: string; className: string; students: readonly Student[]; onClose: () => void; onSent: (message: string) => void }) {
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set(students.map((student) => student.id)));
  const [busy, setBusy] = useState(false);
  const everyone = picked.size === students.length;
  const toggle = (id: string) => setPicked((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const send = async () => {
    setBusy(true);
    try {
      const sent = await sendRex(everyone ? { classId } : { studentIds: [...picked] });
      onSent(sent ? `Rex is on his way to ${sent} explorer${sent === 1 ? "" : "s"}.` : "Rex is already visiting everyone you picked.");
    } catch {
      onSent("Rex couldn't be sent just now. Try again in a moment.");
    }
    setBusy(false);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#121314]/45 p-4" role="dialog" aria-modal="true" aria-labelledby="send-rex-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="flex max-h-[85dvh] w-full max-w-md flex-col rounded-2xl border border-[#E3E5E0] bg-white p-6 shadow-[0_24px_70px_-24px_rgba(15,23,42,0.55)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="send-rex-title" className="flex items-center gap-2 text-xl font-black text-[#121314]"><Footprints className="h-5 w-5" aria-hidden="true" />Send Rex</h2>
            <p className="mt-1 text-sm text-[#5A5E63]">Rex the maths T-rex wakes in their hub. {REX_QUESTIONS} easy questions at their level tame him (+{REX_XP} XP), then finishing a lesson sends him home.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#E3E5E0] text-[#5A5E63] hover:bg-[#FAFBF8]" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 border-b border-[#EDEEE9] pb-3">
          <p className="text-sm font-bold text-[#121314]">{className} · {picked.size} of {students.length} picked</p>
          <button type="button" onClick={() => setPicked(everyone ? new Set() : new Set(students.map((student) => student.id)))} className="text-sm font-bold text-[#3D6600] hover:underline">{everyone ? "Clear all" : "Whole class"}</button>
        </div>
        <ul className="mt-2 min-h-0 flex-1 overflow-y-auto">
          {students.map((student) => (
            <li key={student.id}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-[#F1F2EE]">
                <input type="checkbox" checked={picked.has(student.id)} onChange={() => toggle(student.id)} className="h-4 w-4 accent-[#121314]" />
                <span className="text-sm font-semibold text-[#121314]">{student.display_name}</span>
              </label>
            </li>
          ))}
        </ul>
        <button type="button" disabled={busy || picked.size === 0} onClick={() => void send()} className="mt-4 min-h-12 rounded-xl bg-[#83E300] font-black uppercase tracking-wide text-[#121314] disabled:opacity-50">
          {everyone ? "Send Rex to the whole class" : `Send Rex to ${picked.size} student${picked.size === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  );
}
