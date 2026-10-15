import assert from "node:assert/strict";
import fs from "node:fs";

// Every pre-test and post-test must save its questions (question_results):
// teacher replay and the diagnostic report's "doing well / work on next"
// skills depend on them. Source checks only.
const read = (file) => fs.readFileSync(file, "utf8");
const checks = [];
const check = (name, passed) => checks.push([name, passed]);

for (const page of ["app/pretest/page.tsx", "app/posttest/page.tsx"]) {
  const source = read(page);
  check(`${page} saves question results`, /buildAssessmentQuestionSnapshots\(/.test(source) && /question_results:\s*questionResults/.test(source));
}

check("Level 7 pre- and post-tests save question results", /question_results:\s*snapshots/.test(read("lib/level7-assessment-progress.ts")));

const realms = ["Number", "Measurement", "Space", "Statistics", "Pattern", "Chance"];
for (const realm of realms) {
  const source = read(`components/assessment/${realm}ExtensionAssessment.tsx`);
  check(`${realm} Level 7/8 tests save question results`, /buildAssessmentQuestionSnapshots\(/.test(source) && /question_results:\s*snapshots/.test(source) && /saveLevel7Assessment\(/.test(source));
}

// The Level 8 completion functions must store what they are sent.
const migrations = fs.readdirSync("supabase/migrations").filter((file) => file.endsWith(".sql")).sort();
for (const realm of ["number", "measurement", "space", "statistics", "pattern", "chance"]) {
  const name = `complete_${realm}_extension_assessment`;
  const pattern = new RegExp(`create or replace function public\\.${name}`, "i");
  const latest = migrations.filter((file) => pattern.test(read(`supabase/migrations/${file}`))).at(-1);
  const source = latest ? read(`supabase/migrations/${latest}`) : "";
  const start = source.search(pattern);
  check(`${name} stores question_results`, Boolean(latest) && /question_results/.test(source.slice(start, start + 6000)));
}

// The live Starpath post-test route hands off to the shared /posttest page;
// the old score-only component must not be used.
check("Starpath post-test uses the shared post-test page", /redirect\(`\/posttest\?/.test(read("app/starpath/posttest/[level]/page.tsx")));
const usesOldStarpath = fs.readdirSync("app", { recursive: true }).concat(fs.readdirSync("components", { recursive: true }).map((file) => `../components/${file}`))
  .filter((file) => /\.tsx?$/.test(String(file)))
  .some((file) => /<StarpathPostTest\b/.test(read(`app/${file}`)));
check("the score-only StarpathPostTest component is not rendered", !usesOldStarpath);

const failures = checks.filter(([, passed]) => !passed);
for (const [name, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${name}`);
console.log(`\n${checks.length - failures.length}/${checks.length} checks passed.`);
assert.equal(failures.length, 0, "Every pre-test and post-test must save its questions.");
