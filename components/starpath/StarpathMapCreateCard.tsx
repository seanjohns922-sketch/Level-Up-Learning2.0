"use client";

import { useMemo, useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import { PositionObjectVisual } from "@/components/starpath/StarpathPositionCards";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { isStarpathMapCreationValid } from "@/lib/starpath-map-create";

type MapCreateTask = Extract<PracticeTask, { kind: "starpathMapCreate" }>;
type Cell = { r: number; c: number };

export function StarpathMapCreateCard({ task, onComplete, onWrong }: { task: MapCreateTask; onComplete: () => void; onWrong: () => void }) {
  const [selectedId, setSelectedId] = useState(task.landmarks[0]?.id ?? "");
  const [placements, setPlacements] = useState<Record<string, Cell>>({});
  const cells = useMemo(() => Array.from({ length: task.rows * task.cols }, (_, index) => ({ r: Math.floor(index / task.cols), c: index % task.cols })), [task.cols, task.rows]);

  function place(cell: Cell) {
    if (!selectedId) return;
    const occupied = Object.entries(placements).find(([, placed]) => placed.r === cell.r && placed.c === cell.c)?.[0];
    setPlacements((current) => {
      const next = { ...current };
      if (occupied) delete next[occupied];
      next[selectedId] = cell;
      return next;
    });
    const currentIndex = task.landmarks.findIndex((item) => item.id === selectedId);
    const nextUnplaced = task.landmarks.slice(currentIndex + 1).concat(task.landmarks.slice(0, currentIndex + 1)).find((item) => !placements[item.id] && item.id !== occupied);
    if (nextUnplaced) setSelectedId(nextUnplaced.id);
  }

  function check() {
    if (isStarpathMapCreationValid(task, placements)) onComplete();
    else onWrong();
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto grid max-w-4xl gap-4 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div>
          <div className="mb-3 flex flex-wrap justify-center gap-2" aria-label="Landmark palette">
            {task.landmarks.map((landmark) => {
              const active = selectedId === landmark.id;
              return (
                <button key={landmark.id} type="button" aria-pressed={active} onClick={() => setSelectedId(landmark.id)} className={`relative flex min-h-12 items-center gap-2 border-2 px-3 py-2 text-sm font-black transition ${active ? "border-cyan-500 bg-cyan-50 text-cyan-950" : "border-violet-200 bg-white text-indigo-950 hover:border-cyan-300"}`}>
                  <span className="text-xl" aria-hidden="true">{landmark.symbol}</span>
                  <span>{landmark.label}</span>
                  <OptionReadAloudButton text={landmark.label} className="ml-1" />
                </button>
              );
            })}
          </div>
          <div className="grid aspect-[2/1] overflow-hidden border-2 border-cyan-300 bg-slate-950 p-1" style={{ gridTemplateColumns: `repeat(${task.cols}, minmax(0, 1fr))` }}>
            {cells.map((cell) => {
              const placedId = Object.entries(placements).find(([, value]) => value.r === cell.r && value.c === cell.c)?.[0];
              const landmark = task.landmarks.find((item) => item.id === placedId);
              return (
                <button key={`${cell.r}-${cell.c}`} type="button" onClick={() => place(cell)} aria-label={`Row ${cell.r + 1}, column ${cell.c + 1}${landmark ? `, ${landmark.label}` : ""}`} className="min-h-0 min-w-0 border border-cyan-300/25 bg-white/5 p-0.5 transition hover:bg-cyan-300/15">
                  {landmark ? <span className="flex h-full w-full flex-col items-center justify-center"><PositionObjectVisual objectId={landmark.object} className="h-3/5 w-3/5" /><span className="max-w-full truncate text-[7px] font-black text-cyan-100 sm:text-[9px]">{landmark.label}</span></span> : null}
                </button>
              );
            })}
          </div>
        </div>
        <div className="border-l-4 border-amber-400 bg-amber-50 p-4">
          <div className="mb-2 text-sm font-black uppercase text-amber-950">Map conditions</div>
          <ol className="space-y-2">
            {task.constraints.map((constraint, index) => <li key={`${constraint.subjectId}-${constraint.referenceId}`} className="text-sm font-bold text-indigo-950">{index + 1}. {constraint.text}</li>)}
          </ol>
        </div>
      </div>
      <div className="mt-5 flex justify-center gap-3">
        <button type="button" onClick={() => setPlacements({})} title="Reset map" aria-label="Reset map" className="flex h-12 w-12 items-center justify-center border-2 border-slate-300 bg-white text-slate-700 hover:border-slate-500"><RotateCcw className="h-5 w-5" /></button>
        <button type="button" onClick={check} className="flex min-h-12 items-center gap-2 border-2 border-emerald-700 bg-emerald-600 px-5 font-black text-white shadow-sm hover:bg-emerald-700"><Check className="h-5 w-5" />Check map</button>
      </div>
    </div>
  );
}
