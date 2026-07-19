"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import StudentAvatar, { type AvatarOutfit } from "@/components/avatar/StudentAvatar";
import PetArt, { petSpeciesForItem } from "@/components/pets/PetArt";
import MarketplaceAvatarItemArt from "@/components/economy/MarketplaceAvatarItemArt";
import type { EconomyItem } from "@/lib/economy";
import { resolveMarketplaceVisual, type MarketplaceVisual } from "@/lib/marketplace-visuals";

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

type AssetVisual = Extract<MarketplaceVisual, { type: "asset" }>;

function ProductAsset({
  item,
  visual,
  priority,
  className,
  onError,
}: {
  item: EconomyItem;
  visual: AssetVisual;
  priority: boolean;
  className: string;
  onError: (itemKey: string, src: string) => void;
}) {
  return (
    <Image
      src={visual.src}
      alt={visual.alt}
      fill
      sizes={priority ? "390px" : "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 240px"}
      priority={priority}
      className={className}
      onError={() => onError(item.item_key, visual.src)}
    />
  );
}

export default function MarketplaceItemImage({ item, context, avatarOutfit, onArtworkError }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const visual = resolveMarketplaceVisual(item);
  const large = context === "preview";
  const reportArtworkError = (itemKey: string, src: string) => {
    setImageFailed(true);
    onArtworkError?.(itemKey);
    if (process.env.NODE_ENV !== "production") console.warn(`[Marketplace] Missing artwork for ${itemKey}: ${src}`);
  };

  if (visual.type === "unavailable" || imageFailed) return <UnavailableArtwork />;

  if (visual.type === "avatar-layer") {
    if (!large) return <MarketplaceAvatarItemArt item={item} />;
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
    if (!large) return <PetArt species={species} size={88} alt={visual.alt} />;
    return (
      <div className="flex h-full w-full items-end justify-center gap-2 pb-2" role="img" aria-label={`${visual.alt} beside the student avatar`}>
        <StudentAvatar height={190} outfit={avatarOutfit} alive glowColor="rgba(45,212,191,0.22)" />
        <div className="mb-2"><PetArt species={species} size={112} /></div>
      </div>
    );
  }

  if (visual.type === "asset") {
    if (!large) {
      return <ProductAsset item={item} visual={visual} priority={false} className={visual.previewMode === "background" ? "object-cover" : "object-contain p-2"} onError={reportArtworkError} />;
    }

    if (visual.previewMode === "background") {
      return (
        <div className="relative h-full w-full overflow-hidden">
          <ProductAsset item={item} visual={visual} priority className="object-cover" onError={reportArtworkError} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/15" />
          <div className="absolute inset-x-0 bottom-0 flex justify-center"><StudentAvatar height={190} outfit={avatarOutfit} glowColor="rgba(255,255,255,0.18)" /></div>
        </div>
      );
    }

    if (visual.previewMode === "room") {
      const placementClass = visual.placement === "desk"
        ? "absolute bottom-[13%] right-[11%] h-[57%] w-[43%]"
        : "absolute bottom-[2%] right-[4%] h-[82%] w-[58%]";
      return (
        <div className="relative h-full w-full overflow-hidden">
          <Image src="/images/home-themes/explorer-study.png" alt="" fill priority className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/35 via-transparent to-transparent" />
          <div className={placementClass}>
            <ProductAsset item={item} visual={visual} priority className="object-contain object-bottom" onError={reportArtworkError} />
          </div>
        </div>
      );
    }

    if (visual.previewMode === "effect") {
      return (
        <div className="relative h-full w-full" role="img" aria-label={`${visual.alt} around the student avatar`}>
          <div className="absolute inset-[4%]"><ProductAsset item={item} visual={visual} priority className="object-contain opacity-90" onError={reportArtworkError} /></div>
          <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center"><StudentAvatar height={205} outfit={avatarOutfit} glowColor="rgba(45,212,191,0.35)" /></div>
        </div>
      );
    }

    return (
      <div className="relative flex h-full w-full items-end justify-center pb-1" role="img" aria-label={`${visual.alt} displayed with the student avatar`}>
        <div className="absolute inset-x-[4%] top-[8%] h-[38%]"><ProductAsset item={item} visual={visual} priority className="object-contain" onError={reportArtworkError} /></div>
        <StudentAvatar height={175} outfit={avatarOutfit} glowColor="rgba(251,191,36,0.18)" />
      </div>
    );
  }

  return <UnavailableArtwork />;
}
