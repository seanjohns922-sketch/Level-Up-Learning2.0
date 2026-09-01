"use client";

import { resolveContinueLearningRoute } from "@/lib/continue-learning";

export type WorldJourney = {
  route: string;
  realmName: string;
  activityLabel: string;
};

function realmNameFor(url: URL) {
  if (url.pathname.startsWith("/starpath")) return "Starpath";
  if (url.searchParams.get("realm_id") === "measurement" || url.pathname.startsWith("/measurelands")) return "Measurelands";
  if (url.searchParams.get("realm_id") === "statistics" || url.pathname.startsWith("/statistica")) return "Statistica";
  if (url.pathname === "/realms") return "Choose a realm";
  return "Number Nexus";
}

function activityLabelFor(url: URL) {
  const year = url.searchParams.get("year")?.replace(/^Year\s+/i, "Level ") ?? "";
  const week = url.searchParams.get("week");
  const lesson = url.searchParams.get("n");
  const type = url.searchParams.get("type");
  const parts = [year, week ? `Week ${week}` : ""];
  if (type === "quiz") parts.push("Weekly Quiz");
  else if (lesson) parts.push(`Lesson ${lesson}`);
  const label = parts.filter(Boolean).join(" · ");
  return label || (url.pathname === "/realms" ? "Select your next world" : "Continue your current journey");
}

export async function resolveWorldJourney(): Promise<WorldJourney> {
  const route = await resolveContinueLearningRoute();
  const url = new URL(route, "https://level-up-learning.local");
  return {
    route,
    realmName: realmNameFor(url),
    activityLabel: activityLabelFor(url),
  };
}
