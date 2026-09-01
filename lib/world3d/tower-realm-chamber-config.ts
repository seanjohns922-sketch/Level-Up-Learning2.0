import {
  REALM_REGISTRY,
  type CanonicalRealmId,
  type RealmRegistryEntry,
} from "@/lib/realms/realm-registry";

export type TowerWorldQuality = "low" | "medium" | "high";

type TowerPortalPresentation = {
  realmId: CanonicalRealmId;
  subject: string;
  position: [number, number, number];
  rotationY: number;
  returnSpawn: [number, number, number];
  posterAsset: string;
  previewVideo?: string;
  accent: string;
  accentSoft: string;
  symbol: string;
};

export type TowerRealmPortalConfig = TowerPortalPresentation & {
  realm: RealmRegistryEntry;
  interactionId: string;
};

// Presentation belongs here; names, routes and availability remain canonical.
const PORTAL_PRESENTATION: readonly TowerPortalPresentation[] = [
  {
    realmId: "number",
    subject: "NUMBER",
    position: [-6.6, 0, -23],
    rotationY: 0.28,
    returnSpawn: [-5.5, 0.75, -19],
    posterAsset: "/images/tower-portal-number-nexus.jpg",
    previewVideo: "/videos/realms/number-nexus.mp4",
    accent: "#46e6dc",
    accentSoft: "#176c69",
    symbol: "N",
  },
  {
    realmId: "measurement",
    subject: "MEASUREMENT",
    position: [6.6, 0, -23],
    rotationY: -0.28,
    returnSpawn: [5.5, 0.75, -19],
    posterAsset: "/images/tower-portal-measurelands.jpg",
    previewVideo: "/videos/realms/measurelands.mp4",
    accent: "#f4bd62",
    accentSoft: "#765020",
    symbol: "M",
  },
  {
    realmId: "pattern",
    subject: "ALGEBRA & PATTERNS",
    position: [-18.1, 0, -15.8],
    rotationY: 0.85,
    returnSpawn: [-15.1, 0.75, -13.2],
    posterAsset: "/cards/patternox-wigglecode-y3-front.png",
    previewVideo: "/videos/realms/pattern-peaks.mp4",
    accent: "#82d68d",
    accentSoft: "#315f3b",
    symbol: "P",
  },
  {
    realmId: "statistics",
    subject: "STATISTICS",
    position: [21.8, 0, 10.1],
    rotationY: -2,
    returnSpawn: [18.2, 0.75, 8.4],
    posterAsset: "/images/tower-portal-statistica.jpg",
    previewVideo: "/videos/realms/statistica.mp4",
    accent: "#61d8df",
    accentSoft: "#285f67",
    symbol: "S",
  },
  {
    realmId: "chance",
    subject: "PROBABILITY",
    position: [18.1, 0, -15.8],
    rotationY: -0.85,
    returnSpawn: [15.1, 0.75, -13.2],
    posterAsset: "/images/tower-portal-sealed.jpg",
    previewVideo: "/videos/realms/chance-hollow.mp4",
    accent: "#eb79d7",
    accentSoft: "#713b6c",
    symbol: "C",
  },
  {
    realmId: "space",
    subject: "SPACE & SPATIAL REASONING",
    position: [23.8, 0, -3.3],
    rotationY: -1.43,
    returnSpawn: [19.8, 0.75, -2.7],
    posterAsset: "/images/tower-portal-starpath.jpg",
    previewVideo: "/videos/realms/starpath-realm.mp4",
    accent: "#a995ff",
    accentSoft: "#4f4380",
    symbol: "S",
  },
  {
    realmId: "time",
    subject: "TIME & DURATION",
    position: [12.7, 0, 20.4],
    rotationY: -2.58,
    returnSpawn: [10.6, 0.75, 17],
    posterAsset: "/images/tower-portal-sealed.jpg",
    previewVideo: "/videos/realms/chronorok.mp4",
    accent: "#71deef",
    accentSoft: "#315d6b",
    symbol: "T",
  },
  {
    realmId: "reading",
    subject: "READING & FLUENCY",
    position: [-23.8, 0, -3.3],
    rotationY: 1.43,
    returnSpawn: [-19.8, 0.75, -2.7],
    posterAsset: "/images/tower-portal-sealed.jpg",
    previewVideo: "/videos/realms/reading-ridge.mp4",
    accent: "#f4d154",
    accentSoft: "#74642d",
    symbol: "R",
  },
  {
    realmId: "writing",
    subject: "WRITING & SPELLING",
    position: [-21.8, 0, 10.1],
    rotationY: 2,
    returnSpawn: [-18.2, 0.75, 8.4],
    posterAsset: "/images/tower-portal-sealed.jpg",
    previewVideo: "/videos/realms/inkwell-wilds.mp4",
    accent: "#a8df64",
    accentSoft: "#526f36",
    symbol: "I",
  },
  {
    realmId: "advanced-literacy",
    subject: "ADVANCED LITERACY & LORE",
    position: [-12.7, 0, 20.4],
    rotationY: 2.58,
    returnSpawn: [-10.6, 0.75, 17],
    posterAsset: "/images/tower-portal-sealed.jpg",
    previewVideo: "/videos/realms/runehaven-peaks.mp4",
    accent: "#ef8178",
    accentSoft: "#763f3c",
    symbol: "R",
  },
] as const;

export const TOWER_REALM_PORTALS: readonly TowerRealmPortalConfig[] =
  PORTAL_PRESENTATION.map((presentation) => ({
    ...presentation,
    realm: REALM_REGISTRY[presentation.realmId],
    interactionId: `tower-realm-${presentation.realmId}`,
  }));

export const TOWER_CHAMBER_CONFIG = {
  spawnPoint: [0, 0.75, 11.5] as [number, number, number],
  exitPoint: [0, 0.75, 21] as [number, number, number],
  exitInteractionId: "tower-chamber-exit",
  playableBounds: { minX: -23, maxX: 23, minZ: -23, maxZ: 23 },
  roamEllipse: { centerZ: 0, radiusX: 23, radiusZ: 23 },
} as const;

export function getTowerPortalByInteractionId(interactionId: string | null) {
  return TOWER_REALM_PORTALS.find((portal) => portal.interactionId === interactionId) ?? null;
}
