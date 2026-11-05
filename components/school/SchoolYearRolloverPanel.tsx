"use client";

import { useEffect, useRef, useState } from "react";
import { previewSchoolYear, rolloverOutcome, type SchoolYearRollover, type RolloverStudent } from "@/lib/school-year-rollover";

async function rolloverCommand(schoolId: string, payload: Record<string, unknown>): Promise<SchoolYearRollover> {
  const response = await fetch(`/api/school/${schoolId}/command`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(result.error || "School-year settings could not be loaded.");
  return result;
}

export default function SchoolYearRolloverPanel({ schoolId, onChanged }: { schoolId: string; onChanged: () => void }) {
  const [data, setData] = useState<SchoolYearRollover | null>(null);
  const [highestYear, setHighestYear] = useState(6);
  const [students, setStudents] = useState<RolloverStudent[]>([]);
  const [dirty, setDirty] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const { current: requests } = useRef({ version: 0 });
  function accept(result: SchoolYearRollover) {
    setData(result); setHighestYear(result.highestYear); setStudents(result.students);
    setDirty(false); setConfirming(false); setConfirmed(false);
  }
  useEffect(() => {
    const version = ++requests.version;
    setData(null); setError(""); setMessage(""); setConfirming(false); setBusy(true);
    void rolloverCommand(schoolId, { action: "getSchoolYearRollover" }).then(result => {
      if (version === requests.version) accept(result);
    }).catch(reason => { if (version === requests.version) setError(reason instanceof Error ? reason.message : "Unable to load rollover settings."); })
      .finally(() => { if (version === requests.version) setBusy(false); });
    return () => { requests.version++; };
  }, [schoolId, requests]);
  async function load(targetYear?: number) {
    const version = ++requests.version;
    setBusy(true); setError(""); setMessage(""); setConfirming(false);
    try { const result = await rolloverCommand(schoolId, { action: "getSchoolYearRollover", targetYear }); if (version === requests.version) accept(result); }
    catch (reason) { if (version === requests.version) setError(reason instanceof Error ? reason.message : "Unable to load preview."); }
    finally { if (version === requests.version) setBusy(false); }
  }
  async function act(action: string, extra: Record<string, unknown> = {}) {
    if (!data || busy) return;
    const version = ++requests.version;
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await rolloverCommand(schoolId, { action, targetYear: data.targetYear, reviewToken: data.reviewToken, ...extra });
      if (version !== requests.version) return;
      accept(result);
      setMessage(action === "saveSchoolYearPreparation" ? "Preparation saved. No students have been promoted." : action === "startSchoolYear" ? `${data.targetYear} school year started. Maths progress is unchanged.` : "Student kept in their previous school year. Maths progress is unchanged.");
      onChanged();
    } catch (reason) { if (version === requests.version) { setError(reason instanceof Error ? reason.message : "The change could not be completed. Reload the preview."); setConfirming(false); setConfirmed(false); } }
    finally { if (version === requests.version) setBusy(false); }
  }
  function editStudent(id: string, change: Partial<RolloverStudent>) {
    setStudents(current => current.map(student => student.id === id ? { ...student, ...change } : student)); setDirty(true); setConfirming(false); setMessage("");
  }
  const outcomes = students.map(student => rolloverOutcome(student, data?.targetYear ?? 0, highestYear));
  const count = (outcome: string) => outcomes.filter(value => value === outcome).length;
  const actionable = count("promoted") + count("retained") + count("leaver");
  const shown = students.filter(student => student.name.toLowerCase().includes(query.toLowerCase()));
  return <section className="border border-slate-200 bg-white p-5" aria-labelledby="school-rollover-heading">
    <h2 id="school-rollover-heading" className="text-xl font-bold text-slate-950">Start new school year</h2>
    <p className="mt-2 text-sm text-slate-600">Nothing runs automatically. Review the year groups, save preparation, then start the year when your school is ready. Maths working levels, results and rewards stay unchanged. Class assignments are managed separately.</p>
    {error ? <div className="mt-3"><p role="alert" className="text-sm font-semibold text-red-700">{error}</p><button type="button" disabled={busy} onClick={() => void load(data?.targetYear)} className="mt-2 underline">Reload preview</button></div> : null}
    {message ? <p role="status" className="mt-3 text-sm font-semibold text-emerald-800">{message}</p> : null}
    {!data && !error ? <p className="mt-4 text-sm" role="status">Loading school-year settings…</p> : null}
    {data ? <>
      <div className="mt-5 flex flex-wrap items-end gap-5">
        <label className="grid gap-1 text-sm font-semibold">Calendar year to start
          <select aria-label="Calendar year to start" value={data.targetYear} disabled={busy || dirty} onChange={event => void load(Number(event.target.value))} className="rounded-md border border-slate-300 bg-white p-2">
            {[data.calendarYear, data.calendarYear + 1].map(year => <option key={year} value={year}>{year}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">Highest year at this school
          <select aria-label="Highest year at this school" value={highestYear} disabled={busy || confirming} onChange={event => { setHighestYear(Number(event.target.value)); setDirty(true); setMessage(""); }} className="rounded-md border border-slate-300 bg-white p-2">
            {[6, 7, 8].map(year => <option key={year} value={year}>Year {year}</option>)}
          </select>
        </label>
      </div>
      <p className="mt-3 text-sm text-slate-600">For trial students, choose the calendar year their current year group applies to. If a student is already entered in their {data.targetYear} year group, choose {data.targetYear}; they will not move up again. “Keep same year” is for a student repeating their year group.</p>
      <label className="mt-4 block text-sm font-semibold">Find a student<input value={query} onChange={event => setQuery(event.target.value)} className="mt-1 block w-full max-w-sm rounded-md border border-slate-300 p-2" placeholder="Student name" /></label>
      <div className="mt-3 max-h-96 overflow-auto rounded-md border border-slate-200">
        <table className="w-full min-w-[700px] text-left text-sm"><thead className="sticky top-0 bg-slate-50"><tr><th className="p-3">Student</th><th className="p-3">Year group</th><th className="p-3">Year group applies to</th><th className="p-3">After starting {data.targetYear}</th><th className="p-3">Exception</th></tr></thead>
          <tbody>{shown.map(student => {
            const outcome = rolloverOutcome(student, data.targetYear, highestYear);
            const years = [...new Set([student.calendarYear, data.targetYear - 1, data.calendarYear, data.calendarYear + 1])].sort();
            return <tr key={student.id} className="border-t border-slate-100"><td className="p-3 font-semibold">{student.name}</td><td className="p-3">{student.yearLevel ?? "Not set"}</td><td className="p-3"><select aria-label={`Calendar year for ${student.name}`} value={student.calendarYear} disabled={busy || confirming || student.processed} onChange={event => editStudent(student.id, { calendarYear: Number(event.target.value) })} className="rounded border p-2">{years.map(year => <option key={year} value={year}>{year}</option>)}</select></td><td className="p-3">{outcome === "already" ? `${student.yearLevel ?? "Year group unchanged"} · Already set for ${student.calendarYear}` : outcome === "review" ? "Review year details before starting" : previewSchoolYear(student.yearLevel, highestYear, student.retain)}</td><td className="p-3"><label className="flex items-center gap-2"><input type="checkbox" disabled={busy || confirming || outcome === "already"} checked={student.retain} onChange={event => editStudent(student.id, { retain: event.target.checked })} aria-label={`Keep ${student.name} in the same school year`} />Keep same year</label></td></tr>;
          })}</tbody>
        </table>
        {!shown.length ? <p className="p-3 text-sm text-slate-600">{students.length ? "No students match." : "No active students yet. Add students before starting the year."}</p> : null}
      </div>
      <p className="mt-4 text-sm font-semibold">Whole-school preview: {count("promoted")} moving up · {count("retained")} staying in the same year · {count("already")} already set · {count("leaver")} school leavers to review · {count("review")} needing year details.</p>
      <p className="mt-2 text-sm text-slate-600">School leavers are flagged for review, never automatically archived. Saving a calendar-year choice does not change a student’s year group.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" disabled={busy || confirming} onClick={() => void act("saveSchoolYearPreparation", { highestYear, students: students.map(({ id, calendarYear, retain }) => ({ id, calendarYear, retain })) })} className="rounded-md border border-slate-400 px-4 py-2.5 font-bold disabled:opacity-50">Save preparation</button>
        <button type="button" disabled={busy || dirty || !data.prepared || Boolean(error) || count("review") > 0 || !actionable || confirming} onClick={() => { setConfirming(true); setConfirmed(false); }} className="rounded-md bg-slate-950 px-4 py-2.5 font-bold text-white disabled:opacity-50">Review and start {data.targetYear}</button>
        {dirty ? <button type="button" disabled={busy} onClick={() => void load(data.targetYear)} className="px-3 underline">Discard unsaved changes</button> : null}
      </div>
      {dirty || !data.prepared ? <p className="mt-2 text-sm">Save your preparation before starting the year.</p> : null}
      {confirming ? <div role="region" aria-label="Confirm new school year" className="mt-5 rounded-lg border-2 border-amber-400 bg-amber-50 p-5">
        <h3 className="font-bold">Start {data.targetYear} now?</h3>
        <p className="mt-2">This updates the school year for {actionable} students now: {count("promoted")} move up, {count("retained")} stay in their year group, and {count("leaver")} are marked for school-leaver review. {count("already")} already-set students will be skipped. Learning progress and class assignments stay unchanged.</p>
        <label className="mt-4 flex items-start gap-2"><input type="checkbox" checked={confirmed} disabled={busy} onChange={event => setConfirmed(event.target.checked)} />I have checked the calendar years and students staying in the same year.</label>
        <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={busy || !confirmed} onClick={() => void act("startSchoolYear")} className="rounded bg-slate-950 px-4 py-3 font-bold text-white disabled:opacity-50">{busy ? "Starting…" : `Start ${data.targetYear} school year`}</button><button type="button" disabled={busy} onClick={() => { setConfirming(false); setConfirmed(false); }} className="rounded border px-4 py-3">Cancel</button></div>
      </div> : null}
      {data.lastResults.length ? <div className="mt-6 border-t border-slate-200 pt-4"><h3 className="font-bold">{data.targetYear} rollover results</h3><p className="mt-1 text-sm text-slate-600">Correct an accidental promotion here. Review school leavers in Students.</p>
        <ul className="mt-3 max-h-72 divide-y divide-slate-100 overflow-auto">{data.lastResults.map(result => <li key={result.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><span><b>{result.name}</b> · {result.previousYearLevel} → {result.newYearLevel}<span className="ml-2 text-slate-600">{result.outcome === "leaver_review" ? "School leaver — review" : result.outcome === "year_review" ? "Year level needs review" : result.outcome === "retained" ? "Kept in same year" : "Promoted"}</span></span>{result.outcome === "promoted" ? <button type="button" disabled={busy || dirty || confirming} onClick={() => void act("retainStudentAfterManualRollover", { studentId: result.id })} className="rounded-md border border-slate-300 px-3 py-2 font-semibold disabled:opacity-50">Keep {result.name} in {result.previousYearLevel}</button> : null}</li>)}</ul>
      </div> : null}
    </> : null}
  </section>;
}
