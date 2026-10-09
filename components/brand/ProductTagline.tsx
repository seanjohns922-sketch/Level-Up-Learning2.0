import { brandHeading } from "@/lib/brand-fonts";

/** "Explore Learn Collect", spread to the logo's width so it lines up under RELIQ. */
export default function ProductTagline({ className = "" }: { className?: string }) {
  return (
    <p
      className={`${brandHeading.className} font-black flex w-full max-w-[344px] justify-between px-[1%] text-[15px] uppercase leading-none tracking-[0.08em] text-white/80 sm:text-[17px] ${className}`}
      aria-label="Explore, learn, collect"
    >
      <span>Explore</span>
      <span>Learn</span>
      <span>Collect</span>
    </p>
  );
}
