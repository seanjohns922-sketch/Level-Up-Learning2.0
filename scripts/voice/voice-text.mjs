// Text sent to the voice model. The app's speech text stays as it is (it is also the
// clip key); this only rewrites what the cloned voice reads, because the model
// stumbles on unit abbreviations ("°C", "kg", "m") and the app's "..." pause marks.

const UNITS = {
  "°C": ["degree Celsius", "degrees Celsius"],
  mm: ["millimetre", "millimetres"], cm: ["centimetre", "centimetres"], km: ["kilometre", "kilometres"], m: ["metre", "metres"],
  kg: ["kilogram", "kilograms"], g: ["gram", "grams"], mL: ["millilitre", "millilitres"], L: ["litre", "litres"],
  s: ["second", "seconds"], min: ["minute", "minutes"], h: ["hour", "hours"], ha: ["hectare", "hectares"],
};
const UNIT_PATTERN = "°C|mm|cm|km|kg|mL|min|ha|m|g|L|s|h";

/** "16 m" → "16 metres", "20 m squared" → "20 square metres", "1 L" → "1 litre". */
export function expandUnits(text) {
  return text
    .replace(new RegExp(`(\\d(?:[\\d.,]*\\d)?)\\s?(${UNIT_PATTERN}) squared\\b`, "g"), (_, n, u) => `${n} square ${UNITS[u][n === "1" ? 0 : 1]}`)
    .replace(new RegExp(`(\\d(?:[\\d.,]*\\d)?)\\s?(${UNIT_PATTERN})(?![A-Za-z²])`, "g"), (_, n, u) => `${n} ${UNITS[u][n === "1" ? 0 : 1]}`)
    .replace(/°C\b/g, "degrees Celsius")
    // Units named on their own in a list: "like m or cm" → "like metres or centimetres".
    .replace(/\b(like|or|and|in) (mm|cm|km|kg|mL|m|g|L)\b(?! [a-z]*x\b)/g, (_, w, u) => `${w} ${UNITS[u][1]}`);
}

export function forVoice(normalized) {
  // The model swallows a lone opening word, so "Tip." becomes "Here's a tip."
  const text = normalized.replace(/^Tip\. (\.\.\. )?/, "Here's a tip. ").replace(/([.?!]) \.\.\. /g, "$1 ").replace(/ \.\.\. of /g, " of ");
  return expandUnits(text)
    .replace(/\s+([,.])/g, "$1").replace(/\s+/g, " ").trim();
}
