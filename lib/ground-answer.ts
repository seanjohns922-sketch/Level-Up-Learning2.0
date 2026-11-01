import type { PracticeTask } from "@/data/activities/year1/practice-task";

export type GroundAnswer = {
  /** What the child reads and hears after a wrong attempt. */
  say: string;
  /** Shown when words alone cannot tell the objects apart, such as three pencils. */
  pictures?: { src: string; label: string; size: number }[];
};

const then = (items: unknown[]) => items.join(", then ");
const each = (n: number, word: string) => `${n} ${n === 1 ? word.replace(/s$/, "") : word}`;

/** Every Ground question must return a full, true answer. Only teaching screens return null. */
export function groundAnswer(task: PracticeTask): GroundAnswer | null {
  const t = task as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
  const option = (t.options ?? []).find((o: { id: string }) => o.id === t.correctOptionId);
  const number = (n: unknown) => ({ say: `The answer is ${n}.` });
  switch (task.kind) {
    case "measurementCompare": {
      if (t.scene === "intro") return null;
      const fillWord = (level: number) => (level === 0 ? "Empty" : level < 0.3 ? "Nearly empty" : level < 0.7 ? "Half full" : level < 1 ? "Nearly full" : "Full");
      // Springs all share one picture, so the water level is the only true name for them.
      const objects: { id: string; label: string; compareValue: number; imageSrc?: string }[] = t.objects.map((o: { label: string; waterLevel?: number }) => (t.fillState && typeof o.waterLevel === "number" ? { ...o, label: fillWord(o.waterLevel) } : o));
      const byId = (id: string) => objects.find((o) => o.id === id);
      const picture = (o: { label: string; compareValue: number; imageSrc?: string }) => ({ src: o.imageSrc ?? "", label: o.label, size: o.compareValue });
      if (t.scene === "sort") return { say: `The answer is ${(t.bins ?? []).find((b: { id: string }) => b.id === t.correctOptionId)?.label ?? ({ heavy: "heavy", light: "light" } as Record<string, string>)[t.correctOptionId]}.` };
      if (t.scene === "order") {
        const ordered = (t.orderedIds as string[]).map((id) => byId(id)!);
        if (new Set(ordered.map((o) => o.label)).size === ordered.length) return { say: `The order is ${then(ordered.map((o) => o.label))}.` };
        return { say: "Look at the pictures to see the right order.", pictures: ordered.map(picture) };
      }
      const correct = byId(t.correctOptionId)!;
      if (objects.filter((o) => o.label === correct.label).length > 1) return { say: "Look at the picture to see the right answer.", pictures: [picture(correct)] };
      return { say: `The answer is ${correct.label}.` };
    }
    case "measurePath":
      if (t.scene === "intro") return null;
      if (t.scene === "build") return { say: `The path needs ${each(t.targetLength, t.unitLabel ?? "blocks")}.` };
      if (t.scene === "compare") {
        const paths: { id: string; length: number; unitLabel?: string }[] = t.paths;
        const correct = paths.find((p) => p.id === t.correctPathId)!;
        return { say: `The answer is the path with ${each(correct.length, correct.unitLabel ?? "blocks")}.` };
      }
      return number(t.correctAnswer);
    case "balanceScale": {
      if (t.demo) return null;
      type Item = { label: string; weight: number };
      const words = (items: Item[]) => items.map((i) => i.label).join(" and ");
      const weight = (items: Item[]) => items.reduce((n, i) => n + i.weight, 0);
      if (t.scales) { const s = t.scales.find((x: { id: string }) => x.id === t.correctScaleId); return { say: `The balanced scale has ${words(s.left)} and ${words(s.right)}.` }; }
      if (t.judge) return { say: weight(t.leftItems) === weight(t.rightItems) ? "This scale is balanced." : "This scale is not balanced." };
      if (t.fixActions) { const f = t.fixActions.find((x: { id: string }) => x.id === t.correctFixId); const heavy: Item[] = weight(t.leftItems) > weight(t.rightItems) ? t.leftItems : t.rightItems; const extra = heavy.at(-1); return { say: /take/i.test(f.label) && extra ? `Take off the ${extra.label}.` : `Choose ${f.label}.` }; }
      const need = weight(t.target === "right" ? t.leftItems : t.rightItems) - weight(t.target === "right" ? t.rightItems : t.leftItems);
      if (t.supply.mode === "pile") return { say: `It balances with ${need} ${t.supply.items[0].label}.` };
      const fit = t.supply.items.find((i: Item) => i.weight === need);
      return { say: `The ${fit.label} balances the scale.` };
    }
    case "groundOrderTap": {
      const numbers = (t.pathNumerals?.length ? [...t.pathNumerals] : t.tiles.map((n: { numeral: number }) => n.numeral)).sort((a: number, b: number) => (t.direction === "DESC" ? b - a : a - b));
      return { say: `The order is ${then(numbers)}.` };
    }
    case "groundCompare": {
      if (t.comparisonType === "order") {
        const groups = [...t.groups].sort((a, b) => (t.orderDirection === "DESC" ? b.quantity - a.quantity : a.quantity - b.quantity));
        return { say: `The order is ${then(groups.map((g) => g.quantity))}.` };
      }
      if (t.comparisonType === "equal" || t.comparisonType === "statement") {
        const [left, right] = [t.groups[0]?.quantity ?? 0, t.groups[1]?.quantity ?? 0];
        const yes = t.comparisonType === "equal" || t.statementRelation === "equal" ? left === right : t.statementRelation === "less" ? left < right : left > right;
        return { say: `The answer is ${yes ? "yes" : "no"}.` };
      }
      return { say: `The answer is the group of ${t.groups.find((g: { id: string }) => g.id === t.correctGroupId).quantity}.` };
    }
    case "groundSequence":
      return Array.isArray(option?.numerals) ? { say: `The answer is ${then(option.numerals)}.` } : number(option?.numeral ?? t.targetNumber);
    case "groundFoundation":
      if (t.mode === "add_to") return { say: `Add ${t.change} more.` };
      if (t.mode === "take_away") return { say: `Take away ${t.change}.` };
      if (t.mode === "equal_share") return { say: `Put ${t.total / t.groups} in each group.` };
      if (t.mode === "equal_group") return { say: `Put ${t.groupSize} in each group.` };
      if (t.mode === "continue_pattern") return { say: `The answer is ${t.answer}.` };
      if (t.mode === "identify_pattern") return { say: `The part that repeats is ${t.answer.join(", ")}.` };
      return { say: `Keep repeating ${t.repeatUnit.join(", ")}.` };
    case "groundMatch": case "groundCollect": case "groundBuild": case "groundFlash": case "groundGrowingCount": case "groundHunt":
    case "groundTapCount": case "groundMoveCount": case "groundFeed": case "groundSoundCount":
      return number(t.targetNumber);
    case "starpathShapeIntro": return null;
    case "starpathShapeMatch": case "starpathObjectShape": return { say: `The answer is the ${t.targetShape}.` };
    case "starpathShapeName": return { say: `This shape is a ${t.shape}.` };
    case "starpathShapeSort": return { say: `The ${t.shape} goes to the ${t.shape} planet.` };
    case "starpathShapeScene": return { say: `The answer is the ${t.correctObjectId}.` };
    case "starpathShapeTapAll": case "starpathShapeSprint": return { say: `Find every ${t.targetShape}.` };
    case "starpathOddOneOut": return { say: `The odd one out is the ${t.options.find((o: { id: string }) => o.id === t.oddOptionId).shape}.` };
    case "starpathCollectMission": return { say: `Collect ${t.requests.map((r: { count: number; shape: string }) => `${r.count} ${r.shape}${r.count === 1 ? "" : "s"}`).join(", ")}.` };
    case "starpathFinishPicture": return { say: `The missing shape is the ${option.shape}.` };
    case "starpathShapeBuilder": return { say: `Put every piece in place to build the ${t.objectId}.` };
    case "starpathBuildShapeIdentify": return { say: `You can see a ${t.targetShapes.join(", a ")}.` };
    case "starpathBuildMatch": case "starpathSpaceMuseum": return { say: `The answer is the ${option.objectId}.` };
    case "starpathFamilySort": return { say: "Put each shape with its own family." };
    case "starpathShapeCompare": return { say: t.answer === "same" ? "The answer is the same shape." : "The answer is different shapes." };
    case "starpathWhatChanged": return { say: `The ${t.answer} changed.` };
    case "starpathPositionFind": { const p = t.placements.find((x: { id: string }) => /correct/.test(x.id)); return { say: `The ${p.object} is ${p.relation} the ${t.anchorObject}.` }; }
    case "starpathPositionPlace": return { say: `Put the ${t.moverObject} ${t.relation} the ${t.anchorObject}.`.replace(/the geospin/g, "Geospin").replace(/the explorer/g, "the explorer") };
    case "starpathPositionPicture": { const p = t.options.find((x: { id: string }) => x.id === t.correctOptionId); return { say: `The ${p.subjectObject} is ${p.relation} the ${p.anchorObject}.` }; }
    case "starpathPositionWord": return { say: `The ${t.subjectObject} is ${t.relation} the ${t.anchorObject}.` };
    case "starpathPositionSequence": { const steps = t.placements.filter((x: { id: string }) => !/decoy/.test(x.id)); return { say: steps.map((p: { object: string; relation: string }) => `The ${p.object} is ${p.relation} the ${t.anchorObject}.`).join(" ") }; }
    default: return null;
  }
}
