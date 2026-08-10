import { NextResponse } from "next/server";
import { runPlatformOwnerCommand } from "@/lib/platform-admin-server";

function text(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function number(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try { payload = (await request.json()) as Record<string, unknown>; }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  try {
    if (payload.action === "createSchool") {
      const result = await runPlatformOwnerCommand<Record<string, unknown>>("platform_owner_provision_school", {
        p_name: text(payload.name), p_school_code: text(payload.schoolCode),
        p_state: text(payload.state), p_sector: text(payload.sector),
        p_calendar_year: number(payload.academicYear), p_seat_limit: number(payload.seatLimit),
        p_status: text(payload.status) || "trial",
        p_start_date: text(payload.startDate) || null, p_end_date: text(payload.endDate) || null,
        p_billing_status: text(payload.billingStatus) || "free",
        p_initial_admin_email: text(payload.initialAdminEmail) || null,
        p_notes: text(payload.notes) || null,
        p_idempotency_key: text(payload.idempotencyKey) || crypto.randomUUID(),
      });
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
      const administrator = await runPlatformOwnerCommand<Record<string, unknown>>("platform_owner_assign_school_admin", {
        p_school_id: text(payload.schoolId), p_email: text(payload.email),
        p_idempotency_key: text(payload.idempotencyKey) || crypto.randomUUID(),
      });
      return NextResponse.json({ administrator });
    }
    if (payload.action === "manageSchoolAdmin") {
      const administrator = await runPlatformOwnerCommand<Record<string, unknown>>("platform_owner_manage_school_admin", {
        p_school_id: text(payload.schoolId), p_action: text(payload.adminAction),
        p_user_id: text(payload.userId) || null, p_invitation_id: text(payload.invitationId) || null,
        p_reason: text(payload.reason) || null, p_confirm_final_admin: payload.confirmFinalAdmin === true,
      });
      return NextResponse.json({ administrator });
    }
    return NextResponse.json({ error: "Unknown Platform Admin command" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Platform Admin command failed" }, { status: 403 });
  }
}
