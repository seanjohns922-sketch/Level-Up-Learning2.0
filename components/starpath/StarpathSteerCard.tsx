"use client";

import { useRef, useState } from "react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import { PositionObjectVisual } from "@/components/starpath/StarpathPositionCards";
import { DirectionGrid, GridMarker } from "@/components/starpath/StarpathDirectionCards";
import { runSteer } from "@/data/activities/starpath/level3/mapSteer";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type SteerTask = Extract<PracticeTask, { kind: "starpathSteer" }>;
type Facing = "N" | "E" | "S" | "W";
type Command = "left" | "right" | "forward";

const ROT: Record<Facing, number> = { N: 0, E: 90, S: 180, W: 270 };
const DIR_WORD: Record<Facing, string> = { N: "north", E: "east", S: "south", W: "west" };
const CMD_LABEL: Record<Command, string> = { left: "Turn left", right: "Turn right", forward: "Go forward" };

const STEER_STYLE = (
  <style>{`
    @keyframes sp-steer-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
    .sp-steer-shake { animation: sp-steer-shake 0.36s ease-in-out; }
    @media (prefers-reduced-motion: reduce) { .sp-steer-shake { animation: none; } }
  `}</style>
);

function Compass() {
  return (
    <div aria-hidden="true" className="absolute right-1.5 top-1.5 z-30 flex h-7 w-7 flex-col items-center justify-center rounded-full border border-cyan-200/40 bg-slate-900/45 shadow sm:h-8 sm:w-8">
      <span className="text-[6px] font-black leading-none text-amber-300 sm:text-[7px]">N</span>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4"><path d="M12 3l3 9h-6z" fill="#fca5a5" /><path d="M12 21l-3-9h6z" fill="#67e8f9" /></svg>
    </div>
  );
}

// The rover, drawn with a heading arrow so the current facing is unmistakable.
function Rover({ facing, big = false }: { facing: Facing; big?: boolean }) {
  return (
    <div className={["relative flex items-center justify-center rounded-xl border-2 border-amber-300/80 bg-amber-400/15", big ? "h-28 w-28" : "h-[94%] w-[94%]"].join(" ")}>
      <svg viewBox="0 0 40 40" className="pointer-events-none absolute inset-0 h-full w-full" style={{ transform: `rotate(${ROT[facing]}deg)` }} aria-hidden="true">
        <path d="M20 1.5 L27 13 L20 9.5 L13 13 Z" fill="#fde047" stroke="#a16207" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <PositionObjectVisual objectId="rocket" className="h-1/2 w-1/2" />
    </div>
  );
}

function SteerMap({ task, rover, facing, reached }: { task: SteerTask; rover: { r: number; c: number }; facing: Facing; reached: boolean }) {
  return (
    <DirectionGrid cols={task.cols} rows={task.rows}>
      <Compass />
      {task.landmarks.map((l) => (
        <GridMarker key={l.id} cell={l} cols={task.cols} rows={task.rows} z={4}>
          <div className="flex h-full w-full flex-col items-center justify-center gap-0.5">
            <PositionObjectVisual objectId={l.object} className="h-3/5 w-3/5" />
            <span className="max-w-full truncate px-0.5 text-[7px] font-black leading-tight text-cyan-100 sm:text-[8px]">{l.label}</span>
          </div>
        </GridMarker>
      ))}
      {task.goal ? (
        <GridMarker cell={task.goal} cols={task.cols} rows={task.rows} z={6}>
          <span className={["h-[92%] w-[92%] rounded-xl border-2 border-dashed", reached ? "border-emerald-300 bg-emerald-300/25" : "border-amber-300 bg-amber-300/10"].join(" ")} />
        </GridMarker>
      ) : null}
      <GridMarker cell={rover} cols={task.cols} rows={task.rows} z={20}>
        <Rover facing={facing} />
      </GridMarker>
    </DirectionGrid>
  );
}

function TurnChip({ label }: { label: string }) {
  return <span className="rounded-full border-2 border-cyan-200 bg-cyan-50 px-3 py-1 text-sm font-black text-indigo-950">{label}</span>;
}

function CmdIcon({ cmd }: { cmd: Command }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: "h-5 w-5" };
  if (cmd === "forward") return <svg {...common}><path d="M12 20V5M6 11l6-6 6 6" /></svg>;
  if (cmd === "left") return <svg {...common}><path d="M9 7l-5 5 5 5M4 12h11a5 5 0 0 1 5 5v1" /></svg>;
  return <svg {...common}><path d="M15 7l5 5-5 5M20 12H9a5 5 0 0 0-5 5v1" /></svg>;
}

export function StarpathSteerCard({
  task,
  onCorrect,
  onWrong,
  editableAssessmentMode = false,
  assessmentAnswer,
  onAssessmentAnswer,
}: {
  task: SteerTask;
  onCorrect: () => void;
  onWrong: (studentAnswer?: string) => void;
  editableAssessmentMode?: boolean;
  assessmentAnswer?: string;
  onAssessmentAnswer?: (correct: boolean, response: string) => void;
}) {
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [commands, setCommands] = useState<Command[]>([]);
  const [rover, setRover] = useState<{ r: number; c: number }>({ r: task.start.r, c: task.start.c });
  const [facing, setFacing] = useState<Facing>(task.start.facing);
  const [status, setStatus] = useState<"editing" | "running" | "done">("editing");
  const settled = useRef(false);

  function miss(id: string) {
    setWrongId(id);
    setTimeout(() => setWrongId((v) => (v === id ? null : v)), 400);
  }

  // ── heading + firstMove: single multiple-choice answer ──
  if (task.mode === "heading" || task.mode === "firstMove") {
    const choose = (id: string) => {
      if (settled.current) return;
      if (editableAssessmentMode && onAssessmentAnswer) {
        onAssessmentAnswer(id === task.correctOptionId, id);
        return;
      }
      if (id === task.correctOptionId) {
        settled.current = true;
        onCorrect();
      } else {
        miss(id);
        onWrong(id);
      }
    };
    return (
      <div>
        <TaskHeading prompt={task.prompt} speech={task.speakText} />
        {task.mode === "heading" ? (
          <div className="mx-auto mb-5 flex max-w-md flex-col items-center gap-3">
            <Rover facing={task.start.facing} big />
            <div className="flex flex-wrap items-center justify-center gap-2">
              <TurnChip label={`Facing ${DIR_WORD[task.start.facing]}`} />
              {(task.turns ?? []).map((t, i) => (
                <TurnChip key={i} label={CMD_LABEL[t]} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto mb-5 max-w-3xl">
            <SteerMap task={task} rover={{ r: task.start.r, c: task.start.c }} facing={task.start.facing} reached={false} />
          </div>
        )}
        <div className={["mx-auto grid max-w-lg gap-3", task.mode === "heading" ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"].join(" ")}>
          {(task.options ?? []).map((option) => (
            <div key={option.id} className="relative">
              <button
                type="button"
                aria-pressed={editableAssessmentMode ? assessmentAnswer === option.id : undefined}
                onClick={() => choose(option.id)}
                className={[
                  "flex min-h-14 w-full items-center justify-center rounded-2xl border-2 py-3 pl-4 pr-10 text-center shadow-sm transition active:scale-[0.98]",
                  wrongId === option.id
                    ? "sp-steer-shake border-rose-400 bg-rose-50"
                    : editableAssessmentMode && assessmentAnswer === option.id
                      ? "border-cyan-600 bg-cyan-50 ring-4 ring-cyan-200"
                    : "border-violet-200 bg-white hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg",
                ].join(" ")}
              >
                <span className="text-base font-black leading-snug text-balance text-indigo-950">{option.label}</span>
              </button>
              <OptionReadAloudButton text={option.label} className="absolute right-2 top-1/2 -translate-y-1/2" />
            </div>
          ))}
        </div>
        {STEER_STYLE}
      </div>
    );
  }

  // ── drive: plan an egocentric route, then run it once ──
  const palette = task.palette ?? ["left", "forward", "right"];
  const maxSteps = task.maxSteps ?? 12;
  const editing = status === "editing";

  function add(cmd: Command) {
    if (!editing || commands.length >= maxSteps) return;
    setCommands((list) => [...list, cmd]);
  }
  function reset() {
    if (!editing) return;
    setCommands([]);
  }
  function run() {
    if (!editing || settled.current || commands.length === 0) return;
    setStatus("running");
    let i = 0;
    let cur = { r: task.start.r, c: task.start.c, facing: task.start.facing as Facing };
    const tick = () => {
      const cmd = commands[i];
      if (!cmd) {
        // finished: evaluate
        const end = runSteer({ r: task.start.r, c: task.start.c, facing: task.start.facing }, commands, task.cols, task.rows);
        settled.current = true;
        setStatus("done");
        if (!end.offGrid && task.goal && end.r === task.goal.r && end.c === task.goal.c) onCorrect();
        else onWrong(commands.join(","));
        return;
      }
      const stepped = runSteer(cur, [cmd], task.cols, task.rows);
      cur = { r: stepped.r, c: stepped.c, facing: stepped.facing };
      setRover({ r: cur.r, c: cur.c });
      setFacing(cur.facing);
      i += 1;
      window.setTimeout(tick, 340);
    };
    window.setTimeout(tick, 260);
  }

  const reached = status === "done" && task.goal ? rover.r === task.goal.r && rover.c === task.goal.c : false;

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto mb-4 max-w-3xl">
        <SteerMap task={task} rover={rover} facing={facing} reached={reached} />
      </div>

      <div className="mx-auto mb-3 flex max-w-xl flex-wrap items-center justify-center gap-2">
        {commands.length === 0 ? (
          <span className="text-sm font-semibold text-slate-500">Build your route, then press Run.</span>
        ) : (
          commands.map((cmd, i) => <TurnChip key={i} label={CMD_LABEL[cmd]} />)
        )}
      </div>

      <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-2.5">
        {palette.map((cmd) => (
          <button
            key={cmd}
            type="button"
            disabled={!editing || commands.length >= maxSteps}
            onClick={() => add(cmd)}
            className="flex min-h-14 items-center gap-2 rounded-2xl border-2 border-violet-200 bg-white px-4 py-2 font-black text-indigo-950 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <CmdIcon cmd={cmd} /> {CMD_LABEL[cmd]}
          </button>
        ))}
      </div>

      <div className="mx-auto mt-3 flex max-w-xl items-center justify-center gap-3">
        <button type="button" disabled={!editing || commands.length === 0} onClick={reset} className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-5 font-black text-slate-600 transition hover:border-slate-300 active:scale-95 disabled:opacity-40">
          Clear
        </button>
        <button type="button" disabled={!editing || commands.length === 0} onClick={run} className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-7 font-black text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-40">
          Run route
        </button>
      </div>
      <p className="mt-2 text-center text-xs font-semibold text-slate-500">{commands.length}/{maxSteps} moves &middot; left/right turn the rover, forward moves the way it faces</p>
      {STEER_STYLE}
    </div>
  );
}
