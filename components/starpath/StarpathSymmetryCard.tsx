"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { isSymmetricDesign, transformCell, type SymmetryCell } from "@/data/activities/starpath/level4/symmetry";

type Task = Extract<PracticeTask, { kind: "starpathSymmetry" }>;
const COLOURS = ["#7c3aed", "#0891b2", "#f59e0b"];
const key = (cell: { r: number; c: number }) => `${cell.r}:${cell.c}`;
const SYM_STYLE = (
  <style>{`.l4sym-stage{background:radial-gradient(120% 90% at 50% 2%, #2a2a6e 0%, #16123f 45%, #0b0a24 100%);box-shadow:0 14px 34px -16px rgba(10,8,40,.6), inset 0 0 0 1px rgba(148,163,255,.14);}`}</style>
);

function exact(task: Task, cells: SymmetryCell[]) {
  const actual = new Map(cells.map((cell) => [key(cell), cell.colour]));
  return task.expectedCells.length === actual.size && task.expectedCells.every((cell) => actual.get(key(cell)) === cell.colour);
}

// The glowing axis of symmetry, drawn over the grid.
function MirrorLine({ task }: { task: Task }) {
  const glow = "shadow-[0_0_12px_rgba(103,232,249,0.9)]";
  if (task.line === "vertical") return <div aria-hidden="true" className={`pointer-events-none absolute inset-y-1 left-1/2 w-[3px] -translate-x-1/2 rounded-full bg-cyan-300 ${glow}`} />;
  if (task.line === "horizontal") return <div aria-hidden="true" className={`pointer-events-none absolute inset-x-1 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-cyan-300 ${glow}`} />;
  if (task.line === "diagonal") return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none">
      <line x1="2%" y1="2%" x2="98%" y2="98%" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 5px #67e8f9)" }} />
    </svg>
  );
  return null;
}

export default function StarpathSymmetryCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [cells, setCells] = useState<SymmetryCell[]>(task.seedCells);
  const [colour, setColour] = useState(COLOURS[0]!);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [settled, setSettled] = useState(false);
  const optionsMode = Boolean(task.options?.length);
  const placed = new Map(cells.map((cell) => [key(cell), cell]));

  // Live reflection preview: the mirror image of every placed tile, ghosted where
  // it isn't filled yet. Off in test/record mode so it never reveals the answer.
  const ghosts = new Map<string, string>();
  if (!optionsMode) {
    for (const cell of cells) {
      const t = transformCell(task, cell);
      const tk = key(t);
      if (t.r >= 0 && t.r < task.size && t.c >= 0 && t.c < task.size && !placed.has(tk)) ghosts.set(tk, cell.colour);
    }
  }

  // Repair mode: flag the tile whose colour no longer matches its mirror partner,
  // so the "unmatched tile" is unmistakable. Checked against the target design.
  const mismatched = new Set<string>();
  if (task.mode === "repair" && !optionsMode) {
    const expected = new Map(task.expectedCells.map((cell) => [key(cell), cell.colour]));
    for (const cell of cells) if (expected.get(key(cell)) !== cell.colour) mismatched.add(key(cell));
  }

  // Tap an empty cell to place the chosen colour; tap a tile of the same colour to
  // clear it; tap a tile of a different colour to recolour it — so a mismatch is
  // repaired in a single tap once the right colour is chosen.
  function toggle(r: number, c: number) {
    if (settled || optionsMode) return;
    const k = `${r}:${c}`;
    setCells((current) => {
      const existing = current.find((cell) => key(cell) === k);
      if (!existing) return [...current, { r, c, colour }];
      if (existing.colour === colour) return current.filter((cell) => key(cell) !== k);
      return current.map((cell) => (key(cell) === k ? { ...cell, colour } : cell));
    });
  }
  function pick(id: string) {
    setSelectedOptions((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  }
  function submit() {
    if (settled) return;
    setSettled(true);
    const correct = optionsMode
      ? (task.correctOptionIds ?? []).length === selectedOptions.length && (task.correctOptionIds ?? []).every((id) => selectedOptions.includes(id))
      : task.mode === "create" ? isSymmetricDesign(task, cells) : exact(task, cells);
    if (correct) onCorrect();
    else onWrong(optionsMode ? selectedOptions.join(",") : cells.map(key).join(","));
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      {!optionsMode ? <p className="text-center text-sm font-bold text-slate-500">{task.mode === "repair" ? "One tile does not match its mirror. Tap it, then choose the colour its partner shows." : "Place tiles — the mirror shows where each one must be matched."}</p> : null}
      <div className="l4sym-stage mx-auto max-w-sm rounded-3xl p-4">
        <div className="relative">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${task.size}, minmax(0, 1fr))` }}>
            {Array.from({ length: task.size * task.size }, (_, index) => {
              const r = Math.floor(index / task.size);
              const c = index % task.size;
              const k = `${r}:${c}`;
              const item = placed.get(k);
              const ghost = ghosts.get(k);
              const bad = mismatched.has(k);
              const centre = task.centre?.r === r && task.centre.c === c;
              return (
                <button
                  type="button"
                  key={k}
                  onClick={() => toggle(r, c)}
                  aria-label={`Symmetry grid row ${r + 1}, column ${c + 1}${bad ? ", does not match its mirror" : ""}`}
                  className="relative flex aspect-square items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] transition hover:bg-white/[0.09]"
                >
                  {item ? (
                    <span className="absolute inset-[12%] rounded-md" style={{ backgroundColor: item.colour, boxShadow: `0 2px 6px ${item.colour}66` }} />
                  ) : ghost ? (
                    <span className="absolute inset-[12%] rounded-md border-2 border-dashed" style={{ borderColor: ghost, backgroundColor: `${ghost}22` }} />
                  ) : null}
                  {bad ? <span className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-rose-400 animate-pulse" /> : null}
                  {centre ? <span className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]" /> : null}
                </button>
              );
            })}
          </div>
          <MirrorLine task={task} />
        </div>
      </div>

      {optionsMode ? (
        <div className="mx-auto grid max-w-md gap-2 sm:grid-cols-2">
          {task.options?.map((option) => (
            <button type="button" key={option.id} onClick={() => !settled && pick(option.id)} className={["rounded-2xl border-2 p-3 text-center text-sm font-bold transition", selectedOptions.includes(option.id) ? "border-violet-600 bg-violet-50 text-indigo-950" : "border-violet-200 bg-white text-indigo-900 hover:border-cyan-400"].join(" ")}>{option.label}</button>
          ))}
        </div>
      ) : (
        <div className="flex justify-center gap-2.5">
          {COLOURS.map((value) => (
            <button type="button" key={value} onClick={() => setColour(value)} aria-label={`Choose tile colour`} className={["h-11 w-11 rounded-xl border-4 transition", colour === value ? "border-white ring-2 ring-cyan-300" : "border-white/30"].join(" ")} style={{ backgroundColor: value }} />
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2.5">
        {!optionsMode ? (
          <button type="button" onClick={() => setCells(task.seedCells)} disabled={settled} title="Reset design" aria-label="Reset design" className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-600 disabled:opacity-40"><RotateCcw className="h-5 w-5" /></button>
        ) : null}
        <button type="button" onClick={submit} disabled={settled || (optionsMode ? !selectedOptions.length : !cells.length)} className="flex h-12 items-center gap-2 rounded-2xl bg-emerald-600 px-7 font-black text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Test</button>
      </div>
      {SYM_STYLE}
    </div>
  );
}
