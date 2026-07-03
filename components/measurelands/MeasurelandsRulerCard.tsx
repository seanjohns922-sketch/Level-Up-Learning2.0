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
// Fixed cm→px scale: ruler and object share it, so lengths read exactly and the
// object's left edge sits on the 0 mark by construction. SVG scales to fit.
const CM_PX = 30;
const PAD = 44; // timber before the 0 mark and after the last mark
const OBJ_H = 30;
const RULER_H = 60;

// Muted, material-like object tones (not candy colours). Emoji MATCHES the label.
const OBJECT_FILL: Record<string, [string, string]> = {
  "✏️": ["#E3B23C", "#C98A1A"],
  "🖍️": ["#C56B6B", "#A34747"],
  "🖊️": ["#5B6B9E", "#3F4E7E"],
  "🥄": ["#CBD0D8", "#9AA1AC"],
  "🚗": ["#6FA8C7", "#4E86A6"],
  "🔑": ["#C79A3C", "#A87C22"],
  "🍃": ["#7FB07A", "#5C8E57"],
  "🎀": ["#D08AB0", "#B0688F"],
};

const TIMBER = { top: "#EBCFA2", mid: "#DCB77C", bot: "#C79A57", edge: "#A67B3C" };
const MARK = "#3B2A14"; // engraved dark-brown markings
const BRASS = { lo: "#B8860B", hi: "#F0D888", mid: "#D9B25A" };
const GOLD = "rgba(226,178,58,0.55)"; // Measurelands interaction gold

function xForCm(cm: number) {
  return PAD + cm * CM_PX;
}

type ObjModel = { label: string; icon: string; lengthCm: number };
type Taps = {
  marks: number[];
  includeEdge?: boolean;
  wrongValue: number | "edge" | null;
  onPick: (v: number | "edge") => void;
};

/**
 * The one reusable Measurelands Ruler (Level 3–6). A handcrafted timber rule with
 * fine grain, a bevelled edge, engraved cm marks + numbers, and an elegant brass
 * zero marker. Objects rest naturally on the ruler, aligned to the 0 mark. When a
 * "Where do we start?" question is asked, small glowing tap targets float ABOVE
 * the ruler — the ruler face itself stays clean and never gets covered.
 */
function RulerWithObject({
  rulerCm,
  object,
  showZeroHero,
  taps,
}: {
  rulerCm: number;
  object?: ObjModel;
  showZeroHero?: boolean;
  taps?: Taps;
}) {
  const [uid] = useState(() => Math.random().toString(36).slice(2, 9));
  const [hover, setHover] = useState<number | "edge" | null>(null);

  const withTaps = !!taps;
  const objTop = 8;
  const tapGap = withTaps ? 40 : 0;
  const rulerTop = objTop + OBJ_H + tapGap;
  const tapCy = rulerTop - 20;
  const svgH = rulerTop + RULER_H + 6;

  const bodyX = PAD - 26;
  const bodyW = xForCm(rulerCm) + 16 - bodyX;
  const w = xForCm(rulerCm) + PAD;

  // Engraved centimetre marks. Majors (every 5) are longer/bolder; every cm is
  // numbered for readability. The 0 is handled separately as a brass marker.
  const marks = [];
  for (let i = 0; i <= rulerCm; i += 1) {
    const x = xForCm(i);
    const major = i % 5 === 0;
    marks.push(
      <g key={i}>
        <line
          x1={x}
          x2={x}
          y1={rulerTop + 1}
          y2={rulerTop + (major ? 20 : 12)}
          stroke={MARK}
          strokeWidth={major ? 1.8 : 1.1}
          strokeLinecap="round"
          opacity={i === 0 ? 0 : 0.92}
        />
        <text
          x={x}
          y={rulerTop + 40}
          textAnchor="middle"
          fontSize={major ? 13 : 11}
          fontWeight={major ? 800 : 600}
          fill={MARK}
          opacity={i === 0 ? 0 : 0.95}
        >
          {i}
        </text>
      </g>,
    );
  }

  const x0 = xForCm(0);
  const objW = object ? object.lengthCm * CM_PX : 0;
  const [oc1, oc2] = object ? OBJECT_FILL[object.icon] ?? ["#B9A6D6", "#8B76B4"] : ["", ""];

  return (
    <div className="mx-auto w-full" style={{ maxWidth: Math.min(w, 580) }}>
      <svg viewBox={`0 0 ${w} ${svgH}`} width="100%" role="img" aria-label={object ? `${object.label} on a ruler` : "A ruler"}>
        <defs>
          <linearGradient id={`timber-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={TIMBER.top} />
            <stop offset="0.45" stopColor={TIMBER.mid} />
            <stop offset="1" stopColor={TIMBER.bot} />
          </linearGradient>
          <linearGradient id={`brass-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={BRASS.hi} />
            <stop offset="0.5" stopColor={BRASS.mid} />
            <stop offset="1" stopColor={BRASS.lo} />
          </linearGradient>
          {object ? (
            <linearGradient id={`obj-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={oc1} />
              <stop offset="1" stopColor={oc2} />
            </linearGradient>
          ) : null}
          <clipPath id={`body-${uid}`}>
            <rect x={bodyX} y={rulerTop - 4} width={bodyW} height={RULER_H} rx={8} />
          </clipPath>
          <filter id={`soft-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>

        {/* ── Timber body with fine grain + bevelled edge ── */}
        <g>
          <rect x={bodyX} y={rulerTop - 4} width={bodyW} height={RULER_H} rx={8} fill={`url(#timber-${uid})`} stroke={TIMBER.edge} strokeWidth={1.4} />
          <g clipPath={`url(#body-${uid})`} opacity={0.5}>
            {[0.24, 0.42, 0.6, 0.78].map((f, gi) => {
              const gy = rulerTop - 4 + RULER_H * f;
              return (
                <path
                  key={gi}
                  d={`M ${bodyX} ${gy} C ${bodyX + bodyW * 0.3} ${gy - 3}, ${bodyX + bodyW * 0.7} ${gy + 3}, ${bodyX + bodyW} ${gy}`}
                  fill="none"
                  stroke="rgba(90,58,20,0.16)"
                  strokeWidth={1}
                />
              );
            })}
          </g>
          {/* bevel: light top edge, soft bottom shadow */}
          <rect x={bodyX + 1.5} y={rulerTop - 3} width={bodyW - 3} height={3} rx={2} fill="#FFFFFF" opacity={0.35} />
          <rect x={bodyX + 1.5} y={rulerTop - 4 + RULER_H - 4} width={bodyW - 3} height={3} rx={2} fill="#5A3A14" opacity={0.14} />
        </g>

        {marks}

        {/* ── Elegant brass ZERO marker (special, but not a cartoon flag) ── */}
        <g>
          <rect x={x0 - 2} y={rulerTop} width={4} height={24} rx={2} fill={`url(#brass-${uid})`} stroke={BRASS.lo} strokeWidth={0.5} />
          <path d={`M ${x0 - 5} ${rulerTop - 1} L ${x0 + 5} ${rulerTop - 1} L ${x0} ${rulerTop + 6} Z`} fill={`url(#brass-${uid})`} />
          <text x={x0} y={rulerTop + 40} textAnchor="middle" fontSize={13} fontWeight={900} fill={BRASS.lo}>
            0
          </text>
          {/* zero glows gold when its tap target is hovered */}
          {hover === 0 ? <rect x={x0 - 4} y={rulerTop - 3} width={8} height={28} rx={4} fill={GOLD} filter={`url(#soft-${uid})`} /> : null}
        </g>

        {/* ── Object resting on the ruler, left edge on the selected start mark ── */}
        {object ? (
          <g>
            <ellipse cx={x0 + objW / 2} cy={objTop + OBJ_H + 1} rx={objW / 2} ry={4} fill="#3A2712" opacity={0.14} filter={`url(#soft-${uid})`} />
            <rect x={x0} y={objTop} width={objW} height={OBJ_H} rx={8} fill={`url(#obj-${uid})`} stroke="rgba(0,0,0,0.16)" strokeWidth={1} />
            <rect x={x0 + 1.5} y={objTop + 2} width={objW - 3} height={5} rx={3} fill="#FFFFFF" opacity={0.32} />
            <text x={x0 + Math.min(objW / 2, 18)} y={objTop + OBJ_H / 2 + 6} textAnchor="middle" fontSize={17}>
              {object.icon}
            </text>
            {showZeroHero ? <line x1={x0} x2={x0} y1={objTop + OBJ_H} y2={rulerTop} stroke={BRASS.lo} strokeWidth={1.2} opacity={0.6} /> : null}
          </g>
        ) : null}

        {/* ── Tap targets ABOVE the clean ruler (Start-at-Zero interaction) ── */}
        {taps ? (
          <g>
            {taps.includeEdge ? (
              <g
                style={{ cursor: "pointer" }}
                onClick={() => taps.onPick("edge")}
                onMouseEnter={() => setHover("edge")}
                onMouseLeave={() => setHover(null)}
              >
                {/* the physical left END of the ruler — a common wrong start */}
                <rect
                  x={bodyX - 5}
                  y={rulerTop + 8}
                  width={13}
                  height={RULER_H - 22}
                  rx={4}
                  fill={taps.wrongValue === "edge" ? "#FCE0E0" : hover === "edge" ? GOLD : "rgba(184,134,11,0.16)"}
                  stroke={taps.wrongValue === "edge" ? "#C0564E" : hover === "edge" ? BRASS.lo : "#C7A15A"}
                  strokeWidth={hover === "edge" ? 2.2 : 1.4}
                />
                <text x={bodyX + 1.5} y={rulerTop + RULER_H / 2 + 2} textAnchor="middle" fontSize={12} fontWeight={800} fill={taps.wrongValue === "edge" ? "#C0564E" : "#8A6A2E"}>
                  ↤
                </text>
              </g>
            ) : null}
            {taps.marks.map((cm) => (
              <TapDot
                key={cm}
                cx={xForCm(cm)}
                cy={tapCy}
                label={String(cm)}
                value={cm}
                wrong={taps.wrongValue === cm}
                hovered={hover === cm}
                onHover={setHover}
                onPick={taps.onPick}
                rulerTop={rulerTop}
                uid={uid}
              />
            ))}
          </g>
        ) : null}
      </svg>
    </div>
  );
}

/** A small glowing tap target that floats above the ruler with a fine stem to a mark. */
function TapDot({
  cx,
  cy,
  label,
  value,
  small,
  wrong,
  hovered,
  onHover,
  onPick,
  rulerTop,
  uid,
}: {
  cx: number;
  cy: number;
  label: string;
  value: number | "edge";
  small?: boolean;
  wrong: boolean;
  hovered: boolean;
  onHover: (v: number | "edge" | null) => void;
  onPick: (v: number | "edge") => void;
  rulerTop: number;
  uid: string;
}) {
  const r = small ? 11 : 13;
  return (
    <g
      style={{ cursor: "pointer" }}
      onClick={() => onPick(value)}
      onMouseEnter={() => onHover(value)}
      onMouseLeave={() => onHover(null)}
    >
      {/* fine stem from dot down to the mark */}
      <line x1={cx} x2={cx} y1={cy + r} y2={rulerTop} stroke={BRASS.lo} strokeWidth={1} opacity={hovered ? 0.7 : 0.32} />
      {/* soft gold halo, gently pulsing */}
      <circle cx={cx} cy={cy} r={r + (hovered ? 8 : 5)} fill={GOLD} filter={`url(#soft-${uid})`} opacity={hovered ? 0.9 : 0.5}>
        <animate attributeName="opacity" values={hovered ? "0.7;1;0.7" : "0.35;0.6;0.35"} dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={wrong ? "#FCE0E0" : "#FFFDF7"}
        stroke={wrong ? "#C0564E" : hovered ? BRASS.lo : "#C7A15A"}
        strokeWidth={hovered ? 2.4 : 1.8}
      />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={small ? 11 : 12} fontWeight={800} fill={wrong ? "#C0564E" : MARK}>
        {label}
      </text>
    </g>
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
  const [wrongValue, setWrongValue] = useState<number | "edge" | null>(null);
  const marks = task.tickOptions ?? [0, 1, 2];
  const handle = (value: number | "edge") => {
    if (value === task.correctTick) {
      onCorrect();
    } else {
      setWrongValue(value);
      onWrong();
    }
  };
  return (
    <Shell badge={task.badgeLabel ?? "Start at Zero"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
        <RulerWithObject
          rulerCm={task.rulerCm}
          object={task.object}
          taps={{ marks, includeEdge: task.includeEdgeOption, wrongValue, onPick: handle }}
        />
        <p className="mt-2 text-center text-[12px] font-bold uppercase tracking-[0.14em] text-[#a98b52]">Tap where we start measuring</p>
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
