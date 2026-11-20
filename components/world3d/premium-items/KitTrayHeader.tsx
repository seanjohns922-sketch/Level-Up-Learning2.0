"use client";
import type { BuildKit, KitLevel } from "@/lib/world3d/build-kits";

/** Top of a kit's Edit World tab: the kit level, what it is, and the next upgrade. */
export function KitTrayHeader({ kit, level, next, upgrading, onUpgrade }: {
  kit: BuildKit;
  level: KitLevel;
  next: { name: string; price: number } | null;
  upgrading: boolean;
  onUpgrade: () => void;
}) {
  return (
    <div className="worldEditKit" role="status">
      <b>{level ? `${kit.name} · Level ${level} of 4` : kit.name}</b>
      <span>{level ? kit.levels[level - 1] : `Unlock it in the Marketplace (Build kits). ${kit.description}`}</span>
      {next ? <button type="button" className="worldEditPickedUpgrade" disabled={upgrading} onClick={onUpgrade}>{upgrading ? "Upgrading…" : `Unlock ${next.name} · ${next.price} XP`}</button> : null}
    </div>
  );
}
