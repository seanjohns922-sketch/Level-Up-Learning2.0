import { COLORS, documentHtml, escapeHtml, footer, generatedOn, letterhead } from "@/lib/documents/reliq-document";

/** Scope and sequence for one realm and level: how the level runs and every
 * week with its lessons and curriculum codes. RELIQ-only (no school logo),
 * because it is the same for every school. */

export type ScopeWeek = { week: number; topic: string; lessons: string[]; codes: string[] };

const WEEKS_PER_PAGE = 13;

export function levelName(yearLabel: string): string {
  return yearLabel === "Prep" ? "Ground" : yearLabel.replace(/^Year /, "Level ");
}

function codeRange(codes: string[]): string {
  const unique = [...new Set(codes.map((code) => code.trim()).filter(Boolean))];
  if (unique.length <= 2) return unique.join(", ") || "—";
  return `${unique[0]}–${unique[unique.length - 1].replace(/^AC9M\d/, "")}`;
}

export function scopeAndSequenceHtml({ realmName, strandLabel, yearLabel, weeks }: { realmName: string; strandLabel: string; yearLabel: string; weeks: ScopeWeek[] }): string {
  const level = levelName(yearLabel);
  const lessons = weeks.reduce((total, week) => total + week.lessons.length, 0);
  const perWeek = weeks.length ? Math.round(lessons / weeks.length) : 3;
  const intro = `<section style="display:grid;grid-template-columns:1fr auto;gap:16px;align-items:end">
      <div><span class="label" style="color:${COLORS.green}">${escapeHtml(realmName)}</span>
        <div class="h" style="font-size:30px;line-height:1.1">${escapeHtml(`${strandLabel} · ${level}`)}</div>
        <p style="margin:6px 0 0;font-size:13px;color:${COLORS.muted};max-width:470px">${escapeHtml(`${weeks.length} weeks, each with ${perWeek} lessons and a weekly quiz. Students sit a pre-test to start and a post-test to finish the level.`)}</p></div>
      <div style="display:flex;gap:8px">
        ${[[String(weeks.length), "weeks", COLORS.carbon, "#FFFFFF"], [String(lessons), "lessons", COLORS.lime, COLORS.carbon], [String(weeks.length), "weekly quizzes", COLORS.limeTint, COLORS.green]]
          .map(([value, label, bg, fg]) => `<span style="border-radius:12px;background:${bg};color:${fg};padding:8px 12px;min-width:70px"><span class="h" style="display:block;font-size:22px;line-height:1">${value}</span><span style="display:block;font-size:10.5px;font-weight:700;margin-top:2px">${label}</span></span>`).join("")}
      </div>
    </section>
    <section style="display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:700;text-align:center">
      <span style="flex:1.1;border-radius:9px;padding:7px 10px;background:${COLORS.paper}">Pre-test · sets the start</span>
      <span style="flex:1;border-radius:9px;padding:7px 10px;background:${COLORS.paper}">${perWeek} lessons each week</span>
      <span style="flex:1.2;border-radius:9px;padding:7px 10px;background:${COLORS.limeTint};color:${COLORS.green}">Weekly quiz · 80% to move on</span>
      <span style="flex:.6;border-radius:9px;padding:7px 10px;background:${COLORS.paper}">× ${weeks.length} weeks</span>
      <span style="flex:1.3;border-radius:9px;padding:7px 10px;background:${COLORS.carbon};color:${COLORS.lime}">Post-test · 85% masters the level</span>
    </section>`;

  const table = (rows: ScopeWeek[]) => `<section class="card" style="overflow:hidden">
      <div class="srow label" style="background:${COLORS.paper}"><span>Week</span><span>Topic</span><span>Lessons</span><span>Curriculum</span></div>
      ${rows.map((week) => {
        const last = week.week === weeks[weeks.length - 1]?.week;
        return `<div class="srow" style="border-top:1px solid #D0D4CC">
          <span class="h" style="width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font-size:14px;background:${last ? COLORS.carbon : COLORS.lime};color:${last ? COLORS.lime : COLORS.carbon}">${week.week}</span>
          <b style="font-size:13px;line-height:1.25">${escapeHtml(week.topic)}</b>
          <span style="font-size:11.5px;line-height:1.4;color:#3A3D40">${escapeHtml(week.lessons.join(" · "))}</span>
          <span style="font-size:11px;font-weight:800;color:${COLORS.muted}">${escapeHtml(codeRange(week.codes))}</span>
        </div>`;
      }).join("")}
    </section>`;

  const chunks: ScopeWeek[][] = [];
  for (let i = 0; i < weeks.length; i += WEEKS_PER_PAGE) chunks.push(weeks.slice(i, i + WEEKS_PER_PAGE));
  if (!chunks.length) chunks.push([]);
  const pages = chunks.map((chunk, index) => `${letterhead({ audience: "school", label: "Scope and sequence", meta: "Australian Curriculum v9 · Mathematics" })}
    ${index === 0 ? intro : `<div class="h" style="font-size:18px">${escapeHtml(`${strandLabel} · ${level} (continued)`)}</div>`}
    ${table(chunk)}
    ${footer("RELIQ · BrightUp Education · Lesson details and worked examples in the CSV version", `${generatedOn()} · Page ${index + 1} of ${chunks.length}`)}`);
  const css = `.srow{display:grid;grid-template-columns:52px 1.15fr 2fr 96px;gap:12px;padding:7px 14px;align-items:center}`;
  return documentHtml({ title: `RELIQ scope and sequence — ${strandLabel} ${level}`, pages, css });
}
