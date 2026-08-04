"use client";

import { useState } from "react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type ObjectTask = Extract<PracticeTask, { kind: "starpathObject" }>;

const OBJ_STYLE = (
  <style>{`
    @keyframes sp-obj-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
    .sp-obj-shake { animation: sp-obj-shake 0.4s ease-in-out; }
    @media (prefers-reduced-motion: reduce) { .sp-obj-shake { animation: none; } }
  `}</style>
);

function ObjectArt({ svg, className }: { svg: string; className?: string }) {
  return <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function StarpathObjectCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: ObjectTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [wrongId, setWrongId] = useState<string | null>(null);

  function miss(id: string) {
    setWrongId(id);
    setTimeout(() => setWrongId((v) => (v === id ? null : v)), 420);
    onWrong();
  }

  // ── name: one object shown, choose its name from text options ──
  if (task.mode === "name") {
    const obj = task.scene[0];
    return (
      <div>
        <TaskHeading prompt={task.prompt} speech={task.speakText} />
        <div className="mx-auto mb-6 flex w-40 items-center justify-center rounded-3xl border-2 border-violet-200 bg-white p-4 shadow-sm sm:w-48">
          {obj ? <ObjectArt svg={obj.svg} className="block h-28 w-28 sm:h-32 sm:w-32 [&>svg]:h-full [&>svg]:w-full" /> : null}
        </div>
        <div className="mx-auto grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-3">
          {(task.options ?? []).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => (option.id === task.correctOptionId ? onCorrect() : miss(option.id))}
              className={[
                "relative flex min-h-16 items-center justify-center rounded-2xl border-2 px-4 text-center shadow-sm transition active:scale-[0.98]",
                wrongId === option.id
                  ? "sp-obj-shake border-rose-400 bg-rose-50"
                  : "border-violet-200 bg-white hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg",
              ].join(" ")}
            >
              <span className="text-base font-black text-indigo-950">{option.label}</span>
              <OptionReadAloudButton text={option.label} className="absolute right-2 top-1/2 -translate-y-1/2" />
            </button>
          ))}
        </div>
        {OBJ_STYLE}
      </div>
    );
  }

  // ── compare: two objects shown, choose the true statement about them ──
  if (task.mode === "compare") {
    return (
      <div>
        <TaskHeading prompt={task.prompt} speech={task.speakText} />
        <div className="mx-auto mb-6 flex items-center justify-center gap-4">
          {task.scene.map((obj) => (
            <div key={obj.id} className="flex w-32 flex-col items-center gap-1 rounded-2xl border-2 border-violet-200 bg-white p-3 shadow-sm">
              <ObjectArt svg={obj.svg} className="block h-20 w-20 sm:h-24 sm:w-24 [&>svg]:h-full [&>svg]:w-full" />
              {obj.spaceName ? <span className="text-[11px] font-bold text-slate-500">{obj.spaceName}</span> : null}
            </div>
          ))}
        </div>
        <div className="mx-auto grid max-w-lg grid-cols-1 gap-3">
          {(task.options ?? []).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => (option.id === task.correctOptionId ? onCorrect() : miss(option.id))}
              className={[
                "relative flex min-h-14 items-center justify-center rounded-2xl border-2 px-5 text-center shadow-sm transition active:scale-[0.98]",
                wrongId === option.id
                  ? "sp-obj-shake border-rose-400 bg-rose-50"
                  : "border-violet-200 bg-white hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg",
              ].join(" ")}
            >
              <span className="text-base font-black text-indigo-950">{option.label}</span>
              <OptionReadAloudButton text={option.label} className="absolute right-2 top-1/2 -translate-y-1/2" />
            </button>
          ))}
        </div>
        {OBJ_STYLE}
      </div>
    );
  }

  // ── find: a scene of objects, tap the named one ──
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3">
        {task.scene.map((obj) => (
          <button
            key={obj.id}
            type="button"
            aria-label={obj.label}
            onClick={() => (obj.id === task.correctObjectId ? onCorrect() : miss(obj.id))}
            className={[
              "flex min-h-32 flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-white p-3 shadow-sm transition active:scale-95",
              wrongId === obj.id
                ? "sp-obj-shake border-rose-400 bg-rose-50"
                : "border-violet-200 hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg",
            ].join(" ")}
          >
            <ObjectArt svg={obj.svg} className="block h-20 w-20 sm:h-24 sm:w-24 [&>svg]:h-full [&>svg]:w-full" />
            {obj.reason ? (
              <span className="text-xs font-bold text-indigo-950">{obj.reason}</span>
            ) : obj.spaceName ? (
              <span className="text-[11px] font-bold text-slate-500">{obj.spaceName}</span>
            ) : null}
            {obj.reason ? <OptionReadAloudButton text={obj.reason} className="absolute right-1.5 top-1.5" /> : null}
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-sm font-semibold text-slate-600">Tap the object.</p>
      {OBJ_STYLE}
    </div>
  );
}
