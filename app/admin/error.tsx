"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import Link from "next/link";

/** Shown inside the console when a page's data could not load, instead of a blank crash. */
export default function PlatformAdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const expired = /access required|jwt|expired|401|403/i.test(error.message);
  return (
    <div role="alert" className="max-w-2xl rounded-2xl border border-[#E3E5E0] bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF1C7] text-[#8A5A00]">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0E7C86]">Platform Admin</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">{expired ? "Your admin session has ended" : "This view couldn't load"}</h1>
          <p className="mt-2 text-sm leading-6 text-[#5A5E63]">
            {expired
              ? "Admin sessions last an hour. Log in again to carry on; nothing you saved has been lost."
              : "The platform data didn't come back. Other sections are unaffected, so try again or open another section."}
          </p>
          {error.digest ? <p className="mt-2 font-mono text-[11px] text-[#8A8E89]">Reference {error.digest}</p> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            {expired ? (
              <Link href="/login" className="rounded-full bg-[#121314] px-5 py-2.5 text-sm font-bold text-white hover:bg-black">Log in again</Link>
            ) : (
              <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full bg-[#121314] px-5 py-2.5 text-sm font-bold text-white hover:bg-black">
                <RotateCcw className="h-4 w-4" aria-hidden="true" /> Try again
              </button>
            )}
            <Link href="/admin" className="rounded-full border-2 border-[#121314] px-5 py-2.5 text-sm font-bold">Back to overview</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
