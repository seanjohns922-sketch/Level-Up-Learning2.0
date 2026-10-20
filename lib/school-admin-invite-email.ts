/**
 * School invitation and access emails, sent through Resend.
 *
 * Every email shares one layout built for email clients (tables, inline styles,
 * a hosted PNG logo, a bulletproof button and a plain-text version): a Carbon
 * header with the RELIQ logo, a white card, the school's details, numbered steps
 * and a short footer. The sender name is always "RELIQ"; EMAIL_FROM only
 * supplies the sending address.
 */

type InviteEmailInput = {
  to: string;
  schoolName: string;
  schoolCode: string;
  baseUrl: string;
};

type StaffInviteEmailInput = InviteEmailInput & {
  role: string;
};

export type InviteEmailDelivery = "sent" | "unconfigured" | "failed";

const DEFAULT_SENDER_ADDRESS = "schools@level-uplearning.com.au";
const CARBON = "#121314";
const LIME = "#83E300";
const INK = "#121314";
const MUTED = "#5A5E63";
const RULE = "#E3E5E0";
const PAPER = "#F4F5F1";
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** "RELIQ <address>", taking only the address from EMAIL_FROM so an old display name can't leak through. */
export function senderAddress(configured = process.env.EMAIL_FROM) {
  const value = configured?.trim() ?? "";
  const address = value.match(/<([^>]+)>/)?.[1]?.trim() || (value.includes("@") ? value : DEFAULT_SENDER_ADDRESS);
  return `RELIQ <${address}>`;
}

function appBaseUrl(baseUrl: string) {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || baseUrl).replace(/\/$/, "");
}

type EmailContent = {
  preheader: string;
  heading: string;
  intro: string;
  details: Array<[label: string, value: string, emphasise?: boolean]>;
  steps: string[];
  cta: { label: string; url: string };
  note?: string;
  reason: string;
};

/** The shared RELIQ email layout. All text values are escaped here. */
export function renderEmailHtml(content: EmailContent, origin: string) {
  const logo = `${origin}/brand/reliq-logo-email.png`;
  const details = content.details.map(([label, value, emphasise]) => `
          <tr>
            <td style="padding:10px 16px;border-top:1px solid ${RULE};font:600 12px ${FONT};letter-spacing:.06em;text-transform:uppercase;color:${MUTED};width:38%;">${escapeHtml(label)}</td>
            <td style="padding:10px 16px;border-top:1px solid ${RULE};font:${emphasise ? `700 20px` : `600 15px`} ${FONT};letter-spacing:${emphasise ? ".12em" : "0"};color:${INK};">${escapeHtml(value)}</td>
          </tr>`).join("");
  const steps = content.steps.map((step, index) => `
          <tr>
            <td valign="top" style="padding:6px 12px 6px 0;width:28px;">
              <div style="width:24px;height:24px;border-radius:12px;background:${CARBON};color:${LIME};font:700 12px/24px ${FONT};text-align:center;">${index + 1}</div>
            </td>
            <td style="padding:6px 0;font:400 15px/22px ${FONT};color:${INK};">${step}</td>
          </tr>`).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(content.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(content.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
        <tr>
          <td style="background:${CARBON};border-radius:16px 16px 0 0;padding:26px 32px;">
            <img src="${logo}" width="140" height="44" alt="RELIQ" style="display:block;border:0;width:140px;height:auto;">
          </td>
        </tr>
        <tr>
          <td style="background:#FFFFFF;border-radius:0 0 16px 16px;padding:36px 32px 32px;">
            <h1 style="margin:0 0 12px;font:800 26px/32px ${FONT};color:${INK};letter-spacing:-.01em;">${escapeHtml(content.heading)}</h1>
            <p style="margin:0 0 24px;font:400 16px/24px ${FONT};color:${INK};">${content.intro}</p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${RULE};border-radius:12px;border-collapse:separate;overflow:hidden;">
              <tr><td colspan="2" style="padding:12px 16px;background:${PAPER};font:700 11px ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${MUTED};border-radius:12px 12px 0 0;">Your details</td></tr>${details}
            </table>

            <p style="margin:28px 0 8px;font:700 11px ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${MUTED};">How to get started</p>
            <table role="presentation" cellpadding="0" cellspacing="0">${steps}
            </table>

            <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
              <tr>
                <td style="border-radius:999px;background:${LIME};">
                  <a href="${content.cta.url}" style="display:inline-block;padding:14px 28px;font:700 15px ${FONT};color:${CARBON};text-decoration:none;border-radius:999px;">${escapeHtml(content.cta.label)} &rarr;</a>
                </td>
              </tr>
            </table>
            <p style="margin:8px 0 0;font:400 13px/20px ${FONT};color:${MUTED};">Or open <a href="${content.cta.url}" style="color:${INK};">${escapeHtml(content.cta.url)}</a></p>
            ${content.note ? `<p style="margin:24px 0 0;padding:14px 16px;background:${PAPER};border-radius:12px;font:400 14px/21px ${FONT};color:${INK};">${content.note}</p>` : ""}
          </td>
        </tr>
        <tr>
          <td style="padding:22px 32px 0;font:400 12px/18px ${FONT};color:${MUTED};text-align:center;">
            ${escapeHtml(content.reason)} If you weren't expecting it, you can ignore this email.<br>
            <span style="color:${INK};font-weight:700;">RELIQ</span> · BrightUp Education
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

async function sendEmail({ to, subject, html, text, tag }: { to: string; subject: string; html: string; text: string; tag: string }): Promise<InviteEmailDelivery> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey || !to) return "unconfigured";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: senderAddress(), to: [to], subject, html, text }),
    });
    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.error(`[${tag}] Resend send failed`, response.status, details);
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error(`[${tag}] Resend send failed`, error);
    return "failed";
  }
}

const SCHOOL_ROLE_LABELS: Record<string, string> = {
  school_admin: "school administrator",
  principal: "principal",
  teacher: "teacher",
  support_staff: "support staff member",
};

const ACTIVATE_STEPS = (email: string) => [
  `Open RELIQ and choose <strong>Activate Invite</strong>.`,
  `Enter your invited email, <strong>${escapeHtml(email)}</strong>.`,
  `Create your own password.`,
  `Enter your school code, shown above.`,
];

/** Invite for a new school administrator who does not have a RELIQ account yet. */
export function schoolAdminInviteEmail({ to, schoolName, schoolCode, baseUrl }: InviteEmailInput) {
  const email = to.trim().toLowerCase();
  const origin = appBaseUrl(baseUrl);
  const loginUrl = `${origin}/login`;
  const subject = `Your RELIQ school administrator access for ${schoolName}`;
  const html = renderEmailHtml({
    preheader: `Set up your RELIQ account for ${schoolName}. Your school code is ${schoolCode}.`,
    heading: "Welcome to RELIQ",
    intro: `You've been invited to set up and manage <strong>${escapeHtml(schoolName)}</strong> on RELIQ as its school administrator.`,
    details: [["School", schoolName], ["Your email", email], ["School code", schoolCode, true]],
    steps: ACTIVATE_STEPS(email),
    cta: { label: "Go to RELIQ", url: loginUrl },
    note: "Your school code isn't a password. It simply connects your account to your school. After you've activated, sign in with <strong>Log In</strong> using your email and password.",
    reason: `You're receiving this because ${schoolName} was set up on RELIQ with this email as its administrator.`,
  }, origin);
  const text = [
    "Welcome to RELIQ",
    "",
    `You've been invited to set up and manage ${schoolName} on RELIQ as its school administrator.`,
    "",
    `School: ${schoolName}`,
    `Your email: ${email}`,
    `School code: ${schoolCode}`,
    "",
    "How to get started:",
    `1. Go to ${loginUrl} and choose Activate Invite.`,
    `2. Enter your invited email, ${email}.`,
    "3. Create your own password.",
    "4. Enter your school code.",
    "",
    "Your school code isn't a password. It simply connects your account to your school. After you've activated, sign in with Log In using your email and password.",
    "",
    "RELIQ · BrightUp Education",
  ].join("\n");
  return { to: email, subject, html, text };
}

/** Invite for a teacher or other staff member joining a school. */
export function schoolStaffInviteEmail({ to, schoolName, schoolCode, role, baseUrl }: StaffInviteEmailInput) {
  const email = to.trim().toLowerCase();
  const origin = appBaseUrl(baseUrl);
  const loginUrl = `${origin}/login`;
  const roleLabel = SCHOOL_ROLE_LABELS[role] ?? "staff member";
  const subject = `You're invited to join ${schoolName} on RELIQ`;
  const html = renderEmailHtml({
    preheader: `${schoolName} has invited you to RELIQ as a ${roleLabel}.`,
    heading: `Join ${schoolName} on RELIQ`,
    intro: `<strong>${escapeHtml(schoolName)}</strong> has invited you to RELIQ as a <strong>${escapeHtml(roleLabel)}</strong>.`,
    details: [["School", schoolName], ["Role", roleLabel.charAt(0).toUpperCase() + roleLabel.slice(1)], ["Your email", email], ["School code", schoolCode, true]],
    steps: ACTIVATE_STEPS(email),
    cta: { label: "Go to RELIQ", url: loginUrl },
    note: "Your school code isn't a password. It simply connects your account to your school. After you've activated, sign in with <strong>Log In</strong> using your email and password.",
    reason: `You're receiving this because ${schoolName} invited this email address to RELIQ.`,
  }, origin);
  const text = [
    `Join ${schoolName} on RELIQ`,
    "",
    `${schoolName} has invited you to RELIQ as a ${roleLabel}.`,
    "",
    `School: ${schoolName}`,
    `Role: ${roleLabel}`,
    `Your email: ${email}`,
    `School code: ${schoolCode}`,
    "",
    "How to get started:",
    `1. Go to ${loginUrl} and choose Activate Invite.`,
    `2. Enter your invited email, ${email}.`,
    "3. Create your own password.",
    "4. Enter your school code.",
    "",
    "Your school code isn't a password. It simply connects your account to your school. After you've activated, sign in with Log In using your email and password.",
    "",
    "RELIQ · BrightUp Education",
  ].join("\n");
  return { to: email, subject, html, text };
}

/** Notice for an existing RELIQ user who has been made a school's administrator. */
export function schoolAdminAccessEmail({ to, schoolName, baseUrl }: Omit<InviteEmailInput, "schoolCode">) {
  const email = to.trim().toLowerCase();
  const origin = appBaseUrl(baseUrl);
  const loginUrl = `${origin}/login`;
  const subject = `You now manage ${schoolName} on RELIQ`;
  const html = renderEmailHtml({
    preheader: `Your existing RELIQ account now has school administrator access for ${schoolName}.`,
    heading: "Your school access is ready",
    intro: `Your RELIQ account now has school administrator access for <strong>${escapeHtml(schoolName)}</strong>. There's nothing to activate.`,
    details: [["School", schoolName], ["Your email", email], ["Access", "School administrator"]],
    steps: [
      "Open RELIQ and choose <strong>Log In</strong>.",
      "Sign in with your usual email and password.",
    ],
    cta: { label: "Log in to RELIQ", url: loginUrl },
    reason: `You're receiving this because your account was given administrator access to ${schoolName}.`,
  }, origin);
  const text = [
    "Your school access is ready",
    "",
    `Your RELIQ account now has school administrator access for ${schoolName}. There's nothing to activate.`,
    "",
    `School: ${schoolName}`,
    `Your email: ${email}`,
    "",
    `1. Go to ${loginUrl} and choose Log In.`,
    "2. Sign in with your usual email and password.",
    "",
    "RELIQ · BrightUp Education",
  ].join("\n");
  return { to: email, subject, html, text };
}

export async function sendSchoolAdminInviteEmail(input: InviteEmailInput): Promise<InviteEmailDelivery> {
  return sendEmail({ ...schoolAdminInviteEmail(input), tag: "school-admin-email" });
}

export async function sendSchoolStaffInviteEmail(input: StaffInviteEmailInput): Promise<InviteEmailDelivery> {
  return sendEmail({ ...schoolStaffInviteEmail(input), tag: "school-staff-email" });
}

export async function sendSchoolAdminAccessEmail(input: Omit<InviteEmailInput, "schoolCode">): Promise<InviteEmailDelivery> {
  return sendEmail({ ...schoolAdminAccessEmail(input), tag: "school-admin-email" });
}
