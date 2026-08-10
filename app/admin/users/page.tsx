import { Building2, GraduationCap, Home, Link2 } from "lucide-react";
import { AdminPageHeading, Metric } from "@/components/admin/AdminPrimitives";
import { loadPlatformOverview } from "@/lib/platform-admin-server";

export default async function PlatformUsersPage() {
  const data = await loadPlatformOverview();
  const students = data?.overview.students;
  return <><AdminPageHeading eyebrow="Users" title="Canonical user segments" detail="Read-only PA1 view. Segment membership is derived from active entitlements and never stored as competing identity booleans." /><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="School only" value={students?.schoolOnly ?? 0} icon={Building2} /><Metric label="School + Home" value={students?.schoolAndHome ?? 0} icon={Link2} tone="violet" /><Metric label="Home only" value={students?.homeOnly ?? 0} icon={Home} tone="amber" /><Metric label="Inactive / historical" value={students?.inactive ?? 0} icon={GraduationCap} tone="blue" /></section><div className="mt-7 border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Identity rule</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">One child has one student identity. School and home access attach to that identity, while parent relationships and billing classifications remain separate records.</p></div></>;
}
