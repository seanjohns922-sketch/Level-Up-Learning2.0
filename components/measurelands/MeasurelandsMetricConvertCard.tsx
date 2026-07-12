"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { MeasurelandsLabInstrument, type LabKind } from "@/components/measurelands/MeasurelandsLabInstrument";
import { convert, fmt, measureOf, type Measure } from "@/data/activities/year6Measurelands/metricLadders";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type ConvertTask = Extract<PracticeTask, { kind: "metricConvert" }>;

const KIND: Record<Measure, LabKind> = { capacity: "jug", mass: "scale", length: "tape" };
const VERB: Record<Measure, string> = { capacity: "Pour", mass: "Weigh", length: "Measure" };

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
const panel = "rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3";
function ctxLine(t: ConvertTask) { return t.context ? <div className="text-center text-[12px] font-black uppercase tracking-[0.14em] text-[#a98b52]">{t.emoji} {t.context}</div> : null; }

function OptionRow({ options, correct, unit, onCorrect, onWrong }: { options: number[]; correct: number; unit: string; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((n) => (
        <button key={n} type="button" onClick={() => (Math.abs(n - correct) < 1e-9 ? onCorrect() : (setWrong(n), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`relative flex min-h-[64px] items-center justify-center rounded-[22px] border-2 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === n ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
          <span className="absolute right-1 top-1 z-10"><OptionReadAloudButton text={`${fmt(n)} ${unit}`} /></span>{fmt(n)} {unit}
        </button>
      ))}
    </div>
  );
}

/* ── Lab Set — drag the instrument to hit a target given in the other unit ── */
function LabSetScene({ task, onCorrect }: { task: ConvertTask; onCorrect: () => void }) {
  const measure = task.measure ?? "capacity";
  const smallU = task.scaleUnit ?? "mL";
  const bigU = task.fromUnit ?? "L";
  const factor = convert(measure, 1, bigU, smallU);
  const target = task.targetOnScale ?? 0;
  const [val, setVal] = useState(0);
  const done = val === target;
  return (
    <Shell badge={task.badgeLabel ?? "Measurement Lab"} prompt={`${VERB[measure]} ${fmt(task.fromValue ?? 0)} ${bigU}.`} speakText={task.speakText ?? `${VERB[measure]} ${fmt(task.fromValue ?? 0)} ${bigU}. Drag to the right amount on the ${smallU} scale.`}>
      <div className={panel}>
        {ctxLine(task)}
        <MeasurelandsLabInstrument kind={KIND[measure]} value={val} onChange={setVal} max={task.scaleMax ?? 2000} step={task.scaleStep ?? 50} smallUnit={smallU} target={done ? target : null} />
        <div className={`mx-auto mt-1 w-fit rounded-full px-4 py-1.5 text-lg font-black ${done ? "bg-[rgba(22,163,74,0.14)] text-[#16a34a]" : "bg-[rgba(124,58,237,0.1)] text-[#5b21b6]"}`}>{fmt(val)} {smallU} = {fmt(val / factor)} {bigU}</div>
      </div>
      {done ? (
        <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[58px] items-center justify-center rounded-[24px] border-2 border-[#16a34a] bg-[#16a34a] px-10 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Done — {fmt(task.fromValue ?? 0)} {bigU} ✓</button>
      ) : (
        <p className="text-center text-[13px] font-black text-[#a98b52]">Drag the handle. {fmt(task.fromValue ?? 0)} {bigU} = ? {smallU}</p>
      )}
    </Shell>
  );
}

/* ── Lab Read — read the instrument, convert to the other unit ── */
function LabReadScene({ task, onCorrect, onWrong }: { task: ConvertTask; onCorrect: () => void; onWrong: () => void }) {
  const measure = task.measure ?? "capacity";
  const smallU = task.scaleUnit ?? task.fromUnit ?? "mL";
  const reading = task.fromValue ?? 0;
  return (
    <Shell badge={task.badgeLabel ?? "Read the Instrument"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className={panel}>
        {ctxLine(task)}
        <MeasurelandsLabInstrument kind={KIND[measure]} value={reading} max={task.scaleMax ?? 2000} step={task.scaleStep ?? 50} smallUnit={smallU} />
        <div className="mx-auto mt-1 w-fit rounded-full bg-[rgba(124,58,237,0.1)] px-4 py-1.5 text-lg font-black text-[#5b21b6]">it reads {fmt(reading)} {smallU}</div>
      </div>
      <p className="text-center text-[13px] font-black text-[#a98b52]">Convert to {task.toUnit}:</p>
      <OptionRow options={task.options ?? []} correct={task.answerValue ?? 0} unit={task.toUnit ?? ""} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

/* ── Compare — which is greater ── */
function CompareScene({ task, onCorrect, onWrong }: { task: ConvertTask; onCorrect: () => void; onWrong: () => void }) {
  const a = task.pairA!, b = task.pairB!;
  const measure = measureOf(a.unit);
  const base = measure === "length" ? "mm" : measure === "mass" ? "g" : "mL";
  const bigger = convert(measure, a.value, a.unit, base) >= convert(measure, b.value, b.unit, base) ? "a" : "b";
  const [wrong, setWrong] = useState<string | null>(null);
  const Btn = ({ id, p }: { id: string; p: { value: number; unit: string } }) => (
    <button type="button" onClick={() => (id === bigger ? onCorrect() : (setWrong(id), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`flex min-h-[92px] items-center justify-center gap-2 rounded-[24px] border-2 text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"}`}>
      {fmt(p.value)} {p.unit}<OptionReadAloudButton text={`${fmt(p.value)} ${p.unit}`} />
    </button>
  );
  return (
    <Shell badge={task.badgeLabel ?? "Which Is Greater?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <p className="text-center text-[13px] font-black text-[#a98b52]">Convert to the same unit, then compare.</p>
      <div className="grid grid-cols-2 gap-3"><Btn id="a" p={a} /><Btn id="b" p={b} /></div>
    </Shell>
  );
}

function MistakeScene({ task, onCorrect, onWrong }: { task: ConvertTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  return (
    <Shell badge={task.badgeLabel ?? "Professor Gauge's Mistake"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className={panel}>
        {ctxLine(task)}
        {task.statement ? <div className="rounded-[18px] border border-[rgba(192,86,78,0.28)] bg-[rgba(252,224,224,0.5)] px-4 py-3 text-center text-xl font-black text-[#7c2d12]">{task.statement}</div> : null}
      </div>
      <div className="grid gap-3">
        {(task.reasonOptions ?? []).map((r) => (
          <button key={r} type="button" onClick={() => (r === task.correctReason ? onCorrect() : (setWrong(r), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`relative flex min-h-[54px] items-center justify-center rounded-[22px] border-2 px-4 text-base font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === r ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={r} /></span>{r}
          </button>
        ))}
      </div>
    </Shell>
  );
}

function IntroScene({ task, onCorrect }: { task: ConvertTask; onCorrect: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className={panel}><MeasurelandsLabInstrument kind="jug" value={1500} max={2000} step={50} smallUnit="mL" /></div>
        <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
          <div className="mb-2 text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">Welcome to the Lab</div>
          <p className="text-[17px] font-bold leading-snug text-[#2c1c07]">The same amount can be read in <span className="font-black text-[#5b21b6]">two units</span>.</p>
          <p className="mt-2 text-[15px] font-semibold leading-snug text-[#5a4423]">This jug reads <span className="font-black">1500 mL</span> — that&apos;s the same as <span className="font-black text-[#7c3aed]">1.5 L</span>. A smaller unit means a bigger number (×), a larger unit means a smaller number (÷).</p>
          <p className="mt-2 text-[14px] font-semibold leading-snug text-[#5a4423]">Length ×100 (cm↔m), mass &amp; capacity ×1000.</p>
        </div>
      </div>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Enter the Lab! →</button>
    </Shell>
  );
}

export function MeasurelandsMetricConvertCard({ task, onCorrect, onWrong }: { task: ConvertTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "labSet": return <LabSetScene task={task} onCorrect={onCorrect} />;
    case "labRead": return <LabReadScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "compare": return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    default: return <MistakeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
}
