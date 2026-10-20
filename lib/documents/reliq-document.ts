import { RELIQ_LETTERS_PATH, RELIQ_Q_PATH } from "@/lib/brand-reliq-logo-paths";

/** Shared RELIQ letterhead and A4 print shell for every printed document
 * (login cards, reports, placement, scope and sequence). Documents open in a
 * new window and print, so teachers save them with "Save as PDF".
 *
 * Colour by audience: documents students hold (login cards) use violet;
 * documents adults read use a Carbon header with the lime Q and green
 * accents, plus the school's own logo when the document is for a school.
 *
 * Trust boundary: every builder passes names, class codes and other data
 * through escapeHtml before it reaches the markup. Only fixed RELIQ markup,
 * fixed SVG artwork and image URLs built from app paths or QR data URLs
 * are written unescaped. */

export type DocumentAudience = "school" | "student";
export type DocumentLogo = { src: string; alt: string } | null;

export const COLORS = {
  carbon: "#121314",
  lime: "#83E300",
  limeTint: "#EEFBDB",
  green: "#3D6600",
  violet: "#C94DF2",
  violetDeep: "#8C2EAC",
  violetTint: "#F6E6FC",
  violetText: "#6B2385",
  coral: "#F2998D",
  amber: "#FFD866",
  paper: "#F4F5F1",
  rule: "#C9CDC5",
  muted: "#5A5E63",
  faint: "#767676",
} as const;

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Absolute URL for an app asset, so it loads inside the print window. */
export function assetUrl(path: string, origin: string): string {
  if (/^(data:|https?:)/.test(path)) return path;
  return `${origin.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** The RELIQ logo as inline SVG (fixed brand artwork). */
export function reliqLogo({ width = 118, letters = COLORS.carbon, q = COLORS.violet }: { width?: number; letters?: string; q?: string } = {}): string {
  return `<svg viewBox="0 0 279 79" width="${width}" height="${Math.round((width * 79) / 279)}" role="img" aria-label="RELIQ" xmlns="http://www.w3.org/2000/svg"><path fill="${letters}" d="${RELIQ_LETTERS_PATH}"/><path fill="${q}" d="${RELIQ_Q_PATH}"/></svg>`;
}

function logoTile(logo: DocumentLogo, size: number, bordered: boolean): string {
  if (!logo) return "";
  return `<span class="school-logo" style="width:${size}px;height:${size}px;${bordered ? `border:1.5px solid ${COLORS.rule};` : ""}"><img src="${escapeHtml(logo.src)}" alt="${escapeHtml(logo.alt)}"></span>`;
}

/** Top of every page. School documents: Carbon band, white RELI, lime Q.
 * Student documents: white page, black RELI, violet Q. */
export function letterhead({ audience, label, meta, schoolLogo = null }: { audience: DocumentAudience; label: string; meta: string; schoolLogo?: DocumentLogo }): string {
  if (audience === "school") {
    return `<header class="lh lh-school">
      ${reliqLogo({ width: 104, letters: "#FFFFFF", q: COLORS.lime })}
      <span class="lh-right">
        <span class="lh-text"><span class="lh-label" style="color:${COLORS.lime}">${escapeHtml(label)}</span><span class="lh-meta" style="color:#E3E5E0">${escapeHtml(meta)}</span></span>
        ${logoTile(schoolLogo, 50, false)}
      </span>
    </header>`;
  }
  return `<header class="lh lh-student">
    ${reliqLogo({ width: 110 })}
    <span class="lh-right">
      <span class="lh-text"><span class="lh-label" style="color:${COLORS.violetDeep}">${escapeHtml(label)}</span><span class="lh-meta">${escapeHtml(meta)}</span></span>
      ${logoTile(schoolLogo, 50, true)}
    </span>
  </header>`;
}

export function footer(left: string, right: string): string {
  return `<footer class="ft"><span>${escapeHtml(left)}</span><span>${escapeHtml(right)}</span></footer>`;
}

export function generatedOn(date = new Date()): string {
  return `Generated ${new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "long", year: "numeric", timeZone: "Australia/Melbourne" }).format(date)}`;
}

const BASE_CSS = `
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{background:#DADDD6;font-family:'Barlow',system-ui,sans-serif;color:${COLORS.carbon};-webkit-print-color-adjust:exact;print-color-adjust:exact}
@page{size:A4;margin:0}
.page{width:210mm;height:297mm;margin:16px auto;background:#FFFFFF;overflow:hidden;padding:36px 40px 28px;display:flex;flex-direction:column;gap:14px;box-shadow:0 10px 30px rgba(18,19,20,.18);page-break-after:always;break-after:page}
.page:last-child{page-break-after:auto;break-after:auto}
.h{font-family:'Montserrat',system-ui,sans-serif;font-weight:900;letter-spacing:-.3px}
.label{font-size:10.5px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;color:${COLORS.faint}}
.mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-weight:800;letter-spacing:2px}
.lh{display:flex;justify-content:space-between;align-items:center;gap:16px}
.lh-school{margin:-36px -40px 0;padding:16px 40px;background:${COLORS.carbon}}
.lh-student{padding-bottom:12px;border-bottom:2px solid ${COLORS.carbon}}
.lh-right{display:flex;align-items:center;gap:14px}
.lh-text{display:flex;flex-direction:column;align-items:flex-end;gap:2px}
.lh-label{font-size:11px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase}
.lh-meta{font-size:13px;font-weight:600;color:#3A3D40}
.school-logo{display:grid;place-items:center;flex:none;border-radius:11px;background:#FFFFFF;padding:3px}
.school-logo img{width:100%;height:100%;object-fit:contain;border-radius:8px}
.ft{display:flex;justify-content:space-between;gap:16px;padding-top:10px;border-top:1px solid ${COLORS.rule};font-size:10.5px;color:${COLORS.faint};margin-top:auto}
.chip{display:inline-block;padding:2px 9px;border-radius:999px;font-size:11px;font-weight:800;white-space:nowrap}
.card{border:1.5px solid ${COLORS.rule};border-radius:16px}
.toolbar{position:sticky;top:0;z-index:5;display:flex;justify-content:center;gap:10px;padding:10px;background:${COLORS.carbon};color:#FFFFFF;font:600 14px 'Barlow',system-ui,sans-serif}
.toolbar button{font:800 14px 'Barlow',system-ui,sans-serif;border:0;border-radius:8px;padding:8px 14px;background:${COLORS.lime};color:${COLORS.carbon};cursor:pointer}
@media print{body{background:#FFFFFF}.page{margin:0;box-shadow:none}.screen-only{display:none !important}}
`;

/** A complete printable document: one or more A4 pages. */
export function documentHtml({ title, pages, css = "", autoPrint = true }: { title: string; pages: string[]; css?: string; autoPrint?: boolean }): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@800;900&family=Barlow:wght@400;500;600;700;800&family=JetBrains+Mono:wght@700;800&display=swap" rel="stylesheet">
<style>${BASE_CSS}${css}</style></head><body>
<div class="toolbar screen-only">Choose “Save as PDF” as the printer to keep a copy. <button type="button" onclick="window.print()">Print or save as PDF</button></div>
${pages.map((page) => `<section class="page">${page}</section>`).join("\n")}
${autoPrint ? `<script>window.addEventListener("load",function(){(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){setTimeout(function(){window.print()},250)})});</script>` : ""}
</body></html>`;
}

/** Open a window straight from the click (so pop-up blockers allow it) while
 * the document is prepared. */
export function openDocumentWindow(): Window | null {
  const win = window.open("", "_blank");
  if (!win) return null;
  win.document.write(`<!doctype html><title>Preparing your document…</title><body style="font-family:system-ui,sans-serif;padding:40px;color:#3A3D40">Preparing your RELIQ document…</body>`);
  win.document.close();
  return win;
}

export function writeDocument(win: Window, html: string) {
  win.document.open();
  win.document.write(html);
  win.document.close();
}
