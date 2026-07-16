"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { MeasurelandsThermometer } from "@/components/measurelands/MeasurelandsThermometer";

type TempTask = Extract<PracticeTask, { kind: "temperature" }>;

function Shell({ badge, prompt, speakText, children }: { badge: string; prompt: string; speakText?: string; children: React.ReactNode }) {
  return (
    <div className="measurelands-shell space-y-4">
      <div
        className="measurelands-prompt-card rounded-[30px] border px-5 py-5 shadow-[0_14px_42px_rgba(76,29,149,0.1)]"
        style={{ borderColor: "rgba(214,184,108,0.38)", background: "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)" }}
      >
        <div className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]" style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(167,139,250,0.34)", color: "#5b21b6" }}>
          {badge}
        </div>
        <div className="flex items-start gap-3">
          <div className="measurelands-prompt-text flex-1 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">{prompt}</div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

/* ── Intro — Professor Gauge unveils the thermometer + benchmarks ── */
function IntroScene({ task, onCorrect }: { task: TempTask; onCorrect: () => void }) {
  const benchmarks: Array<{ v: number; label: string; emoji: string }> = [
    { v: 0, label: "Ice", emoji: "🧊" },
    { v: 20, label: "Room", emoji: "🛋️" },
    { v: 30, label: "Sunny day", emoji: "☀️" },
  ];
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
        <div className="grid grid-cols-3 gap-2">
          {benchmarks.map((b) => (
            <div key={b.label} className="flex flex-col items-center">
              <MeasurelandsThermometer value={b.v} size={96} />
              <div className="mt-1 text-2xl">{b.emoji}</div>
              <div className="text-sm font-black text-[#2c1c07]">{b.label}</div>
              <div className="rounded-full bg-[rgba(91,33,182,0.1)] px-2 py-0.5 text-xs font-black text-[#5b21b6]">{b.v}°C</div>
            </div>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onCorrect}
        className="mx-auto flex min-h-[60px] items-center justify-center gap-2 rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
      >
        Let&apos;s read! →
      </button>
    </Shell>
  );
}

/* ── Read (and verify) — one thermometer + number options ── */
function ReadScene({ task, onCorrect, onWrong }: { task: TempTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<number | null>(null);
  return (
    <Shell badge={task.badgeLabel ?? "Read the Thermometer"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <MeasurelandsThermometer value={task.value ?? 0} display={task.display} size={168} />
      </div>
      {task.statement ? (
        <div className="rounded-[18px] border border-[rgba(192,86,78,0.28)] bg-[rgba(252,224,224,0.5)] px-4 py-2 text-center text-lg font-black text-[#7c2d12]">
          {task.statement}
        </div>
      ) : null}
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => (n === task.correctNumber ? onCorrect() : (setWrong(n), onWrong(), window.setTimeout(() => setWrong(null), 600)))}
            className={`relative flex min-h-[74px] items-center justify-center rounded-[24px] border-2 text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] ${
              wrong === n ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"
            }`}
          >
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={`${n} degrees`} /></span>
            {n}°C
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Match — several thermometers; tap the one showing the target temp ── */
function MatchScene({ task, onCorrect, onWrong }: { task: TempTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  const thermometers = task.thermometers ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Which Thermometer Matches?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-3 gap-2">
        {thermometers.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => (t.id === task.correctId ? onCorrect() : (setWrong(t.id), onWrong(), window.setTimeout(() => setWrong(null), 600)))}
            className={`rounded-[22px] border-2 p-1.5 transition hover:-translate-y-0.5 active:scale-[0.98] ${
              wrong === t.id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"
            }`}
          >
            <MeasurelandsThermometer value={t.value} display={t.display} size={108} />
          </button>
        ))}
      </div>
      <p className="text-center text-[12px] font-bold uppercase tracking-[0.14em] text-[#a98b52]">Tap the thermometer that matches</p>
    </Shell>
  );
}

/* ── Compare — labelled items (city/day) with a temperature; tap the correct one ── */
function CompareScene({ task, onCorrect, onWrong }: { task: TempTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  const items = task.items ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Compare Temperatures"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className={`grid gap-2 ${items.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => (it.label === task.correctLabel ? onCorrect() : (setWrong(it.id), onWrong(), window.setTimeout(() => setWrong(null), 600)))}
            className={`flex flex-col items-center rounded-[22px] border-2 p-2 transition hover:-translate-y-0.5 active:scale-[0.98] ${
              wrong === it.id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"
            }`}
          >
            <div className="flex items-center gap-1 text-base font-black text-[#2c1c07]">
              {it.emoji ? <span className="text-xl">{it.emoji}</span> : null}
              {it.label}
            </div>
            <MeasurelandsThermometer value={it.value} size={104} />
            <div className="rounded-full bg-[rgba(91,33,182,0.1)] px-3 py-0.5 text-sm font-black text-[#5b21b6]">{it.value}°C</div>
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Order — tap items coldest → warmest ── */
function OrderScene({ task, onCorrect, onWrong, assessmentMode }: { task: TempTask; onCorrect: () => void; onWrong: () => void; assessmentMode: boolean }) {
  const items = task.items ?? [];
  const target = task.orderedLabels ?? [...items].sort((a, b) => a.value - b.value).map((i) => i.label);
  const [picked, setPicked] = useState<string[]>([]);
  const [bad, setBad] = useState(false);

  const handle = (label: string) => {
    if (picked.includes(label)) return;
    const next = [...picked, label];
    if (assessmentMode) {
      setPicked(next);
      if (next.length === items.length) {
        const isCorrect = next.every((item, index) => item === target[index]);
        if (isCorrect) onCorrect();
        else onWrong();
      }
      return;
    }
    if (target[next.length - 1] !== label) {
      setBad(true);
      onWrong();
      window.setTimeout(() => { setPicked([]); setBad(false); }, 700);
      return;
    }
    setPicked(next);
    if (next.length === items.length) onCorrect();
  };

  return (
    <Shell badge={task.badgeLabel ?? "Order the Temperatures"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex items-center justify-between px-1 text-[12px] font-black uppercase tracking-[0.14em] text-[#a98b52]">
        <span>❄ Coldest</span>
        <span>Warmest ☀</span>
      </div>
      <div className={`grid gap-2 ${items.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}>
        {items.map((it) => {
          const order = picked.indexOf(it.label);
          const done = order >= 0;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => handle(it.label)}
              className={`relative flex flex-col items-center rounded-[22px] border-2 p-2 transition active:scale-[0.98] ${
                done ? "border-[#5b21b6] bg-[rgba(91,33,182,0.08)]" : bad ? "border-[#C0564E] bg-[rgba(252,224,224,0.4)]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] hover:-translate-y-0.5"
              }`}
            >
              <div className="text-base font-black text-[#2c1c07]">{it.emoji ? `${it.emoji} ` : ""}{it.label}</div>
              <MeasurelandsThermometer value={it.value} size={100} />
              <div className="rounded-full bg-[rgba(91,33,182,0.1)] px-3 py-0.5 text-sm font-black text-[#5b21b6]">{it.value}°C</div>
              {done ? <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#5b21b6] text-xs font-black text-white">{order + 1}</span> : null}
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

export function MeasurelandsTemperatureCard({ task, onCorrect, onWrong, assessmentMode = false }: { task: TempTask; onCorrect: () => void; onWrong: () => void; assessmentMode?: boolean }) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "match") return <MatchScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "compare") return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "order") return <OrderScene task={task} onCorrect={onCorrect} onWrong={onWrong} assessmentMode={assessmentMode} />;
  return <ReadScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
