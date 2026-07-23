"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { SHAPE_FACTS, type FoundationShape } from "@/data/activities/starpath/ground/week1Lesson1";
import { SHAPE_OBJECTS, type ShapeObjectId } from "@/data/activities/starpath/ground/shape-objects";

type ShapeIntroTask = Extract<PracticeTask, { kind: "starpathShapeIntro" }>;
type ShapeMatchTask = Extract<PracticeTask, { kind: "starpathShapeMatch" }>;
type ShapeSortTask = Extract<PracticeTask, { kind: "starpathShapeSort" }>;
type ShapeSceneTask = Extract<PracticeTask, { kind: "starpathShapeScene" }>;

const SHAPES: FoundationShape[] = ["circle", "triangle", "square", "rectangle"];

export function ShapeVisual({
  shape,
  colour,
  scale = 1,
  className = "h-24 w-24",
}: {
  shape: FoundationShape;
  colour: string;
  scale?: number;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`shape-${shape}-${colour.replace("#", "")}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.64" />
          <stop offset="0.3" stopColor={colour} />
          <stop offset="1" stopColor={colour} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <g
        transform={`translate(60 60) scale(${scale}) translate(-60 -60)`}
        fill={`url(#shape-${shape}-${colour.replace("#", "")})`}
        stroke="#312e81"
        strokeWidth="5"
        strokeLinejoin="round"
      >
        {shape === "circle" ? <circle cx="60" cy="60" r="38" /> : null}
        {shape === "triangle" ? <path d="M60 17 105 98H15Z" /> : null}
        {shape === "square" ? <rect x="22" y="22" width="76" height="76" rx="4" /> : null}
        {shape === "rectangle" ? <rect x="13" y="31" width="94" height="58" rx="4" /> : null}
      </g>
    </svg>
  );
}

export function TaskHeading({ prompt, speech }: { prompt: string; speech: string }) {
  return (
    <div className="mb-5 flex items-center justify-center gap-3 text-center">
      <h2 className="text-2xl font-black text-slate-950 sm:text-3xl">{prompt}</h2>
      <ReadAloudBtn text={speech} size="md" label="Read" className="shrink-0" />
    </div>
  );
}

const SHAPE_TEACH_COLOUR = ["#67e8f9", "#fde047", "#86efac", "#f9a8d4"] as const;

// L2 teaching — shapes live inside familiar space objects.
const TEACH_OBJECT_PAIRS: Array<{ objectId: ShapeObjectId; shape: FoundationShape }> = [
  { objectId: "planet", shape: "circle" },
  { objectId: "rocket", shape: "triangle" },
  { objectId: "window", shape: "square" },
  { objectId: "door", shape: "rectangle" },
];

// L3 teaching — the clues that tell shapes apart.
const TEACH_CLUES: Array<{ title: string; shape: FoundationShape; colour: string; tip: string }> = [
  { title: "Round", shape: "circle", colour: "#67e8f9", tip: "A circle is round with no corners." },
  { title: "3 straight sides", shape: "triangle", colour: "#fde047", tip: "A triangle has 3 straight sides." },
  { title: "4 straight sides", shape: "square", colour: "#86efac", tip: "Squares and rectangles have 4 straight sides." },
];

export function StarpathShapeIntroCard({
  task,
  onContinue,
}: {
  task: ShapeIntroTask;
  onContinue: () => void;
}) {
  const variant = task.variant ?? "shapes";
  const heading =
    task.heading ??
    (variant === "objects"
      ? "Shapes are everywhere"
      : variant === "clues"
        ? "Look for the clues"
        : variant === "builders"
          ? "Little shapes make big pictures"
          : "Meet the cosmic shapes");

  return (
    <div className="rounded-2xl border border-violet-200 bg-gradient-to-b from-violet-50 to-cyan-50 p-5 sm:p-7">
      <TaskHeading prompt={heading} speech={task.speakText} />

      {variant === "builders" ? (
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { shape: "rectangle" as const, colour: "#67e8f9", label: "Rocket body" },
            { shape: "triangle" as const, colour: "#fde047", label: "Rocket top" },
            { shape: "circle" as const, colour: "#86efac", label: "Rocket window" },
          ].map((part) => (
            <div key={part.label} className="relative flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
              <OptionReadAloudButton text={`${part.label}.`} className="absolute right-2 top-2" />
              <ShapeVisual shape={part.shape} colour={part.colour} className="h-20 w-20" />
              <div className="mt-2 text-base font-black text-indigo-950">{part.label}</div>
            </div>
          ))}
        </div>
      ) : variant === "objects" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TEACH_OBJECT_PAIRS.map(({ objectId, shape }) => (
            <div key={objectId} className="relative flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
              <OptionReadAloudButton text={SHAPE_OBJECTS[objectId].part} className="absolute right-2 top-2" />
              <SceneObjectVisual objectId={objectId} />
              <div className="mt-1 flex items-center gap-1.5 text-sm font-black text-indigo-950">
                <span>{SHAPE_OBJECTS[objectId].label}</span>
                <span className="text-cyan-600">=</span>
                <ShapeVisual shape={shape} colour={SHAPE_TEACH_COLOUR[["circle", "triangle", "square", "rectangle"].indexOf(shape)]!} className="h-6 w-6" />
                <span className="capitalize">{shape}</span>
              </div>
            </div>
          ))}
        </div>
      ) : variant === "clues" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {TEACH_CLUES.map((clue) => (
            <div key={clue.title} className="relative flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
              <OptionReadAloudButton text={`${clue.title}. ${clue.tip}`} className="absolute right-2 top-2" />
              <div className="flex items-end gap-1">
                <ShapeVisual shape={clue.shape} colour={clue.colour} className="h-16 w-16 sm:h-20 sm:w-20" />
                {clue.shape === "square" ? <ShapeVisual shape="rectangle" colour="#f9a8d4" className="h-12 w-16" /> : null}
              </div>
              <div className="mt-1 text-base font-black text-indigo-950">{clue.title}</div>
              <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">{clue.tip}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SHAPES.map((shape, index) => (
            <div key={shape} className="relative flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-white bg-white/90 p-3 text-center shadow-sm">
              <OptionReadAloudButton text={`${shape}. ${SHAPE_FACTS[shape]}`} className="absolute right-2 top-2" />
              <ShapeVisual shape={shape} colour={SHAPE_TEACH_COLOUR[index]!} className="h-20 w-20 sm:h-24 sm:w-24" />
              <div className="mt-1 text-lg font-black capitalize text-indigo-950">{shape}</div>
              <div className="mt-1 text-xs font-semibold leading-5 text-slate-600">{SHAPE_FACTS[shape]}</div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="mx-auto mt-6 block min-h-12 rounded-2xl bg-violet-700 px-7 py-3 text-lg font-black text-white shadow-lg transition hover:bg-violet-600 active:scale-[0.98]"
      >
        Start practising
      </button>
    </div>
  );
}

export function StarpathShapeMatchCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: ShapeMatchTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto mb-5 flex w-full max-w-xs flex-col items-center rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-3 shadow-sm">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-cyan-800">Target shape</div>
        <ShapeVisual shape={task.targetShape} colour="#a5f3fc" className="mt-1 h-24 w-24" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => option.id === task.correctOptionId ? onCorrect() : onWrong()}
            aria-label={option.shape}
            className="relative flex min-h-44 items-center justify-center rounded-2xl border-2 border-violet-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            <OptionReadAloudButton text={option.shape} className="absolute right-3 top-3" />
            <ShapeVisual shape={option.shape} colour={option.colour} scale={option.scale} className="h-28 w-28" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function StarpathShapeSortCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: ShapeSortTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  function finishDrop(clientX: number, clientY: number) {
    const dropTarget = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>("[data-shape-drop]");
    setOffset({ x: 0, y: 0 });
    dragStart.current = null;
    if (!dropTarget) return;
    if (dropTarget.dataset.shapeDrop === task.shape) onCorrect();
    else onWrong();
  }

  function startDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    dragStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mb-5 flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/70 p-3">
        <button
          type="button"
          aria-label={`Drag the ${task.shape}`}
          onPointerDown={startDrag}
          onPointerMove={(event) => {
            if (!dragStart.current) return;
            setOffset({ x: event.clientX - dragStart.current.x, y: event.clientY - dragStart.current.y });
          }}
          onPointerUp={(event) => finishDrop(event.clientX, event.clientY)}
          onPointerCancel={() => {
            dragStart.current = null;
            setOffset({ x: 0, y: 0 });
          }}
          className="touch-none cursor-grab rounded-2xl border-2 border-violet-300 bg-white p-2 shadow-lg active:cursor-grabbing"
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`, zIndex: offset.x || offset.y ? 20 : 1 }}
        >
          <ShapeVisual shape={task.shape} colour={task.colour} scale={task.scale} className="h-24 w-28" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SHAPES.map((shape) => (
          <button
            key={shape}
            type="button"
            data-shape-drop={shape}
            onClick={() => shape === task.shape ? onCorrect() : onWrong()}
            className="flex min-h-32 flex-col items-center justify-center rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50 to-violet-100 p-3 shadow-sm transition hover:border-cyan-400 hover:shadow-md"
          >
            <span className="h-12 w-12 rounded-full border-4 border-violet-300 bg-indigo-950 shadow-[inset_0_0_18px_rgba(103,232,249,0.45)]" />
            <span className="mt-2 text-sm font-black capitalize text-indigo-950">{shape} planet</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-sm font-semibold text-slate-600">Drag the shape, or tap its planet.</p>
    </div>
  );
}

const DEFAULT_SCENE_OBJECTS: ShapeObjectId[] = ["planet", "flag", "window", "door"];

export function SceneObjectVisual({ objectId }: { objectId: ShapeObjectId }) {
  return (
    <svg viewBox="0 0 120 120" className="h-24 w-24" aria-hidden="true">
      {objectId === "planet" ? (
        <>
          <ellipse cx="60" cy="65" rx="54" ry="15" fill="none" stroke="#fde68a" strokeWidth="8" transform="rotate(-12 60 65)" />
          <circle cx="60" cy="58" r="31" fill="#67e8f9" stroke="#312e81" strokeWidth="5" />
          <path d="M42 42c8 8 13 6 20 2 7-4 15 1 19 8" fill="none" stroke="#0891b2" strokeWidth="6" strokeLinecap="round" />
        </>
      ) : null}
      {objectId === "moon" ? (
        <>
          <circle cx="60" cy="60" r="36" fill="#c4b5fd" stroke="#312e81" strokeWidth="5" />
          <circle cx="48" cy="50" r="7" fill="#a78bfa" />
          <circle cx="72" cy="68" r="9" fill="#a78bfa" />
          <circle cx="66" cy="44" r="5" fill="#a78bfa" />
          <path d="M96 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#fde047" />
        </>
      ) : null}
      {objectId === "rocket" ? (
        <>
          <path d="M60 12 80 48H40Z" fill="#fde047" stroke="#312e81" strokeWidth="5" strokeLinejoin="round" />
          <rect x="44" y="46" width="32" height="46" rx="7" fill="#67e8f9" stroke="#312e81" strokeWidth="5" />
          <circle cx="60" cy="64" r="8" fill="#fff" stroke="#312e81" strokeWidth="4" />
          <path d="M44 74 30 92h14zM76 74 90 92H76z" fill="#f9a8d4" stroke="#312e81" strokeWidth="4" strokeLinejoin="round" />
          <path d="M54 92h12l-6 14z" fill="#fb923c" />
        </>
      ) : null}
      {objectId === "flag" ? (
        <>
          <path d="M29 103V18" stroke="#c4b5fd" strokeWidth="8" strokeLinecap="round" />
          <path d="M33 22 98 48 33 76Z" fill="#fde047" stroke="#312e81" strokeWidth="5" strokeLinejoin="round" />
          <path d="M17 104h31" stroke="#67e8f9" strokeWidth="7" strokeLinecap="round" />
        </>
      ) : null}
      {objectId === "window" ? (
        <>
          <rect x="18" y="18" width="84" height="84" rx="8" fill="#86efac" stroke="#312e81" strokeWidth="6" />
          <path d="M60 22v76M22 60h76" stroke="#0e7490" strokeWidth="6" />
          <circle cx="39" cy="39" r="4" fill="#fff" opacity="0.8" />
        </>
      ) : null}
      {objectId === "crate" ? (
        <>
          <rect x="22" y="22" width="76" height="76" rx="5" fill="#86efac" stroke="#312e81" strokeWidth="6" />
          <path d="M22 22 98 98M98 22 22 98" stroke="#0e7490" strokeWidth="5" />
          <rect x="22" y="22" width="76" height="76" rx="5" fill="none" stroke="#0e7490" strokeWidth="4" />
        </>
      ) : null}
      {objectId === "door" ? (
        <>
          <path d="M25 105V17h70v88" fill="#f9a8d4" stroke="#312e81" strokeWidth="6" strokeLinejoin="round" />
          <path d="M38 105V31h44v74" fill="#7c3aed" stroke="#312e81" strokeWidth="5" />
          <circle cx="72" cy="69" r="5" fill="#fde047" />
          <path d="M15 105h90" stroke="#67e8f9" strokeWidth="7" strokeLinecap="round" />
        </>
      ) : null}
      {objectId === "bridge" ? (
        <>
          <path d="M14 44q46 -24 92 0" fill="none" stroke="#c4b5fd" strokeWidth="5" strokeLinecap="round" />
          <path d="M32 50V72M60 40V72M88 50V72" stroke="#c4b5fd" strokeWidth="4" />
          <rect x="12" y="62" width="96" height="20" rx="3" fill="#f9a8d4" stroke="#312e81" strokeWidth="5" />
          <path d="M22 82v18M98 82v18" stroke="#312e81" strokeWidth="6" strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  );
}

export function StarpathShapeSceneCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: ShapeSceneTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const objectIds = (task.objects && task.objects.length ? task.objects : DEFAULT_SCENE_OBJECTS) as ShapeObjectId[];
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="relative overflow-hidden rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-indigo-950 via-violet-900 to-slate-950 p-5 shadow-inner">
        <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative grid grid-cols-2 gap-4 sm:grid-cols-4">
          {objectIds.map((objectId) => {
            const label = SHAPE_OBJECTS[objectId].label;
            return (
              <button
                key={objectId}
                type="button"
                onClick={() => (objectId === task.correctObjectId ? onCorrect() : onWrong())}
                className="relative flex min-h-44 flex-col items-center justify-center rounded-2xl border-2 border-white/30 bg-white/10 p-3 text-white backdrop-blur-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:bg-white/20 active:scale-[0.98]"
              >
                <OptionReadAloudButton text={label} className="absolute right-2 top-2 bg-white" />
                <SceneObjectVisual objectId={objectId} />
                <span className="mt-2 text-sm font-black">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
