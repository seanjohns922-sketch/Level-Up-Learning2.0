"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type RulerTask = Extract<PracticeTask, { kind: "rulerMeasure" }>;

/* ── The reusable Measurelands Ruler ──────────────────────────────────────────
 * Timber body + brass edge, a bold ZERO line, whole-centimetre marks, and any
 * object rendered in the SAME SVG coordinate space so its width maps exactly to
 * the scale and its left edge sits on the 0 mark. Reused Level 3 → Level 6.
 * Do NOT introduce a second ruler system — extend this one.
 * ───────────────────────────────────────────────────────────────────────────*/
const CM_PX = 26; // pixels per centimetre (fixed = accurate; SVG scales to fit)
const PAD = 20; // left/right padding inside the ruler so 0 isn't at the edge
const OBJ_TOP = 12;
const OBJ_H = 38;
const RULER_TOP = 62;
const RULER_H = 62;
const SVG_H = RULER_TOP + RULER_H + 4;

const OBJECT_FILL: Record<string, [string, string]> = {
  "✏️": ["#fde68a", "#f59e0b"],
  "🖍️": ["#fca5a5", "#ef4444"],
  "🖊️": ["#a5b4fc", "#6366f1"],
  "🥄": ["#e2e8f0", "#94a3b8"],
  "🚗": ["#bae6fd", "#38bdf8"],
  "🔑": ["#fcd34d", "#d97706"],
  "🍃": ["#bbf7d0", "#22c55e"],
  "🎀": ["#f9a8d4", "#ec4899"],
};

function xForCm(cm: number) {
  return PAD + cm * CM_PX;
}

/** The ruler body + cm ticks + numbers, with the hero 0 line. */
function RulerBody({ rulerCm }: { rulerCm: number }) {
  const rightX = xForCm(rulerCm);
  const ticks = [];
  for (let i = 0; i <= rulerCm; i += 1) {
    const x = xForCm(i);
    const major = i % 5 === 0;
    const isZero = i === 0;
    ticks.push(
      <g key={i}>
        <line
          x1={x}
          x2={x}
          y1={RULER_TOP}
          y2={RULER_TOP + (major ? 22 : 14)}
          stroke={isZero ? "#b91c1c" : major ? "#7c4a12" : "#a9803a"}
          strokeWidth={isZero ? 3 : major ? 2 : 1.4}
          strokeLinecap="round"
        />
        <text
          x={x}
          y={RULER_TOP + 40}
          textAnchor="middle"
          fontSize={major ? 14 : 11}
          fontWeight={isZero ? 900 : major ? 800 : 600}
          fill={isZero ? "#b91c1c" : "#5b3a11"}
        >
          {i}
        </text>
      </g>,
    );
  }
  return (
    <g>
      {/* timber body */}
      <defs>
        <linearGradient id="timber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3d9a4" />
          <stop offset="0.5" stopColor="#e7bf7d" />
          <stop offset="1" stopColor="#d8a860" />
        </linearGradient>
      </defs>
      <rect
        x={PAD - 12}
        y={RULER_TOP - 6}
        width={rightX - PAD + 24}
        height={RULER_H}
        rx={12}
        fill="url(#timber)"
        stroke="#a9803a"
        strokeWidth={2}
      />
      {/* brass top edge */}
      <rect x={PAD - 12} y={RULER_TOP - 6} width={rightX - PAD + 24} height={6} rx={3} fill="#c9922f" opacity={0.5} />
      {ticks}
      {/* ZERO flag — the hero of the lesson */}
      <g>
        <rect x={xForCm(0) - 15} y={RULER_TOP - 24} width={30} height={16} rx={5} fill="#b91c1c" />
        <text x={xForCm(0)} y={RULER_TOP - 12} textAnchor="middle" fontSize={10} fontWeight={900} fill="#fff">
          0
        </text>
      </g>
    </g>
  );
}

/** An object silhouette drawn on the ruler scale, left edge on the 0 mark. */
function ObjectBar({ object, showZeroHero }: { object: { label: string; icon: string; lengthCm: number }; showZeroHero?: boolean }) {
  const x0 = xForCm(0);
  const w = object.lengthCm * CM_PX;
  const [c1, c2] = OBJECT_FILL[object.icon] ?? ["#ddd6fe", "#8b5cf6"];
  const gid = `obj-${object.icon}-${object.lengthCm}`;
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect x={x0} y={OBJ_TOP} width={w} height={OBJ_H} rx={10} fill={`url(#${gid})`} stroke="#00000022" strokeWidth={1} />
      <rect x={x0} y={OBJ_TOP + 3} width={w} height={7} rx={4} fill="#ffffff55" />
      <text x={x0 + w / 2} y={OBJ_TOP + OBJ_H / 2 + 8} textAnchor="middle" fontSize={22}>
        {object.icon}
      </text>
      {/* dashed guide connecting the object's start to the 0 mark */}
      {showZeroHero ? (
        <line x1={x0} x2={x0} y1={OBJ_TOP} y2={RULER_TOP + 22} stroke="#b91c1c" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7} />
      ) : null}
    </g>
  );
}

/** Full ruler with an object aligned to zero. Scales to fit its container. */
function RulerWithObject({
  rulerCm,
  object,
  showZeroHero,
  children,
}: {
  rulerCm: number;
  object?: { label: string; icon: string; lengthCm: number };
  showZeroHero?: boolean;
  children?: React.ReactNode;
}) {
  const w = xForCm(rulerCm) + PAD;
  return (
    <div className="mx-auto w-full" style={{ maxWidth: Math.min(w, 560) }}>
      <svg viewBox={`0 0 ${w} ${SVG_H}`} width="100%" role="img" aria-label={object ? `${object.label} on a ruler` : "A ruler"}>
        <RulerBody rulerCm={rulerCm} />
        {object ? <ObjectBar object={object} showZeroHero={showZeroHero} /> : null}
        {children}
      </svg>
    </div>
  );
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
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]"
          style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(167,139,250,0.34)", color: "#5b21b6" }}
        >
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

/* ── Teaching intro: Professor Gauge unveils the ruler ── */
function IntroScene({ task, onCorrect }: { task: RulerTask; onCorrect: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
        <RulerWithObject rulerCm={task.rulerCm} object={task.object} showZeroHero />
      </div>
      <button
        type="button"
        onClick={onCorrect}
        className="mx-auto flex min-h-[60px] items-center justify-center gap-2 rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
      >
        Let&apos;s measure! →
      </button>
    </Shell>
  );
}

/* ── Activity A — Start at Zero: tap the mark we start measuring from ── */
function StartZeroScene({ task, onCorrect, onWrong }: { task: RulerTask; onCorrect: () => void; onWrong: () => void }) {
  const [wrongTick, setWrongTick] = useState<number | "edge" | null>(null);
  const ticks = task.tickOptions ?? [0, 1, 2];
  const w = xForCm(task.rulerCm) + PAD;
  const handle = (value: number | "edge") => {
    if (value === task.correctTick) {
      onCorrect();
    } else {
      setWrongTick(value);
      onWrong();
    }
  };
  return (
    <Shell badge={task.badgeLabel ?? "Start at Zero"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
        <RulerWithObject rulerCm={task.rulerCm} object={task.object}>
          {/* the physical left edge distractor */}
          {task.includeEdgeOption ? (
            <g onClick={() => handle("edge")} style={{ cursor: "pointer" }}>
              <circle cx={PAD - 12} cy={RULER_TOP + 8} r={12} fill={wrongTick === "edge" ? "#fecaca" : "#ffffff"} stroke="#7c4a12" strokeWidth={2} />
              <text x={PAD - 12} y={RULER_TOP + 12} textAnchor="middle" fontSize={12} fontWeight={800} fill="#7c4a12">
                ↤
              </text>
            </g>
          ) : null}
          {ticks.map((cm) => (
            <g key={cm} onClick={() => handle(cm)} style={{ cursor: "pointer" }}>
              <circle
                cx={xForCm(cm)}
                cy={RULER_TOP + 8}
                r={13}
                fill={wrongTick === cm ? "#fecaca" : "#ffffff"}
                stroke={cm === 0 ? "#b91c1c" : "#7c4a12"}
                strokeWidth={2.5}
              />
              <text x={xForCm(cm)} y={RULER_TOP + 13} textAnchor="middle" fontSize={13} fontWeight={900} fill={cm === 0 ? "#b91c1c" : "#5b3a11"}>
                {cm}
              </text>
            </g>
          ))}
          <text x={w / 2} y={SVG_H - 2} textAnchor="middle" fontSize={11} fontWeight={700} fill="#a98b52">
            Tap where we start measuring
          </text>
        </RulerWithObject>
      </div>
    </Shell>
  );
}

/* ── Activity B — Measure the Object: read the length in whole cm ── */
function MeasureScene({ task, onCorrect, onWrong }: { task: RulerTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Measure the Object"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
        <RulerWithObject rulerCm={task.rulerCm} object={task.object} showZeroHero />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === task.correctAnswer ? onCorrect() : onWrong())}
            className="relative flex min-h-[76px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] sm:text-3xl"
          >
            <span className="absolute right-2 top-2 z-10">
              <OptionReadAloudButton text={`${value} centimetres`} />
            </span>
            {value} cm
          </button>
        ))}
      </div>
    </Shell>
  );
}

/* ── Activity C — Which Is Longer?: compare two measured objects ── */
function CompareScene({ task, onCorrect, onWrong }: { task: RulerTask; onCorrect: () => void; onWrong: () => void }) {
  const objects = task.compareObjects ?? [];
  return (
    <Shell badge={task.badgeLabel ?? "Which Is Longer?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-1 gap-3">
        {objects.map((obj) => (
          <button
            key={obj.label}
            type="button"
            onClick={() => (obj.label === task.correctLabel ? onCorrect() : onWrong())}
            className="rounded-[26px] border-2 border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] p-3 text-left transition hover:-translate-y-0.5 active:scale-[0.99]"
          >
            <div className="mb-1 flex items-center justify-between px-2">
              <span className="text-lg font-black text-[#2c1c07]">
                {obj.icon} {obj.label}
              </span>
              <span className="rounded-full bg-[rgba(91,33,182,0.1)] px-3 py-0.5 text-sm font-black text-[#5b21b6]">{obj.lengthCm} cm</span>
            </div>
            <RulerWithObject rulerCm={task.rulerCm} object={obj} />
          </button>
        ))}
      </div>
    </Shell>
  );
}

export function MeasurelandsRulerCard({ task, onCorrect, onWrong }: { task: RulerTask; onCorrect: () => void; onWrong: () => void }) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "startZero") return <StartZeroScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "compare") return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <MeasureScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
