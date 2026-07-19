import { normalizeSchoolYearLabel } from "@/lib/studentLevelLabel";

export type RosterImportSource = "spreadsheet" | "image";

export type RosterDraft = {
  id: string;
  firstName: string;
  lastName: string;
  schoolYear: string;
  username: string;
  pin: string;
  source: RosterImportSource;
};

type RawRosterStudent = Partial<{
  firstName: unknown;
  lastName: unknown;
  fullName: unknown;
  schoolYear: unknown;
  username: unknown;
  pin: unknown;
}>;

const HEADER_ALIASES = {
  firstName: ["first", "first name", "firstname", "given name", "given"],
  lastName: ["last", "last name", "lastname", "surname", "family name", "family"],
  fullName: ["name", "full name", "student", "student name", "student full name"],
  schoolYear: ["year", "year level", "school year", "school year level", "grade", "grade level"],
  username: ["username", "user name", "student id", "student identifier", "login", "login id"],
  pin: ["pin", "access code", "password", "passcode"],
} as const;

function cleanCell(value: unknown) {
  return String(value ?? "").trim();
}

function normalizedHeader(value: unknown) {
  return cleanCell(value).toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function splitName(value: unknown) {
  const name = cleanCell(value);
  if (!name) return { firstName: "", lastName: "" };
  if (name.includes(",")) {
    const [lastName, ...firstParts] = name.split(",");
    return { firstName: firstParts.join(" ").trim(), lastName: lastName.trim() };
  }
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.at(-1) ?? "" };
}

function normalizeImportedYear(value: unknown, fallback = "") {
  const raw = cleanCell(value);
  if (!raw) return normalizeSchoolYearLabel(fallback) ?? "";
  if (/^(p|prep|foundation|kindergarten)$/i.test(raw)) return "Prep";
  if (/^[1-6]$/.test(raw)) return `Year ${raw}`;
  const normalized = normalizeSchoolYearLabel(raw);
  return normalized && ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].includes(normalized)
    ? normalized
    : normalizeSchoolYearLabel(fallback) ?? "";
}

function makeDraft(student: RawRosterStudent, source: RosterImportSource, defaultYear: string): RosterDraft {
  const split = splitName(student.fullName);
  const firstName = cleanCell(student.firstName) || split.firstName;
  const lastName = cleanCell(student.lastName) || split.lastName;
  return {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    schoolYear: normalizeImportedYear(student.schoolYear, defaultYear),
    username: cleanCell(student.username),
    pin: cleanCell(student.pin).replace(/\D/g, "").slice(0, 4),
    source,
  };
}

export function normalizeRosterStudents(
  students: RawRosterStudent[],
  source: RosterImportSource,
  defaultYear = ""
) {
  const seen = new Set<string>();
  return students
    .map((student) => makeDraft(student, source, defaultYear))
    .filter((student) => {
      if (!student.firstName && !student.lastName) return false;
      const key = `${student.firstName}|${student.lastName}|${student.username}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 60);
}

function parseDelimitedText(text: string, delimiter: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === delimiter && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  return rows;
}

function findHeaderIndexes(row: unknown[]) {
  const indexes: Partial<Record<keyof typeof HEADER_ALIASES, number>> = {};
  row.forEach((cell, index) => {
    const header = normalizedHeader(cell);
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if ((aliases as readonly string[]).includes(header)) {
        indexes[field as keyof typeof HEADER_ALIASES] = index;
      }
    }
  });
  return indexes;
}

export async function parseRosterWorkbook(file: File, defaultYear = "") {
  let rows: unknown[][];
  if (/\.(csv|tsv)$/i.test(file.name)) {
    const text = await file.text();
    rows = parseDelimitedText(text, /\.tsv$/i.test(file.name) ? "\t" : ",");
  } else {
    const { readSheet } = await import("read-excel-file/browser");
    rows = await readSheet(file);
  }

  const nonEmptyRows = rows.filter((row) => row.some((cell) => cleanCell(cell)));
  if (nonEmptyRows.length === 0) return [];

  const headerIndexes = findHeaderIndexes(nonEmptyRows[0]);
  const hasRecognizedHeader = Object.keys(headerIndexes).length > 0;
  const dataRows = hasRecognizedHeader ? nonEmptyRows.slice(1) : nonEmptyRows;

  const rawStudents = dataRows.map((row) => {
    if (hasRecognizedHeader) {
      const valueAt = (field: keyof typeof HEADER_ALIASES) => {
        const index = headerIndexes[field];
        return index === undefined ? "" : row[index];
      };
      return {
        firstName: valueAt("firstName"),
        lastName: valueAt("lastName"),
        fullName: valueAt("fullName"),
        schoolYear: valueAt("schoolYear"),
        username: valueAt("username"),
        pin: valueAt("pin"),
      };
    }

    const cells = row.map(cleanCell).filter(Boolean);
    if (cells.length === 1) return { fullName: cells[0] };
    if (cells.length === 2 && normalizeImportedYear(cells[1])) {
      return { fullName: cells[0], schoolYear: cells[1] };
    }
    return { firstName: cells[0], lastName: cells[1], schoolYear: cells[2] };
  });

  return normalizeRosterStudents(rawStudents, "spreadsheet", defaultYear);
}
