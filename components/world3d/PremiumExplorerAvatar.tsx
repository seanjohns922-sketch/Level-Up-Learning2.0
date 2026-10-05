"use client";

import { useGLTF } from '@react-three/drei';
import { createPortal, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { AvatarOutfit } from '@/components/avatar/StudentAvatar';
import { createPremiumExplorerHead } from '@/lib/avatar/premium-explorer-head';
import { ExplorerSweptHair } from './ExplorerSweptHair';
import { ExplorerCharacterGear } from './ExplorerAvatarDetails';

type Outfit = Required<AvatarOutfit>;
export function supportsPremiumExplorer(avatar: Outfit) {
  return avatar.top === 'realm_codemaster' && avatar.hairStyle === 'swept'
    && avatar.shoeStyle === 'boots' && avatar.face === 'smile' && avatar.bottom !== 'skirt';
}

/** Object-pivot rig; cloned materials keep each student's saved palette isolated. */
export function PremiumExplorerAvatar({ avatar, movingRef, sprintingRef }: {
  avatar: Outfit;
  movingRef: React.MutableRefObject<boolean>;
  sprintingRef?: React.MutableRefObject<boolean>;
}) {
  const { scene } = useGLTF('/avatars/models/codemaster-premium.glb?v=wardrobe-hair-2');
  const { root, materials, limbs, rightArm } = useMemo(() => {
    const root = scene.clone(true);
    const oldHair = root.getObjectByName("WardrobeHair");
    if (oldHair) oldHair.visible = false;
    const materials: THREE.MeshStandardMaterial[] = [];
    const palette: Record<string, string> = {
      Skin: avatar.skin, 'Ear blush': avatar.skinShade, Smile: avatar.hairShade,
      Hair: avatar.hair, 'Hair highlight': avatar.hair,
      Cloth: avatar.pants, Armour: avatar.shirt, 'Armour shadow': avatar.shirt,
      'Gold trim': avatar.shirtTrim, 'Gold highlight': avatar.shirtTrim,
      'Boot leather': avatar.shoes,
    };
    const clones = new Map<THREE.Material, THREE.MeshStandardMaterial>();
    root.traverse(node => {
      if (!(node instanceof THREE.Mesh)) return;
      node.castShadow = true;
      node.receiveShadow = true;
      const clone = (source: THREE.MeshStandardMaterial) => {
        if (clones.has(source)) return clones.get(source)!;
        const material = source.clone();
        const colour = palette[source.name];
        if (colour) material.color.set(colour);
        if (source.name === 'Armour shadow') material.color.multiplyScalar(.72);
        if (source.name === 'Hair highlight' || source.name === 'Gold highlight') material.color.lerp(new THREE.Color('#ffffff'), .16);
        clones.set(source, material);
        materials.push(material);
        return material;
      };
      node.material = Array.isArray(node.material) ? node.material.map(clone) : clone(node.material);
    });
    const limbs = ['LegL', 'LegR', 'ArmL', 'ArmR'].map(name => root.getObjectByName(name)!);
    return { root, materials, limbs, rightArm: limbs[3] };
  }, [scene, avatar.skin, avatar.skinShade, avatar.hair, avatar.hairShade, avatar.pants, avatar.shirt, avatar.shirtTrim, avatar.shoes]);
  useEffect(() => () => materials.forEach(material => material.dispose()), [materials]);
  const phase = useRef(0);
  const bodyRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const sprinting = Boolean(sprintingRef?.current);
    phase.current += Math.min(delta, .05) * (sprinting ? 13.5 : 8.5);
    const stride = movingRef.current ? Math.sin(phase.current) * (sprinting ? .65 : .45) : 0;
    const smoothing = 1 - Math.exp(-delta * 14);
    const targets = [stride, -stride, -stride * .72, stride * .5];
    limbs.forEach((limb, index) => { limb.rotation.x = THREE.MathUtils.lerp(limb.rotation.x, targets[index], smoothing); });
    if (bodyRef.current) bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, movingRef.current ? Math.abs(Math.sin(phase.current * 2)) * .025 : 0, smoothing);
  });
  return <group position={[0, -.73, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0,.005,0]}>
      <circleGeometry args={[.48, 32]} />
      <meshBasicMaterial color="#02090c" transparent opacity={.3} depthWrite={false} />
    </mesh>
    <group ref={bodyRef}><primitive object={root} dispose={null} /></group>
    {createPortal(<group position={[0, -.8, 0]}><ExplorerSweptHair colour={avatar.hair}/></group>, root.getObjectByName("Head")!)}
    {createPortal(<group position={[.05, -.69, .1]}><ExplorerCharacterGear held={avatar.held} /></group>, rightArm)}
  </group>;
}

/** Independent head upgrade: changing clothing must not downgrade swept hair. */
export function PremiumExplorerHead({ avatar }: { avatar: Outfit }) {
  const { scene } = useGLTF('/avatars/models/codemaster-premium.glb?v=wardrobe-hair-2');
  const { root, dispose } = useMemo(() => createPremiumExplorerHead(scene, avatar),
    [scene, avatar]);
  useEffect(() => dispose, [dispose]);
  return <group><primitive object={root} dispose={null} /><ExplorerSweptHair colour={avatar.hair}/></group>;
}
