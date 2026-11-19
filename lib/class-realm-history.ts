import type { SupabaseClient } from "@supabase/supabase-js";
import { readUuidHistory } from "./uuid-history";

type HistoryKind = "lessons" | "quizzes" | "assessments" | "overrides";
type HistoryRow = { id: string; student_id: string; realm_id: string };

/** Keep the canonical teacher RPCs and table RLS; only paginate their results. */
export async function fetchClassRealmHistory(
  client: Pick<SupabaseClient, "from" | "rpc">,
  kind: HistoryKind,
  classId: string,
  realmId: string,
  studentIds: string[],
) {
  if (!studentIds.length) return { data: [], error: null };
  const scope = new Set(studentIds);
  return readUuidHistory(async ({ head, after, through }) => {
    const params = { p_class_id: classId, p_realm_id: realmId, p_working_level: null };
    const source = kind === "lessons" || kind === "quizzes"
      ? client.rpc(kind === "lessons" ? "get_class_realm_lesson_attempts" : "get_class_realm_weekly_quiz_attempts", params).select(head ? "id" : "*")
      : client.from(kind === "assessments" ? "student_realm_assessments" : "student_progress_overrides").select(
        head ? "id" : kind === "assessments"
          ? "id,student_id,realm_id,working_level,assessment_type,correct_count,total_questions,score_percent,passed,placement_result,question_results,completed_at"
          : "id,student_id,realm_id,working_level,week,advanced_to_week,teacher_id,reason,notes,created_at",
      );
    // Apply the requested roster and realm to every page, including the head.
    let request = source.in("student_id", studentIds).eq("realm_id", realmId)
      .order("id", { ascending: !head }).limit(head ? 1 : 500);
    if (through) request = request.lte("id", through);
    if (after) request = request.gt("id", after);
    const result = await request;
    return { data: result.data as unknown as HistoryRow[] | null, error: result.error };
  }, row => scope.has(row.student_id) && row.realm_id === realmId);
}
