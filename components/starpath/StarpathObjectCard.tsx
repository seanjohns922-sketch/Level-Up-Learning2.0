"use client";

import { useState } from "react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { StarpathObjectSceneItem, StarpathObjectTask } from "@/data/activities/year1/practice-task";

const OBJ_STYLE = (
  <style>{`
    @keyframes sp-obj-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
    .sp-obj-shake { animation: sp-obj-shake 0.4s ease-in-out; }
    @media (prefers-reduced-motion: reduce) { .sp-obj-shake { animation: none; } }
  `}</style>
);

const BUILD_STYLE = (
  <style>{`
    .sp-build-stage{background:radial-gradient(120% 80% at 50% 6%, #2a2a6e 0%, #16123f 42%, #0b0a24 100%);box-shadow:0 14px 34px -16px rgba(10,8,40,.6), inset 0 0 0 1px rgba(148,163,255,.14);}
    .sp-build-planet{position:absolute;right:-8%;top:6%;width:30%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 35% 30%, #c084fc, #7c3aed 55%, #4c1d95);opacity:.45;}
    .sp-build-pad{position:absolute;left:50%;bottom:7%;width:64%;height:9%;transform:translateX(-50%);background:radial-gradient(ellipse at center, rgba(103,232,249,.45), rgba(103,232,249,.04) 70%);border-radius:50%;}
    .sp-build-exhaust{position:absolute;left:50%;bottom:9%;width:11%;height:18%;transform:translateX(-50%);background:radial-gradient(ellipse at top, rgba(253,224,71,.9), rgba(249,115,22,.5) 42%, transparent 72%);filter:blur(2px);border-radius:0 0 50% 50%;animation:sp-build-flare .5s ease-in-out infinite;}
    @keyframes sp-build-flare{0%,100%{opacity:.7;transform:translateX(-50%) scaleY(.9)}50%{opacity:1;transform:translateX(-50%) scaleY(1.12)}}
    /* Centering is handled by Tailwind's -translate-x/y-1/2 (the CSS 'translate'
       property in v4); the bob must animate 'transform' ONLY, or the two
       compound and the finished model launches out of the frame. */
    .sp-build-float{animation:sp-build-bob 3.6s ease-in-out infinite;}
    @keyframes sp-build-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4%)}}
    .sp-build-badge{position:absolute;left:50%;top:5%;transform:translateX(-50%);background:rgba(16,185,129,.94);color:#fff;font-weight:900;font-size:.78rem;padding:5px 13px;border-radius:999px;z-index:6;box-shadow:0 6px 16px -4px rgba(16,185,129,.6);}
    @media (prefers-reduced-motion: reduce){.sp-build-float,.sp-build-exhaust{animation:none;}}
  `}</style>
);

function ObjectArt({ svg, className }: { svg: string; className?: string }) {
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function ChoiceButton({
  id,
  label,
  wrongId,
  selected,
  onClick,
}: {
  id: string;
  label: string;
  wrongId: string | null;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className={[
          "flex min-h-16 w-full items-center justify-center rounded-2xl border-2 py-3 pl-4 pr-10 text-center shadow-sm transition active:scale-[0.98]",
          wrongId === id
            ? "sp-obj-shake border-rose-400 bg-rose-50"
            : selected
              ? "border-cyan-600 bg-cyan-50 ring-4 ring-cyan-200"
            : "border-violet-200 bg-white hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg",
        ].join(" ")}
      >
        <span className="text-base font-black leading-snug text-balance text-indigo-950">{label}</span>
      </button>
      <OptionReadAloudButton text={label} className="absolute right-2 top-1/2 -translate-y-1/2" />
    </div>
  );
}

function SceneObject({ obj, selected = false }: { obj: StarpathObjectSceneItem; selected?: boolean }) {
  return (
    <>
      <ObjectArt svg={obj.svg} className="block h-20 w-20 sm:h-24 sm:w-24 [&>svg]:h-full [&>svg]:w-full" />
      <span className={selected ? "text-xs font-black text-violet-800" : "text-xs font-bold text-slate-600"}>
        {obj.spaceName ?? obj.label}
      </span>
    </>
  );
}

export function StarpathObjectCard({
  task,
  onCorrect,
  onWrong,
  editableAssessmentMode = false,
  assessmentAnswer,
  onAssessmentAnswer,
}: {
  task: StarpathObjectTask;
  onCorrect: () => void;
  onWrong: () => void;
  editableAssessmentMode?: boolean;
  assessmentAnswer?: string;
  onAssessmentAnswer?: (correct: boolean, response: string) => void;
}) {
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [classified, setClassified] = useState<Record<string, string>>({});
  const [placedSlots, setPlacedSlots] = useState<Record<string, string>>({});

  // No cross-question reset effect needed: TaskRenderer keys this card by the
  // per-question taskNonce, so it remounts (and state resets) every question.

  function miss(id: string) {
    setWrongId(id);
    setTimeout(() => setWrongId((value) => (value === id ? null : value)), 420);
    onWrong();
  }

  if (task.mode === "name" || task.mode === "compare") {
    // Long, sentence-length options (the Week 3 "justify" task) need to stack
    // full-width; short single-word object names read best in three columns.
    const longOption = task.options.some((option) => option.label.length > 18);
    const optionGridClass =
      task.mode !== "name"
        ? "mx-auto grid max-w-lg grid-cols-1 gap-3"
        : longOption
          ? "mx-auto grid max-w-xl grid-cols-1 gap-3"
          : "mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3";
    return (
      <div>
        <TaskHeading prompt={task.prompt} speech={task.speakText} />
        <div className={task.mode === "name" ? "mx-auto mb-6 flex items-center justify-center" : "mx-auto mb-6 flex items-center justify-center gap-4"}>
          {task.scene.map((obj) => (
            <div key={obj.id} className="flex w-40 flex-col items-center gap-1 rounded-2xl border-2 border-violet-200 bg-white p-3 shadow-sm sm:w-48">
              <SceneObject obj={obj} />
            </div>
          ))}
        </div>
        <div className={optionGridClass}>
          {task.options.map((option) => (
            <ChoiceButton
              key={option.id}
              id={option.id}
              label={option.label}
              wrongId={wrongId}
              selected={editableAssessmentMode && assessmentAnswer === option.id}
              onClick={() => {
                if (editableAssessmentMode && onAssessmentAnswer) {
                  onAssessmentAnswer(option.id === task.correctOptionId, option.id);
                  return;
                }
                if (option.id === task.correctOptionId) onCorrect();
                else miss(option.id);
              }}
            />
          ))}
        </div>
        {OBJ_STYLE}
      </div>
    );
  }

  if (task.mode === "classify") {
    const classifyTask = task;
    const remaining = classifyTask.scene.filter((obj) => !classified[obj.id]);
    const isEditableAssessment = editableAssessmentMode && Boolean(onAssessmentAnswer);
    const isComplete = Object.keys(classified).length === classifyTask.scene.length;

    function classify(groupId: string) {
      if (!selectedId) return;
      if (!isEditableAssessment && classifyTask.assignments[selectedId] !== groupId) {
        miss(groupId);
        return;
      }
      const next = { ...classified, [selectedId]: groupId };
      setClassified(next);
      setSelectedId(null);
      if (!isEditableAssessment && Object.keys(next).length === classifyTask.scene.length) onCorrect();
    }

    function moveAgain(objectId: string) {
      if (!isEditableAssessment) return;
      setClassified((current) => {
        const next = { ...current };
        delete next[objectId];
        return next;
      });
      setSelectedId(objectId);
    }

    function recordClassification() {
      if (!isEditableAssessment || !isComplete || !onAssessmentAnswer) return;
      const correct = classifyTask.scene.every(
        (object) => classified[object.id] === classifyTask.assignments[object.id]
      );
      onAssessmentAnswer(correct, JSON.stringify(classified));
    }

    return (
      <div>
        <TaskHeading prompt={task.prompt} speech={task.speakText} />
        <p className="mb-4 text-center text-sm font-bold text-slate-600">
          {isEditableAssessment
            ? "Choose an object, then choose its group. You can move objects before recording your answer."
            : "Choose an object, then choose its group."}
        </p>
        <div className="mx-auto mb-7 grid max-w-6xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {remaining.map((obj) => (
            <div key={obj.id} className="relative">
              <button
                type="button"
                aria-pressed={selectedId === obj.id}
                onClick={() => setSelectedId(obj.id)}
                className={[
                  "flex min-h-32 w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-white p-3 shadow-sm transition",
                  selectedId === obj.id ? "border-violet-600 bg-violet-50 ring-4 ring-violet-200" : "border-violet-200 hover:border-cyan-400",
                ].join(" ")}
              >
                <SceneObject obj={obj} selected={selectedId === obj.id} />
              </button>
              <OptionReadAloudButton text={obj.spaceName ?? obj.label} className="absolute right-1.5 top-1.5" />
            </div>
          ))}
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2">
          {classifyTask.groups.map((group) => {
            const members = classifyTask.scene.filter((obj) => classified[obj.id] === group.id);
            return (
              <div
                key={group.id}
                className={[
                  "relative overflow-hidden rounded-2xl border-2 border-cyan-300 bg-cyan-50/70 shadow-sm",
                  wrongId === group.id ? "sp-obj-shake" : "",
                  selectedId ? "ring-2 ring-cyan-100" : "",
                ].join(" ")}
              >
                <button
                  type="button"
                  disabled={!selectedId}
                  onClick={() => classify(group.id)}
                  className="flex min-h-32 w-full items-center justify-center px-14 py-5 text-center text-lg font-black text-indigo-950 transition enabled:bg-cyan-100 enabled:hover:bg-cyan-200 disabled:cursor-default"
                >
                  <span>
                    {group.label}
                    <span className="mt-2 block text-xs font-bold text-slate-500">
                      {selectedId ? "Place selected object here" : members.length ? `${members.length} placed` : "Select an object above"}
                    </span>
                  </span>
                </button>
                <OptionReadAloudButton text={group.speakText} className="absolute right-3 top-3" />
                <div className="flex min-h-28 flex-wrap items-center justify-center gap-3 border-t-2 border-dashed border-cyan-300 bg-white/80 p-3">
                  {members.map((obj) => (
                    <button
                      key={obj.id}
                      type="button"
                      onClick={() => moveAgain(obj.id)}
                      disabled={!isEditableAssessment}
                      aria-label={isEditableAssessment ? `Move ${obj.spaceName ?? obj.label} to another group` : obj.spaceName ?? obj.label}
                      className="flex min-h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-violet-200 bg-white p-2 text-center shadow-sm transition enabled:hover:border-violet-500 enabled:hover:shadow-md"
                    >
                      <ObjectArt svg={obj.svg} className="block h-14 w-14 [&>svg]:h-full [&>svg]:w-full" />
                      <span className="text-[10px] font-bold leading-tight text-slate-600">{obj.spaceName ?? obj.label}</span>
                    </button>
                  ))}
                  {members.length === 0 ? <span className="text-sm font-bold text-slate-400">Objects placed here will appear in this box.</span> : null}
                </div>
              </div>
            );
          })}
        </div>
        {isEditableAssessment ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              disabled={!isComplete}
              onClick={recordClassification}
              className="min-h-14 rounded-2xl bg-violet-700 px-8 py-3 text-base font-black text-white shadow-lg transition enabled:hover:bg-violet-600 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isComplete ? "Record answer" : `Place all ${classifyTask.scene.length} objects`}
            </button>
          </div>
        ) : null}
        {OBJ_STYLE}
      </div>
    );
  }

  if (task.mode === "build") {
    const buildTask = task;
    const usedPieceIds = new Set(Object.values(placedSlots));
    const available = buildTask.palette.filter((piece) => !usedPieceIds.has(piece.id));
    const placedCount = Object.keys(placedSlots).length;
    const complete = placedCount === buildTask.slots.length;
    const [vbX, vbY, vbW, vbH] = buildTask.viewBox.split(/\s+/).map(Number) as [number, number, number, number];
    const modelAspect = vbW / vbH;
    // Size the model box to the model's own aspect so it fits the 4:5 stage with
    // no letterboxing — then hit-boxes map straight from viewBox coords.
    const boxStyle = modelAspect > 0.8
      ? { width: "88%", aspectRatio: `${vbW} / ${vbH}` }
      : { height: "84%", aspectRatio: `${vbW} / ${vbH}` };
    const modelSvg = `<svg viewBox="${buildTask.viewBox}" xmlns="http://www.w3.org/2000/svg">${buildTask.defs}${buildTask.slots.map((s) => (placedSlots[s.id] ? s.solid : s.ghost)).join("")}</svg>`;

    function place(slotId: string) {
      if (!selectedId) return;
      const piece = buildTask.palette.find((candidate) => candidate.id === selectedId);
      const slot = buildTask.slots.find((candidate) => candidate.id === slotId);
      if (!piece || !slot || placedSlots[slotId] || piece.shape !== slot.shape) {
        miss(slotId);
        return;
      }
      const next = { ...placedSlots, [slotId]: piece.id };
      setPlacedSlots(next);
      setSelectedId(null);
      if (Object.keys(next).length === buildTask.slots.length) onCorrect();
    }

    return (
      <div>
        <TaskHeading prompt={task.prompt} speech={task.speakText} />
        <p className="mb-3 text-center text-sm font-bold text-slate-600">Choose a shape or object, then tap the glowing part it matches.</p>
        <div className="mx-auto max-w-xs">
          <div className="sp-build-stage relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-3xl">
            <div className="sp-build-planet" aria-hidden="true" />
            <div className="sp-build-pad" aria-hidden="true" />
            {complete ? <div className="sp-build-exhaust" aria-hidden="true" /> : null}
            <div
              className={["absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2", complete ? "sp-build-float" : ""].join(" ")}
              style={boxStyle}
            >
              <div
                className="pointer-events-none absolute inset-0 [&>svg]:h-full [&>svg]:w-full"
                style={{ filter: "drop-shadow(0 8px 10px rgba(0,0,0,.42))" }}
                dangerouslySetInnerHTML={{ __html: modelSvg }}
              />
              {buildTask.slots.map((slot) => {
                if (placedSlots[slot.id]) return null;
                const l = ((slot.hit.x - vbX) / vbW) * 100;
                const t = ((slot.hit.y - vbY) / vbH) * 100;
                const w = (slot.hit.w / vbW) * 100;
                const h = (slot.hit.h / vbH) * 100;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={!selectedId}
                    aria-label={`${slot.label} — needs a ${slot.shape}`}
                    onClick={() => place(slot.id)}
                    style={{ left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` }}
                    className={["absolute rounded-xl transition", wrongId === slot.id ? "sp-obj-shake bg-rose-400/30" : "enabled:hover:bg-cyan-300/25"].join(" ")}
                  >
                    <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900/80 px-2 py-0.5 text-[9px] font-black text-cyan-200">{slot.label}</span>
                  </button>
                );
              })}
            </div>
            {complete ? <div className="sp-build-badge">{buildTask.modelName} complete!</div> : null}
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-slate-500">{placedCount}/{buildTask.slots.length} parts placed</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2.5">
            {available.map((piece) => (
              <button
                key={piece.id}
                type="button"
                aria-pressed={selectedId === piece.id}
                aria-label={piece.label}
                title={piece.label}
                onClick={() => setSelectedId(piece.id)}
                className={["flex h-16 w-16 items-center justify-center rounded-2xl border-2 bg-white shadow-sm transition [&>svg]:h-10 [&>svg]:w-10", selectedId === piece.id ? "border-violet-600 bg-violet-50 ring-4 ring-violet-200" : "border-violet-200 hover:-translate-y-0.5 hover:border-cyan-400"].join(" ")}
                dangerouslySetInnerHTML={{ __html: piece.svg }}
              />
            ))}
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-slate-500">{selectedId ? "Now tap the glowing part it belongs to." : "Pick a shape or object."}</p>
        </div>
        {BUILD_STYLE}
        {OBJ_STYLE}
      </div>
    );
  }

  if (task.mode !== "find") return null;
  const findTask = task;

  return (
    <div>
      <TaskHeading prompt={findTask.prompt} speech={findTask.speakText} />
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
        {findTask.scene.map((obj) => (
          <div key={obj.id} className="relative">
            <button
              type="button"
              aria-label={obj.label}
              aria-pressed={editableAssessmentMode ? assessmentAnswer === obj.id : undefined}
              onClick={() => {
                if (editableAssessmentMode && onAssessmentAnswer) {
                  onAssessmentAnswer(obj.id === findTask.correctObjectId, obj.id);
                  return;
                }
                if (obj.id === findTask.correctObjectId) onCorrect();
                else miss(obj.id);
              }}
              className={[
                "flex min-h-32 w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-white p-3 shadow-sm transition active:scale-95",
                wrongId === obj.id
                  ? "sp-obj-shake border-rose-400 bg-rose-50"
                  : editableAssessmentMode && assessmentAnswer === obj.id
                    ? "border-cyan-600 bg-cyan-50 ring-4 ring-cyan-200"
                  : "border-violet-200 hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg",
              ].join(" ")}
            >
              <ObjectArt svg={obj.svg} className="block h-20 w-20 sm:h-24 sm:w-24 [&>svg]:h-full [&>svg]:w-full" />
              {obj.reason ? <span className="text-xs font-bold text-indigo-950">{obj.reason}</span> : <span className="text-[11px] font-bold text-slate-500">{obj.spaceName}</span>}
            </button>
            <OptionReadAloudButton text={obj.reason ?? obj.spaceName ?? obj.label} className="absolute right-1.5 top-1.5" />
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm font-semibold text-slate-600">Tap the object.</p>
      {OBJ_STYLE}
    </div>
  );
}
