import fs from "node:fs";

const checks = [
  {
    file: "components/PracticeRunner.tsx",
    minimumControls: 2,
    patterns: ["isChance", "<OptionReadAloudButton text={opt}"],
  },
  {
    file: "components/chance-hollow/ChanceAutoTallyCard.tsx",
    minimumControls: 7,
    patterns: ["OptionReadAloudButton"],
  },
  {
    file: "components/chance-hollow/ChanceCompareToolsCard.tsx",
    minimumControls: 2,
    patterns: ["OptionReadAloudButton"],
  },
  {
    file: "components/chance-hollow/ChanceSpinTallyCard.tsx",
    minimumControls: 3,
    patterns: ["tally marks", "OptionReadAloudButton"],
  },
  {
    file: "components/chance-hollow/ChanceBuildFairCard.tsx",
    minimumControls: 2,
    patterns: ["parts`}", "OptionReadAloudButton"],
  },
  {
    file: "components/chance-hollow/ChancePredictCountCard.tsx",
    minimumControls: 2,
    patterns: ["results`}", "OptionReadAloudButton"],
  },
  {
    file: "components/chance-hollow/ChanceDiceRaceCard.tsx",
    minimumControls: 2,
    patterns: ["possible pairs", "OptionReadAloudButton"],
  },
  {
    file: "components/chance-hollow/ChanceLevel6Cards.tsx",
    minimumControls: 11,
    patterns: [
      "expected ${task.targetName} outcomes",
      "percent winning",
      "machine.title",
      "text={`${value} percent`}",
      "text={`${value} wins`}",
      "text={verdict}",
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = fs.readFileSync(check.file, "utf8");
  const controlCount = source.match(/OptionReadAloudButton/g)?.length ?? 0;
  const missing = check.patterns.filter((pattern) => !source.includes(pattern));

  if (controlCount < check.minimumControls) {
    failures.push(`${check.file} has ${controlCount} answer-audio references; expected at least ${check.minimumControls}.`);
  }
  if (missing.length > 0) {
    failures.push(`${check.file} is missing answer-audio coverage markers: ${missing.join(", ")}.`);
  }
}

const sharedControl = fs.readFileSync("components/OptionReadAloudButton.tsx", "utf8");
for (const pattern of ['kind="option"', "stopPropagation()"] ) {
  if (!sharedControl.includes(pattern)) failures.push(`Shared answer-audio control is missing ${pattern}.`);
}

console.log(`Chance Hollow answer voice audit: ${checks.length} activity surfaces checked.`);
for (const failure of failures) console.error(`- ${failure}`);

if (failures.length > 0) process.exit(1);
console.log("All Level 5 and Level 6 answer controls expose voice-over without selecting the answer.");
