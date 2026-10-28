"use client";

import dynamic from "next/dynamic";

const ChronoRun = dynamic(() => import("@/components/chronorok/ChronoRun"), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center bg-black font-bold text-amber-100">Opening the Rift Portal…</div>,
});

export default function ChronoRunEntry({ backHref }: { backHref: string }) {
  return <ChronoRun backHref={backHref} />;
}
