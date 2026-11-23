"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { supabase } from "@/lib/supabase";

/** Learning streaks. The server decides everything (migration
 *  20261125090000_learning_streaks.sql): what counts as a learning day, shields
 *  and which rewards are paid. These constants only describe the ladder on screen. */
export const STREAK_REWARDS = [
  { day: 3, xp: 100 },
  { day: 5, xp: 500 },
  { day: 10, xp: 750 },
  { day: 20, xp: 1000 },
  { day: 30, xp: 2000 },
] as const;
/** After day 30, every 5th day pays this. */
export const STREAK_REPEAT_XP = 500;
export const STREAK_SHIELD_LIMIT = 2;

export type StreakAward = { day: number; xp: number };
export type LearningStreak = {
  streak: number;
  shields: number;
  todayDone: boolean;
  nextDay: number | null;
  nextXp: number;
  awarded: StreakAward[];
};

/** What Demo shows: one lesson away from the 5-day reward. */
export const DEMO_STREAK: LearningStreak = { streak: 4, shields: 1, todayDone: false, nextDay: 5, nextXp: 500, awarded: [] };

function parse(value: unknown): LearningStreak | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<LearningStreak>;
  if (typeof row.streak !== "number") return null;
  return {
    streak: row.streak,
    shields: typeof row.shields === "number" ? row.shields : 0,
    todayDone: row.todayDone === true,
    nextDay: typeof row.nextDay === "number" ? row.nextDay : null,
    nextXp: typeof row.nextXp === "number" ? row.nextXp : 0,
    awarded: Array.isArray(row.awarded) ? row.awarded.filter((a): a is StreakAward => typeof a?.day === "number" && typeof a?.xp === "number") : [],
  };
}

// One shared copy for every chip and card on the page, plus the latest reward to celebrate.
let current: LearningStreak | null = null;
let reward: { award: StreakAward; streak: LearningStreak } | null = null;
let pending: Promise<LearningStreak | null> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function subscribeLearningStreak(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export const getLearningStreak = () => current;
export const getStreakReward = () => reward;
export function dismissStreakReward() { reward = null; emit(); }
/** Demo review only: shows the celebration without paying anything. */
export function previewStreakReward(award: StreakAward, streak: LearningStreak) { reward = { award, streak }; emit(); }

/**
 * Asks the server for the active student's streak and pays any reward now due.
 * Safe to call any number of times: each reward is paid once. Called after a
 * lesson or quiz banks XP, and when a screen showing the streak opens.
 */
export function claimLearningStreak(): Promise<LearningStreak | null> {
  if (isDemoPreviewMode()) {
    current = DEMO_STREAK;
    emit();
    return Promise.resolve(DEMO_STREAK);
  }
  const studentId = getActiveStudentProfile()?.studentId;
  if (!studentId) return Promise.resolve(null);
  pending ??= (async () => {
    try {
      const { data, error } = await supabase.rpc("claim_learning_streak_secure", { p_student_id: studentId });
      if (error) {
        console.warn("[LearningStreak] claim failed:", error);
        return current;
      }
      const streak = parse(data);
      if (!streak) return current;
      current = streak;
      const biggest = streak.awarded.reduce<StreakAward | null>((best, a) => (!best || a.day > best.day ? a : best), null);
      if (biggest) reward = { award: { day: biggest.day, xp: streak.awarded.reduce((sum, a) => sum + a.xp, 0) }, streak };
      emit();
      return streak;
    } finally {
      pending = null;
    }
  })();
  return pending;
}

/** A parent's or teacher's read-only view of a student's streak. Pays nothing. */
export async function fetchLearningStreak(studentId: string): Promise<LearningStreak | null> {
  const { data, error } = await supabase.rpc("get_learning_streak_secure", { p_student_id: studentId });
  if (error) throw error;
  return parse(data);
}

/** The active student's streak, claimed once when the first screen using it opens. */
export function useLearningStreak() {
  const streak = useSyncExternalStore(subscribeLearningStreak, getLearningStreak, () => null);
  useEffect(() => {
    if (!getLearningStreak()) void claimLearningStreak();
  }, []);
  return streak;
}

/** "1 lesson today = 5-day streak" style copy, shared by every streak surface. */
export function streakPrompt(streak: LearningStreak) {
  if (!streak.nextDay) return null;
  const daysToGo = streak.nextDay - streak.streak;
  if (daysToGo === 1 && !streak.todayDone) return `1 lesson today = ${streak.nextDay}-day streak`;
  if (daysToGo === 1) return `Learn tomorrow for your ${streak.nextDay}-day streak`;
  return `${daysToGo} more learning days to day ${streak.nextDay}`;
}
