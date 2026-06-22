"use client";

import { useState } from "react";
import { Compass, Undo2 } from "lucide-react";
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
function PathShell({
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
const UNIT_PX = 40;
const ROD_DEPTH = 13;

/* ── A connected MAB-style rod: N unit cubes joined end-to-end ── */
function BlockRod({ length, unitPx = UNIT_PX }: { length: number; unitPx?: number }) {
  if (length <= 0) return null;
  const u = unitPx;
  const d = Math.round(u * 0.32);
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
function MeasuredObject({
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
  const width = compact
    ? Math.min(320, Math.max(140, length * 26 + ROD_DEPTH))
    : Math.min(620, Math.max(240, length * 54 + ROD_DEPTH));
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

/* ── Units display: a joined MAB rod for blocks, a glyph row otherwise ── */
function UnitsDisplay({
  length,
  unitLabel,
  unitEmoji,
  highlight = false,
}: {
  length: number;
  unitLabel?: string;
  unitEmoji?: string;
  highlight?: boolean;
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
        <BlockRod length={length} />
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
        <MeasurementText length={task.pathLength ?? 0} unitLabel={task.unitLabel} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {(task.options ?? []).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => (value === task.correctAnswer ? onCorrect() : onWrong())}
            className="flex min-h-[88px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] text-5xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
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
            className="rounded-[26px] border border-transparent text-left transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[rgba(167,139,250,0.25)]"
          >
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
              className="rounded-[26px] border text-left transition hover:-translate-y-1 disabled:opacity-70"
              style={{
                borderColor: chosen ? "rgba(94,234,212,0.8)" : "rgba(214,184,108,0.3)",
                background: chosen ? "rgba(204,251,241,0.45)" : "rgba(255,252,245,0.9)",
              }}
            >
              <div className="relative p-3">
                {chosen ? (
                  <div className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0f766e] text-sm font-black text-white">
                    {step + 1}
                  </div>
                ) : null}
                {path.objectImageSrc ? (
                  <MeasuredObject imageSrc={path.objectImageSrc} label={path.objectLabel} length={path.length} compact />
                ) : null}
                <UnitsDisplay length={path.length} unitLabel={path.unitLabel} unitEmoji={path.unitEmoji} />
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
            className="rounded-[26px] border border-[rgba(214,184,108,0.3)] bg-[rgba(255,252,245,0.9)] p-3 text-left transition hover:-translate-y-1"
          >
            {path.objectImageSrc ? (
              <MeasuredObject imageSrc={path.objectImageSrc} label={path.objectLabel} length={path.length} compact />
            ) : null}
            <UnitsDisplay length={path.length} unitLabel={path.unitLabel} unitEmoji={path.unitEmoji} />
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
  return <BuildScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
