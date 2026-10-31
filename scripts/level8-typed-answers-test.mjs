import assert from "node:assert/strict";
import { LEVEL8_FACTORIES, level8Question } from "../data/activities/level8/questions.ts";
import { level7Answer, markLevel7Answer } from "../lib/level7-answer.ts";

// Marks every Level 8 typed expression the way students write it: correct
// answers must pass however they are arranged, and wrong answers must fail.
const SEEDS = Number(process.env.SEEDS ?? 60);

const split = (answer) => (answer.replaceAll("−", "-").replace(/\s+/g, "").match(/[+-]?[^+-]+/g) ?? []);
const sign = (term) => (/^[+-]/.test(term) ? term : `+${term}`);
const join = (terms) => terms.map(sign).join(" ").replace(/^\+\s?/, "").replace(/([+-])(?=[^ ])/g, (m, s, i) => (i === 0 ? s : `${s} `));
const flipLetters = (term) => term.replace(/([a-z])([a-z])/g, "$2$1");
const plain = (answer) => !/[()=/^²³]/.test(answer);

const failures = new Map();
let marked = 0;
const fail = (kind, where, prompt, expected, typed) => {
  const key = `${kind}|${where}`;
  if (!failures.has(key)) failures.set(key, { kind, where, prompt, expected, typed });
};

for (const [realm, factories] of Object.entries(LEVEL8_FACTORIES)) {
  for (let week = 1; week <= factories.length / 3; week += 1) {
    for (const lesson of [1, 2, 3]) {
      for (let seed = 0; seed < SEEDS; seed += 1) {
        const q = level8Question(realm, week, lesson, seed * 7919 + 17);
        const spec = level7Answer(q);
        if (!spec || spec.kind !== "expression") continue;
        const where = `${realm} W${week} L${lesson}`;
        const expected = spec.expected;
        const typedRight = [expected, expected.replaceAll("−", "-"), expected.replace(/\s+/g, "")];
        if (plain(expected) && spec.format !== "factorised") {
          const terms = split(expected);
          if (terms.length > 1) typedRight.push(join([...terms].reverse()));
          if (/[a-z]{2}/.test(expected)) typedRight.push(join(terms.map(flipLetters)));
        }
        for (const typed of typedRight) {
          marked += 1;
          if (!markLevel7Answer(spec, typed)) fail("correct answer rejected", where, q.prompt, expected, typed);
        }
        const wrong = expected.replace(/\d+/, (digits) => String(Number(digits) + 1));
        if (wrong !== expected) {
          marked += 1;
          if (markLevel7Answer(spec, wrong)) fail("wrong answer accepted", where, q.prompt, expected, wrong);
        }
      }
    }
  }
}

for (const item of failures.values()) console.log(`${item.kind}: ${item.where} | ${item.prompt} | expected ${item.expected} | typed ${item.typed}`);
console.log(`${marked} typed answers marked; ${failures.size} lesson problems.`);
assert.equal(failures.size, 0);
console.log("PASS Level 8 typed expressions are marked correctly however students arrange them");
