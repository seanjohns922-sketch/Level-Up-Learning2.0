"use client";

import { Archive, Pause, Play, RotateCcw, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import type { PlatformSchoolDetail } from "@/lib/platform-admin-server";

async function command(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = (await response.json().catch(() => null)) as {
    error?: string;
    administrator?: { emailDelivery?: string; status?: string };
  } | null;
  if (!response.ok) throw new Error(result?.error ?? "Platform Admin command failed");
  return result;
}

function schoolAdminInviteMailto(email: string, schoolName: string, schoolCode: string) {
  const loginUrl = typeof window === "undefined" ? "/login" : `${window.location.origin}/login`;
  const subject = `Level Up Learning school admin access for ${schoolName}`;
  const body = [
    `Hi,`,
    ``,
    `Your Level Up Learning school administrator access is ready for ${schoolName}.`,
    ``,
    `Go to: ${loginUrl}`,
    `Choose: Activate Invite`,
    `Email: ${email}`,
    `School Code: ${schoolCode}`,
    ``,
    `If this is your first time using Level Up Learning, create your own password on that screen. The School Code is only used to connect your invited email to the school.`,
    ``,
    `After activation, use Log In with the same email and password.`,
  ].join("\n");
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function SchoolLifecycleManager({ detail }: { detail: PlatformSchoolDetail }) {
  const messageKey = `lul-platform-school-admin-message:${detail.school.id}`;
  const archived = detail.school.status === "archived";
  const paused = detail.school.status === "paused";
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(messageKey);
    if (saved) {
      setMessage(saved);
      window.sessionStorage.removeItem(messageKey);
    }
  }, [messageKey]);

  async function run(payload: Record<string, unknown>, success: string) {
    setBusy(true); setError(null); setMessage(null);
    try {
      const result = await command(payload);
      const delivery = result?.administrator?.emailDelivery;
      const adminStatus = result?.administrator?.status;
      const nextMessage = delivery === "sent"
        ? adminStatus === "membership_added"
          ? `${success}. Existing account linked directly. Access email sent.`
          : `${success}. Invite email sent.`
        : delivery === "failed"
          ? adminStatus === "membership_added"
            ? `${success}. Existing account linked directly. Access email could not be sent.`
            : `${success}. Invite email could not be sent; use Draft email.`
          : delivery === "unconfigured"
            ? adminStatus === "membership_added"
              ? `${success}. Existing account linked directly. Email sending is not configured.`
              : `${success}. Email sending is not configured; use Draft email.`
            : adminStatus === "membership_added"
              ? `${success}. Existing account linked directly; no invite email needed.`
              : success;
      window.sessionStorage.setItem(messageKey, nextMessage);
      window.location.reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Command failed");
      setBusy(false);
    }
  }

  async function editSchool(formData: FormData) {
    const nextCode = String(formData.get("schoolCode") ?? "").trim().toUpperCase();
    if (nextCode !== detail.school.code && !window.confirm(
      `Change the school code from ${detail.school.code} to ${nextCode}? Existing linked staff will remain attached to the same school.`,
    )) return;
    await run({
      action: "updateSchool", schoolId: detail.school.id,
      name: formData.get("name"), schoolCode: formData.get("schoolCode"),
      state: formData.get("state"), sector: formData.get("sector"), reason: formData.get("reason"),
    }, "School details updated");
  }

  async function transition(formData: FormData) {
    const transitionName = String(formData.get("transition"));
    const reasonChoice = String(formData.get("reasonChoice") ?? "").trim();
    const reasonNotes = String(formData.get("reasonNotes") ?? "").trim();
    const reason = transitionName === "archive"
      ? `${reasonChoice}${reasonNotes ? `: ${reasonNotes}` : ""}`
      : String(formData.get("reason") ?? "").trim();
    if (transitionName === "archive" && (!reasonChoice || (reasonChoice === "Other" && !reasonNotes))) {
      setError("Select an archive reason. Notes are required when Other is selected.");
      return;
    }
    if (transitionName === "archive" && !window.confirm(`Archive ${detail.school.name}? Current school access will stop, but identities and history will be preserved.`)) return;
    if (transitionName === "restore" && !window.confirm(`Restore ${detail.school.name} with the configured licence?`)) return;
    await run({
      action: "transitionSchool", schoolId: detail.school.id, transition: transitionName,
      reason, restoreStatus: formData.get("restoreStatus"),
      startDate: formData.get("startDate"), endDate: formData.get("endDate"),
    }, `School ${transitionName} completed`);
  }

  async function addAdmin(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim();
    if (!window.confirm(`Assign or invite ${email} as a School Administrator for ${detail.school.name}?`)) return;
    await run({
      action: "assignSchoolAdmin", schoolId: detail.school.id, email,
      schoolName: detail.school.name, schoolCode: detail.school.code,
      idempotencyKey: crypto.randomUUID(),
    }, "Administrator assignment recorded");
  }

  async function manageAdmin(adminAction: string, userId?: string, invitationId?: string) {
    let confirmFinalAdmin = false;
    if (adminAction === "deactivate") {
      confirmFinalAdmin = window.confirm("Deactivate this administrator? If this is the school's only active administrator, this confirms the school may temporarily have no administrator.");
      if (!confirmFinalAdmin) return;
    }
    await run({
      action: "manageSchoolAdmin", schoolId: detail.school.id, adminAction,
      userId: userId ?? null, invitationId: invitationId ?? null,
      invitationEmail: adminAction === "resend_invitation" ? detail.adminInvitations.find((invitation) => invitation.id === invitationId)?.email ?? null : null,
      schoolName: detail.school.name, schoolCode: detail.school.code,
      reason: `Platform Owner ${adminAction.replaceAll("_", " ")}`,
      confirmFinalAdmin,
    }, "Administrator record updated");
  }

  return (
    <div className="space-y-7">
      {!archived ? (
        <section className="border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">School settings</p><h2 className="mt-2 text-xl font-bold">School details</h2></div>
            {!editing ? <button type="button" onClick={() => setEditing(true)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold">Edit school</button> : null}
          </div>
          {editing ? (
            <form action={editSchool} className="mt-5 grid gap-4 border-t border-slate-200 pt-5 sm:grid-cols-2">
              <label className="text-sm font-semibold sm:col-span-2">School name<input name="name" defaultValue={detail.school.name} required className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal" /></label>
              <label className="text-sm font-semibold">School code<input name="schoolCode" defaultValue={detail.school.code} required minLength={5} maxLength={16} className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal uppercase" /></label>
              <label className="text-sm font-semibold">Reason for code or detail change<input name="reason" className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal" /></label>
              <label className="text-sm font-semibold">State / Territory<select name="state" defaultValue={detail.school.state ?? "VIC"} className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 font-normal">{["ACT","NSW","NT","QLD","SA","TAS","VIC","WA","Other"].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label className="text-sm font-semibold">Sector<select name="sector" defaultValue={detail.school.sector ?? "Government"} className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 font-normal">{["Government","Catholic","Independent","Other"].map((value) => <option key={value}>{value}</option>)}</select></label>
              <div className="flex justify-end gap-3 sm:col-span-2"><button type="button" onClick={() => setEditing(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold">Cancel</button><button disabled={busy} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Save school</button></div>
            </form>
          ) : <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-4"><div><dt className="text-slate-500">Code</dt><dd className="mt-1 font-bold">{detail.school.code}</dd></div><div><dt className="text-slate-500">State</dt><dd className="mt-1 font-bold">{detail.school.state ?? "Not set"}</dd></div><div><dt className="text-slate-500">Sector</dt><dd className="mt-1 font-bold">{detail.school.sector ?? "Not set"}</dd></div><div><dt className="text-slate-500">Canonical ID</dt><dd className="mt-1 truncate font-mono text-xs">{detail.school.id}</dd></div></dl>}
        </section>
      ) : null}

      <section className="border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3"><UserPlus className="h-5 w-5 text-emerald-700" /><div><h2 className="text-xl font-bold">School administrators</h2><p className="text-sm text-slate-500">Existing accounts are linked directly. New admins activate with their invited email, their own password and this school code.</p></div></div>
        {!archived ? <form action={addAdmin} className="mt-5 flex flex-col gap-3 sm:flex-row"><input name="email" type="email" required placeholder="administrator@school.edu.au" className="h-11 flex-1 rounded-md border border-slate-300 px-3" /><button disabled={busy} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Add administrator</button></form> : null}
        <div className="mt-5 divide-y divide-slate-100 border border-slate-200">
          {detail.administrators.map((admin) => <div key={admin.userId} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{admin.name}</p><p className="text-sm text-slate-500">{admin.email ?? "No email"} · {admin.role.replace("_", " ")} · <span className="capitalize">{admin.status}</span></p></div>{!archived ? <button type="button" disabled={busy} onClick={() => manageAdmin(admin.status === "active" ? "deactivate" : "restore", admin.userId)} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-bold disabled:opacity-50">{admin.status === "active" ? "Deactivate" : "Restore"}</button> : null}</div>)}
          {detail.adminInvitations.filter((invitation) => invitation.status === "pending").map((invitation) => <div key={invitation.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{invitation.email}</p><p className="text-sm text-amber-700">Pending invitation · expires {invitation.expiresAt.slice(0, 10)} · code {detail.school.code}</p></div>{!archived ? <div className="flex flex-wrap gap-2"><a href={schoolAdminInviteMailto(invitation.email, detail.school.name, detail.school.code)} className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">Draft email</a><button type="button" disabled={busy} onClick={() => manageAdmin("resend_invitation", undefined, invitation.id)} className="rounded-md border border-slate-300 px-3 py-2 text-xs font-bold">Refresh expiry</button><button type="button" disabled={busy} onClick={() => manageAdmin("revoke_invitation", undefined, invitation.id)} className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700">Revoke</button></div> : null}</div>)}
          {!detail.administrators.length && !detail.adminInvitations.some((invitation) => invitation.status === "pending") ? <p className="p-4 text-sm font-semibold text-amber-800">No school administrator is assigned.</p> : null}
        </div>
      </section>

      <section className={`border p-6 shadow-sm ${archived ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
        <h2 className="text-xl font-bold">{archived ? "Restore school" : "School lifecycle"}</h2>
        <p className="mt-2 text-sm text-slate-600">Lifecycle commands preserve identities, learning history, parent links, Explorer Codes and Home access.</p>
        <form action={transition} className="mt-5 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="transition" value={archived ? "restore" : paused ? "reactivate" : "archive"} />
          {archived || paused ? <label className="text-sm font-semibold">Access after {archived ? "restoration" : "reactivation"}<select name="restoreStatus" defaultValue={detail.school.previousLicenceStatus === "trial" ? "trial" : "active"} className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 font-normal"><option value="active">Active</option><option value="trial">Trial</option></select></label> : null}
          {archived || paused ? <><label className="text-sm font-semibold">Licence start<input name="startDate" type="date" defaultValue={detail.licence.startDate} required className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal" /></label><label className="text-sm font-semibold">Licence end<input name="endDate" type="date" defaultValue={detail.licence.endDate} required className="mt-2 h-11 w-full rounded-md border border-slate-300 px-3 font-normal" /></label></> : null}
          {!archived && !paused ? <><label className="text-sm font-semibold sm:col-span-2">Archive reason<select name="reasonChoice" required defaultValue="" className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 font-normal"><option value="" disabled>Select a reason</option>{["School no longer using Level Up Learning","Trial ended","School merged/closed","Duplicate school record","Administrative decision","Other"].map((reason) => <option key={reason}>{reason}</option>)}</select></label><label className="text-sm font-semibold sm:col-span-2">Notes <span className="font-normal text-slate-500">(required for Other)</span><textarea name="reasonNotes" rows={3} className="mt-2 w-full rounded-md border border-slate-300 p-3 font-normal" /></label></> : <label className="text-sm font-semibold sm:col-span-2">Reason<textarea name="reason" required rows={3} defaultValue={archived ? "Restore operational school access" : "Reactivate operational school access"} className="mt-2 w-full rounded-md border border-slate-300 p-3 font-normal" placeholder={archived ? "Why is this school being restored?" : "Why is this school being reactivated?"} /></label>}
          <div className="flex flex-wrap justify-end gap-3 sm:col-span-2">
            {!archived && !paused ? <button type="button" disabled={busy} onClick={() => {
              const reason = window.prompt("Reason for pausing this school");
              if (reason) void run({ action: "transitionSchool", schoolId: detail.school.id, transition: "pause", reason }, "School paused");
            }} className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-amber-800"><Pause className="h-4 w-4" /> Pause school</button> : null}
            <button disabled={busy} className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${archived || paused ? "bg-emerald-700" : "bg-red-700"}`}>{archived ? <RotateCcw className="h-4 w-4" /> : paused ? <Play className="h-4 w-4" /> : <Archive className="h-4 w-4" />}{archived ? "Restore school" : paused ? "Reactivate school" : "Archive school"}</button>
          </div>
        </form>
      </section>

      {message ? <p className="rounded-md bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{message}</p> : null}
      {error ? <p className="rounded-md bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p> : null}
    </div>
  );
}
