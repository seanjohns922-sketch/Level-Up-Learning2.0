"use client";

import { useEffect, useState } from "react";

/* Renders a Measurelands object as its commissioned PNG art when available,
 * falling back to the emoji until the file is dropped into
 * /public/measurelands/objects/<label>.png (kebab-case). */

export function objectArtFile(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function objectArtSources(name: string): string[] {
  const file = objectArtFile(name);
  if (!file) return [];

  return [
    `/measurelands/objects/${file}.png`,
    `/images/measurelands/week2-3d/${file}.png`,
    `/images/measurelands/measure-objects-3d/${file}.png`,
    `/images/measurelands/containers-3d/${file}.png`,
    `/images/measurelands/duration-3d/${file}.png`,
    `/images/measurelands/everyday-3d/object-${file}.png`,
  ];
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
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = objectArtSources(name);

  useEffect(() => {
    setSourceIndex(0);
  }, [name]);

  if (sourceIndex >= sources.length || !name) {
    return (
      <span className={className} style={{ fontSize: size * 0.82, lineHeight: 1 }} aria-hidden>
        {emoji}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sources[sourceIndex]}
      alt={name}
      width={size}
      height={size}
      onError={() => setSourceIndex((current) => current + 1)}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
    />
  );
}
