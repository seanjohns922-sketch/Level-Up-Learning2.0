"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { MeasurelandsJug } from "@/components/measurelands/MeasurelandsJug";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type CapTask = Extract<PracticeTask, { kind: "capacity" }>;

function toMl(v: number, unit: "mL" | "L") {
  return unit === "L" ? v * 1000 : v;
}

// Level 4 partial graduations: litre jugs read to 0.5 L, millilitre jugs to
// 250 mL (minors unlabelled). Level 3 keeps the default majorStep/5 spacing.
function jugMinorStep(unit: "mL" | "L", precision?: boolean): number | undefined {
  if (!precision) return undefined;
  return unit === "L" ? 0.5 : 250;
}

/* ── Gold/violet Meazurex shell (matches the other Measurelands cards) ── */
function Shell({ badge, prompt, speakText, children }: { badge: string; prompt: string; speakText?: string; children: React.ReactNode }) {
  return (
    <div className="measurelands-shell space-y-4">
      <div
        className="measurelands-prompt-card rounded-[30px] border px-5 py-5 shadow-[0_14px_42px_rgba(76,29,149,0.1)]"
        style={{
          borderColor: "rgba(214,184,108,0.38)",
          background: "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)",
        }}
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

function ObjectHero({ object, sub }: { object: { label: string; emoji: string }; sub?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] px-6 py-4">
      <div className="flex h-[104px] w-[104px] items-center justify-center rounded-full bg-[rgba(214,184,108,0.16)] ring-1 ring-[rgba(214,184,108,0.45)]">
        <span className="text-[68px] leading-none" aria-hidden>{object.emoji}</span>
      </div>
      <span className="rounded-full bg-[rgba(91,33,182,0.08)] px-4 py-1 text-xl font-black text-[#2c1c07]">{object.label}</span>
      {sub ? <span className="text-lg font-black text-[#5b21b6]">{sub}</span> : null}
    </div>
  );
}

function Choices({ options, correct, cols, onCorrect, onWrong }: { options: string[]; correct?: string; cols: string; onCorrect: () => void; onWrong: () => void }) {
  return (
    <div className={`grid gap-3 ${cols}`}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => (option === correct ? onCorrect() : onWrong())}
          className="relative flex min-h-[72px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-4 text-center text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={option} /></span>
          {option}
        </button>
      ))}
    </div>
  );
}

function IntroScene({ task, onCorrect }: { task: CapTask; onCorrect: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex items-center justify-center gap-6 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
        <MeasurelandsJug value={600} unit="mL" max={1000} majorStep={250} size={150} />
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[17px] font-bold text-[#2c1c07]"><span className="text-2xl">🥤</span> Small amounts → <b>millilitres (mL)</b></div>
          <div className="flex items-center gap-2 text-[17px] font-bold text-[#2c1c07]"><span className="text-2xl">🪣</span> Large amounts → <b>litres (L)</b></div>
          <div className="rounded-full bg-[rgba(91,33,182,0.08)] px-3 py-1 text-center text-sm font-black text-[#5b21b6]">1 litre = 1000 mL</div>
        </div>
      </div>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">
        Let&apos;s measure! →
      </button>
    </Shell>
  );
}

function SortScene({ task, onCorrect, onWrong }: { task: CapTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.items ?? [];
  const [placed, setPlaced] = useState<Record<string, "mL" | "L">>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const unplaced = items.filter((it) => !(it.label in placed));

  const pick = (bin: "mL" | "L") => {
    if (!selected) return;
    const item = items.find((i) => i.label === selected);
    if (!item) return;
    if (item.unit === bin) {
      const next = { ...placed, [selected]: bin };
      setPlaced(next);
      setSelected(null);
      if (Object.keys(next).length === items.length) onCorrect();
    } else {
      setWrong(selected);
      setSelected(null);
      onWrong();
      window.setTimeout(() => setWrong(null), 600);
    }
  };

  const Bin = ({ bin, title, glyph }: { bin: "mL" | "L"; title: string; glyph: string }) => (
    <button type="button" onClick={() => pick(bin)} className={`flex min-h-[130px] flex-col gap-2 rounded-[24px] border-2 p-3 text-left transition ${selected ? "border-[#b4781e] bg-[rgba(214,184,108,0.14)]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"}`}>
      <div className="flex items-center gap-2"><span className="text-2xl">{glyph}</span><span className="text-sm font-black uppercase tracking-[0.12em] text-[#5b21b6]">{title}</span></div>
      <div className="flex flex-wrap gap-2">
        {items.filter((it) => placed[it.label] === bin).map((it) => (
          <span key={it.label} className="flex items-center gap-1 rounded-full border border-[rgba(15,118,110,0.4)] bg-[rgba(15,118,110,0.12)] px-3 py-1 text-sm font-black text-[#0f766e]"><span>{it.emoji}</span> {it.label}</span>
        ))}
      </div>
    </button>
  );

  return (
    <Shell badge={task.badgeLabel ?? "Sort the Containers"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-2 gap-3">
        <Bin bin="mL" title="Millilitres" glyph="🥤" />
        <Bin bin="L" title="Litres" glyph="🪣" />
      </div>
      <div className="rounded-[22px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-3">
        <p className="mb-2 text-center text-[12px] font-bold uppercase tracking-[0.14em] text-[#a98b52]">{unplaced.length ? "Tap a container, then tap its bin" : "All sorted!"}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {unplaced.map((it) => (
            <button key={it.label} type="button" onClick={() => setSelected((c) => (c === it.label ? null : it.label))} className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-base font-black text-[#2c1c07] transition ${wrong === it.label ? "border-[#C0564E] bg-[#FCE0E0]" : selected === it.label ? "-translate-y-0.5 border-[#b4781e] bg-[rgba(214,184,108,0.3)] shadow" : "border-[rgba(214,184,108,0.6)] bg-[#fffaf0]"}`}>
              <span className="text-xl">{it.emoji}</span> {it.label}
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function SpotMistakeScene({ task, onCorrect, onWrong }: { task: CapTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Does That Make Sense?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.object ? <ObjectHero object={task.object} /> : null}
      <div className="flex items-start gap-3 rounded-[24px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fffaf0] px-5 py-4 shadow-sm">
        <span className="text-3xl leading-none">🧑‍🏫</span>
        <p className="text-xl font-black italic leading-snug text-[#2c1c07]">&ldquo;{task.statement}&rdquo;</p>
      </div>
      <Choices options={task.options ?? []} correct={task.correctOption} cols="grid-cols-1 sm:grid-cols-2" onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

function ReadJugScene({ task, onCorrect, onWrong }: { task: CapTask; onCorrect: () => void; onWrong: () => void }) {
  const jug = task.jug!;
  return (
    <Shell badge={task.badgeLabel ?? "Read the Jug"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <MeasurelandsJug value={jug.value} unit={jug.unit} max={jug.max} majorStep={jug.majorStep} minorStep={jugMinorStep(jug.unit, task.precision)} size={190} />
      </div>
      {task.statement ? (
        <div className="rounded-[18px] border border-[rgba(192,86,78,0.28)] bg-[rgba(252,224,224,0.5)] px-4 py-2 text-center text-lg font-black text-[#7c2d12]">
          {task.statement}
        </div>
      ) : null}
      <div className="grid grid-cols-3 gap-3">
        {(task.numberOptions ?? []).map((n) => (
          <button key={n} type="button" onClick={() => (n === task.correctNumber ? onCorrect() : onWrong())} className="relative flex min-h-[72px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={`${n} ${task.readUnit}`} /></span>
            {n} {task.readUnit}
          </button>
        ))}
      </div>
    </Shell>
  );
}

function MatchJugScene({ task, onCorrect, onWrong }: { task: CapTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  return (
    <Shell badge={task.badgeLabel ?? "Match the Jug"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-3 gap-3">
        {(task.jugs ?? []).map((j) => (
          <button
            key={j.id}
            type="button"
            onClick={() => (j.id === task.correctJugId ? onCorrect() : (setWrong(j.id), onWrong(), window.setTimeout(() => setWrong(null), 600)))}
            className={`rounded-[24px] border-2 p-2 transition hover:-translate-y-0.5 active:scale-[0.98] ${wrong === j.id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"}`}
          >
            <MeasurelandsJug value={j.value} unit={j.unit} max={j.max} majorStep={j.majorStep} minorStep={jugMinorStep(j.unit, task.precision)} size={150} />
          </button>
        ))}
      </div>
    </Shell>
  );
}

function CompareScene({ task, onCorrect, onWrong }: { task: CapTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.compareItems ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Which Holds More?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <button key={it.label} type="button" onClick={() => (it.label === task.correctLabel ? onCorrect() : onWrong())} className="flex flex-col items-center gap-2 rounded-[26px] border-2 border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] px-4 py-5 transition hover:-translate-y-0.5 active:scale-[0.98]">
            <span className="text-[60px] leading-none">{it.emoji}</span>
            <span className="text-lg font-black text-[#2c1c07]">{it.label}</span>
            <span className="rounded-full bg-[rgba(91,33,182,0.1)] px-4 py-1 text-xl font-black text-[#5b21b6]">{it.value} {it.unit}</span>
          </button>
        ))}
      </div>
    </Shell>
  );
}

function OrderScene({ task, onCorrect, onWrong }: { task: CapTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.compareItems ?? [];
  const [tapped, setTapped] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const remaining = items.filter((it) => !tapped.includes(it.label));

  const tap = (label: string) => {
    const item = items.find((i) => i.label === label)!;
    const smallest = remaining.reduce((a, b) => (toMl(a.value, a.unit) <= toMl(b.value, b.unit) ? a : b));
    if (item.label === smallest.label) {
      const next = [...tapped, label];
      setTapped(next);
      setWrong(null);
      if (next.length === items.length) onCorrect();
    } else {
      setWrong(label);
      onWrong();
      window.setTimeout(() => setWrong(null), 600);
    }
  };

  return (
    <Shell badge={task.badgeLabel ?? "Order by Capacity"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <p className="text-center text-base font-black text-[#5b21b6]">Tap from least → greatest</p>
      <div className="grid grid-cols-4 gap-2">
        {items.map((it) => {
          const order = tapped.indexOf(it.label);
          return (
            <button key={it.label} type="button" disabled={order >= 0} onClick={() => tap(it.label)} className={`relative flex flex-col items-center gap-1 rounded-[22px] border-2 px-2 py-4 transition ${wrong === it.label ? "border-[#C0564E] bg-[#FCE0E0]" : order >= 0 ? "border-[rgba(15,118,110,0.6)] bg-[rgba(15,118,110,0.12)]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] hover:-translate-y-0.5"}`}>
              {order >= 0 ? <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#0f766e] text-xs font-black text-white">{order + 1}</span> : null}
              <span className="text-3xl leading-none">{it.emoji}</span>
              <span className="text-sm font-black text-[#2c1c07]">{it.value} {it.unit}</span>
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

function HowMuchMoreScene({ task, onCorrect, onWrong }: { task: CapTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.compareItems ?? [];
  const [entry, setEntry] = useState("");
  const [shake, setShake] = useState(false);
  const submit = () => {
    if (entry === "") return;
    if (Number(entry) === task.answerValue) onCorrect();
    else {
      setShake(true);
      onWrong();
      window.setTimeout(() => setShake(false), 400);
      setEntry("");
    }
  };
  return (
    <Shell badge={task.badgeLabel ?? "How Much More?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.label} className="flex flex-col items-center gap-1 rounded-[24px] border-2 border-[rgba(214,184,108,0.45)] bg-[rgba(255,252,245,0.96)] px-4 py-3">
            <span className="text-[52px] leading-none">{it.emoji}</span>
            <span className="text-base font-black text-[#2c1c07]">{it.label}</span>
            <span className="rounded-full bg-[rgba(91,33,182,0.1)] px-3 py-0.5 text-lg font-black text-[#5b21b6]">{it.value} {it.unit}</span>
          </div>
        ))}
      </div>
      <div className={`flex items-center justify-center gap-2 rounded-[22px] border-2 border-[rgba(180,120,20,0.5)] bg-[#fffaf0] px-5 py-3 ${shake ? "animate-pulse" : ""}`}>
        <span className="min-w-[80px] text-center text-3xl font-black text-[#2c1c07]">{entry || "?"}</span>
        <span className="text-2xl font-black text-[#a98b52]">{task.answerUnit}</span>
      </div>
      <div className="mx-auto grid max-w-[320px] grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "ok"].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => (k === "clear" ? setEntry("") : k === "ok" ? submit() : setEntry((e) => (e.length < 4 ? e + k : e)))}
            className={`min-h-[52px] rounded-[16px] border-2 text-xl font-black transition active:scale-[0.96] ${k === "ok" ? "border-[#0f766e] bg-[rgba(15,118,110,0.14)] text-[#0f766e]" : k === "clear" ? "border-[rgba(192,86,78,0.5)] bg-[#fdeaea] text-[#b0453d]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-[#2c1c07]"}`}
          >
            {k === "clear" ? "⌫" : k === "ok" ? "✓" : k}
          </button>
        ))}
      </div>
    </Shell>
  );
}

export function MeasurelandsCapacityCard({ task, onCorrect, onWrong }: { task: CapTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro":
      return <IntroScene task={task} onCorrect={onCorrect} />;
    case "sort":
      return <SortScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "spotMistake":
      return <SpotMistakeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "readJug":
      return <ReadJugScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "matchJug":
      return <MatchJugScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "compareMore":
      return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "order":
      return <OrderScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "howMuchMore":
      return <HowMuchMoreScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    default:
      // chooseUnit + whichJug — object hero + text choices.
      return (
        <Shell badge={task.badgeLabel ?? "Capacity Lab"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
          {task.object ? <ObjectHero object={task.object} /> : null}
          <Choices options={task.options ?? []} correct={task.correctOption} cols={task.scene === "whichJug" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"} onCorrect={onCorrect} onWrong={onWrong} />
        </Shell>
      );
  }
}
