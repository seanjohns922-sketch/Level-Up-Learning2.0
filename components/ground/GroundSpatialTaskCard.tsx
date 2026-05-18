"use client";

import { useMemo, useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type GroundSpatialTask = Extract<PracticeTask, { kind: "groundSpatial" }>;
type SpatialCharacter = GroundSpatialTask["characters"][number];
type SpatialSlot = GroundSpatialTask["slots"][number];

const SCENARIO_META: Record<GroundSpatialTask["scenario"], { badge: string; panel: string }> = {
  lab: { badge: "Position Lab", panel: "Lab Grid" },
  map: { badge: "Treasure Map", panel: "Map Tiles" },
  obstacle: { badge: "Obstacle Course", panel: "Obstacle Scene" },
  portal_room: { badge: "Portal Room", panel: "Portal Chamber" },
  treasure: { badge: "Treasure Hunt", panel: "Treasure Map" },
  maze: { badge: "Position Maze", panel: "Maze Grid" },
};

function GroundMiniShell({
  badge,
  prompt,
  speakText,
  children,
}: {
  badge: string;
  prompt: string;
  speakText?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[28px] border border-cyan-200/70 bg-gradient-to-br from-cyan-50 via-white to-teal-50 p-5 shadow-[0_6px_18px_rgba(13,148,136,0.08)]">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-teal-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-800">
          {badge}
        </div>
        <div className="flex items-start gap-3">
          <div className="flex-1 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">{prompt}</div>
          <ReadAloudBtn text={speakText ?? prompt} size="md" className="shrink-0" />
        </div>
      </div>
      {children}
    </div>
  );
}

function SceneToken({ character, onClick }: { character: SpatialCharacter; onClick?: () => void }) {
  const clickable = !!onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`flex h-full w-full flex-col items-center justify-center rounded-[18px] border px-2 py-2 text-center transition ${
        clickable
          ? "border-cyan-200 bg-white text-teal-900 shadow-sm hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"
          : "border-transparent bg-transparent text-teal-900"
      }`}
    >
      <div className="text-3xl sm:text-4xl">{character.emoji}</div>
      <div className="mt-1 text-[11px] font-black text-slate-700 sm:text-xs">{character.label}</div>
    </button>
  );
}

function EmptySceneSlot({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-full w-full items-center justify-center rounded-[18px] border-2 border-dashed text-xs font-black uppercase tracking-[0.16em] transition ${
        active ? "border-teal-400 bg-teal-100 text-teal-900" : "border-cyan-200 bg-white text-cyan-500 hover:border-cyan-300 hover:bg-cyan-50"
      }`}
    >
      Place
    </button>
  );
}

function buildGridMap(slots: SpatialSlot[]) {
  const byCell = new Map<string, SpatialSlot>();
  for (const slot of slots) byCell.set(`${slot.row}-${slot.col}`, slot);
  return byCell;
}

export function GroundSpatialTaskCard({ task, onCorrect, onWrong }: { task: GroundSpatialTask; onCorrect: () => void; onWrong: () => void }) {
  const scenarioMeta = SCENARIO_META[task.scenario];
  const characterMap = useMemo(() => new Map(task.characters.map((character) => [character.id, character])), [task.characters]);
  const cellMap = useMemo(() => buildGridMap(task.slots), [task.slots]);
  const [placements, setPlacements] = useState<Record<string, string | null>>(task.placementBySlot);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(task.bankCharacterIds?.[0] ?? null);

  const rows = Math.max(...task.slots.map((slot) => slot.row)) + 1;
  const cols = Math.max(...task.slots.map((slot) => slot.col)) + 1;

  const bankIds = task.bankCharacterIds ?? [];

  function assignToSlot(slotId: string) {
    if (!selectedBankId) return;
    setPlacements((current) => {
      const next = { ...current };
      for (const key of Object.keys(next)) {
        if (next[key] === selectedBankId) next[key] = null;
      }
      next[slotId] = selectedBankId;
      return next;
    });
  }

  function checkPlacement() {
    const matchesPrimary = task.targetCharacterId && task.targetSlotId ? placements[task.targetSlotId] === task.targetCharacterId : true;
    const matchesSecondary =
      task.secondaryTargetCharacterId && task.secondaryTargetSlotId
        ? placements[task.secondaryTargetSlotId] === task.secondaryTargetCharacterId
        : true;
    if (matchesPrimary && matchesSecondary) onCorrect();
    else onWrong();
  }

  function renderGrid(placement: Record<string, string | null>, interactive: boolean) {
    const cells: React.ReactNode[] = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const slot = cellMap.get(`${row}-${col}`);
        if (!slot) {
          cells.push(<div key={`blank-${row}-${col}`} className="min-h-[86px] rounded-[20px] border border-transparent" />);
          continue;
        }
        const occupantId = placement[slot.id];
        const occupant = occupantId ? characterMap.get(occupantId) ?? null : null;
        cells.push(
          <div key={slot.id} className="relative min-h-[86px] rounded-[20px] border border-cyan-200 bg-white/90 p-2 shadow-sm">
            <div className="mb-1 text-center text-[10px] font-black uppercase tracking-[0.16em] text-teal-700">{slot.label}</div>
            <div className="h-[58px]">
              {occupant ? (
                <SceneToken
                  character={occupant}
                  onClick={interactive && task.mode === "identify" ? () => (occupant.id === task.targetCharacterId ? onCorrect() : onWrong()) : undefined}
                />
              ) : task.mode === "place" ? (
                <EmptySceneSlot active={selectedBankId !== null} onClick={() => assignToSlot(slot.id)} />
              ) : null}
            </div>
          </div>
        );
      }
    }
    return (
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {cells}
      </div>
    );
  }

  return (
    <GroundMiniShell badge={task.badgeLabel ?? scenarioMeta.badge} prompt={task.prompt} speakText={task.speakText ?? task.prompt}>
      <div className="space-y-4 rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        {task.mode === "same_position" ? (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-cyan-200 bg-cyan-50/70 p-3">
              <div className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.18em] text-teal-700">Scene 1</div>
              {renderGrid(task.placementBySlot, false)}
            </div>
            <div className="rounded-[20px] border border-cyan-200 bg-cyan-50/70 p-3">
              <div className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.18em] text-teal-700">Scene 2</div>
              {renderGrid(task.secondaryPlacementBySlot ?? task.placementBySlot, false)}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([true, false] as const).map((value) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => (value === task.correctBoolean ? onCorrect() : onWrong())}
                  className="rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-5 text-xl font-black text-teal-900 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  {value ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
        ) : task.mode === "changed_position" ? (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-cyan-200 bg-cyan-50/70 p-3">
              <div className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.18em] text-teal-700">Before</div>
              {renderGrid(task.placementBySlot, false)}
            </div>
            <div className="rounded-[20px] border border-cyan-200 bg-cyan-50/70 p-3">
              <div className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.18em] text-teal-700">After</div>
              {renderGrid(task.secondaryPlacementBySlot ?? task.placementBySlot, false)}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {bankIds.map((id) => {
                const character = characterMap.get(id);
                if (!character) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => (id === task.targetCharacterId ? onCorrect() : onWrong())}
                    className="flex min-h-[96px] flex-col items-center justify-center rounded-[22px] border-2 border-cyan-200 bg-white px-3 py-3 text-center text-teal-900 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
                  >
                    <div className="text-4xl">{character.emoji}</div>
                    <div className="mt-1 text-sm font-black">{character.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : task.mode === "place" ? (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-cyan-200 bg-cyan-50/70 p-3">
              <div className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.18em] text-teal-700">{scenarioMeta.panel}</div>
              {renderGrid(placements, false)}
            </div>
            <div className="rounded-[20px] border border-cyan-200 bg-cyan-50 px-4 py-3">
              <div className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.18em] text-teal-700">Object Bank</div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {bankIds.map((id) => {
                  const character = characterMap.get(id);
                  if (!character) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedBankId(id)}
                      className={`flex min-h-[88px] flex-col items-center justify-center rounded-[22px] border-2 px-3 py-3 text-center shadow-sm transition ${
                        selectedBankId === id ? "border-teal-400 bg-teal-100 text-teal-900" : "border-cyan-200 bg-white text-teal-900 hover:border-cyan-300 hover:bg-cyan-50"
                      }`}
                    >
                      <div className="text-3xl">{character.emoji}</div>
                      <div className="mt-1 text-sm font-black">{character.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={checkPlacement}
              className="w-full rounded-[22px] bg-gradient-to-r from-teal-600 to-cyan-500 px-4 py-4 text-base font-black text-white shadow-[0_10px_24px_rgba(13,148,136,0.18)] transition hover:brightness-110"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="rounded-[20px] border border-cyan-200 bg-cyan-50/70 p-3">
            <div className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.18em] text-teal-700">{scenarioMeta.panel}</div>
            {renderGrid(task.placementBySlot, true)}
          </div>
        )}
      </div>
    </GroundMiniShell>
  );
}
