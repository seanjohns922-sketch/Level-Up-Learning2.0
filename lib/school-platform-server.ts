import { cookies } from "next/headers";
import {
  type AcStrand,
  type AchievementBand,
  AC_STRANDS,
  bandFor,
  strandForRealm,
} from "@/lib/curriculum/ac-standards";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://dqncplrxjxvjqbmwcyia.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_cvaUEdcS16I8T3EqAydiaA_ES8XRgOo";

export const SCHOOL_PREVIEW_COOKIE = "lul_school_preview_access";

export type SchoolAccessContext = {
  school_id: string;
  school_name: string;
  school_status: string;
  membership_role: string;
  membership_status: string;
  can_manage: boolean;
};

export type AuthUser = {
  id: string;
  email?: string;
};

export type SchoolSwitcherItem = {
  id: string;
  name: string;
  role: string;
};

export type SchoolLicenceSummary = {
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
};

export type SchoolInviteEmailContext = {
  schoolName: string;
  schoolCode: string;
  email?: string;
  role?: string;
};

export type SchoolHomeSnapshot = {
  school: {
    id: string;
    name: string;
    state: string | null;
    sector: string | null;
    status: string;
  };
  actor: {
    id: string;
    name: string;
    email: string | null;
    role: string;
  };
  permissions: {
    canManageSchool: boolean;
    canCreateClass: boolean;
    canInviteStaff: boolean;
    canViewAdministration: boolean;
    isLeadingTeacher: boolean;
  };
  academicYears: Array<{
    id: string;
    name: string;
    calendarYear: number;
    status: string;
    startsOn: string;
    endsOn: string;
    activeStudentCount: number;
  }>;
  classes: Array<{
    id: string;
    name: string;
    code: string;
    yearLevels: string[];
    academicYearId: string | null;
    academicYear: number | null;
    status: string;
    studentCount: number;
    leadTeacher: string | null;
    coTeachers: string[];
    myRole: string | null;
    canOpen: boolean;
    canManage: boolean;
  }>;
  staff: Array<{
    userId: string;
    name: string;
    email: string | null;
    role: string;
    status: string;
    assignedClasses: Array<{ id: string; name: string; role: string }>;
  }>;
  invitations: Array<{
    id: string;
    email: string;
    role: string;
    status: string;
    expiresAt: string;
    requestedClassId: string | null;
    createdAt: string;
  }>;
  students: Array<{
    id: string;
    name: string;
    yearLevel: string | null;
    username: string | null;
    pinStatus: "set" | "not_set";
    explorerCode: string | null;
    classIds: string[];
    classes: string[];
    status: "active" | "archived";
  }>;
  studentDirectoryError: string | null;
};

export type SchoolAnalyticsSnapshot = {
  generatedAt: string;
  windowDays: number;
  filters: {
    yearLevel: string | null;
    classId: string | null;
    realmId: string | null;
  };
  overview: {
    students: number;
    activeThisWeek: number;
    weeklyTargetMet: number;
    onTrack: number;
    levelsMastered: number;
    averageGrowth: number | null;
    matchedGrowthPairs: number;
  };
  realms: Array<{
    realmId: string;
    activeStudents: number;
    weeklyTargetMet: number;
    masteredLevels: number;
    averageAccuracy: number | null;
    lessons: number;
    quizzes: number;
    averageGrowth: number | null;
  }>;
  growthTrend: Array<{
    date: string;
    averageGrowth: number | null;
    matchedPairs: number;
  }>;
  engagementTrend: Array<{
    date: string;
    activeStudents: number;
    activities: number;
  }>;
  engagement: {
    activeLearners: number;
    averageLearningDays: number | null;
    returningLearners: number;
    lessonsCompleted: number;
    quizzesCompleted: number;
  };
  curriculum: Array<{
    topic: string;
    yearLevel: string | null;
    realmId: string | null;
    strand: AcStrand | null;
    strandLabel: string | null;
    band: AchievementBand | null;
    students: number;
    evidenceCount: number;
    averageAccuracy: number | null;
  }>;
  classes: Array<{
    id: string | null;
    name: string;
    students: number;
    activeStudents: number;
    weeklyTargetMet: number;
    masteredLevels: number;
    averageAccuracy: number | null;
    averageGrowth: number | null;
  }>;
  students: Array<{
    id: string;
    name: string;
    yearLevel: string | null;
    classId: string | null;
    className: string;
    lastActive: string | null;
    averageAccuracy: number | null;
    realmsUsed: number;
    learningDays: number;
    activeThisWeek: boolean;
    weeklyTargetMet: boolean;
    masteredLevels: number;
    status: "on_track" | "active" | "needs_attention";
    averageGrowth: number | null;
    realms: Array<{
      realmId: string;
      averageAccuracy: number | null;
      activities: number;
      currentLevel: string | null;
      currentWeek: number | null;
      pathwayStatus: string | null;
      pretestScore: number | null;
      posttestScore: number | null;
      // Latest assessment (placement pre-test, then each level's post-test) —
      // the signal for achievement bands, not lesson practice accuracy.
      assessmentScore: number | null;
      assessmentLevel: string | null;
      assessmentType: string | null;
      mastered: boolean;
      growth: number | null;
    }>;
  }>;
  methodology: {
    weeklyTarget: string;
    onTrack: string;
    mastery: string;
    growth: string;
    lessonDeduplication: string;
    quizDeduplication: string;
  };
};

export type StudentLearningJourney = {
  student: {
    id: string;
    name: string;
    yearLevel: string | null;
    className: string;
  };
  levels: Array<{
    realmId: string;
    workingLevel: string;
    isCurrent: boolean;
    currentWeek: number | null;
    status: string;
    pretestScore: number | null;
    posttestScore: number | null;
    posttestCompletedAt: string | null;
  }>;
};

export function isSchoolPlatformPreviewEnabled() {
  return process.env.SCHOOL_PLATFORM_PREVIEW_ENABLED !== "false";
}

async function supabaseRequest<T>(
  path: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    const details = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(
      details?.message ?? `Supabase access check failed (${response.status})`,
    );
  }

  return (await response.json()) as T;
}

async function getSchoolPreviewToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SCHOOL_PREVIEW_COOKIE)?.value ?? "";
}

export async function verifyAdultAccessToken(accessToken: string) {
  const token = accessToken.trim();
  if (!token) return null;

  try {
    const user = await supabaseRequest<AuthUser>("/auth/v1/user", token);
    const profiles = await supabaseRequest<Array<{ status: string }>>(
      `/rest/v1/user_profiles?user_id=eq.${encodeURIComponent(user.id)}&select=status`,
      token,
    );
    const profile = profiles[0];

    if (!profile || profile.status !== "active") {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}

export async function getSchoolAccessContext(
  schoolId: string,
  accessToken: string,
) {
  try {
    const rows = await supabaseRequest<SchoolAccessContext[]>(
      "/rest/v1/rpc/get_school_access_context",
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({ p_school_id: schoolId }),
      },
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getMySchoolContexts(accessToken: string) {
  try {
    return await supabaseRequest<SchoolSwitcherItem[]>(
      "/rest/v1/rpc/get_my_school_contexts",
      accessToken,
      { method: "POST", body: "{}" },
    );
  } catch {
    return [];
  }
}

export async function canViewSchoolAdministration(
  schoolId: string,
  accessToken: string,
) {
  try {
    return await supabaseRequest<boolean>(
      "/rest/v1/rpc/can_view_school_administration",
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({ p_school_id: schoolId }),
      },
    );
  } catch {
    return false;
  }
}

export async function getSchoolInviteEmailContext(
  schoolId: string,
  accessToken: string,
  invitationId?: string,
): Promise<SchoolInviteEmailContext | null> {
  try {
    const schools = await supabaseRequest<Array<{ name: string; school_code: string }>>(
      `/rest/v1/schools?id=eq.${encodeURIComponent(schoolId)}&select=name,school_code`,
      accessToken,
    );
    const school = schools[0];
    if (!school) return null;

    if (!invitationId) {
      return { schoolName: school.name, schoolCode: school.school_code };
    }

    const invitations = await supabaseRequest<Array<{ email: string; role: string }>>(
      `/rest/v1/school_invitations?id=eq.${encodeURIComponent(invitationId)}&school_id=eq.${encodeURIComponent(schoolId)}&status=eq.pending&select=email,role`,
      accessToken,
    );
    const invitation = invitations[0];
    if (!invitation) return null;

    return {
      schoolName: school.name,
      schoolCode: school.school_code,
      email: invitation.email,
      role: invitation.role,
    };
  } catch (error) {
    console.error("[school-staff-email] Could not load invitation context", error);
    return null;
  }
}

async function getSchoolStudentDirectory(
  schoolId: string,
  accessToken: string,
) {
  return supabaseRequest<SchoolHomeSnapshot["students"]>(
    "/rest/v1/rpc/get_school_student_directory",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({ p_school_id: schoolId }),
    },
  );
}

async function recordSchoolPreviewAccess(
  schoolId: string,
  accessToken: string,
) {
  try {
    await supabaseRequest<number>("/rest/v1/rpc/record_school_access", accessToken, {
      method: "POST",
      body: JSON.stringify({
        p_school_id: schoolId,
        p_surface: "school_platform_preview",
      }),
    });
    return true;
  } catch {
    return false;
  }
}

export async function requireSchoolPreviewAccess(
  schoolId: string,
  providedAccessToken = "",
) {
  if (!isSchoolPlatformPreviewEnabled()) return null;

  const accessToken = providedAccessToken.trim() || (await getSchoolPreviewToken());
  const [user, school] = await Promise.all([
    verifyAdultAccessToken(accessToken),
    getSchoolAccessContext(schoolId, accessToken),
  ]);
  if (!user) return null;
  if (!school) return null;
  if (!(await recordSchoolPreviewAccess(schoolId, accessToken))) return null;

  return { user, school, accessToken };
}

export async function loadSchoolHomePreview(schoolId: string) {
  if (!isSchoolPlatformPreviewEnabled()) return null;

  const accessToken = await getSchoolPreviewToken();
  const [user, school] = await Promise.all([
    verifyAdultAccessToken(accessToken),
    getSchoolAccessContext(schoolId, accessToken),
  ]);
  if (!user || !school) return null;

  try {
    // The audit write is still mandatory, but it does not need to form a
    // separate network waterfall before the read-only home snapshot begins.
    const [accessRecorded, snapshot, schools, canViewAdministration] = await Promise.all([
      recordSchoolPreviewAccess(schoolId, accessToken),
      supabaseRequest<SchoolHomeSnapshot>(
        "/rest/v1/rpc/get_school_home_snapshot",
        accessToken,
        {
          method: "POST",
          body: JSON.stringify({ p_school_id: schoolId }),
        },
      ),
      getMySchoolContexts(accessToken),
      canViewSchoolAdministration(schoolId, accessToken),
    ]);
    if (!accessRecorded) return null;
    return {
      user,
      school,
      snapshot: {
        ...snapshot,
        permissions: {
          ...snapshot.permissions,
          canViewAdministration,
          isLeadingTeacher:
            snapshot.actor.role === "teacher" && canViewAdministration,
        },
        // The school-wide directory is only needed by the Students tab. It is
        // loaded on demand so it cannot delay the School Home LCP.
        students: [],
        studentDirectoryError: null,
      },
      schools,
    };
  } catch {
    return null;
  }
}

export async function loadSchoolStudentDirectoryPreview(
  schoolId: string,
  accessToken = "",
) {
  const access = await requireSchoolPreviewAccess(schoolId, accessToken);
  if (!access) return null;

  try {
    return await getSchoolStudentDirectory(schoolId, access.accessToken);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The school student directory could not be loaded.";
    console.error("[SchoolHome] Unable to load the canonical student directory", error);
    throw new Error(message);
  }
}

export async function loadSchoolAnalyticsSnapshot(
  schoolId: string,
  academicYearId: string,
  filters: {
    days?: number;
    yearLevel?: string | null;
    classId?: string | null;
    realmId?: string | null;
  } = {},
  accessToken = "",
) {
  const access = await requireSchoolPreviewAccess(schoolId, accessToken);
  if (!access) return null;

  const snapshot = await supabaseRequest<SchoolAnalyticsSnapshot>(
    "/rest/v1/rpc/get_school_analytics_snapshot",
    access.accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        p_school_id: schoolId,
        p_academic_year_id: academicYearId,
        p_days: filters.days ?? 30,
        p_year_level: filters.yearLevel || null,
        p_class_id: filters.classId || null,
        p_realm_id: filters.realmId || null,
      }),
    },
  );

  return enrichCurriculumWithStandards(snapshot);
}

export async function loadStudentLearningJourney(
  schoolId: string,
  studentId: string,
  accessToken = "",
) {
  const access = await requireSchoolPreviewAccess(schoolId, accessToken);
  if (!access) return null;

  return supabaseRequest<StudentLearningJourney>(
    "/rest/v1/rpc/get_student_learning_journey",
    access.accessToken,
    {
      method: "POST",
      body: JSON.stringify({ p_school_id: schoolId, p_student_id: studentId }),
    },
  );
}

// Attach AC9 strand + achievement band to each curriculum evidence row. This is
// derived (not persisted): strand comes from the realm the evidence belongs to,
// the band from observed accuracy against the shared thresholds. Degrades
// gracefully if an older RPC omits `realmId`.
function enrichCurriculumWithStandards(
  snapshot: SchoolAnalyticsSnapshot | null,
): SchoolAnalyticsSnapshot | null {
  if (!snapshot?.curriculum) return snapshot;
  snapshot.curriculum = snapshot.curriculum.map((row) => {
    const strand: AcStrand | null =
      row.strand ?? strandForRealm(row.realmId ?? null);
    return {
      ...row,
      realmId: row.realmId ?? null,
      strand,
      strandLabel: strand ? AC_STRANDS[strand].label : null,
      band: row.band ?? bandFor(row.averageAccuracy),
    };
  });
  return snapshot;
}

export async function loadSchoolLicenceSummaries(schoolId: string) {
  const access = await requireSchoolPreviewAccess(schoolId);
  if (!access) return null;

  return supabaseRequest<SchoolLicenceSummary[]>(
    "/rest/v1/rpc/get_school_licence_summaries",
    access.accessToken,
    {
      method: "POST",
      body: JSON.stringify({ p_school_id: schoolId }),
    },
  );
}

export async function runSchoolCommand<T>(
  schoolId: string,
  rpc: string,
  body: Record<string, unknown>,
  providedAccessToken = "",
) {
  if (!isSchoolPlatformPreviewEnabled()) {
    throw new Error("School platform preview is disabled");
  }

  const accessToken = providedAccessToken.trim() || (await getSchoolPreviewToken());
  const user = await verifyAdultAccessToken(accessToken);
  if (!user) throw new Error("Active adult account required");

  const school = await getSchoolAccessContext(schoolId, accessToken);
  if (!school) throw new Error("School access denied");

  return supabaseRequest<T>(`/rest/v1/rpc/${rpc}`, accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function runAuthenticatedCommand<T>(
  rpc: string,
  body: Record<string, unknown>,
  providedAccessToken = "",
) {
  if (!isSchoolPlatformPreviewEnabled()) {
    throw new Error("School platform preview is disabled");
  }

  const accessToken = providedAccessToken.trim() || (await getSchoolPreviewToken());
  const user = await verifyAdultAccessToken(accessToken);
  if (!user) throw new Error("Active adult account required");

  return supabaseRequest<T>(`/rest/v1/rpc/${rpc}`, accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
