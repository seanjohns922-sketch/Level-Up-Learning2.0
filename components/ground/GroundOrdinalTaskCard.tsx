"use client";

import { useEffect, useMemo, useState } from "react";
import OptionReadAloudButton from "@/components/OptionReadAloudButton";
import ReadAloudBtn from "@/components/ReadAloudBtn";
import type { PracticeTask } from "@/data/activities/year1/practice-task";

type GroundOrdinalTask = Extract<PracticeTask, { kind: "groundOrdinal" }>;
type OrdinalCharacter = GroundOrdinalTask["characters"][number];

type RacePhase = "intro" | "running" | "done";

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
  disabled = false,
}: {
  character: OrdinalCharacter;
  index: number;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const Element = onClick ? "button" : "div";
  return (
    <Element
      type={onClick ? "button" : undefined}
      onClick={disabled ? undefined : onClick}
      className={`flex min-h-[102px] flex-col items-center justify-center rounded-[22px] border-2 px-3 py-3 text-center shadow-sm transition ${
        onClick && !disabled
          ? "border-cyan-200 bg-white text-teal-900 hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-50"
          : "border-cyan-200 bg-white text-teal-900"
      } ${disabled ? "opacity-75" : ""}`}
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

function NexusRaceTrack({
  characters,
  displayOrder,
  finalOrder,
  phase,
  onSkip,
}: {
  characters: Map<string, OrdinalCharacter>;
  displayOrder: Array<string | null>;
  finalOrder: Array<string | null>;
  phase: RacePhase;
  onSkip: () => void;
}) {
  const lanes = finalOrder.filter(Boolean) as string[];
  const N = Math.max(lanes.length, 1);
  const complete = phase === "done";

  // progress 0..1 from start to finish line, based on current rank in displayOrder
  function progressFor(id: string) {
    const rank = displayOrder.findIndex((x) => x === id);
    if (rank < 0) return 0;
    // 1st place => 1.0, last => ~0.15 so they're still on track
    const leaderPct = 0.92;
    const tailPct = 0.18;
    if (N === 1) return leaderPct;
    const t = 1 - rank / (N - 1);
    return tailPct + (leaderPct - tailPct) * t;
  }

  const statusText =
    phase === "intro" ? "Ready... Set... GO!" : phase === "running" ? "Racing!" : "Photo finish!";

  return (
    <div
      className="relative overflow-hidden rounded-[24px] p-4 shadow-[0_10px_30px_rgba(13,148,136,0.18)]"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 0%, #0f3a3a 0%, #0a2424 55%, #061818 100%)",
        border: "1px solid rgba(56,230,200,0.35)",
      }}
    >
      {/* Scanline / grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56,230,200,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(56,230,200,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px, 28px 28px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-48 w-[140%] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(closest-side, rgba(56,230,200,0.25), transparent 70%)" }}
      />

      <div className="relative mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
          Nexus Race Grid
        </div>
        {!complete ? (
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full border border-cyan-300/40 bg-black/30 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100 hover:bg-black/50"
          >
            Skip ▶▶
          </button>
        ) : (
          <div className="rounded-full border border-amber-300/50 bg-amber-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">
            🏁 Finished
          </div>
        )}
      </div>

      <div
        className={`relative mb-3 rounded-full px-4 py-2 text-center text-sm font-black tracking-wide ${
          phase === "intro"
            ? "bg-amber-400/15 text-amber-200 border border-amber-300/30"
            : phase === "running"
              ? "bg-cyan-400/10 text-cyan-100 border border-cyan-300/30"
              : "bg-emerald-400/15 text-emerald-100 border border-emerald-300/30"
        }`}
      >
        {statusText}
      </div>

      {/* Lanes */}
      <div className="relative space-y-2.5">
        {lanes.map((id, laneIdx) => {
          const character = characters.get(id);
          if (!character) return null;
          const pct = progressFor(id) * 100;
          const finalRank = finalOrder.findIndex((x) => x === id);
          const medal =
            complete && finalRank === 0 ? "🥇" : complete && finalRank === 1 ? "🥈" : complete && finalRank === 2 ? "🥉" : null;
          return (
            <div
              key={id}
              className="relative h-14 rounded-xl"
              style={{
                background:
                  "linear-gradient(90deg, rgba(8,30,30,0.7) 0%, rgba(8,30,30,0.4) 100%)",
                border: "1px solid rgba(56,230,200,0.18)",
              }}
            >
              {/* Lane number */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-black tracking-[0.18em] text-cyan-300/70">
                L{laneIdx + 1}
              </div>

              {/* Dashed track */}
              <div
                aria-hidden
                className="absolute left-9 right-12 top-1/2 h-[3px] -translate-y-1/2 rounded-full"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(56,230,200,0.5) 0 10px, transparent 10px 18px)",
                }}
              />

              {/* Finish line (checkered) */}
              <div
                aria-hidden
                className="absolute right-2 top-1 bottom-1 w-6 rounded-md"
                style={{
                  backgroundImage:
                    "repeating-conic-gradient(#fff 0 25%, #0a0a0a 0 50%)",
                  backgroundSize: "10px 10px",
                  boxShadow: "0 0 14px rgba(56,230,200,0.6)",
                }}
              />

              {/* Racer token */}
              <div
                className="absolute top-1/2 -translate-y-1/2"
                style={{
                  left: `calc(${pct}% - 22px)`,
                  transition: "left 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                  filter: complete && finalRank === 0 ? "drop-shadow(0 0 10px rgba(255,215,80,0.9))" : "drop-shadow(0 4px 6px rgba(0,0,0,0.5))",
                }}
              >
                <div
                  className="relative flex h-11 w-11 items-center justify-center rounded-full text-2xl"
                  style={{
                    background: "linear-gradient(180deg, #fff 0%, #d6fff5 100%)",
                    border: "2px solid rgba(56,230,200,0.85)",
                    boxShadow: "0 0 14px rgba(56,230,200,0.55), inset 0 1px 0 rgba(255,255,255,0.8)",
                  }}
                >
                  <span>{character.emoji}</span>
                  {/* Speed streaks while running */}
                  {phase === "running" ? (
                    <span
                      aria-hidden
                      className="absolute right-full top-1/2 mr-1 h-1 w-6 -translate-y-1/2 rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(56,230,200,0.85))",
                        filter: "blur(1px)",
                      }}
                    />
                  ) : null}
                  {medal ? (
                    <span className="absolute -top-2 -right-2 text-base drop-shadow">{medal}</span>
                  ) : null}
                </div>
                <div className="mt-0.5 text-center text-[10px] font-black uppercase tracking-wider text-cyan-100/90">
                  {character.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/70">
        <span>◀ Start</span>
        <span>Finish 🏁</span>
      </div>
    </div>
  );
}

export function GroundOrdinalTaskCard({ task, onCorrect, onWrong }: { task: GroundOrdinalTask; onCorrect: () => void; onWrong: () => void }) {
  const scenarioMeta = SCENARIO_META[task.scenario];
  const characterMap = useMemo(() => new Map(task.characters.map((character) => [character.id, character])), [task.characters]);
  const hasRaceAnimation = !!task.raceStartOrder?.length;
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);
  const [revealed, setRevealed] = useState(true);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(task.targetCharacterId ?? null);
  const [placements, setPlacements] = useState<Array<string | null>>(task.order);
  const [racePhase, setRacePhase] = useState<RacePhase>(hasRaceAnimation ? "intro" : "done");
  const [displayOrder, setDisplayOrder] = useState<Array<string | null>>(task.raceStartOrder ?? task.order);

  useEffect(() => {
    if (!task.revealMs) return;
    const timeout = window.setTimeout(() => setRevealed(false), task.revealMs);
    return () => window.clearTimeout(timeout);
  }, [task.revealMs]);

  useEffect(() => {
    if (!hasRaceAnimation || !task.raceStartOrder) return;
    const frames = [task.raceStartOrder, ...(task.raceProgressOrders ?? []), task.order];
    const duration = prefersReducedMotion ? 1200 : Math.min(10000, Math.max(5000, task.raceDurationMs ?? 6500));
    const introMs = prefersReducedMotion ? 250 : 1100;
    const frameStep = Math.max(450, Math.floor((duration - introMs) / Math.max(1, frames.length - 1)));
    const timeouts: number[] = [];

    timeouts.push(window.setTimeout(() => {
      setRacePhase("running");
      frames.forEach((frame, index) => {
        timeouts.push(window.setTimeout(() => setDisplayOrder(frame), index * frameStep));
      });
      timeouts.push(window.setTimeout(() => {
        setDisplayOrder(task.order);
        setRacePhase("done");
      }, (frames.length - 1) * frameStep + 120));
    }, introMs));

    return () => timeouts.forEach((timeout) => window.clearTimeout(timeout));
  }, [hasRaceAnimation, prefersReducedMotion, task.order, task.raceDurationMs, task.raceProgressOrders, task.raceStartOrder]);

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

  const positionAnswer = useMemo(() => {
    if (task.mode !== "which_place" || !task.targetCharacterId) return null;
    const index = task.order.findIndex((id) => id === task.targetCharacterId);
    return index >= 0 ? index + 1 : null;
  }, [task]);

  const placementTargets = useMemo(
    () => [
      task.targetCharacterId ? { id: task.targetCharacterId, position: task.targetPosition ?? 1 } : null,
      task.secondaryTargetCharacterId ? { id: task.secondaryTargetCharacterId, position: task.secondaryTargetPosition ?? task.order.length } : null,
    ].filter(Boolean) as Array<{ id: string; position: number }>,
    [task]
  );

  const placementBank = useMemo(() => {
    const explicitIds = task.characters.map((character) => character.id);
    const orderIds = task.order.filter((id): id is string => Boolean(id));
    const targetIds = placementTargets.map((target) => target.id);
    return Array.from(new Set([...explicitIds, ...orderIds, ...targetIds]))
      .map((id) => characterMap.get(id))
      .filter(Boolean) as OrdinalCharacter[];
  }, [characterMap, placementTargets, task.characters, task.order]);

  const raceComplete = racePhase === "done";
  const shellPrompt = hasRaceAnimation && !raceComplete ? task.introPrompt ?? "Watch the racers." : task.prompt;
  const shellSpeakText = hasRaceAnimation && !raceComplete ? task.introPrompt ?? "Watch the racers." : task.speakText ?? task.prompt;

  function handleTapCharacter(characterId: string) {
    if (!raceComplete) return;
    if (characterId === answerId) onCorrect();
    else onWrong();
  }

  function assignToSlot(index: number) {
    if (!selectedCharacterId || !raceComplete) return;
    setPlacements((current) => {
      const next = current.map((value) => (value === selectedCharacterId ? null : value));
      next[index] = selectedCharacterId;
      return next;
    });
  }

  function checkPlacement() {
    if (!raceComplete) return;
    const isCorrect = placementTargets.every((target) => placements[target.position - 1] === target.id);
    if (isCorrect) onCorrect();
    else onWrong();
  }

  function skipRace() {
    setDisplayOrder(task.order);
    setRacePhase("done");
  }

  function renderLine(order: Array<string | null>, interactive: boolean) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {order.map((characterId, index) => {
          const character = characterId ? characterMap.get(characterId) ?? null : null;
          if (!character) {
            return <EmptySlot key={`empty-${index}`} index={index} selected={selectedCharacterId !== null} onClick={() => assignToSlot(index)} />;
          }
          return (
            <div key={`${character.id}-${index}`} className="relative">
              <CharacterToken character={character} index={index} onClick={interactive ? () => handleTapCharacter(character.id) : undefined} disabled={!raceComplete} />
              <OptionReadAloudButton text={character.label} className="absolute right-2 top-2 z-10" />
            </div>
          );
        })}
      </div>
    );
  }

  const flashOptions = !revealed && task.revealMs ? task.order.filter(Boolean).map((id) => characterMap.get(id!)).filter(Boolean) as OrdinalCharacter[] : [];

  return (
    <GroundMiniShell badge={task.badgeLabel ?? scenarioMeta.badge} prompt={shellPrompt} speakText={shellSpeakText}>
      <div className="rounded-[24px] border border-cyan-200 bg-white p-4 shadow-sm space-y-4">
        {hasRaceAnimation ? (
          <NexusRaceTrack
            characters={characterMap}
            displayOrder={displayOrder}
            finalOrder={task.order}
            phase={racePhase}
            onSkip={skipRace}
          />
        ) : null}

        {task.mode === "same_position" ? (
          <div className="space-y-4">
            {!hasRaceAnimation ? <div className="rounded-[20px] border border-cyan-200 bg-cyan-50/70 p-3">{renderLine(task.order, false)}</div> : null}
            <div className="rounded-[20px] border border-cyan-200 bg-cyan-50/70 p-3">{renderLine(task.secondaryOrder ?? task.order, false)}</div>
            <div className="grid grid-cols-2 gap-3">
              {([true, false] as const).map((value) => (
                <div key={String(value)} className="relative">
                  <button type="button" disabled={!raceComplete} onClick={() => (value === task.correctBoolean ? onCorrect() : onWrong())} className="w-full rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-5 text-xl font-black text-teal-900 shadow-sm transition enabled:hover:border-cyan-300 enabled:hover:bg-cyan-50 disabled:opacity-60">
                    {value ? "Yes" : "No"}
                  </button>
                  <OptionReadAloudButton text={value ? "Yes" : "No"} className="absolute right-3 top-3 z-10" />
                </div>
              ))}
            </div>
          </div>
        ) : task.mode === "which_place" ? (
          <div className="space-y-4">
            {!hasRaceAnimation ? <div className="rounded-[20px] border border-cyan-200 bg-cyan-50/70 p-3">{renderLine(task.order, false)}</div> : null}
            <div className="grid grid-cols-3 gap-3">
              {(task.positionOptions ?? [1, 2, 3]).map((value) => (
                <div key={value} className="relative">
                  <button type="button" disabled={!raceComplete} onClick={() => (value === positionAnswer ? onCorrect() : onWrong())} className="w-full rounded-[22px] border-2 border-cyan-200 bg-white px-4 py-5 text-xl font-black text-teal-900 shadow-sm transition enabled:hover:border-cyan-300 enabled:hover:bg-cyan-50 disabled:opacity-60">
                    {ordinalWord(value)}
                  </button>
                  <OptionReadAloudButton text={ordinalWord(value)} className="absolute right-3 top-3 z-10" />
                </div>
              ))}
            </div>
          </div>
        ) : task.mode === "place" ? (
          <div className="space-y-4">
            {!hasRaceAnimation ? renderLine(placements, false) : null}
            <div className="rounded-[20px] border border-cyan-200 bg-cyan-50 px-4 py-3">
              <div className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.18em] text-teal-700">Character Bank</div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {placementBank.map((character, index) => (
                  <div key={`${character.id}-${index}`} className="relative">
                    <button type="button" disabled={!raceComplete} onClick={() => setSelectedCharacterId(character.id)} className={`flex min-h-[88px] w-full flex-col items-center justify-center rounded-[22px] border-2 px-3 py-3 text-center shadow-sm transition ${selectedCharacterId === character.id ? "border-teal-400 bg-teal-100 text-teal-900" : "border-cyan-200 bg-white text-teal-900 enabled:hover:border-cyan-300 enabled:hover:bg-cyan-50"} disabled:opacity-60`}>
                      <div className="text-3xl">{character.emoji}</div>
                      <div className="mt-1 text-sm font-black">{character.label}</div>
                    </button>
                    <OptionReadAloudButton text={character.label} className="absolute right-3 top-3 z-10" />
                  </div>
                ))}
              </div>
            </div>
            <button type="button" disabled={!raceComplete} onClick={checkPlacement} className="w-full rounded-[22px] bg-gradient-to-r from-teal-600 to-cyan-500 px-4 py-4 text-base font-black text-white shadow-[0_10px_24px_rgba(13,148,136,0.18)] transition enabled:hover:brightness-110 disabled:opacity-60">
              Done
            </button>
          </div>
        ) : !revealed && flashOptions.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-[20px] border border-cyan-200 bg-cyan-50 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-teal-700">Which one was in that position?</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {flashOptions.map((character, index) => (
                <div key={`${character.id}-${index}`} className="relative">
                  <button type="button" disabled={!raceComplete} onClick={() => handleTapCharacter(character.id)} className="flex min-h-[102px] w-full flex-col items-center justify-center rounded-[22px] border-2 border-cyan-200 bg-white px-3 py-3 text-center text-teal-900 shadow-sm transition enabled:hover:border-cyan-300 enabled:hover:bg-cyan-50 disabled:opacity-60">
                    <div className="text-4xl">{character.emoji}</div>
                    <div className="mt-1 text-sm font-black">{character.label}</div>
                  </button>
                  <OptionReadAloudButton text={character.label} className="absolute right-3 top-3 z-10" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          !hasRaceAnimation ? renderLine(task.order, true) : <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{task.order.filter(Boolean).map((id, index) => { const character = characterMap.get(id!); if (!character) return null; return <div key={`${character.id}-${index}`} className="relative"><CharacterToken character={character} index={index} onClick={() => handleTapCharacter(character.id)} disabled={!raceComplete} /><OptionReadAloudButton text={character.label} className="absolute right-2 top-2 z-10" /></div>; })}</div>
        )}
      </div>
    </GroundMiniShell>
  );
}
