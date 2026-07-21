# Level Up Learning — Brain Break Arcade Design

> A Nintendo-style mini-game collection that resets attention between learning.
> Students defend their XP from villains that try to steal their focus.
> Every break should feel like pulling a **different cartridge** out of the box.

---

## 0. Grounding — what we already have

This is **not a greenfield design**. The architecture the brief asks for already exists:

| Concern | Status in code | File |
| --- | --- | --- |
| Villain ≠ mini-game separation | ✅ Already split | `lib/brain-break.ts` (villains) + `components/lesson/BrainBreak.tsx` (mechanics) |
| Any villain on any game | ✅ `villain.game` points at a shared mechanic | `lib/brain-break.ts` |
| Age banding | ✅ `junior` (Ground→Yr2) / `senior` (Yr3→6) via `bandForLevel()` | `lib/brain-break.ts:234` |
| "Different game next time" | ✅ `pickVillain()` rotates the archetype, never same game back-to-back | `lib/brain-break.ts:245` |
| Always winnable | ✅ Auto-victory on `durationSec` timeout | `BrainBreak.tsx:65` |

**8 mechanics exist today:** `whack`, `slash`, `keepuppy`, `charge`, `duel`, `dodge`, `copyme`, `trace`.

### Two honest problems to fix while we expand

1. **Games are not age-banded — only villains are.** A junior student only sees junior *villains*, and therefore only the games those 6 villains happen to ride. That's coincidental, not designed. The brief wants the **roster itself** to vary by age. → We will tag every mechanic with an explicit band (`junior` / `senior` / `both`) and pick the game from a band-filtered pool, not as a side-effect of villain choice.
2. **Durations contradict the 45–60s spec.** `durationSec` ranges from **18s** (Time Snatcher / dodge) to **55s** (Gamer Gremlin). Several breaks are far too short to immerse. → Normalise every game to a **45–60s** session with a built-in intensity ramp and guaranteed win.

---

## 1. Design framework: how games vary by age level

This is the centrepiece change. Three buckets:

| Band | Year levels | Cognitive style | Physical demand | Pace & feel |
| --- | --- | --- | --- | --- |
| **Junior** | Prep – Year 2 | Reaction, observation, simple memory | One finger, **big** targets, no precision-under-pressure | Forgiving, gentle ramp, calm-to-excited |
| **Senior** | Year 3 – Year 6 | Planning, strategy, spatial routing, tighter timing | Swipe / flick / steer, smaller targets | Faster ramp, more intensity, higher "cool factor" |
| **Both (scalable)** | All | Same loop, parameters scale by band | Target size, speed, spawn rate, win threshold scale | Auto-tunes |

**Rule of thumb:** *Junior games test "can you react/notice?". Senior games test "can you plan/route under pressure?".* "Both" games keep one mechanic and scale the numbers.

A junior lesson draws only from `{junior, both}`; a senior lesson draws only from `{senior, both}`. The existing archetype-rotation guarantee is preserved on top of this filter.

---

## 2. The roster (15 mini-games)

Legend — **Status:** `HAVE` (ships today, keep) · `REFINE` (exists, needs a tune) · `NEW` (build).
**Band:** `J` junior · `S` senior · `B` both.

| # | Game | Inspired by | Band | Status |
| --- | --- | --- | --- | --- |
| 1 | Whack-a-Worry | Whack-a-mole | J | HAVE (`whack`) |
| 2 | Star Swipe | Fruit Ninja | B | REFINE (`slash` → true swipe) |
| 3 | Keep-It-Up | Keepie-uppie | J | HAVE (`keepuppy`) |
| 4 | Dodge Dash | Frogger / bullet-dodge | B | REFINE (`dodge`, fix 18s) |
| 5 | Copycat Crystals | Simon | B | HAVE (`copyme`) |
| 6 | Trace the Rune | Path-trace | J | HAVE (`trace`) |
| 7 | Focus Tug | Tug-of-war | B | HAVE (`duel`) |
| 8 | Bubble Breath | Calm / breathing | J | REFINE (`charge` → rhythm) |
| 9 | Pop Wall | Bubble Shooter | B | NEW |
| 10 | Brick Buster | Breakout | S | NEW |
| 11 | Trick Shot | Basketball / Mini Golf | B | NEW |
| 12 | Glow Snake | Snake | S | NEW |
| 13 | Gobble Glow | Pac-Man | S | NEW |
| 14 | Bumper Blast | Pinball | S | NEW |
| 15 | Memory Match Flip | Concentration | J | NEW |

That's **8 we keep/refine + 7 new = 15**, spread: **Junior 5, Senior 4, Both 6.** Every band has a full deck so no student sees a thin rotation.

---

## 3. Game-by-game design

> Format per the brief: Name · Core Mechanic · Player Goal · Villain Integration · Controls · Progression · Why It Feels Different. Plus **Band** and **Build status**.

### 1. Whack-a-Worry  · `HAVE` · Junior
- **Core mechanic:** Tap villain minions the instant they pop up.
- **Player goal:** Bop the target count before time runs out.
- **Villain integration:** The minions wear the villain's face/emoji (`targetEmoji`); the villain taunts from the HUD. Any villain reskins it for free.
- **Controls:** Tap.
- **Progression:** Spawn interval tightens and up to 5 are on screen at once as the 45s elapse.
- **Why it feels different:** Pure twitch reaction — the only "find it and hit it *now*" game. No thinking, all instinct. Perfect first-week junior energy.

### 2. Star Swipe  · `REFINE` · Both
- **Core mechanic:** Swipe a glowing blade through distractions arcing up the screen (don't tap — *slash*).
- **Player goal:** Slice the target count; combos for multiple in one stroke.
- **Villain integration:** Distractions are the villain's icon; occasionally the villain throws a "bomb" version you should *not* slice (senior only).
- **Controls:** Swipe / drag-through.
- **Progression:** More objects, faster arcs, then a finale flurry of easy ones so everyone wins.
- **Why it feels different:** The only continuous-stroke game — satisfying Fruit-Ninja "shhwack". *Refine:* current `slash` registers on tap, not swipe — make it a real drag-through-hitbox so it earns its name.

### 3. Keep-It-Up  · `HAVE` · Junior
- **Core mechanic:** Tap a falling focus-orb to keep bopping it skyward.
- **Player goal:** Reach the bop count without letting it settle.
- **Villain integration:** The orb is the villain's emoji; villain "weighs it down" (slightly higher gravity) for spicier villains.
- **Controls:** Tap (timing).
- **Progression:** Gravity nudges up and horizontal drift widens, so taps need better timing late-game. Gentle auto-bounce floor means it never truly fails.
- **Why it feels different:** Rhythmic, hypnotic, one-object focus — calming concentration rather than urgency.

### 4. Dodge Dash  · `REFINE` · Both
- **Core mechanic:** Drag your hero to weave through the villain's incoming projectiles.
- **Player goal:** Survive the clock; the survival bar fills to victory.
- **Villain integration:** Projectiles are the villain's icon, fired from the edges; villain personality = projectile pattern (Time Snatcher = clock barrage, Doom Scroller = scroll-wave).
- **Controls:** Drag.
- **Progression:** Spawn rate and speed climb; a calm "eye of the storm" lull before a final wave.
- **Why it feels different:** The only "don't get touched" survival game — suspense and near-misses. *Refine:* bump the 18s duration to ~45s and scale projectile speed by band (juniors slower/bigger gaps).

### 5. Copycat Crystals  · `HAVE` · Both
- **Core mechanic:** Watch a glowing 4-pad sequence, then tap it back (Simon).
- **Player goal:** Repeat 3 growing rounds (2 → 3 → 4 for junior; 3 → 4 → 5 for senior).
- **Villain integration:** Villain "scrambles your memory" — its taunt plays over the watch phase; senior villains add a fake flash as a feint.
- **Controls:** Tap (memory). Forgiving — a wrong tap replays the same pattern, never restarts.
- **Progression:** Sequence length grows each round; flash speed quickens slightly.
- **Why it feels different:** The only pure-memory game — concentration and recall, not reflex.

### 6. Trace the Rune  · `HAVE` · Junior
- **Core mechanic:** Drag along a glowing path without leaving it.
- **Player goal:** Reach the end node to seal the rune.
- **Villain integration:** The marker is the villain's icon being "dragged back to focus"; the seal lights in the villain's colour.
- **Controls:** Trace / drag.
- **Progression:** Path is gentle and forgiving (wide tolerance) — calm fine-motor focus rather than a difficulty climb.
- **Why it feels different:** Slowest, calmest game — deliberate steadiness. The breath-slowing option in the deck.

### 7. Focus Tug  · `HAVE` · Both
- **Core mechanic:** Tap as fast as you can to drag a tug-of-war bar past the villain.
- **Player goal:** Pull the bar to 100% before it drains.
- **Villain integration:** It's literally hero vs villain face on a rope; villain "pulls back" = the drain rate (scaled by band — gentler for juniors).
- **Controls:** Rapid tap.
- **Progression:** Drain rate ticks up near the end for a tense final push, but the tap gain always out-paces a committed player.
- **Why it feels different:** The only head-to-head contest — pure competitive energy and a clear "I beat them" moment.

### 8. Bubble Breath  · `REFINE` · Junior (calm)
- **Core mechanic:** Hold to inflate a bubble as a breathing ring expands, release as it contracts — match the rhythm.
- **Player goal:** Complete 3 calm breath cycles to "blow the villain away".
- **Villain integration:** The villain is trapped in the bubble; each successful breath cycle pushes it further off-screen until it pops away.
- **Controls:** Hold / release (rhythm).
- **Progression:** No intensity ramp by design — it's the deliberate down-regulation game; the only thing that grows is the bubble.
- **Why it feels different:** Genuine self-regulation moment disguised as a game — the calm counterpoint to the arcade. *Refine:* current `charge` is a frantic tap-to-fill meter; re-skin it into a paced breathing rhythm so the deck has a true calm option.

### 9. Pop Wall  · `NEW` · Both
- **Core mechanic:** Aim and launch a focus-orb up to pop a cluster of 3+ matching-colour distractions (Bubble Shooter).
- **Player goal:** Clear enough of the wall before it descends to the line.
- **Villain integration:** The wall is built from the villain's distraction icons in 3–4 colours; the villain pushes the wall down one row at intervals.
- **Controls:** Drag to aim, release to fire (or tap-to-aim for juniors).
- **Progression:** Wall descends faster; bigger clusters appear for satisfying chain-pops near the end.
- **Why it feels different:** The only aim-and-match game — light planning ("which colour clears the most?") with a physical aiming action.

### 10. Brick Buster  · `NEW` · Senior
- **Core mechanic:** Slide a paddle to bounce a light-ball and smash the villain's brick wall (Breakout).
- **Player goal:** Break enough bricks before the timer; never truly lose the ball (a safety floor catches it).
- **Villain integration:** Bricks spell the villain's "fog wall"; some bricks are the villain's face and worth bonus shatter FX.
- **Controls:** Drag paddle left/right.
- **Progression:** Ball speeds up; a second ball drops in for a chaotic, high-clear finale.
- **Why it feels different:** Continuous physics + spatial anticipation (predict the bounce) — busier and more "skill-mastery" than the junior games. Senior cool-factor.

### 11. Trick Shot  · `NEW` · Both
- **Core mechanic:** Flick (drag-and-release) to launch XP into a moving goal — hoop or hole (Basketball / Mini Golf).
- **Player goal:** Sink the target number of shots.
- **Villain integration:** The villain guards/moves the goal (slides the hoop, tilts the green); harder villains move it faster.
- **Controls:** Flick — pull back, aim, release. Arc + power from the drag vector.
- **Progression:** Goal moves faster and further; a generous final "buzzer" shot guarantees the win.
- **Why it feels different:** The only ballistic/power-meter game — judging force and arc. Big satisfying "swish" payoff per shot.

### 12. Glow Snake  · `NEW` · Senior
- **Core mechanic:** Steer a growing light-trail to eat XP orbs without crossing your own tail (Snake).
- **Player goal:** Eat the target number of orbs.
- **Villain integration:** The villain drops "distraction" tiles that shrink your trail if touched — risk/reward routing around them.
- **Controls:** Drag to steer / swipe to turn.
- **Progression:** Snake lengthens and speeds up, so late-game routing is the real challenge.
- **Why it feels different:** The only self-collision planning game — spatial foresight under growing constraint. Distinctly "senior brain".

### 13. Gobble Glow  · `NEW` · Senior
- **Core mechanic:** Steer a muncher around a simple maze eating XP dots while the villain chases (Pac-Man).
- **Player goal:** Clear the dots (or hit the count) before being cornered.
- **Villain integration:** The villain *is* the ghost — it chases with its own personality (Snooze Sloth = slow lurker, Time Snatcher = quick darter). Grab a power-glow to briefly turn the tables.
- **Controls:** Drag / swipe to set direction.
- **Progression:** Villain speeds up; a power-glow pickup gives a triumphant chase-reversal near the end so the student always wins.
- **Why it feels different:** The only pursuit-and-route game — simultaneous "collect + evade" spatial planning. The arcade's flagship senior cartridge.

### 14. Bumper Blast  · `NEW` · Senior
- **Core mechanic:** Tap left/right flippers to keep a ball alive and smash villain bumpers (Pinball).
- **Player goal:** Hit the bumper-points target before the ball drains.
- **Villain integration:** Bumpers are villain faces; lighting all of them "overloads" the villain. A safety net under the flippers means no instant loss.
- **Controls:** Tap left / tap right (flippers).
- **Progression:** A multiball and a bonus bumper appear late for a points surge to the finish.
- **Why it feels different:** The only chaotic-physics reaction game — controlled randomness, lots of lights and noise. High-energy spectacle.

### 15. Memory Match Flip  · `NEW` · Junior
- **Core mechanic:** Flip cards two at a time to find matching pairs (Concentration).
- **Player goal:** Match all pairs (3–4 pairs for juniors) before time runs out.
- **Villain integration:** Cards show villain minions; the villain briefly "shuffles" two unmatched cards once as a gentle taunt.
- **Controls:** Tap to flip.
- **Progression:** Starts with a free peek of all cards; grid grows from 6 to 8 cards mid-game.
- **Why it feels different:** The only spatial-memory game — remembering *positions*, calm and methodical. A junior memory counterpart to the reflex games.

---

## 4. Emotional & action coverage check

The brief demands variety across actions, thinking, and emotion. Roster coverage:

- **Physical actions:** tap (1,5,15), swipe (2,12), drag (4,6,10), flick (11), hold/rhythm (8), aim-release (9,11), steer (12,13), flipper-tap (14). ✅ all six+.
- **Thinking:** reaction (1,2,4,14), memory (5,15), observation (1,2), timing (3,8,11), pattern (5), planning/routing (9,10,12,13). ✅ all six.
- **Emotion:** excitement (2,11,14), urgency (1,4,7), concentration (5,6,15), calm (8,3), suspense (4,13), satisfaction (9,11). ✅ all six.

No two games are reskins of each other — each owns a distinct verb + cognition pairing.

---

## 5. Technical changes required

Small, additive — no new architecture (consistent with how the system is built today).

1. **`lib/brain-break.ts`**
   - Extend `BrainBreakGame` union with the 7 new ids: `popwall`, `brickbuster`, `trickshot`, `glowsnake`, `gobbleglow`, `bumperblast`, `memmatch`. Rename `charge` usage to a `breathe` rhythm variant (or add `breathe` and retire `charge`).
   - Add a `band` (or `bands: VillainBand[]`) field to a new **`GAMES`** registry so games are filterable by age, independent of villains.
   - Update `pickVillain()` → `pickBreak()` to choose **(game, villain)** as a pair: filter games by band first, then dress with any band-appropriate villain. Keep the never-repeat-archetype rotation.
2. **`components/lesson/BrainBreak.tsx`**
   - Add one component per new mechanic (mirrors the existing `WhackGame`/`DodgeGame` pattern — self-contained, `onWin`/`onHit` callbacks, rAF loops).
   - Normalise all games to a **45–60s** session with an intensity ramp + guaranteed auto-win.
3. **`lib/brain-break-settings.ts`** — unchanged (frequency logic still applies).
4. **No DB/save changes** — breaks are ephemeral; resume already handles them.

---

## 6. Honest build assessment & recommended phasing

The 7 new games are not equal effort. Physics games (Snake, Pac-Man, Breakout, Pinball) are real builds; match/aim games are lighter.

| Phase | Work | Why first |
| --- | --- | --- |
| **P0 — Fix what we have** (½ day) | Band-tag the 8 existing games; build the `GAMES` registry + `pickBreak()`; normalise durations to 45–60s; make `slash` a true swipe. | Immediately delivers "games vary by age level" — your core ask — using only existing mechanics. |
| **P1 — Lightweight new games** (1–2 days) | Memory Match Flip (J), Pop Wall (B), Trick Shot (B), Bubble Breath refine (J). | Fast wins; fills the junior + calm gaps. |
| **P2 — Senior physics flagships** (2–4 days) | Glow Snake, Gobble Glow, Brick Buster, Bumper Blast. | Biggest "wow", but heaviest build — do once the framework is proven. |

**Recommendation:** ship **P0 first** as a standalone PR. It satisfies the headline request (age-varied roster + correct 45–60s length) with zero new game code, then we layer the new cartridges in.

---

## 7. Decisions (locked)

1. **Junior vs senior split → keep Year 2 / Year 3.** Junior = Prep–Yr2, Senior = Yr3–6, matching the existing `bandForLevel()`. No banding migration.
2. **`charge` (Worry Wasp's SEL meter) → re-skin into Bubble Breath.** The frantic tap-to-fill meter becomes a paced breathing-rhythm game (game #8); `charge` is retired, not kept alongside. Deck gains a true calm option.
3. **Scope → design approved, implementation not started.** Build order when greenlit remains P0 → P1 → P2 (section 6).
