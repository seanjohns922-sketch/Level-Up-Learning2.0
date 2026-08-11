import { NextResponse } from "next/server";
import { loadSchoolLicenceSummaries } from "@/lib/school-platform-server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await context.params;
  try {
    const licences = await loadSchoolLicenceSummaries(schoolId);
    if (!licences) {
      return NextResponse.json(
        { error: "School administration access required" },
        { status: 403 },
      );
    }

    return NextResponse.json({ licences });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Licence information could not be loaded.",
      },
      { status: 503 },
    );
  }
}
