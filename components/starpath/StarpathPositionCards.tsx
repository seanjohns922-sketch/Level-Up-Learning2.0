"use client";

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Check } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import {
  RELATION_WORD,
  positionObjectLabel,
  type PositionRelation,
} from "@/data/activities/starpath/ground/position-objects";

type PositionFindTask = Extract<PracticeTask, { kind: "starpathPositionFind" }>;
type PositionWordTask = Extract<PracticeTask, { kind: "starpathPositionWord" }>;
type PositionPlaceTask = Extract<PracticeTask, { kind: "starpathPositionPlace" }>;
type PositionPictureTask = Extract<PracticeTask, { kind: "starpathPositionPicture" }>;
type PositionSequenceTask = Extract<PracticeTask, { kind: "starpathPositionSequence" }>;
type Placement = {
  id: string;
  object: string;
  relation: PositionRelation;
  side?: "left" | "right";
};

const POS_SHAKE = (
  <style>{`
    @keyframes sp-pos-shake { 0%,100%{transform:translate(-50%,-50%)} 25%{transform:translate(-58%,-50%)} 75%{transform:translate(-42%,-50%)} }
    .sp-pos-shake { animation: sp-pos-shake 0.42s ease-in-out; }
    @media (prefers-reduced-motion: reduce) { .sp-pos-shake { animation: none; } }
  `}</style>
);

const STARFIELD: CSSProperties = {
  backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
  backgroundSize: "30px 30px",
};

// ── Object art ──────────────────────────────────────────────────────────────
export function PositionObjectVisual({
  objectId,
  className = "h-16 w-16",
}: {
  objectId: string;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
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
      {objectId === "star" ? (
        <path
          d="M60 14 71 45 104 46 77 66 87 97 60 78 33 97 43 66 16 46 49 45Z"
          fill="#fde047"
          stroke="#b45309"
          strokeWidth="5"
          strokeLinejoin="round"
        />
      ) : null}
      {objectId === "crystal" ? (
        <>
          <path d="M60 12 92 44 74 104H46L28 44Z" fill="#a78bfa" stroke="#312e81" strokeWidth="5" strokeLinejoin="round" />
          <path d="M28 44H92M60 12 46 104M60 12 74 104" fill="none" stroke="#5b21b6" strokeWidth="4" />
        </>
      ) : null}
      {objectId === "alien" ? (
        <>
          <path d="M44 22v10M76 22v10" stroke="#4d7c0f" strokeWidth="5" strokeLinecap="round" />
          <circle cx="44" cy="20" r="5" fill="#a3e635" />
          <circle cx="76" cy="20" r="5" fill="#a3e635" />
          <ellipse cx="60" cy="66" rx="30" ry="34" fill="#86efac" stroke="#312e81" strokeWidth="5" />
          <ellipse cx="50" cy="62" rx="7" ry="10" fill="#1e1b4b" />
          <ellipse cx="70" cy="62" rx="7" ry="10" fill="#1e1b4b" />
          <path d="M52 84c5 4 11 4 16 0" fill="none" stroke="#166534" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : null}
      {objectId === "satellite" ? (
        <>
          <rect x="10" y="50" width="30" height="20" rx="3" fill="#67e8f9" stroke="#312e81" strokeWidth="4" />
          <rect x="80" y="50" width="30" height="20" rx="3" fill="#67e8f9" stroke="#312e81" strokeWidth="4" />
          <path d="M18 50v20M28 50v20M90 50v20M100 50v20" stroke="#0e7490" strokeWidth="3" />
          <rect x="46" y="46" width="28" height="28" rx="5" fill="#cbd5e1" stroke="#312e81" strokeWidth="5" />
          <circle cx="60" cy="34" r="9" fill="none" stroke="#fbbf24" strokeWidth="5" />
        </>
      ) : null}
      {objectId === "cave" ? (
        <>
          <path d="M14 104Q14 40 60 36Q106 40 106 104Z" fill="#6b7280" stroke="#312e81" strokeWidth="5" strokeLinejoin="round" />
          <path d="M40 104Q40 66 60 64Q80 66 80 104Z" fill="#1e1b4b" />
          <circle cx="36" cy="58" r="4" fill="#94a3b8" />
          <circle cx="82" cy="62" r="5" fill="#94a3b8" />
        </>
      ) : null}
    </svg>
  );
}

// ── Placement geometry ───────────────────────────────────────────────────────
function placementStyle(relation: PositionRelation, side?: "left" | "right"): {
  left: string;
  top: string;
  scale: number;
  z: number;
} {
  switch (relation) {
    case "above":
      return { left: "50%", top: "15%", scale: 1, z: 10 };
    case "below":
      return { left: "50%", top: "85%", scale: 1, z: 10 };
    case "beside":
      return { left: side === "left" ? "16%" : "84%", top: "50%", scale: 1, z: 10 };
    case "behind":
      return { left: "50%", top: "34%", scale: 0.72, z: 1 };
    case "in-front":
      return { left: "50%", top: "66%", scale: 1.08, z: 30 };
    case "inside":
      return { left: "50%", top: "60%", scale: 0.42, z: 30 };
    default:
      return { left: "50%", top: "50%", scale: 1, z: 10 };
  }
}

// ── Shared scene renderer ────────────────────────────────────────────────────
function PositionScene({
  anchorObject,
  placements,
  onTap,
  highlightId,
  foundIds,
  wrongId,
  heightClass = "h-64 sm:h-72",
  objectClass = "h-16 w-16 sm:h-20 sm:w-20",
  anchorClass = "h-20 w-20 sm:h-24 sm:w-24",
}: {
  anchorObject: string;
  placements: Placement[];
  onTap?: (placement: Placement) => void;
  highlightId?: string;
  foundIds?: Set<string>;
  wrongId?: string | null;
  heightClass?: string;
  objectClass?: string;
  anchorClass?: string;
}) {
  return (
    <div
      className={`relative w-full ${heightClass} overflow-hidden rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-indigo-950 via-violet-900 to-slate-950 shadow-inner`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" style={STARFIELD} />
      <div className="pointer-events-none absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 20 }}>
        <PositionObjectVisual objectId={anchorObject} className={anchorClass} />
      </div>
      {placements.map((placement) => {
        const geo = placementStyle(placement.relation, placement.side);
        const isFound = foundIds?.has(placement.id) ?? false;
        const isWrong = wrongId === placement.id;
        const isHighlight = highlightId === placement.id;
        const boxStyle: CSSProperties = {
          left: geo.left,
          top: geo.top,
          transform: `translate(-50%,-50%) scale(${geo.scale})`,
          zIndex: geo.z,
        };
        const inner = <PositionObjectVisual objectId={placement.object} className={objectClass} />;

        if (onTap) {
          return (
            <button
              key={placement.id}
              type="button"
              aria-label={positionObjectLabel(placement.object)}
              onClick={() => onTap(placement)}
              className={[
                "absolute flex items-center justify-center rounded-2xl border-2 p-1 transition active:scale-95",
                isFound
                  ? "border-emerald-300 bg-emerald-400/25"
                  : isWrong
                    ? "sp-pos-shake border-rose-400 bg-rose-500/25"
                    : "border-white/25 bg-white/10 hover:border-cyan-300 hover:bg-white/20",
              ].join(" ")}
              style={boxStyle}
            >
              {inner}
              {isFound ? (
                <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-indigo-950 shadow">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              ) : null}
            </button>
          );
        }

        return (
          <div
            key={placement.id}
            className={[
              "absolute flex items-center justify-center rounded-2xl p-1",
              isHighlight ? "ring-4 ring-cyan-300/70" : "",
            ].join(" ")}
            style={boxStyle}
          >
            {inner}
          </div>
        );
      })}
      {POS_SHAKE}
    </div>
  );
}

// ── Find It ──────────────────────────────────────────────────────────────────
export function StarpathPositionFindCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: PositionFindTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <PositionScene
        anchorObject={task.anchorObject}
        placements={task.placements}
        onTap={(placement) => (placement.id === task.correctId ? onCorrect() : onWrong())}
      />
      <p className="mt-3 text-center text-sm font-semibold text-slate-600">Tap the object the clue describes.</p>
    </div>
  );
}

// ── Say Where ────────────────────────────────────────────────────────────────
export function StarpathPositionWordCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: PositionWordTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const placements: Placement[] = [
    { id: "subject", object: task.subjectObject, relation: task.relation, side: task.side },
  ];
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <PositionScene anchorObject={task.anchorObject} placements={placements} highlightId="subject" />
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="relative flex min-h-16 items-center justify-center rounded-2xl border-2 border-violet-200 bg-white px-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            <span className="text-xl font-black text-indigo-950">{RELATION_WORD[option.relation]}</span>
            <OptionReadAloudButton text={RELATION_WORD[option.relation]} className="absolute right-2 top-1/2 -translate-y-1/2" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Place It ─────────────────────────────────────────────────────────────────
export function StarpathPositionPlaceCard({
  task,
  onComplete,
}: {
  task: PositionPlaceTask;
  onComplete: () => void;
}) {
  const [placed, setPlaced] = useState(false);
  const [wrongSlot, setWrongSlot] = useState<PositionRelation | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const doneRef = useRef(false);

  function tryPlace(slot: PositionRelation) {
    if (doneRef.current) return;
    const ok = slot === task.relation;
    if (ok) {
      doneRef.current = true;
      setPlaced(true);
      setTimeout(onComplete, 480);
    } else {
      setWrongSlot(slot);
      setTimeout(() => setWrongSlot((value) => (value === slot ? null : value)), 480);
    }
  }

  function finishDrop(clientX: number, clientY: number) {
    const dropTarget = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>("[data-slot]");
    setOffset({ x: 0, y: 0 });
    dragStart.current = null;
    if (dropTarget?.dataset.slot) tryPlace(dropTarget.dataset.slot as PositionRelation);
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="relative h-64 w-full overflow-hidden rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-indigo-950 via-violet-900 to-slate-950 shadow-inner sm:h-72">
        <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" style={STARFIELD} />
        <div className="pointer-events-none absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 20 }}>
          <PositionObjectVisual objectId={task.anchorObject} className="h-20 w-20 sm:h-24 sm:w-24" />
        </div>
        {task.slots.map((slot) => {
          const geo = placementStyle(slot);
          const filled = placed && slot === task.relation;
          return (
            <button
              key={slot}
              type="button"
              data-slot={slot}
              onClick={() => tryPlace(slot)}
              className={[
                "absolute flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed transition sm:h-20 sm:w-20",
                filled
                  ? "border-emerald-300 bg-emerald-400/25"
                  : wrongSlot === slot
                    ? "sp-pos-shake border-rose-400 bg-rose-500/20"
                    : "border-cyan-200/60 bg-white/5 hover:border-cyan-300 hover:bg-white/10",
              ].join(" ")}
              style={{ left: geo.left, top: geo.top, transform: "translate(-50%,-50%)", zIndex: 10 }}
            >
              {filled ? <PositionObjectVisual objectId={task.moverObject} className="h-14 w-14 sm:h-16 sm:w-16" /> : null}
            </button>
          );
        })}
        {POS_SHAKE}
      </div>
      {!placed ? (
        <div className="mt-4 flex flex-col items-center">
          <button
            type="button"
            aria-label={`Drag the ${positionObjectLabel(task.moverObject)}`}
            onPointerDown={(event: ReactPointerEvent<HTMLButtonElement>) => {
              dragStart.current = { x: event.clientX, y: event.clientY };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
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
            style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`, zIndex: offset.x || offset.y ? 40 : 1 }}
          >
            <PositionObjectVisual objectId={task.moverObject} className="h-16 w-16" />
          </button>
          <p className="mt-2 text-center text-sm font-semibold text-slate-600">Drag the {positionObjectLabel(task.moverObject)} into place, or tap the spot.</p>
        </div>
      ) : (
        <p className="mt-4 text-center text-base font-black text-emerald-700">Perfect placing!</p>
      )}
    </div>
  );
}

// ── Which Picture ────────────────────────────────────────────────────────────
export function StarpathPositionPictureCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: PositionPictureTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="group rounded-2xl border-2 border-transparent p-1 transition hover:border-cyan-400 focus:border-cyan-400"
          >
            <PositionScene
              anchorObject={option.anchorObject}
              placements={[{ id: "s", object: option.subjectObject, relation: option.relation, side: option.side }]}
              heightClass="h-40"
              objectClass="h-12 w-12"
              anchorClass="h-16 w-16"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Follow the Clues ─────────────────────────────────────────────────────────
export function StarpathPositionSequenceCard({
  task,
  onComplete,
}: {
  task: PositionSequenceTask;
  onComplete: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [found, setFound] = useState<Set<string>>(() => new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);
  const doneRef = useRef(false);
  const step = task.steps[stepIndex];

  function tap(placement: Placement) {
    if (doneRef.current || !step) return;
    if (placement.id === step.targetId) {
      const next = new Set(found);
      next.add(placement.id);
      setFound(next);
      if (stepIndex + 1 >= task.steps.length) {
        doneRef.current = true;
        setTimeout(onComplete, 520);
      } else {
        setStepIndex(stepIndex + 1);
      }
    } else {
      setWrongId(placement.id);
      setTimeout(() => setWrongId((value) => (value === placement.id ? null : value)), 460);
    }
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border-2 border-cyan-300 bg-cyan-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-sm font-black text-white">
            {stepIndex + 1}
          </span>
          <span className="text-base font-black text-indigo-950 sm:text-lg">{step?.instruction ?? "Mission complete!"}</span>
        </div>
        {step ? <ReadAloudBtn text={step.speakText} size="md" label="Read" className="shrink-0" /> : null}
      </div>
      <PositionScene
        anchorObject={task.anchorObject}
        placements={task.placements}
        onTap={tap}
        foundIds={found}
        wrongId={wrongId}
      />
      <p className="mt-3 text-center text-sm font-semibold text-slate-600">
        Step {Math.min(stepIndex + 1, task.steps.length)} of {task.steps.length}
      </p>
    </div>
  );
}
