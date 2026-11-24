"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { CHRONOROKS, chronorokProgress } from "@/lib/chronorok";
import { fetchStudentActivityDaily } from "@/lib/student-activity";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { supabase } from "@/lib/supabase";

/** Chronorok cards kept for good, crystals counted by the server, the first-100 catch-up, missed grades bought with
 *  XP, and best game scores (migration 20261127150000_chronorok_cards.sql). The server decides everything. */

export type ChronorokCardId = (typeof CHRONOROKS)[number]["id"];
export type OwnedCard = { cardId: string; year: number; how: "awakened" | "catch_up" | "bought"; handedOver: boolean };
export type ChronorokState = {
  year: number; learningDays: number; crystals: number; open: boolean;
  /** 0 = Prep (Spark) … 6 = Grade 6 and above (Eternal); null when the grade isn't known. */
  gradeIndex: number | null;
  buyXp: number; cards: OwnedCard[];
  /** Cards awakened or bought by the call that returned this (for the celebration). */
  newly: string[];
};
export type ChronorokGame = "chrono-run" | "time-slope" | "rune-blocks" | "relic-rider";

/** Each card's colour in the games (taken from its painting and name). */
export const CHRONOROK_COLOURS: Record<string, string> = {
  "chronorok-spark-y0": "#ffd84a",
  "chronorok-ember-y1": "#ff6a2a",
  "chronorok-pulse-y2": "#ff5fae",
  "chronorok-current-y3": "#3fb8ff",
  "chronorok-rift-y4": "#9b5cff",
  "chronorok-blaze-y5": "#ffb020",
  "chronorok-eternal-y6": "#e8fbff",
};
export const cardById = (cardId: string) => CHRONOROKS.find((card) => card.id === cardId) ?? null;
export const shortName = (cardId: string) => cardById(cardId)?.name.replace("Chronorok ", "") ?? "Chronorok";

const DEMO_YEAR = new Date().getFullYear();
/** What Demo shows: Grade 5 with 63 crystals; Spark–Current kept from Grade 3 (the first 100 and its catch-up),
 *  Rift missed in Grade 4 (so it can be bought), Blaze still to awaken. */
export const DEMO_CHRONOROK: ChronorokState = {
  year: DEMO_YEAR, learningDays: 240, crystals: 63, open: true, gradeIndex: 5, buyXp: 5000,
  cards: [
    { cardId: "chronorok-spark-y0", year: DEMO_YEAR - 2, how: "catch_up", handedOver: true },
    { cardId: "chronorok-ember-y1", year: DEMO_YEAR - 2, how: "catch_up", handedOver: true },
    { cardId: "chronorok-pulse-y2", year: DEMO_YEAR - 2, how: "catch_up", handedOver: true },
    { cardId: "chronorok-current-y3", year: DEMO_YEAR - 2, how: "awakened", handedOver: false },
  ],
  newly: [],
};

function parse(value: unknown): ChronorokState | null {
  const row = value as Partial<ChronorokState> | null;
  if (!row || typeof row.crystals !== "number") return null;
  return {
    year: Number(row.year) || new Date().getFullYear(),
    learningDays: Number(row.learningDays) || 0,
    crystals: row.crystals,
    open: row.open === true,
    gradeIndex: typeof row.gradeIndex === "number" ? row.gradeIndex : null,
    buyXp: Number(row.buyXp) || 5000,
    cards: Array.isArray(row.cards) ? row.cards.filter((card): card is OwnedCard => typeof card?.cardId === "string") : [],
    newly: Array.isArray(row.newly) ? row.newly.filter((id): id is string => typeof id === "string") : [],
  };
}

// One shared copy for the hub chip, the collection, the games and the reveal.
let current: ChronorokState | null = null;
let failed = false;
let pending: Promise<ChronorokState | null> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());
export function subscribeChronorok(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export const getChronorok = () => current;
export const chronorokFailed = () => failed;
const setCurrent = (state: ChronorokState) => { current = state; failed = false; emit(); return state; };

/**
 * Asks the server for this year's crystals and awakens a card when it's due. Safe to call any number of times.
 * Called after a lesson or quiz saves and when a Chronorok screen opens.
 */
export function claimChronorok(): Promise<ChronorokState | null> {
  if (isDemoPreviewMode()) return Promise.resolve(current ?? setCurrent(DEMO_CHRONOROK));
  const studentId = getActiveStudentProfile()?.studentId;
  if (!studentId) return Promise.resolve(null);
  pending ??= (async () => {
    try {
      const { data, error } = await supabase.rpc("claim_chronorok_secure", { p_student_id: studentId });
      const state = error ? await activityFallback(studentId) : parse(data);
      if (!state) { failed = true; emit(); return current; }
      setCurrent(state);
      if (state.newly.length) awakenHandler?.(state);
      return state;
    } finally {
      pending = null;
    }
  })();
  return pending;
}

/** Before the cards migration is applied: the old count from daily activity, with no cards kept. */
async function activityFallback(studentId: string): Promise<ChronorokState | null> {
  try {
    const progress = chronorokProgress(await fetchStudentActivityDaily(studentId));
    return { year: new Date().getFullYear(), ...progress, gradeIndex: null, buyXp: 5000, cards: [], newly: [] };
  } catch {
    return null;
  }
}

/** The active student's Chronorok state, claimed once when the first screen using it opens. */
export function useChronorok() {
  const state = useSyncExternalStore(subscribeChronorok, getChronorok, () => null);
  const error = useSyncExternalStore(subscribeChronorok, chronorokFailed, () => false);
  useEffect(() => { if (!getChronorok()) void claimChronorok(); }, []);
  return { state, error };
}

/** Earlier grades the student never awakened, which can be bought once they've awakened their first card. */
export function buyableCards(state: ChronorokState) {
  if (state.gradeIndex === null || !state.cards.length) return [];
  const owned = new Set(state.cards.map((card) => card.cardId));
  return CHRONOROKS.slice(0, state.gradeIndex).filter((card) => !owned.has(card.id));
}

export async function buyChronorokCard(cardId: string): Promise<ChronorokState> {
  if (isDemoPreviewMode()) {
    const base = current ?? DEMO_CHRONOROK;
    return setCurrent({ ...base, cards: [...base.cards, { cardId, year: base.year, how: "bought", handedOver: false }], newly: [cardId] });
  }
  const studentId = getActiveStudentProfile()?.studentId;
  if (!studentId) throw new Error("Sign in to unlock a Chronorok.");
  const { data, error } = await supabase.rpc("buy_chronorok_card_secure", { p_student_id: studentId, p_card_id: cardId });
  if (error) throw new Error(error.message === "Not enough XP" ? `You need ${(current?.buyXp ?? 5000).toLocaleString()} XP to unlock it.` : "That didn't work just now. Try again in a moment.");
  const state = parse(data);
  if (!state) throw new Error("That didn't work just now. Try again in a moment.");
  return setCurrent(state);
}

/** Shows the Awakening (registered by lib/chrono-crystals, which owns the reveal). */
let awakenHandler: ((state: ChronorokState) => void) | null = null;
export function onChronorokAwakened(handler: (state: ChronorokState) => void) { awakenHandler = handler; }

/** Clears the "just awakened" list once it has been celebrated. */
export function clearNewlyAwakened() { if (current?.newly.length) setCurrent({ ...current, newly: [] }); }

// Parents and teachers. ------------------------------------------------------------------------

export async function fetchChronorokFor(studentId: string): Promise<ChronorokState | null> {
  const { data, error } = await supabase.rpc("get_chronorok_secure", { p_student_id: studentId });
  if (error) throw error;
  return parse(data);
}
export async function markCardHandedOver(studentId: string, cardId: string) {
  const { error } = await supabase.rpc("set_chronorok_handed_over_secure", { p_student_id: studentId, p_card_id: cardId });
  if (error) throw error;
}

// Best game scores. ----------------------------------------------------------------------------

export type BoardRow = { studentId: string; name: string; best: number; me: boolean; outfit?: Record<string, unknown> };
export type GameBoard = { myBest: number; top: BoardRow[] };

/** Demo: three pretend friends around the player's device best (or 388 before they've played). */
const DEMO_BOARD = (deviceBest: number): GameBoard => {
  const myBest = deviceBest || 388;
  const top: BoardRow[] = [
    { studentId: "demo-mia", name: "Demo Mia", best: 412, me: false },
    { studentId: "me", name: "You", best: myBest, me: true },
    { studentId: "demo-leo", name: "Demo Leo", best: 301, me: false },
    { studentId: "demo-zara", name: "Demo Zara", best: 260, me: false },
  ];
  return { myBest, top: top.sort((a, b) => b.best - a.best).slice(0, 5) };
};

export async function fetchGameBoard(game: ChronorokGame, deviceBest = 0): Promise<GameBoard | null> {
  if (isDemoPreviewMode()) return DEMO_BOARD(deviceBest);
  const studentId = getActiveStudentProfile()?.studentId;
  if (!studentId) return null;
  const { data, error } = await supabase.rpc("get_chronorok_board_secure", { p_student_id: studentId, p_game: game });
  if (error || !data) return null;
  const row = data as { myBest?: number | null; top?: BoardRow[] };
  return { myBest: Number(row.myBest) || 0, top: Array.isArray(row.top) ? row.top : [] };
}

/** Saves a score on the server if it's the student's best. Quietly does nothing offline or before the migration. */
export async function submitGameBest(game: ChronorokGame, score: number) {
  if (isDemoPreviewMode() || !(score > 0)) return;
  const studentId = getActiveStudentProfile()?.studentId;
  if (!studentId) return;
  await supabase.rpc("submit_chronorok_best_secure", { p_student_id: studentId, p_game: game, p_score: Math.round(score) });
}

// The Chronorok that comes along in the games. --------------------------------------------------

const COMPANION_KEY = "reliq:chronorok:companion";
export function readCompanion(): string | null { try { return localStorage.getItem(COMPANION_KEY); } catch { return null; } }
export function saveCompanion(cardId: string) { try { localStorage.setItem(COMPANION_KEY, cardId); } catch { /* per device */ } }

/** The chosen companion's card and colour for the game inside (null: no card yet, the game's own colours). */
export const CompanionContext = createContext<{ cardId: string; colour: string } | null>(null);
export function useCompanionColour(fallback: string) { return useContext(CompanionContext)?.colour ?? fallback; }

let cheer = 0;
const cheerListeners = new Set<() => void>();
/** A game calls this on a new best; the companion's badge cheers. */
export function cheerCompanion() { cheer += 1; cheerListeners.forEach((listener) => listener()); }
export function useCompanionCheer() {
  return useSyncExternalStore((listener) => { cheerListeners.add(listener); return () => { cheerListeners.delete(listener); }; }, () => cheer, () => 0);
}
