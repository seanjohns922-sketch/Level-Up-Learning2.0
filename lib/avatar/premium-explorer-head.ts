import * as THREE from 'three';
import type { AvatarOutfit } from '../../components/avatar/StudentAvatar';

/** Reuse the sculpted head independently of outfit and footwear selection. */
export function createPremiumExplorerHead(scene: THREE.Object3D, avatar: Required<AvatarOutfit>) {
  const source = scene.getObjectByName('Head');
  if (!source) throw new Error('Premium explorer asset is missing its Head pivot');
  const root = source.clone(true);
  const oldHair = root.getObjectByName("WardrobeHair");
  if (oldHair) oldHair.visible = false;
  // The asset face is centred .32 above its pivot; the explorer face is at 1.12.
  root.position.set(0, .8, 0);
  const materials = new Map<THREE.Material, THREE.MeshStandardMaterial>();
  const palette: Record<string, string> = {
    Skin: avatar.skin, 'Ear blush': avatar.skinShade, Smile: avatar.hairShade,
    Hair: avatar.hair, 'Hair highlight': avatar.hair,
  };
  root.traverse(node => {
    if (!(node instanceof THREE.Mesh)) return;
    node.castShadow = true;
    node.receiveShadow = true;
    const clone = (source: THREE.MeshStandardMaterial) => {
      const existing = materials.get(source);
      if (existing) return existing;
      const copy = source.clone();
      if (palette[source.name]) copy.color.set(palette[source.name]);
      if (source.name === 'Hair highlight') copy.color.lerp(new THREE.Color('#ffffff'), .16);
      materials.set(source, copy);
      return copy;
    };
    node.material = Array.isArray(node.material) ? node.material.map(clone) : clone(node.material);
  });
  return { root, dispose: () => materials.forEach(material => material.dispose()) };
}
