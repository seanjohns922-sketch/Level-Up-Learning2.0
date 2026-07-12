"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { MeasurelandsMetricLadder } from "@/components/measurelands/MeasurelandsMetricLadder";
import { LADDERS, convert, fmt, measureOf, unitIndex, type Measure } from "@/data/activities/year6Measurelands/metricLadders";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type ConvertTask = Extract<PracticeTask, { kind: "metricConvert" }>;

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

function DecimalKeypad({ answer, unit, hint, onCorrect, onWrong }: { answer: number; unit: string; hint: string; onCorrect: () => void; onWrong: () => void }) {
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<"idle" | "wrong">("idle");
  const add = (d: string) => { setStatus("idle"); setTyped((c) => { if (d === "." && c.includes(".")) return c; if (c.length >= 6) return c; return c + d; }); };
  const check = () => { if (!typed || typed === ".") return; if (Math.abs(Number(typed) - answer) < 1e-6) onCorrect(); else { setStatus("wrong"); onWrong(); } };
  return (
    <div className="rounded-[24px] border-2 border-[rgba(214,184,108,0.52)] bg-white p-3 shadow-sm">
      <div className={`mb-2 flex items-center justify-center gap-2 rounded-[20px] border-2 px-4 py-2 ${status === "wrong" ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.58)] bg-[#fffaf0]"}`}>
        <div className="min-w-[80px] text-center text-3xl font-black tabular-nums text-[#2c1c07]">{typed || "?"}</div>
        <div className="text-lg font-black text-[#7c3aed]">{unit}</div>
      </div>
      <div className="mb-2 text-center text-xs font-bold text-[#6b4d23]">{status === "wrong" ? "Check the direction and the power of 10." : hint}</div>
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" onClick={() => add(d)} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fff7df] py-2.5 text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5">{d}</button>
        ))}
        <button type="button" onClick={() => add(".")} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fff7df] py-2.5 text-2xl font-black text-[#2c1c07] shadow-sm">.</button>
        <button type="button" onClick={() => add("0")} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fff7df] py-2.5 text-2xl font-black text-[#2c1c07] shadow-sm">0</button>
        <button type="button" onClick={() => { setStatus("idle"); setTyped(""); }} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-white py-2.5 text-sm font-black uppercase text-[#7c4a12] shadow-sm">Clear</button>
      </div>
      <button type="button" onClick={check} className="mt-2 w-full rounded-[16px] border-2 border-[#7c3aed] bg-[#7c3aed] py-2.5 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Go</button>
    </div>
  );
}

/* ── L1 Climb — step the value up/down the ladder to the goal unit ── */
function ClimbScene({ task, onCorrect }: { task: ConvertTask; onCorrect: () => void }) {
  const measure = task.measure ?? "length";
  const rungs = LADDERS[measure];
  const fromIdx = unitIndex(measure, task.fromUnit ?? rungs[0]!.u);
  const toIdx = unitIndex(measure, task.toUnit ?? rungs[rungs.length - 1]!.u);
  const [cur, setCur] = useState(fromIdx);
  const [val, setVal] = useState(task.fromValue ?? 1);
  const atGoal = cur === toIdx;
  const down = () => { if (cur < rungs.length - 1) { setVal((v) => v * rungs[cur]!.f); setCur(cur + 1); } };
  const up = () => { if (cur > 0) { setVal((v) => v / rungs[cur - 1]!.f); setCur(cur - 1); } };
  return (
    <Shell badge={task.badgeLabel ?? "Climb the Ladder"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className={panel}>
        {ctxLine(task)}
        <MeasurelandsMetricLadder measure={measure} fromU={task.fromUnit} toU={task.toUnit} currentU={rungs[cur]!.u} currentValue={val} />
      </div>
      {atGoal ? (
        <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[58px] items-center justify-center rounded-[24px] border-2 border-[#16a34a] bg-[#16a34a] px-8 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Confirm {fmt(val)} {task.toUnit} ✓</button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={up} disabled={cur === 0} className={`min-h-[58px] rounded-[22px] border-2 text-lg font-black shadow-sm transition ${cur === 0 ? "border-[rgba(214,184,108,0.4)] bg-[#f3ead2] text-[#c9b48a]" : "border-[#0f766e] bg-white text-[#0f766e] hover:-translate-y-0.5"}`}>↑ up ÷{cur > 0 ? rungs[cur - 1]!.f : ""}</button>
          <button type="button" onClick={down} disabled={cur === rungs.length - 1} className={`min-h-[58px] rounded-[22px] border-2 text-lg font-black shadow-sm transition ${cur === rungs.length - 1 ? "border-[rgba(214,184,108,0.4)] bg-[#f3ead2] text-[#c9b48a]" : "border-[#b45309] bg-white text-[#b45309] hover:-translate-y-0.5"}`}>down ×{cur < rungs.length - 1 ? rungs[cur]!.f : ""} ↓</button>
        </div>
      )}
    </Shell>
  );
}

/* ── L1/L2 Convert — ladder as reference, type the answer ── */
function ConvertScene({ task, onCorrect, onWrong }: { task: ConvertTask; onCorrect: () => void; onWrong: () => void }) {
  const measure = task.measure ?? "length";
  const answer = task.answerValue ?? convert(measure, task.fromValue ?? 1, task.fromUnit ?? "m", task.toUnit ?? "cm");
  return (
    <Shell badge={task.badgeLabel ?? "Convert It"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_280px]">
        <div className={panel}>
          {ctxLine(task)}
          <div className="mb-2 text-center text-lg font-black text-[#2c1c07]"><span className="text-[#b45309]">{fmt(task.fromValue ?? 0)} {task.fromUnit}</span> = <span className="text-[#16a34a]">? {task.toUnit}</span></div>
          <MeasurelandsMetricLadder measure={measure} fromU={task.fromUnit} toU={task.toUnit} currentU={task.fromUnit} currentValue={task.fromValue} size={260} />
        </div>
        <DecimalKeypad answer={answer} unit={task.toUnit ?? ""} hint="Smaller unit → ×, larger unit → ÷." onCorrect={onCorrect} onWrong={onWrong} />
      </div>
    </Shell>
  );
}

/* ── L2 Compare — which measure is greater ── */
function CompareScene({ task, onCorrect, onWrong }: { task: ConvertTask; onCorrect: () => void; onWrong: () => void }) {
  const a = task.pairA!, b = task.pairB!;
  const measure = measureOf(a.unit);
  const base = LADDERS[measure][LADDERS[measure].length - 1]!.u;
  const va = convert(measure, a.value, a.unit, base), vb = convert(measure, b.value, b.unit, base);
  const bigger = va >= vb ? "a" : "b";
  const [wrong, setWrong] = useState<string | null>(null);
  const Btn = ({ id, p }: { id: string; p: { value: number; unit: string } }) => (
    <button type="button" onClick={() => (id === bigger ? onCorrect() : (setWrong(id), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`flex min-h-[92px] flex-col items-center justify-center gap-1 rounded-[24px] border-2 text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"}`}>
      <span className="tabular-nums">{fmt(p.value)} {p.unit}</span>
      <span className="text-[11px] font-black uppercase tracking-wide text-[#a98b52]"><OptionReadAloudButton text={`${fmt(p.value)} ${p.unit}`} /></span>
    </button>
  );
  return (
    <Shell badge={task.badgeLabel ?? "Which Is Greater?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <p className="text-center text-[13px] font-black text-[#a98b52]">Convert to the same unit, then compare.</p>
      <div className="grid grid-cols-2 gap-3"><Btn id="a" p={a} /><Btn id="b" p={b} /></div>
    </Shell>
  );
}

/* ── Spot Professor Gauge's conversion mistake ── */
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
  const measure = (task.measure ?? "length") as Measure;
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className={panel}><MeasurelandsMetricLadder measure={measure} /></div>
        <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
          <div className="mb-2 text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">The metric ladder</div>
          <p className="text-[17px] font-bold leading-snug text-[#2c1c07]">The metric system is built on <span className="font-black text-[#5b21b6]">powers of 10</span>.</p>
          <p className="mt-2 text-[15px] font-semibold leading-snug text-[#5a4423]">Step <span className="font-black text-[#b45309]">down</span> to a smaller unit → <span className="font-black">multiply</span>. Step <span className="font-black text-[#0f766e]">up</span> to a larger unit → <span className="font-black">divide</span>.</p>
          <p className="mt-2 text-[14px] font-semibold leading-snug text-[#5a4423]">Each step is ×10, ×100 or ×1000 — check the ladder!</p>
        </div>
      </div>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s convert! →</button>
    </Shell>
  );
}

export function MeasurelandsMetricConvertCard({ task, onCorrect, onWrong }: { task: ConvertTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "climb": return <ClimbScene task={task} onCorrect={onCorrect} />;
    case "convert": return <ConvertScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "compare": return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    default: return <MistakeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
}
