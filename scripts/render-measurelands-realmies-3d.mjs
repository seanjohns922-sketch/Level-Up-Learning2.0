import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = "http://127.0.0.1:4177/public/realmies/3d/render.html";

const realmies = [
  ["measurelands-gaugekin", "measurelands-gaugekin-standard"],
  ["measurelands-ruleroot", "measurelands-ruleroot-standard"],
  ["measurelands-compass-keeper", "measurelands-compass-keeper-standard"],
  ["measurelands-golden-surveyor", "measurelands-golden-surveyor-standard"],
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

const requestedModel = process.argv[2];
const selectedRealmies = requestedModel
  ? realmies.filter(([model]) => model === requestedModel)
  : realmies;

for (const [model, packageKey] of selectedRealmies) {
  for (const [file, view, treatment] of renders) {
    const output = path.join(root, "public", "realmies", packageKey, file);
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
        `${baseUrl}?model=${model}&view=${view}&treatment=${treatment}`,
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
