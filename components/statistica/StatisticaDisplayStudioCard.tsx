"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type Task = Extract<PracticeTask, { kind: "statisticaDisplayStudio" }>;
type DisplayKind = Task["correctDisplay"];

const DISPLAY_LABELS: Record<DisplayKind, string> = {
  line: "Line graph",
  column: "Column graph",
  table: "Table",
};

export default function StatisticaDisplayStudioCard({ task, onCorrect, onWrong, onContinue }: {
  task: Task;
  onCorrect: () => void;
  onWrong: (answer?: string) => void;
  onContinue: () => void;
}) {
  const [display, setDisplay] = useState<DisplayKind | null>(null);
  const [titleId, setTitleId] = useState<string | null>(null);
  const [reasonId, setReasonId] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  if (task.mode === "guide") {
    return (
      <div className="space-y-5">
        <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />
        <div className="mx-auto max-w-4xl rounded-xl border-2 border-[#b9caaa] bg-[#fffaf0] p-4 shadow-md">
          <p className="text-center text-base font-bold text-[#355444]">{task.purpose}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(task.guideItems ?? []).map((item, index) => (
              <div key={item.title} className="relative min-w-0 rounded-lg border border-[#d4dfcc] bg-white p-3 text-center">
                <OptionReadAloudButton text={`${item.title}. ${item.body}`} className="absolute right-1 top-1 z-10" />
                {item.display ? <DisplayPreview kind={item.display} data={task.data} compact /> : <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#173b2c] text-lg font-black text-[#f2bc45]">{index + 1}</div>}
                <div className="mt-2 text-base font-black text-[#173b2c]">{item.title}</div>
                <p className="mt-1 text-sm font-bold leading-snug text-[#607467]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center">
          <button type="button" onClick={onContinue} className="flex h-12 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition hover:bg-[#a93f3c] active:scale-95">
            Continue <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  function submit() {
    if (settled || !display) return;
    if (task.mode === "design" && (!titleId || !reasonId)) return;
    setSettled(true);
    const correct = display === task.correctDisplay
      && (task.mode !== "design" || (titleId === task.correctTitleId && reasonId === task.correctReasonId));
    if (correct) onCorrect();
    else onWrong([display, titleId, reasonId].filter(Boolean).join(" | "));
  }

  return (
    <div className="space-y-4">
      <TaskHeading prompt={task.prompt} speech={`${task.prompt}. ${task.speakText}`} />

      <div className="mx-auto max-w-4xl rounded-xl border border-[#d6dfce] bg-[#f8fbf5] px-4 py-3 text-center">
        <div className="text-xs font-black uppercase tracking-[0.14em] text-[#6b7f70]">Question to answer</div>
        <div className="mt-1 text-lg font-black text-[#173b2c]">{task.question}</div>
        <div className="mt-2 text-xs font-black uppercase tracking-[0.14em] text-[#9a5b2f]">Display job</div>
        <p className="mt-1 text-sm font-bold text-[#607467]">{task.purpose}</p>
        <p className="mt-2 text-xs font-bold text-[#52705e]">
          {task.mode === "compare" ? "Both displays are accurate." : "More than one display may be accurate."} Choose the one with the requested feature.
        </p>
      </div>

      <div className={`mx-auto grid max-w-4xl gap-3 ${task.displayOptions.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {task.displayOptions.map((kind) => {
          const selected = display === kind;
          return (
            <div key={kind} className="relative min-w-0">
              <button
                type="button"
                aria-label={`Choose ${DISPLAY_LABELS[kind]}`}
                onClick={() => !settled && setDisplay(kind)}
                className={`w-full rounded-xl border-2 p-3 text-left transition ${selected ? "border-[#c74f4b] bg-[#fff0df] ring-2 ring-[#f2bc45]/55" : "border-[#b9caaa] bg-[#fffaf0] hover:border-[#e17a63]"}`}
              >
                <DisplayPreview kind={kind} data={task.data} />
                <div className="mt-2 text-center text-sm font-black text-[#244531]">{DISPLAY_LABELS[kind]}</div>
              </button>
              <OptionReadAloudButton text={DISPLAY_LABELS[kind]} className="absolute right-2 top-2" />
            </div>
          );
        })}
      </div>

      {task.mode === "design" ? (
        <div className="mx-auto grid max-w-4xl gap-3 lg:grid-cols-2">
          <ChoiceGroup label="Choose a clear title" options={task.titleOptions ?? []} chosen={titleId} onChoose={setTitleId} disabled={settled} />
          <ChoiceGroup label="Justify your display" options={task.reasonOptions ?? []} chosen={reasonId} onChoose={setReasonId} disabled={settled} />
        </div>
      ) : null}

      <div className="flex justify-center">
        <button type="button" onClick={submit} disabled={settled || !display || (task.mode === "design" && (!titleId || !reasonId))} className="flex h-12 items-center gap-2 rounded-lg bg-[#c74f4b] px-7 font-black text-white shadow-md transition hover:bg-[#a93f3c] active:scale-95 disabled:opacity-40">
          <Check className="h-5 w-5" aria-hidden="true" /> {task.mode === "design" ? "Build display" : "Check"}
        </button>
      </div>
    </div>
  );
}

function ChoiceGroup({ label, options, chosen, onChoose, disabled }: {
  label: string;
  options: Array<{ id: string; label: string }>;
  chosen: string | null;
  onChoose: (id: string) => void;
  disabled: boolean;
}) {
  return (
    <fieldset className="rounded-xl border border-[#d6dfce] bg-white p-3">
      <legend className="px-1 text-sm font-black text-[#173b2c]">{label}</legend>
      <div className="mt-1 grid gap-2">
        {options.map((option) => (
          <div key={option.id} className="relative">
            <button type="button" onClick={() => onChoose(option.id)} disabled={disabled} className={`min-h-11 w-full rounded-lg border-2 px-3 py-2 pr-10 text-left text-sm font-black transition ${chosen === option.id ? "border-[#c74f4b] bg-[#fff0df] text-[#5b2e27]" : "border-[#cad8c1] bg-[#fffaf0] text-[#244531]"}`}>
              {option.label}
            </button>
            <OptionReadAloudButton text={option.label} className="absolute right-1 top-1/2 -translate-y-1/2" />
          </div>
        ))}
      </div>
    </fieldset>
  );
}

function DisplayPreview({ kind, data, compact = false }: { kind: DisplayKind; data: Task["data"]; compact?: boolean }) {
  const max = Math.max(1, ...data.values);
  const height = compact ? 76 : 112;
  if (kind === "table") {
    return (
      <div className="overflow-hidden rounded-md border border-[#c7d5c0] bg-white" style={{ height }}>
        {data.labels.slice(0, compact ? 3 : data.labels.length).map((label, index, rows) => (
          <div key={label} style={{ height: `${100 / rows.length}%` }} className="grid grid-cols-[1fr_82px] items-center border-b border-[#e0e8dc] text-[11px] font-bold last:border-b-0">
            <div className="truncate px-2 text-[#355444]">{label}</div>
            <div className="flex h-full items-center justify-center whitespace-nowrap border-l border-[#e0e8dc] bg-[#edf6e8] px-1 text-[#173b2c]">{data.values[index]} {data.unit}</div>
          </div>
        ))}
      </div>
    );
  }

  const width = 240;
  const plotTop = 8;
  const plotBottom = height - 22;
  const plotHeight = plotBottom - plotTop;
  const xAt = (index: number) => 24 + index * ((width - 48) / Math.max(1, data.values.length - 1));
  const yAt = (value: number) => plotBottom - (value / max) * (plotHeight - 6);
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block w-full rounded-md border border-[#c7d5c0] bg-white" role="img" aria-label={`${DISPLAY_LABELS[kind]} preview`}>
      <line x1="20" y1={plotTop} x2="20" y2={plotBottom} stroke="#8aa08f" strokeWidth="1.5" />
      <line x1="20" y1={plotBottom} x2={width - 10} y2={plotBottom} stroke="#8aa08f" strokeWidth="1.5" />
      {kind === "column" ? data.values.map((value, index) => {
        const barWidth = Math.min(30, (width - 50) / data.values.length - 5);
        const x = 28 + index * ((width - 48) / data.values.length);
        const y = yAt(value);
        return <rect key={`${data.labels[index]}-${value}`} x={x} y={y} width={barWidth} height={plotBottom - y} rx="2" fill="#38b885" />;
      }) : (
        <>
          <polyline points={data.values.map((value, index) => `${xAt(index)},${yAt(value)}`).join(" ")} fill="none" stroke="#2879c9" strokeWidth="3" strokeLinejoin="round" />
          {data.values.map((value, index) => <circle key={`${data.labels[index]}-${value}`} cx={xAt(index)} cy={yAt(value)} r="3.5" fill="#2879c9" />)}
        </>
      )}
      {!compact ? data.labels.map((label, index) => {
        const x = kind === "column" ? 28 + index * ((width - 48) / data.values.length) + 9 : xAt(index);
        return <text key={label} x={x} y={height - 7} textAnchor="middle" fontSize="8" fontWeight="700" fill="#536b5b">{label.slice(0, 7)}</text>;
      }) : null}
    </svg>
  );
}
