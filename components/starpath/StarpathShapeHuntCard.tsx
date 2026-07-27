"use client";

import { useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { ShapeVisual, TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask, StarpathShape } from "@/data/activities/year1/practice-task";
import {
  HUNT_VIEWBOX,
  getHuntScene,
  type ShapeHuntPiece,
} from "@/data/activities/starpath/level1/shape-hunt-scenes";

type ShapeHuntTask = Extract<PracticeTask, { kind: "starpathShapeHunt" }>;

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

const HUNT_STYLE = (
  <style>{`
    @keyframes sp-hunt-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-1.6px)} 75%{transform:translateX(1.6px)} }
    .sp-hunt-shake { animation: sp-hunt-shake 0.36s ease-in-out; transform-box: fill-box; transform-origin: center; }
    @keyframes sp-hunt-pop { 0%{transform:scale(0.6);opacity:0} 60%{transform:scale(1.08);opacity:1} 100%{transform:scale(1);opacity:1} }
    .sp-hunt-pop { animation: sp-hunt-pop 0.4s ease-out; }
    @media (prefers-reduced-motion: reduce) { .sp-hunt-shake, .sp-hunt-pop { animation: none; } }
  `}</style>
);

function HuntPiece({
  piece,
  found,
  wrong,
  onTap,
}: {
  piece: ShapeHuntPiece;
  found: boolean;
  wrong: boolean;
  onTap: () => void;
}) {
  const cx = piece.x + piece.w / 2;
  const cy = piece.y + piece.h / 2;
  const rotate = piece.rotation ? `rotate(${piece.rotation} ${cx} ${cy})` : undefined;
  const stroke = found ? "#059669" : "#312e81";
  const strokeWidth = found ? 2.4 : 1.1;
  const fillOpacity = found ? 0.5 : 1;
  const shared = {
    fill: piece.colour,
    fillOpacity,
    stroke,
    strokeWidth,
    strokeLinejoin: "round" as const,
    transform: rotate,
    onClick: onTap,
    style: { cursor: "pointer" as const },
  };

  let shapeEl;
  if (piece.shape === "circle" || piece.shape === "oval") {
    shapeEl = <ellipse cx={cx} cy={cy} rx={piece.w / 2} ry={piece.h / 2} {...shared} />;
  } else if (piece.shape === "triangle") {
    const points = `${cx},${piece.y} ${piece.x + piece.w},${piece.y + piece.h} ${piece.x},${piece.y + piece.h}`;
    shapeEl = <polygon points={points} {...shared} />;
  } else {
    shapeEl = <rect x={piece.x} y={piece.y} width={piece.w} height={piece.h} rx={3} {...shared} />;
  }

  return (
    <g className={wrong ? "sp-hunt-shake" : undefined}>
      {shapeEl}
      {found ? (
        <g className="sp-hunt-pop" style={{ pointerEvents: "none" }}>
          <circle cx={cx} cy={cy} r={4.6} fill="#059669" />
          <path
            d={`M ${cx - 2.4} ${cy} L ${cx - 0.6} ${cy + 1.9} L ${cx + 2.6} ${cy - 2.2}`}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ) : null}
    </g>
  );
}

// Level 1 · Week 3 — Shape Hunt. Find and tally every shape of each requested
// kind inside a picture built from shapes. Forgiving: wrong-shape taps shake and
// never penalise; the round advances as each shape's full count is found.
export function StarpathShapeHuntCard({
  task,
  onComplete,
}: {
  task: ShapeHuntTask;
  onComplete: () => void;
}) {
  const scene = useMemo(() => getHuntScene(task.sceneId), [task.sceneId]);
  const [huntIndex, setHuntIndex] = useState(0);
  const [foundIds, setFoundIds] = useState<Set<string>>(() => new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const doneRef = useRef(false);

  const currentHunt = task.hunts[huntIndex];
  const foundThisHunt = currentHunt
    ? scene.pieces.filter((piece) => piece.shape === currentHunt.shape && foundIds.has(piece.id)).length
    : 0;

  function tapPiece(piece: ShapeHuntPiece) {
    if (doneRef.current || !currentHunt) return;
    if (foundIds.has(piece.id)) return;
    if (piece.shape !== currentHunt.shape) {
      setWrongId(piece.id);
      setTimeout(() => setWrongId((value) => (value === piece.id ? null : value)), 420);
      return;
    }
    const nextFound = new Set(foundIds).add(piece.id);
    setFoundIds(nextFound);
    const nowCount = scene.pieces.filter((p) => p.shape === currentHunt.shape && nextFound.has(p.id)).length;
    if (nowCount >= currentHunt.count) {
      if (huntIndex + 1 >= task.hunts.length) {
        doneRef.current = true;
        setCelebrate(true);
        setTimeout(onComplete, 1100);
      } else {
        setTimeout(() => setHuntIndex((value) => value + 1), 420);
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
              Find all the {SHAPE_PLURAL[currentHunt.shape]}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-violet-700 px-3 py-1 text-sm font-black tabular-nums text-white">
              {foundThisHunt} / {currentHunt.count}
            </span>
            <ReadAloudBtn text={`Find all the ${SHAPE_PLURAL[currentHunt.shape]}.`} size="md" label="Read" className="shrink-0" />
          </div>
        </div>
      ) : null}

      <div className="relative mx-auto max-w-sm">
        <div className="overflow-hidden rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-sky-50 to-violet-50 p-3 shadow-inner">
          <svg
            viewBox={`0 0 ${HUNT_VIEWBOX.w} ${HUNT_VIEWBOX.h}`}
            className="mx-auto h-auto w-full max-w-[300px]"
            role="img"
            aria-label={`Find the shapes in the ${scene.label.toLowerCase()}`}
          >
            {scene.pieces.map((piece) => (
              <HuntPiece
                key={piece.id}
                piece={piece}
                found={foundIds.has(piece.id)}
                wrong={wrongId === piece.id}
                onTap={() => tapPiece(piece)}
              />
            ))}
          </svg>
        </div>
        {celebrate ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="sp-hunt-pop flex flex-col items-center gap-1 rounded-2xl bg-white/90 px-5 py-3 text-center shadow-xl">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-white">
                <Check className="h-7 w-7" strokeWidth={3} />
              </span>
              <span className="text-lg font-black text-indigo-950">Every shape found!</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Progress dots for the shape families in this picture */}
      <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2">
        {task.hunts.map((hunt, index) => (
          <span
            key={hunt.shape}
            className={[
              "flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-xs font-black",
              index < huntIndex || (celebrate && index === huntIndex)
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : index === huntIndex
                  ? "border-violet-300 bg-violet-50 text-violet-700"
                  : "border-slate-200 bg-white text-slate-400",
            ].join(" ")}
          >
            <ShapeVisual shape={hunt.shape} colour={SHAPE_ICON_COLOUR[hunt.shape]} className="h-4 w-4" />
            {hunt.count}
          </span>
        ))}
      </div>
      {HUNT_STYLE}
    </div>
  );
}
