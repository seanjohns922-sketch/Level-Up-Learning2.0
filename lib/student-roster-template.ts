export type StudentRosterTemplateClass = {
  name: string;
  status: string;
};

const TEMPLATE_HEADERS = [
  "First Name",
  "Last Name",
  "Year Level",
  "Class",
  "Student Code",
  "Access Code",
] as const;

const YEAR_LEVELS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];
const MAX_STUDENT_ROWS = 60;

export async function buildStudentRosterTemplate(classes: StudentRosterTemplateClass[]) {
  const excelModule = await import("exceljs");
  const ExcelJS = excelModule.default ?? excelModule;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Level Up Learning";
  workbook.title = "Student import template";
  workbook.subject = "School student roster import";

  const students = workbook.addWorksheet("Students", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  students.columns = [
    { header: TEMPLATE_HEADERS[0], key: "firstName", width: 22 },
    { header: TEMPLATE_HEADERS[1], key: "lastName", width: 22 },
    { header: TEMPLATE_HEADERS[2], key: "schoolYear", width: 16 },
    { header: TEMPLATE_HEADERS[3], key: "className", width: 24 },
    { header: TEMPLATE_HEADERS[4], key: "username", width: 22 },
    { header: TEMPLATE_HEADERS[5], key: "pin", width: 18 },
  ];
  students.autoFilter = `A1:${String.fromCharCode(64 + TEMPLATE_HEADERS.length)}1`;
  students.getRow(1).height = 28;
  students.getRow(1).eachCell((cell, columnNumber) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: columnNumber === 1 || columnNumber === 3 ? "FF047857" : "FF0F766E" },
    };
    cell.alignment = { vertical: "middle" };
  });

  const activeClassNames = [...new Set(
    classes
      .filter((classRow) => classRow.status === "active")
      .map((classRow) => classRow.name.trim())
      .filter(Boolean),
  )].sort((left, right) => left.localeCompare(right));

  const lists = workbook.addWorksheet("Lists", { state: "veryHidden" });
  YEAR_LEVELS.forEach((year, index) => {
    lists.getCell(index + 1, 1).value = year;
  });
  activeClassNames.forEach((className, index) => {
    lists.getCell(index + 1, 2).value = className;
  });

  for (let rowNumber = 2; rowNumber <= MAX_STUDENT_ROWS + 1; rowNumber += 1) {
    const row = students.getRow(rowNumber);
    row.height = 22;
    row.getCell(3).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: [`Lists!$A$1:$A$${YEAR_LEVELS.length}`],
      showErrorMessage: true,
      errorTitle: "Choose a year level",
      error: "Select Prep or Year 1 to Year 6 from the list.",
    };
    if (activeClassNames.length > 0) {
      row.getCell(4).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`Lists!$B$1:$B$${activeClassNames.length}`],
        showErrorMessage: true,
        errorTitle: "Choose a school class",
        error: "Select a class from the list or leave this cell blank.",
      };
    }
    row.getCell(6).numFmt = "0000";
  }

  const instructions = workbook.addWorksheet("Instructions");
  instructions.columns = [{ width: 24 }, { width: 78 }];
  instructions.addRow(["Level Up Learning", "Student import template"]);
  instructions.addRow([]);
  instructions.addRow(["Required", "First Name and Year Level"]);
  instructions.addRow(["Optional", "Last Name, Class, Student Code and Access Code"]);
  instructions.addRow(["Class", "Choose an existing school class from the dropdown, or leave blank."]);
  instructions.addRow(["Student Code", "Leave blank to generate a student code automatically."]);
  instructions.addRow(["Access Code", "Enter exactly 4 digits, or leave blank to generate one automatically."]);
  instructions.addRow(["Limit", `Add up to ${MAX_STUDENT_ROWS} students per file.`]);
  instructions.addRow(["Important", "Keep the column headings unchanged. Do not add example or instruction rows to the Students sheet."]);
  instructions.getRow(1).height = 30;
  instructions.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 14 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF047857" } };
  });
  for (let rowNumber = 3; rowNumber <= instructions.rowCount; rowNumber += 1) {
    instructions.getCell(rowNumber, 1).font = { bold: true, color: { argb: "FF065F46" } };
    instructions.getCell(rowNumber, 2).alignment = { wrapText: true, vertical: "top" };
    instructions.getRow(rowNumber).height = 34;
  }

  return workbook.xlsx.writeBuffer();
}

export async function downloadStudentRosterTemplate(classes: StudentRosterTemplateClass[]) {
  const buffer = await buildStudentRosterTemplate(classes);
  const bytes = new Uint8Array(buffer);
  const url = URL.createObjectURL(
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "level-up-learning-student-import-template.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
