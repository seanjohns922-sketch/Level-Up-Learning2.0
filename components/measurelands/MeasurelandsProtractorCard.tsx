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

/* ── Meet the Protractor: guided walkthrough (Centre → Align → Read) ── */
function LearnScene({ task, onCorrect }: { task: ProtractorTask; onCorrect: () => void }) {
  const angle = task.angle ?? 60;
  const side = task.baselineSide ?? "right";
  const [step, setStep] = useState(0);
  const steps = [
    { cap: "① Place the centre hole exactly on the vertex — the corner of the angle.", centre: true, guidance: "none" as const, reading: false },
    { cap: "② Line the flat baseline up with the 0° on your arm.", centre: false, guidance: "baseline" as const, reading: false },
    { cap: `③ Read where the other arm crosses — on the scale that starts at 0. It reads ${angle}°.`, centre: false, guidance: "full" as const, reading: true },
  ];
  const s = steps[step]!;
  return (
    <Shell badge={task.badgeLabel ?? "Meet the Protractor"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-col items-center gap-2 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-2">
        <div className="flex gap-1.5">
          {steps.map((_, i) => <span key={i} className={`h-2.5 w-8 rounded-full ${i <= step ? "bg-[#5b21b6]" : "bg-[rgba(124,58,237,0.2)]"}`} />)}
        </div>
        <MeasurelandsProtractor angle={angle} baselineSide={side} guidance={s.guidance} highlightCentre={s.centre} showReading={s.reading} />
        <div className="rounded-[18px] border-2 border-[rgba(91,33,182,0.25)] bg-[rgba(91,33,182,0.06)] px-4 py-3 text-center text-[16px] font-bold text-[#2c1c07]">{s.cap}</div>
      </div>
      {step < steps.length - 1 ? (
        <button type="button" onClick={() => setStep((v) => v + 1)} className="mx-auto flex min-h-[58px] items-center justify-center rounded-[24px] border-2 border-[#5b21b6] bg-[#5b21b6] px-8 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Next step →</button>
      ) : (
        <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[58px] items-center justify-center rounded-[24px] border-2 border-[#16a34a] bg-[#16a34a] px-8 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Got it — let&apos;s measure! →</button>
      )}
    </Shell>
  );
}

function IntroScene({ task, onCorrect }: { task: ProtractorTask; onCorrect: () => void }) {
  const marks = [30, 45, 90, 135, 180];
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <style>{"@keyframes mlSlideIn{0%{opacity:0;transform:translateY(16px) scale(.88)}100%{opacity:1;transform:none}}"}</style>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {marks.map((a, i) => (
          <div key={a} style={{ animation: "mlSlideIn .45s ease-out both", animationDelay: `${i * 130}ms` }} className="flex flex-col items-center rounded-[18px] border border-[rgba(214,184,108,0.5)] bg-[rgba(255,252,245,0.96)] p-2">
            <MeasurelandsAngle turn={a} arm1={60} arm2={60} rightMark={a === 90} size={112} />
            <span className="text-base font-black text-[#5b21b6]">{a}°</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[15px] font-bold text-[#2c1c07]">Professor Gauge: engineers don&apos;t guess randomly — they compare new angles to <span className="font-black text-[#5b21b6]">benchmark angles</span>.</p>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s estimate! →</button>
    </Shell>
  );
}

/* ── L1 estimation game (Alien-Angles style): stepper + closeness feedback ── */
function starCount(diff: number): number { return diff <= 5 ? 3 : diff <= 10 ? 2 : diff <= 15 ? 1 : 0; }
function closenessMsg(diff: number): string { return diff === 0 ? "Bang on!" : diff <= 5 ? "Brilliant!" : diff <= 10 ? "Great estimating!" : diff <= 15 ? "Close!" : "Good try — keep going!"; }
function avgMsg(avg: number): string { return avg <= 5 ? "Master estimator! 🏅" : avg <= 10 ? "Excellent estimating!" : avg <= 15 ? "Good work!" : "Keep practising — you'll get sharper!"; }

function StarRow({ n }: { n: number }) {
  return (
    <div className="flex gap-1 text-2xl leading-none">
      {[0, 1, 2].map((i) => <span key={i} className={i < n ? "text-[#f59e0b]" : "text-[rgba(214,184,108,0.35)]"}>★</span>)}
    </div>
  );
}

function AngleStepper({ value, set }: { value: number; set: (n: number) => void }) {
  const clamp = (n: number) => Math.max(0, Math.min(180, n));
  const btn = "flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#5b21b6] bg-white text-3xl font-black text-[#5b21b6] shadow-sm transition hover:-translate-y-0.5 active:scale-95";
  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => set(clamp(value - 5))} className={btn} aria-label="Decrease">−</button>
        <div className="w-[150px] text-center text-5xl font-black tabular-nums text-[#5b21b6]">{value}°</div>
        <button type="button" onClick={() => set(clamp(value + 5))} className={btn} aria-label="Increase">+</button>
      </div>
      <input type="range" min={0} max={180} step={1} value={value} onChange={(e) => set(Number(e.target.value))} className="h-2 w-full max-w-[420px] cursor-pointer appearance-none rounded-full bg-[rgba(91,33,182,0.18)] accent-[#5b21b6]" />
      <div className="flex w-full max-w-[420px] justify-between text-[11px] font-black text-[#a98b52]"><span>0°</span><span>90°</span><span>180°</span></div>
    </div>
  );
}

function EstimateReveal({ guess, actual }: { guess: number; actual: number }) {
  const diff = Math.abs(guess - actual);
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-[22px] border-2 border-[#16a34a] bg-[rgba(22,163,74,0.08)] px-4 py-3 text-center">
      <StarRow n={starCount(diff)} />
      <div className="text-lg font-black text-[#2c1c07]">You guessed <span className="text-[#5b21b6]">{guess}°</span> · it was <span className="text-[#16a34a]">{actual}°</span></div>
      <div className="text-base font-black text-[#16a34a]">{diff === 0 ? "Spot on!" : `You were ${diff}° away — ${closenessMsg(diff)}`}</div>
    </div>
  );
}

function PrimaryBtn({ label, onClick, tone = "purple" }: { label: string; onClick: () => void; tone?: "purple" | "green" }) {
  const c = tone === "green" ? "border-[#16a34a] bg-[#16a34a]" : "border-[#5b21b6] bg-[#5b21b6]";
  return <button type="button" onClick={onClick} className={`mx-auto flex min-h-[58px] items-center justify-center rounded-[24px] border-2 ${c} px-10 text-xl font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5`}>{label}</button>;
}

function EstimateStepperScene({ task, onCorrect, badge }: { task: ProtractorTask; onCorrect: () => void; badge: string }) {
  const actual = task.angle ?? 45;
  const [guess, setGuess] = useState(90);
  const [locked, setLocked] = useState(false);
  return (
    <Shell badge={task.badgeLabel ?? badge} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex flex-col items-center rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <MeasurelandsAngle turn={actual} arm1={120} arm2={120} rightMark={locked && actual === 90} size={224} />
      </div>
      {!locked ? (
        <>
          <AngleStepper value={guess} set={setGuess} />
          <PrimaryBtn label={`Lock in ${guess}° →`} onClick={() => setLocked(true)} />
        </>
      ) : (
        <>
          <EstimateReveal guess={guess} actual={actual} />
          <PrimaryBtn label="Next →" onClick={onCorrect} tone="green" />
        </>
      )}
    </Shell>
  );
}

function CompareEstimateScene({ task, onCorrect, onWrong }: { task: ProtractorTask; onCorrect: () => void; onWrong: () => void }) {
  const actual = task.angle ?? 60;
  const bench = task.benchmark ?? 90;
  const correctCmp = actual < bench ? "smaller" : actual > bench ? "larger" : "equal";
  const [phase, setPhase] = useState<"cmp" | "est">("cmp");
  const [wrong, setWrong] = useState<string | null>(null);
  const [guess, setGuess] = useState(90);
  const [locked, setLocked] = useState(false);
  const pick = (c: string) => {
    if (c === correctCmp) { setWrong(null); setPhase("est"); }
    else { setWrong(c); onWrong(); window.setTimeout(() => setWrong(null), 600); }
  };
  return (
    <Shell badge={task.badgeLabel ?? "Bigger or Smaller?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex items-center justify-center gap-4 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <div className="flex flex-col items-center">
          <MeasurelandsAngle turn={actual} arm1={95} arm2={95} size={168} />
          <span className="text-[12px] font-black text-[#5b21b6]">this angle</span>
        </div>
        <div className="text-2xl font-black text-[#a98b52]">vs</div>
        <div className="flex flex-col items-center opacity-90">
          <MeasurelandsAngle turn={bench} arm1={95} arm2={95} rightMark size={168} />
          <span className="text-[12px] font-black text-[#a98b52]">{bench}° · right angle</span>
        </div>
      </div>
      {phase === "cmp" ? (
        <div className="grid grid-cols-3 gap-3">
          {(["smaller", "equal", "larger"] as const).map((c) => (
            <button key={c} type="button" onClick={() => pick(c)} className={`min-h-[60px] rounded-[22px] border-2 px-3 text-base font-black capitalize text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === c ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>{c}</button>
          ))}
        </div>
      ) : !locked ? (
        <>
          <p className="text-center text-sm font-black text-[#16a34a]">✓ {correctCmp} than {bench}°. Now estimate its size.</p>
          <AngleStepper value={guess} set={setGuess} />
          <PrimaryBtn label={`Lock in ${guess}° →`} onClick={() => setLocked(true)} />
        </>
      ) : (
        <>
          <EstimateReveal guess={guess} actual={actual} />
          <PrimaryBtn label="Next →" onClick={onCorrect} tone="green" />
        </>
      )}
    </Shell>
  );
}

function StreakScene({ task, onCorrect }: { task: ProtractorTask; onCorrect: () => void }) {
  const angles = task.angles && task.angles.length ? task.angles : [30, 60, 90, 120, 45];
  const total = task.rounds ?? angles.length;
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState(90);
  const [locked, setLocked] = useState(false);
  const [diffs, setDiffs] = useState<number[]>([]);
  const [best, setBest] = useState<number | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);

  if (round >= total) {
    const avg = diffs.length ? Math.round(diffs.reduce((s, x) => s + x, 0) / diffs.length) : 0;
    const totalStars = diffs.reduce((s, d) => s + starCount(d), 0);
    return (
      <Shell badge={task.badgeLabel ?? "Beat Your Best"} prompt="Mission complete!" speakText={`You finished. Your average was ${avg} degrees away.`}>
        <div className="flex flex-col items-center gap-3 rounded-[26px] border-2 border-[#16a34a] bg-[rgba(22,163,74,0.08)] p-5 text-center">
          <div className="text-3xl">{totalStars > 0 ? "⭐".repeat(Math.min(totalStars, 5)) : "✨"}</div>
          <div className="text-3xl font-black text-[#5b21b6]">Average: {avg}° away</div>
          <div className="text-lg font-black text-[#2c1c07]">{totalStars} / {total * 3} stars · {avgMsg(avg)}</div>
          {isNewBest ? (
            <div className="rounded-full bg-[#16a34a] px-4 py-1.5 text-base font-black text-white">🏆 New best!</div>
          ) : best !== null ? (
            <div className="text-sm font-black text-[#a98b52]">Your best: {best}° away</div>
          ) : null}
        </div>
        <PrimaryBtn label="Finish →" onClick={onCorrect} tone="green" />
      </Shell>
    );
  }

  const actual = angles[round % angles.length] ?? 90;
  const starsSoFar = diffs.reduce((s, d) => s + starCount(d), 0);
  const next = () => {
    const nextDiffs = [...diffs, Math.abs(guess - actual)];
    setDiffs(nextDiffs);
    setLocked(false);
    setGuess(90);
    if (round + 1 >= total) {
      const avg = Math.round(nextDiffs.reduce((s, x) => s + x, 0) / nextDiffs.length);
      let prev: number | null = null;
      try { const raw = window.localStorage.getItem("ml_y5_angle_best_avg"); prev = raw ? Number(raw) : null; } catch { prev = null; }
      if (prev === null || avg < prev) { try { window.localStorage.setItem("ml_y5_angle_best_avg", String(avg)); } catch { /* ignore */ } setIsNewBest(true); setBest(avg); }
      else setBest(prev);
    }
    setRound(round + 1);
  };
  return (
    <Shell badge={task.badgeLabel ?? "Beat Your Best"} prompt={`Round ${round + 1} of ${total} — estimate!`} speakText={task.speakText ?? task.prompt}>
      <div className="flex items-center justify-between px-1">
        <div className="flex gap-1">{Array.from({ length: total }).map((_, i) => <span key={i} className={`h-2.5 w-6 rounded-full ${i < round ? "bg-[#16a34a]" : i === round ? "bg-[#5b21b6]" : "bg-[rgba(124,58,237,0.2)]"}`} />)}</div>
        <div className="text-sm font-black text-[#f59e0b]">★ {starsSoFar}</div>
      </div>
      <div className="flex flex-col items-center rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <MeasurelandsAngle turn={actual} arm1={116} arm2={116} rightMark={locked && actual === 90} size={204} />
      </div>
      {!locked ? (
        <>
          <AngleStepper value={guess} set={setGuess} />
          <PrimaryBtn label={`Lock in ${guess}° →`} onClick={() => setLocked(true)} />
        </>
      ) : (
        <>
          <EstimateReveal guess={guess} actual={actual} />
          <PrimaryBtn label={round + 1 >= total ? "See results →" : "Next angle →"} onClick={next} tone="green" />
        </>
      )}
    </Shell>
  );
}

export function MeasurelandsProtractorCard({ task, onCorrect, onWrong }: { task: ProtractorTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "learn": return <LearnScene task={task} onCorrect={onCorrect} />;
    case "estimateStepper": return <EstimateStepperScene task={task} onCorrect={onCorrect} badge="Estimate It" />;
    case "compareEstimate": return <CompareEstimateScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "streak": return <StreakScene task={task} onCorrect={onCorrect} />;
    case "estimate": return <EstimateScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Estimate the Angle" />;
    case "closest": return <EstimateScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Which Is Closest?" />;
    case "guess": return <GuessScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "read": return <ReadScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Read the Protractor" />;
    case "whichScale": return <ReadScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Which Scale?" />;
    case "mistake": return <MistakeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    default: return <ConstructScene task={task} onCorrect={onCorrect} />;
  }
}
