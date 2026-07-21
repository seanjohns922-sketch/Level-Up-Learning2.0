"use client";

import { useEffect, useState } from "react";
import { DEMO_MODE } from "@/data/config";
import { isDemoPreviewMode } from "@/lib/demo-mode";

export function useAuthorizedDemoSession() {
  const [authorized, setAuthorized] = useState(DEMO_MODE);

  useEffect(() => {
    if (DEMO_MODE) return;
    if (!isDemoPreviewMode()) {
      Promise.resolve().then(() => setAuthorized(false));
      return;
    }

    let cancelled = false;
    void fetch("/api/demo-access", { method: "GET", cache: "no-store" })
      .then(async (response) => {
        const payload = response.ok
          ? await response.json() as { authorized?: boolean }
          : null;
        if (!cancelled) setAuthorized(payload?.authorized === true);
      })
      .catch(() => {
        if (!cancelled) setAuthorized(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return authorized;
}
