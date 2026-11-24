"use client";

import { isDemoPreviewMode } from "@/lib/demo-mode";
import { CHRONOROK_OPEN_DAYS, CRYSTALS_TO_AWAKEN } from "@/lib/chronorok";
import { cardById, claimChronorok, clearNewlyAwakened, onChronorokAwakened, type ChronorokState } from "@/lib/chronorok-cards";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { chronorokForGrade } from "@/lib/chronorok";

/** Chrono Crystal reveals. After a lesson or quiz saves, the server re-counts this school year's learning days
 *  (and awakens a card when it's due). When the count has gone up since the learner last saw it (kept per
 *  student in this browser), a reveal is queued. A learner who already has crystals the first time this runs
 *  is recorded quietly, so nobody gets a reveal for crystals earned long ago. An awakening always shows. */

export type CrystalReveal = {
  crystals: number; learningDays: number; chronorok: string; milestone: "first" | "open" | "quarter" | "awaken" | null;
  /** On a first awakening: the earlier grades' Chronoroks that woke up too. */
  catchUp?: string[];
};

let current: CrystalReveal | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

export function subscribeCrystalReveal(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function getCrystalReveal() { return current; }
export function dismissCrystalReveal() { current = null; emit(); }

function milestoneFor(crystals: number, learningDays: number, previousDays: number): CrystalReveal["milestone"] {
  if (crystals >= CRYSTALS_TO_AWAKEN) return "awaken";
  if (learningDays >= CHRONOROK_OPEN_DAYS && previousDays < CHRONOROK_OPEN_DAYS) return "open";
  if (crystals === 1 && learningDays <= 1) return "first";
  if (crystals === 25 || crystals === 50 || crystals === 75) return "quarter";
  return null;
}

/** The server just awakened cards: the grade card first, then any catch-up. */
onChronorokAwakened((state: ChronorokState) => {
  const [grade, ...catchUp] = state.newly;
  const card = cardById(grade);
  if (!card) return;
  current = { crystals: state.crystals, learningDays: state.learningDays, chronorok: card.name, milestone: "awaken", catchUp: catchUp.map((id) => cardById(id)?.name ?? "").filter(Boolean) };
  clearNewlyAwakened();
  emit();
});

export async function checkChronoCrystal(studentId: string) {
  if (isDemoPreviewMode()) return;
  const key = `lul:chrono-crystals:seen:${studentId}`;
  try {
    const progress = await claimChronorok();
    if (!progress || current?.milestone === "awaken") return;
    const seenRaw = localStorage.getItem(key);
    const seen = seenRaw ? JSON.parse(seenRaw) as { crystals: number; learningDays: number; year: number } : null;
    const year = progress.year;
    localStorage.setItem(key, JSON.stringify({ crystals: progress.crystals, learningDays: progress.learningDays, year }));
    if (!seen) {
      if (progress.learningDays > 1) return; // first time here: record quietly
    } else if (seen.year === year && progress.crystals <= seen.crystals) return;
    if (progress.crystals < 1) return;
    const milestone = milestoneFor(progress.crystals, progress.learningDays, seen?.learningDays ?? 0);
    // The awakening itself comes from the server (above); at 100 without a new card, just show the count.
    current = {
      crystals: progress.crystals,
      learningDays: progress.learningDays,
      chronorok: chronorokForGrade(getActiveStudentProfile()?.yearLevel).name,
      milestone: milestone === "awaken" ? null : milestone,
    };
    emit();
  } catch {
    /* a reveal is a bonus; never block a lesson */
  }
}

/** Review pages only: show a reveal without touching any data. */
export function previewCrystalReveal(reveal: CrystalReveal) { current = reveal; emit(); }
