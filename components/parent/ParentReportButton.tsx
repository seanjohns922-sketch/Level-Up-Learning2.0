"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import {
  fetchParentChildActivity,
  fetchParentProgressReport,
  type ParentActivity,
  type ParentProgressReport,
} from "@/lib/parent-insights";
import { openParentReport } from "@/lib/parent-report-print";

/**
 * Opens the child's printable learning report (print or save as PDF), the
 * parent counterpart to the school Learning Journey document.
 */
export default function ParentReportButton({
  studentId,
  previewReport,
  previewActivity,
  className = "",
}: {
  studentId: string;
  previewReport?: ParentProgressReport;
  previewActivity?: ParentActivity;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openReport() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const [report, activity] = previewReport
        ? [previewReport, previewActivity ?? { days: [], feed: [] }]
        : await Promise.all([
            fetchParentProgressReport(studentId),
            fetchParentChildActivity(studentId, 28).catch(() => ({ days: [], feed: [] }) as ParentActivity),
          ]);
      if (!report) {
        setError("This report is not available for your account.");
        return;
      }
      if (!openParentReport(report, activity)) {
        setError("Allow pop-ups for this site to open the report.");
      }
    } catch {
      setError("The report could not be generated. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void openReport()}
        disabled={busy}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 font-bold text-slate-800 shadow-sm transition hover:border-[#1f6f9c] hover:text-[#1f6f9c] disabled:opacity-60"
      >
        <Printer className="h-4 w-4" /> {busy ? "Preparing…" : "Print learning report"}
      </button>
      {error ? <p className="mt-2 text-sm font-bold text-red-700">{error}</p> : null}
    </div>
  );
}
