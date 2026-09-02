import { redirect } from "next/navigation";
import { getServerStarpathAccess } from "@/lib/demo-session-server";

type PatternPeaksProgramPageProps = {
  searchParams: Promise<{ level?: string; week?: string; teacher_preview?: string }>;
};

// Pattern Peaks now uses the shared Week Home (app/program) like every other
// realm. This legacy route just forwards to it, skinned as Pattern Peaks.
export default async function PatternPeaksProgramPage({ searchParams }: PatternPeaksProgramPageProps) {
  const access = await getServerStarpathAccess();
  if (!access.allowed) redirect("/login");
  const params = await searchParams;
  const level = params.level ?? "Year 3";
  const week = Number(params.week ?? "1");
  const safeWeek = Number.isInteger(week) && week > 0 ? week : 1;
  redirect(
    `/program?year=${encodeURIComponent(level)}&week=${safeWeek}&realm_id=pattern&legacy=1&teacher_preview=1`,
  );
}
