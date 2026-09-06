export const PATTERN_PEAKS_MISCONCEPTION_LIBRARY = [
  { id: "pp-rule-from-one-step", descriptorCodes: ["AC9M3A04"], description: "Infers an algorithm from one step without checking every input or transition." },
  { id: "pp-operation-direction", descriptorCodes: ["AC9M3A01", "AC9M4A01"], description: "Uses the original operation instead of its inverse." },
  { id: "pp-equals-answer-cue", descriptorCodes: ["AC9M3A01", "AC9M4A01"], description: "Treats equals as an instruction to calculate rather than a relation." },
  { id: "pp-additive-fact-extension", descriptorCodes: ["AC9M3A02"], description: "Does not preserve a known addition or subtraction fact when extending it to larger place values." },
  { id: "pp-algorithm-branch-error", descriptorCodes: ["AC9M3A04"], description: "Chooses the wrong decision branch or performs algorithm steps in the wrong order." },
  { id: "pp-sequence-step-confusion", descriptorCodes: ["AC9M5A01"], description: "Applies an inconsistent additive step or changes the wrong part of a fraction or decimal sequence." },
  { id: "pp-related-fact-confusion", descriptorCodes: ["AC9M3A03", "AC9M4A02", "AC9M5A02"], description: "Does not preserve a product or fact family when transforming a fact." },
  { id: "pp-property-overgeneralisation", descriptorCodes: ["AC9M4A01", "AC9M5A02"], description: "Applies a multiplication or addition property to subtraction or division." },
  { id: "pp-factor-multiple-confusion", descriptorCodes: ["AC9M5A02", "AC9M5A03"], description: "Confuses a factor of a number with a multiple of that number." },
  { id: "pp-systematic-search-gap", descriptorCodes: ["AC9M5A03"], description: "Stops a factor or multiple search early, skips a valid result, or does not recognise the emerging pattern." },
  { id: "pp-distributive-part-missed", descriptorCodes: ["AC9M5A02"], description: "Distributes to only one part or fails to recombine both partial products." },
  { id: "pp-growth-additive-only", descriptorCodes: ["AC9M6A01"], description: "Reads a visual growth pattern from totals without connecting stage and structure." },
  { id: "pp-rule-representation-mismatch", descriptorCodes: ["AC9M6A01", "AC9M6A02"], description: "Matches a rule to one value but not the full table, graph or sequence." },
  { id: "pp-operation-order", descriptorCodes: ["AC9M6A02", "AC9M6A03"], description: "Ignores brackets or performs a multi-step algorithm in the wrong order." },
  { id: "pp-unknown-guess-check", descriptorCodes: ["AC9M6A02", "AC9M6A03"], description: "Guesses an unknown without undoing operations or checking substitution." },
] as const;

export function getPatternPeaksMisconceptions(descriptorCode: string) {
  return PATTERN_PEAKS_MISCONCEPTION_LIBRARY.filter((item) => item.descriptorCodes.includes(descriptorCode as never));
}
