import { NextRequest, NextResponse } from "next/server";
import { loadClassGroupDashboard } from "@/lib/school-platform-server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await context.params;
  const academicYearId = request.nextUrl.searchParams.get("academicYearId") ?? "";
  const classId = request.nextUrl.searchParams.get("classId") ?? "";
  if (!academicYearId || !classId) {
    return NextResponse.json({ error: "Academic year and class are required." }, { status: 400 });
  }
  const accessToken = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();

  try {
    const dashboard = await loadClassGroupDashboard(schoolId, academicYearId, classId, accessToken);
    if (!dashboard) return NextResponse.json({ error: "Class access denied." }, { status: 403 });
    if (dashboard === "unavailable") return NextResponse.json({ unavailable: true });
    return NextResponse.json(dashboard, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch (error) {
    console.error("[class-dashboard] Load failed", error);
    return NextResponse.json({ error: "Class dashboard could not be loaded." }, { status: 503 });
  }
}
