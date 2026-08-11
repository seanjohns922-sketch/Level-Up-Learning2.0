import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { loadPlatformAdultDetail } from "@/lib/platform-admin-server";

export default async function AdultDetail({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  let data;
  try { data = await loadPlatformAdultDetail(userId); } catch { notFound(); }
  if (!data) redirect("/login");
  const u = data.detail;
  return <>
    <Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700"><ArrowLeft className="h-4 w-4" />User Explorer</Link>
    <p className="mt-6 text-xs font-bold uppercase tracking-wider text-emerald-700">Account detail · read only</p><h1 className="mt-2 text-3xl font-bold">{u.name ?? u.email ?? "User"}</h1><p className="mt-2 text-sm text-slate-500">{u.email ?? "No email"} · {u.status} · Created {new Date(u.createdAt).toLocaleDateString("en-AU", { timeZone: "Australia/Melbourne" })} · Last active {u.lastActive ? new Date(u.lastActive).toLocaleDateString("en-AU", { timeZone: "Australia/Melbourne" }) : "not recorded"}</p>
    <div className="mt-7 grid gap-6 lg:grid-cols-2"><section className="border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">School roles</h2><div className="mt-4 divide-y">{u.schools.map(s => <div key={`${s.id}-${s.role}`} className="py-3 text-sm"><p className="font-semibold">{s.name}</p><p className="capitalize text-slate-500">{s.role.replaceAll("_", " ")} · {s.status}</p></div>)}{u.schools.length === 0 ? <p className="text-sm text-slate-500">No school role.</p> : null}</div></section><section className="border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold">Linked students</h2><div className="mt-4 divide-y">{u.children.map(c => <Link href={`/admin/users/students/${c.id}`} key={c.id} className="block py-3 text-sm"><div className="flex justify-between gap-3"><p className="font-semibold">{c.name}</p><span className="text-slate-500">{c.homeActive ? "Home active" : "No home access"}</span></div><p className="capitalize text-slate-500">{c.relationship} · {c.status} · {c.schoolName ?? "No school"}</p></Link>)}{u.children.length === 0 ? <p className="text-sm text-slate-500">No linked students.</p> : null}</div></section></div>
  </>;
}
