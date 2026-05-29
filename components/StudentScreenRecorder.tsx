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
    let stopRecording: (() => void) | null = null;
    let activeKey: string | null = null;

    const syncRecorder = () => {
      const { studentId, classId } = getActiveStudentIdentity();
      const nextKey = studentId ? `${studentId}:${classId ?? ""}` : null;

      if (nextKey === activeKey) return;

      if (stopRecording) {
        stopRecording();
        stopRecording = null;
      }

      activeKey = nextKey;

      if (!studentId) return;
      stopRecording = startScreenRecording(studentId, classId ?? "");
    };

    syncRecorder();

    const pollTimer = window.setInterval(syncRecorder, 1000);
    const handleFocus = () => syncRecorder();
    const handleStorage = () => syncRecorder();

    window.addEventListener("focus", handleFocus);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearInterval(pollTimer);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      if (stopRecording) stopRecording();
    };
  }, []);

  return null;
}
