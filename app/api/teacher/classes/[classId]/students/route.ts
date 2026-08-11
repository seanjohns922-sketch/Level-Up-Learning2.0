import { NextResponse } from "next/server";
import { runAuthenticatedCommand } from "@/lib/school-platform-server";

type CreateClassStudentRequest = {
  schoolId?: string;
  firstName?: string;
  lastName?: string;
  schoolYear?: string;
  username?: string;
  pin?: string | null;
  idempotencyKey?: string;
};

function value(input: unknown) {
  return typeof input === "string" ? input.trim() : "";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ classId: string }> },
) {
  const { classId } = await context.params;
  const accessToken = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim() ?? "";

  let payload: CreateClassStudentRequest;
  try {
    payload = (await request.json()) as CreateClassStudentRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const schoolId = value(payload.schoolId);
  if (!classId || !schoolId) {
    return NextResponse.json(
      { error: "Class and school context are required" },
      { status: 400 },
    );
  }

  try {
    const student = await runAuthenticatedCommand<Record<string, unknown>>(
      "create_school_student",
      {
        p_school_id: schoolId,
        p_class_id: classId,
        p_first_name: value(payload.firstName),
        p_last_name: value(payload.lastName),
        p_school_year_level: value(payload.schoolYear),
        p_username: value(payload.username) || null,
        p_pin: value(payload.pin) || null,
        p_idempotency_key:
          value(payload.idempotencyKey) || crypto.randomUUID(),
      },
      accessToken,
    );
    return NextResponse.json({ student });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Student could not be added",
      },
      { status: 403 },
    );
  }
}
