"use client";

import { CalendarPlus } from "lucide-react";
import { useState } from "react";
import type { PlatformSchoolLicence } from "@/lib/platform-admin-server";

const money = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 2 });
const day = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "Australia/Melbourne" });
const formatDay = (value: string) => day.format(new Date(`${value}T00:00:00`));

const FIELD = "mt-2 h-11 w-full rounded-xl border border-slate-300 px-3 font-normal";

async function command(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = (await response.json().catch(() => null)) as { error?: string } | null;
  if (!response.ok) throw new Error(result?.error ?? "Licence change failed");
  return result;
}

function statusChip(status: string) {
  const tone = status === "active" ? "bg-[#EEFBDB] text-[#3D6600]" : status === "trial" ? "bg-[#E8FBFB] text-[#0E7C86]" : "bg-[#F1F2EE] text-[#5A5E63]";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${tone}`}>{status}</span>;
}

/**
 * Every licence a school holds, by year, with renewals for the next year and
 * licence pricing. A school's next-year licence shows here before it starts.
 */
export default function SchoolLicencesPanel({ schoolId, schoolName, archived, licences }: {
  schoolId: string;
  schoolName: string;
  archived: boolean;
  licences: PlatformSchoolLicence[] | null;
}) {
  const [renewing, setRenewing] = useState(false);
  const [pricingFor, setPricingFor] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (licences == null) {
    return (
      <section className="rounded-2xl border border-[#F0D98A] bg-[#FFF7DD] p-6 text-sm text-[#3F2E00]">
        <p className="font-black">Licences by year need a database update</p>
        <p className="mt-1">Apply the migration <span className="font-mono">20261016100000_platform_admin_licence_renewal.sql</span> in the Supabase SQL editor to add renewals and pricing.</p>
      </section>
    );
  }

  const latest = licences[0] ?? null;
  const nextYear = (latest?.calendarYear ?? new Date().getFullYear()) + 1;

  async function renew(formData: FormData) {
    const seatLimit = Number(formData.get("seatLimit"));
    if (!window.confirm(`Add a ${formData.get("calendarYear")} licence for ${schoolName} with ${seatLimit} seats?`)) return;
    setBusy(true);
    setError(null);
    try {
      await command({
        action: "renewLicence",
        schoolId,
        calendarYear: Number(formData.get("calendarYear")),
        seatLimit,
        status: formData.get("status"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        billingStatus: formData.get("billingStatus"),
        pricePerSeat: formData.get("pricePerSeat"),
        contractValue: formData.get("contractValue"),
        notes: formData.get("notes"),
        reason: formData.get("reason"),
        idempotencyKey: crypto.randomUUID(),
      });
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Licence could not be added");
      setBusy(false);
    }
  }

  async function savePricing(licence: PlatformSchoolLicence, formData: FormData) {
    setBusy(true);
    setError(null);
    try {
      await command({
        action: "updatePricing",
        schoolId,
        academicYearId: licence.academicYearId,
        pricePerSeat: formData.get("pricePerSeat"),
        contractValue: formData.get("contractValue"),
        reason: formData.get("reason"),
      });
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Pricing could not be saved");
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0E7C86]">Licences</p>
          <h2 className="mt-2 text-xl font-black">Licences by year</h2>
          <p className="mt-1 text-sm text-[#5A5E63]">Each year has its own seats, dates and pricing. Next year&apos;s licence takes over automatically on 1 January.</p>
        </div>
        {!archived && !renewing ? (
          <button type="button" onClick={() => setRenewing(true)} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#121314] px-5 py-2.5 text-sm font-bold text-white hover:bg-black">
            <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add {nextYear} licence
          </button>
        ) : null}
      </div>

      {renewing ? (
        <form action={renew} className="mt-5 grid gap-4 rounded-2xl border border-[#9DEBE8] bg-[#E8FBFB] p-5 sm:grid-cols-2">
          <p className="text-sm font-bold sm:col-span-2">New licence for {schoolName}. Earlier years, classes and history are not changed.</p>
          <label className="text-sm font-semibold">Academic year<input name="calendarYear" type="number" min="2000" max="2100" defaultValue={nextYear} required className={FIELD} /></label>
          <label className="text-sm font-semibold">Seats<input name="seatLimit" type="number" min="0" defaultValue={latest?.seatLimit ?? 30} required className={FIELD} /></label>
          <label className="text-sm font-semibold">Start date<input name="startDate" type="date" defaultValue={`${nextYear - 1}-12-01`} required className={FIELD} /><span className="mt-1 block text-xs font-normal text-[#5A5E63]">Students can&apos;t join classes before this date, so start early enough for the school to set up classes.</span></label>
          <label className="text-sm font-semibold">End date<input name="endDate" type="date" defaultValue={`${nextYear}-12-31`} required className={FIELD} /></label>
          <label className="text-sm font-semibold">Status<select name="status" defaultValue="active" className={`${FIELD} bg-white`}><option value="active">Active</option><option value="trial">Trial</option></select></label>
          <label className="text-sm font-semibold">Billing<select name="billingStatus" defaultValue="paid" className={`${FIELD} bg-white`}><option value="paid">Paid</option><option value="trial">Trial</option><option value="free">Free</option><option value="complimentary">Complimentary</option></select></label>
          <label className="text-sm font-semibold">Price per seat (AUD, optional)<input name="pricePerSeat" type="number" min="0" step="0.01" className={FIELD} /></label>
          <label className="text-sm font-semibold">Contract value (AUD, optional)<input name="contractValue" type="number" min="0" step="0.01" className={FIELD} /></label>
          <label className="text-sm font-semibold sm:col-span-2">Reason<input name="reason" defaultValue={`Signed for ${nextYear}`} className={FIELD} /></label>
          <label className="text-sm font-semibold sm:col-span-2">Internal notes<textarea name="notes" rows={2} className="mt-2 w-full rounded-xl border border-slate-300 p-3 font-normal" /></label>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <button type="button" onClick={() => setRenewing(false)} className="rounded-full border-2 border-[#121314] px-4 py-2 text-sm font-bold">Cancel</button>
            <button disabled={busy} className="rounded-full bg-[#121314] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Adding…" : "Add licence"}</button>
          </div>
        </form>
      ) : null}

      <div className="mt-5 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
        {licences.map((licence) => (
          <div key={licence.licenceId} className="p-4">
            <div className="grid gap-3 text-sm sm:grid-cols-[90px_1fr_1fr_1fr_auto] sm:items-center">
              <p className="text-lg font-black [font-family:var(--font-display)]">{licence.calendarYear}</p>
              <div>{statusChip(licence.status)}<p className="mt-1 text-xs text-[#5A5E63]">{formatDay(licence.startDate)} – {formatDay(licence.endDate)}</p></div>
              <p><b className="tabular-nums">{licence.used}</b> of <b className="tabular-nums">{licence.seatLimit}</b> seats<span className="block text-xs capitalize text-[#5A5E63]">{licence.billingStatus}</span></p>
              <p className="text-xs text-[#5A5E63]">
                {licence.pricePerSeat != null ? <><b className="text-sm text-[#121314]">{money.format(licence.pricePerSeat)}</b> per seat</> : "No price per seat"}
                <span className="block">{licence.contractValue != null ? `Contract ${money.format(licence.contractValue)}` : "No contract value"}</span>
              </p>
              {!archived ? <button type="button" onClick={() => setPricingFor(pricingFor === licence.licenceId ? null : licence.licenceId)} className="rounded-full border-2 border-[#121314] px-3 py-1.5 text-xs font-bold">Set pricing</button> : null}
            </div>
            {pricingFor === licence.licenceId ? (
              <form action={(formData) => savePricing(licence, formData)} className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                <label className="text-sm font-semibold">Price per seat (AUD)<input name="pricePerSeat" type="number" min="0" step="0.01" defaultValue={licence.pricePerSeat ?? ""} className={FIELD} /></label>
                <label className="text-sm font-semibold">Contract value (AUD)<input name="contractValue" type="number" min="0" step="0.01" defaultValue={licence.contractValue ?? ""} className={FIELD} /></label>
                <label className="text-sm font-semibold">Reason<input name="reason" className={FIELD} placeholder="Recorded in audit history" /></label>
                <div className="flex justify-end gap-3 sm:col-span-3">
                  <button type="button" onClick={() => setPricingFor(null)} className="rounded-full border-2 border-[#121314] px-4 py-2 text-sm font-bold">Cancel</button>
                  <button disabled={busy} className="rounded-full bg-[#121314] px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving…" : "Save pricing"}</button>
                </div>
              </form>
            ) : null}
          </div>
        ))}
        {licences.length === 0 ? <p className="p-4 text-sm text-[#5A5E63]">No licences recorded.</p> : null}
      </div>
      {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}
    </section>
  );
}
