"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { MeasurelandsAngle } from "@/components/measurelands/MeasurelandsAngle";

type AngleTask = Extract<PracticeTask, { kind: "angleQuest" }>;

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

function AngleTile({ fig, benchmark, size = 170 }: { fig: NonNullable<AngleTask["figures"]>[number]; benchmark?: boolean; size?: number }) {
  return (
    <MeasurelandsAngle
      kind={fig.kind ?? "angle"}
      turn={fig.turn ?? 45}
      rot={fig.rot ?? 0}
      arm1={fig.arm1 ?? 95}
      arm2={fig.arm2 ?? 95}
      benchmark={benchmark}
      rightMark={Math.abs((fig.turn ?? 45) - 90) < 0.5}
      size={size}
    />
  );
}

/* ── Intro ── */
const ANGLE_GALLERY: Array<{ turn: number; name: string; desc: string; rightMark?: boolean }> = [
  { turn: 45, name: "Acute", desc: "smaller than a right angle" },
  { turn: 90, name: "Right", desc: "a square corner — a quarter turn", rightMark: true },
  { turn: 130, name: "Obtuse", desc: "bigger than a right angle" },
  { turn: 180, name: "Straight", desc: "a half turn — a flat line" },
  { turn: 250, name: "Reflex", desc: "bigger than a straight angle" },
  { turn: 359, name: "Revolution", desc: "a full turn, right around" },
];

function IntroScene({ task, onCorrect }: { task: AngleTask; onCorrect: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">What is an angle?</span>
          <span className="rounded-full bg-[rgba(91,33,182,0.1)] px-2 py-0.5 text-[11px] font-black text-[#5b21b6]">a measure of turn</span>
        </div>
        <p className="text-[16px] font-bold leading-snug text-[#2c1c07]">
          An angle is the amount of <span className="font-black text-[#5b21b6]">turn</span> between two lines that meet at a point — the <span className="font-black">opening</span>, not the length of the lines.
        </p>
      </div>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <div className="mb-1 text-center text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">The types of angles</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {ANGLE_GALLERY.map((t) => (
            <div key={t.name} className="flex flex-col items-center rounded-[18px] border border-[rgba(214,184,108,0.5)] bg-white p-1.5">
              <MeasurelandsAngle turn={t.turn} arm1={82} arm2={82} rightMark={t.rightMark} size={116} />
              <div className="text-[15px] font-black text-[#5b21b6]">{t.name}</div>
              <div className="text-center text-[11px] font-semibold leading-tight text-[#5a4423]">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s explore! →</button>
    </Shell>
  );
}

/* ── Pick the correct figure ── */
function PickAngleScene({ task, onCorrect, onWrong }: { task: AngleTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  const figs = task.figures ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Find the Angle"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-3 gap-3">
        {figs.map((f) => (
          <button key={f.id} type="button" onClick={() => (f.id === task.correctId ? onCorrect() : (setWrong(f.id), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`flex flex-col items-center rounded-[22px] border-2 p-2 transition hover:-translate-y-0.5 active:scale-[0.98] ${wrong === f.id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"}`}>
            {f.emoji ? <span className="text-2xl">{f.emoji}</span> : null}
            <AngleTile fig={f} size={150} />
            {f.label ? <span className="text-sm font-black text-[#2c1c07]">{f.label}</span> : null}
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Compare to a right angle (benchmark overlay) ── */
function CompareRightScene({ task, onCorrect, onWrong }: { task: AngleTask; onCorrect: () => void; onWrong: () => void }) {
  const [bench, setBench] = useState(false);
  const [wrong, setWrong] = useState<string | null>(null);
  const a = task.angle ?? { turn: 45 };
  const pick = (choice: "smaller" | "equal" | "larger") => {
    if (choice === task.correctCompare) onCorrect();
    else { setWrong(choice); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };
  const btn = (id: "smaller" | "equal" | "larger", label: string) => (
    <button type="button" onClick={() => pick(id)} className={`min-h-[64px] rounded-[22px] border-2 px-3 text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>{label}</button>
  );
  return (
    <Shell badge={task.badgeLabel ?? "Compare to a Right Angle"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-col items-center rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        {task.context ? <div className="text-lg font-black text-[#2c1c07]">{task.context.emoji} {task.context.label}</div> : null}
        <MeasurelandsAngle turn={a.turn} rot={a.rot ?? 0} arm1={a.arm1 ?? 95} arm2={a.arm2 ?? 95} benchmark={bench} size={230} />
        <button type="button" onClick={() => setBench((b) => !b)} className="mt-1 rounded-full border-2 border-[#b45309] bg-[#fff7df] px-4 py-1.5 text-sm font-black text-[#b45309] shadow-sm transition hover:-translate-y-0.5">{bench ? "Hide" : "Show"} the right-angle marker</button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {btn("smaller", "Smaller")}
        {btn("equal", "Right angle")}
        {btn("larger", "Larger")}
      </div>
    </Shell>
  );
}

/* ── Order angles smallest → largest ── */
function OrderScene({ task, onCorrect, onWrong }: { task: AngleTask; onCorrect: () => void; onWrong: () => void }) {
  const figs = task.figures ?? [];
  const target = [...figs].sort((a, b) => (a.turn ?? 0) - (b.turn ?? 0)).map((f) => f.id);
  const [picked, setPicked] = useState<string[]>([]);
  const [bad, setBad] = useState(false);
  const tap = (id: string) => {
    if (picked.includes(id)) return;
    const next = [...picked, id];
    if (target[next.length - 1] !== id) { setBad(true); onWrong(); window.setTimeout(() => { setPicked([]); setBad(false); }, 700); return; }
    setPicked(next);
    if (next.length === figs.length) onCorrect();
  };
  return (
    <Shell badge={task.badgeLabel ?? "Order the Angles"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex items-center justify-between px-1 text-[12px] font-black uppercase tracking-[0.14em] text-[#a98b52]"><span>◄ Smallest turn</span><span>Largest turn ►</span></div>
      <div className="grid grid-cols-3 gap-3">
        {figs.map((f) => {
          const order = picked.indexOf(f.id); const done = order >= 0;
          return (
            <button key={f.id} type="button" onClick={() => tap(f.id)} className={`relative flex flex-col items-center rounded-[22px] border-2 p-2 transition ${done ? "border-[#5b21b6] bg-[rgba(91,33,182,0.08)]" : bad ? "border-[#C0564E] bg-[rgba(252,224,224,0.4)]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] hover:-translate-y-0.5"}`}>
              <AngleTile fig={f} size={150} />
              {done ? <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#5b21b6] text-xs font-black text-white">{order + 1}</span> : null}
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

/* ── Classify (name the angle) ── */
function ClassifyScene({ task, onCorrect, onWrong }: { task: AngleTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<string | null>(null);
  const a = task.angle ?? { turn: 45 };
  return (
    <Shell badge={task.badgeLabel ?? "Name the Angle"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-col items-center rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        {task.context ? <div className="text-lg font-black text-[#2c1c07]">{task.context.emoji} {task.context.label}</div> : null}
        <MeasurelandsAngle turn={a.turn} rot={a.rot ?? 0} arm1={a.arm1 ?? 95} arm2={a.arm2 ?? 95} rightMark={Math.abs(a.turn - 90) < 0.5} size={220} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(task.options ?? []).map((o) => (
          <button key={o} type="button" onClick={() => (o === task.correctOption ? onCorrect() : (setWrong(o), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`relative flex min-h-[62px] items-center justify-center rounded-[22px] border-2 px-3 text-lg font-black capitalize text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === o ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
            <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={`${o} angle`} /></span>{o}
          </button>
        ))}
      </div>
    </Shell>
  );
}

export function MeasurelandsAngleCard({ task, onCorrect, onWrong }: { task: AngleTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "pickAngle": return <PickAngleScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "compareRight": return <CompareRightScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "order": return <OrderScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    default: return <ClassifyScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
}
