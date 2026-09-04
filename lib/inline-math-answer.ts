import type { TypedResponseQuestion } from "@/data/activities/year2/lessonEngine";

function countTextOccurrences(text: string, marker: string) {
  return marker ? text.split(marker).length - 1 : 0;
}

export function countInlineMathAnswerSlots(visual: TypedResponseQuestion["visual"]) {
  if (!visual) return 0;
  if (visual.type === "pattern_sequence_strip") {
    return visual.terms.filter((term) => term === "?").length;
  }
  if (visual.type === "function_machine_card") {
    return [visual.input, visual.rule, visual.output].filter((value) => value === "?").length;
  }
  if (visual.type === "input_output_table") {
    return visual.pairs.flatMap((pair) => [pair.input, pair.output]).filter((value) => value === "?").length;
  }
  if (visual.type === "expression_flow") {
    return visual.cards.reduce(
      (total, card) =>
        total + card.tokens.filter((token) => token === "?").length + (card.result === "?" ? 1 : 0),
      0,
    );
  }
  if (visual.type === "factor_pair_tree") {
    return visual.pairs.reduce(
      (total, pair) => total + (pair.left === "?" ? 1 : 0) + (pair.right === "?" ? 1 : 0),
      0,
    );
  }
  if (visual.type === "balance_equation_card" || visual.type === "unknown_tile_equation") {
    const marker = visual.unknownSymbol ?? "□";
    return countTextOccurrences(visual.left, marker) + countTextOccurrences(visual.right, marker);
  }
  if (visual.type === "inverse_step_card") {
    return countTextOccurrences(visual.equation, "?") + countTextOccurrences(visual.inverseOperation, "?");
  }
  if (visual.type === "bracket_equation_card") {
    const marker = visual.left.includes("□") || visual.right.includes("□") ? "□" : "?";
    return countTextOccurrences(visual.left, marker) + countTextOccurrences(visual.right, marker);
  }
  return 0;
}
