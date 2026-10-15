import { ShieldCheck } from "lucide-react";
import { AdminPageHeading } from "@/components/admin/AdminPrimitives";

export default function PlatformAdminSettingsPage() {
  return (
    <>
      <AdminPageHeading
        eyebrow="Settings"
        title="Platform administration"
        detail="Owner access, student identity, school entitlements and billing classifications are kept deliberately separate."
      />
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-[#121314] p-3 text-[#2EE6E0]">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Platform Owner security</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Owner access comes from the protected platform role in the database. It cannot be granted from this console, and it is never inferred from an email address, browser storage, a link or a school membership.
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
