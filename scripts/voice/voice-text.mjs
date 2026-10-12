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
    .replace(/\b(like|or|and|in|gives|unit:) (mm|cm|km|kg|mL|m|g|L)\b(?! [a-z]*x\b)/g, (_, w, u) => `${w} ${UNITS[u][1]}`);
}

const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty"];
const upTo59 = (n) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : ""));

/**
 * Times read the way a teacher says them: "3:15 pm" → "three fifteen p m",
 * "3:00" → "three o'clock", "2:05" → "two oh five", 24-hour "15:15" → "fifteen fifteen",
 * "05:50" → "zero five fifty", "14:00" → "fourteen hundred", "12:xx" → "twelve something".
 */
export function speakTimes(text) {
  return text
    .replace(/\b(\d{1,2}):xx\b/g, (_, h) => `${upTo59(Number(h))} something`)
    .replace(/\b(\d{1,2}):(\d{2})(?: ?([ap])m\b)?/g, (match, hh, mm, ap) => {
      const h = Number(hh), m = Number(mm);
      if (h > 23 || m > 59) return match;
      const twentyFour = !ap && (hh.length === 2 && (hh[0] === "0" || h > 12));
      const hour = twentyFour ? (hh[0] === "0" ? `zero ${ONES[Number(hh[1])]}` : upTo59(h)) : upTo59(h);
      const minutes = m === 0 ? (twentyFour ? "hundred" : ap ? "" : "o'clock") : m < 10 ? `oh ${ONES[m]}` : upTo59(m);
      return [hour, minutes, ap ? `${ap} m` : ""].filter(Boolean).join(" ");
    })
    .replace(/\bpm\b/g, "p m").replace(/\bis am\b/g, "is a m");
}

const BIG = [[1e9, "billion"], [1e6, "million"], [1e3, "thousand"]];
/** Whole numbers in Australian words: 50661 → "fifty thousand, six hundred and sixty-one". */
function numberWords(n) {
  if (n < 100) return n < 20 ? ONES[n] : TENS2[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "");
  if (n < 1000) return `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` and ${numberWords(n % 100)}` : ""}`;
  for (const [size, name] of BIG) if (n >= size) {
    const rest = n % size;
    return `${numberWords(Math.floor(n / size))} ${name}${rest ? (rest < 100 ? ` and ${numberWords(rest)}` : `, ${numberWords(rest)}`) : ""}`;
  }
  return String(n);
}
const TENS2 = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
/** Spell whole numbers of 1000 or more, which the voice model can misread. */
export const speakBigNumbers = (text) => text.replace(/(?<![\d.,])\d{4,}(?![\d.]|,\d)/g, (d) => numberWords(Number(d)));

export function forVoice(normalized) {
  // The model swallows a lone opening word, so "Tip." becomes "Here's a tip."
  const text = normalized.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, "").replace(/^Tip\. (\.\.\. )?/, "Here's a tip. ").replace(/([.?!]) \.\.\. /g, "$1 ").replace(/ \.\.\. of /g, " of ");
  return expandUnits(speakBigNumbers(speakTimes(text.replaceAll("≈", " approximately "))))
    .replace(/\s+([,.])/g, "$1").replace(/\s+/g, " ").trim();
}
