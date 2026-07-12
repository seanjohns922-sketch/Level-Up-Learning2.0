"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type InvestigationTask = Extract<PracticeTask, { kind: "investigation" }>;

const STRAT_COLOR: Record<string, string> = {
  Perimeter: "#b45309", Area: "#7c3aed", Volume: "#0f766e", Time: "#2563eb",
  Length: "#5b21b6", Mass: "#9333ea", Capacity: "#0891b2", Angle: "#c026d3", Convert: "#16a34a",
};

export function MeasurelandsInvestigationCard({ task, onCorrect, onWrong }: { task: InvestigationTask; onCorrect: () => void; onWrong: () => void }) {
  const parts = task.parts ?? [];
  const [idx, setIdx] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const part = parts[idx];
  const stratColor = part ? STRAT_COLOR[part.strategy] ?? "#5b21b6" : "#5b21b6";
  const pick = (o: string) => {
    if (!part) return;
    if (o === part.answer) { setWrong(null); if (idx + 1 < parts.length) setIdx(idx + 1); else onCorrect(); }
    else { setWrong(o); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };
  return (
    <div className="measurelands-shell space-y-4">
      <div className="measurelands-prompt-card rounded-[30px] border px-5 py-5 shadow-[0_14px_42px_rgba(76,29,149,0.1)]" style={{ borderColor: "rgba(214,184,108,0.38)", background: "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)" }}>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(167,139,250,0.34)", color: "#5b21b6" }}>{task.badgeLabel ?? "Master Engineer Challenge"}</div>
        <div className="flex items-start gap-3">
          <div className="flex-1 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">{task.emoji} {task.title ?? task.prompt}</div>
          <ReadAloudBtn text={task.speakText ?? `${task.title}. ${(task.facts ?? []).join(". ")}`} size="md" className="shrink-0" />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
          <div className="mb-2 text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">The brief</div>
          <ul className="space-y-1.5">
            {(task.facts ?? []).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-[15px] font-bold text-[#2c1c07]"><span className="text-[#7c3aed]">•</span>{f}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-center rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full px-3 py-1 text-[12px] font-black uppercase tracking-wide text-white" style={{ background: stratColor }}>{part?.strategy}</span>
            <div className="flex gap-1.5">{parts.map((_, i) => <span key={i} className={`h-2.5 w-6 rounded-full ${i < idx ? "bg-[#16a34a]" : i === idx ? "bg-[#5b21b6]" : "bg-[rgba(124,58,237,0.2)]"}`} />)}</div>
          </div>
          <p className="text-[17px] font-black leading-snug text-[#2c1c07]">{part?.q}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(part?.options ?? []).map((o) => (
          <button key={o} type="button" onClick={() => pick(o)} className={`relative flex min-h-[64px] items-center justify-center rounded-[22px] border-2 px-3 text-center text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === o ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={o} /></span>{o}
          </button>
        ))}
      </div>
    </div>
  );
}
