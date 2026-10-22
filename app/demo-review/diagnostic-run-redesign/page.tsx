"use client";

import { useState } from "react";
import { CalendarDays, Check, Info, ListChecks, Lock, TrendingUp, Unlock, UserPlus } from "lucide-react";
import { STANDING_META, standingForGap } from "@/lib/proficiency";

/** Review-only: the Run diagnostic view as three steps (assign, session, progress) with one checkpoint switch. Pretend data. */

type Checkpoint = "start" | "mid" | "end";
type Strand = "done" | number | null; // done, questions answered out of 20, not started
type Row = { name: string; year: number; assigned: boolean; strands: Strand[]; overall?: number };

const STRANDS = ["Number", "Measurement", "Space", "Statistics", "Algebra", "Probability"];
const D: Strand = "done";

const ROWS: Row[] = [
  { name: "Brody Ambrose", year: 3, assigned: true, strands: [D, D, D, 12, null, null] },
  { name: "Hunter Bamford", year: 4, assigned: true, strands: [D, D, D, D, D, D], overall: 3.9 },
  { name: "Amani Boston", year: 3, assigned: true, strands: [D, 7, null, null, null, null] },
  { name: "Robert Cairns", year: 3, assigned: true, strands: [null, null, null, null, null, null] },
  { name: "Ella Chatfield", year: 3, assigned: true, strands: [D, D, D, D, D, D], overall: 3.8 },
  { name: "Toma Coates", year: 3, assigned: true, strands: [D, D, 15, null, null, null] },
  { name: "Darcy Duhring", year: 3, assigned: false, strands: [null, null, null, null, null, null] },
  { name: "Jepp Goldsmith", year: 4, assigned: true, strands: [D, D, D, D, D, D], overall: 4.5 },
  { name: "Jade Mccance", year: 3, assigned: true, strands: [D, D, D, D, D, 18] },
  { name: "Isla Macartney", year: 3, assigned: true, strands: [null, null, null, null, null, null] },
  { name: "Cooper Sweeney", year: 4, assigned: true, strands: [D, D, D, D, D, D], overall: 3.3 },
  { name: "Waldo Oosthuizen", year: 3, assigned: false, strands: [null, null, null, null, null, null] },
];

const LABEL: Record<Checkpoint, string> = { start: "Start", mid: "Mid", end: "End" };

function rowState(r: Row) {
  if (!r.assigned) return "unassigned" as const;
  if (r.strands.every((s) => s === "done")) return "finished" as const;
  if (r.strands.some((s) => s !== null)) return "progress" as const;
  return "notStarted" as const;
}

function StrandCell({ s }: { s: Strand }) {
  if (s === "done") return <span title="Done" className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#121314] text-[#83E300]"><Check className="h-4 w-4" strokeWidth={3} /></span>;
  if (typeof s === "number") return (
    <span title={`${s} of 20 answered`} className="mx-auto flex w-12 flex-col items-center">
      <span className="text-[11px] font-black tabular-nums text-[#121314]">{s}/20</span>
      <span className="mt-0.5 h-1 w-full overflow-hidden rounded-full bg-[#ECEDE9]"><span className="block h-full rounded-full bg-[#5FAE00]" style={{ width: `${(s / 20) * 100}%` }} /></span>
    </span>
  );
  return <span className="mx-auto block h-1.5 w-4 rounded-full bg-[#E3E5E0]" title="Not started" />;
}

function Step({ n, title, children, active }: { n: number; title: string; children: React.ReactNode; active?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${active ? "border-[#83E300] bg-[#F6FDEB]" : "border-[#E3E5E0] bg-white"}`}>
      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#8F948C]">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#121314] text-[10px] text-white">{n}</span>{title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function DiagnosticRunReview() {
  const [checkpoint, setCheckpoint] = useState<Checkpoint>("end");
  const [open, setOpen] = useState(false);
  const counts = ROWS.reduce((acc, r) => { acc[rowState(r)] += 1; return acc; }, { finished: 0, progress: 0, notStarted: 0, unassigned: 0 });
  const assigned = ROWS.length - counts.unassigned;
  const cols = "grid grid-cols-[minmax(170px,1.3fr)_repeat(6,minmax(56px,0.55fr))_minmax(170px,1fr)] items-center gap-3";

  return (
    <main className="reliq-adult min-h-screen bg-[#F4F4F0] px-6 py-8">
      <div className="mx-auto grid max-w-7xl gap-4">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-[#121314]">Run diagnostic — upgrade</h1>
          <p className="text-sm text-[#5A5E63]">Pretend data. Try the Start / Mid / End switch and the Open session button.</p>
        </div>

        {/* Header: same as the Live progression view */}
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#E3E5E0] bg-white px-5 py-4">
          <h2 className="font-display text-xl font-black text-[#121314]">Whole-Maths Diagnostic</h2>
          <div className="flex items-center gap-1 rounded-xl bg-[#F1F2EE] p-1 text-sm font-bold">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-[#3F4246]"><TrendingUp className="h-4 w-4" />Live progression</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#121314] px-3.5 py-1.5 text-white"><ListChecks className="h-4 w-4" />Run diagnostic</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8F948C]">Checkpoint</span>
            <div className="flex items-center gap-1 rounded-full border-2 border-[#121314] p-0.5 text-sm font-bold">
              {(["start", "mid", "end"] as Checkpoint[]).map((c) => (
                <button key={c} type="button" onClick={() => setCheckpoint(c)} className={`rounded-full px-4 py-1 ${checkpoint === c ? "bg-[#121314] text-white" : "text-[#121314]"}`}>{LABEL[c]}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Live session strip */}
        {open ? (
          <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-[#121314] px-5 py-3.5 text-white">
            <span className="relative flex h-3 w-3"><span className="absolute inset-0 animate-ping rounded-full bg-[#83E300] opacity-70" /><span className="relative h-3 w-3 rounded-full bg-[#83E300]" /></span>
            <p className="text-sm font-black">{LABEL[checkpoint]} diagnostic session open</p>
            <p className="text-sm text-[#C9CCC6]">Closes 11:45 · <b className="text-white">1h 32m left</b> · assigned students can work now</p>
            <button type="button" onClick={() => setOpen(false)} className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-black text-[#121314]"><Lock className="h-4 w-4" />Close now</button>
          </div>
        ) : null}

        {/* Three steps */}
        <div className="grid gap-3 md:grid-cols-3">
          <Step n={1} title="Assign">
            <p className="font-display text-3xl font-black text-[#121314]">{assigned}<span className="text-lg text-[#8F948C]"> / {ROWS.length}</span></p>
            <p className="text-xs font-semibold text-[#5A5E63]">students assigned the {LABEL[checkpoint]} diagnostic</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#121314] px-3.5 py-1.5 text-sm font-bold text-[#121314]"><CalendarDays className="h-4 w-4" />Assign students</span>
          </Step>
          <Step n={2} title="Session" active={open}>
            {open ? (
              <>
                <p className="font-display text-3xl font-black text-[#3D6600]">Open</p>
                <p className="text-xs font-semibold text-[#5A5E63]">until 11:45 today</p>
              </>
            ) : (
              <>
                <p className="font-display text-3xl font-black text-[#121314]">Closed</p>
                <p className="text-xs font-semibold text-[#5A5E63]">Students can only work during a session at school</p>
              </>
            )}
            {!open ? <button type="button" onClick={() => setOpen(true)} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#83E300] px-4 py-1.5 text-sm font-black text-[#121314]"><Unlock className="h-4 w-4" />Open for 2 hours</button> : null}
          </Step>
          <Step n={3} title="Progress">
            <div className="grid grid-cols-3 gap-2">
              <div><p className="font-display text-3xl font-black text-[#121314]">{counts.finished}</p><p className="text-[11px] font-semibold text-[#5A5E63]">finished</p></div>
              <div><p className="font-display text-3xl font-black text-[#3D6600]">{counts.progress}</p><p className="text-[11px] font-semibold text-[#5A5E63]">in progress</p></div>
              <div><p className="font-display text-3xl font-black text-[#8F948C]">{counts.notStarted}</p><p className="text-[11px] font-semibold text-[#5A5E63]">not started</p></div>
            </div>
          </Step>
        </div>

        {/* Progress table: every student, six strands */}
        <div className="overflow-hidden rounded-2xl border border-[#E3E5E0] bg-white">
          <div className={`${cols} border-b border-[#E3E5E0] bg-[#FAFBF8] px-5 py-3 text-center text-[10px] font-black uppercase tracking-[0.12em] text-[#8F948C]`}>
            <span className="text-left">Student</span>
            {STRANDS.map((s) => <span key={s} className="truncate">{s}</span>)}
            <span className="text-right">{LABEL[checkpoint]} result</span>
          </div>
          {ROWS.map((r) => {
            const state = rowState(r);
            const meta = r.overall != null ? STANDING_META[standingForGap(r.overall - r.year)] : null;
            return (
              <div key={r.name} className={`${cols} border-b border-[#F1F2EE] px-5 py-2.5 text-center last:border-0 ${state === "unassigned" ? "bg-[#FAFBF8]" : ""}`}>
                <div className="min-w-0 text-left">
                  <p className={`truncate text-sm font-black ${state === "unassigned" ? "text-[#A3A7A1]" : "text-[#121314]"}`}>{r.name}</p>
                  <p className="text-[11px] font-semibold text-[#8F948C]">
                    {state === "finished" ? "Finished" : state === "progress" ? `${r.strands.filter((s) => s === "done").length} of 6 strands` : state === "notStarted" ? "Assigned · not started" : "Not assigned"}
                  </p>
                </div>
                {state === "unassigned" ? (
                  <span className="col-span-6 text-xs font-semibold text-[#A3A7A1]">Not assigned the {LABEL[checkpoint]} diagnostic</span>
                ) : r.strands.map((s, i) => <StrandCell key={i} s={s} />)}
                <div className="flex items-center justify-end gap-2">
                  {state === "finished" && meta ? (
                    <>
                      <span className="rounded-lg px-2 py-1 text-sm font-black tabular-nums" style={{ background: meta.bg, color: meta.fg }}>{r.overall?.toFixed(1)}</span>
                      <span className="rounded-full bg-[#121314] px-3 py-1 text-xs font-bold text-[#83E300]">Report</span>
                    </>
                  ) : state === "unassigned" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#121314] px-3 py-1 text-xs font-bold text-[#121314]"><UserPlus className="h-3.5 w-3.5" />Assign</span>
                  ) : (
                    <span className="text-xs font-semibold text-[#A3A7A1]">After all 6 strands</span>
                  )}
                </div>
              </div>
            );
          })}
          <p className="flex items-center gap-2 border-t border-[#E3E5E0] bg-[#FAFBF8] px-5 py-3 text-xs font-semibold text-[#5A5E63]">
            <Info className="h-4 w-4 shrink-0" />Each strand is 20 questions and saves after every answer. The overall result appears once all six strands are done. A diagnostic can move a student up a level but never down.
          </p>
        </div>
      </div>
    </main>
  );
}
