"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { resolveRealm3DAccess } from "@/lib/world3d/access";
import type { TreehouseRoomParam } from "@/lib/world3d/treehouse-navigation";

const TreehouseInterior = dynamic(() => import("@/components/world3d/treehouse/TreehouseInterior"), {
  ssr: false,
  loading: () => <div className="grid min-h-screen place-items-center bg-[#120c08] font-bold text-amber-100">Climbing into your treehouse...</div>,
});

/** Same gate as the hub: preview needs no sign-in; students on 2D keep the classic home page. */
export default function Treehouse3DEntry({ room, teacherPreview = false }: { room: TreehouseRoomParam; teacherPreview?: boolean }) {
  const router = useRouter();
  const storedPreview = useDemoPreviewMode();
  const preview = teacherPreview || storedPreview;
  const [redirect] = useState<"/login" | "/home-base" | null>(() => {
    const profile = getActiveStudentProfile();
    if (!profile?.studentId) return "/login";
    const access = resolveRealm3DAccess({ realmId: "number", classId: profile.classId, studentId: profile.studentId, respectReducedMotion: true });
    return access.canExplore3D ? null : "/home-base";
  });

  useEffect(() => {
    if (!preview && redirect) router.replace(redirect);
  }, [preview, redirect, router]);

  return preview || !redirect ? <TreehouseInterior initialRoom={room} preview={preview} /> : null;
}
