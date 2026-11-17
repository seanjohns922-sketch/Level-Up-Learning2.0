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

/** Pages opened from a treehouse room (collections, wardrobe, shop) carry where to come back to. */
export type TreehouseLinkedPage = "/gem-vault" | "/legends" | "/wardrobe" | "/marketplace";
export function pageFromTreehouseHref(page: TreehouseLinkedPage, room: TreehouseRoomParam, preview = false) {
  const params = new URLSearchParams({ from: "treehouse", room });
  if (preview) params.set("teacher_preview", "1");
  return `${page}?${params.toString()}`;
}

/**
 * The painting outside the treehouse window for each home skin: a light copy
 * (about 350 KB) in /images/treehouse-views, since the original skin art is
 * 8–9 MB and made the room slow to appear. Aurora has its own repainted view.
 * A skin without a light copy yet shows its original art.
 */
const WINDOW_VIEW_FILES: Record<string, string> = {
  "aurora-mountain-cabin": "aurora",
  "ancient-hall-of-explorers": "ancient-hall-of-explorers",
  "crystal-observatory": "crystal-observatory",
  "enchanted-forest-clearing": "enchanted-forest-clearing",
  "explorer-study": "explorer-study",
  "floating-sky-sanctuary": "floating-sky-sanctuary",
  "grand-explorer-lodge": "grand-explorer-lodge",
  "hall-of-infinite-portals": "hall-of-infinite-portals",
  "hidden-waterfall-retreat": "hidden-waterfall-retreat",
};
export const DEFAULT_WINDOW_VIEW = "/images/treehouse-views/aurora.jpg";

export function treehouseWindowView(themeImage: string | undefined) {
  if (!themeImage) return DEFAULT_WINDOW_VIEW;
  const name = themeImage.split("/").pop()?.replace(/\.[a-z]+$/i, "") ?? "";
  const file = WINDOW_VIEW_FILES[name];
  return file ? `/images/treehouse-views/${file}.jpg` : themeImage;
}
