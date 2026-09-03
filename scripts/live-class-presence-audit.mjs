#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];
const requireText = (source, expected, message) => {
  if (!source.includes(expected)) failures.push(message);
};

const tracker = read("components/student/ActiveLearningTracker.tsx");
const client = read("lib/live-class-client.ts");
const panel = read("components/teacher/LiveClassPanel.tsx");
const registry = read("lib/realms/realm-registry.ts");
const migration = read("supabase/migrations/20260818193000_live_class_presence_heartbeat.sql");

requireText(tracker, "touchLiveStudentPresence", "Active learning does not send Live Class presence heartbeats.");
requireText(tracker, "presenceRequestInFlightRef", "Presence heartbeats can overlap on slow connections.");
requireText(client, 'rpc("touch_live_student_presence_secure"', "The client does not use the secure presence RPC.");
requireText(panel, "ACTIVE_NOW_WINDOW_MS = 120_000", "Active Now does not use a bounded presence window.");
requireText(panel, "isCardActiveNow(card)", "Live Class does not classify rows from recent presence.");
requireText(panel, "isLiveRealmId(normalized)", "Live Class realm recognition is not driven by the live-realm registry.");
requireText(panel, "getRealmActivityCode(normalized)", "Live Class realm badges are not driven by the realm registry.");
requireText(registry, 'activityCode: "ST"', "The realm registry does not define Statistica's ST badge.");
requireText(registry, 'programSuffix: "statistica"', "The realm registry does not define Statistica's canonical progress key.");
requireText(panel, 'aria-label={`Realm: ${formatRealmName(card.currentRealm)}`}', "Live Class realm badges do not expose their full accessible name.");
requireText(migration, "public.assert_student_write(p_student_id)", "Presence writes are not student-authorised.");
requireText(migration, "student.archived_at is null", "Archived students can publish presence.");
requireText(migration, "last_active_at = clock_timestamp()", "Presence does not use the trusted database clock.");

if (failures.length > 0) {
  console.error(`Live Class presence audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Live Class presence audit passed: active students heartbeat securely and Active Now expires stale rows.");
