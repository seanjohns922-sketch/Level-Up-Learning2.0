import type { PracticeTask } from "./practice-task";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickStartForStep(step: number, min: number, max: number) {
  if (step === 2) {
    const first = min % 2 === 0 ? min : min + 1;
    const count = Math.max(1, Math.floor((max - first) / 2) + 1);
    return first + 2 * randInt(0, count - 1);
  }
  if (step === 5) {
    let first = min;
    if (first % 10 !== 5) first += (15 - (first % 10)) % 10;
    const count = Math.max(1, Math.floor((max - first) / 10) + 1);
    return first + 10 * randInt(0, count - 1);
  }
  if (step === 10) {
    let first = min + ((10 - (min % 10)) % 10);
    const count = Math.max(1, Math.floor((max - first) / 10) + 1);
    return first + 10 * randInt(0, count - 1);
  }
  return randInt(min, max);
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const lessonBags = new Map<string, number[]>();

function pickFromBag(lessonId: string, count: number) {
  let bag = lessonBags.get(lessonId);
  if (!bag || bag.length === 0) {
    bag = shuffle(Array.from({ length: count }, (_, i) => i));
    lessonBags.set(lessonId, bag);
  }
  return bag.pop() as number;
}

function uniqueInts(n: number, min: number, max: number, avoid: number[] = []) {
  const set = new Set<number>();
  const avoidSet = new Set(avoid);
  while (set.size < n) {
    const x = randInt(min, max);
    if (!avoidSet.has(x)) set.add(x);
  }
  return Array.from(set);
}

function genEqualGroups(): PracticeTask {
  return {
    kind: "equalGroups",
    prompt: "Make equal groups.",
  };
}

function genEqualGroupsMcq(): PracticeTask {
  const groups = randInt(3, 5);
  const perGroup = randInt(2, 5);
  const total = groups * perGroup;
  const correct = Array.from({ length: groups }, () => perGroup);

  const options: { groups: number[] }[] = [{ groups: correct }];
  while (options.length < 4) {
    const arr = Array.from({ length: groups }, () => perGroup);
    const i = randInt(0, groups - 1);
    const j = randInt(0, groups - 1);
    if (i === j) continue;
    arr[i] = Math.max(1, arr[i] + 1);
    arr[j] = Math.max(1, arr[j] - 1);
    const sum = arr.reduce((a, b) => a + b, 0);
    if (sum !== total) continue;
    const dup = options.some(
      (o) => JSON.stringify(o.groups) === JSON.stringify(arr)
    );
    if (!dup) options.push({ groups: arr });
  }
  const shuffled = shuffle(options);
  const correctIndex = shuffled.findIndex(
    (o) => JSON.stringify(o.groups) === JSON.stringify(correct)
  );
  return {
    kind: "equalGroupsMcq",
    prompt: "Which picture shows equal groups?",
    options: shuffled,
    correctIndex,
  };
}

function genMissingGroupSize(): PracticeTask {
  const groups = randInt(2, 5);
  const perGroup = randInt(2, 6);
  const total = groups * perGroup;
  const options = shuffle(
    uniqueInts(3, 2, 6, [perGroup]).concat(perGroup)
  ).map(String);
  return {
    kind: "mcq",
    prompt: `${groups} groups of __ makes ${total}`,
    options,
    answer: String(perGroup),
  };
}

function genSkipCountMissing(config?: {
  step: number;
  start: number;
  length: number;
  minOption: number;
  maxOption: number;
}): PracticeTask {
  const step = config?.step ?? [2, 5, 10][randInt(0, 2)];
  const length = config?.length ?? 5;
  const maxStartDefault = Math.max(0, 50 - step * (length - 1));
  const start =
    config?.start ??
    pickStartForStep(step, 0, maxStartDefault);
  const blankIndex = randInt(1, length - 1);
  const seq = Array.from({ length }, (_, i) => start + i * step);
  const answer = seq[blankIndex];
  const minOption = config?.minOption ?? Math.max(0, answer - step * 2);
  const maxOption = config?.maxOption ?? answer + step * 2;
  const distractors = uniqueInts(3, minOption, maxOption, [answer]);
  const options = shuffle([answer, ...distractors]).map(String);
  return {
    kind: "mcq",
    prompt: `Fill the missing number: ${seq
      .map((v, i) => (i === blankIndex ? "__" : v))
      .join(", ")}`,
    options,
    answer: String(answer),
  };
}

function genSkipCountTrack(): PracticeTask {
  const steps = [2, 5, 10];
  const step = steps[randInt(0, steps.length - 1)];
  const current = pickStartForStep(step, 0, 50);
  const answer = current + step;
  const distractors = uniqueInts(3, answer - step * 2, answer + step * 2, [
    answer,
  ]).map((n) => Math.max(0, n));
  const options = shuffle([answer, ...distractors]).map(String);
  return {
    kind: "mcq",
    prompt: `Tap the next number. Start at ${current}, count by ${step}s.`,
    options,
    answer: String(answer),
  };
}

function genCountGroupsVisual(): PracticeTask {
  const groups = randInt(4, 6);
  const perGroup = randInt(2, 6);
  const total = groups * perGroup;
  const distractors = uniqueInts(
    3,
    Math.max(0, total - 6),
    total + 6,
    [total]
  ).map((n) => Math.max(0, n));
  const options = shuffle([total, ...distractors]).map(String);
  return {
    kind: "groupCountVisual",
    prompt: "How many altogether?",
    groups,
    perGroup,
    options,
    answer: String(total),
  };
}

function genCountGroups(): PracticeTask {
  const groups = randInt(3, 6);
  const perGroup = randInt(2, 5);
  const total = groups * perGroup;
  const distractors = uniqueInts(3, total - 5, total + 5, [total]).map((n) =>
    Math.max(0, n)
  );
  const options = shuffle([total, ...distractors]).map(String);
  return {
    kind: "mcq",
    prompt: `How many in ${groups} groups of ${perGroup}?`,
    options,
    answer: String(total),
  };
}

function genHowManyGroupsVisual(): PracticeTask {
  const groups = randInt(3, 6);
  const perGroup = randInt(2, 5);
  const total = groups * perGroup;
  const askForGroups = randInt(0, 1) === 0;
  const answer = askForGroups ? groups : total;
  const options = shuffle(
    uniqueInts(3, Math.max(1, answer - 4), answer + 4, [answer]).concat(
      [answer]
    )
  ).map(String);
  return {
    kind: "groupCountVisual",
    prompt: askForGroups ? "How many groups?" : "How many altogether?",
    groups,
    perGroup,
    options,
    answer: String(answer),
  };
}

function genGroupBoxes(): PracticeTask {
  const groups = randInt(3, 5);
  const perGroup = randInt(2, 6);
  return {
    kind: "groupBoxes",
    prompt: `Make ${groups} groups of ${perGroup}.`,
    groups,
    perGroup,
  };
}

function genGroupingEstimate(): PracticeTask {
  const tensGroups = randInt(2, 6);
  const ones = randInt(1, 9);
  const total = tensGroups * 10 + ones;
  const options = shuffle(
    uniqueInts(3, Math.max(10, total - 8), total + 8, [total]).concat([total])
  ).map(String);
  return {
    kind: "groupingEstimate",
    prompt: "What number is shown?",
    tensGroups,
    ones,
    options,
    answer: String(total),
  };
}

export function generateWeek4Task(
  lessonId: string,
  ctx?: { secondsLeft: number; totalSeconds: number }
): PracticeTask {
  if (lessonId === "y1-w4-l1") {
    const kinds = [genEqualGroups, genEqualGroupsMcq, genMissingGroupSize];
    return kinds[pickFromBag(lessonId, kinds.length)]();
  }
  if (lessonId === "y1-w4-l2") {
    const isHard = ctx ? ctx.secondsLeft <= 4 * 60 : false;
    if (isHard) {
      const modes = [
        () =>
          genSkipCountMissing({
            step: 2,
            start: 0,
            length: 6,
            minOption: 0,
            maxOption: 30,
          }),
        () =>
          genSkipCountMissing({
            step: 5,
            start: 5,
            length: 6,
            minOption: 0,
            maxOption: 40,
          }),
        () =>
          genSkipCountMissing({
            step: 10,
            start: 60,
            length: 5,
            minOption: 60,
            maxOption: 100,
          }),
      ];
      return modes[pickFromBag(`${lessonId}-hard`, modes.length)]();
    }
    const kinds = [genSkipCountMissing, genSkipCountTrack, genCountGroupsVisual];
    return kinds[pickFromBag(lessonId, kinds.length)]();
  }
  if (lessonId === "y1-w4-l3") {
    const kinds = [genHowManyGroupsVisual, genGroupBoxes, genGroupingEstimate];
    return kinds[pickFromBag(lessonId, kinds.length)]();
  }
  return genCountGroups();
}
