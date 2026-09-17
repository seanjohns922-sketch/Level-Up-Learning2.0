import type { StarpathShape } from "@/data/activities/year1/practice-task";
import type { ShapeObjectId } from "@/data/activities/starpath/ground/shape-objects";
import type { StarpathBuildObjectId } from "@/data/activities/starpath/ground/shape-builds";
import { GROUND_STARPATH_FORMS, type GroundStarpathForm } from "./groundStarpathFiveForms";

export type ShapeSpec = { shape: StarpathShape; colour: string; rotation?: number; scale?: number; stretch?: number; vertices?: [number, number][] };
export type GroundScene = { items: { object: string; x: number; y: number; size?: number; layer?: number }[]; prop?: { kind: "basket" | "table" | "fence"; layer: number } };
export type GroundVisual =
  | { kind: "shapes"; shapes: ShapeSpec[] }
  | { kind: "object"; object: ShapeObjectId }
  | { kind: "picture"; object: StarpathBuildObjectId; pieces: string[] }
  | { kind: "scene"; scene: GroundScene }
  | { kind: "change"; before: GroundScene; after: GroundScene };
export type GroundOption = { id: string; label?: string; shape?: ShapeSpec; object?: string };
export type GroundTask = {
  prompt: string; instruction?: string; visual?: GroundVisual;
  mode: "choice" | "multi" | "draw" | "compose" | "place";
  options?: GroundOption[]; correctIds?: string[];
  reasons?: { id: string; label: string }[]; correctReason?: string;
  drawShape?: "triangle" | "square" | "rectangle";
  initialPieces?: { x: number; y: number; turn: number }[];
  subject?: string; reference?: string; relation?: "above" | "below" | "beside";
};
export type GroundRedesignItem = {
  id: string; version: "4.0.0"; form: GroundStarpathForm; prompt: string; readAloudText: string;
  primaryDescriptorCode: "AC9MFSP01" | "AC9MFSP02"; skillLabel: string; difficulty: "easy" | "moderate" | "challenging";
  linkedWeeks: number[]; task: GroundTask;
};
export const GROUND_REDESIGN_BLUEPRINT = [
  "Recognise a familiar shape", "Recognise a turned shape", "Name a shape", "Find a shape in an object",
  "Sort by shape", "Explain a shape group", "Find and explain the odd shape", "Compare shape features",
  "Create a triangle", "Create a four-sided shape", "Combine pieces", "Choose a picture piece and explain",
  "Describe above or below", "Describe beside", "Describe inside or outside", "Describe under or on top",
  "Describe in front or behind", "Place an object", "Use two position clues", "Describe a changed position",
] as const;
const purple = "#a78bfa";
const colours = ["#fbbf24", "#67e8f9", "#f9a8d4", "#a78bfa", "#86efac"];
const shape = (name: StarpathShape, rotation = 0, colour = purple, scale = 1, stretch = 1): ShapeSpec => ({ shape: name, rotation, colour, scale, stretch });
const words = (labels: string[]) => labels.map((label, i) => ({ id: `o${i}`, label }));
const shapes = (values: ShapeSpec[]) => values.map((s, i) => ({ id: `o${i}`, shape: s }));
const shuffle = <T,>(items: T[], offset: number) => [...items.slice(offset % items.length), ...items.slice(0, offset % items.length)];
const nameOptions = (s: StarpathShape): StarpathShape[] => s === "rectangle" ? [s, "triangle", "circle"] : s === "square" ? [s, "circle", "triangle"] : [s, s === "circle" ? "square" : "circle", "rectangle"];
const properties: Record<StarpathShape, string> = { triangle: "They have three straight sides.", square: "They have four straight sides.", rectangle: "They have four straight sides.", circle: "They have no corners.", oval: "They have no corners." };
const capital = (s: string) => s[0].toUpperCase() + s.slice(1);
const twoObjects = (subject: string, reference: string, relation: "above" | "below" | "beside", side = 1): GroundScene => ({ items: [
  { object: reference, x: relation === "beside" ? 150 - side * 60 : 150, y: relation === "above" ? 175 : relation === "below" ? 65 : 120, size: 86 },
  { object: subject, x: relation === "beside" ? 150 + side * 60 : 150, y: relation === "above" ? 65 : relation === "below" ? 175 : 120, size: 74 },
] });

// Each row is authored for a form. Variation changes geometry, reference objects,
// target concepts and scenes; no recursive word substitution or recolour-only forms.
const configs = [
  { first: "triangle", second: "square", named: "circle", object: "clock", part: "clock face", objectShape: "circle", sort: "triangle", group: "circle", odd: "circle", family: "triangle", draw: "square", picture: "house", pieces: ["home", "door", "window"], missing: "roof", pieceShape: "triangle", reason: "It has a point for the roof.", subject: "star", reference: "rocket", above: true, beside: "explorer", partner: "alien", inside: true, under: true, behind: true, place: "beside", clue: "crystal", changed: "below" },
  { first: "rectangle", second: "circle", named: "triangle", object: "door", part: "door", objectShape: "rectangle", sort: "square", group: "triangle", odd: "triangle", family: "square", draw: "rectangle", picture: "rocket", pieces: ["body", "window", "fin-left", "fin-right"], missing: "nose", pieceShape: "triangle", reason: "It has a point for the nose.", subject: "moon", reference: "satellite", above: false, beside: "alien", partner: "explorer", inside: false, under: false, behind: false, place: "above", clue: "star", changed: "beside" },
  { first: "circle", second: "triangle", named: "square", object: "window", part: "window frame", objectShape: "square", sort: "circle", group: "square", odd: "square", family: "circle", draw: "square", picture: "house", pieces: ["home", "roof", "door"], missing: "window", pieceShape: "square", reason: "It has four equal sides for a square window.", subject: "crystal", reference: "planet", above: true, beside: "explorer", partner: "geospin", inside: true, under: false, behind: false, place: "below", clue: "moon", changed: "above" },
  { first: "square", second: "rectangle", named: "circle", object: "flag", part: "cloth on the flag", objectShape: "triangle", sort: "triangle", group: "rectangle", odd: "rectangle", family: "triangle", draw: "rectangle", picture: "rocket", pieces: ["body", "nose", "fin-left", "fin-right"], missing: "window", pieceShape: "circle", reason: "It is round for a round window.", subject: "planet", reference: "flag", above: false, beside: "geospin", partner: "alien", inside: false, under: true, behind: true, place: "beside", clue: "planet", changed: "below" },
  { first: "triangle", second: "circle", named: "rectangle", object: "crate", part: "front of the crate", objectShape: "square", sort: "rectangle", group: "circle", odd: "triangle", family: "rectangle", draw: "square", picture: "house", pieces: ["home", "roof", "window"], missing: "door", pieceShape: "rectangle", reason: "It is tall with straight sides for the doorway.", subject: "satellite", reference: "moon", above: true, beside: "alien", partner: "geospin", inside: true, under: false, behind: true, place: "above", clue: "rocket", changed: "beside" },
] as const;

function makeTasks(f: number): GroundTask[] {
  const c = configs[f];
  let choiceNumber = f;
  const choice = (prompt: string, options: GroundOption[], correct = "o0", visual?: GroundVisual): GroundTask => ({ mode: "choice", prompt, options: shuffle(options, choiceNumber++ % options.length), correctIds: [correct], visual });
  const recognise = (target: StarpathShape, turn: number) => choice(`Tap the ${target}.`, shapes(nameOptions(target).map((s, n) => shape(s, turn + n * 13, purple, .95, s === "triangle" ? .8 + f * .08 : 1))));
  const sorted = [c.sort, c.sort === "circle" ? "triangle" : "circle", c.sort === "rectangle" ? "triangle" : "rectangle", c.sort, c.sort === "square" ? "oval" : c.sort === "rectangle" ? "oval" : "square", c.sort] as StarpathShape[];
  const group = { kind: "shapes" as const, shapes: [shape(c.group, f * 18, colours[f], 1), shape(c.group, 70 + f * 12, colours[(f + 1) % 5], .65), shape(c.group, 155 + f * 10, colours[(f + 2) % 5], .85)] };
  const oddOptions = shapes([shape(c.family, 15 + f * 17), shape(c.odd, -22 - f * 7), shape(c.family, 95 + f * 16), shape(c.family, 165 + f * 11)]);
  const oddReason = c.odd === "circle" ? "It has no corners. The others have corners." : c.family === "circle" ? "It has straight sides. The others are round." : c.odd === "triangle" ? "It has three sides. The others have four." : "It has four sides. The others have three.";
  const features = f % 2 === 0 ? ["square", "rectangle"] as const : ["triangle", "rectangle"] as const;
  const compareReason = f % 2 === 0 ? "Both have four straight sides." : "Both have straight sides and corners.";
  const relative = c.above ? "above" : "below";
  const locWords = words([`Above the ${c.reference}`, `Below the ${c.reference}`, `Beside the ${c.reference}`]);
  const insideScene: GroundScene = { prop: { kind: "basket", layer: 2 }, items: [{ object: c.subject, x: c.inside ? 150 : 55, y: c.inside ? 148 : 145, size: 64, layer: 1 }] };
  const artworkBottom: Record<string, number> = { star: 99.5, moon: 98.5, crystal: 108.5, planet: 91.5, satellite: 78.5 };
  const underScene: GroundScene = { prop: { kind: "table", layer: 1 }, items: [{ object: c.subject, x: 150, y: c.under ? 193 : 119 - (artworkBottom[c.subject] - 60) * 70 / 120, size: 70, layer: 2 }] };
  const depthScene: GroundScene = { prop: { kind: "fence", layer: c.behind ? 2 : 0 }, items: [{ object: c.beside, x: 150, y: 122, size: 116, layer: 1 }] };
  const other = c.clue === "star" ? "moon" : "star";
  const clueScene: GroundScene = { items: [{ object: c.clue, x: f % 2 ? 215 : 85, y: 65 }, { object: c.partner, x: f % 2 ? 215 : 85, y: 175 }, { object: "flag", x: f % 2 ? 85 : 215, y: 65 }, { object: other, x: f % 2 ? 85 : 215, y: 175 }] };
  return [
    recognise(c.first, 12 + f * 17),
    recognise(c.second, 37 + f * 19),
    choice("What is the name of this shape?", words(nameOptions(c.named).map(capital)), "o0", { kind: "shapes", shapes: [shape(c.named, 21 + f * 23, colours[f], .9)] }),
    choice(`What shape is the ${c.part}?`, words(nameOptions(c.objectShape).map(capital)), "o0", { kind: "object", object: c.object }),
    { mode: "multi", prompt: `Choose all the ${c.sort === "rectangle" ? "rectangles" : c.sort + "s"}.`, instruction: "Tap a shape to choose it. Tap it again to put it back.", options: shuffle(shapes(sorted.map((s, n) => shape(s, [0, 12, 30, 85, 10, 155][n] + f * 9, colours[(n + f) % 5], n === 5 ? .65 : .9))), f), correctIds: ["o0", "o3", "o5"] },
    choice("Why do these shapes belong together?", words([properties[c.group], "They are all the same colour.", "They are all the same size."]), "o0", group),
    { ...choice("Which shape does not belong?", oddOptions, "o1"), reasons: shuffle(words([oddReason, "It is a different colour.", c.odd === "triangle" ? "It has four straight sides." : "It has three straight sides."]), (f + 1) % 3), correctReason: "o0" },
    choice("What is true about both shapes?", words([compareReason, "Both have three straight sides.", "Both are round with no corners."]), "o0", { kind: "shapes", shapes: features.map((s, n) => shape(s, n * 20 + f * 10, colours[(f + n) % 5], .85)) }),
    { mode: "draw", prompt: `Make a triangle for ${["a flag", "a sail", "a roof", "a pennant", "a sign"][f]}.`, instruction: "Tap the dots to join them. Choose Next when you have finished.", drawShape: "triangle" },
    { mode: "draw", prompt: `Make a ${c.draw} for ${["a window", "a door", "a tile", "a book cover", "a picture frame"][f]}.`, instruction: "Tap the dots to join them. Choose Next when you have finished.", drawShape: c.draw },
    { mode: "compose", prompt: `Use both pieces to make a square ${["tile", "window", "sign", "mat", "picture"][f]}.`, instruction: "Move the pieces together. Tap a piece to choose it. Use Turn to turn it.", initialPieces: [{ x: 60, y: f % 2 ? 80 : 140, turn: f % 4 }, { x: 260, y: f % 2 ? 160 : 100, turn: (f + 1) % 4 }] },
    { ...choice(`Choose a shape for the ${c.missing === "roof" || c.missing === "nose" ? "pointed " : c.pieceShape === "circle" ? "round " : c.pieceShape === "square" ? "square " : "tall "}${c.missing} of this ${c.picture}.`, shapes(nameOptions(c.pieceShape).map((s, n) => shape(s, 0, colours[(f + n) % 5]))), "o0", { kind: "picture", object: c.picture, pieces: [...c.pieces] }), reasons: shuffle(words([c.reason, "Its colour tells us its shape.", "Any shape would look the same."]), (f + 2) % 3), correctReason: "o0" },
    choice(`Where is the ${c.subject} compared with the ${c.reference}?`, locWords, relative === "above" ? "o0" : "o1", { kind: "scene", scene: twoObjects(c.subject, c.reference, relative) }),
    choice(`Where is the ${c.beside} compared with the ${c.partner}?`, words([`Beside the ${c.partner}`, `Above the ${c.partner}`, `Below the ${c.partner}`]), "o0", { kind: "scene", scene: twoObjects(c.beside, c.partner, "beside", f % 2 ? -1 : 1) }),
    choice(`Where is the ${c.subject}?`, words(["Inside the basket", "Outside the basket", "Under the basket"]), c.inside ? "o0" : "o1", { kind: "scene", scene: insideScene }),
    choice(`Where is the ${c.subject} compared with the table?`, words(["Under the table", "On top of the table", "Beside the table"]), c.under ? "o0" : "o1", { kind: "scene", scene: underScene }),
    choice(`Where is the ${c.beside} compared with the fence?`, words(["Behind the fence", "In front of the fence", "Above the fence"]), c.behind ? "o0" : "o1", { kind: "scene", scene: depthScene }),
    { mode: "place", prompt: `Put the ${c.beside} ${c.place} the ${c.reference}.`, instruction: `Tap a space to put the ${c.beside} there.`, subject: c.beside, reference: c.reference, relation: c.place },
    choice(`Which object is above the ${c.partner} and beside the flag?`, words([capital(c.clue), capital(other), "Flag"]), "o0", { kind: "scene", scene: clueScene }),
    choice(`The ${c.subject} has moved. Where is it now compared with the ${c.reference}?`, words([`Above the ${c.reference}`, `Below the ${c.reference}`, `Beside the ${c.reference}`]), c.changed === "above" ? "o0" : c.changed === "below" ? "o1" : "o2", { kind: "change", before: twoObjects(c.subject, c.reference, c.changed === "above" ? "below" : "above"), after: twoObjects(c.subject, c.reference, c.changed) }),
  ];
}

export const GROUND_STARPATH_REDESIGNED_FORMS = Object.fromEntries(GROUND_STARPATH_FORMS.map((form, f) => [form, makeTasks(f).map((task, i): GroundRedesignItem => ({
  id: `y0-starpath-${form}-${String(i + 1).padStart(2, "0")}-v4`, version: "4.0.0", form,
  prompt: task.prompt, readAloudText: [task.prompt, task.instruction].filter(Boolean).join(" "),
  primaryDescriptorCode: i < 12 ? "AC9MFSP01" : "AC9MFSP02", skillLabel: GROUND_REDESIGN_BLUEPRINT[i],
  difficulty: i < 4 || i === 12 || i === 13 ? "easy" : i === 6 || i === 10 || i === 11 || i === 18 || i === 19 ? "challenging" : "moderate",
  linkedWeeks: [i < 4 ? 1 : i < 8 ? 3 : i < 12 ? 7 : i < 16 ? 4 : i < 18 ? 5 : 6], task,
}))])) as Record<GroundStarpathForm, GroundRedesignItem[]>;
