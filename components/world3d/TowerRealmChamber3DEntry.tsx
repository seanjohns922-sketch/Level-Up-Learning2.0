"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { resolveRealm3DAccess } from "@/lib/world3d/access";
import { restoreCanonicalWorldState } from "@/lib/world3d/canonical-bootstrap";
import { StudentRestoreSupersededError } from "@/lib/student-progress-sync";

const TowerRealmChamber = dynamic(() => import("@/components/world3d/TowerRealmChamber"), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center bg-[#211815] font-bold text-amber-100">Entering the Tower...</div>,
});

export default function TowerRealmChamber3DEntry({ teacherPreview = false }: { teacherPreview?: boolean }) {
  const router = useRouter();
  const storedPreview = useDemoPreviewMode();
  const preview = teacherPreview || storedPreview;
  const [access] = useState(() => {
    const profile = getActiveStudentProfile();
    return resolveRealm3DAccess({ realmId: "number", classId: profile?.classId, studentId: profile?.studentId, respectReducedMotion: false });
  });
  const [status, setStatus] = useState<"loading" | "ready" | "error">(preview || !access.canExplore3D ? "ready" : "loading");

  useEffect(() => {
    if (preview || !access.canExplore3D) return;
    const profile = getActiveStudentProfile();
    if (!profile?.studentId) { router.replace("/login"); return; }
    let cancelled = false;
    const restore = async () => {
      try {
        await restoreCanonicalWorldState(profile.studentId);
        if (!cancelled) setStatus("ready");
      } catch (error) {
        if (cancelled || error instanceof StudentRestoreSupersededError) return;
        console.warn("[Tower3D] Canonical restore failed", error);
        setStatus("error");
      }
    };
    void restore();
    const onFocus = () => { void restore(); };
    window.addEventListener("focus", onFocus);
    return () => { cancelled = true; window.removeEventListener("focus", onFocus); };
  }, [access.canExplore3D, preview, router]);

  if (!access.canExplore3D && !preview) {
    return <main className="grid min-h-screen place-items-center bg-[#211815] p-6 text-center text-white"><div><h1 className="text-2xl font-black">The 3D Tower is not available</h1><p className="mt-2 text-white/70">The standard Realm selector is still ready.</p><button type="button" onClick={() => router.push("/realms")} className="mt-5 rounded-md bg-amber-300 px-5 py-3 font-black text-stone-900">Open Realms</button></div></main>;
  }
  if (status === "loading") return <div className="grid min-h-screen place-items-center bg-[#211815] font-bold text-amber-100">Restoring realm progress...</div>;
  if (status === "error") return <main className="grid min-h-screen place-items-center bg-[#211815] p-6 text-center text-white"><div><h1 className="text-2xl font-black">The Tower could not load</h1><button type="button" onClick={() => router.push("/realms")} className="mt-5 rounded-md bg-amber-300 px-5 py-3 font-black text-stone-900">Open Realms</button></div></main>;
  return <TowerRealmChamber />;
}
