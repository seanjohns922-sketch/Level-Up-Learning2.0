// Builds the Supabase Auth email templates from the same layout as the school
// invite emails, so every RELIQ email looks the same.
//   npm run email:auth-templates          write supabase/templates/*.html
//   npm run email:auth-templates -- --check   fail if the files are out of date
// Paste each file into Supabase: Authentication > Emails > Templates. Placeholders
// such as {{ .ConfirmationURL }} are filled in by Supabase when it sends.
import fs from "node:fs";
import { renderEmailHtml } from "../../lib/school-admin-invite-email.ts";

const SITE = "{{ .SiteURL }}";
const EMAIL = "{{ .Email }}";
const LINK = "{{ .ConfirmationURL }}";

export const AUTH_TEMPLATES = [
  {
    file: "supabase/templates/reset-password.html",
    supabaseTemplate: "Reset Password",
    subject: "Reset your RELIQ password",
    content: {
      preheader: "Use this link to choose a new RELIQ password.",
      heading: "Reset your password",
      intro: "We got a request to reset the password for your RELIQ account.",
      details: [["Your email", EMAIL]],
      steps: [
        "Choose <strong>Reset password</strong> below.",
        "Make a new password you haven't used before.",
        "Log in to RELIQ with your email and new password.",
      ],
      cta: { label: "Reset password", url: LINK },
      note: "This link works once and expires soon. If you didn't ask for a new password, ignore this email and your password stays the same.",
      reason: "You're receiving this because someone asked to reset the password for this email on RELIQ.",
    },
  },
  {
    file: "supabase/templates/confirm-signup.html",
    supabaseTemplate: "Confirm signup",
    subject: "Confirm your email for RELIQ",
    content: {
      preheader: "One step left: confirm your email to finish setting up RELIQ.",
      heading: "Confirm your email",
      intro: "Welcome to RELIQ. Confirm this is your email address to finish setting up your account.",
      details: [["Your email", EMAIL]],
      steps: [
        "Choose <strong>Confirm my email</strong> below.",
        "Go back to RELIQ and choose <strong>Log In</strong> with your email and password.",
        "School staff: enter your school code the first time you log in.",
      ],
      cta: { label: "Confirm my email", url: LINK },
      reason: "You're receiving this because this email was used to create a RELIQ account.",
    },
  },
];

const check = process.argv.includes("--check");
const stale = [];
for (const template of AUTH_TEMPLATES) {
  const html = renderEmailHtml(template.content, SITE);
  if (check) {
    if (!fs.existsSync(template.file) || fs.readFileSync(template.file, "utf8") !== html) stale.push(template.file);
  } else {
    fs.writeFileSync(template.file, html);
    console.log(`Wrote ${template.file} (Supabase "${template.supabaseTemplate}", subject "${template.subject}")`);
  }
}
if (check && stale.length) {
  console.error(`Out of date: ${stale.join(", ")}. Run npm run email:auth-templates.`);
  process.exit(1);
}
if (check) console.log("Supabase auth templates are up to date.");
