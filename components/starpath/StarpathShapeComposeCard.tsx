"use client";

import { useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { ShapeVisual, TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask, StarpathShape } from "@/data/activities/year1/practice-task";
import {
  getComposition,
  type ComposeSlot,
} from "@/data/activities/starpath/level1/shape-compositions";

type ComposeTask = Extract<PracticeTask, { kind: "starpathShapeCompose" }>;

const SHAPE_ICON_COLOUR: Record<StarpathShape, string> = {
  circle: "#67e8f9",
  oval: "#c4b5fd",
  triangle: "#fde047",
  square: "#86efac",
  rectangle: "#f9a8d4",
};
const SHAPE_WORD: Record<StarpathShape, string> = {
  circle: "circle",
  oval: "oval",
  triangle: "triangle",
  square: "square",
  rectangle: "rectangle",
};

const COMPOSE_STYLE = (
  <style>{`
    @keyframes sp-compose-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
    .sp-compose-shake { animation: sp-compose-shake 0.36s ease-in-out; }
    @keyframes sp-compose-pop { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
    .sp-compose-pop { animation: sp-compose-pop 0.4s ease-out; }
    @media (prefers-reduced-motion: reduce) { .sp-compose-shake, .sp-compose-pop { animation: none; } }
  `}</style>
);

function SlotShape({ slot, filled }: { slot: ComposeSlot; filled: boolean }) {
  const fill = filled ? slot.colour : "#ffffff";
  const fillOpacity = filled ? 1 : 0.12;
  const stroke = filled ? "#312e81" : "#a5b4fc";
  const dash = filled ? undefined : "3 2";
  if (slot.points) {
    return (
      <polygon
        points={slot.points}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={stroke}
        strokeWidth={1.1}
        strokeLinejoin="round"
        strokeDasharray={dash}
      />
    );
  }
  const r = slot.rect!;
  return (
    <rect
      x={r.x}
      y={r.y}
      width={r.w}
      height={r.h}
      rx={1.5}
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeWidth={1.1}
      strokeLinejoin="round"
      strokeDasharray={dash}
    />
  );
}

// Level 1 · Week 5 — Make a Shape. Tap the piece shape to drop parts into the
// target until it is fully assembled. Decoy shapes shake and never penalise.
export function StarpathShapeComposeCard({
  task,
  onComplete,
}: {
  task: ComposeTask;
  onComplete: () => void;
}) {
  const comp = useMemo(() => getComposition(task.compositionId), [task.compositionId]);
  const [filled, setFilled] = useState(0);
  const [wrongShape, setWrongShape] = useState<StarpathShape | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const doneRef = useRef(false);

  const trayShapes: StarpathShape[] = useMemo(() => {
    const shapes = [comp.pieceShape, ...comp.decoys];
    // Simple stable shuffle by composition id length so the correct piece isn't
    // always first.
    const shift = comp.id.length % shapes.length;
    return [...shapes.slice(shift), ...shapes.slice(0, shift)];
  }, [comp]);

  function tap(shape: StarpathShape) {
    if (doneRef.current) return;
    if (shape !== comp.pieceShape) {
      setWrongShape(shape);
      setTimeout(() => setWrongShape((v) => (v === shape ? null : v)), 400);
      return;
    }
    const next = Math.min(comp.slots.length, filled + 1);
    setFilled(next);
    if (next >= comp.slots.length) {
      doneRef.current = true;
      setCelebrate(true);
      setTimeout(onComplete, 1000);
    }
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto mb-4 flex max-w-md items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-violet-700">
        <span>Make a {comp.label}</span>
        <span className="rounded-full bg-violet-700 px-3 py-1 text-white">{filled} / {comp.slots.length}</span>
      </div>

      <div className="relative mx-auto max-w-[280px]">
        <div className="rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-sky-50 to-violet-50 p-4 shadow-inner">
          <svg viewBox="0 0 48 48" className="mx-auto h-auto w-full max-w-[220px]" role="img" aria-label={`Make a ${comp.label}`}>
            {comp.slots.map((slot, index) => (
              <SlotShape key={slot.id} slot={slot} filled={index < filled} />
            ))}
          </svg>
        </div>
        {celebrate ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="sp-compose-pop flex flex-col items-center gap-1 rounded-2xl bg-white/90 px-5 py-3 text-center shadow-xl">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-white">
                <Check className="h-7 w-7" strokeWidth={3} />
              </span>
              <span className="text-lg font-black text-indigo-950">You made a {comp.label}!</span>
            </div>
          </div>
        ) : null}
      </div>

      <p className="mx-auto mt-4 max-w-md text-center text-sm font-black uppercase tracking-[0.16em] text-cyan-700">
        Tap a {SHAPE_WORD[comp.pieceShape]} to add it
      </p>
      <div className="mx-auto mt-2 grid max-w-md grid-cols-3 gap-3">
        {trayShapes.map((shape) => (
          <button
            key={shape}
            type="button"
            aria-label={SHAPE_WORD[shape]}
            onClick={() => tap(shape)}
            className={[
              "relative flex min-h-24 items-center justify-center rounded-2xl border-2 bg-white p-3 shadow-sm transition active:scale-[0.97]",
              wrongShape === shape
                ? "sp-compose-shake border-rose-400 bg-rose-50"
                : "border-violet-200 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-md",
            ].join(" ")}
          >
            <OptionReadAloudButton text={SHAPE_WORD[shape]} className="absolute right-2 top-2" />
            <ShapeVisual shape={shape} colour={SHAPE_ICON_COLOUR[shape]} className="h-14 w-14" />
          </button>
        ))}
      </div>
      {COMPOSE_STYLE}
    </div>
  );
}
