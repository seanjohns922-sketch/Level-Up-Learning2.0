"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { isPlacementComplete } from "@/data/progress";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import {
  getWeekProgress,
  isWeekPlayable,
  readProgramStore,
} from "@/lib/program-progress";
import type { LiveRealmId } from "@/lib/realms/realm-registry";
import { buildRealmProgramHref } from "@/lib/realms/realm-journey";
import { restoreStudentStateFromServer } from "@/lib/student-progress-sync";
import { getActiveStudentIdentity } from "@/lib/studentIdentity";

type ActivityGateProps = {
  realmId: LiveRealmId;
  year: string;
  week: number;
  activity: "lesson" | "quiz";
  lessonNumber?: number;
  children: ReactNode;
};

export function CanonicalRealmActivityGate({
  realmId,
  year,
  week,
  activity,
  lessonNumber,
  children,
}: ActivityGateProps) {
  const router = useRouter();
  const previewMode = useDemoPreviewMode();
  const [status, setStatus] = useState<"checking" | "allowed" | "error">("checking");

  useEffect(() => {
    if (previewMode) {
      return;
    }

    const studentId = getActiveStudentIdentity().studentId;
    if (!studentId) {
      router.replace("/home");
      return;
    }

    let cancelled = false;
    void restoreStudentStateFromServer(studentId, realmId)
      .then(({ progress }) => {
        if (cancelled) return;
        if (!progress || !isPlacementComplete(progress)) {
          router.replace("/home");
          return;
        }

        const fallbackHref = buildRealmProgramHref({
          realmId,
          year: progress.year,
          week: progress.assignedWeek ?? 1,
        });
        if (progress.status !== "ASSIGNED_PROGRAM" || progress.year !== year) {
          router.replace(fallbackHref);
          return;
        }

        const store = readProgramStore();
        const weekAllowed = isWeekPlayable(
          store,
          year,
          week,
          progress.requiredWeeks,
          progress.optionalWeeks,
          realmId,
          progress.teacherAdvancedWeeks,
          progress.assignedWeek,
        );
        if (!weekAllowed) {
          router.replace(fallbackHref);
          return;
        }

        const weekProgress = getWeekProgress(store, year, week, realmId);
        const previousLessonComplete =
          activity !== "lesson" ||
          lessonNumber == null ||
          lessonNumber <= 1 ||
          weekProgress.lessonsCompleted[lessonNumber - 2] === true;
        const quizReady =
          activity !== "quiz" || weekProgress.lessonsCompleted.filter(Boolean).length === 3;
        if (!previousLessonComplete || !quizReady) {
          router.replace(buildRealmProgramHref({ realmId, year, week }));
          return;
        }

        setStatus("allowed");
      })
      .catch((error) => {
        console.error("[RealmActivityGate] Canonical progression check failed", error);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [activity, lessonNumber, previewMode, realmId, router, week, year]);

  if (previewMode || status === "allowed") return <>{children}</>;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
      <div className="max-w-md rounded-2xl border border-white/15 bg-white/5 p-7 shadow-2xl">
        <h1 className="text-2xl font-black">
          {status === "error" ? "We couldn’t verify your progress" : "Checking your progress…"}
        </h1>
        <p className="mt-3 text-sm font-semibold text-white/70">
          {status === "error"
            ? "Please return home and try again. No lesson or quiz progress has been changed."
            : "Your saved pathway is being loaded securely."}
        </p>
        {status === "error" ? (
          <button
            type="button"
            onClick={() => router.replace("/home")}
            className="mt-5 rounded-xl bg-emerald-600 px-5 py-3 font-black text-white"
          >
            Return home
          </button>
        ) : null}
      </div>
    </main>
  );
}
