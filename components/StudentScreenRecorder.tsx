"use client";

import { useEffect } from "react";
import { getActiveStudentIdentity } from "@/lib/studentIdentity";
import { startScreenRecording } from "@/lib/screen-recorder";

/**
 * Invisible component — mounts in the root layout and silently records
 * the student's in-app activity for the live teacher screen view.
 * Only activates when an active student identity exists in localStorage.
 * Does NOT capture anything outside the Level Up Learning tab.
 */
export default function StudentScreenRecorder() {
  useEffect(() => {
    const { studentId, classId } = getActiveStudentIdentity();
    if (!studentId || !classId) return;
    return startScreenRecording(studentId, classId);
  }, []);

  return null;
}
