import Image from "next/image";

/**
 * RELIQ logo. "onDark" has white letters for dark backgrounds (the login page);
 * "onLight" keeps the black letters. Both keep the purple Q.
 * Artwork rendered from the vector logo in the Reliq brand guide (Boldly Creative, V6).
 */
export default function ProductWordmark({ variant = "onDark", className = "" }: { variant?: "onDark" | "onLight"; className?: string }) {
  return (
    <Image
      src={variant === "onDark" ? "/brand/reliq-logo-on-dark.png" : "/brand/reliq-logo.png"}
      alt="RELIQ"
      width={1407}
      height={388}
      priority
      className={`h-auto w-full max-w-[344px] drop-shadow-[0_4px_20px_rgb(0_0_0/0.5)] ${className}`}
    />
  );
}
