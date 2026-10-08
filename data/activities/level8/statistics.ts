import type { Cave7Visual } from "@/data/activities/cave7/shared";
import {
  fraction,
  random,
  rounded,
  table,
  type LessonFactory,
  type QuestionDraft,
} from "./shared";

// Year 8 Statistics (AC9M8ST01–ST04), modelled on the Year 8 textbook coverage of
// surveying and sampling, frequency tables and graphs, and measures of centre and spread.
type R = (min: number, max: number) => number;
type Form = (r: R) => QuestionDraft;
const pick = <T,>(r: R, xs: readonly T[]) => xs[r(0, xs.length - 1)];
const tidy = (t: string) => t.replace(/(^|[\s(=,])-(\d)/g, "$1−$2");
const forms = (seed: number, list: Form[]) => {
  const r = random(seed), q = list[r(0, list.length - 1)](r);
  return { ...q, prompt: tidy(q.prompt), steps: q.steps.map(tidy) };
};
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);
const median = (xs: number[]) => {
  const s = sorted(xs), m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const range = (xs: number[]) => Math.max(...xs) - Math.min(...xs);
const list = (r: R, n: number, lo: number, hi: number) => Array.from({ length: n }, () => r(lo, hi));
/** n values in [lo, hi] whose mean is a whole number. */
function wholeMean(r: R, n: number, lo: number, hi: number) {
  for (;;) {
    const xs = list(r, n - 1, lo, hi), need = (n - (sum(xs) % n)) % n;
    const options = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter((v) => v % n === need);
    if (options.length) return [...xs, pick(r, options)];
  }
}
const counts = (xs: number[], min: number, max: number) => Array.from({ length: max - min + 1 }, (_, i) => xs.filter((x) => x === min + i).length);
const dataVisual = (title: string, values: number[], unit = ""): Cave7Visual => ({ kind: "data", title, values, unit });
const dots = (title: string, unit: string, min: number, max: number, groups: { label?: string; values: number[] }[]): Cave7Visual => ({ kind: "dotplot", title, unit, min, max, groups });
const freqGraph = (title: string, values: number[], cs: number[], unit: string): Cave7Visual => ({ kind: "frequency", title, values, counts: cs, unit });
const yesNo = (prompt: string, yes: boolean, steps: string[], more: Partial<QuestionDraft> = {}): QuestionDraft => ({ prompt, answer: yes ? "Yes" : "No", steps, ...more });
const pct = (a: number, b: number) => rounded((100 * a) / b, 1);
const TOPICS = ["travel to school", "screen time", "sleep", "lunch choices", "sport", "pocket money"] as const;
const NAMES = ["Ari", "Bea", "Cal", "Dev", "Eli", "Fay", "Gus", "Hana", "Isla", "Jai"] as const;
const METHODS = ["Simple random", "Systematic", "Stratified", "Cluster", "Convenience"] as const;

/* ---------- Week 1: how should we collect data? ---------- */
const CENSUS_OR_SAMPLE: [string, "Census" | "Sample", string][] = [
  ["A car maker crash-tests its new cars for safety.", "Sample", "Crash-testing destroys the car, so only some can be tested."],
  ["A teacher records the favourite sport of every student in a class of 26.", "Census", "The population is small and easy to ask in full."],
  ["A TV network estimates how many Australians watched a final.", "Sample", "Asking every Australian would be far too slow and costly."],
  ["A factory measures how long its light globes last before failing.", "Sample", "Testing until failure destroys the globe."],
  ["A club of 15 members votes on a new uniform.", "Census", "Every member's view is needed and the group is small."],
  ["A council checks water quality in a large reservoir.", "Sample", "Only small amounts of water can be tested."],
  ["A school records the attendance of every student each day.", "Census", "Attendance is needed for every student, not an estimate."],
];
const censusOrSample: Form[] = [
  (r) => {
    const [text, answer, why] = pick(r, CENSUS_OR_SAMPLE);
    return { prompt: `${text} Is a census or a sample more appropriate?`, answer, steps: ["A census collects data from the whole population; a sample uses part of it.", why] };
  },
  (r) => {
    const cost = r(2, 9), pop = 100 * r(20, 90), n = 10 * r(5, 30);
    return { prompt: `Each survey costs $${cost} to run. How much is saved by surveying a sample of ${n} instead of all ${pop} people?`, answer: cost * (pop - n), unit: "$", steps: [`Census: ${pop} × $${cost} = $${pop * cost}. Sample: ${n} × $${cost} = $${n * cost}.`, `Saving: $${cost * (pop - n)}.`] };
  },
  (r) => {
    const mins = pick(r, [2, 3, 4, 5, 6]), pop = 60 * r(5, 20);
    return { prompt: `Each interview takes ${mins} minutes. How many hours would a census of ${pop} people take?`, answer: (pop * mins) / 60, unit: "hours", steps: [`${pop} × ${mins} = ${pop * mins} minutes.`, `${pop * mins} ÷ 60 = ${(pop * mins) / 60} hours.`] };
  },
  (r) => {
    const pop = 100 * r(4, 40), pctSampled = pick(r, [2, 4, 5, 10, 20, 25]);
    return { prompt: `A sample of ${(pop * pctSampled) / 100} is taken from a population of ${pop}. What percentage of the population is sampled?`, answer: pctSampled, unit: "%", steps: [`${(pop * pctSampled) / 100} ÷ ${pop} = ${pctSampled / 100}.`, `× 100 = ${pctSampled}%.`] };
  },
  (r) => {
    const made = 100 * r(10, 60), tested = 5 * r(6, 30), askPop = r(0, 1) === 1;
    return { prompt: `A factory makes ${made} batteries today and tests ${tested} of them. What is the ${askPop ? "population" : "sample"} size?`, answer: askPop ? made : tested, steps: ["The population is every battery the question is about; the sample is the batteries actually tested.", `${askPop ? "Population" : "Sample"} size: ${askPop ? made : tested}.`] };
  },
];
const EXPERIMENT_OR_OBSERVATION: [string, "Experiment" | "Observation", string][] = [
  ["Plants are randomly given different amounts of fertiliser and their growth is measured.", "Experiment", "The fertiliser amount is deliberately changed."],
  ["The number of birds visiting a park is counted each morning.", "Observation", "Nothing is changed; birds are only counted."],
  ["Students are randomly split into two groups; one group listens to music while studying.", "Experiment", "The researcher decides who listens to music."],
  ["Heights of students are recorded at the school nurse's office.", "Observation", "Heights are measured without changing anything."],
  ["Paper planes with different wing lengths are thrown and their flight distances recorded.", "Experiment", "Wing length is deliberately varied."],
  ["Traffic past the school gate is counted between 8 am and 9 am.", "Observation", "The traffic is recorded as it happens."],
];
const experimentObservation: Form[] = [
  (r) => {
    const [text, answer, why] = pick(r, EXPERIMENT_OR_OBSERVATION);
    return { prompt: `${text} Is this an experiment or an observation?`, answer, steps: ["An experiment deliberately changes a condition; an observation records what happens.", why] };
  },
  (r) => {
    const amounts = r(3, 5), per = r(4, 8);
    return { prompt: `An experiment tests ${amounts} different amounts of water, with ${per} plants for each amount. How many plants are needed?`, answer: amounts * per, unit: "plants", steps: ["Each treatment needs its own group of plants.", `${amounts} × ${per} = ${amounts * per}.`] };
  },
  (r) => {
    const control = pick(r, ["A", "B", "C"]), others = ["A", "B", "C"].filter((g) => g !== control);
    const rows = ["A", "B", "C"].map((g) => [g, g === control ? "No fertiliser" : g === others[0] ? "5 g fertiliser" : "10 g fertiliser"]);
    return { prompt: "Which group is the control group? Type its letter.", answer: control, input: "text", steps: ["The control group receives no treatment.", `Group ${control} receives no fertiliser.`], visual: table("Experiment groups", ["Group", "Treatment"], rows) };
  },
  (r) => {
    const fair = r(0, 1) === 1;
    return yesNo(fair ? "Two groups of seedlings get different light levels. Both are watered at the same time, in the same room, with the same soil. Is the comparison fair?" : "Group A is tested in the cool morning and Group B in the hot afternoon. Is the comparison of the groups fair?", fair, [fair ? "Only the light level differs between the groups." : "Temperature also differs, so it could bias the results.", fair ? "So the comparison is fair." : "Conditions must be kept the same except for the treatment."]);
  },
  (r) => {
    const control = r(20, 40), gain = r(3, 15);
    return { prompt: `Mean growth: control group ${control} mm, treated group ${control + gain} mm. How much more did the treated group grow on average?`, answer: gain, unit: "mm", steps: ["Subtract the control mean from the treated mean.", `${control + gain} − ${control} = ${gain} mm.`], visual: table("Experiment results", ["Group", "Mean growth (mm)"], [["Control", control], ["Treated", control + gain]]) };
  },
];
const practicalLimits: Form[] = [
  (r) => {
    const hours = r(2, 5), mins = pick(r, [3, 4, 5, 6, 7]);
    return { prompt: `You have ${hours} hours to survey people and each survey takes ${mins} minutes. What is the greatest number of people you can survey?`, answer: Math.floor((hours * 60) / mins), unit: "people", steps: [`${hours} hours = ${hours * 60} minutes.`, `${hours * 60} ÷ ${mins} = ${rounded((hours * 60) / mins, 2)}, so ${Math.floor((hours * 60) / mins)} people.`] };
  },
  (r) => {
    const budget = 50 * r(4, 20), cost = pick(r, [3, 4, 6, 7, 8, 9]);
    return { prompt: `A survey budget is $${budget} and each response costs $${cost}. What is the largest sample you can afford?`, answer: Math.floor(budget / cost), unit: "responses", steps: [`${budget} ÷ ${cost} = ${rounded(budget / cost, 2)}.`, `Round down: ${Math.floor(budget / cost)}.`] };
  },
  (r) => {
    const item = pick(r, ["the burn time of every candle it sells", "the strength of every rope by pulling until it snaps", "the taste of every biscuit it bakes"]);
    return yesNo(`Could a company use a census to test ${item}?`, false, ["Testing destroys or uses up each item.", "A census would leave nothing to sell, so a sample is used."]);
  },
  (r) => {
    const sent = 20 * r(10, 30), back = r(Math.round(sent * 0.3), Math.round(sent * 0.9));
    const rate = pct(back, sent);
    return { prompt: `A survey is sent to ${sent} people and ${back} reply. What is the response rate, to one decimal place?`, answer: rate, unit: "%", steps: [`${back} ÷ ${sent} × 100.`, `= ${rate}%. Non-responders may differ from responders.`] };
  },
  (r) => {
    const n1 = 10 * r(2, 6), t1 = r(1, 3), k = r(2, 4);
    return { prompt: `Surveying ${n1} people took ${t1} hour${t1 === 1 ? "" : "s"}. At the same rate, how many hours would ${n1 * k} people take?`, answer: t1 * k, unit: "hours", steps: [`${n1 * k} is ${k} times ${n1}.`, `${t1} × ${k} = ${t1 * k} hours.`] };
  },
];

/* ---------- Week 2: fair samples and reliable measurements ---------- */
const randomSample: Form[] = [
  (r) => {
    const top = 100 * r(3, 6), raw = [r(1, top), r(top + 1, 999), r(1, top), r(1, top), r(1, top)];
    raw[3] = raw[0];
    const seen = new Set<number>(), used = raw.filter((v) => v <= top && !seen.has(v) && seen.add(v));
    const pad = (v: number) => String(v).padStart(3, "0");
    return { prompt: `Students are numbered 001 to ${pad(top)}. A random number generator gives ${raw.map(pad).join(", ")}. Numbers out of range or repeated are skipped. How many students are selected?`, answer: used.length, steps: [`${pad(raw[1])} is out of range, and ${pad(raw[3])} repeats an earlier number.`, `${used.length} students are selected: ${used.map(pad).join(", ")}.`] };
  },
  (r) => {
    const n = pick(r, [20, 25, 40, 50]), k = r(4, 12);
    return { prompt: `A systematic sample of ${n} is taken from a list of ${n * k} students by choosing every kth name. What is k?`, answer: k, steps: [`${n * k} ÷ ${n} = ${k}.`, `Choose every ${k}th name after a random start.`] };
  },
  (r) => {
    const start = r(1, 9), k = r(8, 15), m = r(4, 7);
    return { prompt: `A systematic sample starts at student ${start} and then takes every ${k}th student. What is the number of the ${m}th student chosen?`, answer: start + (m - 1) * k, steps: [`Student 1 chosen: ${start}. Each later one is ${k} further on.`, `${start} + ${m - 1} × ${k} = ${start + (m - 1) * k}.`] };
  },
  (r) => {
    const methods: [string, boolean][] = [
      ["drawing names from a hat containing every student's name", true],
      ["asking the first students to arrive at school", false],
      ["choosing students from a complete list using a random number generator", true],
      ["asking students in the canteen queue", false],
      ["letting students volunteer through an online link", false],
    ];
    const [text, fair] = pick(r, methods);
    return yesNo(`A sample is chosen by ${text}. Does every student have the same chance of being chosen?`, fair, [fair ? "Every student is on the list and selection is random." : "Some students are more likely to be included than others.", fair ? "So this is a random sample." : "So this is not a random sample."]);
  },
  (r) => {
    const n = r(3, 10), pop = n * r(5, 20);
    return { prompt: `${n} names are drawn at random from a hat holding all ${pop} names. What is the probability that a particular student is chosen? Give a fraction.`, answer: fraction(n, pop), steps: [`${n} of the ${pop} names are drawn.`, `Probability = ${n}/${pop} = ${fraction(n, pop)}.`] };
  },
];
const BIAS: [string, "Selection" | "Measurement", string][] = [
  ["Exercise habits are surveyed at a gym.", "Selection", "Gym members exercise more than most people."],
  ["A bathroom scale always reads 0.5 kg too heavy.", "Measurement", "Every recorded value is wrong by the same amount."],
  ["A survey asks: 'Don't you agree the canteen food is too expensive?'", "Measurement", "The leading wording pushes people towards one answer."],
  ["Opinions on a new skate park are collected only from people at the skate shop.", "Selection", "Skaters are more likely to support a skate park."],
  ["Students are asked, in front of their teacher, how much homework they skip.", "Measurement", "People may not answer honestly when others are listening."],
  ["Only students with email addresses on the school list are surveyed online.", "Selection", "Students without listed emails cannot be chosen."],
];
const spotBias: Form[] = [
  (r) => {
    const [text, answer, why] = pick(r, BIAS);
    return { prompt: `${text} Is the main problem selection bias or measurement bias?`, answer, steps: ["Selection bias: who is chosen is unrepresentative. Measurement bias: the way values are recorded is distorted.", why] };
  },
  (r) => {
    const n1 = 40, a1 = r(28, 38), n2 = 60, a2 = r(9, 24);
    return { prompt: `At a gym, ${a1} of ${n1} people said they exercise daily. In a random sample of ${n2} residents, ${a2} said so. What is the difference in percentage points?`, answer: rounded((100 * a1) / n1 - (100 * a2) / n2, 1), unit: "percentage points", steps: [`Gym: ${pct(a1, n1)}%. Random sample: ${pct(a2, n2)}%.`, `Difference: ${rounded((100 * a1) / n1 - (100 * a2) / n2, 1)}. The gym sample overstates daily exercise.`] };
  },
  (r) => {
    const qs: [string, boolean][] = [
      ["Don't you agree that school should start later?", true],
      ["What time do you usually wake up on school days?", false],
      ["Most people love the new library. Do you like it?", true],
      ["How many minutes do you spend reading each day?", false],
      ["Wouldn't a longer lunch break be better?", true],
    ];
    const [q, leading] = pick(r, qs);
    return yesNo(`Is this a leading question? "${q}"`, leading, [leading ? "The wording suggests the answer the asker wants." : "The question is neutral and asks for a fact.", leading ? "Leading questions cause measurement bias." : "It does not push people towards an answer."]);
  },
  (r) => {
    const calls = 50 * r(4, 12), yes = r(Math.round(calls * 0.6), Math.round(calls * 0.95));
    return { prompt: `A TV poll invites viewers to phone in. ${yes} of ${calls} callers vote yes. What percentage voted yes, to one decimal place?`, answer: pct(yes, calls), unit: "%", steps: [`${yes} ÷ ${calls} × 100 = ${pct(yes, calls)}%.`, "Callers chose themselves, so the result may not represent all viewers."] };
  },
  (r) => {
    const true1 = r(30, 60), off = pick(r, [0.5, 1, 1.5, 2]);
    return { prompt: `A stopwatch starts ${off} s late every time. A recorded time is ${true1} s. What was the true time?`, answer: rounded(true1 + off, 1), unit: "s", steps: ["Starting late makes every recorded time too short.", `${true1} + ${off} = ${rounded(true1 + off, 1)} s.`] };
  },
];
const precision: Form[] = [
  (r) => {
    const [unit, step, label] = pick(r, [["cm", 1, "the nearest centimetre"], ["kg", 0.1, "the nearest 0.1 kg"], ["g", 5, "the nearest 5 g"], ["s", 0.01, "the nearest 0.01 s"], ["mm", 1, "the nearest millimetre"]] as const);
    return { prompt: `A measurement is recorded to ${label}. What is the largest possible error?`, answer: rounded(step / 2, 3), unit, steps: [`Values within half a step round to the recorded value.`, `Half of ${step} ${unit} is ${rounded(step / 2, 3)} ${unit}.`] };
  },
  (r) => {
    const v = r(20, 180);
    return { prompt: `A length is recorded as ${v} cm to the nearest centimetre. What are the smallest and largest possible actual lengths?`, answer: `${v - 0.5}, ${v + 0.5}`, input: "list", labels: ["Smallest (cm)", "Largest (cm)"], steps: ["Rounding to the nearest centimetre allows an error of up to 0.5 cm either way.", `${v} − 0.5 = ${v - 0.5} and ${v} + 0.5 = ${v + 0.5}.`] };
  },
  (r) => {
    const off = pick(r, [0.2, 0.3, 0.4, 0.5]), shown = rounded(r(400, 800) / 10, 1);
    return { prompt: `A scale reads ${off} kg too heavy. It shows ${shown} kg. What is the true mass?`, answer: rounded(shown - off, 1), unit: "kg", steps: ["Every reading includes the extra amount.", `${shown} − ${off} = ${rounded(shown - off, 1)} kg.`] };
  },
  (r) => {
    const m = r(30, 80), off = r(1, 4);
    return { prompt: `Every value in a data set was measured ${off} cm too long. The recorded mean is ${m} cm. What is the true mean?`, answer: m - off, unit: "cm", steps: ["Subtracting the same amount from every value subtracts it from the mean.", `${m} − ${off} = ${m - off} cm.`] };
  },
  (r) => {
    const a = pick(r, [0.1, 1]), b = a / 10;
    return { prompt: `Stopwatch A records to the nearest ${a} s and stopwatch B to the nearest ${b} s. What is the largest possible error for the more precise stopwatch?`, answer: rounded(b / 2, 3), unit: "s", steps: [`Stopwatch B has the smaller step, ${b} s, so it is more precise.`, `Largest error: ${b} ÷ 2 = ${rounded(b / 2, 3)} s.`] };
  },
];

/* ---------- Week 3: sources and sampling methods ---------- */
const SOURCES: [string, "Primary" | "Secondary", string][] = [
  ["You time your classmates running 100 m.", "Primary", "You collected the data yourself."],
  ["You download rainfall records from the Bureau of Meteorology.", "Secondary", "Someone else collected the data."],
  ["You count cars passing your house for an hour.", "Primary", "You recorded the data first-hand."],
  ["You use population figures from a census report.", "Secondary", "The data were collected by another organisation."],
  ["Your group surveys Year 8 students about breakfast.", "Primary", "Your group collected the data for this investigation."],
  ["You read sports results published in a newspaper.", "Secondary", "The data were gathered and published by others."],
];
const sources: Form[] = [
  (r) => {
    const [text, answer, why] = pick(r, SOURCES);
    return { prompt: `${text} Is this primary or secondary data for your investigation?`, answer, steps: ["Primary data are collected by you; secondary data were collected by someone else.", why] };
  },
  (r) => {
    const sizes = [r(30, 60), r(80, 140), r(60, 110), r(30, 60), r(10, 30)], k = r(0, 4), total = sum(sizes);
    return { prompt: `This secondary data table shows household sizes in a suburb. What percentage of households have ${k + 1 === 5 ? "5 or more" : k + 1} ${k === 0 ? "person" : "people"}, to one decimal place?`, answer: pct(sizes[k], total), unit: "%", steps: [`Total households: ${total}.`, `${sizes[k]} ÷ ${total} × 100 = ${pct(sizes[k], total)}%.`], visual: table("Household size (secondary data)", ["People", "1", "2", "3", "4", "5+"], [["Households", ...sizes]]) };
  },
  (r) => {
    const sports = ["Badminton", "Water polo", "Handball"], classes = ["8A", "8B", "8C", "8D"];
    const rows = sports.map((s) => [s, ...classes.map(() => r(2, 14))]), i = r(0, 2);
    return { prompt: `How many students in total voted for ${sports[i]}?`, answer: sum(rows[i].slice(1) as number[]), steps: [`Add the ${sports[i]} row: ${(rows[i].slice(1) as number[]).join(" + ")}.`, `= ${sum(rows[i].slice(1) as number[])}.`], visual: table("Sport votes by class", ["Sport", ...classes], rows) };
  },
  (r) => {
    const vals = [1, 2, 3, 4, 5], cs = vals.map(() => r(1, 12)), hi = cs.indexOf(Math.max(...cs)), lo = cs.indexOf(Math.min(...cs));
    return { prompt: "The graph shows how many pets each surveyed household has. How many more households have the most common number of pets than the least common?", answer: cs[hi] - cs[lo], steps: [`Tallest bar: ${cs[hi]}. Shortest bar: ${cs[lo]}.`, `${cs[hi]} − ${cs[lo]} = ${cs[hi] - cs[lo]}.`], visual: freqGraph("Pets per household", vals, cs, "Number of pets") };
  },
  (r) => {
    const months = [0, 1, 2, 3, 4, 5, 6], start = r(70, 90), drops = months.map((m) => start - m * r(1, 3));
    for (let i = 1; i < drops.length; i++) if (drops[i] >= drops[i - 1]) drops[i] = drops[i - 1] - 1;
    const a = r(0, 3), b = a + r(2, 3);
    return { prompt: `The table shows a currency's value, in cents, over 6 months. By how many cents did it fall from month ${a} to month ${b}?`, answer: drops[a] - drops[b], unit: "cents", steps: [`Month ${a}: ${drops[a]}. Month ${b}: ${drops[b]}.`, `${drops[a]} − ${drops[b]} = ${drops[a] - drops[b]}.`], visual: table("Value over time (secondary data)", ["Month", ...months.map(String)], [["Cents", ...drops]]) };
  },
];
const RANDOM_OR_NOT: [string, "Random" | "Non-random", string][] = [
  ["Names are drawn by a computer from the full school roll.", "Random", "Every student has an equal chance."],
  ["The first 30 people through the gate are asked.", "Non-random", "Early arrivals may differ from others."],
  ["Every 10th name on the roll is chosen after a random start.", "Random", "A random start gives each name a chance."],
  ["Students who reply to an email invitation are used.", "Non-random", "Volunteers choose themselves."],
  ["A teacher chooses students she thinks are typical.", "Non-random", "Personal judgement decides who is chosen."],
];
const randomVsNon: Form[] = [
  (r) => {
    const [text, answer, why] = pick(r, RANDOM_OR_NOT);
    return { prompt: `${text} Is this a random or non-random sample?`, answer, steps: ["In a random sample, chance decides who is chosen.", why] };
  },
  (r) => {
    const years = [r(4, 8) * 40, r(4, 8) * 40, r(4, 8) * 40], total = sum(years), size = pick(r, [20, 40]);
    const fixed = years.map((y) => (y * size) / total);
    if (!fixed.every(Number.isInteger)) {
      const s = 60, ys = [160, 200, 240], i = r(0, 2);
      return { prompt: `A school has ${ys.join(", ")} students in Years 7, 8 and 9. A stratified sample of ${s} is taken in proportion. How many Year ${7 + i} students are chosen?`, answer: (ys[i] * s) / 600, unit: "students", steps: [`Year ${7 + i} is ${ys[i]}/600 of the school.`, `${ys[i]}/600 × ${s} = ${(ys[i] * s) / 600}.`] };
    }
    const i = r(0, 2);
    return { prompt: `A school has ${years.join(", ")} students in Years 7, 8 and 9. A stratified sample of ${size} is taken in proportion. How many Year ${7 + i} students are chosen?`, answer: fixed[i], unit: "students", steps: [`Year ${7 + i} is ${years[i]}/${total} of the school.`, `${years[i]}/${total} × ${size} = ${fixed[i]}.`] };
  },
  (r) => {
    const classes = r(2, 5), size = r(22, 30);
    return { prompt: `A cluster sample randomly chooses ${classes} classes and surveys every student in them. Each class has ${size} students. What is the sample size?`, answer: classes * size, unit: "students", steps: ["Everyone in each chosen cluster is surveyed.", `${classes} × ${size} = ${classes * size}.`] };
  },
  (r) => {
    const descriptions: [string, (typeof METHODS)[number]][] = [
      ["Choose 24 students at random from a list of the whole school.", "Simple random"],
      ["Choose every 15th student on the roll after a random start.", "Systematic"],
      ["Choose 4 students at random from each year level.", "Stratified"],
      ["Choose 2 classes at random and survey every student in them.", "Cluster"],
      ["Ask the first 24 students you see at lunch.", "Convenience"],
    ];
    const [text, answer] = pick(r, descriptions);
    return { prompt: `${text} Which sampling method is this?`, answer, choices: [...METHODS], steps: ["Simple random: anyone from the full list. Systematic: every kth. Stratified: random from each group. Cluster: whole groups. Convenience: whoever is easy to reach.", `So this is ${answer.toLowerCase()} sampling.`] };
  },
  (r) => {
    const pop = 20 * r(20, 60), n = pick(r, [20, 40, 50, 80]);
    return { prompt: `To take a systematic sample of ${n} from ${pop} names, every kth name is chosen. What is k?`, answer: pop / n, steps: [`k = ${pop} ÷ ${n}.`, `k = ${pop / n}.`] };
  },
];
const chooseMethod: Form[] = [
  (r) => {
    const scenarios: [string, (typeof METHODS)[number], string][] = [
      ["A school wants every year level fairly represented in a survey about uniforms.", "Stratified", "Sampling randomly from each year level guarantees all are represented."],
      ["A researcher has a complete numbered list of members and wants each to have an equal chance.", "Simple random", "A random draw from the full list is simplest and fair."],
      ["Inspectors check bottles on a production line at regular intervals.", "Systematic", "Every kth bottle is easy to select on a moving line."],
    ];
    const [text, answer, why] = pick(r, scenarios);
    return { prompt: `${text} Which method is most suitable?`, answer, choices: [...METHODS], steps: [why, "Convenience sampling would risk bias."] };
  },
  (r) => {
    const ys = [r(3, 6) * 20, r(3, 6) * 20, r(3, 6) * 20], per = pick(r, [10, 20]), total = sum(ys), s = (total * per) / 100;
    return { prompt: `Years 7, 8 and 9 have ${ys.join(", ")} students. A stratified sample takes ${per}% of each year. How many students come from each year?`, answer: ys.map((y) => (y * per) / 100).join(", "), input: "list", labels: ["Year 7", "Year 8", "Year 9"], steps: [`${per}% of each year level.`, `${ys.map((y) => `${per}% of ${y} = ${(y * per) / 100}`).join("; ")}. Total ${s}.`] };
  },
  (r) => {
    const groups: [string, boolean][] = [
      ["Asking your friends represents the whole school", false],
      ["A random sample from the full school list can represent the school", true],
      ["Surveying only the chess club represents all students' views on sport", false],
      ["Surveying 5 random students from every class can represent the school", true],
    ];
    const [text, ok] = pick(r, groups);
    return yesNo(`Is this claim reasonable? "${text}."`, ok, [ok ? "Random selection from the whole population gives a fair chance to everyone." : "The group chosen is not typical of the whole school.", ok ? "So the claim is reasonable." : "So conclusions would be biased."]);
  },
  (r) => {
    const n = 50, a = r(8, 20), pop = 50 * r(10, 30);
    return { prompt: `A random sample of ${n} students found ${a} walk to school. A convenience sample at a bus stop found almost none. Use the random sample to estimate how many of the school's ${pop} students walk.`, answer: (a / n) * pop, unit: "students", steps: [`The bus-stop sample misses walkers, so use the random sample.`, `${a}/${n} × ${pop} = ${(a / n) * pop}.`] };
  },
  (r) => {
    const pop = 100 * r(6, 30), p = pick(r, [5, 10, 20]);
    return { prompt: `A survey will use ${p}% of a population of ${pop}. What is the sample size?`, answer: (pop * p) / 100, steps: [`${p}% = ${p / 100}.`, `${p / 100} × ${pop} = ${(pop * p) / 100}.`] };
  },
];

/* ---------- Week 4: describe a data distribution ---------- */
const display: Form[] = [
  (r) => {
    const xs = list(r, 14, 1, 6), k = pick(r, [...new Set(xs)]);
    return { prompt: `Make a frequency table for these data. What is the frequency of ${k}?`, answer: xs.filter((x) => x === k).length, steps: [`Tally each value as you read through the list.`, `${k} appears ${xs.filter((x) => x === k).length} times.`], visual: dataVisual("Survey results", xs) };
  },
  (r) => {
    const xs = list(r, 16, 0, 8), k = r(2, 6);
    return { prompt: `How many observations are greater than ${k}?`, answer: xs.filter((x) => x > k).length, steps: [`Count the dots to the right of ${k}, not including ${k}.`, `${xs.filter((x) => x > k).length} observations.`], visual: dots("Number of books read", "Books", 0, 8, [{ values: xs }]) };
  },
  (r) => {
    const vals = [0, 1, 2, 3, 4], cs = vals.map(() => r(1, 9));
    return { prompt: "How many matches are recorded in this frequency graph?", answer: sum(cs), steps: ["Add the heights of all the bars.", `${cs.join(" + ")} = ${sum(cs)}.`], visual: freqGraph("Goals scored per match", vals, cs, "Goals") };
  },
  (r) => {
    const stems = [1, 2, 3, 4], leaves = stems.map(() => sorted(list(r, r(2, 5), 0, 9))), s = r(0, 3);
    return { prompt: `These are people's ages. How many people are aged ${stems[s]}0 to ${stems[s]}9?`, answer: leaves[s].length, steps: [`Stem ${stems[s]} holds ages ${stems[s]}0 to ${stems[s]}9.`, `It has ${leaves[s].length} leaves.`], visual: { kind: "stemleaf", title: "Ages", key: "2 | 3 means 23 years", stems, leaves } };
  },
  (r) => {
    const xs = list(r, 18, 130, 196), lo = pick(r, [140, 150, 160, 170]);
    return { prompt: `Group these heights in intervals of 10 cm. How many people are in the ${lo}–${lo + 9} cm group?`, answer: xs.filter((x) => x >= lo && x <= lo + 9).length, steps: [`Count heights from ${lo} to ${lo + 9} inclusive.`, `${xs.filter((x) => x >= lo && x <= lo + 9).length} people.`], visual: dataVisual("Heights", xs, "cm") };
  },
  (r) => {
    const vals = [0, 1, 2, 3, 4, 5], cs = vals.map(() => r(0, 5));
    if (!sum(cs)) cs[1] = 2;
    return { prompt: "A tennis player records double faults per match. How many double faults did they serve in total?", answer: sum(vals.map((v, i) => v * cs[i])), steps: ["Multiply each value by its frequency, then add.", `${vals.map((v, i) => `${v} × ${cs[i]}`).join(" + ")} = ${sum(vals.map((v, i) => v * cs[i]))}.`], visual: table("Double faults", ["Double faults", ...vals.map(String)], [["Matches", ...cs]]) };
  },
];
const centreSpread: Form[] = [
  (r) => {
    const n = r(5, 8), xs = wholeMean(r, n, -4, 20);
    return { prompt: "Find the mean of these values.", answer: sum(xs) / n, steps: [`Sum: ${sum(xs)}.`, `${sum(xs)} ÷ ${n} = ${sum(xs) / n}.`], visual: dataVisual("Data", xs) };
  },
  (r) => {
    const xs = list(r, pick(r, [6, 8, 10]), 1, 30);
    return { prompt: "Find the median of these values.", answer: median(xs), steps: [`Order: ${sorted(xs).join(", ")}.`, `Even count, so average the middle two: ${median(xs)}.`], visual: dataVisual("Data", xs) };
  },
  (r) => {
    const xs = list(r, 15, 0, 6), cs = counts(xs, 0, 6), top = Math.max(...cs);
    if (cs.filter((c) => c === top).length > 1) xs.push(cs.indexOf(top));
    const c2 = counts(xs, 0, 6), mode = c2.indexOf(Math.max(...c2));
    return { prompt: "What is the mode of the data in the dot plot?", answer: mode, steps: ["The mode is the value with the tallest column of dots.", `That is ${mode}.`], visual: dots("Aces served per match", "Aces", 0, 6, [{ values: xs }]) };
  },
  (r) => {
    const xs = list(r, 9, -9, 18);
    return { prompt: "Find the range of these values.", answer: range(xs), steps: [`Largest ${Math.max(...xs)}, smallest ${Math.min(...xs)}.`, `Range = ${Math.max(...xs)} − ${Math.min(...xs) < 0 ? `(${Math.min(...xs)})` : Math.min(...xs)} = ${range(xs)}.`], visual: dataVisual("Data", xs) };
  },
  (r) => {
    const shapes = [
      { name: "Symmetric", cs: [1, 3, 5, 3, 1] },
      { name: "Positively skewed", cs: [5, 4, 2, 1, 1] },
      { name: "Negatively skewed", cs: [1, 1, 2, 4, 5] },
      { name: "Bi-modal", cs: [4, 1, 0, 1, 4] },
    ];
    const s = pick(r, shapes), xs = s.cs.flatMap((c, i) => Array.from({ length: c + (c ? r(0, 1) : 0) }, () => i + 1));
    return { prompt: "Describe the shape of this distribution.", answer: s.name, choices: shapes.map((x) => x.name), steps: ["Look at where the dots pile up.", s.name === "Symmetric" ? "It is balanced about the centre." : s.name === "Positively skewed" ? "Most values are low with a tail to the right." : s.name === "Negatively skewed" ? "Most values are high with a tail to the left." : "There are two separate peaks."], visual: dots("Survey results", "Value", 1, 5, [{ values: xs }]) };
  },
  (r) => {
    const vals = [7, 8, 9, 10], cs = vals.map(() => r(0, 5));
    if (sum(cs) < 4) cs[2] += 4;
    const total = sum(vals.map((v, i) => v * cs[i])), n = sum(cs);
    return { prompt: "Find the mean score, to two decimal places.", answer: rounded(total / n, 2), steps: [`Total of scores: ${vals.map((v, i) => `${v} × ${cs[i]}`).join(" + ")} = ${total}.`, `Number of scores: ${n}. Mean = ${total} ÷ ${n} = ${rounded(total / n, 2)}.`], visual: table("Dance scores", ["Score", ...vals.map(String)], [["Frequency", ...cs]]) };
  },
];
const conclusions: Form[] = [
  (r) => {
    const a = wholeMean(r, 5, 46, 56), b = wholeMean(r, 5, 44, 60);
    if (sum(a) === sum(b)) b[0] += 5;
    const ma = sum(a) / 5, mb = sum(b) / 5;
    return { prompt: "Egg masses in grams from two shops are shown. By how many grams is the heavier shop's mean greater?", answer: rounded(Math.abs(ma - mb), 2), unit: "g", steps: [`Shop A mean: ${ma}. Shop B mean: ${mb}.`, `Difference: ${rounded(Math.abs(ma - mb), 2)} g.`], visual: table("Egg masses (g)", ["Shop", "Egg 1", "Egg 2", "Egg 3", "Egg 4", "Egg 5"], [["A", ...a], ["B", ...b]]) };
  },
  (r) => {
    const p = pick(r, NAMES), q = pick(r, NAMES.filter((x) => x !== p));
    const a = list(r, 8, 10, 22), b = list(r, 8, 3, 40);
    if (range(a) === range(b)) b[0] = 41;
    const consistent = range(a) < range(b) ? p : q;
    return { prompt: `Runs scored by two cricketers are shown. Based on range, who is more consistent? Type their name.`, answer: consistent, input: "text", steps: [`${p}'s range: ${range(a)}. ${q}'s range: ${range(b)}.`, `The smaller range belongs to ${consistent}, so they are more consistent.`], visual: table("Runs per match", ["Player", ...a.map((_, i) => `M${i + 1}`)], [[p, ...a], [q, ...b]]) };
  },
  (r) => {
    const xs = list(r, 20, 5, 11), k = 8, at = xs.filter((x) => x >= k).length;
    return yesNo(`Claim: "Most students in the sample sleep at least ${k} hours." Does the dot plot support this claim?`, at > xs.length / 2, [`${at} of ${xs.length} students sleep at least ${k} hours.`, at > xs.length / 2 ? "That is more than half, so it supports the claim." : "That is not more than half, so it does not support the claim."], { visual: dots("Hours of sleep", "Hours", 5, 11, [{ values: xs }]) });
  },
  (r) => {
    const xs = list(r, 20, 0, 6), k = r(2, 4), above = xs.filter((x) => x > k).length;
    return { prompt: `What percentage of the sample read more than ${k} books?`, answer: (above / 20) * 100, unit: "%", steps: [`${above} of 20 values are greater than ${k}.`, `${above} ÷ 20 × 100 = ${(above / 20) * 100}%.`], visual: dots("Books read this term", "Books", 0, 6, [{ values: xs }]) };
  },
  (r) => {
    const a = list(r, 9, 2, 12), b = list(r, 9, 4, 16);
    return { prompt: "What is the difference between the medians of Class A and Class B? (Larger minus smaller.)", answer: Math.abs(median(b) - median(a)), unit: "hours", steps: [`Class A median: ${median(a)}. Class B median: ${median(b)}.`, `Difference: ${Math.abs(median(b) - median(a))} hours.`], visual: dots("Hours of homework per week", "Hours", 2, 16, [{ label: "Class A", values: a }, { label: "Class B", values: b }]) };
  },
];

/* ---------- Week 5: why samples give different answers ---------- */
const sampleMeans = (r: R, k: number, centre: number, spread: number) => Array.from({ length: k }, () => centre + r(-spread, spread));
const sameSize: Form[] = [
  (r) => {
    const ms = sampleMeans(r, 5, r(150, 160), 4);
    return { prompt: "Five random samples of 30 students each give these mean heights (cm). What is the range of the sample means?", answer: range(ms), unit: "cm", steps: [`Largest ${Math.max(...ms)}, smallest ${Math.min(...ms)}.`, `Range = ${range(ms)} cm. Samples of the same size still vary.`], visual: table("Sample means (cm)", ["Sample", "A", "B", "C", "D", "E"], [["Mean", ...ms]]) };
  },
  (r) => {
    const mu = r(150, 160), ms = sampleMeans(r, 4, mu, 5), far = ms.map((m) => Math.abs(m - mu)), i = far.indexOf(Math.max(...far));
    if (far.filter((f) => f === far[i]).length > 1) ms[i] += ms[i] >= mu ? 1 : -1;
    const f2 = ms.map((m) => Math.abs(m - mu)), j = f2.indexOf(Math.max(...f2));
    return { prompt: `The population mean height is ${mu} cm. Which sample mean is furthest from it? Type the letter.`, answer: "ABCD"[j], input: "text", steps: [`Distances: ${ms.map((m, x) => `${"ABCD"[x]} ${Math.abs(m - mu)}`).join(", ")}.`, `Sample ${"ABCD"[j]} is furthest.`], visual: table("Sample means (cm)", ["Sample", "A", "B", "C", "D"], [["Mean", ...ms]]) };
  },
  (r) => {
    const ms = wholeMean(r, 4, 20, 40);
    return { prompt: "Four random samples give these mean reaction times (hundredths of a second). What is the mean of the four sample means?", answer: sum(ms) / 4, steps: [`Sum: ${sum(ms)}.`, `${sum(ms)} ÷ 4 = ${sum(ms) / 4}.`], visual: table("Sample means", ["Sample", "1", "2", "3", "4"], [["Mean", ...ms]]) };
  },
  (r) => {
    const a = r(148, 154), b = a + r(2, 5);
    return yesNo(`Two random samples of 30 students gave mean heights of ${a} cm and ${b} cm. Does this mean one sample was collected incorrectly?`, false, ["Random samples naturally give different results.", "This variation is expected, even when both are done correctly."]);
  },
  (r) => {
    const a = list(r, 11, 1, 10), b = list(r, 11, 1, 10);
    return { prompt: "Two random samples of 11 students record hours of exercise. What is the difference between the two sample medians? (Larger minus smaller.)", answer: Math.abs(median(a) - median(b)), unit: "hours", steps: [`Sample 1 median: ${median(a)}. Sample 2 median: ${median(b)}.`, `Difference: ${Math.abs(median(a) - median(b))}.`], visual: dots("Hours of exercise per week", "Hours", 1, 10, [{ label: "Sample 1", values: a }, { label: "Sample 2", values: b }]) };
  },
];
const proportions: Form[] = [
  (r) => {
    const n = pick(r, [20, 25, 40, 50]), a = r(Math.round(n * 0.2), Math.round(n * 0.8));
    return { prompt: `In a random sample of ${n} students, ${a} support a uniform change. What percentage is this?`, answer: (100 * a) / n, unit: "%", steps: [`${a} ÷ ${n} = ${a / n}.`, `× 100 = ${(100 * a) / n}%.`] };
  },
  (r) => {
    const cs = [r(18, 32), r(18, 32), r(18, 32)], ps = cs.map((c) => c * 2);
    return { prompt: "Three random samples of 50 students were asked about a uniform change. What is the range of the percentages in favour?", answer: range(ps), unit: "percentage points", steps: [`Percentages: ${ps.join("%, ")}%.`, `Range = ${Math.max(...ps)} − ${Math.min(...ps)} = ${range(ps)}.`], visual: table("In favour (out of 50)", ["Sample", "1", "2", "3"], [["In favour", ...cs]]) };
  },
  (r) => {
    const a = r(20, 30);
    return yesNo(`In a random sample of 50 students, ${a} favour a uniform change. Is this a majority of the sample?`, a > 25, [`${a} ÷ 50 = ${(a / 50) * 100}%.`, a > 25 ? "More than 50% is a majority." : "A majority needs more than 50%."]);
  },
  (r) => {
    const cs = [r(10, 30), r(10, 30), r(10, 30)];
    return { prompt: "Three random samples of 50 are combined. What percentage of all 150 students are in favour, to one decimal place?", answer: pct(sum(cs), 150), unit: "%", steps: [`Total in favour: ${cs.join(" + ")} = ${sum(cs)}.`, `${sum(cs)} ÷ 150 × 100 = ${pct(sum(cs), 150)}%.`], visual: table("In favour (out of 50)", ["Sample", "1", "2", "3"], [["In favour", ...cs]]) };
  },
  (r) => {
    const n = 40, a = r(8, 30), b = r(8, 30);
    return { prompt: `Sample A: ${a} of ${n} chose cycling. Sample B: ${b} of ${n} chose cycling. What is the difference in percentage points? (Larger minus smaller.)`, answer: Math.abs(pct(a, n) - pct(b, n)), unit: "percentage points", steps: [`A: ${pct(a, n)}%. B: ${pct(b, n)}%.`, `Difference: ${Math.abs(pct(a, n) - pct(b, n))}.`] };
  },
];
const estimateCount: Form[] = [
  (r) => {
    const n = pick(r, [20, 25, 40, 50]), a = r(2, Math.round(n * 0.6)), pop = n * r(10, 40);
    return { prompt: `${a} of ${n} randomly sampled students cycle to school. Estimate how many of the school's ${pop} students cycle.`, answer: (a / n) * pop, unit: "students", steps: [`Sample proportion: ${a}/${n}.`, `${a}/${n} × ${pop} = ${(a / n) * pop}. This is an estimate, not an exact count.`] };
  },
  (r) => {
    const days = 60, wet = pick(r, [12, 15, 18, 20, 24, 30]), month = 30;
    return { prompt: `It rained on ${wet} of the last ${days} days in April. Use this relative frequency to estimate the number of rainy days in a 30-day April.`, answer: (wet / days) * month, unit: "days", steps: [`Relative frequency: ${wet}/${days} = ${fraction(wet, days)}.`, `${fraction(wet, days)} × 30 = ${(wet / days) * month}.`] };
  },
  (r) => {
    const marked = 10 * r(3, 8), caught = 10 * r(4, 10), again = pick(r, [2, 4, 5, 8, 10].filter((k) => (marked * caught) % k === 0 && k < caught));
    return { prompt: `Rangers tag ${marked} turtles and release them. Later they catch ${caught} turtles and ${again} are tagged. Estimate the turtle population.`, answer: (marked * caught) / again, unit: "turtles", steps: [`Tagged in the second catch: ${again}/${caught}. Assume this matches ${marked}/N.`, `N = ${marked} × ${caught} ÷ ${again} = ${(marked * caught) / again}.`] };
  },
  (r) => {
    const n = 200, o = 2 * r(15, 60), visitors = 1000 * r(5, 25);
    return { prompt: `${o} of ${n} surveyed visitors to a gallery came from overseas. The gallery has ${visitors} visitors a month. Estimate the overseas visitors per month.`, answer: (o / n) * visitors, unit: "visitors", steps: [`Proportion: ${o}/${n} = ${o / n}.`, `${o / n} × ${visitors} = ${(o / n) * visitors}.`] };
  },
  (r) => {
    const pop = 100 * r(8, 20), p = pick(r, [10, 20, 25, 40]), k = pick(r, [20, 40, 50, 60]);
    return { prompt: `About ${p}% of ${pop} students cycle. In a random sample of ${k}, how many would you expect to cycle?`, answer: (p * k) / 100, unit: "students", steps: [`Expect the sample to match the population proportion.`, `${p}% of ${k} = ${(p * k) / 100}.`] };
  },
];

/* ---------- Week 6: sample size and variation ---------- */
const sizeRuns: Form[] = [
  (r) => {
    const small = sampleMeans(r, 5, 50, 15), big = sampleMeans(r, 5, 50, 4);
    return { prompt: "Five samples of size 10 and five of size 100 estimate the percentage of students who walk. What is the range of the size-10 estimates?", answer: range(small), unit: "percentage points", steps: [`Size 10: ${small.join(", ")}.`, `Range = ${range(small)}.`], visual: table("Estimates (%)", ["Sample size", "Run 1", "Run 2", "Run 3", "Run 4", "Run 5"], [["10", ...small], ["100", ...big]]) };
  },
  (r) => {
    const small = sampleMeans(r, 5, 50, 15), big = sampleMeans(r, 5, 50, 4);
    if (range(big) >= range(small)) small[0] = Math.min(...small) - 6;
    return { prompt: "Which sample size gave the smaller range of estimates? Enter the sample size.", answer: 100, steps: [`Range for size 10: ${range(small)}. Range for size 100: ${range(big)}.`, "The larger samples varied less."], visual: table("Estimates (%)", ["Sample size", "Run 1", "Run 2", "Run 3", "Run 4", "Run 5"], [["10", ...small], ["100", ...big]]) };
  },
  (r) => {
    const size = pick(r, [10, 20, 50]), runs = r(5, 20);
    return { prompt: `A simulation takes ${runs} samples of ${size} students. How many selections are recorded altogether?`, answer: runs * size, steps: [`Each run records ${size} selections.`, `${runs} × ${size} = ${runs * size}.`] };
  },
  (r) => {
    const claims: [string, boolean][] = [
      ["Larger random samples usually give estimates closer to the population value.", true],
      ["A larger sample always gives exactly the population value.", false],
      ["Estimates from small samples usually vary more than those from large samples.", true],
      ["Doubling the sample size removes all sampling variation.", false],
    ];
    const [c, ok] = pick(r, claims);
    return yesNo(`Is this statement true? "${c}"`, ok, ["Larger random samples reduce variation but never remove it completely.", ok ? "So the statement is true." : "So the statement is false."]);
  },
  (r) => {
    const small = list(r, 8, 20, 80), big = list(r, 8, 42, 58);
    return { prompt: "The dot plots show estimates from samples of size 10 and size 100. How much greater is the range for size 10?", answer: range(small) - range(big), unit: "percentage points", steps: [`Size 10 range: ${range(small)}. Size 100 range: ${range(big)}.`, `${range(small)} − ${range(big)} = ${range(small) - range(big)}.`], visual: dots("Estimated % who walk", "Percent", 20, 80, [{ label: "Size 10", values: small }, { label: "Size 100", values: big }]) };
  },
];
const compareVariation: Form[] = [
  (r) => {
    const n = 20, cs = [r(4, 16), r(4, 16), r(4, 16), r(4, 16)], ps = cs.map((c) => c * 5);
    return { prompt: "Four samples of 20 people were asked if they own a pet. What is the range of the sample percentages?", answer: range(ps), unit: "percentage points", steps: [`Percentages: ${ps.join("%, ")}%.`, `Range = ${range(ps)}.`], visual: table(`Pet owners (out of ${n})`, ["Sample", "1", "2", "3", "4"], [["Owners", ...cs]]) };
  },
  (r) => {
    const big = r(0, 1) ? "P" : "Q", wide = sampleMeans(r, 4, 50, 18), narrow = sampleMeans(r, 4, 50, 3);
    if (range(narrow) >= range(wide)) wide[0] = 20;
    const rows = big === "P" ? [["P", ...narrow], ["Q", ...wide]] : [["P", ...wide], ["Q", ...narrow]];
    return { prompt: "One batch used samples of 200 and the other used samples of 20. Which batch most likely used samples of 200? Type P or Q.", answer: big, input: "text", steps: ["Larger samples give estimates that vary less.", `Batch ${big} has the smaller spread.`], visual: table("Estimates (%)", ["Batch", "Run 1", "Run 2", "Run 3", "Run 4"], rows) };
  },
  (r) => {
    const est = r(30, 70), m = pick(r, [3, 4, 5, 6]);
    return { prompt: `A sample estimates ${est}% with a margin of error of ±${m}%. What is the likely interval for the population percentage?`, answer: `${est - m}, ${est + m}`, input: "list", labels: ["Lowest %", "Highest %"], steps: [`${est} − ${m} = ${est - m}.`, `${est} + ${m} = ${est + m}.`] };
  },
  (r) => {
    const s10 = list(r, 6, 20, 80), s100 = list(r, 6, 44, 56);
    return { prompt: `Six samples of size 10 gave estimates ${s10.join(", ")}%. Six of size 100 gave ${s100.join(", ")}%. What is the difference between the two ranges?`, answer: range(s10) - range(s100), unit: "percentage points", steps: [`Size 10 range: ${range(s10)}. Size 100 range: ${range(s100)}.`, `Difference: ${range(s10) - range(s100)}.`] };
  },
  (r) => {
    const n1 = pick(r, [10, 20, 25]), k = pick(r, [4, 5, 10]);
    return { prompt: `Sample A has ${n1} people and sample B has ${n1 * k}. How many times larger is sample B?`, answer: k, steps: [`${n1 * k} ÷ ${n1} = ${k}.`, "Larger samples usually give more reliable estimates."] };
  },
];
const uncertainty: Form[] = [
  (r) => {
    const p = r(20, 60), m = pick(r, [4, 5]), pop = 1000 * r(2, 6);
    return { prompt: `A sample estimates ${p}% ± ${m}% of ${pop} residents use the library. Give the likely range for the number of residents.`, answer: `${((p - m) * pop) / 100}, ${((p + m) * pop) / 100}`, input: "list", labels: ["Lowest", "Highest"], steps: [`${p - m}% to ${p + m}% of ${pop}.`, `${((p - m) * pop) / 100} to ${((p + m) * pop) / 100} residents.`] };
  },
  (r) => {
    const est = r(42, 58), m = r(3, 7), lo = est - m, hi = est + m, sure = lo > 50 || hi < 50;
    return yesNo(`A poll estimates ${est}% ± ${m}% support a proposal. Can we be confident whether a majority supports it?`, sure, [`The likely interval is ${lo}% to ${hi}%.`, sure ? `The whole interval is ${lo > 50 ? "above" : "below"} 50%, so yes.` : "The interval includes 50%, so we cannot be sure."]);
  },
  (r) => {
    const sizes = [10, 50, 200], ranges = [r(25, 40), r(10, 20), r(2, 8)];
    return { prompt: "Which sample size gave the smallest range of estimates? Enter the sample size.", answer: 200, steps: ["Compare the ranges.", `Size 200 has the smallest range (${ranges[2]}).`], visual: table("Repeated sampling", ["Sample size", "Range of estimates (%)"], sizes.map((s, i) => [s, ranges[i]])) };
  },
  (r) => {
    const a = r(45, 60), b = r(40, 55);
    return { prompt: `Report A says ${a}% from a sample of 25. Report B says ${b}% from a random sample of 400. Which report is more reliable?`, answer: "Report B", choices: ["Report A", "Report B"], steps: ["Both are samples, but B is much larger and random.", "Larger random samples vary less, so B is more reliable."] };
  },
  (r) => {
    const n = pick(r, [40, 50, 80]), a = r(10, n - 10), pop = n * r(20, 50);
    return { prompt: `${a} of ${n} sampled students prefer online homework. Estimate the number of the school's ${pop} students who prefer it, rounded to the nearest 10.`, answer: Math.round((a / n) * pop / 10) * 10, unit: "students", steps: [`${a}/${n} × ${pop} = ${rounded((a / n) * pop, 2)}.`, `Rounded to the nearest 10 to show it is an estimate: ${Math.round((a / n) * pop / 10) * 10}.`] };
  },
];

/* ---------- Week 7: how changing data changes a summary ---------- */
const changeMean: Form[] = [
  (r) => {
    const n = r(4, 7), m = r(10, 30), shift = (n + 1 - ((n * m + m) % (n + 1))) % (n + 1), add = m + shift + (n + 1) * r(0, 2), total = n * m + add;
    return { prompt: `A data set of ${n} values has mean ${m}. The value ${add} is added. What is the new mean?`, answer: total / (n + 1), steps: [`Old sum: ${n} × ${m} = ${n * m}. New sum: ${total}.`, `${total} ÷ ${n + 1} = ${total / (n + 1)}.`] };
  },
  (r) => {
    const keep = wholeMean(r, 5, 5, 25), drop = r(1, 40), at = r(0, 5), ys = [...keep.slice(0, at), drop, ...keep.slice(at)];
    return { prompt: `The value ${drop} is removed from this data set. What is the new mean?`, answer: sum(keep) / 5, steps: [`New sum: ${sum(ys)} − ${drop} = ${sum(keep)}.`, `${sum(keep)} ÷ 5 = ${sum(keep) / 5}.`], visual: dataVisual("Data", ys) };
  },
  (r) => {
    const xs = list(r, 3, 2, 15), m = Math.max(r(8, 14), Math.ceil(sum(xs) / 4) + 1), missing = 4 * m - sum(xs);
    return { prompt: `The mean of ${xs.join(", ")} and one more value is ${m}. Find the missing value.`, answer: missing, steps: [`The four values must total ${m} × 4 = ${4 * m}.`, `${4 * m} − ${sum(xs)} = ${missing}.`] };
  },
  (r) => {
    const m = r(10, 40), k = r(2, 9), n = r(4, 8);
    return { prompt: `Each of ${n} values with mean ${m} is increased by ${k}. What is the new mean?`, answer: m + k, steps: [`Adding ${k} to every value adds ${k} to the mean.`, `${m} + ${k} = ${m + k}.`] };
  },
  (r) => {
    const m = r(4, 15), k = r(2, 5);
    return { prompt: `Every value in a data set with mean ${m} is multiplied by ${k}. What is the new mean?`, answer: m * k, steps: [`Multiplying every value by ${k} multiplies the mean by ${k}.`, `${m} × ${k} = ${m * k}.`] };
  },
  (r) => {
    const n = r(3, 5), m = r(60, 75), target = m + r(2, 5), need = target * (n + 1) - n * m;
    return { prompt: `Ana's mean over ${n} tests is ${m}. What must she score on the next test to raise her mean to ${target}?`, answer: need, unit: "marks", steps: [`Needed total: ${target} × ${n + 1} = ${target * (n + 1)}. Current total: ${n * m}.`, `${target * (n + 1)} − ${n * m} = ${need}.`] };
  },
];
const changeMedianRange: Form[] = [
  (r) => {
    const xs = sorted(list(r, 7, 10, 30)), big = 100 + r(0, 50), ys = [...xs.slice(0, 6), big];
    const askRange = r(0, 1) === 1;
    return { prompt: `The largest value, ${xs[6]}, is changed to ${big}. What is the new ${askRange ? "range" : "median"}?`, answer: askRange ? range(ys) : median(ys), steps: askRange ? [`New range: ${big} − ${xs[0]}.`, `= ${range(ys)}. The range is very sensitive to an outlier.`] : ["The middle value is still the 4th value in order.", `Median stays ${median(ys)}; the median resists outliers.`], visual: dataVisual("Data", xs) };
  },
  (r) => {
    const xs = list(r, 6, 1, 20), add = r(1, 20), ys = [...xs, add];
    return { prompt: `The value ${add} is added to these 6 values. What is the new median?`, answer: median(ys), steps: [`New ordered list: ${sorted(ys).join(", ")}.`, `With 7 values the median is the 4th: ${median(ys)}.`], visual: dataVisual("Data", xs) };
  },
  (r) => {
    const xs = list(r, 7, 3, 25), s = sorted(xs), ys = s.slice(1);
    return { prompt: `The smallest value is removed. What is the new range?`, answer: range(ys), steps: [`Remaining: ${ys.join(", ")}.`, `Range = ${Math.max(...ys)} − ${Math.min(...ys)} = ${range(ys)}.`], visual: dataVisual("Data", xs) };
  },
  (r) => {
    const prices = [52, 47, 63, 58, 79, 54, 71, 66].map((p) => p + r(-3, 3)), mansion = r(80, 95) * 10;
    const all = [...prices, mansion];
    return { prompt: `House prices in a street (in $10 000s) include one mansion at ${mansion}. What is the median price, in $10 000s?`, answer: median(all), steps: [`Order the ${all.length} prices; the median is the 5th.`, `Median = ${median(all)}. The mean (${rounded(sum(all) / all.length, 1)}) is pulled up by the mansion.`], visual: dataVisual("House prices ($10 000s)", all) };
  },
  (r) => {
    const cases: [string, string, string][] = [
      ["The largest value is made much larger.", "Mean only", "The mean uses every value; the middle value is unchanged."],
      ["Every value is increased by 5.", "Both", "Every value shifts, so mean and median both increase by 5."],
      ["A value equal to the mean is added to a data set.", "Neither", "The total and count rise in step, and the middle stays balanced in this case."],
      ["The smallest value is made even smaller.", "Mean only", "The mean drops, but the middle value stays the same."],
    ];
    const [text, answer, why] = pick(r, cases.slice(0, 2).concat(cases.slice(3)));
    return { prompt: `${text} Which of the mean and median change?`, answer, choices: ["Mean only", "Median only", "Both", "Neither"], steps: [why, "The median depends only on the middle position."] };
  },
];
const chooseSummary: Form[] = [
  (r) => {
    const cases: [string, "Mean" | "Median" | "Mode", string][] = [
      ["Weekly incomes in a town include a few very high earners.", "Median", "Outliers pull the mean, so the median is more typical."],
      ["A shoe shop wants to know which size to stock most of.", "Mode", "The most common size matters most."],
      ["Test scores are symmetric with no outliers.", "Mean", "With no outliers the mean uses all the data well."],
      ["Favourite colours of a class are recorded.", "Mode", "Categorical data only has a mode."],
      ["House prices in a suburb include one mansion.", "Median", "The mansion would distort the mean."],
    ];
    const [text, answer, why] = pick(r, cases);
    return { prompt: `${text} Which summary best describes a typical value?`, answer, choices: ["Mean", "Median", "Mode"], steps: [why, `So use the ${answer.toLowerCase()}.`] };
  },
  (r) => {
    const xs = [...list(r, 8, 8, 15), 60 + r(0, 30)];
    return { prompt: "These are minutes spent on homework, including one outlier. Find the median, which describes a typical student better than the mean.", answer: median(xs), unit: "min", steps: [`Order: ${sorted(xs).join(", ")}.`, `The 5th value is ${median(xs)}.`], visual: dataVisual("Homework (minutes)", xs) };
  },
  (r) => {
    const modes = ["Walk", "Bus", "Car", "Bike"], cs = modes.map(() => r(3, 15));
    const top = Math.max(...cs);
    if (cs.filter((c) => c === top).length > 1) cs[cs.indexOf(top)]++;
    const answer = modes[cs.indexOf(Math.max(...cs))];
    return { prompt: "What is the modal way of travelling to school?", answer, input: "text", steps: ["The mode is the category with the highest frequency.", `${answer} has ${Math.max(...cs)} students.`], visual: table("Travel to school", ["Method", ...modes], [["Students", ...cs]]) };
  },
  (r) => {
    const xs = [...wholeMean(r, 6, 8, 16)];
    const out = 70 + r(0, 20);
    const ys = [...xs, out];
    return { prompt: "One outlier is in these data. By how much is the mean greater than the median? Round to one decimal place.", answer: rounded(sum(ys) / 7 - median(ys), 1), steps: [`Mean = ${sum(ys)} ÷ 7 = ${rounded(sum(ys) / 7, 2)}. Median = ${median(ys)}.`, `Difference: ${rounded(sum(ys) / 7 - median(ys), 1)}. The outlier pulls the mean up.`], visual: dataVisual("Data", ys) };
  },
  (r) => {
    const mode = r(7, 9), others = [6, 7, 8, 9, 10, 11].filter((h) => h !== mode).sort(() => 0).slice(r(0, 2)).slice(0, 3), xs = [others[0], mode, others[1], mode, others[2]];
    return { prompt: "Sam's working hours for five days are shown. Find the mean, median and mode.", answer: `${rounded(sum(xs) / 5, 2)}, ${median(xs)}, ${mode}`, input: "list", labels: ["Mean", "Median", "Mode"], steps: [`Mean = ${sum(xs)} ÷ 5 = ${rounded(sum(xs) / 5, 2)}.`, `Ordered: ${sorted(xs).join(", ")}; median ${median(xs)}; mode ${mode}.`], visual: table("Hours worked", ["Day", "Mon", "Tue", "Wed", "Thu", "Fri"], [["Hours", ...xs]]) };
  },
];

/* ---------- Week 8: plan an investigation ---------- */
const questionPopulation: Form[] = [
  (r) => {
    const qs: [string, string[], string][] = [
      ["How long do Year 8 students at our school spend on homework each night?", ["All Year 8 students at our school", "All students in Australia", "Our teachers", "Year 8 students who do homework"], "The question is about every Year 8 student at the school."],
      ["What is the most popular lunch item in our canteen?", ["Students who buy lunch at our canteen", "All Australians", "Canteen staff", "Students who bring lunch from home"], "The question is about people who buy from the canteen."],
    ];
    const [q, options, why] = pick(r, qs);
    return { prompt: `Investigation question: "${q}" What is the target population?`, answer: options[0], choices: options, steps: ["The population is everyone the question is about.", why] };
  },
  (r) => {
    const classes = r(4, 9), size = r(22, 29);
    return { prompt: `A question is about all Year 8 students at a school with ${classes} Year 8 classes of ${size}. What is the population size?`, answer: classes * size, unit: "students", steps: ["Every Year 8 student is in the population.", `${classes} × ${size} = ${classes * size}.`] };
  },
  (r) => {
    const qs: [string, boolean][] = [
      ["Are you rich?", false],
      ["How many hours did you sleep last night?", true],
      ["Are you old?", false],
      ["How many siblings do you have?", true],
      ["You like sport, don't you?", false],
      ["How many minutes does your trip to school take?", true],
    ];
    const [q, good] = pick(r, qs);
    return yesNo(`Is "${q}" a good survey question?`, good, [good ? "It asks for a clear, measurable fact." : "It is vague or leading, so answers cannot be compared fairly.", good ? "So it is suitable." : "Rewrite it with a clear measurable answer."]);
  },
  (r) => {
    const pop = 10 * r(10, 30), p = pick(r, [10, 20]);
    return { prompt: `A sample will be ${p}% of a population of ${pop}. How many people should be sampled?`, answer: (pop * p) / 100, unit: "people", steps: [`${p}% of ${pop}.`, `= ${(pop * p) / 100}.`] };
  },
  (r) => {
    const t = pick(r, TOPICS), classes = r(4, 8), per = r(3, 6);
    return { prompt: `To study ${t}, ${per} students are chosen at random from each of ${classes} classes. What is the sample size?`, answer: classes * per, unit: "students", steps: [`${per} from each of ${classes} classes.`, `${per} × ${classes} = ${classes * per}.`] };
  },
];
const ethicalFair: Form[] = [
  (r) => {
    const items: [string, boolean][] = [
      ["collect students' full names and home addresses for a survey about favourite sports", false],
      ["keep survey responses anonymous", true],
      ["ask permission before surveying younger students", true],
      ["share individual answers publicly with names attached", false],
      ["only collect the information needed to answer the question", true],
    ];
    const [text, ok] = pick(r, items);
    return yesNo(`Is it ethical to ${text}?`, ok, [ok ? "This protects people's privacy and rights." : "This collects or shares personal information that is not needed.", ok ? "So it is ethical." : "So it is not ethical."]);
  },
  (r) => {
    const boys = 10 * r(10, 20), girls = 10 * r(10, 20), total = boys + girls, size = pick(r, [20, 30, 40].filter((s) => (boys * s) % total === 0));
    if (size === undefined) return { prompt: `A school has 120 boys and 180 girls. A sample of 50 is taken in proportion. How many girls are chosen?`, answer: 30, unit: "girls", steps: ["Girls are 180/300 = 3/5 of the school.", "3/5 × 50 = 30."] };
    return { prompt: `A school has ${boys} boys and ${girls} girls. A sample of ${size} is taken in proportion. How many boys and girls are chosen?`, answer: `${(boys * size) / total}, ${(girls * size) / total}`, input: "list", labels: ["Boys", "Girls"], steps: [`Boys: ${boys}/${total} × ${size} = ${(boys * size) / total}.`, `Girls: ${girls}/${total} × ${size} = ${(girls * size) / total}.`] };
  },
  (r) => {
    const t = pick(r, TOPICS);
    return { prompt: `Which sampling plan is fairest for a study of ${t} across the whole school?`, answer: "Randomly choose students from every year level", choices: ["Randomly choose students from every year level", "Ask your own class", "Ask students at the school gate at 8 am", "Ask for volunteers on social media"], steps: ["Every group in the population should have a fair chance.", "Random selection from every year level avoids selection bias."] };
  },
  (r) => {
    const t = pick(r, TOPICS);
    return { prompt: `A survey about ${t} asks for these details. Which one should be left out?`, answer: "Home address", choices: ["Home address", "Year level", "Answer to the survey question", "Whether the answer is for a school day"], steps: ["Collect only what is needed to answer the question.", "A home address is personal and not needed."] };
  },
  (r) => {
    const responses = 10 * r(5, 20), anon = r(0, 1) === 1;
    return yesNo(`Students are asked how often they break school rules. The ${responses} responses ${anon ? "are anonymous" : "include names written on each form"}. Are students likely to answer honestly?`, anon, [anon ? "Anonymity protects students, so answers are more honest." : "Names make students less likely to admit breaking rules.", "Dishonest answers cause measurement bias."]);
  },
];
const collectRecord: Form[] = [
  (r) => {
    const n = r(6, 19), fives = Math.floor(n / 5), ones = n % 5;
    return { prompt: `A tally shows ${"|||| ".repeat(fives).trim()}${ones ? " " + "|".repeat(ones) : ""} (each |||| is a group of five). What is the frequency?`, answer: n, steps: [`${fives} group${fives === 1 ? "" : "s"} of five and ${ones} single mark${ones === 1 ? "" : "s"}.`, `${fives} × 5 + ${ones} = ${n}.`] };
  },
  (r) => {
    const h = r(1, 2), m = pick(r, [5, 10, 15, 20, 25, 30, 40, 45, 50]);
    return { prompt: `One student wrote their travel time as ${h} h ${m} min. Everyone else used minutes. Convert this time to minutes.`, answer: h * 60 + m, unit: "min", steps: ["Record every value in the same unit.", `${h} × 60 + ${m} = ${h * 60 + m} minutes.`] };
  },
  (r) => {
    const lo = 10 * r(12, 14), hi = lo + 10 * r(4, 7) - r(1, 4), w = 10;
    return { prompt: `Heights range from ${lo} cm to ${hi} cm. They are grouped in intervals of ${w} cm starting at ${lo} (${lo}–${lo + 9}, …). How many intervals are needed?`, answer: Math.floor((hi - lo) / w) + 1, steps: [`The last interval must include ${hi}.`, `Intervals: ${Array.from({ length: Math.floor((hi - lo) / w) + 1 }, (_, i) => `${lo + i * w}–${lo + i * w + 9}`).join(", ")}.`] };
  },
  (r) => {
    const cases: [string, string, string][] = [
      ["the number of siblings of 25 students", "Dot plot", "Small discrete counts are clear as stacked dots."],
      ["the heights of 300 students", "Grouped frequency graph", "Many continuous values are best grouped into intervals."],
      ["how a puppy's mass changes each week", "Line graph", "A line graph shows change over time."],
    ];
    const [data, answer, why] = pick(r, cases);
    return { prompt: `Which display best suits ${data}?`, answer, choices: ["Dot plot", "Grouped frequency graph", "Line graph"], steps: [why, `So use a ${answer.toLowerCase()}.`] };
  },
  (r) => {
    const items: [string, "Numerical" | "Categorical"][] = [["favourite fruit", "Categorical"], ["number of pets", "Numerical"], ["travel method", "Categorical"], ["height in cm", "Numerical"], ["eye colour", "Categorical"], ["minutes of sleep", "Numerical"]];
    const [item, answer] = pick(r, items);
    return { prompt: `Is ${item} numerical or categorical data?`, answer, choices: ["Numerical", "Categorical"], steps: ["Numerical data are numbers that can be counted or measured; categorical data are labels.", `${item[0].toUpperCase() + item.slice(1)} is ${answer.toLowerCase()}.`] };
  },
];

/* ---------- Week 9: conduct and report ---------- */
const organise: Form[] = [
  (r) => {
    const opts = ["Walk", "Bus", "Car", "Bike"], xs = Array.from({ length: 16 }, () => pick(r, opts)), k = pick(r, [...new Set(xs)]);
    return { prompt: `These are survey responses about travel to school. How many students chose ${k}?`, answer: xs.filter((x) => x === k).length, steps: [`Tally the responses.`, `${k}: ${xs.filter((x) => x === k).length}.`], visual: table("Responses", ["Students 1–4", "Students 5–8", "Students 9–12", "Students 13–16"], [0, 1, 2, 3].map((row) => [0, 1, 2, 3].map((col) => xs[col * 4 + row]))) };
  },
  (r) => {
    const xs = list(r, 15, 0, 29), lo = pick(r, [0, 10, 20]);
    return { prompt: `Group these quiz scores in intervals 0–9, 10–19 and 20–29. How many scores are in ${lo}–${lo + 9}?`, answer: xs.filter((x) => x >= lo && x <= lo + 9).length, steps: [`Count scores from ${lo} to ${lo + 9}.`, `${xs.filter((x) => x >= lo && x <= lo + 9).length}.`], visual: dataVisual("Quiz scores", xs) };
  },
  (r) => {
    const cs = [r(2, 9), r(2, 9), r(2, 9), r(2, 9)];
    return { prompt: "How many responses are recorded in this frequency table altogether?", answer: sum(cs), steps: ["Add the frequencies.", `${cs.join(" + ")} = ${sum(cs)}.`], visual: table("Favourite season", ["Season", "Summer", "Autumn", "Winter", "Spring"], [["Frequency", ...cs]]) };
  },
  (r) => {
    const cs = [r(2, 12), r(2, 12), r(2, 12), r(2, 12)], k = r(0, 3), names = ["Summer", "Autumn", "Winter", "Spring"];
    return { prompt: `What percentage of responses chose ${names[k]}, to one decimal place?`, answer: pct(cs[k], sum(cs)), unit: "%", steps: [`${cs[k]} of ${sum(cs)} responses.`, `${cs[k]} ÷ ${sum(cs)} × 100 = ${pct(cs[k], sum(cs))}%.`], visual: table("Favourite season", ["Season", ...names], [["Frequency", ...cs]]) };
  },
  (r) => {
    const xs = list(r, 11, 1, 40);
    return { prompt: "Order these results and find the median.", answer: median(xs), steps: [`Ordered: ${sorted(xs).join(", ")}.`, `With 11 values the median is the 6th: ${median(xs)}.`], visual: dataVisual("Collected data", xs) };
  },
];
const analyse: Form[] = [
  (r) => {
    const xs = wholeMean(r, 8, 20, 60);
    return { prompt: "Find the mean of the sample.", answer: sum(xs) / 8, steps: [`Sum: ${sum(xs)}.`, `${sum(xs)} ÷ 8 = ${sum(xs) / 8}.`], visual: dataVisual("Minutes of exercise", xs, "min") };
  },
  (r) => {
    const xs = list(r, 10, 120, 185);
    return { prompt: "Find the range of the sample.", answer: range(xs), unit: "cm", steps: [`${Math.max(...xs)} − ${Math.min(...xs)}.`, `= ${range(xs)} cm.`], visual: dataVisual("Arm spans", xs, "cm") };
  },
  (r) => {
    const a = list(r, 9, 1, 9), b = list(r, 9, 3, 12);
    if (median(a) === median(b)) b[0] = 12;
    const higher = median(b) > median(a) ? "Year 9" : "Year 7";
    return { prompt: "Which group has the higher median screen time? Type Year 7 or Year 9.", answer: higher, input: "text", steps: [`Year 7 median: ${median(a)}. Year 9 median: ${median(b)}.`, `${higher} is higher.`], visual: dots("Hours of screen time per day", "Hours", 1, 12, [{ label: "Year 7", values: a }, { label: "Year 9", values: b }]) };
  },
  (r) => {
    const n = 40, a = r(6, 30), pop = 40 * r(10, 30);
    return { prompt: `${a} of the ${n} sampled students bring a water bottle. Estimate the number of the school's ${pop} students who do.`, answer: (a / n) * pop, unit: "students", steps: [`Proportion: ${a}/${n}.`, `${a}/${n} × ${pop} = ${(a / n) * pop}.`] };
  },
  (r) => {
    const vals = [1, 2, 3, 4, 5, 6], cs = vals.map(() => r(1, 8)), top = Math.max(...cs);
    if (cs.filter((c) => c === top).length > 1) cs[cs.indexOf(top)]++;
    return { prompt: "What is the most common number of people per household in the sample?", answer: vals[cs.indexOf(Math.max(...cs))], steps: ["Find the tallest bar.", `${vals[cs.indexOf(Math.max(...cs))]} people (${Math.max(...cs)} households).`], visual: freqGraph("Household size", vals, cs, "People in household") };
  },
];
const report: Form[] = [
  (r) => {
    const a = r(18, 32), pop = 50 * r(10, 30);
    const good = `About ${Math.round((100 * a) / 50)}% of the sample walk, so roughly ${(a / 50) * pop} of the ${pop} students may walk.`;
    return { prompt: `${a} of a random sample of 50 students walk to school. Which conclusion is best?`, answer: good, choices: [good, `Exactly ${(a / 50) * pop} students walk to school.`, `${a} students at the school walk.`, "No conclusion is possible from a sample."], steps: ["A sample supports an estimate, not an exact count.", "Good reports use words such as 'about' or 'roughly'."] };
  },
  (r) => {
    const p = r(30, 60), m = pick(r, [4, 5, 6]), pop = 100 * r(5, 15);
    return { prompt: `Your survey estimates ${p}% ± ${m}% of ${pop} students want a later start. Report the likely number of students as a range.`, answer: `${((p - m) * pop) / 100}, ${((p + m) * pop) / 100}`, input: "list", labels: ["Lowest", "Highest"], steps: [`${p - m}% of ${pop} = ${((p - m) * pop) / 100}.`, `${p + m}% of ${pop} = ${((p + m) * pop) / 100}.`] };
  },
  (r) => {
    const xs = list(r, 20, 0, 6), at = xs.filter((x) => x >= 3).length;
    return yesNo(`Claim: "At least half the sample ate 3 or more pieces of fruit." Does the data support this?`, at >= 10, [`${at} of 20 ate 3 or more.`, at >= 10 ? "That is at least half." : "That is less than half."], { visual: dots("Pieces of fruit eaten yesterday", "Pieces", 0, 6, [{ values: xs }]) });
  },
  (r) => {
    const n = 50, a = r(10, 40), pop = 50 * r(10, 40);
    return { prompt: `${a} of ${n} sampled students support a new club. About how many of the school's ${pop} students might support it?`, answer: (a / n) * pop, unit: "students", steps: [`${a}/${n} = ${(100 * a) / n}%.`, `${(100 * a) / n}% of ${pop} ≈ ${(a / n) * pop}.`] };
  },
  (r) => {
    const flaws: [string, string][] = [
      ["The survey only asked students in the library.", "The sample was not random, so it may not represent the school."],
      ["Only 6 students were asked.", "The sample is too small to give a reliable estimate."],
      ["The question asked: 'Don't you love the new timetable?'", "The leading question may have biased the answers."],
    ];
    const [text, answer] = pick(r, flaws);
    return { prompt: `A report says: "Most students like the new timetable." ${text} What is the main limitation?`, answer, choices: flaws.map(([, a]) => a), steps: ["A report should acknowledge how the data could be biased or uncertain.", answer] };
  },
];

const W: Form[][] = [
  censusOrSample, experimentObservation, practicalLimits,
  randomSample, spotBias, precision,
  sources, randomVsNon, chooseMethod,
  display, centreSpread, conclusions,
  sameSize, proportions, estimateCount,
  sizeRuns, compareVariation, uncertainty,
  changeMean, changeMedianRange, chooseSummary,
  questionPopulation, ethicalFair, collectRecord,
  organise, analyse, report,
];
/** Week 10 reviews earlier lessons: data collection, distributions and samples, then investigations. */
const review = (range: Form[][]): LessonFactory => (seed) => {
  const r = random(seed ^ 0x2c1b3c6d);
  return forms(seed, range[r(0, range.length - 1)]);
};
export const statisticsLessons: LessonFactory[] = [
  ...W.map((l): LessonFactory => (seed) => forms(seed, l)),
  review(W.slice(0, 9)),
  review(W.slice(9, 21)),
  review(W.slice(21, 27)),
];
