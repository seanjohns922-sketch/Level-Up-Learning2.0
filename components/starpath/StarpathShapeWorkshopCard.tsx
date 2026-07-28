"use client";

import { Check, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type WorkshopTask = Extract<PracticeTask, { kind: "starpathShapeWorkshop" }>;
type Point = WorkshopTask["points"][number];

const GRID_SIZE = 5;
const GRID_STEP = 17;
const GRID_OFFSET = 16;

function coordinate(point: Point) {
  return {
    x: GRID_OFFSET + point.c * GRID_STEP,
    y: GRID_OFFSET + point.r * GRID_STEP,
  };
}

function edgeKey(a: Point, b: Point) {
  return [`${a.r}:${a.c}`, `${b.r}:${b.c}`].sort().join("|");
}

function ShapeGrid({
  points,
  selectedCount = points.length + 1,
  missingEdgeIndex,
  onPoint,
  selectedRepairPoints = [],
  label,
}: {
  points: Point[];
  selectedCount?: number;
  missingEdgeIndex?: number;
  onPoint?: (index: number) => void;
  selectedRepairPoints?: number[];
  label: string;
}) {
  const drawnEdges = points.map((point, index) => {
    const next = points[(index + 1) % points.length]!;
    return { point, next, index };
  });

  return (
    <svg
      viewBox="0 0 100 100"
      className="mx-auto h-auto w-full max-w-[280px]"
      role="img"
      aria-label={`${label} construction grid`}
    >
      <defs>
        <linearGradient id={`workshop-fill-${label.replace(/\W/g, "")}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
        const point = { r: Math.floor(index / GRID_SIZE), c: index % GRID_SIZE };
        const { x, y } = coordinate(point);
        return <circle key={index} cx={x} cy={y} r="1.5" fill="#c4b5fd" opacity="0.45" />;
      })}
      {selectedCount > points.length ? (
        <polygon
          points={points.map((point) => {
            const { x, y } = coordinate(point);
            return `${x},${y}`;
          }).join(" ")}
          fill={`url(#workshop-fill-${label.replace(/\W/g, "")})`}
        />
      ) : null}
      {drawnEdges.map(({ point, next, index }) => {
        const from = coordinate(point);
        const to = coordinate(next);
        const isMissing = missingEdgeIndex === index;
        const isDrawn = missingEdgeIndex === undefined
          ? index < selectedCount - 1
          : !isMissing;
        return (
          <line
            key={edgeKey(point, next)}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={isDrawn ? "#4f46e5" : "#f59e0b"}
            strokeWidth={isDrawn ? 4 : 2.5}
            strokeDasharray={isDrawn ? undefined : "4 4"}
            strokeLinecap="round"
            opacity={isDrawn || isMissing ? 1 : 0}
          />
        );
      })}
      {points.map((point, index) => {
        const { x, y } = coordinate(point);
        const selected = selectedRepairPoints.includes(index);
        const reached = index === 0 || index < selectedCount;
        return (
          <g key={`${point.r}-${point.c}`}>
            <circle
              cx={x}
              cy={y}
              r={selected ? 7 : reached ? 5.5 : 5}
              fill={selected ? "#fbbf24" : reached ? "#22d3ee" : "#ffffff"}
              stroke="#312e81"
              strokeWidth="2.5"
            />
            {onPoint ? (
              <circle
                cx={x}
                cy={y}
                r="10"
                fill="transparent"
                className="cursor-pointer"
                onClick={() => onPoint(index)}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

export function StarpathShapeWorkshopCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: WorkshopTask;
  onCorrect: () => void;
  onWrong: (studentAnswer?: string) => void;
}) {
  const [constructStep, setConstructStep] = useState(1);
  const [repairPoints, setRepairPoints] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);

  const missingPair = useMemo(() => {
    if (task.missingEdgeIndex === undefined) return null;
    return [
      task.missingEdgeIndex,
      (task.missingEdgeIndex + 1) % task.points.length,
    ].sort((a, b) => a - b);
  }, [task.missingEdgeIndex, task.points.length]);

  function chooseConstructPoint(index: number) {
    if (complete || task.mode !== "construct") return;
    const expectedIndex = constructStep === task.points.length ? 0 : constructStep;
    if (index !== expectedIndex) {
      onWrong(`Point ${index + 1}`);
      return;
    }
    const nextStep = constructStep + 1;
    setConstructStep(nextStep);
    if (nextStep > task.points.length) {
      setComplete(true);
      window.setTimeout(onCorrect, 650);
    }
  }

  function chooseRepairPoint(index: number) {
    if (complete || task.mode !== "repair" || !missingPair) return;
    const next = [...repairPoints, index];
    if (next.length === 1) {
      setRepairPoints(next);
      return;
    }
    const chosen = [...new Set(next)].sort((a, b) => a - b);
    if (
      chosen.length === 2
      && chosen[0] === missingPair[0]
      && chosen[1] === missingPair[1]
    ) {
      setRepairPoints(chosen);
      setComplete(true);
      window.setTimeout(onCorrect, 650);
      return;
    }
    setRepairPoints([]);
    onWrong(chosen.map((value) => `point ${value + 1}`).join(" and "));
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />

      {task.mode === "compare" && task.secondShape ? (
        <>
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
            {[
              { label: task.shapeLabel, points: task.points },
              task.secondShape,
            ].map((shape, index) => (
              <div
                key={`${shape.label}-${index}`}
                className="rounded-lg border-2 border-violet-200 bg-white p-4 shadow-sm"
              >
                <span className="block text-center text-xs font-black uppercase tracking-[0.16em] text-violet-700">
                  Shape {index === 0 ? "A" : "B"}
                </span>
                <ShapeGrid points={shape.points} label={`${shape.label}-${index}`} />
              </div>
            ))}
          </div>
          <div className="mx-auto mt-5 grid max-w-3xl gap-3 sm:grid-cols-3">
            {task.options?.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => option.id === task.correctOptionId
                  ? onCorrect()
                  : onWrong(option.label)}
                className="relative flex min-h-20 items-center justify-center rounded-lg border-2 border-violet-200 bg-white px-10 py-3 text-base font-black text-indigo-950 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
              >
                {option.label}
                <OptionReadAloudButton text={option.label} className="absolute right-2 top-2" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="mx-auto max-w-xl rounded-lg border-2 border-cyan-300 bg-gradient-to-b from-indigo-50 to-cyan-50 p-5 shadow-inner">
          <div className="mb-2 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-violet-700">
            {task.mode === "repair" ? <Wrench className="h-4 w-4" /> : null}
            {task.mode === "repair" ? "Shape repair grid" : "Connect the stars"}
          </div>
          <ShapeGrid
            points={task.points}
            selectedCount={task.mode === "construct" ? constructStep : undefined}
            missingEdgeIndex={complete ? undefined : task.missingEdgeIndex}
            onPoint={task.mode === "construct" ? chooseConstructPoint : chooseRepairPoint}
            selectedRepairPoints={repairPoints}
            label={task.shapeLabel}
          />
          <p className="mt-2 text-center font-bold text-indigo-950">
            {complete ? (
              <span className="inline-flex items-center gap-2 text-emerald-700">
                <Check className="h-5 w-5" />
                {task.feedback.correct}
              </span>
            ) : task.mode === "construct" ? (
              constructStep === 1
                ? "The glowing star is your start. Tap the next corner."
                : "Keep joining the corners, then return to the start."
            ) : (
              "Tap the two corners that need joining."
            )}
          </p>
        </div>
      )}
    </div>
  );
}
