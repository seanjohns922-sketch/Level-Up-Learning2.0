"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { levelLabelForYear } from "@/lib/level-catalog";
import { getRealmDefinition } from "@/lib/realms/realm-registry";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { supabase } from "@/lib/supabase";

/** Daily quests, the accuracy bonus and week / level bonuses. The server decides and pays everything
 *  (migration 20261127130000_xp_quests_and_milestones.sql); these constants only describe it on screen. */
export const QUEST_ALL_BONUS_XP = 50;
export const ACCURACY_XP = { perfect: 20, good: 10 } as const;
export const WEEK_CLEARED_XP = 100;
export const LEVEL_CLEARED_XP = 1000;

export type QuestId = "lesson" | "two_lessons" | "sharp_lesson" | "two_realms" | "battle" | "rex" | "build";
export type Quest = { id: QuestId; progress: number; target: number; xp: number; done: boolean };
export type XpAward =
  | { kind: "quest"; quest: QuestId; xp: number }
  | { kind: "quests_all"; xp: number }
  | { kind: "accuracy"; xp: number; perfect: boolean }
  | { kind: "week"; xp: number; realm: string; level: string; week: number }
  | { kind: "level"; xp: number; realm: string; level: string };
export type DailyQuests = { day: string; quests: Quest[]; bonusXp: number; awarded: XpAward[] };

const QUEST_TITLES: Record<QuestId, string> = {
  lesson: "Finish a lesson",
  two_lessons: "Finish 2 lessons",
  sharp_lesson: "Score 80% or more in a new lesson",
  two_realms: "Finish lessons in 2 different realms",
  battle: "Play a friend battle",
  rex: "Answer Rex's questions",
  build: "Unlock or upgrade something in your world",
};
export const questTitle = (id: QuestId) => QUEST_TITLES[id];
export const questsDone = (quests: readonly Quest[]) => quests.filter((quest) => quest.done).length;

/** "Number Nexus" for a realm id (falls back to the id). */
export function realmName(realm: string) {
  try { return getRealmDefinition(realm).name; } catch { return realm; }
}
export const levelName = (level: string) => levelLabelForYear(level);

/** What Demo shows: one quest done, one under way, one to go. */
export const DEMO_QUESTS: DailyQuests = {
  day: "demo",
  quests: [
    { id: "lesson", progress: 1, target: 1, xp: 30, done: true },
    { id: "two_lessons", progress: 1, target: 2, xp: 30, done: false },
    { id: "battle", progress: 0, target: 1, xp: 20, done: false },
  ],
  bonusXp: QUEST_ALL_BONUS_XP,
  awarded: [],
};

const QUEST_IDS = new Set<string>(Object.keys(QUEST_TITLES));
function parseQuest(value: unknown): Quest | null {
  const row = value as Partial<Quest> | null;
  if (!row || typeof row.id !== "string" || !QUEST_IDS.has(row.id)) return null;
  return { id: row.id as QuestId, progress: Number(row.progress) || 0, target: Number(row.target) || 1, xp: Number(row.xp) || 0, done: row.done === true };
}
function parseAward(value: unknown): XpAward | null {
  const row = value as Record<string, unknown> | null;
  const xp = Number(row?.xp);
  if (!row || !xp) return null;
  switch (row.kind) {
    case "quest": return typeof row.quest === "string" && QUEST_IDS.has(row.quest) ? { kind: "quest", quest: row.quest as QuestId, xp } : null;
    case "quests_all": return { kind: "quests_all", xp };
    case "accuracy": return { kind: "accuracy", xp, perfect: row.perfect === true };
    case "week": return { kind: "week", xp, realm: String(row.realm), level: String(row.level), week: Number(row.week) };
    case "level": return { kind: "level", xp, realm: String(row.realm), level: String(row.level) };
    default: return null;
  }
}
function parse(value: unknown): DailyQuests | null {
  const row = value as Partial<Record<keyof DailyQuests, unknown>> | null;
  if (!row || !Array.isArray(row.quests)) return null;
  return {
    day: String(row.day ?? ""),
    quests: row.quests.map(parseQuest).filter((quest): quest is Quest => quest !== null),
    bonusXp: Number(row.bonusXp) || QUEST_ALL_BONUS_XP,
    awarded: Array.isArray(row.awarded) ? row.awarded.map(parseAward).filter((award): award is XpAward => award !== null) : [],
  };
}

// One shared copy for every quest card on the page, plus the rewards waiting to be shown.
let current: DailyQuests | null = null;
let waiting: readonly XpAward[] = [];
let pending: Promise<DailyQuests | null> | null = null;
/** XP paid by claims since the page opened, so a points display loaded earlier can catch up. */
let paidSinceLoad = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function subscribeXpQuests(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export const getDailyQuests = () => current;
export const getXpAwards = () => waiting;
export const getXpPaidSinceLoad = () => paidSinceLoad;
/** Removes the reward on screen; the next one (if any) shows after it. */
export function dismissXpAward() { waiting = waiting.slice(1); emit(); }
/** Demo review only: shows a reward without paying anything. */
export function previewXpAward(award: XpAward) { waiting = [...waiting, award]; emit(); }

/** The order rewards are shown in: small ones first, the biggest celebration last. */
const SHOW_ORDER: Record<XpAward["kind"], number> = { accuracy: 0, quest: 1, quests_all: 2, week: 3, level: 4 };

/**
 * Asks the server for today's quests and pays any quest, accuracy, week or level reward now due.
 * Safe to call any number of times: each reward is paid once. Called after a lesson or quiz banks XP,
 * after a battle, Rex or a purchase, and when a screen showing quests opens.
 */
export function claimXpRewards(): Promise<DailyQuests | null> {
  if (isDemoPreviewMode()) {
    current ??= DEMO_QUESTS;
    emit();
    return Promise.resolve(current);
  }
  const studentId = getActiveStudentProfile()?.studentId;
  if (!studentId) return Promise.resolve(null);
  pending ??= (async () => {
    try {
      const { data, error } = await supabase.rpc("claim_xp_rewards_secure", { p_student_id: studentId });
      if (error) {
        // Before the migration is applied the quest card simply stays hidden.
        console.warn("[XpQuests] claim failed:", error);
        return current;
      }
      const quests = parse(data);
      if (!quests) return current;
      current = quests;
      paidSinceLoad += quests.awarded.reduce((sum, award) => sum + award.xp, 0);
      if (quests.awarded.length) waiting = [...waiting, ...[...quests.awarded].sort((a, b) => SHOW_ORDER[a.kind] - SHOW_ORDER[b.kind])];
      emit();
      return quests;
    } finally {
      pending = null;
    }
  })();
  return pending;
}

/** A parent's or teacher's read-only view of a student's quests today. Pays nothing. */
export async function fetchDailyQuests(studentId: string): Promise<DailyQuests | null> {
  const { data, error } = await supabase.rpc("get_daily_quests_secure", { p_student_id: studentId });
  if (error) throw error;
  return parse(data);
}

/** The active student's quests, claimed once when the first screen using them opens. */
export function useDailyQuests() {
  const quests = useSyncExternalStore(subscribeXpQuests, getDailyQuests, () => null);
  useEffect(() => {
    if (!getDailyQuests()) void claimXpRewards();
  }, []);
  return quests;
}

const NO_AWARDS: readonly XpAward[] = [];
/** The reward to show now (the first waiting), or null. */
export function useXpAward() {
  return useSyncExternalStore(subscribeXpQuests, getXpAwards, () => NO_AWARDS)[0] ?? null;
}
