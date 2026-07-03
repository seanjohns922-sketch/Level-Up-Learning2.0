"use client";

import { useState } from "react";

/* Renders a Measurelands object as its commissioned PNG art when available,
 * falling back to the emoji until the file is dropped into
 * /public/measurelands/objects/<label>.png (kebab-case). */

export function objectArtFile(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function MeasurelandsObjectArt({
  name,
  emoji,
  size = 64,
  className,
}: {
  name: string;
  emoji?: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = `/measurelands/objects/${objectArtFile(name)}.png`;

  if (failed || !name) {
    return (
      <span className={className} style={{ fontSize: size * 0.82, lineHeight: 1 }} aria-hidden>
        {emoji}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
