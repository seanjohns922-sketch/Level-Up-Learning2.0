"use client";
// Into a friend's page (/world/friend?id=…): who you are from this device's explorer; the server checks you
// really are friends. Demo and teacher-preview sessions show the pretend friends.
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { isDemoPreviewMode } from "@/lib/demo-mode";
import { getActiveStudentProfile } from "@/lib/studentIdentity";
import { FriendPage } from "./FriendPage";

export default function FriendPageEntry() {
  const router = useRouter();
  const params = useSearchParams();
  const [setup] = useState(() => ({
    friendId: params.get("id"),
    demo: params.get("teacher_preview") === "1" || isDemoPreviewMode(),
    student: getActiveStudentProfile(),
  }));
  const { friendId, demo, student } = setup;
  const allowed = Boolean(friendId) && (demo || Boolean(student?.studentId));

  useEffect(() => {
    if (!friendId) router.replace(demo ? "/world?teacher_preview=1&friends=1" : "/world?friends=1");
    else if (!allowed) router.replace("/login");
  }, [friendId, allowed, demo, router]);

  if (!friendId || !allowed) return null;
  return <FriendPage friendId={friendId} studentId={demo ? null : student?.studentId ?? null} demo={demo} />;
}
