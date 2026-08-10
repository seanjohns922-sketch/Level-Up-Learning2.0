import { cookies } from "next/headers";

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

export async function requireSchoolPreviewAccess(schoolId: string) {
  if (!isSchoolPlatformPreviewEnabled()) return null;

  const accessToken = await getSchoolPreviewToken();
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
  const access = await requireSchoolPreviewAccess(schoolId);
  if (!access) return null;

  const { accessToken, ...accessContext } = access;
  try {
    const [snapshot, schools, canViewAdministration, studentDirectory] = await Promise.all([
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
      getSchoolStudentDirectory(schoolId, accessToken)
        .then((students) => ({ students, error: null as string | null }))
        .catch((error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : "The school student directory could not be loaded.";
          console.error(
            "[SchoolHome] Unable to load the canonical student directory",
            error,
          );
          return { students: [], error: message };
        }),
    ]);
    return {
      ...accessContext,
      snapshot: {
        ...snapshot,
        permissions: {
          ...snapshot.permissions,
          canViewAdministration,
          isLeadingTeacher:
            snapshot.actor.role === "teacher" && canViewAdministration,
        },
        students: studentDirectory.students,
        studentDirectoryError: studentDirectory.error,
      },
      schools,
    };
  } catch {
    return null;
  }
}

export async function runSchoolCommand<T>(
  schoolId: string,
  rpc: string,
  body: Record<string, unknown>,
) {
  if (!isSchoolPlatformPreviewEnabled()) {
    throw new Error("School platform preview is disabled");
  }

  const accessToken = await getSchoolPreviewToken();
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
) {
  if (!isSchoolPlatformPreviewEnabled()) {
    throw new Error("School platform preview is disabled");
  }

  const accessToken = await getSchoolPreviewToken();
  const user = await verifyAdultAccessToken(accessToken);
  if (!user) throw new Error("Active adult account required");

  return supabaseRequest<T>(`/rest/v1/rpc/${rpc}`, accessToken, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
