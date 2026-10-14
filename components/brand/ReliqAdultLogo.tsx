import { RELIQ_LETTERS_PATH, RELIQ_Q_PATH } from "@/lib/brand-reliq-logo-paths";

/** RELIQ logo for teacher, school and parent screens: the RELI and castle Q
 * outlines from Boldly Creative, Reliq Brand V6 p6 (shared with ReliqsWordmark),
 * with a lime Q so adult screens read differently from the violet student brand.
 * All paths are fixed, trusted artwork; no external SVG/HTML is injected.
 */
export const RELIQ_LIME = "#B9F23F";

export default function ReliqAdultLogo({
  variant = "onDark",
  className = "",
}: {
  variant?: "onDark" | "onLight";
  className?: string;
}) {
  const letters = variant === "onDark" ? "#FFFFFF" : "#121314";
  return (
    <svg
      viewBox="0 0 279 79"
      role="img"
      aria-label="RELIQ"
      className={`block h-auto ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fill={letters} d={RELIQ_LETTERS_PATH} />
      <path fill={RELIQ_LIME} d={RELIQ_Q_PATH} />
    </svg>
  );
}
