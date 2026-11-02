"use client";

import { useEffect, useState } from "react";
import { previewSchoolYear, type SchoolYearRollover } from "@/lib/school-year-rollover";

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
  const [enabled, setEnabled] = useState(false);
  const [retained, setRetained] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  function accept(result: SchoolYearRollover) {
    setData(result); setHighestYear(result.highestYear); setEnabled(result.enabled);
    setRetained(new Set(result.students.filter(student => student.retain).map(student => student.id)));
  }
  useEffect(() => {
    let cancelled = false;
    setData(null); setError(""); setMessage("");
    void rolloverCommand(schoolId, { action: "getSchoolYearRollover" }).then(result => {
      if (!cancelled) accept(result);
    }).catch(reason => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load rollover settings."); });
    return () => { cancelled = true; };
  }, [schoolId]);

  async function save() {
    if (!data) return;
    setBusy(true); setError(""); setMessage("");
    try {
      accept(await rolloverCommand(schoolId, { action: "saveSchoolYearRollover", highestYear, enabled,
        targetYear: data.targetYear, retainedStudentIds: [...retained] }));
      setMessage(enabled ? `Saved. School years will advance automatically from 1 January ${data.targetYear}.` : "Automatic rollover is paused. Your settings are saved.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Settings could not be saved."); }
    finally { setBusy(false); }
  }
  async function keepPreviousYear(studentId: string, targetYear: number) {
    setBusy(true); setError(""); setMessage("");
    try {
      accept(await rolloverCommand(schoolId, { action: "retainStudentAfterRollover", studentId, targetYear }));
      setMessage("Student kept in their previous school year. Maths progress is unchanged."); onChanged();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The year could not be corrected."); }
    finally { setBusy(false); }
  }
  const shown = data?.students.filter(student => student.name.toLowerCase().includes(query.toLowerCase())) ?? [];
  return <section className="border border-slate-200 bg-white p-5" aria-labelledby="school-rollover-heading">
    <h2 id="school-rollover-heading" className="text-xl font-bold text-slate-950">New school year</h2>
    <p className="mt-2 text-sm text-slate-600">School years advance automatically each January once enabled. Maths working levels, results and rewards stay unchanged. Class assignments are managed separately.</p>
    {error ? <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p> : null}
    {message ? <p role="status" className="mt-3 text-sm font-semibold text-emerald-800">{message}</p> : null}
    {!data && !error ? <p className="mt-4 text-sm" role="status">Loading school-year settings…</p> : null}
    {data ? <>
      <div className="mt-5 flex flex-wrap items-end gap-5">
        <label className="grid gap-1 text-sm font-semibold">Highest year at this school
          <select value={highestYear} disabled={busy} onChange={event => setHighestYear(Number(event.target.value))} className="rounded-md border border-slate-300 bg-white p-2">
            {[6, 7, 8].map(year => <option key={year} value={year}>Year {year}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm font-semibold"><input type="checkbox" checked={enabled} disabled={busy} onChange={event => setEnabled(event.target.checked)} />Enable automatic yearly rollover</label>
      </div>
      <p className="mt-3 text-sm text-slate-600">Preview for {data.targetYear}. Select “Keep same year” for any student staying in their current school year. Students at the school’s final year are flagged for review; they are not automatically archived.</p>
      <label className="mt-4 block text-sm font-semibold">Find a student<input value={query} onChange={event => setQuery(event.target.value)} className="mt-1 block w-full max-w-sm rounded-md border border-slate-300 p-2" placeholder="Student name" /></label>
      <div className="mt-3 max-h-80 overflow-auto rounded-md border border-slate-200">
        <table className="w-full min-w-[520px] text-left text-sm"><thead className="sticky top-0 bg-slate-50"><tr><th className="p-3">Student</th><th className="p-3">Current year</th><th className="p-3">{data.targetYear}</th><th className="p-3">Exception</th></tr></thead>
          <tbody>{shown.map(student => <tr key={student.id} className="border-t border-slate-100"><td className="p-3 font-semibold">{student.name}</td><td className="p-3">{student.yearLevel ?? "Not set"}</td><td className="p-3">{previewSchoolYear(student.yearLevel, highestYear, retained.has(student.id))}</td><td className="p-3"><label className="flex items-center gap-2"><input type="checkbox" disabled={busy} checked={retained.has(student.id)} onChange={event => setRetained(current => { const next = new Set(current); if (event.target.checked) next.add(student.id); else next.delete(student.id); return next; })} aria-label={`Keep ${student.name} in the same school year`} />Keep same year</label></td></tr>)}</tbody>
        </table>
        {!shown.length ? <p className="p-3 text-sm text-slate-600">No students match.</p> : null}
      </div>
      <button type="button" disabled={busy} onClick={() => void save()} className="mt-4 rounded-md bg-slate-950 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving…" : "Save rollover settings"}</button>
      {data.lastResults.length ? <div className="mt-6 border-t border-slate-200 pt-4"><h3 className="font-bold">{data.calendarYear} rollover results</h3><p className="mt-1 text-sm text-slate-600">If a student was promoted but needs to stay in their previous school year, correct it here. Review school leavers in Students.</p>
        <ul className="mt-3 max-h-72 divide-y divide-slate-100 overflow-auto">{data.lastResults.map(result => <li key={result.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><span><b>{result.name}</b> · {result.previousYearLevel} → {result.newYearLevel}<span className="ml-2 text-slate-600">{result.outcome === "leaver_review" ? "School leaver — review" : result.outcome === "year_review" ? "Year level needs review" : result.outcome === "retained" ? "Kept in same year" : "Promoted"}</span></span>{result.outcome === "promoted" ? <button type="button" disabled={busy} onClick={() => void keepPreviousYear(result.id, result.targetYear)} className="rounded-md border border-slate-300 px-3 py-2 font-semibold disabled:opacity-50">Keep {result.name} in {result.previousYearLevel}</button> : null}</li>)}</ul>
      </div> : null}
    </> : null}
  </section>;
}
