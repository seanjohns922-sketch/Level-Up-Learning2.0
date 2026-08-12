import type { ImgHTMLAttributes } from "react";

type LegendCardArtworkProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> & {
  alt: string;
};

/** Keeps the complete collectible card visible regardless of its source aspect ratio. */
export default function LegendCardArtwork({
  alt,
  className = "",
  ...props
}: LegendCardArtworkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={alt} className={`block object-contain ${className}`.trim()} />
  );
}
