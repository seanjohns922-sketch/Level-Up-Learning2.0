// The three walk-in treehouse rooms, built from simple shapes and painted
// canvas textures (approved mockup, Nov 2026). Each builder returns a group to
// mount in a scene, a per-frame update and where the camera stands.
import * as THREE from "three";
import { RELIQS_WORDMARK_PATHS, RELIQS_WORDMARK_VIEWBOX } from "@/lib/brand/reliqs-wordmark-paths";
import { getReliqsColor } from "@/lib/reliqs-brand";
import { canvasTexture, ghostGumBarkTexture, hash01, mergeByMaterial } from "@/components/world3d/three-build-utils";

export type TreehouseRoomKey = "main" | "gems" | "legends";
export type TreehouseRoom = {
  group: THREE.Group;
  update: (time: number, reduceMotion: boolean) => void;
  dispose: () => void;
  eye: THREE.Vector3;
  yaw: number;
  pitch: number;
  background: string;
};

// The rooms were lit in three.js's old light units; today's physical units are π times dimmer.
const LIGHT_UNITS = Math.PI;
function finishRoom(group: THREE.Group) {
  group.traverse((object) => { if ((object as THREE.Light).isLight) (object as THREE.Light).intensity *= LIGHT_UNITS; });
  return group;
}

// Unsalted so the furniture matches the approved mockup exactly.
const rnd = (i: number) => hash01(i, 0);

/** Tracks every texture, geometry and material a room creates so it can be freed in one call. */
class Kit {
  private owned: Array<{ dispose(): void }> = [];
  track<T extends { dispose(): void }>(item: T) { this.owned.push(item); return item; }
  dispose() { this.owned.forEach((item) => item.dispose()); this.owned = []; }
  /** Bakes a group of still meshes into one mesh per material and tracks the result. */
  merged(group: THREE.Group, castShadow: boolean) {
    const out = mergeByMaterial(group);
    out.traverse((object) => { const mesh = object as THREE.Mesh; if (mesh.isMesh) { this.track(mesh.geometry); mesh.castShadow = castShadow; } });
    return out;
  }

  canvas(width: number, height: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, repeat?: [number, number]) {
    return this.track(canvasTexture(width, height, draw, { repeat, anisotropy: 8 }));
  }
  mat(color: THREE.ColorRepresentation | THREE.Material, options: THREE.MeshStandardMaterialParameters = {}) {
    if (color instanceof THREE.Material) return color;
    return this.track(new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.03, ...options }));
  }
  mesh(geometry: THREE.BufferGeometry, material: THREE.ColorRepresentation | THREE.Material, options?: THREE.MeshStandardMaterialParameters) {
    const m = new THREE.Mesh(this.track(geometry), this.mat(material, options));
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  /** A rounded box: chunky, toy-like furniture. */
  rbox(w: number, h: number, d: number, r: number, material: THREE.ColorRepresentation | THREE.Material) {
    r = Math.min(r, w / 2, h / 2, d / 2);
    const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, W = w - 2 * r, H = h - 2 * r;
    s.moveTo(x, y - r); s.lineTo(x + W, y - r); s.quadraticCurveTo(x + W + r, y - r, x + W + r, y); s.lineTo(x + W + r, y + H);
    s.quadraticCurveTo(x + W + r, y + H + r, x + W, y + H + r); s.lineTo(x, y + H + r); s.quadraticCurveTo(x - r, y + H + r, x - r, y + H); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.001, d - 2 * r), bevelEnabled: true, bevelSize: r, bevelThickness: r, bevelSegments: 3, curveSegments: 5 });
    g.translate(0, 0, -(d - 2 * r) / 2); g.computeVertexNormals();
    return this.mesh(g, material);
  }
}

function at<T extends THREE.Object3D>(object: T, x: number, y: number, z: number, ry?: number) {
  object.position.set(x, y, z);
  if (ry !== undefined) object.rotation.y = ry;
  return object;
}

function planks(kit: Kit, base: string, dark: string, light: string) {
  return kit.canvas(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    const n = 8;
    for (let i = 0; i < n; i++) {
      const x = (i * w) / n;
      g.fillStyle = i % 2 ? light : base; g.globalAlpha = 0.35; g.fillRect(x, 0, w / n, h); g.globalAlpha = 1;
      g.fillStyle = dark; g.fillRect(x, 0, 3, h);
      for (let k = 0; k < 26; k++) {
        g.strokeStyle = dark; g.globalAlpha = 0.18 + rnd(i * 31 + k) * 0.2; g.lineWidth = 1 + rnd(k + i) * 1.5;
        g.beginPath(); const gx = x + 8 + rnd(i * 7 + k) * (w / n - 16); g.moveTo(gx, 0); g.bezierCurveTo(gx + 6, h * 0.3, gx - 6, h * 0.6, gx + 3, h); g.stroke();
      }
      g.globalAlpha = 1;
      for (let j = 0; j < 3; j++) { g.fillStyle = dark; g.fillRect(x, rnd(i * 13 + j) * h, w / n, 2); }
    }
  }, [1, 1]);
}

function barkTexture(kit: Kit) {
  return kit.track(ghostGumBarkTexture([2, 1], 256));
}

/** Draws the official RELIQS wordmark onto a canvas, Q in the given colour. */
function drawWordmark(g: CanvasRenderingContext2D, cx: number, cy: number, width: number, qColour: string) {
  const k = width / RELIQS_WORDMARK_VIEWBOX.width;
  g.save();
  g.translate(cx - width / 2, cy - (RELIQS_WORDMARK_VIEWBOX.height * k) / 2);
  g.scale(k, k);
  g.fillStyle = "#ffffff";
  g.fill(new Path2D(RELIQS_WORDMARK_PATHS.reli));
  g.fill(new Path2D(RELIQS_WORDMARK_PATHS.s));
  g.fillStyle = qColour;
  g.fill(new Path2D(RELIQS_WORDMARK_PATHS.castleQ));
  g.restore();
}

function lantern(kit: Kit, group: THREE.Group, updates: Array<(t: number, reduce: boolean) => void>, x: number, y: number, z: number, strength = 1.4) {
  const g = new THREE.Group();
  g.add(at(kit.mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), "#3b2a1c"), 0, 0.6, 0));
  g.add(at(kit.mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.7, 8), "#fff1c8", { emissive: "#ffb85c", emissiveIntensity: 1.6, roughness: 0.3 }), 0, -0.1, 0));
  g.add(at(kit.mesh(new THREE.ConeGeometry(0.42, 0.3, 8), "#3b2a1c"), 0, 0.38, 0));
  const light = new THREE.PointLight("#ffb85c", strength, 9, 2);
  light.position.set(0, -0.2, 0);
  g.add(light);
  g.position.set(x, y, z);
  group.add(g);
  const phase = x * 3;
  updates.push((t, reduce) => { if (reduce) return; g.rotation.z = Math.sin(t * 1.3 + phase) * 0.04; light.intensity = strength * LIGHT_UNITS * (0.92 + Math.sin(t * 7 + phase) * 0.05); });
}

function fairyLights(kit: Kit, group: THREE.Group, updates: Array<(t: number, reduce: boolean) => void>, points: Array<[number, number, number]>) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  group.add(kit.mesh(new THREE.TubeGeometry(curve, 60, 0.015, 4, false), "#2a1c12"));
  const colours = ["#fff1b0", "#ffc6f0", "#bfe9ff"];
  const bulbs: THREE.MeshStandardMaterial[] = [];
  const bulb = kit.track(new THREE.SphereGeometry(0.07, 8, 8));
  for (let i = 0; i <= 28; i++) {
    const material = kit.track(new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: colours[i % 3], emissiveIntensity: 2 }));
    const b = new THREE.Mesh(bulb, material);
    b.position.copy(curve.getPoint(i / 28)).add(new THREE.Vector3(0, -0.08, 0));
    group.add(b);
    bulbs.push(material);
  }
  updates.push((t, reduce) => { if (!reduce) bulbs.forEach((m, i) => { m.emissiveIntensity = 1.4 + Math.sin(t * 2 + i * 0.9) * 0.7; }); });
}

function gumLeafFrame(kit: Kit) {
  const texture = kit.canvas(1024, 768, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const colours = ["#3f8a34", "#5aa646", "#2f6f2a", "#6fb552"];
    for (let i = 0; i < 70; i++) {
      const edge = i % 4;
      const x = edge === 0 ? rnd(i) * w : edge === 1 ? rnd(i) * w * 0.16 : edge === 2 ? w - rnd(i) * w * 0.16 : rnd(i) * w;
      const y = edge === 0 ? rnd(i + 1) * h * 0.18 : edge === 3 ? h - rnd(i + 1) * h * 0.12 : rnd(i + 1) * h;
      g.save(); g.translate(x, y); g.rotate(rnd(i + 2) * Math.PI * 2); g.fillStyle = colours[i % 4];
      g.beginPath(); g.ellipse(0, 0, 10 + rnd(i + 3) * 14, 40 + rnd(i + 4) * 30, 0, 0, Math.PI * 2); g.fill(); g.restore();
    }
  });
  return kit.track(new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, fog: false }));
}

// ---------- main room ----------
/** The main room; its window painting can change without rebuilding the room. */
export type MainTreehouseRoom = TreehouseRoom & { setView: (view: THREE.Texture) => void };

export function buildMainRoom(): MainTreehouseRoom {
  const kit = new Kit();
  const g = new THREE.Group();
  const updates: Array<(t: number, reduce: boolean) => void> = [];
  const wallTex = planks(kit, "#a8693a", "#5b3417", "#c4844c");
  const floorTex = planks(kit, "#9b5f33", "#4f2c13", "#b8773f"); floorTex.repeat.set(3, 3);
  const rugTex = kit.canvas(512, 512, (c, w, h) => {
    const cs = ["#7a2f4f", "#c94df2", "#f5c04a", "#2f7fb8", "#3a9a6a", "#e8d9b0"];
    for (let i = 0; i < 12; i++) { c.fillStyle = cs[i % cs.length]; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - i * 20, 0, Math.PI * 2); c.fill(); }
  });
  g.add(new THREE.HemisphereLight("#ffe6c2", "#4a2c18", 0.75));
  const sun = new THREE.DirectionalLight("#cfe6ff", 0.9);
  sun.position.set(0, 9, -18); sun.target.position.set(0, 0, 2); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, far: 40 });
  g.add(sun, sun.target);
  const R = 8.6, H = 7.4, WC = 4.1, WR = 2.9;
  g.add(at(kit.mesh(new THREE.CylinderGeometry(R + 0.2, R + 0.2, 0.4, 64), kit.mat("#ffffff", { map: floorTex, roughness: 0.6 })), 0, -0.2, 0));
  const rug = at(kit.mesh(new THREE.CircleGeometry(3.6, 64), kit.mat("#ffffff", { map: rugTex, roughness: 0.9 })), 0, 0.02, 0.8);
  rug.rotation.x = -Math.PI / 2; g.add(rug);
  // Curved plank walls. Behind the window, one curved panel with a round hole
  // masked out of it, so the window edge is a clean circle.
  const wallMat = kit.mat("#ffffff", { map: wallTex, roughness: 0.65 });
  const N = 72, plank = kit.track(new THREE.BoxGeometry(1, 1, 0.32));
  const innerR = R - 0.16, span = Math.asin((WR + 0.9) / innerR);
  const still = new THREE.Group(), shelves = new THREE.Group(); // baked into a few draw calls below
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2, pw = (2 * Math.PI * R) / N + 0.02;
    if (Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2))) < span) continue;
    const p = new THREE.Mesh(plank, wallMat);
    p.scale.set(pw, H, 1); p.position.set(Math.cos(a) * R, H / 2, Math.sin(a) * R); p.rotation.y = -a + Math.PI / 2; p.receiveShadow = true;
    still.add(p);
  }
  // The panel overlaps the neighbouring planks by half a plank so no seam shows.
  const panelSpan = span + Math.PI / N + 0.01, panelWidth = 2 * panelSpan * innerR;
  const holeMask = kit.canvas(512, 512, (c, w, h) => {
    c.fillStyle = "#ffffff"; c.fillRect(0, 0, w, h);
    c.fillStyle = "#000000"; c.beginPath(); c.ellipse(w / 2, (1 - WC / H) * h, (WR / panelWidth) * w, (WR / H) * h, 0, 0, Math.PI * 2); c.fill();
  });
  const panelTex = kit.track(wallTex.clone()); panelTex.repeat.set(panelWidth / ((2 * Math.PI * R) / N), 1); panelTex.needsUpdate = true;
  const panel = kit.mesh(new THREE.CylinderGeometry(innerR, innerR, H, 48, 1, true, Math.PI - panelSpan, 2 * panelSpan), kit.mat("#ffffff", { map: panelTex, alphaMap: holeMask, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.65 }));
  panel.position.y = H / 2;
  g.add(panel);
  const darkWood = kit.mat("#5b3417", { roughness: 0.5 }), brass = kit.mat("#d9a441", { metalness: 0.75, roughness: 0.25 });
  g.add(at(kit.mesh(new THREE.TorusGeometry(WR, 0.24, 14, 64), darkWood), 0, WC, -R + 0.05));
  g.add(at(kit.mesh(new THREE.TorusGeometry(WR - 0.05, 0.05, 8, 64), brass), 0, WC, -R + 0.25));
  g.add(at(kit.mesh(new THREE.BoxGeometry(WR * 2, 0.1, 0.1), darkWood), 0, WC, -R + 0.05));
  g.add(at(kit.mesh(new THREE.BoxGeometry(0.1, WR * 2, 0.1), darkWood), 0, WC, -R + 0.05));
  g.add(at(kit.rbox(4.2, 0.3, 1.1, 0.12, "#7a4521"), 0, WC - WR - 0.05, -R + 0.6));
  // The view: the equipped skin's painting, framed by gum leaves for depth.
  // Dusk sky until the painting arrives, so the window is never a hole.
  const viewMaterial = kit.track(new THREE.MeshBasicMaterial({ color: "#c9a77a", fog: false }));
  const viewPlane = new THREE.Mesh(kit.track(new THREE.PlaneGeometry(34, 14.6)), viewMaterial);
  viewPlane.position.set(0, WC - 2.6, -R - 14); g.add(viewPlane);
  const leaves = new THREE.Mesh(kit.track(new THREE.PlaneGeometry(9, 7)), gumLeafFrame(kit));
  leaves.position.set(0, WC, -R - 1.4); g.add(leaves);
  const beam = new THREE.Mesh(kit.track(new THREE.CylinderGeometry(WR * 0.95, WR * 2.2, 12, 32, 1, true)), kit.track(new THREE.MeshBasicMaterial({ color: "#fff1d0", transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false })));
  beam.rotation.x = Math.PI / 2.4; beam.position.set(0, WC - 1.8, -R + 5.2); g.add(beam);
  g.add(at(kit.mesh(new THREE.ConeGeometry(R + 0.6, 4.6, 64, 1, true), kit.mat("#ffffff", { map: wallTex, side: THREE.DoubleSide, roughness: 0.7 })), 0, H + 2.3, 0));
  const rafter = kit.track(new THREE.BoxGeometry(0.28, 0.28, R * 1.05));
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; const b = new THREE.Mesh(rafter, darkWood); b.position.set(Math.cos(a) * R * 0.5, H + 2.1, Math.sin(a) * R * 0.5); b.lookAt(0, H + 4.6, 0); still.add(b); }
  // The ghost gum grows right through the room.
  const bark = kit.mat("#ffffff", { map: barkTexture(kit), roughness: 0.75 });
  g.add(at(kit.mesh(new THREE.CylinderGeometry(1.15, 1.5, H + 5, 20), bark), -6.2, (H + 5) / 2 - 0.4, -3.4));
  const limb = at(kit.mesh(new THREE.CylinderGeometry(0.55, 0.85, 11, 16), bark), -2.6, H + 1.7, -2.6);
  limb.rotation.z = Math.PI / 2.6; limb.rotation.y = 0.4; g.add(limb);
  ([[1.6, H + 2, -0.4], [3.3, H + 1.4, 0.6], [-0.8, H + 2.2, -2.6]] as const).forEach(([x, y, z], i) => g.add(at(kit.mesh(new THREE.IcosahedronGeometry(1.1 + i * 0.15, 1), ["#5aa646", "#4f9d3a", "#6fb552"][i], { flatShading: true, roughness: 0.6 }), x, y, z)));
  // Bookshelves.
  const bookColours = ["#c94df2", "#2f7fb8", "#e5484d", "#f5c04a", "#3a9a6a", "#f08a3c", "#6b4fd8"];
  [-Math.PI * 0.82, -Math.PI * 0.18, Math.PI * 0.15].forEach((a, k) => {
    const shelf = new THREE.Group();
    // An open bookcase: back panel and sides, so the books show.
    shelf.add(at(kit.rbox(3.2, 5, 0.12, 0.04, "#6b3d1d"), 0, 2.5, -0.42));
    [-1.55, 1.55].forEach((x) => shelf.add(at(kit.rbox(0.12, 5, 0.95, 0.04, "#6b3d1d"), x, 2.5, 0)));
    [0.35, 1.55, 2.75, 3.95].forEach((y) => shelf.add(at(kit.rbox(3, 0.12, 0.9, 0.04, "#8a5530"), 0, y, 0.05)));
    [0.42, 1.62, 2.82, 4.02].forEach((y, row) => {
      let bx = -1.35, i = k * 41 + row * 13;
      while (bx < 1.25) { const bw = 0.13 + rnd(i) * 0.12, bh = 0.6 + rnd(i + 4) * 0.4; shelf.add(at(kit.rbox(bw, bh, 0.5, 0.03, bookColours[Math.floor(rnd(i + 2) * bookColours.length)]), bx + bw / 2, y + bh / 2, 0.1)); bx += bw + 0.025; i++; }
    });
    shelf.position.set(Math.cos(a) * (R - 0.75), 0, Math.sin(a) * (R - 0.75)); shelf.rotation.y = -a - Math.PI / 2;
    shelves.add(shelf);
  });
  g.add(kit.merged(still, false), kit.merged(shelves, true));
  // Explorer's desk with a spinning globe, a telescope, a beanbag and a pet bed.
  const desk = new THREE.Group();
  desk.add(at(kit.rbox(3, 0.25, 1.4, 0.08, "#7a4521"), 0, 1.6, 0));
  ([[-1.3, -0.55], [1.3, -0.55], [-1.3, 0.55], [1.3, 0.55]] as const).forEach(([x, z]) => desk.add(at(kit.rbox(0.18, 1.6, 0.18, 0.06, "#5b3417"), x, 0.8, z)));
  const globe = at(kit.mesh(new THREE.SphereGeometry(0.42, 32, 20), "#2f8fc8", { roughness: 0.35 }), -0.8, 2.28, 0);
  desk.add(globe, at(kit.mesh(new THREE.TorusGeometry(0.5, 0.035, 8, 32), brass), -0.8, 2.28, 0), at(kit.rbox(0.3, 0.4, 0.3, 0.05, "#5b3417"), -0.8, 1.85, 0), at(kit.rbox(1.2, 0.03, 0.9, 0.01, "#f1e2bf"), 0.6, 1.74, 0));
  desk.position.set(4.6, 0, -4.8); desk.rotation.y = -0.75; g.add(desk);
  updates.push((t, reduce) => { globe.rotation.y = reduce ? 0 : t * 0.4; });
  const scope = new THREE.Group();
  scope.add(at(kit.mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 6), brass), -0.35, 0.9, 0), at(kit.mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 6), brass), 0.35, 0.9, 0));
  const tube = at(kit.mesh(new THREE.CylinderGeometry(0.16, 0.24, 2.2, 16), brass), 0, 2, 0); tube.rotation.x = -1; scope.add(tube);
  scope.position.set(-2.4, 0, -6.4); scope.rotation.y = 0.25; g.add(scope);
  const bean = at(kit.mesh(new THREE.SphereGeometry(1, 24, 16), "#c94df2", { roughness: 0.85 }), 3.4, 0.6, 2.4); bean.scale.set(1.15, 0.6, 1.15); g.add(bean);
  const bed = at(kit.mesh(new THREE.TorusGeometry(0.7, 0.28, 12, 24), "#2f7fb8", { roughness: 0.9 }), -3.6, 0.28, 3.2); bed.rotation.x = Math.PI / 2; g.add(bed);
  // Ladder up to the Hall of Legends and the glowing hatch down to the Gem Cave.
  const ladder = new THREE.Group();
  [-0.5, 0.5].forEach((x) => ladder.add(at(kit.rbox(0.16, 8, 0.16, 0.05, "#7a4521"), x, 4, 0)));
  for (let y = 0.5; y < 8; y += 0.65) ladder.add(at(kit.rbox(1, 0.12, 0.14, 0.04, "#9b6a3a"), 0, y, 0));
  ladder.position.set(-4.8, 0, -5.6); ladder.rotation.set(-0.12, 0.6, 0); g.add(ladder);
  const hatch = new THREE.Group();
  hatch.add(at(kit.rbox(2.2, 0.16, 2.2, 0.08, "#5b3417"), 0, 0.04, 0));
  const hatchGlow = kit.track(new THREE.MeshBasicMaterial({ color: "#b04cf0" }));
  const hatchPane = new THREE.Mesh(kit.track(new THREE.PlaneGeometry(1.7, 1.7)), hatchGlow); hatchPane.rotation.x = -Math.PI / 2; hatchPane.position.y = 0.13; hatch.add(hatchPane);
  const hatchLight = new THREE.PointLight("#c94df2", 1.6, 5, 2); hatchLight.position.set(0, 0.6, 0); hatch.add(hatchLight);
  hatch.position.set(-1.2, 0, 4.4); g.add(hatch);
  updates.push((t, reduce) => { hatchGlow.color.setHSL(0.78, 0.8, 0.5 + (reduce ? 0 : Math.sin(t * 2) * 0.08)); });
  // Signs: the RELIQS wordmark pointing up the ladder, and the Gem Cave below.
  const signBoard = (draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) => kit.canvas(512, 160, (c, w, h) => {
    c.fillStyle = "#6b3d1d"; c.fillRect(0, 0, w, h); c.strokeStyle = "#d9a441"; c.lineWidth = 10; c.strokeRect(6, 6, w - 12, h - 12); draw(c, w, h);
  });
  const reliqsSign = signBoard((c, w, h) => { drawWordmark(c, w / 2 - 34, h / 2, 330, "#F5C04A"); c.fillStyle = "#F5C04A"; c.font = "900 64px Montserrat, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("↑", w - 62, h / 2 + 4); });
  const caveSign = signBoard((c, w, h) => { c.fillStyle = "#E9B8FA"; c.font = "900 42px Montserrat, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("GEM CAVE ↓", w / 2, h / 2 + 4); });
  const sign = (texture: THREE.Texture, x: number, y: number, z: number, ry: number) => g.add(at(kit.mesh(new THREE.PlaneGeometry(2.4, 0.75), kit.mat("#ffffff", { map: texture, roughness: 0.6 })), x, y, z, ry));
  sign(reliqsSign, -4.2, 6.6, -5.2, 0.6);
  sign(caveSign, -1.2, 1.4, 5.7, Math.PI);
  // Wardrobe corner (left wall): a gold-framed mirror and a rack of outfits. Opens Explorer Outfit.
  const wardrobe = new THREE.Group();
  wardrobe.add(at(kit.rbox(1.5, 3.2, 0.18, 0.08, brass), 0, 1.8, 0));
  wardrobe.add(at(kit.mesh(new THREE.PlaneGeometry(1.24, 2.9), "#dcecf7", { metalness: 0.6, roughness: 0.1, emissive: "#9cc3de", emissiveIntensity: 0.35 }), 0, 1.8, 0.1));
  const shine = at(new THREE.Mesh(kit.track(new THREE.PlaneGeometry(0.16, 2.2)), kit.track(new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.45 }))), -0.2, 1.95, 0.11);
  shine.rotation.z = -0.35; wardrobe.add(shine);
  wardrobe.add(at(kit.rbox(1.7, 0.2, 0.6, 0.06, darkWood), 0, 0.1, 0.1));
  const rack = new THREE.Group();
  [-0.9, 0.9].forEach((x) => rack.add(at(kit.mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 8), brass), x, 1.3, 0)));
  const bar = at(kit.mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.9, 8), brass), 0, 2.55, 0); bar.rotation.z = Math.PI / 2; rack.add(bar);
  (["#c94df2", "#2dd4bf", "#f5c04a"] as const).forEach((colour, i) => {
    const x = -0.55 + i * 0.55;
    rack.add(at(kit.mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 12, Math.PI), brass), x, 2.45, 0));
    rack.add(at(kit.rbox(0.5, 0.8, 0.12, 0.05, colour), x, 1.95, 0));
  });
  rack.position.set(1.7, 0, 0.1);
  wardrobe.add(rack);
  wardrobe.position.set(-7.4, 0, 1.2); wardrobe.rotation.y = Math.PI / 2;
  g.add(wardrobe);
  // Trading post (right wall): striped awning, counter, treasure chest, gem jar and coins. Opens the Marketplace.
  const shop = new THREE.Group();
  shop.add(at(kit.rbox(2.6, 1.1, 0.9, 0.1, "#8a5530"), 0, 0.55, 0), at(kit.rbox(2.8, 0.14, 1.05, 0.05, "#c08a55"), 0, 1.16, 0));
  [-1.25, 1.25].forEach((x) => shop.add(at(kit.mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.9, 8), darkWood), x, 1.45, -0.35)));
  for (let i = 0; i < 6; i++) {
    const stripe = at(kit.mesh(new THREE.BoxGeometry(0.48, 0.05, 1.2), i % 2 ? "#fff1d6" : "#e5484d"), -1.2 + i * 0.48, 2.85, 0.15);
    stripe.rotation.x = 0.35; shop.add(stripe);
  }
  shop.add(at(kit.rbox(0.7, 0.45, 0.45, 0.06, "#6b3d1d"), -0.75, 1.46, 0), at(kit.rbox(0.74, 0.12, 0.49, 0.04, brass), -0.75, 1.72, 0));
  const jar = at(kit.mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.5, 16), "#dff4ff", { transparent: true, opacity: 0.45, roughness: 0.05 }), 0.15, 1.48, 0);
  shop.add(jar);
  ["#c94df2", "#5fe0ff", "#f5c04a", "#7dd36b"].forEach((colour, i) => shop.add(at(kit.mesh(new THREE.OctahedronGeometry(0.08, 0), colour, { emissive: colour, emissiveIntensity: 0.6, flatShading: true }), 0.08 + (i % 2) * 0.14, 1.32 + Math.floor(i / 2) * 0.14, 0)));
  for (let i = 0; i < 4; i++) shop.add(at(kit.mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 16), "#f5c04a", { metalness: 0.7, roughness: 0.3 }), 0.85, 1.26 + i * 0.055, 0));
  shop.position.set(7.3, 0, -0.4); shop.rotation.y = -Math.PI / 2;
  g.add(shop);
  const shopSign = signBoard((c, w, h) => { c.fillStyle = "#F5C04A"; c.font = "900 40px Montserrat, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("TRADING POST", w / 2, h / 2 + 4); });
  const wardrobeSign = signBoard((c, w, h) => { c.fillStyle = "#E9B8FA"; c.font = "900 42px Montserrat, Arial"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("WARDROBE", w / 2, h / 2 + 4); });
  sign(shopSign, 7.6, 3.75, -0.4, -Math.PI / 2);
  sign(wardrobeSign, -7.7, 3.9, 2.05, Math.PI / 2);
  lantern(kit, g, updates, -1.8, 6.4, 1.2, 1.6); lantern(kit, g, updates, 2.8, 6.2, -1.6, 1.4); lantern(kit, g, updates, 0.6, 6.6, 4.2, 1.2);
  fairyLights(kit, g, updates, [[-6.8, 6.2, -3.8], [-3, 5.4, -6.6], [0, 5.9, -7.4], [3.2, 5.3, -6.8], [6.6, 6, -3.6]]);
  return {
    group: finishRoom(g),
    update: (t, r) => updates.forEach((u) => u(t, r)),
    dispose: () => kit.dispose(),
    setView: (view) => {
      viewMaterial.map = view;
      viewMaterial.color.set("#ffffff");
      viewMaterial.needsUpdate = true;
    },
    eye: new THREE.Vector3(-0.4, 4.4, 6.9), yaw: Math.PI + 0.12, pitch: -0.06, background: "#1b120b",
  };
}

// ---------- Gem Cave ----------
const GEM_COLOURS = ["#c94df2", "#5fe0ff", "#f5c04a", "#7dd36b", "#fb7185", "#8b5cf6", "#2dd4bf", "#f08a3c"];
/** Nooks light up for the gems a student has; the rest stay as dim glass waiting to be earned. */
export function buildGemCave(gemsShown: number): TreehouseRoom {
  const kit = new Kit();
  const g = new THREE.Group();
  const updates: Array<(t: number, reduce: boolean) => void> = [];
  g.add(new THREE.HemisphereLight("#9b86e0", "#2a1f3a", 0.6));
  const key = new THREE.DirectionalLight("#e7dcff", 0.5); key.position.set(4, 14, 8); key.castShadow = true; g.add(key);
  g.add(at(kit.mesh(new THREE.CylinderGeometry(11, 11, 0.6, 48), "#3e3352", { roughness: 0.85 }), 0, -0.3, 0));
  const pool = at(kit.mesh(new THREE.CircleGeometry(2.6, 40), "#4fc3ff", { emissive: "#2a6fd8", emissiveIntensity: 0.6, roughness: 0.05, metalness: 0.2 }), -3.6, 0.03, 2.4);
  pool.rotation.x = -Math.PI / 2; g.add(pool);
  const rockMats = ["#5b4c78", "#4f416a", "#66568a"].map((c) => kit.mat(c, { flatShading: true, roughness: 0.85 }));
  const rockGeo = kit.track(new THREE.DodecahedronGeometry(1, 0)), rockWall = new THREE.Group();
  for (let i = 0; i < 70; i++) {
    const a = (i / 70) * Math.PI * 2, r = 10.2 + rnd(i) * 0.8, s = 1.5 + rnd(i * 3) * 0.8;
    const rock = new THREE.Mesh(rockGeo, rockMats[i % 3]); rock.scale.setScalar(s); rock.position.set(Math.cos(a) * r, (i % 4) * 1.8 + 0.8, Math.sin(a) * r); rock.rotation.set(i, i * 2, i * 3);
    rockWall.add(rock);
  }
  g.add(kit.merged(rockWall, false));
  const dome = at(kit.mesh(new THREE.SphereGeometry(11.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), "#2d2440", { side: THREE.BackSide, flatShading: true, roughness: 0.9 }), 0, 5, 0);
  g.add(dome);
  const bark = kit.mat("#ffffff", { map: barkTexture(kit), roughness: 0.8 });
  ([[-2, 10, -3, 0.5], [3, 10.4, -1, 0.4], [0, 10.8, 3, 0.45], [-5, 9.6, 1, 0.35]] as const).forEach(([x, y, z, r], i) => {
    const root = at(kit.mesh(new THREE.CylinderGeometry(r * 0.4, r, 6, 10), bark), x, y, z); root.rotation.z = (rnd(i) - 0.5) * 0.8; root.rotation.x = (rnd(i + 1) - 0.5) * 0.6; g.add(root);
  });
  const gemGeo = kit.track(new THREE.OctahedronGeometry(0.42, 0));
  for (let i = 0; i < 8; i++) {
    const a = Math.PI * (0.95 + i * 0.16), owned = i < gemsShown;
    const nook = new THREE.Group();
    nook.add(at(kit.rbox(1.7, 2.3, 1.2, 0.4, "#2b2140"), 0, 1.15, -0.2), at(kit.rbox(1.5, 0.2, 1.2, 0.06, "#6b5a8a"), 0, 0.2, 0));
    const gem = new THREE.Mesh(gemGeo, owned ? kit.mat(GEM_COLOURS[i], { emissive: GEM_COLOURS[i], emissiveIntensity: 1.1, roughness: 0.12, flatShading: true }) : kit.mat("#2a2238", { transparent: true, opacity: 0.55, flatShading: true }));
    gem.position.set(0, 1.2, 0.1); nook.add(gem);
    if (owned) {
      const light = new THREE.PointLight(GEM_COLOURS[i], 1.1, 4.5, 2); light.position.set(0, 1.3, 0.9); nook.add(light);
      updates.push((t, reduce) => { gem.rotation.y = t * 1.1 + i; gem.position.y = 1.2 + (reduce ? 0 : Math.sin(t * 1.6 + i) * 0.1); });
    }
    nook.position.set(Math.cos(a) * 7.4, 0, Math.sin(a) * 7.4); nook.lookAt(0, 0, 0);
    g.add(nook);
  }
  // Centre stand with the rarest gem: the centrepiece that opens the Gem Vault.
  g.add(at(kit.rbox(2.4, 1.1, 2.4, 0.45, "#4b3d66"), 0, 0.55, 0), at(kit.mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.25, 24), "#d9a441", { metalness: 0.75, roughness: 0.25 }), 0, 1.2, 0));
  const big = at(kit.mesh(new THREE.OctahedronGeometry(0.85, 0), "#d86bf7", { emissive: "#c94df2", emissiveIntensity: 1.2, roughness: 0.1, flatShading: true }), 0, 2.5, 0);
  g.add(big);
  updates.push((t, reduce) => { if (reduce) return; big.rotation.y = t * 0.8; big.rotation.x = Math.sin(t * 0.6) * 0.3; });
  const bigLight = new THREE.PointLight("#d86bf7", 2.2, 10, 2); bigLight.position.set(0, 3.4, 1.6); g.add(bigLight);
  const crystalGeo = kit.track(new THREE.OctahedronGeometry(1, 0));
  for (let i = 0; i < 22; i++) {
    const c = new THREE.Mesh(crystalGeo, kit.mat(GEM_COLOURS[i % 8], { emissive: GEM_COLOURS[i % 8], emissiveIntensity: 0.9, flatShading: true }));
    const a = rnd(i + 3) * Math.PI * 2, r = 8.8 + rnd(i + 4); c.scale.setScalar(0.16 + rnd(i) * 0.22); c.position.set(Math.cos(a) * r, 0.25 + rnd(i + 5) * 0.4, Math.sin(a) * r); c.rotation.set(i, i, i);
    g.add(c);
  }
  const ladder = new THREE.Group();
  [-0.5, 0.5].forEach((x) => ladder.add(at(kit.rbox(0.16, 9, 0.16, 0.05, "#7a4521"), x, 4.5, 0)));
  for (let y = 0.5; y < 9; y += 0.65) ladder.add(at(kit.rbox(1, 0.12, 0.14, 0.04, "#9b6a3a"), 0, y, 0));
  ladder.position.set(4.8, 0, 4.6); g.add(ladder);
  const hatchLight = new THREE.PointLight("#ffc070", 1.4, 6, 2); hatchLight.position.set(4.8, 9, 4.6); g.add(hatchLight);
  return { group: finishRoom(g), update: (t, r) => updates.forEach((u) => u(t, r)), dispose: () => kit.dispose(), eye: new THREE.Vector3(0.6, 4.4, 8.2), yaw: Math.PI + 0.05, pitch: -0.2, background: "#140c22" };
}

// ---------- Hall of Legends (RELIQS) ----------
const REALM_ORDER = ["number-nexus", "measurelands", "starpath", "pattern-peaks", "statistica", "chance-hollow"] as const;
export function buildHallOfLegends(): TreehouseRoom {
  const kit = new Kit();
  const g = new THREE.Group();
  const updates: Array<(t: number, reduce: boolean) => void> = [];
  g.add(new THREE.HemisphereLight("#ffe6c2", "#4a2c18", 0.6));
  const key = new THREE.DirectionalLight("#fff0d0", 0.7); key.position.set(0, 16, 10); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14 }); g.add(key);
  const R = 10;
  const wallTex = planks(kit, "#a8693a", "#5b3417", "#c4844c");
  const floorTex = planks(kit, "#9b5f33", "#4f2c13", "#b8773f"); floorTex.repeat.set(3, 3);
  g.add(at(kit.mesh(new THREE.CylinderGeometry(R + 0.2, R + 0.2, 0.4, 64), kit.mat("#ffffff", { map: floorTex, roughness: 0.6 })), 0, -0.2, 0));
  const carpet = at(kit.mesh(new THREE.PlaneGeometry(3, 18), "#a3203a", { roughness: 0.9 }), 0, 0.02, 0); carpet.rotation.x = -Math.PI / 2; g.add(carpet);
  const gold = kit.mat("#d9a441", { metalness: 0.7, roughness: 0.3 });
  [-1.5, 1.5].forEach((x) => { const trim = at(kit.mesh(new THREE.PlaneGeometry(0.12, 18), gold), x, 0.03, 0); trim.rotation.x = -Math.PI / 2; g.add(trim); });
  const wallMat = kit.mat("#ffffff", { map: wallTex, roughness: 0.65 }), wallGeo = kit.track(new THREE.BoxGeometry((2 * Math.PI * R) / 80 + 0.02, 9, 0.34));
  const hallWalls = new THREE.Group();
  for (let i = 0; i < 80; i++) { const a = (i / 80) * Math.PI * 2; const p = new THREE.Mesh(wallGeo, wallMat); p.position.set(Math.cos(a) * R, 4.5, Math.sin(a) * R); p.rotation.y = -a + Math.PI / 2; p.receiveShadow = true; hallWalls.add(p); }
  g.add(kit.merged(hallWalls, false));
  g.add(at(kit.mesh(new THREE.ConeGeometry(R + 0.6, 5, 64, 1, true), kit.mat("#ffffff", { map: wallTex, side: THREE.DoubleSide, roughness: 0.7 })), 0, 11.5, 0));
  const skylight = at(new THREE.Mesh(kit.track(new THREE.CircleGeometry(1.6, 32)), kit.track(new THREE.MeshBasicMaterial({ color: "#fff2c8" }))), 0, 13.6, 0); skylight.rotation.x = Math.PI / 2; g.add(skylight);
  g.add(at(new THREE.Mesh(kit.track(new THREE.CylinderGeometry(1.4, 3.4, 13, 32, 1, true)), kit.track(new THREE.MeshBasicMaterial({ color: "#fff2c8", transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false }))), 0, 7, 0));
  // One framed RELIQ per realm along the carpet, in the official realm colours.
  const card = (colour: string) => kit.canvas(256, 360, (c, w, h) => {
    c.fillStyle = "#1b1626"; c.fillRect(0, 0, w, h);
    const gr = c.createRadialGradient(w / 2, h * 0.42, 10, w / 2, h * 0.42, w * 0.6); gr.addColorStop(0, colour); gr.addColorStop(1, "#1b1626"); c.fillStyle = gr; c.fillRect(10, 10, w - 20, h * 0.62);
    c.fillStyle = "#fff"; c.globalAlpha = 0.9; c.beginPath(); c.moveTo(w / 2, h * 0.16); c.lineTo(w * 0.7, h * 0.42); c.lineTo(w / 2, h * 0.66); c.lineTo(w * 0.3, h * 0.42); c.closePath(); c.fill(); c.globalAlpha = 1;
    c.fillStyle = colour; c.fillRect(10, h * 0.76, w - 20, 8);
    drawWordmark(c, w / 2, h * 0.87, w * 0.62, colour);
  });
  REALM_ORDER.forEach((realm, i) => {
    const colour = getReliqsColor(realm), side = i < 3 ? -1 : 1, z = -5 + (i % 3) * 4;
    const stand = new THREE.Group();
    stand.add(at(kit.rbox(1.6, 1.4, 1, 0.2, "#5b3417"), 0, 0.7, 0), at(kit.rbox(2.2, 3, 0.22, 0.1, gold), 0, 3, 0));
    const face = kit.mat("#ffffff", { map: card(colour), emissive: colour, emissiveIntensity: 0.18, roughness: 0.5 }) as THREE.MeshStandardMaterial;
    stand.add(at(kit.mesh(new THREE.PlaneGeometry(1.8, 2.55), face), 0, 3, 0.13));
    const light = new THREE.PointLight(colour, 1.2, 6, 2); light.position.set(0, 3.4, 1.6); stand.add(light);
    stand.position.set(side * 5.4, 0, z); stand.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    g.add(stand);
    updates.push((t, reduce) => { face.emissiveIntensity = 0.14 + (reduce ? 0 : Math.sin(t * 1.5 + i) * 0.06); });
  });
  // Chronorok RELIQS on the back wall.
  const chrono = getReliqsColor("chronorok");
  for (let k = 0; k < 7; k++) {
    const a = -Math.PI / 2 + (k - 3) * 0.16, x = Math.cos(a) * (R - 0.35), z = Math.sin(a) * (R - 0.35);
    const frame = new THREE.Group();
    frame.add(kit.rbox(1.3, 1.8, 0.12, 0.06, gold), at(kit.mesh(new THREE.PlaneGeometry(1.06, 1.54), kit.mat("#ffffff", { map: card(chrono), emissive: chrono, emissiveIntensity: 0.2 })), 0, 0, 0.07));
    frame.position.set(x, 5.4, z); frame.lookAt(0, 5.4, 0);
    g.add(frame);
  }
  // The banner: the official RELIQS wordmark, clear of the curved wall.
  const banner = kit.canvas(1024, 300, (c, w, h) => {
    c.fillStyle = "#7a1f33"; c.fillRect(0, 0, w, h); c.strokeStyle = "#d9a441"; c.lineWidth = 14; c.strokeRect(10, 10, w - 20, h - 20); c.lineWidth = 3; c.strokeRect(30, 30, w - 60, h - 60);
    drawWordmark(c, w / 2, h / 2, 760, "#F5C04A");
  });
  g.add(at(kit.mesh(new THREE.PlaneGeometry(5.4, 1.58), kit.mat("#ffffff", { map: banner, roughness: 0.7 })), 0, 7.7, -R + 1.3));
  lantern(kit, g, updates, -3.6, 8.4, 0); lantern(kit, g, updates, 3.6, 8.4, 0); lantern(kit, g, updates, 0, 8.6, -5, 1.2);
  return { group: finishRoom(g), update: (t, r) => updates.forEach((u) => u(t, r)), dispose: () => kit.dispose(), eye: new THREE.Vector3(0.4, 4.8, 8.8), yaw: Math.PI, pitch: -0.08, background: "#1a1208" };
}
