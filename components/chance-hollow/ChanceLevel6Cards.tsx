"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, CircleDot, Coins, Cpu, Dices, Minus, Play, Plus, Shield, Sparkles, Target } from "lucide-react";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import ReadAloudBtn from "@/components/ReadAloudBtn";

type ScaleTask = Extract<PracticeTask, { kind: "chanceScalePortal" }>;
type ForgeTask = Extract<PracticeTask, { kind: "chanceProbabilityForge" }>;
type SimulationTask = Extract<PracticeTask, { kind: "chanceSimulationLab" }>;
type DebugTask = Extract<PracticeTask, { kind: "chanceModelDebugger" }>;
type MasterTask = Extract<PracticeTask, { kind: "chanceMasterTrial" }>;
type CardProps<T> = { task: T; onCorrect: () => void; onWrong: (answer?: string) => void };

const EPSILON = 0.026;

function rotateChoices<T>(values: T[], offset: number) {
  const shift = ((offset % values.length) + values.length) % values.length;
  return [...values.slice(shift), ...values.slice(0, shift)];
}

function Fraction({ numerator, denominator, className = "" }: { numerator: number; denominator: number; className?: string }) {
  return <span className={`inline-grid min-w-[2.4rem] grid-rows-2 text-center font-mono font-black leading-none ${className}`}><span className="border-b-2 border-current px-1 pb-1">{numerator}</span><span className="px-1 pt-1">{denominator}</span></span>;
}

function TaskHeading({ text }: { text: string }) {
  return <div className="flex items-start gap-2"><h2 className="text-xl font-black leading-tight text-[#21182d] md:text-2xl">{text}</h2><ReadAloudBtn text={text} /></div>;
}

function ActionButton({ onClick, children, disabled = false }: { onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#8b2cf5] via-[#d93ad7] to-[#ffb21a] px-6 font-black text-white shadow-lg shadow-fuchsia-300/30 transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">{children}</button>;
}

export function ChanceScalePortalCard({ task, onCorrect, onWrong }: CardProps<ScaleTask>) {
  const [selected, setSelected] = useState(0.5);
  const marks = [0, 0.25, 0.5, 0.75, 1];
  const label = (value: number) => task.displayMode === "percent" ? `${Math.round(value * 100)}%` : String(Number(value.toFixed(2)));
  const sourceFraction = /^(\d+)\/(\d+)$/.exec(task.sourceLabel);

  function check() {
    if (Math.abs(selected - task.targetValue) <= EPSILON) onCorrect();
    else onWrong(label(selected));
  }

  return <div className="space-y-5">
    <TaskHeading text={task.prompt} />
    <div className="overflow-hidden rounded-lg border-2 border-[#c89cff] bg-gradient-to-br from-[#25143a] via-[#322051] to-[#102b3e] p-5 text-white shadow-xl">
      <div className="mb-6 flex items-center justify-between gap-3"><span className="text-xs font-black uppercase text-[#f7b6ff]">Portal target</span><span className="rounded-md border border-fuchsia-300/40 bg-black/25 px-4 py-2 text-2xl font-black">{sourceFraction ? <Fraction numerator={Number(sourceFraction[1])} denominator={Number(sourceFraction[2])} /> : task.sourceLabel}</span></div>
      <div className="px-2 pb-3 pt-6">
        <div className="mb-4 flex items-center justify-center gap-2 text-2xl font-black"><Sparkles className="text-cyan-300" /><span>{label(selected)}</span></div>
        <input aria-label="Probability scale" type="range" min={0} max={100} step={task.scaleStep * 100} value={selected * 100} onChange={(event) => setSelected(Number(event.target.value) / 100)} className="h-3 w-full cursor-pointer accent-fuchsia-500" />
        <div className="mt-3 flex justify-between">{marks.map((value) => <button key={value} type="button" onClick={() => setSelected(value)} className="text-[10px] font-black text-white/80 sm:text-xs">{task.displayMode === "decimal" ? label(value) : `${Math.round(value * 100)}%`}</button>)}</div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs font-bold text-white/70"><span>Impossible</span><span>Even chance</span><span>Certain</span></div>
    </div>
    <ActionButton onClick={check}><Check className="h-5 w-5" /> Open portal</ActionButton>
  </div>;
}

function ToolVisual({ tool, winning, total }: { tool: ForgeTask["tool"]; winning: number; total: number }) {
  const items = Array.from({ length: total });
  if (tool === "spinner") {
    return <div className="relative h-48 w-48 rounded-full border-4 border-[#6d3f9c] shadow-lg" style={{ background: `conic-gradient(#d946ef 0 ${winning / total * 100}%, #22d3ee 0)` }}><span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#21182d]" /></div>;
  }
  return <div className={`grid w-52 gap-2 rounded-lg border-2 border-[#b78ae8] bg-white/70 p-4 ${total > 8 ? "grid-cols-5" : "grid-cols-4"}`}>{items.map((_, index) => <span key={index} className={`grid aspect-square place-items-center font-black text-white shadow-sm ${tool === "die" ? "rounded-md" : "rounded-full"} ${index < winning ? "bg-fuchsia-500" : "bg-cyan-500"}`}>{tool === "die" ? index + 1 : ""}</span>)}</div>;
}

export function ChanceProbabilityForgeCard({ task, onCorrect, onWrong }: CardProps<ForgeTask>) {
  const [winning, setWinning] = useState(task.initialWinning);
  const targetPercent = Math.round(task.targetWinning / task.total * 100);
  const currentPercent = Math.round(winning / task.total * 100);
  function check() { if (winning === task.targetWinning) onCorrect(); else onWrong(`${winning}/${task.total}`); }
  return <div className="space-y-5">
    <TaskHeading text={task.prompt} />
    <div className="grid gap-5 rounded-lg border-2 border-fuchsia-200 bg-gradient-to-br from-[#fff7fd] to-[#eefcff] p-5 md:grid-cols-[auto_1fr] md:items-center">
      <ToolVisual tool={task.tool} winning={winning} total={task.total} />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-[#251833] p-4 text-white"><Target className="h-7 w-7 text-amber-300" /><div><div className="text-xs font-black uppercase text-fuchsia-200">{task.targetLabel}</div>{task.sourceWinning === undefined ? <div className="mt-2 flex items-center gap-3 text-2xl"><Fraction numerator={task.targetWinning} denominator={task.total} /><span>=</span><span className="font-mono font-black">{targetPercent}%</span></div> : <div className="mt-2 flex items-center gap-3 text-2xl"><Fraction numerator={task.sourceWinning} denominator={task.total} /><span>+</span><span className="text-3xl font-black text-amber-300">?</span><span>= 1</span></div>}</div></div>
        <div className="flex items-center gap-3"><button type="button" aria-label="Remove one winning outcome" onClick={() => setWinning((value) => Math.max(0, value - 1))} className="grid h-12 w-12 place-items-center rounded-lg border-2 border-fuchsia-300 bg-white text-[#6d3f9c]"><Minus /></button><div className="min-w-32 text-center"><div className="text-3xl font-black text-[#6d3f9c]">{winning} of {task.total}</div><div className="text-sm font-bold text-[#645574]">{currentPercent}% winning</div></div><button type="button" aria-label="Add one winning outcome" onClick={() => setWinning((value) => Math.min(task.total, value + 1))} className="grid h-12 w-12 place-items-center rounded-lg bg-[#6d3f9c] text-white"><Plus /></button></div>
        <ActionButton onClick={check}><Check className="h-5 w-5" /> Test build</ActionButton>
      </div>
    </div>
  </div>;
}

function randomCount(trials: number, probability: number) {
  let count = 0;
  for (let index = 0; index < trials; index += 1) if (Math.random() < probability) count += 1;
  return count;
}

export function ChanceSimulationLabCard({ task, onCorrect, onWrong }: CardProps<SimulationTask>) {
  const probability = task.winning / task.total;
  const [prediction, setPrediction] = useState(Math.round(task.stages[0]! * probability));
  const [results, setResults] = useState<number[]>([]);
  const [claim, setClaim] = useState<string | null>(null);
  const expectedFirst = Math.round(task.stages[0]! * probability);
  const allRun = results.length === task.stages.length;
  const claims = task.challenge === "predict"
    ? ["Observed and expected counts can differ.", "Observed results must always be exact.", "One run proves the tool is biased."]
    : ["Larger samples tend to reduce relative variation.", "More trials guarantee an exact result.", "Each new trial must copy the last one."];

  function launch() {
    if (task.challenge === "predict" && prediction !== expectedFirst) { onWrong(String(prediction)); return; }
    const nextIndex = results.length;
    if (nextIndex < task.stages.length) setResults((current) => [...current, randomCount(task.stages[nextIndex]!, probability)]);
  }
  function finish() { if (claim === claims[0]) onCorrect(); else onWrong(claim ?? "No conclusion"); }

  return <div className="space-y-5">
    <TaskHeading text={task.prompt} />
    <div className="rounded-lg border-2 border-[#d7b7f5] bg-gradient-to-br from-[#f8f2ff] to-[#edfdff] p-5">
      <div className="mb-5 flex flex-wrap items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-lg bg-[#251833] text-fuchsia-300">{task.tool === "die" ? <Dices className="h-7 w-7" /> : task.tool === "coin" ? <Coins className="h-7 w-7" /> : <CircleDot className="h-7 w-7" />}</span><div><div className="text-xs font-black uppercase text-[#8b2cf5]">{task.tool} simulator</div><div className="flex items-center gap-3 text-xl font-black text-[#2b2135]"><Fraction numerator={task.winning} denominator={task.total} /><span>{Math.round(probability * 100)}% {task.targetName}</span></div></div></div>
      {task.challenge === "predict" && results.length === 0 ? <div className="mb-5 flex flex-wrap items-center gap-3 rounded-lg bg-white p-4"><span className="font-bold">Expected {task.targetName} in {task.stages[0]} trials:</span><button type="button" aria-label="Decrease prediction" onClick={() => setPrediction((value) => Math.max(0, value - 1))} className="grid h-10 w-10 place-items-center rounded-md border"><Minus /></button><span className="min-w-12 text-center text-2xl font-black text-[#6d3f9c]">{prediction}</span><button type="button" aria-label="Increase prediction" onClick={() => setPrediction((value) => Math.min(task.stages[0]!, value + 1))} className="grid h-10 w-10 place-items-center rounded-md bg-[#6d3f9c] text-white"><Plus /></button></div> : null}
      <div className="grid gap-3 sm:grid-cols-3">{task.stages.map((trials, index) => {
        const observed = results[index];
        const percent = observed === undefined ? 0 : observed / trials * 100;
        return <div key={`${trials}-${index}`} className={`rounded-lg border-2 p-4 ${observed === undefined ? "border-dashed border-[#cdb9df] bg-white/50" : "border-cyan-300 bg-white"}`}><div className="flex items-center justify-between"><span className="text-xs font-black uppercase text-[#6d3f9c]">Stage {index + 1}</span><span className="font-mono font-black">{trials} trials</span></div><div className="mt-3 h-28 overflow-hidden rounded-md bg-[#251833] p-3"><div className="flex h-full items-end gap-2"><div className="w-1/2 rounded-t bg-fuchsia-500 transition-all" style={{ height: `${Math.round(probability * 100)}%` }} /><div className="w-1/2 rounded-t bg-cyan-400 transition-all" style={{ height: `${Math.round(percent)}%` }} /></div></div><div className="mt-2 text-sm font-bold">{observed === undefined ? "Waiting" : `${observed}/${trials} = ${Math.round(percent)}%`}</div></div>;
      })}</div>
      {!allRun ? <div className="mt-5"><ActionButton onClick={launch}><Play className="h-5 w-5" /> Run stage {results.length + 1}</ActionButton></div> : <div className="mt-5 space-y-3"><div className="text-sm font-black uppercase text-[#8b2cf5]">Choose the evidence claim</div>{claims.map((text) => <button key={text} type="button" onClick={() => setClaim(text)} className={`block w-full rounded-lg border-2 p-3 text-left font-bold transition ${claim === text ? "border-fuchsia-500 bg-fuchsia-50" : "border-[#ddd0e8] bg-white hover:border-cyan-400"}`}>{text}</button>)}<ActionButton onClick={finish} disabled={!claim}><Check className="h-5 w-5" /> Lock conclusion</ActionButton></div>}
    </div>
  </div>;
}

export function ChanceModelDebuggerCard({ task, onCorrect, onWrong }: CardProps<DebugTask>) {
  const [selected, setSelected] = useState<string | null>(null);
  function check() { if (selected === task.answerId) onCorrect(); else onWrong(task.machines.find((machine) => machine.id === selected)?.title); }
  return <div className="space-y-5"><TaskHeading text={task.prompt} /><div className="rounded-lg border-2 border-[#ca9df2] bg-[#1f152c] p-5 text-white"><div className="mb-5 flex items-center gap-3"><Cpu className="h-7 w-7 text-cyan-300" /><div><div className="text-xs font-black uppercase text-fuchsia-300">Simulation brief</div><div className="text-xl font-black">{task.scenario}</div></div></div><div className="grid gap-3 md:grid-cols-3">{task.machines.map((machine) => <button key={machine.id} type="button" onClick={() => setSelected(machine.id)} className={`min-h-40 rounded-lg border-2 p-4 text-left transition ${selected === machine.id ? "border-amber-300 bg-[#4b2861] shadow-[0_0_24px_rgba(217,70,239,.35)]" : "border-white/15 bg-white/5 hover:border-cyan-300"}`}><span className="mb-5 grid h-10 w-10 place-items-center rounded-md bg-gradient-to-br from-fuchsia-500 to-cyan-400"><Cpu /></span><span className="block text-lg font-black">{machine.title}</span><span className="mt-2 block text-sm font-semibold text-white/75">{machine.detail}</span></button>)}</div></div><ActionButton onClick={check} disabled={!selected}><Check className="h-5 w-5" /> Run diagnostic</ActionButton></div>;
}

export function ChanceMasterTrialCard({ task, onCorrect, onWrong }: CardProps<MasterTask>) {
  const probability = task.targetWinning / task.total;
  const expected = Math.round(task.trials * probability);
  const [stage, setStage] = useState(0);
  const [wrong, setWrong] = useState(false);
  const shieldPower = Math.max(0, 100 - stage * 34);
  const equivalentChoices = rotateChoices([Math.round(probability * 100), Math.min(100, Math.round(probability * 100) + 10), Math.max(0, Math.round(probability * 100) - 10)], task.targetWinning);
  const expectedChoices = rotateChoices([expected, Math.min(task.trials, expected + Math.max(2, Math.round(task.trials * 0.1))), Math.max(0, expected - Math.max(2, Math.round(task.trials * 0.1)))], task.total);
  const verdicts = ["The difference is normal variation; repeat more trials for stronger evidence.", "The observed result must equal the expected result.", "One result proves the machine is unfair."];

  function strike(correct: boolean, answer: string) {
    if (!correct) { setWrong(true); onWrong(answer); return; }
    setWrong(false);
    if (stage === 2) onCorrect(); else setStage((value) => value + 1);
  }
  return <div className="space-y-4"><TaskHeading text={task.prompt} /><div className="grid overflow-hidden rounded-lg border-2 border-fuchsia-400 bg-gradient-to-br from-[#130d20] via-[#2b1641] to-[#071f2b] text-white shadow-2xl md:grid-cols-[minmax(220px,34%)_1fr]"><div className="relative min-h-[330px] overflow-hidden bg-[radial-gradient(circle_at_50%_45%,rgba(217,70,239,.45),transparent_58%)]"><Image src={task.opponentImage} alt={task.opponentName} fill sizes="(max-width: 768px) 100vw, 34vw" className="object-contain object-bottom" priority /><div className="absolute left-3 right-3 top-3 rounded-md border border-fuchsia-300/30 bg-black/55 p-3 backdrop-blur"><div className="flex items-center justify-between text-xs font-black uppercase"><span>{task.opponentName}</span><span>{shieldPower}% shield</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all" style={{ width: `${shieldPower}%` }} /></div></div></div><div className="p-5 md:p-7"><div className="mb-4 flex items-center gap-3"><Shield className="h-8 w-8 text-amber-300" /><div><div className="text-xs font-black uppercase text-fuchsia-300">Strike {stage + 1} of 3</div><div className="text-xl font-black">{stage === 0 ? "Crack the scale seal" : stage === 1 ? "Predict the pulse" : "Defend the verdict"}</div></div></div>{stage === 0 ? <><p className="mb-4 font-bold">Which percentage equals <Fraction numerator={task.targetWinning} denominator={task.total} />?</p><div className="grid gap-3 sm:grid-cols-3">{equivalentChoices.map((value) => <button key={value} type="button" onClick={() => strike(value === Math.round(probability * 100), `${value}%`)} className="rounded-lg border-2 border-white/20 bg-white/10 p-4 text-xl font-black hover:border-cyan-300 hover:bg-cyan-400/20">{value}%</button>)}</div></> : stage === 1 ? <><p className="mb-4 font-bold">About how many wins are expected in {task.trials} trials?</p><div className="grid gap-3 sm:grid-cols-3">{expectedChoices.map((value) => <button key={value} type="button" onClick={() => strike(value === expected, String(value))} className="rounded-lg border-2 border-white/20 bg-white/10 p-4 text-xl font-black hover:border-cyan-300 hover:bg-cyan-400/20">{value}</button>)}</div></> : <><p className="mb-4 font-bold">The simulation recorded {task.observed} wins; expected was about {expected}. Which verdict holds?</p><div className="space-y-3">{verdicts.map((verdict, index) => <button key={verdict} type="button" onClick={() => strike(index === 0, verdict)} className="block w-full rounded-lg border-2 border-white/20 bg-white/10 p-3 text-left font-bold hover:border-amber-300">{verdict}</button>)}</div></>}{wrong ? <p className="mt-4 font-bold text-rose-300">The shield held. Recheck the evidence.</p> : null}</div></div></div>;
}
