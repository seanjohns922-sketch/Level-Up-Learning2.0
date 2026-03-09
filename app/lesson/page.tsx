"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LessonPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400">Loading…</p>
        </div>
      }
    >
      <LessonRedirect />
    </Suspense>
  );
}

function LessonRedirect() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const year = params.get("year") ?? "Year 1";
    const week = params.get("week") ?? "1";
    const lessonId = params.get("lessonId") ?? `y1-w${week}-l1`;
    const lessonMatch = lessonId.match(/l(\d+)$/);
    const lessonNumber = lessonMatch ? lessonMatch[1] : "1";

    router.replace(
      `/session?year=${encodeURIComponent(year)}&week=${encodeURIComponent(week)}&type=lesson&n=${lessonNumber}`
    );
  }, [params, router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Redirecting to lesson…</p>
    </main>
  );
}
