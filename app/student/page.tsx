"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function StudentQRPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbf7f1] flex items-center justify-center">
          <p className="text-gray-400">Loading…</p>
        </div>
      }
    >
      <StudentQRPage />
    </Suspense>
  );
}

function StudentQRPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const code = searchParams.get("code");

  useEffect(() => {
    // Legacy QR tokens: redirect to login, no code pre-fill
    if (code) {
      router.replace(`/login?code=${encodeURIComponent(code)}`);
    } else {
      router.replace("/login");
    }
  }, [router, code, token]);

  return (
    <div className="min-h-screen bg-[#fbf7f1] flex items-center justify-center">
      <p className="text-gray-400">Redirecting…</p>
    </div>
  );
}
