"use client";

import { supabase } from "@/lib/supabase";
import { isDemoPreviewMode } from "@/lib/demo-mode";

export type StudentRealmLevelRow = {
  realm_id: string;
  working_level: string | null;
  placement_complete: boolean | null;
};

/**
 * Every current working level for one learner, in a single read.
 *
 * Realm unlocking asks "what is the highest level reached in ANY realm", so
 * the per-realm progress reads would cost six round trips per render. Demo
 * preview never calls the database; it is an audit lens over local state.
 */
export async function fetchStudentRealmLevels(studentId: string): Promise<StudentRealmLevelRow[]> {
  if (isDemoPreviewMode()) return [];
  const { data, error } = await supabase.rpc("get_student_realm_levels_secure", {
    p_student_id: studentId,
  });
  if (error) throw error;
  return (data ?? []) as StudentRealmLevelRow[];
}

/** Working levels only, for realmUnlockState. */
export function levelsFromRows(rows: readonly StudentRealmLevelRow[]) {
  return rows.map((row) => row.working_level);
}
