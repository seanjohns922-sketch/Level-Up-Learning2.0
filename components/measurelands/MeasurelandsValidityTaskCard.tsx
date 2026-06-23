"use client";

import { useState } from "react";
import { Compass, Check, MoveHorizontal } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { BlockRod, MeasuredObject, PathShell, UNIT_PX } from "@/components/measurelands/MeasurelandsPathTaskCard";

type ValidityTask = Extract<PracticeTask, { kind: "measureValidity" }>;
type Flaw = "none" | "gap" | "overlap";

/* ── A measurement attempt: a joined rod (none) or one with a gap / overlap ── */
function FlawedRod({
  length,
  flaw,
  flawIndex,
  unitPx = UNIT_PX,
}: {
  length: number;
  flaw: Flaw;
  flawIndex?: number;
  unitPx?: number;
}) {
  if (flaw === "none" || length <= 1) {
    return <BlockRod length={length} unitPx={unitPx} />;
  }
  const split = Math.min(Math.max(flawIndex ?? Math.floor(length / 2), 1), length - 1);
  const left = split;
  const right = length - split;

  if (flaw === "gap") {
    return (
      <div className="flex items-center">
        <BlockRod length={left} unitPx={unitPx} />
        <div style={{ width: Math.round(unitPx * 0.6) }} aria-hidden />
        <BlockRod length={right} unitPx={unitPx} />
      </div>
    );
  }
  // overlap — the second run sits partly over the first
  return (
    <div className="flex items-center">
      <BlockRod length={left} unitPx={unitPx} />
      <div
        style={{
          marginLeft: -Math.round(unitPx * 0.55),
          position: "relative",
          zIndex: 1,
          filter: "drop-shadow(-3px 1px 3px rgba(20,60,80,0.35))",
        }}
      >
        <BlockRod length={right} unitPx={unitPx} />
      </div>
    </div>
  );
}

function RodFrame({
  children,
  highlight,
  tone = "neutral",
}: {
  children: React.ReactNode;
  highlight?: boolean;
  tone?: "neutral" | "good" | "bad";
}) {
  const border =
    tone === "good"
      ? "rgba(94,234,212,0.85)"
      : tone === "bad"
        ? "rgba(248,113,113,0.7)"
        : highlight
          ? "rgba(94,234,212,0.8)"
          : "rgba(214,184,108,0.45)";
  return (
    <div
      className="flex min-h-[84px] items-center justify-center overflow-x-auto rounded-[22px] border-2 px-3 py-4"
      style={{ borderColor: border, background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,248,232,0.96))" }}
    >
      {children}
    </div>
  );
}

/* ── Intro / teaching ── */
function IntroScene({ task, onCorrect }: { task: ValidityTask; onCorrect: () => void }) {
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
              Blocks must touch end-to-end.
            </p>
            <p className="text-base font-semibold leading-relaxed text-[#5f4725]">
              No gaps, no overlaps — that makes the measurement fair.
            </p>
          </div>
        </div>

        {task.objectImageSrc ? (
          <div className="mb-3">
            <MeasuredObject imageSrc={task.objectImageSrc} label={task.objectLabel} length={task.length} compact />
          </div>
        ) : null}

        <div className="space-y-3">
          {(task.teachingArrangements ?? []).map((a, idx) => (
            <div key={idx} className="rounded-[26px] border border-[rgba(214,184,108,0.28)] bg-[rgba(255,252,245,0.92)] p-3">
              <RodFrame tone={a.flaw === "none" ? "good" : "bad"}>
                <FlawedRod length={task.length} flaw={a.flaw} flawIndex={a.flawIndex} unitPx={28} />
              </RodFrame>
              <div className="mt-2 text-center text-sm font-bold text-[#5f4725]">{a.caption}</div>
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
            Start Checking
          </button>
        </div>
      </div>
    </PathShell>
  );
}

/* ── Activity A: which measurement is correct? ── */
function ChooseScene({ task, onCorrect, onWrong }: { task: ValidityTask; onCorrect: () => void; onWrong: () => void }) {
  return (
    <PathShell badge={task.badgeLabel ?? "Which Is Correct?"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      {task.objectImageSrc ? (
        <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-3 shadow-sm">
          <MeasuredObject imageSrc={task.objectImageSrc} label={task.objectLabel} length={task.length} compact />
        </div>
      ) : null}
      <div className="grid gap-3">
        {(task.arrangements ?? []).map((a, idx) => (
          <button
            key={a.id}
            type="button"
            onClick={() => (a.id === task.correctArrangementId ? onCorrect() : onWrong())}
            className="relative rounded-[26px] border border-transparent text-left transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[rgba(167,139,250,0.25)]"
          >
            <span className="absolute right-3 top-3 z-10">
              <OptionReadAloudButton text={`Explorer ${String.fromCharCode(65 + idx)}`} />
            </span>
            <div className="mb-1 px-1 text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">
              Explorer {String.fromCharCode(65 + idx)}
            </div>
            <RodFrame>
              <FlawedRod length={task.length} flaw={a.flaw} flawIndex={a.flawIndex} unitPx={32} />
            </RodFrame>
          </button>
        ))}
      </div>
    </PathShell>
  );
}

const FLAW_LABEL: Record<Flaw, string> = { none: "Nothing wrong", gap: "Gap", overlap: "Overlap" };

/* ── Activity B: find the problem ── */
function DiagnoseScene({ task, onCorrect, onWrong }: { task: ValidityTask; onCorrect: () => void; onWrong: () => void }) {
  const options = task.diagnoseOptions ?? (["gap", "overlap", "none"] as Flaw[]);
  return (
    <PathShell badge={task.badgeLabel ?? "Find the Problem"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        {task.objectImageSrc ? (
          <MeasuredObject imageSrc={task.objectImageSrc} label={task.objectLabel} length={task.length} compact />
        ) : null}
        <RodFrame>
          <FlawedRod length={task.length} flaw={task.flaw ?? "none"} flawIndex={task.flawIndex} unitPx={34} />
        </RodFrame>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => (opt === (task.flaw ?? "none") ? onCorrect() : onWrong())}
            className="relative flex min-h-[72px] items-center justify-center rounded-[24px] border-2 border-[rgba(214,184,108,0.55)] bg-[#fffaf0] px-2 text-center text-lg font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <span className="absolute right-3 top-3 z-10">
              <OptionReadAloudButton text={FLAW_LABEL[opt]} />
            </span>
            {FLAW_LABEL[opt]}
          </button>
        ))}
      </div>
    </PathShell>
  );
}

/* ── Activity C: fix the measurement (snap blocks together) ── */
function FixScene({ task, onCorrect }: { task: ValidityTask; onCorrect: () => void }) {
  const [fixed, setFixed] = useState(false);
  function fix() {
    if (fixed) return;
    setFixed(true);
    window.setTimeout(() => onCorrect(), 550);
  }
  return (
    <PathShell badge={task.badgeLabel ?? "Fix the Measurement"} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="rounded-[24px] border border-[rgba(214,184,108,0.4)] bg-white p-4 shadow-sm">
        {task.objectImageSrc ? (
          <MeasuredObject imageSrc={task.objectImageSrc} label={task.objectLabel} length={task.length} compact />
        ) : null}
        <button type="button" onClick={fix} disabled={fixed} className="w-full" title="Tap to snap the blocks together">
          <RodFrame tone={fixed ? "good" : "bad"}>
            <FlawedRod length={task.length} flaw={fixed ? "none" : task.flaw ?? "gap"} flawIndex={task.flawIndex} unitPx={34} />
          </RodFrame>
        </button>
      </div>
      <button
        type="button"
        onClick={fix}
        disabled={fixed}
        className="flex min-h-[72px] w-full items-center justify-center gap-2 rounded-[22px] border-2 border-[rgba(214,184,108,0.6)] bg-[#fffaf0] text-xl font-black text-[#2c1c07] shadow-sm transition hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
      >
        {fixed ? <Check className="h-6 w-6 text-emerald-600" /> : <MoveHorizontal className="h-6 w-6" />}
        {fixed ? "Fixed!" : "Snap together"}
      </button>
    </PathShell>
  );
}

export function MeasurelandsValidityTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: ValidityTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  if (task.scene === "intro") return <IntroScene task={task} onCorrect={onCorrect} />;
  if (task.scene === "choose") return <ChooseScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  if (task.scene === "diagnose") return <DiagnoseScene task={task} onCorrect={onCorrect} onWrong={onWrong} />;
  return <FixScene task={task} onCorrect={onCorrect} />;
}
