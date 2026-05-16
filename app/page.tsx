"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ACTIVE_STUDENT_KEY, readProgress } from "@/data/progress";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function routeUser() {
      if (typeof window !== "undefined") {
        const activeStudentId = window.localStorage.getItem(ACTIVE_STUDENT_KEY)?.trim();
        const progress = readProgress();
        if (activeStudentId || progress) {
          if (!cancelled) router.replace("/home");
          return;
        }
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (error) throw error;

        if (data.session?.user) {
          router.replace("/teacher/dashboard");
          return;
        }
      } catch {
        // Fall through to login for anonymous visitors or failed session recovery.
      }

      if (!cancelled) router.replace("/login");
    }

    void routeUser();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fbf7f1]">
      <p className="text-gray-400">Loading…</p>
    </main>
  );
}
