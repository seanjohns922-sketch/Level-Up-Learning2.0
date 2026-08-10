"use client";

import { useState } from "react";
import type { PlatformSchoolDetail } from "@/lib/platform-admin-server";

export default function SchoolLicenceEditor({ detail }: { detail: PlatformSchoolDetail }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(formData: FormData) {
    setSaving(true); setError(null);
    const response = await fetch("/api/admin/command", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "updateLicence", schoolId: detail.school.id,
        academicYearId: detail.licence.academicYearId,
        seatLimit: Number(formData.get("seatLimit")), status: formData.get("status"),
        startDate: formData.get("startDate"), endDate: formData.get("endDate"),
        billingStatus: formData.get("billingStatus"), notes: formData.get("notes"),
        reason: formData.get("reason"),
      }),
    });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) { setError(result?.error ?? "Licence could not be updated"); setSaving(false); return; }
    window.location.reload();
  }

  if (!editing) {
    return <button type="button" onClick={() => setEditing(true)} className="rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">Edit access</button>;
  }

  return (
    <form action={save} className="mt-5 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
      <label className="text-sm font-semibold">Seat entitlement<input name="seatLimit" type="number" min={detail.licence.used} defaultValue={detail.licence.seatLimit} required className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">Cannot be below {detail.licence.used} active students.</span></label>
      <label className="text-sm font-semibold">Access status<select name="status" defaultValue={detail.licence.status} className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 font-normal"><option value="trial">Trial</option><option value="active">Active</option><option value="paused">Paused</option><option value="archived">Archived</option><option value="expired">Expired</option></select></label>
      <label className="text-sm font-semibold">Start date<input name="startDate" type="date" defaultValue={detail.licence.startDate} required className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal" /></label>
      <label className="text-sm font-semibold">End date<input name="endDate" type="date" defaultValue={detail.licence.endDate} required className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal" /></label>
      <label className="text-sm font-semibold">Billing classification<select name="billingStatus" defaultValue={detail.licence.billingStatus} className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 font-normal"><option value="free">Free</option><option value="trial">Trial</option><option value="complimentary">Complimentary</option><option value="paid">Paid</option><option value="expired">Expired</option></select></label>
      <label className="text-sm font-semibold">Reason for change<input name="reason" className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal" placeholder="Recorded in audit history" /></label>
      <label className="text-sm font-semibold sm:col-span-2">Internal notes<textarea name="notes" rows={3} defaultValue={detail.licence.notes ?? ""} className="mt-2 w-full rounded-md border border-slate-300 p-3 font-normal" /></label>
      {error ? <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:col-span-2">{error}</p> : null}
      <div className="flex justify-end gap-3 sm:col-span-2"><button type="button" onClick={() => setEditing(false)} className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-bold">Cancel</button><button disabled={saving} className="rounded-md bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save access"}</button></div>
    </form>
  );
}
