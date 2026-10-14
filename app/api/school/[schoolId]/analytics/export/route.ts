import { NextRequest, NextResponse } from "next/server";
import { loadSchoolAnalyticsSnapshot, type SchoolAnalyticsSnapshot } from "@/lib/school-platform-server";
import { BAND_LABEL, bandFor, strandForRealm, type AcStrand } from "@/lib/curriculum/ac-standards";
import { STANDING_META, studentStandings, usesTests } from "@/lib/proficiency";

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

// One row per student for a school's SIS (Compass, Sentral): the same
// standings as the dashboards, from each student's latest test per strand
// against where their school year should be on the day it was sat, plus the
// latest test level and current working level per strand.
const RESULT_STRANDS: Array<[AcStrand, string, string]> = [
  ["number", "Number", "number"], ["measurement", "Measurement", "measurement"], ["space", "Space", "space"],
  ["statistics", "Statistics", "statistics"], ["algebra", "Algebra", "pattern"], ["probability", "Probability", "chance"],
];
function resultsCsv(snapshot: SchoolAnalyticsSnapshot): string {
  const year = usesTests(snapshot) ? snapshot.academicYear ?? null : null;
  const header = ["Student", "Year level", "Class", "Overall standing", "Levels mastered", "Accuracy %"];
  for (const [, label] of RESULT_STRANDS) header.push(`${label} level`, `${label} standing`, `${label} working level`);
  const body = snapshot.students.map((s) => {
    const standings = studentStandings({ yearLevel: s.yearLevel, realms: s.realms, tests: s.tests }, year);
    const latest = new Map((s.tests ?? []).map((test) => [strandForRealm(test.strand), test]));
    const row: Array<string | number | null | undefined> = [
      s.name, s.yearLevel ?? "", s.className, standings.overall ? STANDING_META[standings.overall].label : "", s.masteredLevels, s.averageAccuracy ?? "",
    ];
    for (const [strand, , realmId] of RESULT_STRANDS) {
      const test = latest.get(strand);
      const standing = standings.strands.get(strand);
      row.push(test ? test.measured.toFixed(1) : "", standing ? STANDING_META[standing].label : "", s.realms.find((r) => r.realmId === realmId)?.currentLevel ?? "");
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
        "Content-Disposition": `attachment; filename="reliq-${type}-${stamp}.csv"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[school-analytics] Export failed", error);
    return NextResponse.json({ error: "Export could not be generated." }, { status: 503 });
  }
}
