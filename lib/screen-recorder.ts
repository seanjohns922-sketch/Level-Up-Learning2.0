"use client";

import { supabase } from "@/lib/supabase";

// rrweb event shape (minimal)
type RRWebEvent = { type: number; timestamp: number; [key: string]: unknown };

export function startScreenRecording(studentId: string, classId: string): () => void {
  if (typeof window === "undefined") return () => {};

  const channelName = `screen-${studentId}`;
  const channel = supabase.channel(channelName, {
    config: { broadcast: { self: false, ack: false } },
  });

  let stopRecord: (() => void) | null = null;
  let buffer: RRWebEvent[] = [];
  let flushTimer: ReturnType<typeof setInterval> | null = null;

  const flush = () => {
    if (buffer.length === 0) return;
    const events = [...buffer];
    buffer = [];
    void channel.send({
      type: "broadcast",
      event: "screen_events",
      payload: { events, studentId, classId },
    });
  };

  channel.subscribe(async (status) => {
    console.log("[ScreenRecorder] channel status:", status);
    if (status !== "SUBSCRIBED") return;

    // Dynamic import — rrweb is browser-only
    let rrweb: Awaited<typeof import("rrweb")>;
    try {
      rrweb = await import("rrweb");
    } catch (e) {
      console.warn("[ScreenRecorder] rrweb import failed:", e);
      return;
    }

    console.log("[ScreenRecorder] recording started for student:", studentId);
    stopRecord =
      rrweb.record({
        emit(event: RRWebEvent) {
          buffer.push(event);
          // Full snapshot (type 2) — flush immediately so teachers see it fast
          if (event.type === 2) {
            console.log("[ScreenRecorder] full snapshot captured, flushing");
            flush();
          }
        },
        // Re-emit a full snapshot every 10 s so late-joining teachers catch up quickly
        checkoutEveryNms: 10_000,
        sampling: {
          mousemove: 150,
          scroll: 200,
          input: "last",
        },
      }) ?? null;

    flushTimer = setInterval(flush, 500);
  });

  return () => {
    if (stopRecord) stopRecord();
    if (flushTimer) clearInterval(flushTimer);
    flush();
    void supabase.removeChannel(channel);
  };
}
