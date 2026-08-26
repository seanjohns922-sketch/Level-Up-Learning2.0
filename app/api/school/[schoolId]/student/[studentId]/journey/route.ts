import { NextRequest, NextResponse } from "next/server";
import { loadStudentLearningJourney } from "@/lib/school-platform-server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ schoolId: string; studentId: string }> },
) {
  const { schoolId, studentId } = await context.params;

  const authorization = request.headers.get("authorization") ?? "";
  const accessToken = authorization.replace(/^Bearer\s+/i, "").trim();

  try {
    const journey = await loadStudentLearningJourney(schoolId, studentId, accessToken);
    if (!journey) {
      return NextResponse.json({ error: "School access denied." }, { status: 403 });
    }
    return NextResponse.json(journey, {
      headers: { "Cache-Control": "private, max-age=60, stale-while-revalidate=120" },
    });
  } catch (error) {
    console.error("[school-analytics] Learning journey failed", error);
    return NextResponse.json(
      { error: "Learning journey could not be loaded." },
      { status: 503 },
    );
  }
}
