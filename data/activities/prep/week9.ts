import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type GroundOrdinalTask = Extract<PracticeTask, { kind: "groundOrdinal" }>;

type OrdinalCharacter = GroundOrdinalTask["characters"][number];
type Week9Kind =
  | "who_first"
  | "who_second"
  | "who_last"
  | "race_third"
  | "train_fourth"
  | "podium_places"
  | "place_numbot"
  | "order_line"
  | "before_robot"
  | "after_alien"
  | "find_fifth"
  | "rocket_launch"
  | "quick_flash"
  | "same_position"
  | "lineup_builder";

type Week9Memory = {
  cursor: number;
  recentPositions: number[];
  recentKinds: string[];
  recentScenarios: GroundOrdinalTask["scenario"][];
};

const ROTATION: Week9Kind[] = [
  "who_first",
  "who_second",
  "who_last",
  "race_third",
  "train_fourth",
  "podium_places",
  "place_numbot",
  "order_line",
  "before_robot",
  "after_alien",
  "find_fifth",
  "rocket_launch",
  "quick_flash",
  "same_position",
  "lineup_builder",
];

const ROSTER: OrdinalCharacter[] = [
  { id: "numbot", label: "Numbot", emoji: "🤖" },
  { id: "alien", label: "Alien", emoji: "👽" },
  { id: "rocket", label: "Rocket", emoji: "🚀" },
  { id: "pod", label: "Pod", emoji: "🛸" },
  { id: "planet", label: "Planet", emoji: "🪐" },
  { id: "star", label: "Star", emoji: "⭐" },
  { id: "crystal", label: "Crystal", emoji: "💠" },
  { id: "runner", label: "Runner", emoji: "🏃" },
  { id: "bolt", label: "Bolt", emoji: "⚡" },
  { id: "orb", label: "Orb", emoji: "🔵" },
];

const memoryByLesson = new Map<string, Week9Memory>();

function getMemory(lessonId: string) {
  const existing = memoryByLesson.get(lessonId);
  if (existing) return existing;
  const created: Week9Memory = { cursor: 0, recentPositions: [], recentKinds: [], recentScenarios: [] };
  memoryByLesson.set(lessonId, created);
  return created;
}

function pushRecent<T>(list: T[], value: T, limit: number) {
  list.push(value);
  while (list.length > limit) list.shift();
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(items: readonly T[] | T[]) {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex]!, next[index]!];
  }
  return next;
}

function chooseRecentSafe<T>(pool: readonly T[] | T[], recent: T[]) {
  let candidate = pool[randInt(0, pool.length - 1)]!;
  for (let attempts = 0; attempts < 4; attempts += 1) {
    if (recent.slice(-2).includes(candidate)) {
      candidate = pool[randInt(0, pool.length - 1)]!;
      continue;
    }
    break;
  }
  return candidate;
}

function pickScenario(memory: Week9Memory, scenarios: GroundOrdinalTask["scenario"][]) {
  const scenario = chooseRecentSafe(scenarios, memory.recentScenarios);
  pushRecent(memory.recentScenarios, scenario, 6);
  return scenario;
}

function sampleCharacters(count: number, requiredIds: string[] = []) {
  const required = requiredIds.map((id) => ROSTER.find((character) => character.id === id)!).filter(Boolean);
  const pool = shuffle(ROSTER.filter((character) => !requiredIds.includes(character.id)));
  return shuffle([...required, ...pool.slice(0, Math.max(0, count - required.length))]);
}

function makeTask(task: Omit<GroundOrdinalTask, "kind">): PracticeTask {
  return { kind: "groundOrdinal", ...task };
}

function buildOrder(characters: OrdinalCharacter[]) {
  return characters.map((character) => character.id);
}

function createIdentifyTask(
  lessonId: string,
  prompt: string,
  speakText: string,
  position: number,
  scenarioChoices: GroundOrdinalTask["scenario"][],
  feedback: GroundOrdinalTask["feedback"],
  lineLength = 5,
  revealMs?: number
): PracticeTask {
  const memory = getMemory(lessonId);
  const scenario = pickScenario(memory, scenarioChoices);
  const characters = sampleCharacters(lineLength);
  pushRecent(memory.recentPositions, position, 6);
  return makeTask({
    prompt,
    speakText,
    targetNumber: position,
    badgeLabel: scenario === "race" ? "Race Positions" : undefined,
    scenario,
    mode: "identify",
    characters,
    order: buildOrder(characters),
    targetPosition: position,
    revealMs,
    feedback,
  });
}

function createRelativeTask(
  lessonId: string,
  relation: "before" | "after",
  prompt: string,
  speakText: string,
  referenceId: string
): PracticeTask {
  const scenario = relation === "before" ? "queue" : "line";
  const characters = sampleCharacters(5, [referenceId]);
  const order = buildOrder(characters);
  const refIndex = randInt(1, order.length - 2);
  const refChar = characters.find((character) => character.id === referenceId)!;
  order.splice(order.indexOf(referenceId), 1);
  order.splice(refIndex, 0, referenceId);
  return makeTask({
    prompt,
    speakText,
    targetNumber: refIndex + 1,
    scenario,
    mode: "relative",
    characters,
    order,
    referenceCharacterId: refChar.id,
    relation,
    feedback: { correct: "Great position spotting!", wrong: "Check who is next in line." },
  });
}

function createPlaceTask({
  prompt,
  speakText,
  scenario,
  characters,
  order,
  targetCharacterId,
  targetPosition,
  secondaryTargetCharacterId,
  secondaryTargetPosition,
  feedback,
}: {
  prompt: string;
  speakText: string;
  scenario: GroundOrdinalTask["scenario"];
  characters: OrdinalCharacter[];
  order: Array<string | null>;
  targetCharacterId: string;
  targetPosition: number;
  secondaryTargetCharacterId?: string;
  secondaryTargetPosition?: number;
  feedback: GroundOrdinalTask["feedback"];
}): PracticeTask {
  return makeTask({
    prompt,
    speakText,
    targetNumber: targetPosition,
    scenario,
    mode: "place",
    characters,
    order,
    targetCharacterId,
    targetPosition,
    secondaryTargetCharacterId,
    secondaryTargetPosition,
    feedback,
  });
}

function createSamePositionTask(): PracticeTask {
  const characters = sampleCharacters(5, ["numbot"]);
  const firstOrder = buildOrder(characters);
  const targetId = "numbot";
  const keepSame = randInt(0, 1) === 0;
  const secondOrder = [...firstOrder];
  if (!keepSame) {
    const currentIndex = secondOrder.indexOf(targetId);
    const swapIndex = currentIndex === 0 ? 1 : 0;
    [secondOrder[currentIndex], secondOrder[swapIndex]] = [secondOrder[swapIndex]!, secondOrder[currentIndex]!];
  }
  return makeTask({
    prompt: "Is Numbot still third?",
    speakText: "Is Numbot still third?",
    targetNumber: 3,
    scenario: "line",
    mode: "same_position",
    characters,
    order: firstOrder,
    secondaryOrder: secondOrder,
    targetCharacterId: targetId,
    correctBoolean: keepSame,
    feedback: { correct: "You checked the position carefully!", wrong: "Look at Numbot's place again." },
  });
}

function createPodiumPlacesTask(): PracticeTask {
  const characters = sampleCharacters(3, ["numbot"]);
  const otherIds = characters.filter((character) => character.id !== "numbot");
  const targetPosition = 2;
  return createPlaceTask({
    prompt: "Put Numbot second on the podium.",
    speakText: "Put Numbot second on the podium.",
    scenario: "podium",
    characters,
    order: [otherIds[0]!.id, null, otherIds[1]!.id],
    targetCharacterId: "numbot",
    targetPosition,
    feedback: { correct: "You found second place!", wrong: "Check the podium places again." },
  });
}

function createPlaceNumbotTask(): PracticeTask {
  const characters = sampleCharacters(4, ["numbot"]);
  const others = characters.filter((character) => character.id !== "numbot");
  return createPlaceTask({
    prompt: "Put Numbot second.",
    speakText: "Put Numbot second.",
    scenario: "queue",
    characters,
    order: [others[0]!.id, null, others[1]!.id, others[2]!.id],
    targetCharacterId: "numbot",
    targetPosition: 2,
    feedback: { correct: "Numbot is in the right place!", wrong: "Try the second spot." },
  });
}

function createOrderTheLineTask(): PracticeTask {
  const characters = sampleCharacters(4, ["numbot", "alien"]);
  const others = characters.filter((character) => character.id !== "numbot" && character.id !== "alien");
  return createPlaceTask({
    prompt: "Put Numbot first and the Alien last.",
    speakText: "Put Numbot first and the Alien last.",
    scenario: "line",
    characters,
    order: [null, others[0]!.id, others[1]!.id, null],
    targetCharacterId: "numbot",
    targetPosition: 1,
    secondaryTargetCharacterId: "alien",
    secondaryTargetPosition: 4,
    feedback: { correct: "You ordered the line perfectly!", wrong: "Check the first and last spots." },
  });
}

function createLineupBuilderTask(): PracticeTask {
  const characters = sampleCharacters(5, ["rocket", "pod"]);
  const others = characters.filter((character) => character.id !== "rocket" && character.id !== "pod");
  return createPlaceTask({
    prompt: "Put the Rocket first and the Pod fifth.",
    speakText: "Put the Rocket first and the Pod fifth.",
    scenario: "rockets",
    characters,
    order: [null, others[0]!.id, others[1]!.id, others[2]!.id, null],
    targetCharacterId: "rocket",
    targetPosition: 1,
    secondaryTargetCharacterId: "pod",
    secondaryTargetPosition: 5,
    feedback: { correct: "You built the line-up!", wrong: "Try the first and last spots again." },
  });
}

function nextKind(memory: Week9Memory) {
  const kind = ROTATION[memory.cursor % ROTATION.length]!;
  memory.cursor += 1;
  pushRecent(memory.recentKinds, kind, 6);
  return kind;
}

function generateLesson1Task(lessonId: string, difficulty: Difficulty, kind: Week9Kind): PracticeTask {
  switch (kind) {
    case "who_first":
      return createIdentifyTask(lessonId, "Who is first?", "Who is first?", 1, ["queue", "line"], { correct: "You found first place!", wrong: "Look at the start of the line." }, 4);
    case "who_second":
      return createIdentifyTask(lessonId, "Who is second?", "Who is second?", 2, ["line", "queue"], { correct: "Great position spotting!", wrong: "Check the second place." }, 4);
    case "who_last":
      return createIdentifyTask(lessonId, "Who is last in line?", "Who is last in line?", difficulty === "easy" ? 4 : 5, ["queue", "line"], { correct: "You found the last place!", wrong: "Look at the end of the line." }, difficulty === "easy" ? 4 : 5);
    case "race_third":
      return createIdentifyTask(lessonId, "Who came third?", "Who came third?", 3, ["race"], { correct: "You found third place!", wrong: "Check the race order again." }, 5);
    case "train_fourth":
      return createIdentifyTask(lessonId, "Tap the fourth carriage.", "Tap the fourth carriage.", 4, ["train"], { correct: "You found the fourth carriage!", wrong: "Count the carriages carefully." }, 5);
    case "podium_places":
      return createPodiumPlacesTask();
    case "place_numbot":
      return createPlaceNumbotTask();
    case "order_line":
      return createOrderTheLineTask();
    case "before_robot":
      return createRelativeTask(lessonId, "before", "Who is before the robot?", "Who is before the robot?", "numbot");
    case "after_alien":
      return createRelativeTask(lessonId, "after", "Who is after the alien?", "Who is after the alien?", "alien");
    case "find_fifth":
      return createIdentifyTask(lessonId, "Which object is fifth?", "Which object is fifth?", 5, ["stepping_stones", "line"], { correct: "You found fifth place!", wrong: "Check the positions carefully." }, 5);
    case "rocket_launch":
      return createIdentifyTask(lessonId, "Which rocket launched first?", "Which rocket launched first?", 1, ["rockets"], { correct: "You found the first rocket!", wrong: "Look at the launch order." }, 5);
    case "quick_flash":
      return createIdentifyTask(lessonId, "Which one was third?", "Which one was third?", difficulty === "easy" ? 2 : 3, ["race", "rockets"], { correct: "You remembered the position!", wrong: "Try the quick flash again." }, 4, difficulty === "easy" ? 1400 : 1100);
    case "same_position":
      return createSamePositionTask();
    case "lineup_builder":
      return createLineupBuilderTask();
  }
}

export function generatePrepWeek9Task(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  const kind = nextKind(memory);
  return generateLesson1Task(lessonId, difficulty, kind);
}

export function resetPrepWeek9TaskSessionState() {
  memoryByLesson.clear();
}
