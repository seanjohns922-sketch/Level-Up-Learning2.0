"use client";

import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { supabase } from "@/lib/supabase";

/** Hard cap on brain-break XP per break (also enforced server-side). */
export const BRAIN_BREAK_XP_CAP = 10;

/**
 * Award a small, capped brain-break reward to the Explorer economy wallet. This
 * is separate from the graded lesson score — it never touches completions or
 * canonical progression. Idempotent per `sourceKey` (a specific lesson-break),
 * so it cannot be farmed by replaying. Fails quietly (a brain break must never
 * block a lesson).
 */
export async function awardBrainBreakXp({ xp, sourceKey }: { xp: number; sourceKey: string }): Promise<void> {
  if (isDemoPreviewMode()) return;
  if (!sourceKey) return;
  const safe = Math.max(0, Math.min(BRAIN_BREAK_XP_CAP, Math.round(xp)));
  if (safe <= 0) return;
  const profile = getActiveStudentProfile();
  const studentId = profile?.studentId;
  if (!studentId) return;

  const { error } = await supabase.rpc("award_brain_break_xp_secure", {
    p_student_id: studentId,
    p_class_id: profile?.classId ?? null,
    p_xp: safe,
    p_source_key: sourceKey,
    p_metadata: {},
  });
  if (error) console.warn("[BrainBreakXp] award failed:", error);
}
