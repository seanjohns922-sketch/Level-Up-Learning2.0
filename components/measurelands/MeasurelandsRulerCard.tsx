"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { MeasurelandsObjectArt } from "@/components/measurelands/MeasurelandsObjectArt";
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
  "🖌️": ["#9FB4D0", "#5F7CA8"],
  "🪥": ["#8FD0C4", "#4FA89A"],
  "✂️": ["#CBD0D8", "#9AA1AC"],
  "🪶": ["#A9C7D6", "#7BA2B5"],
  "🧽": ["#E7D57A", "#C9B24E"],
};

const TIMBER = { top: "#EBCFA2", mid: "#DCB77C", bot: "#C79A57", edge: "#A67B3C" };
const MARK = "#3B2A14"; // engraved dark-brown markings
const BRASS = { lo: "#B8860B", hi: "#F0D888", mid: "#D9B25A" };
const GOLD = "rgba(226,178,58,0.55)"; // Measurelands interaction gold
const ZERO_RED = "#C81E1E"; // the "start at 0" hero colour

function xForCm(cm: number) {
  return PAD + cm * CM_PX;
}

type ObjModel = { label: string; icon: string; lengthCm: number; startCm?: number };
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
  precision,
}: {
  rulerCm: number;
  object?: ObjModel;
  showZeroHero?: boolean;
  taps?: Taps;
  /** Level 4: draw millimetre graduations with a longer 5 mm mark. */
  precision?: boolean;
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

  // ── Level 4 millimetre graduations: 9 fine ticks between each cm, with a
  // longer mark at the 5 mm midpoint so half-centimetre readings are legible. ──
  const minorMarks = [];
  if (precision) {
    for (let cm = 0; cm < rulerCm; cm += 1) {
      for (let k = 1; k <= 9; k += 1) {
        if (k === 5) continue; // the 5 mm mark is drawn longer, below
        const x = xForCm(cm + k / 10);
        minorMarks.push(
          <line
            key={`mm-${cm}-${k}`}
            x1={x}
            x2={x}
            y1={rulerTop + 1}
            y2={rulerTop + 6}
            stroke={MARK}
            strokeWidth={0.7}
            strokeLinecap="round"
            opacity={0.6}
          />,
        );
      }
      // the longer 5 mm (half-centimetre) mark
      const xh = xForCm(cm + 0.5);
      minorMarks.push(
        <line
          key={`half-${cm}`}
          x1={xh}
          x2={xh}
          y1={rulerTop + 1}
          y2={rulerTop + 10}
          stroke={MARK}
          strokeWidth={1}
          strokeLinecap="round"
          opacity={0.8}
        />,
      );
    }
  }

  const x0 = xForCm(0);
  const objX = xForCm(object?.startCm ?? 0);
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

        {minorMarks}
        {marks}

        {/* ── ZERO marker — red so the "start at 0" hero stands out ── */}
        <g>
          <rect x={x0 - 2} y={rulerTop} width={4} height={24} rx={2} fill={ZERO_RED} stroke="#8E1111" strokeWidth={0.5} />
          <path d={`M ${x0 - 5} ${rulerTop - 1} L ${x0 + 5} ${rulerTop - 1} L ${x0} ${rulerTop + 6} Z`} fill={ZERO_RED} />
          <text x={x0} y={rulerTop + 40} textAnchor="middle" fontSize={13} fontWeight={900} fill={ZERO_RED}>
            0
          </text>
          {/* zero glows gold when its tap target is hovered */}
          {hover === 0 ? <rect x={x0 - 4} y={rulerTop - 3} width={8} height={28} rx={4} fill={GOLD} filter={`url(#soft-${uid})`} /> : null}
        </g>

        {/* ── Object resting on the ruler, left edge on the selected start mark ── */}
        {object ? (
          <g>
            <ellipse cx={objX + objW / 2} cy={objTop + OBJ_H + 1} rx={objW / 2} ry={4} fill="#3A2712" opacity={0.14} filter={`url(#soft-${uid})`} />
            <rect x={objX} y={objTop} width={objW} height={OBJ_H} rx={8} fill={`url(#obj-${uid})`} stroke="rgba(0,0,0,0.16)" strokeWidth={1} />
            <rect x={objX + 1.5} y={objTop + 2} width={objW - 3} height={5} rx={3} fill="#FFFFFF" opacity={0.32} />
            <text x={objX + Math.min(objW / 2, 18)} y={objTop + OBJ_H / 2 + 6} textAnchor="middle" fontSize={17}>
              {object.icon}
            </text>
            {showZeroHero ? <line x1={objX} x2={objX} y1={objTop + OBJ_H} y2={rulerTop} stroke={BRASS.lo} strokeWidth={1.2} opacity={0.6} /> : null}
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
  const steps: Array<{ n: string; text: React.ReactNode }> = task.precision
    ? [
        { n: "1", text: <>Line your object up with the <span className="font-black text-[#C81E1E]">red 0</span> mark, just like before.</> },
        { n: "2", text: <>Look at the <span className="font-black text-[#5b21b6]">small marks</span> between the numbers — the longer one is the <span className="font-black">half</span>.</> },
        { n: "3", text: <>If the end lands on that middle mark, read it as a <span className="font-black">.5</span> — like <span className="font-black">7.5&nbsp;cm</span>.</> },
      ]
    : [
        { n: "1", text: <>Line your object up with the <span className="font-black text-[#C81E1E]">red 0</span> mark.</> },
        { n: "2", text: <>Count the centimetres along to the other end of the object.</> },
        { n: "3", text: <>The last number you reach is how many centimetres long it is.</> },
      ];
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
        <RulerWithObject rulerCm={task.rulerCm} object={task.object} showZeroHero precision={task.precision} />
      </div>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">{task.precision ? "Read between the marks" : "How to use your ruler"}</span>
          <span className="rounded-full bg-[rgba(200,30,30,0.1)] px-2 py-0.5 text-[11px] font-black text-[#C81E1E]">Always start at 0</span>
        </div>
        <ul className="space-y-2.5">
          {steps.map((s) => (
            <li key={s.n} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C81E1E] text-sm font-black text-white shadow-sm">
                {s.n}
              </span>
              <span className="text-[17px] font-bold leading-snug text-[#2c1c07]">{s.text}</span>
            </li>
          ))}
        </ul>
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
  const detectiveOptions = task.detectiveOptions ?? [];
  const isDetective = detectiveOptions.length > 0;
  return (
    <Shell badge={task.badgeLabel ?? "Measure the Object"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
        <RulerWithObject rulerCm={task.rulerCm} object={task.object} showZeroHero precision={task.precision} />
        {typeof task.displayedMeasurement === "number" ? (
          <div className="mt-3 rounded-[18px] border border-[rgba(192,86,78,0.28)] bg-[rgba(252,224,224,0.5)] px-4 py-2 text-center text-lg font-black text-[#7c2d12]">
            Professor Gauge wrote: {task.displayedMeasurement} cm
          </div>
        ) : null}
      </div>
      <div className={`grid gap-3 ${isDetective ? (detectiveOptions.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3") : "grid-cols-3"}`}>
        {isDetective
          ? detectiveOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => (option === task.correctDetectiveAnswer ? onCorrect() : onWrong())}
                className="relative flex min-h-[76px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-4 text-center text-lg font-black leading-tight text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <span className="absolute right-2 top-2 z-10">
                  <OptionReadAloudButton text={option} />
                </span>
                {option}
              </button>
            ))
          : null}
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
  const differenceOptions = task.differenceOptions ?? [];
  const isDifferenceQuestion = differenceOptions.length > 0;
  return (
    <Shell badge={task.badgeLabel ?? "Which Is Longer?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-1 gap-3">
        {objects.map((obj) => (
          <div
            key={obj.label}
            role={isDifferenceQuestion ? undefined : "button"}
            tabIndex={isDifferenceQuestion ? undefined : 0}
            onClick={() => {
              if (!isDifferenceQuestion) {
                obj.label === task.correctLabel ? onCorrect() : onWrong();
              }
            }}
            onKeyDown={(event) => {
              if (!isDifferenceQuestion && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                obj.label === task.correctLabel ? onCorrect() : onWrong();
              }
            }}
            className={`rounded-[26px] border-2 border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] p-3 text-left ${
              isDifferenceQuestion ? "" : "cursor-pointer transition hover:-translate-y-0.5 active:scale-[0.99]"
            }`}
          >
            <div className="mb-1 flex items-center justify-between px-2">
              <span className="text-lg font-black text-[#2c1c07]">
                {obj.icon} {obj.label}
              </span>
              <span className="rounded-full bg-[rgba(91,33,182,0.1)] px-3 py-0.5 text-sm font-black text-[#5b21b6]">{obj.lengthCm} cm</span>
            </div>
            <RulerWithObject rulerCm={task.rulerCm} object={obj} precision={task.precision} />
          </div>
        ))}
      </div>
      {isDifferenceQuestion ? (
        <div className="grid grid-cols-3 gap-3">
          {differenceOptions.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => (value === task.correctDifference ? onCorrect() : onWrong())}
              className="relative flex min-h-[76px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] sm:text-3xl"
            >
              <span className="absolute right-2 top-2 z-10">
                <OptionReadAloudButton text={`${value} centimetres`} />
              </span>
              {value} cm
            </button>
          ))}
        </div>
      ) : null}
    </Shell>
  );
}

/* ── L4 W1 L2 — Which Ruler Is Correct?: the same object on several rulers ── */
function WhichRulerScene({ task, onCorrect, onWrong }: { task: RulerTask; onCorrect: () => void; onWrong: () => void }) {
  const options = task.rulerOptions ?? [];
  const [wrongId, setWrongId] = useState<string | null>(null);
  const object = task.object;
  return (
    <Shell badge={task.badgeLabel ?? "Which Ruler Is Correct?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-1 gap-2.5">
        {options.map((opt) => {
          const picked = wrongId === opt.id;
          return (
            <div
              key={opt.id}
              role="button"
              tabIndex={0}
              onClick={() => (opt.correct ? onCorrect() : (setWrongId(opt.id), onWrong()))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  opt.correct ? onCorrect() : (setWrongId(opt.id), onWrong());
                }
              }}
              className={`cursor-pointer rounded-[22px] border-2 p-2.5 transition hover:-translate-y-0.5 active:scale-[0.99] ${
                picked ? "border-[#c0564e] bg-[rgba(252,224,224,0.6)]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"
              }`}
            >
              <div className="mb-0.5 flex items-center justify-between px-1">
                <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-[#a98b52]">Reads</span>
                <span className="rounded-full bg-[rgba(91,33,182,0.1)] px-3 py-0.5 text-sm font-black text-[#5b21b6]">{opt.claim} cm</span>
              </div>
              <RulerWithObject
                rulerCm={task.rulerCm}
                object={object ? { ...object, startCm: opt.startCm } : undefined}
                precision={task.precision}
              />
            </div>
          );
        })}
      </div>
      <p className="text-center text-[12px] font-bold uppercase tracking-[0.14em] text-[#a98b52]">Tap the ruler that is measured correctly</p>
    </Shell>
  );
}

/* ── L4 W1 L3 — Order the Measurements: tap shortest → longest ── */
function OrderScene({ task, onCorrect, onWrong }: { task: RulerTask; onCorrect: () => void; onWrong: () => void }) {
  const objects = task.orderObjects ?? [];
  const target = [...objects].sort((a, b) => a.lengthCm - b.lengthCm).map((o) => o.label);
  const [picked, setPicked] = useState<string[]>([]);
  const [bad, setBad] = useState(false);

  const handle = (label: string) => {
    if (picked.includes(label)) return;
    const next = [...picked, label];
    const idx = next.length - 1;
    if (target[idx] !== label) {
      setBad(true);
      onWrong();
      setTimeout(() => { setPicked([]); setBad(false); }, 700);
      return;
    }
    setPicked(next);
    if (next.length === objects.length) onCorrect();
  };

  return (
    <Shell badge={task.badgeLabel ?? "Order the Measurements"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="flex items-center justify-between px-1 text-[12px] font-black uppercase tracking-[0.14em] text-[#a98b52]">
        <span>◄ Shortest</span>
        <span>Longest ►</span>
      </div>
      <div className="grid grid-cols-1 gap-2.5">
        {objects.map((obj) => {
          const order = picked.indexOf(obj.label);
          const done = order >= 0;
          return (
            <button
              key={obj.label}
              type="button"
              onClick={() => handle(obj.label)}
              className={`relative flex items-center justify-between rounded-[22px] border-2 px-4 py-3 text-left transition active:scale-[0.99] ${
                done
                  ? "border-[#5b21b6] bg-[rgba(91,33,182,0.08)]"
                  : bad
                  ? "border-[#c0564e] bg-[rgba(252,224,224,0.4)]"
                  : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)] hover:-translate-y-0.5"
              }`}
            >
              <span className="flex items-center gap-2 text-xl font-black text-[#2c1c07]">
                <span className="text-2xl">{obj.icon}</span> {obj.label}
              </span>
              <span className="flex items-center gap-2">
                <span className="rounded-full bg-[rgba(91,33,182,0.1)] px-3 py-0.5 text-base font-black text-[#5b21b6]">{obj.lengthCm} cm</span>
                {done ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#5b21b6] text-sm font-black text-white">{order + 1}</span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-center text-[12px] font-bold uppercase tracking-[0.14em] text-[#a98b52]">Use the measurements — tap from shortest to longest</p>
    </Shell>
  );
}

/* ── L4 W1 L3 — Measurement Detective: tap the reading that is wrong ── */
function SpotWrongScene({ task, onCorrect, onWrong }: { task: RulerTask; onCorrect: () => void; onWrong: () => void }) {
  const objects = task.claimObjects ?? [];
  const [wrongPick, setWrongPick] = useState<string | null>(null);
  return (
    <Shell badge={task.badgeLabel ?? "Measurement Detective"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-1 gap-2.5">
        {objects.map((obj) => {
          const picked = wrongPick === obj.label;
          return (
            <div
              key={obj.label}
              role="button"
              tabIndex={0}
              onClick={() => (obj.isWrong ? onCorrect() : (setWrongPick(obj.label), onWrong()))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  obj.isWrong ? onCorrect() : (setWrongPick(obj.label), onWrong());
                }
              }}
              className={`cursor-pointer rounded-[22px] border-2 p-2.5 transition hover:-translate-y-0.5 active:scale-[0.99] ${
                picked ? "border-[#c0564e] bg-[rgba(252,224,224,0.6)]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"
              }`}
            >
              <div className="mb-0.5 flex items-center justify-between px-1">
                <span className="text-lg font-black text-[#2c1c07]">{obj.icon} {obj.label}</span>
                <span className="rounded-full bg-[rgba(200,30,30,0.1)] px-3 py-0.5 text-sm font-black text-[#7c2d12]">Gauge: {obj.claim} cm</span>
              </div>
              <RulerWithObject rulerCm={task.rulerCm} object={{ label: obj.label, icon: obj.icon, lengthCm: obj.lengthCm }} precision={task.precision} />
            </div>
          );
        })}
      </div>
      <p className="text-center text-[12px] font-bold uppercase tracking-[0.14em] text-[#a98b52]">Tap the measurement that doesn&apos;t match its ruler</p>
    </Shell>
  );
}

export function MeasurelandsRulerCard({ task, onCorrect, onWrong }: { task: RulerTask; onCorrect: () => void; onWrong: () => void }) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "startZero") return <StartZeroScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "compare") return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "whichRuler") return <WhichRulerScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "order") return <OrderScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "spotWrong") return <SpotWrongScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <MeasureScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}

/* ═══════════════════════════════════════════════════════════════════════════
 * Measurelands METRE STICK (Week 2 "Metre Mountain") — an extension of the ruler
 * visual language (same timber, brass, engraved marks), NOT a second system.
 * A metre stick with brass end caps; in full mode it shows 0–100 with "1 metre".
 * ═══════════════════════════════════════════════════════════════════════════ */
type UnitTask = Extract<PracticeTask, { kind: "unitChoice" }>;

function MetreStick({ full }: { full?: boolean }) {
  const [uid] = useState(() => Math.random().toString(36).slice(2, 9));
  const W = 600;
  const capW = 15;
  const bodyX = capW + 4;
  const bodyR = W - capW - 4;
  const bodyW = bodyR - bodyX;
  const topY = full ? 30 : 16;
  const bodyH = 34;
  const H = topY + bodyH + (full ? 26 : 12);

  const marks = [];
  if (full) {
    for (let i = 0; i <= 10; i += 1) {
      const x = bodyX + (i / 10) * bodyW;
      const isZero = i === 0;
      const major = i % 5 === 0;
      marks.push(
        <g key={i}>
          <line x1={x} x2={x} y1={topY + 1} y2={topY + (major ? 18 : 11)} stroke={isZero ? ZERO_RED : MARK} strokeWidth={major ? 1.8 : 1.1} strokeLinecap="round" />
          <text x={x} y={topY + bodyH + 14} textAnchor="middle" fontSize={11} fontWeight={isZero ? 900 : major ? 800 : 600} fill={isZero ? ZERO_RED : MARK}>
            {i * 10}
          </text>
        </g>,
      );
    }
  }

  return (
    <div className="mx-auto w-full" style={{ maxWidth: full ? 560 : 420 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="A one metre stick">
        <defs>
          <linearGradient id={`ms-timber-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={TIMBER.top} />
            <stop offset="0.45" stopColor={TIMBER.mid} />
            <stop offset="1" stopColor={TIMBER.bot} />
          </linearGradient>
          <linearGradient id={`ms-brass-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={BRASS.hi} />
            <stop offset="0.5" stopColor={BRASS.mid} />
            <stop offset="1" stopColor={BRASS.lo} />
          </linearGradient>
        </defs>
        {/* timber body */}
        <rect x={bodyX} y={topY} width={bodyW} height={bodyH} fill={`url(#ms-timber-${uid})`} stroke={TIMBER.edge} strokeWidth={1.2} rx={3} />
        <rect x={bodyX + 1.5} y={topY + 1.5} width={bodyW - 3} height={3} rx={2} fill="#FFFFFF" opacity={0.32} />
        {/* brass end caps */}
        <rect x={4} y={topY - 3} width={capW} height={bodyH + 6} rx={4} fill={`url(#ms-brass-${uid})`} stroke={BRASS.lo} strokeWidth={0.6} />
        <rect x={W - capW - 4} y={topY - 3} width={capW} height={bodyH + 6} rx={4} fill={`url(#ms-brass-${uid})`} stroke={BRASS.lo} strokeWidth={0.6} />
        {marks}
        {/* centre plaque */}
        <g>
          <rect x={W / 2 - 52} y={full ? 4 : topY + 9} width={104} height={full ? 20 : 16} rx={8} fill={`url(#ms-brass-${uid})`} stroke={BRASS.lo} strokeWidth={0.6} />
          <text x={W / 2} y={full ? 18 : topY + 20} textAnchor="middle" fontSize={full ? 13 : 11} fontWeight={900} fill="#4A3208">
            1 metre
          </text>
        </g>
      </svg>
    </div>
  );
}

/* The big familiar object being judged. */
function ObjectHero({ object }: { object: { label: string; icon: string } }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] px-6 py-5">
      <div className="flex h-[124px] w-[124px] items-center justify-center rounded-full bg-[rgba(214,184,108,0.16)] ring-1 ring-[rgba(214,184,108,0.45)] shadow-[inset_0_2px_10px_rgba(180,120,20,0.08)]">
        <MeasurelandsObjectArt name={object.label} emoji={object.icon} size={88} />
      </div>
      <span className="rounded-full bg-[rgba(91,33,182,0.08)] px-4 py-1.5 text-xl font-black text-[#2c1c07]">{object.label}</span>
    </div>
  );
}

function toolGlyph(option: string) {
  // Test cm first — "Centimetres" also contains the substring "metre".
  if (/centi|\bcm\b|ruler/i.test(option)) return "📏";
  if (/metre|\bm\b/i.test(option)) return "📐";
  return null;
}

function UnitChoices({
  options,
  correct,
  cols,
  withTool,
  onCorrect,
  onWrong,
}: {
  options: string[];
  correct?: string;
  cols: string;
  withTool?: boolean;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div className={`grid gap-3 ${cols}`}>
      {options.map((option) => {
        const glyph = withTool ? toolGlyph(option) : null;
        return (
          <button
            key={option}
            type="button"
            onClick={() => (option === correct ? onCorrect() : onWrong())}
            className="relative flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-4 text-center text-lg font-black leading-tight text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-2 top-2 z-10">
              <OptionReadAloudButton text={option} />
            </span>
            {glyph ? <span className="text-3xl leading-none" aria-hidden>{glyph}</span> : null}
            <span>{option}</span>
          </button>
        );
      })}
    </div>
  );
}

function MetreIntroScene({ task, onCorrect }: { task: UnitTask; onCorrect: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[26px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
        <MetreStick full />
        <p className="mt-2 text-center text-lg font-black text-[#2c1c07]">
          100 centimetres <span className="text-[#a98b52]">=</span> <span className="text-[#C81E1E]">1 metre</span>
        </p>
      </div>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
        <div className="mb-2 text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">Which unit do I use?</div>
        <ul className="space-y-2.5">
          <li className="flex items-start gap-3">
            <span className="text-2xl leading-none" aria-hidden>📏</span>
            <span className="text-[17px] font-bold leading-snug text-[#2c1c07]">Use <b>centimetres</b> for shorter things — a pencil, a book.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-2xl leading-none" aria-hidden>📐</span>
            <span className="text-[17px] font-bold leading-snug text-[#2c1c07]">Use <b>metres</b> for longer things — a door, a whiteboard.</span>
          </li>
        </ul>
      </div>
      <button
        type="button"
        onClick={onCorrect}
        className="mx-auto flex min-h-[60px] items-center justify-center gap-2 rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
      >
        Let&apos;s choose! →
      </button>
    </Shell>
  );
}

/* ── W2 L2 Activity B — Sort objects into the cm / m bins (tap-to-sort) ── */
function UnitSortScene({ task, onCorrect, onWrong }: { task: UnitTask; onCorrect: () => void; onWrong: () => void }) {
  const items = task.items ?? [];
  const [placed, setPlaced] = useState<Record<string, "cm" | "m">>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const unplaced = items.filter((it) => !(it.label in placed));

  const pickBin = (bin: "cm" | "m") => {
    if (!selected) return;
    const item = items.find((i) => i.label === selected);
    if (!item) return;
    if (item.unit === bin) {
      const next = { ...placed, [selected]: bin };
      setPlaced(next);
      setSelected(null);
      setWrong(null);
      if (Object.keys(next).length === items.length) onCorrect();
    } else {
      setWrong(selected);
      setSelected(null);
      onWrong();
      window.setTimeout(() => setWrong(null), 600);
    }
  };

  const Bin = ({ bin, glyph, title }: { bin: "cm" | "m"; glyph: string; title: string }) => {
    const chips = items.filter((it) => placed[it.label] === bin);
    return (
      <button
        type="button"
        onClick={() => pickBin(bin)}
        className={`flex min-h-[150px] flex-col gap-2 rounded-[24px] border-2 p-3 text-left transition ${
          selected ? "border-[#b4781e] bg-[rgba(214,184,108,0.14)]" : "border-[rgba(214,184,108,0.55)] bg-[rgba(255,252,245,0.96)]"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{glyph}</span>
          <span className="text-sm font-black uppercase tracking-[0.12em] text-[#5b21b6]">{title}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((it) => (
            <span key={it.label} className="flex items-center gap-1 rounded-full border border-[rgba(15,118,110,0.4)] bg-[rgba(15,118,110,0.12)] px-3 py-1 text-sm font-black text-[#0f766e]">
              <span aria-hidden>{it.icon}</span> {it.label}
            </span>
          ))}
        </div>
      </button>
    );
  };

  return (
    <Shell badge={task.badgeLabel ?? "Sort the Objects"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-2 gap-3">
        <Bin bin="cm" glyph="📏" title="Centimetres" />
        <Bin bin="m" glyph="📐" title="Metres" />
      </div>
      <div className="rounded-[22px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-3">
        <p className="mb-2 text-center text-[12px] font-bold uppercase tracking-[0.14em] text-[#a98b52]">
          {unplaced.length ? "Tap an object, then tap its bin" : "All sorted!"}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {unplaced.map((it) => (
            <button
              key={it.label}
              type="button"
              onClick={() => setSelected((cur) => (cur === it.label ? null : it.label))}
              className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-2 text-base font-black text-[#2c1c07] transition ${
                wrong === it.label
                  ? "border-[#C0564E] bg-[#FCE0E0]"
                  : selected === it.label
                    ? "-translate-y-0.5 border-[#b4781e] bg-[rgba(214,184,108,0.3)] shadow"
                    : "border-[rgba(214,184,108,0.6)] bg-[#fffaf0]"
              }`}
            >
              <span className="text-xl" aria-hidden>{it.icon}</span> {it.label}
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* ── W2 L2 Activity C — Spot Professor Gauge's wrong unit ── */
function SpotMistakeScene({ task, onCorrect, onWrong }: { task: UnitTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <Shell badge={task.badgeLabel ?? "Professor Gauge's Mistake"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.object ? <ObjectHero object={task.object} /> : null}
      <div className="flex items-start gap-3 rounded-[24px] border-2 border-[rgba(124,58,237,0.28)] bg-[rgba(124,58,237,0.06)] px-5 py-4">
        <span className="text-3xl leading-none" aria-hidden>🧑‍🏫</span>
        <p className="text-xl font-black italic leading-snug text-[#2c1c07]">&ldquo;{task.statement}&rdquo;</p>
      </div>
      <UnitChoices
        options={task.options ?? []}
        correct={task.correctOption}
        cols="grid-cols-1 sm:grid-cols-2"
        onCorrect={onCorrect}
        onWrong={onWrong}
      />
    </Shell>
  );
}

export function MeasurelandsMetreCard({ task, onCorrect, onWrong }: { task: UnitTask; onCorrect: () => void; onWrong: () => void }) {
  if (task.scene === "intro") return <MetreIntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "sort") return <UnitSortScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "spotMistake") return <SpotMistakeScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  const options = task.options ?? [];
  const withGlyph = task.scene === "whichTool" || task.scene === "whichUnit";
  const showReference = task.scene === "aboutMetre" || task.scene === "compareMetre";
  const cols = task.scene === "compareMetre" || task.scene === "bestEstimate" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2";
  return (
    <Shell badge={task.badgeLabel ?? "Metre Mountain"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.object ? <ObjectHero object={task.object} /> : null}
      {showReference ? (
        <div className="rounded-[22px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] px-4 py-3">
          <MetreStick />
          <p className="mt-1 text-center text-[12px] font-bold uppercase tracking-[0.14em] text-[#a98b52]">One metre to compare against</p>
        </div>
      ) : null}
      <UnitChoices options={options} correct={task.correctOption} cols={cols} withTool={withGlyph} onCorrect={onCorrect} onWrong={onWrong} />
    </Shell>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
 * W2 L3 "Estimate then Measure" — the full cycle. Estimation is rewarded by
 * CLOSENESS, not right/wrong: reuses the ruler / metre stick for the reveal.
 * ═══════════════════════════════════════════════════════════════════════════ */
type EstimateTask = Extract<PracticeTask, { kind: "estimateMeasure" }>;

function estimateMedal(diff: number, unit: "cm" | "m") {
  if (diff === 0) return { emoji: "🎯", title: "Exact!", sub: "Spot on — you nailed it!" };
  if (diff === 1) return { emoji: "👏", title: "Very close!", sub: `Only 1 ${unit} away!` };
  if (diff <= (unit === "cm" ? 3 : 2)) return { emoji: "👍", title: "Close!", sub: `Just ${diff} ${unit} away.` };
  return { emoji: "🙂", title: "Good estimate!", sub: `${diff} ${unit} away — picture it next time.` };
}

function EstimateIntroScene({ task, onCorrect }: { task: EstimateTask; onCorrect: () => void }) {
  const steps = [
    { icon: "🧐", text: "Look at the object." },
    { icon: "💭", text: "Estimate — a sensible guess, not a random one." },
    { icon: "📏", text: "Measure with the ruler or metre stick." },
    { icon: "✅", text: "Compare — how close were you?" },
  ];
  return (
    <Shell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.45)] bg-[rgba(255,250,240,0.96)] p-4">
        <div className="mb-2 text-[12px] font-black uppercase tracking-[0.16em] text-[#a98b52]">Estimate first, measure second</div>
        <ul className="space-y-2.5">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="text-2xl leading-none" aria-hidden>{s.icon}</span>
              <span className="text-[17px] font-bold leading-snug text-[#2c1c07]">{s.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={onCorrect}
        className="mx-auto flex min-h-[60px] items-center justify-center gap-2 rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
      >
        Start estimating! →
      </button>
    </Shell>
  );
}

function EstimateFlowScene({ task, onCorrect, onWrong }: { task: EstimateTask; onCorrect: () => void; onWrong: () => void }) {
  const unit = task.unit ?? "cm";
  const object = task.object ?? { label: "object", icon: "📦", length: 10 };
  const unitWord = unit === "cm" ? "Centimetres" : "Metres";
  const [phase, setPhase] = useState<"unit" | "estimate" | "reveal">(task.chooseUnitFirst ? "unit" : "estimate");
  const [estimate, setEstimate] = useState<number | null>(null);

  const diff = estimate === null ? 0 : Math.abs(estimate - object.length);
  const medal = estimateMedal(diff, unit);

  return (
    <Shell badge={task.badgeLabel ?? "Estimate then Measure"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <ObjectHero object={{ label: object.label, icon: object.icon }} />

      {phase === "unit" ? (
        <>
          <p className="text-center text-base font-black text-[#5b21b6]">Step 1 — which unit would you use?</p>
          <UnitChoices
            options={["Centimetres", "Metres"]}
            correct={unitWord}
            cols="grid-cols-2"
            withTool
            onCorrect={() => setPhase("estimate")}
            onWrong={onWrong}
          />
        </>
      ) : null}

      {phase === "estimate" ? (
        <>
          <p className="text-center text-base font-black text-[#5b21b6]">How long do you think it is?</p>
          <div className="grid grid-cols-3 gap-3">
            {(task.estimateOptions ?? []).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setEstimate(value);
                  setPhase("reveal");
                }}
                className="flex min-h-[76px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] sm:text-3xl"
              >
                {value} {unit}
              </button>
            ))}
          </div>
        </>
      ) : null}

      {phase === "reveal" ? (
        <>
          <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,252,245,0.96)] p-4">
            {unit === "cm" ? (
              <RulerWithObject rulerCm={Math.min(20, object.length + 3)} object={{ label: object.label, icon: object.icon, lengthCm: object.length }} showZeroHero />
            ) : (
              <MetreStick full />
            )}
          </div>
          <div className="flex flex-col items-center gap-1 rounded-[24px] border-2 border-[rgba(15,118,110,0.35)] bg-[rgba(15,118,110,0.08)] px-5 py-4 text-center">
            <div className="text-4xl leading-none" aria-hidden>{medal.emoji}</div>
            <div className="text-xl font-black text-[#0f766e]">{medal.title}</div>
            <div className="text-base font-bold text-[#2c1c07]">
              You guessed <b>{estimate} {unit}</b> — it&apos;s actually <b>{object.length} {unit}</b>. {medal.sub}
            </div>
          </div>
          <button
            type="button"
            onClick={onCorrect}
            className="mx-auto flex min-h-[56px] items-center justify-center gap-2 rounded-[24px] border-2 border-[rgba(180,120,20,0.55)] bg-[#fffaf0] px-8 text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Next →
          </button>
        </>
      ) : null}
    </Shell>
  );
}

export function MeasurelandsEstimateCard({ task, onCorrect, onWrong }: { task: EstimateTask; onCorrect: () => void; onWrong: () => void }) {
  if (task.scene === "intro") return <EstimateIntroScene task={task} onCorrect={onCorrect} />;
  return <EstimateFlowScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
