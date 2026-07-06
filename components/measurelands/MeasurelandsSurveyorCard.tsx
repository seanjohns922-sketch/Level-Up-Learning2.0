"use client";

import { useMemo, useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type SurveyorTask = Extract<PracticeTask, { kind: "perimeterCalc" }>;

const THEME: Record<string, { fillHi: string; fillLo: string; icon: string }> = {
  garden: { fillHi: "#A7D98A", fillLo: "#77B85C", icon: "🌿" },
  paddock: { fillHi: "#CBE59A", fillLo: "#A6C86A", icon: "🐄" },
  playground: { fillHi: "#F3D9A6", fillLo: "#E0B975", icon: "🛝" },
  pool: { fillHi: "#8FD3F4", fillLo: "#4FA9DC", icon: "🏊" },
  park: { fillHi: "#9FD98F", fillLo: "#6FB35C", icon: "🌳" },
};
const FENCE = "#7A5325";
const FENCE_HI = "#9E7038";

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

function useGeometry(poly: Array<[number, number]>, maxW = 300, maxH = 210) {
  return useMemo(() => {
    const xs = poly.map((p) => p[0]);
    const ys = poly.map((p) => p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const w = maxX - minX || 1, h = maxY - minY || 1;
    const pad = 40;
    const scale = Math.min((maxW - 2 * pad) / w, (maxH - 2 * pad) / h);
    const toPx = ([x, y]: [number, number]): [number, number] => [pad + (x - minX) * scale, pad + (maxY - y) * scale];
    const pts = poly.map(toPx);
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    const svgW = pad * 2 + w * scale;
    const svgH = pad * 2 + h * scale;
    const edges = pts.map((a, i) => {
      const b = pts[(i + 1) % pts.length]!;
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const dx = mx - cx, dy = my - cy;
      const d = Math.hypot(dx, dy) || 1;
      return { a, b, mx, my, ox: mx + (dx / d) * 20, oy: my + (dy / d) * 20 };
    });
    return { pts, edges, svgW, svgH };
  }, [poly, maxW, maxH]);
}

function SurveyorShape({
  task,
  size = 300,
  revealed,
  onEdgeTap,
  showLabels = true,
}: {
  task: SurveyorTask;
  size?: number;
  revealed?: Set<number>;
  onEdgeTap?: (i: number) => void;
  showLabels?: boolean;
}) {
  const [uid] = useState(() => Math.random().toString(36).slice(2, 9));
  const geo = useGeometry(task.poly, size);
  const theme = THEME[task.theme ?? "garden"] ?? THEME.garden!;
  const path = geo.pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") + " Z";
  const tappable = !!onEdgeTap;

  return (
    <div className="mx-auto" style={{ width: Math.min(size, geo.svgW + 8) }}>
      <svg viewBox={`0 0 ${geo.svgW} ${geo.svgH}`} width="100%" role="img" aria-label={`${task.shapeName ?? "shape"} with labelled sides`}>
        <defs>
          <linearGradient id={`fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={theme.fillHi} />
            <stop offset="1" stopColor={theme.fillLo} />
          </linearGradient>
        </defs>
        {/* land fill */}
        <path d={path} fill={`url(#fill-${uid})`} stroke={FENCE} strokeWidth={9} strokeLinejoin="round" />
        <path d={path} fill="none" stroke={FENCE_HI} strokeWidth={2.4} strokeLinejoin="round" opacity={0.7} />
        {/* theme icon in the centre */}
        <text x={geo.svgW / 2} y={geo.svgH / 2 + 8} textAnchor="middle" fontSize={26} opacity={0.9}>{theme.icon}</text>

        {/* edges: tap targets + labels */}
        {geo.edges.map((e, i) => {
          const shown = showLabels && (!revealed || revealed.has(i));
          return (
            <g key={i}>
              {tappable ? (
                <line
                  x1={e.a[0]} y1={e.a[1]} x2={e.b[0]} y2={e.b[1]}
                  stroke={revealed?.has(i) ? "#5b21b6" : "rgba(226,178,58,0.9)"}
                  strokeWidth={12}
                  strokeLinecap="round"
                  style={{ cursor: "pointer" }}
                  opacity={revealed?.has(i) ? 0.5 : 0.55}
                  onClick={() => onEdgeTap?.(i)}
                />
              ) : null}
              {shown ? (
                <g>
                  <rect x={e.ox - 20} y={e.oy - 11} width={40} height={22} rx={7} fill="#fffaf0" stroke="rgba(214,184,108,0.7)" strokeWidth={1} />
                  <text x={e.ox} y={e.oy + 5} textAnchor="middle" fontSize={12} fontWeight={900} fill="#2c1c07">{task.sideLabels[i]}{task.unit}</text>
                </g>
              ) : tappable && !revealed?.has(i) ? (
                <text x={e.ox} y={e.oy + 5} textAnchor="middle" fontSize={16} fontWeight={900} fill="#7c4a12">?</text>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── Keypad for typed perimeter (with an add-the-sides working strip) ── */
function Keypad({ answer, unit, hint, addends, onCorrect, onWrong }: { answer: number; unit: string; hint: string; addends?: number[]; onCorrect: () => void; onWrong: () => void }) {
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<"idle" | "wrong">("idle");
  const add = (d: string) => { setStatus("idle"); setTyped((c) => (c === "0" ? d : c.length >= 4 ? c : `${c}${d}`)); };
  const check = () => { if (!typed) return; if (Number(typed) === answer) onCorrect(); else { setStatus("wrong"); onWrong(); } };
  return (
    <div className="rounded-[24px] border-2 border-[rgba(214,184,108,0.52)] bg-white p-3 shadow-sm">
      {addends && addends.length > 0 ? (
        <div className="mb-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-[18px] border border-[rgba(214,184,108,0.5)] bg-[rgba(255,250,240,0.9)] px-3 py-2">
          {addends.map((n, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="rounded-[10px] bg-white px-2.5 py-1 text-lg font-black text-[#2c1c07] shadow-[inset_0_0_0_1px_rgba(214,184,108,0.6)]">{n}</span>
              {i < addends.length - 1 ? <span className="text-lg font-black text-[#a98b52]">+</span> : null}
            </span>
          ))}
          <span className="text-lg font-black text-[#a98b52]">=</span>
          <span className="min-w-[42px] rounded-[10px] border-2 border-dashed border-[#5b21b6]/50 px-2 py-1 text-center text-lg font-black text-[#5b21b6]">{typed || "?"}</span>
        </div>
      ) : null}
      <div className={`mb-2 flex items-center justify-center gap-2 rounded-[20px] border-2 px-4 py-2 ${status === "wrong" ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.58)] bg-[#fffaf0]"}`}>
        <div className="min-w-[70px] text-center text-3xl font-black tabular-nums text-[#2c1c07]">{typed || "?"}</div>
        <div className="text-xl font-black uppercase tracking-[0.12em] text-[#7c4a12]">{unit}</div>
      </div>
      <div className="mb-2 text-center text-xs font-bold text-[#6b4d23]">{status === "wrong" ? "Add every side once more." : hint}</div>
      <div className="grid grid-cols-3 gap-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" onClick={() => add(d)} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fff7df] py-2.5 text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5">{d}</button>
        ))}
        <button type="button" onClick={() => { setStatus("idle"); setTyped(""); }} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-white py-2.5 text-sm font-black uppercase text-[#7c4a12] shadow-sm">Clear</button>
        <button type="button" onClick={() => add("0")} className="rounded-[16px] border-2 border-[rgba(214,184,108,0.58)] bg-[#fff7df] py-2.5 text-2xl font-black text-[#2c1c07] shadow-sm">0</button>
        <button type="button" onClick={check} className="rounded-[16px] border-2 border-[#5b21b6] bg-[#5b21b6] py-2.5 text-lg font-black uppercase text-white shadow-sm transition hover:-translate-y-0.5">Go</button>
      </div>
    </div>
  );
}

function McqRow({ options, correct, unit, onCorrect, onWrong }: { options: number[]; correct: number; unit: string; onCorrect: () => void; onWrong: () => void }) {
  const [wrong, setWrong] = useState<number | null>(null);
  return (
    <div className="grid grid-cols-3 gap-3">
      {options.map((n) => (
        <button key={n} type="button" onClick={() => (n === correct ? onCorrect() : (setWrong(n), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`relative flex min-h-[72px] items-center justify-center rounded-[24px] border-2 text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] ${wrong === n ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>
          <span className="absolute right-2 top-2 z-10"><OptionReadAloudButton text={`${n} ${unit}`} /></span>
          {n} {unit}
        </button>
      ))}
    </div>
  );
}

function IntroScene({ task, onCorrect }: { task: SurveyorTask; onCorrect: () => void }) {
  const sum = task.sideLabels.reduce((a, b) => a + b, 0);
  const sumStr = task.sideLabels.join(" + ");
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
          <SurveyorShape task={task} size={260} />
        </div>
        <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">What is perimeter?</span>
            <span className="rounded-full bg-[rgba(91,33,182,0.1)] px-2 py-0.5 text-[11px] font-black text-[#5b21b6]">all the way around</span>
          </div>
          <p className="text-[17px] font-bold leading-snug text-[#2c1c07]">
            Perimeter is the total distance <span className="font-black text-[#5b21b6]">around the outside</span> of a shape.
          </p>
          <p className="mt-2 text-[15px] font-semibold leading-snug text-[#5a4423]">
            Measure every side, then <span className="font-black">add them all together</span>. It is a length — not the space inside.
          </p>
          <div className="mt-3 rounded-[16px] border border-[rgba(214,184,108,0.5)] bg-white px-3 py-2 text-center text-lg font-black text-[#2c1c07]">
            {sumStr} = <span className="text-[#5b21b6]">{sum} {task.unit}</span>
          </div>
        </div>
      </div>
      <button type="button" onClick={onCorrect} className="mx-auto flex min-h-[60px] items-center justify-center rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">Let&apos;s survey! →</button>
    </Shell>
  );
}

function MeasureEveryScene({ task, onCorrect, onWrong }: { task: SurveyorTask; onCorrect: () => void; onWrong: () => void }) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const total = task.sideLabels.length;
  const tap = (i: number) => {
    if (revealed.has(i)) return;
    const next = new Set(revealed);
    next.add(i);
    setRevealed(next);
    if (next.size === total) onCorrect();
  };
  return (
    <Shell badge={task.badgeLabel ?? "Measure Every Side"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3">
        <SurveyorShape task={task} onEdgeTap={tap} revealed={revealed} />
        <p className="text-center text-[12px] font-bold uppercase tracking-[0.14em] text-[#a98b52]">Tap every side to measure it — {revealed.size}/{total} measured</p>
      </div>
    </Shell>
  );
}

function CalcScene({ task, onCorrect, onWrong }: { task: SurveyorTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Find the Perimeter"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3"><SurveyorShape task={task} /></div>
        <Keypad answer={task.answerValue ?? task.perimeter ?? 0} unit={task.answerUnit ?? task.unit} hint="Add every side to find the total." addends={task.sideLabels} onCorrect={onCorrect} onWrong={onWrong} />
      </div>
    </Shell>
  );
}

function ChooseScene({ task, onCorrect, onWrong }: { task: SurveyorTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Choose the Perimeter"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3"><SurveyorShape task={task} /></div>
      <McqRow options={task.options ?? []} correct={task.correctNumber ?? 0} unit={task.unit} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

function SpotMissedScene({ task, onCorrect, onWrong }: { task: SurveyorTask; onCorrect: () => void; onWrong: () => void }) {
  const gaugeRight = (task.answerValue ?? -1) === (task.perimeter ?? task.sideLabels.reduce((a, b) => a + b, 0));
  const [wrong, setWrong] = useState<string | null>(null);
  const opts = [
    { id: "yes", label: "Yes — that's right", correct: gaugeRight },
    { id: "no", label: "No — a side was missed", correct: !gaugeRight },
  ];
  return (
    <Shell badge={task.badgeLabel ?? "Professor Gauge's Mistake"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3"><SurveyorShape task={task} /></div>
      {task.statement ? <div className="rounded-[18px] border border-[rgba(192,86,78,0.28)] bg-[rgba(252,224,224,0.5)] px-4 py-2 text-center text-lg font-black text-[#7c2d12]">{task.statement}</div> : null}
      <div className="grid grid-cols-2 gap-3">
        {opts.map((o) => (
          <button key={o.id} type="button" onClick={() => (o.correct ? onCorrect() : (setWrong(o.id), onWrong(), window.setTimeout(() => setWrong(null), 600)))} className={`min-h-[70px] rounded-[24px] border-2 px-4 text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 ${wrong === o.id ? "border-[#C0564E] bg-[#FCE0E0]" : "border-[rgba(214,184,108,0.55)] bg-[#fffaf0]"}`}>{o.label}</button>
        ))}
      </div>
    </Shell>
  );
}

function ProblemScene({ task, onCorrect, onWrong }: { task: SurveyorTask; onCorrect: () => void; onWrong: () => void }) {
  const useMcq = (task.options?.length ?? 0) > 0;
  return (
    <Shell badge={task.badgeLabel ?? "Surveyor Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {useMcq ? (
        <>
          <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3"><SurveyorShape task={task} /></div>
          <McqRow options={task.options ?? []} correct={task.correctNumber ?? 0} unit={task.answerUnit ?? task.unit} onCorrect={onCorrect} onWrong={onWrong} />
        </>
      ) : (
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-3"><SurveyorShape task={task} /></div>
          <Keypad answer={task.answerValue ?? task.perimeter ?? 0} unit={task.answerUnit ?? task.unit} hint="Add every side to find the total." addends={task.sideLabels} onCorrect={onCorrect} onWrong={onWrong} />
        </div>
      )}
    </Shell>
  );
}

export function MeasurelandsSurveyorCard({ task, onCorrect, onWrong }: { task: SurveyorTask; onCorrect: () => void; onWrong: () => void }) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "measureEvery") return <MeasureEveryScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "choose") return <ChooseScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "spotMissed") return <SpotMissedScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "problem") return <ProblemScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <CalcScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
