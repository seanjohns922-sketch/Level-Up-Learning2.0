"use client";

import { useRef, useState } from "react";
import { Check, Play, RotateCcw, Send, Sparkles, X } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import { PositionObjectVisual } from "@/components/starpath/StarpathPositionCards";
import {
  ARROW_ICON,
  DELTA,
  DIRECTION_WORD,
  DirectionGrid,
  GridMarker,
  type Cell,
  type Direction,
} from "@/components/starpath/StarpathDirectionCards";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type TurnMoveTask = Extract<PracticeTask, { kind: "starpathTurnMove" }>;
type RouteDebugTask = Extract<PracticeTask, { kind: "starpathRouteDebug" }>;
type RouteBuildTask = Extract<PracticeTask, { kind: "starpathRouteBuild" }>;
type RouteRecordTask = Extract<PracticeTask, { kind: "starpathRouteRecord" }>;

const FACING_ANGLE: Record<Direction, number> = { up: -90, right: 0, down: 90, left: 180 };

const PATH_STYLE = (
  <style>{`
    @keyframes sp-path-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
    .sp-path-shake { animation: sp-path-shake 0.4s ease-in-out; }
    @keyframes sp-path-pop { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
    .sp-path-pop { animation: sp-path-pop 0.4s ease-out; }
    @media (prefers-reduced-motion: reduce) { .sp-path-shake, .sp-path-pop { animation: none; } }
  `}</style>
);

// ── Level 1 · Week 5 — Direction Words (facing-aware turns and moves) ─────────
// A rover faces a direction. The student turns from that facing or reads which
// move was made. Single-answer so it grades cleanly in the weekly quiz.
export function StarpathTurnMoveCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: TurnMoveTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const banner =
    task.mode === "turn" && task.turn
      ? `Facing ${DIRECTION_WORD[task.facing]} · turn ${task.turn}`
      : task.mode === "face"
        ? `Facing ${DIRECTION_WORD[task.facing]}`
        : "Which move was that?";
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto mb-5 flex w-full max-w-sm flex-col items-center rounded-2xl border-2 border-cyan-300 bg-gradient-to-b from-indigo-950 via-violet-900 to-slate-950 p-5 text-white shadow-inner">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">{banner}</span>
        <div className="relative mt-3 flex h-28 w-28 items-center justify-center">
          <span
            aria-hidden="true"
            className="absolute h-24 w-24 rounded-full border-2 border-dashed border-cyan-300/40"
          />
          <span
            aria-hidden="true"
            className="absolute text-cyan-300 transition-transform"
            style={{ transform: `rotate(${FACING_ANGLE[task.facing]}deg) translateX(38px)` }}
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
              <path d="M4 12h12l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <PositionObjectVisual objectId={task.object} className="h-16 w-16" />
        </div>
      </div>
      <div className="mx-auto grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
        {task.options.map((option) => {
          const Icon = option.direction ? ARROW_ICON[option.direction] : null;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
              className="relative flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-violet-200 bg-white px-3 text-indigo-950 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
            >
              {Icon ? <Icon className="h-6 w-6" strokeWidth={2.75} /> : null}
              <span className="text-sm font-black">{option.label}</span>
              <OptionReadAloudButton text={option.label} className="absolute right-1.5 top-1.5" />
            </button>
          );
        })}
      </div>
      {PATH_STYLE}
    </div>
  );
}

// ── Level 1 · Week 6 — Route debugger (find the broken step) ──────────────────
export function StarpathRouteDebugCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: RouteDebugTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [wrongTap, setWrongTap] = useState<string | null>(null);

  function tap(stepId: string) {
    if (stepId === task.wrongStepId) {
      onCorrect();
    } else {
      setWrongTap(stepId);
      setTimeout(() => setWrongTap((value) => (value === stepId ? null : value)), 440);
      onWrong();
    }
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <DirectionGrid cols={task.cols} rows={task.rows}>
        <GridMarker cell={task.goal} cols={task.cols} rows={task.rows} z={5}>
          <div className="flex h-4/5 w-4/5 items-center justify-center rounded-xl border-2 border-dashed border-amber-300/70 bg-amber-300/10">
            <PositionObjectVisual objectId={task.goal.object} className="h-3/4 w-3/4" />
          </div>
        </GridMarker>
        <GridMarker cell={task.start} cols={task.cols} rows={task.rows} z={20}>
          <PositionObjectVisual objectId={task.object} className="h-4/5 w-4/5" />
        </GridMarker>
      </DirectionGrid>
      <p className="mt-4 mb-2 text-center text-xs font-black uppercase tracking-[0.16em] text-violet-700">
        Tap the step that breaks the route
      </p>
      <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-2">
        {task.steps.map((step, index) => {
          const Icon = ARROW_ICON[step.direction];
          return (
            <button
              key={step.id}
              type="button"
              aria-label={`Step ${index + 1}: ${DIRECTION_WORD[step.direction]}`}
              onClick={() => tap(step.id)}
              className={[
                "flex min-h-14 items-center gap-1.5 rounded-2xl border-2 px-3 py-2 font-black text-indigo-950 transition active:scale-95",
                wrongTap === step.id
                  ? "sp-path-shake border-rose-400 bg-rose-100"
                  : "border-violet-200 bg-white hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md",
              ].join(" ")}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-xs">{index + 1}</span>
              <Icon className="h-5 w-5" strokeWidth={2.75} />
              <span className="text-sm">{DIRECTION_WORD[step.direction]}</span>
            </button>
          );
        })}
      </div>
      {PATH_STYLE}
    </div>
  );
}

// ── Level 1 · Week 7 — Give the Route (compose an ordered sequence) ───────────
// The student appends moves to build a route. "Run" steps the traveller through
// the moves; success when it lands on the goal without leaving the grid.
export function StarpathRouteBuildCard({
  task,
  onComplete,
}: {
  task: RouteBuildTask;
  onComplete: () => void;
}) {
  const [moves, setMoves] = useState<Direction[]>(task.preset ? [...task.preset] : []);
  const [cell, setCell] = useState<Cell>(task.start);
  const [status, setStatus] = useState<"editing" | "running" | "fail" | "done">("editing");
  const doneRef = useRef(false);
  const cellKey = (value: Cell) => `${value.r}:${value.c}`;
  const blockedKeys = new Set((task.blocked ?? []).map(cellKey));
  const checkpointKeys = new Set((task.checkpoints ?? []).map(cellKey));

  function add(direction: Direction) {
    if (status === "running" || status === "done") return;
    if (moves.length >= task.maxSteps) return;
    setMoves((prev) => [...prev, direction]);
    setStatus("editing");
    setCell(task.start);
  }

  function undo() {
    if (status === "running" || status === "done") return;
    setMoves((prev) => prev.slice(0, -1));
    setStatus("editing");
    setCell(task.start);
  }

  function reset() {
    if (status === "done") return;
    setMoves(task.preset ? [...task.preset] : []);
    setStatus("editing");
    setCell(task.start);
  }

  function run() {
    if (status === "running" || status === "done" || moves.length === 0) return;
    setStatus("running");
    let index = 0;
    let position: Cell = task.start;
    let leftGrid = false;
    let hitBlocked = false;
    const visitedCheckpoints = new Set<string>();
    if (checkpointKeys.has(cellKey(position))) {
      visitedCheckpoints.add(cellKey(position));
    }
    setCell(task.start);
    const timer = window.setInterval(() => {
      const direction = moves[index];
      if (!direction) {
        window.clearInterval(timer);
        const reached = !leftGrid
          && !hitBlocked
          && visitedCheckpoints.size === checkpointKeys.size
          && position.r === task.goal.r
          && position.c === task.goal.c;
        if (reached && !doneRef.current) {
          doneRef.current = true;
          setStatus("done");
          setTimeout(onComplete, 1000);
        } else {
          setStatus("fail");
        }
        return;
      }
      const delta = DELTA[direction];
      const next = {
        r: position.r + delta.dr,
        c: position.c + delta.dc,
      };
      if (
        next.r < 0
        || next.r >= task.rows
        || next.c < 0
        || next.c >= task.cols
      ) {
        leftGrid = true;
      } else {
        position = next;
        if (blockedKeys.has(cellKey(position))) hitBlocked = true;
        if (checkpointKeys.has(cellKey(position))) {
          visitedCheckpoints.add(cellKey(position));
        }
      }
      setCell(position);
      index += 1;
    }, 340);
  }

  const paletteWord =
    task.mode === "record"
      ? "Record the route"
      : task.mode === "improve"
        ? "Fix the route"
        : task.mode === "mission"
          ? "Plan the mission"
          : "Build the route";

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="relative">
        <DirectionGrid cols={task.cols} rows={task.rows}>
          {task.blocked?.map((blocked) => (
            <GridMarker key={`blocked-${cellKey(blocked)}`} cell={blocked} cols={task.cols} rows={task.rows} z={8}>
              <div className="flex h-3/4 w-3/4 items-center justify-center rounded-xl border-2 border-rose-300 bg-rose-950/80 text-rose-200 shadow-inner">
                <X className="h-1/2 w-1/2" strokeWidth={3} />
              </div>
            </GridMarker>
          ))}
          {task.checkpoints?.map((checkpoint) => (
            <GridMarker key={`checkpoint-${cellKey(checkpoint)}`} cell={checkpoint} cols={task.cols} rows={task.rows} z={9}>
              <div className="flex h-3/4 w-3/4 items-center justify-center rounded-xl border-2 border-dashed border-cyan-300 bg-cyan-300/10">
                <PositionObjectVisual objectId={checkpoint.object} className="h-3/4 w-3/4" />
              </div>
            </GridMarker>
          ))}
          <GridMarker cell={task.goal} cols={task.cols} rows={task.rows} z={5}>
            <div className="flex h-4/5 w-4/5 items-center justify-center rounded-xl border-2 border-dashed border-amber-300/70 bg-amber-300/10">
              <PositionObjectVisual objectId={task.goal.object} className="h-3/4 w-3/4" />
            </div>
          </GridMarker>
          <GridMarker cell={cell} cols={task.cols} rows={task.rows} z={20}>
            <PositionObjectVisual objectId={task.object} className="h-4/5 w-4/5" />
          </GridMarker>
        </DirectionGrid>
        {status === "done" ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="sp-path-pop flex flex-col items-center gap-1 rounded-2xl bg-white/90 px-5 py-3 text-center shadow-xl">
              <Sparkles className="h-8 w-8 text-amber-500" />
              <span className="text-lg font-black text-indigo-950">Route complete!</span>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mx-auto mt-4 max-w-xl">
        {task.missionRule ? (
          <div className="mb-3 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-center text-sm font-black text-amber-900">
            Mission rule: {task.missionRule}
          </div>
        ) : null}
        <div className="mb-2 flex items-center justify-between">
          <div>
            <span className="block text-xs font-black uppercase tracking-[0.16em] text-violet-700">{paletteWord}</span>
            <span className="mt-1 block text-xs font-semibold text-slate-500">
              Any route works if it stays on the grid and reaches the goal.
            </span>
          </div>
          <span className="text-xs font-black text-slate-500">
            {moves.length}/{task.maxSteps} maximum
          </span>
        </div>
        <div className="mb-3 flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/60 p-2">
          {moves.length === 0 ? (
            <span className="px-2 text-sm font-semibold text-slate-500">Add moves to guide the traveller.</span>
          ) : (
            moves.map((direction, index) => {
              const Icon = ARROW_ICON[direction];
              return (
                <span
                  key={`${direction}-${index}`}
                  className="flex items-center gap-1 rounded-xl border-2 border-violet-200 bg-white px-2.5 py-1.5 text-sm font-black text-indigo-950"
                >
                  <span className="text-xs text-violet-500">{index + 1}</span>
                  <Icon className="h-4 w-4" strokeWidth={2.75} />
                </span>
              );
            })
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {task.palette.map((direction) => {
            const Icon = ARROW_ICON[direction];
            const disabled = status === "running" || status === "done" || moves.length >= task.maxSteps;
            return (
              <button
                key={direction}
                type="button"
                aria-label={`Add ${DIRECTION_WORD[direction]}`}
                disabled={disabled}
                onClick={() => add(direction)}
                className="flex h-12 min-w-12 items-center justify-center gap-1 rounded-xl border-2 border-violet-300 bg-white px-3 text-indigo-950 transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md active:scale-95 disabled:opacity-30"
              >
                <Icon className="h-5 w-5" strokeWidth={2.75} />
                <span className="text-sm font-black">{DIRECTION_WORD[direction]}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={status === "running" || status === "done" || moves.length === 0}
            className="flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 font-black text-slate-700 transition hover:border-slate-300 active:scale-95 disabled:opacity-30"
          >
            <X className="h-4 w-4" strokeWidth={3} /> Undo
          </button>
          <button
            type="button"
            onClick={reset}
            disabled={status === "running" || status === "done"}
            className="flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 font-black text-slate-700 transition hover:border-slate-300 active:scale-95 disabled:opacity-30"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={3} /> Reset
          </button>
          <button
            type="button"
            onClick={run}
            disabled={status === "running" || status === "done" || moves.length === 0}
            className="flex min-h-11 items-center gap-1.5 rounded-xl bg-violet-700 px-6 font-black text-white shadow-lg transition hover:bg-violet-600 active:scale-95 disabled:opacity-40"
          >
            <Play className="h-4 w-4 fill-white" strokeWidth={3} /> Run route
          </button>
        </div>

        {status === "fail" ? (
          <p className="sp-path-shake mt-3 flex items-center justify-center gap-1.5 text-center text-sm font-black text-rose-600">
            <X className="h-4 w-4" strokeWidth={3} /> {task.feedback.wrong}
          </p>
        ) : null}
        {status === "done" ? (
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-sm font-black text-emerald-600">
            <Check className="h-4 w-4" strokeWidth={3} /> {task.feedback.correct}
          </p>
        ) : null}
      </div>
      {PATH_STYLE}
    </div>
  );
}

function routeTrail(start: Cell, route: Direction[]) {
  const cells: Array<{ cell: Cell; direction: Direction; step: number }> = [];
  let position = start;
  route.forEach((direction, index) => {
    const delta = DELTA[direction];
    position = { r: position.r + delta.dr, c: position.c + delta.dc };
    cells.push({ cell: position, direction, step: index + 1 });
  });
  return cells;
}

// ── Level 1 · Week 6 — Directions for a Friend ──────────────────────────────
// The route is already planned. Students communicate it by translating the
// numbered visual trail into an ordered direction sequence.
export function StarpathRouteRecordCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: RouteRecordTask;
  onCorrect: () => void;
  onWrong: (studentAnswer?: string) => void;
}) {
  const [moves, setMoves] = useState<Direction[]>([]);
  const [wrong, setWrong] = useState(false);
  const trail = routeTrail(task.start, task.route);

  function add(direction: Direction) {
    if (moves.length >= task.route.length) return;
    setMoves((previous) => [...previous, direction]);
    setWrong(false);
  }

  function sendDirections() {
    const correct =
      moves.length === task.route.length
      && moves.every((direction, index) => direction === task.route[index]);
    if (correct) {
      onCorrect();
      return;
    }
    setWrong(true);
    onWrong(moves.join(", "));
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mb-4 rounded-xl border-2 border-cyan-300 bg-cyan-50 px-4 py-3 text-center text-sm font-black text-indigo-950">
        Read the glowing trail from step 1. Record the same moves for your friend.
      </div>
      <DirectionGrid cols={task.cols} rows={task.rows}>
        {trail.map(({ cell, direction, step }) => {
          const Icon = ARROW_ICON[direction];
          return (
            <GridMarker key={`trail-${step}`} cell={cell} cols={task.cols} rows={task.rows} z={8}>
              <div className="flex h-3/5 w-3/5 items-center justify-center gap-0.5 rounded-lg border border-cyan-200 bg-cyan-300/30 text-cyan-50 shadow-[0_0_16px_rgba(34,211,238,0.45)]">
                <span className="text-[10px] font-black">{step}</span>
                <Icon className="h-3 w-3" strokeWidth={3} />
              </div>
            </GridMarker>
          );
        })}
        <GridMarker cell={task.goal} cols={task.cols} rows={task.rows} z={10}>
          <div className="flex h-4/5 w-4/5 items-center justify-center rounded-xl border-2 border-dashed border-amber-300/70 bg-amber-300/10">
            <PositionObjectVisual objectId={task.goal.object} className="h-3/4 w-3/4" />
          </div>
        </GridMarker>
        <GridMarker cell={task.start} cols={task.cols} rows={task.rows} z={20}>
          <PositionObjectVisual objectId={task.object} className="h-4/5 w-4/5" />
        </GridMarker>
      </DirectionGrid>

      <div className="mx-auto mt-4 max-w-xl">
        <div className={[
          "mb-3 flex min-h-14 flex-wrap items-center gap-2 rounded-xl border-2 border-dashed bg-violet-50/60 p-2",
          wrong ? "sp-path-shake border-rose-400" : "border-violet-200",
        ].join(" ")}>
          {moves.length === 0 ? (
            <span className="px-2 text-sm font-semibold text-slate-500">
              Add the directions shown by the numbered trail.
            </span>
          ) : moves.map((direction, index) => {
            const Icon = ARROW_ICON[direction];
            return (
              <span key={`${direction}-${index}`} className="flex items-center gap-1 rounded-lg border-2 border-violet-200 bg-white px-2.5 py-1.5 text-sm font-black text-indigo-950">
                <span className="text-xs text-violet-500">{index + 1}</span>
                <Icon className="h-4 w-4" strokeWidth={2.75} />
              </span>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {(Object.keys(ARROW_ICON) as Direction[]).map((direction) => {
            const Icon = ARROW_ICON[direction];
            return (
              <button
                key={direction}
                type="button"
                disabled={moves.length >= task.route.length}
                onClick={() => add(direction)}
                className="flex h-12 min-w-12 items-center justify-center gap-1 rounded-xl border-2 border-violet-300 bg-white px-3 text-indigo-950 transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md active:scale-95 disabled:opacity-30"
              >
                <Icon className="h-5 w-5" strokeWidth={2.75} />
                <span className="text-sm font-black">{DIRECTION_WORD[direction]}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setMoves((previous) => previous.slice(0, -1))}
            disabled={moves.length === 0}
            className="flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 font-black text-slate-700 disabled:opacity-30"
          >
            <X className="h-4 w-4" strokeWidth={3} /> Undo
          </button>
          <button
            type="button"
            onClick={() => {
              setMoves([]);
              setWrong(false);
            }}
            className="flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 font-black text-slate-700"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={3} /> Reset
          </button>
          <button
            type="button"
            onClick={sendDirections}
            disabled={moves.length !== task.route.length}
            className="flex min-h-11 items-center gap-1.5 rounded-xl bg-violet-700 px-6 font-black text-white shadow-lg transition hover:bg-violet-600 active:scale-95 disabled:opacity-40"
          >
            <Send className="h-4 w-4" strokeWidth={3} /> Send directions
          </button>
        </div>
      </div>
      {PATH_STYLE}
    </div>
  );
}
