import type { ImgHTMLAttributes } from "react";
import { getLegendArtwork } from "@/data/legend-artwork";

/** Full transparent silhouette; level 0 is Ground. Never crop to fill a mascot slot. */
export default function NumbotArtwork({ level = 0, className = "", alt = "", ...props }: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { level?: number }) {
  const image = getLegendArtwork("number-nexus", level === 0 ? "Prep" : `Year ${level}`).avatar;
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} src={image} alt={alt} className={`object-contain ${className}`} />;
}
