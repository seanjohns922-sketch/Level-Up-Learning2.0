import { COLORS, documentHtml, escapeHtml, footer, generatedOn, letterhead, reliqLogo, type DocumentLogo } from "@/lib/documents/reliq-document";

/** Student login cards (violet: students hold these) and parent home access
 * cards. Students log in with the class code, their username and their
 * 4-digit password, so the cards use the same words as the login screen. */

export type LoginCardStudent = { name: string; username: string; password: string | null };

type ClassCardsInput = {
  schoolName: string | null;
  schoolLogo: DocumentLogo;
  className: string;
  classCode: string;
  websiteHost: string;
  qrSrc: string;
  students: LoginCardStudent[];
  year?: number;
};

const CARDS_PER_PAGE = 6;

const CSS = `
.intro{margin:0;font-size:12.5px;color:${COLORS.muted}}
.grid{display:grid;grid-template-columns:1fr 1fr;align-content:start;flex:1}
.cut{border:1.5px dashed #C9CDC5;margin:-.75px;padding:12px;height:290px}
.lc{height:100%;border-radius:16px;border:1.5px solid ${COLORS.rule};overflow:hidden;display:flex;flex-direction:column}
.lc-top{background:${COLORS.violetDeep};padding:8px 14px;display:flex;align-items:center;justify-content:space-between}
.lc-tag{font-size:10px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;color:#FFFFFF}
.lc-body{flex:1;display:grid;grid-template-columns:1fr 112px;gap:12px;padding:11px 14px}
.lc-name{font-family:'Montserrat',system-ui,sans-serif;font-weight:900;font-size:20px;line-height:1.1}
.lc-class{font-size:12px;color:${COLORS.muted};margin-top:3px}
.lc-fields{margin-top:auto;display:flex;flex-direction:column;gap:5px}
.lc-field{display:flex;justify-content:space-between;align-items:baseline;gap:8px;background:${COLORS.paper};border-radius:9px;padding:5px 10px}
.lc-field .label{font-size:9.5px}
.lc-field .mono{font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.lc-field.pin{background:${COLORS.violetTint}}
.lc-field.pin .label{color:${COLORS.violetText}}
.lc-qr{display:flex;flex-direction:column;align-items:center;gap:6px}
.lc-qr img.qr{width:104px;height:104px;padding:5px;border-radius:10px;border:1.5px solid ${COLORS.rule}}
.lc-scan{display:flex;align-items:center;gap:6px}
.lc-scan img{width:26px;height:26px;border-radius:6px;object-fit:contain}
.lc-scan span{display:flex;flex-direction:column;line-height:1.2;font-size:10px}
.lc-scan b{font-size:10px}
`;

function cardTop(tag: string): string {
  return `<div class="lc-top">${reliqLogo({ width: 62, letters: "#FFFFFF", q: "#FFFFFF" })}<span class="lc-tag">${escapeHtml(tag)}</span></div>`;
}

function scanLine(host: string, schoolLogo: DocumentLogo): string {
  return `<span class="lc-scan">${schoolLogo ? `<img src="${escapeHtml(schoolLogo.src)}" alt="${escapeHtml(schoolLogo.alt)}">` : ""}<span><span style="color:${COLORS.muted};font-weight:700">Scan to log in</span><b>${escapeHtml(host)}</b></span></span>`;
}

function studentCard(student: LoginCardStudent, input: ClassCardsInput): string {
  const where = [input.className, input.schoolName].filter(Boolean).join(" · ");
  return `<div class="cut"><div class="lc">
    ${cardTop("Explore · Learn · Collect")}
    <div class="lc-body">
      <div style="display:flex;flex-direction:column;min-width:0">
        <span class="lc-name">${escapeHtml(student.name)}</span>
        <span class="lc-class">${escapeHtml(where)}</span>
        <span class="lc-fields">
          <span class="lc-field"><span class="label">Class code</span><span class="mono">${escapeHtml(input.classCode)}</span></span>
          <span class="lc-field"><span class="label">Username</span><span class="mono" style="letter-spacing:.5px">${escapeHtml(student.username)}</span></span>
          <span class="lc-field pin"><span class="label">Password</span><span class="mono">${escapeHtml(student.password ?? "—")}</span></span>
        </span>
      </div>
      <div class="lc-qr"><img class="qr" src="${escapeHtml(input.qrSrc)}" alt="QR code to log in">${scanLine(input.websiteHost, input.schoolLogo)}</div>
    </div>
  </div></div>`;
}

export function classLoginCardsHtml(input: ClassCardsInput): string {
  const year = input.year ?? new Date().getFullYear();
  const meta = [input.schoolName, input.className, String(year)].filter(Boolean).join(" · ");
  const pages: string[] = [];
  const total = Math.max(1, Math.ceil(input.students.length / CARDS_PER_PAGE));
  for (let page = 0; page < total; page += 1) {
    const cards = input.students.slice(page * CARDS_PER_PAGE, (page + 1) * CARDS_PER_PAGE);
    pages.push(`${letterhead({ audience: "student", label: "Student login cards", meta, schoolLogo: input.schoolLogo })}
      <p class="intro">Cut along the dashed lines. Students scan their code or go to <b>${escapeHtml(input.websiteHost)}</b>, then enter the class code, their username and password.</p>
      <div class="grid">${cards.map((student) => studentCard(student, input)).join("")}</div>
      ${footer("RELIQ · BrightUp Education", `Keep passwords private · ${generatedOn()} · Page ${page + 1} of ${total}`)}`);
  }
  return documentHtml({ title: `RELIQ login cards — ${input.className}`, pages, css: CSS });
}

/** One student's card, larger, with the three login steps. */
export function singleLoginCardHtml(input: Omit<ClassCardsInput, "students"> & { student: LoginCardStudent }): string {
  const year = input.year ?? new Date().getFullYear();
  const meta = [input.schoolName, input.className, String(year)].filter(Boolean).join(" · ");
  const css = `${CSS}
.single{align-self:center;width:500px;border:1.5px dashed #C9CDC5;padding:16px}
.single .lc{height:auto}
.single .lc-body{grid-template-columns:1fr 150px;padding:16px 18px}
.single .lc-name{font-size:28px}
.single .lc-field .mono{font-size:19px}
.single .lc-qr img.qr{width:146px;height:146px;padding:8px}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:6px}
.step{border-radius:16px;background:${COLORS.paper};padding:16px;display:flex;flex-direction:column;gap:8px}
.step .n{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;background:${COLORS.violet};color:#FFFFFF;font-size:16px}
`;
  const steps = [
    ["Open RELIQ", `Scan the code, or go to ${input.websiteHost}.`],
    ["Enter your class code", `Type ${input.classCode}, then your username.`],
    ["Type your password", "Enter your four-digit password and start exploring."],
  ];
  const page = `${letterhead({ audience: "student", label: "Student login card", meta, schoolLogo: input.schoolLogo })}
    <p class="intro">Cut out the card along the dashed line. Students keep it in their book or tray.</p>
    <div class="single">${studentCard(input.student, { ...input, students: [] }).replace('<div class="cut">', "<div>")}</div>
    <div class="steps">${steps.map(([title, text], index) => `<div class="step"><span class="n h">${index + 1}</span><b style="font-size:15px">${escapeHtml(title)}</b><span style="font-size:13px;line-height:1.45;color:#3A3D40">${escapeHtml(text)}</span></div>`).join("")}</div>
    <div class="card" style="padding:16px 18px"><b style="font-size:15px">Forgotten password?</b><div style="font-size:13px;line-height:1.5;color:#3A3D40;margin-top:4px">Your teacher can reset it in RELIQ. Keep your password private.</div></div>
    ${footer("RELIQ · BrightUp Education", `Keep passwords private · ${generatedOn()}`)}`;
  return documentHtml({ title: `RELIQ login card — ${input.student.name}`, pages: [page], css });
}

export type HomeAccessCard = { name: string; username: string; explorerCode: string };

/** Parent home access cards, four to a page. Home learners may not have a
 * school, so there is no school logo. */
export function homeAccessCardsHtml({ cards, websiteHost }: { cards: HomeAccessCard[]; websiteHost: string }): string {
  const css = `${CSS}
.cut{height:440px;padding:14px}
.ha-body{padding:14px 16px;display:flex;flex-direction:column;gap:9px;flex:1}
.ha-row{display:flex;justify-content:space-between;align-items:baseline;background:${COLORS.paper};border-radius:9px;padding:7px 10px}
.ha-pin{display:flex;flex-direction:column;gap:6px;background:${COLORS.violetTint};border-radius:9px;padding:8px 10px}
.ha-pin .boxes{display:flex;gap:8px}
.ha-pin .boxes span{width:34px;height:34px;border-radius:8px;background:#FFFFFF;border:1.5px solid #D68AF4}
`;
  const pages: string[] = [];
  const total = Math.max(1, Math.ceil(cards.length / 4));
  for (let page = 0; page < total; page += 1) {
    const slice = cards.slice(page * 4, (page + 1) * 4);
    pages.push(`${letterhead({ audience: "student", label: "Home access cards", meta: `For families · ${new Date().getFullYear()}` })}
      <p class="intro">One card per child. Cut along the dashed lines and keep it somewhere safe at home.</p>
      <div class="grid">${slice.map((card) => `<div class="cut"><div class="lc">
        ${cardTop("Home access")}
        <div class="ha-body">
          <span class="lc-name" style="font-size:22px">${escapeHtml(card.name)}</span>
          <span style="font-size:12.5px;color:${COLORS.muted}">Use these details to sign in from home.</span>
          <span class="ha-row"><span class="label">Website</span><b style="font-size:14px">${escapeHtml(websiteHost)}</b></span>
          <span class="ha-row"><span class="label">Username</span><span class="mono" style="font-size:14px;letter-spacing:1px">${escapeHtml(card.username)}</span></span>
          <span class="ha-row" style="background:${COLORS.violetTint}"><span class="label" style="color:${COLORS.violetText}">Explorer code</span><span class="mono" style="font-size:14px">${escapeHtml(card.explorerCode)}</span></span>
          <span class="ha-pin"><span class="label" style="color:${COLORS.violetText}">Password</span><span class="boxes"><span></span><span></span><span></span><span></span></span><span style="font-size:11px;color:${COLORS.violetText}">Write the password here after you set or reset it.</span></span>
          <span style="font-size:11px;line-height:1.4;color:#3A3D40;margin-top:auto">To log in: open the website, choose Student, then Home. Enter the username and password.</span>
          <span style="font-size:11px;line-height:1.4;color:${COLORS.muted}">The Explorer code links this learner to a school if they join one later.</span>
        </div>
      </div></div>`).join("")}</div>
      ${footer("RELIQ · BrightUp Education", `${generatedOn()} · Page ${page + 1} of ${total}`)}`);
  }
  return documentHtml({ title: "RELIQ home access cards", pages, css });
}
