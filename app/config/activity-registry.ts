import type { ComponentType } from "react";
import type { Difficulty } from "./lesson-config";

/**
 * Every activity component should accept a difficulty prop
 * and call onComplete when the student finishes the activity.
 */
export type ActivityComponentProps = {
  difficulty: Difficulty;
  onComplete: (result: { correct: boolean; answer?: string }) => void;
};

/**
 * Activity Registry
 *
 * Maps activityId strings (from lesson-config.ts allowedActivityIds)
 * to their React component implementations.
 *
 * Components are added here progressively as they are built.
 * Any activityId NOT in this registry will fall back to the
 * session runner's built-in question generators.
 */
export const ACTIVITY_REGISTRY: Record<string, ComponentType<ActivityComponentProps>> = {
  // ──────────────────────────────────────────────
  // Week 1 – Counting & Recognising Numbers to 50
  // ──────────────────────────────────────────────
  // W1L1_NumberID_MC:        (not yet implemented)
  // W1L1_NumberWordMatch:    (not yet implemented)
  // W1L1_QuickRead:          (not yet implemented)
  // W1L2_CountObjects:       (not yet implemented)
  // W1L2_CountCompare:       (not yet implemented)
  // W1L2_CountInOrder:       (not yet implemented)
  // W1L3_OrderNumbers:       (not yet implemented)
  // W1L3_MissingNumberLine:  (not yet implemented)
  // W1L3_TypeTheNumber:      (not yet implemented)

  // ──────────────────────────────────────────────
  // Week 2 – Place Value (Tens & Ones)
  // ──────────────────────────────────────────────
  // W2L1_BuildTheNumber_MAB: (not yet implemented)
  // W2L1_BreakApart_TensOnes:(not yet implemented)
  // W2L1_QuickTens:          (not yet implemented)
  // W2L2_WhichIsBigger:      (not yet implemented)
  // W2L2_TensFirst:          (not yet implemented)
  // W2L2_SameTens:           (not yet implemented)
  // W2L3_MatchBuildToNumber: (not yet implemented)
  // W2L3_NumberToTensOnes:   (not yet implemented)
  // W2L3_MixedPlaceValue:    (not yet implemented)

  // ──────────────────────────────────────────────
  // Weeks 3–12: Add mappings as components are built
  // ──────────────────────────────────────────────
};

/**
 * Check if a specific activity has a registered component
 */
export function hasActivityComponent(activityId: string): boolean {
  return activityId in ACTIVITY_REGISTRY;
}

/**
 * Get the component for an activity, or undefined if not yet implemented
 */
export function getActivityComponent(
  activityId: string
): ComponentType<ActivityComponentProps> | undefined {
  return ACTIVITY_REGISTRY[activityId];
}
