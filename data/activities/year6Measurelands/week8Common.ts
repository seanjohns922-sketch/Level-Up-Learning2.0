import type { PracticeTask } from "@/data/activities/year1/practice-task";
import { choose, shuffle } from "@/data/activities/year6Measurelands/week7Common";

// ── Measurelands · Level 6 · Week 8 — "Master Measurement Project" ─────────────
// The finale. No new mechanic and no new concept: students apply everything on
// the existing `investigation` card, extended so each solved part carries forward
// into a running spec, and L3 closes with a graduation reflection that unlocks
// the Post-Test. Plan → Design → Justify.

type InvestigationTask = Extract<PracticeTask, { kind: "investigation" }>;

function fmt12(min: number): string {
  const h24 = Math.floor(min / 60) % 24, m = ((min % 60) + 60) % 60, ap = h24 < 12 ? "am" : "pm";
  let h = h24 % 12; if (h === 0) h = 12;
  return `${h}:${String(m).padStart(2, "0")} ${ap}`;
}
function fmtDur(min: number): string {
  const h = Math.floor(min / 60), m = min % 60;
  if (h && m) return `${h} h ${m} min`;
  if (h) return `${h} h`;
  return `${m} min`;
}

const CHALLENGE = "Master Engineer Challenge";
const MISSION = "Master Measurelands Mission";

// The graduation close — shared by every L3 mission. Pick the skill that helped
// most; no right/wrong; every choice earns a personalised send-off + the Post-Test.
export const GRADUATION_REFLECTION: NonNullable<InvestigationTask["reflection"]> = {
  prompt: "Which skill made you a Master of Measurement?",
  speakText: "Which measurement skill helped you the most today? Choose the one that made you a Master of Measurement.",
  skills: [
    { label: "Length", iconKey: "m-length", message: "Length — you set out every path and edge with real precision." },
    { label: "Area", iconKey: "m-area", message: "Area — you covered fields, floors and gardens like a true designer." },
    { label: "Perimeter", iconKey: "m-perimeter", message: "Perimeter — you fenced and framed every space perfectly." },
    { label: "Volume", iconKey: "m-volume", message: "Volume — you filled tanks, pits and stores in three dimensions." },
    { label: "Time", iconKey: "m-time", message: "Time — you scheduled builds and journeys right to the minute." },
    { label: "Angles", iconKey: "m-angle", message: "Angles — you braced every structure at exactly the right turn." },
    { label: "Conversions", iconKey: "m-convert", message: "Conversions — you moved between units without ever slipping." },
  ],
};

// ── Lesson 1 · Design the Community Park (Plan) ───────────────────────────────
// Identify the maths first, then do it. Each context pairs a "Plan" decision
// with the matching calculation, carried forward.
export function parkPlan(): InvestigationTask {
  const L = choose([12, 14, 16]), W = choose([8, 10]), area = L * W, per = 2 * (L + W);
  return {
    kind: "investigation", title: "Design the Community Park", emoji: "🏞️", badgeLabel: CHALLENGE,
    prompt: "Design the community park.",
    facts: [`Lawn: ${L} m × ${W} m rectangle`, "The lawn needs new grass and a fence.", "You are the Lead Engineer — plan before you calculate."],
    parts: [
      { strategy: "Plan", spec: "Lawn needs", q: "The lawn needs new grass across its whole surface. Which measurement do you need?", options: shuffle(["Area", "Perimeter", "Length"]), answer: "Area" },
      { strategy: "Area", spec: "Grass", note: "Grass covers the surface inside the edge.", q: `The lawn is ${L} m × ${W} m. How much grass is that?`, options: shuffle([`${area} m²`, `${per} m`, `${L + W} m`]), answer: `${area} m²` },
      { strategy: "Plan", spec: "Edge needs", q: "The lawn needs a fence around its edge. Which measurement now?", options: shuffle(["Perimeter", "Area", "Volume"]), answer: "Perimeter" },
      { strategy: "Perimeter", spec: "Fence", note: "Fencing follows the edge all the way around.", q: `Fence the ${L} m × ${W} m lawn. How much fencing?`, options: shuffle([`${per} m`, `${area} m²`, `${L} m`]), answer: `${per} m` },
    ],
    feedback: { correct: "Park planned!", wrong: "Decide what you're measuring, then calculate." },
  };
}
export function sportsGroundPlan(): InvestigationTask {
  const L = choose([18, 20]), W = choose([10, 12]), area = L * W, ph = choose([1, 2]), pvol = 4 * 2 * ph;
  return {
    kind: "investigation", title: "Design the Sports Ground", emoji: "🏟️", badgeLabel: CHALLENGE,
    prompt: "Design the sports ground.",
    facts: [`Court: ${L} m × ${W} m rectangle`, `Long-jump pit: 4 m × 2 m × ${ph} m`, "Plan the turf and the sand yourself."],
    parts: [
      { strategy: "Plan", spec: "Court needs", q: "You must re-turf the whole court surface. Which measurement?", options: shuffle(["Area", "Perimeter", "Length"]), answer: "Area" },
      { strategy: "Area", spec: "Turf", note: "Turf covers the surface of the court.", q: `The court is ${L} m × ${W} m. How much turf?`, options: shuffle([`${area} m²`, `${2 * (L + W)} m`, `${L + W} m`]), answer: `${area} m²` },
      { strategy: "Plan", spec: "Pit needs", q: "You must fill the long-jump pit with sand. Which measurement?", options: shuffle(["Volume", "Area", "Perimeter"]), answer: "Volume" },
      { strategy: "Volume", spec: "Sand", note: "Filling a pit is three-dimensional.", q: `Fill the 4 m × 2 m × ${ph} m pit. How much sand?`, options: shuffle([`${pvol} m³`, `${4 * 2} m²`, `${pvol + 4} m³`]), answer: `${pvol} m³` },
    ],
    feedback: { correct: "Sports ground planned!", wrong: "Decide what you're measuring, then calculate." },
  };
}
export function communityGardenPlan(): InvestigationTask {
  const L = choose([6, 8]), W = choose([3, 4]), per = 2 * (L + W), pathM = choose([9, 12, 15]);
  return {
    kind: "investigation", title: "Design the Community Garden", emoji: "🌻", badgeLabel: CHALLENGE,
    prompt: "Design the community garden.",
    facts: [`Garden bed: ${L} m × ${W} m rectangle`, `Entry path: ${pathM} m long`, "Pavers are sold in centimetres, not metres."],
    parts: [
      { strategy: "Plan", spec: "Bed edge needs", q: "You'll edge the garden bed with timber all the way round. Which measurement?", options: shuffle(["Perimeter", "Area", "Volume"]), answer: "Perimeter" },
      { strategy: "Perimeter", spec: "Edging", note: "Edging follows the border of the bed.", q: `The bed is ${L} m × ${W} m. How much edging timber?`, options: shuffle([`${per} m`, `${L * W} m²`, `${L} m`]), answer: `${per} m` },
      { strategy: "Plan", spec: "Path units", q: "The path is listed in metres, but pavers are sold in centimetres. What must you do?", options: shuffle(["Convert", "Area", "Time"]), answer: "Convert" },
      { strategy: "Convert", spec: "Path", note: "1 m = 100 cm.", q: `The path is ${pathM} m long. How many centimetres is that?`, options: shuffle([`${pathM * 100} cm`, `${pathM * 10} cm`, `${pathM * 1000} cm`]), answer: `${pathM * 100} cm` },
    ],
    feedback: { correct: "Garden planned!", wrong: "Decide what you're measuring, then calculate." },
  };
}

// ── Lesson 2 · Engineer the School (Design) ───────────────────────────────────
// Flooring (area) → Fence/border (perimeter) → Storage (volume), one space,
// carried forward.
export function classroomEngineer(): InvestigationTask {
  const L = choose([8, 9]), W = choose([6, 7]), area = L * W, per = 2 * (L + W), ch = choose([2, 3]), cvol = 2 * 1 * ch;
  return {
    kind: "investigation", title: "Engineer the Classroom", emoji: "🏫", badgeLabel: CHALLENGE,
    prompt: "Engineer the classroom.",
    facts: [`Floor: ${L} m × ${W} m rectangle`, `Storage cupboard: 2 m × 1 m × ${ch} m`, "Balance accuracy with practicality."],
    parts: [
      { strategy: "Area", spec: "Vinyl", q: `New vinyl covers the ${L} m × ${W} m floor. How much is needed?`, options: shuffle([`${area} m²`, `${per} m`, `${L + W} m`]), answer: `${area} m²` },
      { strategy: "Perimeter", spec: "Skirting", note: "Skirting board runs around the edge of that same floor.", q: "How much skirting board runs around the floor?", options: shuffle([`${per} m`, `${area} m²`, `${L} m`]), answer: `${per} m` },
      { strategy: "Volume", spec: "Cupboard", note: "Storage space is three-dimensional.", q: `The cupboard is 2 m × 1 m × ${ch} m. What is its storage volume?`, options: shuffle([`${cvol} m³`, `${2 * 1} m²`, `${cvol + 2} m³`]), answer: `${cvol} m³` },
    ],
    feedback: { correct: "Classroom engineered!", wrong: "Match the maths to the job." },
  };
}
export function libraryEngineer(): InvestigationTask {
  const L = choose([10, 12]), W = choose([8, 9]), area = L * W, per = 2 * (L + W), sh = choose([2, 3]), svol = 3 * 1 * sh;
  return {
    kind: "investigation", title: "Engineer the Library", emoji: "📚", badgeLabel: CHALLENGE,
    prompt: "Engineer the library.",
    facts: [`Reading room: ${L} m × ${W} m rectangle`, `Shelf unit: 3 m × 1 m × ${sh} m`, "Design the reading room and its storage."],
    parts: [
      { strategy: "Area", spec: "Carpet", q: `New carpet covers the ${L} m × ${W} m reading room. How much?`, options: shuffle([`${area} m²`, `${per} m`, `${L + W} m`]), answer: `${area} m²` },
      { strategy: "Perimeter", spec: "Rail", note: "A display rail runs around the edge of the same room.", q: "How long is the display rail around the room?", options: shuffle([`${per} m`, `${area} m²`, `${W} m`]), answer: `${per} m` },
      { strategy: "Volume", spec: "Shelf", note: "Shelf capacity is three-dimensional.", q: `The shelf unit is 3 m × 1 m × ${sh} m. What is its volume?`, options: shuffle([`${svol} m³`, `${3 * 1} m²`, `${svol + 3} m³`]), answer: `${svol} m³` },
    ],
    feedback: { correct: "Library engineered!", wrong: "Match the maths to the job." },
  };
}
export function hallEngineer(): InvestigationTask {
  const L = choose([15, 18]), W = choose([10, 12]), area = L * W, per = 2 * (L + W), bh = choose([2, 3]), bvol = 2 * 2 * bh;
  return {
    kind: "investigation", title: "Engineer the Hall", emoji: "🏛️", badgeLabel: CHALLENGE,
    prompt: "Engineer the school hall.",
    facts: [`Hall floor: ${L} m × ${W} m rectangle`, `Equipment box: 2 m × 2 m × ${bh} m`, "Design the floor, the safety line and the store."],
    parts: [
      { strategy: "Area", spec: "Floor polish", q: `Floor polish covers the ${L} m × ${W} m hall. How much surface?`, options: shuffle([`${area} m²`, `${per} m`, `${L + W} m`]), answer: `${area} m²` },
      { strategy: "Perimeter", spec: "Safety line", note: "A safety line is taped around the edge of the hall.", q: "How long is the safety line around the hall?", options: shuffle([`${per} m`, `${area} m²`, `${L} m`]), answer: `${per} m` },
      { strategy: "Volume", spec: "Store box", note: "Storage space is three-dimensional.", q: `The equipment box is 2 m × 2 m × ${bh} m. What is its volume?`, options: shuffle([`${bvol} m³`, `${2 * 2} m²`, `${bvol + 2} m³`]), answer: `${bvol} m³` },
    ],
    feedback: { correct: "Hall engineered!", wrong: "Match the maths to the job." },
  };
}

// ── Lesson 3 · Master Measurelands Mission (Justify) ──────────────────────────
// One coherent brief across every strand, carried forward, closing with the
// graduation reflection → unlocks the Post-Test.
export function outdoorCentreMission(): InvestigationTask {
  const L = choose([12, 14]), W = choose([8, 10]), area = L * W, per = 2 * (L + W);
  const pathM = choose([15, 20]), th = choose([2, 3]), tvol = 2 * 2 * th;
  const known = choose([120, 130, 140]), missing = 180 - known;
  const start = 9 * 60, dur = choose([120, 150]), finish = start + dur;
  return {
    kind: "investigation", title: "Build the Outdoor Learning Centre", emoji: "🌳", badgeLabel: MISSION,
    prompt: "Build the outdoor learning centre.",
    facts: [`Learning garden: ${L} m × ${W} m`, `Entry path: ${pathM} m · Water tank: 2 m × 2 m × ${th} m`, `Build starts ${fmt12(start)}; a brace meets the deck at ${known}°.`],
    parts: [
      { strategy: "Area", spec: "Garden", q: `Prepare the soil across the ${L} m × ${W} m garden. How much surface?`, options: shuffle([`${area} m²`, `${per} m`, `${L + W} m`]), answer: `${area} m²` },
      { strategy: "Perimeter", spec: "Fence", note: "The fence follows the edge of the garden you just prepared.", q: "How much fencing surrounds the garden?", options: shuffle([`${per} m`, `${area} m²`, `${L} m`]), answer: `${per} m` },
      { strategy: "Convert", spec: "Path", note: "Pavers are sold in centimetres. 1 m = 100 cm.", q: `The entry path is ${pathM} m long. How many centimetres?`, options: shuffle([`${pathM * 100} cm`, `${pathM * 10} cm`, `${pathM * 1000} cm`]), answer: `${pathM * 100} cm` },
      { strategy: "Volume", spec: "Tank", q: `The water tank is 2 m × 2 m × ${th} m. What is its volume?`, options: shuffle([`${tvol} m³`, `${2 * 2} m²`, `${tvol + 2} m³`]), answer: `${tvol} m³` },
      { strategy: "Angle", spec: "Brace", note: "The brace and the deck meet on a straight line (180°).", q: `One angle is ${known}°. What is the other angle?`, options: shuffle([`${missing}°`, `${360 - known}°`, `${known}°`]), answer: `${missing}°` },
      { strategy: "Time", spec: "Finish", note: `Construction starts at ${fmt12(start)}.`, q: `The build takes ${fmtDur(dur)}. When does it finish?`, options: shuffle([fmt12(finish), fmt12(finish + 30), fmt12(start + 60)]), answer: fmt12(finish) },
    ],
    reflection: GRADUATION_REFLECTION,
    feedback: { correct: "Centre complete — you're a Master of Measurelands!", wrong: "Choose the right maths for each part." },
  };
}
export function sportsFacilityMission(): InvestigationTask {
  const L = choose([20, 24]), W = choose([12, 14]), area = L * W, per = 2 * (L + W);
  const runM = choose([8, 10]), th = choose([2, 3]), tvol = 3 * 2 * th;
  const known = choose([100, 110, 120]), missing = 180 - known;
  const start = 8 * 60 + 30, dur = choose([90, 120]), finish = start + dur;
  return {
    kind: "investigation", title: "Build the Sports Facility", emoji: "🏅", badgeLabel: MISSION,
    prompt: "Build the sports facility.",
    facts: [`Oval infield: ${L} m × ${W} m`, `Run-up: ${runM} m · Water store: 3 m × 2 m × ${th} m`, `Fit-out starts ${fmt12(start)}; a floodlight arm turns ${known}° on a straight beam.`],
    parts: [
      { strategy: "Area", spec: "Turf", q: `Lay turf across the ${L} m × ${W} m infield. How much turf?`, options: shuffle([`${area} m²`, `${per} m`, `${L + W} m`]), answer: `${area} m²` },
      { strategy: "Perimeter", spec: "Track", note: "The running track follows the edge of the infield.", q: "How long is the track around the infield?", options: shuffle([`${per} m`, `${area} m²`, `${W} m`]), answer: `${per} m` },
      { strategy: "Convert", spec: "Run-up", note: "Line paint is marked in centimetres. 1 m = 100 cm.", q: `The run-up is ${runM} m long. How many centimetres?`, options: shuffle([`${runM * 100} cm`, `${runM * 10} cm`, `${runM * 1000} cm`]), answer: `${runM * 100} cm` },
      { strategy: "Volume", spec: "Store", q: `The water store is 3 m × 2 m × ${th} m. What is its volume?`, options: shuffle([`${tvol} m³`, `${3 * 2} m²`, `${tvol + 3} m³`]), answer: `${tvol} m³` },
      { strategy: "Angle", spec: "Floodlight", note: "The floodlight arm turns on a straight line (180°).", q: `It has turned ${known}°. How many more degrees to complete the straight line?`, options: shuffle([`${missing}°`, `${360 - known}°`, `${known}°`]), answer: `${missing}°` },
      { strategy: "Time", spec: "Finish", note: `Fit-out starts at ${fmt12(start)}.`, q: `It takes ${fmtDur(dur)}. When does it finish?`, options: shuffle([fmt12(finish), fmt12(finish + 30), fmt12(start + 60)]), answer: fmt12(finish) },
    ],
    reflection: GRADUATION_REFLECTION,
    feedback: { correct: "Facility complete — you're a Master of Measurelands!", wrong: "Choose the right maths for each part." },
  };
}
export function adventureCampMission(): InvestigationTask {
  const L = choose([9, 10]), W = choose([6, 7]), area = L * W, per = 2 * (L + W);
  const trailKm = choose([3, 4, 5]), th = choose([2, 3]), tvol = 2 * 2 * th;
  const known = choose([125, 135, 145]), missing = 180 - known;
  const dep = 8 * 60, travel = choose([120, 150]), arr = dep + travel;
  return {
    kind: "investigation", title: "Build the Adventure Camp", emoji: "🏕️", badgeLabel: MISSION,
    prompt: "Build the adventure camp.",
    facts: [`Cabin floor: ${L} m × ${W} m`, `Trail: ${trailKm} km · Water tank: 2 m × 2 m × ${th} m`, `Bus departs ${fmt12(dep)}; a roof brace sits ${known}° on a straight ridge.`],
    parts: [
      { strategy: "Area", spec: "Decking", q: `Deck the ${L} m × ${W} m cabin floor. How much decking?`, options: shuffle([`${area} m²`, `${per} m`, `${L + W} m`]), answer: `${area} m²` },
      { strategy: "Perimeter", spec: "Gutter", note: "Guttering runs around the edge of the cabin roof.", q: "How much guttering runs around the cabin?", options: shuffle([`${per} m`, `${area} m²`, `${L} m`]), answer: `${per} m` },
      { strategy: "Convert", spec: "Trail", note: "The map marks the trail in metres. 1 km = 1000 m.", q: `The trail is ${trailKm} km. How many metres is that?`, options: shuffle([`${trailKm * 1000} m`, `${trailKm * 100} m`, `${trailKm * 10} m`]), answer: `${trailKm * 1000} m` },
      { strategy: "Volume", spec: "Tank", q: `The water tank is 2 m × 2 m × ${th} m. What is its volume?`, options: shuffle([`${tvol} m³`, `${2 * 2} m²`, `${tvol + 2} m³`]), answer: `${tvol} m³` },
      { strategy: "Angle", spec: "Brace", note: "The roof brace sits on a straight ridge (180°).", q: `One angle is ${known}°. What is the other angle?`, options: shuffle([`${missing}°`, `${360 - known}°`, `${known}°`]), answer: `${missing}°` },
      { strategy: "Time", spec: "Arrive", note: `The bus departs at ${fmt12(dep)}.`, q: `Travel takes ${fmtDur(travel)}. When does it arrive?`, options: shuffle([fmt12(arr), fmt12(arr + 30), fmt12(dep + 60)]), answer: fmt12(arr) },
    ],
    reflection: GRADUATION_REFLECTION,
    feedback: { correct: "Camp complete — you're a Master of Measurelands!", wrong: "Choose the right maths for each part." },
  };
}
