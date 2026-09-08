"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { MathFormattedText } from "@/components/FractionText";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "chanceAutoTally" }>;
type Tally = Record<string, number>;

const FRAME = "#6d3f9c";
const INK = "#2c2140";

function pt(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function TallyGroup({ n }: { n: number }) {
  return (
    <svg viewBox="0 0 34 34" className="h-7 w-7" aria-hidden="true">
      {Array.from({ length: Math.min(n, 4) }, (_, i) => (
        <line key={i} x1={5 + i * 7} y1={4} x2={5 + i * 7} y2={30} stroke={FRAME} strokeWidth={2.6} strokeLinecap="round" />
      ))}
      {n >= 5 ? <line x1={2} y1={30} x2={32} y2={4} stroke="#e05a52" strokeWidth={2.8} strokeLinecap="round" /> : null}
    </svg>
  );
}

function TallyMarks({ n }: { n: number }) {
  const groups: number[] = [];
  let left = n;
  while (left > 0) { groups.push(Math.min(5, left)); left -= 5; }
  return <div className="flex min-h-[28px] flex-wrap items-center gap-1">{groups.map((g, i) => <TallyGroup key={i} n={g} />)}</div>;
}

const DIE_PIPS: Record<number, ReadonlyArray<[number, number]>> = {
  1: [[0.5, 0.5]], 2: [[0.3, 0.3], [0.7, 0.7]], 3: [[0.3, 0.3], [0.5, 0.5], [0.7, 0.7]],
  4: [[0.32, 0.32], [0.68, 0.32], [0.32, 0.68], [0.68, 0.68]],
  5: [[0.32, 0.32], [0.68, 0.32], [0.5, 0.5], [0.32, 0.68], [0.68, 0.68]],
  6: [[0.32, 0.28], [0.68, 0.28], [0.32, 0.5], [0.68, 0.5], [0.32, 0.72], [0.68, 0.72]],
};

function ToolFace({ tool, current, rotation, draw }: { tool: string; current: string | null; rotation: number; draw: string[] }) {
  if (tool === "die") {
    const face = Number(current) || 1;
    const pips = DIE_PIPS[Math.min(Math.max(face, 1), 6)] ?? DIE_PIPS[1]!;
    return (
      <svg viewBox="0 0 140 140" width="130" height="130" role="img" aria-label="Die"><rect x={10} y={10} width={120} height={120} rx={22} fill="#fff" stroke={FRAME} strokeWidth={4} />{pips.map(([px, py], i) => <circle key={i} cx={10 + px * 120} cy={10 + py * 120} r={9} fill={INK} />)}</svg>
    );
  }
  if (tool === "coin") {
    return (
      <svg viewBox="0 0 150 150" width="130" height="130" role="img" aria-label="Coin"><circle cx={75} cy={75} r={62} fill="#f4c542" stroke="#b8860b" strokeWidth={5} /><circle cx={75} cy={75} r={50} fill="none" stroke="#d9a521" strokeWidth={3} /><text x={75} y={96} textAnchor="middle" fontSize={56} fontWeight={900} fill="#7a5b12">{current === "tails" ? "T" : "H"}</text></svg>
    );
  }
  const n = Math.max(draw.length, 1);
  const wedgeAngle = 360 / n;
  const cx = 75, cy = 75, r = 62;
  return (
    <svg viewBox="0 0 150 164" width="140" height="153" role="img" aria-label="Spinner">
      <g style={{ transition: "transform 0.16s linear", transform: `rotate(${rotation}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
        {draw.map((colour, i) => {
          const [x0, y0] = pt(cx, cy, r, i * wedgeAngle);
          const [x1, y1] = pt(cx, cy, r, (i + 1) * wedgeAngle);
          return <path key={i} d={`M ${cx} ${cy} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${wedgeAngle > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`} fill={colour} stroke="#fff" strokeWidth={2} />;
        })}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={FRAME} strokeWidth={3} />
      </g>
      <path d={`M ${cx} ${cy - r - 7} l -8 14 l 16 0 z`} fill={INK} />
      <circle cx={cx} cy={cy} r={6} fill={INK} />
    </svg>
  );
}

function TallyTable({ labels, tally, title }: { labels: Task["labels"]; tally: Tally; title?: string }) {
  return (
    <div className="rounded-lg border border-[#e4d8f5] bg-white p-3">
      {title ? <div className="mb-2 text-xs font-black uppercase tracking-wide text-[#6d3f9c]">{title}</div> : null}
      <div className="space-y-1.5">
        {labels.map((l) => (
          <div key={l.key} className="flex items-center gap-2">
            <span className="flex min-w-[70px] items-center gap-1.5 font-black text-[#3a2f52]">
              {l.colour ? <span className="inline-block h-3.5 w-3.5 rounded-full border border-white shadow" style={{ background: l.colour }} /> : null}
              <span className="capitalize">{l.name}</span>
            </span>
            <TallyMarks n={tally[l.key] ?? 0} />
            <span className="ml-auto font-mono text-base font-black tabular-nums text-[#6d3f9c]">{tally[l.key] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChanceAutoTallyCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string, correctAnswer?: string) => void }) {
  const { tool, draw, labels, spins, mode } = task;
  const trials = mode === "compareTrials" || mode === "compareFrequencies" || mode === "predictMatch" ? 2 : 1;

  const isPredict = mode === "predictMatch" || mode === "predictMost";
  const [phase, setPhase] = useState<"ready" | "predict" | "running" | "answer" | "interpret" | "reveal">(isPredict ? "predict" : "ready");
  const [tallies, setTallies] = useState<Tally[]>(() => Array.from({ length: trials }, () => ({})));
  const [current, setCurrent] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [settled, setSettled] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => { timers.current.forEach((id) => { window.clearTimeout(id); window.clearInterval(id); }); }, []);

  const actionWord = tool === "coin" ? "flip" : tool === "die" ? "roll" : "spin";
  const trialsIdentical = () => labels.every((l) => (tallies[0]![l.key] ?? 0) === (tallies[1]![l.key] ?? 0));

  function run(from: "ready" | "predict") {
    if (phase !== from) return;
    setPhase("running");
    const total = spins * trials;
    let step = 0;
    const iv = window.setInterval(() => {
      const trial = Math.floor(step / spins);
      const key = draw[Math.floor(Math.random() * draw.length)]!;
      setCurrent(key);
      setRotation((rot) => rot + 120 + Math.floor(Math.random() * 240));
      setTallies((ts) => { const copy = ts.map((m) => ({ ...m })); copy[trial]![key] = (copy[trial]![key] ?? 0) + 1; return copy; });
      step += 1;
      if (step >= total) { window.clearInterval(iv); setCurrent(null); setPhase(isPredict ? "reveal" : "answer"); }
    }, 170);
    timers.current.push(iv);
  }

  function predict(value: string) {
    if (phase !== "predict") return;
    setPrediction(value);
    run("predict");
  }

  function checkPrediction() {
    if (settled) return;
    setSettled(true);
    let wasRight: boolean;
    let correctAnswer: string;
    if (mode === "predictMost") {
      const counts = labels.map((l) => tallies[0]![l.key] ?? 0);
      const max = Math.max(...counts);
      wasRight = (tallies[0]![prediction ?? ""] ?? -1) === max;
      const topKey = labels.find((l) => (tallies[0]![l.key] ?? 0) === max)?.key ?? "";
      correctAnswer = nameOf(topKey);
    } else {
      wasRight = (prediction === "yes") === trialsIdentical();
      correctAnswer = trialsIdentical() ? "Yes — they matched" : "No — they differed";
    }
    if (wasRight) onCorrect(); else onWrong(prediction ?? undefined, correctAnswer);
  }

  // Grading
  const nameOf = (key: string) => labels.find((l) => l.key === key)?.name ?? "that one";
  function answerMostLeast(key: string) {
    if (settled) return;
    setSettled(true);
    const counts = labels.map((l) => tallies[0]![l.key] ?? 0);
    const target = mode === "least" ? Math.min(...counts) : Math.max(...counts);
    const ok = (tallies[0]![key] ?? 0) === target;
    const correctKey = labels.find((l) => (tallies[0]![l.key] ?? 0) === target)?.key ?? key;
    if (ok) onCorrect(); else onWrong(nameOf(key), nameOf(correctKey));
  }
  function answerCompare(id: string) {
    if (settled) return;
    setSettled(true);
    const identical = labels.every((l) => (tallies[0]![l.key] ?? 0) === (tallies[1]![l.key] ?? 0));
    const correctId = identical ? "identical" : "varied";
    const correctLabel = compareOptions.find((option) => option.id === correctId)?.label ?? correctId;
    if (id === correctId) onCorrect(); else onWrong(id, correctLabel);
  }

  const comparisonOutcome = labels[0]!;
  const trialOneCount = tallies[0]?.[comparisonOutcome.key] ?? 0;
  const trialTwoCount = tallies[1]?.[comparisonOutcome.key] ?? 0;
  const frequencyComparisonId = trialOneCount > trialTwoCount ? "trial-1" : trialTwoCount > trialOneCount ? "trial-2" : "equal";

  function answerFrequencyComparison(id: string) {
    if (settled) return;
    if (id === frequencyComparisonId) {
      setPhase("interpret");
      return;
    }
    setSettled(true);
    onWrong(id, frequencyOptions.find((option) => option.id === frequencyComparisonId)?.label);
  }

  function answerInterpretation(id: string) {
    if (settled) return;
    setSettled(true);
    if (id === "variation") onCorrect();
    else onWrong(id, interpretationOptions.find((option) => option.id === "variation")?.label);
  }

  const compareOptions = [
    { id: "varied", label: "No — the two results were different" },
    { id: "identical", label: "Yes — the two trials were exactly the same" },
    { id: "wrong", label: "One of the trials must be wrong" },
    { id: "broken", label: `The ${tool} is broken` },
  ];
  const frequencyOptions = [
    { id: "trial-1", label: `Trial 1 has the greater relative frequency: ${trialOneCount}/${spins} > ${trialTwoCount}/${spins}` },
    { id: "trial-2", label: `Trial 2 has the greater relative frequency: ${trialTwoCount}/${spins} > ${trialOneCount}/${spins}` },
    { id: "equal", label: `The relative frequencies are equal: ${trialOneCount}/${spins} = ${trialTwoCount}/${spins}` },
    { id: "cannot", label: "The trials cannot be compared because their results are different" },
  ];
  const interpretationOptions = [
    { id: "variation", label: "Repeated trials can have different relative frequencies even when the chance process stays fair" },
    { id: "forever", label: `The trial with more ${comparisonOutcome.name.toLowerCase()} proves that outcome will be more likely forever` },
    { id: "exact", label: `A fair ${tool} must produce exactly the same frequencies in every experiment` },
    { id: "invalid", label: "Different frequencies prove that one of the experiments was invalid" },
  ];
  const question = mode === "least"
    ? "Which came up the fewest times?"
    : mode === "compareTrials"
      ? "Did the two trials come out exactly the same?"
      : mode === "compareFrequencies"
        ? `Which statement correctly compares the relative frequency of ${comparisonOutcome.name.toLowerCase()}?`
        : "Which came up the most often?";

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <h2 className="text-xl font-extrabold leading-tight text-foreground md:text-2xl">{task.prompt}</h2>
        <ReadAloudBtn text={task.prompt} />
      </div>

      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[#e4d8f5] bg-[#faf7ff] p-4">
          <div className={phase === "running" ? "animate-pulse" : ""}>
            <ToolFace tool={tool} current={current} rotation={rotation} draw={draw} />
          </div>
          {isPredict ? (
            <span className="text-sm font-bold text-[#6b6280]">{phase === "running" ? "Running…" : phase === "predict" ? "Predict first" : "Experiment run"}</span>
          ) : (
            <button type="button" onClick={() => run("ready")} disabled={phase !== "ready"} className="flex h-11 items-center gap-2 rounded-lg bg-[#6d3f9c] px-5 font-black text-white shadow-md transition hover:bg-[#5a3183] active:scale-95 disabled:opacity-40">
              <Play className="h-5 w-5" /> {phase === "ready" ? `Auto-${actionWord} ${spins}${trials > 1 ? ` × ${trials}` : ""}` : phase === "running" ? "Running…" : "Done"}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {trials > 1 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <TallyTable labels={labels} tally={tallies[0]!} title="Trial 1" />
              <TallyTable labels={labels} tally={tallies[1]!} title="Trial 2" />
            </div>
          ) : (
            <TallyTable labels={labels} tally={tallies[0]!} />
          )}

          {phase === "predict" ? (
            mode === "predictMost" ? (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <p className="text-lg font-black text-[#3a2f52]">First, predict: which colour will come up most?</p>
                  <ReadAloudBtn text="First, predict: which colour will come up most?" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {labels.map((l) => (
                    <button key={l.key} type="button" onClick={() => predict(l.key)} className="flex items-center justify-between gap-2 rounded-lg border-2 border-[#e0d3f2] bg-white px-4 py-3 text-left font-black text-[#3a2f52] transition hover:border-[#6d3f9c]">
                      <span className="flex items-center gap-2">{l.colour ? <span className="inline-block h-4 w-4 rounded-full border border-white shadow" style={{ background: l.colour }} /> : null}<span className="capitalize">{l.name}</span></span>
                      <OptionReadAloudButton text={l.name} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <p className="text-lg font-black text-[#3a2f52]">First, predict: will the two trials come out exactly the same?</p>
                  <ReadAloudBtn text="First, predict: will the two trials come out exactly the same?" />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {([["no", "No — they will be different"], ["yes", "Yes — they will match exactly"]] as const).map(([id, label]) => (
                    <button key={id} type="button" onClick={() => predict(id)} className="flex items-center justify-between gap-3 rounded-lg border-2 border-[#e0d3f2] bg-white px-4 py-3 text-left font-black text-[#3a2f52] transition hover:border-[#6d3f9c]">
                      <span>{label}</span>
                      <OptionReadAloudButton text={label} />
                    </button>
                  ))}
                </div>
              </div>
            )
          ) : phase === "reveal" ? (
            <div className="space-y-2">
              <p className="text-lg font-black text-[#3a2f52]">
                {mode === "predictMost"
                  ? <>You predicted <span className="capitalize text-[#6d3f9c]">{labels.find((l) => l.key === prediction)?.name ?? prediction}</span> would come up most.</>
                  : <>You predicted the trials would be <span className="text-[#6d3f9c]">{prediction === "yes" ? "the same" : "different"}</span>.</>}
              </p>
              <button type="button" disabled={settled} onClick={checkPrediction} className="flex h-11 items-center gap-2 rounded-lg bg-[#6d3f9c] px-5 font-black text-white shadow-md transition hover:bg-[#5a3183] active:scale-95 disabled:opacity-40">
                See if I was right
              </button>
            </div>
          ) : phase === "answer" ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <p className="text-lg font-black text-[#3a2f52]">{question}</p>
                <ReadAloudBtn text={question} />
              </div>
              {mode === "compareTrials" ? (
                <div className="grid gap-2">
                  {compareOptions.map((o) => (
                    <button key={o.id} type="button" disabled={settled} onClick={() => answerCompare(o.id)} className="flex items-center justify-between gap-3 rounded-lg border-2 border-[#e0d3f2] bg-white px-4 py-3 text-left font-black text-[#3a2f52] transition hover:border-[#6d3f9c] disabled:opacity-60">
                      <span>{o.label}</span>
                      <OptionReadAloudButton text={o.label} />
                    </button>
                  ))}
                </div>
              ) : mode === "compareFrequencies" ? (
                <div className="space-y-3">
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-[#8d4a96]">Analysis 1 of 2</div>
                  <div className="grid gap-2">
                    {frequencyOptions.map((option) => (
                      <button key={option.id} type="button" disabled={settled} onClick={() => answerFrequencyComparison(option.id)} className="flex min-h-16 items-center justify-between gap-3 rounded-lg border-2 border-[#e0d3f2] bg-white px-4 py-3 text-left font-black text-[#3a2f52] transition hover:border-[#6d3f9c] disabled:opacity-60">
                        <span><MathFormattedText text={option.label} fractionSize="md" /></span>
                        <OptionReadAloudButton text={option.label} />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {labels.map((l) => (
                    <button key={l.key} type="button" disabled={settled} onClick={() => answerMostLeast(l.key)} className="flex items-center justify-between gap-2 rounded-lg border-2 border-[#e0d3f2] bg-white px-4 py-3 text-left font-black text-[#3a2f52] transition hover:border-[#6d3f9c] disabled:opacity-60">
                      <span className="flex items-center gap-2">{l.colour ? <span className="inline-block h-4 w-4 rounded-full border border-white shadow" style={{ background: l.colour }} /> : null}<span className="capitalize">{l.name}</span></span>
                      <OptionReadAloudButton text={l.name} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : phase === "interpret" ? (
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[#8d4a96]">Evidence 2 of 2</div>
              <div className="flex items-start gap-2">
                <p className="text-lg font-black text-[#3a2f52]">What is the strongest conclusion supported by these two experiments?</p>
                <ReadAloudBtn text="What is the strongest conclusion supported by these two experiments?" />
              </div>
              <div className="grid gap-2">
                {interpretationOptions.map((option) => (
                  <button key={option.id} type="button" disabled={settled} onClick={() => answerInterpretation(option.id)} className="flex min-h-16 items-center justify-between gap-3 rounded-lg border-2 border-[#e0d3f2] bg-white px-4 py-3 text-left font-black text-[#3a2f52] transition hover:border-[#6d3f9c] disabled:opacity-60">
                    <span>{option.label}</span>
                    <OptionReadAloudButton text={option.label} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm font-bold text-[#6b6280]" role="status">{phase === "ready" ? `Press Auto-${actionWord} to run the experiment.` : "Watching the results build…"}</p>
          )}
        </div>
      </div>
    </div>
  );
}
