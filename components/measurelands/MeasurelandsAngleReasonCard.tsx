"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { MeasurelandsProtractor } from "@/components/measurelands/MeasurelandsProtractor";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type AngleTask = Extract<PracticeTask, { kind: "angleReason" }>;
type Sector = { deg: number; label: string; unknown?: boolean };

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
function ctxLine(t: AngleTask) { return t.context ? <div className="text-center text-[12px] font-black uppercase tracking-[0.14em] text-[#a98b52]">{t.emoji} {t.context}</div> : null; }

/* The angle-reasoning diagram — sectors summing to 180 (line) or 360 (point). */
function AngleDiagram({ type, sectors, revealDeg }: { type: "line" | "point"; sectors: Sector[]; revealDeg?: number }) {
  const isLine = type === "line";
  const W = isLine ? 360 : 300, H = isLine ? 208 : 300;
  const vx = W / 2, vy = isLine ? H - 22 : H / 2, R = isLine ? 152 : 120;
  const startA = isLine ? 0 : -90;
  const P = (deg: number, rr: number): [number, number] => [vx + rr * Math.cos((deg * Math.PI) / 180), vy - rr * Math.sin((deg * Math.PI) / 180)];
  const bounds: number[] = [startA];
  let cum = startA;
  for (const s of sectors) { cum += s.deg; bounds.push(cum); }
  const wedge = (a1: number, a2: number, rr: number) => {
    const steps = Math.max(2, Math.round(Math.abs(a2 - a1) / 6));
    const pts = [`${vx},${vy}`];
    for (let i = 0; i <= steps; i++) { const a = a1 + ((a2 - a1) * i) / steps; const [x, y] = P(a, rr); pts.push(`${x.toFixed(1)},${y.toFixed(1)}`); }
    return `M ${pts.join(" L ")} Z`;
  };
  return (
    <div className="mx-auto" style={{ maxWidth: isLine ? 420 : 340 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxHeight: 260 }} role="img" aria-label="angle diagram">
        {sectors.map((s, i) => {
          const a1 = bounds[i]!, a2 = bounds[i + 1]!, mid = (a1 + a2) / 2;
          const fill = s.unknown ? "rgba(245,158,11,0.22)" : "rgba(124,58,237,0.14)";
          const stroke = s.unknown ? "#b45309" : "#7c3aed";
          const [lx, ly] = P(mid, R * 0.62);
          const shown = s.unknown ? (revealDeg != null ? `${revealDeg}°` : "?") : s.label;
          return (
            <g key={i}>
              <path d={wedge(a1, a2, R)} fill={fill} stroke={stroke} strokeWidth={1.5} />
              <text x={lx} y={ly + 5} textAnchor="middle" fontSize={s.unknown ? 22 : 17} fontWeight={900} fill={s.unknown ? (revealDeg != null ? "#16a34a" : "#b45309") : "#5b21b6"}>{shown}</text>
            </g>
          );
        })}
        {bounds.map((b, i) => { const [x, y] = P(b, R); return <line key={`r${i}`} x1={vx} y1={vy} x2={x} y2={y} stroke="#2c1c07" strokeWidth={i === 0 || i === bounds.length - 1 ? 4 : 3} strokeLinecap="round" />; })}
        <circle cx={vx} cy={vy} r={6} fill="#2c1c07" />
      </svg>
    </div>
  );
}

function Keypad({ answer, onCorrect, onWrong }: { answer: number; onCorrect: () => void; onWrong: () => void }) {
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<"idle" | "wrong">("idle");
  const add = (d: string) => { setStatus("idle"); setTyped((c) => (c.length >= 3 ? c : `${c}${d}`)); };
  const check = () => { if (!typed) return; if (Number(typed) === answer) onCorrect(); else { setStatus("wrong"); onWrong(); } };
  return (
    <div className="mx-auto w-full max-w-[280px] rounded-[24px] border-2 border-[rgba(214,184,108,0.52)] bg-white p-3 shadow-sm">
      <div className={`mb-2 flex items-center justify-center gap-1 rounded-[20px] border-2 px-4 py-2 ${status === "wrong" ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.58)] bg-[#fffaf0]"}`}>
        <div className="min-w-[64px] text-center text-3xl font-black tabular-nums text-[#2c1c07]">{typed || "?"}</div>
        <div className="text-2xl font-black text-[#7c3aed]">°</div>
      </div>
      <div className="mb-2 text-center text-xs font-bold text-[#6b4d23]">{status === "wrong" ? "Use the total — try again." : "Subtract from the total."}</div>
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" onClick={() => add(d)} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fff7df] py-2.5 text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5">{d}</button>
        ))}
        <button type="button" onClick={() => { setStatus("idle"); setTyped(""); }} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-white py-2.5 text-sm font-black uppercase text-[#7c4a12] shadow-sm">Clear</button>
        <button type="button" onClick={() => add("0")} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fff7df] py-2.5 text-2xl font-black text-[#2c1c07] shadow-sm">0</button>
        <button type="button" onClick={check} className="rounded-[16px] border-2 border-[#7c3aed] bg-[#7c3aed] py-2.5 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Go</button>
      </div>
    </div>
  );
}

function FindScene({ task, onCorrect, onWrong }: { task: AngleTask; onCorrect: () => void; onWrong: () => void }) {
  const d = task.diagram!;
  const answer = task.answerDeg ?? 0;
  const total = task.total ?? (d.type === "line" ? 180 : 360);
  const [solved, setSolved] = useState(false);
  const [check, setCheck] = useState(false);
  return (
    <Shell badge={task.badgeLabel ?? "Find the Missing Angle"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className={panel}>
        {ctxLine(task)}
        {check ? (
          <div className="flex flex-col items-center gap-1"><MeasurelandsProtractor angle={answer} baselineSide="right" guidance="full" showReading size={420} /><p className="text-[12px] font-black text-[#16a34a]">The protractor confirms {answer}°.</p></div>
        ) : (
          <AngleDiagram type={d.type} sectors={d.sectors} revealDeg={solved ? answer : undefined} />
        )}
        <p className="mt-1 text-center text-[13px] font-black text-[#a98b52]">{d.type === "line" ? "Angles on a straight line add to 180°." : "Angles around a point add to 360°."}</p>
      </div>
      {!solved ? (
        <Keypad answer={answer} onCorrect={() => setSolved(true)} onWrong={onWrong} />
      ) : (
        <>
          <p className="text-center text-base font-black text-[#16a34a]">✓ {total} − {total - answer} = {answer}° — you reasoned it out!</p>
          <div className="flex flex-wrap justify-center gap-3">
            {task.allowCheck && answer <= 180 ? <button type="button" onClick={() => setCheck((v) => !v)} className="min-h-[52px] rounded-[22px] border-2 border-[rgba(214,184,108,0.6)] bg-white px-6 text-base font-black text-[#7c4a12] shadow-sm transition hover:-translate-y-0.5">{check ? "Back to diagram" : "Check with protractor"}</button> : null}
            <button type="button" onClick={onCorrect} className="min-h-[52px] rounded-[22px] border-2 border-[#16a34a] bg-[#16a34a] px-8 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Next →</button>
          </div>
        </>
      )}
    </Shell>
  );
}

function WhichScene({ task, onCorrect, onWrong }: { task: AngleTask; onCorrect: () => void; onWrong: () => void }) {
  const d = task.diagram!;
  const [wrong, setWrong] = useState<number | null>(null);
  return (
    <Shell badge={task.badgeLabel ?? "Which Answer Is Correct?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className={panel}>{ctxLine(task)}<AngleDiagram type={d.type} sectors={d.sectors} /><p className="mt-1 text-center text-[13px] font-black text-[#a98b52]">{d.type === "line" ? "Total = 180°." : "Total = 360°."}</p></div>
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((n) => (
          <button key={n} type="button" onClick={() => (n === task.correctNumber ? onCorrect() : (setWrong(n), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`relative flex min-h-[64px] items-center justify-center rounded-[22px] border-2 text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === n ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
            <span className="absolute right-1 top-1 z-10"><OptionReadAloudButton text={`${n} degrees`} /></span>{n}°
          </button>
        ))}
      </div>
    </Shell>
  );
}

function MistakeScene({ task, onCorrect, onWrong }: { task: AngleTask; onCorrect: () => void; onWrong: () => void }) {
  const d = task.diagram!;
  const [wrong, setWrong] = useState<string | null>(null);
  return (
    <Shell badge={task.badgeLabel ?? "Professor Gauge's Mistake"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className={panel}>{ctxLine(task)}<AngleDiagram type={d.type} sectors={d.sectors} />{task.statement ? <div className="mx-auto mt-1 w-fit rounded-[18px] border border-[rgba(192,86,78,0.28)] bg-[rgba(252,224,224,0.5)] px-4 py-2 text-center text-lg font-black text-[#7c2d12]">{task.statement}</div> : null}</div>
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

function IntroScene({ task, onCorrect }: { task: AngleTask; onCorrect: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className={panel}><AngleDiagram type="line" sectors={[{ deg: 120, label: "120°" }, { deg: 60, label: "60°" }]} /><p className="text-center text-sm font-black text-[#5b21b6]">Straight line = 180°</p></div>
        <div className={panel}><AngleDiagram type="point" sectors={[{ deg: 120, label: "120°" }, { deg: 90, label: "90°" }, { deg: 150, label: "150°" }]} /><p className="text-center text-sm font-black text-[#5b21b6]">Around a point = 360°</p></div>
      </div>
      <p className="text-center text-[15px] font-bold text-[#2c1c07]">Engineers don&apos;t always measure — they <span className="font-black text-[#5b21b6]">reason</span>. If you know the total and all-but-one angle, you can work out the last one.</p>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s reason! →</button>
    </Shell>
  );
}

export function MeasurelandsAngleReasonCard({ task, onCorrect, onWrong }: { task: AngleTask; onCorrect: () => void; onWrong: () => void }) {
  switch (task.scene) {
    case "intro": return <IntroScene task={task} onCorrect={onCorrect} />;
    case "find": return <FindScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    case "which": return <WhichScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
    default: return <MistakeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  }
}
