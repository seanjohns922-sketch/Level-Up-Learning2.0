"use client";

import { supabase } from "@/lib/supabase";

/** Schools where the signed-in user is a school admin: they manage every class there, not only their own. */
export async function schoolAdminSchoolIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from("school_memberships")
    .select("school_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .eq("role", "school_admin");
  return [...new Set((data ?? []).map((row: { school_id: string }) => row.school_id).filter(Boolean))];
}

/** PostgREST filter for "my classes": classes I teach, plus every class at schools I administer. */
export function classScopeFilter(teacherId: string, adminSchoolIds: string[]) {
  return adminSchoolIds.length
    ? `teacher_id.eq.${teacherId},school_id.in.(${adminSchoolIds.join(",")})`
    : `teacher_id.eq.${teacherId}`;
}
