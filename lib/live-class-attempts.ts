import { readUuidHistory } from "./uuid-history";
import type { SupabaseClient } from "@supabase/supabase-js";

const columns = {
  student_lesson_attempts: "student_id,realm_id,working_level,week,lesson,lesson_id,attempt_no,correct_count,total_questions,accuracy_percent,completed,completed_at",
  student_weekly_quiz_attempts: "student_id,realm_id,working_level,week,quiz_id,attempt_no,correct_count,total_questions,accuracy_percent,completed_at",
  student_realm_assessments: "student_id,realm_id,working_level,assessment_type,correct_count,total_questions,score_percent,completed_at",
} as const;

type AttemptTable = keyof typeof columns;
type AttemptRow = {
  id: string; student_id: string; realm_id: string; working_level: string;
  correct_count: number; total_questions: number; completed_at: string;
};
type AttemptRows = {
  student_lesson_attempts: AttemptRow & {
    week: number; lesson: number; lesson_id: string; attempt_no: number;
    accuracy_percent: number; completed: boolean;
  };
  student_weekly_quiz_attempts: AttemptRow & {
    week: number; quiz_id: string; attempt_no: number; accuracy_percent: number;
  };
  student_realm_assessments: AttemptRow & {
    assessment_type: "pretest" | "posttest"; score_percent: number; question_results?: unknown;
  };
};

/** Complete teacher-visible history using the existing table RLS on every page.
 * A fixed UUID upper bound prevents incoming writes extending a refresh forever.
 * This is not a database snapshot: subsequent refreshes reconcile concurrent writes.
 * Never return partial history on failure; the panel retains its previous results.
 */
export async function fetchLiveClassAttempts<T extends AttemptTable>(
  client: Pick<SupabaseClient, "from">,
  table: T,
  studentIds: string[],
  isActive = () => true,
  options: { includeQuestionResults?: boolean } = {},
) {
  const failure = (message: string) => ({ data: null, error: new Error(message) });
  if (!isActive()) return failure("Attempt read cancelled");
  if (!studentIds.length) return { data: [], error: null };
  const scope = new Set(studentIds);
  const query = (projection: string) => {
    const scoped = client.from(table).select(projection).in("student_id", studentIds);
    return table === "student_lesson_attempts" ? scoped.eq("completed", true) : scoped;
  };
  return readUuidHistory(async ({ head, after, through }) => {
    // Detailed answers are only needed for on-demand assessment reports.
    const detail = table === "student_realm_assessments" && options.includeQuestionResults ? ",question_results" : "";
    let request = query(head ? "id" : `id,${columns[table]}${detail}`)
      .order("id", { ascending: !head }).limit(head ? 1 : 500);
    if (through) request = request.lte("id", through);
    if (after) request = request.gt("id", after);
    const result = await request;
    return { data: result.data as unknown as AttemptRows[T][] | null, error: result.error };
  }, row => scope.has(row.student_id), isActive);
}
