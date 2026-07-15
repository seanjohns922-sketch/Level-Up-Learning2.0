"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { UNIT_WORD, toSeconds, type DurUnit } from "@/data/activities/year3Measurelands/durationActivities";

type DurTask = Extract<PracticeTask, { kind: "duration" }>;

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

function ActivityHero({ activity }: { activity: { label: string; emoji: string } }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] px-6 py-4">
      <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[rgba(214,184,108,0.16)] ring-1 ring-[rgba(214,184,108,0.45)]"><span className="text-[64px] leading-none" aria-hidden>{activity.emoji}</span></div>
      <span className="rounded-full bg-[rgba(91,33,182,0.08)] px-4 py-1 text-xl font-black text-[#2c1c07]">{activity.label}</span>
    </div>
  );
}

function Choices({ options, correct, cols, onCorrect, onWrong }: { options: string[]; correct?: string; cols: string; onCorrect: () => void; onWrong: () => void }) {
  return (
    <div className={`grid gap-3 ${cols}`}>
      {options.map((o) => (
        <button key={o} type="button" onClick={() => (o === correct ? onCorrect() : onWrong())} className="relative flex min-h-[72px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-4 text-center text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">
          <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={o} /></span>{o}
        </button>
      ))}
    </div>
  );
}

function IntroScene({ task, onCorrect }: { task: DurTask; onCorrect: () => void }) {
  const rows = [
    { emoji: "👁️", text: <>A <b>blink</b> takes <b>seconds</b>.</> },
    { emoji: "🪥", text: <>Brushing <b>teeth</b> takes <b>minutes</b>.</> },
    { emoji: "🏫", text: <>A <b>school day</b> takes <b>hours</b>.</> },
  ];
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
        <div className="mb-2 text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">Different activities take different times</div>
        <ul className="space-y-2.5">{rows.map((r, i) => (<li key={i} className="flex items-center gap-3"><span className="text-2xl">{r.emoji}</span><span className="text-[17px] font-bold text-[#2c1c07]">{r.text}</span></li>))}</ul>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-[22px] border border-[rgba(91,33,182,0.2)] bg-[rgba(91,33,182,0.05)] px-4 py-3 text-center text-base font-black text-[#5b21b6]">
        <span>⚡ 60 seconds = 1 minute</span><span className="text-[#c9b27e]">·</span><span>⏱️ 60 minutes = 1 hour</span><span className="text-[#c9b27e]">·</span><span>🕐 24 hours = 1 day</span>
      </div>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s go! →</button>
    </Shell>
  );
}

function UnitFactScene({ task, onCorrect, onWrong }: { task: DurTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Time Facts"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex items-center justify-center gap-3 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] px-6 py-5">
        <span className="text-[64px] leading-none" aria-hidden>⏱️</span>
        <span className="text-lg font-black text-[#a98b52]">Remember your time facts</span>
      </div>
      <Choices options={task.options ?? []} correct={task.correctOption} cols="grid-cols-2" onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

function SortScene({ task, onCorrect, onWrong }: { task: DurTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.items ?? [];
  const [placed, setPlaced] = useState<Record<string, DurUnit>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const unplaced = items.filter((it) => !(it.label in placed));
  const pick = (bin: DurUnit) => {
    if (!selected) return;
    const item = items.find((i) => i.label === selected);
    if (!item) return;
    if (item.unit === bin) {
      const next = { ...placed, [selected]: bin };
      setPlaced(next); setSelected(null);
      if (Object.keys(next).length === items.length) onCorrect();
    } else { setWrong(selected); setSelected(null); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };
  const Bin = ({ bin, glyph }: { bin: DurUnit; glyph: string }) => (
    <button type="button" onClick={() => pick(bin)} className={`flex min-h-[120px] flex-col gap-1 rounded-[20px] border-2 p-2 text-left transition ${selected ? "border-[#b4781e] bg-[rgba(214,184,108,0.14)]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"}`}>
      <div className="flex items-center gap-1"><span className="text-xl">{glyph}</span><span className="text-[11px] font-black uppercase tracking-[0.1em] text-[#5b21b6]">{UNIT_WORD[bin]}</span></div>
      <div className="flex flex-wrap gap-1">{items.filter((it) => placed[it.label] === bin).map((it) => (<span key={it.label} className="flex items-center gap-1 rounded-full border border-[rgba(15,118,110,0.4)] bg-[rgba(15,118,110,0.12)] px-2 py-0.5 text-xs font-black text-[#0f766e]"><span>{it.emoji}</span>{it.label}</span>))}</div>
    </button>
  );
  return (
    <Shell badge={task.badgeLabel ?? "Sort the Activities"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-3 gap-2"><Bin bin="s" glyph="⚡" /><Bin bin="min" glyph="⏱️" /><Bin bin="hr" glyph="🕐" /></div>
      <div className="rounded-[22px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-3">
        <p className="mb-2 text-center text-[12px] font-bold uppercase tracking-[0.14em] text-[#a98b52]">{unplaced.length ? "Tap an activity, then tap its bin" : "All sorted!"}</p>
        <div className="flex flex-wrap justify-center gap-2">{unplaced.map((it) => (<button key={it.label} type="button" onClick={() => setSelected((c) => (c === it.label ? null : it.label))} className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-base font-black text-[#2c1c07] transition ${wrong === it.label ? "border-[#C0564E] bg-[#FCE0E0]" : selected === it.label ? "-translate-y-0.5 border-[#b4781e] bg-[rgba(214,184,108,0.3)] shadow" : "border-[rgba(214,184,108,0.6)] bg-[#fffaf0]"}`}><span className="text-xl">{it.emoji}</span>{it.label}</button>))}</div>
      </div>
    </Shell>
  );
}

function SpotMistakeScene({ task, onCorrect, onWrong }: { task: DurTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Does That Make Sense?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.activity ? <ActivityHero activity={task.activity} /> : null}
      <div className="flex items-start gap-3 rounded-[24px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fffaf0] px-5 py-4 shadow-sm"><span className="text-3xl">🧑‍🏫</span><p className="text-xl font-black italic leading-snug text-[#2c1c07]">&ldquo;{task.statement}&rdquo;</p></div>
      <Choices options={task.options ?? []} correct={task.correctOption} cols="grid-cols-1 sm:grid-cols-2" onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

function medalFor(rankDist: number) {
  if (rankDist === 0) return { emoji: "🎯", title: "Exact!", sub: "Spot on!" };
  if (rankDist === 1) return { emoji: "👏", title: "Close!", sub: "A sensible estimate." };
  return { emoji: "👍", title: "Good try!", sub: "Now you know how long it takes." };
}

function EstimateScene({ task, onCorrect, onWrong }: { task: DurTask; onCorrect: () => void; onWrong: () => void }) {
  const unit = task.estimateUnit ?? "min";
  const actual = task.estimateValue ?? 0;
  const opts = task.estimateOptions ?? [];
  const unitWord = UNIT_WORD[unit];
  const unitTitle = unitWord.charAt(0).toUpperCase() + unitWord.slice(1);
  const [phase, setPhase] = useState<"unit" | "estimate" | "reveal">(task.chooseUnitFirst ? "unit" : "estimate");
  const [guess, setGuess] = useState<number | null>(null);
  const sorted = [...opts].sort((a, b) => a - b);
  const rankDist = guess === null ? 2 : Math.abs(sorted.indexOf(guess) - sorted.indexOf(actual));
  const medal = medalFor(rankDist);
  return (
    <Shell badge={task.badgeLabel ?? "Estimate the Duration"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.activity ? <ActivityHero activity={task.activity} /> : null}
      {phase === "unit" ? (<><p className="text-center text-base font-black text-[#5b21b6]">Step 1 — which unit?</p><Choices options={["Seconds", "Minutes", "Hours"]} correct={unitTitle} cols="grid-cols-3" onCorrect={() => setPhase("estimate")} onWrong={onWrong} /></>) : null}
      {phase === "estimate" ? (<><p className="text-center text-base font-black text-[#5b21b6]">How long would it take?</p><div className="grid grid-cols-3 gap-3">{opts.map((v) => (<button key={v} type="button" onClick={() => { setGuess(v); setPhase("reveal"); }} className="flex min-h-[72px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">{v} {unit === "s" ? "sec" : unit === "min" ? "min" : "hr"}</button>))}</div></>) : null}
      {phase === "reveal" ? (<><div className="flex flex-col items-center gap-1 rounded-[24px] border-2 border-[rgba(15,118,110,0.35)] bg-[rgba(15,118,110,0.08)] px-5 py-4 text-center"><div className="text-4xl">{medal.emoji}</div><div className="text-xl font-black text-[#0f766e]">{medal.title}</div><div className="text-base font-bold text-[#2c1c07]">You guessed <b>{guess} {unitWord}</b> — it takes about <b>{actual} {unitWord}</b>. {medal.sub}</div></div><button type="button" onClick={onCorrect} className="mx-auto flex min-h-[56px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Next →</button></>) : null}
    </Shell>
  );
}

function ContextEstimateScene({ task, onCorrect, onWrong }: { task: DurTask; onCorrect: () => void; onWrong: () => void }) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const parts = (task.sentence ?? "It takes about ___.").split("___");
  const pick = (o: string) => {
    if (o === task.correctOption) { setChosen(o); setWrong(null); onCorrect(); }
    else { setWrong(o); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };
  return (
    <Shell badge={task.badgeLabel ?? "Complete the Estimation"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.activity ? (
        <div className="mx-auto flex h-[96px] w-[96px] items-center justify-center rounded-full bg-[rgba(214,184,108,0.16)] ring-1 ring-[rgba(214,184,108,0.45)]"><span className="text-[60px] leading-none" aria-hidden>{task.activity.emoji}</span></div>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        {(task.options ?? []).map((o) => (
          <button key={o} type="button" onClick={() => pick(o)} className={`relative flex min-h-[64px] items-center justify-center rounded-[22px] border-2 px-3 text-center text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] ${wrong === o ? "border-[#C0564E] bg-[#FCE0E0]" : chosen === o ? "border-[#0f766e] bg-[rgba(15,118,110,0.12)]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={o} /></span>{o}
          </button>
        ))}
      </div>
      <div className="rounded-[22px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] px-5 py-4 text-center text-xl font-black leading-relaxed text-[#2c1c07]">
        {parts[0]}
        <span className={`mx-1 inline-block min-w-[110px] rounded-[12px] border-2 px-3 py-1 ${chosen ? "border-[#0f766e] bg-[rgba(15,118,110,0.12)] text-[#0f766e]" : "border-dashed border-[#c9b27e] bg-white text-[#a98b52]"}`}>{chosen ?? "?"}</span>
        {parts[1]}
      </div>
    </Shell>
  );
}

function CompareScene({ task, onCorrect, onWrong }: { task: DurTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.compareItems ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Which Takes Longer?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-2 gap-3">{items.map((it) => (<button key={it.label} type="button" onClick={() => (it.label === task.correctLabel ? onCorrect() : onWrong())} className="flex flex-col items-center gap-2 rounded-[26px] border-2 border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] px-4 py-5 transition hover:-translate-y-0.5 active:scale-[0.98]"><span className="text-[58px] leading-none">{it.emoji}</span><span className="text-lg font-black text-[#2c1c07]">{it.label}</span><span className="rounded-full bg-[rgba(91,33,182,0.1)] px-4 py-1 text-lg font-black text-[#5b21b6]">{it.value} {UNIT_WORD[it.unit]}</span></button>))}</div>
    </Shell>
  );
}

function OrderScene({ task, onCorrect, onWrong }: { task: DurTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.compareItems ?? [];
  const [tapped, setTapped] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const remaining = items.filter((it) => !tapped.includes(it.label));
  const tap = (label: string) => {
    const item = items.find((i) => i.label === label)!;
    const smallest = remaining.reduce((a, b) => (toSeconds(a.value, a.unit) <= toSeconds(b.value, b.unit) ? a : b));
    if (item.label === smallest.label) { const next = [...tapped, label]; setTapped(next); setWrong(null); if (next.length === items.length) onCorrect(); }
    else { setWrong(label); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };
  return (
    <Shell badge={task.badgeLabel ?? "Order by Duration"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <p className="text-center text-base font-black text-[#5b21b6]">Tap from shortest → longest</p>
      <div className="grid grid-cols-4 gap-2">{items.map((it) => { const order = tapped.indexOf(it.label); return (<button key={it.label} type="button" disabled={order >= 0} onClick={() => tap(it.label)} className={`relative flex flex-col items-center gap-1 rounded-[20px] border-2 px-1 py-3 transition ${wrong === it.label ? "border-[#C0564E] bg-[#FCE0E0]" : order >= 0 ? "border-[rgba(15,118,110,0.6)] bg-[rgba(15,118,110,0.12)]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] hover:-translate-y-0.5"}`}>{order >= 0 ? <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#0f766e] text-xs font-black text-white">{order + 1}</span> : null}<span className="text-3xl leading-none">{it.emoji}</span><span className="text-center text-[11px] font-black leading-tight text-[#2c1c07]">{it.label}</span></button>); })}</div>
    </Shell>
  );
}

function HowMuchLongerScene({ task, onCorrect, onWrong }: { task: DurTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.compareItems ?? [];
  const [entry, setEntry] = useState("");
  const [shake, setShake] = useState(false);
  const submit = () => { if (entry === "") return; if (Number(entry) === task.answerValue) onCorrect(); else { setShake(true); onWrong(); window.setTimeout(() => setShake(false), 400); setEntry(""); } };
  return (
    <Shell badge={task.badgeLabel ?? "How Much Longer?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-2 gap-3">{items.map((it) => (<div key={it.label} className="flex flex-col items-center gap-1 rounded-[24px] border-2 border-[rgba(214,184,108,0.45)] bg-[rgba(255,252,245,0.96)] px-4 py-3"><span className="text-[52px] leading-none">{it.emoji}</span><span className="text-base font-black text-[#2c1c07]">{it.label}</span><span className="rounded-full bg-[rgba(91,33,182,0.1)] px-3 py-0.5 text-lg font-black text-[#5b21b6]">{it.value} {UNIT_WORD[it.unit]}</span></div>))}</div>
      <div className={`flex items-center justify-center gap-2 rounded-[22px] border-2 border-[rgba(180,120,20,0.5)] bg-[#fffaf0] px-5 py-3 ${shake ? "animate-pulse" : ""}`}><span className="min-w-[80px] text-center text-3xl font-black text-[#2c1c07]">{entry || "?"}</span><span className="text-2xl font-black text-[#a98b52]">{task.answerUnit ? UNIT_WORD[task.answerUnit] : ""}</span></div>
      <div className="mx-auto grid max-w-[320px] grid-cols-3 gap-2">{["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "ok"].map((k) => (<button key={k} type="button" onClick={() => (k === "clear" ? setEntry("") : k === "ok" ? submit() : setEntry((e) => (e.length < 4 ? e + k : e)))} className={`min-h-[52px] rounded-[16px] border-2 text-xl font-black transition active:scale-[0.96] ${k === "ok" ? "border-[#0f766e] bg-[rgba(15,118,110,0.14)] text-[#0f766e]" : k === "clear" ? "border-[rgba(192,86,78,0.5)] bg-[#fdeaea] text-[#b0453d]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-[#2c1c07]"}`}>{k === "clear" ? "⌫" : k === "ok" ? "✓" : k}</button>))}</div>
    </Shell>
  );
}

export function MeasurelandsDurationCard({ task, onCorrect, onWrong }: { task: DurTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "unitFact": return <UnitFactScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "sort": return <SortScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "spotMistake": return <SpotMistakeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "estimate": return <EstimateScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "contextEstimate": return <ContextEstimateScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "compareLonger": return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "order": return <OrderScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "howMuchLonger": return <HowMuchLongerScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    default: // chooseUnit + bestEstimate — activity hero + text choices.
      return (
        <Shell badge={task.badgeLabel ?? "Time Trails"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
          {task.activity ? <ActivityHero activity={task.activity} /> : null}
          <Choices options={task.options ?? []} correct={task.correctOption} cols={task.scene === "bestEstimate" || (task.options ?? []).length === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"} onCorrect={onCorrect} onWrong={onWrong} />
        </Shell>
      );
  }
}
