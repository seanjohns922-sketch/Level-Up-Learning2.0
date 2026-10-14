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

// RELIQ document colours: Carbon heading rows with lime text (adult document).
const CARBON = "FF121314";
const LIME = "FFB9F23F";
const GREEN = "FF3D6600";

export async function buildStudentRosterTemplate(classes: StudentRosterTemplateClass[], options: { logoPng?: ArrayBuffer } = {}) {
  const excelModule = await import("exceljs");
  const ExcelJS = excelModule.default ?? excelModule;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "RELIQ";
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
    // Required columns (First Name, Year Level) are marked with a lime fill.
    const required = columnNumber === 1 || columnNumber === 3;
    cell.font = { bold: true, color: { argb: required ? CARBON : LIME } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: required ? LIME : CARBON } };
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
  // Rows 1-3 hold the RELIQ logo when it is available.
  instructions.addRow([]);
  instructions.addRow([]);
  instructions.addRow([]);
  [1, 2, 3].forEach((rowNumber) => {
    instructions.getRow(rowNumber).height = 18;
  });
  if (options.logoPng) {
    const logo = workbook.addImage({ buffer: options.logoPng as never, extension: "png" });
    instructions.addImage(logo, { tl: { col: 0.2, row: 0.3 }, ext: { width: 190, height: 52 } });
  } else {
    instructions.getCell(2, 1).value = "RELIQ";
    instructions.getCell(2, 1).font = { bold: true, size: 20, color: { argb: CARBON } };
  }
  const titleRow = instructions.addRow(["Student import template", "Add your students, then upload this file in RELIQ › Students › Import."]);
  titleRow.height = 30;
  titleRow.eachCell((cell, columnNumber) => {
    cell.font = { bold: true, color: { argb: LIME }, size: columnNumber === 1 ? 14 : 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CARBON } };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
  instructions.addRow([]);
  const firstGuide = instructions.rowCount + 1;
  instructions.addRow(["Required", "First Name and Year Level (the lime columns)"]);
  instructions.addRow(["Optional", "Last Name, Class, Student Code and Access Code"]);
  instructions.addRow(["Class", "Choose an existing school class from the dropdown, or leave blank."]);
  instructions.addRow(["Student Code", "Leave blank to generate a student code automatically."]);
  instructions.addRow(["Access Code", "Enter exactly 4 digits, or leave blank to generate one automatically."]);
  instructions.addRow(["Limit", `Add up to ${MAX_STUDENT_ROWS} students per file.`]);
  instructions.addRow(["Important", "Keep the column headings unchanged. Do not add example or instruction rows to the Students sheet."]);
  for (let rowNumber = firstGuide; rowNumber <= instructions.rowCount; rowNumber += 1) {
    instructions.getCell(rowNumber, 1).font = { bold: true, color: { argb: GREEN } };
    instructions.getCell(rowNumber, 2).alignment = { wrapText: true, vertical: "top" };
    instructions.getRow(rowNumber).height = 34;
  }

  return workbook.xlsx.writeBuffer();
}

export async function downloadStudentRosterTemplate(classes: StudentRosterTemplateClass[]) {
  // The logo is a nice-to-have: the template still downloads without it.
  const logoPng = await fetch("/brand/reliq-logo.png").then((response) => (response.ok ? response.arrayBuffer() : undefined)).catch(() => undefined);
  const buffer = await buildStudentRosterTemplate(classes, { logoPng });
  const bytes = new Uint8Array(buffer);
  const url = URL.createObjectURL(
    new Blob([bytes], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "reliq-student-import-template.xlsx";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
