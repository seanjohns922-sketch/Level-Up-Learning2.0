"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

/**
 * Waits for the Supabase auth session to fully resolve before
 * making any redirect decisions. Prevents the preview from
 * bouncing to /login during HMR refreshes.
 *
 * Returns { user, loading }
 *  - loading = true  → session check in progress (show spinner)
 *  - loading = false, user = null → no session, already redirected
 *  - loading = false, user = User → authenticated
 */
export function useAuthGuard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // 1. Read cached session first (synchronous-ish, from localStorage)
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session?.user) {
        setUser(data.session.user);
        setLoading(false);
      }
      // If no cached session, don't redirect yet — wait for onAuthStateChange
    });

    // 2. Listen for the definitive auth event
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (cancelled) return;
        if (session?.user) {
          setUser(session.user);
          setLoading(false);
        } else {
          // Definitive: no session
          setUser(null);
          setLoading(false);
          router.push("/login");
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  return { user, loading };
}
