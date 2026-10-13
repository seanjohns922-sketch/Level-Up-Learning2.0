import { NextRequest, NextResponse } from "next/server";
import { loadClassGroups } from "@/lib/school-platform-server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await context.params;
  const academicYearId = request.nextUrl.searchParams.get("academicYearId") ?? "";
  if (!academicYearId) {
    return NextResponse.json({ error: "Academic year is required." }, { status: 400 });
  }
  const accessToken = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();

  try {
    const groups = await loadClassGroups(schoolId, academicYearId, accessToken);
    if (!groups) return NextResponse.json({ error: "School access denied." }, { status: 403 });
    return NextResponse.json({ groups }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[class-groups] Load failed", error);
    return NextResponse.json({ error: "Class groups could not be loaded." }, { status: 503 });
  }
}
