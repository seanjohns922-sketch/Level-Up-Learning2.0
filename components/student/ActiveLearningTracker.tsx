"use client";

import { useEffect, useRef } from "react";
import { ensureStudentActivityDay, recordStudentActivityDelta } from "@/lib/student-activity";
import { rememberActiveLearningDestination } from "@/lib/continue-learning";
import { trackLiveLearningEvent } from "@/lib/live-class-client";

type ActiveLearningTrackerProps = {
  context: "lesson" | "session" | "pretest" | "posttest";
};

const ACTIVE_WINDOW_MS = 75_000;
const HEARTBEAT_MS = 30_000;

export function ActiveLearningTracker({ context }: ActiveLearningTrackerProps) {
  const lastTickRef = useRef<number | null>(null);
  const lastInteractionRef = useRef<number>(0);
  const pendingSecondsRef = useRef(0);

  useEffect(() => {
    rememberActiveLearningDestination(context);
    void ensureStudentActivityDay();

    if (context === "pretest" || context === "posttest") {
      const searchParams = new URLSearchParams(window.location.search);
      const year = searchParams.get("year");
      const realmId = searchParams.get("realm_id");
      const assessmentTitle = context === "pretest" ? "Pre-Test" : "Post-Test";
      void trackLiveLearningEvent({
        eventType: "activity_started",
        level: year,
        strand: realmId,
        lessonId: `${context}:${realmId ?? "realm"}:${year ?? "level"}`,
        lessonTitle: assessmentTitle,
        activityId: context,
        activityLabel: assessmentTitle,
        progressLabel: `${assessmentTitle} in progress`,
      });
    }

    const markInteraction = () => {
      lastInteractionRef.current = Date.now();
    };

    const isCountingTime = () => {
      if (typeof document === "undefined" || typeof window === "undefined") return false;
      if (document.visibilityState !== "visible") return false;
      if (typeof document.hasFocus === "function" && !document.hasFocus()) return false;
      return Date.now() - lastInteractionRef.current <= ACTIVE_WINDOW_MS;
    };

    const flushPending = () => {
      const flushSeconds = Math.max(0, Math.floor(pendingSecondsRef.current));
      if (flushSeconds <= 0) return;
      pendingSecondsRef.current = 0;
      void recordStudentActivityDelta({ secondsActive: flushSeconds });
    };

    const tick = () => {
      const now = Date.now();
      if (lastTickRef.current == null) {
        lastTickRef.current = now;
        return;
      }

      const elapsedSeconds = Math.max(0, Math.round((now - lastTickRef.current) / 1000));
      lastTickRef.current = now;
      if (!isCountingTime()) return;

      pendingSecondsRef.current += elapsedSeconds;
      if (pendingSecondsRef.current >= HEARTBEAT_MS / 1000) {
        flushPending();
      }
    };

    const handleVisibilityChange = () => {
      tick();
      if (document.visibilityState !== "visible") {
        flushPending();
      }
    };

    markInteraction();
    lastTickRef.current = Date.now();

    window.addEventListener("pointerdown", markInteraction, { passive: true });
    window.addEventListener("keydown", markInteraction);
    window.addEventListener("touchstart", markInteraction, { passive: true });
    window.addEventListener("focus", markInteraction);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const intervalId = window.setInterval(tick, HEARTBEAT_MS);

    return () => {
      tick();
      flushPending();
      window.clearInterval(intervalId);
      window.removeEventListener("pointerdown", markInteraction);
      window.removeEventListener("keydown", markInteraction);
      window.removeEventListener("touchstart", markInteraction);
      window.removeEventListener("focus", markInteraction);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [context]);

  return null;
}
