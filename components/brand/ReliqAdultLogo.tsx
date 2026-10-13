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
      <path fill={letters} d="M0.000 65.765 L21.316 65.765 L21.316 47.547 L25.870 47.547 L37.894 65.765 L62.216 65.765 L47.368 44.085 C55.111 40.350 59.939 33.883 59.939 24.591 L59.939 24.409 C59.939 17.851 57.935 13.114 54.109 9.288 C49.645 4.824 42.449 2.000 31.154 2.000 L0.000 2.000 L0.000 65.765 Z M21.316 32.334 L21.316 19.855 L30.607 19.855 C35.526 19.855 38.714 21.859 38.714 25.958 L38.714 26.140 C38.714 30.057 35.617 32.334 30.516 32.334 L21.316 32.334 Z M66.952 65.765 L121.790 65.765 L121.790 48.275 L87.904 48.275 L87.904 41.352 L119.057 41.352 L119.057 25.958 L87.904 25.958 L87.904 19.490 L121.335 19.490 L121.335 2.000 L66.952 2.000 L66.952 65.765 Z M127.550 65.765 L178.835 65.765 L178.835 47.547 L148.866 47.547 L148.866 2.000 L127.550 2.000 L127.550 65.765 M184.585 2.000 L205.901 2.000 L205.901 65.765 L184.585 65.765 Z Z" />
      <path fill={RELIQ_LIME} d="M278.929 2.018 L258.953 2.016 L258.944 13.454 L252.975 13.467 L252.977 2.023 L237.888 2.015 L237.867 13.450 L231.955 13.455 L231.949 2.020 L211.960 2.000 L211.965 65.781 L239.402 65.776 L250.690 77.135 L275.457 77.087 C275.457 77.087 248.836 50.977 247.906 49.798 L232.992 49.782 C232.992 49.782 233.045 41.200 233.045 36.854 C233.045 32.508 237.116 29.172 241.551 29.172 L249.299 29.172 C253.738 29.172 257.806 32.436 257.806 36.866 C257.806 41.296 257.840 47.736 257.840 47.736 L278.909 69.116 L278.929 2.018 Z" />
    </svg>
  );
}
