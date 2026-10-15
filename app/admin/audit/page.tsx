import { AdminPageHeading } from "@/components/admin/AdminPrimitives";
import { loadPlatformAudit } from "@/lib/platform-admin-server";

function label(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }

const MELBOURNE = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short", timeZone: "Australia/Melbourne" });

export default async function PlatformAuditPage() {
  const data = await loadPlatformAudit();
  const ownerId = data?.access.user.id ?? data?.access.context.userId ?? null;
  return <><AdminPageHeading eyebrow="Audit" title="Administrative history" detail="Immutable owner actions across schools, seats, access dates and future billing classifications." /><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-[0.1em] text-slate-500"><tr><th className="px-5 py-3">Date</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Entity</th><th className="px-5 py-3">Actor</th><th className="px-5 py-3">Reason</th></tr></thead><tbody className="divide-y divide-slate-100">{data?.audit.map((entry) => <tr key={entry.id}><td className="whitespace-nowrap px-5 py-4 text-slate-500">{MELBOURNE.format(new Date(entry.createdAt))}</td><td className="px-5 py-4 font-semibold">{label(entry.action)}</td><td className="px-5 py-4"><span className="font-semibold">{label(entry.entityType)}</span><p className="mt-1 max-w-52 truncate text-xs text-slate-400">{entry.entityId}</p></td><td className="px-5 py-4 text-slate-500">{entry.actorUserId == null ? "System" : entry.actorUserId === ownerId ? <span className="font-bold text-[#121314]">You</span> : <span className="font-mono text-xs">{entry.actorUserId}</span>}</td><td className="px-5 py-4 text-slate-500">{entry.reason ?? "—"}</td></tr>)}{!data?.audit.length ? <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">No Platform Admin actions have been recorded yet.</td></tr> : null}</tbody></table></div></div></>;
}
