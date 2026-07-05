// ── Skill coaching table (rule-based, authored once per skill) ───────────────
// Powers the Lesson Coach Review. Short, positive, actionable lines keyed by a
// "coaching key". Tips stay short, positive, and tied to the current lesson or
// quiz objective. Unknown skills fall back safely.

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
    tip: "Compare the ends after checking the starts are lined up.",
    strengthLine: "You were great at comparing lengths!",
    focusLine: "Check the starts, then compare the ends.",
  },
  length_order: {
    tip: "Use the shortest and longest objects to anchor your order.",
    strengthLine: "You ordered the lengths really well!",
    focusLine: "Find the shortest first, then build the order.",
  },
  path_measure: {
    tip: "Count each equal path unit once from start to finish.",
    strengthLine: "Nice careful counting along the path!",
    focusLine: "Count every path unit once.",
  },
  // Measurelands — mass
  mass_compare: {
    tip: "Use the scale result, not the object's picture size.",
    strengthLine: "You spotted the heavier objects really well!",
    focusLine: "Check which side of the scale goes down.",
  },
  mass_order: {
    tip: "Order mass by the scale or cube-count result.",
    strengthLine: "You ordered the weights really well!",
    focusLine: "Find the lightest first, then build up.",
  },
  balance: {
    tip: "Equal mass keeps the balance scale level.",
    strengthLine: "You balanced the scales really well!",
    focusLine: "Check whether the scale is level or tilted.",
  },
  duration_compare: {
    tip: "Compare activities by how long they usually take.",
    strengthLine: "You compared durations well!",
    focusLine: "Think about the real activity time.",
  },
  calendar_sequence: {
    tip: "Use the calendar order before choosing what comes next.",
    strengthLine: "You followed the calendar sequence well!",
    focusLine: "Find the anchor day or month first.",
  },
  time_sequence: {
    tip: "Use first, next, and last to build the sequence.",
    strengthLine: "You sequenced the events well!",
    focusLine: "Ask what must happen before the next step.",
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
    tip: "Use cup counts or fill clues, not container height.",
    strengthLine: "You compared how much each holds really well!",
    focusLine: "Compare the measured capacity clue first.",
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

  // Measurelands — Prep exact lesson and quiz tips
  ml_prep_w1_l1: { tip: "Line up the starts, then compare which end reaches farther." },
  ml_prep_w1_l2: { tip: "Find the shortest length first, then place the longer ones." },
  ml_prep_w1_l3: { tip: "Count each equal path piece once from start to finish." },
  ml_prep_w2_l1: { tip: "Use heavy or light from the object, not its card size." },
  ml_prep_w2_l2: { tip: "Place the lightest object first and the heaviest last." },
  ml_prep_w2_l3: { tip: "A level scale means both sides have equal mass." },
  ml_prep_w3_l1: { tip: "Choose holds more by the container's real capacity." },
  ml_prep_w3_l2: { tip: "Order containers by how much they can hold." },
  ml_prep_w3_l3: { tip: "Look for empty, half full, nearly full, or full." },
  ml_prep_w4_l1: { tip: "Choose the activity that usually takes more time." },
  ml_prep_w4_l2: { tip: "Order activities from quickest to longest in real life." },
  ml_prep_w4_l3: { tip: "Sort quick or slow by how long the activity takes." },
  ml_prep_w5_l1: { tip: "Use the day name and week-trail cue together." },
  ml_prep_w5_l2: { tip: "Days follow the same order every week." },
  ml_prep_w5_l3: { tip: "Weekdays are school days; weekends are Saturday and Sunday." },
  ml_prep_w6_l1: { tip: "Match the scene to morning, afternoon, evening, or night." },
  ml_prep_w6_l2: { tip: "Choose when the activity usually happens in the day." },
  ml_prep_w6_l3: { tip: "Put daily events in the order they happen." },
  ml_prep_w7_l1: { tip: "Today is the calendar card with the special star." },
  ml_prep_w7_l2: { tip: "Yesterday is before today; tomorrow is after today." },
  ml_prep_w7_l3: { tip: "Move one day forward to find what comes next." },
  ml_prep_w8_l1: { tip: "Identify length, mass, or capacity before choosing." },
  ml_prep_w8_l2: { tip: "Use quick, slow, first, and next clues." },
  ml_prep_w8_l3: { tip: "Choose the measurement strategy that matches the challenge." },
  ml_prep_w1_quiz: { tip: "Use longer, shorter, and path-count strategies from Length Lands." },
  ml_prep_w2_quiz: { tip: "Use heavy, light, order, and balance clues." },
  ml_prep_w3_quiz: { tip: "Use holds-more, ordering, and fill-state clues." },
  ml_prep_w4_quiz: { tip: "Use quicker, slower, and activity-order clues." },
  ml_prep_w5_quiz: { tip: "Use day names, day order, and weekday clues." },
  ml_prep_w6_quiz: { tip: "Use time-of-day scenes and routine order." },
  ml_prep_w7_quiz: { tip: "Use today as the anchor, then move one day." },
  ml_prep_w8_quiz: { tip: "Identify the measurement type before choosing your strategy." },

  // Measurelands — Year 1 exact lesson and quiz tips
  ml_y1_w1_l1: { tip: "Count equal blocks touching end-to-end to measure length." },
  ml_y1_w1_l2: { tip: "Compare block numbers; more blocks means longer." },
  ml_y1_w1_l3: { tip: "A fair length measure has no gaps or overlaps." },
  ml_y1_w2_l1: { tip: "Count the equal balance cubes to measure mass." },
  ml_y1_w2_l2: { tip: "Compare mass by cube counts, not object size." },
  ml_y1_w2_l3: { tip: "Measurements are fair only when the unit stays the same." },
  ml_y1_w3_l1: { tip: "Count the cups using the same cup each time." },
  ml_y1_w3_l2: { tip: "Compare capacity by cup counts, not container height." },
  ml_y1_w3_l3: { tip: "Choose a capacity unit that makes measuring sensible." },
  ml_y1_w4_l1: { tip: "Choose hour, day, or week by the activity length." },
  ml_y1_w4_l2: { tip: "Compare durations by usual time, not picture size." },
  ml_y1_w4_l3: { tip: "Sort activities by about an hour, day, or week." },
  ml_y1_w5_l1: { tip: "Seven days make one week; use the full strip." },
  ml_y1_w5_l2: { tip: "A month is bigger because it has several weeks." },
  ml_y1_w5_l3: { tip: "Months repeat in the same order after December." },
  ml_y1_w6_l1: { tip: "Find the date by matching row and day position." },
  ml_y1_w6_l2: { tip: "Start at the date, then count forward or back." },
  ml_y1_w6_l3: { tip: "Check the calendar day and date together." },
  ml_y1_w7_l1: { tip: "Yesterday is one day before today on the calendar." },
  ml_y1_w7_l2: { tip: "Today is your anchor day on the calendar." },
  ml_y1_w7_l3: { tip: "Tomorrow is one day after today on the calendar." },
  ml_y1_w8_l1: { tip: "Use first, next, and last to order the routine." },
  ml_y1_w8_l2: { tip: "Match each activity to when it happens in the day." },
  ml_y1_w8_l3: { tip: "Sequence the story by what must happen next." },
  ml_y1_w1_quiz: { tip: "Use block counts, fair alignment, and no-gap measuring." },
  ml_y1_w2_quiz: { tip: "Use balance-cube counts and same-unit reasoning." },
  ml_y1_w3_quiz: { tip: "Use cup counts and sensible units, not appearance." },
  ml_y1_w4_quiz: { tip: "Use hour, day, and week duration clues." },
  ml_y1_w5_quiz: { tip: "Use day, week, month, and year order." },
  ml_y1_w6_quiz: { tip: "Find the date first, then count on the calendar." },
  ml_y1_w7_quiz: { tip: "Use today as the anchor for yesterday and tomorrow." },
  ml_y1_w8_quiz: { tip: "Use first, next, last, and story order." },

  // Measurelands — Year 2 exact lesson and quiz tips
  ml_y2_w1_l1: { tip: "Measure both lengths, then compare how many more units." },
  ml_y2_w1_l2: { tip: "Order by unit count; the greatest count goes last." },
  ml_y2_w1_l3: { tip: "Choose the tool that fits the object's size." },
  ml_y2_w2_l1: { tip: "The balance cubes tell the answer, not object size." },
  ml_y2_w2_l2: { tip: "Compare cube counts to find by how many." },
  ml_y2_w2_l3: { tip: "Predict first, then prove it with cube counts." },
  ml_y2_w3_l1: { tip: "Compare cup counts first, not container height." },
  ml_y2_w3_l2: { tip: "Order capacities by cup count from least to greatest." },
  ml_y2_w3_l3: { tip: "Choose the unit that makes measuring quickest and clearest." },
  ml_y2_w4_l1: { tip: "Check whether the measure stops on or between units." },
  ml_y2_w4_l2: { tip: "The closer measure has less leftover space." },
  ml_y2_w1_quiz: { tip: "Use measured counts to compare, order, and choose tools." },
  ml_y2_w2_quiz: { tip: "Use balance-cube counts to prove mass comparisons." },
  ml_y2_w3_quiz: { tip: "Use cup counts and sensible capacity units to justify answers." },
  ml_y2_w4_quiz: { tip: "Use exact and in-between measures to choose closer counts." },

  // Measurelands — Year 3 exact lesson tips
  ml_y3_w3_l1: { tip: "Think about how heavy the object would feel, then choose grams or kilograms." },
  ml_y3_w3_l2: { tip: "Read the number and unit on the scale before choosing the mass." },
  ml_y3_w3_l3: { tip: "Compare the mass measurements first; the greater measurement is heavier." },
};

const FALLBACK: SkillCoaching = {
  tip: "Keep practising — you get a little better every time!",
};

// Explicit lesson → coaching key (the lessons we control).
const LESSON_KEY_MAP: Record<string, string> = {
  "y0-measurement-w1-l1": "ml_prep_w1_l1",
  "y0-measurement-w1-l2": "ml_prep_w1_l2",
  "y0-measurement-w1-l3": "ml_prep_w1_l3",
  "y0-measurement-w2-l1": "ml_prep_w2_l1",
  "y0-measurement-w2-l2": "ml_prep_w2_l2",
  "y0-measurement-w2-l3": "ml_prep_w2_l3",
  "y0-measurement-w3-l1": "ml_prep_w3_l1",
  "y0-measurement-w3-l2": "ml_prep_w3_l2",
  "y0-measurement-w3-l3": "ml_prep_w3_l3",
  "y0-measurement-w4-l1": "ml_prep_w4_l1",
  "y0-measurement-w4-l2": "ml_prep_w4_l2",
  "y0-measurement-w4-l3": "ml_prep_w4_l3",
  "y0-measurement-w5-l1": "ml_prep_w5_l1",
  "y0-measurement-w5-l2": "ml_prep_w5_l2",
  "y0-measurement-w5-l3": "ml_prep_w5_l3",
  "y0-measurement-w6-l1": "ml_prep_w6_l1",
  "y0-measurement-w6-l2": "ml_prep_w6_l2",
  "y0-measurement-w6-l3": "ml_prep_w6_l3",
  "y0-measurement-w7-l1": "ml_prep_w7_l1",
  "y0-measurement-w7-l2": "ml_prep_w7_l2",
  "y0-measurement-w7-l3": "ml_prep_w7_l3",
  "y0-measurement-w8-l1": "ml_prep_w8_l1",
  "y0-measurement-w8-l2": "ml_prep_w8_l2",
  "y0-measurement-w8-l3": "ml_prep_w8_l3",
  "prep-measurement-w1-weekly-quiz": "ml_prep_w1_quiz",
  "prep-measurement-w2-weekly-quiz": "ml_prep_w2_quiz",
  "prep-measurement-w3-weekly-quiz": "ml_prep_w3_quiz",
  "prep-measurement-w4-weekly-quiz": "ml_prep_w4_quiz",
  "prep-measurement-w5-weekly-quiz": "ml_prep_w5_quiz",
  "prep-measurement-w6-weekly-quiz": "ml_prep_w6_quiz",
  "prep-measurement-w7-weekly-quiz": "ml_prep_w7_quiz",
  "prep-measurement-w8-weekly-quiz": "ml_prep_w8_quiz",
  "y1-measurement-w1-l1": "ml_y1_w1_l1",
  "y1-measurement-w1-l2": "ml_y1_w1_l2",
  "y1-measurement-w1-l3": "ml_y1_w1_l3",
  "y1-measurement-w2-l1": "ml_y1_w2_l1",
  "y1-measurement-w2-l2": "ml_y1_w2_l2",
  "y1-measurement-w2-l3": "ml_y1_w2_l3",
  "y1-measurement-w3-l1": "ml_y1_w3_l1",
  "y1-measurement-w3-l2": "ml_y1_w3_l2",
  "y1-measurement-w3-l3": "ml_y1_w3_l3",
  "y1-measurement-w4-l1": "ml_y1_w4_l1",
  "y1-measurement-w4-l2": "ml_y1_w4_l2",
  "y1-measurement-w4-l3": "ml_y1_w4_l3",
  "y1-measurement-w5-l1": "ml_y1_w5_l1",
  "y1-measurement-w5-l2": "ml_y1_w5_l2",
  "y1-measurement-w5-l3": "ml_y1_w5_l3",
  "y1-measurement-w6-l1": "ml_y1_w6_l1",
  "y1-measurement-w6-l2": "ml_y1_w6_l2",
  "y1-measurement-w6-l3": "ml_y1_w6_l3",
  "y1-measurement-w7-l1": "ml_y1_w7_l1",
  "y1-measurement-w7-l2": "ml_y1_w7_l2",
  "y1-measurement-w7-l3": "ml_y1_w7_l3",
  "y1-measurement-w8-l1": "ml_y1_w8_l1",
  "y1-measurement-w8-l2": "ml_y1_w8_l2",
  "y1-measurement-w8-l3": "ml_y1_w8_l3",
  "year1-measurement-w1-weekly-quiz": "ml_y1_w1_quiz",
  "year1-measurement-w2-weekly-quiz": "ml_y1_w2_quiz",
  "year1-measurement-w3-weekly-quiz": "ml_y1_w3_quiz",
  "year1-measurement-w4-weekly-quiz": "ml_y1_w4_quiz",
  "year1-measurement-w5-weekly-quiz": "ml_y1_w5_quiz",
  "year1-measurement-w6-weekly-quiz": "ml_y1_w6_quiz",
  "year1-measurement-w7-weekly-quiz": "ml_y1_w7_quiz",
  "year1-measurement-w8-weekly-quiz": "ml_y1_w8_quiz",
  "y2-measurement-w1-l1": "ml_y2_w1_l1",
  "y2-measurement-w1-l2": "ml_y2_w1_l2",
  "y2-measurement-w1-l3": "ml_y2_w1_l3",
  "y2-measurement-w2-l1": "ml_y2_w2_l1",
  "y2-measurement-w2-l2": "ml_y2_w2_l2",
  "y2-measurement-w2-l3": "ml_y2_w2_l3",
  "y2-measurement-w3-l1": "ml_y2_w3_l1",
  "y2-measurement-w3-l2": "ml_y2_w3_l2",
  "y2-measurement-w3-l3": "ml_y2_w3_l3",
  "y2-measurement-w4-l1": "ml_y2_w4_l1",
  "y2-measurement-w4-l2": "ml_y2_w4_l2",
  "year2-measurement-w1-weekly-quiz": "ml_y2_w1_quiz",
  "year2-measurement-w2-weekly-quiz": "ml_y2_w2_quiz",
  "year2-measurement-w3-weekly-quiz": "ml_y2_w3_quiz",
  "year2-measurement-w4-weekly-quiz": "ml_y2_w4_quiz",
  "y3-measurement-w3-l1": "ml_y3_w3_l1",
  "y3-measurement-w3-l2": "ml_y3_w3_l2",
  "y3-measurement-w3-l3": "ml_y3_w3_l3",
};

function normalizeLessonId(lessonId: string): string {
  return lessonId.toLowerCase().replace(/\s+/g, "");
}

/** Resolve a coaching key from the lesson + its observed topics/skills. */
export function resolveCoachingKey(input: {
  lessonId?: string | null;
  topicLabels?: string[];
  practisedSkills?: string[];
}): string {
  const explicit = input.lessonId
    ? LESSON_KEY_MAP[input.lessonId] ?? LESSON_KEY_MAP[normalizeLessonId(input.lessonId)]
    : undefined;
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
