import type { Difficulty, PracticeTask } from "@/data/activities/year1/practice-task";

type GroundOrdinalTask = Extract<PracticeTask, { kind: "groundOrdinal" }>;

type OrdinalCharacter = GroundOrdinalTask["characters"][number];
type Lesson1Kind =
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

type Lesson2Kind =
  | "race_first"
  | "race_second"
  | "moved_up"
  | "podium_builder"
  | "race_track_order"
  | "before_after_race"
  | "leaderboard_sort"
  | "finish_last"
  | "position_switch"
  | "fast_position_flash"
  | "which_place"
  | "obstacle_race"
  | "follow_racer"
  | "same_race_position"
  | "champion_ceremony";

type Week9Memory = {
  cursor: number;
  recentPositions: number[];
  recentKinds: string[];
  recentScenarios: GroundOrdinalTask["scenario"][];
};

const LESSON1_ROTATION: Lesson1Kind[] = [
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

const LESSON2_ROTATION: Lesson2Kind[] = [
  "race_first",
  "race_second",
  "moved_up",
  "podium_builder",
  "race_track_order",
  "before_after_race",
  "leaderboard_sort",
  "finish_last",
  "position_switch",
  "fast_position_flash",
  "which_place",
  "obstacle_race",
  "follow_racer",
  "same_race_position",
  "champion_ceremony",
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
  revealMs?: number,
  badgeLabel?: string,
  useSecondary = false,
  secondaryPrompt?: string,
) {
  const memory = getMemory(lessonId);
  const scenario = pickScenario(memory, scenarioChoices);
  const characters = sampleCharacters(lineLength);
  const order = buildOrder(characters);
  pushRecent(memory.recentPositions, position, 6);
  let secondaryOrder: string[] | undefined;
  let activeOrder = order;
  if (useSecondary) {
    secondaryOrder = shuffle([...order]);
    activeOrder = secondaryOrder;
  }
  return makeTask({
    prompt: secondaryPrompt ?? prompt,
    speakText,
    targetNumber: position,
    badgeLabel,
    scenario,
    mode: "identify",
    characters,
    order: activeOrder,
    secondaryOrder,
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
  referenceId: string,
  scenarioChoices: GroundOrdinalTask["scenario"][] = ["queue", "line"],
  badgeLabel?: string,
): PracticeTask {
  const memory = getMemory(lessonId);
  const scenario = pickScenario(memory, scenarioChoices);
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
    badgeLabel,
    scenario,
    mode: "relative",
    characters,
    order,
    referenceCharacterId: refChar.id,
    relation,
    feedback: { correct: "Great position tracking!", wrong: "Check who is next in the race order." },
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
  badgeLabel,
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
  badgeLabel?: string;
}): PracticeTask {
  return makeTask({
    prompt,
    speakText,
    targetNumber: targetPosition,
    badgeLabel,
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

function createWhichPlaceTask(lessonId: string): PracticeTask {
  const memory = getMemory(lessonId);
  const scenario = pickScenario(memory, ["race", "rockets"]);
  const characters = sampleCharacters(4, ["numbot"]);
  const targetIndex = randInt(0, 2);
  const order = buildOrder(characters);
  order.splice(order.indexOf("numbot"), 1);
  order.splice(targetIndex, 0, "numbot");
  return makeTask({
    prompt: "What place is Numbot in?",
    speakText: "What place is Numbot in?",
    targetNumber: targetIndex + 1,
    badgeLabel: "Race Position",
    scenario,
    mode: "which_place",
    characters,
    order,
    targetCharacterId: "numbot",
    positionOptions: [1, 2, 3],
    feedback: { correct: "You tracked Numbot perfectly!", wrong: "Check Numbot's race place again." },
  });
}

function createSamePositionTask(scenario: GroundOrdinalTask["scenario"] = "line", prompt = "Is Numbot still third?", speakText = "Is Numbot still third?", badgeLabel?: string): PracticeTask {
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
    prompt,
    speakText,
    targetNumber: 3,
    badgeLabel,
    scenario,
    mode: "same_position",
    characters,
    order: firstOrder,
    secondaryOrder: secondOrder,
    targetCharacterId: targetId,
    correctBoolean: keepSame,
    feedback: { correct: "You checked the race position carefully!", wrong: "Look at Numbot's place again." },
  });
}

function createPodiumPlacesTask(): PracticeTask {
  const characters = sampleCharacters(3, ["numbot"]);
  const otherIds = characters.filter((character) => character.id !== "numbot");
  return createPlaceTask({
    prompt: "Put Numbot second on the podium.",
    speakText: "Put Numbot second on the podium.",
    scenario: "podium",
    characters,
    order: [otherIds[0]!.id, null, otherIds[1]!.id],
    targetCharacterId: "numbot",
    targetPosition: 2,
    badgeLabel: "Podium Builder",
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

function createRaceTrackOrderTask(): PracticeTask {
  const characters = sampleCharacters(3, ["numbot", "alien", "rocket"]);
  return createPlaceTask({
    prompt: "Put the racers in finishing order.",
    speakText: "Put the racers in finishing order.",
    scenario: "race",
    characters,
    order: [null, null, null],
    targetCharacterId: characters[0]!.id,
    targetPosition: 1,
    secondaryTargetCharacterId: characters[1]!.id,
    secondaryTargetPosition: 2,
    badgeLabel: "Race Track Order",
    feedback: { correct: "You sorted the race order!", wrong: "Try the finishing places again." },
  });
}

function createChampionCeremonyTask(): PracticeTask {
  const characters = sampleCharacters(3, ["numbot", "alien", "rocket"]);
  return createPlaceTask({
    prompt: "Place the racers on gold, silver, and bronze.",
    speakText: "Place the racers on gold, silver, and bronze.",
    scenario: "podium",
    characters,
    order: [null, null, null],
    targetCharacterId: characters[0]!.id,
    targetPosition: 1,
    secondaryTargetCharacterId: characters[1]!.id,
    secondaryTargetPosition: 2,
    badgeLabel: "Champion Ceremony",
    feedback: { correct: "You built the podium!", wrong: "Check the winners' places again." },
  });
}

function createLeaderBoardTask(lessonId: string): PracticeTask {
  return createIdentifyTask(
    lessonId,
    "Who is at the top of the leaderboard?",
    "Who is at the top of the leaderboard?",
    1,
    ["race", "rockets"],
    { correct: "You found the leader!", wrong: "Look at the top position." },
    5,
    undefined,
    "Leaderboard"
  );
}

function nextLesson1Kind(memory: Week9Memory) {
  const kind = LESSON1_ROTATION[memory.cursor % LESSON1_ROTATION.length]!;
  memory.cursor += 1;
  pushRecent(memory.recentKinds, kind, 6);
  return kind;
}

function nextLesson2Kind(memory: Week9Memory) {
  const kind = LESSON2_ROTATION[memory.cursor % LESSON2_ROTATION.length]!;
  memory.cursor += 1;
  pushRecent(memory.recentKinds, kind, 6);
  return kind;
}

function generateLesson1Task(lessonId: string, difficulty: Difficulty, kind: Lesson1Kind): PracticeTask {
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

function generateLesson2Task(lessonId: string, difficulty: Difficulty, kind: Lesson2Kind): PracticeTask {
  switch (kind) {
    case "race_first":
      return createIdentifyTask(lessonId, "Who came first?", "Who came first?", 1, ["race", "rockets"], { correct: "You found the winner!", wrong: "Look at the winning racer." }, 4, undefined, "Race Winner");
    case "race_second":
      return createIdentifyTask(lessonId, "Who came second?", "Who came second?", 2, ["race", "rockets"], { correct: "Great race tracking!", wrong: "Check second place." }, 4, undefined, "Race Positions");
    case "moved_up":
      return createIdentifyTask(lessonId, "Who moved into third place?", "Who moved into third place?", 3, ["race"], { correct: "You tracked the change!", wrong: "Look at the new race order." }, 5, undefined, "Position Switch", true, "Who moved into third place?");
    case "podium_builder":
      return createPodiumPlacesTask();
    case "race_track_order":
      return createRaceTrackOrderTask();
    case "before_after_race":
      return randInt(0, 1) === 0
        ? createRelativeTask(lessonId, "before", "Who is before the alien?", "Who is before the alien?", "alien", ["race"], "Race Order")
        : createRelativeTask(lessonId, "after", "Who is after Numbot?", "Who is after Numbot?", "numbot", ["race"], "Race Order");
    case "leaderboard_sort":
      return createLeaderBoardTask(lessonId);
    case "finish_last":
      return createIdentifyTask(lessonId, "Who finished last?", "Who finished last?", 5, ["race", "rockets"], { correct: "You found the last racer!", wrong: "Check the end of the race." }, 5, undefined, "Finish Line");
    case "position_switch":
      return createIdentifyTask(lessonId, "Who is now second?", "Who is now second?", 2, ["race"], { correct: "You spotted the switch!", wrong: "Check second place again." }, 4, undefined, "Position Switch", true, "Who is now second?");
    case "fast_position_flash":
      return createIdentifyTask(lessonId, "Which racer was second?", "Which racer was second?", 2, ["race", "rockets"], { correct: "You tracked the flash!", wrong: "Try the flash challenge again." }, 4, difficulty === "easy" ? 1300 : 1000, "Fast Position Flash");
    case "which_place":
      return createWhichPlaceTask(lessonId);
    case "obstacle_race":
      return createIdentifyTask(lessonId, "Who is now third in the obstacle race?", "Who is now third in the obstacle race?", 3, ["race"], { correct: "You tracked the obstacle race!", wrong: "Check the updated race order." }, 5, undefined, "Obstacle Race", true);
    case "follow_racer":
      return createWhichPlaceTask(lessonId);
    case "same_race_position":
      return createSamePositionTask("race", "Is Numbot still third?", "Is Numbot still third?", "Same Position?");
    case "champion_ceremony":
      return createChampionCeremonyTask();
  }
}

export function generatePrepWeek9Task(lessonId: string, difficulty: Difficulty): PracticeTask {
  const memory = getMemory(lessonId);
  if (lessonId === "y0-w9-l2") {
    const kind = nextLesson2Kind(memory);
    return generateLesson2Task(lessonId, difficulty, kind);
  }
  const kind = nextLesson1Kind(memory);
  return generateLesson1Task(lessonId, difficulty, kind);
}

export function resetPrepWeek9TaskSessionState() {
  memoryByLesson.clear();
}
