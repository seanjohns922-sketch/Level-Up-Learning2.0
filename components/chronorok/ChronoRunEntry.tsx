"use client";

import ChronorokAccess from "./ChronorokAccess";
import dynamic from "next/dynamic";

const ChronoRun = dynamic(() => import("@/components/chronorok/ChronoRun"), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center bg-black font-bold text-amber-100">Opening the Rift Portal…</div>,
});

export default function ChronoRunEntry({ backHref }: { backHref: string }) {
  return <ChronorokAccess><ChronoRun backHref={backHref} /></ChronorokAccess>;
}
