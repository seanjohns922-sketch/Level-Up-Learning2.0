"use client";

import { useState } from "react";
import type { PlatformIdentityCentre } from "@/lib/platform-admin-server";

type StudentResult = { id: string; name: string; explorerCode: string | null; schoolName: string | null; detail: string | null };
type SearchResponse = { items?: StudentResult[] };
type PendingLink = PlatformIdentityCentre["pendingLinks"][number];

function formatRequestType(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function EmptyQueue({ message }: { message: string }) {
  return <p className="px-5 py-7 text-sm text-slate-500">{message}</p>;
}

function IdentityRequestQueue({ title, detail, items, emptyMessage }: { title: string; detail: string; items: PendingLink[]; emptyMessage: string }) {
  return <section className="border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 p-5"><h2 className="text-lg font-black">{title}</h2><p className="mt-1 text-sm text-slate-600">{detail}</p></div>
    {items.length ? <div className="divide-y divide-slate-100">{items.map((item) => <div key={item.id} className="flex flex-wrap items-start justify-between gap-3 p-5">
      <div><p className="font-bold">{item.studentName ?? item.schoolName ?? "Identity review"}</p><p className="mt-1 text-sm text-slate-600">{item.reason ?? formatRequestType(item.requestType)}</p><p className="mt-1 text-xs text-slate-500">{item.schoolName ?? "No school attached"}</p></div>
      <span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString("en-AU")}</span>
    </div>)}</div> : <EmptyQueue message={emptyMessage} />}
  </section>;
}

async function command(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = (await response.json()) as Record<string, unknown>;
  if (!response.ok) throw new Error(String(result.error ?? "Identity command failed"));
  return result;
}

function StudentSearch({ label, selected, onSelect }: { label: string; selected: StudentResult | null; onSelect: (student: StudentResult | null) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentResult[]>([]);
  const [busy, setBusy] = useState(false);
  async function search() {
    if (query.trim().length < 2) return;
    setBusy(true);
    try {
      const result = await command({ action: "searchIdentityStudents", query });
      setResults(((result as SearchResponse).items ?? []).filter((item) => item.id !== selected?.id));
    } finally { setBusy(false); }
  }
  return <div className="space-y-2">
    <label className="text-sm font-bold text-slate-700">{label}</label>
    {selected ? <div className="flex items-center justify-between border border-emerald-300 bg-emerald-50 p-3"><div><b>{selected.name}</b><p className="text-xs text-slate-600">{selected.schoolName ?? "No school"} · {selected.explorerCode ?? "No Explorer Code"}</p></div><button type="button" onClick={() => onSelect(null)} className="text-sm font-bold text-emerald-800">Change</button></div> : <><div className="flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void search(); }} className="min-w-0 flex-1 border border-slate-300 px-3 py-2" placeholder="Name, username or Explorer Code"/><button type="button" onClick={() => void search()} disabled={busy || query.trim().length < 2} className="bg-emerald-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Searching" : "Search"}</button></div><div className="divide-y border border-slate-200">{results.map((student) => <button type="button" key={student.id} onClick={() => { onSelect(student); setResults([]); }} className="flex w-full items-center justify-between p-3 text-left hover:bg-slate-50"><span><b>{student.name}</b><span className="ml-2 text-xs text-slate-500">{student.schoolName ?? "No school"}</span></span><span className="text-xs font-semibold text-emerald-700">Select</span></button>)}</div></>}
  </div>;
}

export default function IdentityCentreClient({ initialSnapshot }: { initialSnapshot: PlatformIdentityCentre }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [survivor, setSurvivor] = useState<StudentResult | null>(null);
  const [duplicate, setDuplicate] = useState<StudentResult | null>(null);
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<{ requestId: string; preview: Record<string, unknown> } | null>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const parentLinks = snapshot.pendingLinks.filter((item) => item.requestType === "parent_link" || item.requestType === "recovery");
  const duplicateChecks = snapshot.pendingLinks.filter((item) => item.requestType === "duplicate_review");
  const schoolLinks = snapshot.pendingLinks.filter((item) => item.requestType === "school_link");

  async function requestMerge() {
    if (!survivor || !duplicate || !reason.trim()) return;
    setBusy(true); setMessage("");
    try {
      const result = await command({ action: "requestIdentityMerge", survivorStudentId: survivor.id, duplicateStudentId: duplicate.id, reason });
      setPreview({ requestId: String(result.requestId), preview: (result.preview ?? {}) as Record<string, unknown> });
    } catch (error) { setMessage(error instanceof Error ? error.message : "Merge preview failed"); }
    finally { setBusy(false); }
  }

  async function resolve(requestId: string, approve: boolean, decisionReason: string) {
    if (!decisionReason.trim()) { setMessage("A review reason is required."); return; }
    setBusy(true); setMessage("");
    try {
      await command({ action: "resolveIdentityMerge", requestId, approve, reason: decisionReason });
      setSnapshot((current) => ({ ...current, mergeRequests: current.mergeRequests.filter((item) => item.id !== requestId) }));
      setPreview(null); setSurvivor(null); setDuplicate(null); setReason(""); setReviewReason("");
      setMessage(approve ? "Duplicate identity merged into the survivor." : "Merge request rejected.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Merge review failed"); }
    finally { setBusy(false); }
  }

  return <div className="space-y-6">
    {message ? <p className="border border-slate-300 bg-white px-4 py-3 text-sm font-semibold">{message}</p> : null}
    <section className="border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black">Merge confirmed duplicates</h2>
      <p className="mt-1 text-sm text-slate-600">The survivor keeps the active identity. The duplicate is retired after records and relationships are preserved.</p>
      <div className="mt-5 grid gap-5 lg:grid-cols-2"><StudentSearch label="Surviving student" selected={survivor} onSelect={setSurvivor}/><StudentSearch label="Duplicate to retire" selected={duplicate} onSelect={setDuplicate}/></div>
      <label className="mt-5 block text-sm font-bold text-slate-700">Reason<input value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal" placeholder="Why these records represent the same child"/></label>
      <button type="button" disabled={busy || !survivor || !duplicate || survivor.id === duplicate.id || !reason.trim()} onClick={() => void requestMerge()} className="mt-4 bg-emerald-800 px-4 py-2 font-bold text-white disabled:opacity-40">Preview merge</button>
      {preview ? <div className="mt-5 border border-amber-300 bg-amber-50 p-4"><h3 className="font-black text-amber-950">Final review required</h3><p className="mt-1 text-sm text-amber-900">This action cannot be undone through the interface. Attempts and assessments remain immutable; progress, access and unique rewards move to the survivor.</p><pre className="mt-3 max-h-56 overflow-auto bg-white p-3 text-xs">{JSON.stringify(preview.preview, null, 2)}</pre><input value={reviewReason} onChange={(event) => setReviewReason(event.target.value)} className="mt-3 w-full border border-amber-300 px-3 py-2" placeholder="Final review reason"/><div className="mt-3 flex gap-2"><button type="button" disabled={busy || !reviewReason.trim()} onClick={() => void resolve(preview.requestId, true, reviewReason)} className="bg-red-700 px-4 py-2 font-bold text-white disabled:opacity-40">Approve merge</button><button type="button" onClick={() => setPreview(null)} className="border border-slate-300 bg-white px-4 py-2 font-bold">Cancel</button></div></div> : null}
    </section>
    <section className="border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-5"><h2 className="text-xl font-black">Pending merge reviews</h2></div><div className="divide-y divide-slate-100">{snapshot.mergeRequests.map((request) => <div key={request.id} className="p-5"><div className="flex flex-wrap justify-between gap-3"><div><b>{request.duplicateName}</b> → <b>{request.survivorName}</b><p className="mt-1 text-sm text-slate-600">{request.reason}</p></div><span className="text-xs text-slate-500">{new Date(request.createdAt).toLocaleDateString("en-AU")}</span></div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => { setPreview({ requestId: request.id, preview: request.preview }); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="bg-emerald-800 px-3 py-2 text-sm font-bold text-white">Review</button><button type="button" onClick={() => { const value=window.prompt("Reason for rejecting this merge"); if (value) void resolve(request.id, false, value); }} className="border border-slate-300 px-3 py-2 text-sm font-bold">Reject</button></div></div>)}{snapshot.mergeRequests.length === 0 ? <p className="p-8 text-center text-slate-500">No merge requests are waiting for review.</p> : null}</div></section>
    <div className="grid gap-6 lg:grid-cols-2">
      <IdentityRequestQueue title="Pending parent links" detail="Manual recovery requests only. Verified Explorer Code links complete automatically." items={parentLinks} emptyMessage="No parent link or recovery requests require review." />
      <IdentityRequestQueue title="Potential duplicates" detail="Creation warnings awaiting a school decision. Similar names are never merged automatically." items={duplicateChecks} emptyMessage="No duplicate warnings are waiting for review." />
      <IdentityRequestQueue title="Pending school links" detail="Explorer Code previews not yet completed by the school operator." items={schoolLinks} emptyMessage="No school link previews are pending." />
      <section className="border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-5"><h2 className="text-lg font-black">Retired and merged identities</h2><p className="mt-1 text-sm text-slate-600">Retired records remain traceable to the canonical survivor.</p></div>{snapshot.retiredIdentities.length ? <div className="divide-y divide-slate-100">{snapshot.retiredIdentities.map((identity) => <div key={identity.studentId} className="p-5"><p className="font-bold">{identity.displayName}</p><p className="mt-1 text-xs text-slate-500">Survivor ID: {identity.mergedInto}</p><p className="mt-1 text-xs text-slate-500">Merged {new Date(identity.mergedAt).toLocaleDateString("en-AU")}</p></div>)}</div> : <EmptyQueue message="No duplicate identities have been retired." />}</section>
    </div>
    <section className="border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 p-5"><h2 className="text-xl font-black">School transfers</h2><p className="mt-1 text-sm text-slate-600">Recent membership changes preserve the child identity and learning history.</p></div>{snapshot.recentTransfers.length ? <div className="divide-y divide-slate-100">{snapshot.recentTransfers.map((transfer) => <div key={transfer.id} className="flex flex-wrap items-start justify-between gap-3 p-5"><div><p className="font-bold">{transfer.studentName}</p><p className="mt-1 text-sm text-slate-600">{transfer.fromSchoolName ?? "No previous school"} → {transfer.toSchoolName}</p>{transfer.reason ? <p className="mt-1 text-xs text-slate-500">{transfer.reason}</p> : null}</div><span className="text-xs text-slate-500">{new Date(transfer.createdAt).toLocaleDateString("en-AU")}</span></div>)}</div> : <EmptyQueue message="No school transfers have been recorded." />}</section>
  </div>;
}
