import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { SOLID_META, SOLID_KINDS, type SolidKind } from "./solids";

type NetTask = Extract<PracticeTask, { kind: "starpathNet" }>;

const rot = <T,>(arr: T[], by: number) => arr.map((_, i) => arr[(i + by) % arr.length]!);
const order = <T,>(items: T[], round: number) => (round % 2 ? [...items].reverse() : items);

// A lesson may pin a specific solid; otherwise it rotates through the four.
const solidFor = (round: number, pinned?: SolidKind): SolidKind => pinned ?? SOLID_KINDS[round % SOLID_KINDS.length]!;

// Fold the net, then name the solid it makes. Options are the four solid names.
export function nameSolidTask(round: number, target: number, pinned?: SolidKind): NetTask {
  const kind = solidFor(round, pinned);
  const meta = SOLID_META[kind];
  const names = rot(SOLID_KINDS, round).map((k) => ({ id: k, label: SOLID_META[k].name }));
  return {
    kind: "starpathNet", mode: "nameSolid", render: "solid", netId: `l5-name-${round}`, target, solid: kind, fold: true,
    prompt: "Fold it up. Which solid does this net make?",
    speakText: "A net folds into a 3D solid. Fold this one up and name the solid it becomes.",
    textOptions: names, correctOptionIds: [kind],
    feedback: { correct: `Yes — this net folds into a ${meta.name.toLowerCase()}.`, wrong: "Fold it up and look at the finished solid — count the faces and their shapes to name it." },
  };
}

// How many faces does the folded solid have?
export function solidFacesTask(round: number, target: number, pinned?: SolidKind): NetTask {
  const kind = solidFor(round, pinned);
  const meta = SOLID_META[kind];
  const counts = order([4, 5, 6], round).map((n) => ({ id: `n${n}`, label: `${n} faces` }));
  return {
    kind: "starpathNet", mode: "solidFaces", render: "solid", netId: `l5-faces-${round}`, target, solid: kind, fold: true,
    prompt: "Fold it up. How many faces does this solid have?",
    speakText: "Every flat piece of the net becomes one face of the solid. Fold it up and count the faces.",
    textOptions: counts, correctOptionIds: [`n${meta.faceCount}`],
    feedback: { correct: `Right — a ${meta.name.toLowerCase()} has ${meta.faceCount} faces.`, wrong: "Count each flat piece of the net — every one becomes a face of the solid." },
  };
}

// What flat shapes make up this net?
export function solidPartsTask(round: number, target: number, pinned?: SolidKind): NetTask {
  const kind = solidFor(round, pinned);
  const meta = SOLID_META[kind];
  const distractors = SOLID_KINDS.filter((k) => k !== kind).map((k) => SOLID_META[k].parts);
  const options = order([
    { id: "a", label: capitalise(meta.parts) },
    { id: "b", label: capitalise(distractors[0]!) },
    { id: "c", label: capitalise(distractors[1]!) },
  ], round);
  return {
    kind: "starpathNet", mode: "solidParts", render: "solid", netId: `l5-parts-${round}`, target, solid: kind, fold: true,
    prompt: "Which flat shapes make up this net?",
    speakText: "Look at the flat net before it folds. Which shapes is it built from?",
    textOptions: options, correctOptionIds: ["a"],
    feedback: { correct: `Correct — a ${meta.name.toLowerCase()}'s net is ${meta.parts}.`, wrong: "Look carefully at the flat pieces — count the rectangles, squares and triangles." },
  };
}

function capitalise(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
