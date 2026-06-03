// ── Brain Break villain registry ───────────────────────────────────────────
// Mid-lesson "brain breaks" — at the 4:30 mark a minion of the Fog of
// Forgetfulness swoops in. The student plays a quick 1-touch game to defeat it,
// which is really just a movement/attention rest before returning to work.
//
// Villains are UNIVERSAL across realms (they're about focus habits, not maths
// content). Adding a new villain is a single entry here — pick one of the
// shared game mechanics and supply the copy/colours.

export type BrainBreakGame = "whack" | "slash";

export type Villain = {
  id: string;
  name: string;
  /** Big villain face shown on entrance/defeat. */
  face: string;
  /** Which shared mini-game this villain uses. */
  game: BrainBreakGame;
  /** The thing the player taps/slashes. */
  targetEmoji: string;
  /** Entrance taunt. */
  taunt: string;
  /** Defeat line. */
  victory: string;
  /** The focus habit this secretly teaches. */
  tip: string;
  /** Accent colour + glow. */
  color: string;
  glow: string;
  /** Targets needed to win. */
  winCount: number;
  /** Max game length before auto-victory (always winnable). */
  durationSec: number;
};

export const VILLAINS: Villain[] = [
  {
    id: "confusion_creeper",
    name: "Confusion Creeper",
    face: "🌀",
    game: "whack",
    targetEmoji: "❓",
    taunt: "Feeling muddled? I'll scramble your thoughts!",
    victory: "Confusion cleared — your mind is sharp again!",
    tip: "When it feels confusing, take it one step at a time.",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.6)",
    winCount: 12,
    durationSec: 28,
  },
  {
    id: "time_snatcher",
    name: "Time Snatcher",
    face: "🕰️",
    game: "slash",
    targetEmoji: "⏰",
    taunt: "Tick tock! I'm stealing all your time!",
    victory: "Time reclaimed — every second is yours again!",
    tip: "Use your time well. You've got this.",
    color: "#c8a030",
    glow: "rgba(200,160,48,0.6)",
    winCount: 14,
    durationSec: 28,
  },
];

/** The second of the 9-minute lesson at which the brain break fires (4:30). */
export const BRAIN_BREAK_AT_SECONDS_LEFT = 270;

/** Pick a villain for this lesson (varied each time). */
export function pickVillain(): Villain {
  return VILLAINS[Math.floor(Math.random() * VILLAINS.length)];
}
