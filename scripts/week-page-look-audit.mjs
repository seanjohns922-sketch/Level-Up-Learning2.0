import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Every realm and level shares one week page: Hub, realm and profile buttons on
// top, see-through cards with real states, coloured only by the realm's theme.
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const page = read("app/program/page.tsx");
assert.ok(page.includes("<WeekPageNav") && page.includes("<WeekCard"), "the week page must use the shared top bar and cards");
assert.ok(page.includes('onHub={() => router.push("/world")}'), "Hub must go home to the central hub");
assert.ok(page.includes("onRealm={goBackToMap}"), "the realm button must return to the realm");
assert.ok(page.includes('onProfile={() => router.push("/profile")}'), "the profile button must open the profile, where students log out");
assert.ok(page.includes("style={weekPageTheme(realmId)}"), "the week page must take its colours from the realm theme");
assert.ok(!page.includes("clipPath"), "the week page must not bring back the old angled per-realm panels");

const nav = read("components/program/WeekPageNav.tsx");
assert.ok(nav.includes("WEEK_FILL") && nav.includes('aria-label="My profile and log out"'), "the profile button must be in the realm's colour");

const card = read("components/program/WeekCard.tsx");
for (const state of ["done", "next", "open", "retry", "soon", "locked"]) {
  assert.ok(card.includes(`${state}:`), `week cards must style the ${state} state`);
}
assert.ok(!card.includes("ACTIVE"), "week cards show real states, not ACTIVE on every card");

console.log("PASS week page look: one design for every realm and level, Hub / realm / profile buttons, real card states, realm colours");
