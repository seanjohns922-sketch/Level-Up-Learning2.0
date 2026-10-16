"use client";

import { Activity, Building2, GraduationCap, ShieldAlert, Users } from "lucide-react";
import PlatformAdminShell from "@/components/admin/PlatformAdminShell";
import { AdminPageHeading, Metric } from "@/components/admin/AdminPrimitives";
import SchoolLicencesPanel from "@/components/admin/SchoolLicencesPanel";
import SchoolsAdminClient from "@/components/admin/SchoolsAdminClient";
import type { PlatformSchoolSummary } from "@/lib/platform-admin-server";

const school = (id: string, name: string, code: string, status: string, used: number, seatLimit: number, admins: number, attention: string[] = []): PlatformSchoolSummary => ({
  id, name, code, status, academicYear: "2026", calendarYear: 2026, seatLimit, used, available: seatLimit - used, students: used, educators: 4,
  schoolAdmins: admins, parentsLinked: 3, homeUsers: 1, homeActivationPercent: 1, utilisationPercent: Math.round((used / seatLimit) * 100),
  lastActive: "2026-10-13T03:00:00Z", billingStatus: "free", licenceEndDate: "2026-12-31", attention,
});

const SCHOOLS = [
  school("1", "Cobram Primary School", "COB2026", "active", 70, 350, 2),
  school("2", "Mr Johns School", "MRJ2026", "active", 109, 120, 1, ["Seat capacity"]),
  school("3", "St Anthony's Wanneroo", "STANT2026", "trial", 32, 120, 0, ["No administrators"]),
  school("4", "St Patrick's Primary School Stawell", "STP2026", "trial", 25, 129, 1),
];

/** Review-only: the platform owner console's shell, primitives and schools list with sample schools. */
export default function AdminConsoleReview() {
  return (
    <PlatformAdminShell displayName="Sean">
      <AdminPageHeading eyebrow="Overview" title="Platform overview" detail="Monitor platform scale, weekly activity and schools requiring action." action={<span className="rounded-full bg-[#121314] px-5 py-2.5 text-sm font-bold text-white">Explore users</span>} />
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Metric label="Schools" value={6} icon={Building2} />
        <Metric label="Students with access" value={236} detail="29 older records have no current access" icon={GraduationCap} />
        <Metric label="Educators" value={11} icon={Users} />
        <Metric label="Seats used" value="236/719" detail="33% of school seats" icon={ShieldAlert} />
        <Metric label="Active this week" value={7} detail="Submitted work in 7 days · +2 on last week" icon={Activity} />
      </section>
      <div className="mt-8">
        <SchoolLicencesPanel schoolId="1" schoolName="Cobram Primary School" archived={false} licences={[
          { licenceId: "l27", academicYearId: "y27", academicYear: "2027", calendarYear: 2027, status: "active", seatLimit: 350, used: 0, startDate: "2026-12-01", endDate: "2027-12-31", billingStatus: "paid", pricePerSeat: 18, contractValue: 6300, notes: null },
          { licenceId: "l26", academicYearId: "y26", academicYear: "2026", calendarYear: 2026, status: "active", seatLimit: 350, used: 70, startDate: "2026-01-01", endDate: "2026-12-31", billingStatus: "free", pricePerSeat: null, contractValue: null, notes: null },
        ]} />
      </div>
      <div className="mt-8">
        <SchoolsAdminClient schools={SCHOOLS} />
      </div>
    </PlatformAdminShell>
  );
}
