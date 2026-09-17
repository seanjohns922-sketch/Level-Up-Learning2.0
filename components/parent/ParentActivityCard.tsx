"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, ClipboardCheck, Flame, GraduationCap, Timer } from "lucide-react";
import {
  activityStreak,
  fetchParentChildActivity,
  formatFeedTime,
  lastSevenDays,
  minutesInLastSevenDays,
  parentRealmPalette,
  type ParentActivity,
} from "@/lib/parent-insights";

/**
 * "This week" activity for one child.
 *
 * Built from daily activity plus completed attempts, so it works the same for
 * a home learner and a school-linked child. Real-time, per-question telemetry
 * stays a teacher surface: it is class-scoped and would be empty at home.
 */

const KIND_ICON = {
  lesson: BookOpen,
  quiz: ClipboardCheck,
  assessment: GraduationCap,
} as const;

const KIND_LABEL = {
  lesson: "Lesson",
  quiz: "Weekly Quiz",
  assessment: "Assessment",
} as const;

export default function ParentActivityCard({
  studentId,
  previewActivity,
}: {
  studentId: string;
  previewActivity?: ParentActivity;
}) {
  const [activity, setActivity] = useState<ParentActivity | null>(previewActivity ?? null);
  const [loading, setLoading] = useState(!previewActivity);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (previewActivity) {
      setActivity(previewActivity);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    void (async () => {
      try {
        const result = await fetchParentChildActivity(studentId, 28);
        if (!cancelled) setActivity(result);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [previewActivity, studentId]);

  const week = useMemo(() => lastSevenDays(activity?.days ?? []), [activity?.days]);
  const streak = useMemo(() => activityStreak(activity?.days ?? []), [activity?.days]);
  const weekMinutes = useMemo(() => minutesInLastSevenDays(activity?.days ?? []), [activity?.days]);
  const weekQuestions = week.reduce((total, day) => total + day.questions, 0);
  const peakMinutes = Math.max(10, ...week.map((day) => day.minutes));
  const feed = activity?.feed.slice(0, 6) ?? [];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-[#f4fbff] to-white px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1f6f9c]">Activity</p>
          <h3 className="mt-1 text-xl font-black">This week</h3>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5">
          <Flame className={`h-4 w-4 ${streak > 0 ? "text-amber-600" : "text-slate-400"}`} />
          <span className="text-sm font-black text-amber-900">
            {streak > 0 ? `${streak} day${streak === 1 ? "" : "s"} in a row` : "No streak yet"}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 p-5" aria-label="Loading activity">
          <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
          <div className="h-14 animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : failed ? (
        <p className="p-5 text-sm text-slate-600">Activity could not be loaded right now.</p>
      ) : (
        <>
          <div className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <div className="flex items-end justify-between gap-1.5">
                {week.map((day) => {
                  const height = day.minutes > 0 ? Math.max(12, Math.round((day.minutes / peakMinutes) * 64)) : 4;
                  return (
                    <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">{day.minutes > 0 ? day.minutes : ""}</span>
                      <div
                        className={`w-full rounded-lg ${
                          day.active
                            ? day.isToday
                              ? "bg-gradient-to-t from-[#1f6f9c] to-[#41b3d3]"
                              : "bg-gradient-to-t from-[#63c7b2] to-[#9fe3d5]"
                            : "bg-slate-200"
                        }`}
                        style={{ height }}
                        title={`${day.minutes} minutes`}
                      />
                      <span className={`text-[11px] font-black ${day.isToday ? "text-[#1f6f9c]" : "text-slate-500"}`}>
                        {day.weekdayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-[210px]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <Timer className="h-3.5 w-3.5" /> Minutes
                </p>
                <p className="mt-1 text-2xl font-black leading-none">{weekMinutes}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Questions</p>
                <p className="mt-1 text-2xl font-black leading-none">{weekQuestions}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-4">
            <h4 className="text-sm font-black text-slate-800">Recently finished</h4>
            {feed.length ? (
              <ul className="mt-3 space-y-2">
                {feed.map((item, index) => {
                  const palette = parentRealmPalette(item.realmId);
                  const Icon = KIND_ICON[item.kind];
                  return (
                    <li
                      key={`${item.kind}-${item.completedAt}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                    >
                      <span
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                        style={{ backgroundColor: palette.soft, color: palette.accentDeep }}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-slate-900">{item.label}</span>
                        <span className="block truncate text-xs text-slate-500">
                          {palette.name} · {KIND_LABEL[item.kind]}
                          {item.week ? ` · Week ${item.week}` : ""}
                        </span>
                      </span>
                      {item.accuracy !== null ? (
                        <span className="shrink-0 text-sm font-black" style={{ color: palette.accentDeep }}>
                          {item.accuracy}%
                        </span>
                      ) : null}
                      <span className="hidden shrink-0 text-xs font-semibold text-slate-400 sm:block">
                        {formatFeedTime(item.completedAt)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Nothing finished yet. Completed lessons, quizzes and tests appear here.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
