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
  parentsLinked: number;
  homeUsers: number;
  homeActivationPercent: number;
  utilisationPercent: number;
  lastActive: string | null;
  billingStatus: string;
};

export type PlatformSchoolDetail = {
  school: {
    id: string;
    name: string;
    code: string;
    state: string | null;
    sector: string | null;
    status: string;
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
    educators: number;
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
      "get_platform_admin_school_summaries",
      access.accessToken,
    ),
  ]);
  return { access, overview, schools };
}

export async function loadPlatformSchools() {
  const access = await requirePlatformOwner();
  if (!access) return null;
  const schools = await adminRequest<PlatformSchoolSummary[]>(
    "get_platform_admin_school_summaries",
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
