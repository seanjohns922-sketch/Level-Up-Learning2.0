export const EXPLORER_XP_LEVEL_BASE = 75;

export const EXPLORER_RANK_TIERS = [
  { minimumLevel: 80, title: "Legendary Explorer" },
  { minimumLevel: 50, title: "Master Explorer" },
  { minimumLevel: 25, title: "Gold Explorer" },
  { minimumLevel: 10, title: "Silver Explorer" },
  { minimumLevel: 1, title: "Bronze Explorer" },
] as const;

export function getExplorerRankTitle(level: number) {
  return EXPLORER_RANK_TIERS.find((tier) => level >= tier.minimumLevel)?.title ?? "Bronze Explorer";
}
