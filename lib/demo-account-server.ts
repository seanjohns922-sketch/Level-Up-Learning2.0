import "server-only";

import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabase-config";

type SupabaseAuthUser = {
  id: string;
  email?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

export type DemoAccountIdentity = {
  userId: string;
  email: string | null;
  displayName: string;
};

function metadataString(metadata: Record<string, unknown> | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" ? value.trim() : "";
}

export async function verifyDemoAccountToken(
  accessToken: string,
): Promise<DemoAccountIdentity | null> {
  const token = accessToken.trim();
  if (!token) return null;

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      cache: "no-store",
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return null;

    const user = (await response.json()) as SupabaseAuthUser;
    if (user.app_metadata?.demo_access !== true) return null;

    const displayName =
      metadataString(user.user_metadata, "display_name") ||
      metadataString(user.user_metadata, "name") ||
      "Demo Preview";

    return {
      userId: user.id,
      email: user.email?.trim() || null,
      displayName,
    };
  } catch {
    return null;
  }
}
