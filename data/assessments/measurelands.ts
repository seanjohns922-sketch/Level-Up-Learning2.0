import type { PostTest, Question } from "./posttests";
import { deriveMeasurelandsAssessmentVisual } from "./measurelandsVisuals";
import { buildGroundMeasurelandsPosttestQuestions } from "./groundMeasurelandsPosttest";

type YearLabel = "Prep" | "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5" | "Year 6";

// ── Measurelands pre/post-test banks ──────────────────────────────────────────
// Every bank has exactly 20 questions spread across the level's 8 taught weeks in
// a [3,3,3,2,2,2,3,2] pattern, so each week is assessed by 2–3 questions that
// match what that week actually teaches (source of truth: the program files).
// Pre = diagnose; Post = apply/master. Same skills, different questions.

function buildQuestion(
  id: string,
  prompt: string,
  options: string[],
  correctAnswer: string,
  skillId: string,
  skillLabel: string,
  linkedWeeks: number[],
  difficultyBand: string,
  linkedLessons: number[] = [1, 2, 3],
): Question {
  const base: Question = {
    id,
    type: "mcq",
    prompt,
    options,
    correctAnswer,
    answer: correctAnswer,
    skillId,
    skillLabel,
    linkedWeeks,
    linkedLessons,
    strand: "Measurement",
    difficultyBand,
  };
  // Every Measurelands assessment question carries a visual that echoes the real
  // lesson instrument and never contradicts the correct answer.
  return { ...base, visual: deriveMeasurelandsAssessmentVisual(base) };
}

function buildPostTest(yearLabel: YearLabel, questions: Question[]): PostTest {
  return { yearLabel, questions };
}

// ═══════════════════════ PREP — Ground Measurelands ═══════════════════════════
// Foundation only: direct comparison of length, mass, capacity and duration,
// plus days of the week and times of day. No clocks, months, formal dates,
// indirect ordering of 3 items, or informal/formal measurement units.
export const LEGACY_PREP_POSTTEST: Question[] = [
  buildQuestion("y0-measurement-pt-01", "Which object is longer?", ["Short pencil", "Long ribbon", "Tiny peg", "Small block"], "Long ribbon", "length_compare", "Length", [1], "prep-measurement"),
  buildQuestion("y0-measurement-pt-02", "Which object is shorter?", ["Long rope", "Tall straw", "Little button", "Big ruler"], "Little button", "length_compare", "Length", [1], "prep-measurement"),
  buildQuestion("y0-measurement-pt-03", "Which person is taller?", ["Baby", "Tall teacher", "Cat", "Book"], "Tall teacher", "height_compare", "Length", [1], "prep-measurement"),
  buildQuestion("y0-measurement-pt-04", "Which object is tallest?", ["Tall tree", "Small tree", "Baby", "Cat"], "Tall tree", "height_compare", "Length", [1], "prep-measurement"),
  buildQuestion("y0-measurement-pt-05", "Which object is shortest?", ["Long rope", "Tall straw", "Tiny peg", "Big ruler"], "Tiny peg", "length_compare", "Length", [1], "prep-measurement"),
  buildQuestion("y0-measurement-pt-06", "Which object is heavier?", ["Feather", "Rock", "Leaf", "Paper clip"], "Rock", "mass_compare", "Mass", [2], "prep-measurement"),
  buildQuestion("y0-measurement-pt-07", "Which object is lighter?", ["Brick", "Feather", "Book", "Rock"], "Feather", "mass_compare", "Mass", [2], "prep-measurement"),
  buildQuestion("y0-measurement-pt-08", "Which object is heaviest?", ["Feather", "Apple", "Brick", "Leaf"], "Brick", "mass_compare", "Mass", [2], "prep-measurement"),
  buildQuestion("y0-measurement-pt-09", "Which object is lightest?", ["Rock", "Brick", "Feather", "Book"], "Feather", "mass_compare", "Mass", [2], "prep-measurement"),
  buildQuestion("y0-measurement-pt-10", "Which container holds more?", ["Tiny cup", "Large bucket", "Small bowl", "Short jar"], "Large bucket", "capacity_compare", "Capacity", [3], "prep-measurement"),
  buildQuestion("y0-measurement-pt-11", "Which container holds less?", ["Bucket", "Fish tank", "Bottle", "Bathtub"], "Bottle", "capacity_compare", "Capacity", [3], "prep-measurement"),
  buildQuestion("y0-measurement-pt-12", "Which container holds the most?", ["Cup", "Bottle", "Bucket", "Bowl"], "Bucket", "capacity_compare", "Capacity", [3], "prep-measurement"),
  buildQuestion("y0-measurement-pt-13", "Which container holds the least?", ["Bathtub", "Fish tank", "Mug", "Bucket"], "Mug", "capacity_compare", "Capacity", [3], "prep-measurement"),
  buildQuestion("y0-measurement-pt-14", "Which activity takes longer?", ["Blinking", "Reading a book", "Clapping once", "Jumping once"], "Reading a book", "duration_compare", "Duration", [4], "prep-measurement"),
  buildQuestion("y0-measurement-pt-15", "Which activity takes less time?", ["Sleeping", "Watching a movie", "Washing hands", "Travelling to school"], "Washing hands", "duration_compare", "Duration", [4], "prep-measurement"),
  buildQuestion("y0-measurement-pt-16", "Which activity takes the longest?", ["Blinking", "Clapping once", "Sleeping", "Washing hands"], "Sleeping", "duration_compare", "Duration", [4], "prep-measurement"),
  buildQuestion("y0-measurement-pt-17", "What day comes after Monday?", ["Sunday", "Tuesday", "Wednesday", "Friday"], "Tuesday", "days_of_week", "Days of the Week", [5, 7], "prep-measurement"),
  buildQuestion("y0-measurement-pt-18", "Which days are the weekend?", ["Monday and Tuesday", "Friday and Monday", "Saturday and Sunday", "Wednesday and Thursday"], "Saturday and Sunday", "days_of_week", "Days of the Week", [5, 7], "prep-measurement"),
  buildQuestion("y0-measurement-pt-19", "Which time of day matches eating breakfast?", ["Morning", "Lunchtime", "Afternoon", "Night"], "Morning", "time_of_day", "Time of Day", [5, 6], "prep-measurement"),
  buildQuestion("y0-measurement-pt-20", "Which order makes sense for a day?", ["wake up, eat lunch, go to bed", "go to bed, wake up, eat lunch", "eat lunch, go to bed, wake up", "go to bed, eat lunch, wake up"], "wake up, eat lunch, go to bed", "sequencing_events", "Sequencing", [6, 8], "prep-measurement"),
];

// Ground assessment tasks use the same premium interactions students practised
// in lessons. The exported legacy bank is retained only for migration audits;
// no assessment route reads it.
const PREP_POSTTEST: Question[] = buildGroundMeasurelandsPosttestQuestions();

// ═══════════════════════ YEAR 1 ══════════════════════════════════════════════
// W1 Length · W2 Mass · W3 Capacity · W4 Duration · W5 Calendar (days) ·
// W6 Weeks & Months · W7 Time units (hour/day/week) · W8 Mixed.
const YEAR1_PRETEST: Question[] = [
  buildQuestion("y1-measurement-pre-01", "Which object is longer?", ["pencil", "eraser", "button", "peg"], "pencil", "length_compare", "Length", [1], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-02", "Put these from shortest to longest.", ["straw, ribbon, rope", "rope, ribbon, straw", "ribbon, straw, rope", "rope, straw, ribbon"], "straw, ribbon, rope", "length_order", "Length", [1], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-03", "Which object would you measure for length?", ["rope", "watering can", "apple pie", "clock"], "rope", "length_compare", "Length", [1], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-04", "Which object is heavier?", ["feather", "book", "leaf", "paper"], "book", "mass_compare", "Mass", [2], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-05", "Which object is lightest?", ["rock", "backpack", "apple", "chair"], "apple", "mass_compare", "Mass", [2], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-06", "Which object is the heaviest?", ["feather", "pencil", "brick", "leaf"], "brick", "mass_compare", "Mass", [2], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-07", "Which container holds more?", ["cup", "bucket", "mug", "bottle"], "bucket", "capacity_compare", "Capacity", [3], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-08", "Which container holds less?", ["fish tank", "jug", "bottle", "bathtub"], "bottle", "capacity_compare", "Capacity", [3], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-09", "Which container would you fill with cups?", ["bucket", "pencil", "book", "ruler"], "bucket", "capacity_compare", "Capacity", [3], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-10", "Which takes longer?", ["reading a book", "clapping once", "blinking", "jumping once"], "reading a book", "duration_compare", "Duration", [4], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-11", "Which activity is quickest?", ["watching a movie", "sleeping", "washing hands", "eating dinner"], "washing hands", "duration_compare", "Duration", [4], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-12", "What day comes after Tuesday?", ["Monday", "Wednesday", "Thursday", "Sunday"], "Wednesday", "days_sequence", "Days", [5], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-13", "How many days are in one week?", ["5", "6", "7", "10"], "7", "week_structure", "Days", [5], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-14", "Which month comes after January?", ["December", "March", "February", "April"], "February", "months_sequence", "Months", [6], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-15", "What comes after December?", ["November", "January", "February", "October"], "January", "months_sequence", "Months", [6], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-16", "Which is longer?", ["day", "week", "hour", "minute"], "week", "time_units", "Time Units", [7], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-17", "Which comes next: hour, day, ...?", ["minute", "week", "second", "Monday"], "week", "time_units", "Time Units", [7], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-18", "Which lasts about a week?", ["a camping holiday", "washing hands", "one lesson", "a blink"], "a camping holiday", "time_units", "Time Units", [7], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-19", "If today is Thursday, what is tomorrow?", ["Wednesday", "Friday", "Saturday", "Monday"], "Friday", "calendar_language", "Calendar", [8], "year1-measurement-pre"),
  buildQuestion("y1-measurement-pre-20", "Which happens first in a day?", ["eat lunch", "wake up", "go to bed", "eat dinner"], "wake up", "sequence_day", "Sequencing", [8], "year1-measurement-pre"),
];
const YEAR1_POSTTEST: Question[] = [
  buildQuestion("y1-measurement-pt-01", "A pencil is 5 blocks long and a crayon is 3 blocks long. Which is longer?", ["pencil", "crayon", "same length", "cannot tell"], "pencil", "length_compare", "Measured Length", [1], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-02", "A rope is 8 blocks and a stick is 6 blocks. How many more blocks is the rope?", ["1", "2", "3", "4"], "2", "length_difference", "Measured Length", [1], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-03", "Why do two objects need the same blocks to compare fairly?", ["same unit makes it fair", "bigger blocks look nicer", "it makes the answer bigger", "it does not matter"], "same unit makes it fair", "fair_units", "Fair Measure", [1], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-04", "An apple balances with 3 cubes. A book balances with 6 cubes. Which has greater mass?", ["apple", "book", "same mass", "cannot tell"], "book", "mass_compare", "Measured Mass", [2], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-05", "A backpack balances with 6 cubes. How many cubes is its mass?", ["5", "6", "7", "8"], "6", "mass_compare", "Measured Mass", [2], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-06", "Why should we use the same balance cubes each time?", ["to make it fair", "to get a bigger number", "to make it harder", "because cubes are blue"], "to make it fair", "fair_units", "Fair Mass Measure", [2], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-07", "A jug holds 4 cups and a bucket holds 8 cups. Which holds more?", ["jug", "bucket", "same amount", "cannot tell"], "bucket", "capacity_compare", "Measured Capacity", [3], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-08", "A mug holds 2 cups. A bucket holds 8 cups. Put them from smallest to largest.", ["mug, bucket", "bucket, mug", "same size", "cannot tell"], "mug, bucket", "capacity_compare", "Measured Capacity", [3], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-09", "Why does more cups mean greater capacity?", ["more cups fills more space", "the container is taller", "the picture is bigger", "the number is purple"], "more cups fills more space", "capacity_compare", "Capacity", [3], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-10", "Which activity lasts longer?", ["a whole school day", "one short lesson", "washing your hands", "clapping once"], "a whole school day", "duration_compare", "Duration", [4], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-11", "Which unit suits a school movie session best?", ["hour", "day", "week", "month"], "hour", "duration_units", "Duration", [4], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-12", "If today is Tuesday, what is tomorrow?", ["Monday", "Wednesday", "Thursday", "Sunday"], "Wednesday", "days_sequence", "Days", [5], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-13", "What date comes after the 14th on a calendar?", ["13", "15", "16", "24"], "15", "days_sequence", "Days", [5], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-14", "What comes after November?", ["October", "December", "January", "February"], "December", "months_sequence", "Months", [6], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-15", "Which month comes after December?", ["November", "January", "March", "June"], "January", "months_sequence", "Months", [6], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-16", "What comes after a week in the order day, week, ...?", ["hour", "month", "Monday", "minute"], "month", "time_units", "Time Units", [7], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-17", "Months are made of ...", ["days only", "weeks", "hours", "weekends"], "weeks", "time_units", "Time Units", [7], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-18", "Which lasts about a day?", ["a school day", "watching a movie", "a summer holiday", "brushing teeth"], "a school day", "time_units", "Time Units", [7], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-19", "Which happens first?", ["go to bed", "eat dinner", "wake up", "read a story at night"], "wake up", "sequence_day", "Sequencing", [8], "year1-measurement-post"),
  buildQuestion("y1-measurement-pt-20", "Put these in order: wake up, school, sleep.", ["wake up, school, sleep", "school, wake up, sleep", "sleep, wake up, school", "school, sleep, wake up"], "wake up, school, sleep", "sequence_day", "Sequencing", [8], "year1-measurement-post"),
];

// ═══════════════════════ YEAR 2 ══════════════════════════════════════════════
// W1 Units & Length · W2 Mass · W3 Capacity · W4 Accuracy · W5 Clock I
// (o'clock/half past) · W6 Clock II (quarter past/to) · W7 Calendar · W8 Mixed.
// NOTE: Year 2 does NOT teach perimeter/area (that is Year 3+).
const YEAR2_PRETEST: Question[] = [
  buildQuestion("y2-measurement-pre-01", "A rope is 8 blocks and a stick is 5 blocks. How many more blocks is the rope?", ["2", "3", "4", "5"], "3", "length_difference", "Measured Length", [1], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-02", "Which tool is best for measuring a pencil?", ["ruler", "trundle wheel", "footsteps", "a playground tape"], "ruler", "choose_length_tool", "Measuring Tools", [1], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-03", "If a smaller unit is used, the count usually gets ...", ["smaller", "bigger", "the same number", "zero"], "bigger", "informal_units", "Different Units", [1], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-04", "Which object would you measure with balance cubes?", ["backpack", "bucket of water", "story-book time", "Tuesday"], "backpack", "mass_units_informal", "Mass", [2], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-05", "A rock balances with 8 cubes. A book balances with 6 cubes. Which is heavier?", ["rock", "book", "same", "cannot tell"], "rock", "mass_compare", "Mass", [2], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-06", "A watermelon balances with 7 cubes. A backpack with 5 cubes. Which is lighter?", ["watermelon", "backpack", "same", "cannot tell"], "backpack", "mass_compare", "Mass", [2], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-07", "A bottle holds 3 cups and a jug holds 6 cups. Which holds the most?", ["bottle", "jug", "same", "cannot tell"], "jug", "capacity_compare", "Capacity", [3], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-08", "Which is the better unit for measuring a bathtub?", ["spoon", "cup", "paper clip", "cube"], "cup", "capacity_better_unit", "Capacity", [3], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-09", "A storage tub holds 10 cups and a bucket holds 8 cups. Which is greater?", ["bucket", "same", "storage tub", "cannot tell"], "storage tub", "capacity_compare", "Capacity", [3], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-10", "Which gives a more accurate measurement?", ["big blocks only", "smaller blocks", "guessing", "starting at the end"], "smaller blocks", "accuracy_units", "Accuracy", [4], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-11", "Why is a ruler a bad tool for measuring a playground?", ["too short", "too colourful", "too heavy", "too shiny"], "too short", "accuracy_units", "Accuracy", [4], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-12", "When the long hand points to 12, the time is ...", ["half past", "quarter past", "o'clock", "quarter to"], "o'clock", "clock_reading", "Clock: o'clock", [5], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-13", "When the long hand points to 6, the time is ...", ["o'clock", "half past", "quarter past", "quarter to"], "half past", "clock_reading", "Clock: half past", [5], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-14", "When the long hand points to 3, the time is ...", ["quarter past", "half past", "o'clock", "quarter to"], "quarter past", "clock_reading", "Clock: quarter past", [6], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-15", "When the long hand points to 9, the time is ...", ["quarter past", "half past", "o'clock", "quarter to"], "quarter to", "clock_reading", "Clock: quarter to", [6], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-16", "If today is the 8th and the event is on the 13th, how many days until the event?", ["4", "5", "6", "13"], "5", "calendar_count_forward", "Calendar", [7], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-17", "Which event happens first if today is the 10th?", ["event on the 18th", "event on the 14th", "same time", "cannot tell"], "event on the 14th", "calendar_compare_events", "Calendar", [7], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-18", "How many school days are there from Monday to Friday?", ["3", "4", "5", "7"], "5", "calendar_count_forward", "Calendar", [7], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-19", "Which measurement would you use for how heavy a bag is?", ["balance cubes", "a clock", "a calendar", "cups"], "balance cubes", "mass_units_informal", "Review", [8], "year2-measurement-pre"),
  buildQuestion("y2-measurement-pre-20", "Which tool measures how much water a bucket holds?", ["cups", "a ruler", "balance cubes", "a calendar"], "cups", "capacity_better_unit", "Review", [8], "year2-measurement-pre"),
];
const YEAR2_POSTTEST: Question[] = [
  buildQuestion("y2-measurement-pt-01", "A rope is 9 blocks and a vine is 6 blocks. How many more blocks is the rope?", ["2", "3", "4", "5"], "3", "length_difference", "Measured Length", [1], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-02", "Which is the best tool for measuring a classroom?", ["ruler", "cubes", "tape measure", "paper clips"], "tape measure", "choose_length_tool", "Measuring Tools", [1], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-03", "A pencil measures 6 blocks or 12 paper clips. Why are the numbers different?", ["the pencil changed", "paper clips are smaller", "blocks are heavier", "the ruler is broken"], "paper clips are smaller", "informal_units", "Different Units", [1], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-04", "A brick balances with 9 cubes and a teddy bear with 5 cubes. Which is heavier?", ["brick", "teddy bear", "same mass", "cannot tell"], "brick", "mass_compare", "Mass", [2], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-05", "A watermelon balances with 7 cubes. A backpack with 5 cubes. Which has greater mass?", ["backpack", "watermelon", "same", "cannot tell"], "watermelon", "mass_compare", "Mass", [2], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-06", "A desk is being measured with footsteps. What is wrong?", ["footsteps are hard to use fairly", "desks cannot be measured", "it will be kilograms", "nothing is wrong"], "footsteps are hard to use fairly", "mass_units_informal", "Fair Measure", [2], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-07", "A bottle holds 4 cups. A measuring jug holds 7 cups. Which holds less?", ["bottle", "measuring jug", "same", "cannot tell"], "bottle", "capacity_compare", "Capacity", [3], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-08", "A fish tank holds 12 cups. A storage tub holds 10 cups. Put them from least to greatest.", ["storage tub, fish tank", "fish tank, storage tub", "same", "cannot tell"], "storage tub, fish tank", "capacity_compare", "Capacity", [3], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-09", "Which is the better unit for measuring a fish tank?", ["spoon", "cup", "paper clip", "domino"], "cup", "capacity_better_unit", "Capacity", [3], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-10", "Smaller units measure more accurately because they ...", ["make the object longer", "fit gaps better", "change the object", "always make the count smaller"], "fit gaps better", "accuracy_units", "Accuracy", [4], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-11", "To measure fairly, where should you start measuring from?", ["the zero end", "the middle", "any end", "the far end"], "the zero end", "accuracy_units", "Accuracy", [4], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-12", "The long hand points to 12 and the short hand points to 4. What time is it?", ["4 o'clock", "half past 4", "quarter past 4", "quarter to 4"], "4 o'clock", "clock_reading", "Clock: o'clock", [5], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-13", "The long hand points to 6 and the short hand is between 3 and 4. What time is it?", ["3 o'clock", "half past 3", "quarter past 3", "quarter to 4"], "half past 3", "clock_reading", "Clock: half past", [5], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-14", "The long hand points to 3 and the short hand is just after 7. What time is it?", ["quarter past 7", "half past 7", "quarter to 7", "7 o'clock"], "quarter past 7", "clock_reading", "Clock: quarter past", [6], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-15", "The long hand points to 9 and the short hand is nearly at 5. What time is it?", ["quarter past 5", "quarter to 5", "half past 5", "5 o'clock"], "quarter to 5", "clock_reading", "Clock: quarter to", [6], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-16", "Today is the 12th. Sports Day is on the 17th. How many days until Sports Day?", ["4", "5", "6", "17"], "5", "calendar_count_forward", "Calendar", [7], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-17", "Library Day is on the 15th. Music Day is on the 18th. Which happens first?", ["Library Day", "Music Day", "same day", "cannot tell"], "Library Day", "calendar_compare_events", "Calendar", [7], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-18", "How many days are there in two weeks?", ["7", "10", "14", "20"], "14", "calendar_count_forward", "Calendar", [7], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-19", "A master measurer needs to weigh a parcel. Which is the right idea?", ["balance it against cubes", "read a clock", "count the days", "pour it into cups"], "balance it against cubes", "mass_units_informal", "Review", [8], "year2-measurement-post"),
  buildQuestion("y2-measurement-pt-20", "To find how much a jug holds, a master measurer should ...", ["fill it with cups and count", "weigh it with cubes", "read a calendar", "use a clock"], "fill it with cups and count", "capacity_better_unit", "Review", [8], "year2-measurement-post"),
];

// ═══════════════════════ YEAR 3 ══════════════════════════════════════════════
// W1 Ruler (cm) · W2 Metre (m, cm↔m) · W3 Mass (g/kg, scales) · W4 Capacity
// (mL/L, jugs) · W5 Duration · W6 Time to the minute · W7 Perimeter · W8 Area.
const YEAR3_PRETEST: Question[] = [
  buildQuestion("y3-measurement-pre-01", "Which number should you start at on a ruler?", ["0", "1", "2", "the edge only"], "0", "ruler_zero", "Ruler Use", [1], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-02", "What unit does a small school ruler usually show?", ["centimetres", "kilograms", "litres", "days"], "centimetres", "ruler_units", "Ruler Use", [1], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-03", "Which is longer?", ["7 cm", "5 cm", "they are the same", "cannot tell"], "7 cm", "compare_cm", "Ruler Use", [1], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-04", "Which unit is better for measuring a classroom?", ["centimetres", "metres", "grams", "millilitres"], "metres", "metre_choice", "Length Units", [2], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-05", "Which is longer, 1 metre or 50 centimetres?", ["1 metre", "50 centimetres", "same", "cannot tell"], "1 metre", "compare_metres", "Length Units", [2], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-20", "How many centimetres are in 1 metre?", ["10 cm", "50 cm", "100 cm", "1000 cm"], "100 cm", "metre_choice", "Length Units", [2], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-06", "Which unit would measure a paper clip best?", ["grams", "kilograms", "litres", "days"], "grams", "grams_kilograms", "Mass", [3], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-07", "Which unit would measure a school bag best?", ["grams", "kilograms", "millilitres", "centimetres"], "kilograms", "grams_kilograms", "Mass", [3], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-08", "Which instrument reads mass?", ["scale", "clock", "calendar", "ruler"], "scale", "read_scale", "Mass", [3], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-09", "Which unit is best for a drink bottle?", ["millilitres", "kilograms", "hours", "metres"], "millilitres", "ml_l_units", "Capacity", [4], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-10", "Which tool reads capacity?", ["measuring jug", "calendar", "scale", "clock"], "measuring jug", "read_jug", "Capacity", [4], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-11", "Which event usually lasts longer?", ["a lesson", "a school day", "a blink", "a clap"], "a school day", "duration_compare", "Duration", [5], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-12", "If an event starts at 3 o'clock and ends at 4 o'clock, how long is it?", ["30 minutes", "45 minutes", "1 hour", "2 hours"], "1 hour", "duration_compare", "Duration", [5], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-13", "The long hand points to 12 and the short hand to 6. What time is it?", ["6 o'clock", "half past 6", "quarter past 6", "quarter to 6"], "6 o'clock", "clock_reading", "Time to the minute", [6], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-14", "The long hand points to 6. The time is ...", ["o'clock", "half past", "quarter past", "quarter to"], "half past", "clock_reading", "Time to the minute", [6], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-15", "Perimeter means the distance ...", ["inside the shape", "around the boundary", "through the centre", "under the shape"], "around the boundary", "perimeter_intro", "Perimeter", [7], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-16", "Which shape has the longer perimeter?", ["shape with more outside edges", "shape with more colour", "shape with more inside space", "cannot tell"], "shape with more outside edges", "perimeter_intro", "Perimeter", [7], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-17", "A fence goes around the edge of a yard. That is the ...", ["area", "perimeter", "mass", "time"], "perimeter", "perimeter_intro", "Perimeter", [7], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-18", "Area means the amount of space ...", ["outside a shape", "inside a shape", "between two dates", "on a ruler"], "inside a shape", "area_intro", "Area", [8], "year3-measurement-pre"),
  buildQuestion("y3-measurement-pre-19", "If two shapes cover the same squares, they have the same ...", ["perimeter", "area", "time", "mass"], "area", "area_intro", "Area", [8], "year3-measurement-pre"),
];
const YEAR3_POSTTEST: Question[] = [
  buildQuestion("y3-measurement-pt-01", "An object starts at 0 cm and ends at 8 cm. How long is it?", ["6 cm", "7 cm", "8 cm", "9 cm"], "8 cm", "read_ruler_cm", "Ruler", [1], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-02", "Professor Gauge lines an object from 1 cm to 9 cm and says it is 9 cm. What is wrong?", ["he should start at 0 and read 8 cm", "he should use kilograms", "the ruler is broken", "nothing is wrong"], "he should start at 0 and read 8 cm", "read_ruler_cm", "Ruler", [1], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-03", "An object starts at 0 cm and ends at 6 cm. How long is it?", ["5 cm", "6 cm", "7 cm", "8 cm"], "6 cm", "read_ruler_cm", "Ruler", [1], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-04", "Which is the better unit for measuring a hallway?", ["centimetres", "metres", "grams", "litres"], "metres", "metre_choice", "Length Units", [2], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-05", "A ribbon is 3 m and a rope is 5 m. How many metres longer is the rope?", ["1 m", "2 m", "3 m", "8 m"], "2 m", "compare_metres", "Length Units", [2], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-20", "A hallway is 8 m and a rug is 3 m. How many metres longer is the hallway?", ["3 m", "5 m", "8 m", "11 m"], "5 m", "compare_metres", "Length Units", [2], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-06", "A scale shows 500 g. Which object could match?", ["paper clip", "apple", "chair", "bicycle"], "apple", "read_scale", "Mass", [3], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-07", "A dog is 18 kg and a backpack is 5 kg. Which is heavier?", ["dog", "backpack", "same", "cannot tell"], "dog", "compare_mass_units", "Mass", [3], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-08", "Which unit makes sense for an apple?", ["g", "kg", "L", "m"], "g", "grams_kilograms", "Mass", [3], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-09", "A measuring jug shows 750 mL. Which is true?", ["less than 1 L", "more than 1 L", "same as 2 L", "same as 10 L"], "less than 1 L", "read_jug", "Capacity", [4], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-10", "A fish tank holds 12 L and a jug holds 2 L. Which holds more?", ["jug", "fish tank", "same", "cannot tell"], "fish tank", "compare_capacity_units", "Capacity", [4], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-11", "A movie runs from 2 o'clock to 3 o'clock. How long is it?", ["30 minutes", "45 minutes", "1 hour", "90 minutes"], "1 hour", "duration_compare", "Duration", [5], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-12", "Which lasts the longest?", ["one lesson", "a school day", "lunch break", "a short walk"], "a school day", "duration_compare", "Duration", [5], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-13", "The long hand points to 6 and the short hand is between 2 and 3. What time is it?", ["2 o'clock", "half past 2", "quarter past 2", "quarter to 3"], "half past 2", "clock_reading", "Time to the minute", [6], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-14", "The long hand points to 3 and the short hand is just after 7. What time is it?", ["quarter past 7", "quarter to 7", "half past 7", "7 o'clock"], "quarter past 7", "clock_reading", "Time to the minute", [6], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-15", "Perimeter is measured around the ...", ["inside", "boundary", "middle", "corner only"], "boundary", "perimeter_intro", "Perimeter", [7], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-16", "A rectangle has sides 6 units and 3 units. What is its perimeter?", ["9 units", "12 units", "18 units", "24 units"], "18 units", "find_perimeter", "Perimeter", [7], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-17", "Which shape has the greater perimeter?", ["a shape with 12 edge units", "a shape with 8 edge units", "same", "cannot tell"], "a shape with 12 edge units", "perimeter_intro", "Perimeter", [7], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-18", "Area measures the space ...", ["around a shape", "inside a shape", "above a shape", "under a shape"], "inside a shape", "area_intro", "Area", [8], "year3-measurement-post"),
  buildQuestion("y3-measurement-pt-19", "Which shape has the greater area?", ["shape covering 8 squares", "shape covering 6 squares", "same area", "cannot tell"], "shape covering 8 squares", "area_compare", "Area", [8], "year3-measurement-post"),
];

// ═══════════════════════ YEAR 4 ══════════════════════════════════════════════
// W1 Precision (mm) · W2 Scales & Jugs · W3 Temperature · W4 Perimeter ·
// W5 Area · W6 Time problems · W7 Angles · W8 Measurement missions.
const YEAR4_PRETEST: Question[] = [
  buildQuestion("y4-measurement-pre-01", "What does a small mark between whole centimetres show?", ["part of a centimetre", "a kilogram", "an hour", "a litre"], "part of a centimetre", "partial_units", "Precision Measuring", [1], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-02", "Which is more precise?", ["4 cm", "4.5 cm", "4 blocks", "4 days"], "4.5 cm", "partial_units", "Precision Measuring", [1], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-03", "Which length is greater?", ["6.2 cm", "6 cm", "same", "cannot tell"], "6.2 cm", "compare_precise_length", "Precision Measuring", [1], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-04", "Which instrument reads mass?", ["scale", "clock", "calendar", "ruler"], "scale", "read_scale", "Scales", [2], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-05", "Which instrument reads capacity?", ["measuring jug", "bathroom scale", "calendar", "ruler"], "measuring jug", "read_jug", "Measuring Jugs", [2], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-06", "Which mass is greater?", ["750 g", "500 g", "same", "cannot tell"], "750 g", "compare_mass_scale", "Scales", [2], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-07", "Temperature is measured in ...", ["kg", "cm", "°C", "mL"], "°C", "temperature_units", "Temperature", [3], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-08", "Which temperature is hotter?", ["12°C", "28°C", "same", "cannot tell"], "28°C", "compare_temperature", "Temperature", [3], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-09", "Perimeter means the distance ...", ["inside", "around the outside", "through the centre", "between corners only"], "around the outside", "perimeter_intro", "Perimeter", [4], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-10", "A fence goes around the outside of a yard. That is the ...", ["area", "perimeter", "temperature", "mass"], "perimeter", "perimeter_intro", "Perimeter", [4], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-11", "Area means the amount of space ...", ["outside", "inside", "between", "around"], "inside", "area_intro", "Area", [5], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-12", "Tiles covering a floor show the ...", ["perimeter", "area", "temperature", "clock time"], "area", "area_intro", "Area", [5], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-13", "Which problem needs time thinking?", ["reading a timetable", "measuring a rope", "filling a bucket", "weighing an apple"], "reading a timetable", "time_problems", "Time Problems", [6], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-14", "Which could be shown on a timetable?", ["8:30 am", "8 kg", "8 cm", "8°C"], "8:30 am", "time_problems", "Time Problems", [6], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-15", "A right angle is like the corner of a ...", ["clock face", "book", "orange", "ball"], "book", "right_angle", "Angles", [7], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-16", "Which angle is larger?", ["angle bigger than a right angle", "angle smaller than a right angle", "same size", "cannot tell"], "angle bigger than a right angle", "compare_angles", "Angles", [7], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-17", "Which tool measures an angle?", ["protractor", "ruler", "scale", "calendar"], "protractor", "angle_tool", "Angles", [7], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-18", "Which is a real-world measurement investigation?", ["designing a playground", "guessing a number", "sorting letters", "reading a story"], "designing a playground", "measurement_investigation", "Measurement Missions", [8], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-19", "A playground plan needs perimeter and area. What kind of task is this?", ["a measurement investigation", "a spelling test", "a calendar-only task", "a money-only task"], "a measurement investigation", "measurement_investigation", "Measurement Missions", [8], "year4-measurement-pre"),
  buildQuestion("y4-measurement-pre-20", "Which temperature is colder?", ["3°C", "18°C", "same", "cannot tell"], "3°C", "compare_temperature", "Temperature", [3], "year4-measurement-pre"),
];
const YEAR4_POSTTEST: Question[] = [
  buildQuestion("y4-measurement-pt-01", "Which reading is more precise for the same object?", ["4 cm", "4.7 cm", "same precision", "cannot tell"], "4.7 cm", "partial_units", "Precision Measuring", [1], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-02", "An object ends halfway between 6 cm and 7 cm. What is its length?", ["6 cm", "6.5 cm", "7 cm", "7.5 cm"], "6.5 cm", "measure_precisely", "Precision Measuring", [1], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-03", "Which object is longer?", ["12.4 cm ribbon", "12.1 cm ribbon", "same", "cannot tell"], "12.4 cm ribbon", "compare_precise_length", "Precision Measuring", [1], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-04", "A scale shows 2.5 kg. Which is true?", ["more than 2 kg", "less than 2 kg", "same as 250 g", "same as 25 kg"], "more than 2 kg", "read_scale", "Scales", [2], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-05", "A measuring jug shows 750 mL. Which is correct?", ["more than 1 L", "less than 1 L", "same as 7 L", "same as 75 L"], "less than 1 L", "read_jug", "Measuring Jugs", [2], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-06", "Which has the greater capacity?", ["1.5 L", "850 mL", "same", "cannot tell"], "1.5 L", "compare_capacity_jug", "Measuring Jugs", [2], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-07", "Which temperature is warmest?", ["18°C", "24°C", "12°C", "6°C"], "24°C", "compare_temperature", "Temperature", [3], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-08", "A thermometer moves from 10°C to 16°C. How much warmer is it?", ["4°C", "5°C", "6°C", "7°C"], "6°C", "temperature_difference", "Temperature", [3], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-20", "Which temperature is coldest?", ["2°C", "9°C", "15°C", "20°C"], "2°C", "compare_temperature", "Temperature", [3], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-09", "A rectangle has sides 7 m and 4 m. What is its perimeter?", ["11 m", "18 m", "22 m", "28 m"], "22 m", "find_perimeter", "Perimeter", [4], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-10", "Which measurement is the perimeter of a yard?", ["distance around the fence", "space inside the grass", "temperature outside", "weight of the gate"], "distance around the fence", "perimeter_problems", "Perimeter", [4], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-11", "A rectangle is 5 units by 3 units. What is its area?", ["8 squares", "15 squares", "16 squares", "30 squares"], "15 squares", "area_formula", "Area", [5], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-12", "Which shape has greater area?", ["shape covering 18 squares", "shape covering 14 squares", "same", "cannot tell"], "shape covering 18 squares", "compare_area", "Area", [5], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-13", "A movie starts at 2:15 and ends at 3:00. How long is it?", ["30 min", "45 min", "60 min", "75 min"], "45 min", "time_problems", "Time Problems", [6], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-14", "Which time is later?", ["3:20 pm", "3:05 pm", "same", "cannot tell"], "3:20 pm", "time_problems", "Time Problems", [6], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-15", "Which angle is a right angle?", ["90° angle", "acute angle", "straight angle", "reflex angle"], "90° angle", "right_angle", "Angles", [7], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-16", "Which angle is larger than a right angle?", ["obtuse angle", "acute angle", "straight line only", "zero angle"], "obtuse angle", "compare_angles", "Angles", [7], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-17", "Which tool best measures an angle exactly?", ["protractor", "ruler", "scale", "calendar"], "protractor", "angle_tool", "Angles", [7], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-18", "Designing a garden that needs fencing and turf is what kind of task?", ["measurement investigation", "spelling test", "calendar only", "money only"], "measurement investigation", "measurement_investigation", "Measurement Missions", [8], "year4-measurement-post"),
  buildQuestion("y4-measurement-pt-19", "Which tool best helps read temperature?", ["thermometer", "ruler", "calendar", "balance cubes"], "thermometer", "temperature_units", "Measurement Missions", [8], "year4-measurement-post"),
];

// ═══════════════════════ YEAR 5 ══════════════════════════════════════════════
// W1 Metric units · W2 Decimals/precision · W3 Perimeter · W4 Area ·
// W5 Area vs Perimeter · W6 12 & 24-hour time / timetables · W7 Angles ·
// W8 Master missions.
const YEAR5_PRETEST: Question[] = [
  buildQuestion("y5-measurement-pre-01", "Which unit is most suitable for the height of a tree?", ["mm", "cm", "m", "km"], "m", "best_length_unit", "Metric Mastery", [1], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-02", "Which unit best measures a pencil width?", ["m", "cm", "mm", "km"], "mm", "best_length_unit", "Metric Mastery", [1], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-03", "Which unit best measures the mass of a car?", ["g", "kg", "mL", "cm"], "kg", "best_mass_unit", "Metric Mastery", [1], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-04", "Which is the greater decimal length?", ["2.4 m", "2.35 m", "same", "cannot tell"], "2.4 m", "compare_decimal_length", "Decimal Measurements", [2], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-05", "Which is the greater decimal mass?", ["1.8 kg", "1.65 kg", "same", "cannot tell"], "1.8 kg", "compare_decimal_mass", "Decimal Measurements", [2], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-06", "Why do smaller units give more accuracy?", ["they fit more exactly", "they make the object longer", "they change the object", "they stop decimals"], "they fit more exactly", "smaller_units_accuracy", "Decimal Measurements", [2], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-07", "Perimeter means the distance ...", ["inside", "around the outside", "between centres", "through the middle"], "around the outside", "perimeter_intro", "Perimeter", [3], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-08", "A rectangle has sides 9 m and 4 m. What is its perimeter?", ["13 m", "18 m", "26 m", "36 m"], "26 m", "find_perimeter", "Perimeter", [3], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-09", "Area means the amount of space ...", ["inside", "around", "below", "between"], "inside", "area_intro", "Area", [4], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-10", "A rectangle is 6 m by 4 m. What is its area?", ["10 m²", "20 m²", "24 m²", "48 m²"], "24 m²", "area_formula", "Area", [4], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-11", "Which problem needs perimeter?", ["fencing a garden", "covering a floor with tiles", "reading a timetable", "weighing an apple"], "fencing a garden", "area_or_perimeter", "Area or Perimeter", [5], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-12", "Which problem needs area?", ["tiling a floor", "walking around an oval", "reading a clock", "filling a jug"], "tiling a floor", "area_or_perimeter", "Area or Perimeter", [5], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-13", "24-hour time 14:00 is ...", ["2:00 pm", "4:00 pm", "12:00 pm", "2:00 am"], "2:00 pm", "time_24_hour", "12 and 24 Hour Time", [6], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-14", "Which is later?", ["09:30", "21:30", "same", "cannot tell"], "21:30", "time_24_hour", "12 and 24 Hour Time", [6], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-15", "A right angle is ...", ["90°", "45°", "180°", "360°"], "90°", "angle_degrees", "Angles", [7], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-16", "Which angle is larger?", ["120°", "70°", "same", "cannot tell"], "120°", "compare_angles", "Angles", [7], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-17", "Which tool measures an angle?", ["protractor", "ruler", "scale", "calendar"], "protractor", "angle_tool", "Angles", [7], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-18", "Which is a real measurement project?", ["designing a classroom", "matching rhyming words", "alphabet order", "copying a sentence"], "designing a classroom", "measurement_project", "Master Missions", [8], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-19", "A sports carnival plan needs time, length and area. This is a ...", ["measurement project", "spelling task", "money-only task", "calendar-only task"], "measurement project", "measurement_project", "Master Missions", [8], "year5-measurement-pre"),
  buildQuestion("y5-measurement-pre-20", "An irregular garden has sides 4 m, 6 m, 3 m and 5 m. What is its perimeter?", ["16 m", "18 m", "20 m", "22 m"], "18 m", "irregular_perimeter", "Perimeter", [3], "year5-measurement-pre"),
];
const YEAR5_POSTTEST: Question[] = [
  buildQuestion("y5-measurement-pt-01", "Which is the best unit for the length of a fingernail?", ["m", "cm", "mm", "km"], "mm", "best_length_unit", "Metric Mastery", [1], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-02", "Which unit is best for the mass of a suitcase?", ["g", "kg", "cm", "mL"], "kg", "best_mass_unit", "Metric Mastery", [1], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-03", "Which unit is best for the capacity of a swimming pool?", ["mL", "L", "g", "cm"], "L", "best_capacity_unit", "Metric Mastery", [1], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-04", "Which decimal length is greater?", ["3.45 m", "3.5 m", "same", "cannot tell"], "3.5 m", "compare_decimal_length", "Decimal Measurements", [2], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-05", "Which decimal mass is greater?", ["1.25 kg", "950 g", "same", "cannot tell"], "1.25 kg", "compare_decimal_mass", "Decimal Measurements", [2], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-06", "Smaller units are more accurate because they ...", ["they fit more exactly", "they make the object longer", "they change the object", "they stop decimals"], "they fit more exactly", "smaller_units_accuracy", "Decimal Measurements", [2], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-07", "A rectangular pool is 7 m by 5 m. What is its perimeter?", ["12 m", "24 m", "35 m", "48 m"], "24 m", "find_perimeter", "Perimeter", [3], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-08", "An irregular path has sides 3 m, 5 m, 4 m and 6 m. What is the perimeter?", ["14 m", "16 m", "18 m", "20 m"], "18 m", "irregular_perimeter", "Perimeter", [3], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-20", "A rectangle has sides 10 m and 5 m. What is its perimeter?", ["15 m", "25 m", "30 m", "50 m"], "30 m", "find_perimeter", "Perimeter", [3], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-09", "A rectangle is 8 m by 3 m. What is its area?", ["11 m²", "24 m²", "32 m²", "48 m²"], "24 m²", "area_formula", "Area", [4], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-10", "A rectangle is 7 m by 3 m. What is its area?", ["10 m²", "20 m²", "21 m²", "42 m²"], "21 m²", "area_formula", "Area", [4], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-11", "Which task is an area problem?", ["covering a wall with paint", "fencing a garden", "timing a race", "weighing fruit"], "covering a wall with paint", "area_or_perimeter", "Area or Perimeter", [5], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-12", "Which two rectangles have the same area but different perimeter?", ["3 by 8 and 4 by 6", "3 by 8 and 3 by 8", "2 by 5 and 2 by 5", "4 by 4 and 4 by 4"], "3 by 8 and 4 by 6", "area_or_perimeter", "Area or Perimeter", [5], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-13", "24-hour time 18:45 is ...", ["6:45 am", "6:45 pm", "8:45 pm", "4:45 pm"], "6:45 pm", "time_24_hour", "12 and 24 Hour Time", [6], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-14", "A train leaves at 2:10 pm and arrives at 3:00 pm. How long is the trip?", ["40 min", "50 min", "60 min", "70 min"], "50 min", "timetable_problem", "12 and 24 Hour Time", [6], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-15", "Which angle is closest to a right angle?", ["88°", "40°", "130°", "10°"], "88°", "estimate_angles", "Angles", [7], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-16", "Which angle is obtuse?", ["35°", "65°", "120°", "90°"], "120°", "compare_angles", "Angles", [7], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-17", "Which tool would you use to measure 65° exactly?", ["ruler", "protractor", "scale", "calendar"], "protractor", "angle_tool", "Angles", [7], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-18", "A school fair plan needs time, length and area. This is a ...", ["measurement project", "spelling task", "money-only task", "calendar-only task"], "measurement project", "measurement_project", "Master Missions", [8], "year5-measurement-post"),
  buildQuestion("y5-measurement-pt-19", "Which decision shows the best measurement thinking?", ["choose the unit that fits the problem", "always choose the biggest number", "always use metres", "always use kilograms"], "choose the unit that fits the problem", "measurement_project", "Master Missions", [8], "year5-measurement-post"),
];

// ═══════════════════════ YEAR 6 ══════════════════════════════════════════════
// W1 Area formula · W2 Composite area · W3 Volume · W4 Metric conversions ·
// W5 Advanced time · W6 Angle reasoning · W7 Strategy/optimisation · W8 Project.
const YEAR6_PRETEST: Question[] = [
  buildQuestion("y6-measurement-pre-01", "Area of a rectangle can be found by ...", ["length + width", "length × width", "length ÷ width", "counting corners"], "length × width", "area_formula", "Area Formula", [1], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-02", "A 5 by 4 rectangle has area ...", ["9 units²", "18 units²", "20 units²", "25 units²"], "20 units²", "area_formula", "Area Formula", [1], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-03", "Composite area means ...", ["one rectangle only", "a shape made from smaller rectangles", "a circular area", "a mass measure"], "a shape made from smaller rectangles", "composite_area", "Composite Area", [2], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-04", "Which area strategy fits a shape made from two rectangles?", ["split it, find each area, then combine", "guess", "measure the perimeter only", "use a clock"], "split it, find each area, then combine", "composite_area", "Composite Area", [2], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-05", "Volume measures the amount of ...", ["space inside a 3D object", "distance around a shape", "time between events", "temperature"], "space inside a 3D object", "volume_intro", "Volume", [3], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-06", "Which unit measures a box's volume?", ["square units", "cubic units", "degrees", "hours"], "cubic units", "volume_intro", "Volume", [3], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-07", "Which has greater volume?", ["shape with 24 cubes", "shape with 18 cubes", "same", "cannot tell"], "shape with 24 cubes", "compare_volume", "Volume", [3], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-08", "Convert 3 m to centimetres.", ["30 cm", "300 cm", "3000 cm", "33 cm"], "300 cm", "metric_convert_length", "Metric Conversions", [4], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-09", "How many grams are in 2 kg?", ["200 g", "2000 g", "20 g", "220 g"], "2000 g", "metric_convert_mass", "Metric Conversions", [4], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-10", "A trip starts at 9:15 and ends at 10:00. The elapsed time is ...", ["30 min", "45 min", "60 min", "75 min"], "45 min", "advanced_time", "Advanced Time", [5], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-11", "Elapsed-time problems ask you to ...", ["find a duration", "find a perimeter", "find an angle", "find a kilogram"], "find a duration", "advanced_time", "Advanced Time", [5], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-12", "Angles on a straight line add to ...", ["90°", "180°", "270°", "360°"], "180°", "straight_line_angles", "Angle Reasoning", [6], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-13", "If one angle on a straight line is 110°, the other is ...", ["60°", "70°", "80°", "90°"], "70°", "straight_line_angles", "Angle Reasoning", [6], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-14", "Which question is about choosing the best tool?", ["Should I use a ruler or tape measure?", "What is 3 × 4?", "What day is Monday?", "How many vowels?"], "Should I use a ruler or tape measure?", "optimisation_tools", "Measurement Mastery", [7], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-15", "Which tool is best for measuring a football field?", ["ruler", "trundle wheel", "paper clips", "teaspoon"], "trundle wheel", "optimisation_tools", "Measurement Mastery", [7], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-16", "Which shows strongest measurement reasoning?", ["choose the strategy that fits the problem", "always choose the biggest unit", "always choose multiplication", "always estimate only"], "choose the strategy that fits the problem", "optimisation_strategy", "Measurement Mastery", [7], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-17", "Which is a real engineering task?", ["design a community park", "alphabetise these words", "copy the date", "find a rhyme"], "design a community park", "master_project", "Master Project", [8], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-18", "A community park design needs fences and lawn cover. Which measurements matter?", ["perimeter and area", "mass and temperature", "angle only", "time only"], "perimeter and area", "master_project", "Master Project", [8], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-19", "A rectangle is 12 cm by 5 cm. Which formula gives its area?", ["A = l + w", "A = l × w", "A = l − w", "A = 2l + 2w"], "A = l × w", "area_formula", "Area Formula", [1], "year6-measurement-pre"),
  buildQuestion("y6-measurement-pre-20", "What is the best first step for finding composite area?", ["split the shape into rectangles", "find the perimeter", "measure the temperature", "count the angles"], "split the shape into rectangles", "composite_area", "Composite Area", [2], "year6-measurement-pre"),
];
const YEAR6_POSTTEST: Question[] = [
  buildQuestion("y6-measurement-pt-01", "A rectangle is 8 m by 6 m. What is its area?", ["14 m²", "28 m²", "48 m²", "56 m²"], "48 m²", "area_formula", "Area Formula", [1], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-02", "A rectangle area problem asks for the space covered by 7 rows of 4 tiles. Area?", ["11", "21", "28", "56"], "28", "area_formula", "Area Formula", [1], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-03", "A composite shape is made from a 12 m² rectangle and an 8 m² rectangle. Total area?", ["4 m²", "20 m²", "24 m²", "96 m²"], "20 m²", "composite_area", "Composite Area", [2], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-04", "A composite playground has areas 18 m² and 14 m². Total area?", ["22 m²", "28 m²", "32 m²", "252 m²"], "32 m²", "composite_area", "Composite Area", [2], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-05", "A box is built from 3 rows, 2 columns and 4 layers of cubes. How many cubes?", ["9", "18", "24", "36"], "24", "volume_arrays", "Volume", [3], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-06", "What does volume measure?", ["surface", "space inside a 3D object", "distance around", "temperature change"], "space inside a 3D object", "volume_intro", "Volume", [3], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-07", "A storage box has a volume of 30 cubes. Another has 24 cubes. Which has more volume?", ["24-cube box", "30-cube box", "same", "cannot tell"], "30-cube box", "compare_volume", "Volume", [3], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-08", "Convert 2.4 m to centimetres.", ["24 cm", "240 cm", "2400 cm", "244 cm"], "240 cm", "metric_convert_length", "Metric Conversions", [4], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-09", "How many millilitres are in 2.5 L?", ["250 mL", "2500 mL", "25 mL", "2050 mL"], "2500 mL", "metric_convert_capacity", "Metric Conversions", [4], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-10", "A train leaves at 8:35 and arrives at 10:05. Elapsed time?", ["1 h 10 min", "1 h 20 min", "1 h 30 min", "1 h 40 min"], "1 h 30 min", "advanced_time", "Advanced Time", [5], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-11", "A flight starts at 1:45 pm and lasts 2 h 20 min. What finish time?", ["3:55 pm", "4:05 pm", "4:15 pm", "4:25 pm"], "4:05 pm", "advanced_time", "Advanced Time", [5], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-12", "If one angle on a straight line is 125°, the other angle is ...", ["45°", "55°", "65°", "75°"], "55°", "straight_line_angles", "Angle Reasoning", [6], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-13", "Two adjacent angles total 180°. One is 92°. The other is ...", ["78°", "88°", "98°", "108°"], "88°", "missing_angles", "Angle Reasoning", [6], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-14", "Which tool is best for measuring a classroom wall?", ["paper clips", "ruler", "tape measure", "teaspoon"], "tape measure", "optimisation_tools", "Measurement Mastery", [7], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-15", "Which strategy best solves a mixed measurement project?", ["choose the strategy that fits each part", "always use area", "always use time", "always guess first"], "choose the strategy that fits each part", "optimisation_strategy", "Measurement Mastery", [7], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-16", "Which answer shows master measurement thinking?", ["I picked the tool and unit that best fit the problem", "I always used the biggest number", "I only measured one part", "I skipped the diagram"], "I picked the tool and unit that best fit the problem", "optimisation_strategy", "Measurement Mastery", [7], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-17", "To fence a park and cover its lawn, which measurements do you need?", ["perimeter only", "area only", "perimeter and area", "mass and temperature"], "perimeter and area", "master_project", "Master Project", [8], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-18", "A master engineer plans a garden, a path and a water tank. This project combines ...", ["area, length and volume", "only area", "only time", "only mass"], "area, length and volume", "master_project", "Master Project", [8], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-19", "A rectangle is 12 cm by 5 cm. Which formula is correct for its area?", ["A = l + w", "A = l × w", "A = l − w", "A = 2l + 2w"], "A = l × w", "area_formula", "Area Formula", [1], "year6-measurement-post"),
  buildQuestion("y6-measurement-pt-20", "To find composite area, the smartest first move is to ...", ["split the shape", "find the perimeter", "measure the temperature", "count the angles"], "split the shape", "composite_area", "Composite Area", [2], "year6-measurement-post"),
];

export const MEASURELANDS_PRETESTS_BY_YEAR: Partial<Record<YearLabel, Question[]>> = {
  "Year 1": YEAR1_PRETEST,
  "Year 2": YEAR2_PRETEST,
  "Year 3": YEAR3_PRETEST,
  "Year 4": YEAR4_PRETEST,
  "Year 5": YEAR5_PRETEST,
  "Year 6": YEAR6_PRETEST,
};

export const MEASURELANDS_POSTTESTS_BY_YEAR: Record<YearLabel, PostTest> = {
  Prep: buildPostTest("Prep", PREP_POSTTEST),
  "Year 1": buildPostTest("Year 1", YEAR1_POSTTEST),
  "Year 2": buildPostTest("Year 2", YEAR2_POSTTEST),
  "Year 3": buildPostTest("Year 3", YEAR3_POSTTEST),
  "Year 4": buildPostTest("Year 4", YEAR4_POSTTEST),
  "Year 5": buildPostTest("Year 5", YEAR5_POSTTEST),
  "Year 6": buildPostTest("Year 6", YEAR6_POSTTEST),
};

export function getMeasurelandsPretestForYear(yearLabel: string): Question[] {
  return MEASURELANDS_PRETESTS_BY_YEAR[yearLabel as YearLabel] ?? [];
}

export function getMeasurelandsPosttestForYear(yearLabel: string): PostTest | undefined {
  return MEASURELANDS_POSTTESTS_BY_YEAR[yearLabel as YearLabel];
}
