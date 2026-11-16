// Small helpers shared by the code-built 3D scenery (the bigger hub, the
// treehouse and its rooms). Client-only: canvas textures need the DOM.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** A stable pseudo-random number in [0, 1) for index i, so scenery is identical on every load. */
export function hash01(i: number, salt = 311.7) {
  const x = Math.sin(i * 127.1 + salt) * 43758.5453;
  return x - Math.floor(x);
}

/** A texture painted with the 2D canvas API. */
export function canvasTexture(width: number, height: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, { repeat, anisotropy = 4 }: { repeat?: [number, number]; anisotropy?: number } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  if (repeat) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(...repeat);
  }
  return texture;
}

/** Pale ghost gum bark: cream with soft peeling patches. Larger sizes are used up close (inside the treehouse). */
export function ghostGumBarkTexture(repeat: [number, number], size: 128 | 256 = 128) {
  return canvasTexture(size, size * 2, (g, w, h) => {
    const k = size / 128;
    g.fillStyle = "#ece5d6";
    g.fillRect(0, 0, w, h);
    g.globalAlpha = 0.55;
    for (let i = 0; i < 40 * k; i++) {
      g.fillStyle = ["#d8cdb8", "#f8f4ea", "#cbbd9f", "#efe3c6"][i % 4];
      g.beginPath();
      g.ellipse(hash01(i) * w, hash01(i + 9) * h, (4 + hash01(i + 3) * 12) * k, (16 + hash01(i + 5) * 50) * k, 0, 0, Math.PI * 2);
      g.fill();
    }
    g.globalAlpha = 1;
  }, { repeat, anisotropy: size === 256 ? 8 : 4 });
}

/**
 * Bakes a group of static meshes into one mesh per material, so a whole
 * structure draws in a handful of calls. Source geometries are disposed.
 */
export function mergeByMaterial(group: THREE.Group) {
  group.updateMatrixWorld(true);
  const buckets = new Map<THREE.Material, THREE.BufferGeometry[]>();
  group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const geometry = (mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone()).applyMatrix4(mesh.matrixWorld);
    mesh.geometry.dispose();
    for (const name of Object.keys(geometry.attributes)) if (!["position", "normal", "uv"].includes(name)) geometry.deleteAttribute(name);
    if (!geometry.attributes.uv) geometry.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count * 2), 2));
    const material = mesh.material as THREE.Material;
    if (!buckets.has(material)) buckets.set(material, []);
    buckets.get(material)!.push(geometry);
  });
  const out = new THREE.Group();
  buckets.forEach((geometries, material) => {
    const merged = mergeGeometries(geometries, false);
    geometries.forEach((geometry) => geometry.dispose());
    if (!merged) return;
    const mesh = new THREE.Mesh(merged, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    out.add(mesh);
  });
  return out;
}

/** Frees the geometry of every mesh under an object. Materials are disposed by their owner. */
export function disposeGeometries(root: THREE.Object3D) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) mesh.geometry.dispose();
  });
}
