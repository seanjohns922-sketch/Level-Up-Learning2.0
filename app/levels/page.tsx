"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Retired: the Choose-Your-Path level picker. Realm-first navigation means the
// realm is the primary choice and each realm resolves its own level, so this
// route now just forwards to the Tower of Knowledge (the realm selector). Kept
// as a redirect so old bookmarks / links still resolve.
export default function LevelsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/realms");
  }, [router]);

  return <main className="min-h-screen bg-black" />;
}
