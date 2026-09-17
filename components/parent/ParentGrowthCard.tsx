"use client";

import { useEffect, useMemo, useState } from "react";
import { TrendingUp } from "lucide-react";
import {
  fetchParentProgressReport,
  parentRealmPalette,
  realmGrowthFromReport,
  type ParentProgressReport,
} from "@/lib/parent-insights";
import { formatStudentLevelLabel, normalizeWorkingLevelLabel } from "@/lib/studentLevelLabel";

/**
 * Test growth per realm.
 *
 * Only the current level of each realm is reported, and only from a matched
 * pre-test and post-test of that same level, so a number here is never a
 * comparison between different tests.
 */
export default function ParentGrowthCard({
  studentId,
  previewReport,
}: {
  studentId: string;
  previewReport?: ParentProgressReport;
}) {
  const [report, setReport] = useState<ParentProgressReport | null>(previewReport ?? null);
  const [loading, setLoading] = useState(!previewReport);

  useEffect(() => {
    if (previewReport) {
      setReport(previewReport);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const result = await fetchParentProgressReport(studentId);
        if (!cancelled) setReport(result);
      } catch {
        if (!cancelled) setReport(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [previewReport, studentId]);

  const rows = useMemo(() => (report ? realmGrowthFromReport(report) : []), [report]);
  const measured = rows.filter((row) => row.pretestScore !== null);

  if (loading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Loading growth">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />
        <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-100" />
      </section>
    );
  }

  if (!report || measured.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
          <TrendingUp className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Test growth</p>
          <h3 className="font-black">Pre-test to post-test</h3>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5">
        {measured.map((row) => {
          const palette = parentRealmPalette(row.realmId);
          const levelLabel = formatStudentLevelLabel(
            normalizeWorkingLevelLabel(row.workingLevel) ?? row.workingLevel,
          );
          return (
            <li key={row.realmId} className="rounded-xl border p-3" style={{ borderColor: palette.border, backgroundColor: palette.soft }}>
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-sm font-black" style={{ color: palette.accentDeep }}>
                  {palette.name}
                </span>
                {row.growth !== null ? (
                  <span
                    className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-black"
                    style={{ color: palette.accentDeep }}
                  >
                    {row.growth > 0 ? "+" : ""}
                    {row.growth} points
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-600">
                {levelLabel} · started at {row.pretestScore}%
                {row.posttestScore !== null ? ` · now ${row.posttestScore}%` : " · post-test still to come"}
              </p>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-slate-500">
        Growth compares the pre-test and post-test of the same level, so it always comes from a matched pair.
      </p>
    </section>
  );
}
