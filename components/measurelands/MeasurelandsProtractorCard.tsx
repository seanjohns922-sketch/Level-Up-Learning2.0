"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { MeasurelandsAngle } from "@/components/measurelands/MeasurelandsAngle";
import { MeasurelandsProtractor } from "@/components/measurelands/MeasurelandsProtractor";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type ProtractorTask = Extract<PracticeTask, { kind: "protractor" }>;

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

function ContextLine({ task }: { task: ProtractorTask }) {
  if (!task.context) return null;
  return <div className="text-center text-[12px] font-black uppercase tracking-[0.14em] text-[#a98b52]">{task.context.emoji} {task.context.label}</div>;
}

function DegRow({ options, correct, onCorrect, onWrong, onWrongPick }: { options: number[]; correct: number; onCorrect: () => void; onWrong: () => void; onWrongPick?: () => void }) {
  const [wrong, setWrong] = useState<number | null>(null);
  const [reveal, setReveal] = useState(false);
  const pick = (n: number) => {
    if (n === correct) onCorrect();
    else { setWrong(n); setReveal(true); onWrong(); onWrongPick?.(); }
  };
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3">
        {options.map((n) => {
          const showCorrect = reveal && n === correct;
          return (
            <button key={n} type="button" onClick={() => pick(n)} className={`relative flex min-h-[64px] items-center justify-center rounded-[22px] border-2 px-3 text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === n ? "border-[#C0564E] bg-[#FCE0E0]" : showCorrect ? "border-[#16a34a] bg-[rgba(22,163,74,0.14)]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
              <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={`${n} degrees`} /></span>{n}°{showCorrect ? " ✓" : ""}
            </button>
          );
        })}
      </div>
      {reveal ? <p className="text-center text-sm font-black text-[#16a34a]">It was {correct}° — tap the green answer to continue.</p> : null}
    </div>
  );
}

/* ── L1 Estimate (no protractor) ── */
function EstimateScene({ task, onCorrect, onWrong, badge }: { task: ProtractorTask; onCorrect: () => void; onWrong: () => void; badge: string }) {
  return (
    <Shell badge={task.badgeLabel ?? badge} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-col items-center gap-2 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <ContextLine task={task} />
        <MeasurelandsAngle turn={task.angle ?? 45} arm1={110} arm2={110} size={240} />
      </div>
      <DegRow options={task.options ?? []} correct={task.correctOption ?? 0} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

function GuessScene({ task, onCorrect, onWrong }: { task: ProtractorTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  const pick = (yes: boolean) => {
    if (yes === task.sensible) onCorrect();
    else { setWrong(yes ? "y" : "n"); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };
  return (
    <Shell badge={task.badgeLabel ?? "Professor Gauge's Guess"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-col items-center gap-2 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <ContextLine task={task} />
        <MeasurelandsAngle turn={task.angle ?? 45} arm1={110} arm2={110} size={230} />
        {task.statement ? <div className="rounded-full border-2 border-[rgba(214,184,108,0.6)] bg-white px-4 py-1.5 text-lg font-black text-[#5b21b6]">{task.statement}</div> : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => pick(true)} className={`min-h-[64px] rounded-[22px] border-2 px-4 text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === "y" ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>Sensible 👍</button>
        <button type="button" onClick={() => pick(false)} className={`min-h-[64px] rounded-[22px] border-2 px-4 text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === "n" ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>Not sensible 👎</button>
      </div>
    </Shell>
  );
}

/* ── L2 Measure (protractor) ── */
function ReadScene({ task, onCorrect, onWrong, badge }: { task: ProtractorTask; onCorrect: () => void; onWrong: () => void; badge: string }) {
  const [revealed, setRevealed] = useState(false);
  const guidance = revealed ? "full" : task.guidance ?? "full";
  return (
    <Shell badge={task.badgeLabel ?? badge} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-col items-center gap-1 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-2">
        <ContextLine task={task} />
        <MeasurelandsProtractor angle={task.angle ?? 60} baselineSide={task.baselineSide ?? "right"} guidance={guidance} />
        {revealed ? <p className="text-center text-[13px] font-bold text-[#b45309]">Start at the glowing 0° and read that scale.</p> : <p className="text-center text-[12px] font-bold text-[#a98b52]">Read from the 0° on your baseline arm.</p>}
      </div>
      <DegRow options={task.options ?? []} correct={task.correctOption ?? 0} onCorrect={onCorrect} onWrong={onWrong} onWrongPick={() => setRevealed(true)} />
    </Shell>
  );
}

function MistakeScene({ task, onCorrect, onWrong }: { task: ProtractorTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  return (
    <Shell badge={task.badgeLabel ?? "Professor Gauge's Mistake"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-col items-center gap-1 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-2">
        <MeasurelandsProtractor angle={task.angle ?? 60} baselineSide={task.baselineSide ?? "right"} guidance="baseline" />
        {task.statement ? <div className="rounded-full border-2 border-[rgba(192,86,78,0.5)] bg-[rgba(252,224,224,0.5)] px-4 py-1.5 text-lg font-black text-[#8a2b24]">{task.statement}</div> : null}
      </div>
      <div className="grid gap-3">
        {(task.reasonOptions ?? []).map((r) => (
          <button key={r} type="button" onClick={() => (r === task.correctReason ? onCorrect() : (setWrong(r), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`relative flex min-h-[56px] items-center justify-center rounded-[22px] border-2 px-4 text-base font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === r ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={r} /></span>{r}
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── L3 Construct (drag) ── */
function ConstructScene({ task, onCorrect }: { task: ProtractorTask; onCorrect: () => void }) {
  const target = task.targetDeg ?? 45;
  const [deg, setDeg] = useState(0);
  const atTarget = deg === target;
  return (
    <Shell badge={task.badgeLabel ?? "Build the Angle"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-col items-center gap-1 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-2">
        <ContextLine task={task} />
        <MeasurelandsProtractor interactive baselineSide="right" targetDeg={target} currentDeg={deg} onDeg={setDeg} guidance="none" />
        <p className="text-center text-[13px] font-black text-[#5b21b6]">Target: {target}° — drag the purple arm to build it.</p>
      </div>
      <button type="button" disabled={!atTarget} onClick={onCorrect} className={`mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 px-10 text-xl font-black uppercase shadow-sm transition ${atTarget ? "border-[#16a34a] bg-[#16a34a] text-white hover:-translate-y-0.5" : "border-[rgba(214,184,108,0.5)] bg-[#f3ead2] text-[#a98b52]"}`}>{atTarget ? `Build ${target}° ✓` : `Build (${deg}°)`}</button>
    </Shell>
  );
}

function IntroScene({ task, onCorrect }: { task: ProtractorTask; onCorrect: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 sm:grid-cols-3">
        {[30, 90, 135].map((a) => (
          <div key={a} className="flex flex-col items-center rounded-[20px] border border-[rgba(214,184,108,0.5)] bg-[rgba(255,252,245,0.96)] p-2">
            <MeasurelandsAngle turn={a} arm1={80} arm2={80} rightMark={a === 90} size={150} />
            <span className="text-lg font-black text-[#5b21b6]">{a}°</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[15px] font-bold text-[#2c1c07]">Before engineers measure, they <span className="font-black text-[#5b21b6]">estimate</span> — compare to a right angle (90°) and a straight angle (180°).</p>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s estimate! →</button>
    </Shell>
  );
}

export function MeasurelandsProtractorCard({ task, onCorrect, onWrong }: { task: ProtractorTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "estimate": return <EstimateScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Estimate the Angle" />;
    case "closest": return <EstimateScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Which Is Closest?" />;
    case "guess": return <GuessScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "read": return <ReadScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Read the Protractor" />;
    case "whichScale": return <ReadScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Which Scale?" />;
    case "mistake": return <MistakeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    default: return <ConstructScene task={task} onCorrect={onCorrect} />;
  }
}
