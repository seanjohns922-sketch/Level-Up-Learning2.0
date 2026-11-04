import type { ChanceVisual as ChanceToolVisual } from "@/data/activities/year1/practice-task";
// Static diagrams for Learn the Skill worked examples. Each one is drawn from the guide's own
// numbers, so the picture always matches the steps. Rendered by components/lesson/GuideVisual.tsx.
export type ShapeName = "circle" | "oval" | "triangle" | "square" | "rectangle" | "pentagon" | "hexagon" | "octagon" | "rhombus" | "kite" | "trapezium" | "parallelogram";
export type GuideVisual =
  | { kind: "thermometer"; min: number; max: number; step: number; value: number; labelEvery?: number }
  | { kind: "clock"; hour: number; minute: number }
  | { kind: "ruler"; length: number; end: number; start?: number; label?: string }
  | { kind: "gauge"; tool: "scale" | "jug"; max: number; step: number; value: number; unit: string }
  | { kind: "angle"; degrees: number; protractor?: boolean; label?: string }
  | { kind: "grid"; min: number; max: number; points?: { x: number; y: number; label?: string }[]; shapes?: { points: [number, number][]; dashed?: boolean; label?: string }[]; mirror?: { axis: "x" | "y"; at: number } }
  | { kind: "gridRef"; cols: number; rows: number; marks: { ref: string; label?: string }[]; path?: string[] }
  | { kind: "shapes"; items: { shape: ShapeName; label?: string; color?: string; scale?: number }[] }
  | { kind: "net"; cells: [number, number][]; labels?: string[]; marked?: number[] }
  | { kind: "spinner"; sectors: string[]; highlight?: string }
  | { kind: "diceGrid"; highlight: [number, number][] }
  | { kind: "blocks"; count: number; object: string; extra?: number }
  | { kind: "areaGrid"; rows: number; cols: number; unit?: string }
  | { kind: "perimeter"; sides: number[]; unit: string; shape?: "rectangle" | "triangle" }
  | { kind: "calendar"; days: number; startDay: number; highlight: number[]; label?: string }
  | { kind: "numberLine"; min: number; max: number; step: number; marks: { value: number; label: string }[]; labelEvery?: number }
  | { kind: "bars"; title: string; categories: string[]; values: number[] }
  | { kind: "dots"; title: string; min: number; max: number; values: number[] }
  | { kind: "scene"; rows: ScenePart[][] };

/**
 * Picture-led worked examples (Levels 1–2): the lesson's own objects, drawn from the example's numbers.
 * Every part is visible at rest. `step` hides a part until that step is chosen; `focus` lists the steps
 * that light it up. Numbers here must match the guide's example and steps (checked by the guide test).
 */
type PartBase = { step?: number; focus?: number[]; label?: string };
export type ScenePart = PartBase & (
  | { type: "counters"; n: number; icon?: string; cols?: number; second?: number; crossed?: number; crossStep?: number; frame?: boolean; ring?: number; ringStep?: number }
  | { type: "groups"; groups: number; each: number; fillStep?: number; object?: "counter" | "cube" }
  | { type: "array"; rows: number; cols: number }
  | { type: "blocks"; hundreds?: number; tens?: number; ones?: number }
  | { type: "money"; items: string[] }
  | { type: "image"; src: string; size?: number; alt: string; crop?: { width: number; x: [number, number]; y: [number, number] } }
  | { type: "units"; unit: "block" | "domino" | "clip"; n: number; width: number; gapAt?: number }
  | { type: "picture"; name: "robot" | "house" | "castle" | "pizza" | "clock" }
  | { type: "column"; op: "+" | "-"; top: string; bottom: string; answer?: string; answerStep?: number; carries?: string[]; carryStep?: number }
  | { type: "object3d"; id: "cube" | "sphere" | "cylinder" | "cone" | "prism" | "pyramid"; name?: string }
  | { type: "machine"; input: string; rule: string; output?: string; outputStep?: number }
  | { type: "chance"; visual: ChanceToolVisual; highlightStep?: number }
  | { type: "starmap"; cols: number; rows: number; places: { r: number; c: number; object?: string; symbol?: string; label?: string; step?: number }[]; explorer?: { r: number; c: number; facing?: "N" | "E" | "S" | "W" }; path?: { r: number; c: number }[]; pathStep?: number }
  | { type: "plot"; categories: { label: string; count: number }[] }
  | { type: "linegraph"; title: string; points: { label: string; value: number }[]; max: number; tick: number; mark?: number; markStep?: number }
  | { type: "tiles"; size: number; line?: "vertical" | "diagonal"; tiles: { r: number; c: number; colour: "orange" | "purple" | "teal"; step?: number }[] }
  | { type: "text"; text: string; big?: boolean; tone?: "answer" | "unknown"; then?: { step: number; text: string } }
  | { type: "sign"; text: string }
  | { type: "seq"; items: string[] }
  | { type: "tally"; n: number }
  | { type: "barModel"; whole: string; parts: string[]; unknown?: "whole" | number; answer?: string; answerStep?: number }
  | { type: "fraction"; shape: "square" | "circle" | "bar"; parts: number; shaded: number; shadeStep?: number }
  | { type: "line"; min: number; max: number; tick: number; labelEvery?: number; jumps?: { from: number; to: number; text?: string; step?: number }[]; marks?: { value: number; text?: string; step?: number; tone?: "answer" | "unknown" }[] }
  | { type: "pictograph"; icon: string; rows: { label: string; n: number }[] }
  | { type: "balance"; object: string; cubes: number; cubeSize?: "big" | "small" }
  | { type: "chips"; items: string[]; marked?: number[]; markStep?: number; arrows?: boolean }
  | { type: "visual"; visual: Exclude<GuideVisual, { kind: "scene" }> }
  | { type: "compass"; from: "north" | "east" | "south" | "west"; turns: number; turnStep?: number }
);

const MONEY: Record<string, string> = { "coin-5c": "5 cent coin", "coin-10c": "10 cent coin", "coin-20c": "20 cent coin", "coin-50c": "50 cent coin", "coin-1": "$1 coin", "coin-2": "$2 coin", "note-5": "$5 note", "note-10": "$10 note", "note-20": "$20 note", "note-50": "$50 note", "note-100": "$100 note" };
export const moneyName = (item: string) => MONEY[item] ?? item;
const blocksSaid = (b: { hundreds?: number; tens?: number; ones?: number }) => [b.hundreds ? plural(b.hundreds, "hundred") : "", b.tens ? plural(b.tens, "ten") : "", b.ones ? plural(b.ones, "one") : ""].filter(Boolean).join(", ");

/** Narrates one scene part, only from what is drawn. */
export function scenePartSpeech(p: ScenePart): string {
  const lead = p.label ? `${p.label}: ` : "";
  switch (p.type) {
    case "counters": return `${lead}${p.icon ? plural(p.n + (p.second ?? 0), "picture") : plural(p.n + (p.second ?? 0), "counter")}${p.second && p.n ? `, ${p.n} of one colour and ${p.second} of another` : ""}${p.frame ? " in a ten frame" : ""}${p.crossed ? `, with ${p.crossed} crossed out` : ""}.`;
    case "groups": return `${lead}${plural(p.groups, "group")} with ${p.each} in each.`;
    case "array": return `${lead}${plural(p.rows, "row")} of ${p.cols}.`;
    case "blocks": return `${lead}Base ten blocks: ${blocksSaid(p)}.`;
    case "money": return `${lead}${p.items.map(moneyName).join(", ")}.`;
    case "image": return `${lead}${p.alt}.`;
    case "units": return `${lead}${plural(p.n, UNIT_NAMES[p.unit])}${p.gapAt ? ", with a gap" : ""}.`;
    case "picture": return `${lead}A picture of a ${p.name}.`;
    case "column": return `${lead}${p.top} ${p.op === "+" ? "plus" : "minus"} ${p.bottom}, set out in columns.`;
    case "object3d": return `${lead}${p.name ?? `A ${p.id}`}.`;
    case "machine": return `${lead}A number machine. ${p.input} goes in, the rule is ${p.rule}.`;
    case "chance": return lead + chanceSaid(p.visual);
    case "starmap": return `${lead}A star map with ${p.places.map((x) => x.label ?? x.symbol ?? x.object).join(", ")}.`;
    case "tiles": return `${lead}A tile board with ${plural(p.tiles.length, "coloured tile")}${p.line ? `, and a ${p.line} mirror line` : ""}.`;
    case "linegraph": return `${lead}A line graph of ${p.title.toLowerCase()}. ${p.points.map((x) => `${x.label}: ${x.value}`).join(", ")}.`;
    case "plot": return `${lead}A column graph. ${p.categories.map((x) => `${x.label}: ${x.count}`).join(", ")}.`;
    // Pictures inside text (a pictograph key) are read as "1 symbol", not by their emoji names.
    case "text": return `${lead}${(p.then ? p.then.text : p.text).replace(/\p{Extended_Pictographic}\uFE0F?/gu, "1 symbol").replace(/◐/g, "a half symbol")}.`;
    case "sign": return "";
    case "seq": return `${lead}A pattern: ${p.items.map((x) => (x === "?" ? "a gap" : x)).join(", ")}.`;
    case "tally": return `${lead}Tally marks for ${p.n}.`;
    case "barModel": return `${lead}A bar model. The whole is ${p.unknown === "whole" ? (p.answer ?? "unknown") : p.whole}. The parts are ${p.parts.map((x, i) => (p.unknown === i ? (p.answer ?? "unknown") : x)).join(" and ")}.`;
    case "fraction": return `${lead}A ${p.shape} split into ${p.parts} equal parts, ${p.shaded} shaded.`;
    case "line": return `${lead}A number line from ${said(p.min)} to ${said(p.max)}.${(p.jumps ?? []).map((j) => ` A jump from ${said(j.from)} to ${said(j.to)}${j.text ? `, ${j.text}` : ""}.`).join("")}${(p.marks ?? []).map((m) => ` ${m.text ?? said(m.value)} is marked.`).join("")}`;
    case "pictograph": return `${lead}A picture graph. ${p.rows.map((r) => `${r.label}: ${r.n}`).join(", ")}.`;
    case "balance": return `${lead}A balance: ${p.object} on one side and ${plural(p.cubes, "cube")} on the other, level.`;
    case "chips": return `${lead}${p.items.join(p.arrows ? ", then " : ", ")}${p.marked?.length ? `. Marked: ${p.marked.map((i) => p.items[i]).join(", ")}` : ""}.`;
    case "visual": return lead + guideVisualSpeech(p.visual);
    case "compass": return `${lead}A compass. Starting facing ${p.from}, ${plural(p.turns, "quarter turn")} clockwise.`;
  }
}

const COLOUR_NAMES: Record<string, string> = { "#e5484d": "red", "#3b82f6": "blue", "#22c55e": "green", "#eab308": "yellow", "#8b5cf6": "purple" };
const colourWords = (xs: string[]) => countWords(xs.map((x) => COLOUR_NAMES[x.toLowerCase()] ?? x));
const chanceSaid = (v: ChanceToolVisual) => v.type === "scale" ? "A likelihood scale from impossible to certain." : v.type === "die" ? `A die showing ${v.face}.` : v.type === "coin" ? "A coin with heads and tails." : v.type === "spinner" ? `A spinner with ${colourWords(v.wedges)}.` : v.type === "bag" ? `A bag with ${colourWords(v.counters)}.` : "";
const UNIT_NAMES = { block: "block", domino: "domino", clip: "paper clip" };
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
const said = (n: number) => (n < 0 ? `negative ${-n}` : String(n));
const timeSaid = (h: number, m: number) => (m === 0 ? `${h} o'clock` : `${h}:${String(m).padStart(2, "0")}`);

/** Narrates only what the diagram shows. */
export function guideVisualSpeech(v: GuideVisual): string {
  switch (v.kind) {
    case "thermometer": return `A thermometer from ${said(v.min)} to ${said(v.max)} degrees Celsius, marked every ${v.step} degrees. The liquid reaches ${said(v.value)} degrees.`;
    case "clock": return `A clock showing ${timeSaid(v.hour, v.minute)}.`;
    case "ruler": return `A ruler in centimetres. ${v.label ?? "The object"} starts at ${v.start ?? 0} and ends at ${v.end}.`;
    case "gauge": return v.tool === "scale" ? `A scale up to ${v.max} ${v.unit}, marked every ${v.step}. The needle points to ${v.value} ${v.unit}.` : `A measuring jug up to ${v.max} ${v.unit}, marked every ${v.step}. The water reaches ${v.value} ${v.unit}.`;
    case "angle": return `${v.protractor ? "A protractor measuring an angle" : "An angle"} of ${v.degrees} degrees${v.label ? `, labelled ${v.label}` : ""}.`;
    case "grid": return `A coordinate grid from ${said(v.min)} to ${said(v.max)}. ${(v.points ?? []).map((p) => `${p.label ?? "A point"} at ${said(p.x)}, ${said(p.y)}`).join(". ")}${v.shapes?.length ? `. ${v.shapes.map((s) => `${s.label ?? (s.dashed ? "The image" : "A shape")} with corners ${s.points.map(([x, y]) => `${said(x)}, ${said(y)}`).join("; ")}`).join(". ")}` : ""}${v.mirror ? `. A mirror line on ${v.mirror.axis} = ${v.mirror.at}` : ""}.`;
    case "gridRef": return `A grid with columns A to ${String.fromCharCode(64 + v.cols)} and rows 1 to ${v.rows}. ${v.marks.map((m) => `${m.label ?? "A mark"} in ${m.ref}`).join(". ")}${v.path ? `. A route through ${v.path.join(", ")}` : ""}.`;
    case "shapes": return `${v.items.length === 1 ? "Shape shown" : "Shapes shown"}: ${v.items.map((s) => (s.label ? `${s.shape}, ${s.label}` : s.shape)).join("; ")}.`;
    case "net": return `A net of ${plural(v.cells.length, "square")}${v.marked?.length ? `, with ${v.marked.map((i) => v.labels?.[i] ?? `square ${i + 1}`).join(" and ")} marked` : ""}.`;
    case "spinner": return `A spinner with ${plural(v.sectors.length, "equal section")}: ${countWords(v.sectors)}.`;
    case "diceGrid": return `A 6 by 6 grid of two-dice pairs, with ${plural(v.highlight.length, "pair")} highlighted.`;
    case "blocks": return `${v.object} measured with blocks: ${plural(v.count, "block")}${v.extra ? ` and ${v.extra} small blocks` : ""}.`;
    case "areaGrid": return `A rectangle made of ${v.rows} rows of ${v.cols} squares.`;
    case "perimeter": return `A ${v.shape ?? "rectangle"} with sides ${v.sides.join(", ")} ${v.unit}.`;
    case "calendar": return `A calendar month with ${v.days} days. ${v.label ?? "Highlighted dates"}: ${v.highlight.join(", ")}.`;
    case "numberLine": return `A number line from ${said(v.min)} to ${said(v.max)}. ${v.marks.map((m) => `${m.label} at ${said(m.value)}`).join(". ")}.`;
    case "bars": return `${v.title}. ${v.categories.map((c, i) => `${c}: ${v.values[i]}`).join(", ")}.`;
    case "dots": return `${v.title}. A dot plot from ${v.min} to ${v.max} with ${plural(v.values.length, "dot")}.`;
    case "scene": return v.rows.flat().map(scenePartSpeech).filter(Boolean).join(" ");
  }
}
function countWords(xs: string[]) {
  const c = new Map<string, number>();
  for (const x of xs) c.set(x, (c.get(x) ?? 0) + 1);
  return [...c].map(([k, n]) => `${n} ${k}`).join(", ");
}
