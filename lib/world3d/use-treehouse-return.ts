"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseTreehouseRoom, treehouseHref } from "./treehouse-navigation";

const ROOM_NAMES = { main: "Main room", gems: "Gem Cave", legends: "Hall of Legends" } as const;
const subscribe = () => () => {};

/** When a collection page was opened from a treehouse room, where Back should go. */
export function useTreehouseReturn() {
  const search = useSyncExternalStore(subscribe, () => window.location.search, () => "");
  return useMemo(() => {
    const params = new URLSearchParams(search);
    if (params.get("from") !== "treehouse") return null;
    const room = parseTreehouseRoom(params.get("room"));
    return { href: treehouseHref(room, params.get("teacher_preview") === "1"), label: `Back to the ${ROOM_NAMES[room]}` };
  }, [search]);
}
