"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import World3DUnavailable from "@/components/world3d/World3DUnavailable";
import { resolveRealm3DAccess, type Realm3DAccessDecision } from "@/lib/world3d/access";
import type { TreehouseRoomParam } from "@/lib/world3d/treehouse-navigation";

const TreehouseInterior = dynamic(() => import("@/components/world3d/treehouse/TreehouseInterior"), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center bg-[#120c08] font-bold text-amber-100">Climbing into your treehouse...</div>,
});

/** Same gate as the hub: preview needs no sign-in; students sign in first. */
export default function Treehouse3DEntry({ room, teacherPreview = false }: { room: TreehouseRoomParam; teacherPreview?: boolean }) {
  const router = useRouter();
  const storedPreview = useDemoPreviewMode();
  const preview = teacherPreview || storedPreview;
  const [gate] = useState<{ signedIn: boolean; access: Realm3DAccessDecision }>(() => {
    const profile = getActiveStudentProfile();
    return {
      signedIn: Boolean(profile?.studentId),
      access: resolveRealm3DAccess({ realmId: "number", classId: profile?.classId, studentId: profile?.studentId }),
    };
  });

  useEffect(() => {
    if (!preview && !gate.signedIn) router.replace("/login");
  }, [gate.signedIn, preview, router]);

  if (!gate.access.canExplore3D) return <World3DUnavailable place="Your treehouse" reason={gate.access.reason} background="#120c08" />;
  return preview || gate.signedIn ? <TreehouseInterior initialRoom={room} preview={preview} /> : null;
}
