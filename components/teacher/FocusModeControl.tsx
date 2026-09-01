"use client";

// Focus Mode — teacher control, rendered as a single inline bar inside the Live
// Class widget. Pin the whole class to one realm for a window (e.g. "Number for
// 2 weeks") and flip "Class in session" to lock the other realms. The lock only
// bites while the switch is on, so students still roam freely at home.
// Enforcement is server-side (see lib/focus-lock.ts); this is the teacher cockpit.

import { useCallback, useEffect, useMemo, useState } from "react";
import { getLiveRealmDefinitions } from "@/lib/realms/realm-registry";
import {
  clearClassFocus,
  getClassFocus,
  setClassEngaged,
  setClassFocus,
  type ClassFocus,
} from "@/lib/focus-lock";

const WINDOW_OPTIONS: Array<{ label: string; days: number | null }> = [
  { label: "1 day", days: 1 },
  { label: "1 week", days: 7 },
  { label: "2 weeks", days: 14 },
  { label: "4 weeks", days: 28 },
  { label: "No end date", days: null },
];

function endDateFromDays(days: number | null): string | null {
  if (days == null) return null;
  const end = new Date();
  end.setDate(end.getDate() + days);
  return end.toISOString();
}

function formatDate(value: string | null): string {
  if (!value) return "no end date";
  try {
    return new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  } catch {
    return "no end date";
  }
}

export default function FocusModeControl({ classId }: { classId: string }) {
  const realmOptions = useMemo(
    () => getLiveRealmDefinitions().map((realm) => ({ id: realm.realmId, name: realm.name })),
    [],
  );

  const [focus, setFocus] = useState<ClassFocus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftRealm, setDraftRealm] = useState<string>(realmOptions[0]?.id ?? "number");
  const [draftDays, setDraftDays] = useState<number | null>(14);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const current = await getClassFocus(classId);
      setFocus(current);
      if (current) setDraftRealm(current.focusRealmId);
      setError(null);
    } catch {
      setError("Could not load Focus Mode.");
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    void load();
  }, [load]);

  const focusRealmName =
    realmOptions.find((r) => r.id === focus?.focusRealmId)?.name ?? focus?.focusRealmId ?? "";

  async function applyFocus() {
    setBusy(true);
    setError(null);
    try {
      const updated = await setClassFocus(classId, draftRealm, endDateFromDays(draftDays));
      setFocus(updated);
    } catch {
      setError("Could not set the focus.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleEngaged(next: boolean) {
    setBusy(true);
    setError(null);
    try {
      const updated = await setClassEngaged(classId, next);
      setFocus(updated);
    } catch {
      setError("Could not update the session switch.");
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    setBusy(true);
    setError(null);
    try {
      await clearClassFocus(classId);
      setFocus(null);
    } catch {
      setError("Could not clear the focus.");
    } finally {
      setBusy(false);
    }
  }

  const selectClass =
    "rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-700";

  return (
    <div className="mt-4 border-t border-slate-100 pt-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-slate-500">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="3.4" />
          </svg>
          Focus Mode
        </span>

        {loading ? (
          <span className="h-6 w-40 animate-pulse rounded bg-slate-100" />
        ) : focus ? (
          <>
            <span className="text-slate-600">
              Class locked to <span className="font-black text-slate-800">{focusRealmName}</span>
              <span className="text-slate-400"> · until {formatDate(focus.endsAt)}</span>
            </span>

            {/* The "Class in session" switch — the only thing that turns the lock on. */}
            <button
              type="button"
              onClick={() => void toggleEngaged(!focus.engaged)}
              disabled={busy}
              aria-pressed={focus.engaged}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-bold transition disabled:opacity-60 ${
                focus.engaged
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
                  focus.engaged ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
                    focus.engaged ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </span>
              {focus.engaged ? "In session — locked" : "Class in session"}
            </button>

            <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />

            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              Realm
              <select
                value={draftRealm}
                onChange={(event) => setDraftRealm(event.target.value)}
                className={selectClass}
              >
                {realmOptions.map((realm) => (
                  <option key={realm.id} value={realm.id}>
                    {realm.name}
                  </option>
                ))}
              </select>
            </label>
            {draftRealm !== focus.focusRealmId ? (
              <button
                type="button"
                onClick={() => void applyFocus()}
                disabled={busy}
                className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-bold text-white hover:bg-slate-900 disabled:opacity-60"
              >
                Apply
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void clear()}
              disabled={busy}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-60"
            >
              Clear
            </button>
          </>
        ) : (
          <>
            <span className="text-slate-500">Lock the class to one realm during class — students still roam at home.</span>
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              Realm
              <select
                value={draftRealm}
                onChange={(event) => setDraftRealm(event.target.value)}
                className={selectClass}
              >
                {realmOptions.map((realm) => (
                  <option key={realm.id} value={realm.id}>
                    {realm.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              For
              <select
                value={draftDays == null ? "none" : String(draftDays)}
                onChange={(event) =>
                  setDraftDays(event.target.value === "none" ? null : Number(event.target.value))
                }
                className={selectClass}
              >
                {WINDOW_OPTIONS.map((option) => (
                  <option key={option.label} value={option.days == null ? "none" : String(option.days)}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => void applyFocus()}
              disabled={busy}
              className="rounded-md bg-slate-800 px-4 py-1.5 text-sm font-bold text-white hover:bg-slate-900 disabled:opacity-60"
            >
              Set focus
            </button>
          </>
        )}

        {error ? <span className="text-xs font-semibold text-rose-600">{error}</span> : null}
      </div>
    </div>
  );
}
