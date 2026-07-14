"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Retired: the vertical level-floors "Tower". In realm-first navigation the
// realm selector IS the Tower of Knowledge, and level revisiting lives in the
// in-realm "Levels" drawer. Kept as a redirect so old links still resolve.
export default function TowerRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/realms");
  }, [router]);

  return <main className="min-h-screen" style={{ background: "#0a0814" }} />;
}
