// ── Brain Break villain registry ───────────────────────────────────────────
// Mid-lesson "brain breaks" — at the 4:30 mark a minion of the Fog of
// Forgetfulness swoops in. The student plays a quick 1-touch game to defeat it,
// which is really just a movement/attention rest before returning to work.
//
// Villains are UNIVERSAL across realms (focus habits, not maths content) but are
// BANDED BY LEVEL: a "junior" gallery for Ground→Level 2 and a "senior" gallery
// for Level 3→6. Each villain is a card-collectible creature (future merch):
// name + creature + power (the distraction) + weakness (the focus habit).
//
// Adding a villain is a single entry here — pick a shared game mechanic, a band,
// and supply the copy/colours.

export type BrainBreakGame =
  | "whack"
  | "slash"
  | "keepuppy"
  | "duel"
  | "dodge" // drag to avoid projectiles
  | "copyme" // tap-back a flashing sequence (memory)
  | "trace" // trace a glowing path
  // Arcade P1 — lightweight new cartridges:
  | "popwall" // aim + launch to pop matching clusters (bubble shooter)
  | "trickshot" // flick a ball into a moving hoop
  // Arcade P2 — senior physics flagships:
  | "brickbuster" // paddle + ball smash the brick wall (Breakout)
  | "glowsnake" // steer a growing trail to eat orbs (Snake)
  | "gobbleglow" // clear a maze while the villain chases (Pac-Man)
  | "bumperblast"; // flippers keep the ball alive off the bumpers (Pinball)
export type VillainBand = "junior" | "senior";

export type Villain = {
  id: string;
  name: string;
  /** Big villain face shown on entrance/defeat. */
  face: string;
  /** Junior = Ground→L2, Senior = L3→6. */
  band: VillainBand;
  /** Which shared mini-game this villain uses. */
  game: BrainBreakGame;
  /** The thing the player taps/slashes/bops. */
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
  /**
   * Win threshold. Meaning depends on game:
   *  whack/slash = targets to clear, keepuppy = bops, charge = taps to fill.
   *  (duel ignores this — it's a tug-of-war bar.)
   */
  winCount: number;
  /** Max game length before auto-victory (always winnable). */
  durationSec: number;
};

export const VILLAINS: Villain[] = [
  // ── Junior gallery (Ground → Level 2) ──
  {
    id: "confusion_creeper",
    name: "Confusion Creeper",
    face: "🌀",
    band: "junior",
    game: "trace",
    targetEmoji: "❓",
    taunt: "Feeling muddled? I'll scramble your thoughts!",
    victory: "Confusion cleared — your mind is sharp again!",
    tip: "When it feels confusing, take it one step at a time.",
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.6)",
    winCount: 24,
    durationSec: 24,
  },
  {
    id: "time_snatcher",
    name: "Time Snatcher",
    face: "🕰️",
    band: "junior",
    game: "dodge",
    targetEmoji: "⏰",
    taunt: "Tick tock! I'm stealing all your time!",
    victory: "Time reclaimed — every second is yours again!",
    tip: "Use your time well. You've got this.",
    color: "#c8a030",
    glow: "rgba(200,160,48,0.6)",
    winCount: 28,
    durationSec: 18,
  },
  {
    id: "noise_nibbler",
    name: "Noise Nibbler",
    face: "📣",
    band: "junior",
    game: "copyme",
    targetEmoji: "🔊",
    taunt: "Listen to allll this noise! You can't focus now!",
    victory: "Hushed! Lovely and quiet again.",
    tip: "Quiet the noise around you and your mind can think.",
    color: "#f472b6",
    glow: "rgba(244,114,182,0.6)",
    winCount: 26,
    durationSec: 26,
  },
  {
    id: "gamer_gremlin",
    name: "Gamer Gremlin",
    face: "👾",
    band: "junior",
    game: "keepuppy",
    targetEmoji: "🎮",
    taunt: "Just one more game! Forget your lesson!",
    victory: "Game over — for YOU, Gremlin! Back to the real quest.",
    tip: "Finish your work first — then play is even more fun.",
    color: "#4ade80",
    glow: "rgba(74,222,128,0.55)",
    winCount: 26,
    durationSec: 55,
  },
  {
    id: "worry_wasp",
    name: "Worry Wasp",
    face: "🐝",
    band: "junior",
    game: "popwall",
    targetEmoji: "✨",
    taunt: "Bzzz… you can't do this… you're not good enough…",
    victory: "You believed in yourself — and the worry buzzed away!",
    tip: "Believe in yourself. You can do hard things.",
    color: "#fcd34d",
    glow: "rgba(252,211,77,0.6)",
    winCount: 44,
    durationSec: 38,
  },
  {
    id: "snooze_sloth",
    name: "Snooze Sloth",
    face: "🦥",
    band: "junior",
    game: "duel",
    targetEmoji: "💤",
    taunt: "Eh… just do it laaater… have a little rest…",
    victory: "You did it NOW — Snooze Sloth never saw it coming!",
    tip: "Do it now, don't let it slip to later.",
    color: "#c8956c",
    glow: "rgba(200,149,108,0.55)",
    winCount: 100,
    durationSec: 42,
  },

  // ── Senior gallery (Level 3 → 6) ──
  {
    id: "doom_scroller",
    name: "Doom Scroller",
    face: "📱",
    band: "senior",
    game: "glowsnake",
    targetEmoji: "📲",
    taunt: "Keep scrolling… one more… one more… one more…",
    victory: "Screen down. Focus up. The scroll is broken!",
    tip: "Put the screen down — your real adventure is here.",
    color: "#38bdf8",
    glow: "rgba(56,189,248,0.6)",
    winCount: 12,
    durationSec: 18,
  },
  {
    id: "overthink_owl",
    name: "Overthink Owl",
    face: "🦉",
    band: "senior",
    game: "gobbleglow",
    targetEmoji: "💭",
    taunt: "But what if… but what if… but WHAT IF…?",
    victory: "Spiral broken! One clear thought at a time.",
    tip: "Don't spiral — pick one thought and start there.",
    color: "#818cf8",
    glow: "rgba(129,140,248,0.6)",
    winCount: 28,
    durationSec: 26,
  },
  {
    id: "hype_beast",
    name: "Hype Beast",
    face: "🔔",
    band: "senior",
    game: "bumperblast",
    targetEmoji: "🔔",
    taunt: "Ping! Ping! You're missing out! Check it NOW!",
    victory: "Notifications silenced — you're not missing a thing.",
    tip: "You're not missing out. The important stuff is right here.",
    color: "#fb7185",
    glow: "rgba(251,113,133,0.6)",
    winCount: 30,
    durationSec: 55,
  },
  {
    id: "perfecto",
    name: "Perfecto",
    face: "💎",
    band: "senior",
    game: "brickbuster",
    targetEmoji: "⭐",
    taunt: "It must be PERFECT… or don't even try…",
    victory: "Done beats perfect! You kept going anyway.",
    tip: "Done is better than perfect. Keep going.",
    color: "#67e8f9",
    glow: "rgba(103,232,249,0.6)",
    winCount: 28,
    durationSec: 24,
  },
  {
    id: "the_comparer",
    name: "The Comparer",
    face: "🪞",
    band: "senior",
    game: "duel",
    targetEmoji: "⚖️",
    taunt: "Everyone's better than you… why even bother?",
    victory: "You ran your OWN race — and won!",
    tip: "Don't compare. Run your own race.",
    color: "#c4b5fd",
    glow: "rgba(196,181,253,0.6)",
    winCount: 100,
    durationSec: 42,
  },
];

// ── Game registry (banded independently of villains) ────────────────────────
// The roster itself varies by age: a junior lesson draws from {junior, both}
// games, a senior lesson from {senior, both}. Each game defines its own 45-60s
// safety ceiling and its win target per band, so any villain can dress any game
// with sensible tuning (the villain's own game/winCount are treated as defaults).
export type GameBand = "junior" | "senior" | "both";
export type GameDef = {
  id: BrainBreakGame;
  band: GameBand;
  /** Safety auto-win ceiling, normalised to the 45-60s spec. */
  durationSec: number;
  /** Win target per band (used by count/meter games; survival games ignore it). */
  win: { junior: number; senior: number };
};

export const GAMES: GameDef[] = [
  { id: "whack", band: "junior", durationSec: 48, win: { junior: 14, senior: 18 } },
  { id: "keepuppy", band: "junior", durationSec: 50, win: { junior: 14, senior: 18 } },
  { id: "trace", band: "junior", durationSec: 46, win: { junior: 24, senior: 24 } },
  { id: "slash", band: "both", durationSec: 50, win: { junior: 14, senior: 20 } },
  { id: "dodge", band: "both", durationSec: 46, win: { junior: 1, senior: 1 } },
  { id: "copyme", band: "both", durationSec: 52, win: { junior: 1, senior: 1 } },
  { id: "duel", band: "both", durationSec: 46, win: { junior: 100, senior: 100 } },
  { id: "popwall", band: "both", durationSec: 50, win: { junior: 10, senior: 16 } },
  { id: "trickshot", band: "both", durationSec: 50, win: { junior: 5, senior: 8 } },
  // Senior physics flagships (Level 3+ only).
  { id: "brickbuster", band: "senior", durationSec: 54, win: { junior: 12, senior: 16 } },
  { id: "glowsnake", band: "senior", durationSec: 56, win: { junior: 6, senior: 8 } },
  { id: "gobbleglow", band: "senior", durationSec: 54, win: { junior: 10, senior: 14 } },
  { id: "bumperblast", band: "senior", durationSec: 52, win: { junior: 10, senior: 14 } },
];

/** Games a student of this level may see: their own band plus "both". */
export function gamesForBand(band: VillainBand): GameDef[] {
  return GAMES.filter((g) => g.band === "both" || g.band === band);
}

// Two brain breaks per 9-minute (540s) lesson:
//   Break 1 ≈ 3 minutes in  (360s left)
//   Break 2 ≈ 6 minutes in  (180s left)
export const BRAIN_BREAK_1_AT_SECONDS_LEFT = 360;
export const BRAIN_BREAK_2_AT_SECONDS_LEFT = 180;

/** Ground (Prep) → Level 2 are junior; Level 3+ are senior. */
export function bandForLevel(levelNumber: number): VillainBand {
  return levelNumber <= 2 ? "junior" : "senior";
}

/**
 * Pick a brain break — a (game, villain) pair — for the student's level.
 *
 * The GAME is chosen first from the level's band-filtered pool (so the roster
 * itself varies by age), rotating the archetype so two breaks in a lesson are
 * never the same loop (`excludeGame`). A band-appropriate villain then dresses
 * it (`excludeId` avoids repeating the exact villain). The returned villain is
 * dressed with the chosen game's mechanic, 45-60s ceiling and win target.
 */
export function pickBreak(
  levelNumber: number,
  opts?: { excludeId?: string; excludeGame?: BrainBreakGame },
): Villain {
  const band = bandForLevel(levelNumber);

  // 1) Choose the game from the band pool, rotating the archetype.
  const gamePool = gamesForBand(band);
  let gameChoices = opts?.excludeGame ? gamePool.filter((g) => g.id !== opts.excludeGame) : gamePool;
  if (gameChoices.length === 0) gameChoices = gamePool;
  const game = gameChoices[Math.floor(Math.random() * gameChoices.length)]!;

  // 2) Dress it with a band-appropriate villain, avoiding an exact repeat.
  let villainPool = VILLAINS.filter((v) => v.band === band);
  if (villainPool.length === 0) villainPool = VILLAINS;
  if (opts?.excludeId) {
    const noRepeat = villainPool.filter((v) => v.id !== opts.excludeId);
    if (noRepeat.length > 0) villainPool = noRepeat;
  }
  const villain = villainPool[Math.floor(Math.random() * villainPool.length)]!;

  return { ...villain, game: game.id, durationSec: game.durationSec, winCount: band === "senior" ? game.win.senior : game.win.junior };
}

/** @deprecated Use {@link pickBreak}, which bands the game as well as the villain. */
export const pickVillain = pickBreak;
