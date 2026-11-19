/**
 * The child-facing lesson statements: "Today I am learning to …" and the
 * "I can …" success criteria, built from a lesson's focus and criteria.
 * Shared by every realm's lesson start page and lesson banner.
 *
 * Lesson data was written for teachers, so a focus can be a topic name
 * ("Place Value to 1000"), carry a topic label ("Length: measure objects…"),
 * and criteria can be activity names ("Number flashcards"). These rules turn
 * that into sentences that read properly after "I am learning to" and "I can".
 */

/** Words a lesson goal or success criterion starts with when it is something the learner does. */
const ACTION_WORDS = new Set(
  `add analyse apply approximate arrange audit balance break build calculate change check choose circle classify collect combine compare
  complete connect consolidate construct continue convert count create debug decide defend derive describe design determine develop diagnose
  discover distinguish divide draw estimate evaluate execute expand explain explore extend fill find finish fix fold follow formulate
  generate give group guess halve identify increase decrease infer insert instantly integrate interpret investigate judge justify learn link list locate make meet
  mark match measure model move multiply name navigate notice order organise pair partition pick place plan plot pour
  practise predict preserve put quantify quickly read reason recall recognise reclassify record reflect regroup reject
  relate remove repair repeat represent review rotate round run say see select separate sequence set share show skip start slice
  solve sort split spot state strengthen subtract tally talk tell test trace track transform translate trust turn
  understand use work write answer ask clean colour communicate critique display improve keep label pose present
  report rewrite suggest support`.split(/\s+/),
);

const firstWord = (text: string) => text.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
/** A short Title Case topic name like "Place Value to 1000" (most words capitalised), not a sentence. */
const JOINING_WORDS = new Set(["a", "an", "and", "as", "at", "by", "for", "in", "of", "on", "or", "the", "to", "up", "with", "&", "-"]);
function isTopicName(text: string) {
  const words = text.trim().split(/\s+/);
  const counted = words.filter((word) => !/^\d/.test(word) && !JOINING_WORDS.has(word.toLowerCase()));
  const capitalised = counted.filter((word) => /^[A-Z]/.test(word)).length;
  return words.length <= 8 && counted.length > 0 && capitalised / counted.length > 0.5;
}
/** Starts with something the learner does, and isn't a Title Case topic name. */
const isAction = (text: string) => ACTION_WORDS.has(firstWord(text)) && !isTopicName(text);

/** "Length and Height: compare objects…" → "compare objects…"; a label with nothing after it stays. */
function withoutTopicLabel(text: string) {
  const match = text.match(/^[A-Z][A-Za-z ,&'’()-]{0,40}:\s+(.+)$/);
  return match ? match[1] : text;
}

/** Lower-case the first letter so it reads on mid-sentence; acronyms (MAB) stay as written. */
function continueSentence(value: string) {
  const text = value.trim().replace(/\.+$/, "");
  return /^[A-Z][a-z]/.test(text) ? `${text.charAt(0).toLowerCase()}${text.slice(1)}` : text;
}

/** A Title Case topic name read mid-sentence: "Place Value to 1000" → "place value to 1000". */
function topicInSentence(value: string) {
  return value
    .trim()
    .replace(/\.+$/, "")
    .split(/\s+/)
    .map((word) => (/^[A-Z][a-z]/.test(word) ? word.toLowerCase() : word))
    .join(" ");
}

function childFacingCriterion(criterion: string) {
  const text = criterion.trim();
  if (/^reasoning prompt:/i.test(text)) return "explain how I know";
  return withoutTopicLabel(text.replace(/^core concept:\s*/i, "").replace(/^application task:\s*/i, ""));
}

/**
 * Child-facing goals for the few lessons whose focus and title are both topic
 * names or teacher notes, keyed by lesson title. Each is taken from the lesson's
 * own goal sentence where it has one.
 */
const GOAL_BY_TITLE: Record<string, string> = {
  "Part–part–whole for subtraction": "find a missing part to help me subtract",
  "Targeted revision activities": "practise the skills I am still working on",
  "Using MAB identify unknown numbers": "use MAB blocks to work out unknown numbers",
  "Giving change": "work out the change from a payment",
  "Halves and quarters": "recognise halves and quarters as equal parts of a shape",
  "Measure It Your Way": "measure objects with big and small blocks and see which gives a closer count",
  "Partitioning 5-digit Numbers": "expand and partition numbers in different ways",
  "Multiplication & Division Problems": "solve a mix of multiplication and division problems",
  "Master Measurelands Mission": "use all my measurement skills to complete one big project",
};

/**
 * "I am learning to …" from a lesson's focus, in full. When the focus is only a
 * topic name, the lesson title is used if it says what the learner does
 * ("Read numbers to 1000"); otherwise it reads "I am learning about <topic>".
 */
export function learningStatementFor(focus: string, title?: string) {
  const goal = title ? GOAL_BY_TITLE[title.trim()] : undefined;
  if (goal) return `I am learning to ${goal}`;
  const text = withoutTopicLabel(focus.trim().replace(/\.+$/, "").replace(/^I\s+can\s+/i, ""));
  if (/^I\s+am\s+learning\s+(to|about)\b/i.test(text)) return text;
  // "learn how a ruler works" reads as "I am learning how a ruler works", not "learning to learn".
  if (/^learn\s+(how|about|what|why|that)\b/i.test(text)) return `I am learning ${text.replace(/^learn\s+/i, "")}`;
  if (isAction(text)) return `I am learning to ${continueSentence(text)}`;
  const action = title?.trim().replace(/[.!?]+$/, "");
  if (action && ACTION_WORDS.has(firstWord(action))) return `I am learning to ${topicInSentence(action)}`;
  return `I am learning about ${topicInSentence(text)}`;
}

/**
 * Up to three "I can …" statements. Criteria that are activity names rather than
 * things the learner does are left out; if none are left, the lesson's own goal is used.
 */
export function successCriteriaStatementsFor(criteria: readonly string[], focus: string, title?: string) {
  // Some lessons pack several notes into one entry ("…lines. Fluency (2-3 min): …. Reasoning prompt: …"),
  // so each sentence is its own criterion, and teacher-only fluency notes are left out.
  const cleaned = criteria
    .flatMap((item) => item.split(/(?<=\.)\s+(?=[A-Z])/))
    .map((item) => item.trim().replace(/\.+$/, ""))
    .filter((item) => item && !/^fluency\s*\(/i.test(item))
    .map(childFacingCriterion)
    .map((item) => item.replace(/^I\s+can\s+/i, ""))
    .filter(isAction);
  const unique = [...new Set(cleaned.map(continueSentence))].slice(0, 3);
  if (unique.length) return unique.map((item) => `I can ${item}`);
  // No goal-style criteria: restate the lesson's own goal, matching its "I am learning to …" line.
  const learning = learningStatementFor(focus, title);
  return [
    learning
      .replace(/^I am learning to /, "I can ")
      .replace(/^I am learning about /, "I can explain what I know about ")
      .replace(/^I am learning (how|what|why|that) /, "I can explain $1 "),
  ];
}
