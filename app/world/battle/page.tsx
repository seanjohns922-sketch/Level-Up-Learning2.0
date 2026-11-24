import { Suspense } from "react";
import BattleRoomEntry from "@/components/world3d/battle/BattleRoomEntry";

export default function BattleArenaPage() {
  return <Suspense fallback={null}><BattleRoomEntry /></Suspense>;
}
