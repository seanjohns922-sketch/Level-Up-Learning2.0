"use client";

import { supabase } from "@/lib/supabase";
import type { ParentWeekSkips } from "@/lib/parent-realm-status";

/**
 * Parent week skips (home learners only, 4 per realm per level). The server
 * enforces every rule in parent_skip_child_week; these are thin wrappers.
 */

export async function fetchParentWeekSkips(studentId: string): Promise<ParentWeekSkips> {
  const { data, error } = await supabase.rpc("get_parent_child_week_skips", { p_student_id: studentId });
  if (error) throw error;
  const result = (data ?? {}) as Partial<ParentWeekSkips>;
  return { canSkip: result.canSkip === true, limit: result.limit ?? 0, realms: result.realms ?? [] };
}

export type SkipWeekResult = {
  realmId: string;
  workingLevel: string;
  skippedWeek: number;
  currentWeek: number;
  skipsLeft: number;
};

/** The server's refusal reasons, in words a parent can act on. */
export function skipWeekErrorMessage(reason: string | undefined) {
  if (reason?.includes("No skips left")) return "There are no skips left for this level.";
  if (reason?.includes("last week")) return "The last week of a level can't be skipped. The post-test comes next.";
  if (reason?.includes("current week")) return "This week has changed since the page loaded. Refresh and try again.";
  if (reason?.includes("home learners")) return "Weeks can only be skipped for home learners. Your child's teacher manages their weeks.";
  if (reason?.includes("not started")) return "This realm hasn't started yet.";
  return "The week couldn't be skipped. Please try again.";
}

export async function skipChildWeek(studentId: string, realmId: string, week: number): Promise<SkipWeekResult> {
  const { data, error } = await supabase.rpc("parent_skip_child_week", {
    p_student_id: studentId,
    p_realm_id: realmId,
    p_week: week,
  });
  if (error) throw new Error(skipWeekErrorMessage(error.message));
  return data as SkipWeekResult;
}
