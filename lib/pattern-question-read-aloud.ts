import type {
  MultipleChoiceQuestion,
  TypedResponseQuestion,
} from "@/data/activities/year2/lessonEngine";

type PatternQuestion = MultipleChoiceQuestion | TypedResponseQuestion;
type PatternVisual = NonNullable<PatternQuestion["visual"]>;

function speakMath(value: string | number) {
  return String(value)
    .replaceAll("□", " blank ")
    .replaceAll("?", " blank ")
    .replaceAll("×", " times ")
    .replaceAll("÷", " divided by ")
    .replaceAll("−", " minus ")
    .replaceAll("+", " plus ")
    .replaceAll("=", " equals ")
    .replaceAll("→", " then ")
    .replaceAll("(", " open bracket ")
    .replaceAll(")", " close bracket ")
    .replace(/\s+/g, " ")
    .trim();
}

function patternVisualSpeech(visual: PatternVisual) {
  switch (visual.type) {
    case "array":
      return `Array. ${visual.rows} rows and ${visual.columns} columns.`;
    case "pattern_sequence_strip": {
      const rules = visual.arrowLabels?.filter((label): label is string => Boolean(label));
      return [
        visual.title,
        `Terms: ${visual.terms.map(speakMath).join(", ")}.`,
        rules?.length ? `Rules between terms: ${rules.map(speakMath).join(", ")}.` : "",
      ].filter(Boolean).join(" ");
    }
    case "growing_pattern":
      return `${visual.title}. ${visual.stages.map((stage) => `${stage.label}: ${stage.count}`).join(". ")}.`;
    case "function_machine_card":
      return `${visual.title}. Input ${speakMath(visual.input)}. Rule ${speakMath(visual.rule)}. Output ${speakMath(visual.output)}.`;
    case "input_output_table":
      return `${visual.title}. ${visual.pairs.map((pair) => `Input ${speakMath(pair.input)}, output ${speakMath(pair.output)}`).join(". ")}.`;
    case "expression_flow":
      return `${visual.title}. ${visual.cards.map((card) => [
        card.label,
        speakMath(card.tokens.join(" ")),
        card.result ? `Result ${speakMath(card.result)}` : "",
        card.note,
      ].filter(Boolean).join(". ")).join(". ")}.`;
    case "decision_path_card":
      return [
        `${visual.title}. Number in: ${speakMath(visual.input)}.`,
        `Gate: ${speakMath(visual.decision)}.`,
        `If yes: ${speakMath(visual.passLabel)}${visual.passOutput ? `, giving ${speakMath(visual.passOutput)}` : ""}.`,
        `If no: ${speakMath(visual.failLabel)}${visual.failOutput ? `, giving ${speakMath(visual.failOutput)}` : ""}.`,
      ].join(" ");
    case "factor_pair_tree":
      return `${visual.title}. Product ${visual.product}. Factor pairs: ${visual.pairs.map((pair) => `${speakMath(pair.left)} times ${speakMath(pair.right)} equals ${visual.product}`).join(". ")}.`;
    case "balance_equation_card":
    case "unknown_tile_equation":
      return `${visual.title}. Left side: ${speakMath(visual.left)}. Equals right side: ${speakMath(visual.right)}.`;
    case "inverse_step_card":
      return `${visual.title}. Equation: ${speakMath(visual.equation)}. ${visual.focusLabel ?? "Undo step"}: ${speakMath(visual.inverseOperation)}.`;
    case "bracket_equation_card":
      return [
        visual.title,
        `Left side: ${speakMath(visual.left)}. Equals right side: ${speakMath(visual.right)}.`,
        visual.bracketGroup ? `Bracket group: ${speakMath(visual.bracketGroup)}.` : "",
        visual.outsideFactor ? `Outside step: ${speakMath(visual.outsideFactor)}.` : "",
      ].filter(Boolean).join(" ");
    default:
      return "";
  }
}

export function getPatternQuestionReadAloudText(question: PatternQuestion) {
  return [
    question.prompt,
    question.helper ? `Help: ${question.helper}` : "",
    "instruction" in question && question.instruction ? `Instruction: ${question.instruction}` : "",
    question.visual ? patternVisualSpeech(question.visual) : "",
  ].filter(Boolean).join(" ");
}
