"use client";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { buildOrganicPath } from "@/lib/world3d/organic-path";
import type { CentralWorldGroundTile } from "@/lib/world3d/central-world-layout";
export function OrganicPaths({ tiles, road = false }: {
    tiles: CentralWorldGroundTile[];
    road?: boolean;
}) {
    const geometry = useMemo(() => buildOrganicPath(road ? tiles.map(tile => ({...tile,tileType:tile.tileType==="road"?"path":"stone"})) : tiles), [tiles, road]);
    const gravel = useMemo(() => {
        const data = new Uint8Array(128 * 128 * 4);
        let seed = 47;
        for (let i = 0; i < 128 * 128; i++) {
            seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
            const grain = 183 + (seed % 70);
            data.set([grain, grain, grain, 255], i * 4);
        }
        const map = new THREE.DataTexture(data, 128, 128);
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.magFilter = THREE.LinearFilter;
        map.minFilter = THREE.LinearMipmapLinearFilter;
        map.generateMipmaps = true;
        map.anisotropy = 4;
        map.needsUpdate = true;
        return map;
    }, []);
    useEffect(() => () => { geometry.surface.dispose(); geometry.edge.dispose(); }, [geometry]);
    useEffect(() => () => gravel.dispose(), [gravel]);
    return <group>
    <mesh geometry={geometry.edge} receiveShadow><meshStandardMaterial color={road?"#8d948c":"#806b4d"} roughness={1}/></mesh>
    <mesh geometry={geometry.surface} receiveShadow><meshStandardMaterial color={road?"#555f60":"#b29a73"} map={gravel} bumpMap={gravel} bumpScale={road?.012:.045} roughness={0.98}/></mesh>
  </group>;
}
