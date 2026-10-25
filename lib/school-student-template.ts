import {
  STUDENT_TEMPLATE_HEADERS,
  STUDENT_TEMPLATE_MAX_ROWS,
  STUDENT_TEMPLATE_SHEET,
  STUDENT_TEMPLATE_STAMP,
  STUDENT_TEMPLATE_STAMP_SHEET,
} from "@/lib/student-roster-template";

/** Reads leadership's whole-school student list. Only the RELIQ template is
 * accepted (it carries a hidden stamp), so every school's upload looks the
 * same: first name, last name and year level. */

export type TemplateStudent = { id: string; firstName: string; lastName: string; schoolYear: string };
type SheetData = Array<{ sheet: string; data: unknown[][] }>;

export class StudentTemplateError extends Error {}

export const NOT_OUR_TEMPLATE =
  "This isn't the RELIQ student template. Download the template, paste your students into it, then upload that file.";

const clean = (value: unknown) => String(value ?? "").replace(/\s+/g, " ").trim();

/** "3", "Yr 3", "Year 3", "Grade 3", "Prep", "Foundation", "F" → the RELIQ label, or "" if unknown. */
export function templateYearLevel(value: unknown): string {
  const text = clean(value).toLowerCase();
  if (!text) return "";
  if (/^(prep|foundation|f|reception|kinder|kindergarten|p)$/.test(text)) return "Prep";
  const match = /^(?:year|yr|grade|gr|y)?\s*\.?\s*([1-6])$/.exec(text);
  return match ? `Year ${match[1]}` : "";
}

/** Checks the stamp and headings, then reads the students. Pure, so it can be tested. */
export function readStudentTemplateSheets(sheets: SheetData): TemplateStudent[] {
  const stamp = sheets.find((sheet) => sheet.sheet === STUDENT_TEMPLATE_STAMP_SHEET);
  if (clean(stamp?.data?.[0]?.[0]) !== STUDENT_TEMPLATE_STAMP) throw new StudentTemplateError(NOT_OUR_TEMPLATE);
  const list = sheets.find((sheet) => sheet.sheet === STUDENT_TEMPLATE_SHEET);
  if (!list) throw new StudentTemplateError("The Students sheet is missing. Download a fresh template and paste your students into it.");
  const headings = (list.data[0] ?? []).slice(0, STUDENT_TEMPLATE_HEADERS.length).map((cell) => clean(cell).toLowerCase());
  if (STUDENT_TEMPLATE_HEADERS.some((heading, index) => headings[index] !== heading.toLowerCase())) {
    throw new StudentTemplateError("The headings in row 1 have been changed. They must read First Name, Last Name and Year Level.");
  }
  const rows = list.data.slice(1).filter((row) => row.slice(0, 3).some((cell) => clean(cell)));
  if (rows.length > STUDENT_TEMPLATE_MAX_ROWS) {
    throw new StudentTemplateError(`That's ${rows.length} students. One file can hold up to ${STUDENT_TEMPLATE_MAX_ROWS}, so split them across two files.`);
  }
  return rows.map((row, index) => {
    const year = templateYearLevel(row[2]);
    return {
      id: `row-${index + 2}`,
      firstName: clean(row[0]),
      lastName: clean(row[1]),
      // Keep what was typed when it isn't recognised, so the check screen can show it.
      schoolYear: year || clean(row[2]),
    };
  });
}

/** Reads an uploaded file in the browser. */
export async function readStudentTemplateFile(file: File): Promise<TemplateStudent[]> {
  if (!/\.xlsx$/i.test(file.name)) throw new StudentTemplateError(NOT_OUR_TEMPLATE);
  const { default: readXlsxFile } = await import("read-excel-file/browser");
  let sheets: SheetData;
  try {
    sheets = (await readXlsxFile(file)) as SheetData;
  } catch {
    throw new StudentTemplateError("That file couldn't be opened. Save it as an Excel workbook (.xlsx) and try again.");
  }
  return readStudentTemplateSheets(sheets);
}

/** Why a row can't be added yet, or null when it's ready. */
export function templateRowIssue(row: TemplateStudent, validYears: string[]): string | null {
  if (!row.firstName) return "First name missing";
  if (!row.lastName) return "Last name missing";
  if (!row.schoolYear) return "Year level missing";
  if (!validYears.includes(row.schoolYear)) return `"${row.schoolYear}" isn't a year level`;
  return null;
}
