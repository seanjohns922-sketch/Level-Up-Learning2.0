"use client";

import { useEffect, useMemo, useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type GroundCollectTask = Extract<PracticeTask, { kind: "groundCollect" }>;
type GroundBuildTask = Extract<PracticeTask, { kind: "groundBuild" }>;
type GroundFlashTask = Extract<PracticeTask, { kind: "groundFlash" }>;

const OBJECT_META = {
  dots: { label: "dots", emoji: "●" },
  gems: { label: "gems", emoji: "◆" },
  stars: { label: "stars", emoji: "★" },
  blocks: { label: "blocks", emoji: "■" },
  robot_tokens: { label: "robot tokens", emoji: "⬢" },
  energy_orbs: { label: "energy orbs", emoji: "⬤" },
} as const;

function GroundMiniShell({
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
      <div className="rounded-[28px] border border-cyan-200/70 bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-5 shadow-[0_6px_18px_rgba(13,148,136,0.08)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-800">
          {badge}
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-1 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
            {prompt}
          </div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

function GroundToken({
  objectType,
  selected = false,
  onClick,
}: {
  objectType: keyof typeof OBJECT_META;
  selected?: boolean;
  onClick?: () => void;
}) {
  const meta = OBJECT_META[objectType];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex h-14 w-14 items-center justify-center rounded-full border-2 text-3xl transition sm:h-16 sm:w-16 ${
        selected
          ? "border-teal-400 bg-teal-100 text-teal-800 shadow-[0_0_18px_rgba(45,212,191,0.25)]"
          : "border-cyan-200 bg-white text-teal-700 hover:border-cyan-300 hover:bg-cyan-50"
      }`}
    >
      {meta.emoji}
    </button>
  );
}

export function GroundCollectTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundCollectTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  function toggle(id: number) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  }

  function check() {
    if (selectedIds.length === task.targetNumber) onCorrect();
    else onWrong();
  }

  return (
    <GroundMiniShell badge="Collect Game" prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-cyan-50 px-4 py-2">
          <div className="text-sm font-black uppercase tracking-[0.16em] text-teal-800">Collected</div>
          <div className="text-2xl font-black text-teal-900">
            {selectedIds.length} / {task.targetNumber}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {Array.from({ length: task.totalObjects }).map((_, index) => (
            <GroundToken
              key={`${task.objectType}-${index}`}
              objectType={task.objectType}
              selected={selectedIds.includes(index)}
              onClick={() => toggle(index)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setSelectedIds([])}
          className="rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-4 text-base font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
        >
          Reset
        </button>
        <button
          type="button"
          onClick={check}
          className="rounded-[22px] bg-gradient-to-r from-teal-600 to-cyan-500 px-4 py-4 text-base font-black text-white shadow-[0_10px_24px_rgba(13,148,136,0.18)] transition hover:brightness-110"
        >
          Done
        </button>
      </div>
    </GroundMiniShell>
  );
}

export function GroundBuildTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundBuildTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [built, setBuilt] = useState(0);

  const tray = useMemo(() => Array.from({ length: 5 }), []);

  function check() {
    if (built === task.targetNumber) onCorrect();
    else onWrong();
  }

  return (
    <GroundMiniShell badge="Build Game" prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-cyan-50 px-4 py-2">
          <div className="text-sm font-black uppercase tracking-[0.16em] text-teal-800">Built</div>
          <div className="text-2xl font-black text-teal-900">{built}</div>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {tray.map((_, index) => (
            <div
              key={`tray-${index}`}
              className="flex h-14 items-center justify-center rounded-full border-2 border-dashed border-cyan-200 bg-cyan-50/50 text-3xl sm:h-16"
            >
              {index < built ? OBJECT_META[task.objectType].emoji : ""}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setBuilt((current) => Math.max(0, current - 1))}
          className="rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-4 text-2xl font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setBuilt((current) => Math.min(5, current + 1))}
          className="rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-4 text-2xl font-black text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
        >
          +
        </button>
        <button
          type="button"
          onClick={check}
          className="rounded-[22px] bg-gradient-to-r from-teal-600 to-cyan-500 px-4 py-4 text-base font-black text-white shadow-[0_10px_24px_rgba(13,148,136,0.18)] transition hover:brightness-110"
        >
          Done
        </button>
      </div>
    </GroundMiniShell>
  );
}

export function GroundFlashTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundFlashTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setRevealed(false), task.revealMs ?? 1200);
    return () => window.clearTimeout(timeout);
  }, [task]);

  return (
    <GroundMiniShell badge="Flash Game" prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-center text-sm font-black uppercase tracking-[0.16em] text-teal-800">
          {revealed ? "Look carefully" : "Now tap the number"}
        </div>
        <div className="flex min-h-[108px] items-center justify-center rounded-[20px] bg-cyan-50 px-4 py-4">
          {revealed ? (
            <div className="flex flex-wrap justify-center gap-3">
              {Array.from({ length: task.targetNumber }).map((_, index) => (
                <span
                  key={`${task.objectType}-${index}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-3xl text-teal-700 shadow-sm"
                >
                  {OBJECT_META[task.objectType].emoji}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-lg font-black text-slate-500">What did you see?</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="flex min-h-[112px] items-center justify-center rounded-[24px] border-2 border-cyan-200 bg-white text-5xl font-black text-teal-900 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_0_18px_rgba(34,211,238,0.14)] active:scale-[0.98]"
          >
            {option.numeral}
          </button>
        ))}
      </div>
    </GroundMiniShell>
  );
}
