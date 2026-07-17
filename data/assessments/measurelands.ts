import type { PostTest, Question } from "./posttests";
import { deriveMeasurelandsAssessmentVisual } from "./measurelandsVisuals";
import { buildGroundMeasurelandsPosttestQuestions } from "./groundMeasurelandsPosttest";
import {
  YEAR1_MEASURELANDS_POSTTEST,
  YEAR1_MEASURELANDS_PRETEST,
} from "./year1MeasurelandsAssessments";
import {
  YEAR2_MEASURELANDS_POSTTEST,
  YEAR2_MEASURELANDS_PRETEST,
} from "./year2MeasurelandsAssessments";
import {
  YEAR3_MEASURELANDS_POSTTEST,
  YEAR3_MEASURELANDS_PRETEST,
} from "./year3MeasurelandsAssessments";
import {
  YEAR4_MEASURELANDS_POSTTEST,
  YEAR4_MEASURELANDS_PRETEST,
} from "./year4MeasurelandsAssessments";
import {
  YEAR5_MEASURELANDS_POSTTEST,
  YEAR5_MEASURELANDS_PRETEST,
} from "./year5MeasurelandsAssessments";
import {
  YEAR6_MEASURELANDS_POSTTEST,
  YEAR6_MEASURELANDS_PRETEST,
} from "./year6MeasurelandsAssessments";

type YearLabel = "Prep" | "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Year 5" | "Year 6";

// ── Measurelands pre/post-test banks ──────────────────────────────────────────
// Every bank has exactly 20 questions aligned to its taught program. Level 6
// deliberately assesses Weeks 1–7 because Week 8 is a multi-step master project,
// not a suitable source for a single assessment question. Pre = diagnose; Post =
// apply/master. Same skills, different questions.

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

// ═══════════════════════ YEAR 2 ══════════════════════════════════════════════
// W1 Units & Length · W2 Mass · W3 Capacity · W4 Accuracy · W5 Clock I
// (o'clock/half past) · W6 Clock II (quarter past/to) · W7 Calendar · W8 Mixed.
// NOTE: Year 2 does NOT teach perimeter/area (that is Year 3+).
const LEGACY_YEAR2_PRETEST: Question[] = [
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
const LEGACY_YEAR2_POSTTEST: Question[] = [
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

// ═══════════════════════ YEAR 4 ══════════════════════════════════════════════
// W1 Precision (mm) · W2 Scales & Jugs · W3 Temperature · W4 Perimeter ·
// W5 Area · W6 Time problems · W7 Angles · W8 Measurement missions.
/* Legacy text-only Year 4 banks retained temporarily for comparison during the
 * assessment migration. Runtime selection uses the lesson-native banks below.
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
*/

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

export const MEASURELANDS_PRETESTS_BY_YEAR: Partial<Record<YearLabel, Question[]>> = {
  "Year 1": YEAR1_MEASURELANDS_PRETEST,
  "Year 2": YEAR2_MEASURELANDS_PRETEST,
  "Year 3": YEAR3_MEASURELANDS_PRETEST,
  "Year 4": YEAR4_MEASURELANDS_PRETEST,
  "Year 5": YEAR5_MEASURELANDS_PRETEST,
  "Year 6": YEAR6_MEASURELANDS_PRETEST,
};

export const MEASURELANDS_POSTTESTS_BY_YEAR: Record<YearLabel, PostTest> = {
  Prep: buildPostTest("Prep", PREP_POSTTEST),
  "Year 1": buildPostTest("Year 1", YEAR1_MEASURELANDS_POSTTEST),
  "Year 2": buildPostTest("Year 2", YEAR2_MEASURELANDS_POSTTEST),
  "Year 3": buildPostTest("Year 3", YEAR3_MEASURELANDS_POSTTEST),
  "Year 4": buildPostTest("Year 4", YEAR4_MEASURELANDS_POSTTEST),
  "Year 5": buildPostTest("Year 5", YEAR5_MEASURELANDS_POSTTEST),
  "Year 6": buildPostTest("Year 6", YEAR6_MEASURELANDS_POSTTEST),
};

export function getMeasurelandsPretestForYear(yearLabel: string): Question[] {
  return MEASURELANDS_PRETESTS_BY_YEAR[yearLabel as YearLabel] ?? [];
}

export function getMeasurelandsPosttestForYear(yearLabel: string): PostTest | undefined {
  return MEASURELANDS_POSTTESTS_BY_YEAR[yearLabel as YearLabel];
}
