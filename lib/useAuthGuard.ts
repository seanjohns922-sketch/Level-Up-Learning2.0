"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { recoverInvalidRefreshToken, supabase } from "@/lib/supabase";
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
    let initialSessionResolved = false;
    let redirecting = false;

    const applyAuthenticatedUser = (nextUser: User) => {
      setUser(nextUser);
      setLoading(false);
    };

    const redirectToLogin = async () => {
      if (cancelled || redirecting) return;
      redirecting = true;

      try {
        const { data, error } = await supabase.auth.getSession();
        if (cancelled) return;
        if (error) throw error;

        if (data.session?.user) {
          applyAuthenticatedUser(data.session.user);
          return;
        }

        setUser(null);
        setLoading(false);
        router.replace("/login");
      } catch (error) {
        if (cancelled) return;
        recoverInvalidRefreshToken(error);
        setUser(null);
        setLoading(false);
        router.replace("/login");
      } finally {
        redirecting = false;
      }
    };

    // Resolve the session before reacting to transient null auth events.
    void supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (cancelled) return;
        if (error) throw error;

        if (data.session?.user) {
          applyAuthenticatedUser(data.session.user);
          return;
        }

        // Preview/deploy environments can race local-storage hydration.
        // Double-check with getUser() before deciding there is no session.
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (cancelled) return;
        if (userError) throw userError;

        if (userData.user) {
          applyAuthenticatedUser(userData.user);
          return;
        }

        setUser(null);
        setLoading(false);
        router.replace("/login");
      })
      .catch((error) => {
        if (cancelled) return;
        recoverInvalidRefreshToken(error);
        setUser(null);
        setLoading(false);
        router.replace("/login");
      })
      .finally(() => {
        initialSessionResolved = true;
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        applyAuthenticatedUser(session.user);
      } else {
        if (!initialSessionResolved) return;
        void redirectToLogin();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  return { user, loading };
}
