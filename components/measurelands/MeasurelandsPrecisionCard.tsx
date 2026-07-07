"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type PrecisionTask = Extract<PracticeTask, { kind: "precisionMeasure" }>;
type Attr = "length" | "mass" | "capacity";

const UNITS: Record<Attr, { big: string; small: string; ratio: number; minor: number; medium: number }> = {
  length: { big: "m", small: "cm", ratio: 100, minor: 5, medium: 10 },
  mass: { big: "kg", small: "g", ratio: 1000, minor: 50, medium: 100 },
  capacity: { big: "L", small: "mL", ratio: 1000, minor: 50, medium: 100 },
};

export function fmtMixed(valueSmall: number, attr: Attr): string {
  const u = UNITS[attr];
  const whole = Math.floor(valueSmall / u.ratio);
  const sub = valueSmall % u.ratio;
  if (whole === 0) return `${sub} ${u.small}`;
  if (sub === 0) return `${whole} ${u.big}`;
  return `${whole} ${u.big} ${sub} ${u.small}`;
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

/* ── The drawn graduated instrument: a tape measure (length) or readout gauge. ── */
function GraduatedBar({ attr, valueSmall, showValue = false }: { attr: Attr; valueSmall: number; showValue?: boolean }) {
  const u = UNITS[attr];
  const isTape = attr === "length";
  const maxSmall = Math.max(u.ratio, (Math.floor(valueSmall / u.ratio) + 1) * u.ratio);
  const W = 660, H = 120;
  const padL = 26, padR = 26;
  const trackY = 42;
  const trackH = isTape ? 34 : 20;
  const usableW = W - padL - padR;
  const xFor = (small: number) => padL + (small / maxSmall) * usableW;

  const ticks: React.ReactNode[] = [];
  for (let s = 0; s <= maxSmall; s += u.minor) {
    const x = xFor(s);
    const isMajor = s % u.ratio === 0;
    const isMedium = s % u.medium === 0;
    const len = isMajor ? 22 : isMedium ? 14 : 8;
    ticks.push(<line key={`t${s}`} x1={x} y1={trackY + trackH} x2={x} y2={trackY + trackH + len} stroke={isTape ? "#3a2c10" : "#5b21b6"} strokeWidth={isMajor ? 2.4 : isMedium ? 1.6 : 1} />);
    if (isMajor) {
      ticks.push(<text key={`l${s}`} x={x} y={trackY + trackH + len + 15} textAnchor="middle" fontSize="13" fontWeight="800" fill={isTape ? "#3a2c10" : "#5b21b6"}>{s / u.ratio} {u.big}</text>);
    }
  }

  const mx = xFor(valueSmall);
  return (
    <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,252,245,0.96)] p-3">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="precision instrument">
        {/* track */}
        <rect x={padL} y={trackY} width={usableW} height={trackH} rx={isTape ? 6 : 10}
          fill={isTape ? "#F6CE3B" : attr === "mass" ? "#FBE3C4" : "#C9EAF5"}
          stroke={isTape ? "#C9962A" : attr === "mass" ? "#E0A96A" : "#7CC4DE"} strokeWidth={2} />
        {isTape ? <rect x={padL - 6} y={trackY - 3} width={8} height={trackH + 6} rx={2} fill="#7A5325" /> : null}
        {ticks}
        {/* filled portion */}
        <rect x={padL} y={trackY} width={Math.max(0, mx - padL)} height={trackH} rx={isTape ? 6 : 10} fill={isTape ? "rgba(201,150,42,0.28)" : "rgba(91,33,182,0.14)"} />
        {/* marker */}
        <polygon points={`${mx},${trackY - 12} ${mx - 7},${trackY - 24} ${mx + 7},${trackY - 24}`} fill="#C0564E" />
        <line x1={mx} y1={trackY - 12} x2={mx} y2={trackY + trackH} stroke="#C0564E" strokeWidth={2.6} />
        {showValue ? (
          <text x={mx} y={trackY - 28} textAnchor="middle" fontSize="15" fontWeight="900" fill="#C0564E">{fmtMixed(valueSmall, attr)}</text>
        ) : null}
      </svg>
    </div>
  );
}

/* A measurement value card (used in compare). */
function ValueCard({ v, attr, onClick, state }: { v: { valueSmall: number; label: string; emoji: string }; attr: Attr; onClick?: () => void; state?: "picked" | "bad" }) {
  return (
    <button type="button" onClick={onClick} className={`flex flex-1 flex-col items-center gap-1 rounded-[24px] border-2 p-4 text-center shadow-sm transition hover:-translate-y-0.5 ${state === "bad" ? "border-[#C0564E] bg-[#FCE0E0]" : state === "picked" ? "border-[#5b21b6] bg-[rgba(91,33,182,0.08)]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
      <span className="text-4xl leading-none">{v.emoji}</span>
      <span className="text-sm font-black text-[#5a4423]">{v.label}</span>
      <span className="text-2xl font-black text-[#2c1c07]">{fmtMixed(v.valueSmall, attr)}</span>
    </button>
  );
}

function ObjectPanel({ task }: { task: PrecisionTask }) {
  const o = task.object;
  if (!o) return null;
  return (
    <div className="flex flex-col items-center rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
      {o.context ? <div className="mb-1 text-[12px] font-black uppercase tracking-[0.14em] text-[#a98b52]">{o.context}</div> : null}
      <div className="text-5xl leading-none">{o.emoji}</div>
      <div className="mt-1 text-lg font-black text-[#2c1c07]">{o.label}</div>
      {task.note ? <div className="mt-1 text-center text-sm font-semibold text-[#5a4423]">{task.note}</div> : null}
    </div>
  );
}

/* MCQ over string options (readMixed / whichAccurate / matchMixed / problem). */
function OptionRow({ task, onCorrect, onWrong }: { task: PrecisionTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  const opts = task.options ?? [];
  const pick = (o: string) => {
    if (o === task.correctOption) onCorrect();
    else { setWrong(o); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };
  return (
    <div className={`grid gap-3 ${opts.length > 3 ? "grid-cols-2 sm:grid-cols-4" : opts.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
      {opts.map((o) => (
        <button key={o} type="button" onClick={() => pick(o)} className={`relative flex min-h-[64px] items-center justify-center rounded-[22px] border-2 px-3 text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === o ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
          <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={o} /></span>{o}
        </button>
      ))}
    </div>
  );
}

function ReadMixedScene({ task, onCorrect, onWrong }: { task: PrecisionTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Read the Measurement"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.object ? <div className="text-center text-lg font-black text-[#2c1c07]">{task.object.emoji} {task.object.label}</div> : null}
      <GraduatedBar attr={task.attribute ?? "length"} valueSmall={task.valueSmall ?? 0} />
      <OptionRow task={task} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

function TextChoiceScene({ task, onCorrect, onWrong, badge }: { task: PrecisionTask; onCorrect: () => void; onWrong: () => void; badge: string }) {
  return (
    <Shell badge={task.badgeLabel ?? badge} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <ObjectPanel task={task} />
      {task.reasonOptions?.length ? (
        <ReasonRow task={task} onCorrect={onCorrect} onWrong={onWrong} />
      ) : (
        <OptionRow task={task} onCorrect={onCorrect} onWrong={onWrong} />
      )}
    </Shell>
  );
}

function ReasonRow({ task, onCorrect, onWrong }: { task: PrecisionTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  const pick = (r: string) => {
    if (r === task.correctReason) onCorrect();
    else { setWrong(r); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };
  return (
    <div className="grid gap-3">
      {(task.reasonOptions ?? []).map((r) => (
        <button key={r} type="button" onClick={() => pick(r)} className={`relative flex min-h-[56px] items-center justify-center rounded-[22px] border-2 px-4 text-base font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === r ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
          <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={r} /></span>{r}
        </button>
      ))}
    </div>
  );
}

function CompareScene({ task, onCorrect, onWrong }: { task: PrecisionTask; onCorrect: () => void; onWrong: () => void }) {
  const [bad, setBad] = useState<"a" | "b" | null>(null);
  const attr = task.attribute ?? "length";
  const pick = (side: "a" | "b") => {
    if (side === task.correctSide) onCorrect();
    else { setBad(side); onWrong(); window.setTimeout(() => setBad(null), 600); }
  };
  if (!task.pair) return null;
  return (
    <Shell badge={task.badgeLabel ?? "Which Is More?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex items-stretch gap-3">
        <ValueCard v={task.pair.a} attr={attr} onClick={() => pick("a")} state={bad === "a" ? "bad" : undefined} />
        <div className="flex items-center text-xl font-black text-[#a98b52]">vs</div>
        <ValueCard v={task.pair.b} attr={attr} onClick={() => pick("b")} state={bad === "b" ? "bad" : undefined} />
      </div>
      <div className="text-center text-[12px] font-bold text-[#a98b52]">Read both parts before you decide.</div>
    </Shell>
  );
}

function IntroScene({ task, onCorrect }: { task: PrecisionTask; onCorrect: () => void }) {
  const attr = task.attribute ?? "length";
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
        <div className="mb-1 text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">Precision matters</div>
        <p className="text-[16px] font-bold leading-snug text-[#2c1c07]">
          Sometimes one unit isn&apos;t accurate enough. Real engineers add a <span className="font-black text-[#5b21b6]">smaller unit</span> as well to measure exactly.
        </p>
        {task.beforeAfter ? (
          <div className="mt-3 flex items-center justify-center gap-3 text-lg font-black">
            <span className="rounded-full border-2 border-[rgba(192,86,78,0.5)] bg-[rgba(252,224,224,0.4)] px-4 py-1.5 text-[#8a2b24]">{task.beforeAfter.before}</span>
            <span className="text-2xl text-[#a98b52]">→</span>
            <span className="rounded-full border-2 border-[#5b21b6] bg-[rgba(91,33,182,0.08)] px-4 py-1.5 text-[#5b21b6]">{task.beforeAfter.after}</span>
          </div>
        ) : null}
      </div>
      {typeof task.valueSmall === "number" ? <GraduatedBar attr={attr} valueSmall={task.valueSmall} showValue /> : null}
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s measure! →</button>
    </Shell>
  );
}

export function MeasurelandsPrecisionCard({ task, onCorrect, onWrong }: { task: PrecisionTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "readMixed": return <ReadMixedScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "compareMixed": return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "whichAccurate": return <TextChoiceScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Which Is More Accurate?" />;
    case "matchMixed": return <TextChoiceScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Match the Measurement" />;
    default: return <TextChoiceScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Precision Mission" />;
  }
}
