"use client";

import { useEffect, useState } from "react";
import { Star, Check } from "lucide-react";
import type { Lesson } from "@/data/programs/year1";
import { DEFAULT_LESSON_XP } from "@/data/programs/genres";
import type { TeacherInsight } from "@/lib/teacher-insights";
import type { LessonActivity, ActivityType } from "@/data/programs/types";

export type LessonPreviewStudent = {
  id: string;
  display_name: string;
  status: "Not Started" | "In Progress" | "Completed";
  attempts?: number;
  timeSpent?: string;
  quizPercent?: number | null;
  quizPassed?: boolean | null;
  accuracy?: number | null;
  aiInsight?: TeacherInsight | null;
};

export type LessonPreviewClassStats = {
  studentCount: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  quizAvg?: number | null;
  quizAttempts?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  weekTopic?: string;
  weekNumber?: number;
  strand?: string;
  realm?: string;
  yearLabel?: string;
  isPlaceholder?: boolean;
  /** Student-specific context (used in StrandStudentsPanel detail view). */
  student?: LessonPreviewStudent | null;
  /** Class-wide context (used in CurriculumExplorer). */
  classStats?: LessonPreviewClassStats | null;
};

const ESTIMATED_MINUTES = 8;

function describeActivity(idea: string): string {
  const i = idea.toLowerCase();
  if (i.includes("flash") || i.includes("flip"))   return "Quick recognition rounds — students see and respond fast.";
  if (i.includes("hunt") || i.includes("walk"))    return "Find-and-tap activity — students locate target numbers in a scene.";
  if (i.includes("group") || i.includes("set"))    return "Make equal groups using counters and sets.";
  if (i.includes("skip"))                          return "Skip-count along a number line in steps of 2s, 5s or 10s.";
  if (i.includes("ladder") || i.includes("line"))  return "Place values on a number line or ladder.";
  if (i.includes("part") || i.includes("ppp"))     return "Part–part–whole bar model — split a total into parts.";
  if (i.includes("dice") || i.includes("place"))   return "Roll and build numbers on a place-value mat.";
  if (i.includes("bar"))                           return "Bar model comparison — visualise the relationship.";
  if (i.includes("story") || i.includes("word"))   return "Word problem — choose the operation and solve.";
  if (i.includes("fact"))                          return "Fact family practice — write the four related facts.";
  if (i.includes("match") || i.includes("pair"))   return "Drag and match pairs that mean the same thing.";
  if (i.includes("array"))                         return "Build an array of rows × columns to find the total.";
  if (i.includes("share") || i.includes("deal"))   return "Share fairly into groups (division as sharing).";
  if (i.includes("count"))                         return "Count objects accurately and record the total.";
  return "Interactive practice activity tied to the lesson focus.";
}

type ActivityExample = {
  prompt: string;
  visual?: React.ReactNode;
  options?: string[];
  correct?: string;
  note: string;
};

function exampleForActivity(idea: string): ActivityExample {
  const i = idea.toLowerCase();
  if (i.includes("flash") || i.includes("flip")) {
    return {
      prompt: "What number is this?",
      visual: (
        <div className="flex items-center justify-center h-24 rounded-lg bg-white border border-[#E6E8EC] text-5xl font-black text-[#0F172A]">27</div>
      ),
      options: ["17", "27", "72", "20"],
      correct: "27",
      note: "Card flashes for ~2 seconds. Student taps the matching number.",
    };
  }
  if (i.includes("hunt") || i.includes("walk")) {
    return {
      prompt: "Find the number 34 in the grid below.",
      visual: (
        <div className="grid grid-cols-5 gap-1 p-2 rounded-lg bg-white border border-[#E6E8EC]">
          {[12, 47, 34, 8, 21, 19, 50, 6, 33, 41].map((n) => (
            <div key={n} className={`h-9 rounded-md border text-sm font-bold flex items-center justify-center ${n === 34 ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-[#FAFBFC] border-[#E6E8EC] text-[#0F172A]"}`}>{n}</div>
          ))}
        </div>
      ),
      note: "Student taps the correct tile. Wrong taps shake; correct tiles glow.",
    };
  }
  if (i.includes("group") || i.includes("set") || i.includes("equal")) {
    return {
      prompt: "Make 3 equal groups of 4 counters.",
      visual: (
        <div className="flex gap-2 p-3 rounded-lg bg-white border border-[#E6E8EC]">
          {[0,1,2].map((g)=>(
            <div key={g} className="flex-1 rounded-md border border-dashed border-[#CBD5E1] p-2 grid grid-cols-2 gap-1">
              {[0,1,2,3].map((c)=><div key={c} className="h-4 w-4 rounded-full bg-teal-500"/>)}
            </div>
          ))}
        </div>
      ),
      note: "Drag counters into group boxes. Total: 3 × 4 = 12.",
    };
  }
  if (i.includes("skip")) {
    return {
      prompt: "Fill in the missing numbers: 10, 20, __, 40, __, 60",
      options: ["30 and 50", "25 and 45", "35 and 55", "30 and 55"],
      correct: "30 and 50",
      note: "Skip-counting in 10s. Difficulty ramps to 2s and 5s.",
    };
  }
  if (i.includes("ladder") || i.includes("line")) {
    return {
      prompt: "Place 47 on the number line.",
      visual: (
        <div className="p-3 rounded-lg bg-white border border-[#E6E8EC]">
          <div className="relative h-2 bg-[#E6E8EC] rounded-full">
            <div className="absolute -top-1 h-4 w-4 rounded-full bg-teal-500 border-2 border-white shadow" style={{ left: "47%" }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-[#64748B] mt-2"><span>0</span><span>50</span><span>100</span></div>
        </div>
      ),
      note: "Drag the marker to the correct position on the line.",
    };
  }
  if (i.includes("part") || i.includes("ppp")) {
    return {
      prompt: "Whole = 15. One part is 9. What's the other part?",
      visual: (
        <div className="p-2 rounded-lg bg-white border border-[#E6E8EC]">
          <div className="h-8 rounded-md bg-teal-100 border border-teal-300 flex items-center justify-center text-sm font-black text-teal-800">15</div>
          <div className="grid grid-cols-[3fr_2fr] gap-1 mt-1">
            <div className="h-8 rounded-md bg-emerald-100 border border-emerald-300 flex items-center justify-center text-sm font-black text-emerald-800">9</div>
            <div className="h-8 rounded-md bg-amber-100 border border-amber-300 flex items-center justify-center text-sm font-black text-amber-800">?</div>
          </div>
        </div>
      ),
      options: ["4", "5", "6", "7"],
      correct: "6",
      note: "Bar model shows part–part–whole relationship.",
    };
  }
  if (i.includes("dice") || i.includes("place")) {
    return {
      prompt: "Build the number 36 using tens and ones.",
      visual: (
        <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-white border border-[#E6E8EC]">
          <div className="rounded-md border border-[#E6E8EC] p-2"><div className="text-[10px] font-bold text-[#64748B]">TENS</div><div className="flex gap-0.5 mt-1">{[0,1,2].map(i=><div key={i} className="h-6 w-2 bg-teal-500 rounded-sm"/>)}</div></div>
          <div className="rounded-md border border-[#E6E8EC] p-2"><div className="text-[10px] font-bold text-[#64748B]">ONES</div><div className="grid grid-cols-3 gap-0.5 mt-1">{Array.from({length:6}).map((_,i)=><div key={i} className="h-2 w-2 bg-emerald-500 rounded-sm"/>)}</div></div>
        </div>
      ),
      note: "3 tens + 6 ones = 36. Student drags blocks onto the mat.",
    };
  }
  if (i.includes("array")) {
    return {
      prompt: "How many dots are in this array?",
      visual: (
        <div className="p-3 rounded-lg bg-white border border-[#E6E8EC]">
          <div className="grid grid-cols-4 gap-1.5 w-fit">
            {Array.from({length:12}).map((_,i)=><div key={i} className="h-4 w-4 rounded-full bg-teal-500"/>)}
          </div>
        </div>
      ),
      options: ["10", "12", "14", "16"],
      correct: "12",
      note: "3 rows × 4 columns = 12.",
    };
  }
  if (i.includes("story") || i.includes("word")) {
    return {
      prompt: "Sam has 8 marbles. He gives 3 to his friend. How many does he have left?",
      options: ["3", "5", "8", "11"],
      correct: "5",
      note: "Student picks the operation (subtraction) and the answer.",
    };
  }
  if (i.includes("fact")) {
    return {
      prompt: "Numbers: 4, 6, 10. Write the fact family.",
      visual: (
        <div className="grid grid-cols-2 gap-1 p-2 rounded-lg bg-white border border-[#E6E8EC] text-xs font-bold text-[#0F172A]">
          <div>4 + 6 = 10</div><div>6 + 4 = 10</div>
          <div>10 − 4 = 6</div><div>10 − 6 = 4</div>
        </div>
      ),
      note: "Four related addition/subtraction facts from one trio.",
    };
  }
  if (i.includes("match") || i.includes("pair")) {
    return {
      prompt: "Match each number to its word form.",
      visual: (
        <div className="grid grid-cols-2 gap-2 p-2 rounded-lg bg-white border border-[#E6E8EC] text-xs font-bold text-[#0F172A]">
          <div className="rounded-md bg-teal-50 px-2 py-1.5 border border-teal-200">23</div><div className="rounded-md bg-emerald-50 px-2 py-1.5 border border-emerald-200">twenty-three</div>
          <div className="rounded-md bg-teal-50 px-2 py-1.5 border border-teal-200">40</div><div className="rounded-md bg-emerald-50 px-2 py-1.5 border border-emerald-200">forty</div>
        </div>
      ),
      note: "Drag lines between matching pairs.",
    };
  }
  if (i.includes("share") || i.includes("deal")) {
    return {
      prompt: "Share 12 cookies fairly between 3 children. How many each?",
      options: ["3", "4", "5", "6"],
      correct: "4",
      note: "Visual sharing animation — one to each, then repeat.",
    };
  }
  if (i.includes("count")) {
    return {
      prompt: "How many stars are there?",
      visual: (
        <div className="p-3 rounded-lg bg-white border border-[#E6E8EC]">
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {Array.from({length:14}).map((_,i)=><Star key={i} className="h-4 w-4 text-amber-500" fill="currentColor" />)}
          </div>
        </div>
      ),
      options: ["12", "13", "14", "15"],
      correct: "14",
      note: "Touch-count or type the total.",
    };
  }
  return {
    prompt: "Sample question tied to the lesson focus.",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correct: "Option B",
    note: "Multiple choice with instant feedback.",
  };
}

type ActivityPreview = ActivityExample & { label: string; description: string };

type TopicExample = {
  tag?: string;
  description?: string;
  prompt: string;
  options?: string[];
  correct?: string;
};

function topicExampleFromMode(mode: string, min: number, max: number): TopicExample {
  const m = mode.toLowerCase();

  if (m.includes("decimal") || m.includes("thousandth") || m.includes("rename")) {
    return {
      tag: "decimals",
      description: "Work with decimal place value, renaming, or ordering.",
      prompt: "What is the value of the digit 7 in 3.472?",
      options: ["7 ones", "7 tenths", "7 hundredths", "7 thousandths"],
      correct: "7 hundredths",
    };
  }
  if (m.includes("percent") || m.includes("discount")) {
    return {
      tag: "percentages",
      description: "Find percentages of amounts or apply to real-world problems.",
      prompt: "What is 25% of 80?",
      options: ["15", "20", "25", "40"],
      correct: "20",
    };
  }
  if (m.includes("fdp") || m.includes("fraction_decimal")) {
    return {
      tag: "fractions, decimals & percents",
      description: "Match and convert between fractions, decimals, and percentages.",
      prompt: "Which of these is equal to 0.75?",
      options: ["3/5", "3/4", "7/10", "7/5"],
      correct: "3/4",
    };
  }
  if (m.includes("fraction") || m.includes("denominator") || m.includes("numerator") || m.includes("improper")) {
    return {
      tag: "fractions",
      description: "Work with fractions — comparing, adding, or converting.",
      prompt: "What is 1/3 + 1/6?",
      options: ["1/2", "2/9", "1/3", "2/6"],
      correct: "1/2",
    };
  }
  if (m.includes("remainder") || m.includes("interpret")) {
    return {
      tag: "division & remainders",
      description: "Decide what to do with a remainder in context.",
      prompt: "27 students need to travel in cars. Each car holds 4. How many cars are needed?",
      options: ["5", "6", "7", "8"],
      correct: "7",
    };
  }
  if (m.includes("division") || m.includes("quot") || m.includes("divisib")) {
    return {
      tag: "division",
      description: "Solve division problems or apply divisibility rules.",
      prompt: "Which number is divisible by both 3 and 4?",
      options: ["14", "18", "24", "26"],
      correct: "24",
    };
  }
  if (m.includes("factor") || m.includes("multiple") || m.includes("prime") || m.includes("square")) {
    return {
      tag: "factors & multiples",
      description: "Identify factors, multiples, primes, or square numbers.",
      prompt: "Which of these is a factor of 48?",
      options: ["7", "9", "12", "14"],
      correct: "12",
    };
  }
  if (m.includes("multipl") || m.includes("product")) {
    return {
      tag: "multiplication",
      description: "Multiply using an efficient strategy.",
      prompt: `Work out ${min >= 1000 ? "4 × 1,236" : "7 × 48"}`,
      options: min >= 1000 ? ["4,844", "4,944", "5,044", "4,904"] : ["316", "326", "336", "346"],
      correct: min >= 1000 ? "4,944" : "336",
    };
  }
  if (m.includes("subtract") || m.includes("minus") || m.includes("add_sub")) {
    return {
      tag: "addition & subtraction",
      description: "Add or subtract using an efficient strategy.",
      prompt: "Work out 503 − 278",
      options: ["215", "225", "235", "245"],
      correct: "225",
    };
  }
  if (m.includes("addition") || m.includes("strategy_fluency")) {
    return {
      tag: "addition",
      description: "Add using a mental or written strategy.",
      prompt: "Work out 347 + 285",
      options: ["622", "632", "632", "642"],
      correct: "632",
    };
  }
  if (m.includes("multi_step") || m.includes("mixed_op") || m.includes("order_op")) {
    return {
      tag: "multi-step problems",
      description: "Solve a problem requiring two or more operations.",
      prompt: "A shop sells 12 boxes of 24 pencils and gives away 38 as samples. How many are left to sell?",
      options: ["240", "248", "250", "250"],
      correct: "250",
    };
  }
  if (m.includes("round") || m.includes("estimat") || m.includes("reasonab")) {
    return {
      tag: "rounding & estimation",
      description: "Round a number or estimate whether an answer is reasonable.",
      prompt: "Which is the best estimate for 487 × 6?",
      options: ["2,400", "2,800", "3,000", "3,200"],
      correct: "3,000",
    };
  }
  if (m.includes("pattern") || m.includes("sequence") || m.includes("function") || m.includes("algebra") || m.includes("equation")) {
    return {
      tag: "patterns & algebra",
      description: "Find, describe, or continue a pattern or rule.",
      prompt: "The rule is 'multiply by 3 then subtract 1'. What comes after 14?",
      options: ["38", "40", "41", "43"],
      correct: "41",
    };
  }
  if (m.includes("integer")) {
    return {
      tag: "integers",
      description: "Work with positive and negative numbers.",
      prompt: "The temperature is −4°C. It rises by 9°C. What is the new temperature?",
      options: ["3°C", "4°C", "5°C", "6°C"],
      correct: "5°C",
    };
  }
  if (m.includes("coord") || m.includes("cartesian") || m.includes("plot")) {
    return {
      tag: "coordinates",
      description: "Read or plot points on a Cartesian plane.",
      prompt: "Point A is at (3, −2). In which quadrant does it lie?",
      options: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"],
      correct: "Quadrant IV",
    };
  }
  if (m.includes("money") || m.includes("budget") || m.includes("real_world") || m.includes("unit_rate")) {
    return {
      tag: "real-world problems",
      description: "Apply maths to everyday money or rate problems.",
      prompt: "A bag of 8 apples costs $4.80. What is the cost of 1 apple?",
      options: ["50c", "55c", "60c", "65c"],
      correct: "60c",
    };
  }
  if (m.includes("place_value") || m.includes("identify_place") || m.includes("identify_number") || m.includes("rename")) {
    const exNum = max >= 10000 ? 48326 : max >= 1000 ? 3847 : 476;
    return {
      tag: "place value",
      description: "Read, build, or identify digits in their place value positions.",
      prompt: `What is the value of the 8 in ${exNum.toLocaleString()}?`,
      options: max >= 10000 ? ["8", "800", "8,000", "80,000"] : ["8", "80", "800", "8,000"],
      correct: max >= 10000 ? "8,000" : "800",
    };
  }

  // Generic fallback — at least use the mode string as the label
  const cleanMode = mode.replace(/_/g, " ").replace(/y\d+_?/gi, "").trim();
  return {
    tag: cleanMode || undefined,
    description: "Answer a question testing this lesson's key concept.",
    prompt: "Choose the correct answer from the options below.",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correct: "Option C",
  };
}

function activityPreviewData(type: ActivityType, config: Record<string, unknown>): ActivityPreview {
  const mode    = typeof config.mode    === "string" ? config.mode    : "";
  const min     = typeof config.min     === "number" ? config.min     : 0;
  const max     = typeof config.max     === "number" ? config.max     : 100;
  const asc     = config.ascending !== false;
  const denos   = Array.isArray(config.denominators) ? (config.denominators as number[]) : [2, 4, 8];
  const den     = denos[1] ?? denos[0] ?? 4;
  const pvs     = Array.isArray(config.placeValues) ? (config.placeValues as string[]) : ["hundreds", "tens", "ones"];

  // Pick representative example numbers within the config range
  const exNum   = min >= 10000 ? 48326 : min >= 1000 ? 3847 : min >= 100 ? 476 : 47;

  switch (type) {
    case "place_value_builder": {
      if (mode === "identify_number") {
        return {
          label: "MAB — Read the number",
          description: "Count MAB blocks to identify the number shown.",
          prompt: "What number is shown by the MAB blocks?",
          visual: <MabVisual number={exNum} places={pvs} />,
          options: [String(exNum - 100), String(exNum), String(exNum + 10), String(exNum - 1000)],
          correct: String(exNum),
          note: "Student counts each column and types or taps the total.",
        };
      }
      if (mode === "identify_place") {
        const d = Math.floor((exNum % 1000) / 100);
        return {
          label: "MAB — Identify place value",
          description: "Identify the value of a highlighted digit.",
          prompt: `What is the value of the digit ${d} in ${exNum.toLocaleString()}?`,
          options: [String(d), String(d * 100), String(d * 10), String(d * 1000)],
          correct: String(d * 100),
          note: "Tests understanding that a digit's value depends on its position.",
        };
      }
      return {
        label: "MAB — Build the number",
        description: "Drag MAB blocks onto the mat to build a given number.",
        prompt: `Build ${exNum.toLocaleString()} using MAB blocks.`,
        visual: <MabVisual number={exNum} places={pvs} />,
        note: "Student drags thousands, hundreds, tens and ones blocks onto the mat.",
      };
    }

    case "partition_expand": {
      const n = exNum;
      const th = Math.floor(n / 1000) * 1000;
      const h  = Math.floor((n % 1000) / 100) * 100;
      const t  = Math.floor((n % 100) / 10) * 10;
      const o  = n % 10;
      const expanded = n >= 1000 ? `${th} + ${h} + ${t} + ${o}` : `${h} + ${t} + ${o}`;
      if (mode === "expand") {
        return {
          label: "Expanded form",
          description: "Break a number into its place value parts.",
          prompt: `Write ${n.toLocaleString()} in expanded form.`,
          options: [expanded, `${th} × ${h} + ${t}`, `${n - 100} + 100`, `${Math.floor(n / 10)} + ${o}`],
          correct: expanded,
          note: "Student selects or types each place value part.",
        };
      }
      return {
        label: "Standard form",
        description: "Combine expanded parts to write the standard number.",
        prompt: `What number is ${expanded}?`,
        options: [String(n), String(n + 100), String(n - 10), String(n + 1000)],
        correct: String(n),
        note: "Student adds the parts to reconstruct the full number.",
      };
    }

    case "number_order": {
      const isDecimal = max <= 10 && min < 1;
      const count     = typeof config.count === "number" ? config.count : 4;
      const nums      = isDecimal
        ? [1.2, 0.7, 3.4, 2.1].slice(0, count)
        : [exNum, exNum - 2000, exNum + 5000, exNum - 800, exNum + 300].slice(0, count);
      const sorted = [...nums].sort((a, b) => asc ? a - b : b - a);
      return {
        label: asc ? "Order smallest → largest" : "Order largest → smallest",
        description: `Arrange numbers in ${asc ? "ascending" : "descending"} order.`,
        prompt: `Put these in order from ${asc ? "smallest to largest" : "largest to smallest"}: ${nums.join(", ")}`,
        visual: (
          <div className="p-2 rounded-lg bg-white border border-[#E6E8EC] space-y-1.5">
            <div className="flex gap-1.5 flex-wrap">
              {nums.map((n, i) => <div key={i} className="px-2 py-1.5 rounded-md bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700">{n}</div>)}
            </div>
            <div className="text-[10px] font-bold text-teal-700">Answer: {sorted.join(" → ")}</div>
          </div>
        ),
        note: "Student drags tiles into the correct sequence.",
      };
    }

    case "number_line": {
      const isDecimal = max <= 1;
      const step   = typeof config.step === "number" ? config.step : 1;
      const target = isDecimal ? 0.6 : Math.round((min + max) / 2 / step) * step;
      const lMin   = isDecimal ? 0 : Math.floor(min / step) * step;
      const lMax   = isDecimal ? 1 : Math.ceil(max / step) * step;
      const pct    = Math.max(0, Math.min(100, ((target - lMin) / (lMax - lMin)) * 100));
      const modeLabel = mode === "rounding" ? "Round to nearest" : mode === "estimate" ? "Estimate position" : "Place on number line";
      return {
        label: `Number line — ${modeLabel}`,
        description: mode === "rounding" ? "Round a number to the nearest given place." : "Drag a marker to the correct position on the number line.",
        prompt: mode === "rounding" ? `Round ${target.toLocaleString()} to the nearest ${step.toLocaleString()}.` : `Place ${target.toLocaleString()} on the number line.`,
        visual: (
          <div className="p-3 rounded-lg bg-white border border-[#E6E8EC]">
            <div className="relative h-2 bg-slate-200 rounded-full mx-2">
              <div className="absolute -top-1.5 h-5 w-5 rounded-full bg-teal-500 border-2 border-white shadow -translate-x-1/2" style={{ left: `${pct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-2">
              <span>{lMin.toLocaleString()}</span>
              <span>{Math.round((lMin + lMax) / 2).toLocaleString()}</span>
              <span>{lMax.toLocaleString()}</span>
            </div>
          </div>
        ),
        note: "Student drags the marker to the target position.",
      };
    }

    case "number_line_place": {
      if (mode === "place_fraction" || mode === "order_compare_fractions") {
        return {
          label: "Fraction on number line",
          description: "Drag a fraction to its correct position on a 0–1 number line.",
          prompt: `Place 3/${den} on the number line.`,
          visual: (
            <div className="p-3 rounded-lg bg-white border border-[#E6E8EC]">
              <div className="relative h-2 bg-slate-200 rounded-full mx-2">
                <div className="absolute -top-1.5 h-5 w-5 rounded-full bg-teal-500 border-2 border-white shadow -translate-x-1/2" style={{ left: `${(3 / den) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-2">
                <span>0</span><span>1/{den}</span><span>2/{den}</span><span>1</span>
              </div>
            </div>
          ),
          note: "Tick marks show equal parts. Student taps or drags to the correct spot.",
        };
      }
      if (mode === "skip_count_fraction") {
        return {
          label: "Skip count by fractions",
          description: `Fill in the missing fraction counting by 1/${den}s.`,
          prompt: `Count by 1/${den}s: 1/${den}, 2/${den}, ___, 4/${den}`,
          options: [`3/${den}`, `2/${den}`, `5/${den}`, `1/${den - 1 || 1}`],
          correct: `3/${den}`,
          note: "Student identifies the pattern and picks the missing fraction.",
        };
      }
      if (mode === "mixed_numerals") {
        return {
          label: "Mixed numerals on number line",
          description: "Place a mixed numeral in its correct position.",
          prompt: `Place 2 and 3/${den} on the number line between 2 and 3.`,
          visual: (
            <div className="p-3 rounded-lg bg-white border border-[#E6E8EC]">
              <div className="relative h-2 bg-slate-200 rounded-full mx-2">
                <div className="absolute -top-1.5 h-5 w-5 rounded-full bg-teal-500 border-2 border-white shadow -translate-x-1/2" style={{ left: `${(3 / den) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-2">
                <span>2</span><span>2½</span><span>3</span>
              </div>
            </div>
          ),
          note: "Tests that students understand mixed numerals sit between whole numbers.",
        };
      }
      return {
        label: "Read a point on number line",
        description: "Name the fraction shown by a marked point.",
        prompt: "What fraction does the arrow point to?",
        options: [`1/${den}`, `2/${den}`, `3/${den}`, `4/${den}`],
        correct: `3/${den}`,
        note: "Student reads the position of the dot relative to the tick marks.",
      };
    }

    case "odd_even_sort": {
      const numSet = [1204, 3871, 5560, 9043, 2208, 7775];
      if (mode === "odd_even_sums") {
        return {
          label: "Odd/even — sums",
          description: "Predict whether a sum will be odd or even without calculating.",
          prompt: "Is 14 + 7 odd or even?",
          options: ["Odd", "Even"],
          correct: "Odd",
          note: "Even + odd = odd. Students apply the rule, not compute the answer.",
        };
      }
      if (mode === "odd_even_products") {
        return {
          label: "Odd/even — products",
          description: "Predict whether a product will be odd or even.",
          prompt: "Is 4 × 6 odd or even?",
          options: ["Even", "Odd"],
          correct: "Even",
          note: "Even × anything = even.",
        };
      }
      return {
        label: "Sort odd & even",
        description: "Sort large numbers by tapping them into the correct group.",
        prompt: "Sort these into Odd and Even:",
        visual: (
          <div className="p-2 rounded-lg bg-white border border-[#E6E8EC]">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {numSet.map((n, i) => (
                <div key={i} className={`px-2 py-1 rounded-md text-xs font-bold ${n % 2 === 0 ? "bg-teal-50 border border-teal-200 text-teal-700" : "bg-rose-50 border border-rose-200 text-rose-700"}`}>
                  {n.toLocaleString()}
                </div>
              ))}
            </div>
            <div className="text-[10px] font-bold text-slate-400">Teal = Even · Rose = Odd</div>
          </div>
        ),
        note: "Last digit determines odd/even — strategy applies to any size number.",
      };
    }

    case "equal_groups": {
      const maxG = typeof config.maxGroups === "number" ? config.maxGroups : 6;
      const maxI = typeof config.maxItemsPerGroup === "number" ? config.maxItemsPerGroup : 5;
      const g = Math.min(4, maxG), perG = Math.min(4, maxI);
      return {
        label: "Equal groups",
        description: "Count equal groups to find the total.",
        prompt: `There are ${g} groups of ${perG}. How many altogether?`,
        visual: (
          <div className="flex gap-2 p-2 rounded-lg bg-white border border-[#E6E8EC]">
            {Array.from({ length: g }).map((_, gi) => (
              <div key={gi} className="flex flex-col gap-0.5 rounded-md border border-slate-200 p-1.5">
                {Array.from({ length: perG }).map((_, ci) => <div key={ci} className="h-3 w-3 rounded-full bg-teal-500" />)}
              </div>
            ))}
          </div>
        ),
        options: [String(g * perG - g), String(g * perG), String(g + perG), String(g * perG + 2)],
        correct: String(g * perG),
        note: `${g} × ${perG} = ${g * perG}. Visual groups build the multiplication concept.`,
      };
    }

    case "arrays": {
      const maxR = typeof config.maxRows === "number" ? config.maxRows : 5;
      const maxC = typeof config.maxColumns === "number" ? config.maxColumns : 6;
      const r = Math.min(3, maxR), c = Math.min(4, maxC);
      return {
        label: "Arrays",
        description: "Count rows × columns to find the product.",
        prompt: `How many dots in this ${r}×${c} array?`,
        visual: (
          <div className="p-2 rounded-lg bg-white border border-[#E6E8EC] w-fit">
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${c}, 1fr)` }}>
              {Array.from({ length: r * c }).map((_, i) => <div key={i} className="h-4 w-4 rounded-full bg-teal-500" />)}
            </div>
          </div>
        ),
        options: [String(r * c - 2), String(r * c), String(r * c + 2), String(r * c + r)],
        correct: String(r * c),
        note: `${r} rows × ${c} cols = ${r * c}. Reading both ways shows commutativity.`,
      };
    }

    case "skip_count": {
      const step = typeof config.step === "number" ? config.step : 7;
      return {
        label: `Skip count by ${step}s`,
        description: `Count forward in equal jumps of ${step}.`,
        prompt: `Fill in the blank: ${step}, ${step * 2}, ___, ${step * 4}`,
        options: [String(step * 3), String(step * 3 - 1), String(step * 3 + step), String(step * 2 + 1)],
        correct: String(step * 3),
        note: `Builds times-table fluency for the ${step}s.`,
      };
    }

    case "fact_family": {
      const a = 7, b = 8, c = a * b;
      return {
        label: "Fact family",
        description: "Complete all four related multiplication and division facts.",
        prompt: `Numbers: ${a}, ${b}, ${c}. Write the complete fact family.`,
        visual: (
          <div className="grid grid-cols-2 gap-1 p-2 rounded-lg bg-white border border-[#E6E8EC] text-xs font-bold text-[#0F172A]">
            <div>{a} × {b} = {c}</div>
            <div>{b} × {a} = {c}</div>
            <div>{c} ÷ {a} = {b}</div>
            <div>{c} ÷ {b} = {a}</div>
          </div>
        ),
        note: "Tap to complete each missing value. Links × and ÷ in one set.",
      };
    }

    case "division_groups": {
      if (mode === "sharing") {
        return {
          label: "Division — sharing",
          description: "Share a total equally into a given number of groups.",
          prompt: "Share 24 equally into 4 groups. How many in each group?",
          options: ["5", "6", "7", "8"],
          correct: "6",
          note: "24 ÷ 4 = 6. Items are distributed one-by-one into equal groups.",
        };
      }
      return {
        label: "Division — grouping",
        description: "Find how many equal-sized groups can be made from a total.",
        prompt: "How many groups of 6 can you make from 30?",
        options: ["4", "5", "6", "7"],
        correct: "5",
        note: "30 ÷ 6 = 5. Circles fill up to show grouping.",
      };
    }

    case "addition_strategy": {
      const modeLabels: Record<string, string> = {
        doubles: "doubles", near_doubles: "near doubles", split: "split strategy",
        friendly_numbers: "friendly numbers", compensation: "compensation",
      };
      const a = min >= 1000 ? 4736 : min >= 100 ? 347 : 64;
      const b = min >= 1000 ? 2958 : min >= 100 ? 285 : 27;
      return {
        label: `Addition — ${modeLabels[mode] ?? "mental strategy"}`,
        description: `Add using the ${modeLabels[mode] ?? "most efficient"} strategy.`,
        prompt: `Work out ${a.toLocaleString()} + ${b.toLocaleString()}`,
        options: [String(a + b - 10), String(a + b), String(a + b + 100), String(a + b - 1)],
        correct: String(a + b),
        note: `Students choose their strategy and explain their reasoning.`,
      };
    }

    case "subtraction_strategy": {
      const modeLabels: Record<string, string> = {
        jump: "jump strategy", split: "split strategy",
        fact_strategy: "known fact strategy", compensation: "compensation",
      };
      const a = min >= 1000 ? 7003 : min >= 100 ? 503 : 82;
      const b = min >= 1000 ? 2458 : min >= 100 ? 278 : 37;
      return {
        label: `Subtraction — ${modeLabels[mode] ?? "mental strategy"}`,
        description: `Subtract using the ${modeLabels[mode] ?? "most efficient"} strategy.`,
        prompt: `Work out ${a.toLocaleString()} − ${b.toLocaleString()}`,
        options: [String(a - b + 10), String(a - b - 1), String(a - b), String(a - b + 100)],
        correct: String(a - b),
        note: "Students show their working then check with the inverse operation.",
      };
    }

    case "mixed_word_problem": {
      if (mode === "budgeting") {
        return {
          label: "Word problem — budgeting",
          description: "Multi-step money problem set in a real-world context.",
          prompt: "You have $50. You spend $12.50 on lunch and $18 on a book. How much is left?",
          options: ["$18.50", "$19.50", "$20.50", "$21.50"],
          correct: "$19.50",
          note: "$12.50 + $18 = $30.50. $50 − $30.50 = $19.50.",
        };
      }
      if (mode === "shop_transactions") {
        return {
          label: "Word problem — shop",
          description: "Multiply to find a total cost, then calculate change.",
          prompt: "4 drinks cost $3.50 each. You pay with $20. How much change?",
          options: ["$5", "$6", "$6.50", "$7"],
          correct: "$6",
          note: "4 × $3.50 = $14. Change = $20 − $14 = $6.",
        };
      }
      return {
        label: "Word problem — two steps",
        description: "Solve a problem requiring two separate operations.",
        prompt: "28 students split into groups of 4, then 2 groups finish early and leave. How many groups remain?",
        options: ["3", "5", "7", "9"],
        correct: "5",
        note: "28 ÷ 4 = 7 groups. 7 − 2 = 5.",
      };
    }

    case "fraction_compare": {
      if (mode === "greater_less_visual") {
        return {
          label: "Compare fractions — visual",
          description: "Use shaded bar models to decide which fraction is larger.",
          prompt: "Which is greater: 3/4 or 5/8?",
          visual: (
            <div className="flex gap-3 p-2 rounded-lg bg-white border border-[#E6E8EC]">
              <FractionBar label="3/4" filled={3} total={4} />
              <FractionBar label="5/8" filled={5} total={8} />
            </div>
          ),
          options: ["3/4", "5/8", "They're equal"],
          correct: "3/4",
          note: "Equal-length bars — student sees which shaded area is larger.",
        };
      }
      return {
        label: "Compare fractions — equivalence",
        description: "Convert to a common denominator to compare.",
        prompt: "Which is greater: 2/3 or 3/4?",
        options: ["2/3", "3/4", "They're equal"],
        correct: "3/4",
        note: "2/3 = 8/12, 3/4 = 9/12. So 3/4 > 2/3.",
      };
    }

    case "area_model_select": {
      if (mode === "pick_model") {
        return {
          label: "Area model — pick the fraction",
          description: "Choose the shaded shape that correctly represents the fraction.",
          prompt: `Which model shows 3/${den}?`,
          visual: <FractionBarGrid den={den} correct={3} />,
          note: "Student taps the model with the right number of shaded parts.",
        };
      }
      return {
        label: "Area model — match equivalent",
        description: "Pair area models that represent the same fraction.",
        prompt: "Match the fractions that are equivalent.",
        visual: (
          <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-white border border-[#E6E8EC]">
            <FractionBar label="1/2" filled={1} total={2} />
            <FractionBar label="2/4" filled={2} total={4} />
            <FractionBar label="3/4" filled={3} total={4} />
            <FractionBar label="6/8" filled={6} total={8} />
          </div>
        ),
        note: "1/2 ↔ 2/4 and 3/4 ↔ 6/8. Shaded areas look identical.",
      };
    }

    case "equivalent_fraction_build": {
      return {
        label: "Build equivalent fractions",
        description: "Find the missing numerator or denominator.",
        prompt: `Complete: 2/4 = ?/${den}`,
        options: [String(den / 2), String(den), String(den * 2), "2"],
        correct: String(den / 2),
        note: "Multiply both numerator and denominator by the same factor.",
      };
    }

    case "equivalent_fraction_match": {
      return {
        label: "Match equivalent fractions",
        description: "Drag pairs of fractions that represent the same amount.",
        prompt: "Match each fraction to its equivalent.",
        visual: (
          <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-white border border-[#E6E8EC] text-sm font-black text-center">
            {[["1/2","2/4"],["3/4","6/8"],["1/3","2/6"]].map(([a, b], i) => (
              <>
                <div key={`a${i}`} className="rounded-md bg-teal-50 border border-teal-200 text-teal-800 px-2 py-1.5">{a}</div>
                <div key={`b${i}`} className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-1.5">{b}</div>
              </>
            ))}
          </div>
        ),
        note: "Drag lines to connect matching fractions.",
      };
    }

    case "equivalent_fraction_yes_no": {
      return {
        label: "Equivalent? Yes or No",
        description: "Decide quickly whether two fractions are equivalent.",
        prompt: "Are 3/6 and 1/2 equivalent?",
        options: ["Yes", "No"],
        correct: "Yes",
        note: "3/6 simplifies to 1/2. Quick-fire rounds build fluency.",
      };
    }

    case "fraction_decimal_percent_match": {
      return {
        label: "Fraction ↔ Decimal ↔ Percent",
        description: "Match three equivalent representations of the same amount.",
        prompt: "Match: 1/2 = ? = ?",
        visual: (
          <div className="grid grid-cols-3 gap-1 p-2 rounded-lg bg-white border border-[#E6E8EC] text-center text-sm font-black">
            <div className="rounded-md bg-teal-50 border border-teal-200 text-teal-800 py-2">1/2</div>
            <div className="rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 py-2">0.5</div>
            <div className="rounded-md bg-violet-50 border border-violet-200 text-violet-800 py-2">50%</div>
          </div>
        ),
        note: "Progresses to harder values like 3/8 = 0.375 = 37.5%.",
      };
    }

    case "benchmark_sort": {
      return {
        label: "Sort by benchmark",
        description: "Group fractions by whether they are closer to 0, 1/2, or 1.",
        prompt: "Sort: 1/8, 3/4, 5/9, 1/3",
        visual: (
          <div className="grid grid-cols-3 gap-1.5 p-2 rounded-lg bg-white border border-[#E6E8EC] text-xs font-bold text-center">
            <div className="rounded-md bg-rose-50 border border-rose-200 text-rose-700 p-1.5">Near 0<br /><span className="font-extrabold">1/8</span></div>
            <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-700 p-1.5">Near ½<br /><span className="font-extrabold">5/9, 1/3</span></div>
            <div className="rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 p-1.5">Near 1<br /><span className="font-extrabold">3/4</span></div>
          </div>
        ),
        note: "Uses number sense — no need to convert, just reason about size.",
      };
    }

    case "set_model_select": {
      return {
        label: "Set model",
        description: "Choose the group of objects that shows the fraction.",
        prompt: "Which group shows 2/5 shaded?",
        visual: (
          <div className="flex gap-3 p-2 rounded-lg bg-white border border-[#E6E8EC]">
            {[2, 3, 4].map((filled) => (
              <div key={filled} className={`rounded-md border p-1.5 ${filled === 2 ? "border-teal-300 bg-teal-50 ring-1 ring-teal-200" : "border-slate-200"}`}>
                <div className="flex gap-0.5 mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={`h-4 w-4 rounded-full ${i < filled ? "bg-teal-500" : "bg-slate-200"}`} />
                  ))}
                </div>
                <div className="text-center text-[10px] font-bold text-slate-500">{filled}/5</div>
              </div>
            ))}
          </div>
        ),
        note: "Student taps the group with exactly the right number filled.",
      };
    }

    case "build_the_whole": {
      return {
        label: "Build the whole",
        description: "Given a fraction piece, identify what the whole looks like.",
        prompt: "This strip shows 1/3. How long is the whole strip?",
        visual: (
          <div className="flex gap-0.5 p-2 rounded-lg bg-white border border-[#E6E8EC]">
            <div className="h-8 rounded-sm bg-teal-400 border border-teal-500 flex-1" />
            <div className="h-8 rounded-sm bg-slate-100 border border-dashed border-slate-300 flex-1" />
            <div className="h-8 rounded-sm bg-slate-100 border border-dashed border-slate-300 flex-1" />
          </div>
        ),
        note: "Reinforces inverse thinking — if this is 1/3, there must be 3 equal parts.",
      };
    }

    case "multiple_choice": {
      const m = mode.toLowerCase();
      const src = typeof config.sourceActivityType === "string" ? config.sourceActivityType : "";
      const topicEx = topicExampleFromMode(m || src, min, max);
      return {
        label: `Multiple choice${topicEx.tag ? ` — ${topicEx.tag}` : ""}`,
        description: topicEx.description || "Choose the correct answer from four options.",
        prompt: topicEx.prompt,
        options: topicEx.options,
        correct: topicEx.correct,
        note: "4-option card. Wrong answers shake; correct answers award XP.",
      };
    }

    case "typed_response": {
      const m = mode.toLowerCase();
      const src = typeof config.sourceActivityType === "string" ? config.sourceActivityType : "";
      const topicEx = topicExampleFromMode(m || src, min, max);
      return {
        label: `Type your answer${topicEx.tag ? ` — ${topicEx.tag}` : ""}`,
        description: topicEx.description || "Work out the answer and type it using the number pad.",
        prompt: topicEx.prompt,
        options: topicEx.options,
        correct: topicEx.correct,
        note: "No multiple choice — student must recall the answer. Instant feedback on submit.",
      };
    }

    default:
      return {
        label: "Practice activity",
        description: "Interactive questions tied to the lesson focus.",
        prompt: "Complete the question shown on screen.",
        note: "Multiple question styles rotate to build fluency.",
      };
  }
}

function FractionBar({ label, filled, total }: { label: string; filled: number; total: number }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex gap-0.5 mb-1">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`h-6 flex-1 rounded-sm border ${i < filled ? "bg-teal-400 border-teal-500" : "bg-slate-100 border-slate-300"}`} />
        ))}
      </div>
      <div className="text-center text-[10px] font-extrabold text-slate-600">{label}</div>
    </div>
  );
}

function FractionBarGrid({ den, correct }: { den: number; correct: number }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-white border border-[#E6E8EC]">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className={`rounded-md border p-1.5 ${n === correct ? "border-teal-300 bg-teal-50 ring-1 ring-teal-200" : "border-slate-200"}`}>
          <div className="flex gap-0.5 mb-0.5">
            {Array.from({ length: den }).map((_, i) => (
              <div key={i} className={`h-5 flex-1 rounded-sm ${i < n ? "bg-teal-400" : "bg-slate-100"}`} />
            ))}
          </div>
          <div className="text-center text-[10px] font-bold text-slate-600">{n}/{den}</div>
        </div>
      ))}
    </div>
  );
}

function MabVisual({ number, places }: { number: number; places: string[] }) {
  const placeInfo: Record<string, { label: string; getValue: (n: number) => number; color: string }> = {
    hundred_thousands: { label: "HTh", getValue: (n) => Math.floor(n / 100000) % 10, color: "bg-purple-400" },
    ten_thousands:     { label: "TTh", getValue: (n) => Math.floor(n / 10000) % 10,  color: "bg-indigo-400" },
    thousands:         { label: "Th",  getValue: (n) => Math.floor(n / 1000) % 10,   color: "bg-blue-400"   },
    hundreds:          { label: "H",   getValue: (n) => Math.floor(n / 100) % 10,    color: "bg-teal-400"   },
    tens:              { label: "T",   getValue: (n) => Math.floor(n / 10) % 10,     color: "bg-emerald-400"},
    ones:              { label: "O",   getValue: (n) => n % 10,                      color: "bg-amber-400"  },
  };
  return (
    <div className="flex gap-3 p-2 rounded-lg bg-white border border-[#E6E8EC] overflow-x-auto">
      {places.map((p) => {
        const info = placeInfo[p];
        if (!info) return null;
        const count = info.getValue(number);
        return (
          <div key={p} className="flex flex-col items-center gap-1 min-w-[28px]">
            <div className="text-[9px] font-extrabold text-slate-400 uppercase">{info.label}</div>
            <div className="flex flex-col gap-0.5">
              {Array.from({ length: count || 1 }).map((_, i) => (
                <div key={i} className={`h-3 w-6 rounded-sm ${count > 0 ? info.color : "bg-slate-100 border border-dashed border-slate-300"}`} />
              ))}
            </div>
            <div className="text-xs font-black text-slate-700">{count}</div>
          </div>
        );
      })}
    </div>
  );
}

function statusTone(s: LessonPreviewStudent["status"]) {
  switch (s) {
    case "Completed":   return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "In Progress": return "bg-amber-50 text-amber-700 border-amber-200";
    default:            return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

export default function LessonPreviewDrawer({
  open, onClose, lesson, weekTopic, weekNumber, strand, realm, yearLabel,
  isPlaceholder, student, classStats,
}: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !lesson) return null;

  const ideas = (lesson.activityIdeas?.length ? lesson.activityIdeas : ["Activity 1", "Activity 2", "Activity 3"]).slice(0, 3);
  while (ideas.length < 3) ideas.push("Mixed practice");

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Lesson preview">
      {/* Backdrop */}
      <button
        aria-label="Close lesson preview"
        onClick={onClose}
        className="flex-1 bg-[#0F172A]/40 backdrop-blur-[2px]"
      />

      {/* Drawer */}
      <aside className="w-full max-w-[560px] h-full bg-white shadow-2xl border-l border-[#E6E8EC] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E6E8EC] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] font-extrabold text-teal-700 uppercase tracking-[0.14em]">
              {strand ?? "Lesson"}{realm ? ` · ${realm}` : ""}
            </div>
            <div className="text-base font-black text-[#0F172A] mt-0.5 truncate">
              {weekNumber ? `Week ${weekNumber} · L${lesson.lesson} — ` : ""}{lesson.title}
            </div>
            <div className="text-[11px] font-semibold text-[#64748B] mt-0.5">
              {yearLabel ? `${yearLabel} · ` : ""}{weekTopic ?? ""}
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-[#E6E8EC] text-[#64748B] hover:bg-[#F8FAFC] text-sm font-bold shrink-0"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {isPlaceholder && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800">
              Curriculum content for this strand is coming soon. The preview below is a placeholder.
            </div>
          )}

          {/* Meta tiles */}
          <div className="grid grid-cols-3 gap-2">
            <Meta label="XP" value={`${DEFAULT_LESSON_XP}`} />
            <Meta label="Time" value={`~${ESTIMATED_MINUTES} min`} />
            <Meta label="Curriculum" value={(lesson.curriculum?.[0] ?? "—").toString()} />
          </div>

          {/* Learning goal */}
          <Section title="Learning goal">
            <p className="text-sm text-[#0F172A] leading-relaxed font-semibold">
              Students will <span className="lowercase">{lesson.title.replace(/\.$/, "")}</span>.
            </p>
            <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">{lesson.focus}</p>
          </Section>

          {/* What the student will see */}
          <Section title="What the student will see">
            <ul className="space-y-1.5 text-xs text-[#0F172A]">
              <Bullet>Lesson intro screen with the title <b>“{lesson.title}”</b> and a short motivation.</Bullet>
              <Bullet>An optional intro video/animation introducing the concept.</Bullet>
              <Bullet>An <b>9-minute timed practice</b> rotating through 3 activity types.</Bullet>
              <Bullet>Difficulty ramps over the session: Easy → Medium → Hard.</Bullet>
              <Bullet>Instant feedback after every answer with XP and progress updates.</Bullet>
            </ul>
          </Section>

          {/* Activity breakdown */}
          {lesson.activities?.length ? (
            <Section title={`Activity breakdown (${lesson.activities.length} question types)`}>
              <div className="space-y-2">
                {lesson.activities.map((act, i) => {
                  const isOpen = openIdx === i;
                  const preview = activityPreviewData(act.activityType, act.config as Record<string, unknown>);
                  return (
                    <div key={i} className="rounded-xl border border-[#E6E8EC] bg-[#FAFBFC] overflow-hidden">
                      <button
                        onClick={() => setOpenIdx(isOpen ? null : i)}
                        className="w-full text-left p-3 hover:bg-white transition-colors"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-teal-50 text-teal-700 text-[11px] font-black">
                            {i + 1}
                          </span>
                          <span className="text-sm font-bold text-[#0F172A] flex-1">{preview.label}</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-extrabold text-slate-500 uppercase tracking-wider shrink-0">
                            wt {act.weight}
                          </span>
                          <span className="text-[11px] font-bold text-teal-700 shrink-0">{isOpen ? "Hide ▴" : "See example ▾"}</span>
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-1 leading-relaxed pl-8">
                          {preview.description}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="border-t border-[#E6E8EC] bg-white px-3 py-3 space-y-2.5">
                          <div className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider">Example question</div>
                          <div className="text-sm font-semibold text-[#0F172A]">{preview.prompt}</div>
                          {preview.visual && <div>{preview.visual}</div>}
                          {preview.options && (
                            <div className="grid grid-cols-2 gap-1.5">
                              {preview.options.map((opt) => {
                                const isCorrect = opt === preview.correct;
                                return (
                                  <div key={opt} className={`rounded-lg border px-2.5 py-2 text-xs font-bold ${isCorrect ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-white border-[#E6E8EC] text-[#0F172A]"}`}>
                                    {opt}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          <div className="text-[11px] text-[#64748B] italic leading-relaxed">{preview.note}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          ) : (
            <Section title="Activity breakdown (3 rotations)">
              <div className="space-y-2">
                {ideas.map((idea, i) => {
                  const isOpen = openIdx === i;
                  const ex = exampleForActivity(idea);
                  return (
                    <div key={i} className="rounded-xl border border-[#E6E8EC] bg-[#FAFBFC] overflow-hidden">
                      <button
                        onClick={() => setOpenIdx(isOpen ? null : i)}
                        className="w-full text-left p-3 hover:bg-white transition-colors"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-teal-50 text-teal-700 text-[11px] font-black">
                            {i + 1}
                          </span>
                          <span className="text-sm font-bold text-[#0F172A] flex-1">{idea}</span>
                          <span className="text-[11px] font-bold text-teal-700">{isOpen ? "Hide example ▴" : "See example ▾"}</span>
                        </div>
                        <div className="text-[11px] text-[#64748B] mt-1 leading-relaxed pl-8">
                          {describeActivity(idea)}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="border-t border-[#E6E8EC] bg-white px-3 py-3 space-y-2.5">
                          <div className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider">Example question</div>
                          <div className="text-sm font-semibold text-[#0F172A]">{ex.prompt}</div>
                          {ex.visual && <div>{ex.visual}</div>}
                          {ex.options && (
                            <div className="grid grid-cols-2 gap-1.5">
                              {ex.options.map((opt) => {
                                const isCorrect = opt === ex.correct;
                                return (
                                  <div key={opt} className={`flex items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-bold ${isCorrect ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-white border-[#E6E8EC] text-[#0F172A]"}`}>
                                    {opt}{isCorrect ? <Check className="h-3.5 w-3.5" /> : null}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          <div className="text-[11px] text-[#64748B] italic leading-relaxed">{ex.note}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Student-specific progress */}
          {student && (
            <Section title={`${student.display_name}\u2019s progress`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-wider ${statusTone(student.status)}`}>
                  {student.status}
                </span>
                {student.quizPercent != null && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-extrabold uppercase tracking-wider ${
                    student.quizPassed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}>
                    Quiz {student.quizPercent}% {student.quizPassed ? "Pass" : "Fail"}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Meta label="Attempts" value={String(student.attempts ?? 0)} />
                <Meta label="Time spent" value={student.timeSpent ?? "n/a"} />
                <Meta label="Accuracy" value={student.accuracy != null ? `${student.accuracy}%` : "n/a"} />
              </div>
              {student.aiInsight ? (
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-[#E6E8EC] bg-white px-3 py-2.5">
                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#94A3B8]">Status</div>
                      <div className="mt-0.5 text-xs font-black text-[#0F172A]">{student.aiInsight.status}</div>
                    </div>
                    <div className="rounded-xl border border-[#E6E8EC] bg-white px-3 py-2.5">
                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#94A3B8]">Strongest Skill</div>
                      <div className="mt-0.5 text-xs font-black text-emerald-700">{student.aiInsight.strongestSkill}</div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5">
                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-rose-400">Needs Support</div>
                    <div className="mt-0.5 text-xs font-bold text-rose-900">{student.aiInsight.needsSupport}</div>
                  </div>
                  <div className="rounded-xl bg-[#0F172A] px-3 py-2.5">
                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Teacher Action</div>
                    <div className="mt-1 text-xs font-bold text-white leading-relaxed">{student.aiInsight.teacherAction}</div>
                  </div>
                </div>
              ) : null}
            </Section>
          )}

          {/* Class-wide stats */}
          {classStats && (
            <Section title="Class progress on this lesson">
              <div className="grid grid-cols-3 gap-2 mb-2">
                <Meta label="Done" value={`${classStats.completed}/${classStats.studentCount}`} />
                <Meta label="In progress" value={String(classStats.inProgress)} />
                <Meta label="Not started" value={String(classStats.notStarted)} />
              </div>
              {classStats.quizAvg != null && (
                <div className="text-xs text-[#64748B]">
                  Quiz accuracy on this lesson&apos;s questions:{" "}
                  <b className={
                    (classStats.quizAttempts ?? 0) === 0 ? "text-[#94A3B8]" :
                    (classStats.quizAvg ?? 0) >= 80 ? "text-emerald-700" :
                    (classStats.quizAvg ?? 0) >= 60 ? "text-amber-700" : "text-rose-700"
                  }>
                    {(classStats.quizAttempts ?? 0) === 0 ? "—" : `${classStats.quizAvg}%`}
                  </b>{" "}
                  <span className="text-[#94A3B8]">({classStats.quizAttempts ?? 0} attempt{classStats.quizAttempts === 1 ? "" : "s"})</span>
                </div>
              )}
            </Section>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-[#E6E8EC] bg-[#FAFBFC] flex flex-wrap items-center justify-end gap-2">
          <button
            disabled
            title="Coming soon"
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E6E8EC] text-[#64748B] text-xs font-bold cursor-not-allowed"
          >
            Recommend revisit
          </button>
          <button
            disabled
            title="Coming soon"
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E6E8EC] text-[#64748B] text-xs font-bold cursor-not-allowed"
          >
            Preview student view
          </button>
          <button
            disabled
            title="Coming soon"
            className="px-3 py-1.5 rounded-lg bg-[#0F172A] text-white text-xs font-bold opacity-50 cursor-not-allowed"
          >
            Assign lesson
          </button>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-extrabold text-[#94A3B8] uppercase tracking-[0.12em] mb-2">{title}</div>
      {children}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#E6E8EC] bg-white px-2.5 py-2">
      <div className="text-[9px] font-extrabold text-[#94A3B8] uppercase tracking-wider">{label}</div>
      <div className="text-xs font-black text-[#0F172A] mt-0.5 truncate">{value}</div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}

