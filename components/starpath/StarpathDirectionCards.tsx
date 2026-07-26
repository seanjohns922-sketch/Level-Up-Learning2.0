"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Check, Sparkles, Star } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import { PositionObjectVisual } from "@/components/starpath/StarpathPositionCards";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type DirectionPathTask = Extract<PracticeTask, { kind: "starpathDirectionPath" }>;
type DirectionChoiceTask = Extract<PracticeTask, { kind: "starpathDirectionChoice" }>;
type Direction = "up" | "down" | "left" | "right";
type Cell = { r: number; c: number };

const DIRECTION_WORD: Record<Direction, string> = { up: "Up", down: "Down", left: "Left", right: "Right" };
const DELTA: Record<Direction, { dr: number; dc: number }> = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
};
const ARROW_ICON: Record<Direction, typeof ArrowUp> = { up: ArrowUp, down: ArrowDown, left: ArrowLeft, right: ArrowRight };

const DIR_SHAKE = (
  <style>{`
    @keyframes sp-dir-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
    .sp-dir-shake { animation: sp-dir-shake 0.4s ease-in-out; }
    @keyframes sp-dir-pop { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
    .sp-dir-pop { animation: sp-dir-pop 0.4s ease-out; }
    @media (prefers-reduced-motion: reduce) { .sp-dir-shake, .sp-dir-pop { animation: none; } }
  `}</style>
);

function cellStyle(cell: Cell, cols: number, rows: number): CSSProperties {
  return {
    left: `${((cell.c + 0.5) / cols) * 100}%`,
    top: `${((cell.r + 0.5) / rows) * 100}%`,
    transform: "translate(-50%,-50%)",
    transition: "left 0.32s ease, top 0.32s ease",
  };
}

const SURFACE_BG: Record<"space" | "planet", string> = {
  space: "bg-gradient-to-b from-indigo-950 via-violet-900 to-slate-950",
  planet: "bg-gradient-to-b from-teal-900 via-emerald-950 to-stone-950",
};

function DirectionGrid({
  cols,
  rows,
  surface = "space",
  children,
}: {
  cols: number;
  rows: number;
  surface?: "space" | "planet";
  children: ReactNode;
}) {
  return (
    <div className="relative mx-auto w-full max-w-md" style={{ aspectRatio: `${cols} / ${rows}` }}>
      <div className={`absolute inset-0 overflow-hidden rounded-2xl border-2 border-violet-200 shadow-inner ${SURFACE_BG[surface]}`}>
        <div
          className="grid h-full w-full"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
        >
          {Array.from({ length: cols * rows }).map((_, index) => (
            <div key={index} className="border border-cyan-200/12" />
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}

function GridMarker({
  cell,
  cols,
  rows,
  children,
  faded = false,
  z = 10,
}: {
  cell: Cell;
  cols: number;
  rows: number;
  children: ReactNode;
  faded?: boolean;
  z?: number;
}) {
  return (
    <div
      className={["absolute flex items-center justify-center", faded ? "opacity-40" : ""].join(" ")}
      style={{ ...cellStyle(cell, cols, rows), width: `${(1 / cols) * 100}%`, height: `${(1 / rows) * 100}%`, zIndex: z }}
    >
      {children}
    </div>
  );
}

function ArrowPad({
  onPick,
  wrong,
  disabledDirections,
}: {
  onPick: (direction: Direction) => void;
  wrong?: Direction | null;
  disabledDirections?: Direction[];
}) {
  const cellFor: Record<Direction, string> = {
    up: "col-start-2 row-start-1",
    left: "col-start-1 row-start-2",
    right: "col-start-3 row-start-2",
    down: "col-start-2 row-start-3",
  };
  return (
    <div className="mx-auto mt-5 grid w-44 grid-cols-3 grid-rows-3 gap-2">
      {(Object.keys(DIRECTION_WORD) as Direction[]).map((direction) => {
        const Icon = ARROW_ICON[direction];
        const isDisabled = disabledDirections?.includes(direction) ?? false;
        return (
          <button
            key={direction}
            type="button"
            aria-label={DIRECTION_WORD[direction]}
            disabled={isDisabled}
            onClick={() => onPick(direction)}
            className={[
              cellFor[direction],
              "flex h-12 w-12 items-center justify-center rounded-xl border-2 text-indigo-950 transition active:scale-95",
              wrong === direction
                ? "sp-dir-shake border-rose-400 bg-rose-100"
                : "border-violet-300 bg-white hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md",
              isDisabled ? "opacity-30" : "",
            ].join(" ")}
          >
            <Icon className="h-6 w-6" strokeWidth={2.75} />
          </button>
        );
      })}
      <div className="col-start-2 row-start-2 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-violet-300">
        Move
      </div>
    </div>
  );
}

// ── Follow the directions (path) ─────────────────────────────────────────────
export function StarpathDirectionPathCard({
  task,
  onComplete,
}: {
  task: DirectionPathTask;
  onComplete: () => void;
}) {
  const cellKey = (c: Cell) => `${c.r},${c.c}`;
  const collectibleKeys = useRef(new Set((task.collectibles ?? []).map(cellKey)));
  const totalStars = task.collectibles?.length ?? 0;

  const [cell, setCell] = useState<Cell>(task.start);
  const [visited, setVisited] = useState<Cell[]>([task.start]);
  const [collected, setCollected] = useState<Set<string>>(() => new Set());
  const [stepIndex, setStepIndex] = useState(0);
  const [wrong, setWrong] = useState<Direction | null>(null);
  const [reached, setReached] = useState(false);
  const doneRef = useRef(false);
  const step = task.steps[stepIndex];

  function pick(direction: Direction) {
    if (doneRef.current || !step) return;
    if (direction === step.direction) {
      const delta = DELTA[direction];
      const next: Cell = {
        r: Math.min(task.rows - 1, Math.max(0, cell.r + delta.dr)),
        c: Math.min(task.cols - 1, Math.max(0, cell.c + delta.dc)),
      };
      setCell(next);
      setVisited((prev) => [...prev, next]);
      if (collectibleKeys.current.has(cellKey(next))) {
        setCollected((prev) => new Set(prev).add(cellKey(next)));
      }
      if (stepIndex + 1 >= task.steps.length) {
        doneRef.current = true;
        setReached(true);
        setTimeout(onComplete, 900);
      } else {
        setStepIndex(stepIndex + 1);
      }
    } else {
      setWrong(direction);
      setTimeout(() => setWrong((value) => (value === direction ? null : value)), 440);
    }
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-cyan-300 bg-cyan-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-sm font-black text-white">
            {Math.min(stepIndex + 1, task.steps.length)}
          </span>
          <span className="text-base font-black text-indigo-950 sm:text-lg">
            {reached ? "You made it!" : step?.instruction ?? "Done!"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {totalStars > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-sm font-black text-amber-700">
              <Star className="h-4 w-4 fill-amber-400 text-amber-500" /> {collected.size}/{totalStars}
            </span>
          ) : null}
          {step && !reached ? <ReadAloudBtn text={step.speakText} size="md" label="Read" className="shrink-0" /> : null}
        </div>
      </div>
      <div className="relative">
        <DirectionGrid cols={task.cols} rows={task.rows} surface={task.surface}>
          {/* Trail */}
          {task.trail
            ? visited.slice(0, -1).map((visitedCell, index) => (
                <GridMarker key={`trail-${index}`} cell={visitedCell} cols={task.cols} rows={task.rows} z={2}>
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-300/60 shadow-[0_0_8px_rgba(103,232,249,0.7)]" />
                </GridMarker>
              ))
            : null}
          {/* Collectible stars */}
          {(task.collectibles ?? []).map((starCell, index) => {
            const got = collected.has(cellKey(starCell));
            return (
              <GridMarker key={`star-${index}`} cell={starCell} cols={task.cols} rows={task.rows} z={got ? 3 : 6}>
                <Star
                  className={[
                    "h-1/2 w-1/2 transition",
                    got ? "scale-125 fill-amber-300 text-amber-400 opacity-40" : "fill-amber-300 text-amber-500",
                  ].join(" ")}
                />
              </GridMarker>
            );
          })}
          {task.goal ? (
            <GridMarker cell={task.goal} cols={task.cols} rows={task.rows} z={5}>
              <div className="flex h-4/5 w-4/5 items-center justify-center rounded-xl border-2 border-dashed border-amber-300/70 bg-amber-300/10">
                {task.goal.reveal && !reached ? (
                  <span className="text-2xl font-black text-amber-300/80">?</span>
                ) : (
                  <PositionObjectVisual objectId={task.goal.object} className="h-3/4 w-3/4" />
                )}
              </div>
            </GridMarker>
          ) : null}
          <GridMarker cell={cell} cols={task.cols} rows={task.rows} z={20}>
            <PositionObjectVisual objectId={task.object} className="h-4/5 w-4/5" />
          </GridMarker>
        </DirectionGrid>
        {/* Arrival celebration */}
        {reached ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/90 px-5 py-3 text-center shadow-xl sp-dir-pop">
              <Sparkles className="h-8 w-8 text-amber-500" />
              <span className="text-lg font-black text-indigo-950">
                {task.goal?.reveal ? "Treasure found!" : "You made it!"}
              </span>
              {totalStars > 0 ? (
                <span className="text-sm font-black text-amber-600">{collected.size}/{totalStars} stars collected</span>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
      <ArrowPad onPick={pick} wrong={wrong} />
      <p className="mt-3 text-center text-sm font-semibold text-slate-600">
        Step {Math.min(stepIndex + 1, task.steps.length)} of {task.steps.length}
      </p>
      {DIR_SHAKE}
    </div>
  );
}

// ── Which way? (single choice) ───────────────────────────────────────────────
export function StarpathDirectionChoiceCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: DirectionChoiceTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <DirectionGrid cols={task.cols} rows={task.rows}>
        {task.goalObject ? (
          <>
            <GridMarker cell={task.to} cols={task.cols} rows={task.rows} z={5}>
              <PositionObjectVisual objectId={task.goalObject} className="h-4/5 w-4/5" />
            </GridMarker>
            <GridMarker cell={task.from} cols={task.cols} rows={task.rows} z={20}>
              <PositionObjectVisual objectId={task.object} className="h-4/5 w-4/5" />
            </GridMarker>
          </>
        ) : (
          <>
            <GridMarker cell={task.from} cols={task.cols} rows={task.rows} faded z={5}>
              <div className="flex h-4/5 w-4/5 items-center justify-center rounded-xl border-2 border-dashed border-white/40">
                <PositionObjectVisual objectId={task.object} className="h-3/4 w-3/4" />
              </div>
            </GridMarker>
            <GridMarker cell={task.to} cols={task.cols} rows={task.rows} z={20}>
              <PositionObjectVisual objectId={task.object} className="h-4/5 w-4/5" />
            </GridMarker>
          </>
        )}
      </DirectionGrid>
      <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
        {task.options.map((option) => {
          const Icon = ARROW_ICON[option.direction];
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
              className="relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-violet-200 bg-white px-3 text-indigo-950 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
            >
              <Icon className="h-6 w-6" strokeWidth={2.75} />
              <span className="text-sm font-black">{DIRECTION_WORD[option.direction]}</span>
              <OptionReadAloudButton text={DIRECTION_WORD[option.direction]} className="absolute right-1.5 top-1.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Small check badge reused if needed by callers.
export function DirectionDoneBadge() {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-indigo-950">
      <Check className="h-4 w-4" strokeWidth={3} />
    </span>
  );
}
