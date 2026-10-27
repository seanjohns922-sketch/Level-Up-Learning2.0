"use client";

import { useState, useSyncExternalStore } from "react";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { getXpAward, subscribeXpAward, type XpAwardKind } from "@/lib/xp-award-store";
import { LESSON_XP, QUIZ_PASS_XP } from "@/lib/xp-rules";

/** The XP a finish screen should show: what the save actually banked. Until the
 *  save reports back it shows the rule ("+40 XP for finishing"); a replay shows
 *  "already earned"; Demo shows that nothing is saved. */
export function useBankedXp(kind: XpAwardKind) {
  const [mountedAt] = useState(() => Date.now());
  const demo = useDemoPreviewMode();
  const award = useSyncExternalStore(subscribeXpAward, getXpAward, () => null);
  const full = kind === "lesson" ? LESSON_XP : QUIZ_PASS_XP;
  // Ignore a result left over from an earlier lesson or quiz.
  const fresh = award && award.kind === kind && award.at >= mountedAt - 15_000 ? award : null;

  if (demo) return { value: "—", label: "Demo · XP not saved", spoken: "This is a demo, so no X P is saved.", banked: 0 };
  if (fresh?.status === "done" && fresh.xp > 0) return { value: `+${fresh.xp}`, label: "XP earned", spoken: `You earned ${fresh.xp} X P.`, banked: fresh.xp };
  if (fresh?.status === "done") return { value: "✓", label: "XP already earned", spoken: "You already earned the X P for this one.", banked: 0 };
  if (fresh?.status === "failed") return { value: "…", label: "XP not saved yet", spoken: "Your X P has not saved yet.", banked: 0 };
  return { value: `+${full}`, label: kind === "lesson" ? "XP for finishing" : "XP for passing", spoken: `Finishing earns ${full} X P.`, banked: 0 };
}
