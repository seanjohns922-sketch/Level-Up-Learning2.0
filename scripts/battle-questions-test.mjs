// Battle questions: every realm at every level makes 20 quick questions with whole-number answers that
// are actually right (checked by working each one out independently where the sum is in the prompt).
import assert from "node:assert/strict";
import { BATTLE_QUESTIONS, BATTLE_REALMS, battleQuestions } from "../lib/battle-questions.ts";

const solve = (prompt) => {
  // Plain sums like "12 × 7 = ?", "−3 + 9 = ?", "48 ÷ 6 = ?", "1/4 of 20 = ?", "25% of 40 = ?", "7² = ?", "2^5 = ?", "√49 = ?"
  let m;
  if ((m = /^(−?\d+) ([+−×÷]) (\d+) = \?$/.exec(prompt))) {
    const a = Number(m[1].replace("−", "-")), b = Number(m[3]);
    return m[2] === "+" ? a + b : m[2] === "−" ? a - b : m[2] === "×" ? a * b : a / b;
  }
  if ((m = /^1\/(\d+) of (\d+) = \?$/.exec(prompt))) return Number(m[2]) / Number(m[1]);
  if ((m = /^(\d+)% of (\d+) = \?$/.exec(prompt))) return (Number(m[1]) * Number(m[2])) / 100;
  if ((m = /^(\d+)² = \?$/.exec(prompt))) return Number(m[1]) ** 2;
  if ((m = /^(\d+)\^(\d+) = \?$/.exec(prompt))) return Number(m[1]) ** Number(m[2]);
  if ((m = /^√(\d+) = \?$/.exec(prompt))) return Math.sqrt(Number(m[1]));
  if ((m = /^(\d+)x \+ (\d+) = (\d+)\. x = \?$/.exec(prompt))) return (Number(m[3]) - Number(m[2])) / Number(m[1]);
  if ((m = /^Double (\d+) = \?$/.exec(prompt))) return Number(m[1]) * 2;
  if ((m = /mean\? ([\d, ]+)$/.exec(prompt))) { const d = m[1].split(", ").map(Number); return d.reduce((s, x) => s + x, 0) / d.length; }
  if ((m = /median\? ([\d, ]+)$/.exec(prompt))) { const d = m[1].split(", ").map(Number).sort((a, b) => a - b); return d[(d.length - 1) / 2]; }
  if ((m = /range\? ([\d, ]+)$/.exec(prompt))) { const d = m[1].split(", ").map(Number); return Math.max(...d) - Math.min(...d); }
  return null;
};

let checked = 0;
for (const realm of BATTLE_REALMS) {
  for (let level = 0; level <= 8; level++) {
    for (let seed = 1; seed <= 40; seed++) {
      const set = battleQuestions(realm, level, seed * 97 + level);
      assert.equal(set.length, BATTLE_QUESTIONS, `${realm} L${level}: 20 questions`);
      for (const { prompt, answer } of set) {
        assert.ok(Number.isInteger(answer) && answer >= -20 && answer <= 100000, `${realm} L${level}: "${prompt}" has a whole-number answer (${answer})`);
        assert.ok(prompt.length > 3 && prompt.length < 140, `${realm} L${level}: short prompt`);
        const worked = solve(prompt);
        if (worked !== null) { assert.equal(answer, worked, `${realm} L${level}: "${prompt}" = ${worked}, not ${answer}`); checked++; }
      }
      for (let i = 1; i < set.length; i++) assert.notEqual(set[i].prompt, set[i - 1].prompt, "no question twice in a row");
    }
  }
}
assert.ok(checked > 3000, `worked out ${checked} answers independently`);
// Same seed, same battle (so a take-turns battle can be replayed exactly).
assert.deepEqual(battleQuestions("number", 4, 123), battleQuestions("number", 4, 123));
// Harder at higher levels: Level 8 number answers are, on the whole, bigger than Prep's.
const avg = (realm, level) => battleQuestions(realm, level, 7, 200).reduce((s, x) => s + Math.abs(x.answer), 0) / 200;
assert.ok(avg("number", 8) > avg("number", 0) * 3, "number questions grow with level");
console.log(`battle questions: 6 realms × 9 levels × 40 battles all whole-number and correct (${checked} answers worked out independently)`);
// No repeats within a battle wherever the level has enough different questions to fill one.
let roomy = 0;
for (const realm of BATTLE_REALMS) for (let level = 0; level <= 8; level++) {
  const pool = new Set(battleQuestions(realm, level, 99, 400).map((x) => x.prompt)).size;
  if (pool < BATTLE_QUESTIONS * 2) continue;
  roomy++;
  const set = battleQuestions(realm, level, 4242 + level);
  assert.equal(new Set(set.map((x) => x.prompt)).size, set.length, `${realm} L${level}: no repeats`);
}
assert.ok(roomy > 30, `most levels have plenty of different questions (${roomy})`);
console.log(`battle questions: no repeats within a battle (${roomy} realm-levels checked)`);
