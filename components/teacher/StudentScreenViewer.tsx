"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type RRWebEvent = { type: number; timestamp: number; [key: string]: unknown };

type ViewerStatus = "waiting" | "live" | "disconnected";

export default function StudentScreenViewer({ studentId }: { studentId: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const replayerRef = useRef<any>(null);
  const pendingRef = useRef<RRWebEvent[]>([]);
  const [status, setStatus] = useState<ViewerStatus>("waiting");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);

  // Recalculate scale when wrapper resizes
  useEffect(() => {
    if (!wrapperRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 400;
      setScale(w / 1280);
    });
    obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!studentId) return;

    const channelName = `screen-${studentId}`;
    const channel = supabase.channel(channelName);

    const handleEvents = async (events: RRWebEvent[]) => {
      const { Replayer } = await import("rrweb");

      for (const event of events) {
        if (event.type === 2) {
          // Full snapshot — (re)start the replayer
          if (replayerRef.current) {
            try { replayerRef.current.destroy?.(); } catch { /* ignore */ }
            replayerRef.current = null;
          }
          if (!containerRef.current) continue;
          containerRef.current.innerHTML = "";

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ReplayerClass = Replayer as any;
          const replayer = new ReplayerClass([event], {
            root: containerRef.current,
            speed: 1,
            live: true,
            UNSAFE_replayCanvas: false,
          });
          replayer.startLive(event.timestamp);
          replayerRef.current = replayer;
          setStatus("live");

          // Flush any events that arrived before the snapshot
          for (const pending of pendingRef.current) {
            replayer.addEvent(pending);
          }
          pendingRef.current = [];
        } else {
          if (replayerRef.current) {
            replayerRef.current.addEvent(event);
          } else {
            pendingRef.current.push(event);
          }
        }
      }
    };

    channel
      .on("broadcast", { event: "screen_events" }, ({ payload }) => {
        if (Array.isArray(payload?.events)) {
          void handleEvents(payload.events as RRWebEvent[]);
        }
      })
      .subscribe((status) => {
        if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setStatus("disconnected");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
      if (replayerRef.current) {
        try { replayerRef.current.destroy?.(); } catch { /* ignore */ }
        replayerRef.current = null;
      }
      pendingRef.current = [];
    };
  }, [studentId]);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950"
      style={{ aspectRatio: "16/10" }}
    >
      {/* Status overlay */}
      {status !== "live" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              status === "disconnected" ? "bg-rose-400" : "bg-amber-400 animate-pulse"
            }`}
          />
          <p className="text-xs font-semibold text-slate-400">
            {status === "disconnected"
              ? "Connection lost — student may have navigated away"
              : "Waiting for student screen…"}
          </p>
          {status === "waiting" && (
            <p className="text-[11px] text-slate-600">Updates within 10 seconds of activity</p>
          )}
        </div>
      )}

      {/* Live indicator */}
      {status === "live" && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 rounded-full bg-slate-900/80 px-2.5 py-1 backdrop-blur-sm pointer-events-none">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Live</span>
        </div>
      )}

      {/* rrweb render target — scaled to fit the panel */}
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "1280px",
          height: "800px",
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
