"use client";

import {
  PARENT_LEVEL_LADDER,
  PARENT_PASS_THRESHOLD,
  canonicalParentRealmId,
  parentRealmPalette,
  realmGrowthFromReport,
  type ParentActivity,
  type ParentProgressReport,
  type ParentReportLevel,
} from "@/lib/parent-insights";
import { COLORS, assetUrl, documentHtml, escapeHtml, footer, generatedOn, letterhead, openDocumentWindow, writeDocument, type DocumentLogo } from "@/lib/documents/reliq-document";
import { getSchoolLogo } from "@/lib/school-logos";

/**
 * Printable parent progress report.
 *
 * Uses the shared RELIQ document letterhead, so it prints or saves as PDF
 * from the browser with no extra dependency.
 * Deliberately warmer and shorter than the school report: parents get the
 * ladder, growth and what to do next, not the leadership analytics tables.
 */

const CHECK = "✓";

function shortDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "Australia/Melbourne" }).format(date);
}

function monthYear(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    year: "2-digit",
    timeZone: "Australia/Melbourne",
  }).format(date);
}

function ladderLabel(workingLevel: string) {
  return PARENT_LEVEL_LADDER.find((step) => step.workingLevel === workingLevel)?.label ?? workingLevel;
}

export function buildParentReportHtml(report: ParentProgressReport, activity: ParentActivity, schoolLogo: DocumentLogo = null): string {
  const threshold = report.passThreshold ?? PARENT_PASS_THRESHOLD;
  const passed = (level?: ParentReportLevel) =>
    Boolean(level && level.posttestScore !== null && level.posttestScore >= threshold);

  const byRealm = new Map<string, ParentReportLevel[]>();
  for (const level of report.levels) {
    const realmId = canonicalParentRealmId(level.realmId);
    const rows = byRealm.get(realmId) ?? [];
    rows.push(level);
    byRealm.set(realmId, rows);
  }

  const realmIds = [...byRealm.keys()].sort(
    (left, right) => parentRealmPalette(left).order - parentRealmPalette(right).order,
  );

  const growthByRealm = new Map(realmGrowthFromReport(report).map((row) => [row.realmId, row]));
  let masteredTotal = 0;

  const sections = realmIds
    .map((realmId) => {
      const rows = byRealm.get(realmId) ?? [];
      const palette = parentRealmPalette(realmId);
      const growth = growthByRealm.get(realmId);
      const currentRow = rows.find((row) => row.isCurrent);
      let masteredHere = 0;

      const steps = PARENT_LEVEL_LADDER.map((step, index) => {
        const row = rows.find((item) => item.workingLevel === step.workingLevel);
        const isPass = passed(row);
        const isCurrent = Boolean(row?.isCurrent && !isPass);
        let state = "todo";
        let date = "";
        if (isPass && row) {
          state = "done";
          masteredHere += 1;
          date = index === 0 ? "Start" : monthYear(row.posttestCompletedAt);
        } else if (isCurrent && row) {
          state = "now";
          date = row.currentWeek ? `Week ${row.currentWeek}` : "Now";
        }
        const bg = state === "done" ? COLORS.carbon : state === "now" ? COLORS.lime : "#FFFFFF";
        const border = state === "todo" ? "#C9CDC5" : COLORS.carbon;
        const short = step.workingLevel === "Prep" ? "Ground" : step.workingLevel.replace("Year ", "Y");
        return `<span class="st"><span class="dot" style="background:${bg};border-color:${border}">${state === "done" ? CHECK : ""}</span><span class="lb" style="color:${state === "todo" ? COLORS.faint : COLORS.carbon}">${escapeHtml(short)}</span><span class="dt">${escapeHtml(date)}</span></span>`;
      }).join("");

      masteredTotal += masteredHere;

      const growthText =
        growth?.growth !== null && growth?.growth !== undefined
          ? `Pre ${growth.pretestScore}% → post ${growth.posttestScore}%`
          : growth?.pretestScore !== null && growth?.pretestScore !== undefined
            ? `Started at ${growth.pretestScore}%`
            : "";

      return `<div class="realm">
        <span style="display:flex;flex-direction:column"><b style="font-size:14px">${escapeHtml(palette.name)}</b><span style="font-size:11px;color:${COLORS.muted}">${masteredHere} ${masteredHere === 1 ? "level" : "levels"} mastered</span></span>
        <span class="ladder" style="grid-template-columns:repeat(${PARENT_LEVEL_LADDER.length},1fr)"><span class="rail"></span>${steps}</span>
        <span style="display:flex;flex-direction:column;align-items:flex-end;gap:3px">
          ${currentRow ? `<span style="font-size:12px;font-weight:800">${escapeHtml(ladderLabel(currentRow.workingLevel))}${currentRow.currentWeek ? ` · Week ${currentRow.currentWeek}` : ""}</span>` : ""}
          ${growthText ? `<span style="font-size:10.5px;font-weight:700;color:${COLORS.green}">${escapeHtml(growthText)}</span>` : ""}
        </span>
      </div>`;
    })
    .join("");

  const recent = activity.feed.slice(0, 8);
  const recentHtml = recent.length
    ? recent
        .map((item) => {
          const palette = parentRealmPalette(item.realmId);
          const score =
            item.correct !== null && item.attempted
              ? `${item.correct}/${item.attempted}`
              : item.accuracy !== null
                ? `${item.accuracy}%`
                : "";
          return `<div class="act"><span><b>${escapeHtml(palette.name)}</b> · ${escapeHtml(item.label)}${item.week ? ` (Week ${item.week})` : ""}</span><b style="text-align:right">${escapeHtml(score)}</b><span style="text-align:right;color:${COLORS.muted}">${escapeHtml(shortDate(item.completedAt))}</span></div>`;
        })
        .join("")
    : `<p style="margin:0;padding:8px 16px 14px;font-size:13px;color:${COLORS.muted}">No completed activities recorded yet.</p>`;

  const hours = Math.round((report.minutesLearning / 60) * 10) / 10;
  const meta = ["For families", report.student.schoolName].filter(Boolean).join(" · ");
  const page = `${letterhead({ audience: "school", label: "Learning report", meta: meta || "For families", schoolLogo })}
    <section><span class="h" style="font-size:32px;line-height:1">${escapeHtml(report.student.name)}</span>
      <div style="font-size:14px;color:${COLORS.muted};margin-top:4px">${escapeHtml([report.student.yearLevel ?? "Year level not recorded", report.student.schoolName ?? "Home learner"].join(" · "))}</div></section>
    <section style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
      ${[[String(masteredTotal), "Levels mastered", COLORS.carbon, "#FFFFFF"], [String(report.lessonsCompleted), "Lessons done", COLORS.lime, COLORS.carbon], [String(report.learningDays), "Learning days", COLORS.limeTint, COLORS.green], [`${hours}h`, "Time learning", COLORS.paper, COLORS.carbon]]
        .map(([value, label, bg, fg]) => `<div style="border-radius:14px;padding:12px 14px;background:${bg};color:${fg}"><span class="h" style="display:block;font-size:28px;line-height:1">${escapeHtml(value)}</span><span style="display:block;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-top:4px">${label}</span></div>`).join("")}
    </section>
    <section class="card" style="padding:12px 16px 6px">
      <div style="display:flex;justify-content:space-between;align-items:baseline"><span class="h" style="font-size:16px">Progress by realm</span><span style="font-size:11px;color:${COLORS.muted}">● Mastered · <span style="color:${COLORS.green}">●</span> Working on now</span></div>
      ${sections || `<p style="font-size:13px;color:${COLORS.muted}">No realm progress recorded yet.</p>`}
    </section>
    <section class="card" style="overflow:hidden">
      <div style="padding:10px 16px"><span class="h" style="font-size:16px">Recent activity</span></div>
      ${recentHtml}
    </section>
    <p style="margin:0;font-size:11px;line-height:1.5;color:${COLORS.faint}">A level is mastered when its post-test is passed (${threshold}% or above). Children can be at different levels in different realms; that is by design.</p>
    ${footer("RELIQ · BrightUp Education", `${generatedOn()} · Page 1 of 1`)}`;
  const css = `.realm{display:grid;grid-template-columns:130px 1fr 150px;gap:12px;align-items:center;padding:9px 0;border-top:1px solid #ECEEE9;margin-top:6px}
.ladder{display:grid;position:relative}
.rail{position:absolute;left:7%;right:7%;top:9px;height:3px;background:${COLORS.rule}}
.st{display:flex;flex-direction:column;align-items:center;gap:3px;position:relative}
.dot{width:20px;height:20px;border-radius:50%;border:2px solid;display:grid;place-items:center;font-size:10px;font-weight:900;color:${COLORS.lime}}
.lb{font-size:9.5px;font-weight:700}
.dt{font-size:9px;color:${COLORS.faint}}
.act{display:grid;grid-template-columns:1fr 70px 70px;gap:10px;padding:7px 16px;border-top:1px solid #ECEEE9;font-size:12.5px;align-items:center}`;
  return documentHtml({ title: `RELIQ learning report — ${report.student.name}`, pages: [page], css });
}

/** Opens the report in a new window, ready to print or save as PDF. */
export function openParentReport(report: ParentProgressReport, activity: ParentActivity) {
  const printWindow = openDocumentWindow();
  if (!printWindow) return false;
  const logo = report.student.schoolName ? getSchoolLogo({ name: report.student.schoolName }) : null;
  writeDocument(printWindow, buildParentReportHtml(report, activity, logo ? { src: assetUrl(logo.src, window.location.origin), alt: logo.alt } : null));
  return true;
}
