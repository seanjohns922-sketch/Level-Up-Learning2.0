"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { ShapeVisual, TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask, StarpathShape } from "@/data/activities/year1/practice-task";
import {
  getWorldObject,
  worldObjectShape,
  worldObjectSvg,
} from "@/data/activities/starpath/level1/world-objects";

type SpotterTask = Extract<PracticeTask, { kind: "starpathObjectSpotter" }>;
type CompareTask = Extract<PracticeTask, { kind: "starpathObjectCompare" }>;
type MatchTask = Extract<PracticeTask, { kind: "starpathObjectMatch" }>;

const SHAPE_ICON_COLOUR: Record<StarpathShape, string> = {
  circle: "#67e8f9",
  oval: "#c4b5fd",
  triangle: "#fde047",
  square: "#86efac",
  rectangle: "#f9a8d4",
};
const SHAPE_PLURAL: Record<StarpathShape, string> = {
  circle: "circles",
  oval: "ovals",
  triangle: "triangles",
  square: "squares",
  rectangle: "rectangles",
};

const WORLD_STYLE = (
  <style>{`
    @keyframes sp-world-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
    .sp-world-shake { animation: sp-world-shake 0.36s ease-in-out; }
    @keyframes sp-world-pop { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
    .sp-world-pop { animation: sp-world-pop 0.4s ease-out; }
    @media (prefers-reduced-motion: reduce) { .sp-world-shake, .sp-world-pop { animation: none; } }
  `}</style>
);

export function WorldObjectVisual({ objectId, className }: { objectId: string; className?: string }) {
  const object = getWorldObject(objectId);
  const markup = useMemo(() => worldObjectSvg(object, { size: 96 }), [object]);
  return (
    <span
      className={className ?? "block h-16 w-16"}
      aria-label={object.label}
      role="img"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

// ── L1 · Shape Spotter ───────────────────────────────────────────────────────
export function StarpathObjectSpotterCard({
  task,
  onComplete,
}: {
  task: SpotterTask;
  onComplete: () => void;
}) {
  const [huntIndex, setHuntIndex] = useState(0);
  const [foundIds, setFoundIds] = useState<Set<string>>(() => new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const doneRef = useRef(false);
  const currentHunt = task.hunts[huntIndex];

  const foundThisHunt = currentHunt
    ? task.objects.filter((o) => worldObjectShape(o.objectId) === currentHunt.shape && foundIds.has(o.id)).length
    : 0;

  function tap(entry: SpotterTask["objects"][number]) {
    if (doneRef.current || !currentHunt || foundIds.has(entry.id)) return;
    if (worldObjectShape(entry.objectId) !== currentHunt.shape) {
      setWrongId(entry.id);
      setTimeout(() => setWrongId((v) => (v === entry.id ? null : v)), 400);
      return;
    }
    const next = new Set(foundIds).add(entry.id);
    setFoundIds(next);
    const now = task.objects.filter((o) => worldObjectShape(o.objectId) === currentHunt.shape && next.has(o.id)).length;
    if (now >= currentHunt.count) {
      if (huntIndex + 1 >= task.hunts.length) {
        doneRef.current = true;
        setCelebrate(true);
        setTimeout(onComplete, 1000);
      } else {
        setTimeout(() => setHuntIndex((v) => v + 1), 400);
      }
    }
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      {currentHunt ? (
        <div className="mx-auto mb-4 flex max-w-md items-center justify-between gap-3 rounded-2xl border-2 border-cyan-300 bg-cyan-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-violet-200 bg-white">
              <ShapeVisual shape={currentHunt.shape} colour={SHAPE_ICON_COLOUR[currentHunt.shape]} className="h-8 w-8" />
            </span>
            <span className="text-base font-black text-indigo-950 sm:text-lg">
              Tap the {SHAPE_PLURAL[currentHunt.shape]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-violet-700 px-3 py-1 text-sm font-black tabular-nums text-white">
              {foundThisHunt} / {currentHunt.count}
            </span>
            <ReadAloudBtn text={`Tap all the objects that are ${SHAPE_PLURAL[currentHunt.shape]}.`} size="md" label="Read" className="shrink-0" />
          </div>
        </div>
      ) : null}
      <div className="relative">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {task.objects.map((entry) => {
            const isFound = foundIds.has(entry.id);
            const isWrong = wrongId === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                aria-label={getWorldObject(entry.objectId).label}
                onClick={() => tap(entry)}
                className={[
                  "relative flex min-h-24 items-center justify-center rounded-2xl border-2 bg-white p-2 transition active:scale-[0.97]",
                  isFound
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-violet-200 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-md",
                  isWrong ? "sp-world-shake border-rose-400 bg-rose-50" : "",
                ].join(" ")}
              >
                <WorldObjectVisual objectId={entry.objectId} className="block h-16 w-16 sm:h-20 sm:w-20" />
                {isFound ? (
                  <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-indigo-950 shadow">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        {celebrate ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="sp-world-pop flex flex-col items-center gap-1 rounded-2xl bg-white/90 px-5 py-3 text-center shadow-xl">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-white">
                <Check className="h-7 w-7" strokeWidth={3} />
              </span>
              <span className="text-lg font-black text-indigo-950">You spotted them all!</span>
            </div>
          </div>
        ) : null}
      </div>
      {WORLD_STYLE}
    </div>
  );
}

// ── L2 · Same or Different ───────────────────────────────────────────────────
export function StarpathObjectCompareCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: CompareTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const isAssessment = task.presentation === "assessment";
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className={isAssessment ? "mx-auto mb-5 grid max-w-lg grid-cols-2 gap-3 sm:gap-4" : "mx-auto mb-5 grid max-w-md grid-cols-2 gap-4"}>
        {[task.left, task.right].map((objectId, index) => (
          <div
            key={`${objectId}-${index}`}
            className={isAssessment
              ? "flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              : "flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-violet-200 bg-white p-4 shadow-sm"}
          >
            <WorldObjectVisual objectId={objectId} className={isAssessment ? "block h-20 w-20 sm:h-24 sm:w-24" : "block h-24 w-24"} />
            <span className="text-sm font-black capitalize text-indigo-950">{getWorldObject(objectId).label}</span>
          </div>
        ))}
      </div>
      <div className={isAssessment
        ? ["mx-auto grid gap-3", task.options.length === 2 ? "max-w-lg grid-cols-2" : "max-w-2xl grid-cols-1 sm:grid-cols-3"].join(" ")
        : ["mx-auto grid max-w-lg gap-3", task.options.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"].join(" ")}>
        {task.options.map((option) => isAssessment ? (
          <button
            key={option.id}
            type="button"
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="grid min-h-16 grid-cols-[minmax(0,1fr)_48px] items-stretch overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            <span className="flex min-w-0 items-center justify-center px-3 py-3 text-center text-base font-black text-indigo-950 sm:text-lg">
              {option.label}
            </span>
            <span className="flex items-center justify-center border-l border-slate-200">
              <OptionReadAloudButton text={option.label} />
            </span>
          </button>
        ) : (
          <button
            key={option.id}
            type="button"
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="relative flex min-h-16 items-center justify-center rounded-2xl border-2 border-violet-200 bg-white px-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            <span className="text-lg font-black text-indigo-950">{option.label}</span>
            <OptionReadAloudButton text={option.label} className="absolute right-2 top-1/2 -translate-y-1/2" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── L3 · Shape Match (pairs) — open or face-down memory ──────────────────────
export function StarpathObjectMatchCard({
  task,
  onComplete,
}: {
  task: MatchTask;
  onComplete: () => void;
}) {
  const isMemory = task.mode === "memory";
  const [selected, setSelected] = useState<string | null>(null); // open mode
  const [flipped, setFlipped] = useState<string[]>([]); // memory mode (face-up, unpaired)
  const [paired, setPaired] = useState<Set<string>>(() => new Set());
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const [pulse, setPulse] = useState<string | null>(null);
  const lockRef = useRef(false);
  const doneRef = useRef(false);

  function complete(next: Set<string>) {
    if (next.size >= task.objects.length) {
      doneRef.current = true;
      setTimeout(onComplete, 900);
    }
  }

  function tapMemory(entry: MatchTask["objects"][number]) {
    if (doneRef.current || lockRef.current) return;
    if (paired.has(entry.id) || flipped.includes(entry.id)) return;
    if (flipped.length === 0) {
      setFlipped([entry.id]);
      return;
    }
    const first = task.objects.find((o) => o.id === flipped[0])!;
    if (worldObjectShape(first.objectId) === worldObjectShape(entry.objectId)) {
      const next = new Set(paired).add(first.id).add(entry.id);
      setPaired(next);
      setFlipped([]);
      setPulse(entry.id);
      setTimeout(() => setPulse(null), 400);
      complete(next);
    } else {
      setFlipped([first.id, entry.id]);
      setWrongPair([first.id, entry.id]);
      lockRef.current = true;
      setTimeout(() => {
        setFlipped([]);
        setWrongPair(null);
        lockRef.current = false;
      }, 900);
    }
  }

  function tapOpen(entry: MatchTask["objects"][number]) {
    if (doneRef.current || paired.has(entry.id) || wrongPair) return;
    if (selected === null) {
      setSelected(entry.id);
      return;
    }
    if (selected === entry.id) {
      setSelected(null);
      return;
    }
    const first = task.objects.find((o) => o.id === selected)!;
    if (worldObjectShape(first.objectId) === worldObjectShape(entry.objectId)) {
      const next = new Set(paired).add(first.id).add(entry.id);
      setPaired(next);
      setSelected(null);
      setPulse(entry.id);
      setTimeout(() => setPulse(null), 400);
      complete(next);
    } else {
      setWrongPair([first.id, entry.id]);
      setSelected(null);
      setTimeout(() => setWrongPair(null), 460);
    }
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto mb-3 max-w-md text-center text-xs font-black uppercase tracking-[0.16em] text-violet-700">
        Paired {paired.size / 2} of {task.objects.length / 2}
      </div>
      <div className="mx-auto grid max-w-md grid-cols-3 gap-3 sm:grid-cols-4">
        {task.objects.map((entry) => {
          const isPaired = paired.has(entry.id);
          const isFaceUp = isMemory ? isPaired || flipped.includes(entry.id) : true;
          const isSelected = !isMemory && selected === entry.id;
          const isWrong = wrongPair?.includes(entry.id) ?? false;
          return (
            <button
              key={entry.id}
              type="button"
              disabled={isPaired}
              aria-label={isFaceUp ? getWorldObject(entry.objectId).label : "Face-down card"}
              onClick={() => (isMemory ? tapMemory(entry) : tapOpen(entry))}
              className={[
                "relative flex min-h-24 items-center justify-center rounded-2xl border-2 p-2 transition active:scale-[0.97]",
                isPaired
                  ? "border-emerald-300 bg-emerald-50 opacity-70"
                  : isSelected
                    ? "-translate-y-1 border-cyan-400 bg-cyan-50 shadow-md"
                    : isFaceUp
                      ? "border-violet-200 bg-white hover:-translate-y-1 hover:border-cyan-400 hover:shadow-md"
                      : "border-violet-300 bg-gradient-to-br from-violet-500 to-indigo-600 hover:-translate-y-1 hover:shadow-md",
                isWrong ? "sp-world-shake border-rose-400 bg-rose-50" : "",
                pulse === entry.id ? "sp-world-pop" : "",
              ].join(" ")}
            >
              {isFaceUp ? (
                <WorldObjectVisual objectId={entry.objectId} className="block h-16 w-16 sm:h-20 sm:w-20" />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20" aria-hidden="true">
                  <Sparkles className="h-8 w-8 text-white/80" strokeWidth={2.25} />
                </span>
              )}
              {isPaired ? (
                <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-indigo-950 shadow">
                  <Check className="h-4 w-4" strokeWidth={3} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-slate-600">
        {isMemory
          ? "Flip two cards. If they are the same shape, they stay. If not, they flip back."
          : "Tap two objects that are the same shape."}
      </p>
      {WORLD_STYLE}
    </div>
  );
}
