"use client";

import dynamic from "next/dynamic";

const ChronorokHub = dynamic(() => import("@/components/world3d/ChronorokHub"), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center bg-[#2a1c30] font-bold text-amber-100">Entering Chronorok…</div>,
});

export default function ChronorokEntry({ teacherPreview = false }: { teacherPreview?: boolean }) {
  return <ChronorokHub teacherPreview={teacherPreview} />;
}
