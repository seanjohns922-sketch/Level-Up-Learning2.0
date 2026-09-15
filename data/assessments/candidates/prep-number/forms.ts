import { ASSESSMENT_DESIGN_VERSION, ASSESSMENT_FORMS } from "../../design/assessmentContract";
import { PREP_NUMBER_SLOTS } from "../../design/prep";
import { PREP_NUMBER_CANDIDATE_VERSION, type PrepNumberCandidate, type PrepNumberTask, type Token } from "./types";

// Explicitly authored columns: pre, post, Start, Mid, End. These are not variants
// selected at random during a sitting. Repeated quantities in the bounded Prep
// domain are intentional; layout, target position and materials vary, not demand.
type Five<T> = readonly [T, T, T, T, T];
type Row = { prompts: Five<string>; tasks: Five<PrepNumberTask> };
const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
export function numberName(n: number): string { return words[n] ?? String(n); }
function same(prompt: string): Five<string> { return [prompt, prompt, prompt, prompt, prompt]; }
const rows: Row[] = [
  { prompts: same("Choose each number. You can listen to its name."), tasks: [
    { kind: "numerals", targets: [0, 17], choices: [[2,0,5],[7,17,19]] },
    { kind: "numerals", targets: [0, 18], choices: [[0,3,6],[18,8,16]] },
    { kind: "numerals", targets: [0, 19], choices: [[4,7,0],[17,9,19]] },
    { kind: "numerals", targets: [0, 16], choices: [[1,0,8],[6,16,18]] },
    { kind: "numerals", targets: [0, 15], choices: [[0,9,2],[17,5,15]] },
  ] },
  { prompts: same("Look at the dots. How many?"), tasks: [
    {kind:"count",count:4,layout:0,quickLook:true}, {kind:"count",count:4,layout:1,quickLook:true},
    {kind:"count",count:4,layout:2,quickLook:true}, {kind:"count",count:4,layout:3,quickLook:true},
    {kind:"count",count:4,layout:4,quickLook:true},
  ] },
  { prompts: same("How many objects?"), tasks: [
    {kind:"count",count:20,layout:0,quickLook:false}, {kind:"count",count:20,layout:1,quickLook:false},
    {kind:"count",count:20,layout:2,quickLook:false}, {kind:"count",count:20,layout:3,quickLook:false},
    {kind:"count",count:20,layout:4,quickLook:false},
  ] },
  { prompts: same("Put these parts together. How many altogether?"), tasks: [
    {kind:"combine",parts:[3,4]}, {kind:"combine",parts:[5,3]}, {kind:"combine",parts:[4,5]},
    {kind:"combine",parts:[4,3]}, {kind:"combine",parts:[3,5]},
  ] },
  { prompts: ["3 robots are here. Tap 2 more robots to join them.","4 stars are here. Tap 2 more stars to join them.","3 crystals are here. Tap 3 more crystals to join them.","4 robots are here. Tap 3 more robots to join them.","5 stars are here. Tap 2 more stars to join them."], tasks: [
    {kind:"add",start:3,change:2,supply:6}, {kind:"add",start:4,change:2,supply:6},
    {kind:"add",start:3,change:3,supply:6}, {kind:"add",start:4,change:3,supply:6},
    {kind:"add",start:5,change:2,supply:6},
  ] },
  { prompts: same("Share all the objects equally between the two trays."), tasks: [
    {kind:"share",total:6,recipients:2}, {kind:"share",total:8,recipients:2},
    {kind:"share",total:10,recipients:2}, {kind:"share",total:8,recipients:2},
    {kind:"share",total:6,recipients:2},
  ] },
  { prompts: same("Copy this pattern into the empty spaces."), tasks: [
    {kind:"pattern",source:["star","robot","star","robot"],palette:["robot","crystal","star"],blanks:4,copy:true},
    {kind:"pattern",source:["crystal","star","crystal","star"],palette:["star","robot","crystal"],blanks:4,copy:true},
    {kind:"pattern",source:["robot","crystal","robot","crystal"],palette:["crystal","star","robot"],blanks:4,copy:true},
    {kind:"pattern",source:["robot","star","robot","star"],palette:["star","crystal","robot"],blanks:4,copy:true},
    {kind:"pattern",source:["star","crystal","star","crystal"],palette:["crystal","robot","star"],blanks:4,copy:true},
  ] },
  { prompts: same("Put the numbers in order. Smallest first."), tasks: [
    {kind:"order",cards:[20,7,0,13]}, {kind:"order",cards:[6,20,12,0]},
    {kind:"order",cards:[14,0,20,8]}, {kind:"order",cards:[20,11,5,0]},
    {kind:"order",cards:[15,0,9,20]},
  ] },
  { prompts: same("How many objects belong in the empty part?"), tasks: [
    {kind:"missing",whole:8,part:3}, {kind:"missing",whole:9,part:4},
    {kind:"missing",whole:7,part:3}, {kind:"missing",whole:8,part:4},
    {kind:"missing",whole:9,part:5},
  ] },
  { prompts: same("Match one from A with one from B. Which has more?"), tasks: [
    {kind:"compare",a:8,b:6}, {kind:"compare",a:7,b:9}, {kind:"compare",a:9,b:7},
    {kind:"compare",a:6,b:8}, {kind:"compare",a:10,b:8},
  ] },
  { prompts: ["8 robots are here. Move 3 away.","9 stars are here. Move 4 away.","7 crystals are here. Move 3 away.","9 robots are here. Move 3 away.","8 stars are here. Move 4 away."], tasks: [
    {kind:"remove",start:8,change:3}, {kind:"remove",start:9,change:4},
    {kind:"remove",start:7,change:3}, {kind:"remove",start:9,change:3},
    {kind:"remove",start:8,change:4},
  ] },
  { prompts: same("Split all the objects between the two trays. Use both trays."), tasks: [
    {kind:"partition",total:7}, {kind:"partition",total:8}, {kind:"partition",total:9},
    {kind:"partition",total:8}, {kind:"partition",total:7},
  ] },
  { prompts: same("Which card has the same number of dots?"), tasks: [
    {kind:"match",count:5,choices:[4,5,3],layout:0}, {kind:"match",count:5,choices:[5,3,4],layout:1},
    {kind:"match",count:5,choices:[3,4,5],layout:2}, {kind:"match",count:5,choices:[4,3,5],layout:3},
    {kind:"match",count:5,choices:[3,5,4],layout:4},
  ] },
  { prompts: same("Make groups of 2. Use all the objects."), tasks: [
    {kind:"group",total:8,size:2}, {kind:"group",total:8,size:2}, {kind:"group",total:8,size:2},
    {kind:"group",total:8,size:2}, {kind:"group",total:8,size:2},
  ] },
  { prompts: ["Put 7 objects on the mat.","Put 8 objects on the mat.","Put 9 objects on the mat.","Put 6 objects on the mat.","Put 10 objects on the mat."], tasks: [
    {kind:"build",target:7,supply:12}, {kind:"build",target:8,supply:12},
    {kind:"build",target:9,supply:12}, {kind:"build",target:6,supply:12},
    {kind:"build",target:10,supply:12},
  ] },
  { prompts: same("Make different parts. Use all the objects and both trays. Swapping parts does not count."), tasks: [
    {kind:"partition",total:8,previous:[3,5]}, {kind:"partition",total:9,previous:[4,5]},
    {kind:"partition",total:7,previous:[3,4]}, {kind:"partition",total:8,previous:[2,6]},
    {kind:"partition",total:9,previous:[3,6]},
  ] },
  { prompts: same("The objects spread out. How many now? Choose why."), tasks: [
    {kind:"conserve",count:8,layout:0,reasons:["Nothing was added or taken away.","More space means more objects.","They are smaller now."]},
    {kind:"conserve",count:9,layout:1,reasons:["More space means more objects.","Nothing was added or taken away.","They are smaller now."]},
    {kind:"conserve",count:7,layout:2,reasons:["They are smaller now.","More space means more objects.","Nothing was added or taken away."]},
    {kind:"conserve",count:8,layout:3,reasons:["They are smaller now.","Nothing was added or taken away.","More space means more objects."]},
    {kind:"conserve",count:9,layout:4,reasons:["Nothing was added or taken away.","They are smaller now.","More space means more objects."]},
  ] },
  { prompts: same("Give each robot one object. Leave the extras in the supply."), tasks: [
    {kind:"provide",recipients:5,supply:10}, {kind:"provide",recipients:6,supply:10},
    {kind:"provide",recipients:7,supply:10}, {kind:"provide",recipients:6,supply:10},
    {kind:"provide",recipients:5,supply:10},
  ] },
  { prompts: same("Make the sharing equal. Keep all the objects."), tasks: [
    {kind:"share",total:8,recipients:2,initial:[5,3]}, {kind:"share",total:10,recipients:2,initial:[4,6]},
    {kind:"share",total:6,recipients:2,initial:[4,2]}, {kind:"share",total:8,recipients:2,initial:[3,5]},
    {kind:"share",total:10,recipients:2,initial:[6,4]},
  ] },
  { prompts: same("Build the next two parts of the pattern."), tasks: [
    {kind:"pattern",source:["crystal","robot","crystal","robot"],palette:["robot","star","crystal"],blanks:2,copy:false},
    {kind:"pattern",source:["star","robot","star","robot"],palette:["robot","crystal","star"],blanks:2,copy:false},
    {kind:"pattern",source:["crystal","star","crystal","star"],palette:["star","robot","crystal"],blanks:2,copy:false},
    {kind:"pattern",source:["star","crystal","star","crystal"],palette:["crystal","robot","star"],blanks:2,copy:false},
    {kind:"pattern",source:["robot","crystal","robot","crystal"],palette:["crystal","star","robot"],blanks:2,copy:false},
  ] },
];

const materials: readonly Five<Token>[] = [
  ["star","crystal","robot","leaf","shell"],
  ["crystal","robot","star","shell","leaf"],
  ["robot","star","crystal","leaf","shell"],
];
export const PREP_NUMBER_CANDIDATE_FORMS = Object.fromEntries(ASSESSMENT_FORMS.map((form, f) => [form,
  rows.map((row, i): PrepNumberCandidate => ({
    id: `number-0-${form}-${String(i+1).padStart(2,"0")}-candidate-1`,
    version: PREP_NUMBER_CANDIDATE_VERSION, blueprintVersion: ASSESSMENT_DESIGN_VERSION,
    form, slot: PREP_NUMBER_SLOTS[i]!, prompt: row.prompts[f], task: row.tasks[f],
    token: (i === 4 || i === 10) ? (["robot","star","crystal","robot","star"] as const)[f] : materials[i % 3][f],
    maximumScore: 1, status: "candidate",
  })),
])) as Record<typeof ASSESSMENT_FORMS[number], PrepNumberCandidate[]>;
