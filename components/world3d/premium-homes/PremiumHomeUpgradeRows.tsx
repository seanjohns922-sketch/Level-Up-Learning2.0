"use client";
import { Sparkles } from "lucide-react";
import { nextPremiumHomeUpgrade, premiumHomeLevel, premiumHomeStyle, PREMIUM_HOME_SPECS, type PremiumHomeStyle } from "@/lib/world3d/premium-homes";

/** The level line and upgrade button shown when a learner taps one of their premium homes; nothing for other items. */
export function PremiumHomeUpgradeRows({ assetKey, ownedItemKeys, upgrading, onUpgrade }: { assetKey: unknown; ownedItemKeys: ReadonlySet<string>; upgrading: boolean; onUpgrade: (style: PremiumHomeStyle) => void }) {
  const style = premiumHomeStyle(assetKey);
  if (!style) return null;
  const level = premiumHomeLevel(style, ownedItemKeys);
  const next = nextPremiumHomeUpgrade(style, ownedItemKeys);
  return (
    <>
      <span className="worldEditPickedLevel">Level {level} of 4 · {PREMIUM_HOME_SPECS[style].levels[level - 1]}</span>
      {next ? (
        <button type="button" className="worldEditPickedUpgrade" disabled={upgrading} onClick={() => onUpgrade(style)}>
          <Sparkles size={20} aria-hidden="true" />
          {upgrading ? "Upgrading…" : `Upgrade · ${next.price} XP`}
        </button>
      ) : <span className="worldEditPickedLevel">Legendary ✦</span>}
    </>
  );
}
