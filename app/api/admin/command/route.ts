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
      const schoolId = await runPlatformOwnerCommand<string>("platform_owner_create_school", {
        p_name: text(payload.name), p_school_code: text(payload.schoolCode),
        p_calendar_year: number(payload.academicYear), p_seat_limit: number(payload.seatLimit),
        p_status: text(payload.status) || "trial", p_start_date: null, p_end_date: null,
        p_notes: text(payload.notes) || null, p_idempotency_key: text(payload.idempotencyKey) || crypto.randomUUID(),
      });
      return NextResponse.json({ schoolId });
    }
    if (payload.action === "updateLicence") {
      const licence = await runPlatformOwnerCommand<Record<string, unknown>>("platform_owner_update_school_licence", {
        p_school_id: text(payload.schoolId), p_academic_year_id: text(payload.academicYearId),
        p_seat_limit: number(payload.seatLimit), p_status: text(payload.status),
        p_start_date: text(payload.startDate), p_end_date: text(payload.endDate),
        p_billing_status: text(payload.billingStatus) || "free", p_notes: text(payload.notes) || null,
        p_reason: text(payload.reason) || null,
      });
      return NextResponse.json({ licence });
    }
    return NextResponse.json({ error: "Unknown Platform Admin command" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Platform Admin command failed" }, { status: 403 });
  }
}
