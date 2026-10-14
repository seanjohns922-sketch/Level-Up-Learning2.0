import { AC_STRANDS, strandForRealm, type AcStrand } from "@/lib/curriculum/ac-standards";
import { STANDING_META, studentStandings, type SchoolYearDates, type Standing } from "@/lib/proficiency";
import { studentGrowthAt, formatGrowth } from "@/lib/growth";
import { COLORS, documentHtml, escapeHtml, footer, generatedOn, letterhead, type DocumentLogo } from "@/lib/documents/reliq-document";
import type { SchoolAnalyticsSnapshot, StudentLearningJourney } from "@/lib/school-platform-server";

/** School documents (Carbon header, lime Q, green accents, school logo):
 * placement baseline, student progress report and learning journey. */

export type SchoolBrand = { schoolName: string | null; schoolLogo: DocumentLogo };

const STRAND_ORDER = (Object.keys(AC_STRANDS) as AcStrand[]).sort((a, b) => AC_STRANDS[a].order - AC_STRANDS[b].order);

// ---------------------------------------------------------------- placement

export type PlacementStrand = {
  label: string;
  placed: number;
  baseline: number | null;
  onLevelPct: number | null;
  belowCount: number;
  levels: Array<[string, number]>;
  gradeRows: Array<{ grade: string; levels: Array<[string, number]> }>;
};

const LEVEL_COLUMNS = ["Prep", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7", "Year 8", "Not placed"];
const LADDER = LEVEL_COLUMNS.slice(0, 9);
const GREEN_RAMP = ["#F1F9E3", "#DDF2B5", "#C6EA86", "#A9DB57", "#86C232", "#649A1E", "#477315", "#2F4F0D", "#1C3207"];

function placementCell(grade: string, level: string, count: number) {
  const g = LADDER.indexOf(grade);
  const w = LADDER.indexOf(level);
  if (!count) return { bg: "#F8F9F6", fg: "#C9CDC5", border: "1px solid #D0D4CC" };
  if (g < 0 || w < 0) return { bg: "#E9EBE5", fg: "#3A3D40", border: "1px solid #D5D8D1" };
  if (w < g - 1) return { bg: COLORS.coral, fg: "#4A0F09", border: "1px solid #E98576" };
  if (w < g) return { bg: COLORS.amber, fg: "#3F2E00", border: "1px solid #F2C94C" };
  if (w === g) return { bg: COLORS.lime, fg: COLORS.carbon, border: `1.5px solid ${COLORS.carbon}` };
  return { bg: COLORS.carbon, fg: "#FFFFFF", border: `1px solid ${COLORS.carbon}` };
}

const pct = (value: number | null) => (value === null ? "—" : `${value}%`);

export function placementBaselineHtml({ brand, scopeLabel, strands }: { brand: SchoolBrand; scopeLabel: string; strands: PlacementStrand[] }): string {
  const meta = [brand.schoolName, scopeLabel, String(new Date().getFullYear())].filter(Boolean).join(" · ");
  const head = letterhead({ audience: "school", label: "Placement baseline", meta, schoolLogo: brand.schoolLogo });
  const maxBelow = Math.max(1, ...strands.map((strand) => strand.belowCount));
  const summary = `<div><span class="h" style="font-size:26px">Where students are working</span>
      <p style="margin:4px 0 0;font-size:13px;color:${COLORS.muted}">Each student's working level in RELIQ, strand by strand, set against their school year. Baseline is the average pre-test score.</p></div>
    <section class="card" style="overflow:hidden">
      <div class="sumrow label" style="background:${COLORS.paper}"><span>Strand</span><span>Placed</span><span>At or above</span><span>Working below their year</span><span style="text-align:right">Baseline</span></div>
      ${strands.map((strand) => `<div class="sumrow" style="border-top:1px solid #D0D4CC;font-size:13px">
        <b>${escapeHtml(strand.label)}</b><span style="color:${COLORS.muted}">${strand.placed}</span><b>${pct(strand.onLevelPct)}</b>
        <span style="display:flex;align-items:center;gap:8px"><span style="flex:1;height:8px;border-radius:999px;background:#E3E5E0;overflow:hidden"><span style="display:block;height:100%;width:${(strand.belowCount / maxBelow) * 100}%;background:${COLORS.coral}"></span></span><b style="width:24px;text-align:right;color:#A8332A">${strand.belowCount}</b></span>
        <span style="text-align:right;font-weight:700">${pct(strand.baseline)}</span></div>`).join("")}
    </section>`;

  const card = (strand: PlacementStrand) => {
    const total = Math.max(1, strand.levels.reduce((sum, [, count]) => sum + count, 0));
    const ramp = (level: string) => (LADDER.indexOf(level) >= 0 ? GREEN_RAMP[LADDER.indexOf(level)] : "#E9EBE5");
    return `<section class="card" style="padding:14px 18px;display:grid;grid-template-columns:220px 1fr;gap:20px">
      <div style="display:flex;flex-direction:column;gap:8px">
        <span style="display:flex;justify-content:space-between;align-items:baseline"><span class="h" style="font-size:18px">${escapeHtml(strand.label)}</span><span style="font-size:11px;font-weight:800;padding:2px 8px;border-radius:6px;background:${COLORS.paper}">Baseline ${pct(strand.baseline)}</span></span>
        <span style="font-size:12px;color:${COLORS.muted}">${strand.placed} placements · ${pct(strand.onLevelPct)} at or above</span>
        <span class="label" style="margin-top:4px">Working levels</span>
        <span style="display:flex;height:12px;border-radius:999px;overflow:hidden">${strand.levels.map(([level, count]) => `<span style="width:${(count / total) * 100}%;background:${ramp(level)}"></span>`).join("")}</span>
        <span style="display:grid;grid-template-columns:1fr 1fr;gap:3px 10px;font-size:11.5px">${strand.levels.map(([level, count]) => `<span style="display:flex;align-items:center;gap:5px"><span style="width:9px;height:9px;border-radius:2px;background:${ramp(level)};border:1px solid #D5D8D1"></span>${escapeHtml(level)}<b style="margin-left:auto">${count}</b></span>`).join("")}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px">
        <span class="label">School year → working level</span>
        <span class="grid10 label" style="text-align:center;font-size:10px"><span></span>${LEVEL_COLUMNS.map((level) => `<span>${level === "Prep" ? "P" : level === "Not placed" ? "NP" : level.replace("Year ", "Y")}</span>`).join("")}</span>
        ${strand.gradeRows.map((row) => `<span class="grid10" style="align-items:center"><b style="font-size:12px">${escapeHtml(row.grade)}</b>${LEVEL_COLUMNS.map((level) => {
          const count = row.levels.find(([name]) => name === level)?.[1] ?? 0;
          const cell = placementCell(row.grade, level, count);
          return `<span class="cell" style="background:${cell.bg};color:${cell.fg};border:${cell.border}">${count || ""}</span>`;
        }).join("")}</span>`).join("")}
        <span style="display:flex;flex-wrap:wrap;gap:10px;font-size:10.5px;color:${COLORS.muted};margin-top:4px">
          <span><span class="sw" style="background:${COLORS.coral}"></span>2+ levels below</span><span><span class="sw" style="background:${COLORS.amber}"></span>1 level below</span><span><span class="sw" style="background:${COLORS.lime};outline:1px solid ${COLORS.carbon}"></span>Their year</span><span><span class="sw" style="background:${COLORS.carbon}"></span>Above</span>
        </span>
        ${strand.belowCount ? `<span style="font-size:12px;font-weight:800;color:#A8332A;margin-top:2px">${strand.belowCount} working below their year in ${escapeHtml(strand.label)}</span>` : ""}
      </div>
    </section>`;
  };

  // Page 1: summary and the first two strands; then three strands a page.
  const pages: string[] = [];
  const chunks: PlacementStrand[][] = [strands.slice(0, 2)];
  for (let i = 2; i < strands.length; i += 3) chunks.push(strands.slice(i, i + 3));
  const totalPages = chunks.length;
  chunks.forEach((chunk, index) => {
    pages.push(`${head}${index === 0 ? summary : ""}${chunk.map(card).join("")}${footer("RELIQ · BrightUp Education", `${generatedOn()} · Page ${index + 1} of ${totalPages}`)}`);
  });
  const css = `.sumrow{display:grid;grid-template-columns:1.3fr .8fr 1fr 2.2fr .9fr;gap:8px;padding:8px 16px;align-items:center}
.grid10{display:grid;grid-template-columns:54px repeat(10,1fr);gap:4px}
.cell{height:24px;border-radius:5px;display:grid;place-items:center;font-size:11px;font-weight:800}
.sw{display:inline-block;width:9px;height:9px;border-radius:2px;margin-right:4px;vertical-align:-1px}`;
  return documentHtml({ title: `RELIQ placement baseline — ${brand.schoolName ?? "school"}`, pages, css });
}

// ---------------------------------------------------------- progress report

type SnapshotStudent = SchoolAnalyticsSnapshot["students"][number];

const STATUS_CHIP: Record<SnapshotStudent["status"], [string, string, string]> = {
  on_track: ["On track", COLORS.limeTint, COLORS.green],
  active: ["Active", "#E3E5E0", "#3A3D40"],
  needs_attention: ["Needs attention", "#FFF1C7", "#5C4300"],
};

const SOURCE_LABEL: Record<string, string> = { diagnostic: "Diagnostic", pretest: "Pre-test", posttest: "Post-test" };
const shortDate = (iso: string) => new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "Australia/Melbourne" }).format(new Date(iso));

export function studentProgressReportHtml({ brand, student, year, windowLabel }: { brand: SchoolBrand; student: SnapshotStudent; year: SchoolYearDates | null; windowLabel: string }): string {
  const standings = studentStandings({ yearLevel: student.yearLevel, realms: student.realms, tests: student.tests }, year);
  const growth = year ? studentGrowthAt(student.testHistory, Date.now()) : null;
  const latestByStrand = new Map((student.tests ?? []).map((test) => [strandForRealm(test.strand), test]));
  const realmByStrand = new Map(student.realms.map((realm) => [strandForRealm(realm.realmId), realm]));

  const rows = STRAND_ORDER.map((strand) => {
    const realm = realmByStrand.get(strand);
    const test = latestByStrand.get(strand);
    const standing = standings.strands.get(strand) ?? null;
    const strandGrowth = growth?.strands.get(strand);
    return { strand, realm, test, standing, growth: strandGrowth ? formatGrowth(strandGrowth.gained) : test ? "Waiting" : "—" };
  });
  const chip = (standing: Standing | null) => {
    if (!standing) return `<span class="chip" style="background:#E3E5E0;color:${COLORS.muted}">Not tested</span>`;
    const meta = STANDING_META[standing];
    return `<span class="chip" style="background:${meta.bg};color:${meta.fg}">${meta.label}</span>`;
  };
  const strengths = rows.filter((row) => row.standing === "above" || row.standing === "at").map((row) => AC_STRANDS[row.strand].label);
  const focus = rows.filter((row) => row.standing === "below" || row.standing === "wellBelow").map((row) => AC_STRANDS[row.strand].label);
  const untested = rows.filter((row) => !row.test).map((row) => AC_STRANDS[row.strand].label);
  const list = (items: string[]) => (items.length > 1 ? `${items.slice(0, -1).join(", ")} and ${items.at(-1)}` : items[0] ?? "");
  const [statusLabel, statusBg, statusFg] = STATUS_CHIP[student.status];
  const overall = standings.overall ? STANDING_META[standings.overall] : null;
  const meta = [brand.schoolName, student.className, String(new Date().getFullYear())].filter(Boolean).join(" · ");

  const page = `${letterhead({ audience: "school", label: "Student progress report", meta, schoolLogo: brand.schoolLogo })}
    <section style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px">
      <div><span class="h" style="font-size:32px;line-height:1">${escapeHtml(student.name)}</span>
        <div style="font-size:14px;color:${COLORS.muted};margin-top:4px">${escapeHtml([student.yearLevel ?? "Year not recorded", student.className, windowLabel].join(" · "))}</div></div>
      <span style="display:flex;gap:8px"><span class="chip" style="font-size:13px;padding:4px 12px;background:${statusBg};color:${statusFg}">${statusLabel}</span>${overall ? `<span class="chip" style="font-size:13px;padding:4px 12px;background:${overall.bg};color:${overall.fg}">${overall.label} overall</span>` : ""}</span>
    </section>
    <section style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
      ${[["Accuracy", student.averageAccuracy === null ? "—" : `${Math.round(student.averageAccuracy)}%`, "Lessons and quizzes"], ["Levels mastered", String(student.masteredLevels), "Post-tests at 85%+"], ["Learning days", String(student.learningDays), windowLabel], ["Weekly target", student.weeklyTargetMet ? "Met" : "Not yet", "3 lessons in 7 days"]]
        .map(([label, value, detail]) => `<div class="card" style="padding:12px 14px"><span class="label">${escapeHtml(label)}</span><span class="h" style="display:block;font-size:26px;line-height:1.1;margin-top:4px">${escapeHtml(value)}</span><span style="display:block;font-size:11.5px;color:${COLORS.muted}">${escapeHtml(detail)}</span></div>`).join("")}
    </section>
    <section class="card" style="overflow:hidden">
      <div class="prow label" style="background:${COLORS.paper}"><span>Strand</span><span>Working level</span><span>Latest test</span><span>Standing</span><span style="text-align:right">Growth</span></div>
      ${rows.map((row) => `<div class="prow" style="border-top:1px solid #D0D4CC;font-size:13px">
        <b>${escapeHtml(AC_STRANDS[row.strand].label)}</b>
        <span>${escapeHtml(row.realm?.currentLevel ? `${row.realm.currentLevel}${row.realm.currentWeek ? ` · Week ${row.realm.currentWeek}` : ""}` : "Not placed")}</span>
        <span style="display:flex;flex-direction:column"><b>${row.test ? row.test.measured.toFixed(1) : "—"}</b><span style="font-size:11px;color:${COLORS.muted}">${row.test ? escapeHtml(`${SOURCE_LABEL[row.test.source] ?? "Test"} · ${shortDate(row.test.testedAt)}`) : "No test yet"}</span></span>
        <span>${chip(row.standing)}</span>
        <b style="text-align:right">${escapeHtml(row.growth)}</b></div>`).join("")}
    </section>
    <section style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div style="border-radius:16px;background:${COLORS.paper};padding:14px 16px"><span class="h" style="font-size:14px">Strengths</span><p style="margin:6px 0 0;font-size:12.5px;line-height:1.5;color:#3A3D40">${strengths.length ? `At or above level in ${escapeHtml(list(strengths))}.` : "No strand is at level yet; growth will show as post-tests come in."}</p></div>
      <div style="border-radius:16px;background:#FFF1C7;padding:14px 16px"><span class="h" style="font-size:14px">Next focus</span><p style="margin:6px 0 0;font-size:12.5px;line-height:1.5;color:#3F2E00">${focus.length ? `Below level in ${escapeHtml(list(focus))}.` : "No strand is below level."}${untested.length ? ` ${escapeHtml(list(untested))} ${untested.length === 1 ? "has" : "have"} no test yet.` : ""}</p></div>
    </section>
    <p style="margin:0;font-size:11px;line-height:1.5;color:${COLORS.faint}">Standing compares each strand's latest diagnostic, pre-test or post-test with where the student's school year should be in the term it was sat (a quarter of a level each term). Growth runs from the starting pre-test to the latest post-test or diagnostic. Level 3 complete = 3.0.</p>
    ${footer("RELIQ · BrightUp Education", `${generatedOn()} · Page 1 of 1`)}`;
  const css = `.prow{display:grid;grid-template-columns:1.1fr 1fr 1.3fr 1fr .9fr;gap:10px;padding:9px 16px;align-items:center}`;
  return documentHtml({ title: `RELIQ progress report — ${student.name}`, pages: [page], css });
}

// ---------------------------------------------------------- learning journey

const JOURNEY_PASS = 85;
const REALM_NAMES: Record<string, [string, number]> = {
  number: ["Number Nexus", 0], measurement: ["Measurelands", 1], space: ["Starpath", 2],
  statistics: ["Statistica", 3], pattern: ["Pattern Peaks", 4], chance: ["Chance Hollow", 5],
};
const STEP_LABEL = (level: string) => (level === "Prep" ? "Ground" : level.replace("Year ", "Y"));
const monthYear = (iso: string) => new Intl.DateTimeFormat("en-AU", { month: "short", year: "2-digit", timeZone: "Australia/Melbourne" }).format(new Date(iso));

export function learningJourneyHtml({ brand, journey }: { brand: SchoolBrand; journey: StudentLearningJourney }): string {
  const byRealm = new Map<string, StudentLearningJourney["levels"]>();
  for (const level of journey.levels) byRealm.set(level.realmId, [...(byRealm.get(level.realmId) ?? []), level]);
  const realmIds = [...byRealm.keys()].sort((a, b) => (REALM_NAMES[a]?.[1] ?? 99) - (REALM_NAMES[b]?.[1] ?? 99));
  const passed = (row?: StudentLearningJourney["levels"][number]) => Boolean(row && row.posttestScore != null && row.posttestScore >= JOURNEY_PASS);
  const topIndex = Math.max(6, ...journey.levels.map((row) => LADDER.indexOf(row.workingLevel)));
  const ladder = LADDER.slice(0, topIndex + 1);

  let mastered = 0;
  const currentLevels: number[] = [];
  const milestones: Array<{ iso: string; realm: string; level: string; score: number }> = [];
  const realms = realmIds.map((realmId) => {
    const rows = byRealm.get(realmId)!;
    const name = REALM_NAMES[realmId]?.[0] ?? realmId;
    const current = rows.find((row) => row.isCurrent);
    if (current && LADDER.indexOf(current.workingLevel) >= 0) currentLevels.push(LADDER.indexOf(current.workingLevel));
    let here = 0;
    const steps = ladder.map((level) => {
      const row = rows.find((item) => item.workingLevel === level);
      if (passed(row)) {
        here += 1;
        if (row!.posttestCompletedAt) milestones.push({ iso: row!.posttestCompletedAt, realm: name, level, score: row!.posttestScore! });
        return { level, state: "done", date: row!.posttestCompletedAt ? monthYear(row!.posttestCompletedAt) : "" };
      }
      if (row?.isCurrent) return { level, state: "now", date: row.currentWeek ? `Week ${row.currentWeek}` : "Now" };
      return { level, state: "todo", date: "" };
    });
    mastered += here;
    const done = steps.filter((step) => step.state === "done").length;
    return { name, here, steps, done, now: current ? `${current.workingLevel}${current.currentWeek ? ` · Wk ${current.currentWeek}` : ""}` : "" };
  });
  milestones.sort((a, b) => b.iso.localeCompare(a.iso));
  const workingAt = currentLevels.length ? Math.round(currentLevels.reduce((a, b) => a + b, 0) / currentLevels.length) : null;
  const meta = [brand.schoolName, journey.student.className, String(new Date().getFullYear())].filter(Boolean).join(" · ");
  const dateLong = (iso: string) => new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric", timeZone: "Australia/Melbourne" }).format(new Date(iso));

  const page = `${letterhead({ audience: "school", label: "Learning journey", meta, schoolLogo: brand.schoolLogo })}
    <section style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px">
      <div><span class="h" style="font-size:32px;line-height:1">${escapeHtml(journey.student.name)}</span>
        <div style="font-size:14px;color:${COLORS.muted};margin-top:4px">${escapeHtml([journey.student.yearLevel ?? "Year not recorded", journey.student.className].join(" · "))}</div></div>
      ${workingAt !== null ? `<span style="text-align:right"><span class="label">Currently working at</span><span class="h" style="display:block;font-size:30px;line-height:1.1">≈ ${escapeHtml(workingAt === 0 ? "Ground" : `Level ${workingAt}`)}</span></span>` : ""}
    </section>
    <section style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
      ${[[String(mastered), "Levels mastered", COLORS.carbon, "#FFFFFF"], [String(milestones.length), "Post-tests passed", COLORS.lime, COLORS.carbon], [String(realmIds.length), "Realms active", COLORS.limeTint, COLORS.green]]
        .map(([value, label, bg, fg]) => `<div style="border-radius:14px;padding:12px 14px;background:${bg};color:${fg}"><span class="h" style="display:block;font-size:28px;line-height:1">${value}</span><span style="display:block;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-top:4px">${label}</span></div>`).join("")}
    </section>
    <section class="card" style="padding:12px 16px 4px">
      <span class="h" style="font-size:16px">Realm progression</span>
      ${realms.map((realm) => `<div style="display:grid;grid-template-columns:128px 1fr 104px;gap:12px;align-items:center;padding:8px 0;border-top:1px solid #D0D4CC;margin-top:6px">
        <span style="display:flex;flex-direction:column"><b style="font-size:14px">${escapeHtml(realm.name)}</b><span style="font-size:11px;color:${COLORS.muted}">${realm.here} level${realm.here === 1 ? "" : "s"} mastered</span></span>
        <span style="display:grid;grid-template-columns:repeat(${ladder.length},1fr);position:relative">
          <span style="position:absolute;left:${50 / ladder.length}%;right:${50 / ladder.length}%;top:10px;height:3px;background:${COLORS.rule}"></span>
          ${realm.steps.map((step) => {
            const bg = step.state === "done" ? COLORS.carbon : step.state === "now" ? COLORS.lime : "#FFFFFF";
            const border = step.state === "todo" ? "#C9CDC5" : COLORS.carbon;
            return `<span style="display:flex;flex-direction:column;align-items:center;gap:2px;position:relative"><span style="width:22px;height:22px;border-radius:50%;background:${bg};border:2px solid ${border};display:grid;place-items:center;font-size:11px;font-weight:900;color:${COLORS.lime}">${step.state === "done" ? "✓" : ""}</span><span style="font-size:9.5px;font-weight:700;color:${step.state === "todo" ? COLORS.faint : COLORS.carbon}">${STEP_LABEL(step.level)}</span><span style="font-size:9px;color:${COLORS.faint}">${escapeHtml(step.date)}</span></span>`;
          }).join("")}
        </span>
        <span style="justify-self:end">${realm.now ? `<span class="chip" style="background:${COLORS.carbon};color:${COLORS.lime}">${escapeHtml(realm.now)}</span>` : ""}</span>
      </div>`).join("") || `<p style="font-size:13px;color:${COLORS.muted}">No realm progress recorded yet.</p>`}
    </section>
    <section class="card" style="overflow:hidden">
      <div style="padding:10px 16px"><span class="h" style="font-size:16px">Milestones</span></div>
      ${milestones.slice(0, 8).map((item) => `<div style="display:grid;grid-template-columns:96px 1fr 60px;gap:10px;padding:7px 16px;border-top:1px solid #D0D4CC;font-size:12.5px;align-items:center"><span style="color:${COLORS.muted}">${escapeHtml(dateLong(item.iso))}</span><span><b>${escapeHtml(item.realm)}</b> passed the ${escapeHtml(item.level)} post-test and moved up</span><b style="text-align:right;color:${COLORS.green}">${item.score}%</b></div>`).join("") || `<p style="margin:0;padding:8px 16px 14px;font-size:13px;color:${COLORS.muted}">No post-tests passed yet.</p>`}
    </section>
    ${footer("RELIQ · BrightUp Education · A level is mastered when its post-test is passed at 85%+", generatedOn())}`;
  return documentHtml({ title: `RELIQ learning journey — ${journey.student.name}`, pages: [page] });
}
