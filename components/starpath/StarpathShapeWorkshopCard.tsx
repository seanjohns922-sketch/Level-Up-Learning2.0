"use client";

import { Check, RotateCcw, Undo2, Wrench } from "lucide-react";
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

function samePoint(a: Point, b: Point) {
  return a.r === b.r && a.c === b.c;
}

function orientation(a: Point, b: Point, c: Point) {
  return (b.c - a.c) * (c.r - a.r) - (b.r - a.r) * (c.c - a.c);
}

function liesOnSegment(a: Point, b: Point, point: Point) {
  return orientation(a, b, point) === 0
    && point.c >= Math.min(a.c, b.c)
    && point.c <= Math.max(a.c, b.c)
    && point.r >= Math.min(a.r, b.r)
    && point.r <= Math.max(a.r, b.r);
}

function segmentsIntersect(a: Point, b: Point, c: Point, d: Point) {
  const abC = orientation(a, b, c);
  const abD = orientation(a, b, d);
  const cdA = orientation(c, d, a);
  const cdB = orientation(c, d, b);
  return (abC * abD < 0 && cdA * cdB < 0)
    || (abC === 0 && liesOnSegment(a, b, c))
    || (abD === 0 && liesOnSegment(a, b, d))
    || (cdA === 0 && liesOnSegment(c, d, a))
    || (cdB === 0 && liesOnSegment(c, d, b));
}

function isSimplePolygon(points: Point[]) {
  if (points.length < 3) return false;
  if (points.some((point, index) => orientation(points[index - 1] ?? points.at(-1)!, point, points[(index + 1) % points.length]!) === 0)) {
    return false;
  }
  for (let first = 0; first < points.length; first += 1) {
    const firstNext = (first + 1) % points.length;
    for (let second = first + 1; second < points.length; second += 1) {
      const secondNext = (second + 1) % points.length;
      if (first === second || firstNext === second || secondNext === first) continue;
      if (segmentsIntersect(points[first]!, points[firstNext]!, points[second]!, points[secondNext]!)) return false;
    }
  }
  return true;
}

function parallelPairCount(points: Point[]) {
  const edges = points.map((point, index) => {
    const next = points[(index + 1) % points.length]!;
    return { x: next.c - point.c, y: next.r - point.r };
  });
  let pairs = 0;
  for (let first = 0; first < edges.length; first += 1) {
    for (let second = first + 1; second < edges.length; second += 1) {
      if (edges[first]!.x * edges[second]!.y === edges[first]!.y * edges[second]!.x) pairs += 1;
    }
  }
  return pairs;
}

function assessmentConstructionIsCorrect(task: WorkshopTask, points: Point[]) {
  if (points.length !== task.points.length || !isSimplePolygon(points)) return false;
  if (!task.prompt.toLowerCase().includes("parallel")) return true;
  return parallelPairCount(points) >= parallelPairCount(task.points);
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

function AssessmentConstructionGrid({
  selectedPoints,
  onPoint,
  label,
}: {
  selectedPoints: Point[];
  onPoint: (point: Point) => void;
  label: string;
}) {
  const start = selectedPoints[0]!;
  return (
    <svg viewBox="0 0 100 100" className="mx-auto h-auto w-full max-w-[280px]" role="img" aria-label={`${label} construction grid`}>
      {selectedPoints.slice(1).map((point, index) => {
        const from = coordinate(selectedPoints[index]!);
        const to = coordinate(point);
        return <line key={`${index}-${point.r}-${point.c}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />;
      })}
      {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
        const point = { r: Math.floor(index / GRID_SIZE), c: index % GRID_SIZE };
        const { x, y } = coordinate(point);
        const selectedIndex = selectedPoints.findIndex((selected) => samePoint(selected, point));
        const isStart = samePoint(start, point);
        return (
          <g key={index}>
            <circle
              cx={x}
              cy={y}
              r={isStart ? 5.5 : selectedIndex > 0 ? 4.5 : 1.8}
              fill={isStart ? "#22d3ee" : selectedIndex > 0 ? "#ffffff" : "#c4b5fd"}
              stroke={selectedIndex >= 0 ? "#312e81" : "transparent"}
              strokeWidth={selectedIndex >= 0 ? 2.5 : 0}
              opacity={selectedIndex >= 0 ? 1 : 0.55}
            />
            <circle cx={x} cy={y} r="8" fill="transparent" className="cursor-pointer" onClick={() => onPoint(point)} />
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
  assessmentMode = false,
}: {
  task: WorkshopTask;
  onCorrect: () => void;
  onWrong: (studentAnswer?: string) => void;
  assessmentMode?: boolean;
}) {
  const [constructStep, setConstructStep] = useState(1);
  const [repairPoints, setRepairPoints] = useState<number[]>([]);
  const [complete, setComplete] = useState(false);
  const [assessmentPoints, setAssessmentPoints] = useState<Point[]>([task.points[0]!]);

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

  function chooseAssessmentPoint(point: Point) {
    if (complete || task.mode !== "construct") return;
    const start = assessmentPoints[0]!;
    if (samePoint(point, start)) {
      if (assessmentPoints.length !== task.points.length) return;
      setComplete(true);
      if (assessmentConstructionIsCorrect(task, assessmentPoints)) onCorrect();
      else onWrong(assessmentPoints.map((item) => `${item.r}:${item.c}`).join(","));
      return;
    }
    if (assessmentPoints.length >= task.points.length || assessmentPoints.some((selected) => samePoint(selected, point))) return;
    setAssessmentPoints((current) => [...current, point]);
  }

  const assessmentConstruct = assessmentMode && task.mode === "construct";

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
          {assessmentConstruct ? (
            <AssessmentConstructionGrid selectedPoints={assessmentPoints} onPoint={chooseAssessmentPoint} label={task.shapeLabel} />
          ) : (
            <ShapeGrid
              points={task.points}
              selectedCount={task.mode === "construct" ? constructStep : undefined}
              missingEdgeIndex={complete ? undefined : task.missingEdgeIndex}
              onPoint={task.mode === "construct" ? chooseConstructPoint : chooseRepairPoint}
              selectedRepairPoints={repairPoints}
              label={task.shapeLabel}
            />
          )}
          {assessmentConstruct ? (
            <div className="mt-3 flex justify-center gap-2">
              <button
                type="button"
                disabled={assessmentPoints.length <= 1}
                onClick={() => setAssessmentPoints((current) => current.slice(0, -1))}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-violet-200 bg-white px-4 text-sm font-black text-indigo-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Undo2 className="h-4 w-4" /> Undo
              </button>
              <button
                type="button"
                disabled={assessmentPoints.length <= 1}
                onClick={() => setAssessmentPoints([task.points[0]!])}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-violet-200 bg-white px-4 text-sm font-black text-indigo-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" /> Clear
              </button>
            </div>
          ) : null}
          <p className="mt-2 text-center font-bold text-indigo-950">
            {complete ? (
              <span className="inline-flex items-center gap-2 text-emerald-700">
                <Check className="h-5 w-5" />
                {task.feedback.correct}
              </span>
            ) : assessmentConstruct ? (
              assessmentPoints.length === task.points.length
                ? "Tap the blue starting point to close and submit your shape."
                : `Choose ${task.points.length - assessmentPoints.length} more ${task.points.length - assessmentPoints.length === 1 ? "corner" : "corners"}.`
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
