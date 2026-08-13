"use client";

import { useMemo } from "react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { getL2Shape, l2ShapeSvg } from "@/data/activities/starpath/level2/l2-shapes";

type FeatureTask = Extract<PracticeTask, { kind: "starpathShapeFeature" }>;

function L2Shape({ id, colour, className }: { id: string; colour?: string; className?: string }) {
  const markup = useMemo(() => l2ShapeSvg(getL2Shape(id), { size: 120, colour }), [id, colour]);
  return (
    <span
      className={className ?? "block h-24 w-24"}
      role="img"
      aria-label={getL2Shape(id).label}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

export function StarpathShapeFeatureCard({
  task,
  onCorrect,
  onWrong,
  editableAssessmentMode = false,
  assessmentAnswer,
  onAssessmentAnswer,
}: {
  task: FeatureTask;
  onCorrect: () => void;
  onWrong: () => void;
  editableAssessmentMode?: boolean;
  assessmentAnswer?: string;
  onAssessmentAnswer?: (correct: boolean, response: string) => void;
}) {
  const twoUp = task.mode === "compare" && task.shapes.length === 2;
  const iconOptions = task.options.some((option) => option.shapeId);

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />

      {task.shapes.length > 0 ? (
        <div className={["mx-auto mb-5 flex items-center justify-center gap-6"].join(" ")}>
          {task.shapes.map((shape, index) => (
            <div
              key={`${shape.id}-${index}`}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-violet-200 bg-white p-4 shadow-sm"
            >
              {twoUp ? (
                <span className="text-xs font-black uppercase tracking-[0.16em] text-violet-700">
                  {index === 0 ? "Shape A" : "Shape B"}
                </span>
              ) : null}
              <L2Shape id={shape.id} colour={shape.colour} className="block h-28 w-28 sm:h-32 sm:w-32" />
            </div>
          ))}
        </div>
      ) : null}

      <div
        className={[
          "mx-auto grid gap-3",
          iconOptions
            ? "max-w-lg grid-cols-2 sm:grid-cols-3"
            : task.options.length <= 2
              ? "max-w-xl grid-cols-2"
              : "max-w-3xl grid-cols-1 sm:grid-cols-3",
        ].join(" ")}
      >
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={editableAssessmentMode ? assessmentAnswer === option.id : undefined}
            onClick={() => {
              if (editableAssessmentMode && onAssessmentAnswer) {
                onAssessmentAnswer(option.id === task.correctOptionId, option.id);
                return;
              }
              if (option.id === task.correctOptionId) onCorrect();
              else onWrong();
            }}
            className={[
              "relative flex items-center justify-center rounded-2xl border-2 border-violet-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]",
              editableAssessmentMode && assessmentAnswer === option.id
                ? "border-cyan-600 bg-cyan-50 ring-4 ring-cyan-200"
                : "",
              option.shapeId ? "min-h-28 p-3" : "min-h-24 px-4 py-3",
            ].join(" ")}
          >
            {option.shapeId ? (
              <>
                <OptionReadAloudButton text={option.label} className="absolute right-2 top-2" />
                <L2Shape id={option.shapeId} className="block h-20 w-20" />
              </>
            ) : (
              <span className="flex flex-col items-center gap-2">
                <span className="text-lg font-black leading-snug text-indigo-950 sm:text-xl">{option.label}</span>
                <OptionReadAloudButton text={option.label} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
