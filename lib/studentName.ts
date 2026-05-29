"use client";

export function buildDisplayName(firstName?: string | null, lastName?: string | null) {
  return [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ").trim();
}

export function splitDisplayName(displayName?: string | null) {
  const raw = displayName?.trim() ?? "";
  if (!raw) {
    return { firstName: "", lastName: "" };
  }

  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: raw, lastName: "" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts[parts.length - 1] ?? "",
  };
}

export function resolveStudentNameParts(student: {
  first_name?: string | null;
  last_name?: string | null;
  display_name?: string | null;
}) {
  const firstName = student.first_name?.trim() ?? "";
  const lastName = student.last_name?.trim() ?? "";
  if (firstName || lastName) {
    return {
      firstName,
      lastName,
      displayName: buildDisplayName(firstName, lastName) || student.display_name?.trim() || "",
    };
  }

  const fallback = splitDisplayName(student.display_name);
  return {
    firstName: fallback.firstName,
    lastName: fallback.lastName,
    displayName: buildDisplayName(fallback.firstName, fallback.lastName) || student.display_name?.trim() || "",
  };
}
