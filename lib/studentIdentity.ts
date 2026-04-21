"use client";

import { ACTIVE_STUDENT_KEY, clearScopedProgress } from "@/data/progress";
import { clearScopedProgramStore } from "@/lib/program-progress";

const LEGACY_STUDENT_ID_KEY = "lul_student_id";
const LEGACY_CLASS_ID_KEY = "lul_class_id";

export function setActiveStudentProfile(studentId: string, classId?: string | null) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_STUDENT_KEY, studentId);
  localStorage.setItem(LEGACY_STUDENT_ID_KEY, studentId);
  if (classId) localStorage.setItem(LEGACY_CLASS_ID_KEY, classId);
}

export function switchActiveStudentProfile(studentId: string, classId?: string | null) {
  clearScopedProgress();
  clearScopedProgramStore();
  setActiveStudentProfile(studentId, classId);
}

