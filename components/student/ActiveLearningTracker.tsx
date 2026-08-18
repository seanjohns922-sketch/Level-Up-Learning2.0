"use client";

import { useEffect, useRef } from "react";
import { ensureStudentActivityDay, recordStudentActivityDelta } from "@/lib/student-activity";
import { rememberActiveLearningDestination } from "@/lib/continue-learning";
import { touchLiveStudentPresence, trackLiveLearningEvent } from "@/lib/live-class-client";

type ActiveLearningTrackerProps = {
  context: "lesson" | "session" | "pretest" | "posttest";
  level?: string | null;
  realmId?: string | null;
  questionId?: string | null;
  questionText?: string | null;
  questionIndex?: number | null;
  totalQuestions?: number | null;
  questionsAnswered?: number | null;
};

const ACTIVE_WINDOW_MS = 75_000;
const HEARTBEAT_MS = 30_000;

export function ActiveLearningTracker({
  context,
  level,
  realmId,
  questionId,
  questionText,
  questionIndex,
  totalQuestions,
  questionsAnswered,
}: ActiveLearningTrackerProps) {
  const lastTickRef = useRef<number | null>(null);
  const lastInteractionRef = useRef<number>(0);
  const pendingSecondsRef = useRef(0);
  const presenceRequestInFlightRef = useRef(false);
  const announcedAssessmentRef = useRef<string | null>(null);

  useEffect(() => {
    rememberActiveLearningDestination(context);
    void ensureStudentActivityDay();

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

      if (!presenceRequestInFlightRef.current) {
        presenceRequestInFlightRef.current = true;
        void touchLiveStudentPresence().finally(() => {
          presenceRequestInFlightRef.current = false;
        });
      }

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
    void touchLiveStudentPresence();

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

  useEffect(() => {
    if (context !== "pretest" && context !== "posttest") return;

    const assessmentTitle = context === "pretest" ? "Pre-Test" : "Post-Test";
    const assessmentKey = `${context}:${realmId ?? "realm"}:${level ?? "level"}`;
    const currentQuestionNumber = typeof questionIndex === "number" ? questionIndex + 1 : null;
    const validTotal = typeof totalQuestions === "number" && totalQuestions > 0 ? totalQuestions : null;
    const progressPercent = currentQuestionNumber && validTotal
      ? Math.round((currentQuestionNumber / validTotal) * 100)
      : 0;
    const progressLabel = currentQuestionNumber && validTotal
      ? `${assessmentTitle} question ${currentQuestionNumber} of ${validTotal}`
      : `${assessmentTitle} in progress`;

    let cancelled = false;
    async function announceAssessmentContext() {
      if (announcedAssessmentRef.current !== assessmentKey) {
        await trackLiveLearningEvent({
          eventType: "activity_started",
          level,
          strand: realmId,
          lessonId: assessmentKey,
          lessonTitle: assessmentTitle,
          activityId: context,
          activityLabel: assessmentTitle,
          progressPercent: 0,
          progressLabel: `${assessmentTitle} in progress`,
          questionsAnswered,
          totalQuestions: validTotal,
        });
        if (cancelled) return;
        announcedAssessmentRef.current = assessmentKey;
      }

      await trackLiveLearningEvent({
        eventType: "question_loaded",
        level,
        strand: realmId,
        lessonId: assessmentKey,
        lessonTitle: assessmentTitle,
        activityId: context,
        activityLabel: assessmentTitle,
        questionId: questionId ?? (currentQuestionNumber ? `${assessmentKey}:q${currentQuestionNumber}` : null),
        questionText,
        progressPercent,
        progressLabel,
        questionsAnswered,
        totalQuestions: validTotal,
        currentStepLabel: currentQuestionNumber && validTotal
          ? `Question ${currentQuestionNumber} of ${validTotal}`
          : null,
      });
    }

    void announceAssessmentContext();
    return () => {
      cancelled = true;
    };
  }, [context, level, questionId, questionIndex, questionText, questionsAnswered, realmId, totalQuestions]);

  return null;
}
