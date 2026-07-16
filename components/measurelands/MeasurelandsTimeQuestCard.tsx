"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { ClockFace } from "@/components/measurelands/MeasurelandsAnalogClockCard";
import { MeasurelandsTimeline, fmtTime, fmtDur } from "@/components/measurelands/MeasurelandsTimeline";

type TimeTask = Extract<PracticeTask, { kind: "timeQuest" }>;

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

function ClockWithLabel({ min, label, size = 150 }: { min: number; label: string; size?: number }) {
  const h = Math.floor(min / 60);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[12px] font-black uppercase tracking-[0.12em] text-[#a98b52]">{label}</span>
      <ClockFace hour={h} minute={min % 60} size={size} />
      <span className="rounded-full bg-[rgba(91,33,182,0.1)] px-3 py-0.5 text-sm font-black text-[#5b21b6]">{fmtTime(min)}</span>
    </div>
  );
}

function Stepper({ value, onChange, min, max, step, label }: { value: number; onChange: (v: number) => void; min: number; max: number; step: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#a98b52]">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - step))} className="flex h-11 w-11 items-center justify-center rounded-[16px] border-2 border-[rgba(214,184,108,0.6)] bg-[#fff7df] text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5">−</button>
        <div className="min-w-[54px] text-center text-3xl font-black tabular-nums text-[#2c1c07]">{value}</div>
        <button type="button" onClick={() => onChange(Math.min(max, value + step))} className="flex h-11 w-11 items-center justify-center rounded-[16px] border-2 border-[rgba(214,184,108,0.6)] bg-[#fff7df] text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5">+</button>
      </div>
    </div>
  );
}

function GoButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="rounded-[18px] border-2 border-[#5b21b6] bg-[#5b21b6] px-7 py-3 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5 disabled:opacity-40">Check</button>;
}

function Wrong({ show }: { show: boolean }) {
  return show ? <p className="text-center text-sm font-black text-[#9f3128]">Not quite — try again.</p> : null;
}

/* ── Text MCQ ── */
function ChoiceGrid({ options, correct, onCorrect, onWrong, spokenSuffix }: { options: string[]; correct?: string; onCorrect: () => void; onWrong: () => void; spokenSuffix?: string }) {
  const [wrong, setWrong] = useState<string | null>(null);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => (o === correct ? onCorrect() : (setWrong(o), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`relative flex min-h-[70px] items-center justify-center rounded-[22px] border-2 px-3 text-center text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === o ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
          <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={`${o}${spokenSuffix ?? ""}`} /></span>{o}
        </button>
      ))}
    </div>
  );
}

/* ── Intro ── */
function IntroScene({ task, onCorrect }: { task: TimeTask; onCorrect: () => void }) {
  // A "ladder" of units building up: seconds → minutes → hours → days → weeks.
  const ladder: Array<{ small: string; big: string }> = [
    { small: "60 seconds", big: "1 minute" },
    { small: "60 minutes", big: "1 hour" },
    { small: "24 hours", big: "1 day" },
    { small: "7 days", big: "1 week" },
  ];
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 md:grid-cols-2">
        {/* the conversion ladder */}
        <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
          <div className="mb-2 text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">Small units build bigger ones</div>
          <div className="space-y-1.5">
            {ladder.map((row, i) => (
              <div key={row.big}>
                <div className="flex items-center justify-between rounded-[16px] border border-[rgba(214,184,108,0.5)] bg-white px-3 py-2 text-[15px] font-black text-[#2c1c07]">
                  <span>{row.small}</span>
                  <span className="text-[#5b21b6]">→ {row.big}</span>
                </div>
                {i < ladder.length - 1 ? <div className="text-center text-sm font-black text-[#a98b52]">↓</div> : null}
              </div>
            ))}
          </div>
        </div>
        {/* what the week is about */}
        <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">Using time</span>
            <span className="rounded-full bg-[rgba(91,33,182,0.1)] px-2 py-0.5 text-[11px] font-black text-[#5b21b6]">Time Explorer</span>
          </div>
          <p className="text-[17px] font-bold leading-snug text-[#2c1c07]">
            Small units of time <span className="font-black text-[#5b21b6]">join together</span> to make bigger ones.
          </p>
          <p className="mt-2 text-[15px] font-semibold leading-snug text-[#5a4423]">
            This week you&apos;ll <span className="font-black">convert</span> time, work out <span className="font-black">how long</span> things take, and <span className="font-black">solve</span> real time problems.
          </p>
          <div className="mt-3 rounded-[16px] border border-[rgba(214,184,108,0.5)] bg-white px-3 py-2 text-center text-[14px] font-black text-[#2c1c07]">
            Convert <span className="text-[#a98b52]">→</span> Calculate <span className="text-[#a98b52]">→</span> Solve
          </div>
        </div>
      </div>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s explore! →</button>
    </Shell>
  );
}

/* ── L1 A — Match the units ── */
function MatchUnitsScene({ task, onCorrect, onWrong }: { task: TimeTask; onCorrect: () => void; onWrong: () => void }) {
  const pairs = task.unitPairs ?? [];
  const [smalls] = useState(() => [...pairs].sort(() => Math.random() - 0.5));
  const [bigs] = useState(() => [...pairs].sort(() => Math.random() - 0.5));
  const [pickedSmall, setPickedSmall] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);

  const tapBig = (id: string) => {
    if (!pickedSmall) return;
    if (pickedSmall === id) {
      const next = new Set(done); next.add(id); setDone(next); setPickedSmall(null);
      if (next.size === pairs.length) onCorrect();
    } else { setWrong(id); onWrong(); setPickedSmall(null); window.setTimeout(() => setWrong(null), 500); }
  };
  return (
    <Shell badge={task.badgeLabel ?? "Match the Time Units"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          {smalls.map((p) => (
            <button key={p.id} type="button" disabled={done.has(p.id)} onClick={() => setPickedSmall(p.id)} className={`min-h-[54px] rounded-[18px] border-2 px-3 text-lg font-black text-[#2c1c07] transition ${done.has(p.id) ? "border-[rgba(15,118,110,0.6)] bg-[rgba(15,118,110,0.12)] opacity-70" : pickedSmall === p.id ? "border-[#5b21b6] bg-[rgba(91,33,182,0.1)]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0] hover:-translate-y-0.5"}`}>{p.small}</button>
          ))}
        </div>
        <div className="grid gap-2">
          {bigs.map((p) => (
            <button key={p.id} type="button" disabled={done.has(p.id)} onClick={() => tapBig(p.id)} className={`min-h-[54px] rounded-[18px] border-2 px-3 text-lg font-black text-[#2c1c07] transition ${done.has(p.id) ? "border-[rgba(15,118,110,0.6)] bg-[rgba(15,118,110,0.12)] opacity-70" : wrong === p.id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0] hover:-translate-y-0.5"}`}>{p.big}</button>
          ))}
        </div>
      </div>
      <p className="text-center text-[12px] font-bold uppercase tracking-[0.14em] text-[#a98b52]">Tap a small unit, then its match</p>
    </Shell>
  );
}

/* ── L1 C — Convert builder (set a number) ── */
function ConvertBuildScene({ task, onCorrect, onWrong }: { task: TimeTask; onCorrect: () => void; onWrong: () => void }) {
  const [value, setValue] = useState(0);
  const [wrong, setWrong] = useState(false);
  return (
    <Shell badge={task.badgeLabel ?? "Time Builder"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-col items-center gap-3 rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,252,245,0.96)] p-5">
        <Stepper value={value} onChange={(v) => { setValue(v); setWrong(false); }} min={0} max={task.stepMax ?? 120} step={task.stepUnit ?? 1} label={task.answerUnitWord ?? ""} />
        <div className="text-2xl font-black text-[#2c1c07]">{value} <span className="text-[#5b21b6]">{task.answerUnitWord}</span></div>
        <Wrong show={wrong} />
        <GoButton onClick={() => (value === task.answerNumber ? onCorrect() : (setWrong(true), onWrong()))} />
      </div>
    </Shell>
  );
}

/* ── L2 A — How Long? (set the duration) ── */
function HowLongScene({ task, onCorrect, onWrong }: { task: TimeTask; onCorrect: () => void; onWrong: () => void }) {
  const [h, setH] = useState(0);
  const [m, setM] = useState(0);
  const [wrong, setWrong] = useState(false);
  return (
    <Shell badge={task.badgeLabel ?? "How Long?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-2 gap-3 rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <ClockWithLabel min={task.startMin ?? 0} label="Start" />
        <ClockWithLabel min={task.finishMin ?? 0} label="Finish" />
      </div>
      <div className="flex flex-wrap items-end justify-center gap-4 rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-white p-4">
        <Stepper value={h} onChange={(v) => { setH(v); setWrong(false); }} min={0} max={6} step={1} label="hours" />
        <Stepper value={m} onChange={(v) => { setM(v); setWrong(false); }} min={0} max={55} step={5} label="minutes" />
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fffaf0] px-4 py-2 text-xl font-black text-[#2c1c07]">{fmtDur(h * 60 + m)}</div>
          <GoButton onClick={() => (h * 60 + m === task.durationMin ? onCorrect() : (setWrong(true), onWrong()))} />
        </div>
      </div>
      <Wrong show={wrong} />
    </Shell>
  );
}

/* ── L2 B — Finish Time (set the finish clock) ── */
function FinishTimeScene({ task, onCorrect, onWrong }: { task: TimeTask; onCorrect: () => void; onWrong: () => void }) {
  const startMin = task.startMin ?? 0;
  const ampm = Math.floor(startMin / 60) < 12 ? "am" : "pm";
  const [h12, setH12] = useState(1);
  const [m, setM] = useState(0);
  const [wrong, setWrong] = useState(false);
  const toMin = () => {
    const h24 = ampm === "am" ? h12 % 12 : (h12 % 12) + 12;
    return h24 * 60 + m;
  };
  return (
    <Shell badge={task.badgeLabel ?? "Finish Time"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-wrap items-center justify-center gap-4 rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <ClockWithLabel min={startMin} label="Start" />
        <div className="rounded-[18px] border-2 border-[rgba(91,33,182,0.3)] bg-white px-4 py-3 text-center">
          <div className="text-[11px] font-black uppercase tracking-[0.12em] text-[#a98b52]">Duration</div>
          <div className="text-2xl font-black text-[#5b21b6]">{fmtDur(task.durationMin ?? 0)}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-end justify-center gap-4 rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-white p-4">
        <Stepper value={h12} onChange={(v) => { setH12(v < 1 ? 12 : v > 12 ? 1 : v); setWrong(false); }} min={1} max={12} step={1} label="hour" />
        <Stepper value={m} onChange={(v) => { setM((v + 60) % 60); setWrong(false); }} min={0} max={55} step={5} label="minutes" />
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fffaf0] px-4 py-2 text-xl font-black text-[#2c1c07]">{h12}:{String(m).padStart(2, "0")} {ampm}</div>
          <GoButton onClick={() => (toMin() === task.answerMin ? onCorrect() : (setWrong(true), onWrong()))} />
        </div>
      </div>
      <Wrong show={wrong} />
    </Shell>
  );
}

/* ── L2 C — Timeline Challenge (tap to set the finish) ── */
function TimelineScene({ task, onCorrect, onWrong }: { task: TimeTask; onCorrect: () => void; onWrong: () => void }) {
  const startMin = task.startMin ?? 0;
  const [finish, setFinish] = useState(startMin);
  const [wrong, setWrong] = useState(false);
  return (
    <Shell badge={task.badgeLabel ?? "Timeline Challenge"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,252,245,0.96)] p-4">
        <MeasurelandsTimeline rangeStartMin={task.rangeStartMin ?? startMin} rangeEndMin={task.rangeEndMin ?? startMin + 180} startMin={startMin} finishMin={finish} onSet={(v) => { setFinish(v); setWrong(false); }} />
      </div>
      <Wrong show={wrong} />
      <GoButton onClick={() => (finish === task.answerMin ? onCorrect() : (setWrong(true), onWrong()))} />
    </Shell>
  );
}

/* ── L3 — Compare events (MCQ) ── */
function CompareScene({ task, onCorrect, onWrong }: { task: TimeTask; onCorrect: () => void; onWrong: () => void }) {
  const events = task.events ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Sports Carnival"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {events.map((e) => (
          <div key={e.id} className="flex flex-col items-center rounded-[20px] border-2 border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] p-3">
            <span className="text-2xl">{e.emoji ?? "⏱️"}</span>
            <span className="text-base font-black text-[#2c1c07]">{e.label}</span>
            <span className="text-sm font-bold text-[#5b21b6]">{fmtTime(e.startMin ?? 0)}{e.finishMin != null ? ` – ${fmtTime(e.finishMin)}` : ""}</span>
          </div>
        ))}
      </div>
      <ChoiceGrid options={task.options ?? []} correct={task.correctOption} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

/* ── L3 — Order the schedule (tap earliest → latest) ── */
function OrderScene({ task, onCorrect, onWrong, assessmentMode }: { task: TimeTask; onCorrect: () => void; onWrong: () => void; assessmentMode: boolean }) {
  const events = task.events ?? [];
  const target = [...events].sort((a, b) => (a.min ?? 0) - (b.min ?? 0)).map((e) => e.id);
  const [picked, setPicked] = useState<string[]>([]);
  const [bad, setBad] = useState(false);
  const tap = (id: string) => {
    if (picked.includes(id)) return;
    const next = [...picked, id];
    if (assessmentMode) {
      setPicked(next);
      if (next.length === events.length) {
        const isCorrect = next.every((eventId, index) => eventId === target[index]);
        if (isCorrect) onCorrect();
        else onWrong();
      }
      return;
    }
    if (target[next.length - 1] !== id) { setBad(true); onWrong(); window.setTimeout(() => { setPicked([]); setBad(false); }, 700); return; }
    setPicked(next);
    if (next.length === events.length) onCorrect();
  };
  return (
    <Shell badge={task.badgeLabel ?? "Adventure Planner"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex items-center justify-between px-1 text-[12px] font-black uppercase tracking-[0.14em] text-[#a98b52]"><span>◄ Earliest</span><span>Latest ►</span></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {events.map((e) => {
          const order = picked.indexOf(e.id); const done = order >= 0;
          return (
            <button key={e.id} type="button" onClick={() => tap(e.id)} className={`relative flex flex-col items-center rounded-[20px] border-2 p-2 transition ${done ? "border-[#5b21b6] bg-[rgba(91,33,182,0.08)]" : bad ? "border-[#C0564E] bg-[rgba(252,224,224,0.4)]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] hover:-translate-y-0.5"}`}>
              <span className="text-2xl">{e.emoji ?? "⏱️"}</span>
              <span className="text-sm font-black text-[#2c1c07]">{e.label}</span>
              <span className="text-xs font-bold text-[#5b21b6]">{fmtTime(e.min ?? 0)}</span>
              {done ? <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#5b21b6] text-xs font-black text-white">{order + 1}</span> : null}
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

/* ── L6 W5 — Itinerary (multi-leg plan, step-by-step) ── */
const LEG_STYLE: Record<string, { color: string; bg: string }> = {
  travel: { color: "#5b21b6", bg: "rgba(91,33,182,0.1)" },
  wait: { color: "#b45309", bg: "rgba(245,158,11,0.14)" },
  activity: { color: "#0f766e", bg: "rgba(13,148,136,0.12)" },
};
function ItineraryScene({ task, onCorrect, onWrong }: { task: TimeTask; onCorrect: () => void; onWrong: () => void }) {
  const it = task.itinerary!;
  const steps = task.steps ?? [];
  const [idx, setIdx] = useState(0);
  let t = it.startMin;
  const rows = it.legs.map((leg) => { const from = t; t += leg.minutes; return { leg, from, to: t }; });
  const step = steps[idx];
  return (
    <Shell badge={task.badgeLabel ?? "Expedition Planner"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,252,245,0.96)] p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="rounded-full bg-[rgba(91,33,182,0.1)] px-3 py-1 text-sm font-black text-[#5b21b6]">Depart {fmtTime(it.startMin)}</span>
          <div className="flex gap-1.5">{steps.map((_, i) => <span key={i} className={`h-2.5 w-6 rounded-full ${i < idx ? "bg-[#16a34a]" : i === idx ? "bg-[#5b21b6]" : "bg-[rgba(124,58,237,0.2)]"}`} />)}</div>
        </div>
        <div className="space-y-1.5">
          {rows.map(({ leg, from, to }, i) => {
            const s = LEG_STYLE[leg.type]!;
            return (
              <div key={i} className="flex items-center gap-3 rounded-[16px] border px-3 py-2" style={{ borderColor: "rgba(214,184,108,0.4)", background: s.bg }}>
                <span className="text-xl">{leg.emoji}</span>
                <div className="flex-1">
                  <div className="text-[15px] font-black text-[#2c1c07]">{leg.label}</div>
                  <div className="text-[12px] font-bold text-[#a98b52]">{fmtTime(from)} → {fmtTime(to)}</div>
                </div>
                <span className="rounded-full px-2.5 py-1 text-[13px] font-black" style={{ color: s.color, background: "rgba(255,255,255,0.7)" }}>{fmtDur(leg.minutes)}</span>
              </div>
            );
          })}
        </div>
      </div>
      {step ? (
        <>
          <p className="text-center text-base font-black text-[#5b21b6]">{step.q}</p>
          <ChoiceGrid options={step.options} correct={step.answer} onCorrect={() => (idx + 1 < steps.length ? setIdx(idx + 1) : onCorrect())} onWrong={onWrong} />
        </>
      ) : null}
    </Shell>
  );
}

export function MeasurelandsTimeQuestCard({ task, onCorrect, onWrong, assessmentMode = false }: { task: TimeTask; onCorrect: () => void; onWrong: () => void; assessmentMode?: boolean }) {
  switch (task.scene) {
    case "itinerary": return <ItineraryScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "matchUnits": return <MatchUnitsScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "convert": return <Shell badge={task.badgeLabel ?? "Which Conversion Is Correct?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}><ChoiceGrid options={task.options ?? []} correct={task.correctOption} onCorrect={onCorrect} onWrong={onWrong} /></Shell>;
    case "convertBuild": return <ConvertBuildScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "howLong": return <HowLongScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "finishTime": return <FinishTimeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "timeline": return <TimelineScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "order": return <OrderScene task={task} onCorrect={onCorrect} onWrong={onWrong} assessmentMode={assessmentMode} />;
    default: return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
}
