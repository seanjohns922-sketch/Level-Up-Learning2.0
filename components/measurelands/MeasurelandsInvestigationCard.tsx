"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { MeasureGlyph } from "@/components/measurelands/MeasurelandsToolChoiceCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type InvestigationTask = Extract<PracticeTask, { kind: "investigation" }>;

const STRAT_COLOR: Record<string, string> = {
  Perimeter: "#b45309", Area: "#7c3aed", Volume: "#0f766e", Time: "#2563eb",
  Length: "#5b21b6", Mass: "#9333ea", Capacity: "#0891b2", Angle: "#c026d3", Convert: "#16a34a",
  Plan: "#a16207",
};

export function MeasurelandsInvestigationCard({ task, onCorrect, onWrong }: { task: InvestigationTask; onCorrect: () => void; onWrong: () => void }) {
  const parts = task.parts ?? [];
  const reflection = task.reflection;
  const [idx, setIdx] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [solved, setSolved] = useState<string[]>([]); // answers of completed parts, in order
  const [phase, setPhase] = useState<"parts" | "reflect">("parts");
  const [picked, setPicked] = useState<string | null>(null);
  const part = parts[idx];
  const stratColor = part ? STRAT_COLOR[part.strategy] ?? "#5b21b6" : "#5b21b6";

  const pick = (o: string) => {
    if (!part) return;
    if (o === part.answer) {
      setWrong(null);
      const nextSolved = [...solved, o];
      setSolved(nextSolved);
      if (idx + 1 < parts.length) setIdx(idx + 1);
      else if (reflection) setPhase("reflect");
      else onCorrect();
    } else {
      setWrong(o); onWrong(); window.setTimeout(() => setWrong(null), 600);
    }
  };

  // ── Graduation reflection ───────────────────────────────────────────────────
  if (phase === "reflect" && reflection) {
    const chosen = reflection.skills.find((s) => s.label === picked) ?? null;
    return (
      <div className="measurelands-shell space-y-4">
        <div className="measurelands-prompt-card rounded-[30px] border px-5 py-5 text-center shadow-[0_14px_42px_rgba(76,29,149,0.12)]" style={{ borderColor: "rgba(214,184,108,0.42)", background: "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)" }}>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(167,139,250,0.34)", color: "#5b21b6" }}>🎓 Master of Measurelands</div>
          <div className="flex items-center justify-center gap-2 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">
            {reflection.prompt}
            <ReadAloudBtn text={reflection.speakText ?? reflection.prompt} size="md" className="shrink-0" />
          </div>
        </div>

        {chosen ? (
          <div className="rounded-[26px] border-2 px-6 py-8 text-center" style={{ borderColor: "rgba(214,184,108,0.55)", background: "linear-gradient(160deg, #fff9ef 0%, #faf3e4 60%, #f6ecd4 100%)" }}>
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_10px_28px_rgba(76,29,149,0.18)]">
              <MeasureGlyph kind={chosen.iconKey} className="h-14 w-14" />
            </div>
            <p className="mx-auto max-w-md text-xl font-black leading-snug text-[#2c1c07]">{chosen.message}</p>
            <button type="button" onClick={onCorrect} className="mt-6 inline-flex items-center gap-2 rounded-full px-8 py-3 text-lg font-black text-white shadow-[0_10px_28px_rgba(76,29,149,0.28)] transition hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
              🎓 Graduate — unlock the Post-Test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {reflection.skills.map((s) => (
              <button key={s.label} type="button" onClick={() => setPicked(s.label)} className="flex flex-col items-center gap-2 rounded-[22px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-3 py-4 text-center font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 hover:border-[#7c3aed]">
                <MeasureGlyph kind={s.iconKey} className="h-11 w-11" />
                <span className="text-[15px]">{s.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Investigation parts ─────────────────────────────────────────────────────
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
          {solved.length > 0 && (
            <div className="mt-3 rounded-[16px] border border-[rgba(22,163,74,0.3)] bg-[rgba(22,163,74,0.06)] p-3">
              <div className="mb-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-[#16a34a]">Spec so far ✓</div>
              <ul className="space-y-1">
                {solved.map((ans, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 text-[14px] font-bold text-[#2c1c07]">
                    <span className="text-[#5b7a52]">{parts[i]?.spec ?? parts[i]?.strategy}</span>
                    <span className="font-black text-[#166534]">{ans}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full px-3 py-1 text-[12px] font-black uppercase tracking-wide text-white" style={{ background: stratColor }}>{part?.strategy}</span>
            <div className="flex gap-1.5">{parts.map((_, i) => <span key={i} className={`h-2.5 w-6 rounded-full ${i < idx ? "bg-[#16a34a]" : i === idx ? "bg-[#5b21b6]" : "bg-[rgba(124,58,237,0.2)]"}`} />)}</div>
          </div>
          {part?.note && <p className="mb-2 rounded-[14px] bg-[rgba(124,58,237,0.06)] px-3 py-2 text-[14px] font-bold text-[#5b21b6]">{part.note}</p>}
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
