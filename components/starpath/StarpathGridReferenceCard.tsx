"use client";

import { useMemo, useState } from "react";
import { Check, Package, RotateCcw } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import { PositionObjectVisual } from "@/components/starpath/StarpathPositionCards";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { normaliseGridReference } from "@/lib/starpath-grid-reference";

type GridTask = Extract<PracticeTask, { kind: "starpathGridReference" }>;
type Cell = { r: number; c: number };

function sameCell(a: Cell | null, b: Cell | null | undefined): boolean {
  return Boolean(a && b && a.r === b.r && a.c === b.c);
}

export function StarpathGridReferenceCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GridTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [selectedLandmarkId, setSelectedLandmarkId] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [typedReference, setTypedReference] = useState("");
  const [assignedColumns, setAssignedColumns] = useState<string[]>(() => Array(task.cols).fill(""));
  const [assignedRows, setAssignedRows] = useState<string[]>(() => Array(task.rows).fill(""));

  const cells = useMemo(
    () => Array.from({ length: task.rows * task.cols }, (_, index) => ({ r: Math.floor(index / task.cols), c: index % task.cols })),
    [task.cols, task.rows],
  );

  const shownColumns = task.mode === "repairLabels"
    ? task.faultyColumnLabels ?? task.columnLabels
    : task.mode === "labelGrid"
      ? assignedColumns
      : task.columnLabels;
  const shownRows = task.mode === "repairLabels"
    ? task.faultyRowLabels ?? task.rowLabels
    : task.mode === "labelGrid"
      ? assignedRows
      : task.rowLabels;

  const gridTemplateColumns = `2.75rem repeat(${task.cols}, minmax(0, 1fr))`;

  function reset() {
    setSelectedCell(null);
    setSelectedLandmarkId("");
    setSelectedOptionId("");
    setTypedReference("");
    setAssignedColumns(Array(task.cols).fill(""));
    setAssignedRows(Array(task.rows).fill(""));
  }

  function check() {
    if (task.mode === "referenceToCell" || task.mode === "placeAtReference") {
      if (sameCell(selectedCell, task.correctCell)) onCorrect();
      else onWrong();
      return;
    }
    if (task.mode === "referenceToLandmark") {
      if (selectedLandmarkId === task.correctLandmarkId) onCorrect();
      else onWrong();
      return;
    }
    if (task.mode === "typeReference") {
      if (normaliseGridReference(typedReference) === normaliseGridReference(task.expectedReference ?? "")) onCorrect();
      else onWrong();
      return;
    }
    if (task.mode === "labelGrid") {
      const columnsCorrect = assignedColumns.every((label, index) => label === task.columnLabels[index]);
      const rowsCorrect = assignedRows.every((label, index) => label === task.rowLabels[index]);
      if (columnsCorrect && rowsCorrect) onCorrect();
      else onWrong();
      return;
    }
    if (selectedOptionId === task.correctOptionId) onCorrect();
    else onWrong();
  }

  function selectCell(cell: Cell, landmarkId?: string) {
    if (task.mode === "referenceToLandmark") {
      if (landmarkId) setSelectedLandmarkId(landmarkId);
      return;
    }
    if (task.mode === "referenceToCell" || task.mode === "placeAtReference") setSelectedCell(cell);
  }

  const showOptions = ["cellToReference", "landmarkToReference", "debug", "repairLabels"].includes(task.mode);

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />

      <div className="mx-auto max-w-4xl">
        <div className="overflow-x-auto pb-2">
          <div className="mx-auto min-w-[330px] max-w-[720px] border-2 border-cyan-300 bg-slate-950 p-2 shadow-[0_16px_40px_rgba(8,145,178,0.18)]">
            <div className="grid gap-1" style={{ gridTemplateColumns }}>
              <div aria-hidden="true" />
              {shownColumns.map((label, index) => (
                <div key={`column-${index}`} className="flex h-10 items-center justify-center bg-cyan-950/70 px-1 text-sm font-black text-cyan-100">
                  {task.mode === "labelGrid" ? (
                    <select
                      aria-label={`Label column ${index + 1}`}
                      value={label}
                      onChange={(event) => setAssignedColumns((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                      className="h-8 w-full border border-cyan-400 bg-slate-900 text-center font-black text-white"
                    >
                      <option value="">?</option>
                      {task.columnLabels.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : label}
                </div>
              ))}

              {Array.from({ length: task.rows }, (_, row) => (
                <div key={`row-band-${row}`} className="contents">
                  <div className="flex min-h-14 items-center justify-center bg-cyan-950/70 px-1 text-sm font-black text-cyan-100 sm:min-h-20">
                    {task.mode === "labelGrid" ? (
                      <select
                        aria-label={`Label row ${row + 1}`}
                        value={shownRows[row] ?? ""}
                        onChange={(event) => setAssignedRows((current) => current.map((item, itemIndex) => itemIndex === row ? event.target.value : item))}
                        className="h-8 w-full border border-cyan-400 bg-slate-900 text-center font-black text-white"
                      >
                        <option value="">?</option>
                        {task.rowLabels.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : shownRows[row]}
                  </div>

                  {cells.filter((cell) => cell.r === row).map((cell) => {
                    const landmark = task.landmarks.find((item) => item.r === cell.r && item.c === cell.c);
                    const highlighted = sameCell(cell, task.highlight);
                    const selected = sameCell(cell, selectedCell) || landmark?.id === selectedLandmarkId;
                    const interactive = task.mode === "referenceToCell" || task.mode === "placeAtReference" || (task.mode === "referenceToLandmark" && Boolean(landmark));
                    return (
                      <button
                        key={`${cell.r}-${cell.c}`}
                        type="button"
                        disabled={!interactive}
                        onClick={() => selectCell(cell, landmark?.id)}
                        aria-label={`${task.columnLabels[cell.c]}${task.rowLabels[cell.r]}${landmark ? `, ${landmark.label}` : ""}`}
                        className={`relative flex min-h-14 min-w-0 items-center justify-center border p-1 transition sm:min-h-20 ${selected ? "border-amber-300 bg-amber-300/25 ring-2 ring-amber-300" : highlighted ? "border-fuchsia-300 bg-fuchsia-400/25 ring-2 ring-fuchsia-300" : "border-cyan-300/35 bg-white/[0.06]"} ${interactive ? "cursor-pointer hover:bg-cyan-300/20" : "cursor-default"}`}
                      >
                        {landmark ? (
                          <span className="flex h-full w-full min-w-0 flex-col items-center justify-center">
                            <PositionObjectVisual objectId={landmark.object} className="h-8 w-8 sm:h-11 sm:w-11" />
                            <span className="mt-1 max-w-full truncate text-[7px] font-black text-cyan-50 sm:text-[9px]">{landmark.label}</span>
                          </span>
                        ) : null}
                        {task.mode === "placeAtReference" && sameCell(cell, selectedCell) ? <Package className="h-8 w-8 text-amber-200 sm:h-10 sm:w-10" aria-hidden="true" /> : null}
                        {highlighted ? <span className="absolute right-1 top-1 h-2.5 w-2.5 bg-fuchsia-300" aria-hidden="true" /> : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {task.mode === "typeReference" ? (
          <div className="mx-auto mt-4 max-w-xs">
            <label htmlFor={`grid-reference-${task.target}`} className="mb-2 block text-center text-sm font-black text-indigo-950">Grid reference</label>
            <input
              id={`grid-reference-${task.target}`}
              value={typedReference}
              onChange={(event) => setTypedReference(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") check(); }}
              autoComplete="off"
              inputMode="text"
              maxLength={4}
              placeholder="B3"
              className="h-14 w-full border-2 border-indigo-300 bg-white px-4 text-center text-2xl font-black uppercase text-indigo-950 outline-none focus:border-cyan-500"
            />
          </div>
        ) : null}

        {showOptions ? (
          <div className="mx-auto mt-4 grid max-w-2xl gap-2 sm:grid-cols-3">
            {task.options?.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={selectedOptionId === option.id}
                onClick={() => setSelectedOptionId(option.id)}
                className={`min-h-12 border-2 px-3 py-2 text-sm font-black transition ${selectedOptionId === option.id ? "border-cyan-700 bg-cyan-100 text-cyan-950" : "border-indigo-200 bg-white text-indigo-950 hover:border-cyan-400"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex justify-center gap-3">
        <button type="button" onClick={reset} title="Reset grid" aria-label="Reset grid" className="flex h-12 w-12 items-center justify-center border-2 border-slate-300 bg-white text-slate-700 hover:border-slate-500">
          <RotateCcw className="h-5 w-5" />
        </button>
        <button type="button" onClick={check} className="flex min-h-12 items-center gap-2 border-2 border-emerald-700 bg-emerald-600 px-5 font-black text-white shadow-sm hover:bg-emerald-700">
          <Check className="h-5 w-5" /> Check
        </button>
      </div>
    </div>
  );
}
