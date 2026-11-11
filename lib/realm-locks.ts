"use client";

// Realm access: teachers lock realms for individual students (Placements >
// Realm access); locked realms stay shut at school and at home. See
// supabase/migrations/20261111140000_student_realm_locks.sql.

import { supabase } from "@/lib/supabase";
import { getActiveStudentIdentity } from "@/lib/studentIdentity";
import { tryCanonicalRealmId } from "@/lib/realms/realm-registry";

export type RealmLock = { studentId: string; realmId: string };
export type RealmLockChange = RealmLock & { locked: boolean };

export async function fetchClassRealmLocks(classId: string): Promise<RealmLock[]> {
  const { data, error } = await supabase.rpc("teacher_get_realm_locks", { p_class_id: classId });
  if (error) throw new Error(error.message);
  return (data as RealmLock[] | null) ?? [];
}

export async function saveClassRealmLocks(classId: string, changes: RealmLockChange[]): Promise<RealmLock[]> {
  const { data, error } = await supabase.rpc("teacher_set_realm_locks", { p_class_id: classId, p_changes: changes });
  if (error) throw new Error(error.message);
  return (data as RealmLock[] | null) ?? [];
}

/** The signed-in student's locked realms (canonical ids). A failed lookup never
 * blocks a student: it returns no locks. */
export async function getStudentRealmLocks(studentId?: string | null): Promise<string[]> {
  const resolvedId = studentId?.trim() || getActiveStudentIdentity().studentId;
  if (!resolvedId) return [];
  try {
    const { data, error } = await supabase.rpc("get_student_realm_locks", { p_student_id: resolvedId });
    if (error || !Array.isArray(data)) return [];
    return (data as string[]).map((id) => tryCanonicalRealmId(id)).filter((id): id is NonNullable<typeof id> => Boolean(id));
  } catch {
    return [];
  }
}

export function isRealmLocked(locks: string[], realmId: string | null | undefined) {
  const canonical = realmId ? tryCanonicalRealmId(realmId) : null;
  return Boolean(canonical && locks.includes(canonical));
}
