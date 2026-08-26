export type CentralWorldQuality = "low" | "medium" | "high";

export type CentralWorldCustomisationPlot = {
  id: string;
  position: [number, number, number];
  pathPoints: Array<[number, number]>;
};

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
  playableBounds: { minX: -48, maxX: 48, minZ: -35.5, maxZ: 54 },
  roamEllipse: { centerZ: 8, radiusX: 47, radiusZ: 46 },
  pathPoints: [
    [2.5, 52],
    [3.4, 43],
    [2.8, 34],
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

export const CENTRAL_WORLD_CUSTOMISATION_PLOTS: CentralWorldCustomisationPlot[] = [
  { id: "customisation-plot-1", position: [-14, 0.75, 31], pathPoints: [[2.8, 34], [-6, 32], [-14, 31]] },
  { id: "customisation-plot-2", position: [14, 0.75, 31], pathPoints: [[2.8, 34], [7.5, 32], [14, 31]] },
  { id: "customisation-plot-3", position: [-23, 0.75, 45], pathPoints: [[3.4, 43], [-10, 44], [-23, 45]] },
  { id: "customisation-plot-4", position: [23, 0.75, 45], pathPoints: [[3.4, 43], [12, 44], [23, 45]] },
  { id: "customisation-plot-5", position: [-13.5, 0.75, 1.5], pathPoints: [[1.1, 2], [-6.5, 0.5], [-13.5, 1.5]] },
  { id: "customisation-plot-6", position: [13.5, 0.75, 1.5], pathPoints: [[1.1, 2], [6.5, 3], [13.5, 1.5]] },
  { id: "customisation-plot-7", position: [-20.5, 0.75, 14], pathPoints: [[-0.7, 13], [-10, 11.5], [-20.5, 14]] },
  { id: "customisation-plot-8", position: [20.5, 0.75, 14], pathPoints: [[-0.7, 13], [10, 11.5], [20.5, 14]] },
];
