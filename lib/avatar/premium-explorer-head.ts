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
  root.updateMatrixWorld(true);
  const rootInverse = root.matrixWorld.clone().invert();
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
    // Matte skin: a little shine showed the sculpt's fine ridges.
    const material = node.material as THREE.MeshStandardMaterial;
    if (material.name === 'Skin') material.roughness = Math.max(material.roughness, .88);
    if (material.name === 'Ear blush') softenBlush(node, material, rootInverse, avatar);
  });
  return { root, dispose: () => materials.forEach(material => material.dispose()) };
}

/** The blush mesh rings each eye, sits on the cheeks and lines the ears. Eye rings take the skin colour,
 * the cheek patches are tucked just under the skin (so they no longer show), and ears keep the darker shade. */
function softenBlush(mesh: THREE.Mesh, material: THREE.MeshStandardMaterial, rootInverse: THREE.Matrix4, avatar: Required<AvatarOutfit>) {
  const geometry = mesh.geometry.clone();
  const position = geometry.getAttribute('position');
  const toHead = rootInverse.clone().multiply(mesh.matrixWorld);
  const skin = new THREE.Color(avatar.skin), ear = new THREE.Color(avatar.skinShade);
  const fromHead = toHead.clone().invert();
  const centre = new THREE.Vector3(0, .32, 0);
  const colours = new Float32Array(position.count * 3);
  const point = new THREE.Vector3();
  for (let i = 0; i < position.count; i += 1) {
    point.fromBufferAttribute(position, i).applyMatrix4(toHead);
    const side = Math.abs(point.x);
    const isEar = side > .38, isEyeRing = side < .2 && point.y > .27;
    if (!isEar && !isEyeRing) {
      point.sub(centre).multiplyScalar(.82).add(centre).applyMatrix4(fromHead);
      position.setXYZ(i, point.x, point.y, point.z);
    }
    const colour = isEar ? ear : skin;
    colours.set([colour.r, colour.g, colour.b], i * 3);
  }
  position.needsUpdate = true;
  geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3));
  mesh.geometry = geometry;
  material.vertexColors = true;
  material.color.set('#ffffff');
  material.roughness = Math.max(material.roughness, .9);
}
