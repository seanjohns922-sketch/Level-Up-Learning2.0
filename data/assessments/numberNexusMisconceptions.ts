export type NumberNexusMisconception = {
  id: string;
  label: string;
  description: string;
  descriptorCodes: readonly string[];
};

function misconception(
  id: string,
  label: string,
  description: string,
  descriptorCodes: readonly string[],
): NumberNexusMisconception {
  return { id, label, description, descriptorCodes };
}

export const NUMBER_NEXUS_MISCONCEPTION_LIBRARY: readonly NumberNexusMisconception[] = [
  misconception("numeral-quantity-disconnect", "Numeral and quantity disconnect", "Names or selects a numeral without connecting it to the represented quantity.", ["AC9MFN01", "AC9M1N01", "AC9M2N01", "AC9M3N01"]),
  misconception("counting-one-to-one", "One-to-one counting", "Skips or double-counts objects instead of coordinating one count word with each object.", ["AC9MFN03"]),
  misconception("cardinality-and-arrangement", "Cardinality and arrangement", "Assumes rearranging a collection changes how many objects it contains or does not use the final count as the total.", ["AC9MFN03"]),
  misconception("subitising-vs-counting", "Subitising versus counting", "Counts structured collections one by one or guesses from appearance instead of recognising a quantity immediately.", ["AC9MFN02", "AC9MFN04"]),
  misconception("part-whole-conservation", "Part-whole conservation", "Treats different partitions of the same whole as different totals.", ["AC9MFN04", "AC9M1N02", "AC9M2N02"]),
  misconception("operation-story-structure", "Operation and story structure", "Selects an operation from isolated keywords rather than the relationship among quantities.", ["AC9MFN05", "AC9M1N04", "AC9M1N05", "AC9M2N04", "AC9M2N06", "AC9M3N03", "AC9M3N06", "AC9M4N06", "AC9M4N08", "AC9M5N09", "AC9M6N09"]),
  misconception("equal-sharing-vs-grouping", "Equal sharing versus grouping", "Confuses the number of groups with the number in each group or accepts unequal groups.", ["AC9MFN06", "AC9M1N06", "AC9M2N05", "AC9M2N06", "AC9M3N04"]),
  misconception("repeating-unit", "Repeating pattern unit", "Continues isolated features without identifying and repeating the complete unit.", ["AC9MFA01", "AC9M1A02"]),
  misconception("skip-count-step", "Skip-count step", "Changes the constant step or confuses the number of groups with the count reached.", ["AC9M1N03", "AC9M1A01"]),
  misconception("place-value-position", "Place-value position", "Treats a digit as having the same value regardless of its position.", ["AC9M1N02", "AC9M2N02", "AC9M3N01", "AC9M4N01", "AC9M5N01"]),
  misconception("zero-placeholder", "Zero as a placeholder", "Ignores zero or treats it as having an independent value rather than preserving place.", ["AC9M2N02", "AC9M3N01"]),
  misconception("nonstandard-partition", "Non-standard partition", "Assumes only the standard place-value partition is valid.", ["AC9M1N02", "AC9M2N02", "AC9M3A01"]),
  misconception("inverse-addition-subtraction", "Addition and subtraction inverse", "Does not use the inverse relationship to check a result or find an unknown.", ["AC9M2A02"]),
  misconception("fact-recall-transfer", "Fact recall and transfer", "Recalls an isolated fact but cannot derive a related fact or use it with larger numbers.", ["AC9M2A02", "AC9M2A03"]),
  misconception("coin-count-vs-value", "Coin count versus value", "Assumes more coins means more money or compares denominations by physical size.", ["AC9M1N05", "AC9M2N06", "AC9M3M06"]),
  misconception("dollar-cent-equivalence", "Dollar and cent equivalence", "Does not recognise that 100 cents equals one dollar or cannot represent the same value in equivalent ways.", ["AC9M3M06"]),
  misconception("financial-operation-choice", "Financial operation choice", "Uses an operation that does not match the transaction, change, budget or comparison context.", ["AC9M1N05", "AC9M2N06", "AC9M3N06", "AC9M4N07", "AC9M4N08", "AC9M5N08", "AC9M5N09", "AC9M6N08", "AC9M6N09"]),
  misconception("unequal-fraction-parts", "Unequal fractional parts", "Names a fraction without checking that the whole is divided into equal parts.", ["AC9M2N03", "AC9M3N02"]),
  misconception("denominator-size", "Denominator and part size", "Assumes a larger denominator always represents a larger fraction.", ["AC9M2N03", "AC9M3N02", "AC9M4N03", "AC9M4N04", "AC9M5N03", "AC9M6N03"]),
  misconception("fraction-whole", "Fraction and its whole", "Compares fractional parts without accounting for whether they refer to the same-sized whole.", ["AC9M2N03", "AC9M3N02", "AC9M4N03", "AC9M5N03"]),
  misconception("fraction-number-line", "Fraction number-line spacing", "Places fractions by counting marks rather than equal intervals or treats numerator and denominator as coordinates.", ["AC9M4N04", "AC9M5N03", "AC9M6N03"]),
  misconception("equivalent-fraction-scale", "Equivalent fraction scaling", "Changes only the numerator or denominator when creating an equivalent fraction.", ["AC9M4N03", "AC9M5N03", "AC9M6N03", "AC9M6N05"]),
  misconception("fraction-add-denominator", "Adding fraction denominators", "Adds denominators as well as numerators or combines unlike parts without making equivalent fractions.", ["AC9M5N05", "AC9M6N05"]),
  misconception("mixed-number-whole", "Mixed numeral and whole", "Treats the whole-number and fractional components as unrelated or mislocates mixed numerals on a number line.", ["AC9M4N04", "AC9M5N03"]),
  misconception("additive-vs-multiplicative", "Additive versus multiplicative structure", "Uses repeated addition, multiplication or division without matching the multiplicative relationship in the problem.", ["AC9M2N05", "AC9M2N06", "AC9M3N04", "AC9M3N06", "AC9M4N06", "AC9M4N08", "AC9M5N06", "AC9M5N07", "AC9M5N09"]),
  misconception("remainder-context", "Remainder interpretation", "Drops, rounds or reports a remainder without interpreting what it means in context.", ["AC9M5N07"]),
  misconception("estimation-vs-exact", "Estimate versus exact result", "Treats an estimate as exact or rejects a useful estimate because it is not the exact calculation.", ["AC9M3N05", "AC9M4N07", "AC9M5N08", "AC9M6N08"]),
  misconception("reasonableness-no-reference", "Reasonableness without a reference", "Accepts or rejects an answer without comparing it with a benchmark, estimate or context constraint.", ["AC9M3N05", "AC9M4N07", "AC9M5N06", "AC9M5N08", "AC9M6N04", "AC9M6N06", "AC9M6N08"]),
  misconception("algorithm-step-order", "Algorithm step order", "Changes, omits or repeats an algorithm step and therefore generates a different result or pattern.", ["AC9M3N07", "AC9M4N09", "AC9M5N10"]),
  misconception("pattern-rule-vs-example", "Pattern rule versus example", "Describes a list of values rather than the rule that generates or extends the pattern.", ["AC9M2A01", "AC9M3N07", "AC9M4N09", "AC9M5N10"]),
  misconception("decimal-place-value", "Decimal place value", "Reads decimal digits as a whole number or confuses tenths, hundredths and thousandths.", ["AC9M4N01", "AC9M5N01", "AC9M6N04", "AC9M6N06"]),
  misconception("decimal-length", "Decimal length comparison", "Assumes the decimal with more digits is always greater.", ["AC9M4N01", "AC9M5N01"]),
  misconception("fraction-decimal-connection", "Fraction and decimal connection", "Does not preserve value when moving between equivalent fraction and decimal representations.", ["AC9M4N03", "AC9M5N04", "AC9M6N03", "AC9M6N07"]),
  misconception("percentage-whole", "Percentage and the whole", "Treats a percentage as an amount without identifying the whole or assumes 100% is an arbitrary benchmark.", ["AC9M5N04", "AC9M6N07"]),
  misconception("percentage-of-quantity", "Percentage of a quantity", "Uses the percentage numeral as the amount or applies a discount without finding the relevant proportion of the whole.", ["AC9M6N07", "AC9M6N09"]),
  misconception("odd-even-properties", "Odd and even properties", "Classifies from the size of a number or applies an incorrect parity rule to a sum or product.", ["AC9M4N02"]),
  misconception("factor-vs-multiple", "Factor versus multiple", "Interchanges factors and multiples or treats every smaller number as a factor.", ["AC9M5N02", "AC9M5N10", "AC9M6N02"]),
  misconception("prime-composite-one", "Prime, composite and one", "Classifies one as prime or composite, or assumes every odd number is prime.", ["AC9M6N02"]),
  misconception("powers-ten-direction", "Powers-of-ten direction", "Moves digits or the decimal point in the wrong direction without reasoning about place value.", ["AC9M4N05", "AC9M6N06"]),
  misconception("integer-order", "Integer order", "Assumes the negative integer with the greater magnitude is the greater number.", ["AC9M6N01"]),
  misconception("coordinate-sign", "Coordinate sign and order", "Reverses coordinate order or ignores the signs that identify a quadrant.", ["AC9M6N01"]),
  misconception("decimal-operation-alignment", "Decimal operation alignment", "Aligns decimal digits by the end of the numeral instead of by place value.", ["AC9M6N04"]),
];

export const NUMBER_NEXUS_MISCONCEPTION_IDS = new Set(
  NUMBER_NEXUS_MISCONCEPTION_LIBRARY.map((item) => item.id),
);
