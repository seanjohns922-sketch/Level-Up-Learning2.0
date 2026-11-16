/** Original RELI and castle Q outlines from Boldly Creative, Reliq Brand V6 p6.
 * S uses the guide's Gotham Ultra outline (p9). Only the Q changes by realm.
 * All paths are fixed, trusted artwork; no external SVG/HTML is injected.
 */
import { RELIQS_WORDMARK_PATHS } from "@/lib/brand/reliqs-wordmark-paths";

export default function ReliqsWordmark({ color = "#00d400", className = "" }: { color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 347 79" role="img" aria-label="RELIQS" className={`block h-auto w-full ${className}`} xmlns="http://www.w3.org/2000/svg">
      <path fill="white" d={RELIQS_WORDMARK_PATHS.reli} />
      <path fill={color} d={RELIQS_WORDMARK_PATHS.castleQ} />
      <path fill="white" d={RELIQS_WORDMARK_PATHS.s} />
    </svg>
  );
}
