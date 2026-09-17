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

/**
 * Printable parent progress report.
 *
 * Written as a pure string builder (like the school Learning Journey) so it can
 * be opened in a popup and printed or saved as PDF with no extra dependency.
 * Deliberately warmer and shorter than the school report: parents get the
 * ladder, growth and what to do next, not the leadership analytics tables.
 */

const CHECK = '<svg viewBox="0 0 24 24" width="13" height="13"><path d="M5 12l4 4 10-10" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character] as string,
  );
}

function monthYear(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-AU", {
    month: "short",
    year: "numeric",
    timeZone: "Australia/Melbourne",
  }).format(date);
}

function ladderLabel(workingLevel: string) {
  return PARENT_LEVEL_LADDER.find((step) => step.workingLevel === workingLevel)?.label ?? workingLevel;
}

export function buildParentReportHtml(report: ParentProgressReport, activity: ParentActivity): string {
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
        let stepClass = "";
        let date = "";
        if (isPass && row) {
          stepClass = "done";
          masteredHere += 1;
          date = index === 0 ? "start" : monthYear(row.posttestCompletedAt);
        } else if (isCurrent && row) {
          stepClass = "current";
          date = row.currentWeek ? `Week ${row.currentWeek}` : "now";
        } else if (row) {
          stepClass = "started";
        }
        const node = isPass ? CHECK : step.workingLevel === "Prep" ? "G" : String(index);
        return `<div class="step ${stepClass}"><span class="node">${node}</span><span class="lab">${escapeHtml(step.label)}</span><span class="date">${escapeHtml(date)}</span></div>`;
      }).join("");

      masteredTotal += masteredHere;

      const growthChip =
        growth?.growth !== null && growth?.growth !== undefined
          ? `<span class="chip">Pre ${growth.pretestScore}% to post ${growth.posttestScore}% · ${growth.growth > 0 ? "+" : ""}${growth.growth} points</span>`
          : growth?.pretestScore !== null && growth?.pretestScore !== undefined
            ? `<span class="chip soft">Starting point ${growth.pretestScore}% · post-test still to come</span>`
            : "";

      return `<section class="realm" style="--accent:${palette.accent}">
        <div class="realm-head">
          <h3>${escapeHtml(palette.name)}</h3>
          <div class="rmeta">
            <span class="mastered">${masteredHere} ${masteredHere === 1 ? "level" : "levels"} mastered</span>
            ${currentRow ? `<span class="now">${escapeHtml(ladderLabel(currentRow.workingLevel))}${currentRow.currentWeek ? ` · Week ${currentRow.currentWeek}` : ""}</span>` : ""}
          </div>
        </div>
        <div class="stepwrap"><div class="stepper">${steps}</div></div>
        ${growthChip ? `<div class="growth">${growthChip}</div>` : ""}
      </section>`;
    })
    .join("");

  const recent = activity.feed.slice(0, 8);
  const recentHtml = recent.length
    ? recent
        .map((item) => {
          const palette = parentRealmPalette(item.realmId);
          const score =
            item.correct !== null && item.attempted
              ? `${item.correct}/${item.attempted}${item.accuracy !== null ? ` · ${item.accuracy}%` : ""}`
              : item.accuracy !== null
                ? `${item.accuracy}%`
                : "";
          const when = monthYear(item.completedAt) ||
            new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" }).format(new Date(item.completedAt));
          return `<div class="row" style="--accent:${palette.accent}">
            <span class="dot"></span>
            <div class="rowtxt"><b>${escapeHtml(palette.name)}</b> — ${escapeHtml(item.label)}${item.week ? ` (Week ${item.week})` : ""}</div>
            <div class="rowscore">${escapeHtml(score)}</div>
            <div class="rowwhen">${escapeHtml(
              new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short" }).format(new Date(item.completedAt)) || when,
            )}</div>
          </div>`;
        })
        .join("")
    : '<p class="empty">No completed activities recorded yet.</p>';

  const generated = new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Melbourne",
  }).format(new Date());

  const hours = Math.round((report.minutesLearning / 60) * 10) / 10;

  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(report.student.name)} — Learning Report</title><style>
    *{box-sizing:border-box}
    body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#151b1a;margin:0;padding:30px 40px;font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased;background:#fff}
    .eyebrow{font-size:10.5px;font-weight:800;letter-spacing:.19em;text-transform:uppercase;color:#1f6f9c}
    h1{font-size:30px;margin:5px 0 2px;font-weight:850}
    .meta{margin:0;color:#5c6b70;font-size:13px;font-weight:600}
    .head{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;border-bottom:1px solid #dfe5e6;padding-bottom:18px}
    .stats{display:flex;gap:12px;margin:20px 0}
    .stat{flex:1;border:1px solid #dfe5e6;border-radius:14px;padding:12px 15px;background:#fbfcfc}
    .stat b{display:block;font-size:26px;font-weight:900;line-height:1}
    .stat span{font-size:11px;font-weight:700;color:#5c6b70;text-transform:uppercase;letter-spacing:.05em}
    h2{font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#8d9a9e;margin:26px 0 12px}
    .realm{border:1px solid #dfe5e6;border-radius:16px;padding:16px 20px 18px;margin-bottom:12px;border-left:4px solid var(--accent)}
    .realm-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
    .realm-head h3{margin:0;font-size:16px;font-weight:850;color:var(--accent)}
    .rmeta{display:flex;gap:12px;align-items:center}
    .mastered{font-size:11.5px;font-weight:700;color:#5c6b70}
    .now{font-size:12px;font-weight:800;color:#fff;background:var(--accent);border-radius:20px;padding:3px 11px}
    .stepwrap{overflow-x:auto;padding-top:16px}
    .stepper{position:relative;display:flex;justify-content:space-between;min-width:460px}
    .step{position:relative;z-index:1;flex:1;display:flex;flex-direction:column;align-items:center;gap:5px}
    .step::before{content:"";position:absolute;top:15px;right:50%;width:100%;height:3px;background:#e4eaea;z-index:-1}
    .step:first-child::before{display:none}
    .step.done::before,.step.current::before{background:var(--accent)}
    .node{width:31px;height:31px;border-radius:50%;display:grid;place-items:center;background:#f3f6f6;border:2.5px solid #e4eaea;color:#8d9a9e;font-size:11px;font-weight:800}
    .step.done .node{background:var(--accent);border-color:var(--accent);color:#fff}
    .step.current .node{background:#fff;border-color:var(--accent);color:var(--accent)}
    .step.started .node{border-color:var(--accent)}
    .lab{font-size:10px;font-weight:800;color:#5c6b70;white-space:nowrap}
    .step.current .lab{color:var(--accent)}
    .date{font-size:9px;font-weight:700;color:#8d9a9e;min-height:11px}
    .growth{margin-top:14px}
    .chip{display:inline-block;font-size:11.5px;font-weight:800;color:var(--accent);background:#f4f8f8;border:1px solid #e4eaea;border-radius:20px;padding:4px 11px}
    .chip.soft{color:#5c6b70}
    .recent{border:1px solid #dfe5e6;border-radius:16px;padding:4px 18px}
    .row{display:grid;grid-template-columns:14px 1fr auto 74px;gap:10px;align-items:center;padding:11px 0;border-bottom:1px solid #eef2f2;font-size:13px}
    .row:last-child{border-bottom:0}
    .dot{width:10px;height:10px;border-radius:50%;background:var(--accent)}
    .rowscore{font-weight:800;color:var(--accent)}
    .rowwhen{font-size:11.5px;font-weight:700;color:#8d9a9e;text-align:right}
    .empty{color:#8d9a9e;font-size:13px;padding:10px 0}
    footer{margin-top:22px;font-size:10.5px;color:#8d9a9e;line-height:1.6}
    .btn{margin-top:20px;padding:10px 17px;border:0;border-radius:9px;background:#1f6f9c;color:#fff;font-weight:800;font-size:13px;cursor:pointer}
    @media print{body{padding:12mm}.noprint{display:none}}
  </style></head><body>
    <div class="head">
      <div>
        <div class="eyebrow">Level Up Learning · Learning Report</div>
        <h1>${escapeHtml(report.student.name)}</h1>
        <p class="meta">${escapeHtml(report.student.yearLevel ?? "Year level not recorded")} · ${escapeHtml(report.student.schoolName ?? "Home learner")} · Generated ${escapeHtml(generated)}</p>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><b>${masteredTotal}</b><span>Levels mastered</span></div>
      <div class="stat"><b>${report.lessonsCompleted}</b><span>Lessons completed</span></div>
      <div class="stat"><b>${report.learningDays}</b><span>Learning days</span></div>
      <div class="stat"><b>${hours}</b><span>Hours learning</span></div>
    </div>
    <h2>Progress by realm</h2>
    ${sections || '<p class="empty">No realm progress recorded yet.</p>'}
    <h2>Recent activity</h2>
    <div class="recent">${recentHtml}</div>
    <footer>
      A level is mastered when its post-test is passed (${threshold}% or above). Each realm moves Ground, then Level 1 to Level 6, and children can sit at different levels in different realms — that is by design.
      Growth compares the pre-test and post-test of the same level, so it always comes from a matched pair.
    </footer>
    <button class="btn noprint" onclick="window.print()">Print or save as PDF</button>
  </body></html>`;
}

/** Opens the report in a popup, ready to print or save as PDF. */
export function openParentReport(report: ParentProgressReport, activity: ParentActivity) {
  const printWindow = window.open("", "_blank", "width=1000,height=1200");
  if (!printWindow) return false;
  printWindow.document.open();
  printWindow.document.write(buildParentReportHtml(report, activity));
  printWindow.document.close();
  return true;
}
