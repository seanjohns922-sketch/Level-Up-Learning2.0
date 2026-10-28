/** Rune Blocks rules (a block-rolling puzzle). The rune stone is 1 x 1 x 2.
 *  It stands up on one square or lies across two. Roll it onto the portal
 *  standing up to win; if any part hangs off the edge it falls.
 *
 *  Map characters:
 *    .  empty            o  stone           S  start (stone)     G  portal goal
 *    c  crumbling stone: breaks if the stone stands up on it
 *    s  soft switch: pressed by any part of the stone; toggles the bridges
 *    h  heavy switch: only pressed when the stone stands up on it; toggles the bridges
 *    b  bridge, starts closed   B  bridge, starts open
 */

export type Orient = "up" | "x" | "z";
export type BlockState = { x: number; z: number; o: Orient };
export type Dir = "left" | "right" | "up" | "down";
export type Level = { name: string; map: string[] };
export type Outcome = "ok" | "fall" | "crumble" | "win";

export function parseLevel(level: Level) {
  const rows = level.map;
  let start: BlockState = { x: 0, z: 0, o: "up" };
  rows.forEach((row, z) => [...row].forEach((ch, x) => { if (ch === "S") start = { x, z, o: "up" }; }));
  return { rows, start, width: Math.max(...rows.map((r) => r.length)), depth: rows.length };
}

export function cells(s: BlockState): Array<[number, number]> {
  if (s.o === "up") return [[s.x, s.z]];
  if (s.o === "x") return [[s.x, s.z], [s.x + 1, s.z]];
  return [[s.x, s.z], [s.x, s.z + 1]];
}

export function roll(s: BlockState, dir: Dir): BlockState {
  const { x, z, o } = s;
  if (o === "up") {
    if (dir === "right") return { x: x + 1, z, o: "x" };
    if (dir === "left") return { x: x - 2, z, o: "x" };
    if (dir === "down") return { x, z: z + 1, o: "z" };
    return { x, z: z - 2, o: "z" };
  }
  if (o === "x") {
    if (dir === "right") return { x: x + 2, z, o: "up" };
    if (dir === "left") return { x: x - 1, z, o: "up" };
    if (dir === "down") return { x, z: z + 1, o: "x" };
    return { x, z: z - 1, o: "x" };
  }
  if (dir === "down") return { x, z: z + 2, o: "up" };
  if (dir === "up") return { x, z: z - 1, o: "up" };
  if (dir === "right") return { x: x + 1, z, o: "z" };
  return { x: x - 1, z, o: "z" };
}

export function tileAt(rows: string[], x: number, z: number) {
  return rows[z]?.[x] ?? ".";
}

/** Whether a square can be stood on, given whether the bridges are open. */
export function solid(ch: string, bridgesOpen: boolean) {
  if (ch === "b") return bridgesOpen;
  if (ch === "B") return !bridgesOpen;
  return ch !== ".";
}

/** Apply one roll. Bridges flip each time the stone lands on a switch. */
export function step(rows: string[], s: BlockState, dir: Dir, bridgesOpen: boolean): { state: BlockState; bridgesOpen: boolean; outcome: Outcome } {
  const next = roll(s, dir);
  const under = cells(next).map(([x, z]) => tileAt(rows, x, z));
  if (under.some((ch) => !solid(ch, bridgesOpen))) return { state: next, bridgesOpen, outcome: "fall" };
  if (next.o === "up" && under[0] === "c") return { state: next, bridgesOpen, outcome: "crumble" };
  let open = bridgesOpen;
  if (under.includes("s") || (next.o === "up" && under[0] === "h")) open = !open;
  if (next.o === "up" && under[0] === "G") return { state: next, bridgesOpen: open, outcome: "win" };
  return { state: next, bridgesOpen: open, outcome: "ok" };
}

/** Fewest rolls to win (breadth-first search), or null if impossible. */
export function solve(level: Level): number | null {
  const { rows, start } = parseLevel(level);
  const key = (s: BlockState, b: boolean) => `${s.x},${s.z},${s.o},${b ? 1 : 0}`;
  const seen = new Set([key(start, false)]);
  let frontier: Array<{ s: BlockState; b: boolean }> = [{ s: start, b: false }];
  for (let depth = 1; depth <= 400 && frontier.length; depth += 1) {
    const next: Array<{ s: BlockState; b: boolean }> = [];
    for (const { s, b } of frontier) {
      for (const dir of ["left", "right", "up", "down"] as Dir[]) {
        const r = step(rows, s, dir, b);
        if (r.outcome === "win") return depth;
        if (r.outcome !== "ok") continue;
        const k = key(r.state, r.bridgesOpen);
        if (!seen.has(k)) { seen.add(k); next.push({ s: r.state, b: r.bridgesOpen }); }
      }
    }
    frontier = next;
  }
  return null;
}

export const RUNE_LEVELS: Level[] = [
  { name: "First Steps", map: [
    "ooo.......",
    "oSoooo....",
    "ooooooooo.",
    ".ooooooooo",
    ".....ooGoo",
    "......ooo.",
  ] },
  { name: "The Long Way", map: [
    "......oooo..",
    "oooo..ooGo..",
    "oSoo..oooo..",
    "oooo..oo....",
    "oooooooo....",
    "..oooooo....",
  ] },
  { name: "Narrow Path", map: [
    "ooo.........",
    "oSooooooooo.",
    "ooo......oo.",
    "........oooo",
    "........ooGo",
    "........oooo",
  ] },
  { name: "Winding Steps", map: [
    "oooo....",
    "oooo....",
    ".oSoo...",
    "....ooo.",
    "...oooo.",
    "....oo..",
    "....oo..",
    "...ooooo",
    "....G.o.",
    "......o.",
  ] },
  { name: "Crumbling Hall", map: [
    "oooo.......",
    "oSoccccooo.",
    "oooccccoGo.",
    ".ooccccooo.",
    "....ooo....",
  ] },
  { name: "Broken Bridge", map: [
    "oooooo...",
    "ooooo....",
    ".oSoo....",
    "....oo...",
    "....oo...",
    ".....o.G.",
    "...ooooo.",
    "...oooooc",
    "......o..",
    "......o..",
  ] },
  { name: "Ember Maze", map: [
    "ooooo.......",
    "oooooo......",
    ".oSooo......",
    "..o.oo......",
    "...ooo......",
    "....oo.oocoo",
    "....oooo.oc.",
    "...oooooo.o.",
    "...o...o..G.",
    ".......oo...",
  ] },
  { name: "Twin Switches", map: [
    "ooo....ooo.....",
    "oSoosbbooo.....",
    "ooo....oobbsooo",
    "...........oGoo",
    "...........ooo.",
  ] },
  { name: "Shattered Steps", map: [
    "o.............",
    "ooS...........",
    "ooooo.o...o...",
    ".ccoooooooo...",
    ".ooooooooco.o.",
    "....oco...oooG",
    "....ooo.......",
  ] },
  { name: "Ruin Run", map: [
    ".ooo.........o.",
    "oco..........oo",
    ".oco.oo......co",
    ".Soocoocoo..ooG",
    ".o...coo.oocccc",
    ".oo..occ.cocooo",
    "..o..oo....c...",
    "..c..ooo.......",
    "......o........",
  ] },
  { name: "Guardian's Test", map: [
    ".o..............",
    "ooSoco......ooGo",
    "ccooo..o...oooo.",
    ".oooooooooo.coco",
    "..cooooooooo.oo.",
    "....cooco.ooco..",
    ".....ooo...o....",
  ] },
  { name: "Heavy Gate", map: [
    "ooo.......ooo",
    "oSoooBBooooGo",
    "ooo..oo...ooo",
    "....ohoo.....",
    "....ooo......",
  ] },
];
