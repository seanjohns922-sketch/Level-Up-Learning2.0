"use client";

import { RotateCcw, ScanSearch, Sparkles } from "lucide-react";
import { useState } from "react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { ShapeVisual, TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import { BuildObjectVisual } from "@/components/starpath/StarpathShapeBuilderCards";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type DisguiseTask = Extract<PracticeTask, { kind: "starpathShapeDisguise" }>;
type FaceOffTask = Extract<PracticeTask, { kind: "starpathShapeFaceOff" }>;
type MysteryTask = Extract<PracticeTask, { kind: "starpathMysteryShape" }>;
type ClassifyTask = Extract<PracticeTask, { kind: "starpathShapeClassify" }>;
type ViewpointTask = Extract<PracticeTask, { kind: "starpathViewpoint" }>;

function ShapeChoice({
  option,
  onClick,
  showLabel = true,
}: {
  option: {
    id: string;
    shape: DisguiseTask["shape"];
    colour: string;
    scale?: number;
    rotation: number;
    label?: string;
  };
  onClick: () => void;
  showLabel?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex min-h-36 flex-col items-center justify-center rounded-lg border-2 border-violet-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
    >
      <OptionReadAloudButton
        text={option.label ?? option.shape}
        className="absolute right-2 top-2"
      />
      <div style={{ transform: `rotate(${option.rotation}deg)` }}>
        <ShapeVisual
          shape={option.shape}
          colour={option.colour}
          scale={option.scale ?? 0.9}
          className="h-20 w-24 sm:h-24 sm:w-28"
        />
      </div>
      {showLabel ? (
        <span className="mt-2 text-base font-black capitalize text-indigo-950">
          {option.label ?? option.shape}
        </span>
      ) : null}
    </button>
  );
}

export function StarpathShapeDisguiseCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: DisguiseTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [scannerReady, setScannerReady] = useState(task.mode === "match");
  const [turn, setTurn] = useState(task.rotation);

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />

      {task.mode === "match" ? (
        <div className="mx-auto mb-5 flex max-w-sm flex-col items-center rounded-lg border-2 border-cyan-300 bg-cyan-50 p-4">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-cyan-800">
            Explorer&apos;s target
          </span>
          <ShapeVisual
            shape={task.shape}
            colour={task.colour}
            className="mt-2 h-24 w-28"
          />
        </div>
      ) : (
        <div className="mx-auto mb-5 max-w-lg overflow-hidden rounded-lg border-2 border-cyan-300 bg-indigo-950 p-5 text-center shadow-inner">
          <div className="mb-2 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
            <ScanSearch className="h-5 w-5" />
            {task.mode === "hologram" ? "Unstable hologram" : "Shape turntable"}
          </div>
          <div
            className={[
              "mx-auto flex h-40 w-48 items-center justify-center transition duration-500",
              task.mode === "hologram" && !scannerReady
                ? "scale-75 opacity-30 blur-md"
                : "opacity-100 blur-0",
            ].join(" ")}
            style={{ transform: `rotate(${turn}deg)` }}
          >
            <ShapeVisual
              shape={task.shape}
              colour={task.colour}
              scale={task.scale}
              className="h-32 w-40"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setScannerReady(true);
              if (task.mode === "turntable") setTurn((value) => value + 55);
            }}
            className="mt-2 inline-flex min-h-12 items-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 font-black text-indigo-950 transition hover:bg-cyan-200 active:scale-[0.98]"
          >
            {task.mode === "hologram" ? (
              <Sparkles className="h-5 w-5" />
            ) : (
              <RotateCcw className="h-5 w-5" />
            )}
            {task.mode === "hologram" ? "Stabilise hologram" : "Turn the scanner"}
          </button>
        </div>
      )}

      {scannerReady ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {task.options.map((option) => (
            <ShapeChoice
              key={option.id}
              option={option}
              onClick={() =>
                option.id === task.correctOptionId ? onCorrect() : onWrong()
              }
              showLabel={task.mode !== "match"}
            />
          ))}
        </div>
      ) : (
        <p className="text-center font-bold text-slate-600">
          Stabilise the image before identifying the shape.
        </p>
      )}
    </div>
  );
}

export function StarpathShapeFaceOffCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: FaceOffTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4">
        {[
          { ...task.left, label: "Shape A" },
          { ...task.right, label: "Shape B" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex min-h-48 flex-col items-center justify-center rounded-lg border-2 border-violet-200 bg-white p-4 shadow-sm"
          >
            <span className="mb-2 text-xs font-black uppercase tracking-[0.16em] text-violet-700">
              {item.label}
            </span>
            <div style={{ transform: `rotate(${item.rotation}deg)` }}>
              <ShapeVisual
                shape={item.shape}
                colour={item.colour}
                scale={item.scale}
                className="h-28 w-32 sm:h-36 sm:w-40"
              />
            </div>
          </div>
        ))}
      </div>
      <div
        className={[
          "mx-auto mt-5 grid max-w-2xl gap-3",
          task.options.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3",
        ].join(" ")}
      >
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() =>
              option.id === task.correctOptionId ? onCorrect() : onWrong()
            }
            className="relative flex min-h-16 items-center justify-center rounded-lg border-2 border-violet-200 bg-white px-5 text-lg font-black text-indigo-950 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            {option.label}
            <OptionReadAloudButton
              text={option.label}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function StarpathMysteryShapeCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: MysteryTask;
  onCorrect: () => void;
  onWrong: (studentAnswer?: string) => void;
}) {
  const [visibleClues, setVisibleClues] = useState(
    task.mode === "elimination" ? 1 : task.clues.length
  );
  const cluesReady = visibleClues >= task.clues.length;

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto mb-5 max-w-3xl rounded-lg border-2 border-cyan-300 bg-indigo-950 p-4 text-white shadow-inner">
        <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
          <ScanSearch className="h-5 w-5" />
          {task.mode === "label-repair" ? "Scanner labels" : "Geospin's clues"}
        </div>
        {task.mode !== "label-repair" ? (
          <>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {task.clues.slice(0, visibleClues).map((clue, index) => (
                <div
                  key={clue}
                  className="rounded-lg border border-cyan-200/30 bg-white/10 px-3 py-3 text-center font-bold"
                >
                  Clue {index + 1}: {clue}
                </div>
              ))}
            </div>
            {task.mode === "elimination" && !cluesReady ? (
              <button
                type="button"
                onClick={() =>
                  setVisibleClues((value) =>
                    Math.min(task.clues.length, value + 1)
                  )
                }
                className="mx-auto mt-3 flex min-h-11 items-center gap-2 rounded-lg bg-cyan-300 px-4 py-2 font-black text-indigo-950"
              >
                Reveal next clue
              </button>
            ) : null}
          </>
        ) : (
          <p className="mt-2 text-center font-bold text-violet-100">
            One shape name does not match its picture. Tap the card that needs repairing.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {task.options.map((option) => (
          <ShapeChoice
            key={option.id}
            option={option}
            onClick={() => {
              if (!cluesReady && task.mode === "elimination") return;
              if (option.id === task.correctOptionId) onCorrect();
              else {
                onWrong(
                  task.mode === "label-repair"
                    ? `${option.shape} labelled ${option.label}`
                    : option.label
                );
              }
            }}
            showLabel={task.mode === "label-repair"}
          />
        ))}
      </div>
      {!cluesReady && task.mode === "elimination" ? (
        <p className="mt-3 text-center font-bold text-slate-600">
          Reveal every clue before choosing.
        </p>
      ) : null}
    </div>
  );
}

// ── Level 1 · Week 2 — Shape Families (classify by a shared feature) ─────────
// A specimen (or a small group) is shown, then the student chooses which family
// / rule it fits. Single-answer so it grades cleanly in the weekly quiz.
export function StarpathShapeClassifyCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: ClassifyTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const caption =
    task.mode === "belongs"
      ? "Which family does it join?"
      : task.mode === "rule"
        ? "Which rule sorts this group?"
        : "Which other rule also works?";
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto mb-5 flex w-full max-w-md flex-col items-center rounded-2xl border-2 border-cyan-300 bg-cyan-50 p-4">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-cyan-800">{caption}</span>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {task.specimens.map((specimen) => (
            <div
              key={specimen.id}
              className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-violet-200 bg-white p-2 shadow-sm"
            >
              <ShapeVisual shape={specimen.shape} colour={specimen.colour} scale={specimen.scale} className="h-16 w-16" />
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="relative flex min-h-16 items-center justify-center rounded-2xl border-2 border-violet-200 bg-white px-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            <span className="text-lg font-black text-indigo-950">{option.label}</span>
            <OptionReadAloudButton text={option.label} className="absolute right-2 top-1/2 -translate-y-1/2" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Level 1 · Week 4 — Objects and Views ─────────────────────────────────────
// Show a built object; the student picks the matching picture, the view from a
// stated viewpoint, or the most useful representation. Options render either a
// plain shape (a view) or a built object (a picture).
const VIEWPOINT_WORD: Record<NonNullable<ViewpointTask["viewpoint"]>, string> = {
  front: "the front",
  top: "the top",
  side: "the side",
};

export function StarpathViewpointCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: ViewpointTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const caption =
    task.mode === "viewpoint" && task.viewpoint
      ? `Looking from ${VIEWPOINT_WORD[task.viewpoint]}`
      : task.mode === "bestview"
        ? "Choose the most useful picture"
        : "Match the object to its picture";
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto mb-5 flex w-full max-w-xs flex-col items-center rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-indigo-950 via-violet-900 to-slate-950 p-4 text-white shadow-inner">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">{caption}</span>
        <BuildObjectVisual objectId={task.objectId} className="mt-1 h-32 w-32" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-label={option.label}
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="relative flex min-h-36 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-violet-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            <OptionReadAloudButton text={option.label} className="absolute right-2 top-2" />
            {option.render === "shape" && option.shape ? (
              <ShapeVisual shape={option.shape} colour="#a5f3fc" className="h-20 w-20" />
            ) : (
              <BuildObjectVisual objectId={option.objectId ?? task.objectId} className="h-24 w-24" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
