"use client";

import { useCallback, useEffect, useState } from "react";
import type { ClassGroup } from "@/lib/school-platform-server";

/** Class groups for one school year. Results are keyed by the request so a
 * year change shows loading without resetting state inside the effect. */
export function useClassGroups(schoolId: string, academicYearId: string) {
  const requestKey = `${schoolId}|${academicYearId}`;
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<{ key: string; groups: ClassGroup[] | null } | null>(null);

  useEffect(() => {
    if (!academicYearId) return;
    let cancelled = false;
    const params = new URLSearchParams({ academicYearId });
    fetch(`/api/school/${schoolId}/class-groups?${params}`, { credentials: "same-origin" })
      .then(async (response) => (response.ok ? ((await response.json()) as { groups: ClassGroup[] }).groups : null))
      .catch(() => null)
      .then((groups) => {
        if (!cancelled) setResult({ key: `${requestKey}|${version}`, groups });
      });
    return () => {
      cancelled = true;
    };
  }, [academicYearId, requestKey, schoolId, version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);
  const current = result?.key === `${requestKey}|${version}` ? result : null;
  return {
    groups: current?.groups ?? [],
    status: current ? (current.groups ? "ready" : "error") : "loading",
    reload,
  } as const;
}
