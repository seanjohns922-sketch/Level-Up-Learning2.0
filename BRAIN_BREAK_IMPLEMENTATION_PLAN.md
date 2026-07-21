# Brain Break Arcade — Implementation Plan

> Companion to `BRAIN_BREAK_ARCADE_DESIGN.md`. This is the build plan, not the design.
> Written after verifying the design doc against the live code (2026-07-18).
> Scope decision: **P0 first, as its own PR.** `charge` is retired in favour of `breathe` (Bubble Breath).

---

## The one architectural change everything else hangs off

Today a **villain owns its game**: `villain.game`, `villain.winCount`, and `villain.durationSec`
all live on the villain entry (`lib/brain-break.ts`), and `BrainBreak.tsx` reads them directly
(`villain.game` at line 37/207-214, `villain.winCount` at line 52, `villain.durationSec` at line 67).

The design requires the **game roster itself** to vary by age, independent of villains. So we
decouple them:

- **Villain** = the *skin* (face, taunt, colour, tip, band, target emoji).
- **Game** = the *mechanic* (id, band, duration, win threshold, difficulty params).
- A brain break is a **(game, villain)** pair chosen at runtime.

This is the load-bearing refactor. Once the pair-picker exists, P1/P2 are "just add rows + a component each".

---

## Phase 0 — Framework fix (½–1 day, standalone PR)

Delivers the headline asks (**games vary by age**, **45–60s length**) with **zero new game mechanics**.

### 0.1 New `GAMES` registry — `lib/brain-break.ts`

Add a registry keyed by the 8 existing mechanics, each carrying its own band + tuning:

```ts
export type GameBand = "junior" | "senior" | "both";

export type BrainBreakGameDef = {
  id: BrainBreakGame;          // "whack" | "slash" | ... | "breathe"
  band: GameBand;              // filterable independent of villain
  durationSec: number;         // normalised 45–60s
  winCount: number;            // meaning per mechanic (targets / bops / taps)
  // optional per-band difficulty scaling for "both" games:
  scale?: { junior: GameParams; senior: GameParams };
};
```

Band tags (from design §2): `whack` J, `slash` B, `keepuppy` J, `duel` B, `dodge` B,
`copyme` B, `trace` J, `breathe` J. (After P0 the deck is Junior 4 / Senior 0 / Both 4 —
seniors draw only from the 4 `both` games until P1/P2 add senior cartridges. Acceptable for
P0; flag it so we don't ship P0 to a senior cohort as the *final* state.)

### 0.2 Retire `charge` → add `breathe`

- Remove `"charge"` from the `BrainBreakGame` union; add `"breathe"`.
- Worry Wasp's entry points at `breathe`.
- `ChargeGame` in `BrainBreak.tsx` is replaced by `BreatheGame` (paced hold/release rhythm,
  3 breath cycles, no intensity ramp — the calm option). This is the one *new mechanic* in P0;
  it's small. If we want P0 truly mechanic-free, `breathe` can slip to P1 and Worry Wasp
  temporarily rides an existing junior game — but the doc locked the retire, so default is: do it now.

### 0.3 Slim the villain type

Remove `game`, `winCount`, `durationSec` from `Villain` (they now live on the game). Villains
keep `band` (still needed — a junior villain shouldn't skin a senior-only game). Keep everything
cosmetic.

### 0.4 `pickVillain()` → `pickBreak()`

New signature returns a pair:

```ts
export function pickBreak(
  levelNumber: number,
  opts?: { excludeGame?: BrainBreakGame; excludeVillainId?: string },
): { game: BrainBreakGameDef; villain: Villain }
```

Logic: `band = bandForLevel(level)` → filter `GAMES` to `{band} ∪ {both}` → drop `excludeGame`
(preserve the never-same-game-back-to-back guarantee) → pick a game → pick a band-appropriate
villain to skin it (avoiding `excludeVillainId`). Note: **rotation now keys off the game**, which
is stronger than today (today two different villains could share a mechanic).

### 0.5 `BrainBreak.tsx` consumes the pair

- Props become `{ game, villain, onComplete }`.
- Replace `villain.game` → `game.id`, `villain.winCount` → `game.winCount`,
  `villain.durationSec` → `game.durationSec` (lines 37, 52, 67, 71, 207-214).
- Normalise every `durationSec` to 45–60s (kills the 18s dodge — which also closes the
  P1-003 Doom Scroller "too fast / too test-like" complaint on the priority board).
- Make each game ramp intensity over its duration and keep the guaranteed auto-win at timeout.

### 0.6 Make `slash` a real swipe

Current `SlashGame` (line 318) registers on tap. Change hit detection to a drag-through hitbox
(pointer move across a target counts), so it earns the "Star Swipe" name (design §3.2).

### 0.7 Update the two call sites

- `PracticeRunner.tsx:568` and `Year2LessonEngine.tsx:989`: swap `pickVillain(...)` for
  `pickBreak(...)`, store both `game` + `villain` in the refs, pass both to `<BrainBreak>`.
- `lastVillainGameRef` becomes the game id from the pair; `lastVillainIdRef` stays the villain id.

### P0 acceptance
- Junior lesson only ever draws junior/both games; senior only senior/both.
- Two breaks in one lesson never share a mechanic.
- Every break runs 45–60s with a visible ramp and always ends in victory.
- Worry Wasp is a calm breathing game; `charge` no longer referenced anywhere (grep clean).
- `slash` responds to a swipe, not a tap.
- Verify by driving a real Prep lesson and a real Y4 lesson (`/verify` or `/run`).

---

## Phase 1 — Lightweight cartridges (1–2 days)

Each is one `GAMES` row + one self-contained component in `BrainBreak.tsx` (mirrors
`WhackGame`/`DodgeGame`). No registry/API changes — the P0 framework already carries them.

| Game | Band | Verb | Notes |
| --- | --- | --- | --- |
| Memory Match Flip | J | tap-flip | fills junior spatial-memory gap; grid 6→8 |
| Pop Wall | B | aim-release | bubble-shooter; tap-aim for juniors, drag-aim seniors |
| Trick Shot | B | flick | power/arc meter; villain moves the goal |
| (Bubble Breath) | J | hold/rhythm | only if `breathe` was deferred out of P0 |

After P1 the senior deck is still thin (only `both` games) — P2 is what makes seniors first-class.

## Phase 2 — Senior physics flagships (2–4 days)

Real physics builds, done last once the framework is proven: Glow Snake (S), Gobble Glow (S),
Brick Buster (S), Bumper Blast (S). These give seniors their own cartridges instead of only
riding `both` games. Each is still just a registry row + a component, but the component is a
genuine rAF physics loop.

---

## Risks / watch-items

- **No DB or save-state changes** — breaks are ephemeral, resume already handles them. Don't add persistence.
- **No emoji in any new UI** (standing rule) — use SVG/CSS/lucide glyphs.
- **Measurelands theming** — brain breaks are realm-agnostic skins, but if any break chrome
  picks up realm tint, gate measurement on the Measurelands gold/violet palette, never Nexus teal.
- **Frequency logic untouched** — `lib/brain-break-settings.ts` (Frequent/Normal/Minimal + level
  taper) stays the source of truth; `pickBreak` does not change *how often* breaks fire.
- **P0 leaves seniors on a 4-game `both`-only deck.** Fine as an intermediate PR; not fine as the
  final shipped state to a Y3-6 cohort. Sequence P1/P2 before a senior rollout.
```
