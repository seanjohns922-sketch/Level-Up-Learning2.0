import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = "http://127.0.0.1:4177/public/realmies/3d/render.html";

const realmies = [
  ["number-nexus-bitling", "number-nexus-bitling-standard"],
  ["number-nexus-carrybot", "number-nexus-carrybot-standard"],
  ["number-nexus-codekeeper", "number-nexus-codekeeper-standard"],
  ["number-nexus-neon-sentinel", "number-nexus-neon-sentinel-standard"],
];

const renders = [
  ["hero-transparent.png", "three-quarter", "colour"],
  ["front.png", "front", "colour"],
  ["three-quarter.png", "three-quarter", "colour"],
  ["left.png", "left", "colour"],
  ["right.png", "right", "colour"],
  ["back.png", "back", "colour"],
  ["silhouette.png", "three-quarter", "silhouette"],
  ["prototype-grey.png", "three-quarter", "grey"],
  ["colour-zones.png", "front", "colour"],
];

for (const [model, packageKey] of realmies) {
  for (const [file, view, treatment] of renders) {
    const output = path.join(root, "public", "realmies", packageKey, file);
    const url = `${baseUrl}?model=${model}&view=${view}&treatment=${treatment}`;
    const result = spawnSync(
      chrome,
      [
        "--headless=new",
        "--use-gl=swiftshader",
        "--enable-unsafe-swiftshader",
        "--hide-scrollbars",
        "--window-size=1024,1024",
        "--default-background-color=00000000",
        "--virtual-time-budget=1600",
        `--screenshot=${output}`,
        url,
      ],
      { encoding: "utf8" },
    );

    if (result.status !== 0) {
      process.stderr.write(result.stderr);
      process.exit(result.status ?? 1);
    }
    console.log(`Rendered ${packageKey}/${file}`);
  }
}
