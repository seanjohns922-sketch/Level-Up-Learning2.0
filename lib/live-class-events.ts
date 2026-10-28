import type { SupabaseClient } from "@supabase/supabase-js";

type EventRead = {
  classId: string;
  studentIds?: string[];
  eventTypes?: string[];
  newestFirst?: boolean;
  limit?: number;
};

/** Both paths preserve the same filters, order and API response cap. */
export async function fetchLiveClassEvents(
  client: Pick<SupabaseClient, "rpc" | "from">,
  options: EventRead,
) {
  const columns = "id,student_id,class_id,event_type,created_at,payload";
  const ascending = !options.newestFirst;
  let rpc = client.rpc("get_live_class_events_secure", {
    p_class_id: options.classId,
    p_student_ids: options.studentIds ?? null,
    p_event_types: options.eventTypes ?? null,
    p_newest_first: options.newestFirst ?? false,
    p_limit: options.limit ?? null,
  }).select(columns).order("created_at", { ascending });
  if (options.limit !== undefined) rpc = rpc.limit(options.limit);
  const result = await rpc;
  // Permit either rollout order. Never fall back on an access denial or timeout.
  if (result.error?.code !== "PGRST202") return result;

  let legacy = client.from("live_activity_events").select(columns)
    .eq("class_id", options.classId).order("created_at", { ascending });
  if (options.studentIds !== undefined) legacy = legacy.in("student_id", options.studentIds);
  if (options.eventTypes !== undefined) legacy = legacy.in("event_type", options.eventTypes);
  if (options.limit !== undefined) legacy = legacy.limit(options.limit);
  return await legacy;
}
