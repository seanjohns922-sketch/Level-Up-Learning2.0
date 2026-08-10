import { ShieldCheck } from "lucide-react";
import { AdminPageHeading } from "@/components/admin/AdminPrimitives";

export default function PlatformAdminSettingsPage() {
  return (
    <>
      <AdminPageHeading
        eyebrow="Settings"
        title="Platform administration"
        detail="PA1 keeps owner access, identity, entitlements and billing classifications deliberately separate."
      />
      <section className="border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-md bg-emerald-100 p-3 text-emerald-800">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Platform Owner security</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Owner access is read from the protected canonical platform role. Role assignment is not editable in PA1 and cannot be derived from email, browser storage, URLs or school membership.
            </p>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3">
          <div><dt className="text-xs font-bold uppercase text-slate-500">Rollout</dt><dd className="mt-2 font-semibold">2026 free access</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-500">School billing</dt><dd className="mt-2 font-semibold">Manual classification</dd></div>
          <div><dt className="text-xs font-bold uppercase text-slate-500">Payment processing</dt><dd className="mt-2 font-semibold">Not active yet</dd></div>
        </dl>
      </section>
    </>
  );
}
