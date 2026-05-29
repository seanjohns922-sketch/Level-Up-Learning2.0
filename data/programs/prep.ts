import { normalizeWeekPlans } from "./buildProgram";
import type { CurriculumCode, Lesson, WeekPlan } from "./year1";
import type { LessonActivity } from "./types";

function mc(config: Record<string, unknown>): LessonActivity {
  return { activityType: "multiple_choice", weight: 1, config };
}
function tr(config: Record<string, unknown>): LessonActivity {
  return { activityType: "typed_response", weight: 1, config };
}
function no(min: number, max: number, count: number, ascending: boolean): LessonActivity {
  return { activityType: "number_order", weight: 2, config: { min, max, count, ascending } };
}
function nl(min: number, max: number, step: number): LessonActivity {
  return { activityType: "number_line", weight: 2, config: { min, max, step, mode: "placement" } };
}
function pvb(min: number, max: number): LessonActivity {
  return { activityType: "place_value_builder", weight: 2, config: { min, max, placeValues: ["tens", "ones"], visualMode: "mab", mode: "identify_number" } };
}
function pe(min: number, max: number): LessonActivity {
  return { activityType: "partition_expand", weight: 2, config: { min, max, mode: "partition" } };
}
function eg(maxGroups: number, maxItems: number): LessonActivity {
  return { activityType: "equal_groups", weight: 2, config: { minGroups: 2, maxGroups, minItemsPerGroup: 2, maxItemsPerGroup: maxItems, mode: "equal_groups" } };
}

function buildLesson(
  week: number,
  lesson: number,
  title: string,
  focus: string,
  activityIdeas: string[],
  curriculum: CurriculumCode[],
  displayTitle?: string,
  activities?: LessonActivity[]
): Lesson {
  return {
    id: `y0-w${week}-l${lesson}`,
    week,
    lesson,
    title,
    displayTitle,
    focus,
    activityIdeas,
    curriculum,
    activities,
  };
}

const PREP_PROGRAM_RAW: WeekPlan[] = [
  {
    id: "y0-w1",
    week: 1,
    topic: "Recognising Numbers 1–5",
    curriculum: ["AC9MFN01"],
    lessons: [
      buildLesson(
        1, 1,
        "Recognise Numbers 1–5",
        "Recognise numerals 1–5 and connect them to quantities.",
        ["Tap and count dots", "Match numerals to groups", "Quick recognition cards"],
        ["AC9MFN01"],
        undefined,
        [no(1, 5, 4, true), mc({ min: 1, max: 5, mode: "identify_number" }), tr({ min: 1, max: 5 })]
      ),
      buildLesson(
        1, 2,
        "Count Collections to 5",
        "Count small collections using one-to-one correspondence.",
        ["Drag to count", "Count and choose", "Build the group"],
        ["AC9MFN01"],
        undefined,
        [mc({ min: 1, max: 5, mode: "count_objects" }), tr({ min: 1, max: 5 }), no(1, 5, 4, true)]
      ),
      buildLesson(
        1, 3,
        "Number Names & Numerals",
        "Connect spoken number names to written numerals 1–5.",
        ["Hear and match", "Number chant", "Mixed matching"],
        ["AC9MFN01"],
        undefined,
        [mc({ min: 1, max: 5, mode: "number_word" }), mc({ min: 1, max: 5, mode: "match_all_three" }), tr({ min: 1, max: 5 })]
      ),
    ],
  },
  {
    id: "y0-w2",
    week: 2,
    topic: "Recognising Numbers 6–10",
    curriculum: ["AC9MFN01", "AC9MFN03"],
    lessons: [
      buildLesson(
        2, 1,
        "Find Numbers 6–10",
        "Recognise numerals 6–10 and connect them to quantities.",
        ["Tap and count collections", "Numeral match", "Fast number recognition"],
        ["AC9MFN01", "AC9MFN03"],
        undefined,
        [no(6, 10, 4, true), mc({ min: 6, max: 10, mode: "identify_number" }), tr({ min: 6, max: 10 })]
      ),
      buildLesson(
        2, 2,
        "Count the Groups",
        "Count collections to 10 accurately and trust the count.",
        ["Count objects", "One-to-one counting", "Trust the count"],
        ["AC9MFN01", "AC9MFN03"],
        undefined,
        [mc({ min: 1, max: 10, mode: "count_objects" }), tr({ min: 1, max: 10 }), no(1, 10, 4, true)]
      ),
      buildLesson(
        2, 3,
        "Match the Numbers",
        "Connect spoken number names, numerals, quantities, and written number words to 10.",
        ["Listen and tap", "Match the word", "Three-way number match"],
        ["AC9MFN01", "AC9MFN03"],
        undefined,
        [mc({ min: 1, max: 10, mode: "number_word" }), mc({ min: 1, max: 10, mode: "three_way_match" }), tr({ min: 1, max: 10 })]
      ),
    ],
  },
  {
    id: "y0-w3",
    week: 3,
    topic: "Counting Forward & Backward",
    curriculum: ["AC9MFN01", "AC9MFN03"],
    lessons: [
      buildLesson(
        3, 1,
        "Rocket Count to 10",
        "Count forward fluently to 10 and complete number paths in order.",
        ["Count along the rocket path", "Find the missing number", "Tap numbers in order"],
        ["AC9MFN01", "AC9MFN03"],
        undefined,
        [no(1, 10, 5, true), mc({ min: 1, max: 10, mode: "next_number" }), tr({ min: 1, max: 10, mode: "missing_number" })]
      ),
      buildLesson(
        3, 2,
        "Blast Off Countdown",
        "Count backward from 10 to 1 and build reverse number order.",
        ["Countdown blastoff", "What comes before", "Backward number paths"],
        ["AC9MFN01", "AC9MFN03"],
        undefined,
        [no(1, 10, 5, false), mc({ min: 1, max: 10, mode: "before_number" }), tr({ min: 1, max: 10 })]
      ),
      buildLesson(
        3, 3,
        "Number Match Mission",
        "Connect spoken number names, numerals, quantities, and counting order to 10.",
        ["Listen and tap", "Match the group", "Sequence builder"],
        ["AC9MFN01", "AC9MFN03"],
        undefined,
        [mc({ min: 1, max: 10, mode: "sequence_order" }), no(1, 10, 4, true), tr({ min: 1, max: 10 })]
      ),
    ],
  },
  {
    id: "y0-w4",
    week: 4,
    topic: "Subitising 1–10",
    curriculum: ["AC9MFN02", "AC9MFN03"],
    lessons: [
      buildLesson(
        4, 1,
        "Recognise Dot Patterns 1–10",
        "Instantly recognise structured quantities to 10 without counting one-by-one.",
        ["Flash reveal", "Ten-frame quick look", "Pattern memory sprint"],
        ["AC9MFN02", "AC9MFN03"],
        "Quick Number Eyes",
        [mc({ min: 1, max: 10, mode: "subitise_dots" }), mc({ min: 1, max: 10, mode: "ten_frame_flash" }), tr({ min: 1, max: 10 })]
      ),
      buildLesson(
        4, 2,
        "Recognise Object Groups",
        "Instantly recognise structured object groups to 10 without counting one-by-one.",
        ["Quick group flash", "Object-frame match", "Real-world memory groups"],
        ["AC9MFN02", "AC9MFN03"],
        "Quick Group Spotter",
        [mc({ min: 1, max: 10, mode: "subitise_objects" }), mc({ min: 1, max: 10, mode: "group_flash" }), tr({ min: 1, max: 10 })]
      ),
      buildLesson(
        4, 3,
        "Match Dots to Numerals",
        "Connect structured quantity patterns to numerals, matching quantities, and visual groups without counting one-by-one.",
        ["Pattern to numeral match", "Match all three", "Fast pattern memory"],
        ["AC9MFN02", "AC9MFN03"],
        "Pattern Match Mission",
        [mc({ min: 1, max: 10, mode: "pattern_to_numeral" }), mc({ min: 1, max: 10, mode: "match_all_three" }), tr({ min: 1, max: 10 })]
      ),
    ],
  },
  {
    id: "y0-w5",
    week: 5,
    topic: "Comparing & Sorting Quantities",
    curriculum: ["AC9MFN02", "AC9MFN03"],
    lessons: [
      buildLesson(
        5, 1,
        "More or Less",
        "Compare quantities and identify more, less, and equal using visual reasoning and structured groups.",
        ["Which group has more", "Equal group checks", "Quick comparison games"],
        ["AC9MFN03"],
        "More or Less Mission",
        [no(1, 10, 2, true), mc({ min: 1, max: 10, mode: "more_or_less" }), mc({ min: 1, max: 10, mode: "equal_check" })]
      ),
      buildLesson(
        5, 2,
        "Equal Groups",
        "Recognise when collections show the same amount even when they look different.",
        ["Match equal sets", "Balance the groups", "Same amount game"],
        ["AC9MFN03"],
        "Match the Groups",
        [eg(4, 5), mc({ min: 2, max: 20, mode: "same_amount" }), tr({ min: 2, max: 20 })]
      ),
      buildLesson(
        5, 3,
        "Sort from Least to Most",
        "Order quantities from least to most and most to least using visual groups and comparison.",
        ["Sort the groups", "Biggest and smallest", "Quick ordering games"],
        ["AC9MFN03"],
        "Number Sort Challenge",
        [no(1, 10, 4, true), no(1, 10, 4, false), mc({ min: 1, max: 10, mode: "biggest_smallest" })]
      ),
    ],
  },
  {
    id: "y0-w6",
    week: 6,
    topic: "Building Numbers to 10",
    curriculum: ["AC9MFN02", "AC9MFN03"],
    lessons: [
      buildLesson(
        6, 1,
        "Make Numbers in Different Ways",
        "Build the same number using different groups.",
        ["Make it another way", "Build and swap", "Show the same number"],
        ["AC9MFN02", "AC9MFN03"],
        "Number Builder Lab",
        [mc({ min: 1, max: 10, mode: "flexible_make" }), mc({ min: 1, max: 10, mode: "show_same_number" }), tr({ min: 1, max: 10 })]
      ),
      buildLesson(
        6, 2,
        "Ways to Make 10",
        "Build and recognise combinations that make 10 using visual part-part-whole groups.",
        ["Make 10 builder", "Fill the ten frame", "Find another way to make 10"],
        ["AC9MFN02", "AC9MFN03"],
        "Make 10 Lab",
        [pe(0, 10), mc({ min: 1, max: 10, mode: "make_10" }), tr({ min: 1, max: 10, mode: "make_10" })]
      ),
      buildLesson(
        6, 3,
        "Part-Part-Whole to 10",
        "Understand that numbers can be split into parts and recombined into a whole using visual groups to 10.",
        ["Split the number", "Match the parts", "Quick split builder"],
        ["AC9MFN02", "AC9MFN03"],
        "Number Split Mission",
        [pe(1, 10), mc({ min: 1, max: 10, mode: "missing_part" }), tr({ min: 1, max: 10 })]
      ),
    ],
  },
  {
    id: "y0-w7",
    week: 7,
    topic: "Teen Numbers & Collections to 20",
    curriculum: ["AC9MFN01", "AC9MFN02", "AC9MFN03"],
    lessons: [
      buildLesson(
        7, 1,
        "Count Collections to 20",
        "Count larger collections accurately using one-to-one correspondence, organised counting, and visual groups to 20.",
        ["Count bigger groups", "Touch and count to 20", "Collection count challenge"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03"],
        "Collection Counter Mission",
        [mc({ min: 11, max: 20, mode: "count_objects" }), tr({ min: 11, max: 20 }), no(1, 20, 4, true)]
      ),
      buildLesson(
        7, 2,
        "Teen Numbers 11–20",
        "Recognise, build, and match teen numbers as 10 and some more using structured visuals.",
        ["Build 10 and extras", "Teen number match", "Find the teen collection"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03"],
        "Teen Number Mission",
        [pvb(11, 20), mc({ min: 11, max: 20, mode: "teen_structure" }), tr({ min: 11, max: 20 })]
      ),
      buildLesson(
        7, 3,
        "Organise Collections to 20",
        "Organise, sort, and build collections up to 20 using grouped structures, teen-number visuals, and efficient counting strategies.",
        ["Organise the collection", "Sort into groups", "Collection station"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03"],
        "Collection Sorting Station",
        [no(1, 20, 4, true), mc({ min: 11, max: 20, mode: "collection_sort" }), tr({ min: 11, max: 20 })]
      ),
    ],
  },
  {
    id: "y0-w8",
    week: 8,
    topic: "Number Patterns & Ordering",
    curriculum: ["AC9MFN01", "AC9MFN03"],
    lessons: [
      buildLesson(
        8, 1,
        "Missing Numbers",
        "Identify missing numbers in forward and backward sequences to 20 using number paths, neighbours, and counting patterns.",
        ["Missing number trail", "Fill the gap", "Pattern path"],
        ["AC9MFN01", "AC9MFN03"],
        "Number Detective Mission",
        [no(1, 20, 5, true), mc({ min: 1, max: 20, mode: "missing_number" }), tr({ min: 1, max: 20 })]
      ),
      buildLesson(
        8, 2,
        "Number Paths",
        "Navigate forward and backward through connected number trails to 20 using stepping stones, portals, number hops, and movement-based path choices.",
        ["Move Numbot", "Countdown portal", "Number line hops"],
        ["AC9MFN01", "AC9MFN03"],
        "Number Trail Adventure",
        [nl(0, 20, 1), mc({ min: 1, max: 20, mode: "number_path" }), tr({ min: 1, max: 20 })]
      ),
      buildLesson(
        8, 3,
        "Order Numbers to 20",
        "Compare and sort numbers to 20 from least to greatest and greatest to least using sorting trays, ladders, race tracks, and quick ordering challenges.",
        ["Order the numbers", "Number podium", "Which number is biggest?"],
        ["AC9MFN01", "AC9MFN03"],
        "Number Order Arena",
        [no(1, 20, 5, true), no(1, 20, 5, false), tr({ min: 1, max: 20 })]
      ),
    ],
  },
  {
    id: "y0-w9",
    week: 9,
    topic: "Ordinal Numbers & Position",
    curriculum: ["AC9MFN01", "AC9MFN03"],
    lessons: [
      buildLesson(
        9, 1,
        "First, Second, Third",
        "Recognise and use first, second, third, fourth, fifth, last, before, and after in familiar ordered situations like races, queues, podiums, trains, and line-ups.",
        ["Who is first?", "Race track positions", "Place Numbot second"],
        ["AC9MFN01", "AC9MFN03"],
        "Position Explorer Mission",
        [mc({ min: 1, max: 10, mode: "ordinal_position" }), mc({ min: 1, max: 10, mode: "race_positions" }), tr({ min: 1, max: 5, mode: "ordinal_identify" })]
      ),
      buildLesson(
        9, 2,
        "Ordinals in Games",
        "Use ordinal language in dynamic race, game, leaderboard, and podium contexts where positions change and students track first, second, third, before, after, and last.",
        ["Who won the race?", "Race track order", "Champion ceremony"],
        ["AC9MFN01", "AC9MFN03"],
        "Nexus Race Arena",
        [mc({ min: 1, max: 10, mode: "ordinal_game" }), mc({ min: 1, max: 10, mode: "race_order" }), tr({ min: 1, max: 5, mode: "podium" })]
      ),
      buildLesson(
        9, 3,
        "Position Challenges",
        "Use spatial language such as beside, between, next to, above, below, left, right, in front, and behind while placing and navigating objects in futuristic maps, rooms, and obstacle scenes.",
        ["Who is between?", "Place Numbot beside the crystal", "Position maze"],
        ["AC9MFN03", "AC9MFSP02"],
        "Nexus Position Lab",
        [mc({ min: 1, max: 10, mode: "position_language" }), mc({ min: 1, max: 10, mode: "spatial_position" }), tr({ min: 1, max: 10, mode: "place_numbot" })]
      ),
    ],
  },
  {
    id: "y0-w10",
    week: 10,
    topic: "Mixed Number Fluency",
    curriculum: ["AC9MFN01", "AC9MFN02", "AC9MFN03"],
    lessons: [
      buildLesson(
        10, 1,
        "Number Arcade",
        "Review counting fluency, numeral recognition, matching quantities, teen numbers, ordering, positional understanding, and number relationships through fast arcade-style mini games.",
        ["Tap the number", "Quick count flash", "Teen number match"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03"],
        "Nexus Number Arcade",
        [no(1, 20, 4, true), mc({ min: 1, max: 20, mode: "mixed_review" }), tr({ min: 1, max: 20 })]
      ),
      buildLesson(
        10, 2,
        "Numbot Boss Battles",
        "Apply counting, teen numbers, comparing, ordering, ordinals, positional language, missing numbers, number paths, and quantity matching in playful boss-battle style challenge rounds.",
        ["Count Bot", "Teen Titan", "Final Boss Round"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03"],
        "Numbot Boss Arena",
        [mc({ min: 1, max: 20, mode: "teen_number" }), no(1, 20, 4, true), tr({ min: 1, max: 20 })]
      ),
      buildLesson(
        10, 3,
        "Build & Compare",
        "Build, compare, and match quantities using counting, teen-number understanding, ordering, more or less, same or different, and flexible quantity building in creative Number Nexus lab challenges.",
        ["Build the number", "Make the groups equal", "Sort the groups"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03"],
        "Nexus Builder Lab",
        [no(1, 20, 4, true), mc({ min: 1, max: 20, mode: "build_compare" }), tr({ min: 1, max: 20 })]
      ),
    ],
  },
  {
    id: "y0-w11",
    week: 11,
    topic: "Review & Readiness",
    curriculum: ["ALL"],
    lessons: [
      buildLesson(
        11, 1,
        "Counting Review",
        "Review counting to 20, number sequencing, teen numbers, numeral recognition, quantity matching, forward and backward counting, and number order fluency through varied mixed review mini-games.",
        ["Tap the number", "Quick count flash", "Teen number match"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03"],
        "Nexus Review Run",
        [no(1, 20, 5, true), mc({ min: 1, max: 20, mode: "counting_review" }), tr({ min: 1, max: 20 })]
      ),
      buildLesson(
        11, 2,
        "Subitising & Number Building",
        "Rapidly recognise, partition, build and compare quantities using subitising, double ten-frame structure, missing-part-to-10 reasoning and flexible visual number thinking.",
        ["Quick image flash", "Build 10 with two parts", "How many more to make 10?"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03"],
        "Nexus Speed Builder",
        [mc({ min: 1, max: 10, mode: "subitise_flash" }), pe(1, 10), tr({ min: 1, max: 10 })]
      ),
      buildLesson(
        11, 3,
        "Ground Level Challenge Tower",
        "Apply counting, teen numbers, ordering, comparing, positional language, paths, subitising and reasoning through escalating challenge tower floors with reduced support.",
        ["Multi-missing paths", "Challenge reactor", "Race track analysis"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03", "AC9MFSP02"],
        "Nexus Challenge Tower",
        [no(1, 20, 5, true), mc({ min: 1, max: 20, mode: "challenge_tower" }), tr({ min: 1, max: 20 })]
      ),
    ],
  },
  {
    id: "y0-w12",
    week: 12,
    topic: "Final Mastery Week",
    curriculum: ["ALL"],
    lessons: [
      buildLesson(
        12, 1,
        "Legend Training",
        "Strengthen final Ground Level fluency through quick image flashes, representation switching, teen-number building and number-image memory using structured visual number systems.",
        ["Quick image flash", "Representation switch", "Number image memory"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03", "AC9MFSP02"],
        "Legend Training Arena",
        [no(1, 20, 4, true), mc({ min: 1, max: 20, mode: "legend_training" }), tr({ min: 1, max: 20 })]
      ),
      buildLesson(
        12, 2,
        "Flexible Number Building",
        "Strengthen final flexible number thinking through rebuilding wholes, finding missing parts, making 10 and 20, and comparing same-whole structures with reduced support.",
        ["Flexible builder", "Missing-part challenge", "Make 10 / Make 20"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03"],
        "Nexus Number Forge",
        [pe(1, 10), mc({ min: 1, max: 10, mode: "flexible_build" }), tr({ min: 1, max: 10 })]
      ),
      buildLesson(
        12, 3,
        "Final Mastery Application",
        "Apply Ground Level skills independently through ordering mastery, multi-missing reasoning, flexible number building, and practical challenge rooms with minimal support.",
        ["Ordering mastery", "Multi-missing reasoning", "Practical challenge rooms"],
        ["AC9MFN01", "AC9MFN02", "AC9MFN03", "AC9MFSP02"],
        "Legend Mastery Trial",
        [no(1, 20, 5, true), mc({ min: 1, max: 20, mode: "mastery_application" }), tr({ min: 1, max: 20 })]
      ),
    ],
  },
];

export const PREP_PROGRAM: WeekPlan[] = normalizeWeekPlans(0, PREP_PROGRAM_RAW);

export function getPrepWeek(week: number): WeekPlan | undefined {
  return PREP_PROGRAM.find((plan) => plan.week === week);
}
