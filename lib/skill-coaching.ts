// ── Skill coaching table (rule-based, authored once per skill) ───────────────
// Powers the Lesson Coach Review. Short, positive, actionable lines keyed by a
// "coaching key". Authored at the SKILL level (a dozen entries), never per
// question. Tips stay under ~15 words. Unknown skills fall back safely.

export type SkillCoaching = {
  /** One short rule/strategy ("Coach Tip"). Under 15 words. */
  tip: string;
  /** Positive line when the student did well at this skill. */
  strengthLine?: string;
  /** Gentle "what to focus on" line. */
  focusLine?: string;
};

const TABLE: Record<string, SkillCoaching> = {
  // Measurelands — length
  length_compare: {
    tip: "Line up the start points before comparing length.",
    strengthLine: "You were great at comparing lengths!",
    focusLine: "Line up the start points before you compare.",
  },
  length_order: {
    tip: "Start with the shortest, then move to the longest.",
    strengthLine: "You ordered the lengths really well!",
    focusLine: "Start with the shortest, then build up.",
  },
  path_measure: {
    tip: "Follow the path carefully from start to finish.",
    strengthLine: "Nice careful counting along the path!",
    focusLine: "Count each unit from start to finish.",
  },
  // Measurelands — mass
  mass_compare: {
    tip: "Heavy objects make the scale go down.",
    strengthLine: "You spotted the heavier objects really well!",
    focusLine: "The heavier side pushes the scale down.",
  },
  mass_order: {
    tip: "Start with the lightest, then move to the heaviest.",
    strengthLine: "You ordered the weights really well!",
    focusLine: "Start with the lightest, then build up.",
  },
  balance: {
    tip: "A balanced scale means both sides weigh the same.",
    strengthLine: "You balanced the scales really well!",
    focusLine: "Look carefully at both sides of the scale.",
  },
  // Number Nexus — Ground
  counting: {
    tip: "Count each one carefully, one at a time.",
    strengthLine: "Great careful counting!",
    focusLine: "Count slowly, one at a time.",
  },
  number_id: {
    tip: "Look closely at the shape of each number.",
    strengthLine: "Great number spotting!",
    focusLine: "Look closely at each number.",
  },
  ordering_numbers: {
    tip: "Start with the smallest, then count up.",
    strengthLine: "Nice ordering of the numbers!",
    focusLine: "Start with the smallest number.",
  },
  place_value: {
    tip: "Check which column the digit is in.",
    strengthLine: "Strong place value work!",
    focusLine: "Check the column carefully.",
  },
  number_line: {
    tip: "Look at the start, end and halfway point.",
    strengthLine: "Nice number line placing!",
    focusLine: "Find the start, end and halfway point first.",
  },

  // Number Nexus — operations
  addition: {
    tip: "Start with the bigger number, then count on.",
    strengthLine: "You added those numbers really well!",
    focusLine: "Count on from the bigger number.",
  },
  subtraction: {
    tip: "Count back one step at a time to take away.",
    strengthLine: "Great work taking numbers away!",
    focusLine: "Count back slowly, one step at a time.",
  },
  multiplication: {
    tip: "Multiplying is counting equal groups the fast way.",
    strengthLine: "You know your times tables really well!",
    focusLine: "Picture equal groups added together.",
  },
  division: {
    tip: "Sharing fairly means every group gets the same.",
    strengthLine: "You shared into equal groups really well!",
    focusLine: "Give one to each group until none are left.",
  },

  // Number Nexus — rational & proportion
  fractions: {
    tip: "The bottom number shows how many equal parts.",
    strengthLine: "You understand fractions really well!",
    focusLine: "Check every part is exactly the same size.",
  },
  decimals: {
    tip: "The decimal point keeps wholes and parts apart.",
    strengthLine: "Great work reading those decimals!",
    focusLine: "Line up the decimal points before comparing.",
  },
  percentages: {
    tip: "Percent always means out of one hundred.",
    strengthLine: "You worked out the percentages really well!",
    focusLine: "Remember, percent means out of one hundred.",
  },

  // Number Nexus — money & time
  money: {
    tip: "Add coins by starting with the biggest one.",
    strengthLine: "You counted that money really well!",
    focusLine: "Start with the biggest coins, then add the rest.",
  },
  time: {
    tip: "Short hand shows hours, long hand shows minutes.",
    strengthLine: "You read the clock really well!",
    focusLine: "Check the short hand for the hour first.",
  },

  // Measurelands — capacity, area, perimeter
  capacity: {
    tip: "Capacity is how much a container can hold.",
    strengthLine: "You compared how much each holds really well!",
    focusLine: "Look at how high it fills the container.",
  },
  area: {
    tip: "Area is the space inside — count the squares.",
    strengthLine: "You measured the area really well!",
    focusLine: "Count every square inside the shape.",
  },
  perimeter: {
    tip: "Perimeter is the distance all the way around.",
    strengthLine: "You measured around the shape really well!",
    focusLine: "Add up every side, all the way around.",
  },
};

const FALLBACK: SkillCoaching = {
  tip: "Keep practising — you get a little better every time!",
};

// Explicit lesson → coaching key (the lessons we control).
const LESSON_KEY_MAP: Record<string, string> = {
  "y0-measurement-w1-l1": "length_compare",
  "y0-measurement-w1-l2": "length_order",
  "y0-measurement-w1-l3": "path_measure",
  "y0-measurement-w2-l1": "mass_compare",
  "y0-measurement-w2-l2": "mass_order",
  "y0-measurement-w2-l3": "balance",
};

/** Resolve a coaching key from the lesson + its observed topics/skills. */
export function resolveCoachingKey(input: {
  lessonId?: string | null;
  topicLabels?: string[];
  practisedSkills?: string[];
}): string {
  const explicit = input.lessonId ? LESSON_KEY_MAP[input.lessonId] : undefined;
  if (explicit) return explicit;

  const hay = [...(input.practisedSkills ?? []), ...(input.topicLabels ?? [])]
    .join(" ")
    .toLowerCase();

  // ── Measurement (Measurelands) ──
  if (/balanc/.test(hay)) return "balance";
  if (/order/.test(hay) && /(mass|weight|heav|light)/.test(hay)) return "mass_order";
  if (/(heav|light|mass|weigh)/.test(hay)) return "mass_compare";
  if (/perimeter/.test(hay)) return "perimeter";
  if (/\barea\b|square unit/.test(hay)) return "area";
  if (/capacity|volume|litre|liter|pour|how much.*hold|fill/.test(hay)) return "capacity";
  if (/order/.test(hay) && /(length|short|long|tall)/.test(hay)) return "length_order";
  if (/path/.test(hay)) return "path_measure";
  if (/(length|short|long|tall|measur|unit)/.test(hay)) return "length_compare";

  // ── Number domains (most specific first) ──
  if (/percent|%/.test(hay)) return "percentages";
  if (/decimal/.test(hay)) return "decimals";
  if (/number line|halfway|marker/.test(hay)) return "number_line";
  if (/fraction|numerator|denominator|quarter|\bhalf\b|third|fifth|eighth/.test(hay)) return "fractions";
  if (/money|coin|cent|dollar|\$|price|cost|change/.test(hay)) return "money";
  if (/time|clock|o'?clock|hour|minute/.test(hay)) return "time";

  // ── Operations ──
  if (/multipl|times table|times|product|array|groups of/.test(hay)) return "multiplication";
  if (/divi|share|sharing|quotient/.test(hay)) return "division";
  if (/subtract|minus|take away|take-away|difference/.test(hay)) return "subtraction";
  if (/add|plus|\bsum\b|altogether|total/.test(hay)) return "addition";

  // ── Core number ──
  if (/place value|tens|hundreds|column|digit/.test(hay)) return "place_value";
  if (/order/.test(hay)) return "ordering_numbers";
  if (/count/.test(hay)) return "counting";
  if (/number|numeral/.test(hay)) return "number_id";
  return "__fallback__";
}

export function getSkillCoaching(key: string): SkillCoaching {
  return TABLE[key] ?? FALLBACK;
}
