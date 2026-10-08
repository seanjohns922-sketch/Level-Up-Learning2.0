import { LEVEL8_PROGRAMS } from "../data/activities/level8/program.ts";
import assert from "node:assert/strict";
import { statSync, readFileSync } from "node:fs";
import { level8DemoHref, level8Background } from "../lib/level8-routes.ts";
import { tossTwoCoins, sampleCyclists } from "../lib/level8-investigations.ts";
import {
  LEVEL8_FACTORIES,
  level8Question,
  level8Quiz,
} from "../data/activities/level8/questions.ts";
import { LEVEL8_WEEK_COUNTS } from "../lib/level8-config.ts";
import {
  markLevel7Answer,
  level7Answer,
  level7SimplificationTip,
} from "../lib/level7-answer.ts";
import {
  isLessonQuestionSafe,
  isPracticeTaskSafe,
} from "../lib/task-safety.ts";
let count = 0,
  typed = 0;
for (const [realm, factories] of Object.entries(LEVEL8_FACTORIES)) {
  assert.equal(factories.length, LEVEL8_WEEK_COUNTS[realm] * 3);
  for (let week = 1; week <= LEVEL8_WEEK_COUNTS[realm]; week++) {
    for (let lesson = 1; lesson <= 3; lesson++) {
      const plan = LEVEL8_PROGRAMS[realm][week - 1].lessons[lesson - 1];
      for (let seed = 0; seed < 50; seed++) {
        const q = level8Question(realm, week, lesson, seed * 7919 + 17);
        const label = `${realm} w${week} l${lesson} seed${seed}`;
        assert(isLessonQuestionSafe(plan.activities[0], q), label + " unsafe");
        const spec = level7Answer(q);
        if (spec) {
          assert(
            markLevel7Answer(spec, q.answer),
            label + " rejects own answer",
          );
          typed++;
        } else
          assert(
            q.options.length >= 2 && q.options.includes(q.answer),
            label + " choices",
          );
        if (spec?.kind === "list")
          assert.equal(spec.labels.length, q.answer.split(",").length, label);
        assert(q.prompt.length < 310, label + " excessive reading");
        count++;
      }
    }
    if (week === LEVEL8_WEEK_COUNTS[realm]) {
      assert.throws(() => level8Quiz(realm, week));
      continue;
    }
    for (let attempt = 0; attempt < 3; attempt++) {
      const quiz = level8Quiz(realm, week, attempt);
      assert.equal(quiz.length, 15);
      for (let lesson = 1; lesson <= 3; lesson++)
        assert.equal(quiz.filter((q) => q.lessonTag === lesson).length, 5);
      assert.equal(
        new Set(
          quiz.map((q) =>
            JSON.stringify([
              q.prompt,
              q.cave7Visual,
              q.measurement8Visual,
              q.number8Visual,
              q.algebra8Visual,
              q.chance8Visual,
              q.space8Visual,
            ]),
          ),
        ).size,
        15,
      );
      for (const q of quiz)
        assert(
          isPracticeTaskSafe({
            kind: "level8Question",
            realm,
            question: q,
            prompt: q.prompt,
            speakText: q.prompt,
            answer: q.answer,
            options: q.options,
            feedback: { correct: q.explanation, wrong: q.explanation },
          }),
        );
    }
  }
}
const fraction = {
  kind: "fraction",
  expected: "1/2",
  prompt: "What fraction?",
};
assert(markLevel7Answer(fraction, "2/4"));
assert(level7SimplificationTip(fraction, "2/4"));
assert(!markLevel7Answer(fraction, "1/3"));
// Algebra form checks: equivalent is not enough when a question asks to expand or factorise.
const expandedSpec = { kind: "expression", expected: "6x + 15", prompt: "Expand 3(2x + 5).", format: "expanded" };
assert(markLevel7Answer(expandedSpec, "15+6x"));
assert(!markLevel7Answer(expandedSpec, "3(2x+5)"));
assert(!markLevel7Answer(expandedSpec, "4x+2x+15"));
const factorisedSpec = { kind: "expression", expected: "6(2x + 3)", prompt: "Factorise 12x + 18 fully.", format: "factorised" };
assert(markLevel7Answer(factorisedSpec, "6(3+2x)"));
assert(!markLevel7Answer(factorisedSpec, "3(4x+6)"));
assert(!markLevel7Answer(factorisedSpec, "12x+18"));
console.log(
  `${count} generated questions checked; ${Math.round((typed / count) * 100)}% constructed responses; all 60 weekly quizzes checked across 3 attempts.`,
);

// Independently recompute representative answers rather than just round-tripping the key.
for (let seed = 1; seed <= 40; seed++) {
  const fractionQuestion = level8Question("number", 6, 1, seed);
  const parts = fractionQuestion.prompt.match(
    /Calculate (\d+)\/(\d+) ([−+]) (\d+)\/(\d+)/,
  );
  // Week 6 Lesson 1 mixes several question forms; recompute the plain a/b ± c/d ones.
  if (parts && /^Calculate \d+\/\d+ [−+] \d+\/\d+\.$/.test(fractionQuestion.prompt)) {
    const [, a, b, op, c, d] = parts;
    const expected =
      Number(a) / Number(b) + ((op === "−" ? -1 : 1) * Number(c)) / Number(d);
    assert(markLevel7Answer(level7Answer(fractionQuestion), String(expected)));
  }
  // Space Week 3 Lesson 3 mixes forms; recompute the triangle pairs with an unknown side x.
  const missing = level8Question("space", 3, 3, seed);
  const [small, large] = missing.space8Visual?.polygons ?? [];
  const hidden = large?.sideLabels?.indexOf("x") ?? -1;
  if (small?.points.length === 3 && hidden > 0)
    assert(
      Math.abs(
        Number(missing.answer) -
          (Number(small.sideLabels[hidden]) * Number(large.sideLabels[0])) /
            Number(small.sideLabels[0]),
      ) < 0.01,
    );
  // Every 3D coordinate answer in Space Week 7 Lesson 1 is entered as x, y, z.
  const coords = level8Question("space", 7, 1, seed);
  if (coords.answerSpec?.kind === "list")
    assert.deepEqual(coords.answerSpec.labels, ["x", "y", "z"]);
}
assert(
  typed / count >= 0.8 && typed / count <= 0.9,
  "Keep 80–90% of the bank as constructed responses",
);

let coin = 0;
const sequence = [0, 0, 0, 1, 1, 0, 1, 1];
assert.deepEqual(tossTwoCoins(4, () => sequence[coin++]).counts, [1, 1, 1, 1]);
assert.equal(
  sampleCyclists(100, () => 0.5),
  40,
);
assert.throws(() => sampleCyclists(101));
console.log(
  "PASS independent fraction, similarity, coordinate and experiment checks.",
);

for (const realm of Object.keys(LEVEL8_WEEK_COUNTS)) {
  const bytes = statSync(
    new URL("../public" + level8Background(realm), import.meta.url),
  ).size;
  assert(bytes > 10000 && bytes < 400000, realm + " optimised background");
  assert(level8DemoHref(realm, 1, 1).includes(`lessonId=y8-${realm}-w1-l1`));
  assert(
    level8DemoHref(realm, LEVEL8_WEEK_COUNTS[realm], "quiz").includes(
      "form=posttest",
    ),
  );
}
for (const route of ["lesson", "week", "quiz"]) {
  const source = readFileSync(
    new URL(
      `../app/demo-review/volcano/[realm]/${route}/page.tsx`,
      import.meta.url,
    ),
    "utf8",
  );
  assert(
    source.includes("getServerStarpathAccess"),
    route + " server demo access",
  );
  assert(source.includes("<DemoGate>"), route + " isolated demo identity");
}
console.log(
  "PASS six optimised backgrounds, final post-test links and server demo gates.",
);
