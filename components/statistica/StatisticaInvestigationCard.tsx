"use client";

import { useMemo, useState } from "react";
import { Check, Minus } from "lucide-react";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import StatisticaPlot from "@/components/statistica/StatisticaPlot";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "statisticaInvestigation" }>;
type Survey = Task["surveys"][number];

// Statistica Level 4 — a guided statistical investigation (AC9M4ST03). One card
// walks the whole cycle: choose a question, predict, see the class data, build
// the column graph, then analyse your own data set.
type Step = "choose" | "predict" | "reveal" | "build" | "analyse";

export default function StatisticaInvestigationCard({ task, onCorrect, onWrong }: { task: Task; onCorrect: () => void; onWrong: (answer?: string) => void }) {
  const [step, setStep] = useState<Step>("choose");
  const [surveyId, setSurveyId] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [built, setBuilt] = useState<number[]>([]);
  const [buildTried, setBuildTried] = useState(false);
  const [chosen, setChosen] = useState<string | null>(null);
  const [analysisIndex, setAnalysisIndex] = useState(0);
  const [settled, setSettled] = useState(false);

  const buildStep = task.buildStep ?? 1;
  const survey = useMemo<Survey | null>(() => task.surveys.find((s) => s.id === surveyId) ?? null, [task.surveys, surveyId]);

  function chooseSurvey(s: Survey) {
    setSurveyId(s.id);
    setBuilt(s.categories.map(() => 0));
    setStep("predict");
  }
  function addBar(i: number, delta: number) {
    setBuilt((b) => b.map((v, j) => (j === i ? Math.max(0, Math.min(survey!.categories[j]!.count + buildStep, v + delta)) : v)));
  }
  const buildMatches = Boolean(survey) && survey!.categories.every((c, i) => built[i] === c.count);
  function checkBuild() {
    setBuildTried(true);
    if (buildMatches) setStep("analyse");
  }
  function submitAnalysis() {
    if (settled || !chosen || !survey) return;
    const q = survey.analyses[analysisIndex]!;
    if (!q.correctOptionIds.includes(chosen)) { setSettled(true); onWrong(chosen); return; }
    if (analysisIndex + 1 < survey.analyses.length) {
      setAnalysisIndex(analysisIndex + 1);
      setChosen(null);
    } else {
      setSettled(true);
      onCorrect();
    }
  }

  const predictionLabel = survey?.categories.find((c) => c.id === prediction)?.label ?? null;

  return (
    <div className="space-y-4">
      {/* Step banner so the child always knows where they are in the cycle */}
      <ol className="mx-auto flex max-w-xl items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em]">
        {(["choose", "predict", "reveal", "build", "analyse"] as Step[]).map((s, i) => {
          const order: Step[] = ["choose", "predict", "reveal", "build", "analyse"];
          const done = order.indexOf(step) > i;
          const active = step === s;
          return (
            <li key={s} className={["rounded-full px-2.5 py-1", active ? "bg-[#c74f4b] text-white" : done ? "bg-[#e7f0e2] text-[#3d8b6f]" : "bg-[#eee7da] text-[#a79b86]"].join(" ")}>
              {s === "reveal" ? "data" : s}
            </li>
          );
        })}
      </ol>

      {step === "choose" && (
        <>
          <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />
          <div className="mx-auto grid max-w-xl gap-2">
            {task.surveys.map((s) => (
              <div key={s.id} className="relative">
                <button type="button" onClick={() => chooseSurvey(s)} className="min-h-12 w-full rounded-lg border-2 border-[#b9caaa] bg-[#fffaf0] px-4 py-3 pr-10 text-left text-sm font-black text-[#244531] transition hover:border-[#f06b64]">{s.question}</button>
                <OptionReadAloudButton text={s.question} className="absolute right-1 top-1/2 -translate-y-1/2 scale-90" />
              </div>
            ))}
          </div>
        </>
      )}

      {step === "predict" && survey && (
        <>
          <TaskHeading prompt={`${survey.question} Before the results — which do you predict will be MOST popular?`} speech={`${survey.question}. Which do you predict will be most popular?`} />
          <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
            {survey.categories.map((c) => (
              <button key={c.id} type="button" onClick={() => { setPrediction(c.id); setStep("reveal"); }} className="min-h-12 rounded-lg border-2 border-[#b9caaa] bg-[#fffaf0] px-3 py-2 text-sm font-black text-[#244531] transition hover:border-[#f06b64]">{c.label}</button>
            ))}
          </div>
        </>
      )}

      {step === "reveal" && survey && (
        <>
          <TaskHeading prompt="You surveyed the class! Here is what they said." speech={`You surveyed the class. Here is what they said. ${predictionLabel ? `You predicted ${predictionLabel}.` : ""}`} />
          <div className="mx-auto max-w-sm overflow-hidden rounded-xl border-2 border-[#b9caaa] bg-[#fffaf0]">
            {survey.categories.map((c, i) => (
              <div key={c.id} className={`flex items-center justify-between px-4 py-2.5 ${i > 0 ? "border-t border-[#e2ddce]" : ""}`}>
                <span className="flex items-center gap-2 text-sm font-black text-[#244531]"><span className="h-3.5 w-3.5 rounded-sm" style={{ background: c.color }} />{c.label}</span>
                <span className="text-base font-black tabular-nums text-[#244531]">{c.count}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={() => setStep("build")} className="flex h-12 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition hover:bg-[#a93f3c] active:scale-95">Make the graph</button>
          </div>
        </>
      )}

      {step === "build" && survey && (
        <>
          <TaskHeading prompt={`Build the column graph to match your ${survey.unit} data.`} speech={`Build the column graph so each bar matches the data. ${buildStep > 1 ? `Each tap is worth ${buildStep}.` : ""}`} />
          <StatisticaPlot
            categories={survey.categories}
            display="columns"
            values={built}
            labelReadAloud={false}
            footer={(cat, i) => (
              <>
                <div className={`mt-1 text-[11px] font-black ${built[i] === cat.count ? "text-emerald-300" : "text-amber-300"}`}>aim {cat.count}</div>
                <div className="mt-1 flex gap-1">
                  <button type="button" onClick={() => addBar(i, -buildStep)} aria-label={`remove ${buildStep} from ${cat.label}`} className="grid h-7 w-7 place-items-center rounded-md border border-white/15 bg-white/5 text-white/70 transition hover:bg-white/10"><Minus className="h-3.5 w-3.5" /></button>
                  <button type="button" onClick={() => addBar(i, buildStep)} aria-label={`add ${buildStep} to ${cat.label}`} className="grid h-7 w-10 place-items-center rounded-md border border-[#f2bc45]/55 bg-[#f2bc45]/15 text-base font-black text-[#fff0c7] transition hover:bg-[#f2bc45]/25">{buildStep > 1 ? `+${buildStep}` : "+"}</button>
                </div>
              </>
            )}
          />
          {buildTried && !buildMatches && (
            <p className="text-center text-sm font-bold text-[#c74f4b]">Not yet — make each bar reach its aim.</p>
          )}
          <div className="flex justify-center">
            <button type="button" onClick={checkBuild} className="flex h-12 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition hover:bg-[#a93f3c] active:scale-95"><Check className="h-5 w-5" /> Check graph</button>
          </div>
        </>
      )}

      {step === "analyse" && survey && (() => {
        const q = survey.analyses[analysisIndex]!;
        return (
        <>
          <p className="text-center text-[11px] font-black uppercase tracking-[0.14em] text-[#c74f4b]">Question {analysisIndex + 1} of {survey.analyses.length}</p>
          <TaskHeading prompt={q.prompt} speech={`${q.prompt}. ${q.speak}`} />
          <StatisticaPlot categories={survey.categories} display="columns" labelReadAloud={false} />
          <div className="mx-auto grid max-w-lg gap-2">
            {q.options.map((option) => (
              <div key={option.id} className="relative">
                <button type="button" onClick={() => !settled && setChosen(option.id)} className={["min-h-12 w-full rounded-lg border-2 px-3 py-2 pr-10 text-left text-sm font-bold transition", chosen === option.id ? "border-[#f06b64] bg-[#fff0df] text-[#5b2e27] ring-2 ring-[#f2bc45]/55" : "border-[#b9caaa] bg-[#fffaf0] text-[#244531] hover:border-[#f06b64]"].join(" ")}>{option.label}</button>
                <OptionReadAloudButton text={option.label} className="absolute right-1 top-1/2 -translate-y-1/2 scale-90" />
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" onClick={submitAnalysis} disabled={settled || !chosen} className="flex h-12 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition hover:bg-[#a93f3c] active:scale-95 disabled:opacity-40"><Check className="h-5 w-5" /> Check</button>
          </div>
        </>
        );
      })()}
    </div>
  );
}
