"use client";

// Focus Mode — teacher control. Pin the whole class to one realm for a window
// (e.g. "Number for 2 weeks") and flip "Class in session" to lock the other
// realms. The lock only bites while the switch is on, so students still roam
// freely at home. Enforcement is server-side (see lib/focus-lock.ts); this is
// the teacher's cockpit for it.

import { useCallback, useEffect, useMemo, useState } from "react";
import { getLiveRealmDefinitions } from "@/lib/realms/realm-registry";
import {
  clearClassFocus,
  getClassFocus,
  setClassEngaged,
  setClassFocus,
  type ClassFocus,
} from "@/lib/focus-lock";

const WINDOW_OPTIONS: Array<{ label: string; weeks: number | null }> = [
  { label: "1 week", weeks: 1 },
  { label: "2 weeks", weeks: 2 },
  { label: "4 weeks", weeks: 4 },
  { label: "No end date", weeks: null },
];

function endDateFromWeeks(weeks: number | null): string | null {
  if (weeks == null) return null;
  const end = new Date();
  end.setDate(end.getDate() + weeks * 7);
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

export default function FocusModeControl({
  classId,
  className,
}: {
  classId: string;
  className?: string | null;
}) {
  const realmOptions = useMemo(
    () => getLiveRealmDefinitions().map((realm) => ({ id: realm.realmId, name: realm.name })),
    [],
  );

  const [focus, setFocus] = useState<ClassFocus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftRealm, setDraftRealm] = useState<string>(realmOptions[0]?.id ?? "number");
  const [draftWeeks, setDraftWeeks] = useState<number | null>(2);

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
      const updated = await setClassFocus(classId, draftRealm, endDateFromWeeks(draftWeeks));
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

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.12em] text-slate-700">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="3.4" />
            </svg>
            Focus Mode
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Lock {className ? <span className="font-semibold text-slate-600">{className}</span> : "the class"} to one
            realm while in class. Students still roam every realm at home.
          </p>
        </div>
        {focus ? (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
              focus.engaged ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
            }`}
          >
            {focus.engaged ? "In session" : "Standby"}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="mt-4 h-10 animate-pulse rounded-lg bg-slate-100" />
      ) : focus ? (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Focused realm</p>
              <p className="text-lg font-black text-slate-800">{focusRealmName}</p>
            </div>
            <p className="text-xs text-slate-500">
              until <span className="font-semibold text-slate-700">{formatDate(focus.endsAt)}</span>
            </p>
          </div>

          {/* The "Class in session" switch — the only thing that turns the lock on. */}
          <button
            type="button"
            onClick={() => void toggleEngaged(!focus.engaged)}
            disabled={busy}
            aria-pressed={focus.engaged}
            className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-3 text-left transition disabled:opacity-60 ${
              focus.engaged
                ? "border-emerald-300 bg-emerald-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <span>
              <span className="block text-sm font-bold text-slate-800">Class in session</span>
              <span className="block text-xs text-slate-500">
                {focus.engaged
                  ? "Lock is on — other realms are closed for the class."
                  : "Turn on when the lesson starts to lock the other realms."}
              </span>
            </span>
            <span
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                focus.engaged ? "bg-emerald-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                  focus.engaged ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold text-slate-500">
              Change realm
              <select
                value={draftRealm}
                onChange={(event) => setDraftRealm(event.target.value)}
                className="ml-2 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-700"
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
              className="ml-auto rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-60"
            >
              Clear focus
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-xs font-semibold text-slate-500">
            Realm
            <select
              value={draftRealm}
              onChange={(event) => setDraftRealm(event.target.value)}
              className="mt-1 block rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-700"
            >
              {realmOptions.map((realm) => (
                <option key={realm.id} value={realm.id}>
                  {realm.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-500">
            For
            <select
              value={draftWeeks == null ? "none" : String(draftWeeks)}
              onChange={(event) =>
                setDraftWeeks(event.target.value === "none" ? null : Number(event.target.value))
              }
              className="mt-1 block rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm font-semibold text-slate-700"
            >
              {WINDOW_OPTIONS.map((option) => (
                <option key={option.label} value={option.weeks == null ? "none" : String(option.weeks)}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void applyFocus()}
            disabled={busy}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-900 disabled:opacity-60"
          >
            Set focus
          </button>
        </div>
      )}

      {error ? <p className="mt-3 text-xs font-semibold text-rose-600">{error}</p> : null}
    </section>
  );
}
