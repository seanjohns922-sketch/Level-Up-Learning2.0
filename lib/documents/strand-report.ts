import { COLORS, documentHtml, escapeHtml, footer, generatedOn, letterhead, type DocumentLogo } from "@/lib/documents/reliq-document";
import type { StrandReportNotStarted, StrandReportRealm, StrandReportTone } from "@/lib/teacher/strand-report";

/** Strand report: how one student is going in every realm this year so far.
 * An overview page, then one page per realm with the level, lesson accuracy,
 * weekly quiz and pre-test, the strongest skill and focus from the lesson
 * insights, and every lesson result this level. School document: Carbon
 * letterhead with the school's logo; realm colours only as small accents. */

/** Realm accent colours, matching the realm dots in the teacher dashboard. */
const REALM_ACCENT: Record<StrandReportRealm["realmId"], string> = {
  number: "#0E9C93",
  measurement: "#C2892E",
  space: "#5B6EE6",
  pattern: "#7C3AED",
  statistics: "#C2557A",
  chance: "#0891B2",
};

const TONE: Record<StrandReportTone, { bg: string; fg: string }> = {
  support: { bg: COLORS.coral, fg: "#4A0F09" },
  checkIn: { bg: COLORS.amber, fg: "#3F2E00" },
  onTrack: { bg: COLORS.lime, fg: COLORS.carbon },
  strong: { bg: COLORS.carbon, fg: "#FFFFFF" },
  none: { bg: "#E3E5E0", fg: COLORS.muted },
};

/** Score colours on white: green 80%+, amber 60–79%, red below 60%. */
function scoreColour(percent: number | null) {
  if (percent == null) return COLORS.faint;
  if (percent >= 80) return COLORS.green;
  if (percent >= 60) return "#8A5A00";
  return "#A8332A";
}

const pct = (value: number | null) => (value == null ? "—" : `${Math.round(value * 10) / 10}%`);
const chip = (status: StrandReportRealm["status"], size = 11) =>
  `<span class="chip" style="font-size:${size}px;padding:3px 11px;background:${TONE[status.tone].bg};color:${TONE[status.tone].fg}">${escapeHtml(status.label)}</span>`;

/** Rough row budgets so long levels continue on a second page. */
const ROWS_FIRST_PAGE = 20;
const ROWS_NEXT_PAGE = 34;

type Row = { kind: "week"; week: StrandReportRealm["weeks"][number] } | { kind: "lesson"; lesson: StrandReportRealm["weeks"][number]["lessons"][number] };

function lessonRows(realm: StrandReportRealm): Row[] {
  return realm.weeks.flatMap((week) => [{ kind: "week" as const, week }, ...week.lessons.map((lesson) => ({ kind: "lesson" as const, lesson }))]);
}

function table(rows: Row[], accent: string) {
  return `<section class="card" style="overflow:hidden">
    <div class="lrow label" style="background:${COLORS.paper}"><span></span><span>Lesson focus</span><span style="text-align:right">Score</span></div>
    ${rows.map((row) => row.kind === "week"
      ? `<div class="lrow" style="border-top:1.5px solid ${COLORS.rule};background:#FAFBF8">
          <span class="label" style="color:${accent};grid-column:1 / 3">Week ${row.week.week}${row.week.current ? " · Current" : ""}</span>
          <span style="text-align:right;font-size:11px;font-weight:800;white-space:nowrap;color:${COLORS.muted}">${row.week.quizPercent == null ? "Weekly quiz —" : `Weekly quiz ${pct(row.week.quizPercent)}`}</span>
        </div>`
      : `<div class="lrow" style="border-top:1px solid #E3E5E0;${row.lesson.focus ? `background:${COLORS.limeTint}` : ""}">
          <span style="font-weight:800;color:${COLORS.muted}">L${row.lesson.lesson}</span>
          <span style="font-size:13px">${escapeHtml(row.lesson.title)}${row.lesson.focus ? ` <span class="chip" style="font-size:9.5px;background:${COLORS.carbon};color:${COLORS.lime}">FOCUS</span>` : ""}</span>
          <span class="h" style="text-align:right;font-size:14px;color:${scoreColour(row.lesson.accuracy)}">${pct(row.lesson.accuracy)}</span>
        </div>`).join("")}
  </section>`;
}

function stat(label: string, value: string, sub: string, accent: string) {
  return `<div class="card" style="padding:12px 14px">
    <div class="label">${escapeHtml(label)}</div>
    <div class="h" style="font-size:24px;line-height:1.1;margin-top:4px;color:${accent}">${escapeHtml(value)}</div>
    <div style="font-size:11.5px;color:${COLORS.muted};margin-top:3px">${escapeHtml(sub)}</div>
  </div>`;
}

function realmPages(realm: StrandReportRealm, studentLine: string, head: () => string): string[] {
  const accent = REALM_ACCENT[realm.realmId];
  const weekLine = realm.week ? `Week ${realm.week}${realm.totalWeeks ? ` of ${realm.totalWeeks}` : ""}` : "Not started";
  const intro = `<section style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;border-left:6px solid ${accent};padding-left:14px">
      <div><div class="label">${escapeHtml(studentLine)}</div>
        <div class="h" style="font-size:32px;line-height:1.05;margin-top:2px">${escapeHtml(realm.strand)}</div>
        <div style="font-size:14px;color:${COLORS.muted};margin-top:2px">${escapeHtml(realm.realmName)}</div></div>
      ${chip(realm.status, 13)}
    </section>
    <section style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
      ${stat("Working level", realm.levelLabel, weekLine, COLORS.carbon)}
      ${stat("Lesson accuracy", pct(realm.lessonAccuracy?.percent ?? null), realm.lessonAccuracy ? `${realm.lessonAccuracy.correct} of ${realm.lessonAccuracy.total} correct` : "No lessons yet", COLORS.carbon)}
      ${stat("Weekly quiz", pct(realm.weeklyQuiz?.percent ?? null), realm.weeklyQuiz ? `${realm.weeklyQuiz.correct} of ${realm.weeklyQuiz.total} · Week ${realm.weeklyQuiz.week}` : "No quiz yet", COLORS.carbon)}
      ${stat("Pre-test", pct(realm.pretest), realm.pretest == null ? "Not recorded" : `${realm.levelLabel} pre-test`, COLORS.carbon)}
    </section>
    <section style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="card" style="padding:14px 16px;background:${COLORS.limeTint};border-color:#CDEB98">
        <div class="label" style="color:${COLORS.green}">Strongest skill</div>
        <div class="h" style="font-size:18px;margin-top:4px">${escapeHtml(realm.strongest?.skill ?? "Not enough evidence yet")}</div>
        <div style="font-size:12px;color:${COLORS.muted};margin-top:4px">${escapeHtml(realm.strongest?.evidence ?? "Shows once a few lessons are complete.")}</div>
      </div>
      <div class="card" style="padding:14px 16px;background:#FFF7DD;border-color:#F0D98A">
        <div class="label" style="color:#8A5A00">Focus · needs support</div>
        <div class="h" style="font-size:18px;margin-top:4px">${escapeHtml(realm.focus?.skill ?? "No priority gap right now")}</div>
        <div style="font-size:12.5px;margin-top:4px">${realm.focus ? `<b>Try this:</b> ${escapeHtml(realm.focus.action)}` : `<span style="color:${COLORS.muted}">Keep going with the current week.</span>`}</div>
      </div>
    </section>
    <div class="label">Lesson results · every lesson this level so far</div>`;

  const rows = lessonRows(realm);
  const chunks: Row[][] = [rows.slice(0, ROWS_FIRST_PAGE)];
  for (let index = ROWS_FIRST_PAGE; index < rows.length; index += ROWS_NEXT_PAGE) chunks.push(rows.slice(index, index + ROWS_NEXT_PAGE));
  return chunks.map((chunk, index) => `${head()}
    ${index === 0 ? intro : `<div class="h" style="font-size:18px">${escapeHtml(`${realm.strand} · ${realm.realmName} (continued)`)}</div>`}
    ${table(chunk, accent)}`);
}

export function strandReportHtml({ student, className, schoolName, schoolLogo = null, yearLevel, realms, notStarted }: {
  student: string;
  className: string;
  schoolName: string;
  schoolLogo?: DocumentLogo;
  yearLevel: string;
  realms: StrandReportRealm[];
  notStarted: StrandReportNotStarted[];
}): string {
  const meta = [schoolName, className, String(new Date().getFullYear())].filter(Boolean).join(" · ");
  const head = () => letterhead({ audience: "school", label: "Strand report", meta, schoolLogo });
  const studentLine = [student, className, yearLevel].filter(Boolean).join(" · ");

  const overview = `${head()}
    <section><div class="label">${escapeHtml([className, yearLevel].filter(Boolean).join(" · "))}</div>
      <div class="h" style="font-size:32px;line-height:1.05;margin-top:2px">${escapeHtml(student)}</div>
      <p style="margin:6px 0 0;font-size:13.5px;color:${COLORS.muted}">How ${escapeHtml(student.split(" ")[0] ?? student)} is going in each strand this year so far. Each strand has its own page with every lesson result.</p></section>
    <section class="card" style="overflow:hidden">
      <div class="orow label" style="background:${COLORS.paper}"><span>Strand</span><span>Level</span><span>Lesson accuracy</span><span>Latest quiz</span><span>Pre-test</span><span style="text-align:right">Status</span></div>
      ${realms.map((realm) => `<div class="orow" style="border-top:1px solid #E3E5E0">
          <span style="display:flex;align-items:center;gap:8px"><span style="width:10px;height:10px;border-radius:50%;background:${REALM_ACCENT[realm.realmId]}"></span><span><b>${escapeHtml(realm.strand)}</b><br><span style="font-size:11px;color:${COLORS.muted}">${escapeHtml(realm.realmName)}</span></span></span>
          <span><b>${escapeHtml(realm.levelLabel)}</b><br><span style="font-size:11px;color:${COLORS.muted}">${realm.week ? `Week ${realm.week}${realm.totalWeeks ? ` of ${realm.totalWeeks}` : ""}` : "—"}</span></span>
          <span class="h" style="font-size:15px;color:${scoreColour(realm.lessonAccuracy?.percent ?? null)}">${pct(realm.lessonAccuracy?.percent ?? null)}</span>
          <span class="h" style="font-size:15px;color:${scoreColour(realm.weeklyQuiz?.percent ?? null)}">${pct(realm.weeklyQuiz?.percent ?? null)}</span>
          <span class="h" style="font-size:15px">${pct(realm.pretest)}</span>
          <span style="text-align:right">${chip(realm.status)}</span>
        </div>`).join("")}
      ${notStarted.map((realm) => `<div class="orow" style="border-top:1px solid #E3E5E0;color:${COLORS.muted}">
          <span style="display:flex;align-items:center;gap:8px"><span style="width:10px;height:10px;border-radius:50%;background:#C9CCC6"></span><span><b>${escapeHtml(realm.strand)}</b><br><span style="font-size:11px">${escapeHtml(realm.realmName)}</span></span></span>
          <span style="grid-column:2 / 6;font-size:12px">Not started yet</span><span></span>
        </div>`).join("")}
    </section>
    <p style="font-size:11px;color:${COLORS.muted};margin:0">Lesson accuracy counts every lesson completed at the current level. Scores: green 80%+, amber 60–79%, red below 60%. Strongest skill and focus come from the questions answered in recent lessons.</p>`;

  const detail = realms.flatMap((realm) => realmPages(realm, studentLine, head));
  const all = [overview, ...detail];
  const pages = all.map((page, index) => `${page}
    ${footer("RELIQ · BrightUp Education", `${generatedOn()} · Page ${index + 1} of ${all.length}`)}`);
  const css = `.orow{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr .8fr 1fr;gap:10px;padding:9px 14px;align-items:center;font-size:13px}
    .lrow{display:grid;grid-template-columns:36px 1fr 110px;gap:10px;padding:6px 14px;align-items:center}`;
  return documentHtml({ title: `RELIQ strand report — ${student}`, pages, css });
}
