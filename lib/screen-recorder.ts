"use client";

/**
 * Live screen capture is suspended following the October 2026 privacy review.
 * Do not restore public Realtime broadcasting. Reintroduction requires a
 * verified student publisher / authorised teacher viewer boundary, explicit
 * capture scope and masking, lifecycle tests, and a retention decision.
 * See docs/SCREEN_RECORDING_REVIEW.md. This compatibility entry point is inert.
 */
export function startScreenRecording(_studentId: string, _classId: string): () => void {
  void _studentId;
  void _classId;
  return () => {};
}
