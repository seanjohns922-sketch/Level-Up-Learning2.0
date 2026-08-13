type InviteEmailInput = {
  to: string;
  schoolName: string;
  schoolCode: string;
  baseUrl: string;
};

export type InviteEmailDelivery = "sent" | "unconfigured" | "failed";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendSchoolAdminInviteEmail({
  to,
  schoolName,
  schoolCode,
  baseUrl,
}: InviteEmailInput): Promise<InviteEmailDelivery> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || "Level Up Learning <schools@level-uplearning.com.au>";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || baseUrl;
  const email = to.trim().toLowerCase();

  if (!apiKey || !email) return "unconfigured";

  const loginUrl = `${appUrl.replace(/\/$/, "")}/login`;
  const safeSchoolName = escapeHtml(schoolName);
  const safeSchoolCode = escapeHtml(schoolCode);
  const safeEmail = escapeHtml(email);

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h1 style="font-size:22px;margin:0 0 16px">Your Level Up Learning school admin access is ready</h1>
      <p>You have been invited as a school administrator for <strong>${safeSchoolName}</strong>.</p>
      <ol>
        <li>Go to <a href="${loginUrl}">${loginUrl}</a></li>
        <li>Choose <strong>Activate Invite</strong></li>
        <li>Use this invited email: <strong>${safeEmail}</strong></li>
        <li>Create your own password</li>
        <li>Enter this School Code: <strong>${safeSchoolCode}</strong></li>
      </ol>
      <p>The School Code is not your password. It only connects your invited email to the school.</p>
      <p>After activation, use <strong>Log In</strong> with the same email and password.</p>
    </div>
  `;

  const text = [
    "Your Level Up Learning school admin access is ready.",
    "",
    `School: ${schoolName}`,
    `Go to: ${loginUrl}`,
    "Choose: Activate Invite",
    `Email: ${email}`,
    `School Code: ${schoolCode}`,
    "",
    "Create your own password on the Activate Invite screen.",
    "The School Code is not your password. It only connects your invited email to the school.",
    "",
    "After activation, use Log In with the same email and password.",
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: `Level Up Learning school admin access for ${schoolName}`,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.error("[school-admin-email] Resend send failed", response.status, details);
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("[school-admin-email] Resend send failed", error);
    return "failed";
  }
}

export async function sendSchoolAdminAccessEmail({
  to,
  schoolName,
  baseUrl,
}: Omit<InviteEmailInput, "schoolCode">): Promise<InviteEmailDelivery> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.EMAIL_FROM?.trim() || "Level Up Learning <schools@level-uplearning.com.au>";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || baseUrl;
  const email = to.trim().toLowerCase();

  if (!apiKey || !email) return "unconfigured";

  const loginUrl = `${appUrl.replace(/\/$/, "")}/login`;
  const safeSchoolName = escapeHtml(schoolName);

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
      <h1 style="font-size:22px;margin:0 0 16px">Your Level Up Learning school admin access is active</h1>
      <p>You now have school administrator access for <strong>${safeSchoolName}</strong>.</p>
      <p>Go to <a href="${loginUrl}">${loginUrl}</a> and choose <strong>Log In</strong> with your existing email and password.</p>
      <p>You do not need to activate an invite because your existing account has been linked directly.</p>
    </div>
  `;

  const text = [
    "Your Level Up Learning school admin access is active.",
    "",
    `School: ${schoolName}`,
    `Go to: ${loginUrl}`,
    "Choose: Log In",
    "",
    "Use your existing email and password. You do not need to activate an invite because your existing account has been linked directly.",
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: `Level Up Learning school admin access for ${schoolName}`,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      console.error("[school-admin-email] Resend access email failed", response.status, details);
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error("[school-admin-email] Resend access email failed", error);
    return "failed";
  }
}
