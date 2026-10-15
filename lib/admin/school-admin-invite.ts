/** A pre-filled email a platform owner can send a new school administrator. */
export function schoolAdminInviteMailto(email: string | null, schoolName: string, schoolCode: string) {
  if (!email) return "#";
  const loginUrl = typeof window === "undefined" ? "/login" : `${window.location.origin}/login`;
  const subject = `RELIQ school admin access for ${schoolName}`;
  const body = [
    `Hi,`,
    ``,
    `Your RELIQ school administrator access is ready for ${schoolName}.`,
    ``,
    `Go to: ${loginUrl}`,
    `Choose: Activate Invite`,
    `Email: ${email}`,
    `School Code: ${schoolCode}`,
    ``,
    `If this is your first time using RELIQ, create your own password on that screen. The School Code is only used to connect your invited email to the school.`,
    ``,
    `After activation, use Log In with the same email and password.`,
  ].join("\n");
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
