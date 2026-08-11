import { cookies } from "next/headers";
import { verifyAdultAccessToken } from "@/lib/school-platform-server";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://dqncplrxjxvjqbmwcyia.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_cvaUEdcS16I8T3EqAydiaA_ES8XRgOo";

export const PLATFORM_ADMIN_COOKIE = "lul_platform_admin_access";

export type PlatformAdminContext = {
  allowed: boolean;
  userId?: string;
  role?: "platform_owner";
  displayName?: string;
  email?: string | null;
};

export type PlatformOverview = {
  schools: { total: number; active: number; trial: number; paused: number };
  students: {
    total: number;
    schoolOnly: number;
    schoolAndHome: number;
    homeOnly: number;
    inactive: number;
    parentsLinked: number;
    parentLinkedNoHome: number;
    freeHome: number;
  };
  people: { educators: number; parents: number };
  seats: { limit: number; used: number; available: number };
  activity: { activeThisWeek: number };
  generatedAt: string;
};

export type PlatformSchoolSummary = {
  id: string;
  name: string;
  code: string;
  status: string;
  academicYear: string | null;
  calendarYear: number | null;
  seatLimit: number;
  used: number;
  available: number;
  students: number;
  educators: number;
  schoolAdmins: number;
  parentsLinked: number;
  homeUsers: number;
  homeActivationPercent: number;
  utilisationPercent: number;
  lastActive: string | null;
  billingStatus: string;
  licenceEndDate: string | null;
  attention: string[];
};

export type PlatformSchoolDetail = {
  school: {
    id: string;
    name: string;
    code: string;
    state: string | null;
    sector: string | null;
    status: string;
    operationalStatus: string;
    archivedAt: string | null;
    archivedBy: string | null;
    archiveReason: string | null;
    pausedAt: string | null;
    pauseReason: string | null;
    previousLicenceStatus: string | null;
  };
  licence: {
    id: string;
    academicYearId: string;
    academicYear: string;
    calendarYear: number;
    status: string;
    seatLimit: number;
    used: number;
    available: number;
    utilisationPercent: number;
    startDate: string;
    endDate: string;
    billingStatus: string;
    pricePerSeat: number | null;
    contractValue: number | null;
    notes: string | null;
  };
  people: {
    students: number;
    historicalStudents: number;
    educators: number;
    historicalEducators: number;
    schoolAdmins: number;
    parentsLinked: number;
  };
  home: {
    schoolOnly: number;
    schoolAndHome: number;
    parentLinkedNoHome: number;
    freeHomeAccess: number;
  };
  activity: {
    activeToday: number;
    activeThisWeek: number;
    lessonsThisWeek: number;
    quizzesThisWeek: number;
    assessmentsThisWeek: number;
    lastActive: string | null;
  };
  administrators: Array<{
    userId: string;
    name: string;
    email: string | null;
    role: "school_admin" | "principal";
    status: "invited" | "active" | "inactive" | "revoked";
    acceptedAt: string | null;
    endedAt: string | null;
  }>;
  adminInvitations: Array<{
    id: string;
    email: string;
    role: string;
    status: "pending" | "accepted" | "expired" | "revoked";
    expiresAt: string;
    createdAt: string;
  }>;
  audit: Array<{
    id: number;
    action: string;
    reason: string | null;
    createdAt: string;
    actorUserId: string | null;
  }>;
};

export type PlatformAuditEntry = {
  id: number;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  reason: string | null;
  createdAt: string;
};

export type PlatformOperationsSnapshot = {
  generatedAt: string;
  timezone: "Australia/Melbourne";
  scale: { schools: number; students: number; educators: number; parents: number; schoolSeats: number; seatsUsed: number };
  userMix: { schoolOnly: number; schoolAndHome: number; homeOnly: number; inactive: number };
  growth: { schoolStudents: number; parentLinked: number; homeActivated: number; parentLinkedNoHome: number };
  activity: { activeToday: number; active7d: number; active30d: number; previous7d: number; previous30d: number; lessonsToday: number; lessons7d: number; quizzes7d: number; assessments30d: number; newStudents7d: number; newStudents30d: number; newParentLinks7d: number; newHomeActivations7d: number };
  attention: Array<{ schoolId: string; schoolName: string; severity: "critical" | "attention" | "positive" | "information"; category: string; detail: string }>;
  recentChanges: Array<{ createdAt: string; title: string; source: string; entityId: string | null; reason: string | null }>;
};

export type PlatformGrowthSnapshot = {
  generatedAt: string;
  timezone: string;
  funnel: { schoolStudents: number; parentLinked: number; homeActivated: number; parentLinkRate: number; homeActivationRate: number; parentLinkedNoHome: number; homeOnly: number };
  schools: Array<{ schoolId: string; schoolName: string; schoolStudents: number; parentLinked: number; homeActivated: number; parentLinkedNoHome: number; schoolOnly: number; parentLinkRate: number; homeActivationRate: number }>;
};

export type PlatformEngagementSnapshot = {
  generatedAt: string;
  timezone: string;
  thresholds: { strong: number; healthy: number; low: number; inactiveDays: number };
  schools: Array<{ schoolId: string; schoolName: string; students: number; active7d: number; activePercent: number; lessons7d: number; quizzes7d: number; assessments30d: number; lessonsPerActive: number; lastActivity: string | null; status: "Strong" | "Healthy" | "Low" | "Inactive" }>;
};

export type PlatformHomeOnlySnapshot = { generatedAt: string; timezone: string; students: number; active7d: number; parents: number; events7d: number; averageActivity7d: number };

export type PlatformUserSearch = {
  items: Array<{ id: string; userType: "student" | "parent" | "educator"; name: string; identifier: string | null; explorerCode: string | null; detail: string | null; schoolName: string | null; className: string | null; segment: string; parentLinked: boolean; active: boolean; lastActivity: string | null }>;
  schools: Array<{ id: string; name: string }>;
  total: number;
  page: number;
  pageSize: number;
};

export type PlatformStudentDetail = {
  id: string; name: string; username: string | null; explorerCode: string | null; yearLevel: string | null; status: string;
  createdAt: string; segment: string;
  school: { id: string; name: string } | null;
  classes: Array<{ id: string; name: string; primary: boolean; status: string; academicYear: string | null }>;
  entitlements: Array<{ source: "school" | "home"; status: string; billingStatus: string; startsAt: string; endsAt: string | null; schoolId: string | null; academicYearId: string | null }>;
  parents: Array<{ id: string; name: string | null; email: string | null; relationship: string; linkedAt: string }>;
  realms: Array<{ realmId: string; programKey: string; workingLevel: string | null; currentWeek: number | null; pathway: string; placementComplete: boolean; requiredWeeks: number[]; updatedAt: string; lastActivity: string | null }>;
  activity: { lastActive: string | null; lessons7d: number; quizzes7d: number; assessments30d: number };
};

export type PlatformAdultDetail = { id: string; name: string | null; email: string | null; status: string; createdAt: string; lastActive: string | null; schools: Array<{ id: string; name: string; role: string; status: string }>; children: Array<{ id: string; name: string; relationship: string; status: string; schoolName: string | null; homeActive: boolean }> };

async function adminRequest<T>(
  rpc: string,
  accessToken: string,
  body: Record<string, unknown> = {},
) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${rpc}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const details = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(details?.message ?? `Platform Admin request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

async function getAdminToken() {
  const store = await cookies();
  return store.get(PLATFORM_ADMIN_COOKIE)?.value ?? "";
}

export async function verifyPlatformOwnerToken(accessToken: string) {
  const user = await verifyAdultAccessToken(accessToken);
  if (!user) return null;
  try {
    const context = await adminRequest<PlatformAdminContext>(
      "get_platform_admin_access_context",
      accessToken,
    );
    return context.allowed && context.role === "platform_owner"
      ? { user, context }
      : null;
  } catch {
    return null;
  }
}

export async function requirePlatformOwner() {
  const accessToken = await getAdminToken();
  const access = await verifyPlatformOwnerToken(accessToken);
  return access ? { ...access, accessToken } : null;
}

export async function loadPlatformOverview() {
  const access = await requirePlatformOwner();
  if (!access) return null;
  const [overview, schools] = await Promise.all([
    adminRequest<PlatformOverview>("get_platform_admin_overview", access.accessToken),
    adminRequest<PlatformSchoolSummary[]>(
      "get_platform_admin_school_summaries_pa2",
      access.accessToken,
    ),
  ]);
  return { access, overview, schools };
}

export async function loadPlatformOperations() {
  const access = await requirePlatformOwner();
  if (!access) return null;
  const snapshot = await adminRequest<PlatformOperationsSnapshot>("get_platform_admin_operations_snapshot", access.accessToken);
  return { access, snapshot };
}

export async function loadPlatformGrowth() {
  const access = await requirePlatformOwner();
  if (!access) return null;
  return { access, snapshot: await adminRequest<PlatformGrowthSnapshot>("get_platform_admin_growth_snapshot", access.accessToken) };
}

export async function loadPlatformEngagement() {
  const access = await requirePlatformOwner();
  if (!access) return null;
  return { access, snapshot: await adminRequest<PlatformEngagementSnapshot>("get_platform_admin_engagement_snapshot", access.accessToken) };
}

export async function loadPlatformHomeOnly() {
  const access = await requirePlatformOwner();
  if (!access) return null;
  return { access, snapshot: await adminRequest<PlatformHomeOnlySnapshot>("get_platform_admin_home_only_snapshot", access.accessToken) };
}

export async function searchPlatformAdminUsers(params: { query?: string; userType?: string; segment?: string; activity?: string; schoolId?: string; page?: number; pageSize?: number }) {
  const access = await requirePlatformOwner();
  if (!access) return null;
  const results = await adminRequest<PlatformUserSearch>("search_platform_admin_users", access.accessToken, {
    p_query: params.query ?? "", p_user_type: params.userType ?? "all", p_segment: params.segment ?? "all", p_activity: params.activity ?? "all", p_school_id: params.schoolId || null, p_page: params.page ?? 1, p_page_size: params.pageSize ?? 25,
  });
  return { access, results };
}

export async function loadPlatformStudentDetail(studentId: string) {
  const access = await requirePlatformOwner();
  if (!access) return null;
  return { access, detail: await adminRequest<PlatformStudentDetail>("get_platform_admin_student_detail", access.accessToken, { p_student_id: studentId }) };
}

export async function loadPlatformAdultDetail(userId: string) {
  const access = await requirePlatformOwner();
  if (!access) return null;
  return { access, detail: await adminRequest<PlatformAdultDetail>("get_platform_admin_adult_detail", access.accessToken, { p_user_id: userId }) };
}

export async function loadPlatformSchools() {
  const access = await requirePlatformOwner();
  if (!access) return null;
  const schools = await adminRequest<PlatformSchoolSummary[]>(
    "get_platform_admin_school_summaries_pa2",
    access.accessToken,
  );
  return { access, schools };
}

export async function loadPlatformSchoolDetail(schoolId: string) {
  const access = await requirePlatformOwner();
  if (!access) return null;
  const detail = await adminRequest<PlatformSchoolDetail>(
    "get_platform_admin_school_detail",
    access.accessToken,
    { p_school_id: schoolId },
  );
  return { access, detail };
}

export async function loadPlatformAudit() {
  const access = await requirePlatformOwner();
  if (!access) return null;
  const audit = await adminRequest<PlatformAuditEntry[]>(
    "get_platform_admin_audit",
    access.accessToken,
    { p_limit: 100 },
  );
  return { access, audit };
}

export async function runPlatformOwnerCommand<T>(
  rpc: string,
  body: Record<string, unknown>,
) {
  const access = await requirePlatformOwner();
  if (!access) throw new Error("Platform owner access required");
  return adminRequest<T>(rpc, access.accessToken, body);
}
