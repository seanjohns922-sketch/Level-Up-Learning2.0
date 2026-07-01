"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Compass, Undo2 } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type MeasurePathTask = Extract<PracticeTask, { kind: "measurePath" }>;

/* ── Illustrated measuring units (no emoji) ──
 * The block is the hero of Year 1 ("measure with blocks"); footstep / star /
 * flower / stone keep the Ground Level informal-unit variety. The kind is
 * inferred from the unit label/emoji so existing data needs no changes. */
type UnitKind = "block" | "footstep" | "star" | "flower" | "stone";

function unitKindFromHints(label?: string, emoji?: string): UnitKind {
  const hint = `${label ?? ""} ${emoji ?? ""}`.toLowerCase();
  if (hint.includes("footstep") || hint.includes("👣")) return "footstep";
  if (hint.includes("star") || hint.includes("⭐")) return "star";
  if (hint.includes("flower") || hint.includes("🌸")) return "flower";
  if (hint.includes("stone") || hint.includes("🪨")) return "stone";
  return "block";
}

function UnitGlyph({ kind, size = 42 }: { kind: UnitKind; size?: number }) {
  if (kind === "footstep") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
        <path d="M16 30c0-8 2-16 8-16s7 7 6 14c-1 6-4 9-8 9s-6-3-6-7Z" fill="#8b6f4e" />
        <ellipse cx="14" cy="38" rx="4" ry="3" fill="#8b6f4e" />
        <ellipse cx="20" cy="40" rx="3" ry="2.4" fill="#8b6f4e" />
        <ellipse cx="26" cy="40" rx="2.6" ry="2.2" fill="#8b6f4e" />
        <ellipse cx="31" cy="38" rx="2.3" ry="2" fill="#8b6f4e" />
      </svg>
    );
  }
  if (kind === "star") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
        <defs>
          <linearGradient id="u-star" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd75e" />
            <stop offset="100%" stopColor="#f5a623" />
          </linearGradient>
        </defs>
        <path d="M24 6l5.3 11.7 12.7 1-9.6 8.5 2.9 12.6L24 33.6 12.7 40.4l2.9-12.6L6 19.3l12.7-1Z" fill="url(#u-star)" stroke="#c97f12" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "flower") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx="24" cy="13" rx="5.5" ry="9" fill="#f9a8d4" transform={`rotate(${a} 24 24)`} />
        ))}
        <circle cx="24" cy="24" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1.4" />
      </svg>
    );
  }
  if (kind === "stone") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
        <path d="M9 28c0-7 7-13 16-13s14 5 14 12-6 9-15 9S9 34 9 28Z" fill="#9ca3af" stroke="#6b7280" strokeWidth="1.5" />
        <path d="M15 24c3-3 8-4 12-3" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  // Hero: premium isometric block.
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id="blk-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7fd3f2" />
          <stop offset="100%" stopColor="#5cb6e0" />
        </linearGradient>
        <linearGradient id="blk-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f93bd" />
          <stop offset="100%" stopColor="#2f7aa0" />
        </linearGradient>
        <linearGradient id="blk-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#54aad6" />
          <stop offset="100%" stopColor="#3f93bd" />
        </linearGradient>
      </defs>
      <path d="M24 7l15 8.5-15 8.5-15-8.5Z" fill="url(#blk-top)" stroke="#2c6a8c" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9 15.5l15 8.5v15l-15-8.5Z" fill="url(#blk-left)" stroke="#2c6a8c" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M39 15.5l-15 8.5v15l15-8.5Z" fill="url(#blk-right)" stroke="#2c6a8c" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M13 17.7l11 6.3" stroke="#bfe8fa" strokeWidth="1.1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/* ── Shared gold/violet Meazurex shell (matches the Compare card) ── */
export function PathShell({
  badge,
  prompt,
  speakText,
  children,
}: {
  badge: string;
  prompt: string;
  speakText?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div
        className="rounded-[30px] border px-5 py-5 shadow-[0_14px_42px_rgba(76,29,149,0.1)]"
        style={{
          borderColor: "rgba(214,184,108,0.38)",
          background:
            "linear-gradient(145deg, rgba(255,248,232,0.98) 0%, rgba(250,243,228,0.98) 52%, rgba(244,232,205,0.96) 100%)",
        }}
      >
        <div
          className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em]"
          style={{ background: "rgba(91,33,182,0.08)", border: "1px solid rgba(167,139,250,0.34)", color: "#5b21b6" }}
        >
          {badge}
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-1 text-2xl font-black leading-tight text-[#2c1c07] sm:text-3xl">{prompt}</div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

// Shared unit width so the object image spans exactly the same length as the rod.
export const UNIT_PX = 40;
const COMPACT_UNIT_PX = 26;

function rodDepth(unitPx: number) {
  return Math.round(unitPx * 0.32);
}

// Audit-driven visible-span ratios for the horizontal Measurelands measuring
// assets. These are based on the actual non-transparent pixel width inside each
// 768px PNG, so the visible object length can be calibrated against the block
// rod instead of assuming every file fills its canvas equally.
const MEASURE_OBJECT_VISIBLE_RATIO: Record<string, number> = {
  "carrot.png": 705 / 768,
  "crayon.png": 512 / 768,
  "cucumber.png": 637 / 768,
  "pencil.png": 725 / 768,
  "plank.png": 759 / 768,
  "snake.png": 732 / 768,
  "vine.png": 751 / 768,
  "worm.png": 742 / 768,
};

function visibleRatioForImage(imageSrc: string) {
  const filename = imageSrc.split("/").pop() ?? "";
  return MEASURE_OBJECT_VISIBLE_RATIO[filename] ?? 1;
}

/* ── A connected MAB-style rod: N unit cubes joined end-to-end ── */
export function BlockRod({ length, unitPx = UNIT_PX }: { length: number; unitPx?: number }) {
  if (length <= 0) return null;
  const u = unitPx;
  const d = rodDepth(u);
  const w = length * u + d;
  const h = u + d;
  const seams = Array.from({ length: length - 1 }, (_, i) => i + 1);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="max-w-full" style={{ height: "auto" }} aria-hidden>
      <defs>
        <linearGradient id="rod-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7fd3f2" />
          <stop offset="100%" stopColor="#54aad6" />
        </linearGradient>
        <linearGradient id="rod-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe8fa" />
          <stop offset="100%" stopColor="#8fd0ef" />
        </linearGradient>
      </defs>
      {/* top face */}
      <path d={`M0 ${d} L${length * u} ${d} L${length * u + d} 0 L${d} 0 Z`} fill="url(#rod-top)" stroke="#2c6a8c" strokeWidth="1.6" strokeLinejoin="round" />
      {/* front face */}
      <rect x="0" y={d} width={length * u} height={u} fill="url(#rod-front)" stroke="#2c6a8c" strokeWidth="1.6" />
      {/* right end cap */}
      <path d={`M${length * u} ${d} L${length * u + d} 0 L${length * u + d} ${u} L${length * u} ${u + d} Z`} fill="#3f93bd" stroke="#2c6a8c" strokeWidth="1.6" strokeLinejoin="round" />
      {/* seams between joined cubes */}
      {seams.map((i) => (
        <g key={i} stroke="#2c6a8c" strokeWidth="1.2" opacity="0.85">
          <line x1={i * u} y1={d} x2={i * u} y2={d + u} />
          <line x1={i * u} y1={d} x2={i * u + d} y2={0} />
        </g>
      ))}
    </svg>
  );
}

/* ── The object being measured, sized to span its block length ── */
export function MeasuredObject({
  imageSrc,
  label,
  length,
  compact = false,
}: {
  imageSrc: string;
  label?: string;
  length: number;
  compact?: boolean;
}) {
  const unitPx = compact ? COMPACT_UNIT_PX : UNIT_PX;
  const depth = rodDepth(unitPx);
  const rodWidth = length * unitPx + depth;
  const visibleRatio = visibleRatioForImage(imageSrc);
  const width = rodWidth / visibleRatio;
  return (
    <div className="mb-1 flex flex-col items-center">
      <div style={{ width }}>
        <img
          src={imageSrc}
          alt={label ?? "Object to measure"}
          className="h-auto w-full object-contain drop-shadow-[0_8px_14px_rgba(76,40,10,0.18)]"
          style={{ maxHeight: compact ? 64 : 108 }}
        />
      </div>
      {label ? (
        <div className="mt-1 text-sm font-black uppercase tracking-[0.14em] text-[#7c4a12]">{label}</div>
      ) : null}
    </div>
  );
}

/* ── Year 2 W4 accuracy arc: a rope of a length WE control, with informal unit
 * blocks laid directly along it (tiling — no gaps/overlaps). The units measure
 * the actual rope, so nothing floats or misaligns.
 *   mode "big"   → big blocks; the rope runs a bit past the last block (the
 *                  leftover part is highlighted — "it doesn't fit exactly").
 *   mode "small" → half-size blocks that tile the rope EXACTLY.
 * ropeBigUnits is the rope length in big units (e.g. 5.5). Small units are half
 * a big unit, so a 5.5-big rope tiles into exactly 11 small units. ── */
const BIG_UNIT = 52;

// Distinct object styles so the drawing matches its label (never "Vine" over a
// rope). Each is a length WE render, so big/small units still tile it exactly.
type ObjStyle = { bg: string; height: number };
const OBJECT_STYLES: Record<string, ObjStyle> = {
  rope: { bg: "linear-gradient(180deg,#d8ad74,#b07f42)", height: 24 },
  ribbon: { bg: "linear-gradient(180deg,#f4a6d2,#d3629f)", height: 20 },
  tape: { bg: "linear-gradient(180deg,#ffe08a,#e6b022)", height: 22 },
  chain: { bg: "repeating-linear-gradient(90deg,#aeb6bf 0 8px,#7f8890 8px 10px,#c7ced6 10px 18px,#7f8890 18px 20px)", height: 22 },
  vine: { bg: "repeating-linear-gradient(90deg,#7cbf6b 0 16px,#5aa049 16px 20px)", height: 20 },
  cord: { bg: "linear-gradient(180deg,#9a86e0,#6d55c9)", height: 22 },
};
function styleFor(label?: string): ObjStyle {
  return OBJECT_STYLES[(label ?? "rope").toLowerCase()] ?? OBJECT_STYLES.rope;
}

function MeasuredRope({ ropeBigUnits, mode, label }: { ropeBigUnits: number; mode: "big" | "small"; label?: string }) {
  const cell = mode === "big" ? BIG_UNIT : BIG_UNIT / 2;
  const count = mode === "big" ? Math.floor(ropeBigUnits) : Math.round(ropeBigUnits * 2);
  const ropeLen = ropeBigUnits * BIG_UNIT;
  const blocksLen = count * cell;
  const leftover = Math.max(0, ropeLen - blocksLen);
  const blockH = Math.round(cell * 0.7);
  const s = styleFor(label);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8, width: ropeLen, maxWidth: "100%" }}>
      {/* the object being measured (styled to match its label) */}
      <div style={{ position: "relative", width: ropeLen, height: s.height }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: s.height / 2, background: s.bg, boxShadow: "inset 0 -3px 4px rgba(0,0,0,0.20)" }} />
        {mode === "big" && leftover > 1 ? (
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: leftover, borderRadius: `0 ${s.height / 2}px ${s.height / 2}px 0`, background: "repeating-linear-gradient(45deg, rgba(232,130,12,0.55) 0 6px, rgba(232,130,12,0.30) 6px 12px)" }} />
        ) : null}
      </div>
      {/* unit blocks tiled along the object */}
      <div style={{ display: "flex", width: ropeLen }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ width: cell, height: blockH, boxSizing: "border-box", border: "2px solid #2c6a8c", borderLeft: i === 0 ? "2px solid #2c6a8c" : "none", background: "linear-gradient(180deg,#7fd3f2,#54aad6)" }} />
        ))}
        {mode === "big" && leftover > 1 ? (
          <div style={{ width: leftover, height: blockH, boxSizing: "border-box", border: "2px dashed rgba(180,84,12,0.7)", background: "rgba(232,130,12,0.14)" }} />
        ) : null}
      </div>
    </div>
  );
}

/* ── Units display: a joined MAB rod for blocks, a glyph row otherwise ── */
function UnitsDisplay({
  length,
  unitLabel,
  unitEmoji,
  highlight = false,
  compact = false,
}: {
  length: number;
  unitLabel?: string;
  unitEmoji?: string;
  highlight?: boolean;
  compact?: boolean;
}) {
  const kind = unitKindFromHints(unitLabel, unitEmoji);
  if (kind === "block") {
    return (
      <div
        className="flex items-center justify-center rounded-[22px] border-2 px-3 py-4"
        style={{
          borderColor: highlight ? "rgba(94,234,212,0.8)" : "rgba(214,184,108,0.45)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,248,232,0.96))",
        }}
      >
        <BlockRod length={length} unitPx={compact ? COMPACT_UNIT_PX : UNIT_PX} />
      </div>
    );
  }
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-1.5 rounded-[22px] border-2 px-3 py-4"
      style={{
        borderColor: highlight ? "rgba(94,234,212,0.8)" : "rgba(214,184,108,0.45)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,248,232,0.96))",
      }}
    >
      {Array.from({ length }).map((_, i) => (
        <span
          key={i}
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#fffaf0] shadow-sm sm:h-14 sm:w-14"
          style={{ border: "1px solid rgba(214,184,108,0.4)" }}
        >
          <UnitGlyph kind={kind} size={40} />
        </span>
      ))}
    </div>
  );
}

function MeasurementText({
  length,
  unitLabel,
}: {
  length: number;
  unitLabel?: string;
}) {
  return (
    <div className="mt-2 text-center text-sm font-black uppercase tracking-[0.14em] text-[#7c4a12]">
      {length} {unitLabel ?? "blocks"}
    </div>
  );
}

/* ── Intro / teaching sequence ── */
function IntroScene({ task, onCorrect }: { task: MeasurePathTask; onCorrect: () => void }) {
  return (
    <PathShell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[30px] border border-[rgba(214,184,108,0.36)] bg-[rgba(255,248,232,0.98)] p-5 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
        <div className="mb-4 flex items-start gap-4 rounded-[26px] border border-[rgba(167,139,250,0.22)] bg-[rgba(109,40,217,0.08)] p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6d28d9,#4c1d95)] text-white shadow-[0_10px_24px_rgba(109,40,217,0.24)]">
            <Compass className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-[#5b21b6]">Meazurex</div>
            <p className="text-base font-semibold leading-relaxed text-[#2c1c07]">
              We can measure things using equal blocks.
            </p>
            <p className="text-base font-semibold leading-relaxed text-[#5f4725]">
              We line them up end-to-end and count the blocks.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {(task.teachingPaths ?? []).map((path, idx) => (
            <div key={idx} className="rounded-[26px] border border-[rgba(214,184,108,0.28)] bg-[rgba(255,252,245,0.92)] p-4">
              {path.objectImageSrc ? (
                <MeasuredObject imageSrc={path.objectImageSrc} label={path.objectLabel} length={path.length} />
              ) : null}
              <UnitsDisplay length={path.length} unitEmoji={path.unitEmoji} />
              <div className="mt-3 text-center text-sm font-bold text-[#5f4725]">{path.caption}</div>
            </div>
          ))}
          {task.betweenItem ? (
            <div className="rounded-[26px] border border-[rgba(214,184,108,0.28)] bg-[rgba(255,252,245,0.92)] p-4">
              <div className="mb-2 text-center text-sm font-black uppercase tracking-[0.14em] text-[#7c4a12]">
                {task.betweenItem.label ?? "Rope"}
              </div>
              <div className="flex justify-center">
                <MeasuredRope ropeBigUnits={task.betweenItem.wholeBlocks + task.betweenItem.overhang} mode="big" label={task.betweenItem.label} />
              </div>
              <div className="mt-3 text-center text-sm font-bold text-[#5f4725]">
                The big blocks don&apos;t fit — there&apos;s a{" "}
                <span className="text-[#b4540c]">bit left over</span>. Smaller blocks can measure it more closely.
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onCorrect}
            className="rounded-full px-6 py-3 text-lg font-black uppercase tracking-[0.12em] text-[#fff8e1] shadow-[0_16px_32px_rgba(180,120,20,0.22)] transition hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, rgba(120,53,15,0.96), rgba(180,120,20,0.96), rgba(214,184,108,0.92))" }}
          >
            Start Measuring
          </button>
        </div>
      </div>
    </PathShell>
  );
}

/* ── Activity A: count the units along the path ── */
function CountScene({ task, onCorrect, onWrong }: { task: MeasurePathTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <PathShell badge={task.badgeLabel ?? "Count the Blocks"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        {task.objectImageSrc ? (
          <MeasuredObject imageSrc={task.objectImageSrc} label={task.objectLabel} length={task.pathLength ?? 0} />
        ) : null}
        <UnitsDisplay length={task.pathLength ?? 0} unitLabel={task.unitLabel} unitEmoji={task.unitEmoji} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === task.correctAnswer ? onCorrect() : onWrong())}
            className="relative flex min-h-[88px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-5xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-3 top-3 z-10">
              <OptionReadAloudButton text={String(value)} />
            </span>
            {value}
          </button>
        ))}
      </div>
    </PathShell>
  );
}

/* ── Activity B: which path is longer? ── */
function CompareScene({ task, onCorrect, onWrong }: { task: MeasurePathTask; onCorrect: () => void; onWrong: () => void }) {
  const paths = task.paths ?? [];
  return (
    <PathShell badge={task.badgeLabel ?? "Which Is Longer?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-4">
        {paths.map((path, idx) => (
          <button
            key={path.id}
            type="button"
            onClick={() => (path.id === task.correctPathId ? onCorrect() : onWrong())}
            className="relative rounded-[26px] border border-transparent text-left transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[rgba(167,139,250,0.25)]"
          >
            <span className="absolute right-3 top-3 z-10">
              <OptionReadAloudButton text={`${path.objectLabel ?? `Path ${idx === 0 ? "A" : "B"}`}, ${path.length} ${path.unitLabel ?? "blocks"}`} />
            </span>
            <div className="mb-1 px-1 text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">
              {path.objectLabel ?? `Path ${idx === 0 ? "A" : "B"}`}
            </div>
            <div className="rounded-[26px] border border-[rgba(214,184,108,0.3)] bg-[rgba(255,252,245,0.9)] p-3">
              {path.objectImageSrc ? (
                <MeasuredObject imageSrc={path.objectImageSrc} length={path.length} />
              ) : null}
              <UnitsDisplay length={path.length} unitLabel={path.unitLabel} unitEmoji={path.unitEmoji} />
              <MeasurementText length={path.length} unitLabel={path.unitLabel} />
            </div>
          </button>
        ))}
      </div>
    </PathShell>
  );
}

function OrderScene({ task, onCorrect, onWrong }: { task: MeasurePathTask; onCorrect: () => void; onWrong: () => void }) {
  const paths = task.paths ?? [];
  const expected = task.correctOrderIds ?? [];
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);

  function handlePick(id: string) {
    if (locked || selectedIds.includes(id)) return;
    const next = [...selectedIds, id];
    setSelectedIds(next);
    if (next.length !== expected.length) return;
    const correct = expected.every((expectedId, idx) => next[idx] === expectedId);
    setLocked(true);
    window.setTimeout(() => {
      if (correct) {
        onCorrect();
      } else {
        setSelectedIds([]);
        setLocked(false);
        onWrong();
      }
    }, 350);
  }

  return (
    <PathShell badge={task.badgeLabel ?? "Order the Measurements"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="mb-4 flex min-h-[56px] flex-wrap items-center justify-center gap-2 rounded-[22px] border border-[rgba(214,184,108,0.4)] bg-[rgba(255,248,232,0.75)] px-4 py-3">
        {selectedIds.length === 0 ? (
          <span className="text-sm font-bold text-[#a98b52]">Tap the cards from shortest to longest.</span>
        ) : (
          selectedIds.map((id, idx) => {
            const path = paths.find((candidate) => candidate.id === id);
            return (
              <div
                key={id}
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(214,184,108,0.4)] bg-white px-3 py-2 text-sm font-black text-[#5f4725]"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f5d791] text-[#2c1c07]">
                  {idx + 1}
                </span>
                {path?.objectLabel}
              </div>
            );
          })
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {paths.map((path) => {
          const step = selectedIds.indexOf(path.id);
          const chosen = step >= 0;
          return (
            <button
              key={path.id}
              type="button"
              onClick={() => handlePick(path.id)}
              disabled={locked || chosen}
              className="relative rounded-[26px] border text-left transition hover:-translate-y-1 disabled:opacity-70"
              style={{
                borderColor: chosen ? "rgba(94,234,212,0.8)" : "rgba(214,184,108,0.3)",
                background: chosen ? "rgba(204,251,241,0.45)" : "rgba(255,252,245,0.9)",
              }}
            >
              <span className="absolute right-3 top-3 z-10">
                <OptionReadAloudButton text={`${path.objectLabel ?? "Path"}, ${path.length} ${path.unitLabel ?? task.unitLabel ?? "blocks"}`} />
              </span>
              <div className="relative p-3">
                {chosen ? (
                  <div className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0f766e] text-sm font-black text-white">
                    {step + 1}
                  </div>
                ) : null}
                {path.objectImageSrc ? (
                  <MeasuredObject imageSrc={path.objectImageSrc} label={path.objectLabel} length={path.length} compact />
                ) : null}
                <UnitsDisplay length={path.length} unitLabel={path.unitLabel} unitEmoji={path.unitEmoji} compact />
                <MeasurementText length={path.length} unitLabel={path.unitLabel} />
              </div>
            </button>
          );
        })}
      </div>
    </PathShell>
  );
}

function SameScene({ task, onCorrect, onWrong }: { task: MeasurePathTask; onCorrect: () => void; onWrong: () => void }) {
  const paths = task.paths ?? [];
  return (
    <PathShell badge={task.badgeLabel ?? "Find the Same Length"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        {task.objectImageSrc ? (
          <MeasuredObject imageSrc={task.objectImageSrc} label={task.objectLabel} length={task.pathLength ?? 0} />
        ) : null}
        <UnitsDisplay length={task.pathLength ?? 0} unitLabel={task.unitLabel} unitEmoji={task.unitEmoji} />
        <MeasurementText length={task.pathLength ?? 0} unitLabel={task.unitLabel} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {paths.map((path) => (
          <button
            key={path.id}
            type="button"
            onClick={() => (path.id === task.correctPathId ? onCorrect() : onWrong())}
            className="relative rounded-[26px] border border-[rgba(214,184,108,0.3)] bg-[rgba(255,252,245,0.9)] p-3 text-left transition hover:-translate-y-1"
          >
            <span className="absolute right-3 top-3 z-10">
              <OptionReadAloudButton text={`${path.objectLabel ?? "Path"}, ${path.length} ${path.unitLabel ?? task.unitLabel ?? "blocks"}`} />
            </span>
            {path.objectImageSrc ? (
              <MeasuredObject imageSrc={path.objectImageSrc} label={path.objectLabel} length={path.length} compact />
            ) : null}
            <UnitsDisplay length={path.length} unitLabel={path.unitLabel} unitEmoji={path.unitEmoji} compact />
            <MeasurementText length={path.length} unitLabel={path.unitLabel} />
          </button>
        ))}
      </div>
    </PathShell>
  );
}

/* ── Activity C: build a path of a given number of units ──
 * Prep-friendly construction: the path is correct the moment the right number
 * of units is placed (auto-success, no wrong-answer penalty). Remove lets a
 * child undo and recount while building. */
function BuildScene({ task, onCorrect }: { task: MeasurePathTask; onCorrect: () => void; onWrong: () => void }) {
  const target = task.targetLength ?? 0;
  const maxUnits = task.maxUnits ?? target + 2;
  const kind = unitKindFromHints(task.unitLabel, task.unitEmoji);
  const [count, setCount] = useState(0);
  const [locked, setLocked] = useState(false);

  function succeedIfComplete(next: number) {
    if (next === target) {
      setLocked(true);
      window.setTimeout(() => onCorrect(), 450);
    }
  }

  function addUnit() {
    if (locked || count >= maxUnits) return;
    const next = count + 1;
    setCount(next);
    succeedIfComplete(next);
  }
  function removeUnit() {
    if (locked || count <= 0) return;
    setCount((c) => c - 1);
  }

  const complete = locked || count === target;

  return (
    <PathShell badge={task.badgeLabel ?? "Build the Path"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        {task.objectImageSrc ? (
          <MeasuredObject imageSrc={task.objectImageSrc} label={task.objectLabel} length={target} />
        ) : null}
        <div className="mb-3 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[#5f4725]">
          <span className="text-2xl font-black text-[#2c1c07]">{count}</span>
          <span>/ {target} {task.unitLabel ?? "blocks"}</span>
        </div>
        <div
          className="flex min-h-[88px] flex-wrap items-center justify-center gap-1.5 rounded-[22px] border-2 border-dashed px-3 py-4"
          style={{
            borderColor: complete ? "rgba(94,234,212,0.85)" : "rgba(214,184,108,0.6)",
            background: complete ? "rgba(204,251,241,0.5)" : "rgba(255,248,232,0.6)",
          }}
        >
          {count === 0 ? (
            <span className="text-sm font-bold text-[#a98b52]">Tap “Add” to join the blocks</span>
          ) : kind === "block" ? (
            <button type="button" onClick={removeUnit} disabled={locked} title="Tap to remove a block" className="inline-flex items-center">
              <BlockRod length={count} />
            </button>
          ) : (
            Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={removeUnit}
                disabled={locked}
                title="Tap to remove"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#fffaf0] shadow-sm sm:h-14 sm:w-14"
                style={{ border: "1px solid rgba(214,184,108,0.4)" }}
              >
                <UnitGlyph kind={kind} size={40} />
              </button>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={addUnit}
          disabled={locked || count >= maxUnits}
          className="flex min-h-[72px] items-center justify-center gap-2 rounded-[22px] border-2 border-[rgba(214,184,108,0.6)] bg-[#fffaf0] text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40"
        >
          <UnitGlyph kind={kind} size={32} /> Add
        </button>
        <button
          type="button"
          onClick={removeUnit}
          disabled={locked || count <= 0}
          className="flex min-h-[72px] items-center justify-center gap-2 rounded-[22px] border-2 border-[rgba(214,184,108,0.45)] bg-white text-xl font-black text-[#5f4725] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40"
        >
          <Undo2 className="h-6 w-6" /> Remove
        </button>
      </div>
    </PathShell>
  );
}

/* ── Year 2: how many MORE / fewer units? (two measured objects + number MCQ) ── */
function DifferenceScene({ task, onCorrect, onWrong }: { task: MeasurePathTask; onCorrect: () => void; onWrong: () => void }) {
  const paths = task.paths ?? [];
  return (
    <PathShell badge={task.badgeLabel ?? "How Many More?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-3">
        {paths.map((path, idx) => (
          <div key={path.id} className="rounded-[26px] border border-[rgba(214,184,108,0.3)] bg-[rgba(255,252,245,0.9)] p-3">
            <div className="mb-1 px-1 text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">
              {path.objectLabel ?? `Path ${idx === 0 ? "A" : "B"}`}
            </div>
            {path.objectImageSrc ? <MeasuredObject imageSrc={path.objectImageSrc} length={path.length} /> : null}
            <UnitsDisplay length={path.length} unitLabel={path.unitLabel} unitEmoji={path.unitEmoji} />
            <MeasurementText length={path.length} unitLabel={path.unitLabel} />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === task.correctAnswer ? onCorrect() : onWrong())}
            className="relative flex min-h-[88px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-5xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-3 top-3 z-10"><OptionReadAloudButton text={String(value)} /></span>
            {value}
          </button>
        ))}
      </div>
    </PathShell>
  );
}

/* ── Year 2 W4 L1 "Measure More Accurately" (AC9M2M01: smaller units for
 * accuracy). ACTIVE two-step: measure the rope with big blocks → it doesn't fit
 * (a bit left over) → the child taps to re-measure with smaller blocks → it
 * tiles exactly → count them. The payoff: smaller units fit and give a bigger
 * number. `pathLength` = whole big blocks; the rope is that + a half, so the
 * exact small-block count is 2*pathLength + 1 (= correctAnswer). ── */
function ReMeasureScene({ task, onCorrect, onWrong }: { task: MeasurePathTask; onCorrect: () => void; onWrong: () => void }) {
  const wholeBig = task.pathLength ?? 5;
  const ropeBigUnits = wholeBig + 0.5;
  const smallCount = task.correctAnswer ?? wholeBig * 2 + 1;
  const [phase, setPhase] = useState<"big" | "small">("big");
  const label = task.objectLabel ?? "Rope";
  const prompt = phase === "big" ? `Measure the ${label.toLowerCase()} with the big blocks.` : `How many small blocks long is the ${label.toLowerCase()}?`;
  return (
    <PathShell badge={task.badgeLabel ?? "Measure More Accurately"} prompt={prompt} speakText={prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-5 shadow-sm">
        <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-[#7c4a12]">{label}</div>
        <div className="flex justify-center overflow-x-auto">
          <MeasuredRope ropeBigUnits={ropeBigUnits} mode={phase} label={label} />
        </div>
        <div className="mt-4 text-center text-base font-bold text-[#5f4725]">
          {phase === "big" ? (
            <>
              <span className="text-[#2c1c07]">{wholeBig} big blocks</span> fit… but there&apos;s a{" "}
              <span className="text-[#b4540c]">bit left over</span>. It doesn&apos;t fit exactly.
            </>
          ) : (
            <>The small blocks fit <span className="text-[#0f766e]">exactly</span> — no bit left over!</>
          )}
        </div>
      </div>

      {phase === "big" ? (
        <button
          type="button"
          onClick={() => setPhase("small")}
          className="flex min-h-[76px] w-full items-center justify-center gap-2 rounded-[24px] border-2 border-[rgba(214,184,108,0.6)] bg-[#fffaf0] px-6 text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
        >
          Try smaller blocks →
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {(task.options ?? [smallCount - 1, smallCount, smallCount + 1]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => (value === smallCount ? onCorrect() : onWrong())}
              className="relative flex min-h-[88px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-5xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span className="absolute right-3 top-3 z-10"><OptionReadAloudButton text={String(value)} /></span>
              {value}
            </button>
          ))}
        </div>
      )}
    </PathShell>
  );
}

/* ── Year 2 W4 L1 activity 2 — "More or fewer?": predict the inverse
 * relationship. Big blocks left a bit over; will SMALLER blocks give more or
 * fewer? (Always more.) ── */
function MoreOrFewerScene({ task, onCorrect, onWrong }: { task: MeasurePathTask; onCorrect: () => void; onWrong: () => void }) {
  const wholeBig = task.pathLength ?? 5;
  const label = task.objectLabel ?? "Rope";
  return (
    <PathShell badge={task.badgeLabel ?? "More or Fewer?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-5 shadow-sm">
        <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-[#7c4a12]">{label}</div>
        <div className="flex justify-center overflow-x-auto">
          <MeasuredRope ropeBigUnits={wholeBig + 0.5} mode="big" label={label} />
        </div>
        <div className="mt-4 text-center text-base font-bold text-[#5f4725]">
          <span className="text-[#2c1c07]">{wholeBig} big blocks</span> and a bit left over. If we use{" "}
          <span className="text-[#0f766e]">smaller blocks</span>…
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {["More", "Fewer"].map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => (opt === (task.correctTextOption ?? "More") ? onCorrect() : onWrong())}
            className="relative flex min-h-[84px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-8 text-2xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-3 top-3 z-10"><OptionReadAloudButton text={opt} /></span>
            {opt}
          </button>
        ))}
      </div>
    </PathShell>
  );
}

/* ── Year 2 W4 L1 activity 3 — "Count the small blocks": fluency. The object is
 * already tiled exactly with small blocks; count them. ── */
function CountSmallScene({ task, onCorrect, onWrong }: { task: MeasurePathTask; onCorrect: () => void; onWrong: () => void }) {
  const wholeBig = task.pathLength ?? 5;
  const smallCount = task.correctAnswer ?? wholeBig * 2 + 1;
  const label = task.objectLabel ?? "Rope";
  return (
    <PathShell badge={task.badgeLabel ?? "Count the Small Blocks"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-5 shadow-sm">
        <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-[#7c4a12]">{label}</div>
        <div className="flex justify-center overflow-x-auto">
          <MeasuredRope ropeBigUnits={wholeBig + 0.5} mode="small" label={label} />
        </div>
        <div className="mt-4 text-center text-base font-bold text-[#5f4725]">The small blocks fit exactly — count them.</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? [smallCount - 1, smallCount, smallCount + 1]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === smallCount ? onCorrect() : onWrong())}
            className="relative flex min-h-[88px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-5xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-3 top-3 z-10"><OptionReadAloudButton text={String(value)} /></span>
            {value}
          </button>
        ))}
      </div>
    </PathShell>
  );
}

/* ── Year 2 W4 L2 "Which Measurement Is Closer?": the same object measured with
 * big blocks and small blocks. Four answer modes (task.accuracyMode):
 *   tapExact    — tap the exact one (big has a bit left over, small fits),
 *   exactNumber — pick the exact number,
 *   whyExact    — pick why the small blocks are exact,
 *   sameLength  — both fit exactly (N big / 2N small): same length or longer?
 *                 (the bigger number doesn't mean a longer object). ── */
function MeasurementRow({ label, mode, ropeUnits, caption }: { label: string; mode: "big" | "small"; ropeUnits: number; caption: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="mb-1 text-center text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">{mode === "big" ? "Big blocks" : "Small blocks"}</div>
      <div className="flex justify-center overflow-x-auto">
        <MeasuredRope ropeBigUnits={ropeUnits} mode={mode} label={label} />
      </div>
      <div className="mt-2 text-center text-sm font-bold text-[#5f4725]">{caption}</div>
    </div>
  );
}

function CompareAccuracyScene({ task, onCorrect, onWrong }: { task: MeasurePathTask; onCorrect: () => void; onWrong: () => void }) {
  const wholeBig = task.pathLength ?? 6;
  const label = task.objectLabel ?? "Rope";
  const accuracyMode = task.accuracyMode ?? (task.textOptions ? "whyExact" : task.options ? "exactNumber" : "tapExact");
  const isSame = accuracyMode === "sameLength";
  // sameLength: rope is a whole number of big units, so BOTH tile exactly
  // (N big / 2N small). Other modes: a half left over in big, exact in small.
  const ropeUnits = isSame ? wholeBig : wholeBig + 0.5;
  const smallCount = isSame ? wholeBig * 2 : task.correctAnswer ?? wholeBig * 2 + 1;
  // Random card order for tap mode (stable per question) so the exact answer
  // isn't always in the same position. Computed unconditionally (hooks rule).
  const tapOrder = useMemo<[number, number]>(() => (Math.random() < 0.5 ? [0, 1] : [1, 0]), [task]);
  // In tap/sameLength modes the child must judge from the blocks, so captions
  // state the count only (no "fits exactly" giveaway).
  const bigCaption = isSame ? (
    <>{wholeBig} blocks</>
  ) : accuracyMode === "tapExact" ? (
    <>{wholeBig} blocks, then a bit more</>
  ) : (
    <>
      {wholeBig} blocks and a <span className="text-[#b4540c]">bit left over</span>
    </>
  );
  const smallCaption = isSame || accuracyMode === "tapExact" ? (
    <>{smallCount} blocks</>
  ) : (
    <>
      {smallCount} blocks — fits <span className="text-[#0f766e]">exactly</span>
    </>
  );

  if (accuracyMode === "tapExact") {
    // The exact (small) card must not always sit in the same place, or the
    // answer is "always the bottom one". Random order, stable per question.
    const cards = [
      { key: "big", correct: false, node: <MeasurementRow label={label} mode="big" ropeUnits={ropeUnits} caption={bigCaption} /> },
      { key: "small", correct: true, node: <MeasurementRow label={label} mode="small" ropeUnits={ropeUnits} caption={smallCaption} /> },
    ];
    const order = tapOrder;
    return (
      <PathShell badge={task.badgeLabel ?? "Which Is Exact?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
        <div className="grid gap-4">
          {order.map((i) => {
            const c = cards[i]!;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => (c.correct ? onCorrect() : onWrong())}
                className="rounded-[26px] border border-[rgba(214,184,108,0.3)] bg-[rgba(255,252,245,0.9)] p-4 transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[rgba(167,139,250,0.25)]"
              >
                {c.node}
              </button>
            );
          })}
        </div>
      </PathShell>
    );
  }

  return (
    <PathShell badge={task.badgeLabel ?? "Which Measurement Is Closer?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-5 shadow-sm">
        <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-[#7c4a12]">{label}</div>
        <div className="flex flex-col gap-4">
          {/* whyExact shows just the exact (small) measurement so it looks
              different from the two-bar comparison activities. */}
          {accuracyMode === "whyExact" ? (
            <MeasurementRow label={label} mode="small" ropeUnits={ropeUnits} caption={smallCaption} />
          ) : (
            <>
              <MeasurementRow label={label} mode="big" ropeUnits={ropeUnits} caption={bigCaption} />
              <MeasurementRow label={label} mode="small" ropeUnits={ropeUnits} caption={smallCaption} />
            </>
          )}
        </div>
      </div>
      {accuracyMode === "exactNumber" ? (
        <div className="grid grid-cols-3 gap-3">
          {(task.options ?? [wholeBig, smallCount, smallCount + 1]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => (value === smallCount ? onCorrect() : onWrong())}
              className="relative flex min-h-[88px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-5xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span className="absolute right-3 top-3 z-10"><OptionReadAloudButton text={String(value)} /></span>
              {value}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {(task.textOptions ?? []).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => (opt === task.correctTextOption ? onCorrect() : onWrong())}
              className="relative flex min-h-[72px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-12 py-4 text-center text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span className="absolute right-3 top-3 z-10"><OptionReadAloudButton text={opt} /></span>
              {opt}
            </button>
          ))}
        </div>
      )}
    </PathShell>
  );
}

/* ── Year 2 W4 "Finish the Gap": the big blocks leave a small gap; DRAG a block
 * into it. Only the small block fits — the big one is too wide and bounces back.
 * Interactive, not answer-picking. Works by drag (pointer) or a simple tap. ── */
function FinishGapScene({ task, onCorrect }: { task: MeasurePathTask; onCorrect: () => void }) {
  const wholeBig = task.pathLength ?? 4;
  const label = task.objectLabel ?? "Rope";
  const BIG = 52;
  const SMALL = 26;
  const H = 40;
  const filledW = wholeBig * BIG;
  const totalW = filledW + SMALL;
  const [placed, setPlaced] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [tooBig, setTooBig] = useState(false);
  const [drag, setDrag] = useState<{ which: "big" | "small"; x: number; y: number; sx: number; sy: number; id: number } | null>(null);
  const gapRef = useRef<HTMLDivElement>(null);
  const wonRef = useRef(false);

  function start(which: "big" | "small", e: React.PointerEvent) {
    if (placed) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setTooBig(false);
    setFeedback(null);
    setDrag({ which, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, id: e.pointerId });
  }
  function move(e: React.PointerEvent) {
    setDrag((d) => (d && d.id === e.pointerId ? { ...d, x: e.clientX, y: e.clientY } : d));
  }
  function end(e: React.PointerEvent) {
    const g = drag;
    setDrag(null);
    if (!g || g.id !== e.pointerId) return;
    const rect = gapRef.current?.getBoundingClientRect();
    const overGap = !!rect && e.clientX >= rect.left - 36 && e.clientX <= rect.right + 36 && e.clientY >= rect.top - 80 && e.clientY <= rect.bottom + 80;
    const tapped = Math.hypot(e.clientX - g.sx, e.clientY - g.sy) < 10;
    if (g.which === "small" && (overGap || tapped)) {
      setPlaced(true);
      setFeedback("It fits exactly! Now the whole thing is measured.");
      if (!wonRef.current) {
        wonRef.current = true;
        window.setTimeout(onCorrect, 1100);
      }
    } else if (g.which === "big" && (overGap || tapped)) {
      setTooBig(true);
      setFeedback("Too big — the big block won't fit the little gap. Try the small one!");
    }
  }

  const block = (w: number, extra?: React.CSSProperties): React.CSSProperties => ({
    width: w,
    height: H,
    boxSizing: "border-box",
    border: "2px solid #2c6a8c",
    borderRadius: 6,
    background: "linear-gradient(180deg,#7fd3f2,#54aad6)",
    ...extra,
  });

  return (
    <PathShell badge={task.badgeLabel ?? "Finish the Gap"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-5 shadow-sm">
        <div className="mb-4 text-center text-sm font-black uppercase tracking-[0.16em] text-[#7c4a12]">{label}</div>
        <div className="flex justify-center">
          <div style={{ position: "relative", width: totalW, maxWidth: "100%" }}>
            <div style={{ width: totalW, height: 20, borderRadius: 10, background: styleFor(label).bg, marginBottom: 8 }} />
            <div style={{ display: "flex" }}>
              {Array.from({ length: wholeBig }).map((_, i) => (
                <div key={i} style={block(BIG, { borderRadius: 0, borderLeft: i === 0 ? "2px solid #2c6a8c" : "none" })} />
              ))}
              <div
                ref={gapRef}
                style={{
                  width: SMALL,
                  height: H,
                  boxSizing: "border-box",
                  borderRadius: 0,
                  border: placed ? "2px solid #2c6a8c" : "2px dashed #b4540c",
                  borderLeft: "none",
                  background: placed ? "linear-gradient(180deg,#7fd3f2,#54aad6)" : tooBig ? "rgba(220,38,38,0.14)" : "rgba(232,130,12,0.12)",
                  transition: "background 0.2s",
                }}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-base font-bold" style={{ color: placed ? "#0f766e" : tooBig ? "#b4540c" : "#5f4725" }}>
          {feedback ?? "Drag a block into the gap. Which one fits?"}
        </div>
      </div>

      {!placed ? (
        <div className="flex items-end justify-center gap-10 py-3">
          <div className="flex flex-col items-center gap-1.5">
            <div onPointerDown={(e) => start("big", e)} onPointerMove={move} onPointerUp={end} style={{ ...block(BIG), touchAction: "none", cursor: "grab", opacity: drag?.which === "big" ? 0.3 : 1 }} />
            <span className="text-[11px] font-black uppercase tracking-wide text-[#7c3aed]">Big block</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <div onPointerDown={(e) => start("small", e)} onPointerMove={move} onPointerUp={end} style={{ ...block(SMALL), touchAction: "none", cursor: "grab", opacity: drag?.which === "small" ? 0.3 : 1 }} />
            <span className="text-[11px] font-black uppercase tracking-wide text-[#7c3aed]">Small block</span>
          </div>
        </div>
      ) : null}

      {drag ? (
        <div style={{ position: "fixed", left: drag.x, top: drag.y, transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 60 }}>
          <div style={block(drag.which === "big" ? BIG : SMALL, { boxShadow: "0 8px 20px rgba(0,0,0,0.25)" })} />
        </div>
      ) : null}
    </PathShell>
  );
}

/* ── Year 2 W4 L2 "Measure it yourself": TAP to lay small blocks along the
 * object one at a time until it's fully measured, then it reveals the exact
 * count. Interactive build-up (not answer-picking). ── */
function FillSmallScene({ task, onCorrect }: { task: MeasurePathTask; onCorrect: () => void }) {
  const label = task.objectLabel ?? "Rope";
  const target = task.correctAnswer ?? (task.pathLength ?? 4) * 2 + 1;
  const SMALL = 30;
  const H = 40;
  const totalW = target * SMALL;
  const [filled, setFilled] = useState(0);
  const wonRef = useRef(false);
  const done = filled >= target;

  function add() {
    if (done) return;
    const n = filled + 1;
    setFilled(n);
    if (n >= target && !wonRef.current) {
      wonRef.current = true;
      window.setTimeout(onCorrect, 1100);
    }
  }

  return (
    <PathShell badge={task.badgeLabel ?? "Measure It Yourself"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-5 shadow-sm">
        <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-[#7c4a12]">{label}</div>
        <div className="flex justify-center">
          <div style={{ position: "relative", width: totalW, maxWidth: "100%" }}>
            <div style={{ width: totalW, height: 20, borderRadius: 10, background: styleFor(label).bg, marginBottom: 8 }} />
            <button
              type="button"
              onClick={add}
              disabled={done}
              style={{ display: "flex", width: totalW, cursor: done ? "default" : "pointer" }}
              aria-label="Add a small block"
            >
              {Array.from({ length: target }).map((_, i) => {
                const isFilled = i < filled;
                const isNext = i === filled && !done;
                return (
                  <div
                    key={i}
                    style={{
                      width: SMALL,
                      height: H,
                      boxSizing: "border-box",
                      border: isFilled ? "2px solid #2c6a8c" : "2px dashed rgba(44,106,140,0.5)",
                      borderLeft: i === 0 || isFilled ? "2px solid #2c6a8c" : "2px dashed rgba(44,106,140,0.5)",
                      background: isFilled ? "linear-gradient(180deg,#7fd3f2,#54aad6)" : isNext ? "rgba(127,211,242,0.25)" : "rgba(0,0,0,0.02)",
                      animation: isNext ? "bbTapPulse 0.9s ease-in-out infinite" : undefined,
                      transition: "background 0.12s",
                    }}
                  />
                );
              })}
            </button>
          </div>
        </div>
        <div className="mt-4 text-center text-base font-bold" style={{ color: done ? "#0f766e" : "#5f4725" }}>
          {done ? `${target} small blocks — you measured it exactly!` : `Tap to add small blocks. ${filled} so far…`}
        </div>
      </div>
      <style jsx global>{`
        @keyframes bbTapPulse { 0%,100%{ transform: scale(1);} 50%{ transform: scale(1.04);} }
      `}</style>
    </PathShell>
  );
}

/* ── Year 2 W4 "Measure It Your Way": OPEN-ENDED. The child adds big (2-unit)
 * and/or small (1-unit) blocks however they like to measure the object exactly.
 * Many valid answers (all small; big + a small to finish; …). A big block won't
 * fit when only 1 unit of space is left — so small blocks finish it off. ── */
function MeasureYourWayScene({ task, onCorrect }: { task: MeasurePathTask; onCorrect: () => void }) {
  const label = task.objectLabel ?? "Rope";
  const L = task.correctAnswer ?? 11; // object length in small units
  const SMALL = 30;
  const BIG = SMALL * 2;
  const H = 42;
  const totalW = L * SMALL;
  const [blocks, setBlocks] = useState<Array<"big" | "small">>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const wonRef = useRef(false);
  const fill = blocks.reduce((s, b) => s + (b === "big" ? 2 : 1), 0);
  const remaining = L - fill;
  const done = fill === L;

  function place(type: "big" | "small") {
    if (done) return;
    const w = type === "big" ? 2 : 1;
    if (fill + w > L) {
      if (type === "big") setMsg("A big block is too big for the space left — use a small one to finish!");
      return;
    }
    const nb = [...blocks, type];
    setBlocks(nb);
    setMsg(null);
    if (fill + w === L && !wonRef.current) {
      wonRef.current = true;
      const big = nb.filter((b) => b === "big").length;
      const small = nb.filter((b) => b === "small").length;
      const parts = [big ? `${big} big` : "", small ? `${small} small` : ""].filter(Boolean).join(" + ");
      setMsg(`Measured exactly! You used ${parts}.`);
      window.setTimeout(onCorrect, 1400);
    }
  }
  function undo() {
    if (done || blocks.length === 0) return;
    setBlocks(blocks.slice(0, -1));
    setMsg(null);
  }

  const cell = (w: number, kind: "big" | "small"): React.CSSProperties => ({
    width: w,
    height: H,
    boxSizing: "border-box",
    border: "2px solid #2c6a8c",
    borderRadius: 6,
    background: kind === "big" ? "linear-gradient(180deg,#54aad6,#3f93bd)" : "linear-gradient(180deg,#9fe0f5,#7fd3f2)",
  });

  return (
    <PathShell badge={task.badgeLabel ?? "Measure It Your Way"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-5 shadow-sm">
        <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-[#7c4a12]">{label}</div>
        <div className="flex justify-center">
          <div style={{ position: "relative", width: totalW, maxWidth: "100%" }}>
            <div style={{ width: totalW, height: 20, borderRadius: 10, background: styleFor(label).bg, marginBottom: 8 }} />
            <div style={{ display: "flex" }}>
              {blocks.map((b, i) => (
                <div key={i} style={cell(b === "big" ? BIG : SMALL, b)} />
              ))}
              {Array.from({ length: Math.max(0, remaining) }).map((_, i) => (
                <div key={`g${i}`} style={{ width: SMALL, height: H, boxSizing: "border-box", border: "2px dashed rgba(44,106,140,0.45)", background: "rgba(0,0,0,0.02)" }} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 text-center text-base font-bold" style={{ color: done ? "#0f766e" : "#5f4725", minHeight: 24 }}>
          {msg ?? (remaining > 0 ? `${remaining} more to fill…` : "")}
        </div>
      </div>

      {!done ? (
        <div className="flex items-center justify-center gap-4">
          <button type="button" onClick={() => place("big")} className="flex flex-col items-center gap-1.5 rounded-[20px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-5 py-3 font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">
            <div style={cell(BIG, "big")} />
            <span className="text-xs uppercase tracking-wide text-[#7c3aed]">Add big</span>
          </button>
          <button type="button" onClick={() => place("small")} className="flex flex-col items-center gap-1.5 rounded-[20px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-5 py-3 font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">
            <div style={cell(SMALL, "small")} />
            <span className="text-xs uppercase tracking-wide text-[#7c3aed]">Add small</span>
          </button>
          <button type="button" onClick={undo} disabled={blocks.length === 0} className="flex items-center gap-2 rounded-[20px] border-2 border-[rgba(214,184,108,0.45)] bg-white px-4 py-6 font-black text-[#5f4725] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40">
            <Undo2 className="h-5 w-5" /> Undo
          </button>
        </div>
      ) : null}
    </PathShell>
  );
}

/* ── Year 2 W4 L2 "Estimate It": estimate a real object's length by eye. ── */
function EstObjectImage({ src, label, max = 150, units }: { src?: string; label?: string; max?: number; units?: number }) {
  if (!src) return null;
  const widthPercent = typeof units === "number" ? Math.min(92, Math.max(42, 24 + units * 6)) : 80;
  return (
    <div className="flex flex-col items-center">
      <img src={src} alt={label ?? "Object"} className="h-auto object-contain drop-shadow-[0_8px_14px_rgba(76,40,10,0.18)]" style={{ maxHeight: max, width: `${widthPercent}%`, maxWidth: `${widthPercent}%` }} />
      {label ? <div className="mt-2 text-sm font-black uppercase tracking-[0.14em] text-[#7c4a12]">{label}</div> : null}
    </div>
  );
}

function EstimateDebugOverlay({ task }: { task: MeasurePathTask }) {
  if (process.env.NODE_ENV !== "development") return null;
  const measurement = task.estimateMeasurement;
  if (!measurement && !task.estimatePair?.length) return null;

  return (
    <div className="mt-3 rounded-[16px] border border-dashed border-[#b4540c]/45 bg-[#fff7ed] p-3 text-left font-mono text-xs leading-5 text-[#7c2d12]">
      <div className="font-black uppercase tracking-[0.12em]">Dev measurement debug</div>
      {measurement ? (
        <>
          <div>Length Units: {measurement.objectLengthUnits}</div>
          <div>Big Units: {measurement.expectedBigCount} remainder {measurement.gapAmount}</div>
          <div>Small Units: {measurement.expectedSmallCount}</div>
          <div>Correct Answer: {measurement.correctAnswer}</div>
          <div>Close Range: {measurement.closeRange[0]}-{measurement.closeRange[1]}</div>
        </>
      ) : null}
      {task.estimatePair?.length ? (
        <>
          <div>Pair: {task.estimatePair.map((item) => `${item.label}=${item.blocks}`).join(", ")}</div>
          <div>Correct Item: {task.correctItemId}</div>
        </>
      ) : null}
    </div>
  );
}

// Best guess — pick the sensible estimate (magnitude sense).
function EstimateGuessScene({ task, onCorrect, onWrong }: { task: MeasurePathTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <PathShell badge={task.badgeLabel ?? "Best Guess"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-5 shadow-sm">
        <EstObjectImage src={task.objectImageSrc} label={task.objectLabel} units={task.estimateMeasurement?.objectLengthUnits ?? task.correctAnswer} />
        <div className="mt-3 text-center text-base font-bold text-[#5f4725]">Don't measure — have a guess!</div>
        <EstimateDebugOverlay task={task} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((v) => (
          <button key={v} type="button" onClick={() => (v === task.correctAnswer ? onCorrect() : onWrong())} className="relative flex min-h-[88px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-5xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]">
            <span className="absolute right-3 top-3 z-10"><OptionReadAloudButton text={String(v)} /></span>
            {v}
          </button>
        ))}
      </div>
    </PathShell>
  );
}

// Guess & check — drag a slider to your estimate, then reveal the real length.
function EstimateSliderScene({ task, onCorrect, onWrong }: { task: MeasurePathTask; onCorrect: () => void; onWrong: () => void }) {
  const actual = task.correctAnswer ?? 6;
  const min = task.estimateMin ?? Math.max(1, actual - 2);
  const max = task.estimateMax ?? actual + 2;
  const tolerance = task.estimateTolerance ?? 1;
  const start = Math.min(max, Math.max(min, task.estimateStart ?? actual));
  const [guess, setGuess] = useState(start);
  const [checked, setChecked] = useState(false);
  const wonRef = useRef(false);
  const close = Math.abs(guess - actual) <= tolerance;
  useEffect(() => {
    setGuess(start);
    setChecked(false);
    wonRef.current = false;
  }, [actual, min, max, start]);
  function check() {
    if (checked) return;
    setChecked(true);
    if (!wonRef.current) {
      wonRef.current = true;
      window.setTimeout(() => (close ? onCorrect() : onWrong()), 1500);
    }
  }
  return (
    <PathShell badge={task.badgeLabel ?? "Guess & Check"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-5 shadow-sm">
        <EstObjectImage src={task.objectImageSrc} label={task.objectLabel} max={120} units={task.estimateMeasurement?.objectLengthUnits ?? actual} />
        {!checked ? (
          <div className="mt-4">
            <div className="mb-2 text-center text-lg font-black text-[#2c1c07]">Your guess: {guess} blocks</div>
            <input type="range" min={min} max={max} value={guess} onChange={(e) => setGuess(Number(e.target.value))} className="w-full" style={{ accentColor: "#b4540c" }} />
            <div className="mt-1 flex justify-between text-xs font-black uppercase tracking-[0.12em] text-[#8a6a35]">
              <span>{min}</span>
              <span>{max}</span>
            </div>
            <div className="mt-4 flex justify-center">
              <button type="button" onClick={check} className="rounded-full px-8 py-3 text-lg font-black uppercase tracking-[0.12em] text-[#fff8e1] shadow-[0_16px_32px_rgba(180,120,20,0.22)]" style={{ background: "linear-gradient(135deg, rgba(120,53,15,0.96), rgba(180,120,20,0.96), rgba(214,184,108,0.92))" }}>
                Check it →
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-2">
            <BlockRod length={actual} />
            <div className="text-center text-base font-bold" style={{ color: close ? "#0f766e" : "#b4540c" }}>
              You guessed {guess}. Correct answer: {actual} small blocks. {close ? "Great estimate!" : "Use the smaller-unit count to get closer."}
            </div>
          </div>
        )}
        <EstimateDebugOverlay task={task} />
      </div>
    </PathShell>
  );
}

// Which is longer — estimate by eye, tap the longer object.
function EstimateLongerScene({ task, onCorrect, onWrong }: { task: MeasurePathTask; onCorrect: () => void; onWrong: () => void }) {
  const pair = task.estimatePair ?? [];
  return (
    <PathShell badge={task.badgeLabel ?? "Which Is Longer?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid grid-cols-2 gap-4">
        {pair.map((it) => (
          <button key={it.id} type="button" onClick={() => (it.id === task.correctItemId ? onCorrect() : onWrong())} className="rounded-[26px] border border-[rgba(214,184,108,0.3)] bg-[rgba(255,252,245,0.9)] p-4 transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[rgba(167,139,250,0.25)]">
            <EstObjectImage src={it.imageSrc} label={it.label} max={130} units={it.blocks} />
          </button>
        ))}
      </div>
      <EstimateDebugOverlay task={task} />
    </PathShell>
  );
}

export function MeasurelandsPathTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: MeasurePathTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "count") return <CountScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "compare") return <CompareScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "order") return <OrderScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "same") return <SameScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "difference") return <DifferenceScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "reMeasure") return <ReMeasureScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "moreOrFewer") return <MoreOrFewerScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "countSmall") return <CountSmallScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "compareAccuracy") return <CompareAccuracyScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "finishGap") return <FinishGapScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "fillSmall") return <FillSmallScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "measureYourWay") return <MeasureYourWayScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "estimateGuess") return <EstimateGuessScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "estimateSlider") return <EstimateSliderScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "estimateLonger") return <EstimateLongerScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <BuildScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
