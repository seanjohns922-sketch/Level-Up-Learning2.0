import { NextResponse } from "next/server";
import { loadSchoolHomePreview } from "@/lib/school-platform-server";

export async function GET(
  request: Request,
  context: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await context.params;
  const classId = new URL(request.url).searchParams.get("classId")?.trim();
  if (!classId) {
    return NextResponse.json({ error: "Class is required" }, { status: 400 });
  }

  const preview = await loadSchoolHomePreview(schoolId);
  const classRow = preview?.snapshot.classes.find(
    (candidate) => candidate.id === classId,
  );
  if (!classRow?.canOpen) {
    return NextResponse.json({ error: "Class access denied" }, { status: 403 });
  }

  return NextResponse.json({
    allowed: true,
    classId: classRow.id,
    className: classRow.name,
  });
}
