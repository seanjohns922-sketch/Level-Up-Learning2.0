import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputRoot = path.join(root, "public", "realmies", "3d");
const fontPath = path.join(
  root,
  "node_modules",
  "three",
  "examples",
  "fonts",
  "helvetiker_bold.typeface.json",
);

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((result) => {
        this.result = result;
        this.onloadend?.();
      });
    }

    readAsDataURL(blob) {
      blob.arrayBuffer().then((result) => {
        const mime = blob.type || "application/octet-stream";
        this.result = `data:${mime};base64,${Buffer.from(result).toString("base64")}`;
        this.onloadend?.();
      });
    }
  };
}

const palette = {
  navy: 0x123b75,
  deepNavy: 0x092a59,
  cyan: 0x14b9e8,
  teal: 0x14c7c5,
  lime: 0xb7e51c,
  yellow: 0xf4bd29,
  purple: 0x6659df,
  violet: 0x8174ee,
  white: 0xf8fbff,
  black: 0x071321,
  grey: 0x657b96,
  base: 0x607995,
};

const material = (color, roughness = 0.35, metalness = 0.04) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const materials = Object.fromEntries(
  Object.entries(palette).map(([key, value]) => [key, material(value)]),
);

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

const roundedBox = (w, h, d, radius = 0.18, segments = 4) =>
  new RoundedBoxGeometry(w, h, d, segments, Math.min(radius, w / 2, h / 2, d / 2));

const makeBase = (width, depth = width * 0.78) => {
  const shape = new THREE.Shape();
  const cut = width * 0.16;
  const halfW = width / 2;
  const halfD = depth / 2;
  shape.moveTo(-halfW + cut, -halfD);
  shape.lineTo(halfW - cut, -halfD);
  shape.lineTo(halfW, -halfD + cut);
  shape.lineTo(halfW, halfD - cut);
  shape.lineTo(halfW - cut, halfD);
  shape.lineTo(-halfW + cut, halfD);
  shape.lineTo(-halfW, halfD - cut);
  shape.lineTo(-halfW, -halfD + cut);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.08,
    bevelThickness: 0.06,
  });
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, 0.11, 0);
  return new THREE.Mesh(geometry, materials.base);
};

const makeEye = (x, y, z, irisMaterial, scale = 1) => {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  addMesh(group, new THREE.SphereGeometry(0.25 * scale, 24, 18), materials.white, [0, 0, 0], [0.78, 1, 0.36]);
  addMesh(group, new THREE.SphereGeometry(0.15 * scale, 20, 16), irisMaterial, [0, -0.005, 0.09 * scale], [0.76, 1, 0.42]);
  addMesh(group, new THREE.SphereGeometry(0.078 * scale, 18, 14), materials.black, [0, -0.005, 0.145 * scale], [0.75, 1, 0.42]);
  addMesh(group, new THREE.SphereGeometry(0.035 * scale, 14, 10), materials.white, [-0.035 * scale, 0.055 * scale, 0.185 * scale], [0.82, 1, 0.45]);
  return group;
};

const makeSmile = (width = 0.32) => {
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-width, 0.06, 0),
    new THREE.Vector3(0, -0.12, 0.04),
    new THREE.Vector3(width, 0.06, 0),
  );
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, 20, 0.035, 8, false),
    materials.black,
  );
};

const makeFace = ({
  width = 1.5,
  height = 0.9,
  y = 3.45,
  z = 0.72,
  iris = materials.lime,
  eyeGap = 0.38,
  eyeScale = 1,
}) => {
  const group = new THREE.Group();
  addMesh(group, roundedBox(width, height, 0.18, 0.22), materials.deepNavy, [0, y, z]);
  group.add(makeEye(-eyeGap, y + 0.08, z + 0.13, iris, eyeScale));
  group.add(makeEye(eyeGap, y + 0.08, z + 0.13, iris, eyeScale));
  const smile = makeSmile(0.22 * eyeScale);
  smile.position.set(0, y - 0.22, z + 0.24);
  group.add(smile);
  return group;
};

const makeArm = (side, y, z, upperMaterial, cuffMaterial, length = 1.15, shoulder = 1.05) => {
  const group = new THREE.Group();
  const x = side * shoulder;
  addMesh(group, new THREE.CapsuleGeometry(0.25, length * 0.55, 8, 16), upperMaterial, [x, y, z], null, [0, 0, side * -0.18]);
  addMesh(group, new THREE.CylinderGeometry(0.28, 0.28, 0.2, 20), cuffMaterial, [x + side * 0.11, y - length * 0.43, z], null, [0, 0, side * -0.18]);
  addMesh(group, new THREE.SphereGeometry(0.3, 20, 16), materials.deepNavy, [x + side * 0.14, y - length * 0.62, z + 0.02], [1, 0.92, 0.9]);
  return group;
};

const makeFoot = (side, y, z, footMaterial, x = 0.54, width = 0.78) =>
  addMesh(
    new THREE.Group(),
    new THREE.SphereGeometry(0.5, 24, 18),
    footMaterial,
    [side * x, y, z],
    [width / 0.78, 0.58, 1.18],
  );

const addText = (parent, font, text, size, depth, meshMaterial, position, rotation = [0, 0, 0]) => {
  const geometry = new TextGeometry(text, {
    font,
    size,
    depth,
    curveSegments: 8,
    bevelEnabled: true,
    bevelThickness: depth * 0.18,
    bevelSize: depth * 0.12,
    bevelSegments: 2,
  });
  geometry.computeBoundingBox();
  const width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
  geometry.translate(-width / 2, -size / 2, 0);
  return addMesh(parent, geometry, meshMaterial, position, null, rotation);
};

const makeBitling = (font) => {
  const rootGroup = new THREE.Group();
  rootGroup.name = "Bitling";
  rootGroup.add(makeBase(3.25));
  addMesh(rootGroup, new THREE.SphereGeometry(1.05, 32, 24), materials.teal, [0, 2.72, 0], [1.03, 0.88, 0.92]);
  rootGroup.add(makeFace({ width: 1.64, height: 0.82, y: 2.9, z: 0.78, iris: materials.lime, eyeGap: 0.38, eyeScale: 0.88 }));
  addMesh(rootGroup, new THREE.CapsuleGeometry(0.75, 0.5, 8, 24), materials.deepNavy, [0, 1.65, 0], [1.08, 1, 0.9]);
  addMesh(rootGroup, roundedBox(1.22, 1.08, 0.2, 0.22), materials.lime, [0, 1.72, 0.75]);
  addText(rootGroup, font, "3", 0.72, 0.08, materials.yellow, [0, 1.76, 0.89]);
  addMesh(rootGroup, new THREE.CylinderGeometry(0.18, 0.24, 0.25, 20), materials.lime, [0, 3.78, 0]);
  addMesh(rootGroup, new THREE.CylinderGeometry(0.25, 0.25, 0.13, 20), materials.lime, [-1.03, 2.75, 0], null, [0, 0, Math.PI / 2]);
  rootGroup.add(makeArm(-1, 1.85, 0, materials.teal, materials.cyan, 0.78, 0.92));
  rootGroup.add(makeArm(1, 1.85, 0, materials.teal, materials.cyan, 0.78, 0.92));
  rootGroup.add(makeFoot(-1, 0.62, 0.18, materials.teal, 0.47, 0.82));
  rootGroup.add(makeFoot(1, 0.62, 0.18, materials.teal, 0.47, 0.82));
  addText(rootGroup, font, "1010", 0.18, 0.04, materials.deepNavy, [0, 2.72, -0.97], [0, Math.PI, 0]);
  return rootGroup;
};

const makeCarryBot = (font) => {
  const rootGroup = new THREE.Group();
  rootGroup.name = "CarryBot";
  rootGroup.add(makeBase(3.75));
  addMesh(rootGroup, roundedBox(2.0, 1.55, 1.55, 0.32), materials.cyan, [0, 3.05, 0]);
  rootGroup.add(makeFace({ width: 1.62, height: 0.78, y: 3.16, z: 0.88, iris: materials.cyan, eyeGap: 0.38, eyeScale: 0.85 }));
  addMesh(rootGroup, roundedBox(2.15, 1.48, 1.45, 0.28), materials.cyan, [0, 1.65, 0]);
  addMesh(rootGroup, roundedBox(1.45, 0.38, 0.22, 0.12), materials.yellow, [0, 1.62, 0.86]);
  addMesh(rootGroup, new THREE.CylinderGeometry(0.24, 0.24, 0.22, 20), materials.yellow, [0, 4.02, 0]);
  addMesh(rootGroup, new THREE.CylinderGeometry(0.3, 0.3, 0.22, 20), materials.deepNavy, [-1.1, 3.08, 0], null, [0, 0, Math.PI / 2]);
  addMesh(rootGroup, new THREE.CylinderGeometry(0.3, 0.3, 0.22, 20), materials.deepNavy, [1.1, 3.08, 0], null, [0, 0, Math.PI / 2]);
  rootGroup.add(makeArm(-1, 1.92, 0, materials.cyan, materials.deepNavy, 0.92, 1.18));
  rootGroup.add(makeArm(1, 1.92, 0, materials.cyan, materials.deepNavy, 0.92, 1.18));
  rootGroup.add(makeFoot(-1, 0.62, 0.2, materials.cyan, 0.58, 0.9));
  rootGroup.add(makeFoot(1, 0.62, 0.2, materials.cyan, 0.58, 0.9));
  addMesh(rootGroup, roundedBox(0.9, 1.42, 0.62, 0.16), materials.yellow, [0.64, 2.12, -0.95]);
  addText(rootGroup, font, "10", 0.3, 0.05, materials.deepNavy, [0.64, 2.14, -1.29], [0, Math.PI, 0]);
  return rootGroup;
};

const makeCodekeeper = (font) => {
  const rootGroup = new THREE.Group();
  rootGroup.name = "Codekeeper";
  rootGroup.add(makeBase(3.65));
  addMesh(rootGroup, new THREE.CapsuleGeometry(0.98, 1.7, 12, 28), materials.navy, [0, 2.4, 0], [1.02, 1, 0.96]);
  addMesh(rootGroup, new THREE.SphereGeometry(1.04, 32, 24), materials.navy, [0, 3.54, 0], [1, 0.98, 0.95]);
  rootGroup.add(makeFace({ width: 1.58, height: 0.82, y: 3.52, z: 0.84, iris: materials.purple, eyeGap: 0.37, eyeScale: 0.88 }));
  addMesh(rootGroup, roundedBox(1.48, 1.55, 0.22, 0.2), materials.purple, [0, 2.05, 0.86]);
  addMesh(rootGroup, new THREE.TorusGeometry(0.24, 0.08, 12, 28), materials.violet, [0, 2.32, 1.04]);
  addMesh(rootGroup, roundedBox(0.14, 0.55, 0.12, 0.05), materials.violet, [0, 1.94, 1.04]);
  addMesh(rootGroup, roundedBox(0.34, 0.13, 0.12, 0.04), materials.violet, [0.1, 1.73, 1.04]);
  addMesh(rootGroup, roundedBox(0.5, 0.3, 0.55, 0.12), materials.yellow, [0, 4.57, 0.04]);
  addMesh(rootGroup, new THREE.CylinderGeometry(0.27, 0.27, 0.2, 20), materials.yellow, [-1.02, 3.52, 0], null, [0, 0, Math.PI / 2]);
  addMesh(rootGroup, new THREE.CylinderGeometry(0.27, 0.27, 0.2, 20), materials.yellow, [1.02, 3.52, 0], null, [0, 0, Math.PI / 2]);
  rootGroup.add(makeArm(-1, 2.2, 0, materials.navy, materials.yellow, 1.08, 1.1));
  rootGroup.add(makeArm(1, 2.2, 0, materials.navy, materials.yellow, 1.08, 1.1));
  rootGroup.add(makeFoot(-1, 0.58, 0.2, materials.purple, 0.57, 0.92));
  rootGroup.add(makeFoot(1, 0.58, 0.2, materials.purple, 0.57, 0.92));
  addText(rootGroup, font, "001", 0.22, 0.04, materials.purple, [0, 2.65, -0.99], [0, Math.PI, 0]);
  return rootGroup;
};

const makeSentinel = (font) => {
  const rootGroup = new THREE.Group();
  rootGroup.name = "Neon Sentinel";
  rootGroup.add(makeBase(4.4));
  addMesh(rootGroup, new THREE.CapsuleGeometry(1.18, 1.25, 12, 30), materials.navy, [0, 2.25, 0], [1.12, 1, 0.92]);
  addMesh(rootGroup, new THREE.SphereGeometry(1.05, 32, 24), materials.navy, [0, 4.0, 0], [1.02, 0.92, 0.96]);
  rootGroup.add(makeFace({ width: 1.62, height: 0.8, y: 3.98, z: 0.86, iris: materials.lime, eyeGap: 0.39, eyeScale: 0.88 }));
  addMesh(rootGroup, roundedBox(0.48, 0.8, 0.48, 0.15), materials.lime, [0, 4.84, 0.02]);
  addMesh(rootGroup, new THREE.CylinderGeometry(0.34, 0.34, 0.22, 20), materials.cyan, [-1.04, 4.0, 0], null, [0, 0, Math.PI / 2]);
  addMesh(rootGroup, new THREE.CylinderGeometry(0.34, 0.34, 0.22, 20), materials.cyan, [1.04, 4.0, 0], null, [0, 0, Math.PI / 2]);
  addMesh(rootGroup, new THREE.SphereGeometry(0.76, 24, 18), materials.purple, [-1.32, 3.34, 0], [1.35, 0.55, 1.05], [0, 0, -0.22]);
  addMesh(rootGroup, new THREE.SphereGeometry(0.76, 24, 18), materials.purple, [1.32, 3.34, 0], [1.35, 0.55, 1.05], [0, 0, 0.22]);

  const shield = new THREE.Shape();
  shield.moveTo(-1.12, 0.65);
  shield.lineTo(1.12, 0.65);
  shield.lineTo(0.96, -0.65);
  shield.lineTo(0, -1.35);
  shield.lineTo(-0.96, -0.65);
  shield.closePath();
  const shieldGeometry = new THREE.ExtrudeGeometry(shield, {
    depth: 0.22,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.08,
    bevelThickness: 0.06,
  });
  addMesh(rootGroup, shieldGeometry, materials.cyan, [0, 2.62, 0.9]);
  addMesh(rootGroup, new THREE.CylinderGeometry(0.35, 0.35, 0.18, 24), materials.lime, [0, 2.55, 1.22], null, [Math.PI / 2, 0, 0]);
  rootGroup.add(makeArm(-1, 2.35, 0, materials.navy, materials.lime, 1.18, 1.35));
  rootGroup.add(makeArm(1, 2.35, 0, materials.navy, materials.lime, 1.18, 1.35));
  rootGroup.add(makeFoot(-1, 0.65, 0.25, materials.cyan, 0.72, 1.08));
  rootGroup.add(makeFoot(1, 0.65, 0.25, materials.cyan, 0.72, 1.08));
  addText(rootGroup, font, "11", 0.24, 0.05, materials.navy, [0, 2.55, -1.25], [0, Math.PI, 0]);
  return rootGroup;
};

const exporters = {
  gltf: new GLTFExporter(),
  stl: new STLExporter(),
};

const exportGlb = (scene) =>
  new Promise((resolve, reject) => {
    exporters.gltf.parse(
      scene,
      (result) => resolve(Buffer.from(result)),
      reject,
      {
        binary: true,
        onlyVisible: true,
        trs: false,
      },
    );
  });

const exportModel = async (key, group) => {
  const directory = path.join(outputRoot, key);
  await fs.mkdir(directory, { recursive: true });

  group.traverse((node) => {
    if (node.isMesh) {
      node.geometry.computeVertexNormals();
      node.updateMatrixWorld(true);
    }
  });

  const glb = await exportGlb(group);
  await fs.writeFile(path.join(directory, `${key}.glb`), glb);

  const stl = exporters.stl.parse(group, { binary: true });
  await fs.writeFile(
    path.join(directory, `${key}.stl`),
    Buffer.from(stl.buffer, stl.byteOffset, stl.byteLength),
  );

  const bounds = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3();
  bounds.getSize(size);
  const metadata = {
    key,
    format_version: 1,
    units: "design units; scale to specification height before fabrication",
    dimensions: {
      width: Number(size.x.toFixed(3)),
      height: Number(size.y.toFixed(3)),
      depth: Number(size.z.toFixed(3)),
    },
    files: [`${key}.glb`, `${key}.stl`],
    status: "digital_prototype",
    manufacturing_status: "requires professional sculpt, wall-thickness, tolerance and safety review",
  };
  await fs.writeFile(
    path.join(directory, "model-metadata.json"),
    `${JSON.stringify(metadata, null, 2)}\n`,
  );
  return metadata;
};

const fontJson = JSON.parse(await fs.readFile(fontPath, "utf8"));
const font = new FontLoader().parse(fontJson);
const models = [
  ["number-nexus-bitling", makeBitling(font)],
  ["number-nexus-carrybot", makeCarryBot(font)],
  ["number-nexus-codekeeper", makeCodekeeper(font)],
  ["number-nexus-neon-sentinel", makeSentinel(font)],
];

await fs.mkdir(outputRoot, { recursive: true });
const results = [];
for (const [key, model] of models) {
  results.push(await exportModel(key, model));
}

console.log(JSON.stringify(results, null, 2));
