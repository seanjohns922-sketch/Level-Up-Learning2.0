import { NextResponse } from "next/server";
import { loadSchoolStudentDirectoryPreview } from "@/lib/school-platform-server";

export async function GET(
  request: Request,
  context: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await context.params;
  const accessToken = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim() ?? "";
  try {
    const students = await loadSchoolStudentDirectoryPreview(
      schoolId,
      accessToken,
    );
    if (!students) {
      return NextResponse.json({ error: "School access denied" }, { status: 403 });
    }

    return NextResponse.json({ students });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The school student directory could not be loaded.",
      },
      { status: 503 },
    );
  }
}
