"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import StudentAvatar, { type AvatarOutfit } from "@/components/avatar/StudentAvatar";
import PetArt, { petSpeciesForItem } from "@/components/pets/PetArt";
import type { EconomyItem } from "@/lib/economy";
import { resolveMarketplaceVisual } from "@/lib/marketplace-visuals";

type Props = {
  item: EconomyItem;
  context: "card" | "preview";
  avatarOutfit?: AvatarOutfit;
  onArtworkError?: (itemKey: string) => void;
};

function UnavailableArtwork() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400">
      <ImageOff className="h-7 w-7" aria-hidden="true" />
      <span className="text-[10px] font-black uppercase tracking-[0.12em]">Artwork unavailable</span>
    </div>
  );
}

export default function MarketplaceItemImage({ item, context, avatarOutfit, onArtworkError }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const visual = resolveMarketplaceVisual(item);
  const large = context === "preview";

  if (visual.type === "unavailable" || imageFailed) return <UnavailableArtwork />;

  if (visual.type === "avatar-layer") {
    const metadata = { ...item.metadata };
    delete metadata.slot;
    const outfit = avatarOutfit ?? (metadata as AvatarOutfit);
    return (
      <div role="img" aria-label={visual.alt}>
        <StudentAvatar height={large ? 220 : 112} outfit={outfit} alive={large} floatAnimation={large ? undefined : "none"} glowColor={large ? item.accent : "transparent"} />
      </div>
    );
  }

  if (visual.type === "pet") {
    const species = petSpeciesForItem(item.item_key, item.metadata);
    if (!species) return <UnavailableArtwork />;
    return <PetArt species={species} size={large ? 170 : 88} alt={visual.alt} />;
  }

  if (visual.type === "asset") {
    return (
      <Image
        src={visual.src}
        alt={visual.alt}
        fill
        sizes={large ? "390px" : "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 240px"}
        priority={large}
        className={visual.previewMode === "background" ? "object-cover" : "object-contain p-3"}
        onError={() => {
          setImageFailed(true);
          onArtworkError?.(item.item_key);
          if (process.env.NODE_ENV !== "production") console.warn(`[Marketplace] Missing artwork for ${item.item_key}: ${visual.src}`);
        }}
      />
    );
  }

  return <UnavailableArtwork />;
}
