"use client";

import { useEffect, useState } from "react";
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

function ObjectArt({ svg, className }: { svg: string; className?: string }) {
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}

function ChoiceButton({
  id,
  label,
  wrongId,
  onClick,
}: {
  id: string;
  label: string;
  wrongId: string | null;
  onClick: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className={[
          "flex min-h-16 w-full items-center justify-center rounded-2xl border-2 px-12 text-center shadow-sm transition active:scale-[0.98]",
          wrongId === id
            ? "sp-obj-shake border-rose-400 bg-rose-50"
            : "border-violet-200 bg-white hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg",
        ].join(" ")}
      >
        <span className="text-base font-black text-indigo-950">{label}</span>
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
}: {
  task: StarpathObjectTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [classified, setClassified] = useState<Record<string, string>>({});
  const [placedSlots, setPlacedSlots] = useState<Record<string, string>>({});

  useEffect(() => {
    setWrongId(null);
    setSelectedId(null);
    setClassified({});
    setPlacedSlots({});
  }, [task.target]);

  function miss(id: string) {
    setWrongId(id);
    setTimeout(() => setWrongId((value) => (value === id ? null : value)), 420);
    onWrong();
  }

  if (task.mode === "name" || task.mode === "compare") {
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
        <div className={task.mode === "name" ? "mx-auto grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3" : "mx-auto grid max-w-lg grid-cols-1 gap-3"}>
          {task.options.map((option) => (
            <ChoiceButton
              key={option.id}
              id={option.id}
              label={option.label}
              wrongId={wrongId}
              onClick={() => (option.id === task.correctOptionId ? onCorrect() : miss(option.id))}
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

    function classify(groupId: string) {
      if (!selectedId) return;
      if (classifyTask.assignments[selectedId] !== groupId) {
        miss(groupId);
        return;
      }
      const next = { ...classified, [selectedId]: groupId };
      setClassified(next);
      setSelectedId(null);
      if (Object.keys(next).length === classifyTask.scene.length) onCorrect();
    }

    return (
      <div>
        <TaskHeading prompt={task.prompt} speech={task.speakText} />
        <p className="mb-3 text-center text-sm font-bold text-slate-600">Choose an object, then choose its group.</p>
        <div className="mx-auto mb-6 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-5">
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
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          {classifyTask.groups.map((group) => {
            const members = classifyTask.scene.filter((obj) => classified[obj.id] === group.id);
            return (
              <div key={group.id} className={wrongId === group.id ? "sp-obj-shake" : ""}>
                <button
                  type="button"
                  disabled={!selectedId}
                  onClick={() => classify(group.id)}
                  className="min-h-20 w-full rounded-2xl border-2 border-cyan-300 bg-cyan-50 px-12 py-3 text-base font-black text-indigo-950 shadow-sm transition enabled:hover:border-violet-500 disabled:opacity-55"
                >
                  {group.label}
                </button>
                <OptionReadAloudButton text={group.speakText} className="relative -mt-14 ml-auto mr-3 block" />
                <div className="mt-3 flex min-h-16 flex-wrap justify-center gap-2 rounded-xl border border-dashed border-cyan-300 bg-white/70 p-2">
                  {members.map((obj) => (
                    <ObjectArt key={obj.id} svg={obj.svg} className="block h-14 w-14 [&>svg]:h-full [&>svg]:w-full" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {OBJ_STYLE}
      </div>
    );
  }

  if (task.mode === "build") {
    const buildTask = task;
    const usedPieceIds = new Set(Object.values(placedSlots));
    const available = buildTask.pieces.filter((piece) => !usedPieceIds.has(piece.id));

    function place(slotId: string) {
      if (!selectedId) return;
      const piece = buildTask.pieces.find((candidate) => candidate.id === selectedId);
      const slot = buildTask.slots.find((candidate) => candidate.id === slotId);
      if (!piece || !slot || piece.objectId !== slot.correctObjectId) {
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
        <p className="mb-3 text-center text-sm font-bold text-slate-600">Choose a 3D object, then place it in the matching part.</p>
        <div className="mx-auto mb-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {available.map((piece) => (
            <div key={piece.id} className="relative">
              <button
                type="button"
                aria-pressed={selectedId === piece.id}
                onClick={() => setSelectedId(piece.id)}
                className={[
                  "flex min-h-32 w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-white p-3 shadow-sm transition",
                  selectedId === piece.id ? "border-violet-600 bg-violet-50 ring-4 ring-violet-200" : "border-violet-200 hover:border-cyan-400",
                ].join(" ")}
              >
                <SceneObject obj={piece} selected={selectedId === piece.id} />
              </button>
              <OptionReadAloudButton text={piece.spaceName ?? piece.label} className="absolute right-1.5 top-1.5" />
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-3xl rounded-3xl border-2 border-cyan-300 bg-cyan-50 p-4">
          <p className="mb-4 text-center text-lg font-black text-indigo-950">Build: {buildTask.modelName}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {buildTask.slots.map((slot) => {
              const piece = buildTask.pieces.find((candidate) => candidate.id === placedSlots[slot.id]);
              return (
                <button
                  key={slot.id}
                  type="button"
                  disabled={!!piece || !selectedId}
                  onClick={() => place(slot.id)}
                  className={[
                    "flex min-h-24 items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 font-black transition",
                    piece ? "border-emerald-400 bg-emerald-50 text-emerald-900" : "border-violet-300 bg-white text-indigo-950 enabled:hover:border-violet-600",
                    wrongId === slot.id ? "sp-obj-shake border-rose-400 bg-rose-50" : "",
                  ].join(" ")}
                >
                  {piece ? <ObjectArt svg={piece.svg} className="block h-16 w-16 [&>svg]:h-full [&>svg]:w-full" /> : null}
                  <span>{slot.label}</span>
                </button>
              );
            })}
          </div>
        </div>
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
              onClick={() => (obj.id === findTask.correctObjectId ? onCorrect() : miss(obj.id))}
              className={[
                "flex min-h-32 w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-white p-3 shadow-sm transition active:scale-95",
                wrongId === obj.id
                  ? "sp-obj-shake border-rose-400 bg-rose-50"
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
