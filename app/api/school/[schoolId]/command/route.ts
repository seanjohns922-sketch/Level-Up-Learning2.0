import { NextResponse } from "next/server";
import {
  requireSchoolPreviewAccess,
  runSchoolCommand,
} from "@/lib/school-platform-server";

type CommandRequest = {
  action?: string;
  [key: string]: unknown;
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export async function POST(
  request: Request,
  context: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await context.params;
  const access = await requireSchoolPreviewAccess(schoolId);
  if (!access) return errorResponse("School access denied", 403);

  let payload: CommandRequest;
  try {
    payload = (await request.json()) as CommandRequest;
  } catch {
    return errorResponse("Invalid request");
  }

  try {
    switch (payload.action) {
      case "createClass": {
        const academicYearId = stringValue(payload.academicYearId);
        const name = stringValue(payload.name);
        const classCode = stringValue(payload.classCode).toUpperCase();
        const leadTeacherId =
          stringValue(payload.leadTeacherId) || access.user.id;
        const coTeacherIds = stringArray(payload.coTeacherIds).filter(
          (id) => id !== leadTeacherId,
        );
        const idempotencyKey =
          stringValue(payload.idempotencyKey) || crypto.randomUUID();

        const classId = await runSchoolCommand<string>(
          schoolId,
          "create_class",
          {
            p_school_id: schoolId,
            p_academic_year_id: academicYearId,
            p_name: name,
            p_class_code: classCode,
            p_year_levels: stringArray(payload.yearLevels),
            p_idempotency_key: idempotencyKey,
          },
        );

        if (leadTeacherId !== access.user.id) {
          await runSchoolCommand<string>(schoolId, "assign_class_staff", {
            p_class_id: classId,
            p_user_id: leadTeacherId,
            p_role: "lead_teacher",
          });
        }
        for (const userId of coTeacherIds) {
          await runSchoolCommand<string>(schoolId, "assign_class_staff", {
            p_class_id: classId,
            p_user_id: userId,
            p_role: "teacher",
          });
        }
        if (
          leadTeacherId !== access.user.id &&
          !coTeacherIds.includes(access.user.id)
        ) {
          await runSchoolCommand<void>(schoolId, "revoke_class_staff", {
            p_class_id: classId,
            p_user_id: access.user.id,
          });
        }

        return NextResponse.json({ classId });
      }

      case "assignClassStaff":
        await runSchoolCommand<string>(schoolId, "assign_class_staff", {
          p_class_id: stringValue(payload.classId),
          p_user_id: stringValue(payload.userId),
          p_role: stringValue(payload.role),
        });
        return NextResponse.json({ success: true });

      case "inviteStaff": {
        const result = await runSchoolCommand<
          Array<{
            invitation_id: string;
            invitation_token: string | null;
            repeated_request: boolean;
          }>
        >(schoolId, "invite_school_staff_with_class", {
          p_school_id: schoolId,
          p_email: stringValue(payload.email),
          p_role: stringValue(payload.role),
          p_class_id: stringValue(payload.classId) || null,
          p_idempotency_key:
            stringValue(payload.idempotencyKey) || crypto.randomUUID(),
        });
        return NextResponse.json({
          invitationId: result[0]?.invitation_id,
          repeatedRequest: result[0]?.repeated_request ?? false,
        });
      }

      case "resendInvitation":
        await runSchoolCommand<string>(schoolId, "resend_school_invitation", {
          p_invitation_id: stringValue(payload.invitationId),
        });
        return NextResponse.json({ success: true });

      case "revokeInvitation":
        await runSchoolCommand<void>(schoolId, "revoke_school_invitation", {
          p_invitation_id: stringValue(payload.invitationId),
        });
        return NextResponse.json({ success: true });

      case "changeMemberRole":
        await runSchoolCommand<void>(schoolId, "change_school_member_role", {
          p_school_id: schoolId,
          p_user_id: stringValue(payload.userId),
          p_role: stringValue(payload.role),
        });
        return NextResponse.json({ success: true });

      case "deactivateMember":
        await runSchoolCommand<void>(schoolId, "deactivate_school_member", {
          p_school_id: schoolId,
          p_user_id: stringValue(payload.userId),
        });
        return NextResponse.json({ success: true });

      case "resetExplorerCode": {
        const explorerCode = await runSchoolCommand<string>(
          schoolId,
          "reset_student_explorer_code",
          {
            p_school_id: schoolId,
            p_student_id: stringValue(payload.studentId),
            p_reason: stringValue(payload.reason),
          },
        );
        return NextResponse.json({ explorerCode });
      }

      default:
        return errorResponse("Unknown school command");
    }
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "School command failed",
      403,
    );
  }
}
