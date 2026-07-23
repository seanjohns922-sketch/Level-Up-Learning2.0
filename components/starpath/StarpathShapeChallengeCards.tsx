"use client";

import { useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { ShapeVisual, TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";

type ShapeTapAllTask = Extract<PracticeTask, { kind: "starpathShapeTapAll" }>;

// A cosmic "tap every triangle" scene. Forgiving for Ground level: wrong taps
// give a gentle in-card shake (not scored); the task completes once every item
// of the target shape has been found.
export function StarpathShapeTapAllCard({
  task,
  onComplete,
}: {
  task: ShapeTapAllTask;
  onComplete: () => void;
}) {
  const targetIds = useMemo(
    () => task.items.filter((item) => item.shape === task.targetShape).map((item) => item.id),
    [task]
  );
  const [found, setFound] = useState<Set<string>>(() => new Set());
  const [wrongId, setWrongId] = useState<string | null>(null);
  const doneRef = useRef(false);

  function tapItem(item: ShapeTapAllTask["items"][number]) {
    if (doneRef.current) return;
    if (item.shape === task.targetShape) {
      if (found.has(item.id)) return;
      const next = new Set(found);
      next.add(item.id);
      setFound(next);
      if (next.size === targetIds.length) {
        doneRef.current = true;
        setTimeout(onComplete, 380);
      }
    } else {
      setWrongId(item.id);
      setTimeout(() => setWrongId((current) => (current === item.id ? null : current)), 480);
    }
  }

  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <div className="relative overflow-hidden rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-indigo-950 via-violet-900 to-slate-950 p-4 shadow-inner sm:p-5">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "30px 30px" }}
        />
        <div className="relative mb-3 flex items-center justify-center gap-2 text-center text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
          Found {found.size} of {targetIds.length}
        </div>
        <div className="relative grid grid-cols-3 gap-3 sm:grid-cols-4">
          {task.items.map((item) => {
            const isFound = found.has(item.id);
            const isWrong = wrongId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.shape}
                onClick={() => tapItem(item)}
                className={[
                  "relative flex min-h-24 items-center justify-center rounded-2xl border-2 p-2 transition active:scale-[0.97]",
                  isFound
                    ? "border-emerald-300 bg-emerald-400/20"
                    : "border-white/25 bg-white/10 hover:-translate-y-1 hover:border-cyan-300 hover:bg-white/20",
                  isWrong ? "sp-shake border-rose-400 bg-rose-500/20" : "",
                ].join(" ")}
              >
                <ShapeVisual shape={item.shape} colour={item.colour} className="h-16 w-16 sm:h-20 sm:w-20" />
                {isFound ? (
                  <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-indigo-950 shadow">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes sp-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        .sp-shake { animation: sp-shake 0.42s ease-in-out; }
        @media (prefers-reduced-motion: reduce) { .sp-shake { animation: none; } }
      `}</style>
    </div>
  );
}
