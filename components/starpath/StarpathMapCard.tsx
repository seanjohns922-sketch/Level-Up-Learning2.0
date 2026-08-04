"use client";

import { useState } from "react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import { TaskHeading } from "@/components/starpath/StarpathShapeTaskCard";
import { PositionObjectVisual } from "@/components/starpath/StarpathPositionCards";
import { DirectionGrid, GridMarker } from "@/components/starpath/StarpathDirectionCards";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type MapTask = Extract<PracticeTask, { kind: "starpathMapLocate" }>;

const MAP_STYLE = (
  <style>{`
    @keyframes sp-map-shake { 0%,100%{transform:translate(-50%,-50%)} 25%{transform:translate(calc(-50% - 4px),-50%)} 75%{transform:translate(calc(-50% + 4px),-50%)} }
    .sp-map-shake { animation: sp-map-shake 0.36s ease-in-out; }
    @media (prefers-reduced-motion: reduce) { .sp-map-shake { animation: none; } }
  `}</style>
);

// Small decorative compass so the grid reads as a real map. Purely visual — no
// coordinate system (grid references are a later-year skill).
function MapCompass() {
  return (
    <div
      aria-hidden="true"
      className="absolute right-1.5 top-1.5 z-30 flex h-7 w-7 flex-col items-center justify-center rounded-full border border-cyan-200/40 bg-slate-900/45 shadow sm:h-8 sm:w-8"
    >
      <span className="text-[6px] font-black leading-none text-amber-300 sm:text-[7px]">N</span>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true">
        <path d="M12 3l3 9h-6z" fill="#fca5a5" />
        <path d="M12 21l-3-9h6z" fill="#67e8f9" />
      </svg>
    </div>
  );
}

function MapView({
  task,
  onLandmarkTap,
  wrongId,
}: {
  task: MapTask;
  onLandmarkTap?: (id: string) => void;
  wrongId?: string | null;
}) {
  return (
    <DirectionGrid cols={task.cols} rows={task.rows}>
      <MapCompass />
      {task.highlight ? (
        <GridMarker cell={task.highlight} cols={task.cols} rows={task.rows} z={4}>
          <span className="h-4/5 w-4/5 rounded-xl border-2 border-dashed border-amber-300 bg-amber-300/20" />
        </GridMarker>
      ) : null}
      {task.landmarks.map((landmark) => {
        const tappable = Boolean(onLandmarkTap);
        const symbol = task.legend?.find((item) => item.landmarkId === landmark.id)?.symbol;
        const inner = (
          <div className="flex h-full w-full flex-col items-center justify-center gap-0.5">
            {task.mode === "symbol" && symbol ? (
              <span className="text-xl font-black text-amber-200 sm:text-2xl" aria-label="Map symbol">{symbol}</span>
            ) : (
              <><PositionObjectVisual objectId={landmark.object} className="h-3/5 w-3/5" /><span className="max-w-full truncate px-0.5 text-[7px] font-black leading-tight text-cyan-100 sm:text-[8px]">{landmark.label}</span></>
            )}
          </div>
        );
        return (
          <GridMarker key={landmark.id} cell={landmark} cols={task.cols} rows={task.rows} z={10}>
            {tappable ? (
              <button
                type="button"
                aria-label={landmark.label}
                onClick={() => onLandmarkTap?.(landmark.id)}
                className={[
                  "flex h-[92%] w-[92%] items-center justify-center rounded-xl border-2 transition active:scale-95",
                  wrongId === landmark.id
                    ? "sp-map-shake border-rose-400 bg-rose-500/20"
                    : "border-white/20 bg-white/5 hover:border-cyan-300 hover:bg-white/15",
                ].join(" ")}
              >
                {inner}
              </button>
            ) : (
              inner
            )}
          </GridMarker>
        );
      })}
    </DirectionGrid>
  );
}

function MapKey({ task }: { task: MapTask }) {
  if (!task.legend?.length) return null;
  return (
    <div className="mx-auto mb-3 max-w-3xl border-2 border-cyan-200 bg-cyan-50 px-3 py-2 shadow-sm">
      <div className="mb-1 text-xs font-black uppercase text-cyan-900">Map key</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
        {task.legend.map((item) => (
          <div key={item.landmarkId} className="flex min-w-0 items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-cyan-300 bg-white text-lg" aria-hidden="true">{item.symbol}</span>
            <span className="truncate text-xs font-bold text-indigo-950">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StarpathMapCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: MapTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const [wrongId, setWrongId] = useState<string | null>(null);

  function tapLandmark(id: string) {
    if (id === task.correctLandmarkId) {
      onCorrect();
    } else {
      setWrongId(id);
      setTimeout(() => setWrongId((v) => (v === id ? null : v)), 420);
      onWrong();
    }
  }

  // Find mode: tap the landmark directly on the map.
  if (task.mode === "find") {
    return (
      <div>
        <TaskHeading prompt={task.prompt} speech={task.speakText} />
        <MapKey task={task} />
        <div className="mx-auto max-w-3xl">
          <MapView task={task} onLandmarkTap={tapLandmark} wrongId={wrongId} />
        </div>
        <p className="mt-3 text-center text-sm font-semibold text-slate-600">Tap the place on the map.</p>
        {MAP_STYLE}
      </div>
    );
  }

  // What-is-here / relative / clues: read the map, then choose from options.
  return (
    <div>
      <TaskHeading prompt={task.prompt} speech={task.speakText} />
      <MapKey task={task} />
      <div className="mx-auto max-w-3xl">
        <MapView task={task} />
      </div>
      {task.clues && task.clues.length > 0 ? (
        <div className="mx-auto mt-5 grid max-w-lg gap-2">
          {task.clues.map((clue, index) => (
            <div key={index} className="relative flex items-center gap-2 rounded-2xl border-2 border-cyan-200 bg-cyan-50 px-4 py-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-xs font-black text-white">{index + 1}</span>
              <span className="flex-1 text-sm font-bold text-indigo-950 sm:text-base">{clue}</span>
              <OptionReadAloudButton text={clue} />
            </div>
          ))}
        </div>
      ) : null}
      <div className="mx-auto mt-5 grid max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
        {(task.options ?? []).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => (option.id === task.correctOptionId ? onCorrect() : onWrong())}
            className="relative flex min-h-14 items-center justify-center rounded-2xl border-2 border-violet-200 bg-white px-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:scale-[0.98]"
          >
            <span className="text-base font-black text-indigo-950">{option.label}</span>
            <OptionReadAloudButton text={option.label} className="absolute right-2 top-1/2 -translate-y-1/2" />
          </button>
        ))}
      </div>
      {MAP_STYLE}
    </div>
  );
}
