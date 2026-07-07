"use client";

import { useRef, useState } from "react";
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
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 sm:grid-cols-3">
        {[30, 90, 135].map((a) => (
          <div key={a} className="flex flex-col items-center rounded-[20px] border border-[rgba(214,184,108,0.5)] bg-[rgba(255,252,245,0.96)] p-2">
            <MeasurelandsAngle turn={a} arm1={80} arm2={80} rightMark={a === 90} size={150} />
            <span className="text-lg font-black text-[#5b21b6]">{a}°</span>
          </div>
        ))}
      </div>
      <p className="text-center text-[15px] font-bold text-[#2c1c07]">Before engineers measure, they <span className="font-black text-[#5b21b6]">estimate</span> — compare to a right angle (90°) and a straight angle (180°).</p>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s estimate! →</button>
    </Shell>
  );
}

/* ── L3 Estimate — Alien Angles: aim the beam blind, then reveal the protractor ── */
// Shared geometry with MeasurelandsProtractor so the protractor lines up exactly
// with the aimed ray when it appears on reveal.
const AVX = 240, AVY = 236, AR = 196;
function apt(deg: number, len: number): [number, number] {
  const r = (deg * Math.PI) / 180;
  return [AVX + len * Math.cos(r), AVY - len * Math.sin(r)];
}
function alienStars(diff: number): number { return diff <= 3 ? 3 : diff <= 8 ? 2 : diff <= 15 ? 1 : 0; }
function alienMedal(diff: number): string { return diff === 0 ? "🎯 Bullseye!" : diff <= 3 ? "🎯 Brilliant aim!" : diff <= 8 ? "👏 Great estimating!" : diff <= 15 ? "👍 Close!" : "Keep practising your angle sense!"; }

function AlienScene({ task, onCorrect }: { task: ProtractorTask; onCorrect: () => void }) {
  const target = task.targetDeg ?? 45;
  const [deg, setDeg] = useState(90);
  const [revealed, setRevealed] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragging = useRef(false);

  const degFromEvent = (e: React.PointerEvent) => {
    const svg = svgRef.current;
    if (!svg) return deg;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 480;
    const py = ((e.clientY - rect.top) / rect.height) * 300;
    const d = (Math.atan2(AVY - py, px - AVX) * 180) / Math.PI;
    return Math.max(0, Math.min(180, Math.round(d)));
  };
  const move = (e: React.PointerEvent) => { if (dragging.current && !revealed) setDeg(degFromEvent(e)); };

  const diff = Math.abs(deg - target);
  const [bx, by] = apt(0, AR);
  const [ax, ay] = apt(deg, AR - 6);
  const [tx, ty] = apt(target, AR - 6);
  const [lx, ly] = apt(target, AR + 30);

  return (
    <Shell badge={task.badgeLabel ?? "Alien Angles"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="mx-auto flex items-center gap-2 rounded-full border-2 border-[#5b21b6] bg-white px-5 py-1.5 text-xl font-black text-[#5b21b6] shadow-sm">
        🎯 Aim for {target}°
      </div>

      {!revealed ? (
        <div className="flex justify-center rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-2">
          <svg ref={svgRef} viewBox="0 0 480 300" width="100%" style={{ maxWidth: 460, touchAction: "none" }} role="img" aria-label="aim the beam"
            onPointerMove={move} onPointerUp={() => { dragging.current = false; }} onPointerLeave={() => { dragging.current = false; }}>
            {/* baseline (launch pad) */}
            <line x1={AVX} y1={AVY} x2={bx} y2={by} stroke="#2c1c07" strokeWidth={6} strokeLinecap="round" />
            {/* wedge near vertex */}
            <path d={`M ${apt(0, 46)[0]} ${apt(0, 46)[1]} A 46 46 0 0 0 ${apt(deg, 46)[0]} ${apt(deg, 46)[1]}`} fill="none" stroke="#7c3aed" strokeWidth={3} />
            {/* aimed beam */}
            <line x1={AVX} y1={AVY} x2={ax} y2={ay} stroke="#7c3aed" strokeWidth={7} strokeLinecap="round" />
            {/* drag handle */}
            <circle cx={ax} cy={ay} r={17} fill="#7c3aed" stroke="#fff" strokeWidth={3} style={{ cursor: "grab" }}
              onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); }} />
            <circle cx={AVX} cy={AVY} r={7} fill="#5b21b6" stroke="#fff" strokeWidth={2} />
          </svg>
        </div>
      ) : (
        <div className="relative mx-auto" style={{ maxWidth: 460 }}>
          <MeasurelandsProtractor angle={deg} baselineSide="right" guidance="full" showReading size={460} />
          <svg viewBox="0 0 480 300" width="100%" className="pointer-events-none absolute inset-0" style={{ maxWidth: 460 }}>
            {/* target ray */}
            <line x1={AVX} y1={AVY} x2={tx} y2={ty} stroke="#16a34a" strokeWidth={4} strokeDasharray="8 6" strokeLinecap="round" />
            <rect x={lx - 27} y={ly - 15} width={54} height={26} rx={8} fill="#16a34a" />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize={15} fontWeight={900} fill="#fff">{target}°</text>
          </svg>
        </div>
      )}

      {!revealed ? (
        <button type="button" onClick={() => setRevealed(true)} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[#5b21b6] bg-[#5b21b6] px-10 text-xl font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Estimate! →</button>
      ) : (
        <>
          <div className="flex flex-col items-center gap-1.5 rounded-[22px] border-2 border-[#16a34a] bg-[rgba(22,163,74,0.08)] px-4 py-3 text-center">
            <div className="flex gap-1 text-2xl leading-none">{[0, 1, 2].map((i) => <span key={i} className={i < alienStars(diff) ? "text-[#f59e0b]" : "text-[rgba(214,184,108,0.35)]"}>★</span>)}</div>
            <div className="text-lg font-black text-[#2c1c07]">Target <span className="text-[#16a34a]">{target}°</span> · you aimed <span className="text-[#7c3aed]">{deg}°</span></div>
            <div className="text-base font-black text-[#16a34a]">{diff === 0 ? "Spot on!" : `${diff}° away`} — {alienMedal(diff)}</div>
          </div>
          <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[#16a34a] bg-[#16a34a] px-10 text-xl font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Next →</button>
        </>
      )}
    </Shell>
  );
}

export function MeasurelandsProtractorCard({ task, onCorrect, onWrong }: { task: ProtractorTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "learn": return <LearnScene task={task} onCorrect={onCorrect} />;
    case "alien": return <AlienScene task={task} onCorrect={onCorrect} />;
    case "estimate": return <EstimateScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Estimate the Angle" />;
    case "closest": return <EstimateScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Which Is Closest?" />;
    case "guess": return <GuessScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "read": return <ReadScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Read the Protractor" />;
    case "whichScale": return <ReadScene task={task} onCorrect={onCorrect} onWrong={onWrong} badge="Which Scale?" />;
    case "mistake": return <MistakeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    default: return <ConstructScene task={task} onCorrect={onCorrect} />;
  }
}
