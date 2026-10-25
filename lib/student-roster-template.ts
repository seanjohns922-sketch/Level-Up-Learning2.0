/** The RELIQ student template: the only spreadsheet leadership can upload.
 *
 * Three columns (First Name, Last Name, Year Level), room for a whole school,
 * and a hidden stamp so RELIQ can tell its own template from any other file.
 * Usernames, access codes and Explorer Codes are created by RELIQ; teachers add
 * students to their classes from the school's list. */

export const STUDENT_TEMPLATE_STAMP = "RELIQ student template v2";
export const STUDENT_TEMPLATE_STAMP_SHEET = "RELIQ";
export const STUDENT_TEMPLATE_SHEET = "Students";
export const STUDENT_TEMPLATE_HEADERS = ["First Name", "Last Name", "Year Level"] as const;
export const STUDENT_TEMPLATE_MAX_ROWS = 1000;
export const STUDENT_TEMPLATE_FILE_NAME = "RELIQ-student-template.xlsx";

const YEAR_LEVELS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

// RELIQ adult document colours: Carbon with green.
const CARBON = "FF121314";
const LIME = "FF83E300";
const GREEN = "FF3D6600";

export async function buildStudentRosterTemplate(options: { logoPng?: ArrayBuffer } = {}) {
  const excelModule = await import("exceljs");
  const ExcelJS = excelModule.default ?? excelModule;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "RELIQ";
  workbook.title = STUDENT_TEMPLATE_STAMP;
  workbook.subject = "Whole-school student list";

  // Instructions first, so it's the sheet that opens.
  const instructions = workbook.addWorksheet("How to use");
  const students = workbook.addWorksheet(STUDENT_TEMPLATE_SHEET, { views: [{ state: "frozen", ySplit: 1 }] });
  students.columns = [
    { header: STUDENT_TEMPLATE_HEADERS[0], key: "firstName", width: 24 },
    { header: STUDENT_TEMPLATE_HEADERS[1], key: "lastName", width: 24 },
    { header: STUDENT_TEMPLATE_HEADERS[2], key: "schoolYear", width: 16 },
  ];
  students.getRow(1).height = 28;
  students.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: LIME } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CARBON } };
    cell.alignment = { vertical: "middle" };
  });

  // Hidden lists and the stamp that marks this file as the RELIQ template.
  const stamp = workbook.addWorksheet(STUDENT_TEMPLATE_STAMP_SHEET, { state: "veryHidden" });
  stamp.getCell(1, 1).value = STUDENT_TEMPLATE_STAMP;
  YEAR_LEVELS.forEach((year, index) => {
    stamp.getCell(index + 1, 2).value = year;
  });

  for (let rowNumber = 2; rowNumber <= STUDENT_TEMPLATE_MAX_ROWS + 1; rowNumber += 1) {
    students.getRow(rowNumber).getCell(3).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`${STUDENT_TEMPLATE_STAMP_SHEET}!$B$1:$B$${YEAR_LEVELS.length}`],
      // Pasted values like "3" or "Foundation" are tidied up on upload, so only warn.
      showErrorMessage: true,
      errorStyle: "warning",
      errorTitle: "Year level",
      error: "Use Prep or Year 1 to Year 6. RELIQ also understands 3, Yr 3 and Foundation.",
    };
  }

  instructions.columns = [{ width: 6 }, { width: 92 }];
  instructions.addRow([]);
  instructions.addRow([]);
  instructions.addRow([]);
  if (options.logoPng) {
    const logo = workbook.addImage({ buffer: options.logoPng as never, extension: "png" });
    instructions.addImage(logo, { tl: { col: 0.2, row: 0.3 }, ext: { width: 190, height: 52 } });
  } else {
    instructions.getCell(2, 2).value = "RELIQ";
    instructions.getCell(2, 2).font = { bold: true, size: 20, color: { argb: CARBON } };
  }
  const title = instructions.addRow(["", "Whole-school student list"]);
  title.height = 30;
  title.getCell(2).font = { bold: true, size: 14, color: { argb: LIME } };
  [1, 2].forEach((column) => {
    title.getCell(column).fill = { type: "pattern", pattern: "solid", fgColor: { argb: CARBON } };
  });
  title.getCell(2).alignment = { vertical: "middle" };
  instructions.addRow([]);
  const steps = [
    "Open the Students sheet (the tab at the bottom).",
    "Copy your students' first names, last names and year levels from your school system, and paste them into the three columns. Use Paste Values so the formatting stays tidy.",
    "Keep the headings in row 1 exactly as they are, and don't add any other columns or sheets.",
    "Save the file, then upload it in RELIQ › School Home › Students › Upload student list.",
  ];
  steps.forEach((step, index) => {
    const row = instructions.addRow([index + 1, step]);
    row.height = 34;
    row.getCell(1).font = { bold: true, color: { argb: GREEN }, size: 13 };
    row.getCell(1).alignment = { vertical: "top", horizontal: "center" };
    row.getCell(2).alignment = { wrapText: true, vertical: "top" };
  });
  instructions.addRow([]);
  const notes = [
    ["Made for you", "RELIQ creates each student's username, 4-digit access code and Explorer Code. Leave them out."],
    ["Classes", "Teachers add students to their own classes from the school's list after the upload."],
    ["Size", `Up to ${STUDENT_TEMPLATE_MAX_ROWS} students in one file.`],
    ["Re-uploading", "Safe: students already in RELIQ are recognised and skipped, not added twice."],
    ["Only this file", "RELIQ only accepts this template. Other spreadsheets or exports can't be uploaded."],
  ];
  notes.forEach(([label, text]) => {
    const row = instructions.addRow([label, text]);
    row.height = 30;
    row.getCell(1).font = { bold: true, color: { argb: GREEN } };
    row.getCell(1).alignment = { vertical: "top", wrapText: true };
    row.getCell(2).alignment = { wrapText: true, vertical: "top" };
  });
  instructions.getColumn(1).width = 16;

  return workbook.xlsx.writeBuffer();
}

export async function downloadStudentRosterTemplate() {
  // The logo is a nice-to-have: the template still downloads without it.
  const logoPng = await fetch("/brand/reliq-logo.png").then((response) => (response.ok ? response.arrayBuffer() : undefined)).catch(() => undefined);
  const buffer = await buildStudentRosterTemplate({ logoPng });
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(buffer)], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = STUDENT_TEMPLATE_FILE_NAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
