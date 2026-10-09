import type { SupabaseClient } from "@supabase/supabase-js";

export type ReportingEvent = {
  id: string;
  student_id: string;
  class_id: string;
  event_type: string;
  created_at: string;
  payload: Record<string, unknown> | null;
};

export const REPORTING_HISTORY_DAYS = 7;
export const REPORTING_PAGE_SIZE = 250;

// A fixed upper bound plus a compound cursor prevents new inserts and equal
// timestamps from shifting pages. Never report a partial fetch as complete.
export async function fetchReportingHistory(
  client: SupabaseClient,
  classId: string,
  options: { eventTypes: string[]; now?: Date; isCurrent?: () => boolean },
): Promise<ReportingEvent[]> {
  const until = (options.now ?? new Date()).toISOString();
  const since = new Date(Date.parse(until) - REPORTING_HISTORY_DAYS * 86400000).toISOString();
  const events: ReportingEvent[] = [];
  let cursor: ReportingEvent | undefined;
  while (options.isCurrent?.() !== false) {
    let query = client.from("live_activity_events")
      .select("id,student_id,class_id,event_type,created_at,payload")
      .eq("class_id", classId)
      .in("event_type", options.eventTypes)
      .gte("created_at", since).lte("created_at", until)
      .order("created_at", { ascending: false }).order("id", { ascending: false })
      .limit(REPORTING_PAGE_SIZE);
    if (cursor) {
      query = query.or(`created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`);
    }
    const { data, error } = await query;
    if (error) throw error;
    if (options.isCurrent?.() === false) throw new Error("Reporting request superseded");
    const page = (data ?? []) as ReportingEvent[];
    if (!page.length) return events.reverse();
    const last = page[page.length - 1];
    if (cursor?.id === last.id) throw new Error("Reporting history cursor did not advance");
    events.push(...page);
    cursor = last;
    // Continue even for short pages: PostgREST may enforce a smaller row cap.
  }
  throw new Error("Reporting request superseded");
}

// All refresh triggers share one lease. A class switch invalidates old results;
// the previous request's finally block cannot release a newer request's lease.
export function createReportingRequestGate() {
  let active: { key: string; pending: boolean } | undefined;
  return {
    begin(key: string) {
      if (active?.key === key && active.pending) return null;
      const lease = { key, pending: true };
      active = lease;
      return {
        isCurrent: () => active === lease,
        finish: () => { lease.pending = false; },
      };
    },
    invalidate() { active = undefined; },
  };
}

// Attempt history has no seven-day cutoff: older completed runs determine the
// next attempt number. Page it explicitly instead of trusting the API row cap.
export async function fetchReportingAttempts(
  client: SupabaseClient,
  table: "student_lesson_attempts" | "student_weekly_quiz_attempts",
  columns: string,
  studentIds: string[],
  isCurrent: () => boolean,
) {
  if (!studentIds.length) return [];
  const until = new Date().toISOString();
  const rows: Record<string, unknown>[] = [];
  let cursor: { id: string; completed_at: string } | undefined;
  while (isCurrent()) {
    let query = client.from(table).select(`id,${columns}`)
      .in("student_id", studentIds).lte("completed_at", until)
      .order("completed_at", { ascending: false }).order("id", { ascending: false })
      .limit(REPORTING_PAGE_SIZE);
    if (table === "student_lesson_attempts") query = query.eq("completed", true);
    if (cursor) query = query.or(`completed_at.lt.${cursor.completed_at},and(completed_at.eq.${cursor.completed_at},id.lt.${cursor.id})`);
    const { data, error } = await query;
    if (error) throw error;
    if (!isCurrent()) throw new Error("Reporting request superseded");
    const page = (data ?? []) as unknown as Array<Record<string, unknown> & { id: string; completed_at: string }>;
    if (!page.length) return rows;
    const last = page[page.length - 1];
    if (last.id === cursor?.id) throw new Error("Reporting attempt cursor did not advance");
    rows.push(...page);
    cursor = last;
  }
  throw new Error("Reporting request superseded");
}

// Canonical attempt numbers, unlike telemetry's historic question counters,
// survive reloads. A completed run uses its saved number; an active retry is next.
export function reportingAttemptNumber(completed: boolean, latestSaved: number | null | undefined): number | null {
  if (latestSaved === undefined) return null;
  if (completed) return latestSaved;
  return (latestSaved ?? 0) + 1;
}

// Only collapse events with an explicit shared completion identity. Identical
// scores/timestamps alone are not proof of duplication: legitimate retries stay.
export function uniqueCompletionEvents<T extends { event_type: string; payload: Record<string, unknown> | null }>(events: T[]): T[] {
  const seen = new Set<string>();
  return events.filter(event => {
    const p = event.payload;
    if (event.event_type !== "lesson_completed" || typeof p?.completionKey !== "string") return true;
    const key = JSON.stringify([p.studentId, p.strand, p.level, p.lessonId, p.completionKey]);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
