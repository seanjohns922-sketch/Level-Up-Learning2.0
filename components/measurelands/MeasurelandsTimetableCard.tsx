"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type TimetableTask = Extract<PracticeTask, { kind: "timetable" }>;
type Row = TimetableTask["rows"][number];

function fmt24(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}
function fmtDur(mins: number): string {
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
}

function Shell({ badge, prompt, speakText, children }: { badge: string; prompt: string; speakText?: string; children: React.ReactNode }) {
  return (
    <div className="measurelands-shell space-y-4">
      <div className="measurelands-prompt-card rounded-[30px] border px-5 py-5 shadow-[0_14px_42px_rgba(76,29,149,0.1)]" style={{ borderColor: "rgba(214,184,108,0.38)", background: "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)" }}>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(167,139,250,0.34)", color: "#5b21b6" }}>{badge}</div>
        <div className="flex items-start gap-3">
          <div className="measurelands-prompt-text flex-1 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">{prompt}</div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

export function MeasurelandsTimetableCard({ task, onCorrect, onWrong }: { task: TimetableTask; onCorrect: () => void; onWrong: () => void }) {
  const [filter, setFilter] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [wrongOpt, setWrongOpt] = useState<string | null>(null);
  const tappable = task.scene === "find" || task.scene === "compare";
  const activeDest = task.filters?.find((f) => f.id === filter)?.dest ?? null;

  const rowMatches = (r: Row) => activeDest === null || r.dest === activeDest;

  const tapRow = (r: Row) => {
    if (!tappable || !rowMatches(r)) return;
    if (r.id === task.answerRowId) { setPicked(r.id); window.setTimeout(onCorrect, 250); }
    else { setWrong(r.id); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };

  return (
    <Shell badge={task.badgeLabel ?? "Timetable"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.42)] bg-[rgba(255,252,245,0.97)] p-3">
        {task.context ? <div className="mb-2 text-center text-[13px] font-black uppercase tracking-[0.16em] text-[#a98b52]">{task.context.emoji} {task.context.label}</div> : null}
        {task.filters?.length ? (
          <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#a98b52]">Filter:</span>
            <button type="button" onClick={() => setFilter(null)} className={`rounded-full border-2 px-3 py-1 text-sm font-black transition ${filter === null ? "border-[#5b21b6] bg-[#5b21b6] text-white" : "border-[rgba(214,184,108,0.6)] bg-[#fffaf0] text-[#7c4a12]"}`}>All</button>
            {task.filters.map((f) => (
              <button key={f.id} type="button" onClick={() => setFilter(filter === f.id ? null : f.id)} className={`rounded-full border-2 px-3 py-1 text-sm font-black transition ${filter === f.id ? "border-[#5b21b6] bg-[#5b21b6] text-white" : "border-[rgba(214,184,108,0.6)] bg-[#fffaf0] text-[#7c4a12]"}`}>{f.label}</button>
            ))}
          </div>
        ) : null}
        {/* header */}
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-1 rounded-t-[14px] bg-[rgba(91,33,182,0.1)] px-3 py-2 text-[12px] font-black uppercase tracking-[0.1em] text-[#5b21b6]">
          <span>Service</span><span className="text-center">Departs</span><span className="text-center">Arrives</span><span className="text-center">Journey</span>
        </div>
        <div className="divide-y divide-[rgba(214,184,108,0.4)]">
          {task.rows.map((r) => {
            const dim = !rowMatches(r);
            const state = picked === r.id ? "picked" : wrong === r.id ? "bad" : "idle";
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => tapRow(r)}
                disabled={!tappable || dim}
                className={`grid w-full grid-cols-[1.6fr_1fr_1fr_1fr] items-center gap-1 px-3 py-2.5 text-left transition ${dim ? "opacity-35" : ""} ${state === "picked" ? "bg-[rgba(15,118,110,0.16)]" : state === "bad" ? "bg-[#FCE0E0]" : tappable && !dim ? "hover:bg-[rgba(91,33,182,0.05)]" : ""}`}
              >
                <span className="flex items-center gap-2 text-[15px] font-black text-[#2c1c07]">{r.emoji ? <span className="text-lg">{r.emoji}</span> : null}{r.route}</span>
                <span className="text-center text-[17px] font-black tabular-nums text-[#5b21b6]">{fmt24(r.departMin)}</span>
                <span className="text-center text-[17px] font-black tabular-nums text-[#5b21b6]">{fmt24(r.arriveMin)}</span>
                <span className="text-center text-[13px] font-bold text-[#5a4423]">{fmtDur(r.arriveMin - r.departMin)}</span>
              </button>
            );
          })}
        </div>
        {tappable ? <p className="mt-2 text-center text-[12px] font-bold text-[#a98b52]">Read each row, then tap the right service.</p> : null}
      </div>
      {task.scene === "mcq" ? (
        <div className={`grid gap-3 ${(task.options ?? []).length > 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"}`}>
          {(task.options ?? []).map((o) => (
            <button key={o} type="button" onClick={() => (o === task.correctOption ? onCorrect() : (setWrongOpt(o), onWrong(), window.setTimeout(() => setWrongOpt(null), 600)))} className={`relative flex min-h-[62px] items-center justify-center rounded-[22px] border-2 px-3 text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrongOpt === o ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
              <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={o} /></span>{o}
            </button>
          ))}
        </div>
      ) : null}
    </Shell>
  );
}
