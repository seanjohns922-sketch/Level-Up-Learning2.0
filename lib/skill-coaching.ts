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

  if (/balanc/.test(hay)) return "balance";
  if (/order/.test(hay) && /(mass|weight|heav|light)/.test(hay)) return "mass_order";
  if (/(heav|light|mass|weigh)/.test(hay)) return "mass_compare";
  if (/order/.test(hay) && /(length|short|long|tall)/.test(hay)) return "length_order";
  if (/path|measur|unit/.test(hay)) return "path_measure";
  if (/(length|short|long|tall)/.test(hay)) return "length_compare";
  if (/number line|halfway|marker/.test(hay)) return "number_line";
  if (/place value|tens|hundreds|column|digit/.test(hay)) return "place_value";
  if (/order/.test(hay)) return "ordering_numbers";
  if (/count/.test(hay)) return "counting";
  if (/number|numeral/.test(hay)) return "number_id";
  return "__fallback__";
}

export function getSkillCoaching(key: string): SkillCoaching {
  return TABLE[key] ?? FALLBACK;
}
