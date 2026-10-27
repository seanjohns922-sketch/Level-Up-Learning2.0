"use client";

import { useMemo } from "react";
import PlacementManager from "@/components/teacher/PlacementManager";
import type { CompatProgressRow, TeacherRealmPlacementRow } from "@/lib/realm-progress-compat";

// A pretend Grade 3/4 class for reviewing the placement manager. Nothing is saved.
const NAMES = ["Ava Brown", "Benny Lee", "Charlie Nguyen", "Daisy Hart", "Ethan Cole", "Freya Wilson", "George Patel", "Hannah Ross", "Isla Murphy", "Jack Taylor", "Kai Anderson", "Lily Thomas", "Mason White", "Noah Martin", "Olivia King", "Pippa Scott", "Quinn Baker", "Ruby Evans", "Sam Turner", "Tara Hughes", "Ugo Okafor", "Violet Price", "Will Setford", "Zara Khan"];
const REALMS = ["number", "measurement", "pattern", "statistics", "chance", "space"];
const LEVELS = ["Year 2", "Year 3", "Year 4", "Year 5"];

export default function Page() {
  const { students, previewData } = useMemo(() => {
    const state = { seed: 7 };
    const rand = () => {
      state.seed = (state.seed * 9301 + 49297) % 233280;
      return state.seed / 233280;
    };
    const students = NAMES.map((name, index) => {
      const [first, last] = name.split(" ");
      return { id: `s${index}`, display_name: name, first_name: first, last_name: last, school_year_level: index % 2 ? "Year 4" : "Year 3" };
    });
    const progressByRealm: Record<string, CompatProgressRow[]> = {};
    const placements: TeacherRealmPlacementRow[] = [];
    for (const realm of REALMS) {
      progressByRealm[realm] = [];
      for (const student of students) {
        if (student.display_name === "Benny Lee" && realm !== "number") continue;
        const base = student.school_year_level === "Year 3" ? 1 : 2;
        const roll = rand();
        const level = LEVELS[Math.min(3, Math.max(0, base + (roll < 0.15 ? -1 : roll > 0.9 ? 1 : 0)))];
        const waiting = rand() < 0.15;
        placements.push({ student_id: student.id, realm_id: realm, assigned_start_level: level, assigned_entry_mode: "pretest", updated_at: "2026-10-01T00:00:00Z" });
        progressByRealm[realm].push({
          student_id: student.id, realm_id: realm, year: level, is_current: true, week: waiting ? 1 : 1 + Math.floor(rand() * 4),
          status: waiting ? "ASSIGNED_PRETEST" : "ASSIGNED_PROGRAM", pretest_score: waiting ? null : 55 + Math.floor(rand() * 40),
          placement_complete: !waiting, completed_lesson_ids: [], unlocked_legends: [], quiz_scores: {},
        });
      }
    }
    return { students, previewData: { progressByRealm, placements } };
  }, []);
  return <PlacementManager selectedClass={{ id: "review-3-4j", name: "3/4J" }} students={students} onClose={() => {}} previewData={previewData} />;
}
