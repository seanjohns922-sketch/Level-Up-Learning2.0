import { Suspense } from "react";
import FriendPageEntry from "@/components/world3d/friends/FriendPageEntry";

export default function FriendProfilePage() {
  return <Suspense fallback={null}><FriendPageEntry /></Suspense>;
}
