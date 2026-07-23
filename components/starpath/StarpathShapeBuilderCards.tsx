"use client";

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import {
  getBuildObject,
  type StarpathBuildPiece,
} from "@/data/activities/starpath/ground/shape-builds";
import { ShapeVisual, TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";

type FinishPictureTask = Extract<PracticeTask, { kind: "starpathFinishPicture" }>;
type ShapeBuilderTask = Extract<PracticeTask, { kind: "starpathShapeBuilder" }>;
type BuildShapeIdentifyTask = Extract<PracticeTask, { kind: "starpathBuildShapeIdentify" }>;
type BuildMatchTask = Extract<PracticeTask, { kind: "starpathBuildMatch" }>;
type SpaceMuseumTask = Extract<PracticeTask, { kind: "starpathSpaceMuseum" }>;

function PieceShape({ piece, muted = false }: { piece: StarpathBuildPiece; muted?: boolean }) {
  const common = {
    fill: muted ? "#dbeafe" : piece.colour,
    stroke: muted ? "#94a3b8" : "#312e81",
    strokeWidth: 2,
    strokeLinejoin: "round" as const,
    opacity: muted ? 0.38 : 1,
  };
  const transform = `rotate(${piece.rotation ?? 0} ${piece.x} ${piece.y})`;

  if (piece.shape === "circle") {
    return <ellipse cx={piece.x} cy={piece.y} rx={piece.width / 2} ry={piece.height / 2} transform={transform} {...common} />;
  }
  if (piece.shape === "triangle") {
    const points = `${piece.x},${piece.y - piece.height / 2} ${piece.x + piece.width / 2},${piece.y + piece.height / 2} ${piece.x - piece.width / 2},${piece.y + piece.height / 2}`;
    return <polygon points={points} transform={transform} {...common} />;
  }
  return (
    <rect
      x={piece.x - piece.width / 2}
      y={piece.y - piece.height / 2}
      width={piece.width}
      height={piece.height}
      rx={piece.shape === "square" ? 3 : 2}
      transform={transform}
      {...common}
    />
  );
}

export function BuildObjectVisual({
  objectId,
  visiblePieceIds,
  ghostPieceIds = [],
  className = "h-40 w-40",
}: {
  objectId: string;
  visiblePieceIds?: readonly string[];
  ghostPieceIds?: readonly string[];
  className?: string;
}) {
  const object = getBuildObject(objectId);
  const visible = visiblePieceIds ? new Set(visiblePieceIds) : null;
  const ghosts = new Set(ghostPieceIds);

  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label={object.label}>
      {object.pieces.map((item) => {
        if (ghosts.has(item.id)) return <PieceShape key={item.id} piece={item} muted />;
        if (visible && !visible.has(item.id)) return null;
        return <PieceShape key={item.id} piece={item} />;
      })}
    </svg>
  );
}

function ShapeChoice({
  shape,
  colour,
  label,
  disabled = false,
  onClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  style,
}: {
  shape: FinishPictureTask["options"][number]["shape"];
  colour: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  onPointerDown?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={style}
      className="relative flex min-h-32 touch-none items-center justify-center rounded-xl border-2 border-violet-200 bg-white p-3 shadow-sm transition hover:border-cyan-400 hover:shadow-md active:scale-[0.98] disabled:opacity-40"
    >
      <OptionReadAloudButton text={label} className="absolute right-2 top-2" />
      <ShapeVisual shape={shape} colour={colour} className="h-20 w-20" />
    </button>
  );
}

export function StarpathFinishPictureCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: FinishPictureTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const [draggedOption, setDraggedOption] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const object = getBuildObject(task.objectId);
  const visibleIds = object.pieces.filter((item) => item.id !== task.missingPieceId).map((item) => item.id);

  function choose(optionId: string) {
    if (optionId === task.correctOptionId) onCorrect();
    else onWrong();
  }

  function finishDrag(event: ReactPointerEvent<HTMLButtonElement>, optionId: string) {
    const moved = dragStart.current
      ? Math.hypot(event.clientX - dragStart.current.x, event.clientY - dragStart.current.y) > 8
      : false;
    const drop = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-build-drop]");
    dragStart.current = null;
    setDraggedOption(null);
    setOffset({ x: 0, y: 0 });
    if (moved) suppressClick.current = true;
    if (moved && drop) {
      choose(optionId);
    }
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div
        data-build-drop
        className="mx-auto mb-5 flex min-h-56 max-w-xl flex-col items-center justify-center rounded-xl border-2 border-dashed border-cyan-400 bg-cyan-50/70 p-4"
      >
        <BuildObjectVisual
          objectId={task.objectId}
          visiblePieceIds={visibleIds}
          ghostPieceIds={[task.missingPieceId]}
          className="h-44 w-44 sm:h-52 sm:w-52"
        />
        <div className="mt-2 text-sm font-black text-cyan-900">Drag or tap the missing shape</div>
      </div>
      <div className="mx-auto grid max-w-2xl grid-cols-3 gap-3">
        {task.options.map((option) => (
          <ShapeChoice
            key={option.id}
            shape={option.shape}
            colour={option.colour}
            label={option.shape}
            onClick={() => {
              if (suppressClick.current) {
                suppressClick.current = false;
                return;
              }
              choose(option.id);
            }}
            onPointerDown={(event) => {
              dragStart.current = { x: event.clientX, y: event.clientY };
              setDraggedOption(option.id);
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!dragStart.current || draggedOption !== option.id) return;
              setOffset({ x: event.clientX - dragStart.current.x, y: event.clientY - dragStart.current.y });
            }}
            onPointerUp={(event) => finishDrag(event, option.id)}
            style={draggedOption === option.id ? { transform: `translate(${offset.x}px, ${offset.y}px)`, zIndex: 20 } : undefined}
          />
        ))}
      </div>
    </div>
  );
}

export function StarpathShapeBuilderCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: ShapeBuilderTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [placed, setPlaced] = useState<string[]>([]);
  const object = getBuildObject(task.objectId);
  const placedSet = new Set(placed);
  const remaining = task.requiredPieceIds.filter((pieceId) => !placedSet.has(pieceId));

  function choose(pieceId: string | null) {
    if (!pieceId || !task.requiredPieceIds.includes(pieceId)) {
      if (task.mode !== "free") onWrong();
      return;
    }
    if (placedSet.has(pieceId)) return;
    const next = [...placed, pieceId];
    setPlaced(next);
    const completeAt = task.mode === "free" ? task.minimumPieces : task.requiredPieceIds.length;
    if (next.length >= completeAt) window.setTimeout(onCorrect, 260);
  }

  const instruction =
    task.mode === "free"
      ? `Choose any ${task.minimumPieces} pieces to create your ${object.label.toLowerCase()}.`
      : remaining.length
        ? `${remaining.length} piece${remaining.length === 1 ? "" : "s"} left to place`
        : "Build complete";

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto mb-5 grid max-w-4xl gap-4 sm:grid-cols-[1fr_1fr]">
        {task.mode === "copy" ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-violet-200 bg-white p-4">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">Copy Geospin&apos;s picture</div>
            <BuildObjectVisual objectId={task.objectId} className="h-44 w-44" />
          </div>
        ) : null}
        <div className={`flex min-h-56 flex-col items-center justify-center rounded-xl border-2 border-cyan-300 bg-cyan-50/70 p-4 ${task.mode === "copy" ? "" : "sm:col-span-2"}`}>
          <div className="text-xs font-black uppercase tracking-[0.16em] text-cyan-800">Your build</div>
          <BuildObjectVisual
            objectId={task.objectId}
            visiblePieceIds={placed}
            ghostPieceIds={task.mode === "free" ? [] : remaining}
            className="h-44 w-44"
          />
          <div className="text-sm font-bold text-cyan-950">{instruction}</div>
        </div>
      </div>
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
        {task.options.map((option) => (
          <ShapeChoice
            key={option.id}
            shape={option.shape}
            colour={option.colour}
            label={`Place ${option.shape}`}
            disabled={option.pieceId ? placedSet.has(option.pieceId) : false}
            onClick={() => choose(option.pieceId)}
          />
        ))}
      </div>
    </div>
  );
}

export function StarpathBuildShapeIdentifyCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: BuildShapeIdentifyTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  function choose(shape: BuildShapeIdentifyTask["options"][number]) {
    if (!task.targetShapes.includes(shape)) {
      onWrong();
      return;
    }
    if (selected.includes(shape)) return;
    const next = [...selected, shape];
    setSelected(next);
    if (task.targetShapes.every((targetShape) => next.includes(targetShape))) window.setTimeout(onCorrect, 220);
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto mb-5 flex max-w-xl items-center justify-center rounded-xl border-2 border-violet-200 bg-white p-4">
        <BuildObjectVisual objectId={task.objectId} className="h-52 w-52" />
      </div>
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
        {task.options.map((shape, index) => (
          <ShapeChoice
            key={shape}
            shape={shape}
            colour={["#67e8f9", "#fde047", "#86efac", "#f9a8d4"][index]!}
            label={shape}
            disabled={selected.includes(shape)}
            onClick={() => choose(shape)}
          />
        ))}
      </div>
    </div>
  );
}

function ObjectOptions({
  options,
  correctOptionId,
  onCorrect,
  onWrong,
}: {
  options: Array<{ id: string; objectId: string }>;
  correctOptionId: string;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {options.map((option) => {
        const object = getBuildObject(option.objectId);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => option.id === correctOptionId ? onCorrect() : onWrong()}
            className="relative flex min-h-56 flex-col items-center justify-center rounded-xl border-2 border-violet-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            <OptionReadAloudButton text={object.label} className="absolute right-3 top-3" />
            <BuildObjectVisual objectId={option.objectId} className="h-40 w-40" />
            <span className="mt-2 text-lg font-black text-indigo-950">{object.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function StarpathBuildMatchCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: BuildMatchTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto mb-5 flex max-w-sm flex-col items-center rounded-xl border-2 border-dashed border-cyan-300 bg-cyan-50 p-3">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-cyan-800">Geospin&apos;s build</span>
        <BuildObjectVisual objectId={task.objectId} className="h-36 w-36" />
      </div>
      <ObjectOptions options={task.options} correctOptionId={task.correctOptionId} onCorrect={onCorrect} onWrong={onWrong} />
    </div>
  );
}

export function StarpathSpaceMuseumCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: SpaceMuseumTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <ObjectOptions options={task.options} correctOptionId={task.correctOptionId} onCorrect={onCorrect} onWrong={onWrong} />
    </div>
  );
}
