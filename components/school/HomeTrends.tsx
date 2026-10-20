"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { SchoolAnalyticsSnapshot } from "@/lib/school-platform-server";
import { buildHomeTrendRows, WINDOW_DAYS, type Tone, type TrendRow } from "@/lib/home-trends";

const TONE_STYLES: Record<Tone, { icon: typeof ArrowUpRight; box: string; value: string }> = {
  watch: { icon: ArrowRight, box: "bg-[#FFF1C7] text-[#5C4300]", value: "text-[#5C4300]" },
  up: { icon: ArrowUpRight, box: "bg-[#EEFBDB] text-[#3D6600]", value: "text-[#3D6600]" },
};

export default function HomeTrends({
  schoolId,
  academicYearId,
  classId,
  title,
  subtitle,
  onOpenAnalytics,
}: {
  schoolId: string;
  academicYearId: string;
  classId?: string;
  title: string;
  subtitle: string;
  onOpenAnalytics?: () => void;
}) {
  // Results are stored with the request they answer, so a new class or year
  // shows the loading state without resetting state inside the effect.
  const requestKey = `${schoolId}|${academicYearId}|${classId ?? ""}`;
  const [result, setResult] = useState<
    { key: string; status: "error" } | { key: string; status: "ready"; rows: TrendRow[] } | null
  >(null);
  const state = result?.key === requestKey ? result : { status: "loading" as const };

  useEffect(() => {
    if (!academicYearId) return;
    let cancelled = false;
    const params = new URLSearchParams({ academicYearId, days: String(WINDOW_DAYS) });
    if (classId) params.set("classId", classId);
    fetch(`/api/school/${schoolId}/analytics?${params}`, { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("analytics unavailable");
        return (await response.json()) as SchoolAnalyticsSnapshot;
      })
      .then((snapshot) => {
        if (!cancelled) setResult({ key: requestKey, status: "ready", rows: buildHomeTrendRows(snapshot, classId ? "class" : "school") });
      })
      .catch(() => {
        if (!cancelled) setResult({ key: requestKey, status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [academicYearId, classId, requestKey, schoolId]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
        {onOpenAnalytics ? (
          <button
            type="button"
            onClick={onOpenAnalytics}
            className="text-sm font-bold text-emerald-700 hover:underline"
          >
            See all analytics
          </button>
        ) : null}
      </div>

      {state.status === "loading" ? (
        <div className="space-y-2 pt-2" aria-label="Loading topics">
          {[0, 1, 2].map((row) => (
            <div key={row} className="h-14 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      ) : state.status === "error" ? (
        <p className="border-t border-slate-100 pt-4 text-sm text-slate-500">
          Topics could not be loaded right now.
        </p>
      ) : state.rows.length === 0 ? (
        <p className="border-t border-slate-100 pt-4 text-sm text-slate-500">
          Nothing stands out yet. Topics appear once students have enough lessons and quizzes in them.
        </p>
      ) : (
        <ul>
          {state.rows.map((row) => {
            const tone = TONE_STYLES[row.tone];
            const Icon = tone.icon;
            return (
              <li
                key={row.key}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 py-3.5"
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone.box}`}>
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 basis-56">
                  <span className="block font-bold">{row.title}</span>
                  <span className="block text-sm text-slate-500">{row.detail}</span>
                </span>
                <span className={`ml-auto text-right font-extrabold tabular-nums ${tone.value}`}>
                  {row.value}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
