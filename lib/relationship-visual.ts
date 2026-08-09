const RELATIONSHIP_VISUAL_TYPES = new Set([
  "pattern_sequence_strip",
  "growing_pattern",
  "error_pattern",
  "function_machine_card",
  "input_output_table",
  "missing_rule_machine",
  "reverse_machine_card",
  "rule_match_cards",
  "ordered_pair_builder",
  "table_to_pair_cards",
  "mini_coordinate_preview",
  "cartesian_grid",
  "expression_flow",
  "balance_equation_card",
  "inverse_step_card",
  "unknown_tile_equation",
  "bracket_equation_card",
  "check_substitution_card",
  "rule_builder_card",
  "term_position_card",
  "term_predictor_card",
  "reverse_pattern_card",
]);

export type RelationshipResponseKind = "multiple_choice" | "typed_response";

export function promptNeedsRelationshipVisual(prompt: string, responseKind: RelationshipResponseKind) {
  const lower = prompt.toLowerCase();
  return (
    lower.includes("what is x") ||
    lower.includes("solve the equation") ||
    lower.includes("bracket equation") ||
    (responseKind === "typed_response" && lower.includes("find the missing value")) ||
    lower.includes("find the rule") ||
    lower.includes("which rule") ||
    lower.includes("what is the rule") ||
    lower.includes("find the output") ||
    lower.includes("what is the output") ||
    lower.includes("find the input") ||
    lower.includes("what is the input") ||
    lower.includes("which coordinate") ||
    lower.includes("new coordinate") ||
    lower.includes("quadrant") ||
    lower.includes("moves to") ||
    lower.includes("moves right") ||
    lower.includes("moves left") ||
    lower.includes("moves up") ||
    lower.includes("moves down") ||
    (responseKind === "typed_response" && lower.includes("tap the point")) ||
    (responseKind === "typed_response" && lower.includes("find and plot")) ||
    lower.includes("pattern") ||
    lower.includes("sequence")
  );
}

export function hasRelationshipVisual(visualType: string | undefined) {
  return typeof visualType === "string" && RELATIONSHIP_VISUAL_TYPES.has(visualType);
}

export function hasRequiredRelationshipVisual(
  prompt: string,
  visualType: string | undefined,
  responseKind: RelationshipResponseKind,
) {
  if (!promptNeedsRelationshipVisual(prompt, responseKind)) return true;
  if (hasRelationshipVisual(visualType)) return true;

  const lower = prompt.toLowerCase();
  const asksForRule = lower.includes("find the rule") || lower.includes("which rule") || lower.includes("what is the rule");
  return visualType === "rule_box" && asksForRule;
}
