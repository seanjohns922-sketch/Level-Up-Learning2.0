import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputRoot = path.join(root, "public", "realmies", "3d");

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((result) => {
        this.result = result;
        this.onloadend?.();
      });
    }
  };
}

const colours = {
  cream: 0xfff3d0,
  navy: 0x143d4b,
  deepGreen: 0x185a47,
  forest: 0x25735b,
  teal: 0x22a79a,
  cyan: 0x55d7cf,
  gold: 0xe8ac31,
  brass: 0xc88b2c,
  timber: 0x8a5632,
  green: 0x58a94f,
  leaf: 0x86c85e,
  stone: 0x8d9a8c,
  darkStone: 0x52665d,
  white: 0xffffff,
  black: 0x101b1b,
};

const material = (color, roughness = 0.42, metalness = 0.03) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });
const materials = Object.fromEntries(
  Object.entries(colours).map(([key, value]) => [key, material(value)]),
);

const roundedBox = (w, h, d, radius = 0.16, segments = 4) =>
  new RoundedBoxGeometry(w, h, d, segments, Math.min(radius, w / 2, h / 2, d / 2));

const addMesh = (parent, geometry, meshMaterial, position, scale, rotation) => {
  const mesh = new THREE.Mesh(geometry, meshMaterial);
  mesh.position.set(...position);
  if (scale) mesh.scale.set(...scale);
  if (rotation) mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
};

const makeBase = (width = 3.5, depth = 2.65) => {
  const group = new THREE.Group();
  addMesh(group, roundedBox(width, 0.22, depth, 0.18), materials.stone, [0, 0.11, 0]);
  for (const x of [-1.1, -0.55, 0, 0.55, 1.1]) {
    addMesh(
      group,
      roundedBox(x === 0 ? 0.08 : 0.05, x === 0 ? 0.09 : 0.06, 0.42, 0.02),
      materials.darkStone,
      [x * (width / 3.5), 0.245, depth * 0.28],
    );
  }
  return group;
};

const makeEye = (x, y, z, iris = materials.teal, scale = 1) => {
  const group = new THREE.Group();
  addMesh(group, new THREE.SphereGeometry(0.24 * scale, 24, 18), materials.white, [x, y, z], [0.78, 1, 0.38]);
  addMesh(group, new THREE.SphereGeometry(0.14 * scale, 20, 16), iris, [x, y, z + 0.09], [0.76, 1, 0.42]);
  addMesh(group, new THREE.SphereGeometry(0.073 * scale, 18, 14), materials.black, [x, y, z + 0.14], [0.75, 1, 0.42]);
  addMesh(group, new THREE.SphereGeometry(0.032 * scale, 14, 10), materials.white, [x - 0.034, y + 0.052, z + 0.18], [0.82, 1, 0.45]);
  return group;
};

const makeSmile = (width = 0.23) => {
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-width, 0.05, 0),
    new THREE.Vector3(0, -0.11, 0.04),
    new THREE.Vector3(width, 0.05, 0),
  );
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 18, 0.034, 8), materials.black);
};

const addFace = (parent, y, z, gap = 0.34, scale = 0.9, iris = materials.teal) => {
  parent.add(makeEye(-gap, y, z, iris, scale));
  parent.add(makeEye(gap, y, z, iris, scale));
  const smile = makeSmile(0.21 * scale);
  smile.position.set(0, y - 0.3, z + 0.16);
  parent.add(smile);
};

const makeArm = (parent, side, y, shoulder, bodyMaterial, handMaterial = materials.cream) => {
  addMesh(
    parent,
    new THREE.CapsuleGeometry(0.22, 0.6, 8, 16),
    bodyMaterial,
    [side * shoulder, y, 0],
    null,
    [0, 0, side * -0.16],
  );
  addMesh(parent, new THREE.SphereGeometry(0.27, 20, 16), handMaterial, [side * (shoulder + 0.11), y - 0.46, 0.04], [1, 0.9, 0.9]);
};

const makeFoot = (parent, side, x, colour, width = 0.84) =>
  addMesh(
    parent,
    new THREE.SphereGeometry(0.5, 24, 18),
    colour,
    [side * x, 0.6, 0.22],
    [width / 0.78, 0.58, 1.18],
  );

const makeGaugekin = () => {
  const group = new THREE.Group();
  group.name = "Gaugekin";
  group.add(makeBase(3.4));
  addMesh(group, new THREE.SphereGeometry(1.25, 36, 26), materials.brass, [0, 2.72, 0], [1, 1, 0.64]);
  addMesh(group, new THREE.CylinderGeometry(1.03, 1.03, 0.2, 40), materials.cream, [0, 2.72, 0.78], null, [Math.PI / 2, 0, 0]);
  addMesh(group, new THREE.TorusGeometry(1.03, 0.13, 14, 40), materials.navy, [0, 2.72, 0.89]);
  addFace(group, 2.94, 0.98, 0.35, 0.82, materials.teal);
  const needle = roundedBox(0.13, 0.9, 0.08, 0.04);
  addMesh(group, needle, materials.gold, [0, 2.38, 1.03], null, [0, 0, -0.62]);
  addMesh(group, new THREE.SphereGeometry(0.13, 16, 12), materials.navy, [0, 2.31, 1.08]);
  for (const angle of [-0.95, -0.47, 0, 0.47, 0.95]) {
    addMesh(group, roundedBox(0.06, 0.22, 0.05, 0.02), materials.navy, [Math.sin(angle) * 0.79, 2.72 + Math.cos(angle) * 0.78, 1.02], null, [0, 0, -angle]);
  }
  makeArm(group, -1, 2.0, 1.12, materials.teal);
  makeArm(group, 1, 2.0, 1.12, materials.teal);
  addMesh(group, new THREE.CapsuleGeometry(0.22, 0.5, 8, 16), materials.brass, [-0.52, 1.12, 0]);
  addMesh(group, new THREE.CapsuleGeometry(0.22, 0.5, 8, 16), materials.brass, [0.52, 1.12, 0]);
  makeFoot(group, -1, 0.52, materials.teal);
  makeFoot(group, 1, 0.52, materials.teal);
  return group;
};

const makeRuleroot = () => {
  const group = new THREE.Group();
  group.name = "Ruleroot";
  group.add(makeBase(3.8));
  addMesh(group, new THREE.CapsuleGeometry(0.9, 1.45, 10, 26), materials.timber, [0, 2.05, 0], [1.02, 1, 0.9]);
  addMesh(group, roundedBox(1.55, 0.8, 0.18, 0.22), materials.navy, [0, 2.47, 0.83]);
  addFace(group, 2.55, 0.96, 0.34, 0.82, materials.leaf);
  const leafGeometry = new THREE.SphereGeometry(0.85, 28, 20);
  addMesh(group, leafGeometry, materials.green, [-0.72, 3.55, 0], [0.78, 1.25, 0.7], [0, 0, -0.22]);
  addMesh(group, leafGeometry, materials.leaf, [0, 3.83, 0], [0.82, 1.35, 0.72]);
  addMesh(group, leafGeometry, materials.green, [0.72, 3.55, 0], [0.78, 1.25, 0.7], [0, 0, 0.22]);
  for (const y of [3.34, 3.58, 3.82, 4.06, 4.3]) {
    addMesh(group, roundedBox(0.44, 0.055, 0.06, 0.02), materials.cream, [0, y, 0.72]);
  }
  makeArm(group, -1, 1.96, 0.99, materials.forest, materials.cream);
  makeArm(group, 1, 1.96, 0.99, materials.forest, materials.cream);
  makeFoot(group, -1, 0.58, materials.timber, 0.94);
  makeFoot(group, 1, 0.58, materials.timber, 0.94);
  addMesh(group, new THREE.SphereGeometry(0.48, 20, 16), materials.timber, [-0.92, 0.47, 0], [1.25, 0.45, 1]);
  addMesh(group, new THREE.SphereGeometry(0.48, 20, 16), materials.timber, [0.92, 0.47, 0], [1.25, 0.45, 1]);
  return group;
};

const makeCompassKeeper = () => {
  const group = new THREE.Group();
  group.name = "Compass Keeper";
  group.add(makeBase(4));
  addMesh(group, new THREE.CapsuleGeometry(0.98, 1.65, 10, 28), materials.deepGreen, [0, 2.25, 0], [1.02, 1, 0.94]);
  addMesh(group, new THREE.SphereGeometry(1.14, 32, 24), materials.forest, [0, 3.58, 0], [1, 1.03, 0.96]);
  addMesh(group, new THREE.SphereGeometry(0.91, 30, 22), materials.navy, [0, 3.48, 0.43], [1, 0.9, 0.72]);
  addFace(group, 3.52, 1.03, 0.35, 0.83, materials.cyan);
  addMesh(group, new THREE.CylinderGeometry(0.66, 0.66, 0.2, 36), materials.gold, [0, 2.18, 0.92], null, [Math.PI / 2, 0, 0]);
  addMesh(group, new THREE.CylinderGeometry(0.5, 0.5, 0.12, 36), materials.cream, [0, 2.18, 1.06], null, [Math.PI / 2, 0, 0]);
  const pointer = new THREE.Shape();
  pointer.moveTo(0, 0.48);
  pointer.lineTo(0.15, -0.18);
  pointer.lineTo(0, -0.08);
  pointer.lineTo(-0.15, -0.18);
  pointer.closePath();
  addMesh(group, new THREE.ExtrudeGeometry(pointer, { depth: 0.06, bevelEnabled: false }), materials.teal, [0, 2.18, 1.13]);
  makeArm(group, -1, 2.15, 1.06, materials.forest);
  makeArm(group, 1, 2.15, 1.06, materials.forest);
  makeFoot(group, -1, 0.61, materials.navy, 0.96);
  makeFoot(group, 1, 0.61, materials.navy, 0.96);
  addMesh(group, roundedBox(1.5, 1.2, 0.34, 0.16), materials.navy, [0, 2.28, -0.86]);
  return group;
};

const makeGoldenSurveyor = () => {
  const group = new THREE.Group();
  group.name = "Golden Surveyor";
  group.add(makeBase(4.35));
  addMesh(group, new THREE.CapsuleGeometry(1.08, 1.42, 10, 28), materials.deepGreen, [0, 2.25, 0], [1.12, 1, 0.92]);
  addMesh(group, new THREE.ConeGeometry(1.32, 1.55, 4, 1), materials.gold, [0, 4.15, 0], null, [0, Math.PI / 4, 0]);
  addMesh(group, new THREE.SphereGeometry(0.86, 30, 22), materials.cream, [0, 3.52, 0.34], [1, 0.92, 0.86]);
  addFace(group, 3.58, 1.03, 0.34, 0.82, materials.cyan);
  addMesh(group, roundedBox(1.55, 1.28, 0.2, 0.2), materials.teal, [0, 2.26, 0.91]);
  const mapLine = (x, y, rotation) =>
    addMesh(group, roundedBox(0.07, 0.72, 0.07, 0.025), materials.cream, [x, y, 1.05], null, [0, 0, rotation]);
  mapLine(-0.36, 2.3, -0.42);
  mapLine(0, 2.25, 0.45);
  mapLine(0.36, 2.3, -0.32);
  addMesh(group, new THREE.SphereGeometry(0.11, 16, 12), materials.gold, [0.34, 2.37, 1.11]);
  makeArm(group, -1, 2.25, 1.22, materials.gold);
  makeArm(group, 1, 2.25, 1.22, materials.gold);
  makeFoot(group, -1, 0.68, materials.navy, 1.06);
  makeFoot(group, 1, 0.68, materials.navy, 1.06);
  for (const x of [-0.45, 0, 0.45]) {
    addMesh(group, roundedBox(0.07, 1.2, 0.06, 0.025), materials.gold, [x, 2.3, -1.07], null, [0, 0, x * 0.55]);
  }
  return group;
};

const gltfExporter = new GLTFExporter();
const stlExporter = new STLExporter();
const exportGlb = (scene) =>
  new Promise((resolve, reject) => {
    gltfExporter.parse(scene, (result) => resolve(Buffer.from(result)), reject, {
      binary: true,
      onlyVisible: true,
      trs: false,
    });
  });

const exportModel = async (key, group) => {
  const directory = path.join(outputRoot, key);
  await fs.mkdir(directory, { recursive: true });
  group.traverse((node) => {
    if (node.isMesh) node.geometry.computeVertexNormals();
  });
  await fs.writeFile(path.join(directory, `${key}.glb`), await exportGlb(group));
  const stl = stlExporter.parse(group, { binary: true });
  await fs.writeFile(path.join(directory, `${key}.stl`), Buffer.from(stl.buffer, stl.byteOffset, stl.byteLength));
  const bounds = new THREE.Box3().setFromObject(group);
  const size = bounds.getSize(new THREE.Vector3());
  const metadata = {
    key,
    format_version: 1,
    units: "design units; scale to specification height before fabrication",
    dimensions: Object.fromEntries(["x", "y", "z"].map((axis, index) => [
      ["width", "height", "depth"][index],
      Number(size[axis].toFixed(3)),
    ])),
    files: [`${key}.glb`, `${key}.stl`],
    status: "digital_prototype",
    manufacturing_status: "requires professional sculpt, wall-thickness, tolerance and safety review",
  };
  await fs.writeFile(path.join(directory, "model-metadata.json"), `${JSON.stringify(metadata, null, 2)}\n`);
  return metadata;
};

const models = [
  ["measurelands-gaugekin", makeGaugekin()],
  ["measurelands-ruleroot", makeRuleroot()],
  ["measurelands-compass-keeper", makeCompassKeeper()],
  ["measurelands-golden-surveyor", makeGoldenSurveyor()],
];

await fs.mkdir(outputRoot, { recursive: true });
const results = [];
for (const [key, model] of models) results.push(await exportModel(key, model));
console.log(JSON.stringify(results, null, 2));
