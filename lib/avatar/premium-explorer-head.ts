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
    Skin: avatar.skin, 'Ear blush': avatar.skinShade,
    Hair: avatar.hair, 'Hair highlight': avatar.hair,
  };
  root.updateMatrixWorld(true);
  const rootInverse = root.matrixWorld.clone().invert();
  let smile: THREE.Mesh | undefined;
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
    if (material.name === 'Smile') smile = node;
  });
  const mouth = smile ? addOpenSmile(root, smile, rootInverse) : undefined;
  return { root, dispose: () => { materials.forEach(material => material.dispose()); mouth?.(); } };
}

/** Swaps the thin smile line for an open smile with a row of top teeth, sized from the sculpted smile
 * and wrapped onto the face so the corners follow the cheeks instead of floating off them. */
function addOpenSmile(root: THREE.Object3D, line: THREE.Mesh, rootInverse: THREE.Matrix4) {
  const bounds = new THREE.Box3().setFromObject(line).applyMatrix4(rootInverse);
  const size = bounds.getSize(new THREE.Vector3());
  const centreX = bounds.getCenter(new THREE.Vector3()).x;
  line.visible = false;
  const skin: THREE.Object3D[] = [];
  root.traverse(node => {
    if (node instanceof THREE.Mesh && (node.material as THREE.Material).name === 'Skin') skin.push(node);
  });
  const width = size.x * 1.33, height = size.y * 1.15, dip = height * .55, depth = height * 1.9, band = depth * .42;
  const edge = width / 2 * .9, top = -band * .15;
  // Each part is the band between two curves (corner to corner), as a fine grid so it can bend with the face.
  const curve = (half: number, end: number, middle: number) => (t: number) =>
    [half * (2 * t - 1), end * ((1 - t) ** 2 + t ** 2) + 2 * t * (1 - t) * middle] as const;
  const ray = new THREE.Raycaster();
  const origin = new THREE.Vector3(), back = new THREE.Vector3(0, 0, -1).transformDirection(root.matrixWorld);
  const surfaceZ = (x: number, y: number) => {
    ray.set(origin.set(x, y, bounds.max.z + 1).applyMatrix4(root.matrixWorld), back);
    const hit = ray.intersectObjects(skin, false)[0];
    return hit ? hit.point.applyMatrix4(rootInverse).z : bounds.max.z;
  };
  const baseY = bounds.max.y - height * .2;
  const parts = [
    { upper: curve(width / 2, 0, -dip * 2), lower: curve(width / 2, 0, -depth * 2), colour: '#5a1e24', roughness: .6, lift: .003, offset: -2 },
    { upper: curve(edge, top, -dip * 2), lower: curve(edge, top, -dip * 2 - band * 1.4), colour: '#fbfaf6', roughness: .35, lift: .005, offset: -3 },
  ].map(({ upper, lower, colour, roughness, lift, offset }) => {
    const columns = 32, rows = 6, vertices: number[] = [], indices: number[] = [];
    for (let c = 0; c <= columns; c += 1) {
      const [ux, uy] = upper(c / columns), [lx, ly] = lower(c / columns);
      for (let r = 0; r <= rows; r += 1) {
        const x = centreX + ux + (lx - ux) * r / rows, y = baseY + uy + (ly - uy) * r / rows;
        vertices.push(x, y, surfaceZ(x, y) + lift);
        if (c < columns && r < rows) {
          const i = c * (rows + 1) + r, next = i + rows + 1;
          indices.push(i, i + 1, next, next, i + 1, next + 1);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
      color: colour, roughness, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: offset,
    }));
  });
  const mouth = new THREE.Group();
  mouth.name = 'OpenSmile';
  mouth.add(...parts);
  root.add(mouth);
  return () => parts.forEach(part => { part.geometry.dispose(); (part.material as THREE.Material).dispose(); });
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
