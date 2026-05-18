"use client";

import { useEffect, useMemo, useState } from "react";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type GroundOrdinalTask = Extract<PracticeTask, { kind: "groundOrdinal" }>;

type OrdinalCharacter = GroundOrdinalTask["characters"][number];

const SCENARIO_META: Record<GroundOrdinalTask["scenario"], { badge: string; icon: string; panel: string }> = {
  line: { badge: "Line Up", icon: "🧩", panel: "Position Line" },
  race: { badge: "Race Track", icon: "🏁", panel: "Race Order" },
  train: { badge: "Train Order", icon: "🚂", panel: "Carriage Line" },
  podium: { badge: "Podium Places", icon: "🥇", panel: "Podium" },
  rockets: { badge: "Rocket Order", icon: "🚀", panel: "Launch Line" },
  queue: { badge: "Queue", icon: "✨", panel: "Queue Order" },
  stepping_stones: { badge: "Stepping Stones", icon: "🪨", panel: "Stone Path" },
};

function ordinalWord(value: number) {
  return ["zero", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"][value] ?? `${value}th`;
}

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

function CharacterToken({
  character,
  index,
  onClick,
  subtle = false,
}: {
  character: OrdinalCharacter;
  index: number;
  onClick?: () => void;
  subtle?: boolean;
}) {
  const Element = onClick ? "button" : "div";
  return (
    <Element
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex min-h-[102px] flex-col items-center justify-center rounded-[22px] border-2 px-3 py-3 text-center shadow-sm transition ${
        subtle
          ? "border-cyan-100 bg-cyan-50/70 text-slate-500"
          : onClick
            ? "border-cyan-200 bg-white text-teal-900 hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"
            : "border-cyan-200 bg-white text-teal-900"
      }`}
    >
      <div className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-700">{ordinalWord(index + 1)}</div>
      <div className="text-4xl">{character.emoji}</div>
      <div className="mt-1 text-sm font-black text-slate-700">{character.label}</div>
    </Element>
  );
}

function EmptySlot({ index, selected, onClick }: { index: number; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[102px] flex-col items-center justify-center rounded-[22px] border-2 border-dashed px-3 py-3 text-center shadow-sm transition ${
        selected
          ? "border-teal-400 bg-teal-100 text-teal-900"
          : "border-cyan-200 bg-white text-cyan-500 hover:border-cyan-300 hover:bg-cyan-50"
      }`}
    >
      <div className="mb-1 text-[11px] font-black uppercase tracking-[0.18em] text-teal-700">{ordinalWord(index + 1)}</div>
      <div className="text-3xl">?</div>
      <div className="mt-1 text-xs font-black uppercase tracking-[0.16em]">Place here</div>
    </button>
  );
}

export function GroundOrdinalTaskCard({
  task,
  onCorrect,
  onWrong,
}: {
  task: GroundOrdinalTask;
  onCorrect: () => void;
  onWrong: () => void;
}) {
  const scenarioMeta = SCENARIO_META[task.scenario];
  const characterMap = useMemo(() => new Map(task.characters.map((character) => [character.id, character])), [task.characters]);
  const [revealed, setRevealed] = useState(true);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(task.targetCharacterId ?? null);
  const [placements, setPlacements] = useState<Array<string | null>>(task.order);

  useEffect(() => {
    if (!task.revealMs) return;
    const timeout = window.setTimeout(() => setRevealed(false), task.revealMs);
    return () => window.clearTimeout(timeout);
  }, [task.revealMs]);

  const answerId = useMemo(() => {
    if (task.mode === "identify") {
      if (!task.targetPosition) return null;
      return task.order[task.targetPosition - 1] ?? null;
    }
    if (task.mode === "relative") {
      if (!task.referenceCharacterId || !task.relation) return null;
      const index = task.order.findIndex((id) => id === task.referenceCharacterId);
      if (index < 0) return null;
      const nextIndex = task.relation === "before" ? index - 1 : index + 1;
      return task.order[nextIndex] ?? null;
    }
    return null;
  }, [task]);

  const placementTargets = useMemo(
    () => [
      task.targetCharacterId ? { id: task.targetCharacterId, position: task.targetPosition ?? 1 } : null,
      task.secondaryTargetCharacterId ? { id: task.secondaryTargetCharacterId, position: task.secondaryTargetPosition ?? task.order.length } : null,
    ].filter(Boolean) as Array<{ id: string; position: number }>,
    [task]
  );

  function handleTapCharacter(characterId: string) {
    if (characterId === answerId) onCorrect();
    else onWrong();
  }

  function assignToSlot(index: number) {
    if (!selectedCharacterId) return;
    setPlacements((current) => {
      const next = current.map((value) => (value === selectedCharacterId ? null : value));
      next[index] = selectedCharacterId;
      return next;
    });
  }

  function checkPlacement() {
    const isCorrect = placementTargets.every((target) => placements[target.position - 1] === target.id);
    if (isCorrect) onCorrect();
    else onWrong();
  }

  function renderLine(order: Array<string | null>, interactive: boolean) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {order.map((characterId, index) => {
          const character = characterId ? characterMap.get(characterId) ?? null : null;
          if (!character) {
            return (
              <EmptySlot
                key={`empty-${index}`}
                index={index}
                selected={selectedCharacterId !== null}
                onClick={() => assignToSlot(index)}
              />
            );
          }
          return (
            <CharacterToken
              key={`${character.id}-${index}`}
              character={character}
              index={index}
              onClick={interactive ? () => handleTapCharacter(character.id) : undefined}
            />
          );
        })}
      </div>
    );
  }

  const flashOptions = !revealed && task.revealMs ? task.order.filter(Boolean).map((id) => characterMap.get(id!)).filter(Boolean) as OrdinalCharacter[] : [];
  const referenceCharacter = task.referenceCharacterId ? characterMap.get(task.referenceCharacterId) : null;
  const targetCharacter = task.targetCharacterId ? characterMap.get(task.targetCharacterId) : null;

  return (
    <GroundMiniShell badge={task.badgeLabel ?? scenarioMeta.badge} prompt={task.prompt} speakText={task.speakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm">
        <div className="mb-4 rounded-[20px] border border-cyan-200 bg-cyan-50 px-4 py-3 text-center shadow-sm">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-teal-700">{scenarioMeta.panel}</div>
          <div className="mt-2 flex items-center justify-center gap-3 text-base font-black text-teal-900 sm:text-lg">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-teal-300 bg-white text-2xl shadow-sm">{scenarioMeta.icon}</span>
            {task.mode === "relative" && referenceCharacter ? (
              <span>{task.relation === "before" ? "Before" : "After"} {referenceCharacter.label}</span>
            ) : task.mode === "place" && targetCharacter ? (
              <span>Place {targetCharacter.label}</span>
            ) : (
              <span>Find the position</span>
            )}
          </div>
        </div>

        {task.mode === "same_position" ? (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-cyan-200 bg-cyan-50/70 p-3">{renderLine(task.order, false)}</div>
            <div className="rounded-[20px] border border-cyan-200 bg-cyan-50/70 p-3">{renderLine(task.secondaryOrder ?? task.order, false)}</div>
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
        ) : task.mode === "place" ? (
          <div className="space-y-4">
            {renderLine(placements, false)}
            <div className="rounded-[20px] border border-cyan-200 bg-cyan-50 px-4 py-3">
              <div className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.18em] text-teal-700">Character Bank</div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {placementTargets.map(({ id }, index) => {
                  const character = characterMap.get(id)!;
                  return (
                    <button
                      key={`${id}-${index}`}
                      type="button"
                      onClick={() => setSelectedCharacterId(id)}
                      className={`flex min-h-[88px] flex-col items-center justify-center rounded-[22px] border-2 px-3 py-3 text-center shadow-sm transition ${
                        selectedCharacterId === id
                          ? "border-teal-400 bg-teal-100 text-teal-900"
                          : "border-cyan-200 bg-white text-teal-900 hover:border-cyan-300 hover:bg-cyan-50"
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
        ) : !revealed && flashOptions.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-cyan-200 bg-cyan-50 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-teal-700">
              Which one was in that position?
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {flashOptions.map((character, index) => (
                <button
                  key={`${character.id}-${index}`}
                  type="button"
                  onClick={() => handleTapCharacter(character.id)}
                  className="flex min-h-[102px] flex-col items-center justify-center rounded-[22px] border-2 border-cyan-200 bg-white px-3 py-3 text-center text-teal-900 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <div className="text-4xl">{character.emoji}</div>
                  <div className="mt-1 text-sm font-black">{character.label}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          renderLine(task.order, true)
        )}
      </div>
    </GroundMiniShell>
  );
}
