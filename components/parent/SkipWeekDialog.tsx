"use client";

import { useEffect, useRef, useState } from "react";
import { parentRealmPalette } from "@/lib/parent-insights";
import { skipChildWeek, type SkipWeekResult } from "@/lib/parent-week-skips";

export type SkipWeekRequest = {
  studentId: string;
  childName: string;
  realmId: string;
  levelLabel: string;
  week: number;
  weekTitle: string | null;
  skipsLeft: number;
  limit: number;
};

/**
 * Confirms a parent week skip. The server re-checks every rule; this only
 * explains the result before it happens. In the Demo Review preview nothing
 * is written, so confirming is switched off.
 */
export default function SkipWeekDialog({
  request,
  preview = false,
  onClose,
  onSkipped,
}: {
  request: SkipWeekRequest | null;
  preview?: boolean;
  onClose: () => void;
  onSkipped: (result: SkipWeekResult) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (request && !element.open) element.showModal();
    if (!request && element.open) element.close();
  }, [request]);

  async function confirm() {
    if (!request || preview) return;
    setSaving(true);
    setError(null);
    try {
      onSkipped(await skipChildWeek(request.studentId, request.realmId, request.week));
    } catch (skipError) {
      setError(skipError instanceof Error ? skipError.message : "The week couldn't be skipped. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function close() {
    setError(null);
    onClose();
  }

  const palette = request ? parentRealmPalette(request.realmId) : null;
  const leftAfter = request ? request.skipsLeft - 1 : 0;

  return (
    <dialog
      ref={dialog}
      onClose={close}
      aria-labelledby="skip-week-title"
      className="m-auto w-[min(440px,calc(100vw-32px))] rounded-2xl bg-white p-0 text-[#121314] shadow-2xl backdrop:bg-[#121314]/55"
    >
      {request && palette ? (
        <div className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <span className="h-11 w-14 shrink-0 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url('${palette.image}')` }} aria-hidden="true" />
            <p className="text-sm text-slate-600">{palette.name} · {request.levelLabel}</p>
          </div>
          <h2 id="skip-week-title" className="font-display text-2xl font-black leading-tight">Skip Week {request.week} for {request.childName}?</h2>
          <p className="text-[15px] leading-relaxed text-slate-800">
            {request.childName} moves straight to Week {request.week + 1}.{request.weekTitle ? ` Week ${request.week} (${request.weekTitle})` : ` Week ${request.week}`} stays open, so {request.childName} can go back to it any time.
          </p>
          <div className="flex items-center gap-3 rounded-xl bg-[#F4F4F1] px-4 py-3">
            <span className="flex gap-1.5" aria-hidden="true">
              {Array.from({ length: request.limit }, (_, index) => (
                <span key={index} className={`h-4 w-4 rounded-full ${index < leftAfter ? "bg-[var(--reliq-lime)]" : "border-2 border-dashed border-slate-400"}`} />
              ))}
            </span>
            <span className="text-sm text-slate-800">After this, <strong>{leftAfter} of {request.limit} skips</strong> left for {palette.name} {request.levelLabel}.</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">Skipped weeks earn no XP or Chrono Crystals. The post-test at the end still checks everything in the level.</p>
          {preview ? <p className="text-sm font-bold text-amber-800">Skipping is switched off in the preview.</p> : null}
          {error ? <p role="alert" className="text-sm font-bold text-red-700">{error}</p> : null}
          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button type="button" onClick={close} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 font-bold hover:border-slate-900">Cancel</button>
            <button
              type="button"
              onClick={confirm}
              disabled={saving || preview}
              className="min-h-11 rounded-lg bg-[var(--reliq-lime)] px-5 font-black text-[#121314] hover:bg-[var(--reliq-lime-hover)] disabled:opacity-50"
            >
              {saving ? "Skipping…" : `Skip to Week ${request.week + 1}`}
            </button>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
