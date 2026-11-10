"use client";

import { useCallback, useEffect, useState } from "react";

type SchoolYear = { id: string; calendarYear: number; status: string; current: boolean; hasLicence: boolean; classes: number; students: number };
type SchoolYears = { currentYear: number | null; thisYear: number; years: SchoolYear[] };

async function yearsCommand(schoolId: string, payload: Record<string, unknown>): Promise<SchoolYears> {
  const response = await fetch(`/api/school/${schoolId}/command`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(result.error || "School years could not be loaded.");
  return result;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : word.endsWith("s") ? "es" : "s"}`;

/** Which school year teachers and students are in, and the switch to the next one. */
export default function SchoolYearsPanel({ schoolId, onChanged }: { schoolId: string; onChanged: () => void }) {
  const [data, setData] = useState<SchoolYears | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmYear, setConfirmYear] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError("");
    try { setData(await yearsCommand(schoolId, { action: "getSchoolYears" })); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "School years could not be loaded."); }
  }, [schoolId]);
  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function makeCurrent(calendarYear: number) {
    setBusy(true); setError(""); setMessage("");
    try {
      setData(await yearsCommand(schoolId, { action: "makeSchoolYearCurrent", calendarYear }));
      setMessage(`${calendarYear} is now the current school year.`);
      setConfirmYear(null);
      onChanged();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The school year could not be changed."); }
    finally { setBusy(false); }
  }

  const current = data?.years.find((year) => year.current) ?? null;
  const going = confirmYear !== null && current ? confirmYear > current.calendarYear : true;

  return <section className="border border-slate-200 bg-white p-5" aria-labelledby="school-years-heading">
    <h2 id="school-years-heading" className="text-xl font-bold text-slate-950">School years</h2>
    <p className="mt-2 text-sm text-slate-600">The current year is the one teachers and students work in. Each year has its own classes and licence, and earlier years stay viewable as history.</p>
    {error ? <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
    {message ? <p role="status" className="mt-3 text-sm font-semibold text-emerald-800">{message}</p> : null}
    {!data && !error ? <p className="mt-4 text-sm" role="status">Loading school years…</p> : null}
    {data ? <div className="mt-4 divide-y divide-slate-100 rounded-md border border-slate-200">
      {data.years.length === 0 ? <p className="p-4 text-sm text-slate-600">No school years yet. RELIQ adds one with each year&apos;s licence.</p> : null}
      {data.years.map((year) => {
        const later = current ? year.calendarYear > current.calendarYear : false;
        const earlier = current ? year.calendarYear < current.calendarYear : false;
        return <div key={year.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xl font-black text-slate-950">{year.calendarYear}</span>
            {year.current ? <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-bold text-white">Current</span>
              : later ? <span className="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-700">Next · open for planning</span>
              : <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Previous · read-only</span>}
            <span className="text-sm text-slate-600">{plural(year.classes, "class")} · {plural(year.students, "student")} in classes · {year.hasLicence ? "licensed" : <b className="text-amber-800">no licence</b>}</span>
          </div>
          {!year.current ? (
            later ? (year.hasLicence
              ? <button type="button" disabled={busy} onClick={() => setConfirmYear(year.calendarYear)} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Make {year.calendarYear} current</button>
              : <span className="text-sm text-slate-600">Ask RELIQ for a {year.calendarYear} licence</span>)
            : earlier && year.hasLicence && year.status !== "archived"
              ? <button type="button" disabled={busy} onClick={() => setConfirmYear(year.calendarYear)} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50">Go back to {year.calendarYear}</button>
              : null
          ) : null}
        </div>;
      })}
    </div> : null}

    {confirmYear !== null && current ? <div role="region" aria-label="Confirm school year" className="mt-5 rounded-lg border-2 border-amber-400 bg-amber-50 p-5">
      <h3 className="font-bold">{going ? `Make ${confirmYear} current?` : `Go back to ${confirmYear}?`}</h3>
      {going ? <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li>Teachers start with their {confirmYear} classes, and new classes are made in {confirmYear}.</li>
        <li>{current.calendarYear} classes and results stay viewable. No new {current.calendarYear} classes can be made.</li>
        <li>Students keep logging in. Each one moves into their {confirmYear} class when a teacher adds them to it.</li>
        <li>Moving students up a year group is separate: use &quot;Move students into {confirmYear}&quot; below if you haven&apos;t yet.</li>
      </ul> : <p className="mt-2 text-sm">{confirmYear} becomes current again and {current.calendarYear} goes back to planning. No classes, students or results change.</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => void makeCurrent(confirmYear)} className="rounded bg-slate-950 px-4 py-3 font-bold text-white disabled:opacity-50">{busy ? "Saving…" : going ? `Make ${confirmYear} current` : `Go back to ${confirmYear}`}</button>
        <button type="button" disabled={busy} onClick={() => setConfirmYear(null)} className="rounded border px-4 py-3">Cancel</button>
      </div>
    </div> : null}
  </section>;
}
