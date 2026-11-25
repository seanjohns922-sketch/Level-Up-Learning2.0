/**
 * RELIQ's public contact addresses, kept in one place so a change is one edit.
 * support: help for everyone already using RELIQ (schools, teachers, families).
 * schools: enquiries from schools that want to start using RELIQ.
 */
export const SUPPORT_EMAIL = "support@reliq.au";
export const SCHOOLS_EMAIL = "schools@reliq.au";

export function supportMailto(subject = "RELIQ help") {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
