// Rex the maths T-rex: easy questions at every level (right answers, worked hints), the level read from
// a route, typed answers, the server's rules matching the screens, and the hub/teacher/parent wiring.
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { readRexAnswer, rexLevelFrom, rexQuestion, rexRandom, REX_QUESTIONS, REX_WAKE_MINUTES, REX_XP, REX_XP_VISITS_PER_DAY } from "../lib/rex.ts";

// Levels from routes and year labels.
assert.equal(rexLevelFrom("/world/number-nexus?level=Year%204&teacher_preview=1"), 4);
assert.equal(rexLevelFrom("/lesson?level=Ground"), 0);
assert.equal(rexLevelFrom(null, "Prep"), 0);
assert.equal(rexLevelFrom(undefined, "Level 7"), 7);
assert.equal(rexLevelFrom("/realms", null), 3, "no level anywhere: a middle level");
assert.equal(rexLevelFrom("/x?level=Year+12"), 8, "never past Level 8");

// Every level makes easy, answerable questions, and the hint shows the answer.
for (let level = 0; level <= 8; level++) {
  const rnd = rexRandom(level + 1);
  for (let i = 0; i < 300; i++) {
    const q = rexQuestion(level, rnd);
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 500, `level ${level}: ${q.prompt} has a friendly answer (${q.answer})`);
    assert.ok(q.help.includes(String(q.answer)), `level ${level}: the hint for ${q.prompt} shows ${q.answer}`);
    assert.ok(q.prompt.includes("?"), "a question");
  }
}
// Prep sums stay within 5; Level 1 within 10.
for (let i = 0, rnd = rexRandom(9); i < 200; i++) assert.ok(rexQuestion(0, rnd).answer <= 5);
for (let i = 0, rnd = rexRandom(10); i < 200; i++) assert.ok(rexQuestion(1, rnd).answer <= 10);
// The same seed gives the same questions (a visit can be replayed).
assert.deepEqual(rexQuestion(5, rexRandom(42)), rexQuestion(5, rexRandom(42)));

// Typed answers.
assert.equal(readRexAnswer(" 56 "), 56);
assert.equal(readRexAnswer("−3"), -3);
assert.equal(readRexAnswer("2.5"), 2.5);
assert.equal(readRexAnswer("five"), null);
assert.equal(readRexAnswer(""), null);

// The server sets the same rules the screens show.
const migration = readFileSync(new URL("../supabase/migrations/20261125150000_rex_visits.sql", import.meta.url), "utf8");
const latest = readFileSync(new URL("../supabase/migrations/20261125170000_rex_chosen_students.sql", import.meta.url), "utf8");
assert.ok(latest.includes(`rex_xp constant integer := ${REX_XP};`) && latest.includes(`rex_questions constant integer := ${REX_QUESTIONS};`) && latest.includes(`rex_paid_per_day constant integer := ${REX_XP_VISITS_PER_DAY};`), "the latest tame_rex_secure pays what the screens say");
assert.equal(REX_XP_VISITS_PER_DAY, 8, "paid up to 8 times a day");
assert.ok(latest.includes("create or replace function public.send_rex_to_students_secure(p_student_ids uuid[])") && latest.includes("not public.can_manage_class(s.class_id)") && /grant execute on function public\.send_rex_to_students_secure\(uuid\[\]\) to authenticated;/.test(latest), "teachers send Rex to chosen students in classes they manage");
assert.ok(!/delete\s+from|drop\s+table/i.test(latest.replace(/^--.*$/gm, "")), "nothing deleted");
assert.ok(migration.includes(`interval '${REX_WAKE_MINUTES} minutes'`), "the wake gap matches");
for (const fn of ["send_rex_secure", "get_rex_visit_secure", "wake_rex_secure", "tame_rex_secure"]) assert.ok(migration.includes(`create or replace function public.${fn}(`), fn);
assert.ok(/grant execute on function public\.send_rex_secure\(uuid, uuid\) to authenticated;/.test(migration), "only signed-in teachers and parents send Rex");
assert.ok(migration.includes("public.can_manage_class(p_class_id)") && migration.includes("parent_student_links"), "sending checks the class or the child");
assert.ok(migration.includes("create trigger rex_leaves_after_lesson") && migration.includes("tamed_at is not null"), "a lesson sends a tamed Rex home");
assert.ok(migration.includes("revoke all on public.rex_visits from public, anon, authenticated;"), "the table is reached only through the functions");
assert.ok(!/delete\s+from|drop\s+table/i.test(migration.replace(/^--.*$/gm, "")), "nothing deleted");

// Wiring: the hub shows him, teachers and parents can send him, the model is small and credited.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const hub = read("components/world3d/CentralWorld.tsx");
assert.ok(hub.includes("useRexVisit(") && hub.includes("<RexHud ") && hub.includes("<RexDinosaur "), "the hub runs Rex");
assert.ok(read("app/teacher/dashboard/page.tsx").includes('title="Send Rex"') && read("app/teacher/dashboard/page.tsx").includes("<SendRexDialog "), "teachers send Rex from Manage class");
assert.ok(read("components/teacher/SendRexDialog.tsx").includes("studentIds: [...picked]"), "the dialog sends to the picked students, or the whole class");
assert.ok(read("components/parent/ParentPortal.tsx").includes("<ParentSendRex "), "parents send Rex from the child's page");
assert.ok(read("app/credits/page.tsx").includes("quander") && read("app/credits/page.tsx").includes("CC BY 4.0"), "the model is credited");
assert.ok(statSync(new URL("../public/models/creatures/trex.glb", import.meta.url)).size < 3_000_000, "the model stays small");
console.log("rex: questions at every level, typed answers, server rules, hub, teacher and parent wiring all check out");
