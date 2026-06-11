"use client";

import { useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type MeasurePathTask = Extract<PracticeTask, { kind: "measurePath" }>;

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

/* ── A path: a row of equal, evenly-spaced units on a track ── */
function PathTrack({
  length,
  unitEmoji,
  highlight = false,
}: {
  length: number;
  unitEmoji: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 rounded-[22px] border-2 px-3 py-4"
      style={{
        borderColor: highlight ? "rgba(94,234,212,0.8)" : "rgba(214,184,108,0.45)",
        background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,248,232,0.96))",
      }}
    >
      {Array.from({ length }).map((_, i) => (
        <span
          key={i}
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#fffaf0] text-3xl shadow-sm sm:h-14 sm:w-14 sm:text-4xl"
          style={{ border: "1px solid rgba(214,184,108,0.4)" }}
          aria-hidden
        >
          {unitEmoji}
        </span>
      ))}
    </div>
  );
}

/* ── Intro / teaching sequence ── */
function IntroScene({ task, onCorrect }: { task: MeasurePathTask; onCorrect: () => void }) {
  return (
    <PathShell badge={task.badgeLabel ?? "Meazurex Mission"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[30px] border border-[rgba(214,184,108,0.36)] bg-[rgba(255,248,232,0.98)] p-5 shadow-[0_18px_38px_rgba(180,120,20,0.08)]">
        <div className="mb-4 flex items-start gap-4 rounded-[26px] border border-[rgba(167,139,250,0.22)] bg-[rgba(109,40,217,0.08)] p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6d28d9,#4c1d95)] text-3xl shadow-[0_10px_24px_rgba(109,40,217,0.24)]">
            🧭
          </div>
          <div className="space-y-2">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-[#5b21b6]">Meazurex</div>
            <p className="text-base font-semibold leading-relaxed text-[#2c1c07]">
              We can measure paths using equal pieces.
            </p>
            <p className="text-base font-semibold leading-relaxed text-[#5f4725]">
              We count the pieces to find the length.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {(task.teachingPaths ?? []).map((path, idx) => (
            <div key={idx} className="rounded-[26px] border border-[rgba(214,184,108,0.28)] bg-[rgba(255,252,245,0.92)] p-4">
              <PathTrack length={path.length} unitEmoji={path.unitEmoji} />
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
    <PathShell badge={task.badgeLabel ?? "Count the Footsteps"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        <PathTrack length={task.pathLength ?? 0} unitEmoji={task.unitEmoji ?? "👣"} />
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
    <PathShell badge={task.badgeLabel ?? "Which Path Is Longer?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="grid gap-4">
        {paths.map((path, idx) => (
          <button
            key={path.id}
            type="button"
            onClick={() => (path.id === task.correctPathId ? onCorrect() : onWrong())}
            className="rounded-[26px] border border-transparent text-left transition hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-[rgba(167,139,250,0.25)]"
          >
            <div className="mb-1 px-1 text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">
              Path {idx === 0 ? "A" : "B"}
            </div>
            <PathTrack length={path.length} unitEmoji={path.unitEmoji} />
          </button>
        ))}
      </div>
    </PathShell>
  );
}

/* ── Activity C: build a path of a given number of units ── */
function BuildScene({ task, onCorrect, onWrong }: { task: MeasurePathTask; onCorrect: () => void; onWrong: () => void }) {
  const target = task.targetLength ?? 0;
  const maxUnits = task.maxUnits ?? target + 3;
  const unitEmoji = task.unitEmoji ?? "🟦";
  const [count, setCount] = useState(0);
  const [locked, setLocked] = useState(false);

  function addUnit() {
    if (locked || count >= maxUnits) return;
    setCount((c) => c + 1);
  }
  function removeUnit() {
    if (locked || count <= 0) return;
    setCount((c) => c - 1);
  }
  function build() {
    if (locked || count === 0) return;
    setLocked(true);
    if (count === target) {
      window.setTimeout(() => onCorrect(), 350);
    } else {
      window.setTimeout(() => onWrong(), 500);
    }
  }

  return (
    <PathShell badge={task.badgeLabel ?? "Build the Path"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-[#5f4725]">
          <span className="text-2xl font-black text-[#2c1c07]">{count}</span>
          <span>/ {target} {task.unitLabel ?? "blocks"}</span>
        </div>
        <div
          className="flex min-h-[88px] flex-wrap items-center justify-center gap-2 rounded-[22px] border-2 border-dashed px-3 py-4"
          style={{ borderColor: "rgba(214,184,108,0.6)", background: "rgba(255,248,232,0.6)" }}
        >
          {count === 0 ? (
            <span className="text-sm font-bold text-[#a98b52]">Tap “Add” to build your path</span>
          ) : (
            Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={removeUnit}
                disabled={locked}
                title="Tap to remove"
                className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#fffaf0] text-3xl shadow-sm sm:h-14 sm:w-14 sm:text-4xl"
                style={{ border: "1px solid rgba(214,184,108,0.4)" }}
              >
                {unitEmoji}
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
          <span className="text-3xl">{unitEmoji}</span> Add
        </button>
        <button
          type="button"
          onClick={removeUnit}
          disabled={locked || count <= 0}
          className="flex min-h-[72px] items-center justify-center rounded-[22px] border-2 border-[rgba(214,184,108,0.45)] bg-white text-xl font-black text-[#5f4725] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40"
        >
          ↩ Remove
        </button>
      </div>

      <button
        type="button"
        onClick={build}
        disabled={locked || count === 0}
        className="w-full rounded-full px-6 py-4 text-lg font-black uppercase tracking-[0.12em] text-[#fff8e1] shadow-[0_16px_32px_rgba(180,120,20,0.22)] transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, rgba(120,53,15,0.96), rgba(180,120,20,0.96), rgba(214,184,108,0.92))" }}
      >
        Build It!
      </button>
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
  return <BuildScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
}
