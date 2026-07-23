"use client";

import { useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { ShapeVisual, TaskHeading, SceneObjectVisual } from "@/components/starpath/StarpathShapeTaskCard";
import { SHAPE_OBJECTS, type ShapeObjectId } from "@/data/activities/starpath/ground/shape-objects";

type FoundationShape = "circle" | "triangle" | "square" | "rectangle";
type ShapeTapAllTask = Extract<PracticeTask, { kind: "starpathShapeTapAll" }>;
type OddOneOutTask = Extract<PracticeTask, { kind: "starpathOddOneOut" }>;
type CollectMissionTask = Extract<PracticeTask, { kind: "starpathCollectMission" }>;
type ObjectShapeTask = Extract<PracticeTask, { kind: "starpathObjectShape" }>;
type ShapeNameTask = Extract<PracticeTask, { kind: "starpathShapeName" }>;
type ShapeCompareTask = Extract<PracticeTask, { kind: "starpathShapeCompare" }>;

const SHAPE_ICON_COLOUR: Record<FoundationShape, string> = {
  circle: "#67e8f9",
  triangle: "#fde047",
  square: "#86efac",
  rectangle: "#f9a8d4",
};

const SHAKE_STYLE = (
  <style>{`
    @keyframes sp-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
    .sp-shake { animation: sp-shake 0.42s ease-in-out; }
    @media (prefers-reduced-motion: reduce) { .sp-shake { animation: none; } }
  `}</style>
);

// A cosmic "tap every triangle" scene. Forgiving for Ground level: wrong taps
// give a gentle in-card shake (not scored); the task completes once every item
// of the target shape has been found.
export function StarpathShapeTapAllCard({
  task,
  onComplete,
}: {
  task: ShapeTapAllTask;
  onComplete: () => void;
}) {
  const targetIds = useMemo(
    () => task.items.filter((item) => item.shape === task.targetShape).map((item) => item.id),
    [task]
  );
  const [found, setFound] = useState<Set<string>>(() => new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);
  const doneRef = useRef(false);

  function tapItem(item: ShapeTapAllTask["items"][number]) {
    if (doneRef.current) return;
    if (item.shape === task.targetShape) {
      if (found.has(item.id)) return;
      const next = new Set(found);
      next.add(item.id);
      setFound(next);
      if (next.size === targetIds.length) {
        doneRef.current = true;
        setTimeout(onComplete, 380);
      }
    } else {
      setWrongId(item.id);
      setTimeout(() => setWrongId((current) => (current === item.id ? null : current)), 480);
    }
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="relative overflow-hidden rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-indigo-950 via-violet-900 to-slate-950 p-4 shadow-inner sm:p-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }}
        />
        <div className="relative mb-3 flex items-center justify-center gap-2 text-center text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
          Found {found.size} of {targetIds.length}
        </div>
        <div className="relative grid grid-cols-3 gap-3 sm:grid-cols-4">
          {task.items.map((item) => {
            const isFound = found.has(item.id);
            const isWrong = wrongId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.shape}
                onClick={() => tapItem(item)}
                className={[
                  "relative flex min-h-24 items-center justify-center rounded-2xl border-2 p-2 transition active:scale-[0.97]",
                  isFound
                    ? "border-emerald-300 bg-emerald-400/20"
                    : "border-white/25 bg-white/10 hover:-translate-y-1 hover:border-cyan-300 hover:bg-white/20",
                  isWrong ? "sp-shake border-rose-400 bg-rose-500/20" : "",
                ].join(" ")}
              >
                <ShapeVisual shape={item.shape} colour={item.colour} className="h-16 w-16 sm:h-20 sm:w-20" />
                {isFound ? (
                  <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-indigo-950 shadow">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      {SHAKE_STYLE}
    </div>
  );
}

// A1 (Lesson 3) — Which One Doesn't Belong? Single-choice: tap the odd shape.
export function StarpathOddOneOutCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: OddOneOutTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-label={option.shape}
            onClick={() => (option.id === task.oddOptionId ? onCorrect() : onWrong())}
            className="relative flex min-h-40 items-center justify-center rounded-2xl border-2 border-violet-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            <OptionReadAloudButton text={option.shape} className="absolute right-3 top-3" />
            <ShapeVisual shape={option.shape} colour={option.colour} className="h-24 w-24" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function StarpathShapeCompareCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: ShapeCompareTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4">
        {[task.left, task.right].map((item, index) => (
          <div
            key={`${item.shape}-${index}`}
            className="flex min-h-44 items-center justify-center rounded-2xl border-2 border-violet-200 bg-white p-4 shadow-sm"
          >
            <div style={{ transform: `rotate(${item.rotation}deg)` }}>
              <ShapeVisual
                shape={item.shape}
                colour={item.colour}
                scale={item.scale}
                className="h-28 w-28 sm:h-36 sm:w-36"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-5 grid max-w-xl grid-cols-2 gap-4">
        {(["same", "different"] as const).map((answer) => (
          <button
            key={answer}
            type="button"
            onClick={() => (answer === task.answer ? onCorrect() : onWrong())}
            className="relative min-h-16 rounded-2xl border-2 border-violet-200 bg-white px-5 text-xl font-black capitalize text-indigo-950 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            {answer}
            <OptionReadAloudButton text={answer} className="absolute right-2 top-1/2 -translate-y-1/2" />
          </button>
        ))}
      </div>
    </div>
  );
}

// A (Lesson 1) — Name the Shape: shape shown, pick its name (word). Reinforces
// vocabulary — distinct from Match, which is picture -> picture.
export function StarpathShapeNameCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: ShapeNameTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto mb-5 flex w-full max-w-xs flex-col items-center rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-4">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-cyan-800">Name this shape</span>
        <ShapeVisual shape={task.shape} colour="#a5f3fc" className="mt-1 h-28 w-28" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="relative flex min-h-16 items-center justify-center rounded-2xl border-2 border-violet-200 bg-white px-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            <span className="text-xl font-black capitalize text-indigo-950">{option.name}</span>
            <OptionReadAloudButton text={option.name} className="absolute right-2 top-1/2 -translate-y-1/2" />
          </button>
        ))}
      </div>
    </div>
  );
}

// A1 (Lesson 2) — Space Object Match: one cosmic object, which shape is it?
export function StarpathObjectShapeCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: ObjectShapeTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const objectId = task.objectId as ShapeObjectId;
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto mb-5 flex w-full max-w-xs flex-col items-center rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-indigo-950 via-violet-900 to-slate-950 p-4 text-white shadow-inner">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Space object</span>
        <SceneObjectVisual objectId={objectId} />
        <span className="mt-1 text-base font-black">{SHAPE_OBJECTS[objectId].label}</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-label={option.shape}
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="relative flex min-h-36 items-center justify-center rounded-2xl border-2 border-violet-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            <OptionReadAloudButton text={option.shape} className="absolute right-2 top-2" />
            <ShapeVisual shape={option.shape} colour={option.colour} className="h-20 w-20 sm:h-24 sm:w-24" />
          </button>
        ))}
      </div>
    </div>
  );
}

// A3 (Lesson 3) — Cosmic Mission: collect exactly what Geospin asks for.
// Forgiving: tapping a shape that is not needed (or already complete) shakes
// gently; the task completes when every request is filled.
export function StarpathCollectMissionCard({
  task,
  onComplete,
}: {
  task: CollectMissionTask;
  onComplete: () => void;
}) {
  const [collected, setCollected] = useState<Set<string>>(() => new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);
  const doneRef = useRef(false);

  const needByShape = useMemo(() => {
    const map = new Map<FoundationShape, number>();
    for (const request of task.requests) map.set(request.shape, request.count);
    return map;
  }, [task.requests]);

  const gotByShape = useMemo(() => {
    const map = new Map<FoundationShape, number>();
    for (const item of task.items) {
      if (collected.has(item.id)) map.set(item.shape, (map.get(item.shape) ?? 0) + 1);
    }
    return map;
  }, [collected, task.items]);

  function tapItem(item: CollectMissionTask["items"][number]) {
    if (doneRef.current || collected.has(item.id)) return;
    const need = needByShape.get(item.shape) ?? 0;
    const got = gotByShape.get(item.shape) ?? 0;
    if (need > 0 && got < need) {
      const next = new Set(collected);
      next.add(item.id);
      setCollected(next);
      const nowGot = new Map(gotByShape);
      nowGot.set(item.shape, got + 1);
      const complete = task.requests.every((request) => (nowGot.get(request.shape) ?? 0) >= request.count);
      if (complete) {
        doneRef.current = true;
        setTimeout(onComplete, 380);
      }
    } else {
      setWrongId(item.id);
      setTimeout(() => setWrongId((current) => (current === item.id ? null : current)), 480);
    }
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mb-4 rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-3">
        <div className="mb-2 text-center text-xs font-black uppercase tracking-[0.16em] text-cyan-800">Geospin needs</div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {task.requests.map((request) => {
            const got = gotByShape.get(request.shape) ?? 0;
            const done = got >= request.count;
            return (
              <div
                key={request.shape}
                className={[
                  "flex items-center gap-2 rounded-xl border-2 px-3 py-2",
                  done ? "border-emerald-300 bg-emerald-50" : "border-violet-200 bg-white",
                ].join(" ")}
              >
                <ShapeVisual shape={request.shape} colour={SHAPE_ICON_COLOUR[request.shape]} className="h-8 w-8" />
                <span className="text-base font-black text-indigo-950">
                  {got}/{request.count}
                </span>
                {done ? (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-indigo-950">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-indigo-950 via-violet-900 to-slate-950 p-4 shadow-inner sm:p-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }}
        />
        <div className="relative grid grid-cols-3 gap-3 sm:grid-cols-4">
          {task.items.map((item) => {
            const isCollected = collected.has(item.id);
            const isWrong = wrongId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.shape}
                onClick={() => tapItem(item)}
                className={[
                  "relative flex min-h-24 items-center justify-center rounded-2xl border-2 p-2 transition active:scale-[0.97]",
                  isCollected
                    ? "border-emerald-300 bg-emerald-400/20 opacity-70"
                    : "border-white/25 bg-white/10 hover:-translate-y-1 hover:border-cyan-300 hover:bg-white/20",
                  isWrong ? "sp-shake border-rose-400 bg-rose-500/20" : "",
                ].join(" ")}
              >
                <ShapeVisual shape={item.shape} colour={item.colour} className="h-16 w-16 sm:h-20 sm:w-20" />
                {isCollected ? (
                  <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-indigo-950 shadow">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      {SHAKE_STYLE}
    </div>
  );
}
