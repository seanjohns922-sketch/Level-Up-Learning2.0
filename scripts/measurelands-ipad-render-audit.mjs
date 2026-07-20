import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");
const measurelandsDir = path.join(repoRoot, "components/measurelands");
const componentFiles = fs.readdirSync(measurelandsDir)
  .filter((file) => file.endsWith(".tsx"))
  .sort();

const results = [];
const check = (label, ok, detail = "") => results.push({ label, ok, detail });

const css = read("app/globals.css");
const shell = read("components/assessment/AssessmentShell.tsx");
const renderer = read("components/TaskRenderer.tsx");
const fullscreen = read("components/FullscreenToggle.tsx");
const legacyVisual = read("components/assessment/MeasurelandsAssessmentVisual.tsx");

check(
  "Measurelands task frames carry an assessment-mode boundary",
  renderer.includes('data-assessment-mode={assessmentMode ? "true" : "false"}')
    && renderer.includes("assessmentMode={assessmentMode}"),
);
check(
  "Measurelands task frames cannot exceed the iPad content width",
  css.includes(".measurelands-task-frame > *")
    && css.includes("max-width: 100%")
    && css.includes("overflow-wrap: anywhere"),
);
check(
  "Measurelands SVG artwork scales within its container",
  css.includes(".measurelands-task-frame svg")
    && css.includes(".measurelands-assessment-visual svg")
    && css.includes("height: auto"),
);
check(
  "Measurelands controls use direct touch manipulation",
  css.includes(".measurelands-task-frame button")
    && css.includes("touch-action: manipulation"),
);
check(
  "Assessment shell has iPad landscape compaction",
  css.includes("@media (min-width: 744px) and (max-width: 1180px) and (max-height: 820px)")
    && shell.includes('data-wide-content={wideContent ? "true" : "false"}')
    && shell.includes("assessment-question-card"),
);
check(
  "Assessment navigation reserves the iPad home-indicator/fullscreen area",
  shell.includes("env(safe-area-inset-bottom)")
    && shell.includes("assessment-navigation")
    && fullscreen.includes("env(safe-area-inset-bottom)"),
);
check(
  "Legacy Measurelands assessment visuals share the responsive visual boundary",
  legacyVisual.includes("measurelands-assessment-visual")
    && legacyVisual.includes("measurelands-assessment-visual-stage"),
);

const svgFailures = [];
const widthRisks = [];
let svgCount = 0;

for (const file of componentFiles) {
  const source = fs.readFileSync(path.join(measurelandsDir, file), "utf8");
  const svgTags = source.match(/<svg\b[\s\S]*?>/g) ?? [];
  svgCount += svgTags.length;

  svgTags.forEach((tag, index) => {
    const hasSharedGlyphProps = tag.includes("{...c}") && source.includes('viewBox: "0 0 48 48"');
    const hasViewBox = /\bviewBox=/.test(tag) || hasSharedGlyphProps;
    const hasWidth = /\bwidth=/.test(tag) || /\bclassName=/.test(tag) || hasSharedGlyphProps;
    if (!hasViewBox || !hasWidth) {
      svgFailures.push(`${file} svg ${index + 1}`);
    }
  });

  for (const match of source.matchAll(/min-w-\[(\d+)px\]/g)) {
    const width = Number(match[1]);
    if (width > 700) widthRisks.push(`${file}: ${width}px`);
  }
}

check(
  `All ${svgCount} Measurelands SVGs have a viewBox and declared width`,
  svgFailures.length === 0,
  svgFailures.join(", "),
);
check(
  "No Measurelands component requires an iPad-breaking fixed minimum width",
  widthRisks.length === 0,
  widthRisks.join(", "),
);

const failures = results.filter((result) => !result.ok);
console.log("\nMeasurelands iPad Render Audit\n" + "=".repeat(72));
for (const result of results) {
  console.log(`${result.ok ? "PASS" : "FAIL"}  ${result.label}${result.detail ? ` (${result.detail})` : ""}`);
}
console.log("=".repeat(72));
console.log(`${results.length - failures.length}/${results.length} checks passed across ${componentFiles.length} components.`);

if (failures.length > 0) process.exit(1);
