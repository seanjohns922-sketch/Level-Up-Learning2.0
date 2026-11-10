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

const YEAR_ORDER = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8"];
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/**
 * Roll-over: every student moves up one year group into the new calendar year, the top year
 * group is marked as leaving, and the admin only handles exceptions. The database does the
 * protected work (save_school_year_preparation, start_school_year); this screen never moves a
 * student twice and starts nothing until the admin confirms.
 */
export default function SchoolYearRolloverPanel({ schoolId, onChanged }: { schoolId: string; onChanged: () => void }) {
  const [data, setData] = useState<SchoolYearRollover | null>(null);
  const [highestYear, setHighestYear] = useState(6);
  const [students, setStudents] = useState<RolloverStudent[]>([]);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const { current: requests } = useRef({ version: 0 });
  function accept(result: SchoolYearRollover) {
    setData(result); setHighestYear(result.highestYear); setStudents(result.students);
    setConfirming(false); setConfirmed(false);
  }
  useEffect(() => {
    const version = ++requests.version;
    setData(null); setError(""); setMessage(""); setConfirming(false); setBusy(true);
    void rolloverCommand(schoolId, { action: "getSchoolYearRollover" }).then(result => {
      if (version === requests.version) accept(result);
    }).catch(reason => { if (version === requests.version) setError(reason instanceof Error ? reason.message : "Unable to load the school year."); })
      .finally(() => { if (version === requests.version) setBusy(false); });
    return () => { requests.version++; };
  }, [schoolId, requests]);
  async function load(targetYear?: number) {
    const version = ++requests.version;
    setBusy(true); setError(""); setMessage(""); setConfirming(false);
    try { const result = await rolloverCommand(schoolId, { action: "getSchoolYearRollover", targetYear }); if (version === requests.version) accept(result); }
    catch (reason) { if (version === requests.version) setError(reason instanceof Error ? reason.message : "Unable to load the school year."); }
    finally { if (version === requests.version) setBusy(false); }
  }
  /** Saves the choices (with the review token the admin saw), then starts the year with the token the save returns. */
  async function moveStudents() {
    if (!data || busy) return;
    const version = ++requests.version;
    setBusy(true); setError(""); setMessage("");
    try {
      const saved = await rolloverCommand(schoolId, {
        action: "saveSchoolYearPreparation", targetYear: data.targetYear, reviewToken: data.reviewToken, highestYear,
        students: students.map(({ id, calendarYear, retain }) => ({ id, calendarYear, retain })),
      });
      const started = await rolloverCommand(schoolId, { action: "startSchoolYear", targetYear: data.targetYear, reviewToken: saved.reviewToken });
      if (version !== requests.version) return;
      accept(started);
      setMessage(`Students are now in their ${data.targetYear} year groups. Maths progress is unchanged.`);
      onChanged();
    } catch (reason) {
      if (version === requests.version) { setError(reason instanceof Error ? reason.message : "The change could not be completed. Reload and review again."); setConfirming(false); setConfirmed(false); }
    } finally { if (version === requests.version) setBusy(false); }
  }
  async function keepInPreviousYear(studentId: string) {
    if (!data || busy) return;
    const version = ++requests.version;
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await rolloverCommand(schoolId, { action: "retainStudentAfterManualRollover", targetYear: data.targetYear, studentId });
      if (version !== requests.version) return;
      accept(result);
      setMessage("Student kept in their previous year group. Maths progress is unchanged.");
      onChanged();
    } catch (reason) { if (version === requests.version) setError(reason instanceof Error ? reason.message : "The change could not be completed."); }
    finally { if (version === requests.version) setBusy(false); }
  }
  function editStudent(id: string, change: Partial<RolloverStudent>) {
    setStudents(current => current.map(student => student.id === id ? { ...student, ...change } : student)); setConfirming(false); setMessage("");
  }

  if (!data) {
    return <section className="border border-slate-200 bg-white p-5" aria-labelledby="school-rollover-heading">
      <h2 id="school-rollover-heading" className="text-xl font-bold text-slate-950">Move students into the new school year</h2>
      {error ? <div className="mt-3"><p role="alert" className="text-sm font-semibold text-red-700">{error}</p><button type="button" disabled={busy} onClick={() => void load()} className="mt-2 underline">Reload</button></div>
        : <p className="mt-4 text-sm" role="status">Loading your school&apos;s students…</p>}
    </section>;
  }

  const target = data.targetYear;
  const outcomeOf = (student: RolloverStudent) => rolloverOutcome(student, target, highestYear);
  const outcomes = students.map(outcomeOf);
  const count = (outcome: string) => outcomes.filter(value => value === outcome).length;
  const actionable = count("promoted") + count("retained") + count("leaver");
  const toCheck = students.filter(student => outcomeOf(student) === "review");
  // Year groups of students who will move (or stay) this time.
  const groups = YEAR_ORDER.map(level => {
    const inGroup = students.filter(student => student.yearLevel === level && ["promoted", "retained", "leaver"].includes(outcomeOf(student)));
    return { level, students: inGroup, staying: inGroup.filter(student => student.retain).length, leaving: previewSchoolYear(level, highestYear, false) === "School leaver — review" };
  }).filter(group => group.students.length > 0);
  const loadedYear = new Map(data.students.map(student => [student.id, student.calendarYear]));
  const exceptions = students.filter(student => !student.processed && (student.retain || student.calendarYear !== loadedYear.get(student.id)));
  const search = query.trim().toLowerCase();
  const found = search ? students.filter(student => student.name.toLowerCase().includes(search)).slice(0, 8) : [];
  const done = data.lastResults.length > 0;

  function setGroup(level: string, move: boolean) {
    setStudents(current => current.map(student => student.yearLevel === level && ["promoted", "retained"].includes(rolloverOutcome(student, target, highestYear)) ? { ...student, retain: !move } : student));
    setConfirming(false); setMessage("");
  }

  return <section className="border border-slate-200 bg-white p-5" aria-labelledby="school-rollover-heading">
    <h2 id="school-rollover-heading" className="text-xl font-bold text-slate-950">Move students into {target}</h2>
    <p className="mt-2 text-sm text-slate-600">Every student moves up one year group, and Year {highestYear} students are marked as leaving. You only change the students who are different. Nothing happens until you confirm. Maths levels, results and rewards stay the same, and classes are set up separately.</p>
    {error ? <div className="mt-3"><p role="alert" className="text-sm font-semibold text-red-700">{error}</p><button type="button" disabled={busy} onClick={() => void load(target)} className="mt-2 underline">Reload and review again</button></div> : null}
    {message ? <p role="status" className="mt-3 text-sm font-semibold text-emerald-800">{message}</p> : null}

    <div className="mt-5 flex flex-wrap items-end gap-5">
      <label className="grid gap-1 text-sm font-semibold">Move students into
        <select aria-label="Calendar year to start" value={target} disabled={busy || confirming} onChange={event => void load(Number(event.target.value))} className="rounded-md border border-slate-300 bg-white p-2">
          {[data.calendarYear, data.calendarYear + 1].map(year => <option key={year} value={year}>{year}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">Highest year at this school
        <select aria-label="Highest year at this school" value={highestYear} disabled={busy || confirming} onChange={event => { setHighestYear(Number(event.target.value)); setMessage(""); }} className="rounded-md border border-slate-300 bg-white p-2">
          {[6, 7, 8].map(year => <option key={year} value={year}>Year {year}</option>)}
        </select>
      </label>
    </div>

    <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
      {[["Moving up", count("promoted")], [`Already in ${target}`, count("already")], ["Staying in same year", count("retained")], ["Leaving", count("leaver")], ["Need checking", count("review")]].map(([label, value]) => (
        <div key={String(label)} className={`rounded-md border p-3 ${label === "Need checking" && Number(value) > 0 ? "border-amber-300 bg-amber-50" : "border-slate-200"}`}>
          <dt className="text-xs font-bold uppercase text-slate-500">{label}</dt><dd className="mt-1 text-2xl font-black text-slate-950">{value}</dd>
        </div>
      ))}
    </dl>

    {groups.length ? <div className="mt-5 overflow-hidden rounded-md border border-slate-200">
      <table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Year group now</th><th className="p-3">Students</th><th className="p-3">In {target}</th><th className="p-3">Move this year group</th></tr></thead>
        <tbody>{groups.map(group => {
          const allStay = group.staying === group.students.length;
          return <tr key={group.level} className="border-t border-slate-100">
            <td className="p-3 font-semibold">{group.level}</td>
            <td className="p-3">{group.students.length}{group.staying && !allStay ? ` (${group.staying} staying)` : ""}</td>
            <td className="p-3">{group.leaving ? "Leaving the school" : allStay ? `${group.level} (staying)` : previewSchoolYear(group.level, highestYear, false)}</td>
            <td className="p-3">{group.leaving ? <span className="text-slate-500">Listed in Students for you to archive</span>
              : <label className="flex items-center gap-2"><input type="checkbox" checked={!allStay} disabled={busy || confirming || done} onChange={event => setGroup(group.level, event.target.checked)} aria-label={`Move ${group.level} up`} />Move up</label>}</td>
          </tr>;
        })}</tbody>
      </table>
    </div> : null}

    {toCheck.length ? <div className="mt-5 rounded-md border border-amber-300 bg-amber-50 p-4">
      <h3 className="font-bold">Check {plural(toCheck.length, "student")} first</h3>
      <p className="mt-1 text-sm text-slate-700">Their year group isn&apos;t recorded for {target - 1}, so RELIQ can&apos;t tell whether they should move up. Choose which year their year group is for, or fix a missing year group in Students.</p>
      <ul className="mt-3 divide-y divide-amber-200">{toCheck.map(student => <li key={student.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
        <span><b>{student.name}</b> · {student.yearLevel ?? "No year group"}{student.calendarYear ? ` · recorded for ${student.calendarYear}` : ""}</span>
        {student.yearLevel ? <span className="flex gap-2">
          <button type="button" disabled={busy || confirming} onClick={() => editStudent(student.id, { calendarYear: target - 1 })} className="rounded-md border border-slate-400 bg-white px-3 py-1.5 font-semibold">{student.yearLevel} is for {target - 1}: move up</button>
          <button type="button" disabled={busy || confirming} onClick={() => editStudent(student.id, { calendarYear: target })} className="rounded-md border border-slate-400 bg-white px-3 py-1.5 font-semibold">Already in {target}</button>
        </span> : <span className="text-slate-600">Add a year group in Students</span>}
      </li>)}</ul>
    </div> : null}

    {!done ? <div className="mt-5">
      <label className="block text-sm font-semibold">Change one student (repeating a year, or already in their {target} group)
        <input value={query} onChange={event => setQuery(event.target.value)} className="mt-1 block w-full max-w-sm rounded-md border border-slate-300 p-2" placeholder="Student name" />
      </label>
      {found.length ? <ul className="mt-2 max-w-2xl divide-y divide-slate-100 rounded-md border border-slate-200">{found.map(student => {
        const outcome = outcomeOf(student);
        return <li key={student.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5 text-sm">
          <span><b>{student.name}</b> · {student.yearLevel ?? "No year group"} · {outcome === "already" ? `already in ${target}` : outcome === "review" ? "needs checking" : outcome === "leaver" ? "leaving" : outcome === "retained" ? "staying" : `moving to ${previewSchoolYear(student.yearLevel, highestYear, false)}`}</span>
          {!student.processed && outcome !== "review" ? <span className="flex gap-2">
            {outcome !== "already" ? <label className="flex items-center gap-1.5"><input type="checkbox" checked={student.retain} disabled={busy || confirming} onChange={event => editStudent(student.id, { retain: event.target.checked })} aria-label={`Keep ${student.name} in the same school year`} />Keep in {student.yearLevel}</label> : null}
            <button type="button" disabled={busy || confirming} onClick={() => editStudent(student.id, { calendarYear: student.calendarYear === target ? target - 1 : target, retain: false })} className="rounded-md border border-slate-300 px-2.5 py-1 font-semibold">{student.calendarYear === target ? `Not yet in ${target}` : `Already in ${target}`}</button>
          </span> : null}
        </li>;
      })}</ul> : null}
      {exceptions.length ? <p className="mt-3 text-sm text-slate-700"><b>Changes:</b> {[
        ...groups.filter(group => !group.leaving && group.staying === group.students.length).map(group => `${group.level} (all ${group.students.length} staying)`),
        ...exceptions.filter(student => !(student.retain && groups.some(group => group.level === student.yearLevel && group.staying === group.students.length)))
          .map(student => `${student.name} (${student.retain ? `stays in ${student.yearLevel}` : student.calendarYear === target ? `already in ${target}` : `moves up from ${student.yearLevel}`})`),
      ].join(", ")}</p> : null}
    </div> : null}

    <div className="mt-5 flex flex-wrap gap-3">
      <button type="button" disabled={busy || Boolean(error) || count("review") > 0 || !actionable || confirming} onClick={() => { setConfirming(true); setConfirmed(false); }} className="rounded-md bg-slate-950 px-4 py-2.5 font-bold text-white disabled:opacity-50">Review and move into {target}</button>
    </div>
    {count("review") > 0 ? <p className="mt-2 text-sm">Check the students above before moving everyone.</p> : null}

    {confirming ? <div role="region" aria-label="Confirm new school year" className="mt-5 rounded-lg border-2 border-amber-400 bg-amber-50 p-5">
      <h3 className="font-bold">Move students into {target} now?</h3>
      <p className="mt-2">{count("promoted")} move up a year group, {count("retained")} stay in their year group and {count("leaver")} are marked as leaving. {count("already")} already-set students will be skipped. Maths levels, results, rewards and classes stay the same.</p>
      <label className="mt-4 flex items-start gap-2"><input type="checkbox" checked={confirmed} disabled={busy} onChange={event => setConfirmed(event.target.checked)} />I have checked the students staying in the same year.</label>
      <div className="mt-4 flex flex-wrap gap-3"><button type="button" disabled={busy || !confirmed} onClick={() => void moveStudents()} className="rounded bg-slate-950 px-4 py-3 font-bold text-white disabled:opacity-50">{busy ? "Moving…" : `Move students into ${target}`}</button><button type="button" disabled={busy} onClick={() => { setConfirming(false); setConfirmed(false); }} className="rounded border px-4 py-3">Cancel</button></div>
    </div> : null}

    {done ? <div className="mt-6 border-t border-slate-200 pt-4"><h3 className="font-bold">Moved into {target}</h3><p className="mt-1 text-sm text-slate-600">Moved someone by mistake? Keep them in their previous year group here. Leavers are listed in Students.</p>
      <ul className="mt-3 max-h-72 divide-y divide-slate-100 overflow-auto">{data.lastResults.map(result => <li key={result.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><span><b>{result.name}</b> · {result.previousYearLevel} → {result.newYearLevel}<span className="ml-2 text-slate-600">{result.outcome === "leaver_review" ? "Leaving" : result.outcome === "year_review" ? "Year group needs review" : result.outcome === "retained" ? "Kept in same year" : "Moved up"}</span></span>{result.outcome === "promoted" ? <button type="button" disabled={busy || confirming} onClick={() => void keepInPreviousYear(result.id)} className="rounded-md border border-slate-300 px-3 py-2 font-semibold disabled:opacity-50">Keep {result.name} in {result.previousYearLevel}</button> : null}</li>)}</ul>
    </div> : null}
  </section>;
}
