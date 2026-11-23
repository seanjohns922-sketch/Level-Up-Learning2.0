// The holes the hub's grass leaves for dug-out water. Painted water and placed Swimming Lakes sit below
// the ground, so the terrain shader skips its pixels wherever this mask is white, and swimmers show
// through the water instead of disappearing under the grass. One mask covers the build grid.
import * as THREE from "three";
import { HUB_V2_GRID } from "@/lib/world3d/central-world-v2";
import type { WaterOval } from "@/lib/world3d/swimming";

const MARGIN = 6;
const MIN = Math.min(HUB_V2_GRID.minX, HUB_V2_GRID.minZ) - MARGIN;
const SPAN = Math.max(HUB_V2_GRID.maxX, HUB_V2_GRID.maxZ) + MARGIN - MIN;
const PIXELS = 1024;

/** Shared by the terrain shader: the mask, the square of world it covers (min x, min z, span), and on/off. */
export const waterHoleUniforms = {
  uWaterHoles: { value: null as THREE.Texture | null },
  uWaterHoleArea: { value: new THREE.Vector3(MIN, MIN, SPAN) },
  uWaterHolesOn: { value: 0 },
};

/** GLSL for the terrain: declare once, then discard grass pixels over a hole. */
export const WATER_HOLE_VERTEX = { head: "varying vec2 vWaterXZ;\n", body: "vWaterXZ = (modelMatrix * vec4(transformed, 1.0)).xz;" };
export const WATER_HOLE_FRAGMENT = {
  head: "uniform sampler2D uWaterHoles;\nuniform vec3 uWaterHoleArea;\nuniform float uWaterHolesOn;\nvarying vec2 vWaterXZ;\n",
  body: "if (uWaterHolesOn > 0.5) { vec2 holeUv = (vWaterXZ - uWaterHoleArea.xy) / uWaterHoleArea.z; if (all(greaterThan(holeUv, vec2(0.0))) && all(lessThan(holeUv, vec2(1.0))) && texture2D(uWaterHoles, holeUv).r > 0.5) discard; }",
};

/** Paints the mask from the painted water's shape (flat triangles in x/z) and the lakes' ovals. */
export function paintWaterHoles(shape: THREE.BufferGeometry | null, ovals: readonly WaterOval[]) {
  const previous = waterHoleUniforms.uWaterHoles.value;
  const hasShape = Boolean(shape?.attributes.position?.count);
  if (!hasShape && !ovals.length) {
    waterHoleUniforms.uWaterHolesOn.value = 0;
    waterHoleUniforms.uWaterHoles.value = null;
    previous?.dispose();
    return;
  }
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = PIXELS;
  const g = canvas.getContext("2d")!;
  const px = (metres: number) => ((metres - MIN) / SPAN) * PIXELS;
  g.fillStyle = "#000"; g.fillRect(0, 0, PIXELS, PIXELS);
  g.fillStyle = "#fff"; g.strokeStyle = "#fff"; g.lineWidth = 1.5;
  if (hasShape) {
    const position = shape!.attributes.position;
    for (let i = 0; i + 2 < position.count; i += 3) {
      g.beginPath();
      g.moveTo(px(position.getX(i)), px(position.getZ(i)));
      g.lineTo(px(position.getX(i + 1)), px(position.getZ(i + 1)));
      g.lineTo(px(position.getX(i + 2)), px(position.getZ(i + 2)));
      g.closePath(); g.fill(); g.stroke(); // stroked too, so no seam shows between triangles
    }
  }
  for (const oval of ovals) {
    g.beginPath();
    g.ellipse(px(oval.x), px(oval.z), (oval.rx / SPAN) * PIXELS, (oval.rz / SPAN) * PIXELS, 0, 0, Math.PI * 2);
    g.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  // Canvas rows run down the image; uv (0,0) is the world's min corner, so don't flip.
  texture.flipY = false;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  waterHoleUniforms.uWaterHoles.value = texture;
  waterHoleUniforms.uWaterHolesOn.value = 1;
  previous?.dispose();
}
