// What a friend changed in someone's world, and undoing it. A friend's visit is saved as the world before
// they started and the world after; the owner may have built more since, so undo only reverses the
// friend's own changes and leaves everything else as it is. Pure, so it can be tested.
import type { CentralWorldGroundTile, CentralWorldPlacement } from "./central-world-layout";

export type WorldSnapshot = { placements: CentralWorldPlacement[]; groundTiles: CentralWorldGroundTile[] };

const placementKey = (placement: CentralWorldPlacement) => placement.placementId ?? `${placement.itemId}@${placement.gridX}:${placement.gridZ}`;
const tileKey = (tile: CentralWorldGroundTile) => `${tile.gridX}:${tile.gridZ}`;
const samePlacement = (a: CentralWorldPlacement, b: CentralWorldPlacement) => a.itemId === b.itemId && a.gridX === b.gridX && a.gridZ === b.gridZ && a.rotation === b.rotation;
const byKey = <T,>(list: readonly T[], key: (item: T) => string) => new Map(list.map((item) => [key(item), item]));

/** Counts for the owner's summary: things placed, moved and removed, and ground squares painted. */
export function summariseFriendChanges(before: WorldSnapshot, after: WorldSnapshot) {
  const was = byKey(before.placements, placementKey), now = byKey(after.placements, placementKey);
  let added = 0, moved = 0, removed = 0;
  for (const [key, placement] of now) {
    const old = was.get(key);
    if (!old) added++;
    else if (!samePlacement(old, placement)) moved++;
  }
  for (const key of was.keys()) if (!now.has(key)) removed++;
  const wasTiles = byKey(before.groundTiles, tileKey), nowTiles = byKey(after.groundTiles, tileKey);
  let painted = 0;
  for (const [key, tile] of nowTiles) if (wasTiles.get(key)?.tileType !== tile.tileType) painted++;
  for (const key of wasTiles.keys()) if (!nowTiles.has(key)) painted++;
  return { added, moved, removed, painted };
}

/** A friendly line for the summary: "6 things built, 2 moved and 4 squares painted". */
export function describeFriendChanges(changes: ReturnType<typeof summariseFriendChanges>) {
  const parts = [
    changes.added ? `${changes.added} ${changes.added === 1 ? "thing" : "things"} built` : "",
    changes.moved ? `${changes.moved} moved` : "",
    changes.removed ? `${changes.removed} taken away` : "",
    changes.painted ? `${changes.painted} ${changes.painted === 1 ? "square" : "squares"} painted` : "",
  ].filter(Boolean);
  if (!parts.length) return "nothing changed";
  return parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

/** The current world with just one friend's changes reversed (things built since by anyone else stay). */
export function undoFriendChanges(current: WorldSnapshot, before: WorldSnapshot, after: WorldSnapshot): WorldSnapshot {
  const was = byKey(before.placements, placementKey), friendLeft = byKey(after.placements, placementKey);
  const placements: CentralWorldPlacement[] = [];
  const present = new Set<string>();
  for (const placement of current.placements) {
    const key = placementKey(placement), old = was.get(key), theirs = friendLeft.get(key);
    present.add(key);
    // Built by the friend, and still as they left it: take it away.
    if (!old && theirs && samePlacement(theirs, placement)) continue;
    // Moved by the friend, and still where they put it: put it back.
    if (old && theirs && !samePlacement(old, theirs) && samePlacement(theirs, placement)) { placements.push(old); continue; }
    placements.push(placement);
  }
  // Taken away by the friend (and not back since): put it back.
  for (const [key, old] of was) if (!friendLeft.has(key) && !present.has(key)) placements.push(old);

  const wasTiles = byKey(before.groundTiles, tileKey), theirTiles = byKey(after.groundTiles, tileKey);
  const groundTiles: CentralWorldGroundTile[] = [];
  const tilesPresent = new Set<string>();
  for (const tile of current.groundTiles) {
    const key = tileKey(tile), old = wasTiles.get(key), theirs = theirTiles.get(key);
    tilesPresent.add(key);
    const friendChanged = theirs && old?.tileType !== theirs.tileType && theirs.tileType === tile.tileType;
    if (friendChanged) { if (old) groundTiles.push(old); continue; }
    groundTiles.push(tile);
  }
  for (const [key, old] of wasTiles) if (!theirTiles.has(key) && !tilesPresent.has(key)) groundTiles.push(old);
  return { placements, groundTiles };
}
