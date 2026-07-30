import { NextResponse } from "next/server";
import { loadSchoolHomePreview } from "@/lib/school-platform-server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await context.params;
  const schoolHome = await loadSchoolHomePreview(schoolId);
  if (!schoolHome) {
    return NextResponse.json({ error: "School access denied" }, { status: 403 });
  }
  if (schoolHome.snapshot.studentDirectoryError) {
    return NextResponse.json(
      { error: schoolHome.snapshot.studentDirectoryError },
      { status: 503 },
    );
  }

  return NextResponse.json({
    students: schoolHome.snapshot.students,
    classes: schoolHome.snapshot.classes,
  });
}
