"use client";

import { ACTIVE_STUDENT_KEY, clearScopedProgress } from "@/data/progress";
import { clearLegacyBestChainStorage } from "@/lib/best-chain";
import { clearScopedProgramStore } from "@/lib/program-progress";

const LEGACY_STUDENT_ID_KEY = "lul_student_id";
const LEGACY_CLASS_ID_KEY = "lul_class_id";
export const ACTIVE_STUDENT_PROFILE_KEY = "lul_active_student_profile_v1";
export const STUDENT_SESSION_TOKEN_KEY = "lul_student_session_token_v1";

export type ActiveStudentProfile = {
  studentId: string;
  classId?: string | null;
  displayName?: string | null;
  yearLevel?: string | null;
};

export function getActiveStudentIdentity() {
  if (typeof window === "undefined") {
    return { studentId: null, classId: null };
  }

  const studentId =
    localStorage.getItem(ACTIVE_STUDENT_KEY) ??
    localStorage.getItem(LEGACY_STUDENT_ID_KEY);
  const classId = localStorage.getItem(LEGACY_CLASS_ID_KEY);
  return {
    studentId: studentId?.trim() || null,
    classId: classId?.trim() || null,
  };
}

export function getActiveStudentProfile(): ActiveStudentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_STUDENT_PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ActiveStudentProfile>;
    if (!parsed?.studentId) return null;
    return {
      studentId: parsed.studentId,
      classId: parsed.classId ?? null,
      displayName: parsed.displayName ?? null,
      yearLevel: parsed.yearLevel ?? null,
    };
  } catch {
    return null;
  }
}

export function getStudentIntroSeenKey(studentId?: string | null) {
  const resolvedStudentId = studentId ?? getActiveStudentIdentity().studentId;
  return `lul:${resolvedStudentId ?? "anon"}:intro_seen_v1`;
}

export function hasActiveStudentSeenIntro(studentId?: string | null) {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getStudentIntroSeenKey(studentId)) === "1";
}

export function markActiveStudentIntroSeen(studentId?: string | null) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStudentIntroSeenKey(studentId), "1");
}

export function clearActiveStudentSession() {
  if (typeof window === "undefined") return;
  clearLegacyBestChainStorage();
  localStorage.removeItem(ACTIVE_STUDENT_KEY);
  localStorage.removeItem(ACTIVE_STUDENT_PROFILE_KEY);
  localStorage.removeItem(STUDENT_SESSION_TOKEN_KEY);
  localStorage.removeItem(LEGACY_STUDENT_ID_KEY);
  localStorage.removeItem(LEGACY_CLASS_ID_KEY);
}

export function setStudentSessionToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STUDENT_SESSION_TOKEN_KEY, token);
}

export function getStudentSessionToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STUDENT_SESSION_TOKEN_KEY)?.trim() || null;
}

export function getPlacementEntryYear() {
  const profile = getActiveStudentProfile();
  return profile?.yearLevel?.trim() || "Year 1";
}

export function setActiveStudentProfile(
  studentId: string,
  classId?: string | null,
  profile?: { displayName?: string | null; yearLevel?: string | null }
) {
  if (typeof window === "undefined") return;
  clearLegacyBestChainStorage();
  localStorage.setItem(ACTIVE_STUDENT_KEY, studentId);
  localStorage.setItem(LEGACY_STUDENT_ID_KEY, studentId);
  if (classId) localStorage.setItem(LEGACY_CLASS_ID_KEY, classId);
  const nextProfile: ActiveStudentProfile = {
    studentId,
    classId: classId ?? null,
    displayName: profile?.displayName?.trim() || null,
    yearLevel: profile?.yearLevel?.trim() || null,
  };
  localStorage.setItem(ACTIVE_STUDENT_PROFILE_KEY, JSON.stringify(nextProfile));
}

export function switchActiveStudentProfile(studentId: string, classId?: string | null) {
  clearScopedProgress();
  clearScopedProgramStore();
  setActiveStudentProfile(studentId, classId);
}
