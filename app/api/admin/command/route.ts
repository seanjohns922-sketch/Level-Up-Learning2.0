import { NextResponse } from "next/server";
import { runPlatformOwnerCommand } from "@/lib/platform-admin-server";
import { sendSchoolAdminAccessEmail, sendSchoolAdminInviteEmail } from "@/lib/school-admin-invite-email";

function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function number(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }
function baseUrl(request: Request) { return new URL(request.url).origin; }

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try { payload = (await request.json()) as Record<string, unknown>; }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  try {
    if (payload.action === "createSchool") {
      const initialAdminEmail = text(payload.initialAdminEmail);
      const result = await runPlatformOwnerCommand<Record<string, unknown>>("platform_owner_provision_school", {
        p_name: text(payload.name), p_school_code: text(payload.schoolCode),
        p_state: text(payload.state), p_sector: text(payload.sector),
        p_calendar_year: number(payload.academicYear), p_seat_limit: number(payload.seatLimit),
        p_status: text(payload.status) || "trial",
        p_start_date: text(payload.startDate) || null, p_end_date: text(payload.endDate) || null,
        p_billing_status: text(payload.billingStatus) || "free",
        p_initial_admin_email: initialAdminEmail || null,
        p_notes: text(payload.notes) || null,
        p_idempotency_key: text(payload.idempotencyKey) || crypto.randomUUID(),
      });
      if (result.initialAdminStatus === "invitation_created" && initialAdminEmail) {
        result.emailDelivery = await sendSchoolAdminInviteEmail({
          to: initialAdminEmail,
          schoolName: String(result.name ?? text(payload.name)),
          schoolCode: String(result.schoolCode ?? text(payload.schoolCode)),
          baseUrl: baseUrl(request),
        });
      } else if (result.initialAdminStatus === "membership_added" && initialAdminEmail) {
        result.emailDelivery = await sendSchoolAdminAccessEmail({
          to: initialAdminEmail,
          schoolName: String(result.name ?? text(payload.name)),
          baseUrl: baseUrl(request),
        });
      }
      return NextResponse.json(result);
    }
    if (payload.action === "updateLicence") {
      const licence = await runPlatformOwnerCommand<Record<string, unknown>>("platform_owner_update_school_access", {
        p_school_id: text(payload.schoolId), p_academic_year_id: text(payload.academicYearId),
        p_seat_limit: number(payload.seatLimit),
        p_start_date: text(payload.startDate), p_end_date: text(payload.endDate),
        p_billing_status: text(payload.billingStatus) || "free", p_notes: text(payload.notes) || null,
        p_reason: text(payload.reason) || null,
      });
      return NextResponse.json({ licence });
    }
    if (payload.action === "updateSchool") {
      const school = await runPlatformOwnerCommand<Record<string, unknown>>("platform_owner_update_school", {
        p_school_id: text(payload.schoolId), p_name: text(payload.name),
        p_school_code: text(payload.schoolCode), p_state: text(payload.state),
        p_sector: text(payload.sector), p_reason: text(payload.reason) || null,
      });
      return NextResponse.json({ school });
    }
    if (payload.action === "transitionSchool") {
      const lifecycle = await runPlatformOwnerCommand<Record<string, unknown>>("platform_owner_transition_school", {
        p_school_id: text(payload.schoolId), p_transition: text(payload.transition),
        p_reason: text(payload.reason), p_restore_status: text(payload.restoreStatus) || null,
        p_start_date: text(payload.startDate) || null, p_end_date: text(payload.endDate) || null,
      });
      return NextResponse.json({ lifecycle });
    }
    if (payload.action === "assignSchoolAdmin") {
      const email = text(payload.email);
      const administrator = await runPlatformOwnerCommand<Record<string, unknown>>("platform_owner_assign_school_admin", {
        p_school_id: text(payload.schoolId), p_email: email,
        p_idempotency_key: text(payload.idempotencyKey) || crypto.randomUUID(),
      });
      if (administrator.status === "invitation_created" && email) {
        administrator.emailDelivery = await sendSchoolAdminInviteEmail({
          to: email,
          schoolName: text(payload.schoolName) || "your school",
          schoolCode: text(payload.schoolCode),
          baseUrl: baseUrl(request),
        });
      } else if (administrator.status === "membership_added" && email) {
        administrator.emailDelivery = await sendSchoolAdminAccessEmail({
          to: email,
          schoolName: text(payload.schoolName) || "your school",
          baseUrl: baseUrl(request),
        });
      }
      return NextResponse.json({ administrator });
    }
    if (payload.action === "manageSchoolAdmin") {
      const administrator = await runPlatformOwnerCommand<Record<string, unknown>>("platform_owner_manage_school_admin", {
        p_school_id: text(payload.schoolId), p_action: text(payload.adminAction),
        p_user_id: text(payload.userId) || null, p_invitation_id: text(payload.invitationId) || null,
        p_reason: text(payload.reason) || null, p_confirm_final_admin: payload.confirmFinalAdmin === true,
      });
      if (text(payload.adminAction) === "resend_invitation" && text(payload.invitationEmail)) {
        administrator.emailDelivery = await sendSchoolAdminInviteEmail({
          to: text(payload.invitationEmail),
          schoolName: text(payload.schoolName) || "your school",
          schoolCode: text(payload.schoolCode),
          baseUrl: baseUrl(request),
        });
      }
      return NextResponse.json({ administrator });
    }
    if (payload.action === "searchIdentityStudents") {
      const results = await runPlatformOwnerCommand<Record<string, unknown>>(
        "search_platform_admin_users",
        {
          p_query: text(payload.query), p_user_type: "student", p_segment: "all",
          p_activity: "all", p_school_id: null, p_page: 1, p_page_size: 10,
        },
      );
      return NextResponse.json(results);
    }
    if (payload.action === "requestIdentityMerge") {
      const result = await runPlatformOwnerCommand<Record<string, unknown>>(
        "request_student_identity_merge",
        {
          p_survivor_student_id: text(payload.survivorStudentId),
          p_duplicate_student_id: text(payload.duplicateStudentId),
          p_reason: text(payload.reason),
        },
      );
      return NextResponse.json(result);
    }
    if (payload.action === "resolveIdentityMerge") {
      const result = await runPlatformOwnerCommand<Record<string, unknown>>(
        "resolve_student_identity_merge",
        {
          p_request_id: text(payload.requestId),
          p_approve: payload.approve === true,
          p_reason: text(payload.reason),
        },
      );
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: "Unknown Platform Admin command" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Platform Admin command failed" }, { status: 403 });
  }
}
