import type { PracticeTask } from "@/data/activities/year1/practice-task";

const then = (items: unknown[]) => items.join(", then ");
const each = (n: number, word: string) => `${n} ${n === 1 ? word.replace(/s$/, "") : word}`;
const ordinal = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
const tokenWords = (ids: string[]) => ids.map((id) => id.replace(/-/g, " ")).join(", ");

type Cell = { r: number; c: number };
const STEPS = [["up", -1, 0], ["down", 1, 0], ["left", 0, -1], ["right", 0, 1]] as const;

/** The shortest moves between two grid squares, staying off blocked squares. */
function routeBetween(from: Cell, to: Cell, rows: number, cols: number, blocked: Cell[]): string[] {
  const seen = new Set([`${from.r},${from.c}`]);
  const queue: { cell: Cell; path: string[] }[] = [{ cell: from, path: [] }];
  for (let i = 0; i < queue.length; i++) {
    const { cell, path } = queue[i];
    if (cell.r === to.r && cell.c === to.c) return path;
    for (const [word, dr, dc] of STEPS) {
      const next = { r: cell.r + dr, c: cell.c + dc };
      const key = `${next.r},${next.c}`;
      if (next.r < 0 || next.c < 0 || next.r >= rows || next.c >= cols || seen.has(key)) continue;
      if (blocked.some((b) => b.r === next.r && b.c === next.c)) continue;
      seen.add(key);
      queue.push({ cell: next, path: [...path, word] });
    }
  }
  return [];
}

function fullRoute(t: Record<string, any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
  let at: Cell = t.start;
  const moves: string[] = [...(t.preset ?? [])];
  for (const word of moves) {
    const step = STEPS.find(([name]) => name === word);
    if (step) at = { r: at.r + step[1], c: at.c + step[2] };
  }
  for (const stop of [...(t.checkpoints ?? []), t.goal]) {
    moves.push(...routeBetween(at, stop, t.rows, t.cols, t.blocked ?? []));
    at = stop;
  }
  return moves.join(", ");
}

/** A true, child-readable answer for each Level 1 question. Teaching screens return null. */
export function level1Answer(task: PracticeTask): string | null {
  const t = task as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (t.scene === "intro") return null;
  const optionLabel = () => (t.options ?? []).find((o: { id: string }) => o.id === t.correctOptionId)?.label ?? null;
  const itemLabel = () => (t.items ?? []).find((o: { id: string }) => o.id === t.correctOptionId)?.label ?? null;
  const orderedItems = () => then(t.orderedIds.map((id: string) => t.items.find((o: { id: string }) => o.id === id)?.label));
  const byOrder = (items: { label: string; order: number }[]) => [...items].sort((a, b) => a.order - b.order);
  const groupsAnswer = (perGroup: number) => `${perGroup} in each group`;
  switch (task.kind) {
    case "numberLineTap": return String(t.target);
    case "equalGroups": return `${t.perGroup} in each group`;
    case "addDots": return `${t.a} dots and ${t.b} dots`;
    case "ppw":
      if (t.mode === "build") return `${t.a} and ${t.b}`;
      return String(t.mode === "missingWhole" ? t.whole : t.missing === "a" ? t.a : t.b);
    case "subtractTakeAway": case "subtractMoveToTaken": case "subtractBar": return String(t.total - t.remove);
    case "subtractMissingPart": return String(t.total - t.part);
    case "storyOpChoice": return t.answer === "add" ? "Add" : "Take away";
    case "missingOperation": return t.answer === "+" ? "Plus" : "Minus";
    case "storySolve": return /\$/.test(t.story) ? `$${t.answer}` : String(t.answer);
    case "moneyMakeAmount": return `Coins and notes that make $${t.target}`;
    case "moneyEnough": return t.answer === "YES" ? "Yes" : "No";
    case "moneyHowMuchMore": case "moneyChangeUp": case "moneyAddPrices": return `$${t.answer}`;
    case "whatHappened": return `${t.before} ${t.answerOp === "add" ? "+" : "-"} ${Math.abs(t.before - t.after)} = ${t.after}`;
    case "shareDrag": case "shareDeal": case "groupBoxesTap": case "groupBoxesInput": return groupsAnswer(t.total / t.groups);
    case "shareFair": return t.isFair ? "Yes" : "No";
    case "packBoxes": return `${each(t.total / t.perBox, "boxes")} with ${t.perBox} in each`;
    case "groupGrabBags": return `${each(t.total / t.size, "bags")} with ${t.size} in each`;
    case "howManyGroups": return each(t.total / t.size, "groups");
    case "repeatingPattern":
      if (t.mode === "identify_unit") return tokenWords(t.answerUnit);
      if (t.mode === "continue") return tokenWords(t.answer);
      return tokenWords(Array.from({ length: t.repeats }, () => t.repeatUnit).flat());
    case "measurePath": {
      const label = (p: { objectLabel: string; length: number }) => `${p.objectLabel}, ${each(p.length, "blocks")}`;
      if (t.scene === "count") return each(t.correctAnswer, "blocks");
      if (t.scene === "build") return each(t.targetLength, "blocks");
      if (t.scene === "compare" && t.correctPathId) { const hit = t.paths.find((p: { id: string }) => p.id === t.correctPathId); return hit ? label(hit) : null; }
      if (t.scene === "order" && t.correctOrderIds) return then(t.correctOrderIds.map((id: string) => t.paths.find((p: { id: string }) => p.id === id).objectLabel));
      if (t.scene === "same") { const hit = t.paths.find((p: { length: number }) => p.length === t.pathLength); return hit ? label(hit) : null; }
      return null;
    }
    case "measureValidity":
      if (t.scene === "choose") return "The blocks with no gaps and no overlaps";
      if (t.scene === "diagnose") return t.flaw === "gap" ? "There is a gap" : t.flaw === "overlap" ? "The blocks overlap" : "Nothing is wrong";
      return "Blocks lined up end to end, with no gaps or overlaps";
    case "massMeasure":
      if (t.scene === "count") return each(t.correctAnswer, "cubes");
      if (t.scene === "order") return orderedItems();
      if (t.scene === "fairChoose") return "The one that uses the same cubes";
      if (t.scene === "fairJudge") return t.fair ? "Yes, it is fair" : "No, it is not fair";
      if (t.scene === "fairFix") return "Use cubes that are all the same";
      return itemLabel();
    case "capacityMeasure":
      if (t.scene === "count") return each(t.correctAnswer, "cups");
      if (t.scene === "order") return orderedItems();
      if (t.scene === "betterUnit") return t.sensibleUnits.find((u: { id: string }) => u.id === t.correctOptionId)?.label ?? null;
      return itemLabel();
    case "durationUnit":
      if (t.scene === "classify") return `About ${t.activity.unit === "hour" ? "an" : "a"} ${t.activity.unit}`;
      if (t.scene === "order") return orderedItems();
      if (t.scene === "sort") return t.items.map((i: { label: string; unit: string }) => `${i.label}: ${i.unit}`).join(", ");
      return itemLabel();
    case "weekCycle":
      if (t.scene === "build") return then(t.orderedIds.map((id: string) => t.items.find((o: { id: string }) => o.id === id)?.label ?? id[0].toUpperCase() + id.slice(1)));
      if (t.scene === "buildMonth") return then(t.orderedIds.map((id: string) => t.monthWeeks.find((o: { id: string }) => o.id === id).label));
      if (t.scene === "next" || t.scene === "missing") return t.choices.find((c: { id: string }) => c.id === t.correctOptionId)?.label ?? null;
      if (t.scene === "whichBigger") return t.correctTextOption;
      return String(t.correctAnswer);
    case "calendarFind":
      if (t.scene === "find") return `The ${ordinal(t.targetDate)}`;
      if (t.scene === "event") return `The ${ordinal(t.events.find((e: { label: string }) => e.label === t.askEventLabel).date)}`;
      return `The ${ordinal(t.correctAnswer)}`;
    case "calendarNavigate": return `The ${ordinal(t.correctAnswer ?? t.targetDate)}`;
    case "calendarEvent":
      if (t.scene === "place") return `The ${ordinal(t.targetDate)}`;
      if (t.scene === "compare") return t.correctTextOption;
      return `The ${ordinal(t.correctAnswer)}`;
    case "timeSequence": {
      if (t.correctTextOption) return t.correctTextOption;
      const ordered = t.orderedWhen.map((when: string) => t.buildItems.find((i: { when: string }) => i.when === when));
      if (t.scene === "sort") return ordered.map((i: { when: string; label: string }) => `${i.when[0].toUpperCase()}${i.when.slice(1)}: ${i.label}`).join(", ");
      return then(ordered.map((i: { label: string }) => i.label));
    }
    case "routineSequence": {
      if (t.scene === "first") return byOrder(t.items)[0].label;
      if (t.scene === "build" || t.scene === "fix") return then(byOrder(t.scene === "fix" ? t.brokenItems : t.buildItems).map((i) => i.label));
      return t.buildItems?.find((i: { id: string }) => i.id === t.correctTextOption)?.label ?? t.correctTextOption;
    }
    case "starpathShapeClassify": case "starpathObjectCompare": return optionLabel();
    case "starpathShapeHunt": case "starpathObjectSpotter":
      return t.hunts.map((h: { shape: string; count: number }) => `${h.count} ${h.shape}${h.count === 1 ? "" : "s"}`).join(", ");
    case "starpathObjectMatch": return "Each pair of objects with the same shape";
    case "starpathShapeWorkshop":
      if (t.mode === "compare") return optionLabel();
      return t.mode === "repair" ? `The two corners with the gap between them` : `Join the stars around the ${t.shapeLabel}, one corner at a time`;
    case "starpathRouteBuild": return fullRoute(t);
    case "starpathRouteDebug": { const i = t.steps.findIndex((s: { id: string }) => s.id === t.wrongStepId); return `Step ${i + 1}, ${t.steps[i].direction}`; }
    case "starpathDirectionPath": return t.steps.map((s: { direction: string }) => s.direction).join(", ");
    case "starpathDirectionChoice": return t.options.find((o: { id: string }) => o.id === t.correctOptionId)?.direction ?? null;
    case "statisticaCollect":
      return t.categories.map((c: { id: string; label: string }) => `${c.label} ${t.items.filter((i: { category: string }) => i.category === c.id).length}`).join(", ");
    case "statisticaSort":
      return t.categories.map((c: { id: string; label: string }) => `${c.label}: ${t.items.filter((i: { category: string }) => i.category === c.id).map((i: { label: string }) => i.label).join(", ")}`).join(". ");
    case "statisticaTally":
      if (t.mode === "record") return each(t.count, "marks");
      return t.options.find((o: { id: string }) => t.correctOptionIds.includes(o.id))?.label ?? null;
    case "statisticaGraph":
      if (t.mode === "build") return t.categories.map((c: { label: string; count: number }) => `${c.label} ${c.count}`).join(", ");
      return t.options.find((o: { id: string }) => t.correctOptionIds.includes(o.id))?.label ?? null;
    case "statisticaTapGraph": return t.categories.find((c: { id: string }) => c.id === t.correctCategoryId)?.label ?? null;
    case "statisticaRank": return then(t.correctOrderIds.map((id: string) => t.categories.find((c: { id: string }) => c.id === id).label));
    case "statisticaGap": return String(t.difference);
    default: return null;
  }
}

/** What Level 1 reads aloud when a question's words are drawn on the card, not in its prompt. */
export function level1Speech(task: PracticeTask): string {
  const t = task as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const story = typeof t.story === "string" ? t.story : "";
  switch (task.kind) {
    case "numberLadder": return `Climb from ${t.start} to ${t.target}.`;
    case "tensOnesMcq": return "Tap the tens and ones that match the number.";
    case "equalGroups": return `Share ${t.groups * t.perGroup} counters equally into ${t.groups} groups.`;
    case "addDots": return `Show ${t.a} and ${t.b} with dots.`;
    case "subtractTakeAway": return t.mode === "startWith" ? `Start with ${t.total}. Take away ${t.remove}. How many are left?` : `${t.total} take away ${t.remove}. How many are left?`;
    case "subtractMoveToTaken": return `${t.total} take away ${t.remove}. Move ${t.remove} into the taken away box.`;
    case "subtractBar": return `${t.total} take away ${t.remove}. How many are left?`;
    case "subtractMissingPart": return `The whole is ${t.total}. One part is ${t.part}. What is the other part?`;
    case "mentalSubtract": return `${t.total} take away ${t.remove}. What is the answer?`;
    case "storyOpChoice": return `${story} Should you add or take away?`;
    case "missingOperation": return `${story} Is it plus or minus?`;
    case "storySolve": case "twoMats": case "buildStory": case "compareBars": return story;
    case "whatHappened": return `It started with ${t.before}. Now there are ${t.after}. What happened?`;
    case "barModel": return `The whole is ${t.total}. One part is ${t.part}. What is the missing part?`;
    case "moneyMakeAmount": return `Make ${t.target} dollars.`;
    case "moneyEnough": return `You have ${t.have} dollars. The toy costs ${t.cost} dollars. Do you have enough?`;
    case "moneyAddPrices": return `You buy ${t.itemA} for ${t.priceA} dollars and ${t.itemB} for ${t.priceB} dollars. How much altogether?`;
    case "moneyHowMuchMore": return `You have ${t.have} dollars. It costs ${t.cost} dollars. How much more do you need?`;
    case "moneyChangeUp": return `You pay ${t.paid} dollars. It costs ${t.cost} dollars. How much change do you get?`;
    case "shareDrag": case "shareDeal": case "groupBoxesTap": return `Share ${t.total} equally into ${t.groups} groups.`;
    case "shareFair": return "Is this shared equally? Tap yes or no.";
    case "groupBoxesInput": case "missingGroupSize": return `${t.total} shared into ${t.groups} groups. How many in each group?`;
    case "packBoxes": return `${t.total} apples. Pack them into boxes of ${t.perBox}.`;
    case "groupGrabBags": return `${t.total} things. Put ${t.size} in each bag.`;
    case "howManyGroups": return `${t.total} things. Make groups of ${t.size}. How many groups?`;
    case "tapGroupsSkipCount": return "Tap each group to skip count. How many altogether?";
    case "buildGroupsSkipCount": return `Build groups of ${t.perGroup}. Skip count to ${t.total}.`;
    case "chooseSkipCount": return "Which skip count works for these groups?";
    case "arrayBuilder": return `Build ${t.rows} rows of ${t.cols}. How many altogether?`;
    case "barGroupModel": return `${t.groups} groups of ${t.perGroup}. How many altogether?`;
    case "missingGroupCount": return `How many groups of ${t.perGroup} make ${t.total}?`;
    case "groupStory": return `There are ${t.groups} ${t.containerLabel}. Each has ${t.perGroup} ${t.itemLabel}. How many ${t.itemLabel} altogether?`;
    case "howManyGroupsStory": return `There are ${t.total} ${t.itemLabel}. Put ${t.perGroup} in each of the ${t.containerLabel}. How many ${t.containerLabel}?`;
    case "twoStepGrouping": return `There are ${t.groups} ${t.containerLabel} with ${t.perGroup} ${t.itemLabel} in each. ${t.broken} break. How many are left?`;
    case "strategyChoice": return `Choose a strategy for ${t.total} take away ${t.remove}. Then tap the answer.`;
    case "targetedRevision": return "Choose your practice area.";
    case "funGames": return "Let's play a number game.";
    case "mixedReviewSprint": return "Answer as many as you can.";
    default: return "";
  }
}
