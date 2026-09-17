"use client";

import Link from "next/link";
import { ArrowLeft, ClipboardCheck } from "lucide-react";
import { ParentHome, ParentShell } from "@/components/parent/ParentPortal";
import {
  FIXTURE_PARENT_ACTIVITY,
  FIXTURE_PARENT_CHILDREN,
  FIXTURE_PARENT_NAME,
  FIXTURE_PARENT_REPORTS,
} from "@/components/demo/parent-dashboard-fixture";

/**
 * Parent dashboard preview for Demo Review.
 *
 * Renders the real Parent components with a fixture family, so wording,
 * layout, realm theming and the printable report can be reviewed without a
 * parent login. Nothing is written. Real permissions, linking and saving must
 * still be checked with the mock parent account.
 */
export default function ParentDashboardReview() {
  return (
    <div className="min-h-screen bg-[#f4f7f8]">
      <header className="border-b border-white/10 bg-[#11141b] px-4 py-3 text-white sm:px-6">
        <div className="mx-auto flex max-w-[1320px] items-center gap-3">
          <Link
            href="/demo-review"
            className="grid h-10 w-10 shrink-0 place-items-center border border-white/15 bg-white/[0.04] hover:bg-white/[0.09]"
            title="Back to Demo Review"
            aria-label="Back to Demo Review"
          >
            <ArrowLeft size={18} />
          </Link>
          <ClipboardCheck className="text-teal-300" size={22} aria-hidden="true" />
          <div className="min-w-0">
            <h1 className="text-lg font-black sm:text-xl">Parent Dashboard</h1>
            <p className="text-xs text-white/50">Preview family · no canonical writes</p>
          </div>
          <div className="ml-auto hidden border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs font-bold text-amber-200 sm:block">
            Sample data
          </div>
        </div>
      </header>

      <ParentShell>
        <ParentHome
          preview={{
            parentName: FIXTURE_PARENT_NAME,
            children: FIXTURE_PARENT_CHILDREN,
            activity: FIXTURE_PARENT_ACTIVITY,
            reports: FIXTURE_PARENT_REPORTS,
          }}
        />
      </ParentShell>
    </div>
  );
}
