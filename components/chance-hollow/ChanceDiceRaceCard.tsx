"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Dices, Flag, Swords } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "chanceDiceRace" }>;

const DIFFERENCE_COUNTS = [6, 10, 8, 6, 4, 2];

function chanceCount(differences: number[]) {
  return differences.reduce((total, difference) => total + (DIFFERENCE_COUNTS[difference] ?? 0), 0);
}

function rollDie() {
  const value = new Uint32Array(1);
  window.crypto.getRandomValues(value);
  return 1 + (value[0]! % 6);
}

function DieFace({ value, tone }: { value: number; tone: "cyan" | "pink" }) {
  return (
    <div className={`grid h-20 w-20 place-items-center rounded-lg border-4 bg-white font-mono text-4xl font-black shadow-lg ${tone === "cyan" ? "border-cyan-400 text-cyan-800" : "border-fuchsia-400 text-fuchsia-800"}`}>
      {value}
    </div>
  );
}

export default function ChanceDiceRaceCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [phase, setPhase] = useState<"repair" | "race" | "finished">("repair");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState("Repair the rules before the race begins.");
  const timerRef = useRef<number | null>(null);
  const selected = task.choices.find((choice) => choice.id === selectedId) ?? null;

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  function choose(id: string) {
    if (phase !== "repair") return;
    setSelectedId(id);
    if (id !== task.answerId) {
      onWrong(task.choices.find((choice) => choice.id === id)?.label ?? id);
      return;
    }
    setMessage("Fair rules locked in. First to the finish wins.");
    setPhase("race");
  }

  function roll() {
    if (phase !== "race" || rolling || !selected) return;
    setRolling(true);
    setMessage("Rolling both dice...");
    const left = rollDie();
    const right = rollDie();
    const difference = Math.abs(left - right);
    setDice([left, right]);
    timerRef.current = window.setTimeout(() => {
      const playerWon = selected.playerDifferences.includes(difference);
      const next: [number, number] = [score[0] + (playerWon ? 1 : 0), score[1] + (playerWon ? 0 : 1)];
      setScore(next);
      setMessage(`The difference is ${difference}. ${playerWon ? "You" : task.opponentName} win this roll.`);
      setRolling(false);
      if (next[0] >= task.winningScore || next[1] >= task.winningScore) {
        setPhase("finished");
        window.setTimeout(onCorrect, 350);
      }
    }, 650);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <h2 className="text-xl font-extrabold leading-tight text-foreground md:text-2xl">{task.prompt}</h2>
        <ReadAloudBtn text={task.prompt} />
      </div>

      {phase === "repair" ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <div className="rounded-lg border border-violet-200 bg-[linear-gradient(135deg,#f8f5ff,#e8fbff)] p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-fuchsia-700"><Swords className="h-4 w-4" /> Repair Roller&apos;s race</div>
            <p className="mb-4 font-bold text-violet-950">Choose rules that give each racer 18 of the 36 possible dice pairs.</p>
            <div className="grid gap-2">
              {task.choices.map((choice) => {
                const playerCount = chanceCount(choice.playerDifferences);
                const chanziaCount = chanceCount(choice.chanziaDifferences);
                return (
                  <button key={choice.id} type="button" onClick={() => choose(choice.id)} className="grid gap-1 rounded-lg border-2 border-violet-200 bg-white px-4 py-3 text-left font-bold text-violet-950 transition hover:border-fuchsia-400 hover:bg-fuchsia-50">
                    <span>{choice.label}</span>
                    <span className="font-mono text-xs text-violet-500">Possible pairs: You {playerCount} · {task.opponentName} {chanziaCount}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex min-h-72 flex-col items-center justify-end rounded-lg border border-fuchsia-300 bg-violet-950/95 px-4 pt-4 text-center text-white">
            <Image src={task.opponentImage} alt={`${task.opponentName}, Chance Hollow challenger`} width={250} height={300} className="max-h-56 w-auto object-contain drop-shadow-[0_12px_18px_rgba(34,211,238,0.35)]" />
            <div className="py-3 text-lg font-black">{task.opponentName} is waiting</div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-violet-200 bg-[linear-gradient(135deg,#f8f5ff,#e8fbff)] p-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-fuchsia-700"><Flag className="h-4 w-4" /> Fair race · first to {task.winningScore}</div>
            <div className="rounded-lg bg-violet-950 px-4 py-2 font-mono text-xl font-black text-white">YOU {score[0]} · {score[1]} {task.opponentName.toUpperCase()}</div>
          </div>
          <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
            <div className="rounded-lg border-2 border-cyan-400 bg-cyan-50 p-4 text-center">
              <div className="text-lg font-black text-cyan-950">You move on differences</div>
              <div className="mt-2 font-mono text-2xl font-black text-cyan-700">{selected?.playerDifferences.join(", ")}</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-3"><DieFace value={dice[0]} tone="cyan" /><DieFace value={dice[1]} tone="pink" /></div>
              <p className="min-h-6 text-center text-sm font-black text-violet-800" role="status">{message}</p>
              {phase === "race" ? (
                <button type="button" onClick={roll} disabled={rolling} className="flex h-12 items-center gap-2 rounded-lg bg-gradient-to-r from-fuchsia-600 to-cyan-500 px-7 font-black text-white shadow-lg transition hover:brightness-110 active:scale-95 disabled:opacity-60"><Dices className="h-5 w-5" />{rolling ? "Rolling..." : "Roll both dice"}</button>
              ) : (
                <div className="rounded-lg bg-violet-950 px-5 py-3 text-center font-black text-white">{score[0] > score[1] ? "You won the fair race!" : `${task.opponentName} won, but your rules were fair.`}</div>
              )}
            </div>
            <div className="rounded-lg border-2 border-fuchsia-400 bg-fuchsia-50 p-4 text-center">
              <div className="text-lg font-black text-fuchsia-950">{task.opponentName} moves on</div>
              <div className="mt-2 font-mono text-2xl font-black text-fuchsia-700">{selected?.chanziaDifferences.join(", ")}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
