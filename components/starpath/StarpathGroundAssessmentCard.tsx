"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, RotateCcw } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import { ShapeVisual } from "@/components/starpath/StarpathShapeTaskCard";
import { PositionObjectVisual } from "@/components/starpath/StarpathPositionCards";
import type {
  StarpathGroundAssessmentTask,
  StarpathGroundAssessmentToken,
} from "@/data/activities/year1/practice-task";

type Direction = "up" | "down" | "left" | "right";
type Placement = { tokenId: string; r: number; c: number };

const MOVE: Record<Direction, { r: number; c: number }> = {
  up: { r: -1, c: 0 },
  down: { r: 1, c: 0 },
  left: { r: 0, c: -1 },
  right: { r: 0, c: 1 },
};

const DIRECTION_BUTTONS = [
  { direction: "left" as const, Icon: ArrowLeft, label: "Move left" },
  { direction: "up" as const, Icon: ArrowUp, label: "Move up" },
  { direction: "down" as const, Icon: ArrowDown, label: "Move down" },
  { direction: "right" as const, Icon: ArrowRight, label: "Move right" },
];

function TokenVisual({ token, compact = false }: { token: StarpathGroundAssessmentToken; compact?: boolean }) {
  if (token.visual.kind === "shape") {
    return (
      <span style={{ transform: `rotate(${token.visual.rotation ?? 0}deg)` }}>
        <ShapeVisual
          shape={token.visual.shape}
          colour={token.visual.colour}
          className={compact ? "h-12 w-12" : "h-16 w-16"}
        />
      </span>
    );
  }
  return <PositionObjectVisual objectId={token.visual.objectId} className={compact ? "h-12 w-12" : "h-16 w-16"} />;
}

function samePlacements(actual: Placement[], expected: Placement[]): boolean {
  const key = (item: Placement) => `${item.tokenId}:${item.r}:${item.c}`;
  return actual.length === expected.length
    && actual.map(key).sort().every((value, index) => value === expected.map(key).sort()[index]);
}

export function StarpathGroundAssessmentCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: StarpathGroundAssessmentTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [moves, setMoves] = useState<Direction[]>([]);

  const routeCells = useMemo(() => {
    if (task.mode !== "route") return [];
    const cells = [task.start];
    for (const direction of moves) {
      const current = cells[cells.length - 1];
      const delta = MOVE[direction];
      cells.push({ r: current.r + delta.r, c: current.c + delta.c });
    }
    return cells;
  }, [moves, task]);

  const currentRouteCell = routeCells[routeCells.length - 1];
  const canSubmit = task.mode === "placement"
    ? placements.length === task.answer.length
    : moves.length === task.answerMoves.length;

  const chooseCell = (r: number, c: number) => {
    if (task.mode !== "placement" || !selectedTokenId) return;
    if (task.fixed?.some((item) => item.r === r && item.c === c)) return;
    setPlacements((current) => [
      ...current.filter((item) => item.tokenId !== selectedTokenId && !(item.r === r && item.c === c)),
      { tokenId: selectedTokenId, r, c },
    ]);
    setSelectedTokenId(null);
  };

  const moveTraveller = (direction: Direction) => {
    if (task.mode !== "route" || moves.length >= task.answerMoves.length) return;
    const current = currentRouteCell ?? task.start;
    const delta = MOVE[direction];
    const next = { r: current.r + delta.r, c: current.c + delta.c };
    if (next.r < 0 || next.r >= task.rows || next.c < 0 || next.c >= task.cols) return;
    setMoves((value) => [...value, direction]);
  };

  const submit = () => {
    const correct = task.mode === "placement"
      ? samePlacements(placements, task.answer)
      : moves.length === task.answerMoves.length
        && moves.every((move, index) => move === task.answerMoves[index]);
    if (correct) onCorrect();
    else onWrong();
  };

  const reset = () => {
    setSelectedTokenId(null);
    setPlacements([]);
    setMoves([]);
  };

  return (
    <section className="rounded-lg border border-cyan-200 bg-[#f8fbfc] p-4 shadow-[0_18px_50px_rgba(8,47,73,0.10)] sm:p-6">
      <header className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-black text-slate-950 sm:text-2xl">{task.prompt}</h2>
        <ReadAloudBtn text={task.speakText} size="md" label="Read question" className="shrink-0" />
      </header>

      {task.mode === "placement" ? (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(180px,0.42fr)_minmax(300px,1fr)]">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-teal-800">Choose a piece</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {task.tokens.map((token) => {
                const placed = placements.some((item) => item.tokenId === token.id);
                const selected = selectedTokenId === token.id;
                return (
                  <button
                    key={token.id}
                    type="button"
                    disabled={placed}
                    onClick={() => setSelectedTokenId(token.id)}
                    aria-label={token.label}
                    className={`relative flex min-h-24 items-center justify-center rounded-lg border bg-white p-2 transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 ${
                      selected ? "border-cyan-500 ring-4 ring-cyan-100" : "border-slate-200 hover:border-cyan-300"
                    } disabled:opacity-35`}
                  >
                    <TokenVisual token={token} compact />
                    <OptionReadAloudButton text={token.label} className="absolute right-1 top-1" />
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="grid aspect-square max-h-[430px] w-full max-w-[520px] justify-self-center overflow-hidden rounded-lg border border-cyan-200 bg-white shadow-inner"
            style={{ gridTemplateColumns: `repeat(${task.cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: task.rows * task.cols }, (_, index) => {
              const r = Math.floor(index / task.cols);
              const c = index % task.cols;
              const fixed = task.fixed?.find((item) => item.r === r && item.c === c);
              const placed = placements.find((item) => item.r === r && item.c === c);
              const token = fixed?.token ?? task.tokens.find((item) => item.id === placed?.tokenId);
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => chooseCell(r, c)}
                  disabled={Boolean(fixed)}
                  aria-label={`Row ${r + 1}, column ${c + 1}${token ? `: ${token.label}` : ""}`}
                  className="flex min-h-20 items-center justify-center border-b border-r border-cyan-100 bg-white transition hover:bg-cyan-50 focus-visible:z-10 focus-visible:outline focus-visible:outline-4 focus-visible:outline-cyan-500 disabled:cursor-default"
                >
                  {token ? <TokenVisual token={token} compact /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <div
            className="mx-auto grid aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-lg border border-cyan-200 bg-white shadow-inner"
            style={{ gridTemplateColumns: `repeat(${task.cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: task.rows * task.cols }, (_, index) => {
              const r = Math.floor(index / task.cols);
              const c = index % task.cols;
              const isTraveller = currentRouteCell?.r === r && currentRouteCell?.c === c;
              const isGoal = task.goal?.r === r && task.goal?.c === c;
              const visited = routeCells.some((cell) => cell.r === r && cell.c === c);
              return (
                <div key={`${r}-${c}`} className={`relative flex min-h-20 items-center justify-center border-b border-r border-cyan-100 ${visited ? "bg-cyan-50" : "bg-white"}`}>
                  {isGoal ? <PositionObjectVisual objectId={task.goal!.objectId} className="h-12 w-12 opacity-75" /> : null}
                  {isTraveller ? <PositionObjectVisual objectId={task.traveller} className="absolute h-14 w-14" /> : null}
                </div>
              );
            })}
          </div>
          <div className="mx-auto mt-4 grid w-fit grid-cols-4 gap-2">
            {DIRECTION_BUTTONS.map(({ direction, Icon, label }) => (
              <button
                key={direction}
                type="button"
                onClick={() => moveTraveller(direction)}
                aria-label={label}
                className="flex h-14 w-14 items-center justify-center rounded-lg border border-cyan-300 bg-white text-teal-900 shadow-sm transition hover:bg-cyan-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
              >
                <Icon className="h-7 w-7" strokeWidth={3} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
        >
          <RotateCcw className="h-5 w-5" />
          Clear
        </button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={submit}
          className="h-12 rounded-lg bg-teal-700 px-8 font-black text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Record answer
        </button>
      </div>
    </section>
  );
}
