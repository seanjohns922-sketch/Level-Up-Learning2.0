"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useDemoPreviewMode } from "@/lib/demo-mode";

/** Keep authored previews out of a real student's active progress scope. */
export default function DemoGate({ children }: { children: ReactNode }) {
  const demo = useDemoPreviewMode();
  if (!demo)
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-24 text-center text-white">
        <h1 className="text-2xl font-bold">Open Level 8 in demo review</h1>
        <p className="my-4">
          These lesson previews use the separate demo account.
        </p>
        <Link href="/demo-review" className="underline">
          Open demo review
        </Link>
      </main>
    );
  return <>{children}</>;
}
