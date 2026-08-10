"use client";

import { Building2, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { PlatformSchoolSummary } from "@/lib/platform-admin-server";

type Filter = "all" | "active" | "trial" | "paused" | "high_utilisation" | "low_activity" | "high_home" | "low_home";

function statusClass(status: string) {
  if (status === "active") return "bg-emerald-100 text-emerald-800";
  if (status === "trial") return "bg-sky-100 text-sky-800";
  if (status === "paused") return "bg-amber-100 text-amber-800";
  return "bg-slate-100 text-slate-700";
}

function formatDate(value: string | null) {
  if (!value) return "No activity";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "No activity"
    : new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export default function SchoolsAdminClient({ schools, asOf }: { schools: PlatformSchoolSummary[]; asOf: string }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const year = new Date().getFullYear();

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return schools.filter((school) => {
      if (term && !school.name.toLowerCase().includes(term) && !school.code.toLowerCase().includes(term)) return false;
      if (filter === "active" || filter === "trial" || filter === "paused") return school.status === filter;
      if (filter === "high_utilisation") return school.utilisationPercent >= 90;
      if (filter === "low_activity") return !school.lastActive || new Date(asOf).getTime() - new Date(school.lastActive).getTime() > 14 * 86_400_000;
      if (filter === "high_home") return school.homeActivationPercent >= 30;
      if (filter === "low_home") return school.homeActivationPercent < 10;
      return true;
    });
  }, [asOf, filter, query, schools]);

  async function createSchool(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const response = await fetch("/api/admin/command", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "createSchool",
        name: formData.get("name"),
        schoolCode: formData.get("schoolCode"),
        academicYear: Number(formData.get("academicYear")),
        seatLimit: Number(formData.get("seatLimit")),
        status: formData.get("status"),
        notes: formData.get("notes"),
        idempotencyKey: crypto.randomUUID(),
      }),
    });
    const result = (await response.json().catch(() => null)) as { schoolId?: string; error?: string } | null;
    if (!response.ok || !result?.schoolId) {
      setError(result?.error ?? "School could not be created");
      setSubmitting(false);
      return;
    }
    window.location.assign(`/admin/schools/${result.schoolId}`);
  }

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <label className="relative block w-full xl:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" aria-hidden="true" />
          <span className="sr-only">Search schools</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search school name or code" className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
        </label>
        <div className="flex flex-wrap gap-2">
          {([
            ["all", "All"], ["active", "Active"], ["trial", "Trial"], ["paused", "Paused"],
            ["high_utilisation", "High utilisation"], ["low_activity", "Low activity"],
            ["high_home", "High home activation"], ["low_home", "Low home activation"],
          ] as Array<[Filter, string]>).map(([value, label]) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-md border px-3 py-2 text-xs font-bold ${filter === value ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.1em] text-slate-500">
              <tr>
                {['School','Status','Academic year','Seat limit','Used','Available','Students','Educators','Parents linked','Home users','School → Home','Last active'].map((heading) => <th key={heading} className="border-b border-slate-200 px-4 py-3 font-bold">{heading}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((school) => (
                <tr key={school.id} className="hover:bg-emerald-50/40">
                  <td className="px-4 py-4"><Link href={`/admin/schools/${school.id}`} className="font-bold text-slate-950 hover:text-emerald-800">{school.name}</Link><p className="mt-1 text-xs text-slate-400">{school.code}</p></td>
                  <td className="px-4 py-4"><span className={`rounded-md px-2.5 py-1 text-xs font-bold capitalize ${statusClass(school.status)}`}>{school.status}</span></td>
                  <td className="px-4 py-4 text-slate-600">{school.academicYear ?? "Not set"}</td>
                  <td className="px-4 py-4 font-semibold tabular-nums">{school.seatLimit}</td>
                  <td className="px-4 py-4 tabular-nums">{school.used}</td>
                  <td className="px-4 py-4 tabular-nums">{school.available}</td>
                  <td className="px-4 py-4 tabular-nums">{school.students}</td>
                  <td className="px-4 py-4 tabular-nums">{school.educators}</td>
                  <td className="px-4 py-4 tabular-nums">{school.parentsLinked}</td>
                  <td className="px-4 py-4 tabular-nums">{school.homeUsers}</td>
                  <td className="px-4 py-4 font-semibold tabular-nums">{school.homeActivationPercent}%</td>
                  <td className="px-4 py-4 whitespace-nowrap text-slate-500">{formatDate(school.lastActive)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 ? <div className="px-6 py-16 text-center"><Building2 className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm text-slate-500">No schools match this view.</p></div> : null}
      </div>

      <button type="button" onClick={() => setCreating(true)} className="fixed bottom-6 right-6 flex h-12 items-center gap-2 rounded-md bg-emerald-700 px-5 text-sm font-bold text-white shadow-lg hover:bg-emerald-800">
        <Plus className="h-5 w-5" aria-hidden="true" /> Create school
      </button>

      {creating ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5"><div><h2 className="text-xl font-bold">Create school</h2><p className="mt-1 text-sm text-slate-500">Access is free during the 2026 rollout.</p></div><button type="button" onClick={() => setCreating(false)} className="rounded-md p-2 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button></div>
            <form action={createSchool} className="grid gap-5 p-6 sm:grid-cols-2">
              <label className="text-sm font-semibold sm:col-span-2">School name<input name="name" required className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal" /></label>
              <label className="text-sm font-semibold">School code<input name="schoolCode" required minLength={5} maxLength={16} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal uppercase" /></label>
              <label className="text-sm font-semibold">Academic year<input name="academicYear" type="number" defaultValue={year} min="2000" max="2100" required className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal" /></label>
              <label className="text-sm font-semibold">Seat entitlement<input name="seatLimit" type="number" defaultValue="30" min="0" required className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal" /></label>
              <label className="text-sm font-semibold">Status<select name="status" defaultValue="trial" className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 font-normal"><option value="trial">Trial</option><option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option></select></label>
              <label className="text-sm font-semibold sm:col-span-2">Internal notes<textarea name="notes" rows={3} className="mt-2 w-full rounded-md border border-slate-300 p-3 font-normal" /></label>
              {error ? <p className="sm:col-span-2 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
              <div className="flex justify-end gap-3 sm:col-span-2"><button type="button" onClick={() => setCreating(false)} className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-bold">Cancel</button><button disabled={submitting} className="rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{submitting ? "Creating…" : "Create school"}</button></div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
