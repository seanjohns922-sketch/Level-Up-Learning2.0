import { NextRequest, NextResponse } from "next/server";
import { loadSchoolAnalyticsSnapshot } from "@/lib/school-platform-server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await context.params;
  const academicYearId = request.nextUrl.searchParams.get("academicYearId") ?? "";

  if (!academicYearId) {
    return NextResponse.json(
      { error: "Academic year is required." },
      { status: 400 },
    );
  }

  const authorization = request.headers.get("authorization") ?? "";
  const accessToken = authorization.replace(/^Bearer\s+/i, "").trim();

  try {
    const snapshot = await loadSchoolAnalyticsSnapshot(
      schoolId,
      academicYearId,
      {
        days: Number(request.nextUrl.searchParams.get("days") ?? 30),
        yearLevel: request.nextUrl.searchParams.get("yearLevel"),
        classId: request.nextUrl.searchParams.get("classId"),
        realmId: request.nextUrl.searchParams.get("realmId"),
      },
      accessToken,
    );

    if (!snapshot) {
      return NextResponse.json({ error: "School access denied." }, { status: 403 });
    }

    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    console.error("[school-analytics] Snapshot failed", error);
    return NextResponse.json(
      { error: "School analytics could not be loaded." },
      { status: 503 },
    );
  }
}
