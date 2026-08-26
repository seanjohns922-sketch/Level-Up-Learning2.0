import { NextRequest, NextResponse } from "next/server";
import { loadSchoolAnalyticsSnapshot, type SchoolAnalyticsSnapshot } from "@/lib/school-platform-server";
import { BAND_LABEL, bandFor } from "@/lib/curriculum/ac-standards";

export const dynamic = "force-dynamic";

function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows: Array<Array<string | number | null | undefined>>): string {
  return rows.map((row) => row.map(cell).join(",")).join("\r\n");
}

function studentsCsv(snapshot: SchoolAnalyticsSnapshot): string {
  const header = ["Student", "Year level", "Class", "Status", "Weekly target met", "Active this week", "Learning days", "Realms used", "Levels mastered", "Average accuracy %", "Average growth (pts)"];
  const body = snapshot.students.map((s) => [
    s.name, s.yearLevel ?? "", s.className, s.status.replace(/_/g, " "),
    s.weeklyTargetMet ? "Yes" : "No", s.activeThisWeek ? "Yes" : "No",
    s.learningDays, s.realmsUsed, s.masteredLevels,
    s.averageAccuracy ?? "", s.averageGrowth ?? "",
  ]);
  return toCsv([header, ...body]);
}

function curriculumCsv(snapshot: SchoolAnalyticsSnapshot): string {
  const header = ["Strand", "Topic", "Year level", "Students", "Evidence", "Average accuracy %", "Achievement band"];
  const body = snapshot.curriculum.map((row) => {
    const band = row.band ?? bandFor(row.averageAccuracy);
    return [row.strandLabel ?? "Other", row.topic, row.yearLevel ?? "", row.students, row.evidenceCount, row.averageAccuracy ?? "", band ? BAND_LABEL[band] : ""];
  });
  return toCsv([header, ...body]);
}

// One row per student with per-strand level + achievement band and overall
// results — a flat "gradebook" shape mappable into Compass / Sentral imports.
const RESULT_REALMS: Array<[string, string]> = [
  ["number", "Number"], ["measurement", "Measurement"], ["space", "Space"], ["statistics", "Statistics"],
];
function resultsCsv(snapshot: SchoolAnalyticsSnapshot): string {
  const header = ["Student", "Year level", "Class", "Overall accuracy %", "Overall growth (pts)", "Levels mastered"];
  for (const [, label] of RESULT_REALMS) header.push(`${label} level`, `${label} band`);
  const body = snapshot.students.map((s) => {
    const row: Array<string | number | null | undefined> = [
      s.name, s.yearLevel ?? "", s.className, s.averageAccuracy ?? "", s.averageGrowth ?? "", s.masteredLevels,
    ];
    for (const [id] of RESULT_REALMS) {
      const realm = s.realms.find((r) => r.realmId === id);
      const band = realm ? bandFor(realm.averageAccuracy) : null;
      row.push(realm?.currentLevel ?? "", band ? BAND_LABEL[band] : "");
    }
    return row;
  });
  return toCsv([header, ...body]);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ schoolId: string }> },
) {
  const { schoolId } = await context.params;
  const academicYearId = request.nextUrl.searchParams.get("academicYearId") ?? "";
  const typeParam = request.nextUrl.searchParams.get("type");
  const type = typeParam === "curriculum" || typeParam === "results" ? typeParam : "students";

  if (!academicYearId) {
    return NextResponse.json({ error: "Academic year is required." }, { status: 400 });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const accessToken = authorization.replace(/^Bearer\s+/i, "").trim();

  try {
    const snapshot = await loadSchoolAnalyticsSnapshot(
      schoolId,
      academicYearId,
      {
        days: Number(request.nextUrl.searchParams.get("days") ?? 30),
        yearLevel: request.nextUrl.searchParams.get("yearLevel"),
        classId: request.nextUrl.searchParams.get("classId"),
        realmId: request.nextUrl.searchParams.get("realmId"),
      },
      accessToken,
    );

    if (!snapshot) {
      return NextResponse.json({ error: "School access denied." }, { status: 403 });
    }

    const csv = type === "curriculum" ? curriculumCsv(snapshot) : type === "results" ? resultsCsv(snapshot) : studentsCsv(snapshot);
    const stamp = new Date().toISOString().slice(0, 10);
    // Leading BOM so Excel opens UTF-8 cleanly.
    return new NextResponse(`﻿${csv}`, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="level-up-${type}-${stamp}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[school-analytics] Export failed", error);
    return NextResponse.json({ error: "Export could not be generated." }, { status: 503 });
  }
}
