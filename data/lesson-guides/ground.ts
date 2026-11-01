// Ground Level "watch me" guides, one per lesson. A five-year-old may not read yet, so each
// guide is one or two spoken sentences and a picture. Keys are "realm:week:lesson".
export type GroundItem = "star" | "gem" | "orb" | "block" | "dot";
export type GroundPanel = {
  big?: string;
  note?: string;
  win?: boolean;
  /** n objects; b more in a second colour; cross of them taken away; dice arranges them like a dice face. */
  items?: { kind: GroundItem; n: number; b?: number; cross?: number; dice?: boolean; cols?: number };
  /** A repeating pattern of colours. "?" is the next one to find. */
  seq?: ("red" | "blue" | "yellow" | "green" | "?")[];
  /** Path under /images/measurelands; scale sets its size so objects compare truthfully. */
  img?: string;
  scale?: number;
  days?: { highlight: number[]; from?: number; to?: number };
  balance?: "left" | "level";
  /** A container of water: 0 is empty, 1 is full. */
  fill?: number;
};
/** join sits between panels; result is the sign before the last panel when it differs. */
export type GroundGuide = { say: string; panels: GroundPanel[]; join?: string; result?: string; lineUp?: boolean };

const big = (b: string, note?: string, win?: boolean): GroundPanel => ({ big: b, note, win });
const num = (...n: (string | number)[]) => n.map(v => big(String(v)));
const img = (path: string, note?: string, scale = 1, win?: boolean): GroundPanel => ({ img: path, note, scale, win });
const items = (kind: GroundItem, n: number, note?: string, extra: Partial<NonNullable<GroundPanel["items"]>> = {}): GroundPanel => ({ items: { kind, n, ...extra }, note });
const W2 = "week2-3d", MO = "measure-objects-3d", C = "containers-3d", D = "duration-3d", T = "timeofday-3d", R = "routine-3d", CAL = "calendar-3d";

export const GROUND_GUIDES: Record<string, GroundGuide> = {
  "number:1:1": { say: "These are the numbers 1 to 5. Look at each one and say its name.", panels: num(1, 2, 3, 4, 5) },
  "number:1:2": { say: "Touch each star once and count. 1, 2, 3, 4. There are 4 stars.", panels: [items("star", 4), big("4", undefined, true)], join: "→" },
  "number:1:3": { say: "Every number has a name. This is 3. Its name is three.", panels: [big("3", "three"), big("4", "four"), big("5", "five")] },
  "number:2:1": { say: "These are the numbers 6 to 10. Look at each one and say its name.", panels: num(6, 7, 8, 9, 10) },
  "number:2:2": { say: "Count each gem once. The last number you say tells you how many. 7 gems.", panels: [items("gem", 7, undefined, { cols: 4 }), big("7", undefined, true)], join: "→" },
  "number:2:3": { say: "Listen for the number. When you hear eight, find 8 and tap it.", panels: [big("8", "eight"), items("dot", 8, undefined, { cols: 4 })], join: "=" },
  "number:3:1": { say: "Count up like a rocket. Each number is one more. 7, 8, 9, 10!", panels: num(7, 8, 9, 10), join: "→" },
  "number:3:2": { say: "Count back to blast off. 5, 4, 3, 2, 1, blast off!", panels: [...num(5, 4, 3, 2, 1), img("week1-3d/rocket.png", undefined, .8)], join: "→" },
  "number:3:3": { say: "Count the stars, then find the number that matches. 6 stars match the number 6.", panels: [items("star", 6, undefined, { cols: 3 }), big("6", undefined, true)], join: "=" },
  "number:4:1": { say: "You can see how many without counting. This dot pattern is 5, just like a dice.", panels: [items("dot", 3, undefined, { dice: true }), items("dot", 4, undefined, { dice: true }), items("dot", 5, undefined, { dice: true })] },
  "number:4:2": { say: "Look quickly. You can see 3 gems straight away.", panels: [items("gem", 3), big("3", undefined, true)], join: "→" },
  "number:4:3": { say: "These dots and this number go together. 4 dots match the number 4.", panels: [items("dot", 4, undefined, { dice: true }), big("4", undefined, true)], join: "=" },
  "number:5:1": { say: "This group has more. That group has less.", panels: [items("star", 5, "more", { cols: 3 }), items("star", 2, "less")] },
  "number:5:2": { say: "Equal means the same. 3 here and 3 there.", panels: [items("gem", 3), items("gem", 3)], join: "=" },
  "number:5:3": { say: "Put them in order. Start with the least and finish with the most.", panels: [items("dot", 1, "least"), items("dot", 3), items("dot", 5, "most", { cols: 3 })], join: "→" },
  "number:6:1": { say: "You can make a number in different ways. 4 and 1 make 5. 3 and 2 make 5 too.", panels: [items("block", 4, "4 and 1", { b: 1 }), items("block", 3, "3 and 2", { b: 2 })] },
  "number:6:2": { say: "Fill the tray to make 10. 7 and 3 make 10. 6 and 4 make 10 too.", panels: [items("block", 7, "7 and 3", { b: 3, cols: 5 }), items("block", 6, "6 and 4", { b: 4, cols: 5 })] },
  "number:6:3": { say: "6 and 4 are the parts. Put them together and 10 is the whole.", panels: [items("block", 6, "part", { cols: 3 }), items("block", 4, "part", { cols: 2 }), big("10", "whole", true)], join: "→" },
  "number:7:1": { say: "Count on past 10. 10 and 4 more is 14.", panels: [items("block", 10, undefined, { b: 4, cols: 5 }), big("14", undefined, true)], join: "→" },
  "number:7:2": { say: "Teen numbers are 10 and some more. 13 is 10 and 3.", panels: [items("block", 10, "ten", { cols: 5 }), items("block", 3, "three"), big("13", undefined, true)], join: "→" },
  "number:7:3": { say: "Put things in tidy rows. Then they are easy to count. Here are 13.", panels: [items("gem", 13, "13 gems", { cols: 5 })] },
  "number:8:1": { say: "Count along to find the missing number. 4, 5, 6, 7. It was 6!", panels: [big("4"), big("5"), big("6", undefined, true), big("7")], join: "→" },
  "number:8:2": { say: "Start on 3 and move forward 1. Now you are on 4.", panels: [big("3", "start"), big("4", "move 1", true)], join: "→" },
  "number:8:3": { say: "Put numbers in order. Start with the smallest. 9, then 12, then 18.", panels: [big("9"), big("12"), big("18")], join: "→" },
  "number:9:1": { say: "3 gems. 2 more come along. Count them all. Now there are 5.", panels: [items("gem", 3), items("gem", 2), big("5", undefined, true)], join: "+", result: "=" },
  "number:9:2": { say: "5 stars. Take away 2. There are 3 left.", panels: [items("star", 5, undefined, { cross: 2, cols: 3 }), big("3", "left", true)], join: "→" },
  "number:9:3": { say: "Look at before and after. It was 4. Now it is 6. 2 more were added.", panels: [items("orb", 4, "before", { cols: 2 }), items("orb", 6, "after", { cols: 3 }), big("2", "more", true)], join: "→" },
  "number:10:1": { say: "Share fairly. Give one to each group, again and again. Everyone gets the same.", panels: [items("orb", 6, undefined, { cols: 3 }), items("orb", 3, "group 1"), items("orb", 3, "group 2")], join: "→" },
  "number:10:2": { say: "Make equal groups. Here are 6 gems in groups of 2.", panels: [items("gem", 2), items("gem", 2), items("gem", 2)] },
  "number:10:3": { say: "Sharing means giving to each group. Grouping means packing the same number each time.", panels: [items("star", 3, "share"), items("star", 3, "share"), items("gem", 2, "pack"), items("gem", 2, "pack")] },
  "number:11:1": { say: "Find the part that repeats. Red, blue. Red, blue. Red, blue.", panels: [{ seq: ["red", "blue", "red", "blue", "red", "blue"] }] },
  "number:11:2": { say: "Say the pattern and keep it going. Red, blue, red, blue. Next is red!", panels: [{ seq: ["red", "blue", "red", "blue", "?"] }, { seq: ["red"], win: true, note: "next" }], join: "→" },
  "number:11:3": { say: "Make your own pattern. Choose your colours and repeat them.", panels: [{ seq: ["yellow", "green", "yellow", "green", "yellow", "green"] }] },
  "number:12:1": { say: "Show what you know. Look fast, count carefully and find the number.", panels: [items("dot", 4, undefined, { dice: true }), big("4", undefined, true)], join: "=" },
  "number:12:2": { say: "Build a number your own way. 5 and 3 make 8. 4 and 4 make 8 too.", panels: [items("block", 5, "5 and 3", { b: 3, cols: 4 }), items("block", 4, "4 and 4", { b: 4, cols: 4 })] },
  "number:12:3": { say: "This is your final mission. Use everything you have learned. You can do it!", panels: [items("gem", 3), items("gem", 2), big("5", undefined, true)], join: "+", result: "=" },

  "measurement:1:1": { say: "Line them up at the start. The one that goes further is longer.", panels: [img(`${MO}/snake.png`, "longer", 1, true), img(`${MO}/worm.png`, "shorter", .45)], lineUp: true },
  "measurement:1:2": { say: "Put them in order, from shortest to longest.", panels: [img(`${MO}/worm.png`, "shortest", .45), img(`${MO}/crayon.png`, "next", .7), img(`${MO}/snake.png`, "longest", 1)], lineUp: true },
  "measurement:1:3": { say: "Count the equal steps along each path. 6 steps is longer than 4 steps.", panels: [items("block", 6, "6 steps", { cols: 6 }), items("block", 4, "4 steps", { cols: 4 })] },
  "measurement:2:1": { say: "An elephant is heavy. A feather is light.", panels: [img(`${W2}/elephant.png`, "heavy", 1.15, true), img(`${W2}/feather-v2.png`, "light", .7)] },
  "measurement:2:2": { say: "Put them in order, from lightest to heaviest.", panels: [img(`${W2}/feather-v2.png`, "lightest", .7), img(`${W2}/apple.png`, undefined, .8), img(`${W2}/rock.png`, "heaviest", 1)], join: "→" },
  "measurement:2:3": { say: "The heavy side goes down. When the scales are level, both sides are the same.", panels: [{ balance: "left", note: "left is heavier" }, { balance: "level", note: "the same" }] },
  "measurement:3:1": { say: "A bucket holds more. A cup holds less.", panels: [img(`${C}/bucket.png`, "holds more", 1.15, true), img(`${C}/cup.png`, "holds less", .6)] },
  "measurement:3:2": { say: "Put them in order, from holds the least to holds the most.", panels: [img(`${C}/cup.png`, "least", .6), img(`${C}/bottle.png`, undefined, .85), img(`${C}/bucket.png`, "most", 1.15)], join: "→" },
  "measurement:3:3": { say: "Look at the water. This one is empty. This one is half full. This one is full.", panels: [{ fill: 0, note: "empty" }, { fill: .5, note: "half full" }, { fill: 1, note: "full" }] },
  "measurement:4:1": { say: "Washing your hands is quick. A school day takes much longer.", panels: [img(`${D}/school-day.png`, "takes longer", 1.1, true), img(`${D}/wash-hands.png`, "quick", .9)] },
  "measurement:4:2": { say: "Put them in order, from the shortest time to the longest time.", panels: [img(`${D}/brush-teeth.png`, "shortest"), img(`${D}/lunch.png`), img(`${D}/school-day.png`, "longest")], join: "→" },
  "measurement:4:3": { say: "Quick things are over soon. Slow things take a long time.", panels: [img(`${D}/shoes.png`, "quick"), img(`${D}/sleeping.png`, "slow")] },
  "measurement:5:1": { say: "There are 7 days in a week. Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday.", panels: [{ days: { highlight: [] } }] },
  "measurement:5:2": { say: "The days always go in the same order. After Monday comes Tuesday.", panels: [{ days: { highlight: [1], from: 0, to: 3 } }] },
  "measurement:5:3": { say: "Monday to Friday are weekdays. Saturday and Sunday are the weekend.", panels: [img("days-3d/weekday.png", "weekdays"), img("days-3d/weekend.png", "weekend")] },
  "measurement:6:1": { say: "A day has parts. Morning, afternoon, evening and night.", panels: [img(`${T}/morning.png`, "morning"), img(`${T}/afternoon.png`, "afternoon"), img(`${T}/evening.png`, "evening"), img(`${T}/night.png`, "night")], join: "→" },
  "measurement:6:2": { say: "We do different things at different times. Breakfast is in the morning. Dinner is in the evening.", panels: [img(`${T}/breakfast.png`, "morning"), img(`${T}/dinner.png`, "evening")] },
  "measurement:6:3": { say: "Your day has an order. Wake up, go to school, then go to bed.", panels: [img(`${R}/routine-wakeup.png`, "first"), img(`${R}/routine-school.png`, "next"), img(`${R}/routine-bed.png`, "last")], join: "→" },
  "measurement:7:1": { say: "Today is the day we are in right now.", panels: [img(`${CAL}/today.png`, "today", 1.1, true)] },
  "measurement:7:2": { say: "Yesterday was the day before today. Tomorrow is the day after today.", panels: [img(`${CAL}/yesterday.png`, "yesterday"), img(`${CAL}/today.png`, "today"), img(`${CAL}/tomorrow.png`, "tomorrow")], join: "→" },
  "measurement:7:3": { say: "Say the days in order to find what comes next. After Tuesday comes Wednesday.", panels: [{ days: { highlight: [2], from: 0, to: 3 } }] },
  "measurement:8:1": { say: "Think about long, heavy and holds more. Look carefully at each picture.", panels: [img(`${MO}/snake.png`, "longer", 1), img(`${W2}/rock.png`, "heavier", .9), img(`${C}/bucket.png`, "holds more", 1)] },
  "measurement:8:2": { say: "Think about time. What is quick, what takes longer, and when does it happen?", panels: [img(`${D}/wash-hands.png`, "quick"), img(`${D}/school-day.png`, "longer"), img(`${T}/morning.png`, "morning")] },
  "measurement:8:3": { say: "This is your big adventure. Use everything you know about measuring. You can do it!", panels: [img(`${MO}/snake.png`, "long", .9), img(`${W2}/rock.png`, "heavy", .9), img(`${R}/routine-school.png`, "time", .9)] },
};

export function getGroundGuide(realm: string, week: number | undefined, lesson: number | undefined): GroundGuide | null {
  return (week && lesson && GROUND_GUIDES[`${realm}:${week}:${lesson}`]) || null;
}
