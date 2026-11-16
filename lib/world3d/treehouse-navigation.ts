// Links in and out of the walk-in treehouse in the central hub.
import { CENTRAL_WORLD_ANCHORS } from "./central-world-config";

export type TreehouseRoomParam = "main" | "gems" | "legends";

export function parseTreehouseRoom(value: string | null | undefined): TreehouseRoomParam {
  return value === "gems" || value === "legends" ? value : "main";
}

export function treehouseHref(room: TreehouseRoomParam = "main", preview = false) {
  const params = new URLSearchParams();
  if (preview) params.set("teacher_preview", "1");
  if (room !== "main") params.set("room", room);
  const query = params.toString();
  return `/world/treehouse${query ? `?${query}` : ""}`;
}

/** Back outside: arrive at the treehouse door in the hub. */
export function treehouseExitHref(preview = false) {
  const params = new URLSearchParams();
  if (preview) params.set("teacher_preview", "1");
  params.set("spawn", CENTRAL_WORLD_ANCHORS.myHomeExitSpawn);
  return `/world?${params.toString()}`;
}

/** Full collection pages opened from a room carry where to come back to. */
export function collectionFromTreehouseHref(page: "/gem-vault" | "/legends", room: TreehouseRoomParam, preview = false) {
  const params = new URLSearchParams({ from: "treehouse", room });
  if (preview) params.set("teacher_preview", "1");
  return `${page}?${params.toString()}`;
}

/** Each skin's window painting. Skins without their new painting yet show their original art. */
const WINDOW_PAINTINGS: Record<string, string> = {
  "aurora-mountain-cabin": "/images/treehouse-views/aurora.jpg",
};
export const DEFAULT_WINDOW_VIEW = "/images/treehouse-views/aurora.jpg";

export function treehouseWindowView(themeImage: string | undefined) {
  if (!themeImage) return DEFAULT_WINDOW_VIEW;
  const name = themeImage.split("/").pop()?.replace(/\.[a-z]+$/i, "") ?? "";
  return WINDOW_PAINTINGS[name] ?? themeImage;
}
