import type { SupabaseClient } from "@supabase/supabase-js";

type EventRead = {
  classId: string;
  studentIds?: string[];
  eventTypes?: string[];
  newestFirst?: boolean;
  limit?: number;
};

/** Preserve complete snapshots; explicitly limited timelines remain a single read. */
export async function fetchLiveClassEvents(
  client: Pick<SupabaseClient, "rpc" | "from">,
  options: EventRead,
) {
  if (options.limit === undefined) return fetchCompleteSnapshot(client, options);
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

type EventCursor = { id: string; created_at: string };

async function fetchCompleteSnapshot(
  client: Pick<SupabaseClient, "rpc" | "from">,
  options: EventRead,
) {
  const columns = "id,student_id,class_id,event_type,created_at,payload";
  const filteredTable = () => {
    let query = client.from("live_activity_events").select(columns).eq("class_id", options.classId);
    if (options.studentIds !== undefined) query = query.in("student_id", options.studentIds);
    if (options.eventTypes !== undefined) query = query.in("event_type", options.eventTypes);
    return query;
  };
  // Fix the upper cursor so incoming events cannot keep extending this refresh.
  const head = await filteredTable().order("created_at", { ascending: false })
    .order("id", { ascending: false }).limit(1);
  if (head.error || !head.data?.length) return head;
  const through = head.data[0] as EventCursor;
  const rows: NonNullable<typeof head.data> = [];
  let after: EventCursor | null = null;
  let useLegacy = false;
  for (;;) {
    const afterCursor: EventCursor | null = after;
    let page;
    if (!useLegacy) {
      page = await client.rpc("get_live_class_event_page_secure", {
        p_class_id: options.classId,
        p_student_ids: options.studentIds ?? null,
        p_event_types: options.eventTypes ?? null,
        p_after_created_at: afterCursor?.created_at ?? null,
        p_after_id: afterCursor?.id ?? null,
        p_through_created_at: through.created_at,
        p_through_id: through.id,
      }).select(columns).order("created_at", { ascending: true }).order("id", { ascending: true });
      if (page.error?.code === "PGRST202") useLegacy = true;
    }
    if (useLegacy) {
      // Cursors come from database timestamptz/uuid fields, not user input.
      let query = filteredTable().or(`created_at.lt.${through.created_at},and(created_at.eq.${through.created_at},id.lte.${through.id})`);
      if (afterCursor) query = query.or(`created_at.gt.${afterCursor.created_at},and(created_at.eq.${afterCursor.created_at},id.gt.${afterCursor.id})`);
      page = await query.order("created_at", { ascending: true }).order("id", { ascending: true }).limit(500);
    }
    if (!page) throw new Error("Live event page was not returned");
    if (page.error) return { ...head, data: null, error: page.error };
    if (!Array.isArray(page.data)) throw new Error("Invalid live event page");
    if (!page.data.length) break;
    rows.push(...page.data);
    const last = page.data[page.data.length - 1] as EventCursor;
    // Never publish partial data if a malformed page cannot advance its cursor.
    if (afterCursor?.id === last.id) throw new Error("Live event page did not advance");
    after = last;
    if (last.id === through.id) break;
  }
  if (options.newestFirst) rows.reverse();
  return { ...head, data: rows, count: null };
}
