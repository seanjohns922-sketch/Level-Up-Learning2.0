import { redirect } from "next/navigation";
import PatternPeaksProgramPreview from "@/components/pattern-peaks/PatternPeaksProgramPreview";
import { getServerStarpathAccess } from "@/lib/demo-session-server";

type PatternPeaksProgramPageProps = {
  searchParams: Promise<{ level?: string; week?: string }>;
};

export default async function PatternPeaksProgramPage({ searchParams }: PatternPeaksProgramPageProps) {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  const params = await searchParams;
  const week = Number(params.week ?? "1");
  return (
    <PatternPeaksProgramPreview
      level={params.level ?? "Year 3"}
      selectedWeek={Number.isInteger(week) ? week : 1}
    />
  );
}
