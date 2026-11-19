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
  try {
    const head = await query("id").order("id", { ascending: false }).limit(1);
    if (!isActive()) return failure("Attempt read cancelled");
    if (head.error) return { data: null, error: head.error };
    if (!Array.isArray(head.data)) return failure("Invalid attempt head");
    if (!head.data.length) return { data: [], error: null };
    const through = (head.data[0] as unknown as { id: unknown }).id;
    if (typeof through !== "string" || !through) return failure("Invalid attempt cursor");
    const rows: AttemptRows[T][] = [];
    let after: string | null = null;
    for (;;) {
      if (!isActive()) return failure("Attempt read cancelled");
      // Detailed answers are only needed for an on-demand assessment report,
      // never for the regularly refreshed class summaries.
      const detail = table === "student_realm_assessments" && options.includeQuestionResults ? ",question_results" : "";
      let pageQuery: ReturnType<typeof query> = query(`id,${columns[table]}${detail}`).order("id", { ascending: true }).lte("id", through).limit(500);
      if (after) pageQuery = pageQuery.gt("id", after);
      const page: Awaited<ReturnType<typeof query>> = await pageQuery;
      if (!isActive()) return failure("Attempt read cancelled");
      if (page.error) return { data: null, error: page.error };
      if (!Array.isArray(page.data)) return failure("Invalid attempt page");
      if (!page.data.length) break;
      for (const row of page.data as unknown as AttemptRows[T][]) {
        if (!row || typeof row.id !== "string" || !row.id || row.id > through ||
          (after !== null && row.id <= after) || !scope.has(row.student_id)) {
          return failure("Invalid or non-advancing attempt page");
        }
        after = row.id;
        rows.push(row);
      }
      if (after === through) break;
      // A short page may reflect a lower server cap, so it is not end-of-history.
    }
    return { data: rows, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error : new Error("Attempt read failed") };
  }
}
