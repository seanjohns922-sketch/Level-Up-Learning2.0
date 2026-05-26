export function formatStudentLevelLabel(yearLabel: string) {
  if (yearLabel === "Prep") return "Ground Level";
  const match = /Year\s+(\d+)/i.exec(yearLabel);
  if (match) return `Level ${match[1]}`;
  return yearLabel;
}
