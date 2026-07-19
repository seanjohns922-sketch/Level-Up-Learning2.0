import fs from "node:fs";
import path from "node:path";
import { renderStarpathCurriculumMap, repoRoot } from "./starpath-curriculum-utils.mjs";

const outputPath = path.join(repoRoot, "docs/starpath/starpath-curriculum-map.md");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, renderStarpathCurriculumMap());
console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
