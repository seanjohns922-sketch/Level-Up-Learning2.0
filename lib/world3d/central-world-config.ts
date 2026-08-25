export type CentralWorldQuality = "low" | "medium" | "high";

export const CENTRAL_WORLD_CONFIG = {
  scale: "1 world unit = 1 metre",
  spawnPoint: [0, 0.75, 18] as [number, number, number],
  towerPosition: [0, 0, -46] as [number, number, number],
  towerMainEntrance: [0, 0.75, -35] as [number, number, number],
  towerExitSpawn: [0, 0.75, -31.5] as [number, number, number],
  towerPlaza: [0, 0.75, -30] as [number, number, number],
  myHomePosition: [-30, 0, -6] as [number, number, number],
  myHomeRotationY: Math.PI / 2,
  myHomeEntrance: [-24.8, 0.75, -6] as [number, number, number],
  myHomeExitSpawn: [-22.8, 0.75, -4.5] as [number, number, number],
  playableBounds: { minX: -42, maxX: 42, minZ: -35.5, maxZ: 25 },
  roamEllipse: { centerZ: -4, radiusX: 41, radiusZ: 33 },
  pathPoints: [
    [3.2, 31],
    [1.8, 25],
    [0, 18],
    [-1.4, 10],
    [1.1, 2],
    [-0.8, -7],
    [0, -18],
    [0, -27],
    [0, -33],
    [0, -38.5],
  ] as Array<[number, number]>,
  myHomePathPoints: [
    [-0.8, -7],
    [-6, -6.8],
    [-12.5, -6.2],
    [-18.5, -5.8],
    [-24.8, -6],
  ] as Array<[number, number]>,
  futureZones: {
    west: [-19, 0, -4] as [number, number, number],
    east: [19, 0, 2] as [number, number, number],
    stream: [14, 0, 8] as [number, number, number],
    towerPlaza: [0, 0, -30] as [number, number, number],
  },
} as const;

export const CENTRAL_WORLD_ANCHORS = {
  towerMainEntrance: "tower-main-entrance",
  towerExitSpawn: "tower-exit-spawn",
  myHomeEntrance: "my-home-entry",
  myHomeExitSpawn: "my-home-exit-spawn",
  spawn: "central-world-spawn",
  futureLeaderboardMonument: "future-leaderboard-monument",
  futureCollectionArea: "future-collection-area",
} as const;
