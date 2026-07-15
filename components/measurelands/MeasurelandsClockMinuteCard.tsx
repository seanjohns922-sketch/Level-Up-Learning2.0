"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { ClockFace } from "@/components/measurelands/MeasurelandsAnalogClockCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type ClockTask = Extract<PracticeTask, { kind: "clockMinute" }>;

function digital(h: number, m: number) {
  const hh = ((h - 1) % 12) + 1;
  return `${hh <= 0 ? hh + 12 : hh}:${String(m).padStart(2, "0")}`;
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

function ClockPanel({ hour, minute, size = 230 }: { hour: number; minute: number; size?: number }) {
  return (
    <div className="mx-auto flex w-full max-w-[300px] items-center justify-center rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
      <ClockFace hour={hour} minute={minute} size={size} />
    </div>
  );
}

function DigitalChip({ text, big }: { text: string; big?: boolean }) {
  return <span className={`inline-flex items-center rounded-[16px] border-2 border-[rgba(91,33,182,0.3)] bg-[#0E1A17] px-4 py-2 font-black text-[#5EEAD4] ${big ? "text-3xl" : "text-2xl"}`} style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>{text}</span>;
}

function IntroScene({ task, onCorrect }: { task: ClockTask; onCorrect: () => void }) {
  const steps = [
    { n: "1", text: <>Look at the <b className="text-[#5b21b6]">long minute hand</b> first.</> },
    { n: "2", text: <>Count around the clock <b>in fives</b>.</> },
    { n: "3", text: <>Then read the <b className="text-[#b45309]">short hour hand</b>.</> },
  ];
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex items-center justify-center gap-5 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
        <ClockFace hour={task.targetHour} minute={task.targetMinute} size={150} />
        <ul className="space-y-2.5">{steps.map((s) => (<li key={s.n} className="flex items-start gap-3"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5b21b6] text-sm font-black text-white">{s.n}</span><span className="text-[17px] font-bold leading-snug text-[#2c1c07]">{s.text}</span></li>))}</ul>
      </div>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s read! →</button>
    </Shell>
  );
}

function ReadScene({ task, onCorrect, onWrong }: { task: ClockTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Read the Clock"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <ClockPanel hour={task.targetHour} minute={task.targetMinute} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(task.options ?? []).map((o) => (
          <button key={o} type="button" onClick={() => (o === task.correctOption ? onCorrect() : onWrong())} className="relative flex min-h-[66px] items-center justify-center rounded-[22px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]" style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>
            <span className="absolute right-1 top-1 z-10"><OptionReadAloudButton text={o} /></span>{o}
          </button>
        ))}
      </div>
    </Shell>
  );
}

function MatchClockScene({ task, onCorrect, onWrong }: { task: ClockTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  return (
    <Shell badge={task.badgeLabel ?? "Find the Clock"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex items-center justify-center gap-3"><span className="text-base font-black text-[#a98b52]">Find</span> <DigitalChip text={task.askDigital ?? ""} big /></div>
      <div className="grid grid-cols-3 gap-2">
        {(task.clockOptions ?? []).map((c) => (
          <button key={c.id} type="button" onClick={() => (c.id === task.correctClockId ? onCorrect() : (setWrong(c.id), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`rounded-[22px] border-2 p-1 transition hover:-translate-y-0.5 active:scale-[0.98] ${wrong === c.id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"}`}>
            <ClockFace hour={c.hour} minute={c.minute} size={150} />
          </button>
        ))}
      </div>
    </Shell>
  );
}

function SpotTimeScene({ task, onCorrect, onWrong }: { task: ClockTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Is That Right?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <ClockPanel hour={task.targetHour} minute={task.targetMinute} size={200} />
      <div className="flex items-center justify-center gap-3 rounded-[24px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fffaf0] px-5 py-3 shadow-sm"><span className="text-3xl">🧑‍🏫</span><span className="text-lg font-black text-[#2c1c07]">Professor Gauge says it&apos;s</span> <DigitalChip text={task.claimedTime ?? ""} /></div>
      <div className="grid grid-cols-2 gap-3">
        {(task.options ?? []).map((o) => (
          <button key={o} type="button" onClick={() => (o === task.correctOption ? onCorrect() : onWrong())} className="relative flex min-h-[64px] items-center justify-center rounded-[22px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-3 text-center text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"><span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={o} /></span>{o}</button>
        ))}
      </div>
    </Shell>
  );
}

function BuildScene({ task, onCorrect }: { task: ClockTask; onCorrect: () => void }) {
  const step = task.minuteStep ?? 5;
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const done = ((hour - 1) % 12) + 1 === ((task.targetHour - 1) % 12) + 1 && minute === task.targetMinute;
  const bump = (setter: (fn: (v: number) => number) => void, delta: number, mod: number, base: number) => setter((v) => ((v - base + delta + mod) % mod) + base);
  return (
    <Shell badge={task.badgeLabel ?? "Build the Time"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex items-center justify-center gap-2 text-lg font-black text-[#2c1c07]">Build <DigitalChip text={digital(task.targetHour, task.targetMinute)} /></div>
      <ClockPanel hour={hour} minute={minute} size={200} />
      <div className="grid grid-cols-2 gap-4">
        {([["Hour", hour, (d: number) => bump(setHour as any, d, 12, 1), digital(hour, 0).split(":")[0]], ["Minute", minute, (d: number) => bump(setMinute as any, d, 60, 0), String(minute).padStart(2, "0")]] as const).map(([label, , adj, show]) => (
          <div key={label} className="flex flex-col items-center gap-2 rounded-[22px] border-2 border-[rgba(214,184,108,0.5)] bg-[rgba(255,252,245,0.96)] p-3">
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#a98b52]">{label}</span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => (adj as (d: number) => void)(label === "Minute" ? -step : -1)} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[rgba(180,120,20,0.5)] bg-[#fffaf0] text-2xl font-black text-[#2c1c07]">−</button>
              <span className="min-w-[48px] text-center text-3xl font-black text-[#2c1c07]" style={{ fontFamily: "ui-monospace, Menlo, monospace" }}>{show}</span>
              <button type="button" onClick={() => (adj as (d: number) => void)(label === "Minute" ? step : 1)} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[rgba(180,120,20,0.5)] bg-[#fffaf0] text-2xl font-black text-[#2c1c07]">+</button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" disabled={!done} onClick={onCorrect} className={`mx-auto flex min-h-[56px] items-center justify-center rounded-[24px] border-2 px-8 text-lg font-black shadow-sm transition ${done ? "border-[#0f766e] bg-[rgba(15,118,110,0.14)] text-[#0f766e] hover:-translate-y-0.5" : "border-[rgba(214,184,108,0.4)] bg-[#f4ecda] text-[#b6a06a]"}`}>{done ? "That's it! ✓" : "Set both hands"}</button>
    </Shell>
  );
}

export function MeasurelandsClockMinuteCard({ task, onCorrect, onWrong }: { task: ClockTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "matchClock": return <MatchClockScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "spotTime": return <SpotTimeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "build": return <BuildScene task={task} onCorrect={onCorrect} />;
    default: return <ReadScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
}
