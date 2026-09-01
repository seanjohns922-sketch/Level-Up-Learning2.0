"use client";

// Focus Mode client helpers. A teacher can pin a whole class to one realm for a
// window and flip a "Class in session" switch; the lock only bites while that
// switch is engaged and we are inside the window. Enforcement is server-computed
// (see supabase/migrations/20260901120000_class_realm_focus.sql) — these helpers
// only relay what the teacher-controlled row implies. Students never self-unlock.

import { supabase } from "@/lib/supabase";
import { getActiveStudentIdentity } from "@/lib/studentIdentity";
import { tryCanonicalRealmId } from "@/lib/realms/realm-registry";

// The active lock a student is currently subject to. null = free roam.
export type StudentFocusLock = {
  // canonical realm id the class is locked to (e.g. "number").
  focusRealmId: string;
  endsAt: string | null;
  active: true;
};

// The teacher-side focus config for a class (regardless of engaged state).
export type ClassFocus = {
  focusRealmId: string;
  startsAt: string | null;
  endsAt: string | null;
  engaged: boolean;
  engagedAt: string | null;
  updatedAt: string | null;
};

// Read the ACTIVE lock for the signed-in student. Returns null when nothing is
// engaged/in-window (the common case, including at home), or on any failure —
// Focus Mode must never hard-block a student if the lookup itself breaks.
export async function getStudentFocusLock(
  studentId?: string | null,
): Promise<StudentFocusLock | null> {
  const resolvedId = studentId?.trim() || getActiveStudentIdentity().studentId;
  if (!resolvedId) return null;

  try {
    const { data, error } = await supabase.rpc("get_student_focus_lock", {
      p_student_id: resolvedId,
    });
    if (error || !data) return null;

    const focusRealmId = tryCanonicalRealmId(String((data as { focus_realm_id?: unknown }).focus_realm_id ?? ""));
    if (!focusRealmId) return null;

    return {
      focusRealmId,
      endsAt: ((data as { ends_at?: string | null }).ends_at ?? null) || null,
      active: true,
    };
  } catch {
    return null;
  }
}

// Does an active lock forbid this realm? Locked realms other than the focus are
// blocked; the focus realm (and anything with no lock) is always allowed.
export function isRealmBlockedByFocus(
  lock: StudentFocusLock | null,
  realmId: string | null | undefined,
): boolean {
  if (!lock || !realmId) return false;
  const canonical = tryCanonicalRealmId(realmId);
  if (!canonical) return false;
  return canonical !== lock.focusRealmId;
}

function parseClassFocus(data: unknown): ClassFocus | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  const focusRealmId = tryCanonicalRealmId(String(row.focus_realm_id ?? ""));
  if (!focusRealmId) return null;
  return {
    focusRealmId,
    startsAt: (row.starts_at as string | null) ?? null,
    endsAt: (row.ends_at as string | null) ?? null,
    engaged: row.engaged === true,
    engagedAt: (row.engaged_at as string | null) ?? null,
    updatedAt: (row.updated_at as string | null) ?? null,
  };
}

// Teacher: current focus config for a class (null when none set).
export async function getClassFocus(classId: string): Promise<ClassFocus | null> {
  const { data, error } = await supabase.rpc("get_class_focus", { p_class_id: classId });
  if (error) throw error;
  return parseClassFocus(data);
}

// Teacher: set / change the class focus realm and window.
export async function setClassFocus(
  classId: string,
  focusRealmId: string,
  endsAt: string | null,
): Promise<ClassFocus | null> {
  const canonical = tryCanonicalRealmId(focusRealmId) ?? focusRealmId;
  const { data, error } = await supabase.rpc("set_class_focus", {
    p_class_id: classId,
    p_focus_realm_id: canonical,
    p_ends_at: endsAt,
  });
  if (error) throw error;
  return parseClassFocus(data);
}

// Teacher: flip the "Class in session" switch.
export async function setClassEngaged(
  classId: string,
  engaged: boolean,
): Promise<ClassFocus | null> {
  const { data, error } = await supabase.rpc("set_class_engaged", {
    p_class_id: classId,
    p_engaged: engaged,
  });
  if (error) throw error;
  return parseClassFocus(data);
}

// Teacher: clear the focus entirely (unlock the class).
export async function clearClassFocus(classId: string): Promise<void> {
  const { error } = await supabase.rpc("clear_class_focus", { p_class_id: classId });
  if (error) throw error;
}
